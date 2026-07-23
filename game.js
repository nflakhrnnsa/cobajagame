import {
    createPlayer,
    saveCoin,
    saveProgress,
    loadPlayer
} from "./firebase-service.js";

/*==========================================================
                    JAGAME GAME
                PART 1 - FOUNDATION
==========================================================*/


/*==========================================================
                    CONFIG
==========================================================*/
const ORS_API_KEY = "5b3ce3597851110001cf6248716c435cf01a47c58dec7afa9a54ab6b";

const CONFIG = {

    TOTAL_LOCATION: 25,

    MISSION_RADIUS: 20,

    MAP_ZOOM: 18,

    FOLLOW_ZOOM: 19,

    REWARD_COIN: 20

};



/*==========================================================
                    ELEMENT
==========================================================*/

const mapElement = document.getElementById("map");

const gpsBtn = document.getElementById("gpsBtn");

const compassBtn = document.getElementById("compassBtn");

const backBtn = document.querySelector(".back-btn");

const zoomInBtn = document.getElementById("zoomInBtn");

const zoomOutBtn = document.getElementById("zoomOutBtn");

const progressText = document.getElementById("progressText");

const coinValue = document.getElementById("coinValue");

const welcomePanel = document.getElementById("welcomePanel");

const missionPanel = document.getElementById("missionPanel");

const quizPanel = document.getElementById("quizPanel");

const placeName = document.getElementById("placeName");

const distanceText = document.getElementById("distance");

const rewardCoin = document.getElementById("rewardCoin");

const startMissionBtn = document.getElementById("startMission");

const questionText = document.getElementById("question");

const submitAnswerBtn = document.getElementById("submitAnswer");

const answerButtons = document.querySelectorAll(".answer");

const rewardPopup = document.getElementById("rewardPopup");

const closePopup = document.getElementById("closePopup");

const achievement = document.getElementById("achievement");

const chestReward = document.getElementById("chestReward");

const estimateTime = document.getElementById("estimateTime");

const categoryText = document.getElementById("categoryText");

const statusText = document.getElementById("statusText");



/*==========================================================
                    APP STATE
==========================================================*/

const APP = {

    map: null,

    geojson: null,

    markerLayer: null,

    userMarker: null,

    accuracyCircle: null,

    routingControl: null,

    isRouting:false,

    userLocation: null,

    watchID: null,

    nearestFeature: null,

    currentMission: null,

    selectedAnswer: null,
    
    targetFeature : null,

    completedMission: new Set(),

    followUser: false,

    heading:0,

    compassEnabled:false,

    lastLocation:null,

    lastZoom:18,

    coin:0


};


/*==========================================================
                    PANEL
==========================================================*/

function hideAllPanel() {

    welcomePanel.classList.remove("active");

    missionPanel.classList.remove("active");

    quizPanel.classList.remove("active");

}



function showPanel(panel) {

    hideAllPanel();

    panel.classList.add("active");

}



/*==========================================================
                    MAP
==========================================================*/

function initializeMap() {

    APP.map = L.map("map", {

        zoomControl: false,

        attributionControl: false

    });

    APP.map.setView(
    [-7.829739651203769, 110.39716911782743],
    16
);

    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            maxZoom: 20

        }

    ).addTo(APP.map);

}



/*==========================================================
                    USER ICON
==========================================================*/

const USER_ICON = L.divIcon({

    className: "",

    html: `<div class="user-marker"></div>`,

    iconSize: [20,20],

    iconAnchor: [10,10]

});



/*==========================================================
                    BUTTON
==========================================================*/

gpsBtn.addEventListener("click", () => {

    APP.followUser = true;

});



zoomInBtn.addEventListener("click", () => {

    APP.map.zoomIn();

});



zoomOutBtn.addEventListener("click", () => {

    APP.map.zoomOut();

});


/*==========================================================
                    INIT
==========================================================*/

