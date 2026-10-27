/* Reality Breaker ∞ — Quantum Rift Edition | Created by Cornelius Aurelius */
(()=>{'use strict';
const C=window.RealityCore,$=(id)=>document.getElementById(id),cv=$('game'),ctx=cv.getContext('2d',{alpha:false});
const modeBtns=[...document.querySelectorAll('[data-mode]')],palette={rift:['#63f2ff','#ff62b2','#ffd06d'],solar:['#ffcd68','#ff768c','#f3ffa5'],matrix:['#75ffbb','#3fd7a8','#c5ff9b']};
let mode='arcade',s=C.create(mode),screen='menu',theme='rift',muted=true,audio=null,feedbackTimer=0,drawWidth=700,drawHeight=520,pixelRatio=1,last=performance.now(),particles=[],stars=[],flash=0,shake=0,uiLast=0,eventPos=0;
const store={get:(k,def)=>{try{return JSON.parse(localStorage.getItem('rb2_'+k))??def}catch{return def}},set:(k,v)=>{try{localStorage.setItem('rb2_'+k,JSON.stringify(v))}catch{}}};
let records=store.get('records',{});theme=store.get('theme','rift');if(!palette[theme])theme='rift';
document.documentElement.dataset.theme=theme;$('theme').value=theme;
function best(){return records[mode]?.score||0}
function sound(f=440,d=.065,type='sine'){if(muted)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const osc=audio.createOscillator(),vol=audio.createGain();osc.type=type;osc.frequency.setValueAtTime(f,audio.currentTime);vol.gain.setValueAtTime(.035,audio.currentTime);vol.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+d);osc.connect(vol);vol.connect(audio.destination);osc.start();osc.stop(audio.currentTime+d);}catch{}}
function toneFeedback(text,d=1.5){$('feedback').textContent=text;$('details').textContent=text;feedbackTimer=d;}
function resize(){const rect=cv.getBoundingClientRect();drawWidth=Math.max(1,rect.width);drawHeight=Math.max(1,rect.height);pixelRatio=Math.min(window.devicePixelRatio||1,2);cv.width=Math.round(drawWidth*pixelRatio);cv.height=Math.round(drawHeight*pixelRatio);ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);stars=Array.from({length:105},(_,i)=>({x:((i*137.3+17)%1019)/1019,y:((i*311.7+37)%1013)/1013,r:i%8===0?1.5:.7}));}
window.addEventListener('resize',resize,{passive:true});new ResizeObserver(resize).observe(cv);resize();
function overlay(kind='menu'){
 const o=$('overlay');o.classList.remove('hidden');$('mode-buttons').hidden=kind!=='menu';
 if(kind==='menu'){$('overlay-tag').textContent='YOUR REALITY IS CALLING';$('overlay-title').innerHTML='ENTER THE <span>RIFT</span>';$('overlay-copy').textContent='Capture the glowing symbols before their countdown rings run out. Every 12 hits advances the wave. On boss waves, tap the giant rift repeatedly to break it.';$('primary').textContent='▶ START '+mode.toUpperCase();}
 if(kind==='pause'){$('overlay-tag').textContent='TEMPORAL STASIS';$('overlay-title').innerHTML='RIFT <span>PAUSED</span>';$('overlay-copy').textContent='Your run is safely paused. Resume to continue your combo, or start a fresh run.';$('primary').textContent='▶ RESUME RUN';}
 if(kind==='over'){$('overlay-tag').textContent='THE RIFT REMEMBERS';$('overlay-title').innerHTML='RUN <span>COMPLETE</span>';$('overlay-copy').textContent=`Score: ${s.score.toLocaleString()} · Rank: ${C.rank(s.score)} · Wave ${s.wave} · Best combo ${s.bestCombo}. Ready to break your record?`;$('primary').textContent='↻ PLAY AGAIN';}
}
function showGameplay(){screen='game';$('overlay').classList.add('hidden');$('pause').disabled=false;cv.focus({preventScroll:true});}
function launch(){s=C.reset(mode,Math.floor(Math.random()*2**32));eventPos=0;particles=[];shake=0;flash=0;last=performance.now();showGameplay();toneFeedback('RIFT OPEN — CAPTURE THE FIRST SIGNAL');sound(330,.14);updateHUD();}
function finish(){if(screen==='over')return;screen='over';const score=Math.floor(s.score);if(mode!=='zen'&&score>best())records[mode]={score,wave:s.wave,combo:s.bestCombo};store.set('records',records);$('pause').disabled=true;overlay('over');sound(130,.35,'sawtooth');updateHUD();}
function pause(){if(s.phase==='playing'){C.togglePause(s);screen='paused';$('pause').textContent='▶ RESUME RUN';overlay('pause');toneFeedback('RIFT PAUSED');}else if(s.phase==='paused'){C.togglePause(s);showGameplay();$('pause').textContent='Ⅱ PAUSE RUN';last=performance.now();}}
function selectMode(m){if(!C.MODES[m])return;mode=m;modeBtns.forEach(b=>{b.classList.toggle('selected',b.dataset.mode===m);b.setAttribute('aria-pressed',String(b.dataset.mode===m))});$('primary').textContent='▶ START '+mode.toUpperCase();$('mode-display').textContent=C.MODES[mode].toUpperCase();updateHUD();}
modeBtns.forEach(b=>b.addEventListener('click',()=>selectMode(b.dataset.mode)));selectMode(mode);
$('primary').addEventListener('click',()=>{if(screen==='paused')pause();else launch()});$('pause').addEventListener('click',()=>pause());
$('theme').addEventListener('change',e=>{if(palette[e.target.value]){theme=e.target.value;document.documentElement.dataset.theme=theme;store.set('theme',theme);sound(555,.05);}});
$('sound').addEventListener('click',()=>{muted=!muted;$('sound').textContent=muted?'♫ SOUND OFF':'♫ SOUND ON';$('sound').setAttribute('aria-pressed',String(!muted));if(!muted)sound(570,.1);});
function ability(name){if(C.activate(s,name)){toneFeedback(name==='slow'?'TIME WARP ACTIVATED — 6 SECONDS':'SHIELD CHARGED — NEXT MISS BLOCKED');sound(name==='slow'?300:760,.22);updateHUD();}else if(s.phase==='playing')toneFeedback('COLLECT MORE CHARGE TO USE '+(name==='slow'?'TIME WARP':'SHIELD'),1)}
$('slow').addEventListener('click',()=>ability('slow'));$('shield').addEventListener('click',()=>ability('shield'));$('quickslow').addEventListener('click',()=>ability('slow'));$('quickshield').addEventListener('click',()=>ability('shield'));
function burst(x,y,big=false){const c=palette[theme];for(let i=0;i<(big?30:16);i++){let theta=i*Math.PI*2/(big?30:16),v=(big?135:95)*(0.5+(i%5)/9);particles.push({x,y,vx:Math.cos(theta)*v,vy:Math.sin(theta)*v,life:.55,alpha:1,col:c[i%3]})}if(particles.length>180)particles.splice(0,particles.length-180);}
function tapNormalized(x,y){if(s.phase!=='playing')return;let wasBoss=!!s.boss,hit;if(wasBoss){hit=C.hitAt(s,x,y,drawWidth/drawHeight);}else{let chosen=null;for(let i=s.targets.length-1;i>=0;i--){const t=s.targets[i];if(Math.hypot((x-t.x)*(drawWidth/drawHeight),y-t.y)<.085){chosen=t;break;}}hit=C.hitAt(s,x,y,drawWidth/drawHeight);if(hit&&chosen)burst(chosen.x*drawWidth,chosen.y*drawHeight);}
 if(hit){if(wasBoss)burst(drawWidth*.5,drawHeight*.49,true);flash=.17;shake=wasBoss?4:1;sound(wasBoss?220:560+Math.min(s.combo,20)*18,.075);}
 else sound(180,.045,'sawtooth');processEvents();updateHUD();}
