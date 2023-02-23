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
    <v-row v-if="!showFiles">
      <v-col class="d-md-none">
        <general-info
          class="cdt-info-card"
          :src="src"
          icon="mdi-account"
          :data="editedItem"
          :url="`users/${$route.params.id}/setPhoto`"
          @refetchData="refetchData"
        />
      </v-col>
      <v-col
        cols="12"
        md="8"
      >
        <v-progress-linear
          v-if="loading"
          indeterminate
        />
        <router-view
          :individual="editedItem"
          @refetchData="refetchData"
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <general-info
          class="cdt-info-card hidden-sm-and-down"
          :src="src"
          icon="mdi-account"
          :data="editedItem"
          :url="`users/${$route.params.id}/setPhoto`"
          @refetchData="refetchData"
        />
        <base-material-card
          color="primary"
          icon="mdi-checkbox-multiple-marked"
          title="Activate Options"
        >
          <div class="status-badge">
            <v-badge
              bottom
              bordered
              overlap
              :icon="editedItem.networks_active === 1 ? 'mdi-star' : 'mdi-hard-hat'"
              :color="editedItem.networks_active === 1 ? 'warning' : 'secondary'"
              :value="editedItem.networks_active === 1 || editedItem.capabilies_active === 1"
            >
              <span>
                <v-icon
                  v-if="editedItem.active"
                  color="success"
                  size="30"
                >
                  mdi-shield-account
                </v-icon>
                <v-icon
                  v-else
                  color="error"
                  size="30"
                >
                  mdi-shield-account
                </v-icon>
              </span>
            </v-badge>
          </div>
          <v-switch
            v-model="editedItem.active"
            label="Active"
            hide-details
            @click.stop="toggleStatus"
          />
          <v-switch
            v-model="editedItem.capabilies_active"
            label="Capabilities"
            hide-details
            @click.stop="toggleSMFF"
          />
          <v-switch
            v-model="editedItem.vendor_active"
            hide-details
            disabled
            label="Vendor"
          />
          <v-switch
            v-model="editedItem.networks_active"
            hide-details
            disabled
            label="Network Membership"
          />
        </base-material-card>

        <networks
          v-if="editedItem.networks_active && !loading"
          :networks="networks"
          :disabled="true"
        />
      </v-col>
    </v-row>
    <router-view v-else />
  </v-container>
</template>

<script>
  import axios from 'axios'
  import { mapActions, mapState } from 'vuex'
  import { checkIndividualsTab, isInternal, canSeeIndividuals } from '@/shared/management'

  export default {
    components: {
      GeneralInfo: () => import('../../components/cards/GeneralInfo'),
      Networks: () => import('../../components/cards/Networks'),
    },
    data: () => ({
      activeTab: 0,
      editedItem: {},
      networks: [],
      loading: false,
    }),
    computed: {
      ...mapState({
        role: state => state.authentication.role,
        user: state => state.authentication.user,
      }),

      tabs () {
        if (this.role) return checkIndividualsTab(this.role.id).map(tab => ({ ...tab, to: '/individuals/' + this.$route.params.id + '/' + tab.to }))
        else return []
      },

      showFiles () {
        const path = this.$route.path
        return path.endsWith('files') ||
          path.endsWith('smff')
      },

      src () {
        return this.editedItem.has_photo
          ? `https://storage.googleapis.com/donjon-smit/pictures/individuals/${this.$route.params.id}/cover_sqr.jpg?${new Date().getTime()}`
          : this.editedItem.primary_company && this.editedItem.primary_company.has_photo
            ? `https://storage.googleapis.com/donjon-smit/pictures/companies/${this.editedItem.primary_company_id}/cover_sqr.jpg`
            : ''
      },
    },
    watch: {
      user: {
        handler (user) {
          if (Object.keys(user).length && user.id !== parseInt(this.$route.params.id)) {
            if (!canSeeIndividuals(this.role.id)) {
              this.$router.push('/')
            }
          }
        },
        deep: true,
        immediate: true,
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
          const response = await axios.get('users/' + this.$route.params.id)
          this.editedItem = response.data.data[0]

          const additionalData = await axios.get('users/' + this.$route.params.id + '/smff')
          this.networks = additionalData.data.networks
          this.loading = false
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
      },

      toggleStatus () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        axios.post('users/' + this.$route.params.id + '/toggleStatus')
          .then(res => {
            this.showSnackBar({ text: res.data.message, color: 'success' })
            this.getDataFromApi()
          }).catch(error => {
            this.showSnackBar({ text: error.response.data.message || error.response.statusText, color: 'error' })
          })
      },
      toggleSMFF () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        if (this.editedItem.capabilies_active) {
          axios.post('users/' + this.$route.params.id + '/smff/create')
            .then(res => {
              this.showSnackBar({ text: res.data.message, color: 'success' })
              this.getDataFromApi()
            })
        } else {
          axios.delete('users/' + this.$route.params.id + '/smff')
            .then(res => {
              this.showSnackBar({ text: res.data.message, color: 'success' })
              this.getDataFromApi()
            })
        }
      },
      refetchData (val) {
        val && this.getDataFromApi()
      },
    },
  }
</script>