window.addEventListener(

    "DOMContentLoaded",

    async ()=>{

        // Buat player jika belum ada
        await createPlayer();

        const player = await loadPlayer();

        APP.coin = player?.coin || 0;

        APP.completedMission = new Set(player?.progress || []);

        // Map
        initializeMap();
        loadGeoJSON();

        APP.map.on(

            "dragstart",

            ()=>{

                APP.followUser = false;

            }

        );

        // UI
        refreshCoin();
    
        updateProgress();
        showPanel(welcomePanel);

        APP.currentMission = null;
        APP.selectedAnswer = null;

        // GPS
        startGPS();
       

    }

);
/*==========================================================
                PART 2 - GEOJSON & MARKER
==========================================================*/


/*==========================================================
                    MARKER ICON
==========================================================*/

const MARKER_ICON = {

    heritage: L.icon({

        iconUrl: "assets/heritage.png",

        iconSize: [40,40],

        iconAnchor: [20,40],

        popupAnchor: [0,-35]

    }),

    religi: L.icon({

        iconUrl: "assets/religi.png",

        iconSize: [40,40],

        iconAnchor: [20,40],

        popupAnchor: [0,-35]

    }),

    kuliner: L.icon({

        iconUrl: "assets/kuliner.png",

        iconSize: [40,40],

        iconAnchor: [20,40],

        popupAnchor: [0,-35]

    })

};



/*==========================================================
                    GET ICON
==========================================================*/

function getMarkerIcon(category){

    return MARKER_ICON[category] || MARKER_ICON.heritage;

}



/*==========================================================
                    LOAD GEOJSON
==========================================================*/

async function loadGeoJSON(){

    try{

        const response = await fetch("data/wisata.geojson");

        APP.geojson = await response.json();

        createMarkers();

        restoreCompletedMarkers();

    }

    catch(error){

        console.error(error);

        alert("Gagal memuat wisata.geojson");

    }

}

/*==========================================================
                    CREATE MARKERS
==========================================================*/

function createMarkers(){

    APP.markerLayer = L.layerGroup().addTo(APP.map);

    APP.geojson.features.forEach(feature=>{

        const coordinate = feature.geometry.coordinates;

        const lat = coordinate[1];

        const lng = coordinate[0];

        const marker = L.marker(

            [lat,lng],

            {

                icon:getMarkerIcon(

                    feature.properties.kategori

                )

            }

        );

        marker.feature = feature;

        marker.addTo(APP.markerLayer);

        marker.on(

    "click",

    ()=>{

        const id =

            marker.feature.properties.id;

        // Kalau sudah selesai, jangan bisa diklik lagi
        if(

            APP.completedMission.has(id)

        ){

            return;

        }

        APP.targetFeature =

            marker.feature;

        markerClicked(marker);


    }

);

});


// Restore marker yang sudah selesai
restoreCompletedMarkers();

}


/*==========================================================
                    MARKER CLICK
==========================================================*/

function markerClicked(marker){

    const p = marker.feature.properties;

    // Cek apakah lokasi sudah selesai
    if(

        isMissionCompleted(

            p.id

        )

    ){

        alert(

            "Lokasi ini sudah pernah diselesaikan."

        );

        return;

    }

    const destination = marker.getLatLng();

    APP.map.flyTo(

        destination,

        19,

        {

            duration:1

        }

    );

    showRoute(

        destination

    );

    L.popup({

        offset:[0,-25]

    })

    .setLatLng(

        destination

    )

    .setContent(

        `

        <div style="text-align:center">

            <h3>${p.nama}</h3>

            <p>${p.kategori}</p>

            <b>Reward ${p.reward} Coin</b>

        </div>

        `

    )

    .openOn(APP.map);

}

/*==========================================================
                PART 3 - GPS & USER LOCATION
==========================================================*/


/*==========================================================
                    START GPS
==========================================================*/

function startGPS(){

    if(!navigator.geolocation){

        alert("Browser tidak mendukung GPS.");

        return;

    }

    APP.watchID = navigator.geolocation.watchPosition(

        updateUserLocation,

        gpsError,

        {

            enableHighAccuracy:true,

            timeout:10000,

            maximumAge:0

        }

    );

}



