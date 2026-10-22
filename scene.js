import * as THREE from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {patternLines,clipLine} from './patterns.js';

// All geometry is authored reconstruction; source photos and uncertainty live in models.json.
export function createExhibit(container,{onFailure=()=>{},onState=()=>{},interactive=true}={}){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(pointer: coarse)').matches;
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:!mobile,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.4:1.8));
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
 renderer.domElement.setAttribute('aria-hidden','true');container.append(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,60),root=new THREE.Group();scene.add(root);
 camera.position.set(2.7,1.35,9.4);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.05,0);
 controls.enablePan=true;controls.enableDamping=!reduced.matches;controls.dampingFactor=.095;
 controls.minDistance=5;controls.maxDistance=13;controls.minPolarAngle=.35;controls.maxPolarAngle=2.5;
 controls.minAzimuthAngle=-1.4;controls.maxAzimuthAngle=1.4;controls.autoRotateSpeed=.35;
 controls.enabled=interactive&&!mobile;renderer.domElement.style.touchAction=controls.enabled?'none':'pan-y';
 scene.add(new THREE.HemisphereLight(0xe6eee6,0x28312c,1.55));
 const key=new THREE.DirectionalLight(0xffefda,3.8);key.position.set(-3,5,5);key.castShadow=true;
 key.shadow.mapSize.set(mobile?512:1024,mobile?512:1024);Object.assign(key.shadow.camera,{left:-4,right:4,top:4,bottom:-4,near:.1,far:20});key.shadow.bias=-.0003;key.shadow.normalBias=.025;key.shadow.radius=4;scene.add(key);
 const fill=new THREE.DirectionalLight(0xc5d6dd,1.65);fill.position.set(4,2,3);scene.add(fill);
 const rim=new THREE.DirectionalLight(0xf7e6cb,3);rim.position.set(1,3,-3);scene.add(rim);
 let seed=4181;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
 function texture(wood=false){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d'),im=x.createImageData(256,256);
  for(let y=0;y<256;y++)for(let j=0;j<256;j++){const k=(y*256+j)*4;let n=random();let v=wood?156+10*Math.sin(j*.24+Math.sin(y*.023)*2)+6*Math.sin(j*.76+y*.018)+n*17:165+n*54+Math.sin(j*.08)*4;
  if(!wood&&n<.035)v-=65;im.data[k]=im.data[k+1]=im.data[k+2]=v;im.data[k+3]=255;}x.putImageData(im,0,0);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.NoColorSpace;return t;}
 const stoneTex=texture(),woodTex=texture(true);
 const materials={stone:new THREE.MeshStandardMaterial({color:0x777c78,roughness:.91,bumpMap:stoneTex,bumpScale:.033,roughnessMap:stoneTex}),
 mortar:new THREE.MeshStandardMaterial({color:0xa7a59b,roughness:.98,bumpMap:stoneTex,bumpScale:.018}),
 wood:new THREE.MeshStandardMaterial({color:0x493024,roughness:.72,bumpMap:woodTex,bumpScale:.026,roughnessMap:woodTex}),
 woodEdge:new THREE.MeshStandardMaterial({color:0x73513a,roughness:.79,bumpMap:woodTex,bumpScale:.012}),
 slate:new THREE.MeshStandardMaterial({color:0x555c59,roughness:.88,bumpMap:stoneTex,bumpScale:.023})};
 const frame=new THREE.Group(),lattice=new THREE.Group();root.add(frame,lattice);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.ShadowMaterial({color:0x000000,opacity:.27}));ground.rotation.x=-Math.PI/2;ground.position.y=-2.12;ground.receiveShadow=true;scene.add(ground);
 const c=document.createElement('canvas');c.width=c.height=128;const cx=c.getContext('2d'),g=cx.createRadialGradient(64,64,3,64,64,63);g.addColorStop(0,'#0008');g.addColorStop(1,'#0000');cx.fillStyle=g;cx.fillRect(0,0,128,128);
 const contact=new THREE.Mesh(new THREE.PlaneGeometry(6.3,3.3),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false,opacity:.65}));contact.rotation.x=-Math.PI/2;contact.position.y=-2.115;scene.add(contact);
 let cameraDirty=true,needsRender=true,visible=true,disposed=false,raf=0,exploded=false,manual=false,scrollCue=0,detail=0,angle=0,index=4,lightValue=58;
 function mesh(geo,mat,parent=frame){const m=new THREE.Mesh(geo,mat);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
 function beam(a,b,width,depth,mat,parent=lattice,z=0){const length=Math.hypot(b[0]-a[0],b[1]-a[1]);if(length<.008)return;
  const shape=new THREE.Shape();shape.moveTo(-length/2,-width/2);shape.lineTo(length/2,-width/2);shape.lineTo(length/2,width/2);shape.lineTo(-length/2,width/2);shape.closePath();
  const geo=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:.009,bevelSize:.009,bevelSegments:2,steps:1});geo.translate(0,0,-depth/2);
  const m=mesh(geo,mat,parent);m.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,z);m.rotation.z=Math.atan2(b[1]-a[1],b[0]-a[0]);return m;}
 function rectangle(w,h,depth,mat){beam([-w/2,-h/2],[w/2,-h/2],.16,depth,mat,frame);beam([-w/2,h/2],[w/2,h/2],.16,depth,mat,frame);beam([-w/2,-h/2],[-w/2,h/2],.16,depth,mat,frame);beam([w/2,-h/2],[w/2,h/2],.16,depth,mat,frame);
  for(const y of [-h/2+.12,h/2-.12])beam([-w/2+.1,y],[w/2-.1,y],.035,depth+.03,materials.woodEdge,frame);}
 function polygonRing(n,outer,inner,depth,mat,phase=0,start=0,end=n){const sh=new THREE.Shape(),steps=Math.max(1,Math.ceil(end-start));
  for(let k=0;k<=steps;k++){const j=start+(end-start)*k/steps,a=phase+j/n*Math.PI*2,x=Math.cos(a)*outer,y=Math.sin(a)*outer;k===0?sh.moveTo(x,y):sh.lineTo(x,y);}
  for(let k=steps;k>=0;k--){const j=start+(end-start)*k/steps,a=phase+j/n*Math.PI*2;sh.lineTo(Math.cos(a)*inner,Math.sin(a)*inner);}sh.closePath();
  const geo=new THREE.ExtrudeGeometry(sh,{depth,bevelEnabled:true,bevelSize:.015,bevelThickness:.012,bevelSegments:3,curveSegments:48,steps:1});geo.translate(0,0,-depth/2);return mesh(geo,mat);}
 function clear(group){for(const ch of [...group.children]){group.remove(ch);ch.geometry?.dispose();}}
 function setPattern(i){index=i;clear(frame);clear(lattice);root.position.y=0;root.rotation.set(0,0,0);cameraDirty=true;exploded=false;detail=0;manual=false;scrollCue=0;angle=0;frame.position.z=lattice.position.z=0;
  if(i<4){polygonRing(96,1.88,1.63,.32,materials.mortar);for(let j=0;j<12;j++){const m=polygonRing(96,1.9,1.65,.34,materials.stone,0,j*8+.05,(j+1)*8-.05);m.position.z=.015;}
   polygonRing(96,1.66,1.60,.14,materials.slate).position.z=.18;
   const seen=new Set();for(const l of patternLines(i)){const p=clipLine(...l,95);if(!p)continue;const [a,b]=p.map(v=>[v[0]/95*1.61,-v[1]/95*1.61]);const k=[...a,...b].map(n=>n.toFixed(2)).join(','),r=[...b,...a].map(n=>n.toFixed(2)).join(',');if(seen.has(k)||seen.has(r))continue;seen.add(k);beam(a,b,.055,.16,materials.slate);}
  }else if(i===4){rectangle(3.25,3.65,.3,materials.wood);
   // Repeated angular meanders, traced as a motif from the Canglang reference; joins interpreted.
   for(let row=0;row<3;row++)for(let col=0;col<3;col++){
    const x=(col-1)*1.02,y=(row-1)*1.14;const pts=[[-.48,-.52],[-.48,.13],[-.17,.13],[-.17,.49],[.18,.49],[.18,.13],[.48,.13],[.48,-.18],[.18,-.18],[.18,-.51],[-.17,-.51],[-.17,-.18],[-.48,-.18]];
    for(let j=1;j<pts.length;j++)beam([x+pts[j-1][0],y+pts[j-1][1]],[x+pts[j][0],y+pts[j][1]],.065,.17,materials.wood);
   }
  }else if(i===5){for(let j=0;j<8;j++)polygonRing(8,1.99,1.63,.49,materials.stone,Math.PI/8,j+.006,j+1-.006);
   polygonRing(8,1.65,1.60,.16,materials.slate,Math.PI/8).position.z=.21;
   // This documented opening has no invented lattice.
  }else{rectangle(2.65,3.8,.25,materials.wood);for(const x of [-1.15,0,1.15])beam([x,-1.75],[x,1.75],.07,.16,materials.wood);
   for(let row=-2;row<=2;row++){const y=row*.62;beam([-1.15,y],[1.15,y],.06,.16,materials.wood);
    for(const sign of [-1,1]){const x=sign*.6,pts=[[x-.37,y-.25],[x-.37,y+.25],[x+.37,y+.25],[x+.37,y-.25],[x-.1,y-.25],[x-.1,y+.07],[x+.13,y+.07]];for(let j=1;j<pts.length;j++)beam(pts[j-1],pts[j],.046,.15,materials.woodEdge);}}
  }
  for(const node of frame.children){node.geometry.computeBoundingBox();const centre=node.geometry.boundingBox.getCenter(new THREE.Vector3()).add(node.position);node.userData.home=node.position.clone();node.userData.separation=new THREE.Vector3(centre.x,centre.y,0).normalize().multiplyScalar(i===5?.28:.12);}
  container.dataset.frameParts=String(frame.children.length);container.dataset.infillParts=String(lattice.children.length);container.dataset.separated='false';
  detail=0;needsRender=true;
 }
 function resize(){const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();needsRender=true;}
 const sizeObserver=new ResizeObserver(resize);sizeObserver.observe(container);resize();setPattern(4);
 const observer=new IntersectionObserver(e=>{visible=e[0].isIntersecting;needsRender=true;});observer.observe(container);
 const start=()=>{manual=true;needsRender=true;};controls.addEventListener('start',start);controls.addEventListener('change',()=>needsRender=true);
 const keydown=e=>{if(e.target!==container)return;const delta=.35;let used=true;
  if(e.key==='ArrowLeft')camera.position.x-=delta;else if(e.key==='ArrowRight')camera.position.x+=delta;else if(e.key==='ArrowUp')camera.position.y+=delta;else if(e.key==='ArrowDown')camera.position.y-=delta;else if(e.key==='+'||e.key==='=')camera.position.multiplyScalar(.93);else if(e.key==='-')camera.position.multiplyScalar(1.07);else used=false;
  if(used){manual=true;needsRender=true;e.preventDefault();controls.update();}};container.addEventListener('keydown',keydown);
 let last=0;function draw(now){if(disposed)return;raf=requestAnimationFrame(draw);if(!visible||document.hidden||now-last<1000/30)return;last=now;
  const ease=reduced.matches?1:.085,target=exploded?.65:0;const old=frame.position.z;frame.position.z+=(target-frame.position.z)*ease;lattice.position.z+=((exploded?-.22:0)-lattice.position.z)*ease;
  for(const node of frame.children){const home=node.userData.home,offset=node.userData.separation;if(!home)continue;const x=home.x+(exploded?offset.x:0),y=home.y+(exploded?offset.y:0);if(Math.abs(node.position.x-x)+Math.abs(node.position.y-y)>.0001)needsRender=true;node.position.x+=(x-node.position.x)*ease;node.position.y+=(y-node.position.y)*ease;}
  if(!manual&&(cameraDirty||Math.abs(scrollCue-angle)>.0001)){angle+=(scrollCue-angle)*ease;camera.position.set(Math.sin(angle)*9.3,.8+angle*.4,Math.cos(angle)*9.3);controls.target.set(detail? .55:0,detail?.45:.05,0);if(detail)camera.position.multiplyScalar(.63);needsRender=true;if(Math.abs(scrollCue-angle)<.0001)cameraDirty=false;}
  if(Math.abs(old-frame.position.z)>.0001)needsRender=true;
  const changed=controls.update();if(needsRender||changed||controls.autoRotate){renderer.render(scene,camera);container.dataset.renderedModel=String(index);container.dataset.renderedSeparation=frame.position.z.toFixed(3);container.dataset.renderedCamera=camera.position.toArray().map(v=>v.toFixed(2)).join(',');needsRender=false;}
 }
 raf=requestAnimationFrame(draw);
 function reset(){manual=false;exploded=false;onState({exploded:false});detail=0;scrollCue=0;angle=0;controls.autoRotate=false;cameraDirty=true;camera.position.set(0,.8,9.3);controls.target.set(0,.05,0);controls.update();needsRender=true;}
 function contextLost(e){e.preventDefault();onFailure('context-lost');}renderer.domElement.addEventListener('webglcontextlost',contextLost);
 return {setPattern,reset,rotate(v){manual=true;controls.autoRotate=v&&!reduced.matches;needsRender=true;},explode(v){manual=true;exploded=v;container.dataset.separated=String(v);if(v&&!controls.enabled){camera.position.set(3.4,1.3,8.6);controls.target.set(0,.05,0);controls.update();}onState({exploded:v});needsRender=true;},light(v){lightValue=v;key.position.set((v/100-.5)*10,4.5,5);key.intensity=3.1+Math.sin(v/100*Math.PI);needsRender=true;},
  interact(v){controls.enabled=v;container.dataset.interactive=String(v);renderer.domElement.style.touchAction=v?'none':'pan-y';},cue(n){if(reduced.matches||manual)return;cameraDirty=true;scrollCue=[0,.48,-.2][n]??0;exploded=n===2;onState({exploded});needsRender=true;},focus(v){manual=true;detail=v?1:0;camera.position.set(v?.8:0,.8,v?5.4:9.3);controls.target.set(v?.5:0,v?.35:.05,0);controls.update();needsRender=true;},wireframe(v){Object.values(materials).forEach(m=>m.wireframe=v);container.dataset.wireframe=String(v);needsRender=true;},viewEdge(){manual=true;camera.position.set(6.8,1,6.3);controls.target.set(0,.05,0);controls.update();needsRender=true;},zoom(v){manual=true;camera.position.multiplyScalar(v);controls.update();needsRender=true;},
  dispose(){disposed=true;cancelAnimationFrame(raf);sizeObserver.disconnect();observer.disconnect();container.removeEventListener('keydown',keydown);controls.dispose();scene.traverse(o=>o.geometry?.dispose());Object.values(materials).forEach(m=>m.dispose());stoneTex.dispose();woodTex.dispose();renderer.dispose();renderer.domElement.remove();}};
}

