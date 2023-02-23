import * as L from 'leaflet'
import axios from 'axios'

export const pinDropsLayer = {
  data: () => ({
    displayOptions: {
      pinDrops: true,
    },
    pinDrops: [],
    pinDropsLayer: null,
  }),

  watch: {
    'displayOptions.pinDrops' (show) {
      this.managePinDropsLayers(show)
    },
  },

  mounted () {
    this.pinDropsLayer = L.markerClusterGroup({ disableClusteringAtZoom: 8 })
  },

  methods: {
    async getPinDrops () {
      this.loading++
      try {
        const pinDrops = await axios.get('map/place-mark/all')
        this.pinDrops = pinDrops.data
      } catch (error) {
        this.showSnackBar({ text: error, color: 'error' })
      } finally {
        this.renderPinDropsLayer()
        this.loading--
      }
    },

    renderPinDropsLayer () {
      if (this.map.hasLayer(this.pinDropsLayer)) {
        this.map.removeLayer(this.pinDropsLayer)
      }

      this.pinDropsLayer.clearLayers()

      this.pinDrops.forEach(pinDrop => {
        this.markerForPinDrops({
          ...pinDrop,
          latlng: [pinDrop.latitude, pinDrop.longitude],
        }).addTo(this.pinDropsLayer)
        this.markerForPinDrops({
          ...pinDrop,
          latlng: [pinDrop.latitude, pinDrop.longitude - 360],
        }).addTo(this.pinDropsLayer)
      })

      if (this.displayOptions.pinDrops) {
        this.map.addLayer(this.pinDropsLayer)
      }
    },

    markerForPinDrops (pinDrop) {
      const iconHTML = `
        <i class="v-icon notranslate mdi ${pinDrop.icon} theme--dark" aria-hidden="true" style="color: ${pinDrop.color}"></i>
      `
      return L.marker(
        L.latLng(pinDrop.latlng),
        {
          radius: 5,
          icon: L.divIcon({
            html: iconHTML,
            iconAnchor: [10, 10],
            popupAnchor: [0, 0],
            className: 'custom-svg-icon',
          }),
        },
      )
        .bindTooltip(pinDrop.name)
    },

    managePinDropsLayers (show) {
      this.map.removeLayer(this.pinDropsLayer)
      if (show) {
        this.map.addLayer(this.pinDropsLayer)
      }
    },
  },
}
