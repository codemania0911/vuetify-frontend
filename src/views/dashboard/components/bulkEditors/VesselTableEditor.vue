<template>
  <div class="wrapper-jexcel">
    <v-progress-linear
      v-if="loadingAll"
      indeterminate
    />
    <div
      id="vessel-spreadsheet"
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
  import { BULK_EDITOR_COLUMNS, MIXINS } from '@/shared/constants'
  import {
    getColumnsFromVessels,
    vesselColIndex,
  } from '@/shared/bulkEditUtils'

  export default {
    name: 'VesselTableEditor',

    mixins: [
      fetchInitials([
        MIXINS.companies,
        MIXINS.insurers,
        MIXINS.providers,
        MIXINS.planNumbers,
        MIXINS.societies,
        MIXINS.pis,
        MIXINS.vesselTypes,
      ]),
    ],

    props: {
      vesselData: {
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
      valid: true,
    }),

    computed: {
      allItems () {
        if (
          !this.loadingMixins.companies &&
          this.mixinItems.companies.length &&
          !this.loadingMixins.vesselTypes &&
          this.mixinItems.vesselTypes.length &&
          !this.loadingMixins.societies &&
          this.mixinItems.societies.length &&
          !this.loadingMixins.pis &&
          this.mixinItems.pis.length &&
          !this.loadingMixins.insurers &&
          this.mixinItems.insurers.length &&
          !this.loadingMixins.providers &&
          this.mixinItems.providers.length &&
          !this.loadingMixins.planNumbers &&
          this.mixinItems.planNumbers.length
        ) {
          return true
        }
        return false
      },
    },

    watch: {
      vesselData: {
        handler () {
          this.updateJExcelOptions()
        },
        deep: true,
      },
      updatable (val) {
        if (val) {
          this.saveVessels()
        }
      },
      allItems (val) {
        if (val) {
          this.setJExcelOptions()
        }
      },
    },
    mounted () {
      if (
        !this.loadingMixins.companies &&
        this.mixinItems.companies.length &&
        !this.loadingMixins.vesselTypes &&
        this.mixinItems.vesselTypes.length &&
        !this.loadingMixins.societies &&
        this.mixinItems.societies.length &&
        !this.loadingMixins.pis &&
        this.mixinItems.pis.length &&
        !this.loadingMixins.insurers &&
        this.mixinItems.insurers.length &&
        !this.loadingMixins.providers &&
        this.mixinItems.providers.length &&
        !this.loadingMixins.planNumbers &&
        this.mixinItems.planNumbers.length
      ) {
        this.setJExcelOptions()
      }
    },
    methods: {
      ...mapActions({
        showSnackBar: 'showSnackBar',
      }),

      handleCellChange (instance, cell, x, y, value) {
        // For validating required fields
        this.valid = true

        if (['societies', 'insurers', 'pi', 'providers'].includes(vesselColIndex[x])) {
          // To be done for joining item names

          this.vesselData[y][vesselColIndex[x]] = [parseInt(value)]
        } else if (vesselColIndex[x] === 'name') {
          if (!value) {
            this.showSnackBar({ text: 'There are empty values in required fields', color: 'error' })
            this.valid = false
          }
          this.vesselData[y][vesselColIndex[x]] = value
        } else if (vesselColIndex[x] === 'company') {
          this.vesselData[y].company = { id: parseInt(value) }
        } else if (vesselColIndex[x] === 'vessel_type_id') {
          this.vesselData[y].vessel_type_id = parseInt(value)
        } else if (vesselColIndex[x] === 'active_field_id') {
          let updated = value
          // x = column number
          const activeFieldId = this.vesselData[y][vesselColIndex[x]]
          if (parseInt(x) === 16) {
            if (value === 'YES') {
              if (activeFieldId === 5 || activeFieldId === 3) {
                updated = 5
              } else {
                updated = 2
              }
            } else {
              updated = activeFieldId === 5 ? 3 : 1
            }
          } else if (parseInt(x) === 17) {
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
          this.vesselData[y][vesselColIndex[x]] = updated
        } else if (vesselColIndex[x] === 'plan_number') {
          this.vesselData[y].plan = { id: parseInt(value) }
        } else if (vesselColIndex[x] === 'tanker') {
          this.vesselData[y][vesselColIndex[x]] = value === 'YES'
        } else {
          this.vesselData[y][vesselColIndex[x]] = value
        }
        this.$emit('change:content-changed')
      },

      setJExcelOptions () {
        const columns = Object.values(BULK_EDITOR_COLUMNS.vessels(
          this.mixinItems.companies,
          this.mixinItems.vesselTypes,
          this.mixinItems.societies,
          this.mixinItems.pis,
          this.mixinItems.insurers,
          this.mixinItems.providers,
          this.mixinItems.planNumbers,
        ))
        const jExcelOptions = {
          data: getColumnsFromVessels(this.vesselData),
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
        this.jExcelObj.setData(getColumnsFromVessels(this.vesselData))
      },

      async saveVessels () {
        if (this.valid) {
          this.$emit('bulk-saving', true)
          try {
            const response = await axios.post('vessels/bulkUpdate', { vesselData: this.vesselData })
            this.showSnackBar({ text: response.data.message, color: response.data.success ? 'success' : 'error' })
          } catch (err) {
            this.showSnackBar({ text: err, color: 'error' })
          } finally {
            this.$emit('bulk-saving', false)
            this.$emit('change:save-update')
          }
        } else {
          this.showSnackBar({ text: 'There are empty values in required fields', color: 'error' })
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
