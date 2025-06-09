// app.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM content loaded, initializing application...');
    
    // Theme related elements
    const themeSelect = document.getElementById('themeSelect');
    const themeSelectCountdown = document.getElementById('themeSelectCountdown');
    const themeLink = document.getElementById('theme-link');
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');

    // Tab related elements
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Setup screen elements
    const setupScreen = document.getElementById('setupScreen');
    const timeForm = document.getElementById('timeForm');
    const endTimeInput = document.getElementById('endTime');
    const timeError = document.getElementById('timeError');

    // Quick time elements
    const hoursInput = document.getElementById('hours');
    const minutesInput = document.getElementById('minutes');
    const presetButtons = document.querySelectorAll('.preset-btn');
    const startQuickCountdownBtn = document.getElementById('startQuickCountdown');
    const durationError = document.getElementById('durationError');

    // Countdown screen elements
    const countdownScreen = document.getElementById('countdownScreen');
    const timeDisplay = document.getElementById('timeDisplay');
    const remainingTimeText = document.getElementById('remainingTimeText');
    const countdownEndTimeDisplay = document.getElementById('countdownEndTimeDisplay');
    const exitButton = document.getElementById('exitButton');
    const alarmSound = document.getElementById('alarmSound');

    // Class status elements
    const currentTimeDisplay = document.getElementById('currentTime');
    const currentClassDisplay = document.getElementById('currentClass');
    const startCountdownButton = document.getElementById('startCountdownButton');

    let countdownInterval; // Stores the countdown interval ID
    let countdownEndTime;  // Stores the countdown end time

    // Define theme colors
    const themeColors = {
        default: '#ffffff',
        dark: '#404040',
        solarized: '#e6e4be',
        monokai: '#8a896e',
        pink: '#f5c1c1'
    };

    // Define class schedule
    const classSchedule = [
        { name: 'P1', start: '08:00', end: '08:45' },
        { name: 'P2', start: '08:50', end: '09:35' },
        { name: 'P3', start: '09:45', end: '10:30' },
        { name: 'P4', start: '10:40', end: '11:25' },
        { name: 'P5', start: '11:30', end: '12:15' },
        { name: 'P6', start: '12:15', end: '13:00' },
        { name: 'P7', start: '13:05', end: '13:50' },
        { name: 'P8', start: '13:55', end: '14:40' },
        { name: 'P9', start: '14:50', end: '15:35' },
        { name: 'P10', start: '15:40', end: '16:25' },
        { name: 'P11', start: '16:30', end: '17:15' },
        { name: 'Welcome to night, child', start: '22:15', end: '06:10' }
    ];

    /**
     * Apply the selected theme by updating theme link href and meta theme-color
     * @param {string} theme - The theme name to apply
     */
    function applyTheme(theme) {
        // Force fresh loading of CSS with cache-busting
        themeLink.href = `themes/${theme}.css?v=${Date.now()}`;
        console.log(`Applied theme: ${theme}`);

        // Update meta theme-color
        if (themeColors[theme]) {
            metaThemeColor.setAttribute('content', themeColors[theme]);
        } else {
            metaThemeColor.setAttribute('content', themeColors['default']);
        }
    }

    /**
     * Synchronize theme selection across both setup and countdown screens
     * @param {string} selectedTheme - The selected theme
     */
    function synchronizeThemes(selectedTheme) {
        themeSelect.value = selectedTheme;
        if (themeSelectCountdown) {
            themeSelectCountdown.value = selectedTheme;
        }
    }

    /**
     * Load the stored theme from localStorage or apply the default theme
     */
    function loadStoredTheme() {
        const storedTheme = localStorage.getItem('selectedTheme') || 'default';
        applyTheme(storedTheme);
        synchronizeThemes(storedTheme);
    }

    /**
     * Store the selected theme in localStorage
     * @param {string} theme - The theme to store
     */
    function storeSelectedTheme(theme) {
        localStorage.setItem('selectedTheme', theme);
    }

    /**
     * Handle theme selection change events
     */
    function handleThemeSelection() {
        // Setup screen theme selector event listener
        themeSelect.addEventListener('change', (e) => {
            const selectedTheme = e.target.value;
            applyTheme(selectedTheme);
            synchronizeThemes(selectedTheme);
            storeSelectedTheme(selectedTheme);
        });

        // Countdown screen theme selector event listener
        if (themeSelectCountdown) {
            themeSelectCountdown.addEventListener('change', (e) => {
                const selectedTheme = e.target.value;
                applyTheme(selectedTheme);
                synchronizeThemes(selectedTheme);
                storeSelectedTheme(selectedTheme);
            });
        }
    }

    /**
     * Enhanced tab navigation with improved debugging and reliability
     */
    function handleTabNavigation() {
        console.log('Initializing tab navigation with buttons:', tabButtons.length);
        
        if (tabButtons.length === 0 || tabContents.length === 0) {
            console.error('Tab buttons or contents not found');
            return;
        }

        // Ensure initial state is correct
        tabButtons.forEach((btn, index) => {
            const target = btn.getAttribute('data-tab');
            console.log(`Tab button ${index} with target: ${target}`);
            
            // Add click event listener
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log(`Clicked tab: ${target}`);
                
                // Remove active class from all tabs
                tabButtons.forEach(button => {
                    button.classList.remove('active');
                    console.log(`Removed active class from ${button.getAttribute('data-tab')}`);
                });
                
                // Hide all content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    console.log(`Removed active class from content ${content.id}`);
                });
                
                // Activate clicked tab and its content
                btn.classList.add('active');
                const contentElement = document.getElementById(target);
                if (contentElement) {
                    contentElement.classList.add('active');
                    console.log(`Activated content: ${target}`);
                } else {
                    console.error(`Cannot find content element with ID: ${target}`);
                }
            });
        });
    }

    /**
     * Parse a time string "HH:MM" into a Date object representing today
     * @param {string} timeStr - Time string in "HH:MM" format
     * @returns {Date|null} Date object or null if invalid
     */
    function parseTime(timeStr) {
        const timeParts = timeStr.split(':').map(Number);
        if (timeParts.length !== 2 || timeParts.some(isNaN)) {
            console.error(`Invalid time format: ${timeStr}`);
            return null;
        }
        const [hours, minutes] = timeParts;
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
    }

    /**
     * Determine which class is currently in session
     * @returns {Object} Object with status, className, and endTime
     */
    function getCurrentClass() {
        const now = new Date();
        console.log('Checking current class status at:', now);
        for (let i = 0; i < classSchedule.length; i++) {
            const classStartStr = classSchedule[i].start;
            const classEndStr = classSchedule[i].end;
            const isCrossDay = classStartStr > classEndStr; // Cross-day if start > end

            let classStart = parseTime(classStartStr);
            let classEnd = parseTime(classEndStr);
            if (isCrossDay) {
                if (now < classStart) {
                    // After midnight but before today's start time
                    if (now <= classEnd) {
                        // Class started yesterday
                        classStart.setDate(classStart.getDate() - 1);
                    }
                } else {
                    // During or after start time on the same day, end time is tomorrow
                    classEnd.setDate(classEnd.getDate() + 1);
                }
            }

            if (!classStart || !classEnd) {
                console.error(`Failed to parse time for ${classSchedule[i].name}`);
                continue;
            }

            // Check if current time is during class
            if (now >= classStart && now <= classEnd) {
                console.log(`Currently in ${classSchedule[i].name}`);
                return { status: 'In Class', className: classSchedule[i].name, endTime: classEnd };
            }

            // Check if current time is during break
            if (i < classSchedule.length - 1) {
                const nextClassStartStr = classSchedule[i + 1].start;
                const nextClassStart = parseTime(nextClassStartStr);
                if (!nextClassStart) {
                    console.error(`Failed to parse next class start time for ${classSchedule[i + 1].name}`);
                    continue;
                }
                if (now > classEnd && now < nextClassStart) {
                    console.log(`Currently on break between ${classSchedule[i].name} and ${classSchedule[i + 1].name}`);
                    return { status: 'Break Time', className: null };
                }
            }
        }

        console.log('Currently no class');
        return { status: 'No Current Class', className: null };
    }

    /**
     * Update the current time and class status display
     * Optimized with requestAnimationFrame for smoother updates
     */
    function updateClassStatus() {
        const updateFrame = () => {
            const now = new Date();
            const hours = pad(now.getHours());
            const minutes = pad(now.getMinutes());
            const seconds = pad(now.getSeconds());
            currentTimeDisplay.textContent = `Current Time: ${hours}:${minutes}:${seconds}`;
    
            const current = getCurrentClass();
            currentClassDisplay.textContent = `Current Status: ${current.status}${current.className ? ' - ' + current.className : ''}`;
    
            if (current.status === 'In Class') {
                // Check if endTime is already stored in localStorage
                if (!localStorage.getItem('endTime')) {
                    const endTime = current.endTime;
                    if (endTime) {
                        localStorage.setItem('endTime', endTime.toISOString());
                        console.log('End Time set from class schedule:', endTime.toISOString());
                    } else {
                        console.error('Failed to parse endTime from class schedule.');
                    }
                }
                startCountdownButton.disabled = false;
                startCountdownButton.textContent = `Start Countdown (Ends at ${current.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
            } else {
                startCountdownButton.disabled = true;
                startCountdownButton.textContent = 'Break Time - Countdown Disabled';
                // Clear endTime from localStorage when not in class
                localStorage.removeItem('endTime');
                console.log('End Time cleared from localStorage.');
            }
        };
        
        // Use requestAnimationFrame for smoother UI updates
        window.requestAnimationFrame(updateFrame);
    }

    /**
     * Calculate and return an end time based on hours and minutes from now
     * @param {number} hours - Hours to add to current time
     * @param {number} minutes - Minutes to add to current time
     * @returns {Date} - New Date object with added time
     */
    function calculateEndTimeFromDuration(hours, minutes) {
        const now = new Date();
        return new Date(now.getTime() + (hours * 60 * 60 * 1000) + (minutes * 60 * 1000));
    }

    /**
     * Start the countdown timer
     * @param {Date} endTime - The countdown end time
     */
    function startCountdown(endTime) {
        // Clear any existing countdown
        clearInterval(countdownInterval);

        // Store countdown end time
        countdownEndTime = endTime.getTime();
        localStorage.setItem('endTime', endTime.toISOString());
        console.log(`Countdown started with End Time: ${endTime.toISOString()}`);

        // Update end time display
        countdownEndTimeDisplay.textContent = `Ends at: ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

        // Switch to countdown screen
        setupScreen.style.display = 'none';
        countdownScreen.style.display = 'flex';
        console.log('Transitioned to countdown screen');

        // Start countdown
        countdownInterval = setInterval(() => {
            const now = new Date().getTime();
            const distance = countdownEndTime - now;

            if (distance < 0) {
                clearInterval(countdownInterval);
                timeDisplay.textContent = "00:00:00";
                remainingTimeText.textContent = "Time's up!";
                if (alarmSound) {
                    alarmSound.play().catch(error => {
                        console.error('Error playing alarm sound:', error);
                    });
                }
                // Clear stored endTime
                localStorage.removeItem('endTime');
                return;
            }

            // Calculate hours, minutes, and seconds
            const hoursLeft = Math.floor((distance / (1000 * 60 * 60)) % 24);
            const minutesLeft = Math.floor((distance / (1000 * 60)) % 60);
            const secondsLeft = Math.floor((distance / 1000) % 60);

            // Update countdown display
            timeDisplay.textContent = `${pad(hoursLeft)}:${pad(minutesLeft)}:${pad(secondsLeft)}`;
            remainingTimeText.textContent = 'Remaining Time';
        }, 1000);
    }

    /**
     * Helper function to pad numbers with leading zeros
     * @param {number} num - Number to pad
     * @returns {string} - Padded number as string
     */
    function pad(num) {
        return num < 10 ? `0${num}` : `${num}`;
    }

    /**
     * Handle form submission for setting end time
     */
    timeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const timeValue = endTimeInput.value;
        console.log('Form submitted with endTime:', timeValue);
        if (!timeValue) {
            // Show inline error message
            timeError.style.display = 'block';
            return;
        } else {
            timeError.style.display = 'none';
        }

        const endTime = parseTime(timeValue);
        if (!endTime) {
            alert('Invalid time format. Please enter time in HH:MM format.');
            return;
        }

        const now = new Date();
        if (endTime <= now) {
            // If time has already passed today, set for tomorrow
            endTime.setDate(endTime.getDate() + 1);
            console.log('End time was earlier today. Setting for the next day.');
        }

        // Store endTime
        localStorage.setItem('endTime', endTime.toISOString());
        console.log('End Time stored:', endTime.toISOString());

        // Start the countdown
        startCountdown(endTime);
    });

    /**
     * Handle quick countdown duration setting
     */
    startQuickCountdownBtn.addEventListener('click', () => {
        const hours = parseInt(hoursInput.value) || 0;
        const minutes = parseInt(minutesInput.value) || 0;
        
        // Validate that at least 1 minute is set
        if (hours === 0 && minutes < 1) {
            durationError.style.display = 'block';
            return;
        }
        
        durationError.style.display = 'none';
        const endTime = calculateEndTimeFromDuration(hours, minutes);
        console.log(`Quick countdown set for ${hours}h ${minutes}m, ending at ${endTime}`);
        
        // Store and start countdown
        localStorage.setItem('endTime', endTime.toISOString());
        startCountdown(endTime);
    });

    /**
     * Handle preset duration buttons
     */
    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const minutes = parseInt(btn.getAttribute('data-minutes')) || 0;
            if (minutes > 0) {
                // For durations under 60 minutes, set hours to 0 and minutes to the preset
                if (minutes < 60) {
                    hoursInput.value = 0;
                    minutesInput.value = minutes;
                } 
                // For hour-long durations, convert to hours and minutes
                else {
                    hoursInput.value = Math.floor(minutes / 60);
                    minutesInput.value = minutes % 60;
                }
                durationError.style.display = 'none';
                console.log(`Preset selected: ${minutes} minutes`);
            }
        });
    });

    /**
     * Handle "Start Countdown" button in Class Status tab
     */
    startCountdownButton.addEventListener('click', () => {
        console.log('Start Countdown button clicked');
        const storedEndTime = localStorage.getItem('endTime');
        console.log('Stored End Time retrieved:', storedEndTime);
        if (storedEndTime) {
            const endTime = new Date(storedEndTime);
            console.log('Parsed End Time:', endTime);
            startCountdown(endTime);
        } else {
            alert('No end time set. Please set the countdown time first.');
        }
    });

    /**
     * Handle "Exit" button click in countdown screen
     */
    exitButton.addEventListener('click', () => {
        console.log('Exit Countdown button clicked');
        // Clear countdown
        clearInterval(countdownInterval);
        countdownScreen.style.display = 'none';
        setupScreen.style.display = 'flex';
        console.log('Returned to setup screen');

        // Clear stored endTime
        localStorage.removeItem('endTime');
        console.log('End Time cleared from localStorage.');

        // Update Class Status
        updateClassStatus();
    });

    /**
     * Check for stored countdown on page load
     */
    function checkStoredCountdown() {
        const storedEndTime = localStorage.getItem('endTime');
        if (storedEndTime) {
            const endTime = new Date(storedEndTime);
            const now = new Date();
            if (endTime > now) {
                console.log('Resuming stored countdown...');
                startCountdown(endTime);
            } else {
                console.log('Stored countdown already expired, removing...');
                localStorage.removeItem('endTime');
            }
        }
    }

    // Initialize theme settings
    loadStoredTheme();
    handleThemeSelection();
    handleTabNavigation();

    // Initial calls
    updateClassStatus();
    checkStoredCountdown();

    // Update class status every second
    setInterval(updateClassStatus, 1000);
});