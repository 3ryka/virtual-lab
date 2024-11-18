import {
    app, auth, db, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword,
    signOut, doc, getDoc, setDoc, updateDoc
} from "./firebaseglobal.js";

// Create user with email and password 
const signupbutton = document.getElementById("signup-button");
signupbutton.addEventListener("click", function(event) {
    event.preventDefault()
    const signupemail = document.getElementById("signup-email").value;
    const signuppassword = document.getElementById("signup-password").value;
    createUserWithEmailAndPassword(auth, signupemail, signuppassword)
        .then((userCredential) => {
            // Signed up 
            const user = userCredential.user;
            const userData = {
                email: signupemail,
                displayName: "User",
                module: {
                    module1: {
                        currentSection: "Not learned yet",
                        progress: "0%",
                    },
                    module2: {
                        currentSection: "Not learned yet",
                        progress: "0%",
                    },
                    module3: {
                        currentSection: "Not learned yet",
                        progress: "0%",
                    },                    
                },
                quizScores: {
                    overallScore: null,
                    quiz1: null,
                    quiz2: null,
                    quiz3: null,
                }
            }
            alert("Creating account...")
            
            const docRef = doc(db, "users", user.uid);
            setDoc(docRef, userData)
            .then(() => {
                toggleForms();
                alert("Please log in with your newly made account");
            })
            .catch ((error) => {
                console.error("Error writing document", error);
            });
        })
        .catch((error) => {
            const errorCode = error.code;
            if (errorCode == 'auth/email-already-in-use') {
                alert('Email is already in use');
            }
            else {
                const errorMessage = error.message;
                alert(errorMessage,', unable to create account');
            }
        });
})

// Sign in with email and password 
const loginbutton = document.getElementById("login-button");
loginbutton.addEventListener("click", function(event) {
    event.preventDefault()
    const loginemail = document.getElementById("login-email").value;
    const loginpassword = document.getElementById("login-password").value;
    signInWithEmailAndPassword(auth, loginemail, loginpassword)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            localStorage.setItem('loggedInUserID', user.uid);
            alert("Logging in...")
            window.location.href = "profile.html";
        })
        .catch((error) => {
            const errorCode = error.code;
            if (errorCode == 'auth/invalid-credential') {
                alert('Incorrect email or password');
            }
            else {
                const errorMessage = error.message;
                alert('Account does not exist', errorMessage);
            }
        });
})