<template>
  <base-material-card
    icon="mdi-map-marker"
    title="Address"
    color="primary"
  >
    <v-progress-linear
      v-if="loadingAddress"
      indeterminate
    />
    <l-map
      v-if="address.latitude && address.longitude"
      id="map"
      :zoom="13"
      :center="[address.latitude, address.longitude]"
      :options="{ dragging: false, scrollWheelZoom: false}"
    >
      <l-tile-layer url="https://{s}.tile.osm.org/{z}/{x}/{y}.png" />
      <l-marker :lat-lng="[address.latitude, address.longitude]" />
    </l-map>

    <v-row class="pa-5">
      <v-col
        cols="12"
        sm="6"
      >
        <v-text-field
          v-model="address.street"
          label="Street"
        />
      </v-col>
      <v-col
        cols="12"
        sm="6"
      >
        <v-text-field
          v-model="address.unit"
          label="Unit"
        />
      </v-col>
      <v-col
        cols="12"
        sm="6"
      >
        <v-text-field
          v-model="address.city"
          label="City"
        />
      </v-col>
      <v-col
        cols="12"
        sm="6"
      >
        <v-text-field
          v-model="address.state"
          label="State"
        />
      </v-col>
      <v-col
        cols="12"
        sm="6"
      >
        <v-text-field
          v-model="address.province"
          label="Province"
        />
      </v-col>
      <v-col
        cols="12"
        sm="6"
      >
        <v-text-field
          v-model="address.zip"
          label="Zip"
        />
      </v-col>
      <v-col
        cols="12"
        sm="6"
      >
        <v-autocomplete
          v-model="address.country"
          :items="mixinItems.countries"
          :loading="loadingMixins.countries"
          item-text="name"
          item-value="id"
          label="Country"
        >
          <template
            v-if="address.country"
            v-slot:prepend
          >
            <flag
              :iso="address.country"
              :squared="false"
            />
          </template>
          <template
            v-else
            v-slot:prepend
          >
            <v-icon>mdi-flag</v-icon>
          </template>
        </v-autocomplete>
      </v-col>
      <v-col
        cols="12"
        sm="6"
      >
        <v-text-field
          v-model="address.phone"
          label="Phone"
        />
      </v-col>
      <v-col
        v-if="address.zone"
        cols="12"
        sm="6"
      >
        <v-text-field
          v-model="address.zone.name"
          label="Zone"
          disabled
        />
      </v-col>
      <v-col
        cols="6"
        sm="3"
      >
        <v-text-field
          v-model="address.latitude"
          label="Latitude"
        />
      </v-col>
      <v-col
        cols="6"
        sm="3"
      >
        <v-text-field
          v-model="address.longitude"
          label="Longitude"
        />
      </v-col>
    </v-row>

    <v-row
      class="pa-5"
      no-gutters
    >
      <v-btn
        color="success"
        small
        :loading="saving"
        @click="saveAddress(address)"
      >
        <v-icon left>
          mdi-content-save
        </v-icon>
        Save
      </v-btn>
      <!-- <v-btn
        color="error"
        small
        :loading="deleting"
        @click="deleteAddress(address)"
      >
        <v-icon left>
          mdi-delete
        </v-icon>
        Delete Address
      </v-btn> -->
    </v-row>
  </base-material-card>
</template>

<script>
  import axios from 'axios'
  import { LMap, LTileLayer, LMarker } from 'vue2-leaflet'
  import { mapActions, mapState } from 'vuex'
  import { isInternal } from '@/shared/management'
  import { fetchInitials } from '@/mixins/fetchInitials'
  import { MIXINS } from '@/shared/constants'

  export default {
    components: {
      LMap, LTileLayer, LMarker,
    },

    mixins: [
      fetchInitials([
        MIXINS.countries,
      ]),
    ],

    data: () => ({
      loadingAddress: false,
      saving: false,
      // deleting: false,
      address: {},
    }),

    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),
    },

    mounted () {
      this.getDataFromApi()
    },

    methods: {
      ...mapActions({
        showSnackBar: 'showSnackBar',
      }),

      async getDataFromApi () {
        this.loadingAddress = true
        try {
          const address = await axios.get('vessel-billing-group/address/' + this.$route.params.id)
          this.address = address.data
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.loadingAddress = false
      },

      async saveAddress () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        this.saving = true
        try {
          const response = await axios.post('companies/addresses/' + this.address.id, this.address)
          this.showSnackBar({ text: response.data.message, color: 'success' })
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.saving = false
        this.getDataFromApi()
      },

      // async deleteAddress () {
      //   if (!isInternal(this.role.id)) {
      //     this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
      //     return
      //   }
      //   const permitted = this.$confirm(`Please confirm that you would like to delete the following address:
      //     <b>${this.address.street} ${this.address.city} ${this.address.country}</b>`, { title: 'Warning' })
      //   if (permitted) {
      //     this.deleting = true
      //     try {
      //       const response = await axios.delete('companies/addresses/' + this.address.id)
      //       this.showSnackBar({ text: response.data.message, color: 'success' })
      //       this.getDataFromApi()
      //     } catch (error) {
      //       this.showSnackBar({ text: error, color: 'error' })
      //     }
      //     this.deleting = false
      //   }
      // },
    },
  }
</script>
