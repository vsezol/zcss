render();

function render() {
  const zcss = getZCSS();
  zcss.disabled = true;

  const html = createHTMLTree(zcss);

  document.body.appendChild(html);
}

function createHTMLTree(rule, rootVariables) {
  let selector = rule.selectorText?.split("& ")?.at(-1) ?? "div";

  if (selector.includes(":")) {
    return null;
  }

  const treeSelector = parseSelector(selector);

  const [parentElement, currentElement, currentSelector] =
    createElementByTreeSelector(treeSelector);

  const children = [];

  if (currentSelector.tag.startsWith("repeat")) {
    const times = Number(currentSelector.tag.split("-").at(-1));

    for (let i = 0; i < times; i++) {
      for (let r of rule.cssRules) {
        children.push([r, { $i: i }]);
      }
    }
  } else if (currentSelector.tag.startsWith("for")) {
    const [from, to] = currentSelector.tag.split("-").slice(1).map(Number);

    for (let i = from; i < to; i++) {
      for (let r of rule.cssRules) {
        children.push([r, { $i: i }]);
      }
    }
  } else {
    for (let r of rule.cssRules) {
      children.push([r, {}]);
    }
  }

  for (let key in rule?.style ?? []) {
    if (isNaN(key) && rule.style[key] !== "") {
      currentElement.style[key] = rule.style[key];
    }
  }

  for (let [child, variables] of children) {
    const mergedVariables = {
      ...rootVariables,
      ...variables,
    };

    const childElement = createHTMLTree(child, mergedVariables);
    if (!childElement) {
      continue;
    }

    setElementContent(childElement, mergedVariables);

    if (childElement) {
      currentElement.appendChild(childElement);
    }
  }

  setElementContent(currentElement, rootVariables);

  return parentElement;
}

function getZCSS() {
  const zcssSource = document.querySelector(`[zcss=""]`);

  let zcssStyleSheet;

  for (let sheet of document.styleSheets) {
    if (sheet.ownerNode === zcssSource) {
      zcssStyleSheet = sheet;
    }
  }

  if (!zcssStyleSheet) {
    console.error("ZSCC is not provided");
  }

  return zcssStyleSheet;
}

function createElementByTreeSelector(selector, parent) {
  const element = document.createElement(selector.tag);

  selector.classes.forEach((x) => element.classList.add(x));
  if (selector.id) {
    element.id = selector.id;
  }

  parent?.appendChild(element);

  if (!selector.child) {
    return [parent ?? element, element, selector];
  }

  return createElementByTreeSelector(selector?.child, element);
}

function parseSelector(selector) {
  const parseSingleSelector = (selectorPart) => {
    const result = {
      tag: "",
      classes: [],
      id: undefined,
    };

    const parts = selectorPart.match(
      /(^[a-zA-Z0-9-]+)|(\.[a-zA-Z0-9_-]+)|(#\w+)/g
    );

    parts.forEach((part) => {
      if (part.startsWith(".")) {
        result.classes.push(part.slice(1));
      } else if (part.startsWith("#")) {
        result.id = part.slice(1);
      } else {
        result.tag = part;
      }
    });

    return result;
  };

  const parseRecursive = (selectorParts) => {
    if (selectorParts.length === 0) return null;
    const [current, ...rest] = selectorParts;
    const node = parseSingleSelector(current);
    node.child = rest.length > 0 ? parseRecursive(rest) : null;
    return node;
  };

  const selectorParts = selector.split(/\s*>\s*/);
  return parseRecursive(selectorParts);
}

function setElementContent(element, variables) {
  const elementContent = element.style.content;

  if (!elementContent) {
    return;
  }

  let [content, link] = elementContent.replaceAll('"', "").split("#");

  for (let key in variables) {
    content = content.replaceAll(key, variables[key]);
  }

  if (element.tagName.toLowerCase() === "onclick") {
    element.setAttribute("onclick", content);
  } else {
    element.innerText = content;
  }

  if (link) {
    element.href = link;
  }
}

function runContent(element) {
  console.log(element.style.content.replaceAll('"', ""));
  eval(element.style.content.replaceAll('"', ""));
}
