import { db } from "./firebase.js";

import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    query,
    where,
    serverTimestamp
}
from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import {
    getPlayerId
}
from "./firebase-service.js";


/*=====================================
        GENERATE CODE
=====================================*/

function generateVoucherCode(){

    return "JGM-" +

    Math.random()
    .toString(36)
    .substring(2,8)
    .toUpperCase();

}


/*=====================================
        CREATE VOUCHER
=====================================*/

export async function createVoucher(items,totalCoin){

    const playerId =
    getPlayerId();

    const voucherCode =
    generateVoucherCode();

    const voucherRef =
    doc(
        db,
        "vouchers",
        voucherCode
    );

    console.log(
    "Timestamp:",
    serverTimestamp()
);

    await setDoc(voucherRef,{

        code:voucherCode,

        playerId:playerId,

        items:items,

        totalCoin:totalCoin,

        status:"active",

        createdAt:serverTimestamp()

    });

    return voucherCode;

}


/*=====================================
        LOAD MY VOUCHERS
=====================================*/

export async function loadMyVouchers(){

    const playerId =
    getPlayerId();

    const q = query(

        collection(
            db,
            "vouchers"
        ),

        where(
            "playerId",
            "==",
            playerId
        )

    );

    const snapshot =
    await getDocs(q);

    let vouchers = [];

    snapshot.forEach(doc=>{

        vouchers.push(

            doc.data()

        );

    });

    vouchers.sort((a,b)=>{

    const timeA =
    a.createdAt?.seconds || 0;

    const timeB =
    b.createdAt?.seconds || 0;

    return timeB - timeA;

});

    return vouchers;

}


/*=====================================
        LOAD SINGLE VOUCHER
=====================================*/

export async function loadVoucher(code){

    const snapshot =
    await getDoc(

        doc(
            db,
            "vouchers",
            code
        )

    );

    if(!snapshot.exists()){

        return null;

    }

    return snapshot.data();

}


/*=====================================
        UPDATE STATUS
=====================================*/

export async function updateVoucherStatus(

    code,
    status

){

    await updateDoc(

        doc(
            db,
            "vouchers",
            code
        ),

        {

            status:status

        }

    );

}
/*=====================================
        LOAD ALL VOUCHERS
=====================================*/

export async function loadAllVouchers(){

    const snapshot = await getDocs(
        collection(db,"vouchers")
    );

    let vouchers = [];

    snapshot.forEach(doc=>{

        vouchers.push(
            doc.data()
        );

    });

    vouchers.sort(

        (a,b)=>
        b.createdAt - a.createdAt

    );

    return vouchers;

}