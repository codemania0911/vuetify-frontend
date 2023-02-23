<template>
  <v-row class="files-section">
    <v-col
      cols="12"
      sm="4"
    >
      <base-material-card
        color="secondary"
        title="Categories"
      >
        <v-expansion-panels
          accordion
          flat
        >
          <v-expansion-panel
            v-for="(section, i) in sections"
            :key="i"
          >
            <v-expansion-panel-header
              class="doc-expansion-header no-down-icon"
              @click="getFiles(section)"
            >
              <div>
                <v-icon left>
                  {{ section.icon }}
                </v-icon>
                {{ section.title }}
              </div>
            </v-expansion-panel-header>
          </v-expansion-panel>
        </v-expansion-panels>
      </base-material-card>
    </v-col>

    <v-col
      cols="12"
      sm="8"
    >
      <base-material-card color="primary">
        <template v-slot:heading>
          <div class="text-h4 font-weight-light">
            {{ vesselClass.name }} Files
          </div>
          <div class="text-subtitle-1">
            {{ directory.title || 'Select a tab to browse files' }}
          </div>
        </template>

        <template v-if="directory.title">
          <v-progress-linear
            v-if="loadingFiles"
            indeterminate
          />
          <v-progress-linear
            v-if="uploadingProgress"
            :value="uploadingProgress"
            height="15"
            color="success"
            striped
          />
          <vue-dropzone
            v-if="role && isInternal(role.id)"
            :id="directory.code"
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
                  @click="getFileUrl(`files/vessel_classes/${$route.params.id}/${directory.code}/${item.name}`)"
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
        </template>
        <v-card-text
          v-else
          class="text-center"
        >
          <v-progress-linear
            v-if="loading"
            indeterminate
          />
          <v-icon
            size="100"
            color="grey"
          >
            mdi-source-repository-multiple
          </v-icon>

          <h4 class="text-h3 font-weight-light mb-3 black--text">
            {{ vesselClass.name }}
          </h4>
          <h4 class="text-h4 font-weight-light mb-3 black--text">
            {{ vesselClass.company_name }}
          </h4>
        </v-card-text>
      </base-material-card>
    </v-col>
  </v-row>
</template>

<script>
  import axios from 'axios'
  import vueDropzone from 'vue2-dropzone'
  import download from 'downloadjs'
  import { mapActions, mapState } from 'vuex'
  import { apiUrl } from '../../../../../config'
  import { isInternal } from '@/shared/management'
  import { getFileUrl } from '@/shared/fileUtils'

  export default {
    components: { vueDropzone },
    data: () => ({
      headers: [
        {
          text: 'File Name',
          value: 'name',
        },
        {
          text: 'Created At',
          value: 'created_at',
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
      sections: [
        { title: 'Fire Plans', icon: 'mdi-fire-extinguisher', code: 'prefire_plans' },
        { title: 'Drawings', icon: 'mdi-draw', code: 'drawings' },
        { title: 'Models', icon: 'mdi-laptop', code: 'models' },
      ],
      directory: {},
      isInternal,
      dropOptions: {
        url: '',
        dictDefaultMessage: '<b>Drag and drop to upload content</b><br/> or click to select a file from your computer.<br/>Maximum 5 files upload at a time. Maximum per file upload size 1024mb.',
        timeout: 18000000,
        maxFilesize: 1024,
        parallelUploads: 5,
      },
      uploadingProgress: 0,
      loadingFiles: false,
      files: [],
      selectedFiles: [],
      deleteDisabled: true,
      fab: {},
      vesselClass: {},
      loading: false,
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
      directory (newVal, oldVal) {
        if (this.$refs.dropzone) {
          this.$refs.dropzone.setOption('url', `${apiUrl}vessel-class/${this.$route.params.id}/documents/${newVal.code}/upload`)
          this.$refs.dropzone.setOption('headers', { Authorization: 'Bearer ' + this.$store.state.authentication.token })
        } else {
          this.dropOptions.url = `${apiUrl}vessel-class/${this.$route.params.id}/documents/${newVal.code}/upload`
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
        this.loading = true
        try {
          const vesselClass = await axios.get('vessel-class/' + this.$route.params.id)
          this.vesselClass = vesselClass.data[0]
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.loading = false
      },

      async getFiles (section) {
        this.directory = section
        this.loadingFiles = true
        try {
          const response = await axios.get(`vessel-class/${this.$route.params.id}/documents/${this.directory.code}`)
          this.files = response.data
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.loadingFiles = false
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

      async deleteFile (file) {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        const permitted = this.$confirm(`Please confirm that you would like to delete the following file: <b>${file.name}</b>`, { title: 'Warning' })
        if (permitted) {
          const response = await axios.delete(`vessel-class/${this.$route.params.id}/documents/${this.directory.code}/${file.name}/destroy`)
          this.showSnackBar({ text: response.data.message, color: 'success' })
          this.getFiles()
        }
      },

      async deleteAll () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        const permitted = this.$confirm('Please confirm that you would like to delete the following files?', { title: 'Warning' })
        if (permitted) {
          const response = await axios.post(`vesssel-class/${this.$route.params.id}/documents/${this.directory.code}/bulkdestroy`, this.selectedFiles)
          this.showSnackBar({ text: response.data.message, color: 'success' })
          this.getFiles()
        }
      },

      downloadFile (file) {
        axios({
          url: `vessel-class/${this.$route.params.id}/documents/${this.directory.code}/${file.name}/download`,
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

      fileUploaded (file, res) {
        this.$refs.dropzone.removeAllFiles()
        this.showSnackBar({ text: res.message, color: 'success' })
        this.getFiles()
      },

      getHref (file) {
        return `https://storage.googleapis.com/donjon-smit/files/vessel_classes/${this.$route.params.id}/${this.directory.code}/${file.name}`
      },

      checkUploadProgress (progress) {
        this.uploadingProgress = progress
        if (progress === 100) {
          this.uploadingProgress = 0
        }
      },
    },
  }
</script>

<style lang="sass">
  .doc-expansion-header
    font-size: 16px !important
  .no-down-icon
    .v-expansion-panel-header__icon
      display: none
</style>
