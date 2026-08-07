// ==========================================================
// 🔥 Engliza Academy Firebase
// ==========================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";



// ==========================================================
// Firebase Config
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



// ==========================================================
// Initialize
// ==========================================================

export const app=

initializeApp(firebaseConfig);

export const auth=

getAuth(app);

export const db=

getFirestore(app);
