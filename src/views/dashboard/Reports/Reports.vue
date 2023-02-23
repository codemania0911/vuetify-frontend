<template>
  <v-container>
    <v-row>
      <v-col
        md="4"
        cols="12"
      >
        <base-material-card
          icon="mdi-microsoft-excel"
          title="Select Report Type"
          color="warning"
        >
          <v-list>
            <v-list-item-group
              v-model="selectedReportType"
              color="warning"
            >
              <template v-for="(reportType, i) in reportTypes">
                <v-list-item :key="i + 'report-type-title'">
                  <v-list-item-content>
                    <v-list-item-title v-text="reportType.title" />

                    <v-list-item-subtitle v-text="reportType.subtitle" />
                  </v-list-item-content>
                </v-list-item>

                <v-divider
                  v-if="i < reportTypes.length - 1"
                  :key="i"
                />
              </template>
            </v-list-item-group>
          </v-list>
        </base-material-card>
      </v-col>

      <v-col
        md="8"
        cols="12"
      >
        <base-material-card
          icon="mdi-microsoft-excel"
          :title="reportTypes[selectedReportType] ? reportTypes[selectedReportType].title : 'Report'"
          color="primary"
        >
          <v-card-text
            v-if="selectedReportType === null"
            class="text-center"
          >
            <v-icon
              size="100"
              color="grey"
            >
              mdi-microsoft-excel
            </v-icon>
            <h6 class="text-h4">
              Please select the report type.
            </h6>
          </v-card-text>

          <v-row v-else-if="reportTypes[selectedReportType].type === 'vessel-file-report'">
            <v-col
              cols="12"
              md="6"
            >
              <v-autocomplete
                v-model="companyId"
                :items="mixinItems.companies"
                :loading="loadingMixins.companies"
                item-text="name"
                item-value="id"
                prepend-icon="mdi-domain"
                label="Select Company *"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
              class="d-flex justify-center align-center"
            >
              <v-btn
                color="success"
                :disabled="!companyId"
                :loading="loadingVesselFileReport"
                @click="fetchVesselFileReports"
              >
                <v-icon left>
                  mdi-content-save
                </v-icon>
                Generate Report
              </v-btn>
            </v-col>
          </v-row>

          <v-row v-else-if="reportTypes[selectedReportType].type === 'vessel-vendor-report'">
            <v-col
              cols="12"
              md="4"
            >
              <v-select
                v-model="hm.active_field_id"
                label="Active Field"
                prepend-icon="mdi-check"
                :items="activeFields"
                @change="fetchHmReports"
              />
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <v-select
                v-model="hm.vendor_type_id"
                label="Vendor Type"
                prepend-icon="mdi-format-list-bulleted-type"
                :items="mixinItems.vendorTypes"
                :loading="loadingMixins.vendorTypes"
                item-text="name"
                item-value="id"
                @change="fetchHmReports"
              />
            </v-col>
            <v-col
              cols="12"
              md="4"
              class="d-flex justify-center align-center"
            >
              <download-csv
                :data="hmReports"
                name="Vendor Type Report.csv"
                :labels="{
                  company_name: 'Company Name',
                  hm_name: 'H&M',
                  imo: 'IMO',
                  official_number: 'Official Number',
                  vessel_name: 'Vessel Name',
                }"
              >
                <v-btn
                  color="success"
                  :disabled="hmReports.length === 0 || !hm.vendor_type_id || !hm.active_field_id"
                  :loading="loadingHmReports"
                >
                  <v-icon left>
                    mdi-content-save
                  </v-icon>
                  Generate Report
                </v-btn>
              </download-csv>
            </v-col>
          </v-row>

          <v-row
            v-else-if="reportTypes[selectedReportType].type === 'gsa-company'"
            no-gutters
            justify="center"
          >
            <download-csv
              :data="gsaCompanyReport"
              :name="`GSA Company Report.csv`"
              :labels="{
                address: 'Address',
                assessment_of_structural_stability: 'Assessment of structural stability',
                begin_assessment_of_structural_stability: 'Begin assessment of structural stability',
                cotp_zone: 'COTP zone',
                diving_services_support: 'Diving services support',
                djs: 'DJS',
                djs_a: 'DJS A',
                emergency_lightering: 'Emergency lightering',
                emergency_towing: 'Emergency Towing',
                external_emergency_transfer_operations: 'External emergency transfer operations',
                external_firefighting_systems: 'External firefighting systems',
                external_vessel_firefighting_systems: 'External vessel firefighting systems',
                heavy_lift: 'Heavy lift',
                hull_and_bottom_survey: 'Hull and bottom survey',
                making_temporary_repairs: 'Making temporary repairs',
                name: 'Name',
                on_site_fire_assessment: 'On site fire assessment',
                on_site_salvage_assessment: 'On site salvage assessment',
                other_refloating_methods: 'Other refloating methods',
                phone: 'Phone',
                primary_smff_service: 'Primary smff service',
                remote_assessment_and_consultation: 'Remote assessment and consultation',
                remote_assessment_and_consultation_fire: 'Remote assessment and consultation fire',
                salvage_plan: 'Salvage plan',
                special_salvage_operations_plan: 'Special salvage operations plan',
                subsurface_product_removal: 'Subsurface product removal',
                website: '',
              }"
            >
              <v-btn
                color="success"
                :loading="loadingGSAReports"
                :disabled="loadingGSAReports"
              >
                <v-icon left>
                  mdi-content-save
                </v-icon>
                Generate Report
              </v-btn>
            </download-csv>
          </v-row>

          <v-row
            v-else-if="reportTypes[selectedReportType].type === 'gsa-vessel'"
            no-gutters
            justify="center"
          >
            <download-csv
              :data="gsaVesselReport"
              :name="`GSA Vessel Report.csv`"
              :labels="{
                bollard_pull: 'Bollard Pull',
                capacity_in_bbl: 'Capacity in bbl',
                company_name: 'Company Name',
                cotp_zone: 'COTP zone',
                djs: 'DJS',
                djs_a: 'DJS A',
                emergency_lightering: 'Emergency lightering',
                emergency_towing: 'Emergency Towing',
                external_vessel_firefighting_systems: 'External vessel firefighting systems',
                fifi_classification: 'Fifi classification',
                foam_quantity: 'Foam Quantity',
                heavy_lift: 'Heavy lift',
                horsepower: 'Horse Power',
                lifting_gear_minimum_swl: 'Lifting gear minimum swl',
                plan_number: 'Plan number',
                primary_smff_service: 'Primary smff service',
                pumping_capacity: 'Pumping capacity',
                timestamp: 'Timestamp',
                tug_type: 'Tug type',
                vessel_name: 'Vessel name',
              }"
            >
              <v-btn
                color="success"
                :loading="loadingGSAReports"
                :disabled="loadingGSAReports"
              >
                <v-icon left>
                  mdi-content-save
                </v-icon>
                Generate Report
              </v-btn>
            </download-csv>
          </v-row>

          <v-row v-else>
            <v-col
              cols="12"
              md="6"
            >
              <v-select
                v-model="billing.tank"
                label="Tank / Nontank"
                prepend-icon="mdi-water"
                :items="tankNonTank"
                @change="fetchBillingReport"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-select
                v-model="billing.donjon"
                label="Donjon-SMIT Entity"
                prepend-icon="mdi-domain"
                :items="donjonSmitEntities"
                @change="fetchBillingReport"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-select
                v-model="billing.billing_mode"
                label="Billing Mode"
                prepend-icon="mdi-domain"
                :items="mixinItems.billingModes"
                :loading="loadingMixins.billingModes"
                item-text="name"
                item-value="name"
                @change="fetchBillingReport"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
              class="d-flex justify-center align-center"
            >
              <download-csv
                :data="billingReport"
                name="Billing Report.csv"
                :labels="billingReportLabels"
                :fields="billingReportFields"
              >
                <v-btn
                  color="success"
                  :disabled="!billingReport.length || !billing.billing_mode"
                  :loading="loadingBillingReport"
                >
                  <v-icon left>
                    mdi-content-save
                  </v-icon>
                  Generate Report
                </v-btn>
              </download-csv>
            </v-col>
          </v-row>
        </base-material-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import axios from 'axios'
  import fileDownload from 'js-file-download'
  import { mapActions } from 'vuex'
  import { fetchInitials } from '@/mixins/fetchInitials'
  import { MIXINS, activeFields } from '@/shared/constants'

  export default {
    components: {
      DownloadCsv: () => import('vue-json-csv'),
    },

    mixins: [
      fetchInitials([
        MIXINS.companies,
        MIXINS.vendorTypes,
        MIXINS.billingModes,
      ]),
    ],

    data: () => ({
      companyId: null,
      selectedReportType: null,
      reportTypes: [
        { title: 'Vessel File Report by Company', type: 'vessel-file-report' },
        { title: 'Vessel Vendor Report', type: 'vessel-vendor-report' },
        { title: 'GSA Company Download', subtitle: '(Services & Locations)', type: 'gsa-company' },
        { title: 'GSA Vessels Download', subtitle: '(Services & Latest Position)', type: 'gsa-vessel' },
        { title: 'Billing Report', type: 'billing-report' },
      ],
      loadingVesselFileReport: false,
      activeFields,
      hm: {},
      hmReports: [],
      loadingHmReports: false,
      loadingGSAReports: false,
      gsaCompanyReport: [],
      gsaVesselReport: [],
      billing: {},
      loadingBillingReport: false,
      billingReport: [],
      tankNonTank: [
        { text: 'Tank', value: true },
        { text: 'Non-Tank', value: false },
      ],
      donjonSmitEntities: [
        { text: 'Donjon-SMIT', value: true },
        { text: 'Donjon-SMIT Americas', value: false },
      ],
      commonBillingReportLabels: {
        billing_mode: 'Billing Mode',
        company_name: 'Company Name',
        last_billed_date: 'Last Billed Date',
      },
      tankLabels: {
        calculated_tank_billing_start_date: 'Calculated tank billing start date',
        tank_contract_number: 'Tank contract number',
        number_of_tank_vessels: 'Number of tank vessels',
        tank_annual_retainer_fee: 'Tank annual retainer fee',
        gross_tank_total: 'Gross tank total',
        tank_discount: 'Tank discount',
        tank_discount_values: 'Tank discount values',
        tank_net_total: 'Tank net total',
      },
      nonTankLabels: {
        calculated_non_tank_billing_start_date: 'Calculated non tank billing start date',
        non_tank_contract_number: 'Non tank contract number',
        number_of_non_tank_vessels: 'Number of non tank vessels',
        non_tank_annual_retainer_fee: 'Non tank annual retainer fee',
        gross_non_tank_total: 'Gross non tank total',
        non_tank_discount: 'Non tank discount',
        non_tank_discount_values: 'Non tank discount values',
        non_tank_net_total: 'Non tank net total',
      },
    }),

    computed: {
      billingReportLabels () {
        return this.billing.tank
          ? { ...this.commonBillingReportLabels, ...this.tankLabels }
          : { ...this.commonBillingReportLabels, ...this.nonTankLabels }
      },

      billingReportFields () {
        const commonFields = Object.keys(this.commonBillingReportLabels)
        const tankFields = Object.keys(this.tankLabels)
        const nonTankFields = Object.keys(this.nonTankLabels)
        return this.billing.tank
          ? [...commonFields, ...tankFields]
          : [...commonFields, ...nonTankFields]
      },
    },

    async mounted () {
      await this.fetchGSAReports()
    },

    methods: {
      ...mapActions({
        showSnackBar: 'showSnackBar',
      }),

      async fetchVesselFileReports () {
        this.loadingVesselFileReport = true
        try {
          const response = await axios.get('reports/vesselReport/' + this.companyId, { responseType: 'blob' })
          fileDownload(response.data, 'Vessel Report.xlsx')
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.loadingVesselFileReport = false
      },

      async fetchHmReports () {
        if (this.hm.vendor_type_id && this.hm.active_field_id) {
          this.loadingHmReports = true
          try {
            const response = await axios.get(`reports/vendorReport?vendor_type_id=${this.hm.vendor_type_id}&active_field_id=${this.hm.active_field_id}`)
            this.hmReports = response.data
            if (!response.data.length) {
              this.showSnackBar({ text: 'No data for report', color: 'warning' })
            }
          } catch (error) {
            this.showSnackBar({ text: error, color: 'error' })
          }
          this.loadingHmReports = false
        }
      },

      async fetchGSAReports () {
        this.loadingGSAReports = true
        try {
          const gsaCompany = await axios.get('gsa/companies-report')
          const gsaVessel = await axios.get('gsa/vessels-report')
          this.gsaCompanyReport = gsaCompany.data
          this.gsaVesselReport = gsaVessel.data
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.loadingGSAReports = false
      },

      async fetchBillingReport () {
        if (this.billing.billing_mode) {
          this.loadingBillingReport = true
          try {
            const tank = this.billing.tank ? '?tank=1' : '?tank=0'
            const entity = this.billing.donjon ? '&donjon=1' : '&donjon=0'
            const billingMode = `&billing_mode=${this.billing.billing_mode}`
            const response = await axios.get(`reports/billingReport${tank + entity + billingMode}`)
            this.billingReport = response.data
            if (!response.data.length) {
              this.showSnackBar({ text: 'No data for report', color: 'warning' })
            }
          } catch (error) {
            this.showSnackBar({ text: error, color: 'error' })
          }
          this.loadingBillingReport = false
        }
      },
    },
  }
</script>
