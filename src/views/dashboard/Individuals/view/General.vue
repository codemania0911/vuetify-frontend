<template>
  <base-material-card
    color="primary"
    title="General Information"
  >
    <v-card-text>
      <v-row class="mb-3">
        <v-col
          cols="12"
          sm="4"
        >
          <v-select
            v-model="user.title"
            :items="['Mr', 'Mrs', 'Ms', 'CAPT']"
            label="Title"
            prepend-icon="mdi-account"
          />
        </v-col>
        <v-col
          cols="12"
          sm="4"
        >
          <v-text-field
            v-model="user.first_name"
            label="First Name"
            prepend-icon="mdi-account"
          />
        </v-col>
        <v-col
          cols="12"
          sm="4"
        >
          <v-text-field
            v-model="user.last_name"
            label="Last Name"
            prepend-icon="mdi-account"
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-text-field
            v-model="user.suffix"
            label="Suffix"
            prepend-icon="mdi-account"
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-text-field
            v-model="user.mobile_number"
            label="Mobile Number"
            prepend-icon="mdi-cellphone"
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-text-field
            v-model="user.work_phone"
            label="Work Phone"
            prepend-icon="mdi-cellphone"
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-text-field
            v-model="user.aoh_phone"
            label="AOH Phone"
            prepend-icon="mdi-cellphone"
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-text-field
            v-model="user.fax"
            label="Fax"
            prepend-icon="mdi-cellphone"
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-text-field
            v-model="user.occupation"
            label="Occupation"
            prepend-icon="mdi-briefcase"
          />
        </v-col>
        <v-col
          v-if="role && isInternal(role.id)"
          cols="12"
          sm="6"
        >
          <v-select
            v-model="user.role_id"
            :items="mixinItems.roles"
            :loading="loadingMixins.roles"
            item-text="name"
            item-value="id"
            label="User Role"
            prepend-icon="mdi-account-plus"
            clearable
          />
        </v-col>
        <v-col
          v-if="role && isInternal(role.id)"
          cols="12"
          sm="6"
        >
          <v-autocomplete
            v-model="user.type_ids"
            :items="mixinItems.userTypes"
            :loading="loadingMixins.userTypes"
            item-text="name"
            item-value="id"
            label="User Type"
            prepend-icon="mdi-account-child"
            multiple
            clearable
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-text-field
            v-model="user.email"
            label="E-mail *"
            prepend-icon="mdi-email"
            :rules="[ v => !!v || 'E-mail is required', v => /.+@.+/.test(v) || 'E-mail is invalid' ]"
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-text-field
            v-model="user.alternate_email"
            label="Alternate Email"
            prepend-icon="mdi-email"
          />
        </v-col>
        <v-col
          cols="12"
        >
          <v-textarea
            v-model="user.description"
            :label="`About ${user.first_name || 'User'} ${user.last_name || ''}`"
            prepend-icon="mdi-information"
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-text-field
            v-model="user.username"
            label="User Name *"
            prepend-icon="mdi-account"
            :rules="[v => !!v || 'User Name is required']"
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
          class="text-center"
        >
          <v-btn
            color="success"
            :to="'/individuals/' + $route.params.id + '/change-password'"
          >
            <v-icon left>
              mdi-lock
            </v-icon>
            Reset Password
          </v-btn>
        </v-col>
        <template v-if="role && isInternal(role.id)">
          <v-col
            cols="12"
          >
            <v-autocomplete
              v-model="companyId"
              :items="autoCompleteCompanyItems"
              item-text="name"
              item-value="id"
              label="Select Company"
              prepend-icon="mdi-domain"
            />
          </v-col>
          <v-container
            class="ml-2"
          >
            <v-row
              v-for="companyId in user.companies"
              :key="companyId"
            >
              <v-col
                :cols="companyId === user.primary_company_id ? 10 : 8"
              >
                <v-text-field
                  :value="getCompanyNameFromId(companyId)"
                  :label="companyId === user.primary_company_id ? 'Primary Company' : 'Secondary Company'"
                  readonly
                  prepend-icon="mdi-office-building"
                />
              </v-col>
              <v-col
                v-if="companyId !== user.primary_company_id"
                cols="2"
                class="d-flex"
              >
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      class="mx-auto my-auto"
                      fab
                      dark
                      small
                      color="primary"
                      v-on="on"
                      @click="setPrimaryCompany(companyId)"
                    >
                      <v-icon>
                        mdi-star
                      </v-icon>
                    </v-btn>
                  </template>
                  <span>Set Primary</span>
                </v-tooltip>
              </v-col>
              <v-col
                cols="2"
                class="d-flex"
              >
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      class="mx-auto my-auto"
                      fab
                      dark
                      small
                      color="warning"
                      v-on="on"
                      @click="deleteCompanyFromUser(companyId)"
                    >
                      <v-icon>
                        mdi-delete
                      </v-icon>
                    </v-btn>
                  </template>
                  <span>Delete</span>
                </v-tooltip>
              </v-col>
            </v-row>
          </v-container>
        </template>
      </v-row>
      <v-btn
        color="success"
        small
        :loading="saving"
        @click="saveUser"
      >
        Save
      </v-btn>
      <v-btn
        color="error"
        small
        :loading="deleting"
        @click="deleteUser"
      >
        Delete User
      </v-btn>
    </v-card-text>
  </base-material-card>
