<template>
  <div>
    <base-material-card
      color="primary"
      title="Accounting and Billing Information"
    >
      <base-material-tabs
        v-model="activeTab"
        background-color="transparent"
        centered
        color="secondary"
        icons-and-text
        show-arrows
      >
        <v-tab
          v-for="(tab, i) in tabs"
          :key="i"
        >
          {{ tab.title }}
          <v-icon v-text="tab.icon" />
        </v-tab>

        <v-tabs-items
          v-model="activeTab"
          class="transparent"
        >
          <!-- Tank -->
          <v-tab-item>
            <v-card-text>
              <v-progress-linear
                v-if="fetchingAccountingInfo"
                indeterminate
              />
              <v-row>
                <v-col
                  cols="12"
                  sm="6"
                >
                  <v-text-field
                    v-model="accountingInfo.tank_contract_no"
                    label="Contract Number"
                    prepend-icon="mdi-counter"
                  />
                </v-col>
                <v-col
                  v-for="(dateField, i) in tankDateFields"
                  :key="i"
                  cols="12"
                  sm="6"
                >
                  <v-menu
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
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                >
                  <v-switch
                    v-model="accountingInfo.tank_automatic_billing_start_date"
                    label="Automatic Billing Start Date"
                  />
                </v-col>
                <v-col
                  cols="12"
                  sm="4"
                >
                  <v-text-field
                    v-model="accountingInfo.tank_contract_length"
                    label="Contract Length"
                    prepend-icon="mdi-pen-lock"
                  />
                </v-col>
                <v-col
                  cols="12"
                  sm="4"
                >
                  <v-text-field
                    v-model="accountingInfo.tank_free_years"
                    :disabled="!accountingInfo.tank_contract_signed_date"
                    label="Free Years"
                    prepend-icon="mdi-currency-usd-off"
                  />
                </v-col>
                <v-col
                  cols="12"
                  sm="4"
                >
                  <v-text-field
                    v-model="accountingInfo.tank_annual_retainer_fee"
                    label="Annual Retainer Fee"
                    prepend-icon="mdi-cash-100"
                  />
                </v-col>

                <v-col
                  cols="12"
                  sm="4"
                >
                  <v-text-field
                    v-model="accountingInfo.number_of_tank"
                    disabled
                    label="Tank Vessel Count"
                    prepend-icon="mdi-ferry"
                  />
                </v-col>

                <v-col
                  cols="12"
                  sm="4"
                >
                  <v-text-field
                    v-model="accountingInfo.gross_tank_total"
                    disabled
                    label="Gross Total"
                    prepend-icon="mdi-cash-multitple"
                  />
                </v-col>

                <v-col
                  cols="12"
                  sm="4"
                >
                  <v-text-field
                    v-model="accountingInfo.tank_net_total"
                    disabled
                    label="Net Total"
                    prepend-icon="mdi-cash"
                  />
                </v-col>

                <!-- If is_discountable -->
                <template v-if="accountingInfo.is_discountable">
                  <v-col
                    cols="12"
                    sm="4"
                  >
                    <v-text-field
                      v-model="accountingInfo.tank_discount_value"
                      disabled
                      label="Discount $"
                      prepend-icon="mdi-cash-minus"
                    />
                  </v-col>
                  <v-col
                    cols="12"
                    sm="4"
                  >
                    <v-text-field
                      v-model="accountingInfo.tank_auto_discount"
                      disabled
                      label="Automatic Discount"
                      prepend-icon="mdi-brightness-auto"
                    />
                  </v-col>
                  <v-col
                    cols="12"
                    sm="4"
                  >
                    <v-text-field
                      v-model="accountingInfo.manual_tank_discount"
                      label="Discount Override"
                      hint="Available Values are 1 ~ 100"
                      type="number"
                      :rules="[rules.range]"
                      persistent-hint
                      prepend-icon="mdi-sale"
                    />
                  </v-col>
                </template>

                <v-col
                  cols="12"
                >
                  <v-textarea
                    v-model="accountingInfo.tank_billing_note"
                    label="Notes"
                    prepend-icon="mdi-pen"
                  />
                </v-col>
              </v-row>

              <v-btn
                color="success"
                small
                :loading="updating"
                @click="updateBillingInfo"
              >
                <v-icon left>
                  mdi-content-save
                </v-icon>
                Save
              </v-btn>
            </v-card-text>
          </v-tab-item>

          <!-- Non Tank -->
          <v-tab-item>
            <v-card-text>
              <v-progress-linear
                v-if="fetchingAccountingInfo"
                indeterminate
              />
              <v-row>
                <v-col
                  cols="12"
                  sm="6"
                >
                  <v-text-field
                    v-model="accountingInfo.non_tank_contract_no"
                    label="Contract Number"
                    prepend-icon="mdi-counter"
                  />
                </v-col>
                <v-col
                  v-for="(dateField, i) in nonTankDateFields"
                  :key="i"
                  cols="12"
                  sm="6"
                >
                  <v-menu
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
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                >
                  <v-switch
                    v-model="accountingInfo.non_tank_automatic_billing_start_date"
                    label="Automatic Billing Start Date"
                  />
                </v-col>
                <v-col
                  cols="12"
                  sm="4"
                >
                  <v-text-field
                    v-model="accountingInfo.non_tank_contract_length"
                    label="Contract Length"
                    prepend-icon="mdi-pen-lock"
                  />
                </v-col>
                <v-col
                  cols="12"
                  sm="4"
                >
                  <v-text-field
                    v-model="accountingInfo.non_tank_free_years"
                    :disabled="!accountingInfo.non_tank_contract_signed_date"
                    label="Free Years"
                    prepend-icon="mdi-currency-usd-off"
                  />
                </v-col>
                <v-col
                  cols="12"
                  sm="4"
                >
                  <v-text-field
                    v-model="accountingInfo.non_tank_annual_retainer_fee"
                    label="Annual Retainer Fee"
                    prepend-icon="mdi-cash-100"
                  />
                </v-col>

                <v-col
                  cols="12"
                  sm="4"
                >
                  <v-text-field
                    v-model="accountingInfo.number_of_non_tank"
                    disabled
                    label="Non Tank Vessel Count"
                    prepend-icon="mdi-ferry"
                  />
                </v-col>

                <v-col
                  cols="12"
                  sm="4"
                >
                  <v-text-field
                    v-model="accountingInfo.gross_non_tank_total"
                    disabled
                    label="Gross Total"
                    prepend-icon="mdi-cash-multitple"
                  />
                </v-col>

                <v-col
                  cols="12"
                  sm="4"
                >
                  <v-text-field
                    v-model="accountingInfo.non_tank_net_total"
                    disabled
                    label="Net Total"
                    prepend-icon="mdi-cash"
                  />
                </v-col>

                <!-- If is_discountable -->
                <template v-if="accountingInfo.is_discountable">
                  <v-col
                    cols="12"
                    sm="4"
                  >
                    <v-text-field
                      v-model="accountingInfo.non_tank_discount_value"
                      label="Discount $"
                      disabled
                      prepend-icon="mdi-cash-minus"
                    />
                  </v-col>
                  <v-col
                    cols="12"
                    sm="4"
                  >
                    <v-text-field
                      v-model="accountingInfo.non_tank_auto_discount"
                      label="Automatic Discount"
                      disabled
                      prepend-icon="mdi-brightness-auto"
                    />
                  </v-col>
                  <v-col
                    cols="12"
                    sm="4"
                  >
                    <v-text-field
                      v-model="accountingInfo.manual_non_tank_discount"
                      label="Discount Override"
                      hint="Available Values are 1 ~ 100"
                      type="number"
                      :rules="[rules.range]"
                      persistent-hint
                      prepend-icon="mdi-sale"
                    />
                  </v-col>
                </template>

                <v-col
                  cols="12"
                >
                  <v-textarea
                    v-model="accountingInfo.non_tank_billing_note"
                    label="Notes"
                    prepend-icon="mdi-pen"
                  />
                </v-col>
              </v-row>

              <v-btn
                color="success"
                small
                :loading="updating"
                @click="updateBillingInfo"
              >
                <v-icon left>
                  mdi-content-save
                </v-icon>
                Save
              </v-btn>
            </v-card-text>
          </v-tab-item>
        </v-tabs-items>
      </base-material-tabs>
    </base-material-card>

    <account-managers />
  </div>
