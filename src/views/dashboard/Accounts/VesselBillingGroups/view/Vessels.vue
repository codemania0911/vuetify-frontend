<template>
  <base-material-card
    color="primary"
    title="Vessels"
  >
    <v-row
      align="end"
      class="mb-10"
      no-gutters
    >
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        class="ml-auto"
        label="Search"
        hide-details
        clearable
        style="max-width: 200px;"
      />
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn
            icon
            small
            text
            color="warning"
            class="mx-2"
            v-on="on"
            @click="dlg = true"
          >
            <v-icon size="28">
              mdi-plus-circle-outline
            </v-icon>
          </v-btn>
        </template>
        <span>Assign</span>
      </v-tooltip>
    </v-row>

    <v-progress-linear
      v-if="loadingVessels"
      indeterminate
    />

    <v-data-table
      :headers="headers"
      :items="vessels"
      :options.sync="options"
      :hide-default-footer="true"
      class="mt-5"
    >
      <template v-slot:item="vessel">
        <tr>
          <td>
            <router-link
              class="table-link"
              :to="'/vessels/' + vessel.item.id"
            >
              {{ vessel.item.name }}
            </router-link>
          </td>
          <td>
            {{ vessel.item.imo }}
          </td>
          <td>
            {{ vessel.item.official_number }}
          </td>
          <td>
            <v-speed-dial
              v-model="fab[vessel.item.id]"
              direction="left"
            >
              <template v-slot:activator>
                <v-btn
                  v-model="fab[vessel.item.id]"
                  fab
                  small
                  color="primary"
                  :loading="acting && index === vessel.item.id"
                >
                  <v-icon v-if="fab[vessel.item.id]">
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
                    @click="trigger(action.what, vessel.item); index = vessel.item.id"
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
      </template>
    </v-data-table>

    <table-footer
      v-if="options.itemsPerPage > 0"
      :options="options"
      :total="total"
      :company="true"
    />

    <v-dialog
      v-model="dlg"
      persistent
      max-width="600"
    >
      <v-form
        ref="addForm"
        lazy-validation
        @submit.prevent="updateVessel('add')"
      >
        <v-card class="text-center">
          <v-card-title class="pt-5">
            Assign Vessel

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
              v-model="vesselId"
              prepend-icon="mdi-ferry"
              label="Vessel"
              clearable
              :loading="loadingMixins.vessels"
              :items="mixinItems.vessels"
              item-value="id"
              item-text="name"
              :rules="[rules.required]"
            />
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="success"
              type="submit"
              :loading="adding"
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
  </base-material-card>
</template>

<script>
  import axios from 'axios'
  import { mapActions, mapState } from 'vuex'
  import { fetchInitials } from '@/mixins/fetchInitials'
  import { MIXINS } from '@/shared/constants'
  import { isInternal } from '@/shared/management'

  export default {
    components: {
      TableFooter: () => import('../../../components/TableFooter'),
    },
    mixins: [
      fetchInitials([
        MIXINS.vessels,
      ]),
    ],
    data: () => ({
      rules: {
        required: value => !!value || 'This field is required.',
      },
      search: '',
      searchTimeout: null,
      options: {},
      loadingVessels: false,
      total: 0,
      vessels: [],
      vesselId: null,
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
          text: 'Action',
          value: 'action',
          sortable: false,
        },
      ],
      fab: {},
      acting: false,
      index: -1,
      adding: false,
      dlg: false,
      chosen: {},
      actions: [
        {
          color: 'primary',
          icon: 'mdi-eye',
          what: 'view',
          tooltip: 'View',
        },
        {
          color: 'warning',
          icon: 'mdi-delete',
          what: 'remove',
          tooltip: 'remove',
        },
      ],
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
        this.loadingVessels = true
        try {
          const { sortBy, sortDesc, page, itemsPerPage } = this.options
          let apiurl = `vessel-billing-group/vessels/${this.$route.params.id}?page=${page}&per_page=${itemsPerPage}`
          if (this.search) {
            apiurl += `&query=${this.search.replace('&', '%26')}`
          } else if (sortBy[0]) {
            const direction = sortDesc[0] ? 'desc' : 'asc'
            apiurl += `&direction=${direction}&sortBy=${sortBy[0]}`
          }

          const res = await axios.post(apiurl)
          this.vessels = res.data.data
          this.total = res.data.total
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.loadingVessels = false
      },

      trigger (action, vessel) {
        this.chosen = vessel
        if (action === 'view') {
          this.$router.push('/vessels/' + vessel.id)
        } else {
          this.updateVessel(action)
        }
      },

      async updateVessel (action) {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }

        const request = {}
        let valid = true
        let vesselId = null
        if (action === 'remove') {
          this.acting = true
          vesselId = this.chosen.id
          const permitted = await this.$confirm('This action removes the vessel from this billing group.  Proceed?', { title: 'Warning' })
          if (!permitted) return
        } else {
          valid = this.$refs.addForm.validate()
          request.vessel_billing_group_id = this.$route.params.id
          vesselId = this.vesselId
          this.adding = true
        }

        if (valid) {
          try {
            const response = await axios.post('vessels/' + vesselId + '/updateVesselFromGroup', request)
            this.showSnackBar({ text: response.data.message, color: 'success' })
            this.getDataFromApi()
          } catch (error) {
            this.showSnackBar({ text: error, color: 'error' })
          }
          this.stopAll()
        }
      },

      stopAll () {
        this.dlg = false
        this.acting = false
        this.adding = false
        this.vesselId = null
      },
    },
  }
</script>