/*==========================================================
                    UPDATE USER LOCATION
==========================================================*/

function updateUserLocation(position){

    const lat = position.coords.latitude;

    const lng = position.coords.longitude;

    const accuracy = position.coords.accuracy;

    APP.userLocation = {

        lat,

        lng,

        accuracy

    };


    if(APP.userMarker==null){

        APP.userMarker = L.marker(

            [lat,lng],

            {

                icon:USER_ICON

            }

        ).addTo(APP.map);

    }

    else{

        APP.userMarker.setLatLng(

            [lat,lng]

        );

    }



    if(APP.accuracyCircle==null){

        APP.accuracyCircle = L.circle(

            [lat,lng],

            {

                radius:accuracy,

                color:"#2b79d1",

                fillColor:"#2b79d1",

                fillOpacity:0.15,

                weight:2

            }

        ).addTo(APP.map);

    }

    else{

        APP.accuracyCircle.setLatLng(

            [lat,lng]

        );

        APP.accuracyCircle.setRadius(

            accuracy

        );

    }


    if(APP.followUser){

        APP.map.flyTo(

            [lat,lng],

            CONFIG.FOLLOW_ZOOM,

            {

                animate:true,

                duration:0.8

            }

        );
     }
      // Update rute jika sedang bernavigasi
        if(APP.targetFeature){

    showRoute(
        L.latLng(
            APP.targetFeature.geometry.coordinates[1],
            APP.targetFeature.geometry.coordinates[0]
        )
    );

}

     // Update gameplay
    findNearestMarker();

    updateDistanceDisplay();

    checkMissionRadius();

    updateMarkerEffect();

if(

    APP.compassEnabled

){

    mapElement.style.transform =

        `rotate(${-APP.heading}deg)`;

}

else{

    mapElement.style.transform =

        "rotate(0deg)";

}
}



/*==========================================================
                    GPS ERROR
==========================================================*/

function gpsError(error){

    console.error(error);

    alert("GPS tidak dapat diakses.");

}


/*==========================================================
                    GPS BUTTON
==========================================================*/

gpsBtn.addEventListener(

    "click",

    ()=>{

        APP.followUser = true;

        if(APP.userLocation){

            APP.map.flyTo(

                [

                    APP.userLocation.lat,

                    APP.userLocation.lng

                ],

                CONFIG.FOLLOW_ZOOM,

                {

                    animate:true,

                    duration:0.8

                }

            );

        }

    }

);

/*==========================================================
                    BACK BUTTON
==========================================================*/

backBtn.addEventListener(

    "click",

    ()=>{

        const confirmLeave = confirm(

            "Keluar dari permainan?\nProgress kamu sudah tersimpan."

        );

        if(

            confirmLeave

        ){

            window.location.href =

                "index.html";

        }

    }

);
/*==========================================================
                PART 4 - MISSION DETECTION
==========================================================*/


/*==========================================================
                FIND NEAREST MARKER
==========================================================*/

function findNearestMarker(){

    if(!APP.userLocation) return;

    if(!APP.markerLayer) return;

    let nearest = null;

    let nearestDistance = Infinity;

    APP.markerLayer.eachLayer(marker=>{

        const distance = APP.map.distance(

            [

                APP.userLocation.lat,

                APP.userLocation.lng

            ],

            marker.getLatLng()

        );

        if(distance < nearestDistance){

            nearestDistance = distance;

            nearest = {

                marker,

                feature:marker.feature,

                distance

            };

        }

    });

    APP.nearestFeature = nearest;

}


/*==========================================================
                CHECK MISSION RADIUS
==========================================================*/

/*==========================================================
                CHECK MISSION RADIUS
==========================================================*/

