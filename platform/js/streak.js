// ==========================================================
// 🔥 Engliza Academy Streak System
// الجزء الأول
// ==========================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
getAuth,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
getFirestore,
doc,
getDoc,
updateDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";



// ==========================================================
// Firebase
// ==========================================================

const firebaseConfig={

apiKey:"AIzaSyD-t1qrChOYuMIGO8O3JFVgRZolstvZUrk",

authDomain:"engliza-academy.firebaseapp.com",

projectId:"engliza-academy",

storageBucket:"engliza-academy.firebasestorage.app",

messagingSenderId:"389916153039",

appId:"1:389916153039:web:95b8a3056b1718cfd353ba",

measurementId:"G-7S608ZTN0W"

};

const app=initializeApp(firebaseConfig);

const auth=getAuth(app);

const db=getFirestore(app);



// ==========================================================
// إعدادات الستريك
// ==========================================================

const STREAK_SETTINGS={

rewardEveryDay:true,

allowOneVisitPerDay:true,

maxMissedDays:1

};



// ==========================================================
// الحصول على تاريخ اليوم
// ==========================================================

function getToday(){

const today=new Date();

return today.toISOString().split("T")[0];

}



// ==========================================================
// حساب الفرق بين تاريخين بالأيام
// ==========================================================

function daysBetween(date1,date2){

const oneDay=1000*60*60*24;

const first=new Date(date1);

const second=new Date(date2);

return Math.floor(

(second-first)/oneDay

);

}


// ==========================================================
// قراءة بيانات الستريك
// ==========================================================

export async function getStreak(){

const user=auth.currentUser;

if(!user){

return{

days:0,

lastVisit:null

};

}

const userRef=doc(
db,
"users",
user.uid
);

const snap=await getDoc(userRef);

if(!snap.exists()){

return{

days:0,

lastVisit:null

};

}

const data=snap.data();

return{

days:data.streak || 0,

lastVisit:data.lastVisit || null

};

}



// ==========================================================
// تحديث الستريك
// ==========================================================

export async function updateStreak(){

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

const data=snap.data();

const today=getToday();

const lastVisit=data.lastVisit || null;

let streak=data.streak || 0;



// أول زيارة

if(!lastVisit){

streak=1;

await updateDoc(

userRef,

{

streak:streak,

lastVisit:today

}

);

return streak;

}



// دخل اليوم نفسه

if(lastVisit===today){

return streak;

}



// الفرق بين آخر زيارة واليوم

const diff=

daysBetween(

lastVisit,

today

);



// دخل ثاني يوم

if(diff===1){

streak++;

}



// انقطعت السلسلة

else{

streak=1;

}



// حفظ

await updateDoc(

userRef,

{

streak:streak,

lastVisit:today

}

);

return streak;

}


// ==========================================================
// تحديث عداد الستريك في الواجهة
// ==========================================================

export function refreshStreakCounter(value=null){

const counter=

document.getElementById(

"streakCounter"

);

if(!counter){

return;

}

if(value!==null){

counter.textContent=value;

}

}



// ==========================================================
// تحميل الستريك عند فتح الصفحة
// ==========================================================

export async function loadStreak(){

const data=

await getStreak();

refreshStreakCounter(

data.days

);

return data.days;

}



// ==========================================================
// تهيئة نظام الستريك
// ==========================================================

export async function initializeStreak(){

await loadStreak();

}



// ==========================================================
// تشغيل النظام تلقائياً
// ==========================================================

onAuthStateChanged(

auth,

async(user)=>{

if(!user){

return;

}

await initializeStreak();

});



// ==========================================================
// تسجيل زيارة الطالب
// تستدعى عند دخول الصفحة الرئيسية
// ==========================================================

export async function registerDailyVisit(){

const streak=

await updateStreak();

refreshStreakCounter(

streak

);

return streak;

}


// ==========================================================
// مكافأة الستريك
// ==========================================================

export function shouldRewardStreak(

streakDays

){

const rewards={

7:10,

14:20,

30:50,

100:200

};

return rewards[streakDays] || 0;

}



// ==========================================================
// الحصول على معلومات الستريك
// ==========================================================

export async function getStreakInfo(){

const data=

await getStreak();

return{

days:data.days,

lastVisit:data.lastVisit,

reward:

shouldRewardStreak(

data.days

)

};

}



// ==========================================================
// تحديث عناصر الستريك في الصفحة
// ==========================================================

export async function refreshStreakUI(){

const info=

await getStreakInfo();

refreshStreakCounter(

info.days

);

return info;

}



// ==========================================================
// استدعاء واحد للصفحات
// ==========================================================

export async function initializeStreakSystem(){

await registerDailyVisit();

return await refreshStreakUI();

}