</template>

<script>
  import axios from 'axios'
  import { mapActions, mapState } from 'vuex'
  import { fetchInitials } from '@/mixins/fetchInitials'
  import { MIXINS } from '@/shared/constants'
  import { isInternal, guardAPI } from '@/shared/management'

  export default {
    mixins: [
      fetchInitials([
        MIXINS.companies,
        MIXINS.userTypes,
        MIXINS.roles,
      ]),
    ],
    props: {
      individual: {
        type: Object,
        default: () => ({}),
      },
    },
    data: () => ({
      company_name: null,
      companyId: null,
      saving: false,
      deleting: false,
      guardAPI,
      isInternal,
    }),
    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),
      user () {
        return this.individual
      },
      autoCompleteCompanyItems () {
        const companyIds = (this.user && this.user.companies) || []
        return this.mixinItems.companies.filter(
          item => !companyIds.includes(item.id),
        )
      },
    },
    watch: {
      companyId (value) {
        if (!value || this.user.companies.includes(value)) return
        if (!(this.user && this.user.companies)) return
        this.user.companies.push(value)
        this.setPrimaryCompany()
        this.companyId = null
      },
    },
    methods: {
      ...mapActions({
        showSnackBar: 'showSnackBar',
      }),
      async saveUser () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        this.saving = true
        try {
          let response = await axios.post('users/' + this.$route.params.id, { user: this.user })
          if (response.data.success) {
            this.showSnackBar({ text: response.data.message, color: 'success' })
          } else {
            const decision = await this.$confirm(`${response.data.message} Do you want to proceed?`, { title: 'Duplicate Detected' })
            if (decision) {
              this.user.permitted = true
              response = await axios.post('users/' + this.$route.params.id, { user: this.user })
              this.showSnackBar({ text: response.data.message, color: response.data.success ? 'success' : 'error' })
            }
          }
          this.$emit('refetchData', true)
        } catch (err) {
          this.showSnackBar({ text: err, color: 'error' })
        }
        this.saving = false
      },
      deleteUser () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        this.$confirm(`You are about to delete this individual: <b>${this.user.first_name} ${this.user.last_name}</b>`, {
          title: 'Warning',
        }).then(res => {
          if (res) {
            this.deleting = true
            axios.delete('users/' + this.$route.params.id + '/destroy')
              .then(res => {
                this.$router.push('/individuals')
                this.showSnackBar({ text: res.data.message, color: 'success' })
                this.deleting = false
              })
          }
        })
      },
      /**
       * set primary company id
       * if companyId is undefined, set the first company in companies as primary company
       */
      setPrimaryCompany (companyId) {
        if (!this.user.companies.length) return
        this.user.primary_company_id = companyId || this.user.companies[0]
        this.rearrangeCompanies()
      },

      getCompanyNameFromId (companyId) {
        return (this.mixinItems.companies.find(company =>
          company.id === companyId,
        ) || {}).name || ''
      },

      /**
       * delete company from user
       * need to consider if the company is the primary_company
       * if then, set the primary_company again
       */
      deleteCompanyFromUser (companyId) {
        if (companyId === this.user.primary_company_id) {
          this.user.primary_company_id = null
        }
        this.user.companies = this.user.companies.filter(
          company => company !== companyId,
        )
        this.setPrimaryCompany()
      },

      /**
       * rearrange user.companies
       * to set the first id in companies the primary_company_id
       */
      rearrangeCompanies () {
        this.user.companies = [
          this.user.primary_company_id,
          ...this.user.companies.filter(company =>
            company !== this.user.primary_company_id,
          ),
        ]
      },
    },
  }
</script>
