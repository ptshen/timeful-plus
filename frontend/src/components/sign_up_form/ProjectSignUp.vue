<template>
  <div class="tw-mx-4 tw-mt-6">
    <div class="tw-mb-3 tw-flex tw-flex-col tw-gap-2">
      <div class="tw-text-lg tw-text-black">Projects</div>
      <div
        v-if="!isOwner"
        class="tw-flex tw-flex-col tw-gap-1 tw-rounded-md tw-bg-light-gray tw-p-3 tw-text-xs tw-italic tw-text-dark-gray"
      >
        <div v-if="!authUser || alreadyRespondedToSignUpForm">
          <a class="tw-underline" :href="`mailto:${event.ownerId}`"
            >Contact project creator</a
          >
          to edit your project.
        </div>
        <div v-if="event.blindAvailabilityEnabled">
          Responses are only visible to creator.
        </div>
      </div>
      <div v-else class="tw-text-xs tw-text-dark-gray">
        Add projects and set capacity, then save.
      </div>
    </div>

    <div
      v-if="isOwner && editing"
      class="tw-mb-4 tw-flex tw-flex-wrap tw-items-end tw-gap-2"
    >
      <div class="tw-flex tw-flex-col tw-gap-1">
        <div class="tw-text-xs tw-text-dark-gray">Project name</div>
        <v-text-field
          v-model="newProjectName"
          dense
          hide-details
          placeholder="e.g. Distance project"
          class="tw-w-64"
          @keyup.enter="addProject"
        ></v-text-field>
      </div>
      <div class="tw-flex tw-flex-col tw-gap-1">
        <div class="tw-text-xs tw-text-dark-gray">Capacity</div>
        <v-select
          v-model="newProjectCapacity"
          :items="capacityOptions"
          dense
          hide-details
          class="tw-w-28"
        ></v-select>
      </div>
      <v-btn
        class="tw-bg-green tw-text-white"
        :disabled="!newProjectName.trim()"
        @click="addProject"
      >
        Add project
      </v-btn>
    </div>

    <div class="tw-overflow-x-auto">
      <table class="tw-w-full tw-border-separate tw-border-spacing-0">
        <thead>
          <tr>
            <th
              class="tw-sticky tw-left-0 tw-z-10 tw-bg-white tw-p-2 tw-text-left tw-text-xs tw-font-medium tw-text-dark-gray"
            >
              Project
            </th>
            <th
              v-for="seat in maxCapacity"
              :key="`header-${seat}`"
              class="tw-p-2 tw-text-left tw-text-xs tw-font-medium tw-text-dark-gray"
            >
              Seat {{ seat }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="project in localProjects"
            :key="project._id"
            class="tw-border-t tw-border-light-gray-stroke"
            :class="rowClass(project)"
            @click="handleProjectClick(project)"
          >
            <td
              class="tw-sticky tw-left-0 tw-z-10 tw-bg-white tw-p-2 tw-align-top"
            >
              <div class="tw-flex tw-items-start tw-gap-2">
                <div class="tw-flex-1 tw-min-w-[10rem]">
                  <div v-if="editing">
                    <v-text-field
                      :value="project.name"
                      dense
                      hide-details
                      @input="updateProject(project, { name: $event })"
                      @click.stop
                    ></v-text-field>
                  </div>
                  <div v-else class="tw-font-medium">
                    {{ project.name }}
                  </div>
                  <div class="tw-text-xs tw-text-dark-gray">
                    ({{ project.responses.length }}/{{ project.capacity }})
                  </div>
                </div>
                <v-btn
                  v-if="editing"
                  icon
                  x-small
                  @click.stop="deleteProject(project._id)"
                >
                  <v-icon x-small>mdi-delete</v-icon>
                </v-btn>
              </div>
              <div v-if="editing" class="tw-mt-2 tw-flex tw-items-center tw-gap-2">
                <div class="tw-text-xs tw-text-dark-gray">People per project</div>
                <v-select
                  :value="project.capacity"
                  :items="capacityOptions"
                  dense
                  hide-details
                  class="tw-w-20"
                  @input="updateProject(project, { capacity: $event })"
                  @click.stop
                ></v-select>
              </div>
            </td>
            <td
              v-for="seat in maxCapacity"
              :key="`${project._id}-${seat}`"
              class="tw-p-2"
            >
              <div
                class="tw-flex tw-h-10 tw-min-w-[6rem] tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-light-gray-stroke tw-px-2 tw-text-xs"
                :class="seatCellClass(project, seat)"
              >
                <span v-if="seat <= project.capacity" class="tw-truncate">
                  {{ seatLabel(project, seat) }}
                </span>
                <span v-else class="tw-text-light-gray">—</span>
              </div>
            </td>
          </tr>
          <tr v-if="localProjects.length === 0">
            <td
              :colspan="maxCapacity + 1"
              class="tw-p-4 tw-text-sm tw-italic tw-text-dark-gray"
            >
              No projects yet. Click “Edit slots” to add projects.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex"
import { put } from "@/utils"
import ObjectID from "bson-objectid"

export default {
  name: "ProjectSignUp",

  emits: ["signUpForBlock", "refreshEvent"],

  props: {
    event: { type: Object, required: true },
  },

  data: () => ({
    editing: false,
    unsavedChanges: false,
    localProjects: [],
    capacityOptions: [...Array(100).keys()].map((i) => i + 1),
    newProjectName: "",
    newProjectCapacity: 1,
    hasPages: false,
    pageHasChanged: false,
    allowScheduleEvent: false,
    states: {},
    selectedGuestRespondent: "",
  }),

  computed: {
    ...mapState(["authUser"]),
    isOwner() {
      return this.authUser?._id === this.event.ownerId
    },
    maxCapacity() {
      if (this.localProjects.length === 0) return 1
      return Math.max(...this.localProjects.map((p) => p.capacity || 1))
    },
    alreadyRespondedToSignUpForm() {
      if (!this.authUser) return false
      return this.localProjects.some((project) =>
        project.responses.some(
          (response) => response.userId === this.authUser._id
        )
      )
    },
    respondents() {
      const unique = new Map()
      for (const project of this.localProjects) {
        for (const response of project.responses) {
          const id = response.userId || response.name
          if (!unique.has(id)) unique.set(id, response)
        }
      }
      return [...unique.values()]
    },
    anonymize() {
      return this.event.blindAvailabilityEnabled && !this.isOwner
    },
  },

  watch: {
    event: {
      immediate: true,
      handler() {
        this.resetSignUpForm()
      },
    },
  },

  methods: {
    ...mapActions(["showError"]),
    resetSignUpForm() {
      const blocks = (this.event.signUpBlocks ?? []).map((block) => ({
        ...block,
        capacity: block.capacity ?? 1,
        responses: [],
      }))

      for (const userId in this.event.signUpResponses ?? {}) {
        const response = this.event.signUpResponses[userId]
        for (const blockId of response.signUpBlockIds ?? []) {
          const project = blocks.find(
            (block) => block._id?.toString?.() === blockId?.toString?.()
          )
          if (project) project.responses.push(response)
        }
      }

      this.localProjects = blocks
      this.unsavedChanges = false
    },
    startEditing() {
      this.editing = true
    },
    stopEditing() {
      this.editing = false
    },
    markDirty() {
      this.unsavedChanges = true
    },
    addProject() {
      const name = this.newProjectName.trim()
      if (!name) return

      this.localProjects.push({
        _id: ObjectID().toString(),
        name,
        capacity: this.newProjectCapacity,
        responses: [],
      })
      this.newProjectName = ""
      this.newProjectCapacity = 1
      this.markDirty()
    },
    deleteProject(projectId) {
      this.localProjects = this.localProjects.filter(
        (project) => project._id !== projectId
      )
      this.markDirty()
    },
    updateProject(project, updates) {
      this.localProjects = this.localProjects.map((p) =>
        p._id === project._id ? { ...p, ...updates } : p
      )
      this.markDirty()
    },
    rowClass(project) {
      const canJoin = this.canJoinProject(project)
      return canJoin
        ? "tw-cursor-pointer hover:tw-bg-light-gray"
        : "tw-bg-white"
    },
    seatCellClass(project, seat) {
      if (seat > project.capacity) return "tw-bg-light-gray"
      if (seat <= project.responses.length) return "tw-bg-light-green"
      return "tw-bg-white"
    },
    seatLabel(project, seat) {
      if (seat > project.capacity) return ""
      if (seat <= project.responses.length) {
        const response = project.responses[seat - 1]
        if (this.anonymize && response.userId !== this.authUser?._id) {
          return "Attendee"
        }
        if (response.user) {
          return `${response.user.firstName} ${response.user.lastName}`.trim()
        }
        return response.name || "Attendee"
      }
      if (this.editing || this.isOwner) return "Open"
      return this.canJoinProject(project) ? "Join" : "Open"
    },
    canJoinProject(project) {
      if (this.editing || this.isOwner || this.alreadyRespondedToSignUpForm)
        return false
      return project.responses.length < project.capacity
    },
    handleProjectClick(project) {
      if (!this.canJoinProject(project)) return
      this.$emit("signUpForBlock", project)
    },
    async submitNewSignUpBlocks() {
      if (this.localProjects.length === 0) {
        this.showError("Please add at least one project!")
        return false
      }

      const payload = {
        name: this.event.name,
        duration: this.event.duration,
        dates: this.event.dates,
        type: this.event.type,
        signUpMode: this.event.signUpMode,
        signUpBlocks: this.localProjects.map((project) => ({
          _id: project._id,
          name: project.name,
          capacity: project.capacity,
        })),
      }

      try {
        await put(`/events/${this.event._id}`, payload)
        this.unsavedChanges = false
        this.$emit("refreshEvent")
        return true
      } catch (err) {
        console.error(err)
        this.showError(
          "There was a problem editing this event! Please try again later."
        )
        return false
      }
    },

    // No-op methods used by Event.vue for non-signup flows
    resetCurUserAvailability() {},
    setAvailabilityAutomatically() {},
    setAvailabilityFromICSEvents() {},
    populateUserAvailability() {},
    submitAvailability() {},
    deleteAvailability() {},
    scheduleEvent() {},
    cancelScheduleEvent() {},
    confirmScheduleEvent() {},
  },
}
</script>
