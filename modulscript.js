import {
    app, auth, db, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword,
    signOut, doc, getDoc, setDoc, updateDoc
} from "./firebaseglobal.js";

document.addEventListener('DOMContentLoaded', function () {
    const notification = document.getElementById('completion-notification');
    const progressBar = document.getElementById('progress-bar');
    let currentSection = 1;
    const completedSections = new Set();
    const initialLoading = document.getElementById('initial-loading');

    // Quiz functionality
    let draggables = document.querySelectorAll('.draggable-option');
    let dropZones = document.querySelectorAll('.drop-zone');
    let submitBtn = document.querySelector('.submit-btn');
    let loading = document.querySelector('.loading');
    let resultContainer = document.querySelector('.result-container');

    function updateProgressBar() {
        const progress = (completedSections.size / 4) * 100;
        progressBar.style.width = `${progress}%`;
    }

    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        return rect.top >= 0 && rect.top <= windowHeight;
    }

    function showNotification() {
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    // Load user's progress when page loads
    async function loadUserProgress() {
        initialLoading.style.display = 'block'; // Show loading at start

        return new Promise((resolve, reject) => {
            onAuthStateChanged(auth, async (user) => {
                try {
                    if (user) {
                        const docRef = doc(db, "users", user.uid);
                        const docSnap = await getDoc(docRef);

                        if (docSnap.exists()) {
                            const userData = docSnap.data();
                            const moduleData = userData.module?.module1;

                            // Load section progress
                            if (userData.module?.module1?.currentSection) {
                                const sectionMatch = userData.module.module1.currentSection.match(/Section (\d+)/);
                                if (sectionMatch) {
                                    currentSection = parseInt(sectionMatch[1]);
                                    for (let i = 1; i < currentSection; i++) {
                                        await completeSection(i, false);
                                    }
                                    goToSection(currentSection);
                                }
                            } else {
                                console.log("No progress found for module1. Starting fresh.");
                                currentSection = 1; // Start fresh for new users
                                goToSection(currentSection); // Go to the first section
                            }

                            // Load quiz progress
                            if (userData.quizScores?.quiz1) {
                                // Mark quiz as completed in UI
                                completedSections.add(4);
                                const quizItem = document.querySelector('.section-item[data-section="4"]');
                                if (quizItem) {
                                    quizItem.innerHTML = quizItem.innerHTML.replace('🔲', '✅');
                                    quizItem.classList.add('completed');
                                }
                                
                                // Disable quiz if already completed
                                const submitBtn = document.querySelector('.submit-btn');
                                if (submitBtn) {
                                    submitBtn.disabled = true;
                                    submitBtn.textContent = 'Quiz Already Completed';
                                }
                            }

                            if (moduleData?.progress) {
                                const progressBar = document.querySelector('.progress-bar');
                                if (progressBar) {
                                    progressBar.style.width = moduleData.progress;
                                }
                            }
                        } else {
                            console.log("No progress found for module1. Starting fresh.");
                            currentSection = 1; // Start fresh for new users
                            goToSection(currentSection); // Go to the first section
                        }
                    } else {
                        alert ("Log in to your account to keep your progress");
                        console.log("No user is logged in.");
                    }

                    initialLoading.style.display = 'none'; // Hide loading after completion
                    resolve();
                } catch (error) {
                    console.error("Error loading progress:", error);
                    initialLoading.style.display = 'none'; // Hide loading on error
                    reject(error);
                }
            });
        });
    }

    // Modified completeSection function to handle initial load
    async function completeSection(sectionNum, updateFirebase = true) {
        if (completedSections.has(sectionNum)) return;

        completedSections.add(sectionNum);
        updateProgressBar();

        // Update progress item
        const progressItem = document.querySelector(`.section-item[data-section="${sectionNum}"]`);
        if (progressItem) {
            progressItem.innerHTML = progressItem.innerHTML.replace('🔲', '✅');
            progressItem.classList.add('completed');
        }

        // Enable next section link
        const currentSectionElem = document.getElementById(`section${sectionNum}`);
        if (currentSectionElem) {
            const nextLink = currentSectionElem.querySelector('.next-section-link');
            if (nextLink) {
                nextLink.style.display = 'block';
                nextLink.onclick = () => goToSection(sectionNum + 1);
            }
        }

        // Unlock next section if exists
        if (sectionNum < 4) {
            const nextProgressItem = document.querySelector(`.section-item[data-section="${sectionNum + 1}"]`);
            if (nextProgressItem) {
                nextProgressItem.classList.remove('locked');
            }
        }

        if (updateFirebase) {
            showNotification();

            // Update Firebase
            const user = auth.currentUser;
            if (user) {
                try {
                    const docRef = doc(db, "users", user.uid);
                    const sectionName = `Section ${Math.min(sectionNum + 1, 4)}`;
                    const progressValue = `${(completedSections.size / 4 * 100)}%`;

                    await updateDoc(docRef, {
                        [`module.module1.currentSection`]: sectionName,
                        [`module.module1.progress`]: progressValue,
                    });
                } catch (error) {
                    console.error("Error saving progress:", error);
                }
            }
        }
    }

    function handleScroll() {
        const currentSectionElem = document.getElementById(`section${currentSection}`);
        const bottomMarker = document.getElementById(`bottom-marker-${currentSection}`);
        if (bottomMarker && isInViewport(bottomMarker)) {
            completeSection(currentSection);
        }
    }

    // Modified goToSection function
    window.goToSection = function (sectionNum) {
        if (sectionNum === 1 || completedSections.has(sectionNum - 1) || completedSections.has(sectionNum)) {
            // Hide all sections
            document.querySelectorAll('.section-content').forEach(section => {
                section.classList.remove('active');
            });

            // Show selected section
            const targetSection = document.getElementById(`section${sectionNum}`);
            if (targetSection) {
                targetSection.classList.add('active');
                currentSection = sectionNum;
                window.scrollTo(0, 0);
            }
        }
    };

    // Quiz handlers
    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', () => {
            draggable.classList.add('dragging');
        });

        draggable.addEventListener('dragend', () => {
            draggable.classList.remove('dragging');
        });
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            const draggable = document.querySelector('.dragging');
            if (draggable) {
                // If zone already has an answer, return it to options
                if (zone.firstChild) {
                    const oldAnswer = zone.firstChild;
                    oldAnswer.setAttribute('draggable', 'true');
                    draggable.parentElement.appendChild(oldAnswer);
                }
                // Place new answer in zone
                draggable.setAttribute('draggable', 'false');
                zone.innerHTML = '';
                zone.appendChild(draggable);
                checkAllAnswered();
            }
        });
    });

    function checkAllAnswered() {
        const allAnswered = Array.from(dropZones).every(zone => zone.children.length > 0);
        submitBtn.disabled = !allAnswered;
    }

    submitBtn.addEventListener('click', async () => {
        loading.style.display = 'block';
        submitBtn.style.display = 'none';

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const score = calculateScore();
        displayResults(score);

        loading.style.display = 'none';
        resultContainer.style.display = 'block';

        // If score is 100%, mark section as complete
        if (score === 100) {
            completeSection(4);
        }
    });

    function calculateScore() {
        let correct = 0;
        dropZones.forEach(zone => {
            if (zone.firstChild && zone.firstChild.textContent === zone.dataset.answer) {
                correct++;
            }
        });
        return (correct / dropZones.length) * 100;
    }

    async function displayResults(score) {
        const scoreDiv = document.querySelector('.score');
        const reviewDiv = document.querySelector('.answer-review');

        scoreDiv.textContent = `Your Score: ${score}%`;
        reviewDiv.innerHTML = '<h3>Answer Review:</h3>';

        dropZones.forEach((zone, index) => {
            const userAnswer = zone.firstChild ? zone.firstChild.textContent : 'No answer';
            const correctAnswer = zone.dataset.answer;
            const isCorrect = userAnswer === correctAnswer;

            reviewDiv.innerHTML += `
                <p class="${isCorrect ? 'correct' : 'incorrect'}">
                    Question ${index + 1}: 
                    ${isCorrect ? '✓' : '✗'} 
                    Your answer: ${userAnswer}
                    ${!isCorrect ? `<br>Correct answer: ${correctAnswer}` : ''}
                </p>
            `;
        });
        
        // Show the completion notification
        const notification = document.getElementById('completion-notification');
        if (notification) {
            notification.style.display = 'block';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        }

        // Update progress bar to 100%
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.style.width = '100%';
        }

        // Update score to Firestore 
        const user = auth.currentUser;
        if (user) {
            try {
                const docRef = doc(db, "users", user.uid);

                await updateDoc(docRef, {
                    [`quizScores.quiz1`]: score,
                    [`quizScores.overallScore`]: score,
                });

                // Ensure section 4 is completed
                completeSection(4);
            } catch (error) {
                console.error("Error saving score:", error);
            }
        }

    }

    // Initialize progress items click handlers
    document.querySelectorAll('.section-item').forEach(item => {
        item.addEventListener('click', () => {
            const sectionNum = parseInt(item.dataset.section);
            goToSection(sectionNum);
        });
    });

    // Initialize the page
    async function initializePage() {
        await loadUserProgress();
        window.addEventListener('scroll', handleScroll);
        handleScroll();
    }

    // Start initialization
    initializePage();
});
