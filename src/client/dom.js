var extensions = {
    on(event, callback, options) {
        this.addEventListener(event, callback, options);
    },
    get(name) {
        this.getAttribute(name);
    },
    set(name, value) {
        this.setAttribute(name, value);
    },
    clear() {
        while (this.firstChild) {
            this.removeChild(this.lastChild);
        }
    },
    show() {
        this.style.display = 'block';
    },
    hide() {
        this.style.display = 'none';
    },
    css(style) {
        Object.assign(this.style, style);
    },
    insertAfter(node, reference) {
        this.insertBefore(node, reference.nextSibling);
    }
};

export default function dom(query) {
    var result = query ? document.querySelector(query) : document;
    return result ? Object.assign(result, extensions) : null;
}

dom.new = function newElement(tag, options = {}, children = []) {
    let element = document.createElement(tag);
    Object.assign(element, options, extensions);
    for (let child of children) {
        element.append(child);
    }
    return element;
}

dom.svg = function newSvgElement(tag, options = {}) {
    let element = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.assign(element, options, extensions);
    return element;
}

dom.all = function findAll(query) {
    let elements = document.querySelectorAll(query);
    for (let element of elements) {
        Object.assign(element, extensions);
    }
    return elements;
}
