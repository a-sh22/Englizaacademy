// ==========================================================
// 🪙 Engliza Academy Reward System
// ==========================================================


// ==========================================================
// 🔥 Firebase
// ==========================================================

import {

    auth,
    db

} from "./firebase.js";


import {

    onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


import {

    addRewardHistory

} from "./history.js";


import {

    doc,
    getDoc,
    updateDoc,
    arrayUnion,
    increment

} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";



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



// ==========================================================
// 🔒 يمنع تنفيذ أكثر من مكافأة في نفس الوقت
// ==========================================================

let rewardRunning = false;



// ==========================================================
// 🔊 أصوات العملات
// ==========================================================


// صوت شراء العبارة

const purchaseAudio = new Audio(

    "https://videos.englizaacademy.com/Pre-Intermediate/coin-purchase.wav"

);

purchaseAudio.preload = "auto";

purchaseAudio.volume = .7;



// صوت مكافأة إنهاء الدرس

const rewardAudio = new Audio(

    "https://videos.englizaacademy.com/Pre-Intermediate/coin-reward.wav"

);

rewardAudio.preload = "auto";

rewardAudio.volume = .7;



// ==========================================================
// 🪙 صوت شراء العبارة
// ==========================================================

export function playPurchaseSound(){

    purchaseAudio.currentTime = 0;

    const promise = purchaseAudio.play();

    if(promise){

        promise.catch(error => {

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

    rewardAudio.currentTime = 0;

    const promise = rewardAudio.play();

    if(promise){

        promise.catch(error => {

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

    const audios = [

        purchaseAudio,

        rewardAudio

    ];


    audios.forEach(audio => {

        audio.muted = true;

        audio.currentTime = 0;


        const promise = audio.play();


        if(promise){

            promise.then(() => {

                audio.pause();

                audio.currentTime = 0;

                audio.muted = false;

            }).catch(() => {

                audio.muted = false;

            });

        }

    });

}



// ==========================================================
// 🎨 إنشاء واجهة المكافأة
// مرة واحدة فقط
// ==========================================================

export function createRewardUI(){

    if(document.getElementById("rewardOverlay")){

        return;

    }


    // ======================================================
    // CSS
    // ======================================================

    const style = document.createElement("style");


    style.textContent = `

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

        box-shadow:
        0 30px 80px rgba(0,0,0,.25);

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


    #rewardBtn:disabled{

        opacity:.7;

        cursor:default;

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

            transform:
            translateY(80px)
            scale(.4);

        }

        20%{

            opacity:1;

        }

        100%{

            opacity:0;

            transform:
            translateY(-250px)
            rotate(720deg)
            scale(1.3);

        }

    }

    `;


    document.head.appendChild(style);



    // ======================================================
    // HTML
    // ======================================================

    const overlay = document.createElement("div");

    overlay.id = "rewardOverlay";


    overlay.innerHTML = `

        <div id="rewardCard">

            <div id="rewardTitle">

                🎉 أحسنت!

            </div>


            <div id="rewardCoins">

                +5

            </div>


            <div
                style="
                font-size:18px;
                margin-bottom:15px;
                color:#666;
                "
            >

                رصيدك الحالي:

                <span id="rewardBalance">

                    0

                </span>

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
// 🪙 إنشاء العملات الطائرة
// ==========================================================

function createFlyingCoins(){

    const card =
        document.getElementById("rewardCard");


    if(!card){

        return;

    }


    for(let i = 0; i < 18; i++){

        const coin =
            document.createElement("div");


        coin.className =
            "coinParticle";


        coin.innerHTML = "🪙";


        coin.style.left =
            (Math.random() * 90) + "%";


        coin.style.bottom =
            "15px";


        coin.style.animationDelay =
            (Math.random() * .35) + "s";


        card.appendChild(coin);


        setTimeout(() => {

            coin.remove();

        },1400);

    }

}



// ==========================================================
// 💰 تحريك عداد الرصيد
// ==========================================================

function animateBalance(start,end){

    const balance =
        document.getElementById("rewardBalance");


    if(!balance){

        return Promise.resolve();

    }


    return new Promise(resolve => {

        let current = start;


        const timer = setInterval(() => {

            current++;


            balance.textContent =
                current;


            refreshCoinBadge(current);


            if(current >= end){

                clearInterval(timer);

                resolve();

            }

        },90);

    });

}



// ==========================================================
// 🪙 تحديث عداد العملات في الصفحة
// ==========================================================

export function refreshCoinBadge(value = null){

    const badge =
        document.getElementById("coinCounter");


    if(!badge){

        return;

    }


    if(value !== null){

        badge.textContent =
            value;

    }

}



// ==========================================================
// 🎉 عرض نافذة المكافأة
// ==========================================================
//
// ملاحظة:
// هذه الدالة تعرض المكافأة وتنتظر حتى يضغط الطالب
// زر "متابعة".
// ==========================================================

export async function showRewardPopup(

    oldCoins,

    newCoins,

    reward,

    rewardData

){

    createRewardUI();


    playRewardSound();


    const overlay =
        document.getElementById(
            "rewardOverlay"
        );


    const plus =
        document.getElementById(
            "rewardCoins"
        );


    const balance =
        document.getElementById(
            "rewardBalance"
        );


    const button =
        document.getElementById(
            "rewardBtn"
        );


    const text =
        document.getElementById(
            "rewardText"
        );


    if(

        !overlay ||
        !plus ||
        !balance ||
        !button ||
        !text

    ){

        return;

    }


    overlay.style.display =
        "flex";


    text.innerHTML =

        `لقد حصلت على
        <b>${reward} Coins</b>
        ${rewardData.message}`;


    plus.textContent =
        "+" + reward;


    balance.textContent =
        oldCoins;


    createFlyingCoins();


    // ======================================================
    // منع الضغط أثناء حركة عداد العملات
    // ======================================================

    button.disabled = true;


    await animateBalance(

        oldCoins,

        newCoins

    );


    button.disabled = false;

}



// ==========================================================
// 🪙 إنهاء الدرس وإضافة المكافأة
// ==========================================================

export async function completeLesson(

    lessonId,

    lessonTitle

){

    // ======================================================
    // منع تنفيذ مكافأتين في نفس الوقت
    // ======================================================

    if(rewardRunning){

        return false;

    }


    rewardRunning = true;


    try{


        // ==================================================
        // التحقق من الإنترنت
        // ==================================================

        if(!navigator.onLine){

            alert(
                "⚠️ لا يوجد اتصال بالإنترنت."
            );

            return false;

        }


        // ==================================================
        // المستخدم الحالي
        // ==================================================

        const user =
            auth.currentUser;


        if(!user){

            console.error(
                "Reward error: no authenticated user."
            );

            return false;

        }


        // ==================================================
        // مرجع المستخدم
        // ==================================================

        const userRef = doc(

            db,

            "users",

            user.uid

        );


        // ==================================================
        // قراءة بيانات المستخدم
        // ==================================================

        const snap =
            await getDoc(userRef);


        if(!snap.exists()){

            console.error(
                "Reward error: user document does not exist."
            );

            return false;

        }


        const data =
            snap.data();


        // ==================================================
        // التأكد من أن الطالب لم يحصل على المكافأة سابقًا
        // ==================================================

        if(

            data.completedLessons &&

            data.completedLessons.includes(
                lessonId
            )

        ){

            return false;

        }


        // ==================================================
        // الرصيد الحالي
        // ==================================================

        const oldCoins =
            data.coins || 0;


        // ==================================================
        // بيانات المكافأة
        // ==================================================

        const rewardData =
            REWARDS.lesson;


        const reward =
            rewardData.coins;


        const newCoins =
            oldCoins + reward;



        // ==================================================
        // حفظ المكافأة في Firestore
        // ==================================================

        await updateDoc(

            userRef,

            {

                coins:
                    increment(reward),


                completedLessons:
                    arrayUnion(lessonId),


                lastLesson:
                    lessonId

            }

        );



        // ==================================================
        // تسجيل المكافأة في سجل المكافآت
        // ==================================================

        try{

            await addRewardHistory({

                title:
                    lessonTitle,

                coins:
                    reward,

                type:
                    rewardData.historyType

            });

        }

        catch(historyError){

            console.error(
                "Reward history error:",
                historyError
            );

            // لا نلغي المكافأة الأساسية
            // لأن العملات تم حفظها بالفعل.

        }



        // ==================================================
        // إظهار نافذة المكافأة
        // ==================================================

        await showRewardPopup(

            oldCoins,

            newCoins,

            reward,

            rewardData

        );


        return true;


    }

    catch(error){

        console.error(
            "Complete lesson error:",
            error
        );


        return false;


    }

    finally{

        rewardRunning = false;

    }

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


    rewardRunning = true;


    try{

        if(!navigator.onLine){

            alert(
                "⚠️ لا يوجد اتصال بالإنترنت."
            );

            return false;

        }


        const user =
            auth.currentUser;


        if(!user){

            return false;

        }


        const userRef =
            doc(
                db,
                "users",
                user.uid
            );


        const snap =
            await getDoc(userRef);


        if(!snap.exists()){

            return false;

        }


        const data =
            snap.data();


        if(

            data.completedUnits &&

            data.completedUnits.includes(
                unitId
            )

        ){

            return false;

        }


        const oldCoins =
            data.coins || 0;


        const rewardData =
            REWARDS.unit;


        const reward =
            rewardData.coins;


        const newCoins =
            oldCoins + reward;


        await updateDoc(

            userRef,

            {

                coins:
                    increment(reward),

                completedUnits:
                    arrayUnion(unitId),

                lastUnit:
                    unitId

            }

        );


        try{

            await addRewardHistory({

                title:
                    unitTitle,

                coins:
                    reward,

                type:
                    rewardData.historyType

            });

        }

        catch(error){

            console.error(
                "Unit reward history error:",
                error
            );

        }


        await showRewardPopup(

            oldCoins,

            newCoins,

            reward,

            rewardData

        );


        return true;


    }

    catch(error){

        console.error(
            "Complete unit error:",
            error
        );

        return false;

    }

    finally{

        rewardRunning = false;

    }

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


    rewardRunning = true;


    try{

        if(!navigator.onLine){

            alert(
                "⚠️ لا يوجد اتصال بالإنترنت."
            );

            return false;

        }


        const user =
            auth.currentUser;


        if(!user){

            return false;

        }


        const userRef =
            doc(
                db,
                "users",
                user.uid
            );


        const snap =
            await getDoc(userRef);


        if(!snap.exists()){

            return false;

        }


        const data =
            snap.data();


        if(

            data.completedGames &&

            data.completedGames.includes(
                gameId
            )

        ){

            return false;

        }


        const oldCoins =
            data.coins || 0;


        const rewardData =
            REWARDS.game;


        const reward =
            rewardData.coins;


        const newCoins =
            oldCoins + reward;


        await updateDoc(

            userRef,

            {

                coins:
                    increment(reward),

                completedGames:
                    arrayUnion(gameId),

                lastGame:
                    gameId

            }

        );


        try{

            await addRewardHistory({

                title:
                    gameTitle,

                coins:
                    reward,

                type:
                    rewardData.historyType

            });

        }

        catch(error){

            console.error(
                "Game reward history error:",
                error
            );

        }


        await showRewardPopup(

            oldCoins,

            newCoins,

            reward,

            rewardData

        );


        return true;


    }

    catch(error){

        console.error(
            "Complete game error:",
            error
        );

        return false;

    }

    finally{

        rewardRunning = false;

    }

}



// ==========================================================
// 🔄 إكمال مراجعة الوحدة
// ==========================================================

export async function completeReview(

    reviewId,

    reviewTitle

){

    if(rewardRunning){

        return false;

    }


    rewardRunning = true;


    try{

        if(!navigator.onLine){

            alert(
                "⚠️ لا يوجد اتصال بالإنترنت."
            );

            return false;

        }


        const user =
            auth.currentUser;


        if(!user){

            return false;

        }


        const userRef =
            doc(
                db,
                "users",
                user.uid
            );


        const snap =
            await getDoc(userRef);


        if(!snap.exists()){

            return false;

        }


        const data =
            snap.data();


        if(

            data.completedReviews &&

            data.completedReviews.includes(
                reviewId
            )

        ){

            return false;

        }


        const oldCoins =
            data.coins || 0;


        const rewardData =
            REWARDS.review;


        const reward =
            rewardData.coins;


        const newCoins =
            oldCoins + reward;


        await updateDoc(

            userRef,

            {

                coins:
                    increment(reward),

                completedReviews:
                    arrayUnion(reviewId),

                lastReview:
                    reviewId

            }

        );


        try{

            await addRewardHistory({

                title:
                    reviewTitle,

                coins:
                    reward,

                type:
                    rewardData.historyType

            });

        }

        catch(error){

            console.error(
                "Review reward history error:",
                error
            );

        }


        await showRewardPopup(

            oldCoins,

            newCoins,

            reward,

            rewardData

        );


        return true;


    }

    catch(error){

        console.error(
            "Complete review error:",
            error
        );

        return false;

    }

    finally{

        rewardRunning = false;

    }

}



// ==========================================================
// 💰 قراءة عدد العملات
// ==========================================================

export async function getCoins(){

    const user =
        auth.currentUser;


    if(!user){

        return 0;

    }


    const userRef =
        doc(
            db,
            "users",
            user.uid
        );


    const snap =
        await getDoc(userRef);


    if(!snap.exists()){

        return 0;

    }


    return snap.data().coins || 0;

}



// ==========================================================
// 🔄 تحميل عدد العملات عند فتح الصفحة
// ==========================================================

export async function loadCoins(){

    const coins =
        await getCoins();


    refreshCoinBadge(
        coins
    );

}



// ==========================================================
// ⚙️ تشغيل النظام تلقائيًا
// ==========================================================

export async function initializeRewards(){

    createRewardUI();

    await loadCoins();

}



// ==========================================================
// 👤 انتظار تسجيل الدخول
// ==========================================================

onAuthStateChanged(

    auth,

    async(user) => {

        if(user){

            await initializeRewards();

        }

    }

);



// ==========================================================
// 🚀 تشغيل مكافأة الدرس مع زر الانتقال
// ==========================================================

export async function finishLesson(

    lessonId,

    lessonTitle,

    nextPage

){

    // ======================================================
    // 🔊 تفعيل الصوت من ضغطة المستخدم
    // ======================================================

    unlockCoinSound();


    try{


        // ==================================================
        // إضافة المكافأة
        // ==================================================

        const success =

            await completeLesson(

                lessonId,

                lessonTitle

            );



        // ==================================================
        // إذا حصل الطالب على المكافأة
        // ==================================================

        if(success){

            const overlay =
                document.getElementById(
                    "rewardOverlay"
                );


            const btn =
                document.getElementById(
                    "rewardBtn"
                );


            if(!overlay || !btn){

                console.error(
                    "Reward UI was not created."
                );

                return;

            }


            // ==================================================
            // زر المتابعة
            // ==================================================

            btn.onclick = function(){

                overlay.style.display =
                    "none";


                window.location.href =
                    nextPage;

            };


            return;

        }



        // ==================================================
        // إذا كان الطالب أخذ المكافأة سابقًا
        // أو لم يتمكن النظام من إعطائها
        // ==================================================

        window.location.href =
            nextPage;


    }

    catch(error){

        console.error(
            "Finish lesson error:",
            error
        );


        // ==================================================
        // في حالة خطأ حقيقي:
        // لا نخلي الصفحة معلقة
        // ==================================================

        window.location.href =
            nextPage;

    }

}



// ==========================================================
// 🔄 تشغيل مكافأة المراجعة مع زر الانتقال
// ==========================================================

export async function finishReview(

    reviewId,

    reviewTitle,

    nextPage

){

    unlockCoinSound();


    try{

        const success =

            await completeReview(

                reviewId,

                reviewTitle

            );


        if(success){

            const overlay =
                document.getElementById(
                    "rewardOverlay"
                );


            const btn =
                document.getElementById(
                    "rewardBtn"
                );


            if(!overlay || !btn){

                console.error(
                    "Reward UI was not created."
                );

                return;

            }


            btn.onclick = function(){

                overlay.style.display =
                    "none";


                window.location.href =
                    nextPage;

            };


            return;

        }


        window.location.href =
            nextPage;


    }

    catch(error){

        console.error(
            "Finish review error:",
            error
        );


        window.location.href =
            nextPage;

    }

}



// ==========================================================
// 🌐 إتاحة الدوال للـ HTML
// ==========================================================

window.finishLesson =
    finishLesson;


window.finishReview =
    finishReview;
