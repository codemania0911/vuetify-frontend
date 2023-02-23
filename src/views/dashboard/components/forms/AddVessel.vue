<template>
  <base-material-wizard
    id="add-vessel-dlg"
    v-model="tab"
    title="Add Vessel"
    sub-title="Let's gather some information to start."
    :available-steps="availableSteps"
    :items="tabs"
    class="mx-auto"
    @click:next="nextTab"
    @click:prev="tab--"
  >
    <v-tab-item>
      <v-form
        ref="form1"
        v-model="valid[0]"
      >
        <v-row
          class="mx-auto"
          justify="space-around"
        >
          <v-col
            cols="12"
            md="6"
            class="d-flex align-center justify-center"
          >
            <choose-image
              :square-img.sync="squareImg"
              :rect-img.sync="rectImg"
              icon="mdi-ferry"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="vessel.name"
              label="Vessel Name *"
              prepend-icon="mdi-ferry"
              :rules="[v => !!v || 'Vessel name is required']"
            />
            <v-text-field
              v-model="vessel.ex_name"
              label="Ex Name"
              prepend-icon="mdi-form-textbox"
            />
            <v-text-field
              v-model="vessel.imo_number"
              :loading="searchingIMO"
              label="IMO Number"
              placeholder="IMO Number"
              prepend-icon="mdi-fingerprint"
              type="number"
              :hint="imoError"
              @input="searchIMO"
            />
            <v-text-field
              v-model="vessel.official_number"
              :loading="searchingOfficial"
              label="Official Number"
              placeholder="Official Number"
              prepend-icon="mdi-fingerprint"
              type="number"
              :hint="officialError"
              @input="searchOfficial"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col
            cols="12"
            md="6"
          >
            <v-autocomplete
              v-model="vessel.company"
              :items="mixinItems.companies"
              :loading="loadingMixins.companies"
              item-text="name"
              item-value="id"
              label="Company *"
              prepend-icon="mdi-domain"
              :rules="[v => !!v || 'Company is required']"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-autocomplete
              v-model="vessel.plan"
              :items="mixinItems.plans"
              :loading="loadingMixins.plans"
              item-text="plan_holder_name"
              item-value="id"
              label="Plan *"
              prepend-icon="mdi-domain"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-switch
              v-model="djsActive"
              label="DJS Active"
              prepend-icon="mdi-shield-check"
              @change="updateDjsActive"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-switch
              v-model="djsAActive"
              label="DJS-A Active"
              prepend-icon="mdi-shield-check-outline"
              @change="updateDjsAActive"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="vessel.email_primary"
              label="Primary Email"
              prepend-icon="mdi-email"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="vessel.email_secondary"
              label="Secondary Email"
              prepend-icon="mdi-email"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="vessel.phone_primary"
              label="SAT Telephone Primary"
              prepend-icon="mdi-phone"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="vessel.phone_secondary"
              label="SAT Telephone Secondary"
              prepend-icon="mdi-phone"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-switch
              v-model="vessel.is_tank"
              label="Is Tank Vessel"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="vessel.mmsi_number"
              label="MMSI Number"
              prepend-icon="mdi-antenna"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-autocomplete
              v-model="vessel.fleet"
              :items="mixinItems.fleets"
              :loading="loadingMixins.fleets"
              item-text="name"
              item-value="id"
              label="Fleet"
              prepend-icon="mdi-anchor"
              clearable
            />
          </v-col>
        </v-row>
      </v-form>
    </v-tab-item>
    <v-tab-item>
      <v-form
        ref="form2"
        v-model="valid[1]"
      >
        <v-row>
          <v-col
            cols="12"
            sm="6"
          >
            <v-autocomplete
              v-model="vessel.type"
              :items="mixinItems.vesselTypes"
              :loading="loadingMixins.vesselTypes"
              item-text="name"
              item-value="id"
              label="Vessel Type"
              prepend-icon="mdi-tag"
              clearable
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              v-model="vessel.deck_area"
              label="Deck Area"
              type="number"
              prepend-icon="mdi-texture-box"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              v-model="vessel.dead_weight"
              label="DeadWeight"
              prepend-icon="mdi-weight"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-autocomplete
              v-model="vessel.oil_group"
              :items="['I', 'II', 'III', 'IV', 'V']"
              item-text="name"
              item-value="id"
              label="Oil Group"
              prepend-icon="mdi-oil"
              clearable
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              v-model="vessel.oil_tank_volume"
              label="Oil Tank Volume"
              type="number"
              prepend-icon="mdi-hydraulic-oil-level"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              v-model="vessel.gross_tonnage"
              label="Gross Tonnage"
              prepend-icon="mdi-weight-gram"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col
            cols="12"
            sm="6"
          >
            <v-switch
              v-model="vessel.is_lead"
              label="Is Lead Ship"
            />
          </v-col>
          <!-- <v-col
            cols="12"
            sm="6"
          >
            Sister Ship
          </v-col> -->
        </v-row>
        <v-row
          v-if="vessel.is_lead"
          class="mx-auto"
          justify="space-around"
        >
          <v-col
            cols="12"
            md="6"
          >
            <v-autocomplete
              v-model="vessel.child_vessels"
              :items="childVessels"
              :loading="searchingChild"
              :search-input.sync="searchChild"
              hide-no-data
              hide-selected
              item-text="name"
              item-value="id"
              multiple
              label="Child Vessels"
              placeholder="Vessel Name or IMO"
              prepend-icon="mdi-ferry"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-autocomplete
              v-model="vessel.sister_vessels"
              :items="sisterVessels"
              :loading="searchingSister"
              :search-input.sync="searchSister"
              hide-no-data
              hide-selected
              item-text="name"
              item-value="id"
              multiple
              label="Sister Vessels"
              placeholder="Vessel Name or IMO"
              prepend-icon="mdi-ferry"
            />
          </v-col>
        </v-row>
        <v-row
          v-else
          class="mx-auto"
          justify="space-around"
        >
          <v-col
            cols="12"
            md="6"
          >
            <v-autocomplete
              v-model="vessel.parent_ship"
              :items="parentVessels"
              :loading="searchingParent"
              :search-input.sync="searchParent"
              hide-no-data
              hide-selected
              item-text="name"
              item-value="id"
              label="Parent Vessel"
              placeholder="Vessel Name or IMO"
              prepend-icon="mdi-ferry"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-autocomplete
              v-model="vessel.sister_ship"
              :items="leadSisterVessels"
              :loading="searchingLeadSister"
              :search-input.sync="searchLeadSister"
              hide-no-data
              hide-selected
              item-text="name"
              item-value="id"
              label="Lead Sister Vessel"
              placeholder="Vessel Name or IMO"
              prepend-icon="mdi-ferry"
            />
          </v-col>
        </v-row>
      </v-form>
    </v-tab-item>
    <v-tab-item>
      <v-row
        class="mx-auto"
        justify="space-around"
      >
        <v-col>
          <v-autocomplete
            v-model="vessel.qi_company"
            :items="mixinItems.qis"
            :loading="loadingMixins.qis"
            item-text="name"
            item-value="id"
            label="QI Company"
            prepend-icon="mdi-clipboard-account"
            clearable
          />
        </v-col>
      </v-row>
      <v-row
        class="mx-auto"
        justify="space-around"
      >
        <v-col
          cols="6"
          md="6"
        >
          <v-autocomplete
            v-model="vessel.pi_club"
            :items="mixinItems.pis"
            :loading="loadingMixins.pis"
            item-text="name"
            item-value="id"
            label="Protection &amp; Indemnity Club"
            prepend-icon="mdi-umbrella"
            clearable
            multiple
          />
        </v-col>
        <v-col
          cols="6"
          md="6"
        >
          <v-autocomplete
            v-model="vessel.insurer"
            :items="mixinItems.insurers"
            :loading="loadingMixins.insurers"
            item-text="name"
            item-value="id"
            label="Hull &amp; Machinery Insurer"
            prepend-icon="mdi-engine"
            clearable
            multiple
          />
        </v-col>
        <v-col
          cols="6"
          md="6"
        >
          <v-autocomplete
            v-model="vessel.society"
            :items="mixinItems.societies"
            :loading="loadingMixins.societies"
            item-text="name"
            item-value="id"
            label="Classification Society"
            prepend-icon="mdi-axis-arrow-lock"
            clearable
            multiple
          />
        </v-col>
        <v-col
          cols="6"
          md="6"
        >
          <v-autocomplete
            v-model="vessel.ds_provider"
            :items="mixinItems.providers"
            :loading="loadingMixins.providers"
            item-text="name"
            item-value="id"
            label="Damage Stability Provider"
            prepend-icon="mdi-chart-bell-curve"
            clearable
            multiple
          />
        </v-col>
      </v-row>
      <v-row
        class="mx-auto"
        justify="space-around"
      >
        <v-col>
          <v-textarea
            v-model="vessel.comments"
            label="Comments"
          />
        </v-col>
      </v-row>
    </v-tab-item>
  </base-material-wizard>
