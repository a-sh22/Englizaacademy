// ==========================================================
// 📚 Engliza Academy Progress System
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
// حفظ آخر درس وصل إليه الطالب
// ==========================================================

export async function saveLastLesson(

lessonId,
lessonUrl,
unitId

){

const user=auth.currentUser;

if(!user){

return;

}

const userRef=doc(

db,
"users",
user.uid

);

await updateDoc(

userRef,

{

lastLesson:{

id:lessonId,

unit:unitId,

url:lessonUrl,

updatedAt:Date.now()

}
  
}

);

}



// ==========================================================
// قراءة آخر درس
// ==========================================================

export async function getLastLesson(){

const user=auth.currentUser;

if(!user){

return null;

}

const userRef=doc(

db,
"users",
user.uid

);

const snap=await getDoc(userRef);

if(!snap.exists()){

return null;

}

const data=snap.data();

return data.lastLesson || null;

}



// ==========================================================
// حفظ تقدم الوحدات
// ==========================================================

export async function saveUnitProgress(

unitId,
lessonId,
totalLessons

){

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

const data=snap.data();

const progress=data.unitProgress || {};


// إنشاء الوحدة إذا لم تكن موجودة

if(!progress[unitId]){

progress[unitId]={

completedLessons:[],

lastLesson:null,

totalLessons:totalLessons,

progress:0

};

}



// إضافة الدرس إذا لم يكن مضافًا

if(

!progress[unitId]
.completedLessons
.includes(lessonId)

){

progress[unitId]
.completedLessons
.push(lessonId);

}


// تحديث العدد الكلي

progress[unitId].totalLessons=

totalLessons;


// حساب النسبة

progress[unitId].progress=

Math.round(

(

progress[unitId]
.completedLessons.length

/

totalLessons

)

*100

);


// حفظ البيانات

await updateDoc(

userRef,

{

unitProgress:progress

}

);

}



// ==========================================================
// قراءة تقدم وحدة
// ==========================================================

export async function getUnitProgress(

unitId

){

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

if(

!data.unitProgress ||

!data.unitProgress[unitId]

){

return 0;

}

return data
.unitProgress[unitId]
.progress;

}


// ==========================================================
// قراءة جميع الوحدات
// ==========================================================

export async function getAllUnitsProgress(){

const user=auth.currentUser;

if(!user){

return {};

}

const userRef=doc(
db,
"users",
user.uid
);

const snap=await getDoc(userRef);

if(!snap.exists()){

return {};

}

const data=snap.data();

return data.unitProgress || {};

}



// ==========================================================
// حساب نسبة التقدم الكلية
// ==========================================================

export async function getOverallProgress(){

const units=

await getAllUnitsProgress();

let totalLessons=0;

let completedLessons=0;

for(const unitId in units){

totalLessons+=

units[unitId]
.totalLessons || 0;

completedLessons+=

units[unitId]
.completedLessons.length || 0;

}

if(totalLessons===0){

return 0;

}

return Math.round(

(completedLessons/totalLessons)

*100

);

}



// ==========================================================
// تحديث شريط التقدم (إذا كان موجودًا بالصفحة)
// ==========================================================

export async function refreshProgressBar(){

const percent=

await getOverallProgress();

const bar=

document.getElementById(

"progressBar"

);

const text=

document.getElementById(

"progressText"

);

if(bar){

bar.style.width=

percent+"%";

}

if(text){

text.textContent=

percent+"%";

}

}



// ==========================================================
// تحديث واجهة الصفحة الرئيسية
// ==========================================================

export async function initializeProgress(){

await refreshProgressBar();

}


// ==========================================================
// الذهاب إلى آخر درس
// ==========================================================

export async function continueLearning(){

const lesson=

await getLastLesson();

if(

!lesson ||

!lesson.url

){

return false;

}

window.location.href=

lesson.url;

return true;

}



// ==========================================================
// تحديث زر "أكمل من حيث توقفت"
// ==========================================================

export function setupContinueButton(

buttonId

){

const btn=

document.getElementById(

buttonId

);

if(!btn){

return;

}

btn.onclick=

async function(){

const ok=

await continueLearning();

if(!ok){

alert(

"لم تبدأ أي درس بعد."

);

}

};

}



// ==========================================================
// تشغيل نظام التقدم
// ==========================================================

import {

onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";



onAuthStateChanged(

auth,

async(user)=>{

if(!user){

return;

}

await initializeProgress();

});



// ==========================================================
// دالة واحدة للدروس
// ==========================================================

export async function updateProgress(

lessonId,
lessonUrl,
unitId,
totalLessons

){

await saveLastLesson(

lessonId,
lessonUrl,
unitId

);

await saveUnitProgress(

unitId,
lessonId,
totalLessons

);

await refreshProgressBar();

}
