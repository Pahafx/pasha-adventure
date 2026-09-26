const TG = window.Telegram?.WebApp;
TG?.ready();
TG?.expand();

const KEY="pasha_dragons_v4";
const ELEMENTS={
  Fire:{icon:"🔥",strong:"Nature",weak:"Water"},
  Water:{icon:"💧",strong:"Fire",weak:"Lightning"},
  Lightning:{icon:"⚡",strong:"Water",weak:"Nature"},
  Nature:{icon:"🌿",strong:"Water",weak:"Fire"},
  Ice:{icon:"❄️",strong:"Air",weak:"Fire"},
  Air:{icon:"🌪️",strong:"Lightning",weak:"Ice"}
};
const DRAGONS=[
 {id:"pyra",name:"Pyra",el:"Fire",rarity:"Rare",art:"🐲",base:74,skill:"Вогняний подих"},
 {id:"glacia",name:"Glacia",el:"Ice",rarity:"Rare",art:"🐉",base:72,skill:"Крижаний щит"},
 {id:"zephra",name:"Zephra",el:"Air",rarity:"Uncommon",art:"🐲",base:67,skill:"Швидкий вітер"},
 {id:"moss",name:"Moss",el:"Nature",rarity:"Common",art:"🐉",base:61,skill:"Коріння"},
 {id:"volt",name:"Volt",el:"Lightning",rarity:"Legendary",art:"🐲",base:91,skill:"Грім"},
 {id:"aqua",name:"Aqua",el:"Water",rarity:"Common",art:"🐉",base:60,skill:"Хвиля"},
 {id:"ember",name:"Ember",el:"Fire",rarity:"Common",art:"🐲",base:58,skill:"Іскра"},
 {id:"frost",name:"Frost",el:"Ice",rarity:"Uncommon",art:"🐉",base:64,skill:"Крижаний удар"},
 {id:"bloom",name:"Bloom",el:"Nature",rarity:"Rare",art:"🐲",base:76,skill:"Лісовий дух"},
 {id:"storm",name:"Storm",el:"Air",rarity:"Rare",art:"🐉",base:78,skill:"Шквал"}
];

const defaultState={
 gold:500,gems:18,energy:20,rating:1000,wins:0,losses:0,battles:0,
 dragons:[
  {id:"pyra",level:4,xp:45},
  {id:"glacia",level:3,xp:20},
  {id:"zephra",level:2,xp:10},
  {id:"moss",level:1,xp:0}
 ],
 team:["pyra","glacia","zephra"],
 quests:[
  {id:"battle",title:"Зіграти 2 бої",sub:"Нагорода: 120 🪙",goal:2,progress:0,reward:120,icon:"⚔️",done:false},
  {id:"train",title:"Тренувати дракона 2 рази",sub:"Нагорода: 5 💎",goal:2,progress:0,reward:5,icon:"🏋️",done:false},
  {id:"hatch",title:"Вилупити яйце",sub:"Нагорода: 80 🪙",goal:1,progress:0,reward:80,icon:"🥚",done:false}
 ]
};
let S=load();
let battleState=null;

function load(){
 try{return {...defaultState,...JSON.parse(localStorage.getItem(KEY)||"null")}}catch(e){return structuredClone(defaultState)}
}
function save(){localStorage.setItem(KEY,JSON.stringify(S))}
function dragonData(id){return DRAGONS.find(d=>d.id===id)}
function owned(id){return S.dragons.find(d=>d.id===id)}
function power(d){
 const q=dragonData(d.id);
 return Math.round(q.base+d.level*12+Math.sqrt(d.xp)*2);
}
function hp(d){return 70+d.level*14}
function toast(t){
 const el=document.getElementById("toast");el.textContent=t;el.classList.add("show");
 clearTimeout(window._toast);window._toast=setTimeout(()=>el.classList.remove("show"),1800);
}
function setScreen(id){
 document.querySelectorAll(".screen").forEach(x=>x.classList.toggle("active",x.id===id));
 document.querySelectorAll(".nav-btn").forEach(x=>x.classList.toggle("active",x.dataset.go===id));
 render();
 window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>setScreen(b.dataset.go)));

