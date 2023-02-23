<template>
  <addresses
    :get-url="'companies/' + $route.params.id + '/addresses'"
    :add-url="'companies/' + $route.params.id + '/addresses/store'"
    save-url="companies/addresses/"
    delete-url="companies/addresses/"
  />
</template>

<script>
  export default {
    components: {
      Addresses: () => import('../../components/address/Addresses'),
    },
  }
</script>
