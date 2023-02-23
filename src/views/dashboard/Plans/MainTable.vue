<template>
  <div>
    <operations
      :options="options"
      :cdt-plans="cdtPlans"
      @refetch="refetch"
      @showTable="viewTable"
    />

    <v-progress-linear
      v-if="loading"
      indeterminate
    />

    <v-data-table
      v-if="showTable"
      :headers="computedHeaders"
      :items="plans"
      :options.sync="options"
      hide-default-footer
      hide-default-header
      class="mt-5"
    >
      <template
        v-slot:header="{ props: { headers } }"
      >
        <tr class="company-header">
          <th
            v-for="(header, i) in headers"
            :key="i"
            style="font-weight: normal"
          >
            <v-tooltip
              v-if="header.icon"
              bottom
            >
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-bind="attrs"
                  v-on="on"
                >
                  {{ header.icon }}
                </v-icon>
              </template>
              <span>{{ header.text }}</span>
            </v-tooltip>
            <v-badge
              v-else-if="header.badge"
              :color="header.text === 'DJS' ? 'primary' : 'error'"
              bottom
              :content="header.text"
            >
              <v-icon>{{ header.badge }}</v-icon>
            </v-badge>
            <template
              v-else
            >
              {{ header.text }}
            </template>
          </th>
        </tr>
      </template>
      <template v-slot:body="{ items }">
        <tbody>
          <tr
            v-for="(item, i) in items"
            :key="i"
            :class="{ 'vrp-sql': item.vrp_import === 1 }"
          >
            <td style="width: 400px;">
              <v-tooltip
                v-if="item.vrp_status"
                bottom
              >
                <template v-slot:activator="{ on }">
                  <span
                    dark
                    v-on="on"
                  >
                    <v-badge
                      slot="activator"
                      left
                      :color="item.vrp_status === 'Authorized' ? 'success' : item.vrp_status === 'Not Authorized' ? 'error' : 'warning'"
                    >
                      <template v-slot:badge>
                        <v-icon dark>
                          {{ item.vrp_status === 'Authorized' ? 'mdi-check' : item.vrp_status === 'Not Authorized' ? 'mdi-close' : 'mdi-link' }}
                        </v-icon>
                      </template>
                      <router-link
                        class="table-link"
                        :to="item.vrp_import === 1 ? '/plans/' + item.plan_number + '/vrpexpress' : '/plans/' + item.id"
                      >
                        {{ item.plan_holder_name }}
                      </router-link>
                    </v-badge>
                  </span>
                </template>
                <span>{{ item.vrp_status }}</span>
              </v-tooltip>
              <router-link
                v-else
                class="table-link"
                :to="item.vrp_import === 1 ? '/plans/' + item.plan_number + '/vrpexpress' : '/plans/' + item.id"
              >
                {{ item.plan_holder_name }}
              </router-link>
            </td>
            <td>
              {{ item.plan_number }}
            </td>
            <td
              v-if="role && includeVrp(role.id)"
              :class="`d-none d-sm-table-cell ${item.vrp_status === 'Authorized' ? 'success--text' : 'error--text'}`"
            >
              {{ item.vrp_status }}
            </td>
            <td
              v-if="role && includeVrp(role.id)"
              class="d-none d-sm-table-cell"
            >
              {{ item.plan_exp_date }}
            </td>
            <td>
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <span
                    dark
                    v-on="on"
                  >
                    <v-badge
                      slot="activator"
                      bottom
                      bordered
                      overlap
                      :icon="item.networks_active === 1 ? 'mdi-star' : 'mdi-hard-hat'"
                      :color="item.networks_active === 1 ? 'warning' : 'secondary'"
                      :value="item.networks_active === 1 || item.capabilies_active === 1"
                    >
                      <span>
                        <v-icon
                          :color="item.vrp_import === 1 ? 'gray' : djsaStatus(item.active_field_id).color"
                          size="30"
                        >
                          {{ item.vrp_import === 1 ? 'mdi-shield-search' : djsaStatus(item.active_field_id).planVesselIcon }}
                        </v-icon>
                      </span>
                    </v-badge>
                  </span>
                </template>
                <span v-if="item.vrp_import === 1 && item.vrp_primary_smff!==null">
                  {{ item.vrp_primary_smff }}
                </span>
                <span v-else-if="item.vrp_import === 1 && item.vrp_primary_smff===null">
                  No Provider Listed
                </span>
                <span v-else-if="item.vrp_import !== 1 && item.vendor_active===1">
                  {{ item.vendor_type ? item.vendor_type.name : 'No Vendor' }}
                </span>
                <span v-else>
                  {{ djsaStatus(item.active_field_id).text }}
                </span>
              </v-tooltip>
            </td>
            <td class="d-none d-sm-table-cell">
              {{ item.vessel_count }}
            </td>
            <td
              v-if="role && includeVrp(role.id)"
              class="d-none d-sm-table-cell"
            >
              {{ item.vrp_vessel_count }}
            </td>
            <td>
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <span
                    dark
                    v-on="on"
                  >
                    <flag
                      :iso="item.location.length === 2 ? item.location : item.country"
                      :squared="false"
                    />
                  </span>
                </template>
                <span>{{ getCountryFromCode(item) }}</span>
              </v-tooltip>
            </td>
            <td
              v-if="item.vrp_import === 1"
              class="d-none d-sm-table-cell"
            >
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    fab
                    x-small
                    color="secondary"
                    :loading="importing && index === i"
                    v-on="on"
                    @click="chosenPlanNumber = item.plan_number; importPlanDlg = true; index = i"
                  >
                    <v-icon>mdi-import</v-icon>
                  </v-btn>
                </template>
                <span>Import To CDT</span>
              </v-tooltip>
            </td>
            <td
              v-else
              class="d-none d-sm-table-cell"
            >
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    fab
                    x-small
                    color="primary"
                    :to="`/plans/${item.id}`"
                    v-on="on"
                  >
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                </template>
                <span>View</span>
              </v-tooltip>
            </td>
          </tr>
        </tbody>
      </template>
    </v-data-table>
    <table-footer
      :options="options"
      :total="total"
    />

    <v-dialog
      v-model="importPlanDlg"
      persistent
      max-width="600"
    >
      <v-card class="text-center">
        <v-card-title class="pt-5">
          Import Plan

          <v-spacer />
          <v-icon
            aria-label="Close"
            @click="importPlanDlg = false"
          >
            mdi-close
          </v-icon>
        </v-card-title>

        <v-form
          ref="importForm"
          lazy-validation
          @submit.prevent="importPlan"
        >
          <v-card-text class="text-left">
            <v-autocomplete
              v-model="companyId"
              prepend-icon="mdi-domain"
              label="Company *"
              clearable
              :items="mixinItems.companies"
              :loading="loadingMixins.companies"
              item-value="id"
              item-text="name"
            />
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="success"
              :disabled="companyId ? false : true"
              type="submit"
            >
              Import
            </v-btn>
            <v-btn
              color="warning"
              :disabled="companyId ? true : false"
              @click="importPlan"
            >
              New Company
            </v-btn>
            <v-btn
              color="error"
              type="button"
              @click="importPlanDlg = false"
            >
              Close
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import axios from 'axios'
  import { mapActions, mapState } from 'vuex'
  import { fetchInitials } from '@/mixins/fetchInitials'
  import { MIXINS, MAIN_PLAN, planStaticSearch } from '@/shared/constants'
  import { isInternal, includeVrp, djsaStatus } from '@/shared/management'

  export default {
    components: {
      Operations: () => import('../components/tableOptions/plan/Operations'),
      TableFooter: () => import('../components/TableFooter'),
    },

    mixins: [
      fetchInitials([
        MIXINS.countries,
      ]),
    ],

    props: {
      fromCompanyId: {
        type: String,
        default: '',
      },
    },

    data: () => ({
      showTable: true,
      plans: [],
      cdtPlans: [],
      loading: 0,
      options: {},
      total: 0,
      isInternal,
      includeVrp,
      djsaStatus,
      planStaticSearch,
      importing: false,
      importPlanDlg: false,
      chosenPlanNumber: 0,
      index: -1,
      companyId: null,
      search: '',
    }),

    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),

      computedHeaders () {
        const filtered = MAIN_PLAN.filter(item => !this.$vuetify.breakpoint.xs || item.showOnMobile)
        if (this.role) {
          if (this.includeVrp(this.role.id)) return filtered
          else return filtered.filter(item => !item.internal)
        }
        return filtered
      },
    },

    watch: {
      options: {
        handler () {
          this.getDataFromApi(this.search)
        },
        deep: true,
      },
    },

    methods: {
      ...mapActions({
        showSnackBar: 'showSnackBar',
      }),

      async getDataFromApi (search) {
        this.loading++
        try {
          const { sortBy, sortDesc, page, itemsPerPage } = this.options
          let apiurl = `plans?page=${page}&per_page=${itemsPerPage}`
          if (search && typeof search === 'string') {
            this.search = search
            apiurl += `&query=${search.replace('&', '%26')}`
          } else if (sortBy[0]) {
            const direction = sortDesc[0] ? 'desc' : 'asc'
            apiurl += `&direction=${direction}&sortBy=${sortBy[0]}`
          }

          const request = this.fromCompanyId ? { ...this.planStaticSearch, company: this.fromCompanyId } : this.planStaticSearch

          const res = await axios.post(apiurl, {
            staticSearch: request,
          })
          this.plans = res.data.data
          this.cdtPlans = res.data.data.filter(plan => !plan.vrp_import)
          this.total = res.data.meta ? res.data.meta.total : res.data.total
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.loading--
      },

      viewTable (show) {
        this.showTable = show
      },

      refetch (reload) {
        if (reload) {
          this.options.page = 1
        }

        if (typeof reload === 'object') {
          this.staticSearch = { ...this.planStaticSearch, ...reload }
        }
        this.getDataFromApi(reload)
      },

      getCountryFromCode (item) {
        return item.location || (this.mixinItems.countries.find(country => country.id === item.country) || {}).name
      },

      async importPlan () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        this.importPlanDlg = false
        this.importing = true
        try {
          const response = await axios.post('plans/' + this.chosenPlanNumber + '/import', { company_id: this.companyId })
          this.showSnackBar({ text: response.data.message, color: response.data.success ? 'success' : 'error' })
          this.getDataFromApi()
        } catch (err) {
          this.showSnackBar({ text: err, color: 'error' })
        }
        this.importing = false
      },
    },
  }
</script>

<style lang="sass">
  .company-header
    height: 40px
    text-align: left
    th
      font-weight: normal
</style>
