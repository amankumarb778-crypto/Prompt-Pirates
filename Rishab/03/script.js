/* ═══════════════════════════════════════════════════════════
   GLOBAL WAR MONITOR 2026 — script.js
   Covers: Cursor · Canvas · Scroll Progress · Nav ·
           Conflict Filter · Map Tooltips · Bar Charts ·
           Donut Chart · Counter Animation · Timeline Reveal ·
           Web Audio Music Engine · Mobile Menu
═══════════════════════════════════════════════════════════ */

/* ════════════════════════════════════
   1. CURSOR
════════════════════════════════════ */
const dot = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
});
(function trackRing() {
    rx += (mx - rx) * .13; ry += (my - ry) * .13;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(trackRing);
})();
document.querySelectorAll('button,a,.conflict-card,.conflict-pin,.filter-btn,.timeline-item').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-big'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-big'));
});

/* ════════════════════════════════════
   2. SCROLL PROGRESS BAR
════════════════════════════════════ */
const progressBar = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    progressBar.style.width = (pct * 100) + '%';
}, { passive: true });

/* ════════════════════════════════════
   3. MOBILE HAMBURGER MENU
════════════════════════════════════ */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
});
document.querySelectorAll('#mobile-menu a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

/* ════════════════════════════════════
   4. ACTIVE NAV HIGHLIGHT
════════════════════════════════════ */
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');

const navObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
        }
    });
}, { threshold: .35, rootMargin: '-82px 0px 0px 0px' });
sections.forEach(s => navObs.observe(s));

/* ════════════════════════════════════
   5. HERO PARTICLE CANVAS
════════════════════════════════════ */
const heroCanvas = document.getElementById('hero-canvas');
const hCtx = heroCanvas.getContext('2d');
let hW, hH, heroParticles = [];

function resizeHero() {
    hW = heroCanvas.width = heroCanvas.offsetWidth;
    hH = heroCanvas.height = heroCanvas.offsetHeight;
}
resizeHero();
window.addEventListener('resize', resizeHero);

const NODE_COUNT = 90;
for (let i = 0; i < NODE_COUNT; i++) {
    heroParticles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - .5) * .04,
        vy: (Math.random() - .5) * .04,
        r: Math.random() * 1.2 + .3,
        alpha: Math.random() * .6 + .15,
        color: Math.random() > .7 ? '192,57,43' : Math.random() > .5 ? '212,130,10' : '93,109,126'
    });
}

function drawHero() {
    hCtx.clearRect(0, 0, hW, hH);
    // Update positions
    heroParticles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = 100; if (p.x > 100) p.x = 0;
        if (p.y < 0) p.y = 100; if (p.y > 100) p.y = 0;
    });
    // Draw connections
    heroParticles.forEach((a, i) => {
        heroParticles.slice(i + 1).forEach(b => {
            const dx = (a.x - b.x) * hW / 100;
            const dy = (a.y - b.y) * hH / 100;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 90) {
                hCtx.beginPath();
                hCtx.moveTo(a.x * hW / 100, a.y * hH / 100);
                hCtx.lineTo(b.x * hW / 100, b.y * hH / 100);
                hCtx.strokeStyle = `rgba(192,57,43,${(.25 * (1 - dist / 90))})`;
                hCtx.lineWidth = .4;
                hCtx.stroke();
            }
        });
    });
    // Draw nodes
    heroParticles.forEach(p => {
        hCtx.beginPath();
        hCtx.arc(p.x * hW / 100, p.y * hH / 100, p.r, 0, Math.PI * 2);
        hCtx.fillStyle = `rgba(${p.color},${p.alpha})`;
        hCtx.fill();
    });
    requestAnimationFrame(drawHero);
}
drawHero();

/* ════════════════════════════════════
   6. ANIMATED COUNTERS
════════════════════════════════════ */
function animateCounter(el, target, duration = 2000, suffix = '') {
    let start = null;
    const num = parseFloat(target.replace(/[^0-9.]/g, ''));
    const isDecimal = target.includes('.');
    function step(ts) {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        const val = num * ease;
        el.textContent = (isDecimal ? val.toFixed(1) : Math.floor(val)).toLocaleString() + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
    }
    requestAnimationFrame(step);
}

const counterObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            const el = e.target;
            animateCounter(el, el.dataset.target, 2200, el.dataset.suffix || '');
            counterObs.unobserve(el);
        }
    });
}, { threshold: .5 });
document.querySelectorAll('[data-target]').forEach(el => counterObs.observe(el));

/* ════════════════════════════════════
   7. BAR CHART ANIMATION
════════════════════════════════════ */
const barObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.querySelectorAll('.bar-fill').forEach(bar => {
                bar.style.width = bar.dataset.width + '%';
            });
            barObs.unobserve(e.target);
        }
    });
}, { threshold: .3 });
document.querySelectorAll('.chart-panel').forEach(p => barObs.observe(p));