function checkMissionRadius(){

    if(

        !APP.userLocation ||

        !APP.geojson

    ){

        return;

    }

    APP.geojson.features.forEach(feature=>{

        const data = feature.properties;

        // Skip kalau sudah selesai
        if(

            isMissionCompleted(data.id)

        ){

            return;

        }

        const lat = feature.geometry.coordinates[1];

        const lng = feature.geometry.coordinates[0];

        const distance = APP.map.distance(

            [

                APP.userLocation.lat,

                APP.userLocation.lng

            ],

            [

                lat,

                lng

            ]

        );

        if(

            distance <= CONFIG.MISSION_RADIUS

        ){

            APP.targetFeature = feature;

            activateMission(feature);

        }

    });

}
/*==========================================================
            GET DISTANCE TO FEATURE
==========================================================*/

function getDistanceToFeature(feature){

    if(

        !APP.userLocation ||

        !APP.map

    ){

        return 0;

    }

    return APP.map.distance(

        [

            APP.userLocation.lat,

            APP.userLocation.lng

        ],

        [

            feature.geometry.coordinates[1],

            feature.geometry.coordinates[0]

        ]

    );

}

/*==========================================================
                ACTIVATE MISSION
==========================================================*/

function activateMission(feature){

    // Jangan buka panel lagi kalau misi yang sama sudah aktif
    if(

        APP.currentMission &&

        APP.currentMission.properties.id ===

        feature.properties.id

    ){

        return;

    }

    const p = feature.properties;

    APP.currentMission = feature;

    // Nama lokasi
    placeName.textContent =

        p.nama;

    // Kategori
    categoryText.textContent =

        p.kategori;

    // Jarak awal
    distanceText.textContent =

        Math.round(

            getDistanceToFeature(feature)

        );

    // Kalau misi sudah selesai
    if(

        isMissionCompleted(

            p.id

        )

    ){

        rewardCoin.textContent =

            "✔ Sudah diselesaikan";

        statusText.textContent =

            "✔ Sudah selesai";

        startMissionBtn.disabled = true;

        startMissionBtn.textContent =

            "Selesai";

    }

    // Kalau belum selesai
    else{

        rewardCoin.textContent =

            `${p.reward} Coin`;

        statusText.textContent =

            "Belum dikunjungi";

        startMissionBtn.disabled = false;

        startMissionBtn.textContent =

            "Mulai Misi";

    }

    showPanel(

        missionPanel

    );

}

/*==========================================================
                MARKER EFFECT
==========================================================*/

function updateMarkerEffect(){

    if(

        !APP.markerLayer

    ){

        return;

    }

    APP.markerLayer.eachLayer(marker=>{

        marker.getElement()

        ?.classList.remove(

            "marker-pulse"

        );

    });

    if(

        !APP.targetFeature

    ){

        return;

    }

    APP.markerLayer.eachLayer(marker=>{

        if(

            marker.feature===

            APP.targetFeature

        ){

            marker.getElement()

            ?.classList.add(

                "marker-pulse"

            );

        }

    });

}
/*==========================================================
                UPDATE DISTANCE
==========================================================*/

function updateDistanceDisplay(){

    if(

        !APP.targetFeature ||

        !APP.userLocation

    ){

        return;

    }

    const distance =

        APP.map.distance(

            [

                APP.userLocation.lat,

                APP.userLocation.lng

            ],

            [

                APP.targetFeature.geometry.coordinates[1],

                APP.targetFeature.geometry.coordinates[0]

            ]

        );

    distanceText.textContent =

        Math.round(distance);
const minute =

    Math.ceil(

        distance/75

    );

estimateTime.textContent =

    `${minute} menit`;
}
/*==========================================================
                PART 5 - ROUTING
==========================================================*/


/*==========================================================
                SHOW ROUTE
==========================================================*/

