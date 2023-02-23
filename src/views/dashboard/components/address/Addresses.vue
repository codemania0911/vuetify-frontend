<template>
  <base-material-card
    color="primary"
    title="Address"
    class="addresses"
  >
    <v-progress-linear
      v-if="!!loading"
      indeterminate
    />

    <base-material-tabs
      v-model="activeTab"
      color="info"
      :fixed-tabs="$vuetify.breakpoint.smAndUp"
      show-arrows
      height="36"
      class="mt-3"
    >
      <v-tab
        v-for="addressItem in addressItems"
        :key="addressItem.id"
      >
        <span>
          {{ addressItem.name }}
        </span>
      </v-tab>

      <v-tabs-items v-model="activeTab">
        <v-tab-item
          v-for="addressItem in addressItems"
          :key="addressItem.id"
        >
          <template v-if="addressItem.addresses.length > 0">
            <address-form
              v-for="address in addressItem.addresses"
              :key="address.id"
              :address="address"
            >
              <template v-slot:actions>
                <v-row no-gutters>
                  <v-btn
                    color="success"
                    small
                    class="mr-3"
                    @click="saveAddress(address)"
                  >
                    <v-icon left>
                      mdi-content-save
                    </v-icon>
                    Save
                  </v-btn>
                  <v-btn
                    color="error"
                    small
                    @click="deleteAddress(address)"
                  >
                    <v-icon left>
                      mdi-delete
                    </v-icon>
                    Delete Address
                  </v-btn>
                  <v-spacer />
                  <v-btn
                    color="info"
                    small
                    class="mr-3"
                    @click="showDocumentFormat(address)"
                  >
                    <v-icon left>
                      mdi-text-box
                    </v-icon>
                    Document Format
                  </v-btn>
                  <v-btn
                    color="primary"
                    small
                    @click="addAddress(addressItem.id)"
                  >
                    <v-icon left>
                      mdi-map-marker-plus
                    </v-icon>
                    Add Address
                  </v-btn>
                </v-row>
              </template>
            </address-form>
          </template>

          <template v-else>
            <base-material-alert
              color="warning"
              dark
            >
              No Addresses Defined
            </base-material-alert>
            <v-btn
              color="primary"
              small
              @click="addAddress(addressItem.id)"
            >
              <v-icon left>
                mdi-map-marker-plus
              </v-icon>
              Add Address
            </v-btn>
          </template>
        </v-tab-item>
      </v-tabs-items>
    </base-material-tabs>

    <v-dialog
      v-model="showFormatForm"
      max-width="500"
    >
      <v-card>
        <v-card-title>Document Address</v-card-title>
        <v-divider />
        <v-card-text>
          <v-textarea v-model="documentFormatAddress.document_format" />
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="showFormatForm = false"
          >
            Close
          </v-btn>
          <v-btn
            color="success"
            text
            @click="saveAddressFormat"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </base-material-card>
</template>

<script>
  import axios from 'axios'
  import { mapActions, mapState } from 'vuex'
  import { makeDocumentFormat } from '@/shared/fileUtils'
  import { isInternal } from '@/shared/management'

  export default {
    components: {
      AddressForm: () => import('./AddressForm'),
    },

    props: {
      getUrl: {
        type: String,
        default: '',
      },
      addUrl: {
        type: String,
        default: '',
      },
      saveUrl: {
        type: String,
        default: '',
      },
      deleteUrl: {
        type: String,
        default: '',
      },
    },

    data: () => ({
      activeTab: 0,
      loading: false,
      addressItems: [],
      showFormatForm: false,
      documentFormatAddress: {
        document_format: '',
      },
    }),

    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),
    },

    mounted () {
      this.getAddresses()
    },

    methods: {
      ...mapActions({
        showSnackBar: 'showSnackBar',
      }),

      async getAddresses () {
        this.loading = true
        try {
          const response = await axios.get(this.getUrl)
          const primaryAddr = response.data.find(a => a.name === 'Primary')
          const billingAddr = response.data.find(a => a.name === 'Billing')
          const branchesAddr = response.data.find(a => a.name === 'Branches')
          this.addressItems = [primaryAddr, billingAddr, branchesAddr]
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.loading = false
      },

      async addAddress (typeId) {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }

        try {
          const response = await axios.post(this.addUrl, { type_id: typeId })
          this.showSnackBar({ text: response.data.message, color: 'success' })
          this.getAddresses()
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
      },

      async saveAddress (address) {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }

        try {
          const response = await axios.post(this.saveUrl + address.id, { ...address })
          this.showSnackBar({ text: response.data.message, color: 'success' })
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
      },

      deleteAddress (address) {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        this.$confirm(`Please confirm that you would like to delete the following address:
          <b>${address.street} ${address.city} ${address.country}</b>`, { title: 'Warning' })
          .then(res => {
            if (res) {
              axios.delete(this.deleteUrl + address.id)
                .then(res => {
                  this.showSnackBar({ text: res.data.message, color: 'success' })
                  this.getAddresses()
                })
                .catch(error => {
                  this.showSnackBar({ text: error, color: 'error' })
                })
            }
          })
      },

      showDocumentFormat (address) {
        const updatedFormatAddress = address.document_format
          ? address.document_format.replace(/\u21b5/g, '\n')
          : makeDocumentFormat(address)
        this.documentFormatAddress = Object.assign({}, address, { document_format: updatedFormatAddress })

        this.showFormatForm = true
      },

      saveAddressFormat () {
        this.saveAddress(this.documentFormatAddress)
        this.showFormatForm = false
      },
    },
  }
</script>

<style lang="sass">
  .addresses
    .v-tabs-bar
      padding: 0 16px
</style>
