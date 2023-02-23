<template>
  <base-material-card
    color="primary"
    class="affiliates-page"
    :title="company.name ? `${company.name} - Affiliates` : 'Affiliates'"
  >
    <main-table affiliate />
  </base-material-card>
</template>

<script>
  export default {
    components: {
      MainTable: () => import('../MainTable'),
    },

    props: {
      company: {
        type: Object,
        default: () => ({}),
      },
    },
  }
</script>

<style lang="sass">
.affiliates-page
  .company-header
    height: 40px
    text-align: left
    th
      font-weight: normal
</style>