function render(){
 document.getElementById("gold").textContent=S.gold;
 document.getElementById("gems").textContent=S.gems;
 document.getElementById("energy").textContent=S.energy;
 document.getElementById("rating").textContent=S.rating;
 document.getElementById("wins").textContent=S.wins;
 document.getElementById("dragonCount").textContent=S.dragons.length;
 document.getElementById("battleCount").textContent=S.battles;
 document.getElementById("questCount").textContent=S.quests.filter(q=>q.done).length;
 const rank=S.rating<1100?"Bronze I":S.rating<1200?"Bronze II":S.rating<1350?"Silver I":S.rating<1500?"Silver II":S.rating<1700?"Gold I":"Dragon Master";
 document.getElementById("rankLabel").textContent=rank;
 renderTeamPreview();renderDragons();renderHatchery();renderArena();renderQuests();renderCodex();
}
function cardHTML(d,selected=false){
 const q=dragonData(d.id),e=ELEMENTS[q.el],p=Math.min(100,d.xp%100);
 return `<div class="dragon-card ${selected?"selected":""}" data-dragon="${d.id}">
   <span class="tag">${q.rarity}</span><div class="dragon-art">${q.art}</div>
   <div class="dragon-name">${q.name} · Lv.${d.level}</div>
   <div class="dragon-meta">${e.icon} ${q.el} · ${q.skill}</div>
   <div class="bar"><i style="width:${p||8}%"></i></div>
   <div class="power">⚔️ ${power(d)} · ❤️ ${hp(d)}</div>
 </div>`;
}
function renderTeamPreview(){
 document.getElementById("teamPreview").innerHTML=S.team.map(id=>cardHTML(owned(id),true)).join("")||`<div class="card">Обери драконів у вкладці «Дракони».</div>`;
 document.querySelectorAll("#teamPreview [data-dragon]").forEach(x=>x.onclick=()=>setScreen("dragons"));
}
function renderDragons(){
 const el=document.getElementById("dragonList");
 el.innerHTML=S.dragons.map(d=>cardHTML(d,S.team.includes(d.id))).join("");
 el.querySelectorAll("[data-dragon]").forEach(x=>x.onclick=()=>toggleTeam(x.dataset.dragon));
}
function toggleTeam(id){
 if(S.team.includes(id)){S.team=S.team.filter(x=>x!==id);toast("Дракона прибрано з команди")}
 else if(S.team.length<3){S.team.push(id);toast("Дракона додано до команди")}
 else toast("У команді може бути максимум 3 дракони");
 save();render();
}
document.getElementById("autoTeam").onclick=()=>{
 S.team=[...S.dragons].sort((a,b)=>power(b)-power(a)).slice(0,3).map(x=>x.id);save();render();toast("Команду зібрано");
};

