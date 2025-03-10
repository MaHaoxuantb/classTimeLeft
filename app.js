// app.js

document.addEventListener('DOMContentLoaded', () => {
    // 主题相关的元素
    const themeSelect = document.getElementById('themeSelect');
    const themeSelectCountdown = document.getElementById('themeSelectCountdown');
    const themeLink = document.getElementById('theme-link');
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');

    // 标签相关的元素
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // 设置屏幕相关的元素
    const setupScreen = document.getElementById('setupScreen');
    const timeForm = document.getElementById('timeForm');
    const endTimeInput = document.getElementById('endTime');

    // 倒计时屏幕相关的元素
    const countdownScreen = document.getElementById('countdownScreen');
    const timeDisplay = document.getElementById('timeDisplay');
    const remainingTimeText = document.getElementById('remainingTimeText');
    const exitButton = document.getElementById('exitButton');
    const alarmSound = document.getElementById('alarmSound');

    // 类状态相关的元素
    const currentTimeDisplay = document.getElementById('currentTime');
    const currentClassDisplay = document.getElementById('currentClass');
    const startCountdownButton = document.getElementById('startCountdownButton');

    let countdownInterval; // 存储倒计时的 interval ID
    let countdownEndTime;  // 存储倒计时的结束时间

    // 定义主题颜色对应关系
    const themeColors = {
        default: '#007BFF',      // 默认主题颜色
        dark: '#1f6feb',         // 深色主题颜色
        solarized: '#268bd2',    // Solarized 主题颜色
        monokai: '#66d9ef',      // Monokai 主题颜色
        pink: '#ff66b2'           // 浅粉色主题颜色
    };

    // 定义课程表（示例时间表，可根据需要调整）
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
        { name: 'Welcome to night, child', start: '22:15', end: '06:10' } // 跨日课程
    ];

    /**
     * 应用选定的主题，通过更新主题链接的 href 属性和meta主题颜色
     * @param {string} theme - 要应用的主题名称
     */
    function applyTheme(theme) {
        themeLink.href = `themes/${theme}.css`;
        console.log(`Applied theme: ${theme}`);

        // 更新 meta theme-color
        if (themeColors[theme]) {
            metaThemeColor.setAttribute('content', themeColors[theme]);
        } else {
            // 如果主题未定义，使用默认主题颜色
            metaThemeColor.setAttribute('content', themeColors['default']);
        }
    }

    /**
     * 同步设置屏幕和倒计时屏幕的主题选择器
     * @param {string} selectedTheme - 用户选择的主题
     */
    function synchronizeThemes(selectedTheme) {
        themeSelect.value = selectedTheme;
        if (themeSelectCountdown) {
            themeSelectCountdown.value = selectedTheme;
        }
    }

    /**
     * 从 localStorage 加载存储的主题，或者应用默认主题
     */
    function loadStoredTheme() {
        const storedTheme = localStorage.getItem('selectedTheme') || 'default';
        applyTheme(storedTheme);
        synchronizeThemes(storedTheme);
    }

    /**
     * 将选定的主题存储到 localStorage
     * @param {string} theme - 要存储的主题
     */
    function storeSelectedTheme(theme) {
        localStorage.setItem('selectedTheme', theme);
    }

    /**
     * 处理主题选择器的变化事件
     */
    function handleThemeSelection() {
        // 设置屏幕的主题选择器事件监听
        themeSelect.addEventListener('change', (e) => {
            const selectedTheme = e.target.value;
            applyTheme(selectedTheme);
            synchronizeThemes(selectedTheme);
            storeSelectedTheme(selectedTheme);
        });

        // 倒计时屏幕的主题选择器事件监听
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
     * 处理标签导航，通过激活选中的标签并显示相应内容
     */
    function handleTabNavigation() {
        tabButtons.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.getAttribute('data-tab');

                // Remove active class from all tabs
                tabButtons.forEach(t => t.classList.remove('active'));

                // Hide all tab contents
                tabContents.forEach(content => content.classList.remove('active'));

                // Add active class to clicked tab and show corresponding content
                tab.classList.add('active');
                document.getElementById(target).classList.add('active');

                console.log(`Switched to tab: ${target}`);
            });
        });
    }

    /**
     * 解析时间字符串 "HH:MM" 为 Date 对象（基于今天或明天的日期）
     * @param {string} timeStr - 时间字符串，格式为 "HH:MM"
     * @param {boolean} isNextDay - 是否基于明天的日期
     * @returns {Date|null} - 返回 Date 对象或 null（如果格式无效）
     */
    function parseTime(timeStr, isNextDay = false) {
        const timeParts = timeStr.split(':').map(Number);
        if (timeParts.length !== 2 || timeParts.some(isNaN)) {
            console.error(`Invalid time format: ${timeStr}`);
            return null;
        }
        const [hours, minutes] = timeParts;
        const now = new Date();
        let date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
        if (isNextDay) {
            date.setDate(date.getDate() + 1);
        }
        return date;
    }

    /**
     * 判断当前时间属于哪个课程
     * @returns {Object} - 包含状态、课程名称和结束时间
     */
    function getCurrentClass() {
        const now = new Date();
        console.log('Checking current class status at:', now);
        for (let i = 0; i < classSchedule.length; i++) {
            const classStartStr = classSchedule[i].start;
            const classEndStr = classSchedule[i].end;
            const isCrossDay = classStartStr > classEndStr; // 如果开始时间大于结束时间，则跨日

            const classStart = parseTime(classStartStr);
            let classEnd;
            if (isCrossDay) {
                if (now >= classStart) {
                    // 如果当前时间在课程开始之后，设置结束时间为明天
                    classEnd = parseTime(classEndStr, true);
                } else {
                    // 如果当前时间在课程开始之前，设置结束时间为今天
                    classEnd = parseTime(classEndStr);
                }
            } else {
                classEnd = parseTime(classEndStr);
            }

            if (!classStart || !classEnd) {
                console.error(`Failed to parse time for ${classSchedule[i].name}`);
                continue;
            }

            // 检查当前时间是否在课程时间内
            if (now >= classStart && now <= classEnd) {
                console.log(`Currently in ${classSchedule[i].name}`);
                return { status: 'In Class', className: classSchedule[i].name, endTime: classEnd };
            }

            // 检查课间时间
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
     * 更新当前时间和课程状态
     */
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
                const endTime = current.endTime; // 已经是 Date 对象
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
            // 如果不在课堂期间，清除 localStorage 中的 endTime
            localStorage.removeItem('endTime');
            console.log('End Time cleared from localStorage.');
        }
    }

    /**
     * 开始倒计时
     * @param {Date} endTime - 倒计时结束的时间对象
     */
    function startCountdown(endTime) {
        // 清除任何现有的倒计时
        clearInterval(countdownInterval);

        // 存储倒计时结束时间
        countdownEndTime = endTime.getTime();
        localStorage.setItem('endTime', endTime.toISOString());
        console.log(`Countdown started with End Time: ${endTime.toISOString()}`);

        // 切换到倒计时屏幕
        setupScreen.style.display = 'none';
        countdownScreen.style.display = 'flex';
        console.log('Transitioned to countdown screen');

        // 开始倒计时
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
                // 清除存储的 endTime
                localStorage.removeItem('endTime');
                return;
            }

            // 计算小时、分钟和秒
            const hoursLeft = Math.floor((distance / (1000 * 60 * 60)) % 24);
            const minutesLeft = Math.floor((distance / (1000 * 60)) % 60);
            const secondsLeft = Math.floor((distance / 1000) % 60);

            // 更新倒计时显示
            timeDisplay.textContent = `${pad(hoursLeft)}:${pad(minutesLeft)}:${pad(secondsLeft)}`;
            remainingTimeText.textContent = 'Remaining Time';
        }, 1000);
    }

    /**
     * Helper function to pad numbers with leading zeros
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
            alert('Please enter a valid time.');
            return;
        }

        const endTime = parseTime(timeValue);
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
        startCountdown(endTime);
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
        // 清除倒计时
        clearInterval(countdownInterval);
        countdownScreen.style.display = 'none';
        setupScreen.style.display = 'flex';
        console.log('Returned to setup screen');

        // 清除存储的 endTime
        localStorage.removeItem('endTime');
        console.log('End Time cleared from localStorage.');

        // 更新 Class Status 状态
        updateClassStatus();
    });

    /**
     * 初始化主题设置
     */
    loadStoredTheme();
    handleThemeSelection();
    handleTabNavigation();

    // 初始调用
    updateClassStatus();

    // 每秒更新一次课程状态
    setInterval(updateClassStatus, 1000);
});