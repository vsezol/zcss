render();

function render() {
  const zcss = getZCSS();
  zcss.disabled = true;

  const html = createHTMLTree(zcss);

  document.body.appendChild(html);
}

function createHTMLTree(rule, rootVariables) {
  let tag = rule.selectorText?.split(" ")?.at(-1) ?? "div";

  const children = [];

  if (tag.startsWith("repeat")) {
    const times = Number(tag.split("-").at(-1));

    for (let i = 0; i < times; i++) {
      for (let r of rule.cssRules) {
        children.push([r, { $i: i }]);
      }
    }
  } else {
    for (let r of rule.cssRules) {
      children.push([r, {}]);
    }
  }

  const element = document.createElement(tag);

  for (let key of rule?.style ?? []) {
    if (key.startsWith("padding")) {
      element.style[key] = rule.style[key] || rule.style["padding"];
      continue;
    }

    if (key.startsWith("margin")) {
      element.style[key] = rule.style[key] || rule.style["padding"];
      continue;
    }

    if (key.endsWith("gap")) {
      element.style[key] = rule.style[key] || rule.style["gap"];
      continue;
    }

    element.style[key] = rule.style[key];
  }

  for (let [child, variables] of children) {
    const mergedVariables = {
      ...rootVariables,
      ...variables,
    };
    const childElement = createHTMLTree(child, mergedVariables);
    const childElementContent = childElement.style.content;

    if (childElementContent) {
      let [content, link] = childElementContent.replaceAll('"', "").split("#");

      for (let key in mergedVariables) {
        content = content.replaceAll(key, mergedVariables[key]);
      }

      childElement.innerText = content;

      if (link) {
        childElement.href = link;
      }
    }

    if (childElement) {
      element.appendChild(childElement);
    }
  }

  return element;
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
