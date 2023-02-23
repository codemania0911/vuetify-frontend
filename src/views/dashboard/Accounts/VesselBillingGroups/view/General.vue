<template>
  <base-material-card color="primary">
    <template v-slot:heading>
      <div class="text-h4 font-weight-light">
        {{ group.name }} General
      </div>
      <div class="text-subtitle-1">
        {{ group.company && group.company.name }}
      </div>
    </template>

    <v-progress-linear
      v-if="loadingGroup"
      indeterminate
    />

    <v-card-text>
      <v-form
        ref="groupForm"
        lazy-validation
        @submit.prevent="updateGroup"
      >
        <v-row>
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              v-model="group.name"
              label="Group Name *"
              prepend-icon="mdi-rename-box"
              :rules="[rules.required]"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-autocomplete
              v-model="group.company_id"
              :items="mixinItems.companies"
              :loading="loadingMixins.companies"
              item-text="name"
              item-value="id"
              clearable
              :rules="[rules.required]"
              prepend-icon="mdi-domain"
              label="Company *"
            />
          </v-col>
        </v-row>

        <v-btn
          color="success"
          small
          type="submit"
          :loading="updating"
        >
          <v-icon left>
            mdi-content-save
          </v-icon>
          Save
        </v-btn>
        <v-btn
          color="error"
          small
          :loading="deleting"
          @click="deleteGroup"
        >
          <v-icon left>
            mdi-delete
          </v-icon>
          Delete
        </v-btn>
      </v-form>
    </v-card-text>
  </base-material-card>
</template>

<script>
  import axios from 'axios'
  import { mapActions, mapState } from 'vuex'
  import { fetchInitials } from '@/mixins/fetchInitials'
  import { MIXINS } from '@/shared/constants'
  import { isInternal } from '@/shared/management'

  export default {
    mixins: [
      fetchInitials([
        MIXINS.companies,
      ]),
    ],
    data: () => ({
      rules: {
        required: value => !!value || 'This field is required.',
      },
      loadingGroup: false,
      updating: false,
      deleting: false,
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
        this.loadingGroup = true
        try {
          const response = await axios.get('vessel-billing-group/' + this.$route.params.id)
          this.group = response.data
          this.group.company_id = response.data.company && response.data.company.id
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.loadingGroup = false
      },

      async updateGroup () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        if (this.$refs.groupForm.validate()) {
          this.updating = true
          try {
            const response = await axios.put('vessel-billing-group/' + this.$route.params.id, {
              name: this.group.name,
              company_id: this.group.company_id,
            })
            this.showSnackBar({ text: response.data.message, color: response.data.success ? 'success' : 'error' })
            this.getDataFromApi()
          } catch (error) {
            this.showSnackBar({ text: error, color: 'error' })
          }
          this.updating = false
        }
      },

      async deleteGroup () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        this.deleting = true
        try {
          const response = await axios.delete('vessel-billing-group/' + this.$route.params.id)
          this.showSnackBar({ text: response.data.message, color: response.data.success ? 'success' : 'error' })
          this.$router.push('/vessel-billing-groups')
        } catch (error) {
          this.showSnackBar({ text: error, color: 'error' })
        }
        this.deleting = false
      },
    },
  }
</script>
