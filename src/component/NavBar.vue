<template>
  <nav id="mainNav" @click="closeSubMenu" v-on-clickaway="closeSubMenu">
    <div class="logo" @click.stop="expandSubmenu = !expandSubmenu">
      <i class="material-icons moreToggle">{{expandSubmenu ? "expand_more" : "chevron_right"}}</i>
      <h1>BFMemes Generator</h1>
      <em>Reloaded</em>
    </div>
    <div class="submenu" v-if="expandSubmenu" @click.stop>
      <a href="https://bfmemes.com" rel="noreferrer" target="_blank">
        <i class="material-icons">history_edu</i>
        BFMemes.com
      </a>
      <a href="https://bfmemes.com/papier-toilette" rel="noreferrer" target="_blank">
        <i class="material-icons">mouse</i>
        A court de PQ ?
      </a>
    </div>
    <div class="spacer" />
    <a @click="settings = true">
      <i class="material-icons">settings</i>
      Options
    </a>
    <modal @close="settings = false" :visible="settings">
      <template v-slot:title>Options</template>
      <h3>Mode</h3>
      <div class="horizontal-slider">
        <input type="range" v-model="mode" min="0" max="2" step="1" />
        <div class="options">
          <div v-for="({label, description}, key) of modesList" :class="[key === mode && 'active']" :key="key">
            <p>{{label}}</p>
            <em>{{description}}</em>
          </div>
        </div>
      </div>
    </modal>
    <a @click="about = true">
      <i class="material-icons">info</i>
      A propos
    </a>
    <modal @close="about = false" :visible="about">
      <template v-slot:title>A propos</template>
      <h1>
        BFMemes Generator - Reloaded
        <em class="version">Version {{appVersion}} - {{appBranch}}</em>
      </h1>
      <p>Un projet open-source mené par Thomas Pathier, d'après une idée originale de "Jean Bono", rendu possible grâce à&nbsp;:</p>
      <ul>
        <li>Alexis Minotto, pour ses idées et contributions techniques sur la première version du générateur</li>
        <li>L'équipe d'administration et de modération du Neurchi de memes d'Actualités pour leurs idées et retours
          constructifs</li>
        <li>Mon PC, dont j'ai massacré le très agréable clavier pour parvenir à mes fins</li>
        <li>Ma maman, car c'est la meilleure, et mon papa aussi &lt;3</li>
        <li>Toi, pour contribuer au succès de l'outil</li>
        <li>Et tous ceux que j'ai oublié mais qui se reconnaîtront... ou pas&nbsp;?</li>
      </ul>
      <p>Le projet vous plaît&nbsp;? <a href="https://github.com/TPXP/bfmemes_generator" target="_blank" rel="noreferrer">
        Joignez-vous à l'aventure&nbsp;!</a></p>
      <h3>Vie privée et confidentialité</h3>
      <p>Le projet est hébergé par la société Ionos.fr, qui collecte les données de visite du site (notamment adresse
        IP et cookies) et les traite conformément à
        <a href="https://www.ionos.fr/terms-gtc/terms-privacy/" target="_blank" rel="noreferrer">sa politique de confidentialité</a>.</p>
      <p>L'équipe BFMemes a également accès aux données collectées. Ces données sont anonymes et ne sont utilisées
        qu'à des fins de statistiques de visite.</p>
      <p>Pour exercer votre doit d'accès et de rectification des données vous concernant, contactez l'équipe BFMemes
        par courriel à l'adresse <a href="mailto:contact@bfmemes.com">contact@bfmemes.com</a>.</p>
      <p>Afin de fournir nos services, nous avons également recours aux partenaires suivants qui peuvent collecter
        des informations sur vous et les traitent conformément à leur politique de confidentialité&nbsp;:</p>
      <ul>
        <li><a href="https://policies.google.com/privacy?hl=en" target="_blank" rel="noreferrer">Google fonts</a></li>
        <li><a href="https://imgur.com/privacy" target="_blank" rel="noreferrer">Imgur</a></li>
      </ul>
      <h3>Licences</h3>
      <p>Ce projet est distribué sous licence MIT et s'appuie sur de nombreux projets open-source menés par des
        personnes sans doute plus talentueuses que l'auteur de ces lignes, notamment&nbsp;:</p>
      <ul>
        <li>Babel, Webpack et plusieurs de ses loaders, le plugin HTML Webpack.</li>
        <li>Vue, VueX, Vue-Color, Vue-loader, vue-draggable</li>
        <li>Font-Face observer</li>
        <li>Les Material Design Icons</li>
        <li>Le paquet NPM patch-package</li>
      </ul>
      <p>Les polices et éléments graphiques utilisés appartiennent à leurs auteurs respectifs lorsque applicable.</p>
      <p>Cet outil est fourni à des fins humoristiques. Les auteurs déclinent toute responsabilité résultant d'une
        utilisation de cet outil à d'autres fins. N'utilisez pas cet outil pour propager des fausses nouvelles, infox
        ou <em>fake news</em> (rayer la ou les mentions inutiles) s'il vous plaît. 🙏</p>
      <p>&copy; Copyright {{year}} Thomas Pathier et contributeurs</p>
      <p><a href="https://youtu.be/mVP42Z_7S5M?t=398" target="_blank">FRANCE</a></p>
    </modal>
  </nav>
