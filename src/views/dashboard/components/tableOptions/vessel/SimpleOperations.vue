<template>
  <div>
    <v-row class="mt-3 mb-7">
      <v-col
        cols="12"
        md="6"
      >
        <search-field @updateItems="updateItems" />
      </v-col>
      <v-col
        v-if="role && isInternal(role.id)"
        cols="12"
        md="6"
        class="d-flex justify-space-around align-center"
      >
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              text
              color="secondary"
              small
              v-on="on"
              @click="toggleCompanyShow"
            >
              <v-icon size="28">
                mdi-domain
              </v-icon>
            </v-btn>
          </template>
          <span>{{ showCompany ? 'Hide' : 'View' }} Companies</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              text
              color="warning"
              small
              class="mr-2"
              v-on="on"
              @click="addVessel"
            >
              <v-icon size="28">
                mdi-plus-circle-outline
              </v-icon>
            </v-btn>
          </template>
          <span>Add Vessel</span>
        </v-tooltip>
      </v-col>
    </v-row>

    <v-dialog
      v-model="showAdd"
      max-width="700"
      @click:outside="closeAdd"
      @keydown.esc="closeAdd"
    >
      <add-vessel
        :counter="addCounter"
        @complete="completeAdd"
      />
    </v-dialog>

    <confirm-dialog
      :show="saveChanges"
      :text="confirmText"
      @close:dialog="() => { saveChanges = false }"
      @discard:changes="() => discardChanges()"
    />
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import { isInternal } from '@/shared/management'

  export default {
    components: {
      SearchField: () => import('../SearchField'),
      AddVessel: () => import('../../forms/AddVessel'),
      ConfirmDialog: () => import('../../ConfirmDialog'),
    },

    data: () => ({
      confirmText: 'If you continue, your progress will be lost.\n Do you want to leave this page without saving?',
      isInternal,
      showAdd: false,
      addCounter: 0,
      notSaved: false,
      saveChanges: false,
      next: null,
      showCompany: false,
    }),

    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),
    },

    methods: {
      updateItems (search) {
        this.$emit('refetch', search)
      },

      addVessel () {
        if (!isInternal(this.role.id)) {
          this.showSnackBar({ text: 'This action is not permitted.', color: 'warning' })
          return
        }
        this.showAdd = true
        this.addCounter++
      },

      completeAdd (success) {
        this.showAdd = false
        if (success) {
          this.$emit('refetch')
        }
      },

      async closeAdd () {
        const confirm = await this.$confirm('Do you want to lose your progress?', { title: 'Warning' })
        if (!confirm) {
          this.showAdd = true
        }
      },

      discardChanges () {
        this.saveChanges = false
        this.next()
      },

      toggleCompanyShow () {
        this.showCompany = !this.showCompany
        this.$emit('showCompany', this.showCompany)
      },
    },

    beforeRouteLeave (to, from, next) {
      if (!this.notSaved) {
        next()
      } else {
        this.saveChanges = true
        this.next = next
      }
    },
  }
</script>
