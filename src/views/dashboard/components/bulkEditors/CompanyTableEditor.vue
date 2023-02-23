<template>
  <div class="wrapper-jexcel">
    <v-progress-linear
      v-if="loadingAll"
      indeterminate
    />
    <div
      id="spreadsheet"
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
  import {
    getColumnsFromCompanies,
    companyColIndex,
  } from '@/shared/bulkEditUtils'
  import { BULK_EDITOR_COLUMNS, MIXINS } from '@/shared/constants'

  export default {
    name: 'CompanyTableEditor',

    mixins: [
      fetchInitials([
        MIXINS.countries,
      ]),
    ],

    props: {
      companyData: {
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

    watch: {
      companyData: {
        handler () {
          this.updateJExcelOptions()
        },
        deep: true,
      },
      updatable (val) {
        if (val) {
          this.saveCompanies()
        }
      },
      'mixinItems.countries': {
        handler (val) {
          if (val.length) {
            this.setJExcelOptions()
          }
        },
        deep: true,
      },
    },

    mounted () {
      if (!this.loadingMixins.countries && this.mixinItems.countries.length) {
        this.setJExcelOptions()
      }
    },

    methods: {
      ...mapActions({
        showSnackBar: 'showSnackBar',
      }),

      handleCellChange (instance, cell, x, y, value) {
        let updated = value

        // x = column number
        const activeFieldId = this.companyData[y][companyColIndex[x]]

        if (parseInt(x) === 1) {
          if (value === 'YES') {
            if (activeFieldId === 5 || activeFieldId === 3) {
              updated = 5
            } else {
              updated = 2
            }
          } else {
            updated = activeFieldId === 5 ? 3 : 1
          }
        } else if (parseInt(x) === 2) {
          if (value === 'YES') {
            if (activeFieldId === 5 || activeFieldId === 2) {
              updated = 5
            } else {
              updated = 3
            }
          } else {
            updated = activeFieldId === 5 ? 2 : 4
          }
        }

        this.companyData[y][companyColIndex[x]] = updated
        this.$emit('change:content-changed')
      },

      setJExcelOptions () {
        const columns = BULK_EDITOR_COLUMNS.companies(this.mixinItems.countries.map(country => country.name))
        const companies = this.companyData.map(company => ({
          ...company,
          country: this.mixinItems.countries.find(country => country.code === company.country)
            ? this.mixinItems.countries.find(country => country.code === company.country).name
            : '',
        }))

        const jExcelOptions = {
          data: getColumnsFromCompanies(companies),
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
        const companies = this.companyData.map(company => ({
          ...company,
          country: this.mixinItems.countries.find(country => country.code === company.country)
            ? this.mixinItems.countries.find(country => country.code === company.country).name
            : '',
        }))
        this.jExcelObj.setData(getColumnsFromCompanies(companies))
      },

      async saveCompanies () {
        this.$emit('bulk-saving', true)

        try {
          const response = await axios.post('companies/bulkUpdate', { companyData: this.companyData })
          this.showSnackBar({ text: response.data.message, color: response.data.success ? 'success' : 'error' })
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
