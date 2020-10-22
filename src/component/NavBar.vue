<template>
  <nav id="mainNav">
    <div class="logo">
      <h1>BFMemes Generator</h1>
      <em>Reloaded</em>
    </div>
    <div class="spacer" />
    <a @click="visible = true">
      <i class="material-icons">info</i>
      A propos
    </a>
    <modal @close="visible = false" :visible="visible">
      <template v-slot:title>BFMemes Generator - Reloaded</template>
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
      <p>FRANCE</p>
    </modal>
  </nav>
</template>

<script>
import Modal from "./Modal";
export default {
  name: "AboutLink",
  components: {Modal},
  data() { return {
    visible: false,
  }},
  computed: {
    year() {
      return (new Date).getFullYear();
    },
  }
}
</script>

<style scoped>

</style>