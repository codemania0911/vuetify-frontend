<template>
  <v-col
    cols="12"
    md="8"
  >
    <!-- If files are fetched -->
    <base-material-card
      v-if="Object.keys(directory).length"
      :title="directory.name"
      color="primary"
    >
      <!-- Loading Files -->
      <v-progress-linear
        v-if="loadingFiles"
        indeterminate
      />

      <!-- Uploading Progress -->
      <v-progress-linear
        v-if="uploadingProgress"
        height="15"
        striped
        color="success"
        :value="uploadingProgress"
      />

      <!-- Dropzone -->
      <vue-dropzone
        v-if="role && isInternal(role.id)"
        id="upload-zone"
        ref="dropzone"
        :options="dropOptions"
        :destroy-dropzone="true"
        @vdropzone-success="fileUploaded"
        @vdropzone-total-upload-progress="checkUploadProgress"
      />

      <!-- Generate Button -->
      <v-btn
        v-if="role && isInternal(role.id) && directory.generated"
        color="secondary"
        class="mb-2"
        block
        :loading="generating"
        @click="generateDlg = true"
      >
        Generate New Document
      </v-btn>

      <!-- Table showing Files -->
      <v-data-table
        :headers="headers"
        :items="filteredFiles"
        class="mt-6"
      >
        <template v-slot:[`item.name`]="{item}">
          <v-icon
            color="secondary"
            size="24"
          >
            {{ getIconFromExt(item.ext) }}
          </v-icon>
          {{ item.name }}
        </template>

        <template v-slot:[`item.ext`]="{item}">
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
              v-if="item.name.slice(item.name.length - 3) === 'pdf'"
              fab
              x-small
              color="success"
              @click="getDocumentHRef(item, 'pdf')"
            >
              <v-icon>mdi-eye-check</v-icon>
            </v-btn>
            <v-btn
              v-else
              fab
              x-small
              color="success"
              @click="getDocumentHRef(item, 'docx')"
            >
              <v-icon>mdi-eye-check</v-icon>
            </v-btn>
          </v-speed-dial>
        </template>
      </v-data-table>
    </base-material-card>

    <!-- If at first load -->
    <base-material-card
      v-else
      title="Files"
      color="primary"
    >
      <v-progress-linear
        v-if="loading"
        indeterminate
      />

      <v-card-text class="text-center">
        <v-img
          v-if="src"
          :src="src"
          class="img-avatar"
        />
        <v-icon
          v-else
          size="100"
          color="grey"
        >
          {{ icon }}
        </v-icon>
        <h4 class="text-h3 font-weight-light mb-3 black--text">
          {{ title }}
        </h4>
        <h6 class="text-h4 mb-1 grey--text">
          {{ subtitle }}
        </h6>
      </v-card-text>
    </base-material-card>

    <v-dialog
      v-model="generateDlg"
      max-width="600"
      persistent
    >
      <v-form
        ref="form"
        lazy-validation
        @submit.prevent="generateDocument"
      >
        <v-card class="text-center">
          <v-card-title class="pt-5">
            Generate Document

            <v-spacer />
            <v-icon
              aria-label="Close"
              @click="generateDlg = false"
            >
              mdi-close
            </v-icon>
          </v-card-title>

          <v-card-text class="text-left">
            <v-menu
              v-model="document.menu"
              :close-on-content-click="false"
              transition="scroll-y-transition"
              min-width="290px"
              offset-y
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-model="document.dateIssued"
                  label="Issue Date *"
                  prepend-icon="mdi-calendar"
                  readonly
                  :rules="[v => !!v || 'Issue Date is required']"
                  v-on="on"
                />
              </template>
              <v-date-picker
                v-model="document.dateIssued"
                no-title
                color="secondary"
                @input="document.menu = false"
              />
            </v-menu>

            <!-- If the directory has vessel -->
            <template v-if="directory.hasVessel">
              <v-radio-group
                v-model="document.vesselType"
                row
                @change="filterVesselItems"
              >
                <v-radio
                  v-for="(vesselType, i) in vesselTypes"
                  :key="i"
                  :label="vesselType.text"
                  :value="vesselType.value"
                />
              </v-radio-group>
              <v-autocomplete
                v-model="document.vessel"
                :items="filteredVessels"
                item-text="name"
                item-value="id"
                label="Vessel *"
                prepend-icon="mdi-ferry"
                clearable
                :loading="loadingVessels"
                :rules="[v => !!v || 'Vessel is required']"
              />
            </template>

            <!-- If the directory is from Schedule A -->
            <v-radio-group
              v-if="directory.activity"
              v-model="document.donjon_active"
              :rules="[v => !!v || 'Select anyone above']"
            >
              <v-radio
                v-for="(activity, i) in activities"
                :key="i"
                :label="activity.text"
                :value="activity.donjon_active"
              />
            </v-radio-group>

            <!-- If the directory has addresses -->
            <v-autocomplete
              v-if="directory.hasAddress"
              v-model="document.address"
              :items="addressItems"
              label="Address *"
              prepend-icon="mdi-map-marker"
              clearable
              :loading="loadingAddresses"
              :rules="[v => !!v || 'Address is required']"
            />
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="success"
              type="submit"
            >
              Generate
            </v-btn>
            <v-btn
              color="error"
              type="button"
              @click="generateDlg = false"
            >
              Cancel
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </v-col>
</template>