/* ════════════════════════════════════
   8. AID BAR ANIMATION
════════════════════════════════════ */
const aidObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.querySelectorAll('.aid-bar-fill').forEach(b => {
                b.style.width = b.dataset.width + '%';
            });
            aidObs.unobserve(e.target);
        }
    });
}, { threshold: .3 });
document.querySelectorAll('.aid-section').forEach(s => aidObs.observe(s));

/* ════════════════════════════════════
   9. DONUT CHART (SVG)
════════════════════════════════════ */
function buildDonut() {
    const data = [
        { label: 'Ukraine–Russia', pct: 38, color: '#c0392b' },
        { label: 'Gaza / Mid-East', pct: 24, color: '#e74c3c' },
        { label: 'Sudan', pct: 20, color: '#d4820a' },
        { label: 'Myanmar', pct: 10, color: '#2980b9' },
        { label: 'Others', pct: 8, color: '#5d6d7e' },
    ];
    const R = 54, CX = 70, CY = 70, strokeW = 20;
    const svg = document.getElementById('donut-svg');
    if (!svg) return;
    const circumference = 2 * Math.PI * R;
    let cumulative = 0;
    data.forEach(d => {
        const arc = (d.pct / 100) * circumference;
        const offset = circumference - cumulative;
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', CX); circle.setAttribute('cy', CY);
        circle.setAttribute('r', R); circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', d.color); circle.setAttribute('stroke-width', strokeW);
        circle.setAttribute('stroke-dasharray', `${arc} ${circumference - arc}`);
        circle.setAttribute('stroke-dashoffset', offset);
        circle.setAttribute('transform', `rotate(-90 ${CX} ${CY})`);
        circle.style.transition = 'stroke-dashoffset 1.5s ease';
        svg.appendChild(circle);
        cumulative += arc;
        // Legend
        const legendEl = document.querySelector(`[data-donut="${d.label}"]`);
        if (legendEl) {
            legendEl.querySelector('.donut-swatch').style.background = d.color;
            legendEl.querySelector('.donut-pct').textContent = d.pct + '%';
        }
    });
    // Centre text
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', CX); text.setAttribute('y', CY + 5);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', '#eaecee');
    text.setAttribute('font-family', 'Bebas Neue');
    text.setAttribute('font-size', '14');
    text.setAttribute('letter-spacing', '1');
    text.textContent = 'DEATHS';
    svg.appendChild(text);
    const sub = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    sub.setAttribute('x', CX); sub.setAttribute('y', CY + 18);
    sub.setAttribute('text-anchor', 'middle');
    sub.setAttribute('fill', '#7a8088');
    sub.setAttribute('font-family', 'IBM Plex Mono');
    sub.setAttribute('font-size', '7');
    sub.textContent = 'BY CONFLICT';
    svg.appendChild(sub);
}
buildDonut();

/* ════════════════════════════════════
   10. CONFLICT CARDS — FILTER & SEARCH
════════════════════════════════════ */
const filterBtns = document.querySelectorAll('.filter-btn');
const conflictCards = document.querySelectorAll('.conflict-card');
const searchInput = document.getElementById('conflict-search');

let activeFilter = 'all';
let searchTerm = '';

function applyFilters() {
    conflictCards.forEach(card => {
        const matchFilter = activeFilter === 'all' || card.dataset.type === activeFilter || card.dataset.severity === activeFilter;
        const matchSearch = !searchTerm || card.dataset.name.toLowerCase().includes(searchTerm.toLowerCase());
        card.classList.toggle('hidden', !(matchFilter && matchSearch));
    });
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        applyFilters();
    });
});

if (searchInput) {
    searchInput.addEventListener('input', e => {
        searchTerm = e.target.value;
        applyFilters();
    });
}

/* ════════════════════════════════════
   11. MAP TOOLTIP
════════════════════════════════════ */
const tooltip = document.getElementById('map-tooltip');
const mapWrap = document.getElementById('map-wrap');

document.querySelectorAll('.conflict-pin').forEach(pin => {
    pin.addEventListener('mouseenter', e => {
        if (!tooltip || !mapWrap) return;
        tooltip.querySelector('h4').textContent = pin.dataset.name || '';
        tooltip.querySelector('p').textContent = pin.dataset.info || '';
        tooltip.style.opacity = '1';
    });
    pin.addEventListener('mousemove', e => {
        if (!tooltip || !mapWrap) return;
        const rect = mapWrap.getBoundingClientRect();
        let x = e.clientX - rect.left + 14;
        let y = e.clientY - rect.top + 14;
        if (x + 240 > rect.width) x = e.clientX - rect.left - 240;
        tooltip.style.left = x + 'px';
        tooltip.style.top = y + 'px';
    });
    pin.addEventListener('mouseleave', () => {
        if (tooltip) tooltip.style.opacity = '0';
    });
    pin.addEventListener('click', () => {
        const id = pin.dataset.scroll;
        if (id) {
            const card = document.querySelector(`[data-name="${pin.dataset.name}"]`);
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                card.style.outline = '1px solid var(--red-bright)';
                setTimeout(() => card.style.outline = '', 2000);
            }
        }
    });
});

