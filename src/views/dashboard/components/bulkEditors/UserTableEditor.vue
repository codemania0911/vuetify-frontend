<template>
  <div class="wrapper-jexcel">
    <v-progress-linear
      v-if="loadingAll"
      indeterminate
    />
    <div
      id="user-spreadsheet"
      ref="spreadsheet"
    />
  </div>
</template>

<script>
  import jexcel from 'jexcel'
  import { mapActions } from 'vuex'
  import axios from 'axios'
  import 'jexcel/dist/jexcel.css'
  import { fetchInitials } from '@/mixins/fetchInitials'
  import { getColumnsFromUsers, userColIndex } from '@/shared/bulkEditUtils'
  import { BULK_EDITOR_COLUMNS, MIXINS } from '@/shared/constants'

  export default {
    name: 'TableEditor',

    mixins: [
      fetchInitials([
        MIXINS.companies,
        MIXINS.roles,
      ]),
    ],

    props: {
      userData: {
        type: Array,
        default: () => ([]),
      },
      minDimensions: {
        type: Array,
        default: () => ([]),
      },
      updatable: {
        type: Boolean,
        default: false,
      },
    },

    data: () => ({
      loadingAll: true,
    }),

    computed: {
      companiesAndRoles () {
        if (
          !this.loadingMixins.companies &&
          this.mixinItems.companies.length &&
          !this.loadingMixins.roles &&
          this.mixinItems.roles.length
        ) {
          return true
        }
        return false
      },
    },

    watch: {
      userData: {
        handler () {
          this.updateJExcelOptions()
        },
        deep: true,
      },
      updatable (val) {
        if (val) {
          this.saveUsers()
        }
      },
      companiesAndRoles (val) {
        if (val) {
          this.setJExcelOptions()
        }
      },
    },

    mounted () {
      if (
        !this.loadingMixins.companies &&
        this.mixinItems.companies.length &&
        !this.loadingMixins.roles &&
        this.mixinItems.roles.length
      ) {
        this.setJExcelOptions()
      }
    },

    methods: {
      ...mapActions({
        showSnackBar: 'showSnackBar',
      }),

      handleCellChange (instance, cell, x, y, value) {
        this.userData[y][userColIndex[x]] = parseInt(value) || value
        this.$emit('change:content-changed')
      },

      setJExcelOptions () {
        const columns = BULK_EDITOR_COLUMNS.users(this.mixinItems.companies, this.mixinItems.roles)
        const jExcelOptions = {
          data: getColumnsFromUsers(this.userData),
          minDimensions: this.minDimensions,
          columns,
          tableOverflow: true,
          defaultColWidth: 100,
          onchange: this.handleCellChange,
          columnSorting: false,
        }
        const jExcelObj = jexcel(this.$refs.spreadsheet, jExcelOptions)
        Object.assign(this, { jExcelObj })
        const container = document.querySelector('.jexcel_content')
        container.style.maxHeight = 'none'
        this.loadingAll = false
      },

      updateJExcelOptions () {
        this.jExcelObj.setData(getColumnsFromUsers(this.userData))
      },

      async saveUsers () {
        this.$emit('bulk-saving', true)
        const promises = this.userData.map(user => (
          axios.post('users/' + user.id, { user })
        ))

        try {
          await Promise.all(promises)
          this.showSnackBar({ text: 'Successfully Updated', color: 'success' })
        } catch (err) {
          this.showSnackBar({ text: err, color: 'error' })
        } finally {
          this.$emit('bulk-saving', false)
          this.$emit('change:save-update')
        }
      },
    },
  }
</script>

<style lang="sass">
  .wrapper-jexcel
    text-align: center
  .jexcel_container
    width: 100%
  .jexcel_content
    max-width: 100%
  .snackbar-queue
    .v-btn--icon.v-size--default .v-icon
      font-size: 15px
</style>