async function showRoute(destination){
 if(APP.isRouting) return;

    APP.isRouting = true;

    if(!APP.userLocation){
        alert("Lokasi Anda belum terdeteksi.");
        return;
    }

    // hapus rute lama
    if(APP.routingControl){
        APP.map.removeLayer(APP.routingControl);
        APP.routingControl = null;
    }

    try{

        const response = await fetch(
            "https://api.openrouteservice.org/v2/directions/foot-walking/geojson",
            {
                method:"POST",
                headers:{
                    "Authorization": ORS_API_KEY,
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    coordinates:[
                        [
                            APP.userLocation.lng,
                            APP.userLocation.lat
                        ],
                        [
                            destination.lng,
                            destination.lat
                        ]
                    ]
                })
            }
        );

        const data = await response.json();

        APP.isRouting = false;

        APP.routingControl = L.geoJSON(data,{
            style:{
                color:"#2E86FF",
                weight:6,
                opacity:0.9
            }
        }).addTo(APP.map);

    }
    catch(err){
        APP.isRouting = false;
        console.error(err);
        alert("Gagal mengambil rute.");
    }

}
/*==========================================================
                PART 6 - QUIZ SYSTEM
==========================================================*/


/*==========================================================
                START MISSION
==========================================================*/

startMissionBtn.addEventListener(

    "click",

    ()=>{

        if(

            !APP.currentMission

        ){

            return;

        }

        if(

            isMissionCompleted(

                APP.currentMission.properties.id

            )

        ){

            alert(

                "Lokasi ini sudah selesai."

            );

            return;

        }

        openMission(

            APP.currentMission

        );

    }

);


/*==========================================================
                OPEN MISSION
==========================================================*/

function openMission(feature){

    APP.selectedAnswer = null;

    showPanel(

        quizPanel

    );

    loadQuestion(feature);

}



/*==========================================================
                LOAD QUESTION
==========================================================*/

function loadQuestion(feature){

    const p = feature.properties;

    questionText.textContent =

        p.question;

    createAnswer(p);

}



/*==========================================================
                CREATE ANSWER
==========================================================*/

function createAnswer(data){

    submitAnswerBtn.disabled = true;

    const option=[

        data.option1,

        data.option2,

        data.option3,

        data.option4

    ];

    answerButtons.forEach(

        (button,index)=>{

            button.textContent =

                option[index];

            button.classList.remove(

                "selected"

            );

        }

    );

}



/*==========================================================
                SELECT ANSWER
==========================================================*/

answerButtons.forEach(button=>{

    button.addEventListener(

        "click",

        ()=>{

            answerButtons.forEach(btn=>{

                btn.classList.remove(

                    "selected"

                );

            });

            button.classList.add(

                "selected"

            );

            APP.selectedAnswer =

                button.textContent;

            submitAnswerBtn.disabled =

                false;

        }

    );

});



/*==========================================================
                SUBMIT ANSWER
==========================================================*/

submitAnswerBtn.addEventListener(

    "click",

    async ()=>{

        await checkAnswer();

    }

);



/*==========================================================
                CHECK ANSWER
==========================================================*/

async function checkAnswer(){
    if(!APP.selectedAnswer){

        return;

    }

    const data =

        APP.currentMission.properties;

    if(

        APP.selectedAnswer===

        data.correct

    ){

        await missionSuccess();

    }

    else{

        await missionFailed();

    }

}
/*==========================================================
                MISSION FAILED
==========================================================*/

async function missionFailed(){

    const data = APP.currentMission.properties;

    APP.completedMission.add(data.id);

    await saveCompletedMission();

    updateProgress();

    completedMarker();

    APP.targetFeature = null;

    if(APP.routingControl){

        APP.map.removeLayer(APP.routingControl);
APP.routingControl = null;
    }

    alert(

        `❌ Jawaban Salah!

Jawaban yang benar adalah :

${data.correct}

Kamu tidak mendapatkan ${data.reward} Kotagede Coin.`

    );

    showPanel(

        welcomePanel

    );

}
/*==========================================================
                PART 7 - REWARD SYSTEM
==========================================================*/


/*==========================================================
                MISSION SUCCESS
==========================================================*/

