<template>
  <v-container
    fluid
    tag="section"
  >
    <base-material-card
      color="primary"
      icon="mdi-source-repository-multiple"
      inline
    >
      <template v-slot:after-heading>
        <div class="text-h3">
          Vessel Class
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
                @click="addVesselClassDlg = true"
              >
                <v-icon size="28">
                  mdi-plus-circle-outline
                </v-icon>
              </v-btn>
            </template>
            <span>Add Vessel Class</span>
          </v-tooltip>
        </v-col>
      </v-row>

      <v-data-table
        :headers="headers"
        :items="classes"
        :options.sync="options"
        :loading="loadingVesselClass"
        :hide-default-footer="true"
      >
        <template v-slot:item="vesselClass">
          <tr>
            <td>
              <router-link
                class="table-link"
                :to="'/vessel-class/' + vesselClass.item.id"
              >
                {{ vesselClass.item.name }}
              </router-link>
            </td>
            <td>
              <router-link
                class="table-link"
                :to="'/companies/' + vesselClass.item.company_id"
              >
                {{ vesselClass.item.company_name }}
              </router-link>
            </td>
            <td>
              <span>{{ vesselClass.item.vessel_count }}</span>
            </td>
            <td>
              <v-speed-dial
                v-model="fab[vesselClass.item.id]"
                direction="left"
              >
                <template v-slot:activator>
                  <v-btn
                    v-model="fab[vesselClass.item.id]"
                    fab
                    x-small
                    color="primary"
                  >
                    <v-icon>
                      {{ fab[vesselClass.item.id] ? 'mdi-close' : 'mdi-chevron-left' }}
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
                        @click="deleteVesselClass(vesselClass.item.id)"
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
                        :to="'/vessel-class/' + vesselClass.item.id"
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
      v-model="addVesselClassDlg"
      max-width="600"
    >
      <v-form
        ref="vesselClassForm"
        lazy-validation
        @submit.prevent="addNewVesselClass"
      >
        <v-card class="px-5 py-3">
          <v-card-title class="text-h5">
            Add New Vessel Class
          </v-card-title>
          <v-text-field
            v-model="newVesselClass.name"
            label="Vessel Class Name *"
            prepend-icon="mdi-rename-box"
            :rules="[rules.required]"
          />

          <v-autocomplete
            v-model="newVesselClass.company_id"
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
      TableFooter: () => import('../components/TableFooter'),
    },

    mixins: [
      fetchInitials([
        MIXINS.companies,
      ]),
    ],

    data: () => ({
      headers: [
        { text: 'Class Name', value: 'name' },
        { text: 'Company', value: 'company_name' },
        { text: 'Vessels', value: 'vessel_count' },
        { text: 'Actions', value: '', sortable: false },
      ],
      search: '',
      timeout: null,
      classes: [],
      options: {},
      total: 0,
      loadingVesselClass: false,
      fab: {},
      addVesselClassDlg: false,
      newVesselClass: {},
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
        this.loadingVesselClass = true
        try {
          const { sortBy, sortDesc, page, itemsPerPage } = this.options
          let apiurl = `vessel-class-data?page=${page}&per_page=${itemsPerPage}`
          if (this.search) {
            apiurl += `&query=${this.search.replace('&', '%26')}`
          }
          if (sortBy[0]) {
            const direction = sortDesc[0] ? 'desc' : 'asc'
            apiurl += `&direction=${direction}&sortBy=${sortBy[0]}`
          }
          const response = await axios.post(apiurl)
          this.classes = response.data.data
          this.total = response.data.meta.total
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.loadingVesselClass = false
      },

      async deleteVesselClass (id) {
        const confirm = await this.$confirm('Are you sure you want to delete this vessel class?', {
          title: 'Warning',
        })
        if (confirm) {
          try {
            const response = await axios.delete('vessel-class/' + id)
            this.showSnackBar({ text: response.data.message, color: 'success' })
            this.getDataFromApi()
          } catch (error) {
            this.showSnackBar({ text: error, color: 'error' })
          }
        }
      },

      async addNewVesselClass () {
        if (this.$refs.vesselClassForm.validate()) {
          this.adding = true
          try {
            const response = await axios.post('vessel-class', this.newVesselClass)
            this.showSnackBar({ text: response.data.message, color: 'success' })
            this.addVesselClassDlg = false
            this.$refs.vesselClassForm.reset()
            this.getDataFromApi()
          } catch (error) {
            this.showSnackBar({ text: error, color: 'error' })
          }
          this.adding = false
        }
      },
    },
  }
</script>
