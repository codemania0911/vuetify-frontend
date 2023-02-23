<template>
  <div>
    <base-material-card
      color="warning"
      title="Plan Information"
      icon="mdi-notebook"
    >
      <v-progress-linear
        v-if="!!loading"
        indeterminate
      />
      <v-card-text>
        <v-row>
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              v-model="editedItem.plan_holder_name"
              label="Name *"
              prepend-icon="mdi-notebook"
              :rules="[rules.required]"
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
            cols="12"
            sm="6"
          >
            <v-text-field
              v-model="editedItem.plan_number"
              label="Plan Number"
              prepend-icon="mdi-counter"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-autocomplete
              v-model="editedItem.qi_id"
              :items="mixinItems.qis"
              :loading="loadingMixins.qis"
              :disabled="!isInternal(role && role.id)"
              item-text="name"
              item-value="id"
              label="QI Company"
              prepend-icon="mdi-clipboard-account"
              clearable
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-autocomplete
              v-model="editedItem.plan_preparer_id"
              label="Plan Preparer"
              :items="mixinItems.qis"
              :loading="loadingMixins.qis"
              :disabled="!isInternal(role && role.id)"
              item-text="name"
              item-value="id"
              clearable
              prepend-icon="mdi-notebook-edit"
            />
          </v-col>
        </v-row>

        <v-row v-if="isInternal(role && role.id)">
          <v-col
            cols="12"
            sm="6"
            class="d-flex"
          >
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
              :loading="deleting"
              @click="deletePlan"
            >
              <v-icon left>
                mdi-delete
              </v-icon>
              Delete
            </v-btn>
          </v-col>
          <v-col
            cols="12"
            sm="6"
            class="d-flex justify-end"
          >
            <v-btn
              color="secondary"
              small
              :disabled="!editedItem.qi_id"
              :to="`/companies/${editedItem.qi_id}`"
            >
              <v-icon left>
                mdi-clipboard-account
              </v-icon>
              View
            </v-btn>
            <v-btn
              color="primary"
              small
              :disabled="!editedItem.plan_preparer_id"
              :to="`/companies/${editedItem.plan_preparer_id}`"
              class="mr-0"
            >
              <v-icon left>
                mdi-notebook-edit
              </v-icon>
              View
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </base-material-card>

    <base-material-card
      color="primary"
      title="Company Information"
      icon="mdi-domain"
    >
      <v-progress-linear
        v-if="!!loading"
        indeterminate
      />
      <v-card-text>
        <v-row>
          <v-col
            v-if="editedItem.company"
            cols="12"
          >
            <v-autocomplete
              v-model="editedItem.company.id"
              :items="mixinItems.companies"
              :loading="loadingMixins.companies || changing"
              item-text="name"
              item-value="id"
              label="Company *"
              prepend-icon="mdi-domain"
              clearable
              :rules="[rules.required]"
              @change="changeCompany"
            />
          </v-col>
          <v-col sm="6">
            <v-text-field
              v-model="editedItem.phone"
              label="Phone Number"
              prepend-icon="mdi-phone"
              disabled
            />
          </v-col>
          <v-col sm="6">
            <v-text-field
              v-model="editedItem.fax"
              label="Fax"
              prepend-icon="mdi-fax"
              disabled
            />
          </v-col>
          <v-col sm="6">
            <v-text-field
              v-model="editedItem.email"
              label="E-mail"
              prepend-icon="mdi-email"
              disabled
            />
          </v-col>
          <v-col sm="6">
            <v-text-field
              v-model="editedItem.website"
              label="Website"
              prepend-icon="mdi-web"
              disabled
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="editedItem.description"
              label="About"
              prepend-icon="mdi-information"
              disabled
            />
          </v-col>
        </v-row>
        <v-btn
          v-if="editedItem.company && editedItem.company.id"
          color="success"
          small
          :to="`/companies/${editedItem.company.id}`"
        >
          <v-icon left>
            mdi-file-edit
          </v-icon>
          View Company to Edit
        </v-btn>
      </v-card-text>
    </base-material-card>

    <base-material-card
      v-if="editedItem.exist_opa_company"
      color="secondary"
      title="OPA-90 Network Information"
      icon="mdi-security-network"
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
              clearable
              disabled
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
              disabled
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
              disabled
            />
          </v-col>
          <v-btn
            v-if="editedItem.company"
            color="success"
            small
            :to="`/companies/${editedItem.company.id}`"
          >
            <v-icon left>
              mdi-content-save
            </v-icon>
            View Company to Edit
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
  import { isInternal } from '@/shared/management'
  import { mapState } from 'vuex'

  export default {
    mixins: [
      fetchInitials([
        MIXINS.companies,
        MIXINS.qis,
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
      rules: {
        required: value => !!value || 'This field is required.',
        email: v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
      },
      loading: 0,
      editedItem: {},
      opaNetworkCompanies: [],
      isInternal,
      changing: false,
      deleting: false,
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
        axios.get('plans/' + this.$route.params.id)
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
        axios.post('plans/' + this.$route.params.id, this.editedItem)
          .then(res => {
            this.showSnackBar({ text: res.data.message, color: 'success' })
            this.getDataFromApi()
          })
      },

      deletePlan () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        this.$confirm(`Please confirm that you would like to delete the following plan: <b>${this.editedItem.plan_holder_name}</b> <br />
        All vessels listed in the plan will no longer be listed in a plan.`, { title: 'Warning' })
          .then(res => {
            if (res) {
              this.deleting = true
              axios.delete('plans/' + this.editedItem.id + '/destroy')
                .then(res => {
                  this.deleting = false
                  this.$router.push('/plans')
                })
            }
          })
      },

      async changeCompany () {
        if (this.editedItem.company.id) {
          this.changing = true
          try {
            const response = await axios.post('plans/updatePlanCompany/' + this.$route.params.id + '/' + this.editedItem.company.id)
            this.showSnackBar({ text: response.data.message, color: response.data.success ? 'success' : 'error' })
          } catch (error) {
            this.showSnackBar({ text: error, color: 'error' })
          }
          this.changing = false
        }
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
