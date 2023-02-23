<template>
  <v-container
    id="plans-index"
    fluid
    tag="section"
  >
    <base-material-card
      color="primary"
      icon="mdi-notebook"
      inline
    >
      <template v-slot:after-heading>
        <div class="text-h3">
          Plans
        </div>
      </template>

      <main-table />
    </base-material-card>
  </v-container>
</template>

<script>
  export default {
    components: {
      MainTable: () => import('./MainTable'),
    },
  }
</script>

<style lang="sass">
  #plans-index
    .company-header
      height: 40px
      text-align: left
  .vrp-sql
    background-color: #f7f7f7
    td, a
      color: gray !important
  .flag-icon
    pointer-events: none
</style>
