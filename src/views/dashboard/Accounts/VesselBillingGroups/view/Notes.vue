<template>
  <base-material-card
    color="primary"
  >
    <template v-slot:heading>
      <div class="text-h4 font-weight-light">
        {{ group.name }} Notes
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
        v-model="note"
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
  import { mapActions, mapState } from 'vuex'
  import axios from 'axios'
  import { isInternal } from '@/shared/management'

  export default {
    data: () => ({
      loading: false,
      saving: false,
      note: '',
      group: {},
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
        this.loading = true
        try {
          const response = await axios.get('vessel-billing-group/note/' + this.$route.params.id)
          this.group = response.data
          this.note = response.data.note
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.loading = false
      },

      async saveNotes () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        this.saving = true
        try {
          const response = await axios.post('vessel-billing-group/note/' + this.$route.params.id, {
            note: this.note,
          })
          this.showSnackBar({ text: response.data.message, color: response.data.success ? 'success' : 'error' })
          this.getDataFromApi()
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.saving = false
      },
    },
  }
</script>