</template>

<script>
import Modal from "./Modal";
import {MODES} from "@/lib/constants";
import {mixin as clickaway} from "vue-clickaway2";
export default {
  name: "AboutLink",
  components: {Modal},
  data() { return {
    about: false,
    settings: false,
    modesList: MODES,
    expandSubmenu: false,
  }},
  mixins: [clickaway],
  computed: {
    appVersion() { return __GIT_VERSION; },
    appBranch() { return __GIT_BRANCH; },
    year() {
      return (new Date).getFullYear();
    },
    mode: {
      get() {
        return this.$store.state.mode;
      },
      set(value) {
        this.$store.commit('setMode', parseInt(value));
      }
    },
  },
  methods: {
    closeSubMenu() {
      this.expandSubmenu = false;
    },
  },
  mounted() {
    if(window.location.hash === '#about')
      this.about = true;
  },
}
</script>

<style scoped lang="scss">
@import "src/scss/variables";
.horizontal-slider {
  display: flex;
  flex-direction: column;
  input {
    margin: 20px 16.666%; // 33.333% / 2 - imperfect, switch to a better slider one day
  }
  .options {
    display: flex;
    flex-direction: row;
    div {
      flex:1;
      text-align: center;
      padding:0 20px 10px;
      p {
        font-weight: bold;
        font-size: 120%;
      }
      em {
        color: #fff9;
      }
      &.active {
        p{
          color: $primary;
        }
      }
    }
  }
}
@media (max-width:530px) {
  #mainNav {
    > a {
      font-size:0;
      .material-icons {
        margin-right:0;
      }
    }
  }
  .horizontal-slider {
    flex-direction: row;
    align-items: stretch;
    $dimension: 250px;
    height: $dimension;
    input {
      transform: rotate(90deg);
      transform-origin: 15px 15px;
      width:$dimension * 2/3;
      margin: $dimension/6 0 0;
      height:30px;
      align-self: flex-start;
    }
    .options {
      margin-left:-$dimension*2/3 + 50px;
      flex-direction: column;
      flex:1;
      div {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding:0;
        align-items: flex-start;
        text-align: left;
      }
    }
  }
}
.logo {
  cursor: pointer;
  &:hover {
    background: #fff2;
  }
}
.moreToggle {
  font-size: 40px;
  position: relative;
  left:-5px;
  top:2px;
}
#mainNav {
  position: relative;
}
.submenu {
  position: absolute;
  top:100%;
  left:0;
  width:200px;
  background: $darkerPrimary;
  border-bottom-right-radius: 10px;
  box-shadow: 0 0 10px #0002;
  overflow: hidden;
  border-width: 0 1px 1px 0;
  border-color: darken($darkerPrimary, 30);
  border-style: solid;
  a {
    border-top: 1px solid darken($darkerPrimary, 30);
    display: block;
    height:50px;
    line-height: 30px;
    padding:10px;
    color: $white;
    .material-icons {
      line-height: 30px;
      vertical-align: top;
      margin-right: 5px;
    }
    &:hover {
      text-decoration: none;
      background: #fff2;
    }
  }
}
.version {
  font-size:14px;
  display: block;
  text-align: right;
  font-weight: normal;
  line-height: 20px;
}
</style>