import {
    loadPlayer,
    saveCoin
} from "./firebase-service.js";

import {
    createVoucher,
    loadMyVouchers
}
from "./voucher-service.js";

/*==================================================
                JAGAME
            TUKAR POIN PAGE
==================================================*/


/*==================================================
                ELEMENT
==================================================*/

const backBtn = document.querySelector(".back-btn");

const coinValue = document.getElementById("coinValue");

const rewardCards = document.querySelectorAll(".reward-card");

const redeemButtons = document.querySelectorAll(".redeem-btn");


const popup = document.getElementById("popup");

const popupTitle = document.getElementById("popupTitle");

const popupText = document.getElementById("popupText");

const cancelBtn = document.getElementById("cancelBtn");

const confirmBtn = document.getElementById("confirmBtn");

const cartItems = document.getElementById("cartItems");

const totalCoin = document.getElementById("totalCoin");

const checkoutBtn = document.getElementById("checkoutBtn");

const voucherList = document.getElementById("voucherList");



/*==================================================
            APP STATUS
==================================================*/

let cart = [];

/*==================================================
            UPDATE DISPLAY
==================================================*/

async function updateCoinDisplay(){

    const player = await loadPlayer();

    coinValue.textContent = player?.coin || 0;

}

/*==================================================
        ANIMATE COIN
==================================================*/

function animateCoin(target){

    let current = Number(

        coinValue.textContent

    );

    if(current === target){

        return;

    }

    const step = current < target ? 1 : -1;

    const timer = setInterval(()=>{

        current += step;

        coinValue.textContent = current;

        if(current === target){

            clearInterval(timer);

            coinValue.classList.add("coin-pop");

            setTimeout(()=>{

                coinValue.classList.remove(

                    "coin-pop"

                );

            },300);

        }

    },15);

}


/*==================================================
        REFRESH COIN
==================================================*/

async function refreshCoin(){

    const player = await loadPlayer();

    animateCoin(player?.coin || 0);

}
/*==================================================
        BUTTON STATUS
==================================================*/

async function updateRewardButton(){

    const player = await loadPlayer();

    const coin = player?.coin || 0;

    const currentCartTotal =
    getCartTotal();

    redeemButtons.forEach(button=>{

        const price =
        Number(button.dataset.price);

        const availableCoin =
        coin - currentCartTotal;

        if(availableCoin >= price){

            button.disabled = false;

            button.textContent = "Tukar";

            button.style.opacity = "1";

            button.style.cursor = "pointer";

        }else{

            button.disabled = true;

            button.textContent = "Kurang";

            button.style.opacity = ".6";

            button.style.cursor = "not-allowed";

        }

    });

}
/*==================================================
            BACK BUTTON
==================================================*/

backBtn.addEventListener("click",()=>{

    history.back();

});


/*==================================================
        CARD HOVER
==================================================*/

rewardCards.forEach(card=>{

    card.addEventListener("mouseenter",()=>{

        card.style.transform="translateY(-4px)";

        card.style.transition=".25s";

        card.style.boxShadow=

        "0 12px 22px rgba(0,0,0,.28)";

    });

    card.addEventListener("mouseleave",()=>{

        card.style.transform="translateY(0)";

        card.style.boxShadow=

        "";

    });

});


/*==================================================
            LOAD
==================================================*/

window.addEventListener(
"DOMContentLoaded",
async ()=>{

    await updateCoinDisplay();

    await updateRewardButton();

    await loadVoucherList();

});

/*==================================================
        PAGE SHOW
==================================================*/

window.addEventListener(
"pageshow",
async ()=>{

    await refreshCoin();

    await updateRewardButton();

});

/*==================================================
        WINDOW FOCUS
==================================================*/

window.addEventListener(
"focus",
async ()=>{

    await refreshCoin();

    await updateRewardButton();

});

/*==================================================
                POPUP
==================================================*/

function showPopup(title,text){

    popupTitle.textContent = title;

    popupText.innerHTML = text;

    popup.classList.add("show");

}


function closePopup(){

    popup.classList.remove("show");

    confirmBtn.style.display = "block";

    cancelBtn.textContent = "Batal";

}


/*==================================================
        OPEN POPUP
==================================================*/

