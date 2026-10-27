/* Reality Breaker ∞ — Quantum Rift Edition. Original concept and game by Cornelius Aurelius. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.RealityCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const MODES = Object.freeze({arcade:'Arcade',blitz:'75 Second Rush',zen:'Zen Training'});
  const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
  const rand=(state)=>{ state.seed = (1664525*state.seed + 1013904223) >>> 0; return state.seed/4294967296; };
  const difficulty = w => ({interval:Math.max(.58,1.32-(w-1)*.038), lifetime:Math.max(1.55,2.75-(w-1)*.065), maxTargets:Math.min(5,2+Math.floor((w-1)/3))});
  function create(mode='arcade',seed=74219){
    if(!MODES[mode]) throw new Error('Unsupported mode');
    return {mode,seed:seed>>>0,phase:'ready',score:0,high:0,wave:1,hits:0,combo:0,bestCombo:0,lives:mode==='zen'?Infinity:5,power:0,shield:0,slow:0,elapsed:0,time:mode==='blitz'?75:Infinity,spawnIn:.5,targets:[],boss:null,nextId:1,events:[],successfulBosses:0,achievements:[],lastType:'',timeScale:1};
  }
  function event(s,type,data={}){s.events.push({type,...data});if(s.events.length>40)s.events.shift();}
  function start(s){s.phase='playing';event(s,'start');return s;}
  function reset(mode,seed){return start(create(mode,seed));}
  function spawn(s){
    if(s.phase!=='playing'||s.boss||s.targets.length>=difficulty(s.wave).maxTargets)return false;
    const r=difficulty(s.wave);
    let x=.5,y=.5;
    for(let attempt=0;attempt<32;attempt++){
      x=.13+rand(s)*.74;y=.15+rand(s)*.68;
      if(s.targets.every(t=>Math.hypot((x-t.x)*1.25,y-t.y)>.18))break;
    }
    const type=rand(s)<.15?'bonus':'normal';
    const glyphs=type==='bonus'?['✦','✧','✳']:['Ω','Ψ','Φ','∞','∆','✺','✥','λ'];
    const t={id:s.nextId++,x,y,type,glyph:glyphs[Math.floor(rand(s)*glyphs.length)],ttl:r.lifetime,maxTtl:r.lifetime};
    s.targets.push(t);event(s,'spawn',{id:t.id});return t;
  }
  function loseLife(s,reason){
    if(s.mode==='zen') {event(s,'training-miss',{reason});return;}
    if(s.shield>0){s.shield--;event(s,'shield-save',{reason});return;}
    s.lives=Math.max(0,s.lives-1);event(s,'life-lost',{reason});
    if(s.lives===0)end(s,'no-lives');
  }
  function end(s,reason){if(s.phase!=='playing')return;s.phase='over';s.high=Math.max(s.high,s.score);event(s,'end',{reason});}
  function achievement(s,key){if(!s.achievements.includes(key)){s.achievements.push(key);event(s,'achievement',{key});}}
  function bossStart(s){
    s.targets=[];s.boss={hp:5+2*Math.floor(s.wave/4),maxHp:5+2*Math.floor(s.wave/4),ttl:24};
    event(s,'boss-enter',{wave:s.wave});
  }
  function targetHit(s,id){
    if(s.phase!=='playing'||s.boss)return false;
    const i=s.targets.findIndex(t=>t.id===id);if(i===-1)return false;
    const t=s.targets.splice(i,1)[0];s.combo++;s.bestCombo=Math.max(s.combo,s.bestCombo);s.hits++;
    const points=100+Math.min(200,(s.combo-1)*12)+(t.type==='bonus'?150:0);
    s.score+=points;s.power=clamp(s.power+(t.type==='bonus'?27:13),0,100);
    event(s,'hit',{id,points,x:t.x,y:t.y,bonus:t.type==='bonus'});
    if(s.hits>=10)achievement(s,'first-10');
    if(s.bestCombo>=20)achievement(s,'combo-20');
    if(s.hits%12===0){s.wave++;event(s,'wave',{wave:s.wave});if(s.wave===8)achievement(s,'wave-8');if(s.wave%4===0)bossStart(s);}
    return true;
  }
  function bossHit(s){
    if(s.phase!=='playing'||!s.boss)return false;
    s.boss.hp--;s.score+=60;s.power=clamp(s.power+7,0,100);event(s,'boss-hit',{hp:s.boss.hp});
    if(s.boss.hp<=0){s.score+=600;s.successfulBosses++;s.boss=null;s.spawnIn=.65;event(s,'boss-clear');achievement(s,'boss-breaker');}
    return true;
  }
  function missTap(s){if(s.phase!=='playing')return;s.combo=0;event(s,'empty-tap');}
  function activate(s,ability){
    if(s.phase!=='playing')return false;
    if(ability==='slow'&&s.power>=50){s.power-=50;s.slow=6;event(s,'slow');return true;}
    if(ability==='shield'&&s.power>=65&&s.shield<2){s.power-=65;s.shield++;event(s,'shield');return true;}
    return false;
  }
  function togglePause(s){if(s.phase==='playing'){s.phase='paused';event(s,'pause');return true;}if(s.phase==='paused'){s.phase='playing';event(s,'resume');return true;}return false;}
  function step(s,dt){
    if(s.phase!=='playing')return;
    dt=clamp(Number(dt)||0,0,.08);
    s.elapsed+=dt;
    if(s.mode==='blitz'){s.time=Math.max(0,s.time-dt);if(s.time<=0){end(s,'time');return;}}
    const slowFactor=s.slow>0?.47:1;
    s.slow=Math.max(0,s.slow-dt);
    if(s.boss){s.boss.ttl-=dt*slowFactor;if(s.boss.ttl<=0){s.boss=null;s.combo=0;loseLife(s,'boss');s.spawnIn=.7;}return;}
    for(let i=s.targets.length-1;i>=0;i--){const t=s.targets[i];t.ttl-=dt*slowFactor;if(t.ttl<=0){s.targets.splice(i,1);s.combo=0;event(s,'escaped',{id:t.id,x:t.x,y:t.y});loseLife(s,'escape');if(s.phase==='over')return;}}
    s.spawnIn-=dt*slowFactor;
    if(s.spawnIn<=0){spawn(s);s.spawnIn+=difficulty(s.wave).interval;if(s.spawnIn<0)s.spawnIn=difficulty(s.wave).interval*.5;}
  }
  function hitAt(s,x,y,aspect=1){
    if(s.phase!=='playing')return false;
    if(s.boss){if(Math.hypot((x-.5)*aspect,y-.49)<.19)return bossHit(s);missTap(s);return false;}
    for(let i=s.targets.length-1;i>=0;i--){const t=s.targets[i];if(Math.hypot((x-t.x)*aspect,y-t.y)<.085){return targetHit(s,t.id);}}
    missTap(s);return false;
  }
  function rank(score){return score>=35000?'SINGULARITY':score>=18000?'SS':score>=9000?'S':score>=5000?'A':score>=2600?'B':score>=1200?'C':score>=450?'D':'F';}
  return {MODES,create,start,reset,spawn,step,targetHit,bossHit,hitAt,missTap,activate,togglePause,loseLife,end,difficulty,rank};
});