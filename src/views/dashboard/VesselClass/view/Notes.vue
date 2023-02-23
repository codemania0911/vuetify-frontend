<template>
  <base-material-card
    color="primary"
  >
    <template v-slot:heading>
      <div class="text-h4 font-weight-light">
        {{ vesselClass.name }} Notes
      </div>
      <!-- <div class="text-subtitle-1">
        Company Name Goes Here
      </div> -->
    </template>

    <v-progress-linear
      v-if="loading"
      indeterminate
    />

    <v-card-text>
      <v-textarea
        v-model="vesselClass.note"
        label="Note"
      />
      <v-btn
        color="success"
        small
        :loading="saving"
        @click="saveNotes"
      >
        <v-icon left>
          mdi-content-save
        </v-icon>
        Save
      </v-btn>
    </v-card-text>
  </base-material-card>
</template>

<script>
  import { mapActions } from 'vuex'
  import axios from 'axios'

  export default {
    data: () => ({
      loading: false,
      saving: false,
      vesselClass: {},
    }),

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
          const response = await axios.get('vessel-class/note/' + this.$route.params.id)
          this.vesselClass = response.data
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.loading = false
      },

      async saveNotes () {
        this.saving = true
        try {
          const response = await axios.post('vessel-class/add-note/' + this.$route.params.id, { note: this.vesselClass.note })
          this.showSnackBar({ text: response.data.message, color: 'success' })
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.saving = false
      },
    },
  }
</script>
