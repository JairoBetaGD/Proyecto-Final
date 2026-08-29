/**
 * Sanitardor de HTML para el contenido de comunicados.
 *
 * Permite solo etiquetas y atributos seguros. Los enlaces se restringen a
 * protocolos http/https, mailto, anclas y rutas relativas. Los `<iframe>` solo
 * se admiten si apuntan al dominio de Google Maps (embed), con lo que el botón
 * "Google Maps" del editor funciona sin permitir iframes arbitrarios.
 *
 * Usa el DOM del navegador (`<template>`) para sanitizar de forma robusta sin
 * dependencias externas.
 */

const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'ul',
  'ol',
  'li',
  'blockquote',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'a',
  'img',
  'iframe',
  'span',
  'div',
]);

const ALLOWED_ATTRS: Record<string, string[]> = {
  a: ['href', 'title', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
  iframe: [
    'src',
    'title',
    'width',
    'height',
    'loading',
    'allowfullscreen',
    'frameborder',
    'referrerpolicy',
    'style',
  ],
};

const isSafeUrl = (value: string, isIframe: boolean): boolean => {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  if (isIframe) {
    // Solo se permite incrustar mapas de Google (dominios oficiales).
    return (
      /^https:\/\/[\w-]*\.?google\.com\/maps/i.test(trimmed) ||
      /^https:\/\/maps\.google(?:apis)?\.com(?:\/maps)?\//i.test(trimmed)
    );
  }

  if (/^javascript:|^vbscript:|^data:text\/html|^data:text\/javascript/i.test(trimmed)) {
    return false;
  }

  return /^(https?:\/\/|mailto:|#|\/)/i.test(trimmed);
};

const sanitizeElement = (element: Element): void => {
  // Primero se procesan los hijos para que el contenido que se "desenvuelva"
  // hacia arriba ya llegue limpio (sin scripts ni estilos embebidos).
  Array.from(element.children).forEach((child) => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      sanitizeElement(child as Element);
    }
  });

  const tag = element.tagName.toLowerCase();

  if (tag === 'script' || tag === 'style') {
    element.remove();
    return;
  }

  if (!ALLOWED_TAGS.has(tag)) {
    // Etiqueta no permitida -> se "desenvuelve" conservando su contenido.
    const parent = element.parentElement;
    if (parent) {
      while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
      }
      parent.removeChild(element);
    }
    return;
  }

  const allowedAttrs = ALLOWED_ATTRS[tag] || [];
  for (const attr of Array.from(element.attributes)) {
    const name = attr.name;
    const isAllowed = allowedAttrs.includes(name) && !name.startsWith('on');

    if (!isAllowed) {
      element.removeAttribute(attr.name);
      continue;
    }

    if (name === 'href' || name === 'src') {
      if (!isSafeUrl(attr.value, tag === 'iframe')) {
        element.removeAttribute(attr.name);
      }
    }
  }

  // Un iframe sin fuente válida (o sin fuente) no debe renderizarse.
  if (tag === 'iframe' && !isSafeUrl(element.getAttribute('src') || '', true)) {
    element.remove();
  }
};

/**
 * Limpia el HTML del comunicado devolviendo solo etiquetas y atributos seguros.
 */
export const sanitizeHtml = (raw: string): string => {
  if (!raw) {
    return '';
  }

  const template = document.createElement('template');
  template.innerHTML = raw;

  Array.from(template.content.children).forEach((child) => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      sanitizeElement(child as Element);
    } else if (
      child.nodeType === Node.COMMENT_NODE ||
      child.nodeType === Node.CDATA_SECTION_NODE
    ) {
      child.remove();
    }
  });

  return template.innerHTML;
};