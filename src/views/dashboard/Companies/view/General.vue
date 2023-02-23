<template>
  <div>
    <base-material-card
      color="primary"
      title="General Information"
    >
      <v-progress-linear
        v-if="!!loading"
        indeterminate
      />
      <v-card-text>
        <v-row>
          <v-col
            cols="12"
            :sm="(editedItem.vendor_type_id && editedItem.vendor_type_id === 6) ? '6' : '12'"
          >
            <v-text-field
              v-model="editedItem.name"
              label="Name: *"
              prepend-icon="mdi-domain"
            />
          </v-col>
          <v-col
            v-if="editedItem.vendor_type_id && editedItem.vendor_type_id === 6"
            cols="12"
            sm="6"
          >
            <v-text-field
              v-model="editedItem.shortname"
              label="Shortname"
              prepend-icon="mdi-rename-box"
            />
          </v-col>
          <v-col
            v-if="adminDutyQi(role && role.id)"
            cols="12"
            sm="6"
          >
            <v-autocomplete
              v-model="editedItem.operating_company_id"
              :items="mixinItems.companies"
              :loading="loadingMixins.companies"
              item-text="name"
              item-value="id"
              label="Operating Company"
              prepend-icon="mdi-domain"
              clearable
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              v-model="editedItem.phone"
              label="Phone Number"
              prepend-icon="mdi-phone"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              v-model="editedItem.fax"
              label="Fax"
              prepend-icon="mdi-fax"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              v-model="editedItem.email"
              label="E-mail *"
              prepend-icon="mdi-email"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              v-model="editedItem.website"
              label="Website"
              prepend-icon="mdi-web"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="editedItem.description"
              label="About:"
              prepend-icon="mdi-information"
              class="input-field"
            />
          </v-col>
        </v-row>
        <v-btn
          color="success"
          small
          @click="saveEdit"
        >
          <v-icon left>
            mdi-content-save
          </v-icon>
          Save
        </v-btn>
        <v-btn
          color="error"
          small
          @click="deleteCompany"
        >
          <v-icon left>
            mdi-delete
          </v-icon>
          Delete
        </v-btn>
      </v-card-text>
    </base-material-card>
    <base-material-card
      v-if="editedItem.exist_opa_company"
      color="secondary"
      title="OPA-90 Network Information"
    >
      <v-progress-linear
        v-if="!!loading"
        indeterminate
      />
      <v-card-text>
        <v-row>
          <v-col
            cols="12"
          >
            <v-autocomplete
              v-model="editedItem.contracted_company_id"
              label="Contract is with which entity, if other than above named company?"
              prepend-icon="mdi-domain"
              :items="opaNetworkCompanies"
              item-text="name"
              item-value="id"
              :loading="fetchingContractedCompany"
              clearable
              @change="getCodes(editedItem.contracted_company_id)"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              v-model="editedItem.unique_identification_number_djs"
              label="DONJON-SMIT GSA Designator"
              prepend-icon="mdi-counter"
              :disabled="editedItem.contracted_company_id ? true : false"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              v-model="editedItem.unique_identification_number_ardent"
              label="Ardent Americas GSA Designator"
              prepend-icon="mdi-counter"
              :disabled="editedItem.contracted_company_id ? true : false"
            />
          </v-col>
          <v-btn
            color="success"
            small
            @click="saveOpaNetwork"
          >
            <v-icon left>
              mdi-content-save
            </v-icon>
            Save
          </v-btn>
        </v-row>
      </v-card-text>
    </base-material-card>
  </div>
</template>

<script>
  import axios from 'axios'
  import { fetchInitials } from '@/mixins/fetchInitials'
  import { MIXINS } from '@/shared/constants'
  import { isInternal, adminDutyQi } from '@/shared/management'
  import { mapState } from 'vuex'

  export default {
    mixins: [
      fetchInitials([
        MIXINS.companies,
      ]),
    ],
    props: {
      exist: {
        type: Number,
        default: 0,
      },
      refetch: {
        type: Boolean,
        default: false,
      },
    },
    data: () => ({
      loading: 0,
      editedItem: {},
      opaNetworkCompanies: [],
      contractedCompany: {},
      adminDutyQi,
      fetchingContractedCompany: false,
    }),
    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),
    },
    watch: {
      exist (val) {
        this.editedItem.exist_opa_company = val ? 1 : 0
      },
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
      getDataFromApi () {
        this.loading++
        axios.get('companies/opaNetwork')
          .then(res => {
            this.opaNetworkCompanies = res.data
          })
        axios.get('companies/' + this.$route.params.id)
          .then(res => {
            this.editedItem = res.data.data[0]
            if (this.exist) {
              this.editedItem.exist_opa_company = 1
            }
            this.loading--
          })
      },
      saveEdit () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        axios.post('companies/' + this.$route.params.id, this.editedItem)
          .then(res => {
            this.showSnackBar({ text: res.data.message, color: 'success' })
            this.getDataFromApi()
          })
      },
      deleteCompany () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        this.$confirm(`Please confirm that you would like to delete the following company: <b>${this.editedItem.name}</b>`, { title: 'Warning' })
          .then(res => {
            if (res) {
              axios.delete('companies/' + this.editedItem.id + '/destroy')
                .then(res => {
                  this.$router.push('/companies')
                })
            }
          })
      },
      saveOpaNetwork () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        axios.post('companies/network/' + this.$route.params.id, this.editedItem)
          .then(res => {
            this.showSnackBar({ text: res.data.message, color: 'success' })
            this.getDataFromApi()
          })
      },
      getCodes (id) {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        this.fetchingContractedCompany = true
        axios.get('companies/opaNetwork/' + id)
          .then(res => {
            this.contractedCompany = res.data
            this.editedItem.unique_identification_number_ardent = res.data.unique_identification_number_ardent
            this.editedItem.unique_identification_number_djs = res.data.unique_identification_number_djs
          }).finally(() => {
            this.fetchingContractedCompany = false
          })
      },
    },
  }
</script>

<style lang="sass">
  .input-container
    margin-top: 1rem
  .input-label
    font-size: 18px
    font-weight: 300
    color: black
    .v-icon
      font-size: 20px !important
  .input-field
    padding: 0
</style>
