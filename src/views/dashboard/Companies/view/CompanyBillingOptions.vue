<template>
  <base-material-card
    v-if="djsaStatus(company.active_field_id)"
    :color="company.vendor_active === 1 ? 'secondary' : djsaStatus(company.active_field_id).color"
    :icon="company.vendor_active === 1 ? 'mdi-shield-link-variant' : djsaStatus(company.active_field_id).companyIcon"
    title="Billing Options"
    badge
    :badge-icon="company.networks_active === 1 ? 'mdi-star' : 'mdi-hard-hat'"
    :badge-color="company.networks_active === 1 ? 'primary' : 'secondary'"
    :badge-value="company.networks_active === 1 || company.capabilies_active === 1"
  >
    <v-progress-linear
      v-if="loading"
      indeterminate
    />
    <v-switch
      v-model="accountingInfo.not_billed"
      label="Billing Active"
      :true-value="0"
      :false-value="1"
      hide-details
    />
    <v-select
      v-model="accountingInfo.billing_mode_id"
      label="Billing Mode"
      prepend-icon="mdi-tag"
      :items="mixinItems.billingModes"
      item-text="name"
      item-value="id"
      :disabled="accountingInfo.not_billed !== 0"
      :loading="loadingMixins.billingModes"
      hide-details
    />
    <template
      v-for="(dateField, i) in dateFields"
    >
      <v-menu
        :key="i"
        :ref="dateField.ref"
        v-model="dateField[dateField.ref]"
        :close-on-content-click="false"
        :return-value.sync="accountingInfo[dateField.value]"
        transition="scale-transition"
        offset-y
      >
        <template v-slot:activator="{ on }">
          <v-text-field
            v-model="accountingInfo[dateField.value]"
            :label="dateField.label"
            :prepend-icon="dateField.icon"
            readonly
            clearable
            :disabled="accountingInfo.not_billed !== 0"
            hide-details
            v-on="on"
          />
        </template>
        <v-date-picker
          v-model="accountingInfo[dateField.value]"
          color="primary"
          no-title
          class="datepicker-width"
        >
          <v-spacer />
          <v-btn
            text
            @click="dateField[dateField.ref] = false"
          >
            Cancel
          </v-btn>
          <v-btn
            text
            @click="$refs[dateField.ref][0].save(accountingInfo[dateField.value])"
          >
            OK
          </v-btn>
        </v-date-picker>
      </v-menu>
    </template>
    <v-switch
      v-model="accountingInfo.is_discountable"
      label="Discountable"
      hide-details
      :disabled="accountingInfo.not_billed !== 0"
    />
    <v-textarea
      v-model="accountingInfo.deactivation_reason"
      label="Reason for Deactivation"
      prepend-icon="mdi-pen"
      :disabled="accountingInfo.not_billed !== 0"
    />
    <v-btn
      color="success"
      block
      :loading="updating"
      @click="updateBillingInfo"
    >
      <v-icon left>
        mdi-content-save
      </v-icon>
      Save
    </v-btn>
  </base-material-card>
</template>

<script>
  import axios from 'axios'
  import { mapActions, mapState } from 'vuex'
  import { isInternal, djsaStatus } from '@/shared/management'
  import { fetchInitials } from '@/mixins/fetchInitials'
  import { MIXINS } from '@/shared/constants'

  export default {
    mixins: [
      fetchInitials([
        MIXINS.billingModes,
      ]),
    ],

    props: {
      company: {
        type: Object,
        default: () => ({}),
      },
    },

    data: () => ({
      loading: false,
      updating: false,
      accountingInfo: {},
      djsaStatus,
      dateFields: [
        { ref: 'lastBilledDateRef', lastBilledDateRef: false, value: 'last_billed_date', label: 'Last Billed Date', icon: 'mdi-calendar-check' },
        { ref: 'deactivatedDateRef', deactivatedDateRef: false, value: 'deactivated', label: 'Deactivated Date', icon: 'mdi-calendar-remove' },
      ],
    }),

    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),
    },

    watch: {
      company: {
        handler (company) {
          if (company.id) {
            this.getDataFromApi()
          }
        },
        deep: true,
      },
    },

    mounted () {
      if (this.company.id) {
        this.getDataFromApi()
      }
    },

    methods: {
      ...mapActions({
        showSnackBar: 'showSnackBar',
      }),

      async getDataFromApi () {
        this.fetchingAccountingInfo = true
        try {
          const response = await axios.get('billing-information/' + this.company.id)
          this.accountingInfo = response.data.data[0] || {}
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.fetchingAccountingInfo = false
      },

      async updateBillingInfo () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        this.updating = true
        try {
          const response = await axios.put('billing-information/' + this.$route.params.id, this.accountingInfo)
          this.showSnackBar({ text: response.data.message, color: response.data.success ? 'success' : 'error' })
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.updating = false
        this.$router.go()
      },
    },
  }
</script>
