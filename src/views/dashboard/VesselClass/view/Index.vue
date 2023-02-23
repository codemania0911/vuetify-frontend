<template>
  <v-container
    id="vessel-class-index"
    fluid
  >
    <base-material-tabs
      v-model="activeTab"
      background-color="transparent"
      centered
      color="secondary"
      icons-and-text
      show-arrows
    >
      <template v-for="(tab, i) in tabs">
        <v-tab
          :key="i"
          :to="tab.to"
        >
          {{ tab.title }}
          <v-icon v-text="tab.icon" />
        </v-tab>
      </template>
    </base-material-tabs>

    <router-view />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex'
  import { checkVesselClassTab } from '@/shared/management'

  export default {
    data: () => ({
      activeTab: 0,
    }),

    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),

      tabs () {
        if (this.role) return checkVesselClassTab(this.role.id).map(tab => ({ ...tab, to: '/vessel-class/' + this.$route.params.id + '/' + tab.to }))
        else return []
      },
    },
  }
</script>
