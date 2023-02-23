<template>
  <base-material-card
    :color="color"
    :icon="icon"
    inline
  >
    <template v-slot:after-heading>
      <div class="text-h3">
        {{ title }}
      </div>
    </template>

    <v-progress-linear
      v-if="loading"
      indeterminate
    />

    <v-simple-table class="mt-3">
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">
              Minimum Vessels
            </th>
            <th class="text-left">
              Maximum Vessels
            </th>
            <th class="text-left">
              Discounts
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(discount, i) in discounts"
            :key="i"
          >
            <td>{{ discount.min_extreme }}</td>
            <td>{{ discount.max_extreme }}</td>
            <td>{{ discount.discount }}%</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </base-material-card>
</template>

<script>
  export default {
    props: {
      color: {
        type: String,
        default: '',
      },
      title: {
        type: String,
        default: '',
      },
      icon: {
        type: String,
        default: '',
      },
      discounts: {
        type: Array,
        default: () => ([]),
      },
      loading: {
        type: Boolean,
        default: false,
      },
    },
  }
</script>
