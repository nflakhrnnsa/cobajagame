import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    setDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/*=====================================
            PLAYER ID
=====================================*/

const PLAYER_KEY = "jagame_player_id";

export function getPlayerId() {

    let id = localStorage.getItem(PLAYER_KEY);

    if (!id) {

        id =
            "PLAYER_" +
            Math.random().toString(36).substring(2,10).toUpperCase();

        localStorage.setItem(
            PLAYER_KEY,
            id
        );

    }

    return id;

}

/*=====================================
        CREATE PLAYER
=====================================*/

export async function createPlayer(){

    const id = getPlayerId();

    const ref = doc(db,"players",id);

    const snapshot = await getDoc(ref);

    if(snapshot.exists()){

        return;

    }

    await setDoc(ref,{

        coin:0,

        progress:[],

        createdAt:Date.now()

    });

}

/*=====================================
        LOAD PLAYER
=====================================*/

export async function loadPlayer(){

    const id = getPlayerId();

    const ref = doc(db,"players",id);

    const snapshot = await getDoc(ref);

    if(!snapshot.exists()){

        return null;

    }

    return snapshot.data();

}

/*=====================================
        SAVE COIN
=====================================*/

export async function saveCoin(coin){

    const id = getPlayerId();

    await updateDoc(

        doc(db,"players",id),

        {

            coin:coin

        }

    );

}

/*=====================================
        SAVE PROGRESS
=====================================*/

export async function saveProgress(progress){

    const id = getPlayerId();

    await updateDoc(

        doc(db,"players",id),

        {

            progress:progress

        }

    );

}
/*=====================================
            LOAD COIN
=====================================*/

export async function loadCoin(){

    const data = await loadPlayer();

    if(!data){

        return 0;

    }

    return data.coin || 0;

}