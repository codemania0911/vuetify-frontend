<template>
  <v-container
    fluid
    tag="section"
  >
    <base-material-card
      color="primary"
      icon="mdi-pin"
      inline
    >
      <template v-slot:after-heading>
        <div class="text-h3">
          Pin Drops
        </div>
      </template>

      <v-row
        align="end"
        no-gutters
      >
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          class="ml-auto mr-3"
          label="Search"
          hide-details
          single-line
          clearable
          style="max-width: 160px;"
        />
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              text
              color="warning"
              small
              class="mr-3"
              v-on="on"
              @click="addPositionDlg = true"
            >
              <v-icon size="28">
                mdi-plus-circle-outline
              </v-icon>
            </v-btn>
          </template>
          <span>Add Position</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              text
              color="success"
              small
              class="mr-3"
              :loading="downloadingKML"
              v-on="on"
              @click="exportToKML"
            >
              <v-icon size="28">
                mdi-download-circle
              </v-icon>
            </v-btn>
          </template>
          <span>Download to KML</span>
        </v-tooltip>
      </v-row>

      <v-progress-linear
        v-if="loading"
        indeterminate
      />

      <v-data-table
        :headers="headers"
        :items="positions"
        :options.sync="options"
        hide-default-footer
        class="mt-5"
      >
        <template v-slot:body="{ items }">
          <tbody>
            <tr
              v-for="(position, i) in items"
              :key="i"
            >
              <td>{{ position.name }}</td>
              <td>{{ position.latitude }}</td>
              <td>{{ position.longitude }}</td>
              <td>{{ moment(position.occured_time) ? moment(position.occured_time).format('YYYY-MM-DD') : '' }}</td>
              <td>
                <v-icon :color="position.color">
                  {{ position.icon }}
                </v-icon>
              </td>
              <td>
                <v-speed-dial
                  v-model="fab[i]"
                  direction="left"
                >
                  <template v-slot:activator>
                    <v-btn
                      v-model="fab[i]"
                      class="mb-0"
                      color="primary"
                      fab
                      x-small
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
                    bottom
                  >
                    <template v-slot:activator="{ on }">
                      <v-btn
                        :color="action.color"
                        fab
                        x-small
                        v-on="on"
                        @click="trigger(action.what, position)"
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
      v-model="addPositionDlg"
      max-width="600"
    >
      <v-form
        ref="addPositionForm"
        lazy-validation
        @submit.prevent="addPosition"
      >
        <v-card class="px-5 py-3">
          <v-card-title class="text-h5">
            Update Position
          </v-card-title>
          <v-text-field
            v-model="position.name"
            label="Placemark Name *"
            clearable
            prepend-icon="mdi-rename-box"
            :rules="[rules.required]"
          />

          <v-text-field
            v-model="position.latitude"
            label="Latitude *"
            clearable
            prepend-icon="mdi-latitude"
            :rules="[rules.required]"
          />

          <v-text-field
            v-model="position.longitude"
            label="Longitude *"
            clearable
            prepend-icon="mdi-longitude"
            :rules="[rules.required]"
          />

          <v-menu
            v-model="datepicker"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="position.occured_time"
                label="Date and Time"
                prepend-icon="mdi-calendar"
                readonly
                :rules="[rules.required]"
                v-bind="attrs"
                v-on="on"
              />
            </template>
            <v-date-picker
              v-model="position.occured_time"
              no-title
              @input="datepicker = false"
            />
          </v-menu>

          <v-radio-group
            v-model="position.icon"
            row
            :rules="[rules.required]"
          >
            <v-radio
              v-for="(icon, i) in icons"
              :key="i"
              :value="icon"
            >
              <template v-slot:label>
                <v-icon>{{ icon }}</v-icon>
              </template>
            </v-radio>
          </v-radio-group>

          <v-color-picker
            v-model="position.color"
            hide-inputs
            dot-size="30"
          />

          <v-card-actions class="justify-end">
            <v-btn
              color="success"
              type="submit"
              :loading="adding"
            >
              Submit
            </v-btn>
            <v-btn
              color="error"
              @click="addPositionDlg = false"
            >
              Cancel
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
  import moment from 'moment'
  import download from 'downloadjs'
  import { icons } from '@/shared/constants'
  import { isInternal } from '@/shared/management'

  export default {
    name: 'PinDrops',

    components: {
      TableFooter: () => import('../components/TableFooter'),
    },

    data: () => ({
      rules: {
        required: value => !!value || 'This field is required.',
      },
      icons,
      moment,
      search: '',
      loading: false,
      options: {},
      headers: [
        {
          text: 'Casualty Name', value: 'name',
        },
        {
          text: 'Latitude', value: 'latitude',
        },
        {
          text: 'Longitude', value: 'longitude',
        },
        {
          text: 'Timestamp', value: 'occured_time',
        },
        {
          text: 'Icon', value: 'icon',
        },
        {
          text: 'Action', value: 'action', sortable: false,
        },
      ],
      actions: [
        {
          color: 'primary',
          icon: 'mdi-map-marker',
          what: 'view',
          tooltip: 'View on Map',
        },
        {
          color: 'warning',
          icon: 'mdi-update',
          what: 'update',
          tooltip: 'Update',
        },
        {
          color: 'error',
          icon: 'mdi-delete',
          what: 'delete',
          tooltip: 'Delete',
        },
      ],
      positions: [],
      fab: {},
      total: 0,
      addPositionDlg: false,
      position: {},
      adding: false,
      datepicker: false,
      deleting: false,
      toUpdate: false,
      downloadingKML: false,
    }),

    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),
    },

    watch: {
      options: {
        handler: function (value) {
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
        this.loading = true
        try {
          const { sortBy, sortDesc, page, itemsPerPage } = this.options
          let apiurl = `place-mark?page=${page}&per_page=${itemsPerPage}`
          if (this.search) {
            apiurl += `&query=${this.search.replace('&', '%26')}`
          } else if (sortBy[0]) {
            const direction = sortDesc[0] ? 'desc' : 'asc'
            apiurl += `&direction=${direction}&sortBy=${sortBy[0]}`
          }

          const positions = await axios.get(apiurl)
          this.positions = positions.data.data
          this.total = positions.data.total
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.loading = false
      },

      async trigger (action, position) {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        switch (action) {
          case 'view':
            this.$router.push({ path: 'map', query: { lat: position.latitude, lng: position.longitude } })
            break
          case 'update':
            this.position = Object.assign({}, position)
            this.toUpdate = true
            this.addPositionDlg = true
            break
          case 'delete': {
            const permitted = await this.$confirm('Are you sure to delete this position?', { title: 'Warning' })
            if (permitted) {
              await this.deletePosition(position.id)
              this.getDataFromApi()
            }
            break
          }
          default:
            break
        }
      },

      async addPosition () {
        this.adding = true
        try {
          if (this.$refs.addPositionForm.validate()) {
            if (typeof this.position.color !== 'string') {
              this.position.color = this.position.color.hex
            }

            let response
            if (this.toUpdate) {
              response = await axios.put('place-mark/' + this.position.id, this.position)
            } else {
              response = await axios.post('place-mark', this.position)
            }
            this.showSnackBar({ text: response.data.message, color: response.data.success ? 'success' : 'error' })
            this.getDataFromApi()
            this.$refs.addPositionForm.reset()
          }
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.addPositionDlg = false
        this.adding = false
        this.position = {}
        this.toUpdate = false
      },

      async deletePosition (id) {
        this.deleting = true
        try {
          const response = await axios.delete('place-mark/' + id)
          this.showSnackBar({ text: response.data.message, color: response.data.success ? 'success' : 'error' })
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.deleting = false
      },

      async exportToKML () {
        this.downloadingKML = true
        try {
          const response = await axios.get('map/export/place-mark')
          download(response.data, 'Place_Marks.kml')
          this.showSnackBar({ text: 'Download Started.', color: 'success' })
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.downloadingKML = false
      },
    },
  }
</script>
