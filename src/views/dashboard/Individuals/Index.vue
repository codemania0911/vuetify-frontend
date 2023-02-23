<template>
  <v-container
    fluid
    tag="section"
  >
    <base-material-card
      color="primary"
      icon="mdi-account-group"
      inline
    >
      <template v-slot:after-heading>
        <div class="text-h3">
          Individuals
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

<style lang="sass" scoped>
  .click-to-call
    text-decoration: none
</style>
