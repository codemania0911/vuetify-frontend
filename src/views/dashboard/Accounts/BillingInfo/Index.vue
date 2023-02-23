<template>
  <v-container
    fluid
    tag="section"
  >
    <base-material-tabs
      v-model="mainTab"
      background-color="transparent"
      color="secondary"
      centered
      icons-and-text
      show-arrows
    >
      <v-tab
        v-for="(tab, i) in tabs"
        :key="i"
      >
        {{ tab.title }}
        <v-icon v-text="tab.icon" />
      </v-tab>

      <v-tabs-items
        v-model="mainTab"
        class="transparent"
      >
        <v-tab-item>
          <v-progress-linear
            v-if="loading"
            indeterminate
          />

          <template v-else>
            <billing-information
              title="DJ-S America Billing Information"
              color="warning"
              :items="djsAItems"
            />

            <billing-information
              title="DJ-S Billing Information"
              color="primary"
              :items="djsItems"
            />

            <base-material-card
              color="secondary"
              icon="mdi-currency-usd-off"
              inline
            >
              <template v-slot:after-heading>
                <div class="text-h3">
                  Zero Fees or No Entry
                </div>
              </template>

              <v-simple-table class="mt-3">
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-left">
                        Title
                      </th>
                      <th class="text-left">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(mode, i) in modes"
                      :key="i"
                    >
                      <td
                        class="item-clickable primary--text text-decoration-underline"
                        @click="mainTab = i + 1"
                      >
                        {{ mode.title }}
                      </td>
                      <td>{{ mode.value }}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </base-material-card>
          </template>
        </v-tab-item>

        <v-tab-item>
          <fee-entry-table
            title="Zero Retainer Fee"
            url="billing-information/companiesWithZeroRetainerFee/all"
          />
        </v-tab-item>

        <v-tab-item>
          <fee-entry-table
            title="No Billing Entry"
            url="billing-information/companiesWithoutBillingEntries/all"
          />
        </v-tab-item>
      </v-tabs-items>
    </base-material-tabs>
  </v-container>
</template>

<script>
  import axios from 'axios'
  import { mapActions } from 'vuex'
  import { makeCurrency } from '@/shared/constants'

  export default {
    components: {
      BillingInformation: () => import('./components/BillingInformation'),
      FeeEntryTable: () => import('./components/FeeEntryTable'),
    },

    data: () => ({
      mainTab: 0,
      tabs: [
        { title: 'General', icon: 'mdi-currency-usd' },
        { title: 'Zero Retainer Fee', icon: 'mdi-currency-usd' },
        { title: 'No Billing Entry', icon: 'mdi-currency-usd' },
      ],
      djsItems: [],
      djsAItems: [],
      modes: [],
      loading: false,
    }),

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
          const response = await axios.get('billing-information/total')
          const items = response.data

          this.djsItems = [
            {
              mode: 'By Client',
              to: '/accounts-billing-info/djs-client',
              clients: items[0].djs_client_clients,
              vessels: items[0].djs_client_vessels,
              amount: makeCurrency(items[0].djs_client_amount),
            },
            {
              mode: 'By Vessel',
              to: '/accounts-billing-info/djs-vessel',
              clients: items[0].djs_vessel_clients,
              vessels: items[0].djs_vessel_vessels,
              amount: makeCurrency(items[0].djs_vessel_amount),
            },
            {
              mode: 'By Group',
              to: '/accounts-billing-info/djs-group',
              clients: items[0].djs_group_clients,
              vessels: items[0].djs_group_vessels,
              amount: makeCurrency(items[0].djs_group_amount),
            },
            {
              mode: 'Grand Total',
              clients: items[0].djs_client_clients + items[0].djs_vessel_clients + items[0].djs_group_clients,
              vessels: items[0].djs_client_vessels + items[0].djs_vessel_vessels + items[0].djs_group_vessels,
              amount: makeCurrency(items[0].djs_client_amount + items[0].djs_vessel_amount + items[0].djs_group_amount),
            },
          ]

          this.djsAItems = [
            {
              mode: 'By Client',
              to: '/accounts-billing-info/djsa-client',
              clients: items[0].djs_a_client_clients,
              vessels: items[0].djs_a_client_vessels,
              amount: makeCurrency(items[0].djs_a_client_amount),
            },
            {
              mode: 'By Vessel',
              to: '/accounts-billing-info/djsa-vessel',
              clients: items[0].djs_a_vessel_clients,
              vessels: items[0].djs_a_vessel_vessels,
              amount: makeCurrency(items[0].djs_a_vessel_amount),
            },
            {
              mode: 'By Group',
              to: '/accounts-billing-info/djsa-group',
              clients: items[0].djs_a_group_clients,
              vessels: items[0].djs_a_group_vessels,
              amount: makeCurrency(items[0].djs_a_group_amount),
            },
            {
              mode: 'Grand Total',
              clients: items[0].djs_a_client_clients + items[0].djs_a_vessel_clients + items[0].djs_a_group_clients,
              vessels: items[0].djs_a_client_vessels + items[0].djs_a_vessel_vessels + items[0].djs_a_group_vessels,
              amount: makeCurrency(items[0].djs_a_client_amount + items[0].djs_a_vessel_amount + items[0].djs_a_group_amount),
            },
          ]

          this.modes = [
            { title: 'Clients with no Retainer Fee', value: items[0].no_retainer_fee },
            { title: 'Clients with no Billing Entry', value: items[0].no_billing_entry },
          ]
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.loading = false
      },
    },
  }
</script>
