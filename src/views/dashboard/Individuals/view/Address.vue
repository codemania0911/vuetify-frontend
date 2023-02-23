<template>
  <base-material-card
    color="primary"
    title="Individual Addresss"
  >
    <v-progress-linear
      v-if="!!loading"
      indeterminate
    />

    <address-form :address="address">
      <template v-slot:actions>
        <v-btn
          color="primary"
          :loading="saving"
          small
          @click="saveAddress"
        >
          Save
        </v-btn>
        <v-btn
          color="error"
          :loading="deleting"
          small
          @click="deleteAddress"
        >
          Delete Address
        </v-btn>
      </template>
    </address-form>
  </base-material-card>
</template>

<script>
  import axios from 'axios'
  import { mapActions, mapState } from 'vuex'
  import { isInternal } from '@/shared/management'

  export default {
    components: {
      AddressForm: () => import('../../components/address/AddressForm'),
    },
    data: () => ({
      loading: false,
      address: {},
      saving: false,
      deleting: false,
    }),
    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),
    },
    mounted () {
      this.getAddress()
    },
    methods: {
      ...mapActions({
        showSnackBar: 'showSnackBar',
      }),

      async getAddress () {
        this.loading = true
        try {
          const response = await axios.get(`users/${this.$route.params.id}/addresses`)
          this.address = response.data
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.loading = false
      },

      async saveAddress () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }

        this.saving = true
        try {
          const response = await axios.post(`users/addresses/${this.$route.params.id}`, { address: this.address })
          this.showSnackBar({ text: response.data.message, color: 'success' })
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.saving = false
      },
      deleteAddress () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        this.$confirm(`Please confirm that you would like to delete the following address:
          <b>${this.address.street} ${this.address.city} ${this.address.country}</b>`)
          .then(res => {
            if (res) {
              axios.delete('users/addresses/' + this.address.id)
                .then(res => {
                  this.getAddress()
                  this.showSnackBar({ text: res.data.message, color: 'success' })
                }).catch(error => {
                  this.showSnackBar({ text: error.response.data.message || error.response.statusText, color: 'error' })
                })
            }
          })
      },
    },
  }
</script>
