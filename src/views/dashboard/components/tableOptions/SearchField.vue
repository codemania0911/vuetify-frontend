<template>
  <v-text-field
    v-model="search"
    append-icon="mdi-magnify"
    label="Search"
    hide-details
    clearable
    :disabled="disabled"
  />
</template>

<script>
  export default {
    props: {
      disabled: {
        type: Boolean,
        default: false,
      },
    },

    data: () => ({
      search: '',
      searchTimeout: null,
    }),

    watch: {
      search () {
        if (this.searchTimeout) {
          clearTimeout(this.searchTimeout)
        }
        this.searchTimeout = setTimeout(() => {
          this.$emit('updateItems', this.search)
        }, 500)
      },
    },
  }
</script>
