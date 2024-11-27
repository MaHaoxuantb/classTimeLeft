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
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const tabs = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const currentTimeDisplay = document.getElementById('currentTime');
    const currentClassDisplay = document.getElementById('currentClass');
    const startCountdownButton = document.getElementById('startCountdownButton');
    let countdownInterval;
    let currentTab = 'setTime'; // Default active tab

    // Define theme colors corresponding to each theme
    const themeColors = {
        default: '#007BFF',      // Default Theme Color
        dark: '#1f6feb',         // Dark Theme Color
        solarized: '#268bd2',    // Solarized Theme Color
        monokai: '#66d9ef'       // Monokai Theme Color
    };

    // Function to apply a theme by changing the href of the theme link and updating meta theme-color
    function applyTheme(theme) {
        // Update the theme CSS file
        themeLink.href = `themes/${theme}.css`;
        console.log(`Applied theme: ${theme}`);

        // Update the meta theme-color
        if (themeColors[theme]) {
            metaThemeColor.setAttribute('content', themeColors[theme]);
        } else {
            // Fallback to default theme color if theme not found
            metaThemeColor.setAttribute('content', themeColors['default']);
        }
    }

    // Load stored theme or default
    const storedTheme = localStorage.getItem('selectedTheme') || 'default';
    applyTheme(storedTheme);
    themeSelect.value = storedTheme;
    if (themeSelectCountdown) {
        themeSelectCountdown.value = storedTheme;
    }

    // Define class schedule (Example schedule, adjust as needed)
    const classSchedule = [
        { name: 'P1', start: '08:00', end: '08:45' },
        { name: 'P2', start: '08:50', end: '09:35' },
        { name: 'P3', start: '09:45', end: '10:30' },
        { name: 'P4', start: '10:40', end: '11:25' },
        { name: 'P5', start: '11:30', end: '12:10' },
        { name: 'P6', start: '12:15', end: '13:00' },
        { name: 'P7', start: '13:05', end: '13:50' },
        { name: 'P8', start: '13:55', end: '14:40' },
        { name: 'P9', start: '14:50', end: '15:35' },
        { name: 'P10', start: '15:40', end: '16:25' },
        { name: 'P11', start: '16:30', end: '17:15' },
        { name: 'Welcome to night, child', start: '22:15', end: '6:10' }
    ];

    // Function to parse time string "HH:MM" into Date object (today's date)
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

    // Function to determine current class based on current time
    function getCurrentClass() {
        const now = new Date();
        console.log('Checking current class status at:', now);
        for (let i = 0; i < classSchedule.length; i++) {
            const classStart = parseTime(classSchedule[i].start);
            const classEnd = parseTime(classSchedule[i].end);
            if (!classStart || !classEnd) {
                console.error(`Failed to parse time for ${classSchedule[i].name}`);
                continue;
            }
            if (now >= classStart && now <= classEnd) {
                console.log(`Currently in ${classSchedule[i].name}`);
                return { status: 'In Class', className: classSchedule[i].name, endTime: classSchedule[i].end };
            }
            // 检查课间时间
            if (i < classSchedule.length - 1) {
                const nextClassStart = parseTime(classSchedule[i + 1].start);
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
        // 不在任何课程期间
        console.log('Currently no class');
        return { status: 'No Current Class', className: null };
    }    

    // Function to update current time and class status
    function updateClassStatus() {
        const now = new Date();
        const hours = pad(now.getHours());
        const minutes = pad(now.getMinutes());
        const seconds = pad(now.getSeconds());
        currentTimeDisplay.textContent = `Current Time: ${hours}:${minutes}:${seconds}`;
    
        const current = getCurrentClass();
        currentClassDisplay.textContent = `Current Status: ${current.status}${current.className ? ' - ' + current.className : ''}`;
    
        if (current.status === 'In Class') {
            // 检查 localStorage 是否已有 endTime
            if (!localStorage.getItem('endTime')) {
                const endTime = parseTime(current.endTime);
                if (endTime) {
                    localStorage.setItem('endTime', endTime.toISOString());
                    console.log('End Time set from class schedule:', endTime.toISOString());
                } else {
                    console.error('Failed to parse endTime from class schedule.');
                }
            }
            startCountdownButton.disabled = false;
            startCountdownButton.textContent = `Start Countdown (Ends at ${current.endTime})`;
        } else {
            startCountdownButton.disabled = true;
            startCountdownButton.textContent = 'Break Time - Countdown Disabled';
            // 如果不在课堂期间，清除 localStorage 中的 endTime
            localStorage.removeItem('endTime');
            console.log('End Time cleared from localStorage.');
        }
    }
     

    // Function to start the countdown
    function startCountdown(endTimeStr) {
        const endTime = parseTime(endTimeStr);
        if (!endTime) {
            alert('Invalid end time. Please check your input.');
            return;
        }
        // Store the end time
        localStorage.setItem('endTime', endTime.toISOString());
        console.log(`Countdown started with End Time: ${endTime}`);

        // Transition to the countdown screen
        setupScreen.style.display = 'none';
        countdownScreen.style.display = 'flex';
        console.log('Transitioned to countdown screen');

        // Start the countdown
        startCountdownTimer(endTime);
    }

    // Function to start the countdown timer
    function startCountdownTimer(endTime) {
        console.log('Starting countdown timer');
        // Clear any existing countdown
        clearInterval(countdownInterval);

        // Update the countdown every second
        countdownInterval = setInterval(() => {
            const currentTime = new Date();
            const distance = endTime - currentTime;

            if (distance < 0) {
                clearInterval(countdownInterval);
                timeDisplay.textContent = "Class has ended!";
                console.log('Countdown finished');

                // Play alarm sound
                if (alarmSound) {
                    alarmSound.play().catch(error => {
                        console.error('Error playing alarm sound:', error);
                    });
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

    // Tab switching functionality
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');

            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));

            // Hide all tab contents
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab and show corresponding content
            tab.classList.add('active');
            document.getElementById(target).classList.add('active');

            // Update currentTab variable
            currentTab = target;
            console.log(`Switched to tab: ${target}`);
        });
    });

    // Initial class status update
    updateClassStatus();

    // Update class status every second
    setInterval(updateClassStatus, 1000);

    // Form submission handler for setting end time (Retain original functionality)
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const endTimeValue = endTimeInput.value;
        console.log('Form submitted with endTime:', endTimeValue);
        if (!endTimeValue) {
            console.error('No end time provided.');
            return;
        }

        const endTime = parseTime(endTimeValue);
        if (!endTime) {
            alert('Invalid time format. Please enter time in HH:MM format.');
            return;
        }

        const now = new Date();
        if (endTime <= now) {
            // 如果今天的时间已经过了，设置为明天
            endTime.setDate(endTime.getDate() + 1);
            console.log('End time was earlier today. Setting for the next day.');
        }

        // 存储 endTime
        localStorage.setItem('endTime', endTime.toISOString());
        console.log('End Time stored:', endTime.toISOString());

        // 切换到倒计时屏幕
        setupScreen.style.display = 'none';
        countdownScreen.style.display = 'flex';
        console.log('Transitioned to countdown screen');

        // 开始倒计时
        startCountdownTimer(endTime);
    });

    // Start Countdown Button handler
    if (startCountdownButton) {
        startCountdownButton.addEventListener('click', () => {
            console.log('Start Countdown button clicked');
            const storedEndTime = localStorage.getItem('endTime');
            console.log('Stored End Time retrieved:', storedEndTime);
            if (storedEndTime) {
                const endTime = new Date(storedEndTime);
                console.log('Parsed End Time:', endTime);
                startCountdownTimer(endTime);
                // 切换到倒计时屏幕
                setupScreen.style.display = 'none';
                countdownScreen.style.display = 'flex';
                console.log('Transitioned to countdown screen');
            } else {
                console.error('No end time found in localStorage.');
                alert('No end time set. Please set the countdown time first.');
            }
        });
    } else {
        console.error('Start Countdown button not found!');
    }

    // Exit button handler
    exitButton.addEventListener('click', () => {
        console.log('Exit Countdown button clicked');
        // Clear the countdown
        clearInterval(countdownInterval);
        countdownScreen.style.display = 'none';
        setupScreen.style.display = 'block';
        console.log('Returned to setup screen');

        // Clear the stored end time
        localStorage.removeItem('endTime');
        console.log('End Time cleared from localStorage');

        // Return to the active tab (Class Status)
        if (currentTab === 'classStatus') {
            document.querySelector('.tab-button[data-tab="classStatus"]').classList.add('active');
            document.getElementById('classStatus').classList.add('active');
            document.querySelector('.tab-button[data-tab="setTime"]').classList.remove('active');
            document.getElementById('setTime').classList.remove('active');
            console.log('Switched back to Class Status tab');
        } else {
            // Default to returning to Set Time tab
            document.querySelector('.tab-button[data-tab="setTime"]').classList.add('active');
            document.getElementById('setTime').classList.add('active');
            document.querySelector('.tab-button[data-tab="classStatus"]').classList.remove('active');
            document.getElementById('classStatus').classList.remove('active');
            console.log('Switched back to Set Time tab');
        }
    });

    // Theme selection handler for setup screen
    themeSelect.addEventListener('change', (e) => {
        const selectedTheme = e.target.value;
        applyTheme(selectedTheme);
        // Store the selected theme
        localStorage.setItem('selectedTheme', selectedTheme);
        console.log(`Theme selected: ${selectedTheme}`);
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
            console.log(`Theme selected: ${selectedTheme}`);
            // Update setup screen theme selector
            themeSelect.value = selectedTheme;
        });
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
