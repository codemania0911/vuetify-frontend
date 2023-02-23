<template>
  <v-container
    fluid
    tag="section"
  >
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <discounts-layout
          title="Discounts Tank"
          icon="mdi-water"
          color="primary"
          :discounts="discounts.tank"
          :loading="loading"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <discounts-layout
          title="Discounts Non-Tank"
          icon="mdi-water-off"
          color="secondary"
          :discounts="discounts.non_tank"
          :loading="loading"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import axios from 'axios'
  import { mapActions } from 'vuex'

  export default {
    components: {
      DiscountsLayout: () => import('./DiscountsLayout'),
    },

    data: () => ({
      discounts: [
        { tank: [], non_tank: [] },
      ],
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
          const discounts = await axios.get('billing-information/discountInfo/all')
          this.discounts = discounts.data
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.loading = false
      },
    },
  }
</script>
