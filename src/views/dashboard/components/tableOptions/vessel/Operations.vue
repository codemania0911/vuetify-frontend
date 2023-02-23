<template>
  <div>
    <input
      ref="file"
      type="file"
      class="d-none"
      @change="uploadVesselCsv"
    >

    <v-row class="mt-3 mb-7">
      <v-col
        cols="12"
        md="6"
      >
        <search-field
          :disabled="!isViewMode"
          @updateItems="updateItems"
        />
      </v-col>
      <v-col
        v-if="role && isInternal(role.id)"
        cols="12"
        md="6"
        class="d-flex justify-space-around align-center"
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
              color="secondary"
              small
              v-on="on"
              @click="toggleCompanyShow"
            >
              <v-icon size="28">
                mdi-domain
              </v-icon>
            </v-btn>
          </template>
          <span>{{ showCompany ? 'Hide' : 'View' }} Companies</span>
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

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              :disabled="!isViewMode"
              icon
              text
              color="error"
              small
              class="mr-3"
              v-on="on"
              @click="$refs.file.click()"
            >
              <v-icon size="28">
                mdi-upload
              </v-icon>
            </v-btn>
          </template>
          <span>Upload Vessels</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              :disabled="!isViewMode"
              icon
              text
              small
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
          <span>{{ showOrHide ? 'Hide VRP Imports' : 'Show All' }}</span>
        </v-tooltip>

        <v-tooltip bottom>
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
          <span>{{ merge ? 'Unmerge' : 'Merge' }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              text
              small
              :loading="bulkSaving"
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
      </v-col>
    </v-row>

    <v-row v-if="advancedSearch && role && isInternal(role.id)">
      <v-col
        cols="12"
        class="text-h3"
      >
        Advanced Search
      </v-col>

      <v-col
        v-for="(filter, i) in filters"
        :key="i"
        cols="12"
        md="3"
      >
        <v-select
          v-if="filter.component === 'select'"
          v-model="vesselStaticSearch[filter.model]"
          :items="filter.items"
          :item-text="filter.text"
          :item-value="filter.value"
          :label="filter.label"
          :prepend-icon="filter.icon"
          :multiple="filter.multiple"
          :loading="filter.loading"
        />
        <v-autocomplete
          v-else-if="filter.component === 'autocomplete'"
          v-model="vesselStaticSearch[filter.model]"
          :items="filter.items"
          :item-text="filter.text"
          :item-value="filter.value"
          :label="filter.label"
          :prepend-icon="filter.icon"
          :multiple="filter.multiple"
          :loading="filter.loading"
          clearable
        />
        <p v-else>
          No Component Registered
        </p>
      </v-col>

      <template v-if="single">
        <v-col
          cols="12"
          sm="3"
        >
          <v-select
            v-model="vesselStaticSearch.non_vrp"
            label="Option"
            prepend-icon="mdi-rename-box"
            :items="includes"
          />
        </v-col>
        <v-col
          v-if="vesselStaticSearch.non_vrp === 0"
          cols="12"
          sm="3"
        >
          <v-autocomplete
            v-model="vesselStaticSearch.plan"
            label="Plan"
            :items="allPlans"
            item-value="id"
            item-text="name"
            :loading="loadingPlans"
            prepend-icon="mdi-notebook"
            @change="$emit('refetch')"
          />
        </v-col>
      </template>
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

    <v-dialog
      v-model="showAdd"
      max-width="700"
      @click:outside="closeAdd"
      @keydown.esc="closeAdd"
    >
      <add-vessel
        :counter="addCounter"
        @complete="completeAdd"
      />
    </v-dialog>

    <confirm-dialog
      :show="saveChanges"
      :text="confirmText"
      @close:dialog="() => { saveChanges = false }"
      @discard:changes="() => discardChanges()"
    />
  </div>
</template>

<script>
  import axios from 'axios'
  import { mapState } from 'vuex'
  import { fetchInitials } from '@/mixins/fetchInitials'
  import { isInternal } from '@/shared/management'
  import { MIXINS, statusItems, resourceProviderItems, vrpItems, vesselStaticSearch, includes } from '@/shared/constants'

  export default {
    components: {
      SearchField: () => import('../SearchField'),
      AddVessel: () => import('../../forms/AddVessel'),
      ConfirmDialog: () => import('../../ConfirmDialog'),
      VesselTableEditor: () => import('../../bulkEditors/VesselTableEditor'),
    },

    mixins: [
      fetchInitials([
        MIXINS.fleets,
        MIXINS.networks,
        MIXINS.companies,
        MIXINS.insurers,
        MIXINS.providers,
        MIXINS.societies,
        MIXINS.qis,
        MIXINS.pis,
        MIXINS.vesselTypes,
      ]),
    ],

    props: {
      options: {
        type: Object,
        default: () => ({}),
      },
      cdtVessels: {
        type: Array,
        default: () => ([]),
      },
      single: {
        type: Boolean,
        default: false,
      },
      companyId: {
        type: String,
        default: '',
      },
    },

    data: () => ({
      includes,
      statusItems,
      resourceProviderItems,
      vrpItems,
      isViewMode: true,
      advancedSearch: false,
      confirmText: 'If you continue, your progress will be lost.\n Do you want to leave this page without saving?',
      vesselStaticSearch,
      isInternal,
      showAdd: false,
      addCounter: 0,
      bulkSaving: false,
      updatable: false,
      notSaved: false,
      saveChanges: false,
      next: null,
      showOrHide: true,
      showCompany: false,
      merge: true,
      loadingPlans: false,
      allPlans: [],
    }),

    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),

      filters () {
        const shared = [
          { component: 'select', model: 'active_field_id', items: statusItems, text: 'text', value: 'value', label: 'Status', icon: 'mdi-check' },
          { component: 'select', model: 'resource_provider', items: resourceProviderItems, text: 'text', value: 'value', label: 'Resource Provider', icon: 'mdi-hard-hat' },
          { component: 'autocomplete', model: 'types', items: this.mixinItems.vesselTypes, text: 'name', value: 'id', label: 'Type', icon: 'mdi-ferry', loading: this.loadingMixins.vesselTypes, multiple: true },
          { component: 'autocomplete', model: 'qi', items: this.mixinItems.qis, text: 'name', value: 'id', label: 'QI', icon: 'mdi-anchor', loading: this.loadingMixins.qis, multiple: true },
          { component: 'autocomplete', model: 'pi', items: this.mixinItems.pis, text: 'name', value: 'id', label: 'PI', icon: 'mdi-umbrella', loading: this.loadingMixins.pis, multiple: true },
          { component: 'autocomplete', model: 'societies', items: this.mixinItems.societies, text: 'name', value: 'id', label: 'Societies', icon: 'mdi-axis-arrow-lock', loading: this.loadingMixins.societies, multiple: true },
          { component: 'autocomplete', model: 'insurers', items: this.mixinItems.insurers, text: 'name', value: 'id', label: 'Insurers', icon: 'mdi-engine', loading: this.loadingMixins.insurers, multiple: true },
          { component: 'autocomplete', model: 'providers', items: this.mixinItems.providers, text: 'name', value: 'id', label: 'Providers', icon: 'mdi-chart-bell-curve', loading: this.loadingMixins.providers, multiple: true },
          { component: 'select', model: 'vrp_status', items: vrpItems, text: 'text', value: 'value', label: 'VRP Express', icon: 'mdi-check' },
        ]

        const advanced = [
          { component: 'autocomplete', model: 'fleets', items: this.mixinItems.fleets, text: 'name', value: 'id', label: 'Fleets', icon: 'mdi-anchor', loading: this.loadingMixins.fleets, multiple: true },
          { component: 'autocomplete', model: 'companies', items: this.mixinItems.companies, text: 'name', value: 'id', label: 'Companies', icon: 'mdi-domain', loading: this.loadingMixins.companies, multiple: true },
          { component: 'autocomplete', model: 'networks', items: this.mixinItems.networks, text: 'name', value: 'id', label: 'Networks', icon: 'mdi-lan', loading: this.loadingMixins.networks, multiple: true },
        ]

        return this.single ? shared : [...shared, ...advanced]
      },
    },

    watch: {
      vesselStaticSearch: {
        handler (newValue) {
          this.$emit('refetch', newValue)
        },
        deep: true,
      },
    },

    mounted () {
      if (this.single) {
        this.getCompanyPlans()
      }
    },

    methods: {
      updateItems (search) {
        this.$emit('refetch', search)
      },

      async getCompanyPlans () {
        this.loadingPlans = true

        try {
          const plans = await axios.get(`companies/${this.companyId}/plans`)
          this.allPlans = plans.data
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.loadingPlans = false
      },

      addVessel () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        this.showAdd = true
        this.addCounter++
      },

      showHideVrp () {
        this.showOrHide = !this.showOrHide
        if (this.showOrHide) {
          this.vesselStaticSearch.include_vrp = -1
        } else {
          this.vesselStaticSearch.include_vrp = 0
        }
        this.$emit('refetch')
      },

      showMergeVrp () {
        this.merge = !this.merge
        if (this.merge) {
          this.vesselStaticSearch.merge = -1
        } else {
          this.vesselStaticSearch.merge = 0
        }
        this.$emit('refetch')
      },

      completeAdd (success) {
        this.showAdd = false
        if (success) {
          this.$emit('refetch')
        }
      },

      async closeAdd () {
        const confirm = await this.$confirm('Do you want to lose your progress?', { title: 'Warning' })
        if (!confirm) {
          this.showAdd = true
        }
      },

      editOrSave () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        this.isViewMode ? this.isViewMode = !this.isViewMode : this.updatable = true
        this.$emit('showTable', false)
      },

      handleAfterSave () {
        this.notSaved = false
        this.isViewMode = true
        this.updatable = false
        this.$emit('showTable', true)
        this.$emit('refetch')
      },

      uploadVesselCsv (event) {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        const formData = new FormData()
        formData.append('file', event.target.files[0])
        axios.post(
          'vessels/upload/bulkCsv',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        ).then(res => {
          this.showSnackBar({ text: res.data.message, color: 'success' })
          this.$emit('refetch')
        }).catch(error => {
          this.showSnackBar({ text: error.response.statusText, color: 'error' })
          this.$emit('refetch')
        })
      },

      updateBulkSaving (val) {
        this.bulkSaving = val
      },

      discardChanges () {
        this.saveChanges = false
        this.next()
      },

      toggleCompanyShow () {
        this.showCompany = !this.showCompany
        this.$emit('showCompany', this.showCompany)
      },
    },

    beforeRouteLeave (to, from, next) {
      if (!this.notSaved) {
        next()
      } else {
        this.saveChanges = true
        this.next = next
      }
    },
  }
</script>
