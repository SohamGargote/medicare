import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD_I2gkJd41EqeqPa__8g4-ciWar5ZHMc8",
  authDomain: "medicare-react-main.firebaseapp.com",
  projectId: "medicare-react-main",
  storageBucket: "medicare-react-main.firebasestorage.app",
  messagingSenderId: "627572569509",
  appId: "1:627572569509:web:ac08d4cbd977903f29644c",
  measurementId: "G-NWCE79JMKF"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

export { app, auth, db };
