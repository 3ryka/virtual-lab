import {
    app, auth, db, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword,
    signOut, doc, getDoc, setDoc, updateDoc
} from "./firebaseglobal.js";

const getstartedbutton = document.getElementById("getstarted-button");
const modulesection = document.getElementById("about");

onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("User is signed in:", user.email);
    }
    else {
        console.log("No user signed in");
    }
});

// Function to scroll to modules section
function scrollToModules() {
    modulesection.scrollIntoView({ behavior: 'smooth' });
}

// Add click event listener to Get Started button
getstartedbutton.addEventListener('click', function () {
    // Check if user is logged in
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in, scroll to modules
            scrollToModules();
        } else {
            // No user is signed in, redirect to login page
            window.location.href = 'signuplogin.html';
        }
    });
});

// Handle profile link click
const profileLink = document.getElementById("profile-link");
profileLink.addEventListener("click", (event) => {
    event.preventDefault();
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is logged in, redirect to profile page
            window.location.href = "profile.html";
        } else {
            // User is not logged in, redirect to sign-up/login page
            window.location.href = "signuplogin.html";
        }
    });
});