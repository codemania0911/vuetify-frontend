<template>
  <v-container class="files-section">
    <v-row>
      <v-col
        cols="12"
        md="4"
      >
        <category
          color="warning"
          :loading="loading"
          :title="fileData.plan.name ? fileData.plan.name + ' - Plan' : 'Plan Files'"
          :categories="filteredPlanCats"
          @update:directory="updateDirectory"
        />

        <category
          color="secondary"
          :loading="loading"
          :title="fileData.plan_holder.name ? fileData.plan_holder.name + ' - Company' : 'Plan Holder Files'"
          :categories="planHolderCats"
          @update:directory="updateDirectory"
        />

        <category
          v-if="companyCats"
          color="secondary"
          :loading="loading"
          title="Vessel Companies"
          :categories="companyCats"
          :plan-company="true"
          @update:directory="updateDirectory"
        />
      </v-col>

      <files
        icon="mdi-notebook"
        :title="fileData.plan.name"
        :subtitle="`VRP Number: ${fileData.plan.plan_number || ''}`"
        :loading="loading"
        :directory="directory"
        @refetch="getDataFromApi"
      />
    </v-row>
  </v-container>
</template>

<script>
  import axios from 'axios'
  import { mapActions, mapState } from 'vuex'
  import { COAST_GUARD, VESSEL_VIEWER } from '@/shared/management'
  import { companyCategories, planCategories } from '@/shared/categories'

  export default {
    components: {
      Category: () => import('../../components/files/Category'),
      Files: () => import('../../components/files/Files'),
    },

    data: () => ({
      loading: false,
      fileData: { plan: {}, plan_holder: {} },
      planCats: [],
      planHolderCats: [],
      companyCats: null,
      directory: {},
    }),

    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),

      filteredPlanCats () {
        // If coast guard or vessel viewer, filter Annex, Shipboard and Drills section
        if (this.role && [COAST_GUARD, VESSEL_VIEWER].includes(this.role.id)) {
          return this.planCats.filter(category => !category.special)
        }
        return this.planCats
      },
    },

    mounted () {
      this.getDataFromApi()
    },

    methods: {
      ...mapActions({
        showSnackBar: 'showSnackBar',
      }),

      async getDataFromApi () {
        this.loading = true
        try {
          const response = await axios.get(`plans/${this.$route.params.id}/documents/count`)
          this.fileData = response.data

          // Assign Plan Files Utils
          this.planCats = planCategories.map(category => ({
            ...category,
            items: category.items.map(item => ({
              ...item,
              id: this.$route.params.id,
              url: `plans/${this.$route.params.id}`,
              outputName: this.fileData.plan.name,
              count: this.fileData.plan.files[item.code] || 0,
            })),
          }))

          // Assign Plan Holder (Company) File Utils
          this.planHolderCats = companyCategories.map(category => ({
            ...category,
            items: category.items.map(item => ({
              ...item,
              id: this.fileData.plan_holder.id,
              url: `companies/${this.fileData.plan_holder.id}`,
              outputName: this.fileData.plan_holder.name,
              count: this.fileData.plan_holder.files[item.code] || 0,
            })),
          }))

          // ---------  Vessel Companies Files Assign --------------
          const companyFiles = response.data.company
          if (companyFiles) {
            this.companyCats = companyFiles.map(company => ({
              ...company,
              categories: companyCategories.map(category => ({
                ...category,
                items: category.items.map(item => ({
                  ...item,
                  id: company.id,
                  url: `companies/${company.id}`,
                  outputName: company.name,
                  count: company.files[item.code] || 0,
                })),
              })),
            }))
          }
          // ---------  Vessel Companies Files Assign --------------
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.loading = false
      },

      updateDirectory (directory) {
        this.directory = directory
      },
    },
  }
</script>
