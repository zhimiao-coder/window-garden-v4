import {patterns,patternSVG} from './patterns.js';
import {pair,bilingualize} from './bilingual.js';
import {topics} from './study.js?v=20261022-r4';
import {mountPostcards} from './postcards.js?v=20261022-r4';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
bilingualize();
let selected=4,exhibit=null,moving=false,exploded=false,wire=false;
const order=[4,5,6,0,1,2,3],refs={4:8,5:5,6:7};
const shortened=['折线成纹，竹影入窗。','八角围合，空处取景。','一条木纹，一重秩序。','花瓣在重复中相连。','线条交织，似冰初裂。','借花的轮廓，留一处空。','六边相接，层层延展。'];
const shortenedEn=['Folded lines, glimpses of bamboo.','Eight sides frame an open view.','Timber grain, a quiet order.','Petals repeat and connect.','Crossing lines recall cracked ice.','A floral outline surrounds the void.','Hexagons repeat and extend.'];
$('#model-select').innerHTML=order.map(i=>`<option value="${i}">${patterns[i].short} / ${patterns[i].en.split(' · ')[0]}</option>`).join('');
$('#study-notes').innerHTML=topics.map((t,i)=>`<article class="model-note ${i===0?'active':''}" aria-hidden="${i!==0}"><h3>${pair(t[1],t[2])}</h3><p>${pair(t[5],t[6])}</p></article>`).join('');
$('#extended-notes').innerHTML=topics.map(t=>`<details><summary>${pair(t[1],t[2])}</summary><p>${pair(t[3],t[4])}</p><p>${pair(t[7],t[8])}</p><a href="${t[9]}" target="_blank" rel="noreferrer">资料 / Source ↗</a></details>`).join('');
$('#pattern-cards').innerHTML=order.map((i,k)=>`<button class="pattern-object" data-card="${i}" aria-label="${patterns[i].short}"><span class="object-count">0${k+1}</span><div class="pattern-art">${refs[i]!==undefined?`<img src="assets/photo-${refs[i]}.jpg" alt="${patterns[i].short}" loading="lazy">`:patternSVG(i)}</div><h3>${pair(patterns[i].short,patterns[i].en.split(' · ')[0])}</h3><p>${pair(shortened[k],shortenedEn[k])}</p></button>`).join('');
function sync(){ $('#interact').setAttribute('aria-pressed',moving);$('#explode').setAttribute('aria-pressed',exploded);$('#wireframe').setAttribute('aria-pressed',wire); }
function renderModel(){const p=patterns[selected];$('#model-name').innerHTML=pair(p.short,p.en.split(' · ')[0]);$('#model-number').textContent=`0${order.indexOf(selected)+1} / 07`;$('#model-select').value=selected;const latticeNote=$$('.model-note')[1]?.querySelector('p');if(latticeNote)latticeNote.innerHTML=selected===5?pair('这扇空窗没有窗芯，留白就是观察对象。','This opening has no lattice; the empty centre is the subject.'):pair(topics[1][5],topics[1][6]);if(!exhibit){$('#scene-fallback .fallback-art').innerHTML=patternSVG(selected);} }
function selectModel(i){selected=i;exploded=wire=false;exhibit?.setPattern(i);exhibit?.explode(false);exhibit?.wireframe(false);sync();renderModel();}
$('#model-select').onchange=e=>selectModel(+e.target.value);
$$('[data-card]').forEach(b=>b.onclick=()=>{selectModel(+b.dataset.card);$('#collection').scrollIntoView({behavior:'smooth'});});
$('#interact').onclick=()=>{moving=!moving;exhibit?.interact(moving);sync();};
$('#explode').onclick=()=>{exploded=!exploded;exhibit?.explode(exploded);sync();};
$('#wireframe').onclick=()=>{wire=!wire;exhibit?.wireframe(wire);sync();};
$('#viewpoint').oninput=e=>{$('#view-garden img').style.transform=`translateX(${(+e.target.value-50)*.3}%)`;};
function fallback(){exhibit?.dispose();exhibit=null;$('#scene-fallback').hidden=false;$('#scene-fallback').innerHTML=`<div class="fallback-art">${patternSVG(selected)}</div><p>静态观窗 / Window study</p>`;['interact','explode','wireframe'].forEach(id=>$('#'+id).disabled=true);}
renderModel();
async function mount3D(){try{if(new URLSearchParams(location.search).get('render')==='2d')throw Error('Static');const {createExhibit}=await import('./scene.js?v=20261022-r4');exhibit=createExhibit($('#scene'),{interactive:false,onFailure:fallback,onState:s=>{exploded=s.exploded;sync();}});exhibit.setPattern(selected);exhibit.light(58);$('#scene-fallback').hidden=true;['interact','explode','wireframe'].forEach(id=>$('#'+id).disabled=false);}catch{fallback();}}
const lazy=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){lazy.disconnect();mount3D();}},{rootMargin:'600px'});lazy.observe($('#scene'));
function toast(s){$('#toast').textContent=s;$('#toast').classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('visible'),2400);}
mountPostcards({toast});

