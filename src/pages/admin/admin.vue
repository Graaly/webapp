<template>
  <div class="wrapper">
    <div class="page-content top-padding-middle">
      <div class="background-dark q-pa-md">
        <a
          class="float-right no-underline close-btn"
          color="grey"
          @click="$router.push('/home')"
          ><q-icon name="close" class="subtitle1"
        /></a>
        <div class="title2 centered">Administration</div>
      </div>
      <!------------------ TABS AREA ------------------------>

      <q-tabs v-model="adminTab" class="bg-primary text-white">
        <q-tab
          name="validation"
          icon="check_box"
          label="Validation"
          default
          @click="loadQuestsToValidate"
        />
        <q-tab
          name="rejected"
          icon="sentiment_very_dissatisfied"
          label="Rejected"
          @click="loadQuestsRejected"
        />
        <q-tab name="earnings" icon="euro" label="Earnings" @click="loadEarnings"/>
        <q-tab name="statistics" icon="bar_chart" label="Statistics" @click="loadStatistics"/>
        <q-tab name="limitations" icon="pan_tool" label="Limitations" @click="loadLimitations"/>
        <q-tab name="disabled" icon="pan_tool" label="Désactivées"/>
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="adminTab" animated>
        <!------------------ LIST OF QUESTS TO VALIDATE TAB ------------------------>

        <q-tab-panel name="validation">
          <q-table
            class="container"
            title="Games awaiting validation"
            :data="questsToValidate.items"
            :columns="questsToValidate.columns"
            :visible-columns="questsToValidate.visible"
            row-key="id"
            :loading="questsToValidate.loading"
            :pagination="questsToValidate.initialPagination"
          >
            <template v-slot:header="props">
              <q-tr :props="props">
                <q-th auto-width />
                <q-th
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                >
                  {{ col.label }}
                </q-th>
                <q-th auto-width>Play</q-th>
                <q-th auto-width>Validate</q-th>
              </q-tr>
            </template>

            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td auto-width>
                  <q-avatar square>
                    <img v-if="props.row.picture" :src="uploadUrl + '/upload/quest/' + props.row.thumb">
                    <img v-if="!props.row.picture" src="statics/profiles/noprofile.png">
                  </q-avatar>
                </q-td>
                <q-td auto-width key="name">{{ props.row.title.fr }}</q-td>
                <q-td auto-width key="author">{{ props.row.author }}<br><span style="font-size: 10px;" class="text-secondary">{{ props.row.authorUserId }}</span></q-td>
                <q-td auto-width key="mail">{{ props.row.userMail }} <q-btn size="8px" flat round color="accent" icon="content_copy" class="q-mr-sm" @click="copy(props.row.userMail)"/></q-td>
                <q-td auto-width key="access">{{ props.row.access }}</q-td>
                <q-td auto-width key="premium">{{ props.row.isPremium ? 'Premium' : 'Individual' }}</q-td>
                <q-td auto-width>
                  <q-btn size="md" color="accent" glossy icon="play_arrow"  @click.native="$router.push('/quest/play/' + props.row.questId)"/>
                </q-td>
                <q-td auto-width>
                  <q-btn size="md" color="primary" glossy icon="done" @click="validate(props.row.questId, props.row.version)"/>
                </q-td>
              </q-tr>
            </template>
          </q-table>

