const tg=window.Telegram?.WebApp;if(tg){tg.ready();tg.expand()}
const screen=document.getElementById("screen");
const state=JSON.parse(localStorage.getItem("pasha_dragons")||"null")||{
 gold:500,gems:25,emb:0,tab:"roost",day:1,
 dragons:[{name:"Pyra",emoji:"🐲",element:"Вогонь",rarity:"Common",level:1,hp:120,pwr:28,def:20,xp:0}],
 eggs:[],wins:0,losses:0
};
function save(){localStorage.setItem("pasha_dragons",JSON.stringify(state));}
function toast(t){const e=document.getElementById("toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1600)}
function render(){
 document.getElementById("gold").textContent=state.gold;
 document.getElementById("gems").textContent=state.gems;
 document.querySelectorAll(".tabs button").forEach(b=>b.classList.toggle("active",b.dataset.tab===state.tab));
 ({roost:roost,hatchery:hatchery,battle:battle,market:market,more:more}[state.tab])();
}
document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;save();render()});

function roost(){
 const d=state.dragons[0];
 screen.innerHTML=`<div class="hero"><h1>🏝️ Твоє драконяче гніздо</h1><p>Розвивай драконів, відкривай яйця та збирай команду.</p></div>
 <div class="dragon-card"><div class="dragon-art">${d.emoji}</div>
 <div class="row" style="margin-top:12px"><div><h2 style="margin:0">${d.name}</h2><span class="pill">${d.element} • ${d.rarity}</span></div><b>Lv. ${d.level}</b></div>
 <div class="statgrid"><div class="stat"><b>${d.pwr}</b><small>⚔️ Сила</small></div><div class="stat"><b>${d.hp}</b><small>❤️ HP</small></div><div class="stat"><b>${d.def}</b><small>🛡 Захист</small></div></div>
 <div style="margin-top:13px"><div class="row"><small class="muted">Досвід</small><small class="muted">${d.xp}/100</small></div><div class="progress"><i style="width:${d.xp}%"></i></div></div>
 <button class="action" id="train">🔥 Тренувати — 50 🪙</button></div>
 <div class="grid" style="margin-top:12px">
 <div class="tile"><div class="icon">🥚</div><h3>Інкубатор</h3><p>Виводь нових драконів</p></div>
 <div class="tile"><div class="icon">⚔️</div><h3>Sky Arena</h3><p>Бийся за нагороди</p></div></div>`;
 document.getElementById("train").onclick=()=>{
   if(state.gold<50)return toast("Не вистачає золота");
   state.gold-=50;d.xp+=25;d.pwr+=3;d.hp+=8;
   if(d.xp>=100){d.xp-=100;d.level++;d.pwr+=8;d.hp+=20;d.def+=5;toast("🐉 Дракон підняв рівень!")}else toast("🔥 Дракон став сильнішим!");
   save();render();
 };
}

function hatchery(){
 screen.innerHTML=`<div class="section-title">🥚 Інкубатор</div><div class="hero"><p>Яйце коштує 150 🪙. Рідкість і стихія визначаються випадково.</p><div class="egg">🥚</div><button class="action" id="hatch">Вилупити яйце — 150 🪙</button></div>
 <div style="margin-top:16px" class="section-title">Твоя колекція</div><div class="list">${state.dragons.map(d=>`<div class="item"><span>${d.emoji} <b>${d.name}</b><br><small class="muted">${d.element} • ${d.rarity} • Lv.${d.level}</small></span><b>⚔️${d.pwr}</b></div>`).join("")}</div>`;
 document.getElementById("hatch").onclick=()=>{
   if(state.gold<150)return toast("Не вистачає золота");
   state.gold-=150;
   const pool=[["🔥","Pyra","Вогонь"],["❄️","Glacia","Лід"],["🌪️","Zephra","Повітря"],["🌿","Terra","Природа"],["⚡","Volt","Блискавка"],["🌊","Aqua","Вода"]];
   const r=Math.random(), pick=pool[Math.floor(Math.random()*pool.length)];
   const rarity=r>.93?"Legendary":r>.72?"Rare":r>.42?"Uncommon":"Common";
   const mult=rarity==="Legendary"?2.1:rarity==="Rare"?1.5:rarity==="Uncommon"?1.2:1;
   state.dragons.push({emoji:pick[0],name:pick[1],element:pick[2],rarity,level:1,hp:Math.round(100*mult),pwr:Math.round(24*mult),def:Math.round(18*mult),xp:0});
   save();render();toast(`🎉 Вилупився ${rarity} дракон!`);
 };
}

