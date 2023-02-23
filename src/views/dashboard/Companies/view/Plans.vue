<template>
  <base-material-card
    color="primary"
    :title="company.name ? `${company.name} - Plans` : 'Plans'"
  >
    <main-table :from-company-id="$route.params.id" />
  </base-material-card>
</template>

<script>
  export default {
    components: {
      MainTable: () => import('../../Plans/MainTable.vue'),
    },

    props: {
      company: {
        type: Object,
        default: () => ({}),
      },
    },
  }
</script>
