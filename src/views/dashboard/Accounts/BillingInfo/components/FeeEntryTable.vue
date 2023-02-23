<template>
  <base-material-card
    color="primary"
    icon="mdi-currency-usd"
    inline
  >
    <template v-slot:after-heading>
      <div class="text-h3">
        {{ title }}
      </div>
    </template>

    <v-progress-linear
      v-if="loading"
      indeterminate
    />

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="query.companyName"
          label="Company Name"
          prepend-icon="mdi-domain"
          clearable
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-select
          v-model="query.activeFieldId"
          :items="activeFields"
          item-text="text"
          item-value="value"
          label="Status"
          prepend-icon="mdi-check"
        />
      </v-col>
    </v-row>

    <v-data-table
      :headers="headers"
      :items="companies"
      :options.sync="options"
      hide-default-footer
    >
      <template v-slot:[`item.company_name`]="{ item }">
        <router-link
          :to="`/companies/${item.id}/billing-info`"
        >
          {{ item.company_name }}
        </router-link>
      </template>
    </v-data-table>

    <table-footer
      :options="options"
      :total="total"
    />
  </base-material-card>
</template>

<script>
  import axios from 'axios'
  import { mapActions } from 'vuex'
  import { activeFields } from '@/shared/constants'

  export default {
    components: {
      TableFooter: () => import('../../../components/TableFooter.vue'),
    },

    props: {
      title: {
        type: String,
        default: '',
      },
      url: {
        type: String,
        default: '',
      },
    },

    data: () => ({
      query: {
        activeFieldId: -1,
        companyName: '',
      },
      activeFields,
      total: 0,
      headers: [
        { text: 'ID', value: 'id' },
        { text: 'Company', value: 'company_name' },
        { text: 'Tank Contract', value: 'tank_contract_no' },
        { text: 'Non-Tank Contract', value: 'non_tank_contract_no' },
        { text: 'Active', value: 'active_status', sortable: false },
      ],
      companies: [],
      options: {},
      loading: false,
      searchTimeout: null,
    }),

    watch: {
      options: {
        handler () {
          this.getDataFromApi()
        },
        deep: true,
      },
      query: {
        handler () {
          if (this.searchTimeout) {
            clearTimeout(this.searchTimeout)
          }
          this.searchTimeout = setTimeout(() => {
            this.options.page = 1
            this.getDataFromApi()
          }, 500)
        },
        deep: true,
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

          let apiurl = `${this.url}?page=${page}&per_page=${itemsPerPage}&active_field_id=${this.query.activeFieldId}`
          if (this.query.companyName) {
            apiurl += `&query=${this.query.companyName.replace('&', '%26')}`
          } else if (sortBy[0]) {
            const direction = sortDesc[0] ? 'desc' : 'asc'
            apiurl += `&direction=${direction}&sortBy=${sortBy[0]}`
          }
          const response = await axios.get(apiurl)
          this.companies = response.data.data
          this.total = response.data.total
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.loading = false
      },
    },
  }
</script>