function battle(){
 const d=state.dragons.reduce((a,b)=>b.pwr>a.pwr?b:a);
 const enemyPwr=Math.round(18+Math.random()*28+state.wins*1.4);
 screen.innerHTML=`<div class="section-title">⚔️ Sky Arena</div><div class="arena"><span class="pill">Твій дракон</span><div class="opponent">${d.emoji}</div><div class="row"><b>${d.name}</b><b>⚔️ ${d.pwr}</b></div><hr style="border-color:#34415a"><span class="pill">Суперник</span><div class="opponent">👹</div><div class="row"><b>Shadow Beast</b><b>⚔️ ${enemyPwr}</b></div><button class="action" id="fight">⚔️ Битися</button><div id="log" class="battle-log">Перевір силу команди та починай бій.</div></div>
 <div class="statgrid"><div class="stat"><b>${state.wins}</b><small>🏆 Перемог</small></div><div class="stat"><b>${state.losses}</b><small>💀 Поразок</small></div><div class="stat"><b>${state.emb}</b><small>💠 EMB</small></div></div>`;
 document.getElementById("fight").onclick=()=>{
   const chance=d.pwr/(d.pwr+enemyPwr);
   if(Math.random()<chance){
     const reward=40+Math.floor(Math.random()*65);state.wins++;state.gold+=reward;state.emb+=reward;
     document.getElementById("log").textContent=`🏆 Перемога! +${reward} 🪙 та +${reward} EMB`;
   }else{state.losses++;state.gold=Math.max(0,state.gold-25);document.getElementById("log").textContent="💥 Поразка. -25 🪙. Тренуй дракона і спробуй ще раз."}
   save();render();
 };
}

function market(){
 screen.innerHTML=`<div class="section-title">🛒 Ринок</div><div class="hero"><p>Тут можна обмінювати ресурси. У цій версії ринок працює локально; для реального ринку між гравцями потрібен сервер.</p></div>
 <div class="list" style="margin-top:12px">
 <div class="item"><span>🍖 Пакет корму</span><button class="action" style="width:auto;margin:0;padding:9px 12px" onclick="buy(30,5)">30 🪙</button></div>
 <div class="item"><span>💎 5 кристалів</span><button class="action" style="width:auto;margin:0;padding:9px 12px" onclick="buyGems()">100 🪙</button></div>
 <div class="item"><span>🥚 Рідкісне яйце</span><button class="action" style="width:auto;margin:0;padding:9px 12px" onclick="buyEgg()">300 🪙</button></div></div>`;
}
function buy(cost,food){if(state.gold<cost)return toast("Не вистачає золота");state.gold-=cost;toast(`🍖 +${food} корму`);save();render()}
function buyGems(){if(state.gold<100)return toast("Не вистачає золота");state.gold-=100;state.gems+=5;save();render();toast("💎 +5 кристалів")}
function buyEgg(){if(state.gold<300)return toast("Не вистачає золота");state.gold-=300;state.eggs.push({rarity:"Rare"});save();render();toast("🥚 Рідкісне яйце додано")}

function more(){
 screen.innerHTML=`<div class="section-title">☰ Keeper's Hall</div><div class="grid">
 <div class="tile"><div class="icon">📖</div><h3>Codex</h3><p>${state.dragons.length}/20 драконів</p></div>
 <div class="tile"><div class="icon">🏆</div><h3>Досягнення</h3><p>${state.wins} перемог на арені</p></div>
 <div class="tile"><div class="icon">🎯</div><h3>Щоденне</h3><p>Зайди завтра за бонусом</p></div>
 <div class="tile"><div class="icon">👤</div><h3>Профіль</h3><p>${tg?.initDataUnsafe?.user?.first_name||"Dragon Keeper"}</p></div></div>
 <div class="hero" style="margin-top:12px"><h3>💠 EMB</h3><p>Внутрішня валюта гри: <b>${state.emb}</b>. У цій версії це лише ігрові бали.</p></div>
 <button class="action" onclick="resetProgress()">Скинути локальний прогрес</button>`;
}
function resetProgress(){if(confirm("Скинути прогрес?")){localStorage.removeItem("pasha_dragons");location.reload()}}

render();
