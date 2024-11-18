// Toggle between Sign-Up and Login forms
function toggleForms() {
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
    signupForm.classList.toggle('active');
    loginForm.classList.toggle('active');
}

/*// Sign-up function
async function signUp(event) {
    event.preventDefault();  // Prevent default form submission
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    console.log("Sign-Up attempted with", email, password);

    try {
        // Log into Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("Sign-Up successful", userCredential);  // Check if user is created
        alert("Sign-up successful! You can now log in.");
    } catch (error) {
        console.error("Error during sign-up:", error.message);  // Log error message
        alert(error.message); // Display error if signup fails
    }
}

// Log-in function
async function logIn(event) {
    event.preventDefault();  // Prevent default form submission
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    console.log("Log-In attempted with", email, password);

    try {
        // Log into Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Log-In successful", userCredential);  // Check if login is successful
        alert("Login successful!");
        window.location.href = "main-lab.html"; // Redirect to main lab page
    } catch (error) {
        console.error("Error during login:", error.message);  // Log error message
        alert(error.message); // Display error if login fails
    }
}

// Log-out function
function logOut() {
    signOut(auth)
        .then(() => alert("Logged out successfully"))
        .catch(error => console.error("Error during log-out:", error.message));
}*/