<template>
  <nav id="mainNav">
    <div class="logo">
      <h1>BFMemes Generator</h1>
      <em>Reloaded</em>
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
      <h1>BFMemes Generator - Reloaded</h1>
      <p>Un projet open-source mené par Thomas Pathier, rendu possible grâce à&nbsp;:</p>
      <ul>
        <li>Alexis Minotto, pour ses idées et contributions techniques sur la première version du générateur</li>
        <li>L'équipe d'administration et de modération du Neurchi de Templates pour leurs idées et retours
          constructifs</li>
        <li>Mon PC, dont j'ai massacré le très agréable clavier pour parvenir à mes fins</li>
        <li>Ma maman, car c'est la meilleure, et mon papa aussi &lt;3</li>
        <li>Toi, pour contribuer au succès de l'outil</li>
        <li>Et tous ceux que j'ai oublié mais qui se reconnaîtront... ou pas&nbsp;?</li>
      </ul>
      <h3>Licences</h3>
      <p>Ce projet est distribué sous licence MIT et s'appuie sur de nombreux projets open-source menés par des
        personnes sans doute plus talentueuses que l'auteur de ces lignes, notamment&nbsp;:</p>
      <ul>
        <li>Babel, Webpack et plusieurs de ses loaders, le plugin HTML Webpack.</li>
        <li>Vue, VueX, Vue-Color, Vue-loader, vue-draggable</li>
        <li>Font-Face observer</li>
        <li>Les Material Design Icons</li>
      </ul>
      <p>Les polices et éléments graphiques utilisés appartiennent à leurs auteurs respectifs lorsque applicable.</p>
      <p>Copyright {{year}} Thomas Pathier et contributeurs</p>
      <p><a href="https://youtu.be/mVP42Z_7S5M?t=398" target="_blank">FRANCE</a></p>
    </modal>
  </nav>
</template>

<script>
import Modal from "./Modal";
import {MODES} from "../lib/constants";
export default {
  name: "AboutLink",
  components: {Modal},
  data() { return {
    about: false,
    settings: false,
    modesList: MODES,
  }},
  computed: {
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
  }
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
      }
    }
  }
}
</style>