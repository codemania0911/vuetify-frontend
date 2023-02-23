<template>
  <base-material-card
    color="primary"
    icon="mdi-phone-dial"
    title="Communication"
  >
    <v-card-text>
      <v-progress-linear
        v-if="!!loading"
        indeterminate
      />
      <v-row>
        <v-col cols="12">
          Vessel "Company" Contacts (aka DPA)
        </v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-autocomplete
            v-model="editedItem.primary_poc_id"
            :items="vesselContactItems"
            item-text="name"
            item-value="id"
            clearable
            prepend-icon="mdi-office-building"
            label="Primary"
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-autocomplete
            v-model="editedItem.secondary_poc_id"
            :items="vesselContactItems"
            item-text="name"
            item-value="id"
            clearable
            prepend-icon="mdi-office-building"
            label="Secondary"
          />
        </v-col>
        <v-col cols="12">
          Vessel Contact Information
        </v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-text-field
            v-model="editedItem.sat_phone_primary"
            prepend-icon="mdi-phone"
            label="SAT Telephone Primary"
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-text-field
            v-model="editedItem.sat_phone_secondary"
            prepend-icon="mdi-phone"
            label="SAT Telephone Secondary"
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-text-field
            v-model="editedItem.email_primary"
            prepend-icon="mdi-email"
            label="Email Primary"
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
        >
          <v-text-field
            v-model="editedItem.email_secondary"
            prepend-icon="mdi-email"
            label="Email Secondary"
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
    </v-card-text>
  </base-material-card>
</template>

<script>
  import axios from 'axios'
  import { mapActions, mapState } from 'vuex'
  import { isInternal } from '@/shared/management'

  export default {
    data: () => ({
      loading: true,
      vesselContactItems: [],
      editedItem: {},
      saving: false,
    }),

    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),
    },

    mounted () {
      this.getDataFromApi()
    },

    methods: {
      ...mapActions({
        showSnackBar: 'showSnackBar',
      }),

      async getDataFromApi () {
        try {
          this.loading = true
          const communication = await axios.get('vessels/' + this.$route.params.id)
          this.editedItem = communication.data.data[0]

          const contactItems = await axios.get('companies/' + this.editedItem.company_id + '/contacts')
          this.vesselContactItems = contactItems.data
          this.loading = false
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
      },

      async saveVessel () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        this.saving = true
        try {
          const response = await axios.post('vessels/' + this.$route.params.id, this.editedItem)
          this.showSnackBar({ text: response.data.message, color: 'success' })
          this.getDataFromApi()
        } catch (error) {
          this.showSnackBar({ text: error.response.data.message || error.response.statusText, color: 'error' })
        }
        this.saving = false
      },
    },
  }
</script>
