<template>
  <v-container
    fluid
    tag="section"
  >
    <base-material-card
      color="primary"
      icon="mdi-account-tie"
      inline
    >
      <template v-slot:after-heading>
        <div class="text-h3">
          Account Managers
        </div>
      </template>

      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            clearable
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
          class="d-flex justify-space-around align-center"
        >
          <v-tooltip
            bottom
          >
            <template v-slot:activator="{ on }">
              <v-btn
                icon
                text
                color="warning"
                small
                @click="dlg = true"
                v-on="on"
              >
                <v-icon size="28">
                  mdi-plus-circle-outline
                </v-icon>
              </v-btn>
            </template>
            <span>Assign Account Manager</span>
          </v-tooltip>
        </v-col>
      </v-row>

      <v-progress-linear
        v-if="loadingAccounts"
        indeterminate
      />

      <v-data-table
        :headers="headers"
        :items="accountManagers"
        :options.sync="options"
        :hide-default-footer="true"
        class="mt-5"
      >
        <template v-slot:body="{ items }">
          <tbody>
            <tr
              v-for="(item, i) in items"
              :key="i"
            >
              <td>
                <router-link
                  class="table-link"
                  :to="'/individuals/' + item.user_id"
                >
                  {{ item.account_name | truncate(42) }}
                </router-link>
              </td>
              <td>
                <router-link
                  class="table-link"
                  :to="'/companies/' + item.company_id"
                >
                  {{ item.company_name | truncate(42) }}
                </router-link>
              </td>
              <td>
                {{ item.region_codes[0] }}
              </td>
              <td>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <span
                      dark
                      v-on="on"
                    >
                      <flag
                        :iso="item.country_codes[0]"
                        :squared="false"
                      />
                    </span>
                  </template>
                  <span>{{ getCountryFromCode(item.country_codes[0]) }}</span>
                </v-tooltip>
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
                    v-for="(action, j) in actions"
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
        :options="options"
        :total="total"
      />
    </base-material-card>

    <v-dialog
      v-model="dlg"
      persistent
      max-width="600"
    >
      <v-form
        ref="moveForm"
        lazy-validation
        @submit.prevent="assignAccountManager"
      >
        <v-card class="text-center">
          <v-card-title class="pt-5">
            Assign Account Manager

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
              v-model="chosen.user_id"
              prepend-icon="mdi-account"
              label="Internal User"
              clearable
              :items="mixinItems.internalUsers"
              :loading="loadingMixins.internalUsers"
              item-value="id"
              item-text="username"
            />
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
              v-model="chosen.region_codes"
              prepend-icon="mdi-wan"
              label="Region"
              clearable
              multiple
              :items="mixinItems.regions"
              :loading="loadingMixins.regions"
              item-value="id"
              item-text="region"
            />
            <v-autocomplete
              v-model="chosen.country_codes"
              prepend-icon="mdi-flag"
              label="Country"
              clearable
              multiple
              :items="mixinItems.countries"
              :loading="loadingMixins.countries"
              item-value="id"
              item-text="name"
            />
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="success"
              type="submit"
            >
              Add
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
  </v-container>
</template>

<script>
  import axios from 'axios'
  import { mapActions, mapState } from 'vuex'
  import { fetchInitials } from '@/mixins/fetchInitials'
  import { MIXINS } from '@/shared/constants'
  import { isInternal } from '@/shared/management'

  export default {
    components: {
      TableFooter: () => import('../../components/TableFooter'),
    },

    mixins: [
      fetchInitials([
        MIXINS.internalUsers,
        MIXINS.countries,
        MIXINS.companies,
        MIXINS.regions,
      ]),
    ],

    data: () => ({
      search: '',
      searchTimeout: null,
      loadingAccounts: false,
      headers: [
        { text: 'Name', value: 'account_name' },
        { text: 'Company', value: 'company_name' },
        { text: 'Region', value: 'region_codes' },
        { text: 'Country', value: 'country_codes' },
        { text: 'Action', value: 'action', sortable: false },
      ],
      options: {},
      accountManagers: [],
      total: 0,
      fab: {},
      acting: false,
      index: -1,
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
          icon: 'mdi-pencil',
          what: 'edit',
          tooltip: 'Edit',
        },
      ],
      dlg: false,
      chosen: {},
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
    },

    methods: {
      ...mapActions({
        showSnackBar: 'showSnackBar',
      }),

      async getDataFromApi () {
        this.loadingAccounts = true
        try {
          const { sortBy, sortDesc, page, itemsPerPage } = this.options
          let apiurl = `account-manager?page=${page}&per_page=${itemsPerPage}`
          if (this.search) {
            apiurl += `&query=${this.search.replace('&', '%26')}`
          } else if (sortBy[0] && sortBy[0].length > 0) {
            const direction = sortDesc[0] ? 'desc' : 'asc'
            apiurl += `&direction=${direction}&sortBy=${sortBy[0]}`
          }

          const response = await axios.get(apiurl)
          this.accountManagers = response.data.data
          this.total = response.data.meta ? response.data.meta.total : response.data.total
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.loadingAccounts = false
      },

      assignAccountManager () {},

      trigger (action, accountManager) {
        this.chosen = accountManager
        if (action === 'edit') {
          if (!isInternal(this.role.id)) {
            this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
            return
          }
          this.dlg = true
        } else if (action === 'view') {
          this.$router.push('/individuals/' + accountManager.user_id)
        } else {
          if (!isInternal(this.role.id)) {
            this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
            return
          }
          this.deleteUser(accountManager)
        }
      },

      async deleteUser (accountManager) {
        const permitted = await this.$confirm(`You are going to delete <b>${accountManager.account_name}</b>.`, { title: 'Warning' })
        if (permitted) {
          // Delete User
        }
      },

      stopAll () {
        this.dlg = false
        this.chosen = {}
      },

      getCountryFromCode (code) {
        return (this.mixinItems.countries.find(v => v.id === code) || {}).name
      },
    },
  }
</script>