<!--          <q-list highlight>
            <q-item v-for="quest in questsToValidate.items" :key="quest._id">
              <q-item-section
                avatar
                @click.native="$router.push('/quest/play/' + quest.questId)"
              >
                <q-avatar>
                  <img
                    v-if="quest.thumb"
                    :src="uploadUrl + '/upload/quest/' + quest.thumb['fr']"
                  />
                  <img
                    v-if="!quest.thumb"
                    src="statics/profiles/noprofile.png"
                  />
                </q-avatar>
              </q-item-section>
              <q-item-section
                @click.native="$router.push('/quest/play/' + quest.questId)"
              >
                <q-item-label>{{ getQuestTitle(quest, false) }}</q-item-label>
                <q-item-label caption v-if="quest.status === 'published'">
                  <q-rating
                    readonly
                    :value="
                      quest.rating && quest.rating.rounded
                        ? quest.rating.rounded
                        : null
                    "
                    color="primary"
                    :max="5"
                    size="1rem"
                  />
                  {{ $t("label.PublishedSince") }}
                  {{
                    quest.dateCreated | formatDate($store.state.user.language)
                  }}
                </q-item-label>
                <q-item-label caption v-if="quest.status == 'unpublished'">
                  {{ $t("label.Unpublished") }}
                </q-item-label>
                <q-item-label caption v-if="quest.status === 'tovalidate'">
                  UserId : {{ quest.authorUserId }}<br />
                  access : {{ quest.access }}<br />
                  {{ quest.isPremium ? "premium" : "individual" }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  @click="validate(quest.questId, quest.version)"
                  icon="check"
                ></q-btn>
              </q-item-section>
            </q-item>
            <q-item v-if="questsToValidate.items.length === 0">
              <q-item-label>No quest to validate</q-item-label>
            </q-item>
          </q-list>-->
        </q-tab-panel>

        <!------------------ LIST OF QUESTS REJECTED TAB ------------------------>

        <q-tab-panel name="rejected">

          <q-table
            class="container"
            title="Rejected Games"
            :data="questsRejected.items"
            :columns="questsRejected.columns"
            :visible-columns="questsRejected.visible"
            row-key="id"
            :loading="questsRejected.loading"
            :pagination="questsRejected.initialPagination"
          >
            <template v-slot:header="props">
              <q-tr :props="props">
                <q-th auto-width />
                <q-th
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                >
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td auto-width>
                  <q-avatar square>
                    <img v-if="props.row.picture" :src="uploadUrl + '/upload/quest/' + props.row.thumb">
                    <img v-if="!props.row.picture" src="statics/profiles/noprofile.png">
                  </q-avatar>
                </q-td>
                <q-td auto-width key="name">{{ props.row.title.fr }}</q-td>
                <q-td auto-width key="author">{{ props.row.author }}<br><span style="font-size: 10px;" class="text-secondary">{{ props.row.authorUserId }}</span></q-td>
                <q-td auto-width key="mail">{{ props.row.userMail }} <q-btn size="8px" flat round color="accent" icon="content_copy" class="q-mr-sm" @click="copy(props.row.userMail)"/></q-td>
                <q-td auto-width key="access">{{ props.row.access }}</q-td>
                <q-td auto-width key="premium">{{ props.row.isPremium ? 'Premium' : 'Individual' }}</q-td>
              </q-tr>
            </template>
          </q-table>
<!--          <q-list highlight>
            <q-item
              v-for="quest in questsRejected.items"
              :key="quest._id"
              @click.native="$router.push('/quest/play/' + quest.questId)"
            >
              <q-item-section avatar>
                <q-avatar>
                  <img
                    v-if="quest.thumb"
                    :src="uploadUrl + '/upload/quest/' + quest.thumb['fr']"
                  />
                  <img
                    v-if="!quest.thumb"
                    src="statics/profiles/noprofile.png"
                  />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ getQuestTitle(quest, false) }}</q-item-label>
                <q-item-label caption v-if="quest.status === 'published'">
                  <q-rating
                    readonly
                    :value="
                      quest.rating && quest.rating.rounded
                        ? quest.rating.rounded
                        : null
                    "
                    color="primary"
                    :max="5"
                    size="1rem"
                  />
                  {{ $t("label.PublishedSince") }}
                  {{
                    quest.dateCreated | formatDate($store.state.user.language)
                  }}
                </q-item-label>
                <q-item-label caption v-if="quest.status !== 'published'">
                  {{ $t("label.Unpublished") }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="questsRejected.items.length === 0">
              <q-item-label>No quest rejected</q-item-label>
            </q-item>
          </q-list>-->
        </q-tab-panel>

        <!------------------ EARNINGS TAB ------------------------>

        <q-tab-panel name="earnings">
          <q-table
            class="container"
            title="Earnings of games"
            :data="earnings.items"
            :columns="earnings.columns"
            :visible-columns="earnings.visible"
            row-key="id"
            :loading="earnings.loading"
            :pagination="earnings.initialPagination"
          >
            <template v-slot:header="props">
              <q-tr :props="props">
                <q-th
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                >
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td auto-width key="name" v-if="props.row.title.fr">{{ props.row.title.fr }}</q-td>
                <q-td auto-width key="price" class="text-center" v-if="props.row.premiumPrice.prices">{{ props.row.premiumPrice.prices.fr ? props.row.premiumPrice.prices.fr : props.row.premiumPrice.prices.en}}<br>{{ props.row.premiumPrice.manual && props.row.premiumPrice.manual !== "" ?  "manual : " + props.row.premiumPrice.manual : "" }}</q-td>
                <q-td auto-width key="price" class="text-center" v-else> Pas de prix</q-td>
                <q-td auto-width key="qrcode" class="text-center">{{ props.row.premiumPrice.tier ? props.row.tierEarnings : "--" }}</q-td>
                <q-td auto-width key="earnings" class="text-right">{{ props.row.earnings.toFixed(2) }} €</q-td>
              </q-tr>
            </template>
          </q-table>
<!--          <q-list highlight>
            <q-item v-for="earning in earnings.items" :key="earning.questId">
              <q-item-section>
                <q-item-label v-if="earning.title.fr">
                  {{earning.title.fr}}
                </q-item-label>
                <q-item-label v-if="!earning.title.fr && earning.title.en">
                  {{ earning.title.en }}
                </q-item-label>
                <q-item-label caption>
                  revenues:{{ earning.earnings }} | QR codes used:{{ earning.tierEarnings }} <span v-if="earning.premiumPrice && earning.premiumPrice.manual">(x{{ earning.premiumPrice.manual }})</span>
                </q-item-label
                >
              </q-item-section>-->
              <!--<q-item-section side>
                <q-btn>Update</q-btn>
              </q-item-section>-->
<!--            </q-item>
            <q-item v-if="statistics.items.length === 0">
              <q-item-label>No game played during 1 month</q-item-label>
            </q-item>
          </q-list>-->
        </q-tab-panel>

        <!------------------ MINI GAMES TAB ------------------------>

        <q-tab-panel name="statistics">
          <q-table
            class="container"
            title="Statistics of games"
            :data="statistics.items"
            :columns="statistics.columns"
            :visible-columns="statistics.visible"
            row-key="id"
            :loading="statistics.loading"
            :pagination="statistics.initialPagination"
          >
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td auto-width key="name">{{ props.row._id.questData.fr }}</q-td>
              <q-td auto-width key="weekNb" class="text-center">{{ props.row.weekNb }}</q-td>
              <q-td auto-width key="monthNb" class="text-center">{{ props.row.monthNb }}</q-td>
              <q-td auto-width key="rating" class="text-center">
                <q-rating
                  v-if="props.row.rating"
                  v-model="props.row.rating"
                  size="1em"
                  color="accent"
                  readonly
                />
                <q-rating
                v-else
                :value="0"
                size="1em"
                color="accent"
                readonly
              />
              </q-td>
            </q-tr>
          </template>
          </q-table>

<!--          Best games of the month:
          <q-list highlight>
            <q-item v-for="game in games.items" :key="game._id.questId">
              <q-item-section>
                <q-item-label v-if="game._id.questData.fr">{{
                  game._id.questData.fr
                }}</q-item-label>
                <q-item-label
                  v-if="!game._id.questData.fr && game._id.questData.en"
                  >{{ game._id.questData.en }}</q-item-label
                >
                <q-item-label caption
                  >Monthly:{{ game.monthNb }} Weekly:{{ game.weekNb }} rating:
                  {{ game.rating }}</q-item-label
                >
              </q-item-section>
              &lt;!&ndash;<q-item-section side>
                <q-btn>Update</q-btn>
              </q-item-section>&ndash;&gt;
            </q-item>
            <q-item v-if="games.items.length === 0">
              <q-item-label>No game played during 1 month</q-item-label>
            </q-item>
          </q-list>-->
        </q-tab-panel>

        <!------------------ LIMITATIONS TAB ------------------------>

        <q-tab-panel name="limitations">
          <q-table
            class="container"
            title="Statistics of games"
            :data="limitations.items"
            :columns="limitations.columns"
            :visible-columns="limitations.visible"
            row-key="id"
            :loading="limitations.loading"
            :pagination="limitations.initialPagination"
          />
          <!--          Published games with limitations:
                    <q-list highlight>
                      <q-item v-for="limitation in limitations.items" :key="limitation.questId">
                        <q-item-section>
                          <q-item-label v-if="limitation.title.fr">
                            {{limitation.title.fr}}
                          </q-item-label>
                          <q-item-label v-if="!limitation.title.fr && limitation.title.en">
                            {{ limitation.title.en }}
                          </q-item-label>
                          <q-item-label caption>
                            <span :class="{'text-red': (limitation.limitations.nbPlays <= limitation.nbPlayers)}">Crédits disponibles:{{ limitation.limitations.nbPlays }} | Parties jouées:{{ limitation.nbPlayers }}</span>
                          </q-item-label
                          >
                        </q-item-section>
                        &lt;!&ndash;<q-item-section side>
                          <q-btn>Update</q-btn>
                        </q-item-section>&ndash;&gt;
                      </q-item>
                      <q-item v-if="statistics.items.length === 0">
                        <q-item-label>No game played during 1 month</q-item-label>
                      </q-item>
                    </q-list>-->
        </q-tab-panel>

        <!------------------ DISABLED QUEST TAB ------------------------>
        <q-tab-panel name="disabled">
          <disabled-quest-panel></disabled-quest-panel>
        </q-tab-panel>

      </q-tab-panels>
    </div>
  </div>
</template>

<script>
import AdminService from "services/AdminService";
import disabledQuestPanel from "../../components/admin/disabledQuestPanel";

export default {
  components: {
    disabledQuestPanel
  },
  data() {
    return {
      questsToValidate: {
        loading: true,
        items: [],
        visible: ['name', 'author', 'mail', 'access', 'premium'],
        columns: [
          {name: 'id', label: 'ID', field: 'questId'},
          {name: 'name', required: true, label: 'Name', align: 'left', sortable: true, field: row => row.title.fr},
          {name: 'author', required: true, label: 'Author', align: 'left', sortable: true, field: 'author'},
          {name: 'mail', label: 'Mail', sortable: true, align: 'left', field: 'userMail'},
          {name: 'access', label: 'Access', align: 'left', sortable: true, field: 'access'},
          {name: 'premium', label: 'Premium', align: 'left', sortable: true, field: row => row.isPremium ? 'Premium' : 'Individual'}
        ],
        initialPagination: {
          sortBy: 'desc',
          descending: false,
          page: 1,
          rowsPerPage: 10
        }
      },
      questsRejected: {
        loading: true,
        items: [],
        visible: ['name', 'author', 'mail', 'access', 'premium'],
        columns: [
          {name: 'id', label: 'ID', field: 'questId'},
          {name: 'name', required: true, label: 'Name', align: 'left', sortable: true, field: row => row.title.fr},
          {name: 'author', required: true, label: 'Author', align: 'left', sortable: true, field: 'author'},
          {name: 'mail', label: 'Mail', sortable: true, align: 'left', field: 'userMail'},
          {name: 'access', label: 'Access', align: 'left', sortable: true, field: 'access'},
          {name: 'premium', label: 'Premium', align: 'left', sortable: true, field: row => row.isPremium ? 'Premium' : 'Individual'}
        ],
        initialPagination: {
          sortBy: 'desc',
          descending: false,
          page: 1,
          rowsPerPage: 10
        }
      },
      questDisabled: {

      },
      earnings: {
        loading: true,
        items: [],
        visible: ['name', 'price', 'mail', 'qrcode', 'earnings'],
        columns: [
          {name: 'name', required: true, label: 'Name', align: 'left', sortable: true, field: row => row.title.fr},
          {name: 'price', label: 'Price', sortable: false, align: 'center', field: row => row.premiumPrice.prices.fr},
          {name: 'qrcode', label: 'QR-Code used', align: 'center', sortable: true, field: 'tierEarnings'},
          {name: 'earnings', label: 'Earnings', align: 'right', sortable: true, field: 'earnings'}
        ],
        initialPagination: {
          sortBy: 'earnings',
          descending: true,
          page: 1,
          rowsPerPage: 10
        }
      },
      statistics: {
        loading: true,
        items: [],
        visible: ['name', 'weekNb', 'monthNb', 'rating'],
        columns: [
          {name: 'name', required: true, label: 'Name', align: 'left', sortable: true, field: row => row._id.questData.fr},
          {name: 'weekNb', label: 'Played Weekly', sortable: true, align: 'center', field: 'weekNb'},
          {name: 'monthNb', label: 'Played Monthly', align: 'center', sortable: true, field: 'monthNb'},
          {name: 'rating', label: 'Rating', align: 'center', sortable: true, field: 'rating'}
        ],
        initialPagination: {
          sortBy: 'monthNb',
          descending: true,
          page: 1,
          rowsPerPage: 10
        }
      },
      limitations: {
        loading: true,
        items: [],
        visible: ['name', 'stats', 'remaining'],
        columns: [
          {name: 'name', required: true, label: 'Name', align: 'left', sortable: true, field: row => row.title.fr},
          {name: 'stats', label: 'Played/Limit', sortable: true, align: 'right', field: row => row.nbPlayers + '/' + row.limitations.nbPlays},
          {name: 'remaining', label: 'Remaining credit', sortable: true, align: 'right', field: row => row.limitations.nbPlays - row.nbPlayers},
        ],
        initialPagination: {
          sortBy: 'monthNb',
          descending: true,
          page: 1,
          rowsPerPage: 10
        }
      },
      adminTab: "validation",

      serverUrl: process.env.SERVER_URL,
      uploadUrl: process.env.UPLOAD_URL
    };
  },
  mounted() {
    this.loadQuestsToValidate()
  },
  methods: {
    /*
     * Check Size of Disabled Game in Mo / Ko
     */
    goodSize(text) {
      if (text) {
        let toText = text.toLocaleString()
        if (toText.length > 8) {
          return toText.slice(-toText.length, -8) + ' Mo'
        } else if (toText.length > 4) {
          return toText.slice(-toText.length, -4) + ' Ko'
        } else if (toText.length < 4) {
          return '- de 1 Ko'
        }
      } else {
        return 'No data'
      }
    },
    /*
     * Copy to ClipBoard with notify message
     */
    copy(text) {
      this.$q.notify({
        message: 'copied : ' + text + ''
      })
      navigator.clipboard.writeText(text)
    },
    /*
     * List quests to validate
     */
    async loadQuestsToValidate() {
      // get quests to validate
      let response = await AdminService.ListQuestsToValidate();
      this.questsToValidate.items = response.data.quests;
      // console.log(this.questsToValidate.items)
      // get mail for Main Author
      this.questsToValidate.items.forEach(item => {
        AdminService.getUserMail(item.authorUserId).then(rep => {
          if (rep.status === 200) {
            item.userMail = rep.data.email
          } else {
            item.userMail = 'No User'
          }
          this.questsToValidate.loading = false
        })
      })
    },
    /*
     * List the towns
     */
    async loadTowns() {
      let response = await AdminService.ListTowns();
      this.towns.items = response.data.towns;
    },
    /*
     * Get the statistics of best games
     */
    async loadStatistics() {
      let response = await AdminService.ListBestGames();
      this.statistics.items = response.data.games;
      this.statistics.loading = false
    },
    /*
     * List the earnings
     */
    async loadEarnings() {
      let response = await AdminService.ListEarnings();
      this.earnings.items = response.data.earnings;
      this.earnings.loading = false;
    },
    /*
     * List the limitations
     */
    async loadLimitations() {
      let response = await AdminService.ListLimitations();
      this.limitations.items = response.data.limitations;
      this.limitations.loading = false;
      console.log(this.limitations.items)
    },
    /*
     * validate a quest
     */
    async validate(questId, version) {
      this.$router.push("/admin/validate/" + questId + "/version/" + version);
    },
    /*
     * List quests rejected
     */
    async loadQuestsRejected() {
      // get quests to validate
      let response = await AdminService.ListQuestsRejected();
      this.questsRejected.items = response.data.quests;
      this.questsRejected.items.forEach(item => {
        AdminService.getUserMail(item.authorUserId).then(rep => {
          if (rep.status === 200) {
            item.userMail = rep.data.email
          } else {
            item.userMail = 'No User'
          }
          this.questsRejected.loading = false
        })
      })
    },

    /*
     * Display title based on language
     * @param   {object}    quest            quest data
     * @param   {Boolean}   showLanguage     define if the map is displayed if the quest is not translated in the user language
     */
    getQuestTitle(quest, showLanguage) {
      if (!quest || !quest.title) {
        return this.$t("label.NoTitle");
      }
      if (
        this.$store.state.user.language &&
        quest.title[this.$store.state.user.language]
      ) {
        return quest.title[this.$store.state.user.language];
      } else {
        return (
          quest.title[Object.keys(quest.title)[0]] +
          (showLanguage
            ? ' <img class="image-and-text-aligned" src="statics/icons/game/flag-' +
              Object.keys(quest.title)[0] +
              '.png" />'
            : "")
        );
      }
    }
  }
};
</script>

<style>
.container{
  max-width: 1200px;
  margin: 0 auto;
}
</style>
