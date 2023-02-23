<template>
  <div>
    <operations
      :options="options"
      :cdt-vessels="cdtVessels"
      :single="single"
      :company-id="companyId"
      @refetch="refetch"
      @showTable="viewTable"
      @showCompany="showCompanies"
    />

    <v-progress-linear
      v-if="loading"
      indeterminate
    />

    <v-data-table
      v-if="showTable"
      :headers="computedHeaders"
      :items="vessels"
      :options.sync="options"
      hide-default-footer
      class="mt-5"
    >
      <template v-slot:body="{ items }">
        <tbody>
          <tr
            v-for="(item, i) in items"
            :key="i"
            :class="{ 'vrp-sql': item.vrp_import === 1 }"
          >
            <td
              class="pl-5"
            >
              <v-tooltip
                v-if="item.vrp_status==='Authorized' || item.vrp_status==='Not Authorized'"
                right
              >
                <template v-slot:activator="{ on }">
                  <span
                    dark
                    v-on="on"
                  >
                    <v-badge
                      v-if="role && isInternal(role.id)"
                      slot="activator"
                      left
                      :color="item.linked === 1 ? 'success' : item.linked === 2 || item.linked === 3 ? 'warning' : 'error'"
                      :value="item.vrp_status==='Authorized' || item.vrp_status==='Not Authorized'"
                    >
                      <template v-slot:badge>
                        <v-icon dark>
                          {{ item.linked === 1 ? 'mdi-check' : item.linked === 0 ? 'mdi-close' : item.linked === 2 ? 'mdi-exclamation-thick' : 'mdi-link' }}
                        </v-icon>
                      </template>
                      <router-link
                        class="table-link"
                        :to="item.vrp_import
                          ? `/vessels/${item.id}/vrpexpress`
                          : `/vessels/${item.id}`"
                      >
                        {{ item.name | truncate(42) }}
                      </router-link>
                    </v-badge>
                    <router-link
                      v-else
                      class="table-link"
                      :to="item.vrp_import
                        ? `/vessels/${item.id}/vrpexpress`
                        : `/vessels/${item.id}`"
                    >
                      {{ item.name | truncate(42) }}
                    </router-link>
                  </span>
                </template>
                <span v-if="item.linked === 1 || item.linked === 0">{{ item.vrp_status }}</span>
                <span v-if="item.linked === 2">VRP Does Not Match</span>
                <span v-if="item.linked === 3">No Vrp Link</span>
              </v-tooltip>
              <router-link
                v-else
                class="table-link"
                :to="item.vrp_import
                  ? `/vessels/${item.id}/vrpexpress`
                  : `/vessels/${item.id}`"
              >
                {{ item.name | truncate(42) }}
              </router-link>
            </td>
            <td class="d-none d-sm-table-cell">
              <span>{{ item.ex_name }}</span>
            </td>
            <td class="d-none d-sm-table-cell">
              <span>{{ item.imo }}</span>
            </td>
            <td class="d-none d-sm-table-cell">
              {{ item.official_number ? item.official_number : '-' }}
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
                      :color="item.networks_active === 1 ? 'primary' : 'secondary'"
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
            <td class="pl-5">
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <span
                    dark
                    v-on="on"
                  >
                    <v-badge
                      slot="activator"
                      left
                      :color="item.tanker ? 'black' : 'blue'"
                    >
                      <template v-slot:badge>
                        <v-icon dark>
                          {{ item.tanker ? 'mdi-water' : 'mdi-water-off' }}
                        </v-icon>
                      </template>
                      <span>
                        {{ item.type }}
                      </span>
                    </v-badge>
                  </span>
                </template>
                <span>{{ item.tanker ? 'Tank' : 'Non Tank' }}</span>
              </v-tooltip>
            </td>
            <td
              class="d-none d-sm-table-cell"
            >
              <v-tooltip
                v-if="item.vrp_status==='Authorized' || item.vrp_status==='Not Authorized'"
                bottom
              >
                <template v-slot:activator="{ on }">
                  <span
                    dark
                    v-on="on"
                  >
                    <v-badge
                      v-if="role && isInternal(role.id)"
                      slot="activator"
                      :color="item.linked === 1 ? 'success' : item.linked === 2 || item.linked === 3 ? 'warning' : 'error'"
                      :value="item.vrp_status==='Authorized' || item.vrp_status==='Not Authorized'"
                    >
                      <template
                        v-slot:badge
                      >
                        <v-icon dark>
                          {{ item.linked === 1 ? 'mdi-check' : item.linked === 0 ? 'mdi-close' : item.linked === 2 ? 'mdi-exclamation-thick' : 'mdi-link' }}
                        </v-icon>
                      </template>
                      {{ item.vrp_import ? item.vrp_plan_number : item.plan.plan_number }}
                    </v-badge>
                    <span v-else>
                      {{ item.vrp_import ? item.vrp_plan_number : item.plan.plan_number }}
                    </span>
                  </span>
                </template>
                <span v-if="item.linked === 1 || item.linked === 0">{{ item.vrp_status }}</span>
                <span v-if="item.linked === 2">VRP Does Not Match</span>
                <span v-if="item.linked === 3">No Vrp Link</span>
              </v-tooltip>
              <span v-else>
                {{ item.vrp_import ? item.vrp_plan_number : item.plan.plan_number }}
              </span>
            </td>
            <td v-if="showCompany">
              <router-link
                v-if="item.company"
                class="table-link"
                :to="'/companies/' + item.company.id"
              >
                {{ item.companyName }}
              </router-link>
              <span v-else>{{ item.companyName }}</span>
            </td>
            <td
              v-if="item.vrp_import === 1"
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
                    @click="importVessel(item.id); index = i"
                  >
                    <v-icon>mdi-import</v-icon>
                  </v-btn>
                </template>
                <span>Import To CDT</span>
              </v-tooltip>
            </td>
            <td v-else-if="single">
              <v-speed-dial
                v-model="fab[i]"
                direction="left"
              >
                <template v-slot:activator>
                  <v-btn
                    v-model="fab[i]"
                    fab
                    x-small
                    color="primary"
                    :loading="acting && actingIndex === i"
                  >
                    <v-icon v-if="fab[i]">
                      mdi-close
                    </v-icon>
                    <v-icon v-else>
                      mdi-chevron-left
                    </v-icon>
                  </v-btn>
                </template>

                <v-tooltip
                  v-for="(action, j) in availableActions(item)"
                  :key="j"
                  top
                >
                  <template v-slot:activator="{ attrs, on }">
                    <v-btn
                      v-bind="attrs"
                      :color="action.color"
                      fab
                      x-small
                      @click="trigger(action.what, item); actingIndex = i"
                      v-on="on"
                    >
                      <v-icon v-text="action.icon" />
                    </v-btn>
                  </template>

                  <span>{{ action.tooltip }}</span>
                </v-tooltip>
              </v-speed-dial>
            </td>
            <td v-else />
          </tr>
        </tbody>
      </template>
    </v-data-table>
    <table-footer
      :options="options"
      :total="total"
    />

    <!-- move vessel dialog -->
    <v-dialog
      v-model="moveDlg"
      persistent
      max-width="600"
    >
      <v-form
        ref="moveForm"
        lazy-validation
        @submit.prevent="moveVessel"
      >
        <v-card class="text-center">
          <v-card-title class="pt-5">
            Reassign Company or Plan

            <v-spacer />
            <v-icon
              aria-label="Close"
              @click="stopAll"
            >
              mdi-close
            </v-icon>
          </v-card-title>

          <v-card-text class="text-left">
            <v-autocomplete
              v-model="chosen.company_id"
              prepend-icon="mdi-domain"
              label="Company"
              clearable
              :items="mixinItems.companies"
              :loading="loadingMixins.companies"
              item-value="id"
              item-text="name"
            />
            <v-autocomplete
              v-model="chosen.plan_id"
              prepend-icon="mdi-notebook"
              label="Plan"
              clearable
              :items="mixinItems.plans"
              :loading="loadingMixins.plans"
              item-value="id"
              item-text="plan_holder_name"
            />
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="success"
              type="submit"
            >
              Update
            </v-btn>
            <v-btn
              color="error"
              type="button"
              @click="stopAll"
            >
              Close
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>

