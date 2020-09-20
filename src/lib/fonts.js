import FontFaceObserver from 'fontfaceobserver';

import PilatBlackOTF from '../assets/fonts/PilatBlack.otf';
import PilatCondensedBlack from '../assets/fonts/PilatCondensedBlack.otf';
import PilatLightOTF from '../assets/fonts/PilatLight.otf';
import CamberTTF from '../assets/fonts/Camber.ttf';

const FONTS = [
  {
    name: 'Pilat Black',
    file: PilatBlackOTF,
    format: 'opentype',
  },
  {
    name: 'Pilat Condensed Black',
    file: PilatCondensedBlack,
    format: 'opentype',
  },
  {
    name: 'Pilat Light',
    file: PilatLightOTF,
    format: 'opentype',
  },
  {
    name: 'Camber',
    file: CamberTTF,
    format: 'opentype',
  },
  // Those fonts don't have files since they're either loaded by the app (Lato) or provided by the system
  {
    name: 'Lato',
  },
  {
    name: 'Par défaut',
    fontName: 'sans-serif',
  },
  {
    name: 'Par défaut (serif)',
    fontName: 'serif',
  }
];

export function getFonts(){
  return FONTS;
}

// Font name -> Loaded promise
const loadedFonts = {};

/**
 * Load a font
 * @param fontObject
 * @return A Promise that resolves once the font is loaded
 */
export async function loadFont(fontObject) {
  if(!fontObject)
    throw new Error('Undefined font object');
  if(!fontObject.file)
    return true;
  // If needed, add the code required to load the font and initialize the font promise.
  if(!loadedFonts[fontObject.name]) {
    const style = document.createElement('style');
    style.innerHTML = `@font-face {
      font-family: "${fontObject.name.replace(/"/g, '\\"')}";
      src: url("${fontObject.file.replace(/"/g, '\\"')}") format("${fontObject.format}");
    }`;
    document.body.appendChild(style);
    loadedFonts[fontObject.name] = new FontFaceObserver(fontObject.name).load();
  }
  return loadedFonts[fontObject.name];
}