cv.addEventListener('pointerdown',e=>{if(screen!=='game')return;const rect=cv.getBoundingClientRect();tapNormalized((e.clientX-rect.left)/rect.width,(e.clientY-rect.top)/rect.height);});
window.addEventListener('keydown',e=>{const tg=e.target?.tagName;if(['INPUT','SELECT','TEXTAREA'].includes(tg))return;const k=e.key.toLowerCase();
 if(k==='p'||k==='escape'){if(s.phase==='playing'||s.phase==='paused'){e.preventDefault();pause();}return;}
 if(s.phase!=='playing')return;
 if(k==='t'){e.preventDefault();ability('slow');return;}if(k==='h'){e.preventDefault();ability('shield');return;}
 if(e.code==='Space'&&s.boss){e.preventDefault();tapNormalized(.5,.49);return;}
 if(/^[1-5]$/.test(k)&&!e.repeat){const t=s.targets[Number(k)-1];if(t){e.preventDefault();tapNormalized(t.x,t.y)}}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&s.phase==='playing')pause()});
function processEvents(){while(eventPos<s.events.length){const ev=s.events[eventPos++];if(ev.type==='wave'){toneFeedback('WAVE '+ev.wave+' UNLOCKED');$('announcer').textContent='Wave '+ev.wave+' unlocked'}
 else if(ev.type==='boss-enter'){toneFeedback('WARNING — BOSS RIFT! TAP ITS CORE REPEATEDLY');$('announcer').textContent='Boss rift incoming';sound(150,.2,'sawtooth');}
 else if(ev.type==='boss-clear'){toneFeedback('BOSS SHATTERED! +600 BONUS');$('announcer').textContent='Boss rift defeated'}
 else if(ev.type==='shield-save')toneFeedback('SHIELD ABSORBED THE DAMAGE');
 else if(ev.type==='life-lost')toneFeedback('SIGNAL LOST — '+s.lives+' LIVES REMAIN');
 else if(ev.type==='achievement'){const names={'first-10':'FIRST CONTACT','combo-20':'COMBO MASTER','wave-8':'RIFT NAVIGATOR','boss-breaker':'BOSS BREAKER'};toneFeedback('ACHIEVEMENT UNLOCKED: '+(names[ev.key]||ev.key));}
 else if(ev.type==='end'){finish();}}
 // event queue is bounded in core; keep consumption cursor stable across truncation.
 if(eventPos>=s.events.length){s.events.length=0;eventPos=0;}
}
function updateHUD(){
 $('score').textContent=s.score.toLocaleString();$('quickscore').textContent=s.score.toLocaleString()+' PTS';$('best').textContent=Math.max(best(),s.mode==='zen'?0:s.score).toLocaleString();$('wave').textContent=String(s.wave).padStart(2,'0');$('combo').textContent='×'+s.combo;
 $('lives').textContent=s.mode==='zen'?'∞ TRAINING':('♥ '.repeat(s.lives)+'♡ '.repeat(5-s.lives)).trim();
 $('power-text').textContent=Math.round(s.power)+'%';$('powerbar').style.width=s.power+'%';$('slow').disabled=$('quickslow').disabled=s.phase!=='playing'||s.power<50;$('shield').disabled=$('quickshield').disabled=s.phase!=='playing'||s.power<65||s.shield>=2;
 $('status').textContent=s.boss?'⚠ BOSS RIFT ACTIVE':s.phase==='playing'?(s.slow>0?'TIME WARP ACTIVE':s.shield>0?'SHIELD READY':'RIFT ACTIVE'):s.phase==='paused'?'PAUSED':s.phase==='over'?'RUN ENDED':'AWAITING PILOT';
 $('arena-indicator').textContent=s.boss?'BOSS DETECTED':s.phase==='playing'?'LIVE':'RIFT STABLE';
 $('timer-readout').textContent=s.mode==='blitz'?Math.ceil(s.time)+' SEC LEFT':s.mode==='zen'?'∞ TRAINING':'∞ ENDLESS';
 }
