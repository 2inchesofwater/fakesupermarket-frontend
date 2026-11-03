export function cloneIconTemplate(id) {
  const tpl = document.getElementById(id);
  return tpl?.content.cloneNode(true) || document.createTextNode('');
}