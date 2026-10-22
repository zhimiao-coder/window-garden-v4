(() => {
  const root = document.querySelector('#home'); const $ = s => root.querySelector(s);
  const planes = ['bamboo','rear','gate','bridge','foreground'].map(s => $('.'+s));
  const track = $('.poem-track'), stage = $('.stage'), space = root;
  const lines = [...root.querySelectorAll('.stanza p')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let target = 0, current = 0, pointerX = 0, pointerY = 0, frame = 0, previousTime = 0;
  const clamp = (v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const lerp = (a,b,t)=>a+(b-a)*t;
  const ease = t=>t*t*(3-2*t);
  function readScroll(){ target=clamp(scrollY/Math.max(1,space.offsetHeight-innerHeight)); if(!frame)frame=requestAnimationFrame(render); }
  function render(now){
    const elapsed=Math.max(1/60,Math.min(1,(now-previousTime)/1000)); previousTime=now;
    frame=0; current=motion.matches?target:lerp(current,target,1-Math.exp(-elapsed*16)); if(Math.abs(current-target)<.00015)current=target;
    const p=current, w=innerWidth, h=innerHeight, mobile=w<701, t=ease(clamp((p-.12)/.82));
    // Distinct image planes travel at different speeds through one held viewport.
    const x=mobile?-.63:-.68;
    const settings=[
      [lerp(0,x*w,t),lerp(0,-h*.22,t),lerp(1,1.48,t),1-t*.85],
      [lerp(0,-w*.23,t),lerp(0,-h*.17,t),lerp(1,1.45,t),1-t*.84],
      [lerp(0,-w*(mobile?1.02:.73),t),lerp(0,-h*.06,t),lerp(.8,1.02,t),clamp(t*1.9)],
      [lerp(0,-w*.53,t),lerp(0,h*.17,t),lerp(1,1.5,t),1-t],
      [lerp(0,-w*.24,t),lerp(0,-h*.1,t),lerp(1,1.8,t),1-t]
    ];
    planes.forEach((el,i)=>{const [tx,ty,sc,op]=settings[i];const mx=motion.matches?0:pointerX*(i+1)*2.4;const my=motion.matches?0:pointerY*(i+1)*1.2;el.style.transform=`translate3d(${tx+mx}px,${ty+my}px,0) scale(${sc})`;el.style.opacity=op;});
    const second=$('.second'), distance=second.offsetTop;
    const move=lerp(0,-distance,ease(clamp((p-.17)/.77)));
    track.style.transform=`translate3d(0,${move}px,0)`;
    const view=$('.poem-window').getBoundingClientRect();
    lines.forEach(el=>{const r=el.getBoundingClientRect();const v=(r.top+r.height*.5-view.top)/view.height;const d=Math.max(0,.18-v,v-.74);el.style.filter=`blur(${motion.matches?0:Math.min(8,d*25)}px)`;el.style.opacity=clamp(1-d*2.5,.12,1);});
    const head=1-clamp((p-.075)/.17);$('.header').style.opacity=head;$('.header').style.visibility=head<.02?'hidden':'visible';
    $('.scroll-cue').style.opacity=1-clamp(p/.12);$('.scroll-cue').style.visibility=p>.13?'hidden':'visible';
    stage.dataset.state=p<.3?'arrival':p<.74?'passage':'courtyard';stage.dataset.progress=p.toFixed(3);
    if(current!==target)frame=requestAnimationFrame(render);
  }
  addEventListener('scroll',readScroll,{passive:true});addEventListener('resize',readScroll);motion.addEventListener('change',readScroll);
  root.querySelectorAll('[data-position]').forEach(el=>el.addEventListener('click',()=>{scrollTo({top:Number(el.dataset.position)*(space.offsetHeight-innerHeight),behavior:motion.matches?'instant':'smooth'});}));
  $('.brand').addEventListener('click',e=>{e.preventDefault();scrollTo({top:0,behavior:motion.matches?'instant':'smooth'});});
  addEventListener('pointermove',e=>{pointerX=e.clientX/innerWidth-.5;pointerY=e.clientY/innerHeight-.5;$('.cursor').style.transform=`translate(${e.clientX-23}px,${e.clientY-23}px)`;$('.cursor').style.left='0';$('.cursor').style.top='0';if(!frame)frame=requestAnimationFrame(render);},{passive:true});
  document.fonts.ready.then(readScroll);addEventListener('load',readScroll);readScroll();
})();


