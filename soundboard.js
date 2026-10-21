const sounds = [
 {id:"vine",name:"Vine Boom",desc:"Tiefer Meme-Boom",category:"Memes",icon:"wave",kind:"boom"},
 {id:"fah",name:"Fah",desc:"Kurzer Meme-Shout",category:"Memes",icon:"zap",kind:"fah"},
 {id:"pump",name:"Pump Shotgun",desc:"Kurzer Gaming-Schuss-Effekt",category:"Gaming",icon:"target",kind:"shot"},
 {id:"explosion",name:"Explosion",desc:"Breiter, dumpfer Effekt",category:"Action",icon:"burst",kind:"explosion"},
 {id:"prowler",name:"Prowler (Spider-Verse)",desc:"Düsterer, tiefer Sci-Fi-Ton",category:"Memes",icon:"moon",kind:"prowler"},
 {id:"sideeye",name:"Side Eye",desc:"Skeptischer Comedy-Ton",category:"Memes",icon:"eye",kind:"sideeye"},
 {id:"quack",name:"Duck Quack",desc:"Kurzer Entenruf",category:"Tiere",icon:"duck",kind:"quack"},
 {id:"feeling",name:"I Got That Feeling",desc:"Fröhlicher Gaming-Jingle",category:"Gaming",icon:"music",kind:"feeling"},
 {id:"cat",name:"Laughing Cat",desc:"Verspielter, lachähnlicher Effekt",category:"Tiere",icon:"cat",kind:"cat"},
 {id:"heha",name:"HE HE HE HAW",desc:"Überdrehter Gaming-Lach-Effekt",category:"Gaming",icon:"crown",kind:"heha"}
];
const iconPaths={
 wave:'<path d="M3 12h3l2-7 4 14 3-10 2 3h4"/>',
 zap:'<path d="m13 2-3 8h6l-5 12 1-9H7l6-11Z"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="m14 10 7-7"/>',
 burst:'<path d="m12 2 2 6 6-3-3 6 5 3-7 1 1 7-5-5-5 5 1-7-7-1 5-3-3-6 6 3 2-6Z"/>',
 moon:'<path d="M20 15.5A8 8 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"/>',
 eye:'<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
 duck:'<path d="M4 15c0-3 3-5 7-5 2 0 3 1 4 2l5 1-4 3c-1 3-4 4-7 4-4 0-5-2-5-5Z"/><circle cx="13" cy="11" r=".7" fill="currentColor"/><path d="M4 15 1 13l4-1"/>',
 music:'<path d="M9 18V5l12-2v13"/><ellipse cx="5.5" cy="18" rx="3.5" ry="2"/><ellipse cx="17.5" cy="16" rx="3.5" ry="2"/>',
 cat:'<path d="m4 9 1-6 5 4h4l5-4 1 6a8 8 0 1 1-16 0Z"/><path d="M9 13h.01M15 13h.01M9 17c2 1 4 1 6 0"/>',
 crown:'<path d="m2 7 5 4 5-8 5 8 5-4-2 12H4L2 7Z"/><path d="M4 22h16"/>'
};
const grid=document.querySelector("#soundGrid"),search=document.querySelector("#search");
let category="Alle",playingId=null,audioCtx=null,activeNodes=[];
const favorites=new Set(JSON.parse(localStorage.getItem("mtm-sound-favorites")||"[]"));
function render(){
 const q=search.value.trim().toLowerCase();
 const shown=sounds.filter(s=>(category==="Alle"||s.category===category||(category==="Favoriten"&&favorites.has(s.id)))&&`${s.name} ${s.desc} ${s.category}`.toLowerCase().includes(q));
 grid.innerHTML=shown.length?shown.map(s=>`<button class="sound-card ${playingId===s.id?"playing":""}" data-play="${s.id}" type="button"><span class="card-top"><span class="sound-icon"><svg viewBox="0 0 24 24" aria-hidden="true">${iconPaths[s.icon]||iconPaths.music}</svg></span><span class="favorite ${favorites.has(s.id)?"on":""}" data-fav="${s.id}" role="button" tabindex="0" aria-label="${favorites.has(s.id)?"Favorit entfernen":"Als Favorit speichern"}">${favorites.has(s.id)?"★":"☆"}</span></span><span class="sound-name">${s.name}</span><span class="sound-desc">${s.desc}</span><span class="play-mark">${playingId===s.id?"PLAYING":"▶ PLAY"}</span></button>`).join(""):`<div class="empty">Keine passenden Sounds gefunden.</div>`;
}
function stopSound(){activeNodes.forEach(n=>{try{n.stop?.()}catch(e){}try{n.disconnect?.()}catch(e){}});activeNodes=[];playingId=null;render()}
function context(){if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==="suspended")audioCtx.resume();return audioCtx}
function tone(freq,start,duration,type="sine",gain=.2,endFreq=null){const c=context(),o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(Math.max(30,freq),start);if(endFreq)o.frequency.exponentialRampToValueAtTime(Math.max(30,endFreq),start+duration);g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(gain,start+.015);g.gain.exponentialRampToValueAtTime(.0001,start+duration);o.connect(g);g.connect(c.destination);o.start(start);o.stop(start+duration+.03);activeNodes.push(o,g)}
function noise(start,duration,gain=.2,filterFreq=900){const c=context(),len=Math.max(1,Math.floor(c.sampleRate*duration)),buf=c.createBuffer(1,len,c.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);const src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();src.buffer=buf;f.type="lowpass";f.frequency.value=filterFreq;g.gain.setValueAtTime(gain,start);g.gain.exponentialRampToValueAtTime(.001,start+duration);src.connect(f);f.connect(g);g.connect(c.destination);src.start(start);src.stop(start+duration);activeNodes.push(src,f,g)}
function play(kind){
 stopSound();playingId=sounds.find(s=>s.kind===kind)?.id||null;render();const c=context(),t=c.currentTime+.02;
 switch(kind){
 case"boom":tone(120,t,.7,"sine",.8,43);noise(t,.22,.22,180);break;
 case"fah":tone(520,t,.18,"sawtooth",.12,250);tone(360,t+.12,.22,"triangle",.18,170);break;
 case"shot":noise(t,.12,.45,1500);tone(95,t,.22,"triangle",.35,45);break;
 case"explosion":noise(t,.65,.55,420);tone(75,t,.7,"sine",.6,32);break;
 case"prowler":tone(90,t,.9,"sawtooth",.2,38);tone(185,t,.8,"sine",.13,55);break;
 case"sideeye":tone(660,t,.12,"triangle",.14,490);tone(440,t+.14,.2,"sine",.12,330);break;
 case"quack":tone(550,t,.14,"sawtooth",.13,260);tone(300,t+.1,.2,"triangle",.18,180);break;
 case"feeling":[440,554,659,880].forEach((f,i)=>tone(f,t+i*.12,.22,"triangle",.11));break;
 case"cat":[660,590,740,520,660].forEach((f,i)=>tone(f,t+i*.09,.12,"triangle",.09));break;
 case"heha":[500,420,570,320].forEach((f,i)=>tone(f,t+i*.12,.14,"sawtooth",.11, f*.65));break;
 }
 setTimeout(()=>{if(playingId&&sounds.find(s=>s.kind===kind)?.id===playingId){playingId=null;activeNodes=[];render()}},1300);
}
grid.addEventListener("click",e=>{const fav=e.target.closest("[data-fav]");if(fav){e.preventDefault();e.stopPropagation();const id=fav.dataset.fav;favorites.has(id)?favorites.delete(id):favorites.add(id);localStorage.setItem("mtm-sound-favorites",JSON.stringify([...favorites]));render();return}const card=e.target.closest("[data-play]");if(card)play(sounds.find(s=>s.id===card.dataset.play).kind)});
document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>{category=b.dataset.category;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));render()}));
search.addEventListener("input",render);document.querySelector("#stopAll").addEventListener("click",stopSound);render();