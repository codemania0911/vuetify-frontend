<template>
  <div>
    <base-material-card
      color="primary"
      icon="mdi-ferry"
      title="Vessel Data"
    >
      <v-form
        ref="vesselForm"
        lazy-validation
        @submit.prevent="saveVessel"
      >
        <v-row>
          <v-col
            cols="12"
            md="4"
            sm="6"
          >
            <v-text-field
              v-model="editedItem.name"
              :rules="[rules.required]"
              prepend-icon="mdi-ferry"
              label="Vessel Name *"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
            sm="6"
          >
            <v-text-field
              v-model="editedItem.ex_name"
              prepend-icon="mdi-form-textbox"
              label="Ex Name"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
            sm="6"
          >
            <v-text-field
              v-model="editedItem.sister_ship"
              prepend-icon="mdi-family-tree"
              label="Sister Ship"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
            sm="6"
          >
            <v-text-field
              v-model="editedItem.imo"
              type="number"
              prepend-icon="mdi-fingerprint"
              label="IMO Number"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
            sm="6"
          >
            <v-text-field
              v-model="editedItem.official_number"
              prepend-icon="mdi-format-list-numbered"
              label="Official Number"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
            sm="6"
          >
            <v-text-field
              v-model="editedItem.mmsi"
              type="number"
              prepend-icon="mdi-antenna"
              label="MMSI Number"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
            sm="6"
          >
            <v-text-field
              v-model="editedItem.dead_weight"
              prepend-icon="mdi-weight"
              label="Deadweight"
              :rules="[rules.number]"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
            sm="6"
          >
            <v-text-field
              v-model="editedItem.deck_area"
              prepend-icon="mdi-texture-box"
              label="Deck Area (sq meters)"
              :rules="[rules.number]"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
            sm="6"
          >
            <v-text-field
              v-model="editedItem.oil_tank_volume"
              prepend-icon="mdi-hydraulic-oil-level"
              label="Oil Tank Volume (cubic meters)"
              :rules="[rules.number]"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
            sm="6"
          >
            <v-text-field
              v-model="editedItem.wcd"
              prepend-icon="mdi-hydraulic-oil-level"
              label="WCD"
              :rules="[rules.number]"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
            sm="6"
          >
            <v-text-field
              v-model="editedItem.gross_tonnage"
              prepend-icon="mdi-weight-gram"
              label="Gross Tonnage"
              :rules="[rules.number]"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
            sm="6"
          >
            <v-text-field
              v-model="editedItem.construction_built"
              prepend-icon="mdi-calendar-today"
              label="Year Built"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
            sm="6"
          >
            <v-select
              v-model="editedItem.oil_group"
              :items="['I', 'II', 'III', 'IV', 'V']"
              prepend-icon="mdi-oil"
              label="Oil Group"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
            sm="6"
          >
            <v-autocomplete
              v-model="editedItem.vessel_type_id"
              :items="mixinItems.vesselTypes"
              :loading="loadingMixins.vesselTypes"
              item-text="name"
              item-value="id"
              prepend-icon="mdi-tag"
              label="Vessel Type"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
            sm="6"
          >
            <v-switch
              v-model="editedItem.tanker"
              color="info"
              label="Is Tank Vessel"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-btn
            color="success"
            small
            type="submit"
            :loading="saving"
          >
            <v-icon left>
              mdi-content-save
            </v-icon>
            Save
          </v-btn>
          <v-btn
            color="error"
            small
            @click="deleteVessel"
          >
            <v-icon left>
              mdi-delete
            </v-icon>
            Delete
          </v-btn>
        </v-row>
      </v-form>
    </base-material-card>

    <!-- Vendors -->
    <base-material-card
      color="secondary"
      icon="mdi-shield-link-variant"
      title="Vendors"
    >
      <v-row>
        <v-col
          cols="12"
          sm="6"
        >
          <v-autocomplete
            v-model="editedItem.qi"
            :items="mixinItems.qis"
            :loading="loadingMixins.qis"
            item-text="name"
            item-value="id"
            label="QI"
            prepend-icon="mdi-anchor"
            multiple
            clearable
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-autocomplete
            v-model="editedItem.insurers"
            :items="mixinItems.insurers"
            :loading="loadingMixins.insurers"
            item-text="name"
            item-value="id"
            multiple
            clearable
            prepend-icon="mdi-engine"
            label="H & M Insurer"
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-autocomplete
            v-model="editedItem.pi"
            :items="mixinItems.pis"
            :loading="loadingMixins.pis"
            item-text="name"
            item-value="id"
            multiple
            clearable
            prepend-icon="mdi-umbrella"
            label="P & I Club"
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-autocomplete
            v-model="editedItem.societies"
            :items="mixinItems.societies"
            :loading="loadingMixins.societies"
            item-text="name"
            item-value="id"
            multiple
            clearable
            prepend-icon="mdi-axis-arrow-lock"
            label="Classification Society"
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-autocomplete
            v-model="editedItem.providers"
            :items="mixinItems.providers"
            :loading="loadingMixins.providers"
            item-text="name"
            item-value="id"
            multiple
            clearable
            prepend-icon="mdi-chart-bell-curve"
            label="Damage Stability Provider"
          />
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-btn
          color="success"
          small
          :loading="saving"
          @click="saveVessel"
        >
          <v-icon left>
            mdi-content-save
          </v-icon>
          Save
        </v-btn>
      </v-row>
    </base-material-card>
  </div>
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
        MIXINS.insurers,
        MIXINS.providers,
        MIXINS.societies,
        MIXINS.qis,
        MIXINS.pis,
        MIXINS.vesselTypes,
      ]),
    ],
    props: {
      refetch: {
        type: Boolean,
        default: false,
      },
    },
    data: () => ({
      rules: {
        required: value => !!value || 'This field is required.',
        number: value => {
          if (value && !/^[0-9,.]*$/.test(value)) {
            return 'This field should be the number'
          }
          return true
        },
      },
      loading: 0,
      editedItem: {},
      saving: false,
    }),
    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),
    },
    watch: {
      refetch (val) {
        if (val) {
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
      getDataFromApi () {
        this.loading++
        axios.get('vessels/' + this.$route.params.id)
          .then(res => {
            this.editedItem = res.data.data[0]
            this.loading--
          })
      },
      async saveVessel () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }

        if (this.$refs.vesselForm.validate()) {
          this.saving = true
          try {
            const response = await axios.post('vessels/' + this.$route.params.id, this.editedItem)
            this.showSnackBar({ text: response.data.message, color: 'success' })
            this.getDataFromApi()
          } catch (error) {
            this.showSnackBar({ text: error, color: 'error' })
          }
          this.saving = false
        }
      },
      deleteVessel () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        this.$confirm('You are about to delete this vessel. Are you sure that you want to proceed?', {
          title: 'Warning',
        })
          .then(res => {
            if (res) {
              axios.delete('vessels/' + this.editedItem.id + '/destroy')
                .then(res => {
                  this.$router.push('/vessels')
                  this.showSnackBar({ text: res.data.message, color: 'success' })
                })
                .catch(error => {
                  this.showSnackBar({ text: error.response.data.message || error.response.statusText, color: 'error' })
                })
            }
          })
      },
    },
  }
</script>
