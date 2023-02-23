<template>
  <div>
    <operations
      :options="options"
      :cdt-companies="cdtCompanies"
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
      :items="companies"
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
            <v-tooltip
              v-else-if="header.badge"
              bottom
            >
              <template v-slot:activator="{ on, attrs }">
                <v-badge
                  :color="header.badgeColor"
                  bottom
                  :icon="header.badgeIcon"
                >
                  <v-icon
                    v-bind="attrs"
                    v-on="on"
                  >
                    {{ header.badge }}
                  </v-icon>
                </v-badge>
              </template>
              <span>{{ header.text }}</span>
            </v-tooltip>
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
              <router-link
                class="table-link"
                :to="item.vrp_import === 1 ? '/companies/' + item.plan_number + '/vrpexpress' : '/companies/' + item.id"
              >
                {{ item.name }}
              </router-link>
            </td>
            <td>
              {{ item.plan_count }}
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
                          :color="item.vendor_active ? 'secondary' : djsaStatus(item.active_field_id).color"
                          size="30"
                          :class="[3, 4].includes(item.active_field_id) && 'djs-svg-icon'"
                        >
                          {{ item.vendor_active ? 'mdi-shield-link-variant' : djsaStatus(item.active_field_id).companyIcon }}
                        </v-icon>
                      </span>
                    </v-badge>
                  </span>
                </template>
                <span>
                  {{ item.vendor_active ? 'Vendor' : djsaStatus(item.active_field_id).text }}
                </span>
              </v-tooltip>
            </td>
            <td class="d-none d-sm-table-cell">
              {{ item.stats.individuals }}
            </td>
            <td class="d-none d-sm-table-cell">
              {{ item.vrp_stats.vessels }}
            </td>
            <td class="d-none d-sm-table-cell">
              {{ item.stats.vessels }}
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
          </tr>
        </tbody>
      </template>
    </v-data-table>
    <table-footer
      :options="options"
      :total="total"
    />
  </div>
</template>

<script>
  import axios from 'axios'
  import { mapActions, mapState } from 'vuex'
  import { fetchInitials } from '@/mixins/fetchInitials'
  import { MIXINS, MAIN_COMPANY, staticSearch } from '@/shared/constants'
  import { djsaStatus } from '@/shared/management'

  export default {
    components: {
      Operations: () => import('../components/tableOptions/company/Operations'),
      TableFooter: () => import('../components/TableFooter'),
    },

    mixins: [
      fetchInitials([
        MIXINS.countries,
      ]),
    ],

    props: {
      affiliate: {
        type: Boolean,
        default: false,
      },
    },

    data: () => ({
      showTable: true,
      companies: [],
      loading: 0,
      options: {},
      total: 0,
      cdtCompanies: [],
      djsaStatus,
      staticSearch,
      search: '',
    }),

    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),

      computedHeaders () {
        const filtered = MAIN_COMPANY.filter(item => !this.$vuetify.breakpoint.xs || item.showOnMobile)
        return filtered
      },
      availableSteps () {
        const steps = [0, 1, 2, 3]
        return steps
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
          let apiurl = `companies?page=${page}&per_page=${itemsPerPage}`
          if (search && typeof search === 'string') {
            this.search = search
            apiurl += `&query=${search.replace('&', '%26')}`
          } else if (sortBy[0]) {
            const direction = sortDesc[0] ? 'desc' : 'asc'
            apiurl += `&direction=${direction}&sortBy=${sortBy[0]}`
          }

          const res = await axios.post(apiurl, {
            staticSearch: { ...this.staticSearch, parent: this.affiliate && this.$route.params.id },
          })
          this.companies = res.data.data
          this.cdtCompanies = res.data.data.filter(company => !company.vrp_import)
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
          this.staticSearch = { ...this.staticSearch, ...reload }
        }
        this.getDataFromApi(reload)
      },

      getCountryFromCode (item) {
        return item.location || (this.mixinItems.countries.find(country => country.id === item.country) || {}).name
      },
    },
  }
</script>
