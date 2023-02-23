<template>
  <base-material-card
    color="primary"
    :title="company.name ? `${company.name} - Individuals` : 'Individuals'"
  >
    <main-table
      :company-id="$route.params.id"
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
      company: {
        type: Object,
        default: () => ({}),
      },
    },
  }
</script>
