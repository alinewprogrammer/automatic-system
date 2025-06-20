document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const screen = document.getElementById("screen");
    const startStopButton = document.getElementById('startStopButton');
    const resetButton = document.getElementById('resetButton');
    const pomodoroBtn = document.getElementById('pomodoro');
    const shortBreakBtn = document.getElementById('shortBreak');
    const longBreakBtn = document.getElementById('longBreak');

    // Timer State
    let minutes = 25;
    let seconds = 0;
    let timerInterval = null;
    let isTimerRunning = false;
    let currentMode = 'pomodoro';
    let pomodorosCompleted = 0;

    const modes = {
        pomodoro: 25,
        shortBreak: 5,
        longBreak: 15
    };

    // --- Core Functions ---

    function updateDisplay() {
        screen.value = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        document.title = `${screen.value} - ${currentMode.charAt(0).toUpperCase() + currentMode.slice(1)}`;
    }

    function updateBodyBackground() {
        document.body.className = ''; // Clear existing classes
        if (currentMode === 'pomodoro') {
            document.body.classList.add('pomodoro-bg');
        } else if (currentMode === 'shortBreak') {
            document.body.classList.add('short-break-bg');
        } else if (currentMode === 'longBreak') {
            document.body.classList.add('long-break-bg');
        }
    }

    function changeMode(mode) {
        stopTimer(); // Stop the timer when changing modes
        currentMode = mode;
        minutes = modes[mode];
        seconds = 0;

        // Update active button style
        document.querySelectorAll('.mode-buttons button').forEach(btn => btn.classList.remove('active'));
        document.getElementById(mode).classList.add('active');
        
        updateBodyBackground();
        updateDisplay();
    }

    function tick() {
        if (seconds === 0) {
            if (minutes === 0) {
                // Timer finished
                if (currentMode === 'pomodoro') {
                    pomodorosCompleted++;
                }
                rotateMode();
                return;
            }
            minutes--;
            seconds = 59;
        } else {
            seconds--;
        }
        updateDisplay();
    }

    // Automatically switch to the next mode in the cycle
    function rotateMode() {
        stopTimer();
        // After 4 pomodoros, take a long break. Otherwise, take a short break.
        if (currentMode === 'pomodoro') {
            if (pomodorosCompleted % 4 === 0) {
                changeMode('longBreak');
            } else {
                changeMode('shortBreak');
            }
        } else {
            // After any break, return to pomodoro
            changeMode('pomodoro');
        }
        // Auto-start the next session
        startTimer();
    }

    // --- Control Functions ---

    function startTimer() {
        if (isTimerRunning) return; // Prevent multiple intervals

        isTimerRunning = true;
        startStopButton.textContent = 'PAUSE';
        timerInterval = setInterval(tick, 1000);
    }

    function stopTimer() {
        isTimerRunning = false;
        startStopButton.textContent = 'START';
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    function resetTimer() {
        stopTimer();
        minutes = modes[currentMode];
        seconds = 0;
        updateDisplay();
    }

    // --- Event Listeners ---

    startStopButton.addEventListener('click', () => {
        if (isTimerRunning) {
            stopTimer();
        } else {
            startTimer();
        }
    });

    resetButton.addEventListener('click', resetTimer);

    pomodoroBtn.addEventListener('click', () => changeMode('pomodoro'));
    shortBreakBtn.addEventListener('click', () => changeMode('shortBreak'));
    longBreakBtn.addEventListener('click', () => changeMode('longBreak'));

    // --- Initial Setup ---
    function init() {
        changeMode('pomodoro');
    }
    
    init();
});