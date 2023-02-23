<template>
  <base-material-card
    color="secondary"
    icon="mdi-account-tie"
    title="Account Managers"
  >
    <v-card-text>
      <v-progress-linear
        v-if="loadingManagers"
        indeterminate
      />
      <v-autocomplete
        v-model="managers.company_account_managers"
        label="Company Specific"
        prepend-icon="mdi-domain"
        multiple
        :items="mixinItems.accountManagers"
        :loading="loadingMixins.accountManagers"
        item-value="id"
        item-text="name"
      />
      <v-autocomplete
        v-model="managers.country_account_managers"
        label="Country Specific"
        prepend-icon="mdi-flag"
        disabled
        multiple
        :items="mixinItems.accountManagers"
        :loading="loadingMixins.accountManagers"
        item-value="id"
        item-text="name"
      />
      <v-autocomplete
        v-model="managers.region_account_managers"
        label="Regional"
        prepend-icon="mdi-earth-box"
        :items="mixinItems.accountManagers"
        :loading="loadingMixins.accountManagers"
        multiple
        disabled
        item-value="id"
        item-text="region"
      />

      <v-btn
        color="success"
        small
      >
        <v-icon left>
          mdi-content-save
        </v-icon>
        Save
      </v-btn>
    </v-card-text>
  </base-material-card>
</template>

<script>
  import axios from 'axios'
  import { mapActions, mapState } from 'vuex'
  import { fetchInitials } from '@/mixins/fetchInitials'
  import { MIXINS } from '@/shared/constants'

  export default {
    mixins: [
      fetchInitials([
        MIXINS.accountManagers,
      ]),
    ],

    data: () => ({
      loadingManagers: false,
      managers: {},
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
        this.loadingManagers = true
        try {
          const response = await axios.get('account-manager/company/' + this.$route.params.id)
          this.managers = response.data
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.loadingManagers = false
      },
    },
  }
</script>
