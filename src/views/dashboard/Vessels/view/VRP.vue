<template>
  <base-material-card
    color="primary"
    icon="mdi-notebook-check"
    title="VRP"
  >
    <v-card-text>
      <v-progress-linear
        v-if="!!loading"
        indeterminate
      />
      <v-row>
        <v-col
          v-for="(item, i) in vrpListItems"
          :key="i"
          cols="12"
          sm="6"
        >
          <v-text-field
            v-model="item.model"
            :prepend-icon="item.icon"
            :label="item.label"
            readonly
          />
        </v-col>
      </v-row>
    </v-card-text>
  </base-material-card>
</template>

<script>
  import axios from 'axios'
  import { mapActions } from 'vuex'

  export default {
    data: () => ({
      loading: true,
      vesselVrp: [],
    }),

    computed: {
      vrpListItems () {
        return [
          {
            model: this.vesselVrp.vessel_name,
            icon: 'mdi-ferry',
            label: 'Vessel Name',
          },
          {
            model: this.vesselVrp.vessel_type,
            icon: 'mdi-tag',
            label: 'Type',
          },
          {
            model: this.vesselVrp.imo,
            icon: 'mdi-fingerprint',
            label: 'IMO Number',
          },
          {
            model: this.vesselVrp.official_number,
            icon: 'mdi-format-list-numbered',
            label: 'Official Number',
          },
          {
            model: this.vesselVrp.vessel_status,
            icon: 'mdi-check',
            label: 'Vessel Status',
          },
          {
            model: this.vesselVrp.vrp_plan_status,
            icon: 'mdi-check',
            label: 'Plan Status',
          },
          {
            model: this.vesselVrp.plan_holder,
            icon: 'mdi-send',
            label: 'Plan Holder',
          },
          {
            model: this.vesselVrp.primary_smff,
            icon: 'mdi-key-star',
            label: 'Primary SMFF',
          },
          {
            model: this.vesselVrp.vessel_is_tank === 1 ? 'YES' : 'NO',
            icon: 'mdi-gas-cylinder',
            label: 'Tank',
          },
          {
            model: this.vesselVrp.vrp_count,
            icon: 'mdi-history',
            label: 'VRP Count',
          },
          {
            model: this.vesselVrp.vrp_plan_number,
            icon: 'mdi-file-document-edit',
            label: 'Plan Number',
          },
          {
            model: this.vesselVrp.wcd_barrels,
            icon: 'mdi-barrel',
            label: 'WCD Barrels',
          },
        ]
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
        try {
          this.loading = true
          const vrp = await axios.get(`vessels/${this.$route.params.id}/vrp`)
          this.vesselVrp = vrp.data
          this.loading = false
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
      },
    },
  }
</script>
