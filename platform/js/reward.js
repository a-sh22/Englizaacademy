// ==========================================================
// 🪙 Engliza Academy Reward System
// الجزء الأول
// ==========================================================

import {

auth,
db

} from "./firebase.js";

import {

onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


import{

addRewardHistory

}from "./history.js";



import {

doc,
getDoc,
updateDoc,
arrayUnion,
increment

} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";



// ==========================================================
// إعدادات النظام
// ==========================================================

export const REWARDS={

lesson:5,

review:15,

unit:50,

daily:10,

game:3

};



// يمنع الضغط أكثر من مرة
let rewardRunning=false;



// ==========================================================
// 🔊 نظام صوت العملات
// يعمل بشكل أفضل على iPhone / Safari
// ==========================================================

let coinAudio=null;


// تجهيز الصوت

function prepareCoinSound(){

if(!coinAudio){

coinAudio=new Audio(
"https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=coins-2-89738.mp3"
);

coinAudio.preload="auto";

coinAudio.volume=.45;

}

return coinAudio;

}


// تشغيل الصوت

export function playCoinSound(){

const audio=prepareCoinSound();

audio.currentTime=0;

const promise=audio.play();

if(promise){

promise.catch(()=>{});

}

}


// تهيئة الصوت من ضغطة المستخدم

export function unlockCoinSound(){

const audio=prepareCoinSound();

audio.muted=true;

audio.currentTime=0;

const promise=audio.play();

if(promise){

promise.then(()=>{

audio.pause();

audio.currentTime=0;

audio.muted=false;

}).catch(()=>{

audio.muted=false;

});

}

}


// ==========================================================
// إنشاء طبقة البوب أب (مرة واحدة فقط)
// ==========================================================

export function createRewardUI(){

if(document.getElementById("rewardOverlay")){

return;

}



// CSS

const style=document.createElement("style");

style.textContent=`

#rewardOverlay{

position:fixed;

inset:0;

background:rgba(0,0,0,.45);

display:none;

justify-content:center;

align-items:center;

z-index:999999;

backdrop-filter:blur(4px);

}

#rewardCard{

width:360px;

max-width:90%;

background:white;

border-radius:30px;

padding:35px;

text-align:center;

box-shadow:0 30px 80px rgba(0,0,0,.25);

animation:rewardPop .35s;

position:relative;

overflow:hidden;

}

#rewardTitle{

font-size:34px;

margin-bottom:18px;

color:#1f3c88;

}

#rewardCoins{

font-size:60px;

font-weight:bold;

color:#ffb300;

margin:18px 0;

}

#rewardText{

font-size:22px;

line-height:1.9;

color:#555;

}

#rewardBtn{

margin-top:30px;

width:100%;

padding:18px;

border:none;

border-radius:18px;

background:#3768ff;

color:white;

font-size:20px;

font-weight:bold;

cursor:pointer;

}

.coinParticle{

position:absolute;

font-size:28px;

opacity:0;

animation:coinFly 1s forwards;

}

@keyframes rewardPop{

from{

opacity:0;

transform:scale(.75);

}

to{

opacity:1;

transform:scale(1);

}

}

@keyframes coinFly{

0%{

opacity:0;

transform:translateY(80px) scale(.4);

}

20%{

opacity:1;

}

100%{

opacity:0;

transform:translateY(-250px) rotate(720deg) scale(1.3);

}

}

`;

document.head.appendChild(style);



// HTML

const overlay=document.createElement("div");

overlay.id="rewardOverlay";

overlay.innerHTML=`

<div id="rewardCard">

<div id="rewardTitle">

🎉 أحسنت!

</div>

<div id="rewardCoins">

+5

</div>

<div style="font-size:18px;margin-bottom:15px;color:#666;">

رصيدك الحالي:

<span id="rewardBalance">0</span>

🪙

</div>

<div id="rewardText">

لقد حصلت على

<b>5 Coins</b>

كمكافأة لإنهاء الدرس.

</div>

<button id="rewardBtn">

🚀 متابعة

</button>

</div>

`;

document.body.appendChild(overlay);

}

// ==========================================================
// إنشاء العملات الطائرة
// ==========================================================

function createFlyingCoins(){

const card=document.getElementById("rewardCard");

for(let i=0;i<18;i++){

const coin=document.createElement("div");

coin.className="coinParticle";

coin.innerHTML="🪙";

coin.style.left=(Math.random()*90)+"%";

coin.style.bottom="15px";

coin.style.animationDelay=(Math.random()*0.35)+"s";

card.appendChild(coin);

setTimeout(()=>coin.remove(),1400);

}

}



// ==========================================================
// تحريك عداد الرصيد
// ==========================================================

function animateBalance(start,end){

const balance=document.getElementById("rewardBalance");

if(!balance){

return Promise.resolve();

}

return new Promise(resolve=>{

let current=start;

const timer=setInterval(()=>{

current++;

balance.textContent=current;

refreshCoinBadge(current);

if(current>=end){

clearInterval(timer);

resolve();

}

},90);

});

}



// ==========================================================
// تحديث عداد العملات في الصفحة الرئيسية
// ==========================================================

export function refreshCoinBadge(value=null){

const badge=document.getElementById("coinCounter");

if(!badge){

return;

}

if(value!==null){

badge.textContent=value;

}

}



// ==========================================================
// عرض نافذة المكافأة
// ==========================================================

export async function showRewardPopup(oldCoins,newCoins,reward){

createRewardUI();

playCoinSound();

const overlay=document.getElementById("rewardOverlay");

const plus=document.getElementById("rewardCoins");

const balance=document.getElementById("rewardBalance");

const button=document.getElementById("rewardBtn");

overlay.style.display="flex";


 document.getElementById("rewardText").innerHTML=
`لقد حصلت على <b>${reward} Coins</b> كمكافأة لإنهاء الدرس.`; 


button.disabled=true;

plus.textContent="+"+reward;

balance.textContent=oldCoins;

createFlyingCoins();

await animateBalance(oldCoins,newCoins);

button.disabled=false;

button.onclick=function(){

overlay.style.display="none";

};

}



// ==========================================================
// إنهاء الدرس وإضافة المكافأة
// ==========================================================

export async function completeLesson(

lessonId,

lessonTitle

){

if(rewardRunning){

return false;

}

rewardRunning=true;

if(!navigator.onLine){

alert("⚠️ لا يوجد اتصال بالإنترنت.");

rewardRunning=false;

return false;

}

const user=auth.currentUser;

if(!user){

rewardRunning=false;

return false;

}

const userRef=doc(
db,
"users",
user.uid
);

const snap=await getDoc(userRef);

if(!snap.exists()){

rewardRunning=false;

return false;

}

const data=snap.data();

// سبق أخذ المكافأة

if(

data.completedLessons &&
data.completedLessons.includes(lessonId)

){

rewardRunning=false;

return false;

}

const oldCoins=data.coins || 0;

const reward=REWARDS.lesson;

const newCoins=oldCoins+reward;

// حفظ البيانات

await updateDoc(userRef,{

coins:increment(reward),

completedLessons:arrayUnion(lessonId),

lastLesson:lessonId

});

// إضافة سجل المكافأة

await addRewardHistory({

title:lessonTitle,

coins:reward,

type:"lesson"

});
 

// عرض المكافأة

await showRewardPopup(

oldCoins,

newCoins,

reward

);

rewardRunning=false;

return true;

}




// ==========================================================
// قراءة عدد العملات
// ==========================================================

export async function getCoins(){

const user=auth.currentUser;

if(!user){

return 0;

}

const userRef=doc(
db,
"users",
user.uid
);

const snap=await getDoc(userRef);

if(!snap.exists()){

return 0;

}

return snap.data().coins || 0;

}




// ==========================================================
// تحميل عدد العملات عند فتح الصفحة
// ==========================================================

export async function loadCoins(){

const coins=await getCoins();

refreshCoinBadge(coins);

}



// ==========================================================
// تشغيل النظام تلقائياً
// ==========================================================

export async function initializeRewards(){

createRewardUI();

await loadCoins();

}



// ==========================================================
// انتظار تسجيل الدخول
// ==========================================================

onAuthStateChanged(auth,async(user)=>{

if(user){

await initializeRewards();

}

});


// ==========================================================
// تشغيل المكافأة مع زر الدرس التالي
// ==========================================================

export async function finishLesson(

lessonId,

lessonTitle,

nextPage

){
 

const success=

await completeLesson(

lessonId,

lessonTitle

);


// سواء حصل على المكافأة أو كان أخذها سابقاً
// ننتظر إغلاق البطاقة ثم ننتقل

if(success){

const btn=

document.getElementById(

"rewardBtn"

);

btn.onclick=function(){

document
.getElementById(
"rewardOverlay"
)
.style.display="none";

window.location.href=

nextPage;

};

}

else{

window.location.href=

nextPage;

}

}


// ==========================================================
// إتاحة الدوال للـ HTML
// ==========================================================

window.finishLesson = finishLesson;




