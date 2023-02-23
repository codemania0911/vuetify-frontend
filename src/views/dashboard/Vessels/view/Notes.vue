<template>
  <base-material-card
    color="primary"
    title="Notes"
  >
    <v-row
      class="justify-end mt-3 mb-2"
      no-gutters
    >
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            fab
            small
            color="success"
            @click="addMsg = true"
            v-on="on"
          >
            <v-icon>mdi-note-plus</v-icon>
          </v-btn>
        </template>
        <span>Add Note</span>
      </v-tooltip>
    </v-row>
    <base-material-tabs
      color="success"
      icons-and-text
      vertical
    >
      <v-tab
        v-for="(tab, i) in tabs"
        :key="i"
        class="mb-5"
      >
        {{ tab.text }}
        <v-icon v-text="tab.icon" />
      </v-tab>

      <v-tab-item class="px-5 text-center">
        <v-progress-linear
          v-if="loading"
          indeterminate
        />
        <v-timeline
          v-else-if="notes.length"
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
        <v-btn
          v-else
          color="primary"
          @click="addMsg = true"
        >
          <v-icon left>
            mdi-pen
          </v-icon>
          Be the first to add a note!
        </v-btn>
      </v-tab-item>

      <v-tab-item class="px-5 text-center">
        <v-btn
          color="primary"
        >
          <v-icon left>
            mdi-pen
          </v-icon>
          Be the first to add a note!
        </v-btn>
      </v-tab-item>
    </base-material-tabs>

    <v-dialog
      v-model="addMsg"
      max-width="500"
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
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            @click="addMsg = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="addNote"
          >
            Add Note
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </base-material-card>
</template>

<script>
  import axios from 'axios'
  import { mapActions, mapState } from 'vuex'
  import { isInternal } from '@/shared/management'

  export default {
    data: () => ({
      loading: false,
      notes: [],
      newNote: {
        note_type: 1,
      },
      addMsg: false,
      tabs: [
        {
          text: 'Main',
          icon: 'mdi-note-text',
        },
        // {
        //   text: 'Billing',
        //   icon: 'mdi-cash-usd',
        // },
      ],
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
      getDataFromApi () {
        this.loading = true
        axios.get('vessels/' + this.$route.params.id + '/notes')
          .then(res => {
            this.notes = res.data.data.map(note => ({
              ...note,
              img: note.has_photo ? `https://storage.googleapis.com/donjon-smit/pictures/individuals/${note.user_id}/cover_sqr.jpg?${new Date().getTime()}` : '',
            }))
            this.loading = false
          })
      },
      addNote () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        if (this.newNote.note) {
          axios.post(`vessels/${this.$route.params.id}/addNote`, this.newNote)
            .then(res => {
              this.addMsg = false
              this.showSnackBar({ text: res.data.message, color: 'success' })
              this.getDataFromApi()
            }).catch(error => {
              if (error.response && error.response.data) {
                this.showSnackBar({ text: error.response.data.message || error.response.statusText, color: 'error' })
              }
            })
        }
      },
      deleteNote (id) {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        this.$confirm('Please confirm that you would like to delete the note', {
          title: 'Warning',
          buttonTrueText: 'Delete',
          buttonFalseText: 'Cancel',
          buttonTrueColor: 'error',
          buttonFalseColor: 'primary',
        })
          .then(res => {
            if (res) {
              axios.delete('vessels/' + this.$route.params.id + '/notes/' + id + '/destroy')
                .then(res => {
                  this.showSnackBar({ text: res.data.message, color: 'success' })
                  this.getDataFromApi()
                })
            }
          })
      },
    },
  }
</script>
