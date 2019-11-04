import createDOMElement from './createDOMElement';
import controlKeys from './keysData/controlKeys';
import modifierKeys from './keysData/modifierKeys';

export default class Keyboard {
  constructor(langsData) {
    this.codesLayout = [
      'Backquote',
      'Digit1',
      'Digit2',
      'Digit3',
      'Digit4',
      'Digit5',
      'Digit6',
      'Digit7',
      'Digit8',
      'Digit9',
      'Digit0',
      'Minus',
      'Equal',
      'Backspace',
      'Tab',
      'KeyQ',
      'KeyW',
      'KeyE',
      'KeyR',
      'KeyT',
      'KeyY',
      'KeyU',
      'KeyI',
      'KeyO',
      'KeyP',
      'BracketLeft',
      'BracketRight',
      'Backslash',
      'Delete',
      'CapsLock',
      'KeyA',
      'KeyS',
      'KeyD',
      'KeyF',
      'KeyG',
      'KeyH',
      'KeyJ',
      'KeyK',
      'KeyL',
      'Semicolon',
      'Quote',
      'Enter',
      'ShiftLeft',
      'KeyZ',
      'KeyX',
      'KeyC',
      'KeyV',
      'KeyB',
      'KeyN',
      'KeyM',
      'Comma',
      'Period',
      'Slash',
      'ArrowUp',
      'ShiftRight',
      'ControlLeft',
      'MetaLeft',
      'AltLeft',
      'Space',
      'AltRight',
      'ControlRight',
      'ArrowLeft',
      'ArrowDown',
      'ArrowRight',
    ];
    this.langsData = langsData;
    [this.currentLang] = Object.keys(this.langsData);
    this.keysData = {
      controlKeys,
      modifierKeys,
      alphanumericKeys: this.langsData[this.currentLang],
    };
    this.modifiers = {
      caps: false,
      shift: false,
      ctrl: false,
      meta: false,
      alt: false,
    };
  }

  init() {
    const keyboardContainer = createDOMElement('div', 'keyboard_container');
    const textArea = createDOMElement('textarea');
    keyboardContainer.appendChild(textArea);

    this.codesLayout.forEach((code) => {
      const keyBox = createDOMElement(
        'div',
        'key_box',
        {},
        {
          'data-code': `${code}`,
        },
      );

      const innerText = this.keysData.controlKeys[code]
        || this.keysData.modifierKeys[code]
        || this.keysData.alphanumericKeys.normal[code];
      const keyText = createDOMElement('span', 'key_box--text', {
        innerText,
      });

      keyBox.appendChild(keyText);
      keyboardContainer.appendChild(keyBox);
    });

    document.body.appendChild(keyboardContainer);
  }
}
