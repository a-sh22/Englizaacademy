// ==========================================================
// 📜 Engliza Academy Reward History
// ==========================================================

import {

auth,
db

} from "./firebase.js";

import {

doc,
getDoc,
updateDoc,
arrayUnion,
Timestamp

} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";



// ==========================================================
// إضافة سجل جديد
// ==========================================================

export async function addRewardHistory({

title,

coins,

type

}){

const user=auth.currentUser;

if(!user){

return false;

}

const userRef=

doc(

db,

"users",

user.uid

);

const reward={

title,

coins,

type,

createdAt:

Timestamp.now()

};

await updateDoc(

userRef,

{

rewardHistory:

arrayUnion(

reward

)

}

);

return true;

}



// ==========================================================
// قراءة السجل
// ==========================================================


export async function getRewardHistory(){

const user=auth.currentUser;

if(!user){

return[];

}

const userRef=

doc(

db,

"users",

user.uid

);

const snap=

await getDoc(

userRef

);

if(!snap.exists()){

return[];

}

const data=

snap.data();

const history=

data.rewardHistory || [];

history.sort(

(a,b)=>{

const aTime=

a.createdAt?.seconds || 0;

const bTime=

b.createdAt?.seconds || 0;

return bTime-aTime;

}

);

return history;

}



// ==========================================================
// تحويل التاريخ
// ==========================================================

export function formatRewardDate(

timestamp

){

if(!timestamp){

return"";

}

const date=

timestamp.toDate();

const now=

new Date();

const diff=

Math.floor(

(now-date)/86400000

);



if(diff===0){

return"اليوم";

}

if(diff===1){

return"أمس";

}

if(diff<7){

return`قبل ${diff} أيام`;

}

if(diff<30){

return`قبل ${Math.floor(diff/7)} أسبوع`;

}

if(diff<365){

return`قبل ${Math.floor(diff/30)} شهر`;

}

return`قبل ${Math.floor(diff/365)} سنة`;

}



// ==========================================================
// عدد السجلات
// ==========================================================

export async function getRewardHistoryCount(){

const history=

await getRewardHistory();

return history.length;

}
