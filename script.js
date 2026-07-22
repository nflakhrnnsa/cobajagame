import {
    loadPlayer
} from "./firebase-service.js";

const logoArea = document.querySelector(".logo-area");
const startArea = document.querySelector(".start-area");
const menuArea = document.querySelector(".menu-area");
const footer = document.querySelector(".coin-footer");
/*==================================================
                JAGAME
        LANDING PAGE - PART 1
====================================================*/

/*==================================================
                ELEMENT
====================================================*/

const app = document.querySelector(".app");

const startBtn = document.getElementById("startBtn");
const coinBtn = document.getElementById("coinBtn");
const guideBtn = document.getElementById("guideBtn");

const coinValue = document.getElementById("coinValue");

/*==================================================
        STATUS APLIKASI
====================================================*/

let isNavigating = false;


/*==================================================
            NAVIGASI
====================================================*/

function goTo(page){

    if(isNavigating){

        return;

    }

    isNavigating = true;

    window.location.href = page;

}


/*==================================================
            LOAD
====================================================*/

window.addEventListener("DOMContentLoaded", async ()=>{

    resetPage();

    await refreshCoin();

    introAnimation();

});
/*==================================================
        BUTTON ANIMATION
====================================================*/

const buttons = [

    startBtn,

    coinBtn,

    guideBtn

];


/*==================================================
        PRESS EFFECT
====================================================*/

function pressButton(button){

    button.classList.add("button-pressed");

    setTimeout(()=>{

        button.classList.remove("button-pressed");

    },130);

}


/*==================================================
        HOVER EFFECT
====================================================*/

const canHover = window.matchMedia("(hover:hover)").matches;

if(canHover){

    buttons.forEach(button=>{

        button.addEventListener("mouseenter",()=>{

            button.classList.add("button-hover");

        });

        button.addEventListener("mouseleave",()=>{

            button.classList.remove("button-hover");

        });

    });

}


/*==================================================
        PAGE TRANSITION
====================================================*/

function pageTransition(page){

    if(isNavigating){
        return;
    }

    isNavigating = true;

    window.location.href = page;

}
/*=========================================
        RESET PAGE
=========================================*/

function resetPage(){

    app.classList.remove("page-hide");

    isNavigating = false;

}

/*==================================================
        COUNT ANIMATION
====================================================*/

function animateCoin(targetCoin){

    const currentCoin = Number(coinValue.textContent);

    if(currentCoin === targetCoin){

        return;

    }

    let current = currentCoin;

    const step = current < targetCoin ? 1 : -1;

    const timer = setInterval(()=>{

        current += step;

        coinValue.textContent = current;

        if(current === targetCoin){

            clearInterval(timer);

            coinValue.classList.add("coin-pop");

            setTimeout(()=>{

                coinValue.classList.remove("coin-pop");

            },350);

        }

    },20);

}


/*==================================================
        UPDATE DISPLAY
====================================================*/

async function refreshCoin(){

    const player = await loadPlayer();

    animateCoin(player?.coin || 0);

}

/*==================================================
        NAVIGATION BUTTON
====================================================*/

startBtn.addEventListener("click",()=>{

    pressButton(startBtn);

    setTimeout(()=>{

        pageTransition("game.html");

    },120);

});


coinBtn.addEventListener("click",()=>{

    pressButton(coinBtn);

    setTimeout(()=>{

        pageTransition("poin.html");

    },120);

});


guideBtn.addEventListener("click",()=>{

    pressButton(guideBtn);

    setTimeout(()=>{

        pageTransition("panduan.html");

    },120);

});


/*==================================================
        WINDOW FOCUS
====================================================*/

window.addEventListener("focus", async ()=>{

    await refreshCoin();

});


/*==================================================
            INTRO ANIMATION
====================================================*/

function introAnimation(){

    logoArea.classList.add("logo-show");

    setTimeout(()=>{

        startArea.classList.add("start-show");

    },300);

    setTimeout(()=>{

        menuArea.classList.add("menu-show");

    },520);

    setTimeout(()=>{

        footer.classList.add("footer-show");

    },700);

}
window.addEventListener("pageshow", async ()=>{

    resetPage();

    await refreshCoin();

});