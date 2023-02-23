<template>
  <addresses
    :get-url="'plans/' + $route.params.id + '/addresses'"
    :add-url="'plans/' + $route.params.id + '/addresses/store'"
    save-url="plans/addresses/"
    delete-url="plans/addresses/"
  />
</template>

<script>
  export default {
    components: {
      Addresses: () => import('../../components/address/Addresses'),
    },
  }
</script>
