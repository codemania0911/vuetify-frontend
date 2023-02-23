<template>
  <v-container
    id="alerts"
    fluid
    tag="section"
  >
    <v-row>
      <v-col
        cols="12"
        md="12"
      >
        <base-material-card
          color="black"
          title="Alerts"
          class="px-5 py-3"
        >
          <v-progress-linear
            v-if="loadingAlerts"
            indeterminate
          />
          <template v-else>
            <v-tabs
              v-model="tabs"
              background-color="transparent"
              slider-color="white"
            >
              <span
                class="subheading font-weight-light mx-3"
                style="align-self: center"
              >Alerts:</span>
              <v-tab class="mr-3">
                Dashboard
              </v-tab>
              <v-tab class="mr-3">
                Menu Bar
              </v-tab>
            </v-tabs>

            <v-tabs-items
              v-model="tabs"
              class="transparent"
            >
              <v-tab-item
                v-for="n in 2"
                :key="n"
              >
                <v-card-text>
                  <template v-for="alert in alertItems.alerts[tabs]">
                    <v-row
                      :key="alert.id"
                      align="center"
                    >
                      <v-col cols="1">
                        <v-list-item-action @click="activeOrNonAlert(alert.id, alert.active)">
                          <v-checkbox
                            v-model="alert.active"
                            color="success"
                          />
                        </v-list-item-action>
                      </v-col>

                      <v-col cols="9">
                        <div
                          class="font-weight-light"
                          v-text="alert.contents"
                        />
                      </v-col>

                      <v-col
                        cols="2"
                        class="text-right"
                      >
                        <v-icon
                          class="mx-1"
                          @click="changeAlert=true, changeContent = alert"
                        >
                          mdi-pencil
                        </v-icon>
                        <v-icon
                          color="error"
                          class="mx-1"
                          @click="deleteAlert(alert.id)"
                        >
                          mdi-close
                        </v-icon>
                      </v-col>
                    </v-row>
                  </template>
                </v-card-text>
              </v-tab-item>
            </v-tabs-items>
          </template>
        </base-material-card>
      </v-col>
    </v-row>

    <v-dialog
      v-model="addNewAlert"
      max-width="500"
    >
      <template v-slot:activator="{ on }">
        <v-btn
          color="success"
          class="mt-5"
          v-on="on"
        >
          Add Alert
        </v-btn>
      </template>
      <v-card>
        <v-card-title class="text-h5">
          New Alert
        </v-card-title>
        <v-card-text>
          <v-textarea
            v-model="newAlert.alert"
            label="Content *"
            :rules="[v => !!v || 'Note is required']"
          />
        </v-card-text>
        <v-col
          cols="12"
          sm="6"
        >
          <v-select
            v-model="category"
            :items="categories"
            :rules="[v => !!v || 'Note is required']"
            label="Category"
          />
        </v-col>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="error"
            @click="addNewAlert = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="success"
            @click="addAlert"
          >
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="changeAlert"
      max-width="500"
    >
      <v-card>
        <v-card-title class="text-h5">
          Change Alert Content
        </v-card-title>
        <v-card-text>
          <v-textarea
            v-model="changeContent.contents"
            label="Content *"
            :rules="[v => !!v || 'Note is required']"
          />
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="error"
            @click="changeAlert = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="success"
            @click="updateAlert"
          >
            update
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
  import axios from 'axios'
  import { mapActions } from 'vuex'
  import { alertsDownload } from '@/mixins/menuItemsDownload/alertsDownload'

  export default {
    name: 'Alerts',

    mixins: [alertsDownload],

    data: () => ({
      newAlert: {},
      changeContent: {
        id: 0,
        contents: null,
      },
      category: null,
      addNewAlert: false,
      changeAlert: false,
      newData: {},
      alerts: [],
      id: 0,
      tabs: 0,
      categories: [
        'dashboard',
        'menu bar',
      ],
    }),

    methods: {
      ...mapActions({
        showSnackBar: 'showSnackBar',
        getAlerts: 'getAlerts',
      }),
      addAlert () {
        if (this.newAlert.alert && this.category) {
          this.newData = {
            content: this.newAlert.alert,
            categories: this.category,
          }
          axios.post('alert/add-new', this.newData)
            .then(res => {
              this.addNewAlert = false
              this.showSnackBar({ text: res.data.message, color: 'success' })
              this.getAlerts()
            }).catch(error => {
              if (error.response && error.response.data) {
                this.showSnackBar({ text: error.response.data.message || error.response.statusText, color: 'error' })
              }
            })
        }
      },
      deleteAlert (id) {
        this.$confirm('Please confirm that you would like to delete the alert?', {
          title: 'Warning',
          buttonTrueText: 'Delete',
          buttonFalseText: 'Cancel',
          buttonTrueColor: 'error',
          buttonFalseColor: 'primary',
        })
          .then(res => {
            if (res) {
              axios.delete('alert/delete/' + id)
                .then(res => {
                  this.showSnackBar({ text: res.data.message, color: 'success' })
                  this.getAlerts()
                }).catch(error => {
                  if (error.response && error.response.data) {
                    this.showSnackBar({ text: error.response.data.message || error.response.statusText, color: 'error' })
                  }
                })
            }
          })
      },
      activeOrNonAlert (id, active) {
        this.newData = {
          active: active,
        }
        this.$confirm('Would you like to change the notification status?', {
          title: 'Warning',
          buttonTrueText: 'Change',
          buttonFalseText: 'Cancel',
          buttonTrueColor: 'error',
          buttonFalseColor: 'primary',
        })
          .then(res => {
            if (res) {
              axios.post('alert/active/' + id, this.newData)
                .then(res => {
                  this.showSnackBar({ text: res.data.message, color: 'success' })
                  this.getAlerts()
                }).catch(error => {
                  if (error.response && error.response.data) {
                    this.showSnackBar({ text: error.response.data.message || error.response.statusText, color: 'error' })
                  }
                })
            }
          })
      },
      updateAlert () {
        this.newData = {
          content: this.changeContent.contents,
        }
        axios.post('alert/update/' + this.changeContent.id, this.newData)
          .then(res => {
            this.changeAlert = false
            this.showSnackBar({ text: res.data.message, color: 'success' })
            this.getAlerts()
          }).catch(error => {
            if (error.response && error.response.data) {
              this.showSnackBar({ text: error.response.data.message || error.response.statusText, color: 'error' })
            }
          })
      },
    },
  }
</script>
