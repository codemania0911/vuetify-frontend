import { mapActions, mapState } from 'vuex'

export const fetchInitials = (mixins) => {
  return {
    data: () => ({
      loadingMixins: {},
    }),

    computed: {
      ...mapState({
        mixinItems (state) {
          const states = {}
          mixins.forEach(mixin => {
            states[mixin.item] = state.menuitems[mixin.item]
          })
          return states
        },
      }),
    },

    mounted () {
      this.fetchInitials()
    },

    methods: {
      ...mapActions({
        getInitials: 'getInitials',
        showSnackBar: 'showSnackBar',
      }),

      async fetchInitials () {
        // Find empty states
        const emptyStates = mixins.map(mixin => {
          if (!this.mixinItems[mixin.item].length) {
            return mixin
          }
        }).filter(state => state)

        // If all states have values, return
        if (!emptyStates.length) return

        try {
          // Used this.$set to update the data property dynamically in the nested object
          emptyStates.forEach(state => this.$set(this.loadingMixins, state.item, true))
          await this.getInitials(emptyStates)
          emptyStates.forEach(state => this.$set(this.loadingMixins, state.item, false))
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
      },
    },
  }
}
