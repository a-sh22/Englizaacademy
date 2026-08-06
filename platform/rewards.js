import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
getAuth
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
getFirestore,
doc,
getDoc,
updateDoc,
arrayUnion,
increment
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";



// ==========================
// Firebase
// ==========================

const firebaseConfig = {

apiKey: "AIzaSyD-t1qrChOYuMIGO8O3JFVgRZolstvZUrk",

authDomain: "engliza-academy.firebaseapp.com",

projectId: "engliza-academy",

storageBucket: "engliza-academy.firebasestorage.app",

messagingSenderId: "389916153039",

appId: "1:389916153039:web:95b8a3056b1718cfd353ba",

measurementId: "G-7S608ZTN0W"

};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);



// ==========================
// إضافة العملات عند إنهاء درس
// ==========================

export async function completeLesson(lessonId){

const user = auth.currentUser;

if(!user){

console.log("لا يوجد مستخدم مسجل.");

return false;

}

const userRef = doc(
db,
"users",
user.uid
);

const userSnap = await getDoc(userRef);

if(!userSnap.exists()){

console.log("بيانات المستخدم غير موجودة.");

return false;

}

const data = userSnap.data();


// إذا أنهى الدرس سابقًا
if(

data.completedLessons &&
data.completedLessons.includes(lessonId)

){

console.log("المكافأة مستلمة مسبقًا.");

return false;

}


// إضافة العملات لأول مرة

await updateDoc(userRef,{

coins: increment(5),

completedLessons: arrayUnion(lessonId)

});

console.log("تمت إضافة 5 Coins.");

return true;

}



// ==========================
// قراءة عدد العملات الحالي
// ==========================

export async function getCoins(){

const user = auth.currentUser;

if(!user){

return 0;

}

const userRef = doc(
db,
"users",
user.uid
);

const snap = await getDoc(userRef);

if(!snap.exists()){

return 0;

}

const data = snap.data();

return data.coins || 0;

}
