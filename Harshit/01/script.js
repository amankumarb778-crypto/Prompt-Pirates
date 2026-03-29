
// Initialize Lucide Icons
lucide.createIcons();

/* =========================================
   SCROLL INTERSECTION OBSERVER (VISUALS)
========================================= */
const storySections = document.querySelectorAll('.story-section');

const observerOptions = {
    root: document.querySelector('#story-container'),
    threshold: 0.35 // Lowered threshold for a smoother trigger on free scrolling
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Change ambient music based on section
            changeAudioMood(entry.target.id);

            // Sync dot navigation
            document.querySelectorAll('.nav-dot').forEach(dot => {
                dot.classList.toggle('active-dot', dot.dataset.target === entry.target.id);
            });
        }
    });
}, observerOptions);

storySections.forEach(section => {
    sectionObserver.observe(section);
});

/* =========================================
   NEXT LEVEL: CUSTOM CURSOR & PARALLAX ENGINE
========================================= */
const cursor = document.getElementById('custom-cursor');
const glow = document.getElementById('cursor-glow');

// Hide native cursor only if it's a device with a fine pointer (like a mouse)
// Also disable the custom cursor visual on touch devices so it doesn't get stuck
if (window.matchMedia("(pointer: fine)").matches) {
    document.body.style.cursor = 'none';
} else {
    if (cursor) cursor.style.display = 'none';
    if (glow) glow.style.display = 'none';
}

document.addEventListener('mousemove', (e) => {
    // Update custom cursor positions
    if (cursor && glow) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    }

    // Dynamic Background Parallax based on mouse movement
    const x = (e.clientX - window.innerWidth / 2) / 30;
    const y = (e.clientY - window.innerHeight / 2) / 30;
    storySections.forEach(section => {
        section.style.backgroundPosition = `calc(50% + ${x}px) calc(50% + ${y}px)`;
    });
});

// Make the custom cursor react to interactive elements
document.querySelectorAll('button, a, .nav-dot').forEach(el => {
    el.addEventListener('mouseenter', () => {
        if (cursor) {
            cursor.style.transform = 'translate(-50%, -50%) scale(3.5)';
            cursor.style.backgroundColor = 'transparent';
            cursor.style.border = '1px solid rgba(255, 255, 255, 0.8)';
        }
    });
    el.addEventListener('mouseleave', () => {
        if (cursor) {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursor.style.backgroundColor = 'white';
            cursor.style.border = 'none';
        }
    });
});

// Click logic for smooth dot navigation
document.querySelectorAll('.nav-dot').forEach(dot => {
    dot.addEventListener('click', () => {
        document.getElementById(dot.dataset.target).scrollIntoView({ behavior: 'smooth' });
    });
});

/* =========================================
   WEB AUDIO API - DYNAMIC AMBIENT ENGINE
========================================= */
let audioCtx;
let masterGain;
let activeOscillators = [];

// Define musical "moods" for each section using chord frequencies
const moods = {
    'intro': {
        frequencies: [261.63, 329.63, 392.00], // C4 Major (Calm, hopeful)
        type: 'sine',
        volume: 0.15
    },
    'plot1': {
        frequencies: [65.41, 98.00], // C2, G2 (Low, empty, drone)
        type: 'triangle',
        volume: 0.25
    },
    'plot2': {
        frequencies: [523.25, 587.33, 783.99, 1046.50], // C5, D5, G5, C6 (High, shimmering, mysterious)
        type: 'sine',
        volume: 0.08
    },
    'conclusion': {
        frequencies: [174.61, 220.00, 261.63, 329.63], // F3 Major 7th (Warm, triumphant)
        type: 'sine',
        volume: 0.2
    }
};

function initAudio() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    masterGain = audioCtx.createGain();
    masterGain.connect(audioCtx.destination);
    masterGain.gain.value = 0; // Start silent

    // Add a lowpass filter to make it sound more "ambient" and less harsh
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;
    masterGain.connect(filter);
    filter.connect(audioCtx.destination);
}

function changeAudioMood(sectionId) {
    if (!audioCtx) return;

    const mood = moods[sectionId];
    if (!mood) return;

    // Fade out current master gain smoothly
    masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 1.5);

    setTimeout(() => {
        // Stop and clear old oscillators
        activeOscillators.forEach(osc => {
            osc.stop();
            osc.disconnect();
        });
        activeOscillators = [];

        // Create new oscillators for the new mood
        mood.frequencies.forEach(freq => {
            const osc = audioCtx.createOscillator();
            const oscGain = audioCtx.createGain();

            osc.type = mood.type;

            // Add slight detune for richness
            osc.frequency.value = freq + (Math.random() * 2 - 1);

            osc.connect(oscGain);
            oscGain.connect(masterGain);

            // Balance individual oscillator volumes
            oscGain.gain.value = 1 / mood.frequencies.length;

            osc.start();
            activeOscillators.push(osc);
        });

        // Fade in new master gain smoothly
        masterGain.gain.setTargetAtTime(mood.volume, audioCtx.currentTime, 2.0);
    }, 1500); // Wait for fade out to complete
}

/* =========================================
   START SCREEN LOGIC
========================================= */
const startBtn = document.getElementById('start-btn');
const startScreen = document.getElementById('start-screen');
const storyContainer = document.getElementById('story-container');

startBtn.addEventListener('click', () => {
    // Initialize Audio
    initAudio();

    // Fade out start screen
    startScreen.classList.add('opacity-0');

    setTimeout(() => {
        startScreen.style.display = 'none';

        // Show and enable story container
        storyContainer.classList.remove('hidden');
        storyContainer.classList.remove('pointer-events-none');

        // Slight delay before fading in
        requestAnimationFrame(() => {
            storyContainer.classList.remove('opacity-0');
        });

        // Trigger the first section manually to start the music and animations
        document.getElementById('intro').classList.add('active');
        changeAudioMood('intro');

        // Fade in interactive dot navigation
        document.getElementById('dot-nav').classList.remove('opacity-0', 'pointer-events-none');

    }, 1000);
});