redeemButtons.forEach(button=>{

    button.addEventListener("click",()=>{

         if(button.disabled) return;

    const id = button.dataset.id;

    // cek apakah barang sudah ada di cart
    const exist = cart.find(item => item.id === id);

    if(exist){

        exist.qty++;

    }else{

        cart.push({

            id:id,

            name:button.dataset.name,

            price:Number(button.dataset.price),

            qty:1

        });

    }

    renderCart();

    updateRewardCard();

    updateRewardButton();

});
});


/*==================================================
        CANCEL
==================================================*/

cancelBtn.addEventListener("click",()=>{

    closePopup();

});


/*==================================================
        CONFIRM
==================================================*/

confirmBtn.addEventListener("click", async ()=>{
    const player = await loadPlayer();

let coin = player?.coin || 0;

const totalRedeem =
getCartTotal();

if(coin < totalRedeem){
        popupTitle.textContent =

        "Coin Tidak Cukup";

        popupText.innerHTML =

        `

        Kamu membutuhkan

        <b>${totalRedeem}</b>

        Coin.

        <br><br>

        Ayo kumpulkan coin lagi!

        `;

        confirmBtn.style.display = "none";

        cancelBtn.textContent = "Tutup";

        return;

    }


    coin -= totalRedeem;

await saveCoin(coin);

await refreshCoin();

await updateRewardButton();

processingRedeem();
    const voucher = await createVoucher(

    cart,

    totalRedeem

);
cart = [];

renderCart();

updateRewardCard();

updateRewardButton();

await loadVoucherList();

    popupTitle.textContent =

    "🎉 Penukaran Berhasil";

   popupText.innerHTML =

`

Voucher berhasil dibuat

<br><br>

<h2>

${voucher}

</h2>

<br>

Total Penukaran :

<b>${totalRedeem} Coin</b>

<br><br>

Tunjukkan kode voucher ini
kepada petugas UMKM.

`;

    confirmBtn.style.display = "none";

    cancelBtn.textContent = "Selesai";

});
/*==================================================
            LOADING EFFECT
==================================================*/

function processingRedeem(){

    popupTitle.textContent = "Memproses...";

    popupText.innerHTML = `

        <div class="loading-spinner"></div>

        <br>

        Sedang memproses penukaran...

    `;

}


/*==================================================
        CLICK OUTSIDE POPUP
==================================================*/

popup.addEventListener("click",(e)=>{

    if(e.target === popup){

        closePopup();

    }

});


/*==================================================
        ESC KEY
==================================================*/

document.addEventListener("keydown",(e)=>{

    if(e.key === "Escape"){

        closePopup();

    }

});


/*==================================================
        BUTTON ANIMATION
==================================================*/

redeemButtons.forEach(button=>{

    button.addEventListener("mousedown",()=>{

        button.style.transform="scale(.94)";

    });

    button.addEventListener("mouseup",()=>{

        button.style.transform="scale(1)";

    });

    button.addEventListener("mouseleave",()=>{

        button.style.transform="scale(1)";

    });

});


/*==================================================
        RIPPLE EFFECT
==================================================*/

redeemButtons.forEach(button=>{

    button.addEventListener("click",(e)=>{

        const ripple=document.createElement("span");

        ripple.className="ripple";

        ripple.style.left=e.offsetX+"px";

        ripple.style.top=e.offsetY+"px";

        button.appendChild(ripple);

        setTimeout(()=>{

            ripple.remove();

        },500);

    });

});


/*==================================================
        CARD INTRO
==================================================*/

rewardCards.forEach((card,index)=>{

    card.style.opacity="0";

    card.style.transform="translateY(30px)";

    setTimeout(()=>{

        card.style.transition=".45s";

        card.style.opacity="1";

        card.style.transform="translateY(0)";

    },index*180);

});


/*==================================================
        REFRESH
==================================================*/

window.addEventListener("storage", async ()=>{

    await refreshCoin();

    await updateRewardButton();

});

function getCartTotal(){

    return cart.reduce(

        (total,item)=>

        total + (item.price * item.qty),

        0

    );

}

