export const escapeHTML = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const pair = (zh,en) => `<span lang="zh-CN" class="zh">${escapeHTML(zh)}</span><span lang="en" class="en">${escapeHTML(en)}</span>`;
export function bilingualize(root=document){root.querySelectorAll('[data-en]').forEach(el=>{if(el.dataset.paired)return;el.innerHTML=pair(el.textContent.trim(),el.dataset.en);el.dataset.paired='true';});}
