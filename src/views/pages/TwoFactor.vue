<template>
  <v-slide-y-transition
    appear
  >
    <base-material-card
      color="white"
      light
      max-width="100%"
      width="400"
      class="px-5 py-3"
    >
      <template v-slot:heading>
        <h1 class="verification">
          Two Factor Authentication
        </h1>
      </template>

      <v-card-text
        class="text-center"
        @keyup.enter="verify"
      >
        <v-alert
          v-model="verifyFailed"
          type="error"
          class="white--text"
          dense
          dismissible
        >
          Authentication failed
        </v-alert>

        <v-text-field
          v-model="code"
          color="secondary"
          label="Enter Authentication Code"
          class="mb-8"
          prepend-icon="mdi-barcode"
          hide-details
        />

        <label>
          An authentication code was sent to the email address associated with your account. Please check your spam folder if not found
          in your inbox. Please contact admin@donjon-smit.com for assistance if needed.
        </label>
        <pages-btn
          large
          color=""
          depressed
          class="v-btn--text success--text"
          @click="verify"
        >
          Verify
        </pages-btn>
      </v-card-text>
    </base-material-card>
  </v-slide-y-transition>
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    components: {
      PagesBtn: () => import('./components/Btn'),
    },

    data: () => ({
      verifyFailed: false,
      code: '',
    }),

    computed: {
      ...mapState({
        username: state => state.authentication.username,
        password: state => state.authentication.password,
      }),
    },

    methods: {
      async verify () {
        try {
          const response = await this.$store.dispatch('login', {
            username: this.username,
            password: this.password,
            two_factor_code: this.code,
            url: 'auth/twoFactorLogin',
          })
          if (response.data.verified) {
            this.$router.push('/')
          } else {
            this.verifyFailed = true
          }
        } catch (error) {
          this.verifyFailed = true
        }
      },
    },
  }
</script>

<style lang="sass">
  .verification
    color: black
    text-align: center
</style>
