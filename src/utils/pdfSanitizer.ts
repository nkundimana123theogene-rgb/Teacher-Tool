/**
 * Utility to sanitize a cloned HTML document for html2canvas / html2pdf.
 * Converts modern color spaces ('oklch', 'oklab', 'lab', 'lch', 'color') 
 * into accurate RGB equivalents so html2canvas can render them accurately.
 */

// Mathematical OKLab -> RGB conversion
function oklabToRgb(L: number, a: number, b: number, alpha?: number): string {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  let rLinear = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  let gLinear = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  let bLinear = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  const gamma = (v: number) => {
    const c = clamp(v);
    return c >= 0.0031308 ? 1.055 * Math.pow(c, 1 / 2.4) - 0.055 : 12.92 * c;
  };

  const r = Math.round(gamma(rLinear) * 255);
  const g = Math.round(gamma(gLinear) * 255);
  const bVal = Math.round(gamma(bLinear) * 255);

  if (alpha !== undefined && alpha < 1) {
    return `rgba(${r}, ${g}, ${bVal}, ${alpha.toFixed(3)})`;
  }
  return `rgb(${r}, ${g}, ${bVal})`;
}

// Convert a single match of oklch(...) or oklab(...) or lab(...) or lch(...)
function convertColorMatch(matchStr: string): string {
  // 1. Try Browser Canvas context if in DOM environment
  try {
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#00000000';
        ctx.fillStyle = matchStr;
        const res = ctx.fillStyle;
        if (res && res !== '#00000000' && !res.includes('oklch') && !res.includes('oklab')) {
          return res;
        }
      }
    }
  } catch (e) {}

  // 2. Pure JS fallback conversion
  const clean = matchStr.trim();
  const isOklch = /^oklch\(/i.test(clean);
  const isOklab = /^oklab\(/i.test(clean);

  const innerMatch = clean.match(/\(([^)]+)\)/);
  if (!innerMatch) return 'rgb(240, 240, 240)';

  const inner = innerMatch[1].trim();
  const parts = inner.split('/');
  const mainParts = parts[0].trim().split(/[\s,]+/);

  let alpha: number | undefined = undefined;
  if (parts.length > 1) {
    const aStr = parts[1].trim();
    alpha = aStr.endsWith('%') ? parseFloat(aStr) / 100 : parseFloat(aStr);
  }

  if (mainParts.length >= 3) {
    let p1 = parseFloat(mainParts[0]);
    if (mainParts[0].endsWith('%')) p1 /= 100;

    let p2 = parseFloat(mainParts[1]);
    if (mainParts[1].endsWith('%')) p2 /= 100;

    let p3 = parseFloat(mainParts[2]);
    if (mainParts[2].endsWith('%')) p3 /= 100;

    if (isOklch) {
      // p1 = L, p2 = C, p3 = H (deg)
      const rad = (p3 * Math.PI) / 180;
      const a = p2 * Math.cos(rad);
      const b = p2 * Math.sin(rad);
      return oklabToRgb(p1, a, b, alpha);
    } else if (isOklab) {
      // p1 = L, p2 = a, p3 = b
      return oklabToRgb(p1, p2, p3, alpha);
    }
  }

  return 'rgb(240, 240, 240)';
}

export const replaceUnsupportedColors = (val: string): string => {
  if (!val || typeof val !== 'string') return val;
  if (
    val.indexOf('oklch') === -1 &&
    val.indexOf('oklab') === -1 &&
    val.indexOf('lab(') === -1 &&
    val.indexOf('lch(') === -1 &&
    val.indexOf('color(') === -1
  ) {
    return val;
  }
  return val.replace(/(?:oklch|oklab|lab|lch|color)\s*\((?:[^()]+|\([^()]*\))*\)/gi, (match) => {
    return convertColorMatch(match);
  });
};

