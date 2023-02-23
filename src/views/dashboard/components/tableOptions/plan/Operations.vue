<template>
  <div>
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
              @click="addPlan"
            >
              <v-icon size="28">
                mdi-plus-circle-outline
              </v-icon>
            </v-btn>
          </template>
          <span>Add Plan</span>
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
              :disabled="!isViewMode"
              icon
              text
              color="success"
              small
              class="mr-2"
              v-on="on"
              @click="planStaticSearch.plan_number = !planStaticSearch.plan_number"
            >
              <v-icon size="28">
                {{ planStaticSearch.plan_number ? 'mdi-toggle-switch' : 'mdi-toggle-switch-off-outline' }}
              </v-icon>
            </v-btn>
          </template>
          <span>{{ planStaticSearch.plan_number ? 'Turn off filter for no Plan Number' : 'Filter for Plans without a Plan Number' }}</span>
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
          <span>{{ `${ isViewMode ? 'Edit Plans' : 'Save Plans'}` }}</span>
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
          v-model="planStaticSearch.active_field_id"
          :items="statusItems"
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
          v-model="planStaticSearch.vrp_status"
          :items="vrpItems"
          item-text="text"
          item-value="value"
          label="VRP Status"
          prepend-icon="mdi-check"
        />
      </v-col>

      <v-col
        cols="12"
        sm="3"
      >
        <v-select
          v-model="planStaticSearch.resource_provider"
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
          v-model="planStaticSearch.networks"
          :items="mixinItems.networks"
          :loading="loadingMixins.networks"
          item-text="name"
          item-value="id"
          label="Networks"
          prepend-icon="mdi-lan"
          multiple
          clearable
        />
      </v-col>

      <v-col
        cols="12"
        sm="3"
      >
        <v-autocomplete
          v-model="planStaticSearch.qi"
          :items="mixinItems.qis"
          :loading="loadingMixins.qis"
          item-text="name"
          item-value="id"
          label="QI"
          prepend-icon="mdi-anchor"
          clearable
        />
      </v-col>

      <v-col
        cols="12"
        sm="3"
      >
        <v-autocomplete
          v-model="planStaticSearch.plan_preparer"
          :items="mixinItems.qis"
          :loading="loadingMixins.qis"
          item-text="name"
          item-value="id"
          label="Plan Preparer"
          prepend-icon="mdi-typewriter"
          clearable
        />
      </v-col>
    </v-row>

    <plan-table-editor
      v-if="!isViewMode"
      :plan-data="cdtPlans"
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
      <add-plan @complete="completeAdd" />
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
  import { mapState } from 'vuex'
  import { fetchInitials } from '@/mixins/fetchInitials'
  import { isInternal } from '@/shared/management'
  import { MIXINS, statusItems, resourceProviderItems, planStaticSearch, vrpItems } from '@/shared/constants'

  export default {
    components: {
      SearchField: () => import('../SearchField'),
      AddPlan: () => import('../../forms/AddPlan'),
      ConfirmDialog: () => import('../../ConfirmDialog'),
      PlanTableEditor: () => import('../../bulkEditors/PlanTableEditor'),
    },

    mixins: [
      fetchInitials([
        MIXINS.networks,
        MIXINS.countries,
        MIXINS.qis,
      ]),
    ],

    props: {
      options: {
        type: Object,
        default: () => ({}),
      },
      cdtPlans: {
        type: Array,
        default: () => ([]),
      },
    },

    data: () => ({
      isViewMode: true,
      statusItems,
      vrpItems,
      resourceProviderItems,
      advancedSearch: false,
      confirmText: 'If you continue, your progress will be lost.\n Do you want to leave this page without saving?',
      planStaticSearch,
      isInternal,
      showAdd: false,
      bulkSaving: false,
      updatable: false,
      notSaved: false,
      saveChanges: false,
      next: null,
      showOrHide: true,
      merge: true,
    }),

    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),
    },

    watch: {
      planStaticSearch: {
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

      addPlan () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        this.showAdd = true
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

      updateBulkSaving (val) {
        this.bulkSaving = val
      },

      discardChanges () {
        this.saveChanges = false
        this.next()
      },

      showHideVrp () {
        this.showOrHide = !this.showOrHide
        if (this.showOrHide) {
          this.planStaticSearch.include_vrp = -1
        } else {
          this.planStaticSearch.include_vrp = 0
        }
        this.$emit('refetch')
      },

      showMergeVrp () {
        this.merge = !this.merge
        if (this.merge) {
          this.planStaticSearch.merge = -1
        } else {
          this.planStaticSearch.merge = 0
        }
        this.$emit('refetch')
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
