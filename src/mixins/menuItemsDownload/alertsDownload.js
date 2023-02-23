import { mapActions, mapState } from 'vuex'

export const alertsDownload = {
  data: () => ({
    loadingAlerts: true,
  }),

  computed: {
    ...mapState({
      alertItems: state => state.menuitems.alertItems,
    }),
  },

  mounted () {
    this.alertsDownload()
  },

  methods: {
    ...mapActions({
      getAlerts: 'getAlerts',
      showSnackBar: 'showSnackBar',
    }),

    alertsDownload () {
      this.loadingAlerts = true
      this.getAlerts()
        .then(() => {})
        .catch(err => {
          this.showSnackBar({
            text: `${err} on Alerts download`,
            color: 'error',
          })
        })
        .finally(() => {
          this.loadingAlerts = false
        })
    },
  },
}
