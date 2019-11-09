import createDOMElement from './createDOMElement';
import controlKeys from './keysData/controlKeys';
import modifierKeys from './keysData/modifierKeys';
import codesLayout from './keysData/codesLayout';

const _ = require('lodash/fp');

export default class Keyboard {
  constructor(langsData, lang = Object.keys(langsData)[0]) {
    this.codesLayout = codesLayout;
    this.langsData = langsData;
    this.currentLang = lang;
    this.keysData = {
      controlKeys,
      modifierKeys,
      alphanumericKeys: { ...this.langsData[this.currentLang].normal },
    };
    this.modifiers = {
      caps: false,
      shiftKey: false,
      ctrlKey: false,
      metaKey: false,
      altKey: false,
    };
    this.pressedKeys = new Set();
  }

  init() {
    const aspectRatioWrap = createDOMElement('div', 'wrap');
    const keyboardContainer = createDOMElement('div', 'keyboard_container');
    const textArea = createDOMElement('textarea', 'text_input');

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

    aspectRatioWrap.appendChild(keyboardContainer);
    document.body.appendChild(textArea);
    document.body.appendChild(aspectRatioWrap);
    textArea.focus();

    document.body.addEventListener('keydown', (e) => {
      if (!this.codesLayout.includes(e.code) || this.pressedKeys.has(e.code)) {
        return;
      }

      const { selectionStart: initSelectionStart } = textArea;

      textArea.focus();
      e.preventDefault();
      this.pressedKeys.add(e.code);

      switch (code) {
        case 'ShiftLeft':
        case 'ShiftRight':
          this.toggleShiftMode();
          this.updateAlphanumericSector();
          if (this.modifiers.shiftKey && isKeydown) return;

          if (!isKeydown && this.modifiers.altKey) {
            this.changeLanguage();
          }
          if (!isKeydown) return;


          break;

        case 'CapsLock':
          this.changeRegister();
          if (this.modifiers.ctrlKey && isKeydown) return;

          this.modifiers.ctrlKey = !this.modifiers.ctrlKey;
          this.modifiers.caps = !this.modifiers.caps;
          break;

          this.modifiers.metaKey = !this.modifiers.metaKey;
        case 'ControlRight':
          this.modifiers.ctrl = !this.modifiers.ctrl;
          if (this.modifiers.altKey && isKeydown) return;

          if (!isKeydown && this.modifiers.shiftKey) {
            this.changeLanguage();
            this.updateAlphanumericSector();
          }

          this.modifiers.altKey = !this.modifiers.altKey;

        case 'MetaLeft':
          this.modifiers.meta = !this.modifiers.meta;
          break;

        case 'AltLeft':
        case 'AltRight':
          this.modifiers.alt = !this.modifiers.alt;
          break;

        case 'Tab':
          textArea.value = `${textArea.value.slice(
            0,
            initSelectionStart,
          )}    ${textArea.value.slice(textArea.selectionEnd)}`;
          textArea.selectionStart = initSelectionStart + 4;
          textArea.selectionEnd = textArea.selectionStart;
          break;

        case 'Backspace':
          if (initSelectionStart - textArea.selectionEnd === 0) {
            textArea.value = textArea.value.slice(0, initSelectionStart - 1)
              + textArea.value.slice(textArea.selectionEnd); textArea.selectionStart = initSelectionStart - 1;
            textArea.selectionEnd = textArea.selectionStart;
          } else {
            textArea.value = textArea.value.slice(0, initSelectionStart)
              + textArea.value.slice(textArea.selectionEnd);
            textArea.selectionStart = initSelectionStart;
            textArea.selectionEnd = textArea.selectionStart;
          }
          break;

        case 'Enter':
          textArea.value = `${textArea.value.slice(0, initSelectionStart)
          }\n${
            textArea.value.slice(textArea.selectionEnd)}`;
          textArea.selectionStart = initSelectionStart + 1;
          textArea.selectionEnd = textArea.selectionStart;
          break;

        default:
          textArea.value = textArea.value.slice(0, initSelectionStart)
            + this.keysData.alphanumericKeys[e.code]
            + textArea.value.slice(textArea.selectionEnd);
          textArea.selectionStart = initSelectionStart + 1;
          textArea.selectionEnd = textArea.selectionStart;
      }
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

    document.addEventListener('focusout', () => {
      [...this.pressedKeys.keys()].forEach((code) => document
        .querySelector(`[data-code=${code}]`)
        .classList.toggle('pressed'));

      this.pressedKeys.clear();
    });
  }

  toggleShiftMode() {
    const targetKeysData = this.modifiers.shiftKey ? 'normal' : 'alternative';
    Object.assign(
      this.keysData.alphanumericKeys,
      this.langsData[this.currentLang][targetKeysData],
    );

    this.changeRegister();

    this.modifiers.shiftKey = !this.modifiers.shiftKey;
  }

  changeRegister() {
    const uppercaseEnabled = (this.modifiers.caps && !this.modifiers.shiftKey)
      || (!this.modifiers.caps && this.modifiers.shiftKey);
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

  updateAlphanumericSector() {
    Object.keys(this.keysData.alphanumericKeys).forEach((key) => {
      document.querySelector(
        `[data-code=${key}]`,
      ).innerText = this.keysData.alphanumericKeys[key];
    });
  }

  changeLanguage() {
    const nextLangNumber = Object.keys(this.langsData).indexOf(
      this.currentLang,
    );
    const nextLang = Object.keys(this.langsData)[nextLangNumber + 1]
      || Object.keys(this.langsData)[0];
    this.currentLang = nextLang;
    Object.assign(
      this.keysData.alphanumericKeys,
      this.langsData[this.currentLang].normal,
    );
  }
}
