<template>
  <v-container
    id="vessels-index"
    fluid
  >
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
    <v-row v-if="showRightBar">
      <v-col class="d-md-none">
        <general-info
          class="cdt-info-card"
          :src="src"
          icon="mdi-ferry"
          :data="editedItem"
          :url="`vessels/${$route.params.id}/setPhoto`"
          :vessel="true"
          :timestamp="timestamp"
          @refetchData="refetchData"
        />
        <v-speed-dial
          v-if="showAis && role && isInternal(role.id)"
          v-model="aisFab"
          class="ais-fab"
          direction="bottom"
          transition="slide-y-reverse-transition"
        >
          <template v-slot:activator>
            <v-btn
              color="primary"
              dark
              absolute
              top
              medium
              right
              fab
            >
              <v-icon v-if="aisFab">
                mdi-close
              </v-icon>
              <v-icon v-else>
                mdi-access-point
              </v-icon>
            </v-btn>
          </template>
          <fetch-ais
            :aisrequest="aisrequest"
            @getExtendedAis="getExtendedAis"
            @get:data-from-api="getDataFromApi"
          />
        </v-speed-dial>
      </v-col>
      <v-col
        cols="12"
        md="8"
      >
        <router-view
          :aisdata="extendedAis"
          :refetch="refetch"
          @getAIS="getAIS"
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <general-info
          class="cdt-info-card hidden-sm-and-down"
          :src="src"
          icon="mdi-ferry"
          :data="editedItem"
          :url="`vessels/${$route.params.id}/setPhoto`"
          :vessel="true"
          :timestamp="timestamp"
          @refetchData="refetchData"
        />
        <fetch-ais
          v-if="showAis && role && isInternal(role.id)"
          class="hidden-sm-and-down"
          :aisrequest="aisrequest"
          @getExtendedAis="getExtendedAis"
          @get:data-from-api="getDataFromApi"
        />
        <template v-else>
          <!-- Plan Information -->
          <v-form
            ref="planInfoForm"
            lazy-validation
            @submit.prevent="assignPlan"
          >
            <base-material-card
              color="warning"
              icon="mdi-notebook"
              title="Plan Information"
            >
              <v-row>
                <v-col
                  cols="12"
                >
                  <v-autocomplete
                    v-model="editedItem.plan"
                    label="Name"
                    prepend-icon="mdi-notebook"
                    item-text="name"
                    item-value="id"
                    hide-selected
                    clearable
                    return-object
                    :loading="loadingPlans"
                    :items="planItems"
                    @change="assignPlanNumber"
                  />
                </v-col>
                <v-col
                  cols="12"
                  class="py-0"
                >
                  <v-text-field
                    v-model="editedItem.plan_number"
                    label="Plan Number"
                    prepend-icon="mdi-counter"
                    :loading="loadingPlans"
                    @input="searchPlans"
                  />
                </v-col>
                <v-col
                  cols="12"
                >
                  <v-autocomplete
                    v-model="editedItem.company_id"
                    :items="mixinItems.companies"
                    :loading="loadingMixins.companies"
                    item-text="name"
                    item-value="id"
                    clearable
                    prepend-icon="mdi-domain"
                    label="Company"
                  />
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-btn
                  color="success"
                  small
                  :loading="assigningPlan"
                  type="submit"
                >
                  <v-icon left>
                    mdi-content-save
                  </v-icon>
                  Save
                </v-btn>
                <v-btn
                  v-if="editedItem.plan"
                  color="warning"
                  small
                  :disabled="!editedItem.plan_number"
                  :to="`/plans/${editedItem.plan.id}`"
                >
                  <v-icon left>
                    mdi-notebook
                  </v-icon>
                  View
                </v-btn>
                <v-btn
                  color="primary"
                  small
                  :disabled="!editedItem.company_id"
                  :to="`/companies/${editedItem.company_id}`"
                >
                  <v-icon left>
                    mdi-domain
                  </v-icon>
                  View
                </v-btn>
              </v-row>
            </base-material-card>
          </v-form>
          <base-material-card
            v-if="djsaStatus(editedItem.active_field_id)"
            :color="editedItem.vrp_import === 1 ? 'gray' : djsaStatus(editedItem.active_field_id).color"
            :icon="editedItem.vrp_import === 1 ? 'mdi-shield-search' : djsaStatus(editedItem.active_field_id).planVesselIcon"
            badge
            :badge-icon="editedItem.networks_active === 1 ? 'mdi-star' : 'mdi-hard-hat'"
            :badge-color="editedItem.networks_active === 1 ? 'primary' : 'secondary'"
            :badge-value="editedItem.networks_active === 1 || editedItem.capabilies_active === 1"
            title="Vessel Options"
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
            <v-switch
              v-model="editedItem.capabilies_active"
              hide-details
              label="Capabilities"
              @click.stop="toggleSMFF"
            />
          </base-material-card>

          <!-- Company Options -->
          <company-options
            :company="editedItem.company"
            :disabled="true"
          />
          <networks
            v-if="editedItem.networks_active && !loadingAll"
            :networks="networks"
            :disabled="true"
          />
        </template>
      </v-col>
    </v-row>
    <router-view
      v-else
      :has-photo="editedItem && editedItem.has_photo"
      :company-has-photo="editedItem && editedItem.company_has_photo"
    />
  </v-container>
</template>

