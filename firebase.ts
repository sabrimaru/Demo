// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add your own Firebase configuration and initialize Firebase
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyApqoCB1tGgoUwiaBpQdypE-Y8_y0YIfwM",
  authDomain: "matehost-shifts-scheduler.firebaseapp.com",
  projectId: "matehost-shifts-scheduler",
  storageBucket: "matehost-shifts-scheduler.firebasestorage.app",
  messagingSenderId: "401694738463",
  appId: "1:401694738463:web:da17c4d0c30b14e7e02d2a",
  measurementId: "G-B5S9W3C0E6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };