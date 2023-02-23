<template>
  <v-container
    fluid
    tag="section"
  >
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
          <v-select
            v-model="filterOption"
            label="Filter Option"
            :items="filterOptions"
            @change="
              options.page = 1
              getDataFromApi()
            "
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            clearable
          />
        </v-col>
      </v-row>

      <v-data-table
        :headers="headers"
        :items="items"
        :options.sync="options"
        hide-default-footer
      >
        <template v-slot:[`item.name`]="{ item }">
          <router-link
            :to="`/companies/${item.id}/billing-info`"
          >
            {{ item.name }}
          </router-link>
        </template>
        <template v-slot:[`item.tank_contract_signed_date`]="{ item }">
          {{ makeDate(item.tank_contract_signed_date) }}
        </template>
        <template v-slot:[`item.non_tank_contract_signed_date`]="{ item }">
          {{ makeDate(item.non_tank_contract_signed_date) }}
        </template>
        <template v-slot:[`item.country`]="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <span
                dark
                v-on="on"
              >
                <flag
                  :iso="item.country"
                  :squared="false"
                />
              </span>
            </template>
            <span>{{ getCountryFromCode(item) }}</span>
          </v-tooltip>
        </template>
        <template v-slot:[`item.overall_total_fee`]="{ item }">
          {{ makeCurrency(item.overall_total_fee) }}
        </template>
        <template v-slot:[`item.gross_tank_fee`]="{ item }">
          {{ makeCurrency(item.gross_tank_fee) }}
        </template>
        <template v-slot:[`item.gross_non_tank_fee`]="{ item }">
          {{ makeCurrency(item.gross_non_tank_fee) }}
        </template>
        <template v-slot:[`item.gross_tank_total`]="{ item }">
          {{ makeCurrency(item.gross_tank_total) }}
        </template>
        <template v-slot:[`item.gross_non_tank_total`]="{ item }">
          {{ makeCurrency(item.gross_non_tank_total) }}
        </template>
        <template v-slot:[`item.tank_discount_value`]="{ item }">
          {{ makeCurrency(item.tank_discount_value) }}
        </template>
        <template v-slot:[`item.non_tank_discount_value`]="{ item }">
          {{ makeCurrency(item.non_tank_discount_value) }}
        </template>
        <template v-slot:[`item.tank_net_total`]="{ item }">
          {{ makeCurrency(item.tank_net_total) }}
        </template>
        <template v-slot:[`item.non_tank_net_total`]="{ item }">
          {{ makeCurrency(item.non_tank_net_total) }}
        </template>
        <template v-slot:[`item.last_billed_date`]="{ item }">
          {{ makeDate(item.last_billed_date) }}
        </template>
        <template v-slot:[`item.tank_billing_start_date`]="{ item }">
          {{ makeDate(item.tank_billing_start_date) }}
        </template>
        <template v-slot:[`item.non_tank_billing_start_date`]="{ item }">
          {{ makeDate(item.non_tank_billing_start_date) }}
        </template>
      </v-data-table>

      <table-footer
        :options="options"
        :total="total"
      />
    </base-material-card>
  </v-container>
</template>

<script>
  import axios from 'axios'
  import { mapActions } from 'vuex'
  import { fetchInitials } from '@/mixins/fetchInitials'
  import { billingModes, makeCurrency, makeDate, MIXINS } from '@/shared/constants'

  export default {
    components: {
      TableFooter: () => import('../../../components/TableFooter'),
    },

    mixins: [
      fetchInitials([
        MIXINS.countries,
      ]),
    ],

    data: () => ({
      makeCurrency,
      makeDate,
      filterOptions: [
        { text: 'General Overview', value: 2 },
        { text: 'Tank', value: 1 },
        { text: 'Non-Tank', value: 0 },
      ],
      filterOption: 2,
      generalHeaders: [
        { text: 'Company', value: 'name' },
        { text: 'Last Billed', value: 'last_billed_date' },
        { text: 'Region', value: 'region', sortable: false },
        { text: 'Country', value: 'country', sortable: false },
        { text: '# of Vessels', value: 'total_number_of_vessels', sortable: false },
        { text: 'Overall Total Fee', value: 'overall_total_fee', sortable: false },
      ],
      tankHeaders: [
        { text: 'Company', value: 'name' },
        { text: 'Contract #', value: 'tank_contract_no' },
        { text: 'Contract Signed Date', value: 'tank_contract_signed_date' },
        { text: 'Billing Start Date', value: 'tank_billing_start_date' },
        { text: '# of Vessels', value: 'number_of_tank', sortable: false },
        { text: 'Gross Fee', value: 'gross_tank_fee', sortable: false },
        { text: 'Gross Total', value: 'gross_tank_total', sortable: false },
        { text: 'Discount %', value: 'auto_tank_discount', sortable: false },
        { text: 'Manual %', value: 'manual_tank_discount', sortable: false },
        { text: 'Discount $', value: 'tank_discount_value', sortable: false },
        { text: 'Net Total', value: 'tank_net_total', sortable: false },
      ],
      nonTankHeaders: [
        { text: 'Company', value: 'name' },
        { text: 'Contract #', value: 'non_tank_contract_no' },
        { text: 'Contract Signed Date', value: 'non_tank_contract_signed_date' },
        { text: 'Billing Start Date', value: 'non_tank_billing_start_date' },
        { text: '# of Vessels', value: 'number_of_non_tank', sortable: false },
        { text: 'Gross Fee', value: 'gross_non_tank_fee', sortable: false },
        { text: 'Gross Total', value: 'gross_non_tank_total', sortable: false },
        { text: 'Discount %', value: 'auto_non_tank_discount', sortable: false },
        { text: 'Manual %', value: 'manual_non_tank_discount', sortable: false },
        { text: 'Discount $', value: 'non_tank_discount_value', sortable: false },
        { text: 'Net Total', value: 'non_tank_net_total', sortable: false },
      ],
      items: [],
      options: {},
      total: 0,
      loading: false,
      search: '',
      searchTimeout: null,
    }),

    computed: {
      headers () {
        return this.filterOption === 2
          ? this.generalHeaders
          : this.filterOption === 1
            ? this.tankHeaders
            : this.nonTankHeaders
      },
      title () {
        const billingMode = billingModes.find(mode => mode.path === this.$route.params.mode)

        return billingMode ? billingMode.title : ''
      },
    },

    watch: {
      options: {
        handler () {
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
          let apiurl = `billing-information?page=${page}&per_page=${itemsPerPage}`
          if (this.search) {
            apiurl += `&query=${this.search.replace('&', '%26')}`
          }
          if (sortBy[0]) {
            const direction = sortDesc[0] ? 'desc' : 'asc'
            apiurl += `&direction=${direction}&sortBy=${sortBy[0]}`
          }

          const billingMode = billingModes.find(mode => mode.path === this.$route.params.mode)
          if (!billingMode) {
            this.$router.push('/')
          } else {
            const staticSearch = { billing_mode: billingMode.route, djs: billingMode.djs, option: this.filterOption }

            const res = await axios.post(apiurl, { staticSearch })
            this.items = res.data.data
            this.total = res.data.meta ? res.data.meta.total : res.data.total
          }
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.loading = false
      },

      getCountryFromCode (item) {
        return (this.mixinItems.countries.find(v => v.id === item.country) || {}).name
      },
    },
  }
</script>
