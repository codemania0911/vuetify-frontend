<template>
  <v-container class="files-section">
    <v-row>
      <v-col
        cols="12"
        md="4"
      >
        <category
          color="secondary"
          :title="company.name || 'Company'"
          :loading="loading"
          :categories="categories"
          @update:directory="updateDirectory"
        />
      </v-col>

      <files
        icon="mdi-domain"
        :title="company.name || 'Company'"
        :loading="loading"
        :src="src"
        :directory="directory"
        @refetch="getDataFromApi"
      />
    </v-row>
  </v-container>
</template>

<script>
  import axios from 'axios'
  import { mapActions, mapState } from 'vuex'
  import { companyCategories } from '@/shared/categories'

  export default {
    components: {
      Category: () => import('../../components/files/Category'),
      Files: () => import('../../components/files/Files'),
    },

    data: () => ({
      companyName: '',
      loading: false,
      company: {},
      categories: [],
      directory: {},
    }),

    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),

      src () {
        return this.company.has_photo
          ? `https://storage.googleapis.com/donjon-smit/pictures/companies/${this.$route.params.id}/cover_sqr.jpg`
          : ''
      },
    },

    async mounted () {
      await this.getDataFromApi()

      // If the route is from No-Contract in Reports, open OPA-90 section
      if (this.$route.query.contract) {
        this.categories.forEach((category) => {
          const contract = category.items.find(item => item.code === 'contracts')
          if (contract) {
            this.directory = contract
          }
        })
      }
    },

    methods: {
      ...mapActions({
        showSnackBar: 'showSnackBar',
      }),

      async getDataFromApi () {
        this.loading = true
        try {
          const company = await axios.get('companies/' + this.$route.params.id)
          this.company = company.data.data[0]

          const counts = await axios.get(`companies/${this.$route.params.id}/documents/count`)
          this.categories = companyCategories.map(category => ({
            ...category,
            items: category.items.map(item => ({
              ...item,
              id: this.$route.params.id,
              url: `companies/${this.$route.params.id}`,
              outputName: this.company.name,
              count: counts.data[item.code] || 0,
            })),
          }))
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