<script>
  import axios from 'axios'
  import { mapActions, mapState } from 'vuex'
  import { fetchInitials } from '@/mixins/fetchInitials'
  import { MIXINS } from '@/shared/constants'
  import { checkVesselsTab, isInternal, djsaStatus } from '@/shared/management'

  export default {
    components: {
      CompanyOptions: () => import('../../Companies/view/CompanyOptions'),
      FetchAis: () => import('../../components/FetchAis'),
      GeneralInfo: () => import('../../components/cards/GeneralInfo'),
      Networks: () => import('../../components/cards/Networks'),
    },
    mixins: [
      fetchInitials([
        MIXINS.companies,
      ]),
    ],
    data: () => ({
      rules: {
        required: value => !!value || 'This field is required.',
      },
      activeField: null,
      activeTab: 0,
      editedItem: {},
      aisInfo: {},
      networks: [],
      extendedAis: {},
      aisFab: false,
      aisrequest: {},
      isInternal,
      loadingPlans: false,
      timeout: null,
      planItems: [],
      assigningPlan: false,
      loadingAll: false,
      djsaStatus,
      refetch: false,
    }),
    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),

      timestamp () {
        let date = this.extendedAis && Object.keys(this.extendedAis).length && this.extendedAis.position ? this.extendedAis.position.timestamp : this.editedItem.ais_timestamp
        if (!date) return ''
        date = new Date(date.replace(' ', 'T'))
        if (date.toDateString() === 'Invalid Date' || date.toLocaleTimeString() === 'Invalid Date') return ''
        return date.toDateString() + ', ' + date.toLocaleTimeString() + ', UTC'
        // the original dt is UTC, it's converted to locale time, so converted time is still UTC, not locale
      },

      tabs () {
        if (this.role) return checkVesselsTab(this.role.id).map(tab => ({ ...tab, to: '/vessels/' + this.$route.params.id + '/' + tab.to }))
        else return []
      },

      showRightBar () {
        const path = this.$route.path
        return path.endsWith('general') ||
          path.endsWith('construction') ||
          path.endsWith('ais') ||
          path.endsWith('notes') ||
          path.endsWith('communication') ||
          path.endsWith('vrp')
      },

      showAis () {
        const path = this.$route.path
        return path.endsWith('ais')
      },

      companyName () {
        return (this.mixinItems.companies.find(company =>
          company.id === this.editedItem.company_id,
        ) || {}).name
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
        return this.editedItem.has_photo
          ? `https://storage.googleapis.com/donjon-smit/pictures/vessels/${this.$route.params.id}/cover_sqr.jpg?${new Date().getTime()}`
          : this.editedItem.company_has_photo
            ? `https://storage.googleapis.com/donjon-smit/pictures/companies/${this.editedItem.company_id}/cover_sqr.jpg`
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
      this.getExtendedAis()
      this.getPlanItems()
    },
    methods: {
      ...mapActions({
        showSnackBar: 'showSnackBar',
      }),

      searchPlans (planNumber) {
        if (this.timeout) clearTimeout(this.timeout)

        this.timeout = setTimeout(() => {
          planNumber && planNumber.length >= 5 && !this.loadingPlans && this.getPlanItems(planNumber)
        }, 1000)
      },

      getPlanItems (planNumber) {
        this.loadingPlans = true
        axios.post('plans/lists', { plan_number: planNumber })
          .then(res => {
            planNumber ? this.editedItem.plan = res.data[0] : this.planItems = res.data
            this.loadingPlans = false
          })
      },

      assignPlanNumber (e) {
        this.editedItem.plan_number = e ? e.plan_number : e
      },

      async assignPlan () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        if (this.$refs.planInfoForm.validate()) {
          this.assigningPlan = true
          try {
            const planId = this.editedItem.plan && this.editedItem.plan.id
            const response = await axios.put('vessels/' + this.$route.params.id + '/tags', { plan_id: planId, company_id: this.editedItem.company_id })
            this.showSnackBar({ text: response.data.message, color: response.data.success ? 'success' : 'error' })
          } catch (error) {
            this.showSnackBar({ text: error, color: 'error' })
          }
          this.assigningPlan = false
        }
      },

      getAIS (extended, satellite, pollType, flag) {
        this.aisrequest = { extended, satellite, pollType, flag }
      },

      getExtendedAis (ais) {
        this.extendedAis = ais
      },

      async getDataFromApi () {
        this.loadingAll = true
        try {
          const vessel = await axios.get('vessels/' + this.$route.params.id)
          this.editedItem = vessel.data.data[0]

          const additionalData = await axios.get('vessels/' + this.$route.params.id + '/smff')
          this.networks = additionalData.data.networks

          const ais = await axios.get('vessels/' + this.$route.params.id + '/ais')
          this.aisInfo = ais.data.data[0]

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
        axios.post('vessels/' + this.$route.params.id + '/toggleStatus', { active_field_id: this.activeField })
          .then(res => {
            this.showSnackBar({ text: res.data.message, color: 'success' })
            this.refetch = true
            this.getDataFromApi()
          })
      },

      toggleSMFF () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        if (this.editedItem.capabilies_active) {
          axios.post('vessels/' + this.$route.params.id + '/smff/create')
            .then(res => {
              this.showSnackBar({ text: res.data.message, color: 'success' })
              this.refetch = true
              this.getDataFromApi()
            })
        } else {
          axios.delete('vessels/' + this.$route.params.id + '/smff')
            .then(res => {
              this.showSnackBar({ text: res.data.message, color: 'success' })
              this.refetch = true
              this.getDataFromApi()
            })
        }
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
#vessels-index
  .ais-fab
    .v-speed-dial__list
      position: relative
</style>
