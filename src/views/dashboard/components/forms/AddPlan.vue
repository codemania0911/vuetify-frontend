<template>
  <div class="add-plan-dlg pa-5">
    <h4 class="text-h3 font-weight-light text-center">
      Add New Plan
    </h4>
    <v-form
      ref="addPlanForm"
      lazy-validation
      @submit.prevent="addPlan"
    >
      <v-row>
        <v-col
          cols="12"
          sm="6"
        >
          <v-autocomplete
            v-model="plan.company_id"
            :items="mixinItems.companies"
            :loading="loadingMixins.companies"
            item-text="name"
            item-value="id"
            label="Company *"
            prepend-icon="mdi-domain"
            return-object
            clearable
            :rules="[v => !!v || 'Company is required']"
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-switch
            v-model="plan.use_same"
            label="Use company name for Plan"
            :disabled="!plan.company_id"
            @change="makeSame"
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-text-field
            v-model="plan.plan_holder_name"
            label="Holder Name *"
            :readonly="plan.use_same"
            prepend-icon="mdi-rename-box"
            :rules="[v => !!v || 'Name is required']"
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-autocomplete
            v-model="plan.plan_preparer_id"
            :items="mixinItems.qis"
            :loading="loadingMixins.qis"
            item-text="name"
            item-value="id"
            label="Plan Preparer *"
            prepend-icon="mdi-typewriter"
            clearable
            :rules="[v => !!v || 'Plan Preparer is required']"
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-autocomplete
            v-model="plan.qi_id"
            :items="mixinItems.qis"
            :loading="loadingMixins.qis"
            item-text="name"
            item-value="id"
            label="QI *"
            prepend-icon="mdi-clipboard-account"
            clearable
            :rules="[v => !!v || 'QI Company is required']"
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-text-field
            v-model="plan.plan_number"
            label="Plan Number"
            prepend-icon="mdi-counter"
            :hint="planNumberError"
            type="number"
            :loading="searching"
            @input="searchPlanNumber"
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
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
          sm="6"
        >
          <v-switch
            v-model="djsAActive"
            label="DJS-A Active"
            prepend-icon="mdi-shield-check-outline"
            @change="updateDjsAActive"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-spacer />
        <v-btn
          color="success"
          type="submit"
          :loading="adding"
        >
          Add Plan
        </v-btn>
      </v-row>
    </v-form>
  </div>
</template>

<script>
  import axios from 'axios'
  import { mapActions } from 'vuex'
  import { fetchInitials } from '@/mixins/fetchInitials'
  import { MIXINS } from '@/shared/constants'

  export default {
    mixins: [
      fetchInitials([
        MIXINS.companies,
        MIXINS.qis,
      ]),
    ],
    data: () => ({
      required: value => !!value || 'This field is required.',
      plan: {},
      searching: false,
      planNumberError: null,
      timeout: null,
      adding: false,
      djsActive: false,
      djsAActive: false,
    }),
    methods: {
      ...mapActions({
        showSnackBar: 'showSnackBar',
      }),

      searchPlanNumber (val) {
        if (this.timeout) clearTimeout(this.timeout)
        this.timeout = setTimeout(() => {
          if (val.length === 0) {
            this.planNumberError = null
          } else if (val.length < 5) {
            this.planNumberError = 'The minimum length of Plan Number is 5 Digits.'
          } else {
            this.searching = true
            this.getDuplicatePlanNumber(val)
          }
        }, 1000)
      },

      getDuplicatePlanNumber (planNumber) {
        axios.get(`plans/duplicatePlan/${planNumber}`)
          .then(res => {
            if (!res.data.success) {
              this.planNumberError = 'That Plan Number already exists.'
            } else {
              this.planNumberError = null
            }
          })
          .finally(() => {
            this.searching = false
          })
      },

      updateDjsActive (active) {
        if (active && this.djsAActive) {
          this.plan.active_field_id = 5
        } else if (active && !this.djsAActive) {
          this.plan.active_field_id = 2
        } else if (!active && this.djsAActive) {
          this.plan.active_field_id = 3
        } else if (!active && !this.djsAActive) {
          this.plan.active_field_id = 1
        }
      },

      updateDjsAActive (active) {
        if (active && this.djsActive) {
          this.plan.active_field_id = 5
        } else if (active && !this.djsActive) {
          this.plan.active_field_id = 3
        } else if (!active && this.djsActive) {
          this.plan.active_field_id = 2
        } else if (!active && !this.djsActive) {
          this.plan.active_field_id = 4
        }
      },

      async addPlan () {
        if (this.$refs.addPlanForm.validate()) {
          this.adding = true
          this.plan.active_field_id = this.plan.active_field_id || 1
          this.plan.company_id = this.plan.company_id.id
          const res = await axios.post('plans/create', this.plan)
          if (res.data.success) {
            this.adding = false
            this.$emit('complete', true)
          } else {
            const permitted = await this.$confirm(`${res.data.message} Do you want to proceed?`, { title: res.data.message })
            if (permitted) {
              this.plan.permitted = true
              const response = await axios.post('plans/create', this.plan)
              this.showSnackBar({ text: response.data.message, color: response.data.success ? 'success' : 'error' })
            }
            this.$emit('complete', true)
            this.adding = false
          }
        }
      },

      makeSame () {
        this.plan.plan_holder_name = this.plan.company_id.name
      },
    },
  }
</script>

<style lang="sass">
.add-plan-dlg
  background: white
</style>
