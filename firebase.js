// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAuchIAO42bId8fVBEZMN-j_rNsrISkNIs",
  authDomain: "admission-fair-252.firebaseapp.com",
  projectId: "admission-fair-252",
  storageBucket: "admission-fair-252.firebasestorage.app",
  messagingSenderId: "735315329959",
  appId: "1:735315329959:web:e7a014693e6da5332e2c82",
  measurementId: "G-YVTM2HFYLM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