<script>
  import axios from 'axios'
  import vueDropzone from 'vue2-dropzone'
  import download from 'downloadjs'
  import { mapActions, mapState } from 'vuex'
  import { isInternal } from '@/shared/management'
  import { makeDocumentFormat, getFileUrl } from '@/shared/fileUtils'
  import { apiUrl } from '../../../../../config'

  export default {
    components: { vueDropzone },

    props: {
      icon: {
        type: String,
        default: 'mdi-account',
      },
      subtitle: {
        type: String,
        default: '',
      },
      title: {
        type: String,
        default: '',
      },
      src: {
        type: String,
        default: '',
      },
      directory: {
        type: Object,
        default: () => ({}),
      },
      loading: {
        type: Boolean,
        default: false,
      },
    },

    data: () => ({
      loadingFiles: false,
      loadingVessels: false,
      loadingAddresses: false,
      uploadingProgress: 0,
      dropOptions: {
        url: apiUrl,
        dictDefaultMessage: '<b>Drag and drop to upload content</b><br/> or click to select a file from your computer.<br/>Maximum 5 files upload at a time. Maximum per file upload size 1024mb.',
        timeout: 18000000,
        maxFilesize: 1024,
        parallelUploads: 5,
      },
      isInternal,
      generating: false,
      generateDlg: false,
      document: {},
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
      files: [],
      vesselItems: [],
      filteredVessels: [],
      addressItems: [],
      fab: {},
      activities: [
        { text: 'Donjon-SMIT Active Vessels', donjon_active: 1 },
        { text: 'Donjon-SMIT Americas Active Vessels', donjon_active: 2 },
        { text: 'Donjon-SMIT & Donjon-SMIT Americas Active Vessels', donjon_active: 3 },
      ],
      vesselTypes: [
        { text: 'Tank', value: 1 },
        { text: 'Non-Tank', value: 0 },
        { text: 'All', value: -1 },
      ],
    }),

    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),

      filteredFiles () {
        // Show doc files only for internal users
        if (this.role && this.role.id && isInternal(this.role.id)) return this.files
        else return this.files.filter(file => file.ext !== 'docx')
      },
    },

    watch: {
      directory: {
        handler (newVal) {
          if (this.$refs.dropzone) {
            this.$refs.dropzone.setOption('url', `${apiUrl}${newVal.url}/documents/${newVal.code}/upload`)
            this.$refs.dropzone.setOption('headers', { Authorization: 'Bearer ' + this.$store.state.authentication.token })
          } else {
            this.dropOptions.url = `${apiUrl}${newVal.url}/documents/${newVal.code}/upload`
            this.dropOptions.headers = { Authorization: 'Bearer ' + this.$store.state.authentication.token }
          }
          this.getFiles()
        },
        deep: true,
      },
    },

    methods: {
      ...mapActions({
        showSnackBar: 'showSnackBar',
      }),

      async getFiles () {
        this.loadingFiles = true
        try {
          const files = await axios.get(`${this.directory.url}/documents/${this.directory.code}`)
          this.files = files.data

          if (this.directory.hasVessel) {
            this.loadingVessels = true
            const vessels = await axios.get(`vessels/plan/${this.directory.id}/index`)
            this.vesselItems = vessels.data.data
            this.filteredVessels = vessels.data.data
          }

          if (this.directory.hasAddress) {
            this.loadingAddresses = true
            const addresses = await axios.get(`${this.directory.url}/addresses`)
            this.addressItems = this.getDocuments(addresses.data[2].addresses, 2)
              .concat(this.getDocuments(addresses.data[0].addresses, 0))
              .concat(this.getDocuments(addresses.data[1].addresses, 1))
          }
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.loadingFiles = false
        this.loadingVessels = false
        this.loadingAddresses = false
      },

      async generateDocument () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }

        if (this.$refs.form.validate()) {
          this.generating = true
          this.generateDlg = false
          this.document.name = this.directory.outputName

          try {
            const response = await axios.post(`${this.directory.url}/documents/${this.directory.filename}/${this.directory.code}/generateV2`, this.document)
            this.showSnackBar({ text: response.data.message, color: response.data.success ? 'success' : 'error' })
            this.getFiles()
            this.$emit('refetch')
          } catch (error) {
            this.showSnackBar({ text: error, color: 'error' })
          }

          this.generating = false
        }
      },

      async downloadFile (file) {
        try {
          const response = await axios({
            url: `${this.directory.url}/documents/${this.directory.code}/${file.name}/download`,
            method: 'GET',
            responseType: 'blob',
            timeout: 18000000,
          })
          this.showSnackBar({ text: 'Download started', color: 'success' })
          download(response.data, file.name)
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
      },

      async deleteFile (file) {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }

        const permitted = await this.$confirm(`Please confirm that you would like to delete the following file: <b>${file.name}</b>`, { title: 'Warning' })
        if (permitted) {
          try {
            const response = await axios.delete(`${this.directory.url}/documents/${this.directory.code}/${file.name}/destroy`)
            this.showSnackBar({ text: response.data.message, color: 'success' })
            this.getFiles()
            this.$emit('refetch')
          } catch (error) {
            this.showSnackBar({ text: error, color: 'error' })
          }
        }
      },

      getDocuments (addresses, i) {
        if (addresses.length === 0) return []
        const addressTypes = ['Billing', 'Branches', 'Primary']
        const items = []
        addresses.forEach(address => {
          const addr = makeDocumentFormat(address)
          if (addr) {
            items.push({
              text: addressTypes[i] + ' - ' + addr,
              value: addr,
            })
          }
          if (address.document_format) {
            const documentFormatAddress = address.document_format.replace(/\u21b5/g, '\n') // replace '↵' to '\n'
            items.push({
              text: addressTypes[i] + ' Document Format - ' + documentFormatAddress,
              value: documentFormatAddress,
            })
          }
        })
        return items
      },

      getDocumentHRef (item, ext) {
        const url = this.directory.company
          ? 'files/Documents/' + this.directory.id + '/' + this.directory.code + '/' + item.name
          : 'files/plans/' + this.directory.id + '/' + this.directory.code + '/' + item.name

        getFileUrl(url, ext)
      },

      fileUploaded (file, res) {
        this.$refs.dropzone.removeAllFiles()
        this.showSnackBar({ text: res.message, color: 'success' })
        this.getFiles()
        this.$emit('refetch')
      },

      checkUploadProgress (progress) {
        this.uploadingProgress = progress
        if (progress === 100) {
          this.uploadingProgress = 0
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

      filterVesselItems (type) {
        this.filteredVessels = this.vesselItems
        if (type >= 0) {
          this.filteredVessels = this.vesselItems.filter(vessel => vessel.tanker === type)
        }
      },
    },
  }
</script>