</template>

<script>
  import axios from 'axios'
  import { mapActions } from 'vuex'
  import { fetchInitials } from '@/mixins/fetchInitials'
  import { MIXINS } from '@/shared/constants'

  export default {
    components: {
      ChooseImage: () => import('./ChooseImage'),
    },

    mixins: [
      fetchInitials([
        MIXINS.fleets,
        MIXINS.plans,
        MIXINS.companies,
        MIXINS.insurers,
        MIXINS.providers,
        MIXINS.societies,
        MIXINS.qis,
        MIXINS.pis,
        MIXINS.vesselTypes,
      ]),
    ],

    props: {
      counter: {
        type: Number,
        default: 0,
      },
      companyId: {
        type: String,
        default: '',
      },
    },

    data: () => ({
      tab: 0,
      tabs: ['Information', 'Characteristics', 'Related Entities'],
      vessel: {},
      company: {},
      squareImg: null,
      rectImg: null,
      valid: [false, false, true],
      childVessels: [],
      sisterVessels: [],
      searchingChild: false,
      searchingSister: false,
      searchChild: null,
      searchSister: null,
      searchingIMO: false,
      searchingOfficial: false,
      imoError: null,
      officialError: null,
      parentVessels: [],
      leadSisterVessels: [],
      searchingParent: false,
      searchingLeadSister: false,
      searchParent: null,
      searchLeadSister: null,
      awaitingSearchIMO: false,
      awaitingSearchOfficial: false,
      timeoutIMO: null,
      timeoutOfficial: null,
      djsActive: false,
      djsAActive: false,
    }),

    computed: {
      availableSteps () {
        const steps = [0]
        if (this.valid[0]) steps.push(1)
        if (this.valid[1]) steps.push(2)
        if (this.valid[2]) steps.push(3)
        return steps
      },

      companyName () {
        return (this.mixinItems.companies.find(company =>
          company.id === this.vessel.company,
        ) || {}).name
      },
    },

    watch: {
      counter () {
        this.reset()
      },

      searchChild (val) {
        if (val === null) return
        else if (val.length === 0) {
          this.childVessels = []
          return
        } else if (this.childVessels.length > 0 || val.length < 3 || this.searchingChild) return
        this.searchingChild = true
        this.getChildSisterVessels(val, true)
      },

      searchSister (val) {
        if (val === null) return
        else if (val.length === 0) {
          this.sisterVessels = []
          return
        } else if (this.sisterVessels.length > 0 || val.length < 3 || this.searchingSister) return
        this.searchingSister = true
        this.getChildSisterVessels(val, false)
      },

      searchParent (val) {
        if (val === null) return
        else if (val.length === 0) {
          this.parentVessels = []
          return
        } else if (this.parentVessels.length > 0 || val.length < 3 || this.searchingParent) return
        this.searchingParent = true
        this.getLeadVessels(val, true)
      },

      searchLeadSister (val) {
        if (val === null) return
        else if (val.length === 0) {
          this.leadSisterVessels = []
          return
        } else if (this.leadSisterVessels.length > 0 || val.length < 3 || this.searchingLeadSister) return
        this.searchingLeadSister = true
        this.getLeadVessels(val, false)
      },
    },

    mounted () {
      if (this.companyId) {
        this.vessel.company = parseInt(this.companyId)
      }
    },

    methods: {
      ...mapActions({
        showSnackBar: 'showSnackBar',
      }),

      searchIMO (val) {
        if (this.timeoutIMO) clearTimeout(this.timeoutIMO)
        this.timeoutIMO = setTimeout(() => {
          if (val.length === 0) {
            this.imoError = null
          } else if (val.length < 7) {
            this.imoError = 'The minimum length of IMO is 7 Digits.'
          } else {
            this.searchingIMO = true
            this.getDuplicateVessels(val, 1)
          }
        }, 1000)
      },

      searchOfficial (val) {
        if (this.timeoutOfficial) clearTimeout(this.timeoutOfficial)
        this.timeoutOfficial = setTimeout(() => {
          if (val.length === 0) {
            this.officialError = null
          } else if (val.length < 6) {
            this.officialError = 'The minimum length of Official Number is 6 Digits.'
          } else {
            this.searchingOfficial = true
            this.getDuplicateVessels(val, 0)
          }
        }, 1000)
      },

      getDuplicateVessels (query, imoOrOfficial) {
        axios.get(`vessels/imoVessels/${query}/${imoOrOfficial}`)
          .then(res => {
            if (!res.data.success) {
              imoOrOfficial
                ? this.imoError = 'That IMO already exists.'
                : this.officialError = 'That Official Number already exists.'
            } else {
              imoOrOfficial
                ? this.imoError = null
                : this.officialError = null
            }
          })
          .finally(() => {
            imoOrOfficial
              ? this.searchingIMO = false
              : this.searchingOfficial = false
          })
      },

      getLeadVessels (query, parentOrSis) {
        axios.get(`vessels/lead/list?query=${query}`)
          .then(res => {
            parentOrSis ? this.parentVessels = res.data.data : this.leadSisterVessels = res.data.data
          })
          .finally(() => {
            parentOrSis ? this.searchingParent = false : this.searchingLeadSister = false
          })
      },

      getChildSisterVessels (query, childOrSis) {
        axios.get(`vessels/related/list?query=${query}`)
          .then(res => {
            childOrSis ? this.childVessels = res.data.data : this.sisterVessels = res.data.data
          })
          .finally(() => {
            childOrSis ? this.searchingChild = false : this.searchingSister = false
          })
      },

      updateDjsActive (active) {
        if (active && this.djsAActive) {
          this.vessel.active_field_id = 5
        } else if (active && !this.djsAActive) {
          this.vessel.active_field_id = 2
        } else if (!active && this.djsAActive) {
          this.vessel.active_field_id = 3
        } else if (!active && !this.djsAActive) {
          this.vessel.active_field_id = 1
        }
      },

      updateDjsAActive (active) {
        if (active && this.djsActive) {
          this.vessel.active_field_id = 5
        } else if (active && !this.djsActive) {
          this.vessel.active_field_id = 3
        } else if (!active && this.djsActive) {
          this.vessel.active_field_id = 2
        } else if (!active && !this.djsActive) {
          this.vessel.active_field_id = 4
        }
      },

      async nextTab () {
        if (!this.valid[this.tab]) return
        this.vessel.active_field_id = this.vessel.active_field_id || 1

        if (this.tab < this.tabs.length - 1) {
          this.tab++
        } else {
          if (this.vessel.is_lead) {
            this.vessel.parent_ship = null
            this.vessel.sister_ship = null
          } else {
            this.vessel.child_vessels = []
            this.vessel.sister_vessels = []
          }
          const res = await axios.post('vessels/create', this.vessel)
          if (res.data.success) {
            this.additionalAdding(res)
          } else {
            this.$confirm(res.data.message + 'Do you want to proceed?', { title: 'Duplicates detected.' })
              .then(permitted => {
                if (permitted) {
                  this.vessel.permitted = true
                  axios.post('vessels/create', this.vessel).then(res => {
                    this.additionalAdding(res)
                  })
                } else {
                  this.$emit('complete', true)
                }
              })
          }
        }
      },
      async additionalAdding (res) {
        this.showSnackBar({ text: res.data.message, color: 'success' })
        if (this.rectImg) {
          const formData = new FormData()
          formData.append('file_rect', this.rectImg)
          formData.append('file_sqr', this.squareImg)
          const photoRes = await axios.post(
            `vessels/${res.data.id}/setPhoto`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            },
          )
          this.showSnackBar({ text: photoRes.data.message, color: 'success' })
        }
        this.$emit('complete', true)
      },
      reset () {
        this.vessel = {}
        this.vessel.company = this.companyId ? Number(this.companyId) : Number(this.$route.params.id)
        this.tab = 0
        if (this.$refs.form1) this.$refs.form1.resetValidation()
        if (this.$refs.form2) this.$refs.form2.resetValidation()
      },
    },
  }
</script>

<style lang="sass">
#add-vessel-dlg
  @media (max-width: 900px)
    .v-tabs-bar__content
      flex-direction: column
    .v-tabs-bar--is-mobile
      height: 150px !important
    .v-tab--active
      background-color: #023b68
      border-color: #023b68
    .v-tabs-slider-wrapper
      display: none
</style>