function roundRect(x,y,w,h,r,fill){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();}
function draw(){
 const W=drawWidth,H=drawHeight,p=palette[theme];ctx.save();ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);
 const backdrop=ctx.createRadialGradient(W*.5,H*.51,12,W*.5,H*.51,Math.max(W,H)*.77);backdrop.addColorStop(0,theme==='solar'?'#24142f':'#17224f');backdrop.addColorStop(.5,'#0a1331');backdrop.addColorStop(1,'#050818');ctx.fillStyle=backdrop;ctx.fillRect(0,0,W,H);
 const time=performance.now()/1000,motion=window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:1;
 for(const st of stars){const alpha=.25+.12*Math.sin(time*1.3+st.x*9)*motion;ctx.fillStyle=`rgba(160,204,255,${alpha})`;ctx.fillRect(st.x*W,st.y*H,st.r,st.r);}
 ctx.save();if(shake>0){ctx.translate(Math.sin(time*58)*shake,Math.cos(time*38)*shake*.7);}
 const cx=W*.5,cy=H*.49,R=Math.min(W,H)*.28;
 const rays=ctx.createRadialGradient(cx,cy,R*.1,cx,cy,R*1.75);rays.addColorStop(0,'rgba(55,97,213,.23)');rays.addColorStop(.7,'rgba(90,37,173,.07)');rays.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=rays;ctx.fillRect(0,0,W,H);
 for(let n=0;n<9;n++){const rr=R*(.38+n*.145),angle=time*(n%2?-.17:.11)*motion+n*.41;ctx.beginPath();ctx.arc(cx,cy,rr,angle,angle+Math.PI*(n%2?1.25:1.47));ctx.strokeStyle=n%3===0?p[0]:n%3===1?p[1]:p[2];ctx.globalAlpha=.13+(n%3)*.045;ctx.lineWidth=n%2?1.3:1.8;ctx.stroke();}ctx.globalAlpha=1;
 ctx.beginPath();ctx.arc(cx,cy,R*.41,0,Math.PI*2);ctx.fillStyle='rgba(7,12,30,.56)';ctx.fill();ctx.lineWidth=2;ctx.strokeStyle=p[0];ctx.globalAlpha=.35;ctx.stroke();ctx.globalAlpha=1;
 ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='rgba(164,194,239,.24)';ctx.font=`900 ${Math.max(32,R*.37)}px system-ui`;ctx.fillText('∞',cx,cy);
 const timeScale=s.slow>0?.47:1;
 if(s.boss){const b=s.boss;const radius=Math.min(W,H)*.19+Math.sin(time*4)*4*motion;ctx.shadowColor=p[1];ctx.shadowBlur=32;ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.strokeStyle=p[1];ctx.lineWidth=14;ctx.stroke();ctx.shadowBlur=0;ctx.beginPath();ctx.arc(cx,cy,radius*.74,0,Math.PI*2);ctx.fillStyle='rgba(71,19,106,.87)';ctx.fill();ctx.strokeStyle=p[0];ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#fff';ctx.font=`900 ${Math.max(36,radius*.58)}px system-ui`;ctx.fillText('⟠',cx,cy-8);ctx.font='700 12px system-ui';ctx.fillText('BOSS RIFT',cx,cy+radius*.48);ctx.fillStyle='#38415e';roundRect(cx-radius,cy+radius+18,radius*2,8,4,'#1a2543');roundRect(cx-radius,cy+radius+18,radius*2*(b.hp/b.maxHp),8,4,p[1]);
 ctx.fillStyle=p[2];ctx.font='750 12px system-ui';ctx.fillText(Math.ceil(b.ttl)+' SEC',cx,cy-radius-20);
 }else{
 s.targets.forEach((t,index)=>{const x=t.x*W,y=t.y*H,rad=Math.min(38,Math.max(25,H*.074)),frac=Math.max(0,t.ttl/t.maxTtl),col=t.type==='bonus'?p[2]:p[index%2];
 ctx.shadowBlur=18;ctx.shadowColor=col;ctx.beginPath();ctx.arc(x,y,rad*.81,0,Math.PI*2);ctx.fillStyle=t.type==='bonus'?'rgba(146,90,35,.31)':'rgba(31,94,138,.39)';ctx.fill();ctx.shadowBlur=0;
 ctx.beginPath();ctx.arc(x,y,rad,0,Math.PI*2);ctx.strokeStyle='rgba(159,193,245,.18)';ctx.lineWidth=5;ctx.stroke();ctx.beginPath();ctx.arc(x,y,rad,-Math.PI/2,-Math.PI/2+Math.PI*2*frac);ctx.strokeStyle=col;ctx.lineWidth=5;ctx.lineCap='round';ctx.stroke();ctx.lineCap='butt';
 ctx.fillStyle='#fff';ctx.font=`900 ${rad*.85}px system-ui`;ctx.fillText(t.glyph,x,y);
 ctx.fillStyle='#06152b';ctx.beginPath();ctx.arc(x+rad*.72,y-rad*.72,10,0,Math.PI*2);ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=1;ctx.stroke();ctx.fillStyle=col;ctx.font='800 11px system-ui';ctx.fillText(String(index+1),x+rad*.72,y-rad*.72);
 });
 }
 for(const pt of particles){ctx.globalAlpha=Math.min(1,pt.life/.45);ctx.fillStyle=pt.col;ctx.fillRect(pt.x-2,pt.y-2,4,4);}ctx.globalAlpha=1;
 if(flash>0){ctx.fillStyle=`rgba(155,225,255,${flash*.24})`;ctx.fillRect(0,0,W,H)}
 ctx.restore();ctx.restore();
}
function frame(now){const dt=Math.min(.08,(now-last)/1000||0);last=now;if(s.phase==='playing'){C.step(s,dt);processEvents();if(!document.hidden&&now-uiLast>95){updateHUD();uiLast=now;}}else if(now-uiLast>400){updateHUD();uiLast=now;}
 for(const pt of particles){pt.x+=pt.vx*dt;pt.y+=pt.vy*dt;pt.life-=dt;}particles=particles.filter(pt=>pt.life>0);flash=Math.max(0,flash-dt);shake=Math.max(0,shake-dt*30);if(feedbackTimer>0){feedbackTimer-=dt;if(feedbackTimer<=0&&s.phase==='playing')$('feedback').textContent='SCAN THE RIFT · CAPTURE SIGNALS'}draw();requestAnimationFrame(frame)}
$('year').textContent=new Date().getFullYear();overlay('menu');updateHUD();requestAnimationFrame(frame);
})();