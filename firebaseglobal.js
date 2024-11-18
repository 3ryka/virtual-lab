// Import the necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyASs0LXGTm1aRu5lEVz1z9q0gGImqQFBk4",
    authDomain: "fun4eng-virtual-lab.firebaseapp.com",
    projectId: "fun4eng-virtual-lab",
    storageBucket: "fun4eng-virtual-lab.firebasestorage.app",
    messagingSenderId: "1050844988722",
    appId: "1:1050844988722:web:c2a6d3c92c4e53c189832b",
    measurementId: "G-9ZFZBPVXC3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firebase Authentication
const auth = getAuth(app);  
// Initialize Firestore Database 
const db = getFirestore(app);

export {
    app, auth, db, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword,
    signOut, doc, getDoc, setDoc, updateDoc
};