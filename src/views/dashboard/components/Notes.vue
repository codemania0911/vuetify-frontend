<template>
  <v-row>
    <v-col cols="12">
      <v-progress-linear
        v-if="loading"
        indeterminate
      />
    </v-col>

    <v-col
      cols="12"
      class="text-right"
    >
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            color="success"
            @click="addMsg = true"
            v-on="on"
          >
            <v-icon left>
              mdi-note-plus
            </v-icon>
            Create a New Note
          </v-btn>
        </template>
        <span>Add Note</span>
      </v-tooltip>
    </v-col>

    <v-col cols="12">
      <v-timeline
        v-if="notes.length"
        align-top
        dense
      >
        <v-timeline-item
          v-for="(note, i) in notes"
          :key="i"
          fill-dot
          large
        >
          <template v-slot:icon>
            <v-avatar v-if="note.img">
              <img :src="note.img">
            </v-avatar>
            <v-icon
              v-else
              dark
            >
              mdi-account
            </v-icon>
          </template>
          <v-card class="pa-6">
            <v-chip
              color="primary"
              class="text-overline mb-3"
              small
            >
              By {{ note.user }}
            </v-chip>
            <p
              class="text-subtitle-1"
              v-text="note.note"
            />
            <div
              class="text-uppercase text-body-2 d-flex justify-space-between align-center"
            >
              <span>{{ note.created_at }}</span>
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    fab
                    small
                    color="error"
                    @click="deleteNote(note.id)"
                    v-on="on"
                  >
                    <v-icon>mdi-note-remove</v-icon>
                  </v-btn>
                </template>
                <span>Delete Note</span>
              </v-tooltip>
            </div>
          </v-card>
        </v-timeline-item>
      </v-timeline>
    </v-col>

    <v-dialog
      v-model="addMsg"
      max-width="500"
    >
      <v-form
        ref="noteForm"
        lazy-validation
        @submit.prevent="addNote"
      >
        <v-card>
          <v-card-title class="text-h5">
            New Note
          </v-card-title>
          <v-card-text>
            <v-textarea
              v-model="newNote.note"
              label="Note *"
              :rules="[v => !!v || 'Note is required']"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              @click="addMsg = false"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              type="submit"
              :loading="adding"
            >
              Add Note
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </v-row>
</template>

<script>
  import axios from 'axios'
  import { mapActions, mapState } from 'vuex'
  import { isInternal } from '@/shared/management'

  export default {
    props: {
      type: {
        type: String,
        default: '',
      },
    },

    data: () => ({
      addMsg: false,
      newNote: {
        note_type: 1,
      },
      loading: false,
      notes: [],
      adding: false,
    }),

    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),
    },

    mounted () {
      this.getNotes()
    },

    methods: {
      ...mapActions({
        showSnackBar: 'showSnackBar',
      }),

      async getNotes () {
        this.loading = true
        try {
          const response = await axios.get(`${this.type}/${this.$route.params.id}/notes`)
          this.notes = response.data.data.map(note => ({
            ...note,
            img: note.has_photo ? `https://storage.googleapis.com/donjon-smit/pictures/individuals/${note.user_id}/cover_sqr.jpg?${new Date().getTime()}` : '',
          }))
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.loading = false
      },

      async addNote () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }

        if (this.$refs.noteForm.validate()) {
          this.adding = true
          try {
            const response = await axios.post(`${this.type}/${this.$route.params.id}/addNote`, this.newNote)
            this.addMsg = false
            this.showSnackBar({ text: response.data.message, color: response.data.success ? 'success' : 'error' })
            this.getNotes()
          } catch (error) {
            this.showSnackBar({ text: error, color: 'error' })
          }
          this.adding = false
        }
      },

      async deleteNote (id) {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }

        const confirm = await this.$confirm('Please confirm that you would like to delete this note.', { title: 'Warning' })
        if (confirm) {
          try {
            const response = await axios.delete(`${this.type}/${this.$route.params.id}/notes/${id}/destroy`)
            this.showSnackBar({ text: response.data.message, color: response.data.success ? 'success' : 'error' })
            this.getNotes()
          } catch (error) {
            this.showSnackBar({ text: error, color: 'error' })
          }
        }
      },
    },
  }
</script>
