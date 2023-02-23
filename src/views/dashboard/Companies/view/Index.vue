<template>
  <v-container fluid>
    <base-material-tabs
      v-model="activeTab"
      background-color="transparent"
      centered
      color="secondary"
      icons-and-text
      show-arrows
    >
      <template v-for="(tab, i) in tabs">
        <v-tab
          :key="i"
          :to="tab.to"
        >
          {{ tab.title }}
          <v-icon v-text="tab.icon" />
        </v-tab>
      </template>
    </base-material-tabs>
    <router-view
      v-if="shouldHideProfile"
      :company="editedItem"
    />
    <v-row v-else>
      <v-col class="d-md-none">
        <general-info
          class="cdt-info-card"
          :src="src"
          icon="mdi-domain"
          :data="editedItem"
          :url="`companies/${$route.params.id}/setPhoto`"
          @refetchData="refetchData"
        />
      </v-col>
      <v-col
        cols="12"
        md="8"
      >
        <router-view
          :exist="existOpa"
          :refetch="refetch"
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <general-info
          class="cdt-info-card hidden-sm-and-down"
          :src="src"
          icon="mdi-domain"
          :data="editedItem"
          :url="`companies/${$route.params.id}/setPhoto`"
          @refetchData="refetchData"
        />

        <company-options
          v-if="!$route.path.endsWith('billing-info')"
          :company="editedItem"
          @refetchData="refetchData"
        />

        <networks
          v-if="editedItem.networks_active && !$route.path.endsWith('billing-info') && !loading"
          :networks="networks"
          :url="`companies/${$route.params.id}/network`"
        />

        <company-billing-options
          v-if="$route.path.endsWith('billing-info')"
          :company="editedItem"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import axios from 'axios'
  import { mapActions, mapState } from 'vuex'
  import { checkCompaniesTab, isInternal } from '@/shared/management'

  export default {
    components: {
      CompanyOptions: () => import('./CompanyOptions'),
      CompanyBillingOptions: () => import('./CompanyBillingOptions'),
      GeneralInfo: () => import('../../components/cards/GeneralInfo'),
      Networks: () => import('../../components/cards/Networks'),
    },
    data: () => ({
      activeTab: 0,
      loading: false,
      editedItem: {},
      networks: [],
      isInternal,
      refetch: false,
    }),
    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),

      tabs () {
        if (this.role) return checkCompaniesTab(this.role.id).map(tab => ({ ...tab, to: '/companies/' + this.$route.params.id + '/' + tab.to }))
        else return []
      },

      shouldHideProfile () {
        const path = this.$route.path
        return path.endsWith('files') ||
          path.endsWith('affiliates') ||
          path.endsWith('individuals') ||
          path.endsWith('plans') ||
          path.endsWith('smff') ||
          path.endsWith('vessels')
      },

      existOpa () {
        if (this.editedItem.networks_active && this.networks.includes('opa_90')) return 1
        else return 0
      },

      src () {
        return this.editedItem.has_photo
          ? `https://storage.googleapis.com/donjon-smit/pictures/companies/${this.$route.params.id}/cover_sqr.jpg?${new Date().getTime()}`
          : ''
      },
    },
    watch: {
      $route (to, from) {
        if (to.params.id !== from.params.id || from.fullPath.endsWith('smff')) {
          this.getDataFromApi()
        }
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
        this.loading = true
        try {
          const companyData = await axios.get('companies/' + this.$route.params.id)
          this.editedItem = companyData.data.data[0]

          const additionalData = await axios.get('companies/' + this.$route.params.id + '/smff')
          this.networks = additionalData.data.networks
          this.refetch = false
          this.loading = false
        } catch (error) {
          if (error.response.status === 403) {
            this.$router.push('/')
            this.showSnackBar({ text: 'You don\'t have sufficient role.', color: 'error' })
          } else {
            this.showSnackBar({ text: error, color: 'error' })
          }
        }
      },
      openNewTab (url) {
        window.open(url, '_blank')
      },
      refetchData (val) {
        this.refetch = val
        val && this.getDataFromApi()
      },
    },
  }
</script>

<style lang="sass">
.v-input__slot
  margin-bottom: 0
</style>
