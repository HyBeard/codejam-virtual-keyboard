import './styles/main.scss';

import Keyboard from './js/Keyboard';
import enKeysData from './js/keysData/enKeysData';
import ruKeysData from './js/keysData/ruKeysData';

const savedLang = JSON.parse(localStorage.getItem('lang'));

const keyboard = savedLang
  ? new Keyboard({ en: enKeysData, ru: ruKeysData }, savedLang)
  : new Keyboard({ en: enKeysData, ru: ruKeysData });

keyboard.init();
