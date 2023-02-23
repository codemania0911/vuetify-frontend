<template>
  <base-material-card
    color="primary"
    :title="`${planName || ''} - Vessel Response Plan ${planNumber || ''} Vessels`"
  >
    <v-progress-linear
      v-if="!!loading"
      indeterminate
    />
    <v-row
      align="end"
      class="mb-5"
    >
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        class="ml-auto mr-3"
        label="Search"
        hide-details
        single-line
        clearable
        style="max-width: 200px;"
        :disabled="!isViewMode"
      />
      <template
        v-if="role && isInternal(role.id)"
      >
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              :disabled="!isViewMode"
              icon
              text
              color="primary"
              small
              class="mr-2"
              v-on="on"
              @click="advancedSearch = !advancedSearch"
            >
              <v-icon size="28">
                mdi-table-search
              </v-icon>
            </v-btn>
          </template>
          <span>Advanced Search</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              :disabled="!isViewMode"
              icon
              text
              color="warning"
              small
              class="mr-2"
              v-on="on"
              @click="addVessel"
            >
              <v-icon size="28">
                mdi-plus-circle-outline
              </v-icon>
            </v-btn>
          </template>
          <span>Add Vessel</span>
        </v-tooltip>
        <v-tooltip
          bottom
        >
          <template v-slot:activator="{ on }">
            <v-btn
              :disabled="!isViewMode"
              icon
              text
              small
              class="mr-2"
              v-on="on"
              @click="showHideVrp"
            >
              <v-icon
                v-if="showOrHide"
                size="28"
                color="primary"
              >
                mdi-eye
              </v-icon>
              <v-icon
                v-else
                size="28"
                color="gray"
              >
                mdi-eye-off
              </v-icon>
            </v-btn>
          </template>
          <span v-if="showOrHide">Hide VRP Imports</span>
          <span v-else>Show All</span>
        </v-tooltip>
        <v-tooltip
          bottom
        >
          <template v-slot:activator="{ on }">
            <v-btn
              :disabled="!isViewMode"
              icon
              text
              small
              class="mr-2"
              v-on="on"
              @click="showMergeVrp"
            >
              <v-icon
                size="28"
                :color="merge ? 'primary' : 'grey'"
              >
                mdi-table-merge-cells
              </v-icon>
            </v-btn>
          </template>
          <span v-if="merge">Unmerge</span>
          <span v-else>Merge</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              text
              :loading="bulkSaving"
              small
              class="mr-2"
              v-on="on"
              @click="editOrSave"
            >
              <v-icon
                size="28"
                color="primary"
              >
                {{ `${ isViewMode ? 'mdi-pencil' : 'mdi-content-save' }` }}
              </v-icon>
            </v-btn>
          </template>
          <span>{{ `${ isViewMode ? 'Edit Vessels' : 'Save Vessels'}` }}</span>
        </v-tooltip>
      </template>
    </v-row>

    <v-row v-if="advancedSearch && role && isInternal(role.id)">
      <v-col
        cols="12"
        class="text-h3"
      >
        Advanced Search
      </v-col>
      <v-col
        cols="12"
        sm="3"
      >
        <v-select
          v-model="staticSearch.active_field_id"
          :items="statusItems"
          item-text="text"
          item-value="value"
          label="Status"
          prepend-icon="mdi-check"
        />
      </v-col>
      <v-col
        cols="12"
        sm="3"
      >
        <v-autocomplete
          v-model="staticSearch.types"
          :items="mixinItems.vesselTypes"
          :loading="loadingMixins.vesselTypes"
          item-text="name"
          item-value="id"
          label="Type"
          prepend-icon="mdi-ferry"
          multiple
          clearable
        />
      </v-col>
      <v-col
        v-if="role && guardAPI('vendors/qi', role.id)"
        cols="12"
        sm="3"
      >
        <v-autocomplete
          v-model="staticSearch.qi"
          :items="mixinItems.qis"
          :loading="loadingMixins.qis"
          item-text="name"
          item-value="id"
          label="QI"
          prepend-icon="mdi-anchor"
          multiple
          clearable
        />
      </v-col>
      <v-col
        v-if="role && guardAPI('vendors/pi', role.id)"
        cols="12"
        sm="3"
      >
        <v-autocomplete
          v-model="staticSearch.pi"
          :items="mixinItems.pis"
          :loading="loadingMixins.pis"
          item-text="name"
          item-value="id"
          label="PI"
          prepend-icon="mdi-umbrella"
          multiple
          clearable
        />
      </v-col>
      <v-col
        cols="12"
        sm="3"
      >
        <v-autocomplete
          v-if="role && guardAPI('vendors/societies', role.id)"
          v-model="staticSearch.societies"
          :items="mixinItems.societies"
          :loading="loadingMixins.societies"
          item-text="name"
          item-value="id"
          label="Societies"
          prepend-icon="mdi-axis-arrow-lock"
          multiple
          clearable
        />
      </v-col>
      <v-col
        cols="12"
        sm="3"
      >
        <v-autocomplete
          v-if="role && guardAPI('vendors/insurers', role.id)"
          v-model="staticSearch.insurers"
          :items="mixinItems.insurers"
          :loading="loadingMixins.insurers"
          item-text="name"
          item-value="id"
          label="Hull and Machinery"
          prepend-icon="mdi-engine"
          multiple
          clearable
        />
      </v-col>
      <v-col
        cols="12"
        sm="3"
      >
        <v-autocomplete
          v-if="role && guardAPI('vendors/providers', role.id)"
          v-model="staticSearch.providers"
          :items="mixinItems.providers"
          :loading="loadingMixins.providers"
          item-text="name"
          item-value="id"
          label="Providers"
          prepend-icon="mdi-chart-bell-curve"
          multiple
          clearable
        />
      </v-col>
      <v-col
        cols="12"
        sm="3"
      >
        <v-select
          v-model="staticSearch.vrp_status"
          :items="vrpItems"
          item-text="text"
          item-value="value"
          label="VRP Express"
          prepend-icon="mdi-check"
        />
      </v-col>
    </v-row>
    <vessel-table-editor
      v-if="!isViewMode"
      :vessel-data="cdtVessels"
      :min-dimensions="[5, options.itemsPerPage]"
      :updatable="updatable"
      @bulk-saving="updateBulkSaving"
      @change:content-changed="notSaved = true"
      @change:save-update="handleAfterSave"
    />
    <v-data-table
      v-if="isViewMode"
      :headers="headers"
      :items="vessels"
      :options.sync="options"
      :hide-default-footer="true"
      class="mt-5"
    >
      <template v-slot:body="{ items }">
        <tbody>
          <tr
            v-for="(item, i) in items"
            :key="i"
            :class="{ 'vrp-sql': item.vrp_import === 1 }"
          >
            <td class="pl-5">
              <v-tooltip bottom>
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
            </td>
            <td>
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <span
                    dark
                    v-on="on"
                  >
                    {{ item.imo }}
                  </span>
                </template>
                <span>{{ item.vrp_status }}</span>
              </v-tooltip>
            </td>
            <td>{{ item.official_number ? item.official_number : '-' }}</td>
            <td>
              <router-link
                v-if="item.company && item.company.name"
                class="table-link"
                :to="`/companies/${item.company.id}`"
              >
                {{ item.company.name | truncate(30) }}
              </router-link>
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
            <td>
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
            <td>
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
                    :loading="acting && index === i"
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
                      @click="trigger(action.what, item); index = i"
                      v-on="on"
                    >
                      <v-icon v-text="action.icon" />
                    </v-btn>
                  </template>

                  <span>{{ action.tooltip }}</span>
                </v-tooltip>
              </v-speed-dial>
            </td>
          </tr>
        </tbody>
      </template>
    </v-data-table>

    <table-footer
      v-if="options.itemsPerPage > 0"
      :options="options"
      :total="total"
      :company="true"
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

    <!-- add vessel dialog -->
    <v-dialog
      v-model="showAdd"
      max-width="700"
      @click:outside="closeAdd"
      @keydown.esc="closeAdd"
    >
      <add-vessel
        :counter="addCounter"
        :company-id="companyId.toString()"
        @complete="completeAdd"
      />
    </v-dialog>

    <!-- confirmation dialog -->
    <confirm-dialog
      :show="saveChanges"
      :text="confirmText"
      @close:dialog="() => { saveChanges = false }"
      @discard:changes="() => { discardChanges() }"
    />
  </base-material-card>
