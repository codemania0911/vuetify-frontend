<template>
  <v-container
    id="login"
    class="fill-height justify-center"
    tag="section"
    @keyup.enter="login"
  >
    <v-row
      v-if="first"
      justify="center"
    >
      <v-slide-y-transition appear>
        <base-material-card
          color="white"
          light
          max-width="100%"
          width="400"
          class="px-5 py-3"
        >
          <template v-slot:heading>
            <v-img
              src="@/assets/djs-logo-black.png"
              width="150"
              class="mx-auto"
            />
          </template>

          <v-card-text class="text-center">
            <v-alert
              v-model="loginFailed"
              type="error"
              class="white--text"
              dense
              dismissible
            >
              Login failed
            </v-alert>

            <v-text-field
              v-model="username"
              color="secondary"
              label="User Name"
              prepend-icon="mdi-account-outline"
              hide-details
            />

            <v-text-field
              v-model="password"
              class="mb-8"
              color="secondary"
              label="Password"
              prepend-icon="mdi-lock-outline"
              type="password"
              hide-details
            />

            <pages-btn
              large
              color=""
              depressed
              class="v-btn--text success--text"
              @click="login"
            >
              Let's Go
            </pages-btn>
          </v-card-text>
        </base-material-card>
      </v-slide-y-transition>
    </v-row>

    <v-row justify="center">
      <two-factor v-if="!verified && !first" />
    </v-row>

    <!-- <v-row justify="center">
      <v-slide-y-transition appear>
        <base-material-alert
          color="error"
          dark
          dismissible
          max-width="100%"
          width="400"
          icon="mdi-bell"
        >
          We apologize for the inconvenience, but we are performing some maintenance and our OPA-90 Database is temporarily closed. You may still contact our OPA-90 team or call +1 703 299 0081 for all inquiries. We will be back up soon!
        </base-material-alert>
      </v-slide-y-transition>
    </v-row> -->
  </v-container>
</template>

<script>
  import { mapState } from 'vuex'
  import cookies from 'js-cookie'

  export default {
    name: 'PagesLogin',

    components: {
      PagesBtn: () => import('./components/Btn'),
      TwoFactor: () => import('./TwoFactor'),
    },

    data: () => ({
      username: '',
      password: '',
      rememberMe: false,
      loginFailed: false,
      first: true,
    }),

    computed: {
      ...mapState({
        verified: state => state.authentication.verified,
      }),
    },

    methods: {
      async login () {
        const { username, password } = this
        if (username && password) {
          try {
            const response = await this.$store.dispatch('login', {
              username: this.username,
              password: this.password,
              rememberMe: this.rememberMe,
              url: 'auth/login',
              unlocked: cookies.get('unlocked') ? 1 : 0,
            })
            this.first = false
            if (response.data.verified) {
              this.$router.push('/')
            }
          } catch (error) {
            this.loginFailed = true
          }
        }
      },
    },
  }
</script>
