<template>
  <div>
    <operations
      :options="options"
      :individuals="individuals"
      @refetch="refetch"
      @showTable="viewTable"
    />

    <v-data-table
      v-if="showTable"
      :headers="computedHeaders"
      :items="individuals"
      :loading="!!loading"
      :options.sync="options"
      hide-default-footer
      class="mt-5"
    >
      <template v-slot:item="individual">
        <tr>
          <td class="pl-5">
            <v-tooltip right>
              <template v-slot:activator="{ on }">
                <span
                  dark
                  v-on="on"
                >
                  <v-badge
                    slot="activator"
                    left
                    :color="individual.item.response===1 ? 'success' : 'error'"
                  >
                    <template v-slot:badge>
                      <v-icon dark>
                        {{ individual.item.response===1 ? 'mdi-badge-account' : 'mdi-badge-account-alert' }}
                      </v-icon>
                    </template>
                    <router-link
                      class="table-link"
                      :to="'/individuals/' + individual.item.id"
                    >
                      {{ individual.item.name | truncate(42) }}
                    </router-link>
                  </v-badge>
                </span>
              </template>
              <span>{{ individual.item.response===1 ? 'Responder' : 'No Responder' }}</span>
            </v-tooltip>
          </td>
          <td class="d-none d-sm-table-cell">
            <router-link
              v-if="individual.item.primary_company_id"
              class="table-link"
              :to="'/companies/' + individual.item.primary_company_id"
            >
              {{ getCompanyNameFromId(individual.item.primary_company_id) | truncate(42) }}
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
                    :color="individual.item.networks_active===1 ? 'orange' : 'secondary'"
                    :value="individual.item.networks_active===1 || individual.item.capabilies_active===1"
                  >
                    <template v-slot:badge>
                      <v-icon
                        v-if="individual.item.networks_active===1"
                        dark
                      >
                        mdi-star
                      </v-icon>
                      <v-icon
                        v-else-if="individual.item.capabilies_active===1"
                      >
                        mdi-hard-hat
                      </v-icon>
                    </template>
                    <span>
                      <v-icon
                        v-if="individual.item.active"
                        color="success"
                        size="30"
                      >
                        mdi-shield-account
                      </v-icon>
                      <v-icon
                        v-else
                        color="error"
                        size="30"
                      >
                        mdi-shield-account
                      </v-icon>
                    </span>
                  </v-badge>
                </span>
              </template>
              <span v-if="individual.item.active">Active</span>
              <span v-else>Not Active</span>
            </v-tooltip>
          </td>
          <td class="d-none d-sm-table-cell">
            {{ individual.item.email }}
          </td>
          <td>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <a
                  :href="`tel:${individual.item.mobile_number}`"
                  class="click-to-call"
                  v-on="on"
                >
                  {{ individual.item.mobile_number }}
                </a>
              </template>
              <span>Click to call</span>
            </v-tooltip>
          </td>

          <td v-if="single">
            <v-speed-dial
              v-model="fab[individual.item.id]"
              direction="left"
            >
              <template v-slot:activator>
                <v-btn
                  v-model="fab[individual.item.id]"
                  fab
                  x-small
                  color="primary"
                >
                  <v-icon v-if="fab[individual.item.id]">
                    mdi-close
                  </v-icon>
                  <v-icon v-else>
                    mdi-chevron-left
                  </v-icon>
                </v-btn>
              </template>
              <v-btn
                fab
                x-small
                color="primary"
                :to="`/individuals/${individual.item.id}`"
              >
                <v-icon>mdi-eye</v-icon>
              </v-btn>
              <v-btn
                fab
                x-small
                color="error"
                @click="deleteMsg = true, userToDelete = individual.item"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-speed-dial>
          </td>
        </tr>
      </template>
    </v-data-table>
    <table-footer
      :options="options"
      :total="total"
    />

    <v-dialog
      v-model="deleteMsg"
      persistent
      max-width="600"
    >
      <v-card>
        <v-card-title class="text-h5">
          <!-- {{ userToDelete }} -->
          You are about to delete or unlink an individual
        </v-card-title>
        <v-card-text>
          Please confirm that you would like to delete or unlink the following individual: <b>{{ userToDelete.name }}</b>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="warning"
            text
            @click="removeLink(userToDelete.id)"
          >
            Remove Link
          </v-btn>
          <v-btn
            color="error"
            text
            @click="deleteUser(userToDelete.id)"
          >
            Delete User
          </v-btn>
          <v-btn
            color="primary"
            text
            @click="deleteMsg = false"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import axios from 'axios'
  import { mapActions, mapState } from 'vuex'
  import { fetchInitials } from '@/mixins/fetchInitials'
  import { MIXINS, userStaticSearch } from '@/shared/constants'
  import { isInternal } from '@/shared/management'

  export default {
    components: {
      Operations: () => import('../components/tableOptions/individual/Operations'),
      TableFooter: () => import('../components/TableFooter'),
    },

    mixins: [
      fetchInitials([
        MIXINS.companies,
      ]),
    ],

    props: {
      companyId: {
        type: String,
        default: '',
      },

      single: {
        type: Boolean,
        default: false,
      },
    },

    data: () => ({
      showTable: true,
      individuals: [],
      loading: 0,
      options: {},
      total: 0,
      isInternal,
      userStaticSearch,
      fab: {},
      deleteMsg: false,
      headers: [
        {
          text: 'Name',
          value: 'name',
        },
        {
          text: 'Company',
          value: 'company',
        },
        {
          text: 'Status',
          value: 'status',
          sortable: false,
        },
        {
          text: 'Email',
          value: 'email',
        },
        {
          text: 'Mobile Number',
          value: 'mobile_number',
        },
      ],
      userToDelete: {
        id: -1,
        name: '',
      },
      search: '',
    }),

    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),
      computedHeaders () {
        const headers = this.single ? [...this.headers, { text: 'Actions', value: 'actions' }] : this.headers
        return headers
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
          let apiurl = `users?page=${page}&per_page=${itemsPerPage}`
          if (search && typeof search === 'string') {
            this.search = search
            apiurl += `&query=${search.replace('&', '%26')}`
          } else if (sortBy[0]) {
            const direction = sortDesc[0] ? 'desc' : 'asc'
            apiurl += `&direction=${direction}&sortBy=${sortBy[0]}`
          }

          const res = await axios.post(apiurl, {
            staticSearch: { ...this.userStaticSearch, companies: this.companyId ? [this.companyId] : [] },
          })
          this.individuals = res.data.data
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
          this.staticSearch = { ...this.userStaticSearch, ...reload }
        }
        this.getDataFromApi(reload)
      },

      getCompanyNameFromId (companyId) {
        return (this.mixinItems.companies.find(company =>
          company.id === companyId,
        ) || {}).name || ''
      },

      removeLink (id) {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        axios.get('companies/' + id + '/unlinkUsers')
          .then(res => {
            this.deleteMsg = false
            this.showSnackBar({ text: res.data.message, color: 'success' })
            this.getDataFromApi()
          })
      },
      deleteUser (id) {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        axios.delete('users/' + id + '/destroy')
          .then(res => {
            this.deleteMsg = false
            this.showSnackBar({ text: res.data.message, color: 'success' })
            this.getDataFromApi()
          })
      },
    },
  }
</script>

<style lang="sass" scoped>
  .click-to-call
    text-decoration: none
</style>
