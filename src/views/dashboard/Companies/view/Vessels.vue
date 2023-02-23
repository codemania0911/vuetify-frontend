<template>
  <base-material-card
    color="primary"
    :title="company.name ? `${company.name} - Vessels` : 'Vessels'"
  >
    <main-table
      single
      :company-id="$route.params.id"
    />
  </base-material-card>
</template>

<script>
  export default {
    components: {
      MainTable: () => import('../../Vessels/MainTable'),
    },

    props: {
      company: {
        type: Object,
        default: () => ({}),
      },
    },
  }
</script>
