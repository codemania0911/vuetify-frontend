<template>
  <base-material-card
    :color="color"
    :title="title"
  >
    <v-progress-linear
      v-if="loading"
      indeterminate
    />

    <v-expansion-panels
      flat
      accordion
    >
      <!-- Plan Companies Files -->
      <template v-if="planCompany">
        <v-expansion-panel
          v-for="(company, i) in categories"
          :key="i"
        >
          <v-expansion-panel-header class="doc-expansion-header">
            {{ company.name }}
          </v-expansion-panel-header>

          <v-expansion-panel-content>
            <v-expansion-panels
              flat
              accordion
            >
              <v-expansion-panel
                v-for="(category, j) in company.categories"
                :key="j"
              >
                <v-expansion-panel-header class="doc-expansion-header">
                  {{ category.name }}
                </v-expansion-panel-header>

                <v-expansion-panel-content>
                  <v-row
                    v-for="(item, k) in category.items"
                    :key="k"
                  >
                    <v-col
                      class="item-clickable"
                      @click="showContent(item)"
                    >
                      {{ `${item.name} (${item.count})` }}
                    </v-col>
                  </v-row>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </template>

      <!-- Normal Files -->
      <template v-else>
        <v-expansion-panel
          v-for="(category, i) in categories"
          :key="i"
        >
          <v-expansion-panel-header class="doc-expansion-header">
            {{ category.name }}
          </v-expansion-panel-header>

          <v-expansion-panel-content>
            <v-row
              v-for="(item, j) in category.items"
              :key="j"
            >
              <v-col
                class="item-clickable"
                @click="showContent(item)"
              >
                {{ `${item.name} (${item.count})` }}
              </v-col>
            </v-row>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </template>
    </v-expansion-panels>
  </base-material-card>
</template>

<script>
  export default {
    props: {
      color: {
        type: String,
        default: 'secondary',
      },
      title: {
        type: String,
        default: '',
      },
      loading: {
        type: Boolean,
        default: false,
      },
      categories: {
        type: Array,
        default: () => ([]),
      },
      planCompany: {
        type: Boolean,
        default: false,
      },
    },

    methods: {
      showContent (directory) {
        this.$emit('update:directory', directory)
      },
    },
  }
</script>

<style lang="sass">
  .doc-expansion-header
    font-size: 16px !important
  .v-expansion-panel-content
    padding-left: 20px
</style>
