import {
    app, auth, db, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword,
    signOut, doc, getDoc, setDoc, updateDoc
} from "./firebaseglobal.js";

// DOM Elements
const displayNameSpan = document.getElementById("display-name");
const emailSpan = document.getElementById("email");
const newDisplayNameInput = document.getElementById("new-display-name");
const saveNameButton = document.getElementById("save-name");
const moduleProgressList = document.getElementById("module-progress");
const quizScoresList = document.getElementById("quiz-scores");
const logoutButton = document.getElementById("logout-button");

// Module names mapping
const MODULE_NAMES = {
    module1: "Introduction to English Grammar",
    module2: "Basic Conversation Skills",
    module3: "Writing Fundamentals"
};

// Load user data
const loadUserData = async (userId) => {
    try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const userData = docSnap.data();
            displayNameSpan.textContent = userData.displayName;
            emailSpan.textContent = userData.email;
            
            // Display module progress
            displayModuleProgress(userData.module);
            
            // Display quiz scores
            displayQuizScores(userData.quizScores);
        }
    } catch (error) {
        console.error("Error loading user data:", error);
        alert("Error loading user data");
    }
};

// Display module progress
const displayModuleProgress = (moduleData) => {
    moduleProgressList.innerHTML = '';
    
    // Create an array of modules and sort them
    const sortedModules = Object.entries(moduleData)
        .sort((a, b) => {
            const numA = parseInt(a[0].replace('module', ''));
            const numB = parseInt(b[0].replace('module', ''));
            return numA - numB;
        });

    sortedModules.forEach(([moduleKey, moduleInfo]) => {
        const moduleNumber = moduleKey.replace('module', '');
        const moduleName = MODULE_NAMES[moduleKey] || `Module ${moduleNumber}`;
        
        const li = document.createElement('li');
        li.className = 'module-card';
        li.innerHTML = `
            <div class="module-header">
                <h3>${moduleName}</h3>
                <span class="progress-percentage">${moduleInfo.progress}</span>
            </div>
            <div class="current-section">Current Section: ${moduleInfo.currentSection}</div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${moduleInfo.progress}"></div>
            </div>
        `;
        moduleProgressList.appendChild(li);
    });
};

// Display quiz scores
const displayQuizScores = (quizData) => {
    quizScoresList.innerHTML = '';
    
    if (!quizData || Object.values(quizData).every(score => score === null)) {
        quizScoresList.innerHTML = '<li class="no-data">No quiz scores available yet</li>';
        return;
    }

    // Display overall score first if it exists
    if (quizData.overallScore !== null) {
        const overallLi = document.createElement('li');
        overallLi.innerHTML = `
            <strong>Overall Score:</strong> ${quizData.overallScore}%
        `;
        quizScoresList.appendChild(overallLi);
    }

    // Display individual quiz scores
    Object.entries(quizData)
        .filter(([key]) => key !== 'overallScore')
        .sort((a, b) => {
            const numA = parseInt(a[0].replace('quiz', ''));
            const numB = parseInt(b[0].replace('quiz', ''));
            return numA - numB;
        })
        .forEach(([quizKey, score]) => {
            if (score !== null) {
                const quizNumber = quizKey.replace('quiz', '');
                const li = document.createElement('li');
                li.innerHTML = `
                    <strong>Quiz ${quizNumber}:</strong> ${score}%
                `;
                quizScoresList.appendChild(li);
            }
        });
};

// Change display name functionality
saveNameButton.addEventListener("click", async () => {
    const newName = newDisplayNameInput.value.trim();
    if (!newName) {
        alert("Please enter a valid name");
        return;
    }

    const userId = localStorage.getItem('loggedInUserID');
    if (!userId) {
        alert("You must be logged in to change your name");
        return;
    }

    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            displayName: newName
        });
        
        displayNameSpan.textContent = newName;
        newDisplayNameInput.value = '';
        alert("Display name updated successfully!");
    } catch (error) {
        console.error("Error updating display name:", error);
        alert("Error updating display name");
    }
});

// Handle logout
logoutButton.addEventListener("click", () => {
    localStorage.removeItem('loggedInUserID');
    signOut(auth)
        .then(() => {
            alert("You have successfully logged out.");
            window.location.href = "index.html"; // Redirect to home page
        })
        .catch((error) => {
            console.error("Error logging out:", error);
        });
});

// hamburger 
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".navmenu");

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
})

document.querySelectorAll(".navlink").forEach(n => n.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
}))

// Check authentication state and load data
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadUserData(user.uid);
    } else {
        window.location.href = "index.html";
    }
});