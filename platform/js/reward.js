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

// ==========================================================
// 🪙 أنواع المكافآت
// ==========================================================

export const REWARDS = {

    lesson: {
        coins: 5,
        title: "إنهاء الدرس",
        message: "كمكافأة لإنهاء الدرس.",
        historyType: "lesson"
    },

    unit: {
        coins: 15,
        title: "إكمال الوحدة",
        message: "كمكافأة لإكمال الوحدة كاملة.",
        historyType: "unit"
    },

    review: {
        coins: 5,
        title: "مراجعة الوحدة",
        message: "كمكافأة لإكمال مراجعة الوحدة.",
        historyType: "review"
    },

    daily: {
        coins: 10,
        title: "المكافأة اليومية",
        message: "كمكافأة لإكمال المهمة اليومية.",
        historyType: "daily"
    },

    game: {
        coins: 3,
        title: "اللعبة",
        message: "كمكافأة لإكمال اللعبة.",
        historyType: "game"
    }

};


// يمنع الضغط أكثر من مرة
let rewardRunning=false;




// ==========================================================
// 📌 أنواع المكافآت الموجودة في النظام
//
// lesson → إنهاء درس = 5 Coins
// unit   → إكمال وحدة كاملة = 15 Coins
// review → مراجعة وحدة = 15 Coins
// daily  → المكافأة اليومية = 10 Coins
// game   → إكمال لعبة = 3 Coins
// ==========================================================





// ==========================================================
// 🔊 نظام أصوات العملات
// ==========================================================

// صوت شراء العبارة
const purchaseAudio = new Audio(
"https://videos.englizaacademy.com/Pre-Intermediate/coin-purchase.wav"
);

purchaseAudio.preload="auto";
purchaseAudio.volume=.7;


// صوت مكافأة إنهاء الدرس
const rewardAudio = new Audio(
"https://videos.englizaacademy.com/Pre-Intermediate/coin-reward.wav"
);

rewardAudio.preload="auto";
rewardAudio.volume=.7;


// ==========================================================
// 🪙 صوت شراء العبارة
// ==========================================================

export function playPurchaseSound(){

purchaseAudio.currentTime=0;

const promise=purchaseAudio.play();

if(promise){

promise.catch(error=>{

console.log(
"Purchase sound could not play:",
error
);

});

}

}


// ==========================================================
// 🎉 صوت مكافأة إنهاء الدرس
// ==========================================================

export function playRewardSound(){

rewardAudio.currentTime=0;

const promise=rewardAudio.play();

if(promise){

promise.catch(error=>{

console.log(
"Reward sound could not play:",
error
);

});

}

}



// ==========================================================
// 🔓 تهيئة أصوات العملات بعد ضغطة المستخدم
// ==========================================================

export function unlockCoinSound(){

const audios=[
purchaseAudio,
rewardAudio
];

audios.forEach(audio=>{

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

});

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

export async function showRewardPopup(
oldCoins,
newCoins,
reward,
rewardData
){

createRewardUI();

playRewardSound();

const overlay=document.getElementById("rewardOverlay");

const plus=document.getElementById("rewardCoins");

const balance=document.getElementById("rewardBalance");

const button=document.getElementById("rewardBtn");

overlay.style.display="flex";


 document.getElementById("rewardText").innerHTML =
`لقد حصلت على <b>${reward} Coins</b> ${rewardData.message}`;
 

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

const rewardData = REWARDS.lesson;

const reward = rewardData.coins;

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

type:rewardData.historyType

});
 

// عرض المكافأة

await showRewardPopup(

oldCoins,

newCoins,

reward,

rewardData

);

rewardRunning=false;

return true;

}



// ==========================================================
// 🏆 إكمال الوحدة وإضافة مكافأة الوحدة
// ==========================================================

export async function completeUnit(

unitId,

unitTitle

){

if(rewardRunning){

return false;

}

rewardRunning=true;


// التأكد من الاتصال

if(!navigator.onLine){

alert("⚠️ لا يوجد اتصال بالإنترنت.");

rewardRunning=false;

return false;

}


// المستخدم

const user=auth.currentUser;

if(!user){

rewardRunning=false;

return false;

}


// مرجع المستخدم

const userRef=doc(
db,
"users",
user.uid
);


// قراءة البيانات

const snap=await getDoc(userRef);

if(!snap.exists()){

rewardRunning=false;

return false;

}


const data=snap.data();


// سبق إكمال الوحدة

if(

data.completedUnits &&
data.completedUnits.includes(unitId)

){

rewardRunning=false;

return false;

}


// الرصيد الحالي

const oldCoins=data.coins || 0;


// مكافأة الوحدة

const rewardData = REWARDS.unit;

const reward = rewardData.coins;


// الرصيد الجديد

const newCoins=
oldCoins+reward;


// حفظ البيانات

await updateDoc(userRef,{

coins:increment(reward),

completedUnits:arrayUnion(unitId),

lastUnit:unitId

});


// إضافة سجل المكافأة

await addRewardHistory({

title:unitTitle,

coins:reward,

type:rewardData.historyType

});


// عرض نافذة المكافأة

await showRewardPopup(

oldCoins,

newCoins,

reward,

rewardData

);


rewardRunning=false;

return true;

}





// ==========================================================
// 🎮 إكمال اللعبة وإضافة مكافأة اللعبة
// ==========================================================

export async function completeGame(

gameId,

gameTitle

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

if(

data.completedGames &&
data.completedGames.includes(gameId)

){

rewardRunning=false;

return false;

}

const oldCoins=data.coins || 0;

const rewardData=REWARDS.game;

const reward=rewardData.coins;

const newCoins=
oldCoins+reward;

await updateDoc(userRef,{

coins:increment(reward),

completedGames:arrayUnion(gameId),

lastGame:gameId

});

await addRewardHistory({

title:gameTitle,

coins:reward,

type:rewardData.historyType

});

await showRewardPopup(

oldCoins,

newCoins,

reward,

rewardData

);

rewardRunning=false;

return true;

}




// ==========================================================
// 🔄 إكمال مراجعة الوحدة وإضافة مكافأة المراجعة
// ==========================================================

export async function completeReview(

reviewId,

reviewTitle

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

if(

data.completedReviews &&
data.completedReviews.includes(reviewId)

){

rewardRunning=false;

return false;

}

const oldCoins=data.coins || 0;

const rewardData=REWARDS.review;

const reward=rewardData.coins;

const newCoins=
oldCoins+reward;

await updateDoc(userRef,{

coins:increment(reward),

completedReviews:arrayUnion(reviewId),

lastReview:reviewId

});

await addRewardHistory({

title:reviewTitle,

coins:reward,

type:rewardData.historyType

});

await showRewardPopup(

oldCoins,

newCoins,

reward,

rewardData

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


unlockCoinSound(); 
 

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




