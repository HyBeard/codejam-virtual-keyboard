export default function createDOMElement(tag, classes, props, attributes) {
  const newElement = document.createElement(tag);

  newElement.className = classes;
  Object.assign(newElement, props);

  if (attributes) {
    [...Object.entries(attributes)].forEach(([attr, value]) => {
      newElement.setAttribute(attr, value);
    });
  }

  return newElement;
}
