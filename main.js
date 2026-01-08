/**
 * HOSHII EIMU OFFICIAL COMMAND CENTER
 * SYSTEM CORE v4.5
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Systems
    initBootSequence();
    initAudioSystem();
    initCursorSystem();
    initClock();
    initGlitchEffect();
    initEasterEgg();
    
    // Load Schedule if present
    if (typeof weeklySchedule !== 'undefined') {
        renderSchedule();
    } else {
        const schContainer = document.getElementById('schedule-list');
        if (schContainer) schContainer.innerHTML = '<div style="color:red">> ERROR: schedule.js NOT FOUND</div>';
    }

    // Modal Global Handling
    window.onclick = function (event) {
        if (event.target.classList.contains('modal-overlay')) {
            closeModal(event.target.id);
        }
    }
});

/* --- 1. Boot Sequence --- */
function initBootSequence() {
    const bootScreen = document.getElementById('boot-screen');
    if (!bootScreen) return;

    // Create scrolling log container
    const logContainer = document.createElement('div');
    logContainer.className = 'boot-log';
    bootScreen.appendChild(logContainer);

    const logs = [
        "INITIALIZING BIOS...",
        "CHECKING MEMORY INTEGRITY... OK",
        "LOADING KERNEL... v4.5.2",
        "MOUNTING FILE SYSTEM... OK",
        "CONNECTING TO NEURAL NET...",
        "ESTABLISHING SECURE LINK...",
        "DECRYPTING USER PROFILE...",
        "LOADING ASSETS...",
        "CONFIGURING AUDIO SUBSYSTEM...",
        "SYSTEM_READY"
    ];

    let delay = 0;
    logs.forEach((log, index) => {
        setTimeout(() => {
            const p = document.createElement('div');
            p.innerText = `> ${log}`;
            logContainer.appendChild(p);
            logContainer.scrollTop = logContainer.scrollHeight;
        }, delay);
        delay += Math.random() * 300 + 100;
    });

    // Hide boot screen
    setTimeout(() => {
        bootScreen.style.opacity = '0';
        setTimeout(() => {
            bootScreen.style.display = 'none';
        }, 500);
    }, 2800);
}

/* --- 2. Audio System (Persistent) --- */
let isSoundEnabled = false;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function initAudioSystem() {
    const savedState = localStorage.getItem('hoshii_audio_enabled');
    if (savedState === 'true') {
        isSoundEnabled = true;
        updateAudioUI();
    }
}

function toggleSound() {
    isSoundEnabled = !isSoundEnabled;
    localStorage.setItem('hoshii_audio_enabled', isSoundEnabled);
    updateAudioUI();
    if (isSoundEnabled) playClickSound();
}

function updateAudioUI() {
    const btn = document.getElementById('audio-toggle');
    if (btn) {
        btn.innerText = isSoundEnabled ? "[AUDIO: ON]" : "[AUDIO: OFF]";
        btn.style.color = isSoundEnabled ? "var(--neon-green)" : "#555";
    }
}

function playHoverSound() {
    if (!isSoundEnabled) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.05);

    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
}

function playClickSound() {
    if (!isSoundEnabled) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

/* --- 3. Cursor System --- */
function initCursorSystem() {
    const cursorMain = document.getElementById('cursor-main');
    const cursorRing = document.getElementById('cursor-ring');
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice && cursorMain && cursorRing) {
        window.addEventListener('mousemove', (e) => {
            cursorMain.style.left = e.clientX + 'px';
            cursorMain.style.top = e.clientY + 'px';
            
            // Parallax Effect (Simple)
            const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
            const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
            document.body.style.backgroundPosition = `${moveX}px ${moveY}px`;

            setTimeout(() => {
                cursorRing.style.left = e.clientX + 'px';
                cursorRing.style.top = e.clientY + 'px';
            }, 50);
        });

        const interactables = document.querySelectorAll('a, button, .link-btn, .close-btn, .nav-item, #audio-toggle');
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('hovering');
                playHoverSound();
            });
            el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
            el.addEventListener('click', playClickSound);
        });
    }
}

/* --- 4. Glitch Text Effect --- */
function initGlitchEffect() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";
    const targets = document.querySelectorAll('.nav-item a, h1, .glitch-target');

    targets.forEach(target => {
        target.addEventListener('mouseover', event => {
            let iteration = 0;
            const originalText = event.target.dataset.value || event.target.innerText;
            if(!event.target.dataset.value) event.target.dataset.value = originalText;

            clearInterval(event.target.interval);

            event.target.interval = setInterval(() => {
                event.target.innerText = originalText
                    .split("")
                    .map((letter, index) => {
                        if (index < iteration) {
                            return originalText[index];
                        }
                        return letters[Math.floor(Math.random() * 26)];
                    })
                    .join("");

                if (iteration >= originalText.length) {
                    clearInterval(event.target.interval);
                }
                iteration += 1 / 3;
            }, 30);
        });
    });
}

/* --- 5. Easter Egg (Konami Code) --- */
function initEasterEgg() {
    const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let inputPos = 0;

    document.addEventListener('keydown', (e) => {
        if (e.key === code[inputPos]) {
            inputPos++;
            if (inputPos === code.length) {
                activateEmergencyMode();
                inputPos = 0;
            }
        } else {
            inputPos = 0;
        }
    });
}

function activateEmergencyMode() {
    document.body.classList.toggle('emergency-mode');
    const status = document.querySelector('.system-status span:first-child');
    
    if (document.body.classList.contains('emergency-mode')) {
        if(status) status.innerText = "STATUS: EMERGENCY ALERT ●";
        playClickSound(); // Alert sound placeholder
        alert(">> EMERGENCY PROTOCOL INITIATED <<");
    } else {
        if(status) status.innerText = "STATUS: ONLINE ●";
    }
}

/* --- 6. Utilities --- */
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ms = String(Math.floor(now.getMilliseconds() / 10)).padStart(2, '0');
    
    const clockDisplay = document.getElementById('clock-display');
    if(clockDisplay) clockDisplay.innerText = `${hours}:${minutes}:${seconds}:${ms}`;
}

function initClock() {
    setInterval(updateClock, 30);
    updateClock();
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 300);
    }
}

function copyPageUrl() {
    const url = "https://eimu-hoshii.github.io/";
    const btn = document.getElementById('copy-btn');

    navigator.clipboard.writeText(url).then(() => {
        if(btn) {
            btn.innerText = "[ COPIED! ]";
            btn.style.borderColor = "var(--neon-green)";
            btn.style.color = "var(--neon-green)";
            btn.style.boxShadow = "0 0 10px var(--neon-green)";
            
            if (isSoundEnabled) playClickSound();

            setTimeout(() => {
                btn.innerText = "[ COPY URL ]";
                btn.style.borderColor = "var(--neon-purple)";
                btn.style.color = "#fff";
                btn.style.boxShadow = "none";
            }, 2000);
        }
    });
}

function renderSchedule() {
    const container = document.getElementById('schedule-list');
    if(!container) return;

    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const today = days[new Date().getDay()];

    let html = '';
    weeklySchedule.forEach(item => {
        const isActive = item.day === today ? 'active-day' : '';
        const activeBadge = item.day === today ? '<span class="active-badge">◀ ACTIVE</span>' : '';

        html += `
            <div class="schedule-row ${isActive}">
                <div class="sch-day">${item.day}</div>
                <div class="sch-time">${item.time}</div>
                <div class="sch-content">${item.content}${activeBadge}</div>
            </div>
        `;
    });
    container.innerHTML = html;
}