async function missionSuccess(){

    const data = APP.currentMission.properties;

    await addCoin(data.reward);

    APP.completedMission.add(data.id);

    await saveCompletedMission();

    updateProgress();

    refreshCoin();

    completedMarker();

    // Hapus target setelah misi selesai
    APP.targetFeature = null;

    // Hapus rute dari peta
    if(APP.routingControl){

        APP.map.removeLayer(

            APP.routingControl

        );

        APP.routingControl = null;

    }

    showRewardPopup(data.reward);

    checkAchievement();

}

/*==========================================================
                COMPLETED MARKER
==========================================================*/

function completedMarker(){

    APP.markerLayer.eachLayer(marker=>{

        if(

            marker.feature.properties.id===

            APP.currentMission.properties.id

        ){

            marker.setIcon(

                L.divIcon({

                    className:"",

                    html:`

                    <div class="marker-complete">

                        ✔

                    </div>

                    `,

                    iconSize:[40,40],

                    iconAnchor:[20,20]

                })

            );

        }

    });

}

/*==========================================================
                IS COMPLETED
==========================================================*/

function isMissionCompleted(id){

    return APP.completedMission.has(id);

}

/*==========================================================
                UPDATE PROGRESS
==========================================================*/

function updateProgress(){

    progressText.textContent =

        `${APP.completedMission.size}/${CONFIG.TOTAL_LOCATION}`;

}

/*==========================================================
                REFRESH COIN
==========================================================*/

function refreshCoin(){

    coinValue.textContent = APP.coin;

}

/*==========================================================
                REWARD POPUP
==========================================================*/

function showRewardPopup(coin){

    rewardPopup.classList.add(

        "show"

    );

    rewardPopup.querySelector("p").textContent =

        `+${coin} Kotagede Coin`;

}


/*==========================================================
                CLOSE POPUP
==========================================================*/

document

.getElementById("closePopup")

.addEventListener(

    "click",

    ()=>{

        rewardPopup.classList.remove(

            "show"

        );

        APP.targetFeature = null;

        showPanel(

            welcomePanel

        );

    }

);


/*==========================================================
                ACHIEVEMENT
==========================================================*/

function checkAchievement(){

    const total = APP.completedMission.size;

    if(total===5){

        showAchievement("Explorer");

    }

    else if(total===10){

        showAchievement("Master Explorer");

    }

    else if(total===25){

        showAchievement("Kotagede Legend");

    }

}


/*==========================================================
                SHOW ACHIEVEMENT
==========================================================*/

function showAchievement(title){

    achievement.innerHTML =

        `🏆 ${title}<br><span>${APP.completedMission.size} Lokasi Selesai</span>`;

    achievement.classList.add(

        "show"

    );

    setTimeout(()=>{

        achievement.classList.remove(

            "show"

        );

    },3000);

}

/*==========================================================
                    ADD COIN
==========================================================*/

async function addCoin(amount){

    amount = Number(amount)||0;

    APP.coin += amount;

await saveCoin(APP.coin);

refreshCoin();

}
/*==========================================================
                PART 8 - SAVE PROGRESS
==========================================================*/

/*==========================================================
                SAVE COMPLETED MISSION
==========================================================*/

async function saveCompletedMission(){

    const progress = [...APP.completedMission];

    await saveProgress(progress);

}

/*==========================================================
            PART 9 - RESTORE COMPLETED MARKER
==========================================================*/


/*==========================================================
            RESTORE COMPLETED MARKERS
==========================================================*/

function restoreCompletedMarkers(){

    if(

        !APP.markerLayer

    ){

        return;

    }

    APP.markerLayer.eachLayer(marker=>{

        const feature = marker.feature;

        const id = feature.properties.id;

        if(

            APP.completedMission.has(id)

        ){

            marker.setIcon(

                L.divIcon({

                    className:"",

                    html:`

                        <div class="marker-complete">

                            ✔

                        </div>

                    `,

                    iconSize:[40,40],

                    iconAnchor:[20,20]

                })

            );

        }

    });

}
