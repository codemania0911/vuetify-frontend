<template>
  <v-container
    fluid
    tag="section"
  >
    <base-material-card
      color="primary"
      icon="mdi-group"
      inline
    >
      <template v-slot:after-heading>
        <div class="text-h3">
          Vessel Billing Groups
        </div>
      </template>

      <v-row class="justify-end">
        <v-col
          cols="12"
          sm="4"
          class="d-flex align-center"
        >
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            clearable
          />
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn
                class="ml-2 mt-4"
                icon
                text
                color="warning"
                small
                v-on="on"
                @click="addVesselBillingGroupDlg = true"
              >
                <v-icon size="28">
                  mdi-plus-circle-outline
                </v-icon>
              </v-btn>
            </template>
            <span>Add Vessel Billing Group</span>
          </v-tooltip>
        </v-col>
      </v-row>

      <v-data-table
        :headers="headers"
        :items="groups"
        :options.sync="options"
        :loading="loadingGroups"
        :hide-default-footer="true"
      >
        <template v-slot:item="group">
          <tr>
            <td>
              <router-link
                class="table-link"
                :to="'/vessel-billing-groups/' + group.item.id"
              >
                {{ group.item.name }}
              </router-link>
            </td>
            <td>
              <router-link
                class="table-link"
                :to="'/companies/' + group.item.company_id"
              >
                {{ group.item.company_name }}
              </router-link>
            </td>
            <td>
              {{ group.item.vessel_count }}
            </td>
            <td>
              <v-speed-dial
                v-model="fab[group.item.id]"
                direction="left"
              >
                <template v-slot:activator>
                  <v-btn
                    v-model="fab[group.item.id]"
                    fab
                    small
                    color="primary"
                  >
                    <v-icon>
                      {{ fab[group.item.id] ? 'mdi-close' : 'mdi-chevron-left' }}
                    </v-icon>
                  </v-btn>
                </template>

                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <span v-on="on">
                      <v-btn
                        fab
                        x-small
                        color="error"
                        @click="deleteVesselGroup(group.item.id)"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </span>
                  </template>
                  <span>Remove</span>
                </v-tooltip>

                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <span v-on="on">
                      <router-link
                        class="table-link"
                        :to="'/vessel-billing-groups/' + group.item.id"
                      >
                        <v-btn
                          fab
                          x-small
                          color="success"
                        >
                          <v-icon>mdi-eye-check</v-icon>
                        </v-btn>
                      </router-link>
                    </span>
                  </template>
                  <span>View</span>
                </v-tooltip>
              </v-speed-dial>
            </td>
          </tr>
        </template>
      </v-data-table>

      <table-footer
        :options="options"
        :total="total"
      />
    </base-material-card>
    <v-dialog
      v-model="addVesselBillingGroupDlg"
      max-width="600"
    >
      <v-form
        ref="vesselBillingGroupForm"
        lazy-validation
        @submit.prevent="addNewVesselBillingGroup"
      >
        <v-card class="px-5 py-3">
          <v-card-title class="text-h5">
            Add New Vessel Billing Group
          </v-card-title>
          <v-text-field
            v-model="newVesselBillingGroup.name"
            label="Vessel Billing Group Name *"
            prepend-icon="mdi-rename-box"
            :rules="[rules.required]"
          />

          <v-autocomplete
            v-model="newVesselBillingGroup.company_id"
            :items="mixinItems.companies"
            :loading="loadingMixins.companies"
            item-text="name"
            item-value="id"
            clearable
            :rules="[rules.required]"
            prepend-icon="mdi-domain"
            label="Company * (Plan Holder)"
          />

          <v-card-actions class="justify-end">
            <v-btn
              color="success"
              type="submit"
              :loading="adding"
            >
              <v-icon left>
                mdi-content-save
              </v-icon>
              Add
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </v-container>
</template>

<script>
  import axios from 'axios'
  import { mapActions } from 'vuex'
  import { fetchInitials } from '@/mixins/fetchInitials'
  import { MIXINS } from '@/shared/constants'

  export default {
    components: {
      TableFooter: () => import('../../components/TableFooter'),
    },

    mixins: [
      fetchInitials([
        MIXINS.companies,
      ]),
    ],

    data: () => ({
      headers: [
        { text: 'Group Name', value: 'name' },
        { text: 'Company', value: 'company_name' },
        { text: 'Vessels', value: 'vessel_count' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      search: '',
      timeout: null,
      options: {},
      total: 0,
      groups: [],
      loadingGroups: false,
      fab: {},
      addVesselBillingGroupDlg: false,
      newVesselBillingGroup: {},
      rules: {
        required: value => !!value || 'This field is required.',
      },
      adding: false,
    }),

    watch: {
      options: {
        handler () {
          this.getDataFromApi()
        },
        deep: true,
      },
      search () {
        if (this.timeout) {
          clearTimeout(this.timeout)
        }
        this.timeout = setTimeout(() => {
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
        this.loadingGroups = true
        try {
          const { sortBy, sortDesc, page, itemsPerPage } = this.options
          let apiurl = `vessel-billing-group?page=${page}&per_page=${itemsPerPage}`
          if (this.search) {
            apiurl += `&query=${this.search.replace('&', '%26')}`
          } else if (sortBy[0]) {
            const direction = sortDesc[0] ? 'desc' : 'asc'
            apiurl += `&direction=${direction}&sortBy=${sortBy[0]}`
          }

          const response = await axios.post(apiurl)
          this.groups = response.data.data
          this.total = response.data.total
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.loadingGroups = false
      },

      async addNewVesselBillingGroup () {
        if (this.$refs.vesselBillingGroupForm.validate()) {
          this.adding = true
          try {
            const response = await axios.post('vessel-billing-group/add', this.newVesselBillingGroup)
            this.showSnackBar({ text: response.data.message, color: 'success' })
            this.addVesselBillingGroupDlg = false
            this.$refs.vesselBillingGroupForm.reset()
            this.getDataFromApi()
          } catch (error) {
            this.showSnackBar({ text: error, color: 'error' })
          }
          this.adding = false
        }
      },

      deleteVesselGroup (id) {},
    },
  }
</script>
