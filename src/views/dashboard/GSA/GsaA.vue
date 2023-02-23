<template>
  <v-container
    fluid
    tag="section"
  >
    <v-row>
      <v-col
        cols="12"
      >
        <div
          id="chartdiv"
          style="height: 25vw"
        />
      </v-col>
      <v-col
        cols="12"
        lg="4"
      >
        <h3 class="text-h3 mb-8">
          Geographic Specific Annexes
        </h3>

        <h3>DONJON-SMIT Americas</h3>

        <p>
          DONJON-SMIT Americas's geographic specific annexes, incorporated by reference into vessel response plans, can be downloaded here.
        </p>

        <h3 class="mb-3">
          General Information (All Areas)
        </h3>

        <p
          v-for="(area, i) in gsaFiles.all_areas"
          :key="i"
          class="ml-5"
        >
          <a
            v-if="area.djs_a_url"
            style="text-decoration: none"
            @click="downloadFile(area)"
          >
            {{ area.name }}
          </a>
          <span v-else>{{ area.name }}</span>
        </p>

        <p>
          The USCG has determined that incorporating resource listings for contracted SMFF services into VRP GSAs by reference is an acceptable method of providing the required information in the required VRP updates as long as the most recent version of the resource providers SMFF core GSA that is on file with the USCG is used
        </p>

        <p>
          Vessel owners/operators may reference USCG-accepted SMFF core GSAs in their VRP updates in lieu of submitting detailed salvage and marine firefighting resource information in the VRP, but only for those resource providers with whom they have established contracts and funding agreements in accordance with 33 CFR Part 155 Subpart I.
        </p>
      </v-col>
      <v-col
        cols="12"
        sm="6"
        lg="4"
      >
        <v-card>
          <v-card-text>
            <base-subheading subheading="ATLANTIC AREA" />

            <v-progress-linear
              v-if="loading"
              indeterminate
            />

            <v-expansion-panels
              v-else
              v-model="atlanticAreaPanel"
              accordion
              flat
              hover
              class="gsa-accordion"
            >
              <v-expansion-panel
                v-for="(atu, i) in Object.keys(gsaFiles.atlantic_area)"
                :key="i"
              >
                <v-expansion-panel-header>
                  USCG District #{{ atu }}
                </v-expansion-panel-header>

                <v-expansion-panel-content>
                  <template
                    v-for="(area, j) in gsaFiles.atlantic_area[atu]"
                  >
                    <a
                      v-if="area.djs_a_url"
                      :key="j + 'link'"
                      @click="downloadFile(area)"
                    >
                      <p>
                        {{ area.name }}
                      </p>
                    </a>

                    <p
                      v-else
                      :key="j + 'text'"
                    >
                      {{ area.name }}
                    </p>
                  </template>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col
        cols="12"
        sm="6"
        lg="4"
      >
        <v-card>
          <v-card-text>
            <base-subheading subheading="PACIFIC AREA" />

            <v-progress-linear
              v-if="loading"
              indeterminate
            />

            <v-expansion-panels
              v-else
              v-model="pacificAreaPanel"
              accordion
              flat
              hover
              class="gsa-accordion"
            >
              <v-expansion-panel
                v-for="(atu, i) in Object.keys(gsaFiles.pacific_area)"
                :key="i"
              >
                <v-expansion-panel-header>
                  USCG District #{{ atu }}
                </v-expansion-panel-header>

                <v-expansion-panel-content>
                  <template
                    v-for="(area, j) in gsaFiles.pacific_area[atu]"
                  >
                    <a
                      v-if="area.djs_a_url"
                      :key="j + 'link'"
                      target="_blank"
                      @click="downloadFile(area)"
                    >
                      <p>
                        {{ area.name }}
                      </p>
                    </a>

                    <p
                      v-else
                      :key="j + 'text'"
                    >
                      {{ area.name }}
                    </p>
                  </template>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import axios from 'axios'
  import { cotpMap } from './mixins/cotpMap'
  import { getFileUrl } from '@/shared/fileUtils'
  import download from 'downloadjs'

  export default {
    name: 'GsaDjsA',

    mixins: [cotpMap],

    data: () => ({
      getFileUrl,
    }),

    methods: {
      downloadFile (area) {
        axios({
          url: `gsa/${area.atu}/documents/${area.object_id}/DJ-S_A/${area.djs_a_url}/download`,
          method: 'GET',
          responseType: 'blob',
          timeout: 18000000,
        }).then(downloadRes => {
          this.showSnackBar({ text: 'Download started', color: 'success' })
          download(downloadRes.data, area.djs_a_url)
        }).catch(error => {
          this.showSnackBar({ text: error, color: 'error' })
        })
      },
    },
  }
</script>

<style lang="sass">
  .gsa-accordion
    .v-expansion-panel-header
      border-bottom: 1px solid lightgray
      padding: 25px 10px 5px 0px
      font-size: 1.0625rem
    .v-expansion-panel--active > .v-expansion-panel-header
      min-height: 48px
      color: #c32f27
    .v-expansion-panel-content__wrap
      padding: 15px 5px 5px
      font-size: 1rem
      a
        text-decoration: none

  #chartdiv
    width: 100%
    height: 300px
</style>