<script>
  import axios from 'axios'
  import { mapActions, mapState } from 'vuex'
  import { fetchInitials } from '@/mixins/fetchInitials'
  import { MIXINS, vesselStaticSearch } from '@/shared/constants'
  import { djsaStatus, isInternal } from '@/shared/management'

  export default {
    components: {
      Operations: () => import('../components/tableOptions/vessel/Operations'),
      TableFooter: () => import('../components/TableFooter'),
    },

    mixins: [
      fetchInitials([
        MIXINS.countries,
        MIXINS.companies,
        MIXINS.plans,
      ]),
    ],

    props: {
      single: {
        type: Boolean,
        default: false,
      },
      companyId: {
        type: String,
        default: '',
      },
    },

    data: () => ({
      showTable: true,
      vessels: [],
      loading: 0,
      options: {},
      total: 0,
      cdtVessels: [],
      djsaStatus,
      vesselStaticSearch,
      isInternal,
      showCompany: false,
      index: -1,
      actingIndex: -1,
      fab: {},
      acting: false,
      importing: false,
      headers: [
        {
          text: 'Vessel Name',
          value: 'name',
          showOnMobile: true,
        },
        {
          text: 'Ex Name',
          value: 'ex_name',
        },
        {
          text: 'IMO',
          value: 'imo',
        },
        {
          text: 'Official #',
          value: 'official_number',
        },
        {
          text: 'Status',
          value: 'djs_coverage',
          sortable: false,
          showOnMobile: true,
        },
        {
          text: 'Vessel Type',
          value: 'type',
          showOnMobile: true,
        },
        {
          text: 'Plan',
          value: 'plan_number',
          sortable: false,
        },
        {
          text: 'Company',
          value: 'companyName',
        },
      ],
      chosen: {},
      moveDlg: false,
      actions: [
        {
          color: 'primary',
          icon: 'mdi-eye',
          what: 'view',
          tooltip: 'View',
        },
        {
          color: 'error',
          icon: 'mdi-delete',
          what: 'delete',
          tooltip: 'Delete',
        },
        {
          color: 'secondary',
          icon: 'mdi-book-arrow-right',
          what: 'move',
          tooltip: 'Move',
        },
        {
          color: 'warning',
          icon: 'mdi-book-remove',
          what: 'remove',
          tooltip: 'Remove',
        },
        {
          color: 'success',
          icon: 'mdi-import',
          what: 'import',
          tooltip: 'Import',
        },
      ],
      search: '',
    }),

    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),

      computedHeaders () {
        const oneAction = {
          text: 'Action',
          value: '',
          sortable: false,
          showOnMobile: true,
        }

        const bulkActions = {
          text: 'Actions',
          value: '',
          sortable: false,
        }

        const filteredHeaders = this.single ? [...this.headers, bulkActions] : [...this.headers, oneAction]
        const headers = filteredHeaders.filter(item => !this.$vuetify.breakpoint.xs || item.showOnMobile)
        return this.showCompany ? headers : headers.filter(header => header.text !== 'Company')
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

      availableActions (vessel) {
        if (vessel.vrp_import) return this.actions.filter(action => ['move', 'remove', 'delete'].includes(action.what))
        else return this.actions.filter(action => action.what !== 'import')
      },

      stopAll () {
        this.acting = false
        this.actingIndex = -1
        this.moveDlg = false
        // dialog to false
      },

      async getDataFromApi (search) {
        this.loading++
        try {
          const { sortBy, sortDesc, page, itemsPerPage } = this.options
          let apiurl = `vessels?page=${page}&per_page=${itemsPerPage}`
          if (search && typeof search === 'string') {
            this.search = search
            apiurl += `&query=${search.replace('&', '%26')}`
          } else if (sortBy[0]) {
            const direction = sortDesc[0] ? 'desc' : 'asc'
            apiurl += `&direction=${direction}&sortBy=${sortBy[0]}`
          }

          if (this.single) {
            this.vesselStaticSearch.company = [this.companyId]
          }

          const res = await axios.post(apiurl, {
            staticSearch: this.vesselStaticSearch,
          })
          this.vessels = res.data.data.map(vessel => ({ ...vessel, companyName: vessel.company ? vessel.company.name : 'No Company' }))
          this.cdtVessels = res.data.data.filter(vessel => !vessel.vrp_import)
          this.total = res.data.meta ? res.data.meta.total : res.data.total
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.loading--
      },

      // Vessel Actions
      async trigger (action, vessel) {
        if (action === 'view') {
          const route = vessel.vrp_import
            ? `/vessels/${vessel.id}/vrpexpress`
            : `/vessels/${vessel.id}`
          this.$router.push(route)
        } else if (action === 'delete') {
          const permitted = await this.$confirm('Are you sure you want to DELETE?  This action will remove the vessel from the database.', { title: 'Warning' })
          if (permitted) {
            this.deleteVessel(vessel.id)
          }
        } else if (action === 'move') {
          this.chosen = { company_id: vessel.company.id, plan_id: vessel.plan.id, vessel_id: vessel.id }
          this.moveDlg = true
        } else if (action === 'remove') {
          const permitted = await this.$confirm('This action removes the vessel from this plan.  Vessel will remain with its company as a Non-VRP Vessel.  Proceed?', { title: 'Warning' })
          if (permitted) {
            this.removePlan(vessel.id)
          }
        } else {
          this.importVessel(vessel.id)
        }
      },

      removePlan (id) {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        this.acting = true
        axios.post('vessels/' + id + '/removeVesselFromPlan')
          .then(res => {
            this.showSnackBar({ text: res.data.message, color: 'success' })
            this.acting = false
            this.getDataFromApi()
          })
      },

      async moveVessel () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        this.moveDlg = false
        this.acting = true
        try {
          const response = await axios.put(`vessels/${this.chosen.vessel_id}/tags`, { company_id: this.chosen.company_id, plan_id: this.chosen.plan_id })
          this.showSnackBar({ text: response.data.message, color: 'success' })
          this.getDataFromApi()
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.acting = false
      },

      deleteVessel (id) {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        this.acting = true
        axios.delete('vessels/' + id + '/destroy')
          .then(res => {
            this.showSnackBar({ text: res.data.message, color: 'success' })
            this.getDataFromApi()
            this.acting = false
          })
      },

      async importVessel (id) {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        this.importing = true
        this.acting = true
        try {
          const response = await axios.post('vessels/' + id + '/import')
          this.showSnackBar({ text: response.data.message, color: response.data.success ? 'success' : 'error' })
        } catch (err) {
          this.showSnackBar({ text: err, color: 'error' })
        }
        this.importing = false
        this.acting = false
      },

      viewTable (show) {
        this.showTable = show
      },

      refetch (reload) {
        if (reload) {
          this.options.page = 1
        }

        if (typeof reload === 'object') {
          this.staticSearch = { ...this.staticSearch, ...reload }
        }
        this.getDataFromApi(reload)
      },

      getCountryFromCode (item) {
        return item.location || (this.mixinItems.countries.find(country => country.id === item.country) || {}).name
      },

      showCompanies (show) {
        this.showCompany = show
      },
    },
  }
</script>
