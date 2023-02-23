<template>
  <v-container
    class="files-section"
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
      <v-tab
        v-for="(tab, i) in tabs"
        :key="i"
      >
        {{ tab.title }}
        <v-icon v-text="tab.icon" />
      </v-tab>

      <v-tabs-items
        v-model="activeTab"
        class="transparent"
      >
        <v-tab-item>
          <gsa-files :djs="true" />
        </v-tab-item>

        <v-tab-item>
          <gsa-files />
        </v-tab-item>
      </v-tabs-items>
    </base-material-tabs>
  </v-container>
</template>

<script>
  export default {
    components: {
      GsaFiles: () => import('./GsaFiles'),
    },
    data: () => ({
      activeTab: 0,
      tabs: [
        { title: 'DJ-S', icon: 'mdi-folder-open' },
        { title: 'DJ-S A', icon: 'mdi-folder-open' },
      ],
    }),
  }
</script>
