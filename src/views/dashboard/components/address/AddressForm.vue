<template>
  <v-card-text>
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

    <v-row>
      <v-col
        v-for="(field, i) in fields"
        :key="i"
        cols="12"
        sm="6"
      >
        <v-text-field
          v-if="field.type === 'text'"
          v-model="address[field.model]"
          :label="field.label"
        />
        <v-autocomplete
          v-else
          v-model="address[field.model]"
          :items="mixinItems.countries"
          :loading="loadingMixins.countries"
          item-text="name"
          item-value="code"
          label="Country"
        >
          <template
            v-if="address[field.model]"
            v-slot:prepend
          >
            <flag
              :iso="address[field.model]"
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
        sm="3"
      >
        <v-text-field
          v-model="address.latitude"
          label="Latitude"
        />
      </v-col>
      <v-col
        cols="12"
        sm="3"
      >
        <v-text-field
          v-model="address.longitude"
          label="Longitude"
        />
      </v-col>
    </v-row>

    <slot name="actions" />
  </v-card-text>
</template>

<script>
  import { MIXINS } from '@/shared/constants'
  import { fetchInitials } from '@/mixins/fetchInitials'
  import { LMap, LTileLayer, LMarker } from 'vue2-leaflet'

  export default {
    components: {
      LMap, LTileLayer, LMarker,
    },

    mixins: [
      fetchInitials([
        MIXINS.countries,
      ]),
    ],

    props: {
      address: {
        type: Object,
        default: () => ({}),
      },
    },

    computed: {
      fields () {
        return [
          { type: 'text', label: 'Street', model: 'street', disabled: false },
          { type: 'text', label: 'Unit', model: 'unit', disabled: false },
          { type: 'text', label: 'City', model: 'city', disabled: false },
          { type: 'text', label: 'State', model: 'state', disabled: false },
          { type: 'text', label: 'Province', model: 'province', disabled: false },
          { type: 'text', label: 'Zip', model: 'zip', disabled: false },
          { type: 'autocomplete', label: 'Country', model: 'country', disabled: false },
          { type: 'text', label: 'Phone', model: 'phone', disabled: false },
          { type: 'text', label: 'Zone', model: 'zone_name', disabled: true },
        ]
      },
    },
  }
</script>
