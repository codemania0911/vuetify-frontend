<template>
  <base-material-card
    color="primary"
  >
    <template v-slot:heading>
      <div class="text-h4 font-weight-light">
        {{ vesselClass.name }} Vessels
      </div>
      <div class="text-subtitle-1">
        {{ vesselClass.company_name }}
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
          hide-details
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
              @click="assignVesselDlg = true"
            >
              <v-icon size="28">
                mdi-plus-circle-outline
              </v-icon>
            </v-btn>
          </template>
          <span>Assign Vessel</span>
        </v-tooltip>
      </v-col>
    </v-row>

    <v-data-table
      :headers="headers"
      :items="vessels"
      :options.sync="options"
      :loading="loading"
      hide-default-footer
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
            <span>{{ vessel.item.imo }}</span>
          </td>
          <td>
            <span>{{ vessel.item.official_number }}</span>
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
                >
                  <v-icon>
                    {{ fab[vessel.item.id] ? 'mdi-close' : 'mdi-chevron-left' }}
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
                      @click="removeVessel(vessel.item.id)"
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
                      :to="'/vessels/' + vessel.item.id"
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

    <v-dialog
      v-model="assignVesselDlg"
      max-width="600"
    >
      <v-form
        ref="assignForm"
        lazy-validation
        @submit.prevent="assignVessel"
      >
        <v-card class="px-5 py-3">
          <v-card-title class="text-h5">
            Assign Vessel
          </v-card-title>
          <v-autocomplete
            v-model="vesselId"
            :items="classVessels"
            item-text="name"
            item-value="id"
            clearable
            :loading="loadingClassVessels"
            prepend-icon="mdi-ferry"
            :label="`Select from ${vesselClass.company_name}`"
          />

          <v-card-actions class="justify-end">
            <v-btn
              color="success"
              type="submit"
              :loading="assigning"
            >
              <v-icon left>
                mdi-content-save
              </v-icon>
              Assign
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </base-material-card>
</template>

<script>
  import { mapActions, mapState } from 'vuex'
  import axios from 'axios'
  import { isInternal } from '@/shared/management'

  export default {
    components: {
      TableFooter: () => import('../../components/TableFooter'),
    },

    data: () => ({
      headers: [
        { text: 'Vessel Name', value: 'name' },
        { text: 'IMO', value: 'imo' },
        { text: 'Official #', value: 'official_number' },
        { text: 'Actions', value: '', sortable: false },
      ],
      vessels: [],
      options: {},
      total: 0,
      loading: false,
      fab: {},
      vesselClass: {},
      assignVesselDlg: false,
      vesselId: 0,
      assigning: false,
      search: '',
      timeout: null,
      loadingClassVessels: false,
      classVessels: [],
    }),

    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),
    },

    watch: {
      search () {
        if (this.timeout) {
          clearTimeout(this.timeout)
        }
        this.timeout = setTimeout(() => {
          this.options.page = 1
          this.getDataFromApi()
        }, 500)
      },
      options: {
        handler () {
          this.getDataFromApi()
        },
        deep: true,
      },
    },

    mounted () {
      this.getVesselClassVessels()
    },

    methods: {
      ...mapActions({
        showSnackBar: 'showSnackBar',
      }),

      async getDataFromApi () {
        this.loading = true
        try {
          const { sortBy, sortDesc, page, itemsPerPage } = this.options
          let apiurl = `vessel-class/vessel/${this.$route.params.id}?page=${page}&per_page=${itemsPerPage}`
          if (this.search) {
            apiurl += `&query=${this.search.replace('&', '%26')}`
          }
          if (sortBy[0]) {
            const direction = sortDesc[0] ? 'desc' : 'asc'
            apiurl += `&direction=${direction}&sortBy=${sortBy[0]}`
          }
          const response = await axios.get(apiurl)
          this.vesselClass = response.data.vessel_class[0]
          this.vessels = response.data.vessels.data
          this.total = response.data.vessels.total
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.loading = false
      },

      async getVesselClassVessels () {
        this.loadingClassVessels = true
        try {
          const response = await axios.get('vessel-class/' + this.$route.params.id + '/getVesselsOfVesselClassCompany')
          this.classVessels = response.data
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.loadingClassVessels = false
      },

      async assignVessel () {
        this.assigning = true
        try {
          const response = await axios.post('vessels/update-vessel-class/' + this.vesselId, { vessel_class_id: this.$route.params.id })
          this.showSnackBar({ text: response.data.message, color: 'success' })
          this.getDataFromApi()
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.assigning = false
        this.assignVesselDlg = false
      },

      async removeVessel (id) {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        try {
          const response = await axios.post('vessels/update-vessel-class/' + id)
          this.showSnackBar({ text: response.data.message, color: 'success' })
          this.getDataFromApi()
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
      },
    },
  }
</script>
