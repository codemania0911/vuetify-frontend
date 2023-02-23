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
      :plan="editedItem"
    />
    <v-row v-else>
      <v-col class="d-md-none">
        <general-info
          class="cdt-info-card"
          :src="src"
          icon="mdi-notebook"
          :data="editedItem"
          :url="editedItem.company ? `companies/${editedItem.company.id}/setPhoto` : ''"
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
          icon="mdi-notebook"
          :data="editedItem"
          :url="editedItem.company ? `companies/${editedItem.company.id}/setPhoto` : ''"
          @refetchData="refetchData"
        />
        <base-material-card
          v-if="djsaStatus(editedItem.active_field_id)"
          :color="editedItem.vrp_import === 1 ? 'gray' : djsaStatus(editedItem.active_field_id).color"
          :icon="editedItem.vrp_import === 1 ? 'mdi-shield-search' : djsaStatus(editedItem.active_field_id).planVesselIcon"
          badge
          :badge-icon="editedItem.company.networks_active === 1 ? 'mdi-star' : 'mdi-hard-hat'"
          :badge-color="editedItem.company.networks_active === 1 ? 'primary' : 'secondary'"
          :badge-value="editedItem.company.networks_active === 1 || editedItem.capabilies_active === 1"
          title="Plan Options"
        >
          <v-switch
            v-model="djsActive"
            label="DJS Active"
            hide-details
            @click.stop="toggleStatus"
          />
          <v-switch
            v-model="djsAActive"
            hide-details
            label="DJS-A Active"
            @click.stop="toggleStatus"
          />
        </base-material-card>

        <!-- Company Options -->
        <company-options
          :company="editedItem.company"
          :disabled="true"
        />

        <networks
          v-if="editedItem.company && editedItem.company.id && editedItem.company.networks_active && !loadingAll"
          :networks="networks"
          :disabled="true"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import axios from 'axios'
  import { mapActions, mapState } from 'vuex'
  import { checkPlansTab, isInternal, djsaStatus } from '@/shared/management'

  export default {
    components: {
      CompanyOptions: () => import('../../Companies/view/CompanyOptions'),
      GeneralInfo: () => import('../../components/cards/GeneralInfo'),
      Networks: () => import('../../components/cards/Networks'),
    },
    data: () => ({
      activeTab: 0,
      editedItem: {},
      networks: [],
      isInternal,
      loadingAll: false,
      activeField: null,
      djsaStatus,
      refetch: false,
    }),
    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),

      tabs () {
        if (this.role) return checkPlansTab(this.role.id).map(tab => ({ ...tab, to: '/plans/' + this.$route.params.id + '/' + tab.to }))
        else return []
      },

      shouldHideProfile () {
        const path = this.$route.path
        return path.endsWith('files') ||
          path.endsWith('individuals') ||
          path.endsWith('vessels')
      },

      existOpa () {
        if (this.editedItem.company && this.editedItem.company.networks_active && this.networks.includes('opa_90')) return 1
        else return 0
      },

      djsActive: {
        get () {
          return [2, 5].includes(this.editedItem.active_field_id)
        },
        set (val) {
          if (val && this.djsAActive) {
            this.activeField = 5
          } else if (val && !this.djsAActive) {
            this.activeField = 2
          } else if (!val && this.djsAActive) {
            this.activeField = 3
          } else if (!val && !this.djsAActive) {
            this.activeField = 1
          }
        },
      },

      djsAActive: {
        get () {
          return [3, 5].includes(this.editedItem.active_field_id)
        },
        set (val) {
          if (val && this.djsActive) {
            this.activeField = 5
          } else if (val && !this.djsActive) {
            this.activeField = 3
          } else if (!val && this.djsActive) {
            this.activeField = 2
          } else if (!val && !this.djsActive) {
            this.activeField = 4
          }
        },
      },

      src () {
        return this.editedItem.company && this.editedItem.company.has_photo
          ? `https://storage.googleapis.com/donjon-smit/pictures/companies/${this.editedItem.company.id}/cover_sqr.jpg?${new Date().getTime()}`
          : ''
      },
    },
    watch: {
      $route (to, from) {
        if (to.params.id !== from.params.id) {
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
        this.loadingAll = true
        try {
          const planData = await axios.get('plans/' + this.$route.params.id)
          this.editedItem = planData.data.data[0]

          const additionalData = await axios.get('companies/' + planData.data.data[0].company.id + '/smff')
          this.networks = additionalData.data.networks
          this.refetch = false
          this.loadingAll = false
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
      },
      toggleStatus () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        axios.post('plans/' + this.$route.params.id + '/toggleStatus', { active_field_id: this.activeField })
          .then(res => {
            this.showSnackBar({ text: res.data.message, color: 'success' })
            this.refetch = true
            this.getDataFromApi()
          })
      },
      openNewTab (url) {
        window.open(url, '_blank')
      },
      refetchData (val) {
        val && this.getDataFromApi()
      },
    },
  }
</script>

<style lang="sass">
.v-input__slot
  margin-bottom: 0
</style>
