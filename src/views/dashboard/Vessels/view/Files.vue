<template>
  <v-container class="files-section">
    <v-row>
      <v-col
        cols="12"
        sm="4"
      >
        <base-material-card
          color="secondary"
          title="Categories"
        >
          <v-progress-linear
            v-if="loadingCategories"
            indeterminate
          />
          <v-expansion-panels
            v-if="fileTabs"
            accordion
            flat
          >
            <v-expansion-panel
              v-for="(category, i) in Object.keys(fileTabs)"
              :key="i"
            >
              <v-expansion-panel-header
                v-if="fileTabs[category].photo || fileTabs[category].single"
                class="doc-expansion-header photo-files"
                @click="getFiles(fileTabs[category])"
              >
                <div>
                  <v-icon left>
                    {{ fileTabs[category].icon }}
                  </v-icon>
                  {{ category }}
                </div>
              </v-expansion-panel-header>
              <v-expansion-panel-header
                v-else
                class="doc-expansion-header"
              >
                <div>
                  <v-icon left>
                    {{ fileTabs[category].icon }}
                  </v-icon>
                  {{ category }}
                </div>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-row
                  v-for="(dir, j) in fileTabs[category].items"
                  :key="j"
                  no-gutters
                >
                  <v-col
                    v-if="dir"
                    :style="`cursor: pointer; ${j !== 0 ? 'margin-top: 20px' : ''}`"
                    @click="getFiles(dir)"
                  >
                    {{ dir.name }}
                  </v-col>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </base-material-card>
      </v-col>
      <v-col
        v-if="directory.name"
        cols="12"
        sm="8"
      >
        <base-material-card
          color="primary"
        >
          <template v-slot:heading>
            <div class="text-h3 font-weight-light">
              {{ directory.name }}
            </div>
            <div
              v-if="subheading.title "
              class="text-subtitle-1 font-weight-light"
            >
              {{ subheading.title }}
            </div>
            <div
              v-if="subheading.parent"
              class="text-subtitle-1 font-weight-light"
            >
              {{ subheading.parent }}
            </div>
            <div
              v-if="subheading.sister"
              class="text-subtitle-1 font-weight-light"
            >
              {{ subheading.sister }}
            </div>
          </template>
          <v-progress-linear
            v-if="loadingFile"
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
            id="dropzone1"
            ref="dropzone"
            :options="dropOptions"
            :destroy-dropzone="true"
            @vdropzone-success="fileUploaded"
            @vdropzone-total-upload-progress="checkUploadProgress"
          />
          <template v-if="!directory.photo">
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
                    v-if="directory.code === 'racs'"
                    fab
                    x-small
                    color="success"
                    @click="getFileUrl('files/new/' + directory.code + '/' + directory.id + '/' + directory.year + '/' + item.name)"
                  >
                    <v-icon>mdi-eye-check</v-icon>
                  </v-btn>
                  <v-btn
                    v-else-if="directory.class"
                    fab
                    x-small
                    color="success"
                    @click="getFileUrl('files/vessel_classes/' + directory.id + '/' + directory.code + '/' + item.name)"
                  >
                    <v-icon>mdi-eye-check</v-icon>
                  </v-btn>
                  <v-btn
                    v-else
                    fab
                    x-small
                    color="success"
                    @click="getFileUrl('files/new/' + directory.code + '/' + directory.id + '/' + item.name)"
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
          <template v-else>
            <div
              class="d-flex justify-space-around"
            >
              <v-btn
                color="success"
                :loading="importing"
                @click="importPhoto(directory.imo)"
              >
                <v-icon left>
                  mdi-import
                </v-icon>
                Or Import Photo
              </v-btn>
              <v-btn
                color="error"
                :loading="deletingPhotos"
                :disabled="deleteDisabled"
                @click="deleteAll"
              >
                <v-icon left>
                  mdi-delete
                </v-icon>
                Delete Photos
              </v-btn>
            </div>
            <v-row>
              <h3
                v-if="!files.length"
                class="text-center my-5"
                style="width: 100%"
              >
                No Photos
              </h3>
              <v-col
                v-for="(file, i) in files"
                v-else
                :key="i"
                class="d-flex child-flex"
                cols="12"
                xl="2"
                lg="3"
                md="4"
                sm="6"
              >
                <v-card
                  flat
                  tile
                  elevation="2"
                >
                  <v-img
                    :src="file.src"
                    :lazy-src="`https://picsum.photos/10/6?image=1`"
                    aspect-ratio="1"
                    class="grey lighten-2 new-image-link"
                    @click="getFileUrl(`files/new/photos/${directory.id}/${file.name}`)"
                  >
                    <template v-slot:placeholder>
                      <v-row
                        class="fill-height ma-0"
                        align="center"
                        justify="center"
                      >
                        <v-progress-circular
                          indeterminate
                          color="grey lighten-5"
                        />
                      </v-row>
                    </template>
                  </v-img>

                  <v-card-actions>
                    <v-checkbox
                      v-model="selectedFiles"
                      dense
                      class="pa-0"
                      hide-details
                      :label="file.name"
                      :value="file.name"
                    />
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </template>
        </base-material-card>
      </v-col>
      <v-col
        v-else
        cols="12"
        sm="8"
      >
        <base-material-card
          color="primary"
        >
          <template v-slot:heading>
            <div class="text-h3 font-weight-light">
              Vessel Files
            </div>
            <div
              class="text-subtitle-1 font-weight-light"
            >
              Select a tab to browse files.
            </div>
          </template>
          <v-card-text class="text-center">
            <v-img
              v-if="hasPhoto"
              :src="`https://storage.googleapis.com/donjon-smit/pictures/vessels/${$route.params.id}/cover_sqr.jpg`"
              class="img-avatar"
            />
            <v-img
              v-else-if="companyHasPhoto && companyID"
              :src="`https://storage.googleapis.com/donjon-smit/pictures/companies/${companyID}/cover_sqr.jpg`"
              class="img-avatar"
            />
            <v-icon
              v-else
              size="100"
              color="grey"
            >
              mdi-ferry
            </v-icon>
            <h4 class="text-h3 font-weight-light mb-3 black--text">
              {{ vesselName }}
            </h4>
            <h4 class="text-h4 font-weight-light mb-3 black--text">
              {{ companyName }}
            </h4>
          </v-card-text>
        </base-material-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import axios from 'axios'
  import { mapActions, mapState } from 'vuex'
  import download from 'downloadjs'
  import vueDropzone from 'vue2-dropzone'
  import { fetchInitials } from '@/mixins/fetchInitials'
  import { MIXINS } from '@/shared/constants'
  import { apiUrl } from '../../../../../config'
  import { isInternal, checkVesselFilesTab } from '@/shared/management'
  import { getFileUrl } from '@/shared/fileUtils'

  export default {
    components: { vueDropzone },
    mixins: [
      fetchInitials([
        MIXINS.companies,
      ]),
    ],
    props: {
      hasPhoto: {
        type: Boolean,
        default: false,
      },
      companyHasPhoto: {
        type: Boolean,
        default: false,
      },
    },
    data () {
      return {
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
        selectedFiles: [],
        deleteDisabled: true,
        loadingCategories: false,
        loadingFile: false,
        directory: {},
        files: [],
        companyID: 0,
        companyName: '',
        vesselName: null,
        dropOptions: {
          url: '',
          headers: { Authorization: 'Bearer ' + this.$store.state.authentication.token },
          dictDefaultMessage: '<b>Drag and drop to upload content</b><br/> or click to select a file from your computer.<br/>Maximum 5 files upload at a time. Maximum per file upload size 1024mb.',
          timeout: 18000000,
          maxFilesize: 1024,
          parallelUploads: 5,
        },
        fab: {},
        vesselTabs: null,
        subheading: {},
        year: new Date().getFullYear(),
        uploadingProgress: 0,
        isInternal,
        importing: false,
        deletingPhotos: false,
        getFileUrl,
      }
    },
    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),
      fileTabs () {
        if (this.role && this.vesselTabs) {
          let tabs = {}
          Object.keys(this.vesselTabs).forEach(key => {
            if (checkVesselFilesTab(key, this.role.id)) {
              tabs = { ...tabs, [key]: this.vesselTabs[key] }
            }
          })
          return tabs
        } else return null
      },
    },
    watch: {
      selectedFiles () {
        if (this.selectedFiles.length > 0) {
          this.deleteDisabled = false
        } else {
          this.deleteDisabled = true
        }
      },
      directory (newVal) {
        const url = newVal.class
          ? `${apiUrl}vessel-class/${newVal.id}/documents/${newVal.code}/upload`
          : newVal.code === 'racs'
            ? `${apiUrl}vessels/${newVal.id}/files/${newVal.code}/${newVal.year}/upload`
            : `${apiUrl}vessels/${newVal.id}/files/${newVal.code}/${this.year}/upload`

        if (this.$refs.dropzone) {
          this.$refs.dropzone.setOption('url', url)
          this.$refs.dropzone.setOption('headers', { Authorization: 'Bearer ' + this.$store.state.authentication.token })
        } else {
          this.dropOptions.url = url
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
      deleteAll () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        this.$confirm('Please confirm that you would like to delete the following files.', { title: 'Warning' })
          .then(res => {
            if (res) {
              if (this.directory.code === 'photos') {
                this.selectedFiles = this.selectedFiles.map(file => ({ name: file }))
              }
              this.loadingFile = true
              this.deletingPhotos = true
              const url = this.directory.code === 'racs'
                ? `vessels/${this.directory.id}/files/${this.directory.code}/${this.directory.year}/deleteAll`
                : `vessels/${this.directory.id}/files/${this.directory.code}/${this.year}/deleteAll`
              axios.post(url, this.selectedFiles)
                .then(res => {
                  this.showSnackBar({ text: res.data.message, color: 'success' })
                })
                .catch(err => {
                  this.showSnackBar({ text: err, color: 'error' })
                })
                .finally(() => {
                  this.getFiles(this.directory)
                  this.getDataFromApi()
                  this.deletingPhotos = false
                })
            }
          })
      },
      async getDataFromApi () {
        this.loadingCategories = true
        const consData = await axios.get('vessels/' + this.$route.params.id + '/constructionDetail')
        const result = consData.data.data[0]

        const ids = { ids: [result.id, !result.lead_ship && result.lead_ship_id && result.lead_ship_id.id, !result.lead_ship && result.lead_sister_ship_id && result.lead_sister_ship_id.id] }
        const counts = await axios.post('vessels/uploaded/countFiles', ids)

        this.vesselName = result.name
        this.companyID = result.company_id
        this.subheading.title = result.lead_ship ? 'This vessel is designated as a lead vessel.' : ''
        this.subheading.parent = !result.lead_ship && result.lead_ship_id && `Lead Parent Ship - ${result.lead_ship_id.name}`
        this.subheading.sister = !result.lead_ship && result.lead_sister_ship_id && `Lead Sister Ship - ${result.lead_sister_ship_id.name}`

        // const stabilityTxt = `Stability Booklet (${counts.data['stability-booklet'][result.id]})`
        // const drillsTxt = `Drills and Exercises (${counts.data['drills-and-exercises'][result.id]})`
        const raceItems = []
        for (let year = this.year; year >= 2019; year--) {
          const raceItem = { name: `${year} (${counts.data.racs.vessel[result.id][year]})`, code: 'racs', id: this.$route.params.id, year }
          raceItems.push(raceItem)
        }
        this.vesselTabs = {
          'Fire Plans': {
            icon: 'mdi-fire-extinguisher',
            items: [
              { name: `${result.name} (${counts.data.prefire_plans.vessel[result.id]})`, code: 'prefire_plans', id: result.id },
              !result.lead_ship && result.lead_ship_id && { name: `Lead Parent Ship - ${result.lead_ship_id.name} (${counts.data.prefire_plans.vessel[result.lead_ship_id.id]})`, code: 'prefire_plans', id: result.lead_ship_id.id },
              !result.lead_ship && result.lead_sister_ship_id && { name: `Lead Sister Ship - ${result.lead_sister_ship_id.name} (${counts.data.prefire_plans.vessel[result.lead_sister_ship_id.id]})`, code: 'prefire_plans', id: result.lead_sister_ship_id.id },
              result.vessel_class_id && { name: `${result.vessel_class_name} (${counts.data.prefire_plans.vessel_class[result.vessel_class_id]})`, code: 'prefire_plans', id: result.vessel_class_id, class: true },
            ].filter(item => item),
          },
          Drawings: {
            icon: 'mdi-draw',
            items: [
              { name: `${result.name} (${counts.data.drawings.vessel[result.id]})`, code: 'drawings', id: result.id },
              !result.lead_ship && result.lead_ship_id && { name: `Lead Parent Ship - ${result.lead_ship_id.name} (${counts.data.drawings.vessel[result.lead_ship_id.id]})`, code: 'drawings', id: result.lead_ship_id.id },
              !result.lead_ship && result.lead_sister_ship_id && { name: `Lead Sister Ship - ${result.lead_sister_ship_id.name} (${counts.data.drawings.vessel[result.lead_sister_ship_id.id]})`, code: 'drawings', id: result.lead_sister_ship_id.id },
              result.vessel_class_id && { name: `${result.vessel_class_name} (${counts.data.drawings.vessel_class[result.vessel_class_id]})`, code: 'drawings', id: result.vessel_class_id, class: true },
            ].filter(item => item),
          },
          Models: {
            icon: 'mdi-laptop',
            items: [
              { name: `${result.name} (${counts.data.damage_stability_models.vessel[result.id]})`, code: 'damage_stability_models', id: result.id },
              !result.lead_ship && result.lead_ship_id && { name: `Lead Parent Ship - ${result.lead_ship_id.name} (${counts.data.damage_stability_models.vessel[result.lead_ship_id.id]})`, code: 'damage_stability_models', id: result.lead_ship_id.id },
              !result.lead_ship && result.lead_sister_ship_id && { name: `Lead Sister Ship - ${result.lead_sister_ship_id.name} (${counts.data.damage_stability_models.vessel[result.lead_sister_ship_id.id]})`, code: 'damage_stability_models', id: result.lead_sister_ship_id.id },
              result.vessel_class_id && { name: `${result.vessel_class_name} (${counts.data.damage_stability_models.vessel_class[result.vessel_class_id]})`, code: 'damage_stability_models', id: result.vessel_class_id, class: true },
            ].filter(item => item),
          },
          RACE: {
            icon: 'mdi-phone-in-talk',
            items: raceItems,
          },
          'Pre-fire Plan Cert': {
            icon: 'mdi-certificate',
            items: [
              { name: `Single Vessel Pre-fire Plan Certification (${counts.data.prefire_plan_certification.vessel[result.id]})`, code: 'prefire_plan_certification', id: result.id },
            ],
          },
          Photos: {
            icon: 'mdi-image', name: result.name + ' Photos', photo: true, code: 'photos', id: result.id, imo: result.imo,
          },
          'Stability Booklet': {
            icon: 'mdi-book-open-page-variant', name: result.name + ' Stability Booklet', single: true, code: 'stability-booklet', id: result.id,
          },
          'Drills and Exercises': {
            icon: 'mdi-run-fast', name: result.name + ' Drills and Exercises', single: true, code: 'drills-and-exercises', id: result.id,
          },
        }

        const intervalId = setInterval(() => {
          if (this.mixinItems.companies.length) {
            clearInterval(intervalId)
            this.companyName = result.company_id ? this.mixinItems.companies.find(company => company.id === result.company_id).name : 'No company assigned'
            this.loadingCategories = false
          }
        }, 50)
      },
      async getFiles (dir) {
        this.selectedFiles = []
        this.loadingFile = true
        this.directory = dir

        const url = dir.class
          ? `vessel-class/${dir.id}/documents/${dir.code}`
          : dir.code === 'racs'
            ? `vessels/${dir.id}/files/${dir.code}/${dir.year}`
            : `vessels/${dir.id}/files/${dir.code}/${this.year}`

        const response = await axios.get(url)
        this.files = this.directory.photo
          ? await Promise.all(response.data.map(async (photo) => {
            const src = await getFileUrl(`files/new/photos/${this.directory.id}/${photo.name}`, 'img')
            return {
              ...photo,
              src,
            }
          }))
          : response.data
        this.loadingFile = false
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
        this.loadingFile = true
        this.$refs.dropzone.removeAllFiles()
        this.showSnackBar({ text: res.message, color: 'success' })
        this.getFiles(this.directory)
        this.getDataFromApi()
      },
      deleteFile (file) {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        this.$confirm(`Please confirm that you would like to delete the following file: <b>${file.name}</b>`, { title: 'Warning' })
          .then(res => {
            if (res) {
              this.loadingFile = true
              const url = this.directory.code === 'racs'
                ? `vessels/${this.directory.id}/files/${this.directory.code}/${this.directory.year}/${file.name}/destroy`
                : `vessels/${this.directory.id}/files/${this.directory.code}/${this.year}/${file.name}/destroy`
              axios.delete(url)
                .then(res => {
                  this.showSnackBar({ text: res.data.message, color: 'success' })
                  this.getFiles(this.directory)
                  this.getDataFromApi()
                })
            }
          })
      },
      downloadFile (file) {
        this.loadingFile = true
        const url = this.directory.code === 'racs'
          ? `vessels/${this.directory.id}/files/${this.directory.code}/${this.directory.year}/${file.name}/download`
          : `vessels/${this.directory.id}/files/${this.directory.code}/${this.year}/${file.name}/download`
        axios({
          url,
          method: 'GET',
          responseType: 'blob',
          timeout: 18000000,
        }).then(downloadRes => {
          this.showSnackBar({ text: 'Download started', color: 'success' })
          download(downloadRes.data, file.name)
          this.loadingFile = false
        }).catch(error => {
          this.showSnackBar({ text: error, color: 'error' })
          this.loadingFile = false
        })
      },
      checkUploadProgress (progress) {
        this.uploadingProgress = progress
        if (progress === 100) {
          this.uploadingProgress = 0
        }
      },
      async importPhoto (imo) {
        this.importing = true
        try {
          const res = await axios.post('ais/getaisphoto/' + imo)
          this.getFiles(this.directory)
          this.showSnackBar({ text: res.data.message, color: res.data.success ? 'success' : 'error' })
        } catch (err) {
          this.showSnackBar({ text: err, color: 'error' })
        }
        this.importing = false
      },
      openNewTab (url) {
        window.open(url, '_blank')
      },
    },
  }
</script>

<style lang="sass">
  .doc-expansion-header
    font-size: 16px !important
  .v-expansion-panel-content
    padding-left: 20px
  .full-width
    width: 100%
  .photo-files
    .v-expansion-panel-header__icon
      display: none
</style>
