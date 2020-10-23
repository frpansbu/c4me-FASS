import firebase from "firebase";
import "firebase/auth";
import "firebase/firestore";

const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyCzdKgJKjJweCBpgQ6ifA1yrwgRthdOdxM",
    authDomain: "c4me-729ad.firebaseapp.com",
    databaseURL: "https://c4me-729ad.firebaseio.com",
    projectId: "c4me-729ad",
    storageBucket: "c4me-729ad.appspot.com",
    messagingSenderId: "839711745341",
    appId: "1:839711745341:web:fda5079ac455a3598cd154",
    measurementId: "G-6M38QQ76Q1"
});

const db = firebaseApp.firestore();

export { db };

export default firebase;