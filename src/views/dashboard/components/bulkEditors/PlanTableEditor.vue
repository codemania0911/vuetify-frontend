<template>
  <div class="wrapper-jexcel">
    <v-progress-linear
      v-if="loadingAll"
      indeterminate
    />
    <div
      id="plan-spreadsheet"
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
  import { getColumnsFromPlans, planColIndex } from '@/shared/bulkEditUtils'
  import { BULK_EDITOR_COLUMNS, MIXINS } from '@/shared/constants'

  export default {
    name: 'PlanTableEditor',

    mixins: [
      fetchInitials([
        MIXINS.qis,
      ]),
    ],

    props: {
      planData: {
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
      qiAndPlanPreparers () {
        if (!this.loadingMixins.qis && this.mixinItems.qis.length) {
          return true
        }
        return false
      },
    },

    watch: {
      planData: {
        handler () {
          this.updateJExcelOptions()
        },
        deep: true,
      },
      updatable (val) {
        if (val) {
          this.savePlans()
        }
      },
      qiAndPlanPreparers (val) {
        if (val) {
          this.setJExcelOptions()
        }
      },
    },

    mounted () {
      if (!this.loadingMixins.qis && this.mixinItems.qis.length) {
        this.setJExcelOptions()
      }
    },

    methods: {
      ...mapActions({
        showSnackBar: 'showSnackBar',
      }),

      handleCellChange (instance, cell, x, y, value) {
        if (planColIndex[x] === 'active_field_id') {
          let updated = value
          // x = column number
          const activeFieldId = this.planData[y][planColIndex[x]]
          if (parseInt(x) === 4) {
            if (value === 'YES') {
              if (activeFieldId === 5 || activeFieldId === 3) {
                updated = 5
              } else {
                updated = 2
              }
            } else {
              updated = activeFieldId === 5 ? 3 : 1
            }
          } else {
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
          this.planData[y][planColIndex[x]] = updated
        } else if (['qi_id', 'plan_preparer_id'].includes(planColIndex[x])) {
          this.planData[y][planColIndex[x]] = parseInt(value)
        } else {
          this.planData[y][planColIndex[x]] = value
        }
        this.$emit('change:content-changed')
      },

      setJExcelOptions () {
        const columns = BULK_EDITOR_COLUMNS.plans(this.mixinItems.qis)
        const jExcelOptions = {
          data: getColumnsFromPlans(this.planData),
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
        this.jExcelObj.setData(getColumnsFromPlans(this.planData))
      },

      async savePlans () {
        this.$emit('bulk-saving', true)

        try {
          const response = await axios.post('plans/bulkUpdate', { planData: this.planData })
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
