<template>
  <base-material-card
    color="primary"
    icon="mdi-ferry"
    inline
  >
    <template v-slot:after-heading>
      <div class="text-h3">
        Vessels
      </div>
    </template>

    <simple-operations
      @refetch="refetch"
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
          >
            <td
              class="pl-5"
            >
              <v-tooltip
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
                      :color="item.vrp_vessel_status === 'Authorized' ? 'success' : item.vrp_vessel_status === 'Not Authorized' ? 'error' : 'warning'"
                      :value="item.vrp_vessel_status==='Authorized' || item.vrp_vessel_status==='Not Authorized' || item.vrp_vessel_status===null"
                    >
                      <template v-slot:badge>
                        <v-icon dark>
                          {{ item.vrp_vessel_status === 'Authorized' ? 'mdi-check' : item.vrp_vessel_status === 'Not Authorized' ? 'mdi-close' : item.plan_number === null ? 'mdi-link' : 'mdi-exclamation-thick' }}
                        </v-icon>
                      </template>
                      <router-link
                        class="table-link"
                        :to="`/vessels/${item.id}`"
                      >
                        {{ item.name | truncate(42) }}
                      </router-link>
                    </v-badge>
                    <router-link
                      v-else
                      class="table-link"
                      :to="`/vessels/${item.id}`"
                    >
                      {{ item.name | truncate(42) }}
                    </router-link>
                  </span>
                </template>
                <span>{{ item.vrp_vessel_status !== null ? item.vrp_vessel_status : item.plan_number ===null ? 'No Vrp Link' : 'VRP Does Not Match' }}</span>
              </v-tooltip>
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
                      :value="item.networks_active === 1"
                    >
                      <span>
                        <v-icon
                          :color="djsaStatus(item.active_field_id).color"
                          size="30"
                        >
                          {{ djsaStatus(item.active_field_id).planVesselIcon }}
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
                        {{ item.vessel_type !== null ? item.vessel_type : item.vrp_vessel_type }}
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
                      :color="item.vrp_vessel_status === 'Authorized' ? 'success' : item.vrp_vessel_status === 'Not Authorized' ? 'error' : 'warning'"
                      :value="item.vrp_vessel_status==='Authorized' || item.vrp_vessel_status==='Not Authorized' || item.vrp_vessel_status===null"
                    >
                      <template
                        v-slot:badge
                      >
                        <v-icon dark>
                          {{ item.vrp_vessel_status === 'Authorized' ? 'mdi-check' : item.vrp_vessel_status === 'Not Authorized' ? 'mdi-close' : item.plan_number === null ? 'mdi-link' : 'mdi-exclamation-thick' }}
                        </v-icon>
                      </template>
                      {{ item.plan_number }}
                    </v-badge>
                    <span v-else>
                      {{ item.plan_number }}
                    </span>
                  </span>
                </template>
                <span>{{ item.vrp_vessel_status !== null ? item.vrp_vessel_status : item.plan_number ===null ? 'No Vrp Link' : 'VRP Does Not Match' }}</span>
              </v-tooltip>
            </td>
            <td v-if="showCompany">
              <router-link
                v-if="item.company_id"
                class="table-link"
                :to="'/companies/' + item.company_id"
              >
                {{ item.company_name }}
              </router-link>
              <span v-else>{{ item.company_name }}</span>
            </td>
          </tr>
        </tbody>
      </template>
    </v-data-table>
    <table-footer
      :options="options"
      :total="total"
    />
  </base-material-card>
</template>

<script>
  import axios from 'axios'
  import { mapActions, mapState } from 'vuex'
  import { djsaStatus, isInternal } from '@/shared/management'

  export default {
    components: {
      SimpleOperations: () => import('../components/tableOptions/vessel/SimpleOperations'),
      TableFooter: () => import('../components/TableFooter'),
    },

    data: () => ({
      showTable: true,
      vessels: [],
      loading: 0,
      options: {},
      total: 0,
      djsaStatus,
      isInternal,
      showCompany: false,
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
    }),

    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),

      computedHeaders () {
        const headers = this.headers.filter(item => !this.$vuetify.breakpoint.xs || item.showOnMobile)
        return this.showCompany ? headers : headers.filter(header => header.text !== 'Company')
      },
    },

    watch: {
      options: {
        handler () {
          this.getDataFromApi()
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
          let apiurl = `vessels?page=${page}&per_page=${itemsPerPage}`
          if (search && typeof search === 'string') {
            apiurl += `&query=${search.replace('&', '%26')}`
          } else if (sortBy[0]) {
            const direction = sortDesc[0] ? 'desc' : 'asc'
            apiurl += `&direction=${direction}&sortBy=${sortBy[0]}`
          }

          const res = await axios.get(apiurl)
          this.vessels = res.data.data.map(vessel => ({ ...vessel, companyName: vessel.company_name ? vessel.company_name : 'No Company' }))
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
