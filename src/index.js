import './styles/main.scss';

import Keyboard from './js/Keyboard';
import enKeysData from './js/keysData/enKeysData';
import ruKeysData from './js/keysData/ruKeysData';

const keyboard = new Keyboard({ en: enKeysData, ru: ruKeysData });

keyboard.init();
