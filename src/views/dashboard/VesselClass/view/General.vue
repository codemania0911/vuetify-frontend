<template>
  <base-material-card
    color="primary"
  >
    <template v-slot:heading>
      <div class="text-h4 font-weight-light">
        {{ className }} General
      </div>
      <div class="text-subtitle-1">
        {{ companyName }}
      </div>
    </template>

    <v-progress-linear
      v-if="loadingVesselClass"
      indeterminate
    />

    <v-card-text>
      <v-form
        ref="vesselClassForm"
        lazy-validation
        @submit.prevent="saveVesselClass"
      >
        <v-row>
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              v-model="vesselClass.name"
              label="Class Name *"
              prepend-icon="mdi-source-repository-multiple"
              :rules="[rules.required]"
            />
          </v-col>

          <v-col
            cols="12"
            sm="6"
          >
            <v-autocomplete
              v-model="vesselClass.company_id"
              :items="mixinItems.companies"
              :loading="loadingMixins.companies"
              item-text="name"
              item-value="id"
              clearable
              :rules="[rules.required]"
              prepend-icon="mdi-domain"
              label="Company * (Plan Holder)"
            />
          </v-col>
        </v-row>

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
          :loading="deleting"
          @click="deleteVesselClass"
        >
          <v-icon left>
            mdi-delete
          </v-icon>
          Delete
        </v-btn>
      </v-form>
    </v-card-text>
  </base-material-card>
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
      ]),
    ],

    data: () => ({
      vesselClass: {},
      rules: {
        required: value => !!value || 'This field is required.',
      },
      loadingVesselClass: false,
      className: '',
      companyName: '',
      saving: false,
      deleting: false,
    }),

    mounted () {
      this.getDataFromApi()
    },

    methods: {
      ...mapActions({
        showSnackBar: 'showSnackBar',
      }),

      async getDataFromApi () {
        this.loadingVesselClass = true
        try {
          const response = await axios.get('vessel-class/' + this.$route.params.id)
          this.vesselClass = response.data[0]
          this.className = response.data[0].name
          this.companyName = response.data[0].company_name
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.loadingVesselClass = false
      },

      async saveVesselClass () {
        if (this.$refs.vesselClassForm.validate()) {
          this.saving = true
          try {
            const response = await axios.put('vessel-class/' + this.$route.params.id, this.vesselClass)
            this.showSnackBar({ text: response.data.message, color: 'success' })
            this.getDataFromApi()
          } catch (error) {
            this.showSnackBar({ text: error, color: 'error' })
          }
          this.saving = false
        }
      },

      async deleteVesselClass () {
        const confirm = await this.$confirm('Are you sure you want to delete this vessel class?', {
          title: 'Warning',
        })
        if (confirm) {
          try {
            const response = await axios.delete('vessel-class/' + this.$route.params.id)
            this.showSnackBar({ text: response.data.message, color: 'success' })
            this.$router.push('/vessel-class')
          } catch (error) {
            this.showSnackBar({ text: error, color: 'error' })
          }
        }
      },
    },
  }
</script>