</template>

<script>
  import axios from 'axios'
  import { mapActions, mapState } from 'vuex'
  import { fetchInitials } from '@/mixins/fetchInitials'
  import { MIXINS, statusItems, vrpItems } from '@/shared/constants'
  import { isInternal, guardAPI, djsaStatus } from '@/shared/management'

  export default {
    components: {
      VesselTableEditor: () => import('../../components/bulkEditors/VesselTableEditor'),
      TableFooter: () => import('../../components/TableFooter'),
      AddVessel: () => import('../../components/forms/AddVessel'),
      ConfirmDialog: () => import('../../components/ConfirmDialog.vue'),
    },
    mixins: [
      fetchInitials([
        MIXINS.plans,
        MIXINS.companies,
        MIXINS.insurers,
        MIXINS.providers,
        MIXINS.societies,
        MIXINS.qis,
        MIXINS.pis,
        MIXINS.vesselTypes,
      ]),
    ],
    data: () => ({
      search: '',
      statusItems,
      vrpItems,
      headers: [
        {
          text: 'Vessel Name',
          value: 'name',
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
          text: 'Company',
          value: 'company_name',
        },
        {
          text: 'Status',
          value: 'djs_coverage',
          sortable: false,
        },
        {
          text: 'Vessel Type',
          value: 'type',
        },
        {
          text: 'Plan',
          value: 'plan_number',
          sortable: false,
        },
        {
          text: 'Action',
          value: 'action',
          sortable: false,
        },
      ],
      staticSearch: {
        active_field_id: -1,
        resource_provider: -1,
        include_vrp: -1,
        company_vessel: 1,
        types: [],
        qi: [],
        pi: [],
        response: [],
        societies: [],
        insurers: [],
        providers: [],
        vendors: [],
        fleets: [],
        vrp_status: -1,
        vrp_comparison: -1,
        networks: [],
        merge: -1,
      },
      vessels: [],
      total: 0,
      options: {},
      loading: 0,
      searchTimeout: null,
      advancedSearch: false,
      planName: '',
      planNumber: undefined,
      showOrHide: true,
      merge: true,
      fab: {},
      isViewMode: true,
      showAdd: false,
      addCounter: 0,
      index: -1,
      acting: false,
      guardAPI,
      isInternal,
      saveChanges: false,
      confirmText: 'If you continue, your progress will be lost.\n Do you want to leave this page without saving?',
      to: null,
      next: null,
      notSaved: false,
      updatable: false,
      bulkSaving: false,
      cdtVessels: [],
      companyId: 0,

      // View, Move, Remove, Delete, Import
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
      chosen: {},
      djsaStatus,
    }),
    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),
    },
    watch: {
      options: {
        handler () {
          this.getDataFromApi()
        },
        deep: true,
      },
      search () {
        if (this.searchTimeout) {
          clearTimeout(this.searchTimeout)
        }
        this.searchTimeout = setTimeout(() => {
          this.options.page = 1
          this.getDataFromApi()
        }, 500)
      },
      staticSearch: {
        handler () {
          this.options.page = 1
          this.getDataFromApi()
        },
        deep: true,
      },
    },
    async mounted () {
      this.staticSearch.plan = this.$route.params.id
      axios.get(`plans/${this.$route.params.id}`)
        .then(res => {
          this.planName = res.data.data[0].plan_holder_name
          this.planNumber = res.data.data[0].plan_number
          this.companyId = res.data.data[0].company.id
        })
    },
    methods: {
      ...mapActions({
        showSnackBar: 'showSnackBar',
      }),

      async getDataFromApi () {
        this.loading++
        try {
          const { sortBy, sortDesc, page, itemsPerPage } = this.options
          let apiurl = `vessels?page=${page}&per_page=${itemsPerPage}`
          if (this.search) {
            apiurl += `&query=${this.search.replace('&', '%26')}`
          } else if (sortBy[0]) {
            const direction = sortDesc[0] ? 'desc' : 'asc'
            apiurl += `&direction=${direction}&sortBy=${sortBy[0]}`
          }

          const res = await axios.post(apiurl, { staticSearch: this.staticSearch })
          this.vessels = res.data.data.map(vessel => ({ ...vessel, companyName: vessel.company ? vessel.company.name : 'No Company' }))
          this.cdtVessels = res.data.data.filter(vessel => !vessel.vrp_import)
          this.total = res.data.meta ? res.data.meta.total : res.data.total
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.loading--
      },

      async importVessel (id) {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        this.acting = true
        try {
          const response = await axios.post('vessels/' + id + '/import')
          response.data.success
            ? this.showSnackBar({ text: response.data.message, color: 'success' })
            : this.showSnackBar({ text: response.data.message, color: 'error' })
        } catch (err) {
          this.showSnackBar({ text: err, color: 'error' })
        }
        this.acting = false
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

      showHideVrp () {
        this.showOrHide = !this.showOrHide
        if (this.showOrHide) {
          this.staticSearch.include_vrp = -1
        } else {
          this.staticSearch.include_vrp = 0
        }
        this.getDataFromApi()
      },

      showMergeVrp () {
        this.merge = !this.merge
        if (this.merge) {
          this.staticSearch.merge = -1
        } else {
          this.staticSearch.merge = 0
        }
        this.getDataFromApi()
      },

      async editOrSave () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        this.isViewMode ? this.isViewMode = !this.isViewMode : this.updatable = true
      },

      updateBulkSaving (val) {
        this.bulkSaving = val
      },

      handleAfterSave () {
        this.notSaved = false
        this.isViewMode = true
        this.updatable = false
        this.getDataFromApi()
      },

      addVessel () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        this.showAdd = true
        this.addCounter++
      },

      completeAdd (success) {
        this.showAdd = false
        if (success) {
          this.getDataFromApi()
        }
      },

      closeAdd () {
        this.$confirm('Do you want to lose your progress?', { title: 'Warning' })
          .then(res => {
            if (!res) {
              this.showAdd = true
            }
          })
      },

      discardChanges () {
        this.saveChanges = false
        this.next()
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

      stopAll () {
        this.acting = false
        this.index = -1
        this.moveDlg = false
        // dialog to false
      },

      availableActions (vessel) {
        if (vessel.vrp_import) return this.actions.filter(action => ['move', 'remove', 'delete'].includes(action.what))
        else return this.actions.filter(action => action.what !== 'import')
      },
    },

    beforeRouteLeave (to, from, next) {
      if (!this.notSaved) {
        next()
      } else {
        this.saveChanges = true
        this.to = to
        this.next = next
      }
    },
  }
</script>
<style lang="sass">
  .vrp-sql
    background-color: #f7f7f7
    td, a
      color: gray !important
</style>
