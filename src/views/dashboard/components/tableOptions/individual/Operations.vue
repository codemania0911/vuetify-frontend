<template>
  <div>
    <input
      ref="file"
      type="file"
      class="d-none"
      @change="uploadUserCsv"
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
              @click="addIndividual"
            >
              <v-icon size="28">
                mdi-plus-circle-outline
              </v-icon>
            </v-btn>
          </template>
          <span>Add Individual</span>
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
          <span>Upload Individuals</span>
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
          <span>{{ `${ isViewMode ? 'Edit Users' : 'Save Users'}` }}</span>
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
        cols="12"
        sm="3"
      >
        <v-select
          v-model="userStaticSearch.active"
          :items="userStatusItems"
          item-text="text"
          item-value="value"
          label="Status"
          prepend-icon="mdi-check"
        />
      </v-col>

      <v-col
        cols="12"
        sm="3"
      >
        <v-select
          v-model="userStaticSearch.resource_provider"
          :items="resourceProviderItems"
          item-text="text"
          item-value="value"
          label="Resource Provider"
          prepend-icon="mdi-hard-hat"
        />
      </v-col>

      <v-col
        cols="12"
        sm="3"
      >
        <v-autocomplete
          v-model="userStaticSearch.companies"
          :items="mixinItems.companies"
          :loading="loadingMixins.companies"
          item-text="name"
          item-value="id"
          label="Companies"
          prepend-icon="mdi-domain"
          multiple
          clearable
        />
      </v-col>

      <v-col
        cols="12"
        sm="3"
      >
        <v-select
          v-model="userStaticSearch.role"
          :items="mixinItems.roles"
          :loading="loadingMixins.roles"
          item-text="name"
          item-value="id"
          label="Role"
          prepend-icon="mdi-account-lock"
          clearable
        />
      </v-col>
    </v-row>

    <user-table-editor
      v-if="!isViewMode"
      :user-data="individuals"
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
      <add-individual
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
  import { MIXINS, userStatusItems, resourceProviderItems, userStaticSearch } from '@/shared/constants'

  export default {
    components: {
      SearchField: () => import('../SearchField'),
      AddIndividual: () => import('../../forms/AddIndividual'),
      ConfirmDialog: () => import('../../ConfirmDialog'),
      UserTableEditor: () => import('../../bulkEditors/UserTableEditor'),
    },

    mixins: [
      fetchInitials([
        MIXINS.companies,
        MIXINS.roles,
      ]),
    ],

    props: {
      options: {
        type: Object,
        default: () => ({}),
      },
      individuals: {
        type: Array,
        default: () => ([]),
      },
    },

    data: () => ({
      isViewMode: true,
      userStatusItems,
      resourceProviderItems,
      advancedSearch: false,
      confirmText: 'If you continue, your progress will be lost.\n Do you want to leave this page without saving?',
      userStaticSearch,
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
    },

    watch: {
      userStaticSearch: {
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

      addIndividual () {
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

      uploadUserCsv (event) {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        const formData = new FormData()
        formData.append('file', event.target.files[0])
        axios.post(
          'users/upload/bulkCsv',
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
          this.showSnackBar({ text: error.response.data.message || error.response.statusText, color: 'error' })
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