/* ════════════════════════════════════
   12. SCROLL REVEAL (generic)
════════════════════════════════════ */
const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('vis');
            revealObs.unobserve(e.target);
        }
    });
}, { threshold: .15 });
document.querySelectorAll('.reveal,.timeline-item').forEach(el => revealObs.observe(el));

/* ════════════════════════════════════
   13. WEB AUDIO — AMBIENT ENGINE
════════════════════════════════════ */
let audioCtx = null, musicPlaying = false;
const activeNodes = [];
const musicBtn = document.getElementById('music-btn');

function ctx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
}

function makeDrone(freq, gain, detune = 0) {
    const c = ctx();
    const osc = c.createOscillator();
    const g = c.createGain();
    const filt = c.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = 800;
    osc.type = 'sine'; osc.frequency.value = freq; osc.detune.value = detune;
    osc.connect(filt); filt.connect(g); g.connect(c.destination);
    g.gain.setValueAtTime(0, c.currentTime);
    g.gain.linearRampToValueAtTime(gain, c.currentTime + 3);
    osc.start();
    return { osc, gain: g };
}

function makeTremolo(freq, tremoloRate, gainVal) {
    const c = ctx();
    const osc = c.createOscillator();
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    const g = c.createGain();
    osc.type = 'sine'; osc.frequency.value = freq;
    lfo.type = 'sine'; lfo.frequency.value = tremoloRate;
    lfoGain.gain.value = gainVal * .4;
    g.gain.setValueAtTime(gainVal * .6, c.currentTime);
    lfo.connect(lfoGain); lfoGain.connect(g.gain);
    osc.connect(g); g.connect(c.destination);
    g.gain.linearRampToValueAtTime(gainVal, c.currentTime + 4);
    osc.start(); lfo.start();
    return { osc, lfo, gain: g };
}

function makeNoise(gainVal) {
    const c = ctx();
    const bufSize = c.sampleRate * 2;
    const buf = c.createBuffer(1, bufSize, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * .02;
    const src = c.createBufferSource();
    src.buffer = buf; src.loop = true;
    const filt = c.createBiquadFilter();
    filt.type = 'bandpass'; filt.frequency.value = 120; filt.Q.value = 1;
    const g = c.createGain();
    g.gain.setValueAtTime(0, c.currentTime);
    g.gain.linearRampToValueAtTime(gainVal, c.currentTime + 3);
    src.connect(filt); filt.connect(g); g.connect(c.destination);
    src.start();
    return { src, gain: g };
}

function startMusic() {
    // Deep somber ambient: minor drone cluster, slow tremolo, filtered noise
    activeNodes.push(
        makeDrone(55, 0.05),           // Sub bass A
        makeDrone(110, 0.04, 3),        // Low A + slight detune
        makeDrone(82.41, 0.035, -4),    // E2 (minor quality)
        makeDrone(138.59, 0.025, 2),    // C#3 (minor third)
        makeTremolo(220, 0.18, 0.022),  // Trembling A3
        makeTremolo(164.81, 0.12, 0.02),// E3 tremolo
        makeDrone(55 * 4, 0.012, -6),     // High sub harmonic
        makeNoise(0.018)              // Filtered rumble
    );
    musicPlaying = true;
    musicBtn.classList.add('active');
}

function stopMusic() {
    const c = ctx();
    const t = c.currentTime;
    activeNodes.forEach(n => {
        try { n.gain.linearRampToValueAtTime(0, t + 1.5); } catch (_) { }
        try { n.lfoGain && n.lfoGain.linearRampToValueAtTime(0, t + 1.5); } catch (_) { }
    });
    setTimeout(() => {
        activeNodes.forEach(n => {
            try { n.osc && n.osc.stop(); } catch (_) { }
            try { n.lfo && n.lfo.stop(); } catch (_) { }
            try { n.src && n.src.stop(); } catch (_) { }
        });
        activeNodes.length = 0;
    }, 1800);
    musicPlaying = false;
    musicBtn.classList.remove('active');
}

if (musicBtn) {
    musicBtn.addEventListener('click', () => {
        musicPlaying ? stopMusic() : startMusic();
    });
}

/* ════════════════════════════════════
   14. TICKER DUPLICATION
   (clone items to create seamless loop)
════════════════════════════════════ */
const tickerTrack = document.getElementById('ticker-track');
if (tickerTrack) {
    const items = tickerTrack.innerHTML;
    tickerTrack.innerHTML = items + items; // duplicate for seamless loop
}

/* ════════════════════════════════════
   15. DYNAMIC YEAR IN FOOTER
════════════════════════════════════ */
const yearEl = document.getElementById('current-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ════════════════════════════════════
   16. SMOOTH ANCHOR SCROLL
════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});