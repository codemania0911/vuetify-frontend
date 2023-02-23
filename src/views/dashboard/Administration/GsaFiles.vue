<template>
  <v-row class="gsa-file-section">
    <v-col
      cols="12"
      sm="4"
    >
      <base-material-card
        color="secondary"
        :title="`DONJON-SMIT ${djs ? '' : 'Americas '}Geographic Annexes`"
      >
        <v-progress-linear
          v-if="loadingCounts"
          indeterminate
        />

        <v-expansion-panels
          accordion
          flat
        >
          <v-expansion-panel
            v-for="(atu, i) in Object.keys(gsaFiles)"
            :key="i"
          >
            <template v-if="atu === 'all_areas'">
              <v-expansion-panel-header class="doc-expansion-header">
                General Information (All Areas)
              </v-expansion-panel-header>
            </template>

            <template v-else>
              <v-expansion-panel-header class="doc-expansion-header">
                USCG District #{{ atu }}
              </v-expansion-panel-header>
            </template>

            <v-expansion-panel-content>
              <p
                v-for="(area, j) in gsaFiles[atu]"
                :key="j"
                class="gsa-tab"
                @click="getFiles(area)"
              >
                {{ area.name }} ({{ area.count }})
              </p>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </base-material-card>
    </v-col>

    <v-col
      cols="12"
      sm="8"
    >
      <base-material-card
        v-if="area.object_id"
        color="primary"
        :title="area.name + ' Files'"
      >
        <v-progress-linear
          v-if="loadingFiles"
          indeterminate
        />

        <v-progress-linear
          v-if="uploadingProgress"
          :value="uploadingProgress"
          height="15"
          striped
          color="success"
        />

        <vue-dropzone
          v-if="role && isInternal(role.id)"
          :id="area.object_id + 'area'"
          ref="dropzone"
          :options="dropOptions"
          :destroy-dropzone="true"
          @vdropzone-success="fileUploaded"
          @vdropzone-total-upload-progress="checkUploadProgress"
        />

        <v-data-table
          v-model="selectedFiles"
          :headers="headers"
          :items="files"
          item-key="name"
          show-select
        >
          <template
            v-slot:[`item.name`]="{item}"
          >
            <v-icon
              color="secondary"
              size="24"
            >
              {{ getIconFromExt(item.ext) }}
            </v-icon>
            {{ item.name }}
          </template>
          <template
            v-slot:[`item.ext`]="{item}"
          >
            <v-speed-dial
              v-model="fab[item.name]"
              direction="left"
            >
              <template v-slot:activator>
                <v-btn
                  v-model="fab[item.name]"
                  fab
                  small
                  color="primary"
                >
                  <v-icon v-if="fab[item.name]">
                    mdi-close
                  </v-icon>
                  <v-icon v-else>
                    mdi-chevron-left
                  </v-icon>
                </v-btn>
              </template>
              <v-btn
                fab
                x-small
                color="primary"
                @click="downloadFile(item)"
              >
                <v-icon>mdi-cloud-download</v-icon>
              </v-btn>
              <v-btn
                fab
                x-small
                color="error"
                @click="deleteFile(item)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
              <v-btn
                fab
                x-small
                color="success"
                @click="getFileUrl(getHref(item))"
              >
                <v-icon>mdi-eye-check</v-icon>
              </v-btn>
            </v-speed-dial>
          </template>
        </v-data-table>
        <v-btn
          color="error"
          :disabled="deleteDisabled"
          class="offset-8"
          @click="deleteAll"
        >
          delete
        </v-btn>
      </base-material-card>
      <base-material-card
        v-else
        color="primary"
      >
        <template v-slot:heading>
          <div class="text-h3 font-weight-light">
            GSA Files
          </div>
          <div
            class="text-subtitle-1 font-weight-light"
          >
            Select a tab to browse files.
          </div>
        </template>

        <v-card-text class="text-center">
          <v-icon
            size="100"
            color="grey"
          >
            mdi-map
          </v-icon>
          <h4 class="text-h3 font-weight-light mb-3 black--text">
            DONJON-SMIT {{ djs ? '' : 'Americas ' }}Geographic Annexes
          </h4>
        </v-card-text>
      </base-material-card>
    </v-col>
  </v-row>
</template>

<script>
  import axios from 'axios'
  import { mapActions, mapState } from 'vuex'
  import download from 'downloadjs'
  import vueDropzone from 'vue2-dropzone'
  import { apiUrl } from '../../../../config'
  import { isInternal } from '@/shared/management'
  import { getFileUrl } from '@/shared/fileUtils'

  export default {
    components: { vueDropzone },
    props: {
      djs: {
        type: Boolean,
        default: false,
      },
    },

    data: () => ({
      headers: [
        {
          text: 'File Name',
          value: 'name',
        },
        {
          text: 'File Size',
          value: 'size',
        },
        {
          text: 'Actions',
          value: 'ext',
          sortable: false,
        },
      ],
      selectedFiles: [],
      deleteDisabled: true,
      activeTab: 0,
      loadingCounts: false,
      loadingFiles: false,
      gsaFiles: {},
      files: [],
      area: {},
      dropOptions: {
        url: '',
        dictDefaultMessage: '<b>Drag and drop to upload content</b><br/> or click to select a file from your computer.<br/>Maximum 5 files upload at a time. Maximum per file upload size 1024mb.',
        timeout: 18000000,
        maxFilesize: 1024,
        parallelUploads: 5,
      },
      isInternal,
      fab: {},
      uploadingProgress: 0,
      getFileUrl,
    }),

    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),
    },

    watch: {
      selectedFiles () {
        if (this.selectedFiles.length > 0) {
          this.deleteDisabled = false
        } else {
          this.deleteDisabled = true
        }
      },
      area (newVal, oldVal) {
        const djs = this.djs ? 'DJ-S' : 'DJ-S_A'
        if (this.$refs.dropzone) {
          this.$refs.dropzone.setOption('url', `${apiUrl}gsa/${newVal.atu}/documents/${newVal.object_id}/${djs}/upload`)
          this.$refs.dropzone.setOption('headers', { Authorization: 'Bearer ' + this.$store.state.authentication.token })
        } else {
          this.dropOptions.url = `${apiUrl}gsa/${newVal.atu}/documents/${newVal.object_id}/${djs}/upload`
          this.dropOptions.headers = { Authorization: 'Bearer ' + this.$store.state.authentication.token }
        }
      },
    },

    mounted () {
      this.getDataFromApi()
    },

    methods: {
      ...mapActions({
        showSnackBar: 'showSnackBar',
      }),

      async getDataFromApi () {
        this.loadingCounts = true
        try {
          const request = { admin: true, djs: this.djs }
          const response = await axios.post('gsa', request)
          this.gsaFiles = response.data
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.loadingCounts = false
      },

      async getFiles (area) {
        this.area = area
        this.loadingFiles = true
        try {
          const djs = this.djs ? 'DJ-S' : 'DJ-S_A'
          const response = await axios.get(`gsa/${area.atu}/documents/${area.object_id}/${djs}`)
          this.files = response.data
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.loadingFiles = false
      },

      async deleteFile (file) {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        const djs = this.djs ? 'DJ-S' : 'DJ-S_A'
        const permitted = await this.$confirm(`Please confirm that you would like to delete the following file: <b>${file.name}</b>`, { title: 'Warning' })
        if (permitted) {
          const response = await axios.delete(`gsa/${this.area.atu}/documents/${this.area.object_id}/${djs}/${file.name}/destroy`)
          this.showSnackBar({ text: response.data.message, color: 'success' })
          this.getFiles(this.area)
        }
      },

      async deleteAll () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        const djs = this.djs ? 'DJ-S' : 'DJ-S_A'
        const permitted = await this.$confirm('Please confirm that you would like to delete the following files?', { title: 'Warning' })
        if (permitted) {
          const response = await axios.post(`gsa/${this.area.atu}/documents/${this.area.object_id}/${djs}/bulkdestroy`, this.selectedFiles)
          this.showSnackBar({ text: response.data.message, color: 'success' })
          this.getFiles(this.area)
        }
      },

      getIconFromExt (ext) {
        if (ext === 'pdf') {
          return 'mdi-file-pdf'
        } else if (ext === 'docx') {
          return 'mdi-file-document'
        } else if (ext === 'png') {
          return 'mdi-file-image'
        }
        return 'mdi-file'
      },

      fileUploaded (file, res) {
        this.$refs.dropzone.removeAllFiles()
        this.showSnackBar({ text: res.message, color: 'success' })
        this.getFiles(this.area)
      },

      checkUploadProgress (progress) {
        this.uploadingProgress = progress
        if (progress === 100) {
          this.uploadingProgress = 0
        }
      },

      downloadFile (file) {
        const djs = this.djs ? 'DJ-S' : 'DJ-S_A'
        axios({
          url: `gsa/${this.area.atu}/documents/${this.area.object_id}/${djs}/${file.name}/download`,
          method: 'GET',
          responseType: 'blob',
          timeout: 18000000,
        }).then(downloadRes => {
          this.showSnackBar({ text: 'Download started', color: 'success' })
          download(downloadRes.data, file.name)
        }).catch(error => {
          this.showSnackBar({ text: error, color: 'error' })
        })
      },

      getHref (file) {
        const djs = this.djs ? 'DJ-S' : 'DJ-S_A'
        return `gsa/${djs}/${this.area.atu}/${this.area.object_id}/${file.name}`
      },
    },
  }
</script>

<style lang="sass">
.gsa-file-section
  .v-expansion-panel-content__wrap
    padding-bottom: 0
  .doc-expansion-header
    font-size: 16px
  .gsa-tab
    cursor: pointer
  .v-expansion-panel-content
    padding-left: 20px
</style>
