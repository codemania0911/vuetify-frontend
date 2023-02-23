<template>
  <v-container
    fluid
    tag="section"
  >
    <base-material-tabs
      v-if="role && isInternal(role.id)"
      v-model="mainTab"
      background-color="transparent"
      centered
      icons-and-text
      show-arrows
      color="secondary"
    >
      <v-tab
        v-for="(tab, i) in tabs"
        :key="i"
      >
        {{ tab.title }}
        <v-icon v-text="tab.icon" />
      </v-tab>

      <v-tabs-items
        v-model="mainTab"
        class="transparent"
      >
        <v-tab-item>
          <simple-table />
        </v-tab-item>
        <v-tab-item>
          <base-material-card
            color="primary"
            icon="mdi-ferry"
            inline
          >
            <template v-slot:after-heading>
              <div class="text-h3">
                Vessels
              </div>
            </template>

            <main-table />
          </base-material-card>
        </v-tab-item>
      </v-tabs-items>
    </base-material-tabs>

    <base-material-card
      v-else
      color="primary"
      icon="mdi-ferry"
      inline
    >
      <template v-slot:after-heading>
        <div class="text-h3">
          Vessels
        </div>
      </template>

      <main-table />
    </base-material-card>
  </v-container>
</template>

<script>
  import { mapState } from 'vuex'
  import { isInternal } from '@/shared/management'

  export default {
    components: {
      SimpleTable: () => import('./SimpleTable'),
      MainTable: () => import('./MainTable'),
    },

    data: () => ({
      mainTab: 0,
      tabs: [
        { icon: 'mdi-magnify', title: 'Simple' },
        { icon: 'mdi-table-search', title: 'Advanced' },
      ],
      isInternal,
    }),

    computed: {
      ...mapState({
        role: state => state.authentication.role,
      }),
    },
  }
</script>
