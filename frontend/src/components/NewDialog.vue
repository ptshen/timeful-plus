<template>
  <v-dialog
    :value="value"
    @click:outside="handleDialogInput"
    no-click-animation
    persistent
    content-class="tw-max-w-[42rem]"
    :fullscreen="isPhone"
    scrollable
    :transition="isPhone ? `dialog-bottom-transition` : `dialog-transition`"
  >
    <UnsavedChangesDialog v-model="unsavedChangesDialog" @leave="exitDialog">
    </UnsavedChangesDialog>
    <v-card class="tw-pt-4">
      <div v-if="!_noTabs" class="tw-flex tw-rounded sm:-tw-mt-4 sm:tw-px-8">
        <div class="tw-pt-4">
          <v-btn
            v-for="t in tabs"
            :key="t.type"
            :tab-value="t.type"
            text
            small
            @click="() => (tab = t.type)"
            :class="`tw-text-xs tw-text-dark-gray tw-transition-all ${
              t.type == tab ? 'tw-bg-ligher-green tw-text-green' : ''
            }`"
          >
            {{ t.title }}
          </v-btn>
        </div>
        <v-spacer />
        <v-btn
          absolute
          @click="$emit('input', false)"
          icon
          class="tw-right-0 tw-mr-2 tw-self-center"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <template>
        <NewEvent
          v-if="tab === 'event'"
          ref="event"
          :key="`event-${value}`"
          :event="event"
          :edit="edit"
          @input="handleDialogInput"
          :is-dialog-open="value"
          :contactsPayload="this.type == 'event' ? contactsPayload : {}"
          :show-help="!_noTabs"
          :folder-id="folderId"
          @signIn="$emit('signIn')"
        />
        <NewGroup
          v-else-if="tab === 'group'"
          ref="group"
          :key="`group-${value}`"
          :event="event"
          :edit="edit"
          @input="handleDialogInput"
          :show-help="!_noTabs"
          :folder-id="folderId"
          :contactsPayload="this.type == 'group' ? contactsPayload : {}"
        />
        <NewSignUp
          v-else-if="tab === 'signup_projects'"
          ref="signup_projects"
          :key="`signup-projects-${value}`"
          :event="event"
          :edit="edit"
          @input="handleDialogInput"
          :show-help="!_noTabs"
          :folder-id="folderId"
          :contactsPayload="isSignupType(type) ? contactsPayload : {}"
          :initialSignUpMode="'projects'"
          lockSignUpMode
        />
        <NewSignUp
          v-else-if="tab === 'signup'"
          ref="signup"
          :key="`signup-${value}`"
          :event="event"
          :edit="edit"
          @input="handleDialogInput"
          :show-help="!_noTabs"
          :folder-id="folderId"
          :contactsPayload="isSignupType(type) ? contactsPayload : {}"
        />
      </template>
    </v-card>
  </v-dialog>
</template>

<script>
import { isPhone } from "@/utils"
import NewEvent from "@/components/NewEvent.vue"
import UnsavedChangesDialog from "@/components/general/UnsavedChangesDialog.vue"
import NewGroup from "./NewGroup.vue"
import NewSignUp from "./NewSignUp.vue"
import { mapState } from "vuex"

export default {
  name: "NewDialog",

  emits: ["input"],

  props: {
    value: { type: Boolean, required: true },
    type: { type: String, default: "event" }, // Either "event" or "group"
    event: { type: Object },
    edit: { type: Boolean, default: false },
    contactsPayload: { type: Object, default: () => ({}) },
    noTabs: { type: Boolean, default: false },
    folderId: { type: String, default: null },
  },

  components: {
    NewEvent,
    NewGroup,
    NewSignUp,
    UnsavedChangesDialog,
  },

  data() {
    return {
      tab: this.type,
      tabs: [
        { title: "Time Slot", type: "event" },
        { title: "Projects", type: "signup_projects" },
      ],

      unsavedChangesDialog: false,
    }
  },

  computed: {
    ...mapState(["groupsEnabled", "signUpFormEnabled"]),
    isPhone() {
      return isPhone(this.$vuetify)
    },
    _noTabs() {
      if (!this.groupsEnabled) {
        return true
      } else {
        return this.noTabs
      }
    },
  },

  methods: {
    handleDialogInput() {
      const activeForm = this.$refs[this.tab]
      if (!this.edit || !activeForm?.hasEventBeenEdited?.()) {
        this.exitDialog()
      } else {
        this.unsavedChangesDialog = true
      }
    },
    exitDialog() {
      this.$emit("input", false)
      const activeForm = this.$refs[this.tab]
      if (!activeForm) return
      if (this.edit) activeForm.resetToEventData()
      else activeForm.reset()
    },
    isSignupType(type) {
      return (
        type === "signup" ||
        type === "signup_projects"
      )
    },
    getDefaultTabForType(type = this.type) {
      if (type === "signup") {
        if (this.event?.signUpMode === "projects") return "signup_projects"
        return "signup"
      }
      if (type === "signup_time_slots") {
        return "signup"
      }
      return type
    },
    buildTabs() {
      const tabs = [{ title: "Time Slot", type: "event" }]
      if (this.signUpFormEnabled) {
        tabs.push({ title: "Projects", type: "signup_projects" })
      }
      this.tabs = tabs
    },
  },

  watch: {
    groupsEnabled: {
      immediate: true,
      handler() {
        this.buildTabs()
      },
    },
    signUpFormEnabled: {
      immediate: true,
      handler() {
        this.buildTabs()
      },
    },
    value: {
      immediate: true,
      handler() {
        if (this.value) {
          // Reset tab to the type prop when dialog is opened
          this.tab = this.getDefaultTabForType(this.type)
        }
      },
    },
    type: {
      immediate: true,
      handler() {
        this.tab = this.getDefaultTabForType(this.type)
      },
    },
  },
}
</script>
