<template>
  <base-material-card
    v-if="djsaStatus(company.active_field_id)"
    :color="company.vendor_active === 1 ? 'secondary' : djsaStatus(company.active_field_id).color"
    :icon="company.vendor_active === 1 ? 'mdi-shield-link-variant' : djsaStatus(company.active_field_id).companyIcon"
    title="Company Options"
    badge
    :badge-icon="company.networks_active === 1 ? 'mdi-star' : 'mdi-hard-hat'"
    :badge-color="company.networks_active === 1 ? 'primary' : 'secondary'"
    :badge-value="company.networks_active === 1 || company.capabilies_active === 1"
  >
    <template v-if="disabled">
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <div v-on="on">
            <v-switch
              v-model="djsActive"
              label="DJS Active"
              hide-details
              disabled
            />
          </div>
        </template>
        <span>These settings can be changed at the company level.</span>
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <div v-on="on">
            <v-switch
              v-model="djsAActive"
              label="DJS-A Active"
              hide-details
              disabled
            />
          </div>
        </template>
        <span>These settings can be changed at the company level.</span>
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <div v-on="on">
            <v-switch
              v-model="company.capabilies_active"
              hide-details
              label="Capabilities"
              disabled
            />
          </div>
        </template>
        <span>These settings can be changed at the company level.</span>
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <div v-on="on">
            <v-switch
              v-model="company.networks_active"
              hide-details
              label="Network Membership"
              disabled
            />
          </div>
        </template>
        <span>These settings can be changed at the company level.</span>
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <div v-on="on">
            <v-switch
              v-model="company.vendor_active"
              hide-details
              label="Vendor"
              disabled
            />
          </div>
        </template>
        <span>These settings can be changed at the company level.</span>
      </v-tooltip>
      <v-tooltip
        top
      >
        <template v-slot:activator="{ on }">
          <div v-on="on">
            <v-text-field
              v-model="company.vendor_type"
              hide-details
              readonly
              disabled
              prepend-icon="mdi-format-list-bulleted-type"
              label="Vendor Type"
            />
          </div>
        </template>
        <span>These settings can be changed at the company level.</span>
      </v-tooltip>
    </template>

    <template v-else>
      <v-switch
        v-model="djsActive"
        label="DJS Active"
        hide-details
        @change="toggleStatus"
      />
      <v-switch
        v-model="djsAActive"
        label="DJS-A Active"
        hide-details
        @change="toggleStatus"
      />
      <v-switch
        v-model="company.capabilies_active"
        hide-details
        label="Capabilities"
        @click.stop="toggleSMFF"
      />
      <v-switch
        v-model="company.networks_active"
        hide-details
        label="Network Membership"
        @click.stop="toggleNetworks"
      />
      <v-switch
        v-model="company.vendor_active"
        hide-details
        label="Vendor"
        @click.stop="toggleVendor"
      />
      <template v-if="role && isInternal(role.id)">
        <v-select
          v-if="company.vendor_active && role && isInternal(role.id)"
          v-model="company.vendor_type_id"
          hide-details
          label="Vendor Type"
          :items="mixinItems.vendorTypes"
          :loading="loadingMixins.vendorTypes"
          item-text="name"
          item-value="id"
          prepend-icon="mdi-format-list-bulleted-type"
          @change="changeVendor(company.id, company.vendor_type_id)"
        />
      </template>
      <template v-else>
        <v-text-field
          v-model="company.vendor_type"
          hide-details
          readonly
          prepend-icon="mdi-format-list-bulleted-type"
          label="Vendor Type"
        />
      </template>
    </template>
  </base-material-card>
</template>

<script>
  import axios from 'axios'
  import { mapState, mapActions } from 'vuex'
  import { fetchInitials } from '@/mixins/fetchInitials'
  import { MIXINS } from '@/shared/constants'
  import { isInternal, djsaStatus } from '@/shared/management'

  export default {
    mixins: [
      fetchInitials([
        MIXINS.vendorTypes,
      ]),
    ],

    props: {
      company: {
        type: Object,
        default: () => ({}),
      },
      disabled: {
        type: Boolean,
        default: false,
      },
    },

    data: () => ({
      isInternal,
      djsaStatus,
      activeField: null,
    }),

    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),

      djsActive: {
        get () {
          return [2, 5].includes(this.company.active_field_id)
        },
        set (val) {
          if (val && this.djsAActive) {
            this.activeField = 5
          } else if (val && !this.djsAActive) {
            this.activeField = 2
          } else if (!val && this.djsAActive) {
            this.activeField = 3
          } else if (!val && !this.djsAActive) {
            this.activeField = 1
          }
        },
      },

      djsAActive: {
        get () {
          return [3, 5].includes(this.company.active_field_id)
        },
        set (val) {
          if (val && this.djsActive) {
            this.activeField = 5
          } else if (val && !this.djsActive) {
            this.activeField = 3
          } else if (!val && this.djsActive) {
            this.activeField = 2
          } else if (!val && !this.djsActive) {
            this.activeField = 4
          }
        },
      },
    },

    methods: {
      ...mapActions({
        showSnackBar: 'showSnackBar',
      }),

      toggleStatus () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        axios.post('companies/' + this.company.id + '/toggleStatus', { active_field_id: this.activeField })
          .then(res => {
            this.showSnackBar({ text: res.data.message, color: 'success' })
            this.$emit('refetchData', true)
          })
      },

      async toggleSMFF () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        if (this.company.capabilies_active) {
          const smffCreated = await axios.post('companies/' + this.company.id + '/smff/create')
          this.showSnackBar({ text: smffCreated.data.message, color: 'success' })
        } else {
          const smffDeleted = await axios.delete('companies/' + this.company.id + '/smff')
          this.showSnackBar({ text: smffDeleted.data.message, color: 'success' })
        }
      },

      toggleNetworks () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        axios.post('companies/' + this.company.id + '/toggleNetworks')
          .then(res => {
            this.showSnackBar({ text: res.data.message, color: 'success' })
          })
      },

      toggleVendor () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        axios.post('companies/' + this.company.id + '/toggleVendor')
          .then(res => {
            this.showSnackBar({ text: res.data.message, color: 'success' })
          })
      },

      changeVendor (companyId, vendorTypeId) {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        const request = { company_id: companyId, vendor_type_id: vendorTypeId }
        axios.post('vendor/type', request)
          .then(res => {
            res.data.success
              ? this.showSnackBar({ text: res.data.message, color: 'success' })
              : this.showSnackBar({ text: res.data.message, color: 'error' })
          })
          .catch(err => {
            this.showSnackBar({ text: err, color: 'error' })
          })
      },
    },
  }
</script>
