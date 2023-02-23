<template>
  <div>
    <input
      ref="file"
      type="file"
      class="d-none"
      @change="uploadCompanyCsv"
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
              color="warning"
              small
              class="mr-2"
              v-on="on"
              @click="addCompany"
            >
              <v-icon size="28">
                mdi-plus-circle-outline
              </v-icon>
            </v-btn>
          </template>
          <span>Add Company</span>
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
          <span>Upload Companies</span>
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
          <span>{{ `${ isViewMode ? 'Edit Companies' : 'Save Companies'}` }}</span>
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
          v-model="staticSearch[filter.model]"
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
          v-model="staticSearch[filter.model]"
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
    </v-row>

    <company-table-editor
      v-if="!isViewMode"
      :company-data="cdtCompanies"
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
      <add-company
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
  import { MIXINS, statusItems, resourceProviderItems, staticSearch } from '@/shared/constants'

  export default {
    components: {
      SearchField: () => import('../SearchField'),
      AddCompany: () => import('../../forms/AddCompany'),
      ConfirmDialog: () => import('../../ConfirmDialog'),
      CompanyTableEditor: () => import('../../bulkEditors/CompanyTableEditor'),
    },

    mixins: [
      fetchInitials([
        MIXINS.networks,
        MIXINS.vendorTypes,
      ]),
    ],

    props: {
      options: {
        type: Object,
        default: () => ({}),
      },
      cdtCompanies: {
        type: Array,
        default: () => ([]),
      },
    },

    data: () => ({
      isViewMode: true,
      statusItems,
      resourceProviderItems,
      advancedSearch: false,
      confirmText: 'If you continue, your progress will be lost.\n Do you want to leave this page without saving?',
      staticSearch,
      isInternal,
      showAdd: false,
      addCounter: 0,
      bulkSaving: false,
      updatable: false,
      notSaved: false,
      saveChanges: false,
      next: null,
    }),

    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),

      filters () {
        return [
          { component: 'select', model: 'active_field_id', items: statusItems, text: 'text', value: 'value', label: 'Status', icon: 'mdi-check' },
          { component: 'select', model: 'resource_provider', items: resourceProviderItems, text: 'text', value: 'value', label: 'Resource Provider', icon: 'mdi-hard-hat' },
          { component: 'autocomplete', model: 'networks', items: this.mixinItems.networks, text: 'name', value: 'id', label: 'Networks', icon: 'mdi-lan', loading: this.loadingMixins.networks, multiple: true },
          { component: 'autocomplete', model: 'vendors', items: this.mixinItems.vendorTypes, text: 'name', value: 'id', label: 'Vendors', icon: 'mdi-shield-link-variant', loading: this.loadingMixins.vendorTypes, multiple: true },
        ]
      },
    },

    watch: {
      staticSearch: {
        handler (newValue) {
          this.$emit('refetch', newValue)
        },
        deep: true,
      },
    },

    methods: {
      updateItems (search) {
        this.$emit('refetch', search)
      },

      addCompany () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        this.showAdd = true
        this.addCounter++
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
        this.$emit('showTable', false)
        this.$emit('refetch')
      },

      uploadCompanyCsv (event) {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        const formData = new FormData()
        formData.append('file', event.target.files[0])
        axios.post(
          'companies/upload/bulkCsv',
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
