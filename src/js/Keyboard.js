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

    const takeKeyAction = (code, isKeydown) => {
      if (!isKeydown && !this.keysData.modifierKeys[code]) return;

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

          this.toggleShiftMode();
          this.updateAlphanumericSector();
          break;

        case 'CapsLock':
          if (!isKeydown) return;

          this.changeRegister();
          this.updateAlphanumericSector();
          this.modifiers.caps = !this.modifiers.caps;
          break;

        case 'ControlLeft':
        case 'ControlRight':
          if (this.modifiers.ctrlKey && isKeydown) return;

          this.modifiers.ctrlKey = !this.modifiers.ctrlKey;
          break;

        case 'MetaLeft':
          this.modifiers.metaKey = !this.modifiers.metaKey;
          break;

        case 'AltLeft':
        case 'AltRight':
          if (this.modifiers.altKey && isKeydown) return;

          if (!isKeydown && this.modifiers.shiftKey) {
            this.changeLanguage();
            this.updateAlphanumericSector();
          }

          this.modifiers.altKey = !this.modifiers.altKey;
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

        case 'ArrowUp':
          textArea.selectionStart = initSelectionStart - 10;
          textArea.selectionEnd = textArea.selectionStart;
          break;

        case 'ArrowDown':
          textArea.selectionStart = initSelectionStart + 10;
          textArea.selectionEnd = textArea.selectionStart;
          break;

        case 'ArrowLeft':
          textArea.selectionStart = initSelectionStart - 1;
          textArea.selectionEnd = textArea.selectionStart;
          break;

        case 'ArrowRight':
          textArea.selectionStart = initSelectionStart + 1;
          textArea.selectionEnd = textArea.selectionStart;
          break;

        default:
    document.body.addEventListener('keydown', (ev) => {
      const { code } = ev;
      if (!this.codesLayout.includes(code) || this.pressedKeys.has(code)) {
        return;
      }

      if (code === 'CapsLock') {
        document
          .querySelector('[data-code=CapsLock]')
          .classList.toggle('active');
      }

      document.querySelector(`[data-code=${code}]`).classList.add('pressed');

      this.pressedKeys.add(code);
      ev.preventDefault();
      takeKeyAction(code, true);
    });

    document.body.addEventListener('keypress', (ev) => {
      if (this.keysData.alphanumericKeys[ev.code]) {
        ev.preventDefault();
        takeKeyAction(ev.code, true);
      }
    });

    document.body.addEventListener('keyup', ({ code }) => {
      if (!this.codesLayout.includes(code)) return;

      document.querySelector(`[data-code=${code}]`).classList.remove('pressed');

      this.pressedKeys.delete(code);
      takeKeyAction(code, false);
    });

    keyboardContainer.addEventListener('mousedown', ({ target }) => {
      if (!target.closest('.key_box')) return;

      const keyBox = target.closest('.key_box');
      const { code } = keyBox.dataset;

      if (code === 'CapsLock') {
      document
          .querySelector('[data-code=CapsLock]')
          .classList.toggle('active');
      }

      if (keyBox.classList.contains('pressed')) {
        keyBox.classList.remove('pressed');
        takeKeyAction(code, false);
        this.pressedKeys.delete(code);
      } else {
        keyBox.classList.add('pressed');
        takeKeyAction(code, true);
        this.pressedKeys.add(code);
          }
    });

    document.addEventListener('mouseup', () => {
      const lastKeyCode = _.last([...this.pressedKeys]);
      if (
        (this.keysData.modifierKeys[lastKeyCode] && lastKeyCode !== 'CapsLock')
        || !lastKeyCode
      ) {
        return;
          }

      const keyBox = document.querySelector(`[data-code=${lastKeyCode}]`);

      keyBox.classList.remove('pressed');
      this.pressedKeys.delete(lastKeyCode);
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
