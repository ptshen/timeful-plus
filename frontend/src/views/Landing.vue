<template>
  <div class="tw-bg-light-gray">
    <div
      class="tw-relative tw-m-auto tw-mb-12 tw-flex tw-max-w-6xl tw-flex-col tw-px-4 sm:tw-mb-20"
    >
      <div class="tw-flex tw-flex-col tw-items-center">
        <div
          class="tw-mb-6 tw-flex tw-max-w-[26rem] tw-flex-col tw-items-center sm:tw-w-[35rem] sm:tw-max-w-none"
        >
          <div
            id="header"
            class="tw-mb-4 tw-text-center tw-text-2xl tw-font-medium sm:tw-text-4xl lg:tw-text-4xl xl:tw-text-5xl"
          >
            <h1>Columbia University TA Signups</h1>
          </div>

          <div
            class="lg:tw-text-md tw-text-left tw-text-center tw-text-sm tw-text-very-dark-gray sm:tw-text-lg md:tw-text-lg xl:tw-text-lg"
          >
            Coordinate signups with ease.
          </div>
        </div>

        <div class="tw-mb-12 tw-space-y-2">
          <v-btn
            class="tw-block tw-self-center tw-rounded-lg tw-bg-green tw-px-10 tw-text-base tw-shadow-[0_0_15px_rgba(91,146,200,0.8)] sm:tw-px-10 lg:tw-px-12"
            dark
            @click="authUser ? openDashboard() : (newDialog = true)"
            large
            :x-large="$vuetify.breakpoint.mdAndUp"
          >
            {{ authUser ? "Open dashboard" : "Create event" }}
          </v-btn>
          <div
            v-if="!authUser"
            class="tw-text-center tw-text-xs tw-text-dark-gray sm:tw-text-sm"
          >
          </div>
        </div>
      </div>
    </div>

    <!-- Sign in dialog -->
    <SignInDialog v-model="signInDialog" @signIn="_signIn" />

    <!-- New event dialog -->
    <NewDialog v-model="newDialog" @signIn="signIn" />
  </div>
</template>

<style scoped>
@media screen and (min-width: 375px) and (max-width: 640px) {
  #header {
    font-size: 1.875rem !important; /* 30px */
    line-height: 2.25rem !important; /* 36px */
  }
}
</style>
<style>
.rdt-h {
  @apply tw-rounded tw-bg-light-green/20 tw-px-px tw-text-black;
}
</style>

<script>
import LandingPageCalendar from "@/components/landing/LandingPageCalendar.vue"
import { isPhone, signInGoogle, signInOutlook } from "@/utils"
import Header from "@/components/Header.vue"
import NewEvent from "@/components/NewEvent.vue"
import NewDialog from "@/components/NewDialog.vue"
import LandingPageHeader from "@/components/landing/LandingPageHeader.vue"
import Logo from "@/components/Logo.vue"
import GithubButton from "vue-github-button"
import SignInDialog from "@/components/SignInDialog.vue"
import { calendarTypes } from "@/constants"
import { vueVimeoPlayer } from "vue-vimeo-player"
import PronunciationMenu from "@/components/PronunciationMenu.vue"
import { mapState } from "vuex"
import AuthUserMenu from "@/components/AuthUserMenu.vue"

export default {
  name: "Landing",

  metaInfo: {
    title: "CU Signups",
  },

  components: {
    LandingPageCalendar,
    Header,
    NewEvent,
    NewDialog,
    LandingPageHeader,
    Logo,
    SignInDialog,
    PronunciationMenu,
    AuthUserMenu,
  },

  data: () => ({
    signInDialog: false,
    newDialog: false,
    githubSnackbar: true,
    howItWorksSteps: [
      "Create a Timeful event",
      "Share the Timeful link with your group for them to fill out",
      "See where everybody's availability overlaps!",
    ],
    rive: null,
    showSchejy: false,
    isVideoPlaying: false,
  }),

  computed: {
    ...mapState(["authUser"]),
    isPhone() {
      return isPhone(this.$vuetify)
    },
  },

  methods: {
    loadRiveAnimation() {
      // if (!this.rive) {
      //   this.rive = new Rive({
      //     src: "/rive/schej.riv",
      //     canvas: document.querySelector("canvas"),
      //     autoplay: false,
      //     stateMachines: "wave",
      //     onLoad: () => {
      //       // r.resizeDrawingSurfaceToCanvas()
      //     },
      //   })
      //   setTimeout(() => {
      //     this.showSchejy = true
      //     setTimeout(() => {
      //       this.rive.play("wave")
      //     }, 1000)
      //   }, 4000)
      // } else {
      //   this.rive.play("wave")
      // }
    },
    _signIn(calendarType) {
      if (calendarType === calendarTypes.GOOGLE) {
        signInGoogle({ state: null, selectAccount: true })
      } else if (calendarType === calendarTypes.OUTLOOK) {
        // NOTE: selectAccount is not supported implemented yet for Outlook, maybe add it later
        signInOutlook({ state: null, selectAccount: true })
      }
    },
    signIn() {
      this.signInDialog = true
    },
    openDashboard() {
      this.$router.push({ name: "home" })
    },
  },

  beforeDestroy() {
    this.rive?.cleanup()
  },

  watch: {
    [`$vuetify.breakpoint.name`]: {
      immediate: true,
      handler() {
        if (this.$vuetify.breakpoint.mdAndUp) {
          setTimeout(() => {
            this.loadRiveAnimation()
          }, 0)
        }
      },
    },
  },
}
</script>
