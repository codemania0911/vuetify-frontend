<template>
  <base-material-card
    v-bind="$attrs"
    image
    color="white"
    hover-reveal
  >
    <!-- <v-progress-linear
      v-if="loading"
      indeterminate
    /> -->

    <template v-slot:image>
      <v-img
        v-if="src"
        :src="src"
        class="item-clickable"
        @click="openNewTab(src)"
      />
      <v-icon
        v-else
        size="100"
        color="grey"
      >
        {{ icon }}
      </v-icon>
    </template>

    <v-file-input
      ref="file"
      type="file"
      class="d-none"
      accept="image/png, image/jpeg, image/bmp"
      @change="uploadPhoto"
    />

    <template v-slot:reveal-actions>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn
            color="secondary"
            icon
            text
            :loading="uploading"
            v-on="on"
            @click="openFile"
          >
            <v-icon>
              mdi-pencil
            </v-icon>
          </v-btn>
        </template>
        Upload/Change Image
      </v-tooltip>

      <v-tooltip
        v-if="vessel"
        bottom
      >
        <template v-slot:activator="{ on }">
          <v-btn
            color="secondary"
            icon
            text
            :loading="importing"
            v-on="on"
            @click="importPhoto"
          >
            <v-icon>
              mdi-auto-fix
            </v-icon>
          </v-btn>
        </template>
        Import Vessel Photo
      </v-tooltip>
    </template>

    <v-card-text class="text-center">
      <h4 class="text-h3 font-weight-light mb-3 black--text">
        {{ name }}
      </h4>

      <h6 class="text-h4 mb-1 grey--text">
        <router-link
          v-if="link"
          :to="link.to"
        >
          {{ link.name }}
        </router-link>

        <br>

        <span v-if="text">
          {{ text }}
        </span>
      </h6>

      <p class="text-h4 font-weight-light grey--text">
        {{ data.description }}
      </p>

      <a
        v-if="data.website"
        :href="data.website"
      >
        {{ data.website }}
      </a>

      <v-btn
        v-if="data.resume_link"
        color="primary"
        class="mt-1"
        rounded
        :href="'https://storage.googleapis.com/donjon-smit/users/' + data.id + '/Documents/cv/' + data.resume_link"
        target="_blank"
      >
        CV
      </v-btn>

      <!-- If from vessel view -->
      <template v-if="vessel">
        <v-row
          no-gutters
          justify="center"
        >
          <v-icon>mdi-map</v-icon>
          <span class="mx-2">Zone:</span>
          <span v-if="data.zone_name === 'Unknown'">
            {{ data.zone_name }}
          </span>
          <router-link
            v-else
            :to="{ path: '/map', query: { vessel: data.id } }"
          >
            {{ data.zone_name }}
          </router-link>
        </v-row>
        <p class="text-subtitle-1 grey--text mx-auto mt-1">
          {{ timestamp }}
        </p>
      </template>
    </v-card-text>

    <v-dialog
      v-model="cropper.show"
      max-width="700"
    >
      <image-cropper
        :image="cropper.image"
        :cnt="cropper.cnt"
        @close="cropper.show = false"
        @upload="uploadCroppedImages"
      />
    </v-dialog>
  </base-material-card>
</template>

<script>
  import axios from 'axios'
  import { mapActions, mapState } from 'vuex'
  import { isInternal } from '@/shared/management'

  export default {
    components: {
      ImageCropper: () => import('../ImageCropper'),
    },

    props: {
      src: {
        type: String,
        default: '',
      },
      icon: {
        type: String,
        default: '',
      },
      data: {
        type: Object,
        default: () => ({}),
      },
      vessel: {
        type: Boolean,
        default: false,
      },
      // loading: {
      //   type: Boolean,
      //   default: true,
      // },
      timestamp: {
        type: String,
        default: '',
      },
      url: {
        type: String,
        default: '',
      },
    },

    data: () => ({
      cropper: {
        show: false,
        image: null,
        cnt: 0,
      },
      uploading: false,
      importing: false,
    }),

    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),

      name () {
        const planHolderName = this.data.plan_holder_name || ''
        const name = this.data.name || ''
        const firstName = this.data.first_name || ''
        const lastName = this.data.last_name || ''

        return planHolderName || name || firstName + ' ' + lastName || ''
      },

      link () {
        return this.data.primary_company_id
          ? { name: this.data.primary_company.name, to: `/companies/${this.data.primary_company_id}` }
          : this.data.company
            ? { name: this.data.company.name, to: `/companies/${this.data.company.id}` }
            : null
      },

      text () {
        return this.data.plan_number
          ? `VRP Number: ${this.data.plan_number}`
          : this.data.plan_numbers
            ? `VRP Number(s): ${this.data.plan_numbers.map((number) => number.plan_number || '').join(', ')}`
            : ''
      },
    },

    methods: {
      ...mapActions({
        showSnackBar: 'showSnackBar',
      }),

      uploadPhoto (file) {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        if (file.type.indexOf('image/') !== -1) {
          const fileReader = new FileReader()
          fileReader.onload = e => {
            this.cropper.image = e.target.result
            this.cropper.cnt++
            this.cropper.show = true
          }
          fileReader.readAsDataURL(file)
        }
      },

      async uploadCroppedImages (squareImg, rectImg) {
        if (!this.url) {
          this.showSnackBar({ text: 'No URL is provided', color: 'warning' })
          return
        }
        this.uploading = true
        try {
          this.cropper.show = false

          const formData = new FormData()
          formData.append('file_rect', rectImg)
          formData.append('file_sqr', squareImg)

          const headers = { 'Content-Type': 'multipart/form-data' }

          const response = await axios.post(this.url, formData, { headers })
          this.showSnackBar({ text: response.data.message, color: response.data.success ? 'success' : 'error' })
          this.$emit('refetchData', true)
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.uploading = false
      },

      async importPhoto () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }

        this.importing = true
        try {
          const response = await axios.post('ais/getaisphoto/' + this.data.imo)
          this.showSnackBar({ text: response.data.message, color: response.data.success ? 'success' : 'error' })
          this.$emit('refetchData', true)
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.importing = false
      },

      openFile () {
        this.$refs.file.$refs.input.click()
      },

      openNewTab (url) {
        window.open(url, '_blank')
      },
    },
  }
</script>
