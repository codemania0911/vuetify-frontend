<template>
  <v-container>
    <base-material-card
      color="primary"
      title="Change Password"
    >
      <v-card-text>
        <v-row>
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="password"
              label="Password"
              :type="showpwd ? 'text' : 'password'"
              :append-icon="showpwd ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="showpwd = !showpwd"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="passwordConfirm"
              label="Confirm Password"
              :type="confirmpwd ? 'text' : 'password'"
              :append-icon="confirmpwd ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="confirmpwd = !confirmpwd"
            />
          </v-col>
          <v-btn
            color="primary"
            :disabled="password !== passwordConfirm"
            @click="changePassword"
          >
            Change Password
          </v-btn>
        </v-row>
      </v-card-text>
    </base-material-card>
  </v-container>
</template>

<script>
  import axios from 'axios'
  import { mapActions } from 'vuex'

  export default {
    data: () => ({
      password: '',
      passwordConfirm: '',
      showpwd: false,
      confirmpwd: false,
    }),

    methods: {
      ...mapActions({
        showSnackBar: 'showSnackBar',
      }),
      changePassword () {
        this.$confirm('Do you want to change the password?', { title: 'Warning' })
          .then(res => {
            if (res) {
              const request = {
                password: { password: this.password, user_id: this.$route.params.id },
              }
              axios.post('changePassword', request)
                .then(res => {
                  this.showSnackBar({ text: res.data.message, color: 'success' })
                }).catch(error => {
                  this.showSnackBar({ text: error.response.statusText, color: 'error' })
                })
            }
          })
      },
    },
  }
</script>
