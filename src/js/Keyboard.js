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
      this.processKeyAction(code, true, textArea);
    });

    document.body.addEventListener('keypress', (ev) => {
      if (this.keysData.alphanumericKeys[ev.code]) {
        ev.preventDefault();
        this.processKeyAction(ev.code, true, textArea);
      }
    });

    document.body.addEventListener('keyup', ({ code }) => {
      if (!this.codesLayout.includes(code)) return;

      document.querySelector(`[data-code=${code}]`).classList.remove('pressed');

      this.pressedKeys.delete(code);
      this.processKeyAction(code, false, textArea);
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
        this.processKeyAction(code, false, textArea);
        this.pressedKeys.delete(code);
      } else {
        keyBox.classList.add('pressed');
        this.processKeyAction(code, true, textArea);
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

    window.addEventListener(
      'blur',
      () => {
        [...this.pressedKeys.keys()].forEach((code) => {
          if (this.keysData.modifierKeys[code]) return;

          document
            .querySelector(`[data-code=${code}]`)
            .classList.remove('pressed');
        });

        this.pressedKeys.clear();
      },
      false,
    );

    textArea.addEventListener('focusout', () => {
      textArea.focus();
    });
  }

  static updateTextArea(textArea, updatedProps) {
    Object.assign(textArea, updatedProps);
  }

  takeModifyKey(code, isKeydown) {
    if (!isKeydown && !this.keysData.modifierKeys[code]) return;

    switch (code) {
      case 'ShiftLeft':
      case 'ShiftRight':
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

      default:
        break;
    }
  }

  takeChangeKeyAction(code, textArea) {
    const { value, selectionStart, selectionEnd } = textArea;
    const updatedProps = {
      value,
      selectionEnd,
      selectionStart,
    };

    function insertSymbol(sym, cursorDisplacement = sym.length) {
      updatedProps.value = value.slice(0, selectionStart)
        + sym
        + value.slice(selectionEnd);
      updatedProps.selectionStart = selectionStart + cursorDisplacement;
      updatedProps.selectionEnd = updatedProps.selectionStart;
    }

    switch (code) {
      case 'Tab':
        insertSymbol('    ');
        break;

      case 'Backspace':
        if (selectionStart - selectionEnd === 0) {
          updatedProps.value = value.slice(0, selectionStart - 1)
            + value.slice(selectionEnd);
          updatedProps.selectionStart -= 1;
          updatedProps.selectionEnd = updatedProps.selectionStart;
        } else {
          insertSymbol('');
        }
        break;

      case 'Enter':
        insertSymbol('\n');
        break;

      case 'Space':
        insertSymbol(' ');
        break;

      case 'ContextMenu':
        break;

      case 'Delete':
        if (selectionStart - selectionEnd === 0) {
          updatedProps.value = value.slice(0, selectionStart)
            + value.slice(selectionEnd + 1);
          updatedProps.selectionStart = selectionStart;
          updatedProps.selectionEnd = selectionStart;
        } else {
          insertSymbol('');
        }
        break;

      case 'ArrowUp':
        updatedProps.selectionStart -= 10;
        updatedProps.selectionEnd = selectionStart;
        break;

      case 'ArrowDown':
        updatedProps.selectionStart += 10;
        updatedProps.selectionEnd = selectionStart;
        break;

      case 'ArrowLeft':
        updatedProps.selectionStart -= 1;
        updatedProps.selectionEnd = selectionStart;
        break;

      case 'ArrowRight':
        updatedProps.selectionStart += 1;
        updatedProps.selectionEnd = selectionStart;
        break;

      default:
        insertSymbol(this.keysData.alphanumericKeys[code]);
    }

    Keyboard.updateTextArea(textArea, updatedProps);
  }

  processKeyAction(code, isKeydown, textArea) {
    if (this.keysData.modifierKeys[code]) {
      this.takeModifyKey(code, isKeydown);
    } else {
      this.takeChangeKeyAction(code, textArea);
    }
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

    localStorage.setItem('lang', JSON.stringify(this.currentLang));
  }
}
