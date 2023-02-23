<template>
  <base-material-card
    color="primary"
    :title="plan.plan_holder_name ? `${plan.plan_holder_name} - Individuals` : 'Individuals'"
  >
    <main-table
      :company-id="plan.company.id"
      single
    />
  </base-material-card>
</template>

<script>
  export default {
    components: {
      MainTable: () => import('../../Individuals/MainTable.vue'),
    },

    props: {
      plan: {
        type: Object,
        default: () => ({}),
      },
    },
  }
</script>