</template>

<script>
  import axios from 'axios'
  import { mapActions, mapState } from 'vuex'
  import { isInternal } from '@/shared/management'

  export default {
    components: {
      AccountManagers: () => import('./AccountManagers'),
    },

    data: () => ({
      rules: {
        range: v => (parseInt(v) > 0 && parseInt(v) <= 100) || 'The value should be within 1 to 100',
      },
      activeTab: 0,
      tabs: [
        { title: 'Tank', icon: 'mdi-water' },
        { title: 'Non-Tank', icon: 'mdi-water-off' },
      ],
      fetchingAccountingInfo: false,
      updating: false,
      accountingInfo: {},
      tankDateFields: [
        {
          ref: 'tankExpirationDateRef',
          expirationDateRef: false,
          value: 'tank_expiration_date',
          label: 'Expiration Date',
          icon: 'mdi-calendar-clock',
        },
        {
          ref: 'tankCancellationDateRef',
          cancellationDateRef: false,
          value: 'tank_cancellation_date',
          label: 'Cancellation Date',
          icon: 'mdi-calendar-remove',
        },
        {
          ref: 'tankContractSignedDateRef',
          contractSignedDateRef: false,
          value: 'tank_contract_signed_date',
          label: 'Contract Signed Date',
          icon: 'mdi-calendar-edit',
        },
        {
          ref: 'tankBillingStartDateRef',
          billingStartDateRef: false,
          value: 'tank_billing_start_date',
          label: 'Billing Start Date',
          icon: 'mdi-calendar-star',
        },
      ],
      nonTankDateFields: [
        {
          ref: 'nontankExpirationDateRef',
          expirationDateRef: false,
          value: 'non_tank_expiration_date',
          label: 'Expiration Date',
          icon: 'mdi-calendar-clock',
        },
        {
          ref: 'nontankCancellationDateRef',
          cancellationDateRef: false,
          value: 'non_tank_cancellation_date',
          label: 'Cancellation Date',
          icon: 'mdi-calendar-remove',
        },
        {
          ref: 'nontankContractSignedDateRef',
          contractSignedDateRef: false,
          value: 'non_tank_contract_signed_date',
          label: 'Contract Signed Date',
          icon: 'mdi-calendar-edit',
        },
        {
          ref: 'nontankBillingStartDateRef',
          billingStartDateRef: false,
          value: 'non_tank_billing_start_date',
          label: 'Billing Start Date',
          icon: 'mdi-calendar-star',
        },
      ],
    }),
    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),
    },
    mounted () {
      this.getDataFromApi()
    },
    methods: {
      ...mapActions({
        showSnackBar: 'showSnackBar',
      }),

      async updateBillingInfo () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        this.updating = true
        try {
          const response = await axios.put('billing-information/' + this.$route.params.id, this.accountingInfo)
          this.showSnackBar({ text: response.data.message, color: response.data.success ? 'success' : 'error' })
          this.getDataFromApi()
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.updating = false
      },

      async getDataFromApi () {
        this.fetchingAccountingInfo = true
        try {
          const response = await axios.get('billing-information/' + this.$route.params.id)
          this.accountingInfo = response.data.data[0] || {}
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.fetchingAccountingInfo = false
      },
    },
  }
</script>
