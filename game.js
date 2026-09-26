const canvas=document.getElementById('game');const ctx=canvas.getContext('2d');
const tg=window.Telegram?.WebApp; if(tg){tg.ready();tg.expand();}
let W=900,H=500,dpr=1,running=false,last=0,level=1,coins=Number(localStorage.getItem('adventureCoins')||0),lives=3,score=0;
const keys={left:false,right:false};
const player={x:90,y:350,w:34,h:48,vx:0,vy:0,onGround:false,inv:0};
let platforms=[],items=[],enemies=[],camera=0,worldW=2600;
function resize(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}addEventListener('resize',resize);resize();
function rand(a,b){return Math.random()*(b-a)+a}
function resetLevel(){worldW=2600+level*500;camera=0;player.x=90;player.y=300;player.vx=0;player.vy=0;player.inv=0;platforms=[{x:0,y:420,w:worldW,h:80},{x:320,y:340,w:190,h:22},{x:650,y:285,w:170,h:22},{x:980,y:350,w:220,h:22},{x:1370,y:290,w:180,h:22},{x:1700,y:350,w:230,h:22},{x:2100,y:275,w:180,h:22}];items=[];enemies=[];for(let x=240;x<worldW-200;x+=rand(190,340)){if(Math.random()<.85)items.push({x,y:rand(220,370),r:10,taken:false})}for(let x=560;x<worldW-200;x+=rand(420,620)){enemies.push({x,y:378,w:32,h:42,vx:(Math.random()<.5?-1:1)*1.1,min:x-90,max:x+90,dead:false})}}
function rectHit(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function jump(){if(running&&player.onGround){player.vy=-12;player.onGround=false}}
function start(){document.getElementById('menu').classList.add('hidden');document.getElementById('gameOver').classList.add('hidden');lives=3;level=1;coins=Number(localStorage.getItem('adventureCoins')||0);resetLevel();running=true;last=performance.now();requestAnimationFrame(loop)}
function endGame(){running=false;document.getElementById('finalCoins').textContent=coins;document.getElementById('finalLevel').textContent=level;document.getElementById('gameOver').classList.remove('hidden')}
function update(dt){if(!running)return;player.vx=(keys.right?4.6:0)-(keys.left?4.6:0);player.vy+=.55;player.x+=player.vx;player.y+=player.vy;player.onGround=false;
for(const p of platforms){if(player.x+player.w>p.x&&player.x<p.x+p.w&&player.y+player.h<=p.y+8&&player.y+player.h+player.vy>=p.y){player.y=p.y-player.h;player.vy=0;player.onGround=true}}
if(player.x<0)player.x=0;if(player.x>worldW-player.w)player.x=worldW-player.w;if(player.y>H+100){hurt();return}
for(const c of items){if(!c.taken&&Math.hypot(player.x+player.w/2-c.x,player.y+player.h/2-c.y)<28){c.taken=true;coins++;localStorage.setItem('adventureCoins',coins)}}
for(const e of enemies){if(e.dead)continue;e.x+=e.vx;if(e.x<e.min||e.x>e.max)e.vx*=-1;if(rectHit(player,e)&&player.inv<=0){if(player.vy>2&&player.y+player.h<e.y+15){e.dead=true;player.vy=-8}else hurt()}}
if(player.inv>0)player.inv-=dt;if(player.x>worldW-170){level++;resetLevel()}
camera=Math.max(0,Math.min(worldW-W,player.x-W*.35));document.getElementById('coins').textContent=coins;document.getElementById('lives').textContent=lives;document.getElementById('level').textContent=level}
function hurt(){if(player.inv>0)return;lives--;player.inv=1500;if(lives<=0){endGame();return}player.x=Math.max(50,player.x-180);player.y=250;player.vy=0}
function draw(){ctx.clearRect(0,0,W,H);const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#64c8ff');sky.addColorStop(1,'#d8f4ff');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);ctx.save();ctx.translate(-camera,0);
// clouds
ctx.fillStyle='rgba(255,255,255,.8)';for(let i=0;i<8;i++){let x=i*430+100;ctx.beginPath();ctx.arc(x,90+(i%3)*25,25,0,7);ctx.arc(x+30,82+(i%3)*25,34,0,7);ctx.arc(x+65,94+(i%3)*25,22,0,7);ctx.fill()}
// platforms
for(const p of platforms){ctx.fillStyle='#58a64a';ctx.fillRect(p.x,p.y,p.w,8);ctx.fillStyle='#8a5a32';ctx.fillRect(p.x,p.y+8,p.w,p.h-8)}
// coins
for(const c of items)if(!c.taken){ctx.fillStyle='#ffd21f';ctx.beginPath();ctx.arc(c.x,c.y,c.r,0,7);ctx.fill();ctx.strokeStyle='#b77a00';ctx.stroke()}
// enemies
for(const e of enemies)if(!e.dead){ctx.fillStyle='#d64545';ctx.fillRect(e.x,e.y,e.w,e.h);ctx.fillStyle='white';ctx.fillRect(e.x+6,e.y+8,7,7);ctx.fillRect(e.x+19,e.y+8,7,7);ctx.fillStyle='#111';ctx.fillRect(e.x+8,e.y+10,4,4);ctx.fillRect(e.x+21,e.y+10,4,4)}
// player
if(player.inv<=0||Math.floor(player.inv/100)%2===0){ctx.fillStyle='#2463d4';ctx.fillRect(player.x,player.y+14,player.w,34);ctx.fillStyle='#ffd2a6';ctx.beginPath();ctx.arc(player.x+17,player.y+10,14,0,7);ctx.fill();ctx.fillStyle='#222';ctx.fillRect(player.x+8,player.y+4,19,6);ctx.fillStyle='#222';ctx.fillRect(player.x+5,player.y+45,10,5);ctx.fillRect(player.x+20,player.y+45,10,5)}
ctx.fillStyle='rgba(255,255,255,.9)';ctx.font='bold 18px Arial';ctx.fillText('ФІНІШ →',worldW-130,250);ctx.restore()}
function loop(t){if(!running)return;const dt=Math.min(40,t-last);last=t;update(dt);draw();requestAnimationFrame(loop)}
addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='a')keys.left=true;if(e.key==='ArrowRight'||e.key==='d')keys.right=true;if(e.key==='ArrowUp'||e.key===' '||e.key==='w')jump()});addEventListener('keyup',e=>{if(e.key==='ArrowLeft'||e.key==='a')keys.left=false;if(e.key==='ArrowRight'||e.key==='d')keys.right=false});
function hold(btn,prop){btn.addEventListener('pointerdown',e=>{e.preventDefault();keys[prop]=true});['pointerup','pointercancel','pointerleave'].forEach(ev=>btn.addEventListener(ev,()=>keys[prop]=false))}hold(document.getElementById('leftBtn'),'left');hold(document.getElementById('rightBtn'),'right');document.getElementById('jumpBtn').addEventListener('pointerdown',e=>{e.preventDefault();jump()});document.getElementById('startBtn').onclick=start;document.getElementById('restartBtn').onclick=start;
draw();
