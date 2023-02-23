<template>
  <base-material-card
    color="primary"
    title="Network Membership"
    icon="mdi-security-network"
  >
    <v-progress-linear
      v-if="activatingNetwork || loadingMixins.networks"
      indeterminate
    />
    <v-switch
      v-for="networkItem in mixinItems.networks"
      :key="networkItem.id"
      v-model="selectedNetworks"
      :value="networkItem.code"
      hide-details
      :disabled="disabled"
      :label="networkItem.name"
      @change="activateNetwork"
    />
  </base-material-card>
</template>

<script>
  import axios from 'axios'
  import { mapActions, mapState } from 'vuex'
  import { fetchInitials } from '@/mixins/fetchInitials'
  import { MIXINS } from '@/shared/constants'
  import { isInternal } from '@/shared/management'

  export default {
    mixins: [
      fetchInitials([
        MIXINS.networks,
      ]),
    ],

    props: {
      networks: {
        type: Array,
        default: () => ([]),
      },
      url: {
        type: String,
        default: '',
      },
      disabled: {
        type: Boolean,
        default: false,
      },
    },

    data: () => ({
      activatingNetwork: false,
      selectedNetworks: [],
    }),

    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),
    },

    mounted () {
      this.selectedNetworks = this.networks
    },

    methods: {
      ...mapActions({
        showSnackBar: 'showSnackBar',
      }),

      async activateNetwork () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }

        this.activatingNetwork = true
        try {
          const response = await axios.post(this.url, { networks: this.selectedNetworks })
          // this.showSnackBar({ text: response.data.message, color: response.data.success ? 'success' : 'error' })
          this.showSnackBar({ text: response.data.message, color: 'success' })
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.activatingNetwork = false
      },
    },
  }
</script>
