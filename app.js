// app.js

document.addEventListener('DOMContentLoaded', () => {
    // 主题相关的元素
    const themeSelect = document.getElementById('themeSelect');
    const themeSelectCountdown = document.getElementById('themeSelectCountdown');
    const themeLink = document.getElementById('theme-link');

    // 标签相关的元素
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // 设置屏幕相关的元素
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

    /**
     * 应用选定的主题，通过更新主题链接的 href 属性
     * @param {string} theme - 要应用的主题名称
     */
    function applyTheme(theme) {
        themeLink.href = `themes/${theme}.css`;
        console.log(`Applied theme: ${theme}`);
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
     * 初始化主题设置
     */
    loadStoredTheme();
    handleThemeSelection();

    /**
     * 处理标签导航，通过激活选中的标签并显示相应内容
     */
    function handleTabNavigation() {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // 移除所有按钮的 active 类
                tabButtons.forEach(btn => btn.classList.remove('active'));
                // 为点击的按钮添加 active 类
                button.classList.add('active');

                // 隐藏所有标签内容
                tabContents.forEach(content => content.classList.remove('active'));
                // 显示选中的标签内容
                const selectedTab = button.getAttribute('data-tab');
                document.getElementById(selectedTab).classList.add('active');
            });
        });
    }

    handleTabNavigation();

    /**
     * 开始倒计时
     * @param {number} endTime - 倒计时结束的时间戳（毫秒）
     */
    function startCountdown(endTime) {
        // 清除任何现有的倒计时
        clearInterval(countdownInterval);

        countdownInterval = setInterval(() => {
            const now = new Date().getTime();
            const distance = endTime - now;

            if (distance < 0) {
                clearInterval(countdownInterval);
                timeDisplay.textContent = '00:00:00';
                remainingTimeText.textContent = 'Time Up!';
                alarmSound.play();
                return;
            }

            // 计算小时、分钟和秒
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // 显示结果
            timeDisplay.textContent = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
        }, 1000);
    }

    /**
     * 如果数字小于 10，添加前导零
     * @param {number} num - 要格式化的数字
     * @returns {string} - 格式化后的字符串
     */
    function padZero(num) {
        return num < 10 ? `0${num}` : `${num}`;
    }

    /**
     * 处理设置时间表单的提交事件
     */
    timeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const timeValue = endTimeInput.value;
        if (!timeValue) {
            alert('Please enter a valid time.');
            return;
        }

        const [hours, minutes] = timeValue.split(':').map(Number);
        const now = new Date();
        let endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);

        // 如果结束时间早于当前时间，设置为第二天
        if (endTime.getTime() <= now.getTime()) {
            endTime.setDate(endTime.getDate() + 1);
        }

        countdownEndTime = endTime.getTime();
        startCountdown(countdownEndTime);

        // 切换到倒计时屏幕
        document.getElementById('setupScreen').style.display = 'none';
        countdownScreen.style.display = 'flex';
    });

    /**
     * 处理 "Start Countdown" 按钮在 Class Status 标签中的点击事件
     */
    startCountdownButton.addEventListener('click', () => {
        // 提示用户输入结束时间
        const timeValue = prompt('Enter Class End Time (Format: HH:MM, e.g., 15:30):');
        if (!timeValue) {
            alert('Time input cancelled.');
            return;
        }

        const timeParts = timeValue.split(':');
        if (timeParts.length !== 2) {
            alert('Invalid time format. Please use HH:MM format.');
            return;
        }

        const [hours, minutes] = timeParts.map(Number);
        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            alert('Invalid time. Please enter a valid time in HH:MM format.');
            return;
        }

        const now = new Date();
        let endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);

        // 如果结束时间早于当前时间，设置为第二天
        if (endTime.getTime() <= now.getTime()) {
            endTime.setDate(endTime.getDate() + 1);
        }

        countdownEndTime = endTime.getTime();
        startCountdown(countdownEndTime);

        // 切换到倒计时屏幕
        document.getElementById('setupScreen').style.display = 'none';
        countdownScreen.style.display = 'flex';
    });

    /**
     * 处理倒计时屏幕中的 "Exit" 按钮点击事件
     */
    exitButton.addEventListener('click', () => {
        clearInterval(countdownInterval);
        countdownScreen.style.display = 'none';
        document.getElementById('setupScreen').style.display = 'flex';
    });

    /**
     * 更新 Class Status 标签中的当前时间和状态
     */
    function updateClassStatus() {
        setInterval(() => {
            const now = new Date();
            const currentTime = now.toLocaleTimeString();
            currentTimeDisplay.textContent = `Current Time: ${currentTime}`;

            if (countdownEndTime) {
                const distance = countdownEndTime - now.getTime();
                if (distance > 0) {
                    currentClassDisplay.textContent = 'Current Status: Countdown Active';
                } else {
                    currentClassDisplay.textContent = 'Current Status: Time Up!';
                }
            } else {
                currentClassDisplay.textContent = 'Current Status: No Countdown Set';
            }
        }, 1000);
    }

    updateClassStatus();

    /**
     * 初始化应用程序，确保倒计时屏幕隐藏，设置屏幕显示
     */
    function initializeApp() {
        countdownScreen.style.display = 'none';
        document.getElementById('setupScreen').style.display = 'flex';
    }

    initializeApp();
});
