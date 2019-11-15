import './styles/main.scss';

import Keyboard from './js/Keyboard';
import enKeysData from './js/keysData/enKeysData';
import ruKeysData from './js/keysData/ruKeysData';

const savedLang = JSON.parse(localStorage.getItem('lang'));
const langsData = { en: enKeysData, ru: ruKeysData };

const keyboard = savedLang
  ? new Keyboard(langsData, savedLang)
  : new Keyboard(langsData);

keyboard.init();
