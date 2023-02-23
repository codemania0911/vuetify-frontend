<template>
  <v-container
    id="tabletop-exercise"
    class="fill-height justify-center"
    tag="section"
  >
    <v-row
      align="center"
      class="text-center"
      justify="center"
    >
      <v-col
        class="mb-10"
        cols="12"
      >
        <template>
          <h1 class="header-title">
            Tabletop Exercises (TTX)
          </h1>
          <div class="text-h4 font-weight-light black--text text--lighten-1">
            Salvage and Marine Firefighting Tabletop & Equipment Deployment Exercises for the following years are&nbsp;<br class="hidden-sm-and-down">available below.
          </div>
        </template>
      </v-col>

      <template v-for="(ttx, i) in ttxs">
        <v-col
          :key="i"
          class="d-flex"
          cols="12"
          sm="6"
          md="3"
        >
          <v-card
            :color="!ttx.best ? 'transparent elevation-0' : undefined"
            :light="ttx.best"
            class="v-card--plan mx-auto pt-3 pb-4 px-2 text-center"
            max-width="100%"
          >
            <div
              class="text-body-2 text-uppercase grey--text"
              v-text="ttx.heading"
            />

            <v-avatar
              size="130"
            >
              <v-icon
                :color="ttx.color"
                size="64"
              >
                mdi-cloud-download
              </v-icon>
            </v-avatar>

            <h2
              class="text-h3 font-weight-light"
              v-text="ttx.title"
            />

            <v-card-text
              v-text="ttx.text"
            />

            <v-btn
              :color="ttx.color"
              :href="ttx.downloadLink"
              :download="ttx.name"
            >
              Download Now
            </v-btn>
          </v-card>
        </v-col>

        <v-col
          v-if="(i === 1 && $vuetify.breakpoint.smAndDown) && i + 1 !== ttx.length"
          :key="`divider-${i}`"
          class="pa-6"
          cols="12"
        >
          <v-divider />
        </v-col>
      </template>
    </v-row>
  </v-container>
</template>

<script>
  export default {
    name: 'TabletopExercise',

    data: () => ({
      ttxs: [
        {
          best: true,
          heading: '2021',
          title: '2021',
          text: 'Download last year\'s TTX documentation for review and distribution.',
          color: 'success',
          name: '2021_smff_ttx.pdf',
          downloadLink: require('@/assets/pdf/2021_smff_ttx.pdf'),
        },
        {
          best: true,
          heading: '2020',
          title: '2020',
          text: 'Download 2020\'s TTX documentation for your records and archival purposes.',
          color: 'error',
          name: '2020_smff_ttx.pdf',
          downloadLink: require('@/assets/pdf/2020_smff_ttx.pdf'),
        },
        {
          heading: '2019',
          title: '2019',
          text: 'Download 2019\'s TTX documentation for your records and archival purposes.',
          color: 'white',
          name: '2019_smff_ttx.pdf',
          downloadLink: require('@/assets/pdf/2019_smff_ttx.pdf'),
        },
        {
          heading: '2018',
          title: '2018',
          text: 'Download 2018\'s TTX documentation for your records and archival purposes.',
          color: 'white',
          name: '2018_smff_ttx.pdf',
          downloadLink: require('@/assets/pdf/2018_smff_ttx.pdf'),
        },
      ],
    }),
  }
</script>

<style lang="sass">
  .v-card--plan
    .v-avatar
      border-radius: 50%
      border: 1px solid #E5E5E5
  .v-btn--contained
    border-radius: 30px
    border: 1px solid #E5E5E5
  .header-title
    font-size: 38px
    font-weight: 300
    color: #3c4858
    margin-bottom: 40px
  .v-card__text
    color: #999999
    font-weight: 300
    font-size: 14px
</style>
