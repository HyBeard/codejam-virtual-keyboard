import createDOMElement from './createDOMElement';
import controlKeys from './keysData/controlKeys';
import modifierKeys from './keysData/modifierKeys';

export default class Keyboard {
  constructor(langsData, lang = Object.keys(langsData)[0]) {
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
    this.currentLang = lang;
    this.keysData = {
      controlKeys,
      modifierKeys,
      alphanumericKeys: { ...this.langsData[this.currentLang].normal },
    };
    this.modifiers = {
      caps: false,
      shift: false,
      ctrl: false,
      meta: false,
      alt: false,
    };
    this.pressedKeys = new Set();
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
        || this.keysData.alphanumericKeys[code];
      const keyText = createDOMElement('span', 'key_box--text', {
        innerText,
      });

      keyBox.appendChild(keyText);
      keyboardContainer.appendChild(keyBox);
    });

    document.body.appendChild(keyboardContainer);

    document.body.addEventListener('keydown', (e) => {
      if (!this.codesLayout.includes(e.code) || this.pressedKeys.has(e.code)) return;

      e.preventDefault();

      textArea.focus();

      document.querySelector(`[data-code=${e.code}]`).classList.add('pressed');

      switch (e.code) {
        case 'ShiftLeft':
        case 'ShiftRight':
          this.toggleShiftMode();
          this.updateAlphanumericSector();
          break;
        case 'CapsLock':
          this.changeRegister();
          this.updateAlphanumericSector();
          this.modifiers.caps = !this.modifiers.caps;
          break;
        case 'ControlLeft':
        case 'ControlRight':
          this.modifiers.ctrl = !this.modifiers.ctrl;
          break;
        case 'MetaLeft':
          this.modifiers.meta = !this.modifiers.meta;
          break;
        case 'AltLeft':
        case 'AltRight':
          this.modifiers.alt = !this.modifiers.alt;
          break;
        case 'Tab':
          break;
        default:
      }

      this.pressedKeys.add(e.code);
    });

    document.body.addEventListener('keyup', (e) => {
      if (!this.codesLayout.includes(e.code)) return;

      textArea.focus();
      document
        .querySelector(`[data-code=${e.code}]`)
        .classList.remove('pressed');

      switch (e.code) {
        case 'ShiftLeft':
        case 'ShiftRight':
          if (this.modifiers.alt) {
            this.changeLanguage();
          }

          this.toggleShiftMode();
          this.updateAlphanumericSector();
          break;
        case 'ControlLeft':
        case 'ControlRight':
          this.modifiers.ctrl = !this.modifiers.ctrl;
          break;
        case 'MetaLeft':
          this.modifiers.meta = !this.modifiers.meta;
          break;
        case 'AltLeft':
        case 'AltRight':
          if (this.modifiers.shift) {
            this.changeLanguage();
            this.updateAlphanumericSector();
          }

          this.modifiers.alt = !this.modifiers.alt;
          break;
        default:
          break;
      }

      this.pressedKeys.delete(e.code);
    });
  }

  toggleShiftMode() {}

  changeRegister() {
    const uppercaseEnabled = (this.modifiers.caps && !this.modifiers.shift)
      || (!this.modifiers.caps && this.modifiers.shift);
    const transformFunction = uppercaseEnabled
      ? (el) => el.toLowerCase()
      : (el) => el.toUpperCase();

    this.keysData.alphanumericKeys = Object.fromEntries(
      Object.entries(this.keysData.alphanumericKeys).map(([code, symbol]) => [
        code,
        transformFunction(symbol),
      ]),
    );
  }

  updateAlphanumericSector() {}

  changeLanguage() {}
}

// e.preventDefault();
// const { selectionStart } = textArea;
// textArea.value = textArea.value.slice(0, selectionStart)
//   + this.keysData.alphanumericKeys.normal[e.code]
//   + textArea.value.slice(textArea.selectionEnd);
// textArea.selectionStart = selectionStart + 1;
// textArea.selectionEnd = textArea.selectionStart;