function renderHatchery(){}
document.querySelectorAll("[data-egg]").forEach(b=>b.onclick=()=>hatch(b.dataset.egg));
function hatch(type){
 if(type==="basic" && S.gold<100)return toast("Не вистачає золота");
 if(type==="rare" && S.gems<8)return toast("Не вистачає кристалів");
 if(type==="basic")S.gold-=100;else S.gems-=8;
 const pool=type==="rare"?DRAGONS.filter(d=>["Uncommon","Rare","Legendary"].includes(d.rarity)):DRAGONS;
 const weights={Common:55,Uncommon:27,Rare:15,Legendary:3};
 let total=pool.reduce((n,d)=>n+(weights[d.rarity]||1),0),r=Math.random()*total,chosen=pool[0];
 for(const d of pool){r-=weights[d.rarity]||1;if(r<=0){chosen=d;break}}
 let o=owned(chosen.id);
 if(o){o.xp+=35;toast(`${chosen.name}: +35 XP`)}
 else{S.dragons.push({id:chosen.id,level:1,xp:0});toast(`🥚 Вилупився ${chosen.name}!`)}
 questProgress("hatch",1);save();render();
}
function train(id){
 const d=owned(id);
 if(!d||S.gold<40)return toast("Потрібно 40 🪙");
 S.gold-=40;d.xp+=25;
 if(d.xp>=100){d.xp-=100;d.level++;toast(`${dragonData(id).name} піднявся до Lv.${d.level}!`)}
 else toast(`${dragonData(id).name} отримав +25 XP`);
 questProgress("train",1);save();render();
}
document.addEventListener("click",e=>{
 const c=e.target.closest(".dragon-card");
 if(c && document.getElementById("dragons").classList.contains("active")){
   if(e.target.closest(".tag"))return;
   // Long card tap acts as team toggle; double click trains.
 }
});
function renderQuests(){
 const el=document.getElementById("questsList");
 el.innerHTML=S.quests.map(q=>`<div class="quest ${q.done?"done":""}">
  <div class="icon">${q.icon}</div><main><div class="quest-title">${q.title}</div><div class="quest-sub">${q.done?"Виконано":q.sub+" · "+q.progress+"/"+q.goal}</div></main>
  ${!q.done&&q.progress>=q.goal?`<button class="small" data-claim="${q.id}">Забрати</button>`:""}
 </div>`).join("");
 el.querySelectorAll("[data-claim]").forEach(b=>b.onclick=()=>claimQuest(b.dataset.claim));
}
function questProgress(id,n=1){
 const q=S.quests.find(x=>x.id===id&&!x.done);if(q)q.progress=Math.min(q.goal,q.progress+n);save();
}
function claimQuest(id){
 const q=S.quests.find(x=>x.id===id);if(!q||q.done||q.progress<q.goal)return;
 q.done=true;
 if(id==="train")S.gems+=q.reward;else S.gold+=q.reward;
 toast(`Нагорода: ${q.reward}${id==="train"?" 💎":" 🪙"}`);save();render();
}
function renderDailyPreview(){
 document.getElementById("dailyPreview").innerHTML=S.quests.slice(0,2).map(q=>`<div class="quest ${q.done?"done":""}"><div class="icon">${q.icon}</div><main><div class="quest-title">${q.title}</div><div class="quest-sub">${q.progress}/${q.goal}</div></main></div>`).join("");
}
function renderCodex(){
 const el=document.getElementById("codexList");
 const have=new Set(S.dragons.map(x=>x.id));
 el.innerHTML=DRAGONS.map(d=>`<div class="codex ${have.has(d.id)?"":"locked"}"><div class="art">${d.art}</div><b>${have.has(d.id)?d.name:"???"}</b><div class="dragon-meta">${ELEMENTS[d.el].icon} ${d.el}</div></div>`).join("");
 document.getElementById("collectionCount").textContent=`${have.size}/${DRAGONS.length}`;
}
function renderArena(){
 document.getElementById("arenaTeam").innerHTML=S.team.map(id=>{let d=owned(id),q=dragonData(id);return `<div class="mini"><div class="art">${q.art}</div><b>${q.name}</b><div class="dragon-meta">Lv.${d.level} · ⚔️${power(d)}</div></div>`}).join("");
}
function makeEnemy(){
 const pool=DRAGONS.filter(d=>!S.team.includes(d.id));
 return [...Array(3)].map((_,i)=>{
   const q=pool[Math.floor(Math.random()*pool.length)];
   return {id:q.id,level:Math.max(1,Math.min(8,Math.round(2+(S.rating-900)/100+Math.random()*2))),hp:0,maxHp:0};
 }).map(x=>{x.maxHp=80+x.level*15;x.hp=x.maxHp;return x});
}
function startBattle(){
 if(S.team.length!==3)return toast("Спочатку обери 3 драконів");
 if(S.energy<5)return toast("Не вистачає енергії");
 S.energy-=5;S.battles++;questProgress("battle",1);
 const player=S.team.map(id=>{let d=owned(id);return {id,level:d.level,hp:hp(d),maxHp:hp(d)}})
 battleState={player,enemy:makeEnemy(),turn:1,active:0,enemyActive:0,over:false};
 document.getElementById("arenaSetup").classList.add("hidden");
 document.getElementById("battle").classList.remove("hidden");
 log("⚔️ Бій почався! Обери здібність.");
 renderBattle();
}
document.getElementById("startBattle").onclick=startBattle;
function log(t){const el=document.getElementById("battleLog");el.innerHTML+=`<div class="logline">${t}</div>`;el.scrollTop=el.scrollHeight}
function renderBattle(){
 if(!battleState)return;
 const f=(x,enemy)=>{const q=dragonData(x.id),e=ELEMENTS[q.el];return `<div class="fighter ${!enemy&&x===battleState.player[battleState.active]||enemy&&x===battleState.enemy[battleState.enemyActive]?"active":""}">
  <div class="fart">${q.art}</div><b>${q.name}</b><div class="dragon-meta">${e.icon} ${q.el} · Lv.${x.level}</div>
  <div class="hp"><i style="width:${Math.max(0,x.hp/x.maxHp*100)}%"></i></div><small>❤️ ${Math.max(0,Math.ceil(x.hp))}/${x.maxHp}</small>
 </div>`}
 document.getElementById("playerSide").innerHTML=battleState.player.map(x=>f(x,false)).join("");
 document.getElementById("enemySide").innerHTML=battleState.enemy.map(x=>f(x,true)).join("");
 document.getElementById("battleTurn").textContent=`Хід ${battleState.turn}`;
 const q=dragonData(battleState.player[battleState.active].id);
 document.getElementById("actionBar").innerHTML=[
  [q.skill,1],[`Сильний удар`,1.25],[`Захист`,.65]
 ].map((a,i)=>`<button class="action-btn" data-action="${i}">${a[0]}<br><small>${i===0?"стихія":i===1?"125% шкоди":"65% шкоди · щит"}</small></button>`).join("");
 document.querySelectorAll("[data-action]").forEach(b=>b.onclick=()=>playerAction(+b.dataset.action));
}
function multiplier(att,def){
 const a=ELEMENTS[dragonData(att).el],de=ELEMENTS[dragonData(def).el];
 if(a.strong===dragonData(def).el)return 1.35;
 if(a.weak===dragonData(def).el)return .75;
 return 1;
}
function playerAction(action){
 if(battleState.over)return;
 const a=battleState.player[battleState.active],target=battleState.enemy[battleState.enemyActive];
 const q=dragonData(a.id);
 let base=power(owned(a.id))*.28*(action===1?1.25:action===2?.65:1);
 let crit=Math.random()<.12?1.6:1;
 let dmg=Math.max(4,Math.round(base*multiplier(a.id,target.id)*crit));
 if(action===2){a.shield=2;log(`🛡️ ${q.name} став у захист.`)}else{
  target.hp-=dmg;
  const bonus=multiplier(a.id,target.id)>1?" 🔥 Перевага стихії!":multiplier(a.id,target.id)<1?" ⚠️ Слабкість.":"";
  log(`${q.art} ${q.name} завдав ${dmg} шкоди.${crit>1?" 💥 Крит!":""}${bonus}`);
 }
 if(target.hp<=0){log(`💀 ${dragonData(target.id).name} переможений!`);battleState.enemyActive=nextAlive(battleState.enemy,battleState.enemyActive)}
 if(!battleState.enemy.some(x=>x.hp>0)){finishBattle(true);return}
 enemyTurn(); if(!battleState.player.some(x=>x.hp>0)){finishBattle(false);return}
 battleState.turn++;battleState.active=nextAlive(battleState.player,battleState.active);renderBattle();
}
function nextAlive(arr,start){
 for(let i=1;i<=arr.length;i++){let n=(start+i)%arr.length;if(arr[n].hp>0)return n}
 return start;
}
function enemyTurn(){
 const a=battleState.enemy[battleState.enemyActive];
 const alive=battleState.player.filter(x=>x.hp>0);
 if(!alive.length)return;
 const target=alive[Math.floor(Math.random()*alive.length)],q=dragonData(a.id);
 let dmg=Math.max(3,Math.round((60+a.level*12)*.28*multiplier(a.id,target.id)*(0.85+Math.random()*.3)));
 if(target.shield){dmg=Math.round(dmg*.45);target.shield=0;log(`🛡️ Захист ${dragonData(target.id).name} зменшив шкоду.`)}
 target.hp-=dmg;log(`${q.art} ${q.name} атакує ${dragonData(target.id).name}: -${dmg} ❤️`);
 if(target.hp<=0)log(`💀 ${dragonData(target.id).name} вибув.`);
}
function finishBattle(win){
 battleState.over=true;
 if(win){const reward=60+Math.floor(Math.random()*61);S.gold+=reward;S.wins++;S.rating+=25;log(`🏆 Перемога! +${reward} 🪙, +25 рейтингу`);toast("🏆 Перемога!")}
 else{S.losses++;S.rating=Math.max(0,S.rating-15);log("💥 Поразка. -15 рейтингу");toast("Бій програно")}
 document.getElementById("actionBar").innerHTML="";
 document.getElementById("nextBattle").classList.remove("hidden");
 save();renderBattle();render();
}
document.getElementById("nextBattle").onclick=()=>{
 battleState=null;document.getElementById("battle").classList.add("hidden");document.getElementById("arenaSetup").classList.remove("hidden");document.getElementById("nextBattle").classList.add("hidden");render();
};
document.getElementById("resetGame").onclick=()=>{
 if(confirm("Скинути весь прогрес?")){localStorage.removeItem(KEY);S=load();toast("Прогрес скинуто");render();}
};

document.addEventListener("dblclick",e=>{
 const c=e.target.closest(".dragon-card");if(c&&document.getElementById("dragons").classList.contains("active"))train(c.dataset.dragon);
});

renderDailyPreview();
render();
