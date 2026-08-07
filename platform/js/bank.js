// ==========================================================
// 🏦 Engliza Academy Rewards Bank
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
// أنواع المكافآت
// ==========================================================

export const BANK_REWARDS={

EXPRESSION:{

id:"expression",

title:"🗣️ عبارة جديدة",

type:"expression"

},

WORD:{

id:"word",

title:"📖 كلمة جديدة",

type:"word"

},

LESSON:{

id:"lesson",

title:"📚 درس إضافي",

type:"lesson"

},

VIDEO:{

id:"video",

title:"🎬 فيديو حصري",

type:"video"

},

CERTIFICATE:{

id:"certificate",

title:"🏅 شهادة",

type:"certificate"

}

};



// ==========================================================
// قراءة البنك
// ==========================================================

export async function getBank(){

const user=auth.currentUser;

if(!user){

return{

expressions:[],

words:[],

videos:[],

lessons:[],

certificates:[]

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

expressions:[],

words:[],

videos:[],

lessons:[],

certificates:[]

};

}

const data=snap.data();

return{

expressions:

data.bankExpressions || [],

words:

data.bankWords || [],

videos:

data.bankVideos || [],

lessons:

data.bankLessons || [],

certificates:

data.bankCertificates || []

};

}


// ==========================================================
// إضافة عبارة إلى البنك
// ==========================================================

export async function unlockExpression(

expression

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

const expressions=

data.bankExpressions || [];



if(

expressions.includes(expression)

){

return false;

}



await updateDoc(

userRef,

{

bankExpressions:

arrayUnion(

expression

)

}

);

return true;

}



// ==========================================================
// إضافة كلمة إلى البنك
// ==========================================================

export async function unlockWord(

word

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

const words=

data.bankWords || [];



if(

words.includes(word)

){

return false;

}



await updateDoc(

userRef,

{

bankWords:

arrayUnion(

word

)

}

);

return true;

}



// ==========================================================
// إضافة فيديو حصري
// ==========================================================

export async function unlockVideo(

videoId

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

const videos=

data.bankVideos || [];



if(

videos.includes(videoId)

){

return false;

}



await updateDoc(

userRef,

{

bankVideos:

arrayUnion(

videoId)

}

);

return true;

}


// ==========================================================
// عدد عناصر البنك
// ==========================================================

export async function getBankStats(){

const bank=

await getBank();

return{

expressions:

bank.expressions.length,

words:

bank.words.length,

videos:

bank.videos.length,

lessons:

bank.lessons.length,

certificates:

bank.certificates.length

};

}



// ==========================================================
// التحقق من امتلاك عنصر
// ==========================================================

export async function hasBankItem(

type,
id

){

const bank=

await getBank();

switch(type){

case"expression":

return bank.expressions.includes(id);

case"word":

return bank.words.includes(id);

case"video":

return bank.videos.includes(id);

case"lesson":

return bank.lessons.includes(id);

case"certificate":

return bank.certificates.includes(id);

default:

return false;

}

}



// ==========================================================
// تحديث واجهة البنك
// ==========================================================

export async function refreshBankUI(){

return await getBankStats();

}



// ==========================================================
// تشغيل نظام البنك
// ==========================================================

export async function initializeBank(){

return await refreshBankUI();

}