function renderCart(){

    if(cart.length === 0){

        cartItems.innerHTML = `

            <p class="empty-cart">

                Belum ada hadiah dipilih

            </p>

        `;

        totalCoin.textContent = 0;

        checkoutBtn.disabled = true;

        return;

    }

    let html = "";

    let total = 0;

    cart.forEach(item=>{

        const subtotal =
        item.price * item.qty;

        total += subtotal;

        html += `

        <div class="cart-item">

            <div>

                <strong>

                    ${item.name}

                </strong>

                <br>

                x${item.qty}

            </div>

            <div>

                ${subtotal} Coin

            </div>

        </div>

        `;

    });

    cartItems.innerHTML = html;

    totalCoin.textContent = total;

    checkoutBtn.disabled = false;

}
function updateRewardCard(){

    rewardCards.forEach(card=>{

        const redeemBtn = card.querySelector(".redeem-btn");

        const qtyControl = card.querySelector(".qty-control");

        const qtyText = card.querySelector(".qty");

        const id = redeemBtn.dataset.id;

        const item = cart.find(i=>i.id===id);

        if(item){

            redeemBtn.classList.add("hidden");

            qtyControl.classList.remove("hidden");

            qtyText.textContent = item.qty;

        }else{

            redeemBtn.classList.remove("hidden");

            qtyControl.classList.add("hidden");

        }

    });

}
checkoutBtn.addEventListener(
"click",
async ()=>{

    if(cart.length === 0){

        return;

    }

    showPopup(

        "Konfirmasi Penukaran",

        `

        Total Penukaran

        <br><br>

        <b>

        ${getCartTotal()} Coin

        </b>

        <br><br>

        Lanjutkan?

        `

    );

});
/*==================================================
            PLUS MINUS
==================================================*/

document.addEventListener("click",(e)=>{

    /* PLUS */

    if(e.target.closest(".plus")){

        const card =
        e.target.closest(".reward-card");

        const id =
        card.querySelector(".redeem-btn")
        .dataset.id;

        const item =
        cart.find(i=>i.id===id);

        if(item){

    loadPlayer().then(player=>{

        const coin = player?.coin || 0;

        const currentTotal = getCartTotal();

        if(currentTotal + item.price > coin){

            return;
        }

        item.qty++;

renderCart();

updateRewardCard();

updateRewardButton();

    });

    return;

}


    }

    /* MINUS */

    if(e.target.closest(".minus")){

        const card =
        e.target.closest(".reward-card");

        const id =
        card.querySelector(".redeem-btn")
        .dataset.id;

        const item =
        cart.find(i=>i.id===id);

        if(!item) return;

        item.qty--;

        if(item.qty <= 0){

            cart =
            cart.filter(i=>i.id!==id);

        }

        renderCart();

        updateRewardCard();

        updateRewardButton();

    }

});

async function loadVoucherList(){

    const vouchers =
    await loadMyVouchers();

    if(vouchers.length === 0){

        voucherList.innerHTML = `

            <p class="empty-voucher">

                Belum ada voucher

            </p>

        `;

        return;
    }

    let html = "";

    vouchers.forEach(voucher=>{

    let date = "-";

if(
    voucher.createdAt &&
    typeof voucher.createdAt.toDate === "function"
){

    date = voucher.createdAt
    .toDate()
    .toLocaleString("id-ID",{
        day:"2-digit",
        month:"long",
        year:"numeric",
        hour:"2-digit",
        minute:"2-digit"
    });

}

    const itemList = voucher.items
    ?.map(item => `

        <li>

            ${item.name}
            x${item.qty}

        </li>

    `)
    .join("") || "";

    html += `
        

        <div class="voucher-card">

            <div
                style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                ">

                <strong>

                    ${voucher.code}

                </strong>

                <span class="
                    voucher-status
                    ${voucher.status === "active"
                        ? "status-active"
                        : "status-used"}
                ">

                    ${
                        voucher.status === "active"
                        ? "Aktif"
                        : "Digunakan"
                    }

                </span>

            </div>

            <div class="voucher-code">

    ${voucher.code}

</div>

<div class="voucher-items">

    <strong>

        Hadiah Ditukar

    </strong>

    <ul>

        ${itemList}

    </ul>

</div>

<p>

    Total :
    <b>

        ${voucher.totalCoin}

        Coin

    </b>

</p>
            <p class="voucher-date">

    Dibuat :
    ${date}

</p>

        </div>

        `;

    });

    voucherList.innerHTML =
    html;

}