export const sanitizeClonedDocForPdf = (clonedDoc: Document): void => {
  try {
    const wrapStyle = (style: CSSStyleDeclaration) => {
      return new Proxy(style, {
        get(target, prop: string | symbol) {
          if (prop === 'getPropertyValue') {
            return (propertyName: string) => {
              const propVal = target.getPropertyValue(propertyName);
              return replaceUnsupportedColors(propVal);
            };
          }
          const val = Reflect.get(target, prop);
          if (typeof val === 'function') {
            return val.bind(target);
          }
          if (typeof val === 'string') {
            return replaceUnsupportedColors(val);
          }
          return val;
        }
      });
    };

    // Intercept top window getComputedStyle
    if (!(window as any).__pdf_getComputedStyle_patched) {
      (window as any).__pdf_getComputedStyle_patched = true;
      const origGCS = window.getComputedStyle.bind(window);
      window.getComputedStyle = (elt: Element, pseudoElt?: string | null) => {
        const style = origGCS(elt, pseudoElt);
        return wrapStyle(style);
      };
    }

    // Intercept clonedDoc window getComputedStyle
    if (clonedDoc.defaultView && clonedDoc.defaultView !== window) {
      const win = clonedDoc.defaultView;
      const origWinGCS = win.getComputedStyle.bind(win);
      win.getComputedStyle = (elt: Element, pseudoElt?: string | null) => {
        const style = origWinGCS(elt, pseudoElt);
        return wrapStyle(style);
      };
    }

    // Process all <style> and <link rel="stylesheet"> tags in clonedDoc
    const styleAndLinks = Array.from(clonedDoc.querySelectorAll('style, link[rel="stylesheet"]'));
    styleAndLinks.forEach((node) => {
      const tagName = node.tagName.toLowerCase();
      if (tagName === 'style') {
        const content = node.textContent || '';
        if (
          content.includes('oklch') ||
          content.includes('oklab') ||
          content.includes('lab(') ||
          content.includes('lch(') ||
          content.includes('color(')
        ) {
          node.textContent = replaceUnsupportedColors(content);
        }
      } else if (tagName === 'link') {
        const link = node as HTMLLinkElement;
        let cssText = '';
        try {
          if (link.sheet && link.sheet.cssRules) {
            const rules = link.sheet.cssRules;
            for (let i = 0; i < rules.length; i++) {
              cssText += rules[i].cssText + '\n';
            }
          }
        } catch (e) {
          console.warn('Could not read link stylesheet rules:', e);
        }

        if (cssText) {
          const sanitizedCss = replaceUnsupportedColors(cssText);
          const styleEl = clonedDoc.createElement('style');
          styleEl.textContent = sanitizedCss;
          link.parentNode?.replaceChild(styleEl, link);
        } else {
          link.remove();
        }
      }
    });

    // Clean inline style attributes on all elements
    const allElements = clonedDoc.querySelectorAll('*');
    allElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.hasAttribute('style')) {
        const styleAttr = htmlEl.getAttribute('style') || '';
        if (
          styleAttr.includes('oklch') ||
          styleAttr.includes('oklab') ||
          styleAttr.includes('lab(') ||
          styleAttr.includes('lch(') ||
          styleAttr.includes('color(')
        ) {
          htmlEl.setAttribute('style', replaceUnsupportedColors(styleAttr));
        }
      }
    });
  } catch (err) {
    console.warn('Warning during PDF clone document sanitization:', err);
  }
};

/**
 * Replaces form inputs, textareas, and selects in clonedDoc with fully expanded text blocks.
 * Pulls live `.value` from original DOM elements so no teacher-entered text is lost in the PDF.
 */
export const prepareFormElementsForPdf = (clonedDoc: Document, targetContainerId: string): void => {
  try {
    const origContainer = document.getElementById(targetContainerId);
    const clonedContainer = clonedDoc.getElementById(targetContainerId) || clonedDoc.body;

    if (!clonedContainer) return;

    const getClassName = (el: Element): string => {
      try {
        if (typeof el.className === 'string') return el.className;
        return el.getAttribute('class') || '';
      } catch {
        return '';
      }
    };

    // 1. Convert textareas into auto-expanding, word-wrapping divs
    const origTextareas = origContainer ? origContainer.querySelectorAll('textarea') : [];
    const clonedTextareas = clonedContainer.querySelectorAll('textarea');

    clonedTextareas.forEach((clonedTa, idx) => {
      const origTa = origTextareas[idx] as HTMLTextAreaElement | undefined;
      const val = origTa ? origTa.value : (clonedTa.value || clonedTa.textContent || '');
      
      const div = clonedDoc.createElement('div');
      div.className = getClassName(clonedTa);
      div.style.whiteSpace = 'pre-wrap';
      div.style.wordBreak = 'break-word';
      div.style.overflowWrap = 'break-word';
      div.style.height = 'auto';
      div.style.minHeight = 'fit-content';
      div.style.display = 'block';
      div.style.border = 'none';
      div.style.background = 'transparent';
      div.style.color = '#000000';
      div.style.padding = '0';
      div.style.margin = '0';
      div.textContent = val;

      clonedTa.parentNode?.replaceChild(div, clonedTa);
    });

    // 2. Convert text inputs into inline text blocks
    const origInputs = origContainer 
      ? origContainer.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"])')
      : [];
    const clonedInputs = clonedContainer.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"])');

    clonedInputs.forEach((clonedInp, idx) => {
      const origInp = origInputs[idx] as HTMLInputElement | undefined;
      const val = origInp ? origInp.value : ((clonedInp as HTMLInputElement).value || clonedInp.getAttribute('value') || '');

      const span = clonedDoc.createElement('span');
      span.className = getClassName(clonedInp);
      span.style.whiteSpace = 'pre-wrap';
      span.style.wordBreak = 'break-word';
      span.style.display = 'inline-block';
      span.style.border = 'none';
      span.style.background = 'transparent';
      span.style.color = '#000000';
      span.style.padding = '0';
      span.style.margin = '0';
      span.textContent = val;

      clonedInp.parentNode?.replaceChild(span, clonedInp);
    });

    // 3. Convert select elements into text blocks
    const origSelects = origContainer ? origContainer.querySelectorAll('select') : [];
    const clonedSelects = clonedContainer.querySelectorAll('select');

    clonedSelects.forEach((clonedSel, idx) => {
      const origSel = origSelects[idx] as HTMLSelectElement | undefined;
      let val = '';
      if (origSel) {
        val = origSel.options[origSel.selectedIndex]?.text || origSel.value || '';
      } else {
        const selEl = clonedSel as HTMLSelectElement;
        val = selEl.options[selEl.selectedIndex]?.text || selEl.value || '';
      }

      const span = clonedDoc.createElement('span');
      span.className = getClassName(clonedSel);
      span.style.display = 'inline-block';
      span.style.border = 'none';
      span.style.background = 'transparent';
      span.style.color = '#000000';
      span.style.padding = '0';
      span.style.margin = '0';
      span.textContent = val;

      clonedSel.parentNode?.replaceChild(span, clonedSel);
    });
  } catch (err) {
    console.warn('Warning during form elements preparation for PDF:', err);
  }
};