const reduced=matchMedia('(prefers-reduced-motion: reduce)'),films=$$('.film'),notes=$$('.model-note'),concepts=$$('.concept');let raf=0;
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),mix=(a,b,t)=>a+(b-a)*t;
function markReading(items,index){items.forEach((e,i)=>{e.classList.toggle('active',i===index);e.setAttribute('aria-hidden',i!==index);});}
// Keep the original MVP ground through the first two chapters. Afterwards,
// a single continuous wash ends in a restrained gray-green paper tone.
const paperPalette={base:[[230,231,224],[224,229,220]],middle:[[222,223,220],[219,226,216]],edge:[[233,234,229],[230,234,226]],light:[[255,255,255],[249,251,245]]};
let lastPaperTint='';
function updatePaper(){const start=$('#patterns').offsetTop,end=$('#closing').offsetTop+$('#closing').offsetHeight-innerHeight,u=clamp((scrollY-start)/Math.max(1,end-start)),t=u*u*(3-2*u),key=t.toFixed(4);if(key===lastPaperTint)return;lastPaperTint=key;for(const [name,[from,to]] of Object.entries(paperPalette)){document.body.style.setProperty('--paper-'+name,from.map((v,i)=>mix(v,to[i],t).toFixed(2)).join(','));}}
function draw(){raf=0;updatePaper();for(const film of films){const r=film.getBoundingClientRect();if(r.top>innerHeight||r.bottom<0)continue;const p=clamp(-r.top/Math.max(1,film.offsetHeight-innerHeight)),stage=film.querySelector('.film-stage');stage.style.setProperty('--progress',p);switch(film.dataset.film){
  case 'object':markReading(notes,Math.min(7,Math.floor(p*8)));break;
  case 'patterns':{const rail=$('#pattern-cards'),window=$('.pattern-window');rail.style.transform=`translate3d(${-p*Math.max(0,rail.scrollWidth-window.clientWidth)}px,0,0)`;break;}
  case 'garden':{const leaf=film.querySelector('.ink-leaf');leaf.style.transform=`translate3d(${mix(8,-9,p)}vw,${mix(7,-5,p)}vh,0) scale(${mix(.9,1.18,p)})`;film.querySelector('.garden-copy').style.transform=`translateY(${mix(25,-25,p)}px)`;break;}
  case 'culture':markReading(concepts,Math.min(2,Math.floor(p*3)));break;
  case 'cards':if(!reduced.matches)film.querySelector('.card-display').style.transform=`translateY(${mix(20,-20,p)}px) rotate(${mix(-3,1,p)}deg)`;break;
  case 'closing':{film.querySelector('.ink-leaf').style.transform=`translate3d(${mix(.65,-.65,p)}vw,${mix(.8,-.8,p)}vh,0) scale(${mix(.99,1.01,p)})`;break;}
}if(reduced.matches){stage.querySelectorAll('.ink-leaf').forEach(e=>e.style.transform='none');}}}
function schedule(){if(!raf)raf=requestAnimationFrame(draw);}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduced.addEventListener('change',schedule);document.fonts.ready.then(schedule);schedule();

const chapters=['collection','culture','play','dialogue'].map(id=>$('#'+id)),names=['观窗 / Study','读园 / See','游艺 / Play','留笺 / Take away'];let presenting=false,slide=0;
function go(n){slide=clamp(n,0,3);chapters[slide].scrollIntoView({behavior:'instant'});$('#present-status').textContent=`${slide+1} / 4 · ${names[slide]}`;$('#present-prev').disabled=slide===0;$('#present-next').disabled=slide===3;}
function present(on,quick=false){presenting=on;$('.presentation-controls').hidden=!on;document.body.classList.toggle('presenting',on);if(on){go(0);if(quick)toast('观窗 90秒 · 读园 60秒 · 游艺 90秒 · 留笺 60秒');}}
$('#classroom').onclick=()=>present(true);$('#five-minute').onclick=()=>present(true,true);$('#present-prev').onclick=()=>go(slide-1);$('#present-next').onclick=()=>go(slide+1);$('#present-exit').onclick=()=>present(false);$('#present-fullscreen').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen().catch(()=>{});};
addEventListener('keydown',e=>{if(!presenting)return;if(e.key==='Escape')present(false);if(e.target.matches('input,select,button,#scene'))return;if(e.key==='ArrowLeft'){e.preventDefault();go(slide-1);}if(e.key==='ArrowRight'){e.preventDefault();go(slide+1);}});
addEventListener('pagehide',()=>exhibit?.dispose(),{once:true});
