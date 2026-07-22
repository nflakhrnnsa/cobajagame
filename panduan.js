/*=========================================
        JAGAME - PANDUAN
=========================================*/

const backBtn = document.querySelector(".back-btn");
const playBtn = document.querySelector(".play-btn");

const cards = document.querySelectorAll(".guide-card");

let navigating = false;

/*=========================================
        BUTTON EFFECT
=========================================*/

function pressEffect(button){

    button.style.transform = "scale(.95)";

    setTimeout(()=>{

        button.style.transform = "";

    },120);

}

/*=========================================
        NAVIGATION
=========================================*/

function goTo(page){

    if(navigating) return;

    navigating = true;

    document.body.style.pointerEvents = "none";

    window.location.href = page;

}

/*=========================================
        BACK BUTTON
=========================================*/

backBtn.addEventListener("click",()=>{

    pressEffect(backBtn);

    setTimeout(()=>{

        goTo("index.html");

    },120);

});

/*=========================================
        PLAY BUTTON
=========================================*/

playBtn.addEventListener("click",()=>{

    pressEffect(playBtn);

    setTimeout(()=>{

        goTo("game.html");

    },120);

});

/*=========================================
        INTRO CARD
=========================================*/

window.addEventListener("DOMContentLoaded",()=>{

    cards.forEach((card,index)=>{

        card.style.opacity="0";
        card.style.transform="translateY(35px)";

        setTimeout(()=>{

            card.style.transition="all .45s ease";

            card.style.opacity="1";
            card.style.transform="translateY(0)";

        },index*120);

    });

});

/*=========================================
        SCROLL ANIMATION
=========================================*/

window.addEventListener("DOMContentLoaded",()=>{

    cards.forEach((card,index)=>{

        card.style.opacity = "0";
        card.style.transform = "translateY(35px)";

        setTimeout(()=>{

            card.style.transition = "all .45s ease";

            card.style.opacity = "1";
            card.style.transform = "translateY(0)";

        },index * 180);

    });

});

/*=========================================
        HOVER DESKTOP
=========================================*/

if(window.matchMedia("(hover:hover)").matches){

    [backBtn,playBtn].forEach(btn=>{

        btn.addEventListener("mouseenter",()=>{

            btn.style.transform="translateY(-2px)";

        });

        btn.addEventListener("mouseleave",()=>{

            btn.style.transform="";

        });

    });

}