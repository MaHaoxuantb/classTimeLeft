// app.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('timeForm');
    const endTimeInput = document.getElementById('endTime');
    const setupScreen = document.getElementById('setupScreen');
    const countdownScreen = document.getElementById('countdownScreen');
    const timeDisplay = document.getElementById('timeDisplay');
    const exitButton = document.getElementById('exitButton');
    const themeSelect = document.getElementById('themeSelect');
    const themeSelectCountdown = document.getElementById('themeSelectCountdown');
    const alarmSound = document.getElementById('alarmSound');
    const themeLink = document.getElementById('theme-link');
    let countdownInterval;

    // Function to apply a theme by changing the href of the theme link
    function applyTheme(theme) {
        themeLink.href = `themes/${theme}.css`;
    }

    // Load stored theme or default
    const storedTheme = localStorage.getItem('selectedTheme') || 'default';
    applyTheme(storedTheme);
    themeSelect.value = storedTheme;
    if (themeSelectCountdown) {
        themeSelectCountdown.value = storedTheme;
    }

    // Check if there's a stored countdown
    const storedEndTime = localStorage.getItem('endTime');
    if (storedEndTime) {
        const endTime = new Date(storedEndTime);
        const now = new Date();
        if (endTime > now) {
            // Transition to countdown screen
            setupScreen.style.display = 'none';
            countdownScreen.style.display = 'flex';
            startCountdown(endTime);
        } else {
            // Clear invalid stored end time
            localStorage.removeItem('endTime');
        }
    }

    // Form submission handler
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const endTimeValue = endTimeInput.value;
        if (!endTimeValue) return;

        // Get current date and user input time
        const now = new Date();
        const [hours, minutes] = endTimeValue.split(':').map(Number);
        let endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);

        // If the set time has already passed, set it for the next day
        if (endTime <= now) {
            endTime.setDate(endTime.getDate() + 1);
        }

        // Store the end time
        localStorage.setItem('endTime', endTime.toISOString());

        // Transition to the countdown screen
        setupScreen.style.display = 'none';
        countdownScreen.style.display = 'flex';

        // Start the countdown
        startCountdown(endTime);
    });

    // Exit button handler
    exitButton.addEventListener('click', () => {
        // Clear the countdown
        clearInterval(countdownInterval);
        countdownScreen.style.display = 'none';
        setupScreen.style.display = 'block';

        // Clear the stored end time
        localStorage.removeItem('endTime');
    });

    // Theme selection handler for setup screen
    themeSelect.addEventListener('change', (e) => {
        const selectedTheme = e.target.value;
        applyTheme(selectedTheme);
        // Store the selected theme
        localStorage.setItem('selectedTheme', selectedTheme);
        // Update countdown screen theme selector if exists
        if (themeSelectCountdown) {
            themeSelectCountdown.value = selectedTheme;
        }
    });

    // Theme selection handler for countdown screen
    if (themeSelectCountdown) {
        themeSelectCountdown.addEventListener('change', (e) => {
            const selectedTheme = e.target.value;
            applyTheme(selectedTheme);
            // Store the selected theme
            localStorage.setItem('selectedTheme', selectedTheme);
            // Update setup screen theme selector
            themeSelect.value = selectedTheme;
        });
    }

    // Function to start the countdown
    function startCountdown(endTime) {
        // Clear any existing countdown
        clearInterval(countdownInterval);

        // Update the countdown every second
        countdownInterval = setInterval(() => {
            const currentTime = new Date();
            const distance = endTime - currentTime;

            if (distance < 0) {
                clearInterval(countdownInterval);
                timeDisplay.textContent = "Class time is over!";

                // Play alarm sound
                if (alarmSound) {
                    alarmSound.play();
                }

                // Clear stored end time
                localStorage.removeItem('endTime');
                return;
            }

            const hoursLeft = Math.floor((distance / (1000 * 60 * 60)) % 24);
            const minutesLeft = Math.floor((distance / (1000 * 60)) % 60);
            const secondsLeft = Math.floor((distance / 1000) % 60);

            timeDisplay.textContent = `${pad(hoursLeft)}:${pad(minutesLeft)}:${pad(secondsLeft)}`;
        }, 1000);
    }

    // Helper function to pad numbers with leading zeros
    function pad(num) {
        return num.toString().padStart(2, '0');
    }

    // Register Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('Service Worker registered successfully:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        });
    }
});
