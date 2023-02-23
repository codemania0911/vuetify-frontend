<template>
  <base-material-card
    :color="color"
    icon="mdi-currency-usd"
    inline
  >
    <template v-slot:after-heading>
      <div class="text-h3">
        {{ title }}
      </div>
    </template>

    <v-simple-table class="mt-3">
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">
              Billing Mode
            </th>
            <th class="text-left">
              Total Clients
            </th>
            <th class="text-left">
              Total Vessels
            </th>
            <th class="text-left">
              Total Amount
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(item, i) in items"
            :key="i"
          >
            <td>
              <router-link
                v-if="i < items.length - 1"
                :to="item.to"
              >
                {{ item.mode }}
              </router-link>
              <span v-else>{{ item.mode }}</span>
            </td>
            <td>{{ item.clients }}</td>
            <td>{{ item.vessels }}</td>
            <td>{{ item.amount }}</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </base-material-card>
</template>

<script>
  export default {
    props: {
      title: {
        type: String,
        default: '',
      },
      color: {
        type: String,
        default: '',
      },
      items: {
        type: Array,
        default: () => ([]),
      },
    },
  }
</script>
