import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAZ_0kR-LKH80dJRQeBOpkrAdIp3v07etw",
  authDomain: "jagame-9bf12.firebaseapp.com",
  projectId: "jagame-9bf12",
  storageBucket: "jagame-9bf12.firebasestorage.app",
  messagingSenderId: "884115020230",
  appId: "1:884115020230:web:31b3362852e89876dfbac7"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };