// ==========================================================
// 🏆 Engliza Academy Achievement System
// الجزء الأول
// ==========================================================

import {

auth,
db

} from "./firebase.js";

import {

doc,
getDoc,
updateDoc,
arrayUnion

} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";



// ==========================================================
// قائمة الإنجازات
// ==========================================================

export const ACHIEVEMENTS={

FIRST_LESSON:{

id:"first_lesson",

title:"🎉 أول خطوة",

description:"أكملت أول درس.",

reward:10

},

FIVE_LESSONS:{

id:"five_lessons",

title:"📚 بداية قوية",

description:"أكملت 5 دروس.",

reward:20

},

TEN_LESSONS:{

id:"ten_lessons",

title:"🚀 مستمر",

description:"أكملت 10 دروس.",

reward:30

},

FIRST_UNIT:{

id:"first_unit",

title:"🏅 أول وحدة",

description:"أنهيت أول وحدة كاملة.",

reward:50

},

SEVEN_STREAK:{

id:"seven_streak",

title:"🔥 أسبوع متواصل",

description:"حافظت على سلسلة تعلم لمدة 7 أيام.",

reward:25

},

THIRTY_STREAK:{

id:"thirty_streak",

title:"💎 محترف الالتزام",

description:"وصلت إلى 30 يومًا متتاليًا.",

reward:100

}

};



// ==========================================================
// قراءة الإنجازات
// ==========================================================

export async function getAchievements(){

const user=auth.currentUser;

if(!user){

return[];

}

const userRef=doc(
db,
"users",
user.uid
);

const snap=await getDoc(userRef);

if(!snap.exists()){

return[];

}

return snap.data().achievements || [];

}


// ==========================================================
// فتح إنجاز جديد
// ==========================================================

export async function unlockAchievement(

achievement

){

const user=auth.currentUser;

if(!user){

return false;

}

const userRef=doc(
db,
"users",
user.uid
);

const snap=await getDoc(userRef);

if(!snap.exists()){

return false;

}

const data=snap.data();

const achievements=

data.achievements || [];



// سبق فتح الإنجاز

if(

achievements.includes(

achievement.id

)

){

return false;

}



// حفظ الإنجاز

await updateDoc(

userRef,

{

achievements:

arrayUnion(

achievement.id

),

coins:

(data.coins || 0)

+

achievement.reward

}

);

return true;

}



// ==========================================================
// التحقق من وجود إنجاز
// ==========================================================

export async function hasAchievement(

achievementId

){

const achievements=

await getAchievements();

return achievements.includes(

achievementId

);

}



// ==========================================================
// عدد الإنجازات
// ==========================================================

export async function getAchievementsCount(){

const achievements=

await getAchievements();

return achievements.length;

}


// ==========================================================
// إنشاء واجهة الإنجاز
// ==========================================================

export function createAchievementUI(){

if(document.getElementById("achievementOverlay")){

return;

}

const style=document.createElement("style");

style.textContent=`

#achievementOverlay{

position:fixed;

inset:0;

background:rgba(0,0,0,.45);

display:none;

justify-content:center;

align-items:center;

z-index:999999;

backdrop-filter:blur(5px);

}

#achievementCard{

width:370px;

max-width:92%;

background:white;

border-radius:30px;

padding:35px;

text-align:center;

box-shadow:0 30px 80px rgba(0,0,0,.25);

animation:achievementPop .35s;

}

#achievementEmoji{

font-size:70px;

margin-bottom:15px;

}

#achievementTitle{

font-size:30px;

color:#1f3c88;

font-weight:bold;

margin-bottom:14px;

}

#achievementDescription{

font-size:20px;

color:#555;

line-height:1.8;

margin-bottom:22px;

}

#achievementReward{

font-size:32px;

font-weight:bold;

color:#ff9800;

margin-bottom:25px;

}

#achievementBtn{

width:100%;

padding:17px;

border:none;

border-radius:18px;

background:#3768ff;

color:white;

font-size:20px;

font-weight:bold;

cursor:pointer;

}

@keyframes achievementPop{

from{

opacity:0;

transform:scale(.8);

}

to{

opacity:1;

transform:scale(1);

}

}

`;

document.head.appendChild(style);



const overlay=document.createElement("div");

overlay.id="achievementOverlay";

overlay.innerHTML=`

<div id="achievementCard">

<div id="achievementEmoji">

🏆

</div>

<div id="achievementTitle">

إنجاز جديد

</div>

<div id="achievementDescription">

...

</div>

<div id="achievementReward">

+0 🪙

</div>

<button id="achievementBtn">

رائع 🎉

</button>

</div>

`;

document.body.appendChild(overlay);

}



// ==========================================================
// عرض نافذة الإنجاز
// ==========================================================

export function showAchievementPopup(

achievement

){

createAchievementUI();

const overlay=

document.getElementById(

"achievementOverlay"

);

overlay.style.display="flex";

document.getElementById(

"achievementTitle"

).textContent=

achievement.title;

document.getElementById(

"achievementDescription"

).textContent=

achievement.description;

document.getElementById(

"achievementReward"

).textContent=

"+"+

achievement.reward+

" 🪙";

document.getElementById(

"achievementBtn"

).onclick=function(){

overlay.style.display="none";

};

}


// ==========================================================
// التحقق من الإنجازات
// ==========================================================

export async function checkAchievements(){

const user=auth.currentUser;

if(!user){

return;

}

const userRef=doc(
db,
"users",
user.uid
);

const snap=await getDoc(userRef);

if(!snap.exists()){

return;

}

const userData=snap.data();

const completedLessons=

userData.completedLessons
?.length || 0;

const completedUnits=

Object.keys(
userData.unitProgress || {}
).filter(unit=>

(userData.unitProgress[unit].progress || 0)

===100

).length;

const streak=

userData.streak || 0;



// أول درس

if(

completedLessons===1

){

const ok=

await unlockAchievement(

ACHIEVEMENTS.FIRST_LESSON

);

if(ok){

showAchievement(

ACHIEVEMENTS.FIRST_LESSON

);

}

}



// خمسة دروس

if(

completedLessons===5

){

const ok=

await unlockAchievement(

ACHIEVEMENTS.FIVE_LESSONS

);

if(ok){

showAchievement(

ACHIEVEMENTS.FIVE_LESSONS

);

}

}



// عشرة دروس

if(

completedLessons===10

){

const ok=

await unlockAchievement(

ACHIEVEMENTS.TEN_LESSONS

);

if(ok){

showAchievement(

ACHIEVEMENTS.TEN_LESSONS

);

}

}



// أول وحدة

if(

completedUnits===1

){

const ok=

await unlockAchievement(

ACHIEVEMENTS.FIRST_UNIT

);

if(ok){

showAchievement(

ACHIEVEMENTS.FIRST_UNIT

);

}

}



// سبعة أيام

if(

streak===7

){

const ok=

await unlockAchievement(

ACHIEVEMENTS.SEVEN_STREAK

);

if(ok){

showAchievement(

ACHIEVEMENTS.SEVEN_STREAK

);

}

}



// ثلاثون يوماً

if(

streak===30

){

const ok=

await unlockAchievement(

ACHIEVEMENTS.THIRTY_STREAK

);

if(ok){

showAchievement(

ACHIEVEMENTS.THIRTY_STREAK

);

}

}

}


// ==========================================================
// تشغيل النظام
// ==========================================================

export async function initializeAchievements(){

await checkAchievements();

}
