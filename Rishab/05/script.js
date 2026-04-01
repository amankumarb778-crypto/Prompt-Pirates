/**
 * COBALT TERMINAL ENGINE v10.2.1
 * MODULES: [FS_MAP, SFX_OSC, IO_HANDLER, NARRATIVE_CTL]
 */

// 1. DATA: VIRTUAL FILESYSTEM
const FS = {
    "/": ["sys", "logs", "usr", "mnt"],
    "/sys": ["kernel.bin", "firewall.inf", "node_map.dat"],
    "/logs": ["2079_incident.txt", "security_leak.log", "personnel.db"],
    "/usr": ["archivist", "guest_9912", "cobalt_ghost"],
    "/usr/archivist": ["note_to_self.txt", "private_key.rsa"],
    "/mnt": ["remote_vortex", "void_stream"]
};

const FILE_DATA = {
    "kernel.bin": "[RAW BINARY DATA UNREADABLE WITHOUT SU-ACCESS]",
    "firewall.inf": "SECURE_LAYER_1: Active\nSECURE_LAYER_2: Faulty\nENCRYPTION: 256-SHA-NEURAL",
    "2079_incident.txt": "April 12. Site-B breach. The liquid data leaked into the ventilation. No one survived the sync.",
    "security_leak.log": "TRACE: Node 0x77-A tried to initiate 'Core Flush'. Trace locked. Operator eliminated.",
    "note_to_self.txt": "The password is buried in the system status. Look at the IDs.",
    "private_key.rsa": "X991-BC22-FF82-LL1P"
};

// 2. STATE MANAGEMENT
let state = {
    audio: false,
    curDir: "/",
    isProcessing: false,
    accessLevel: 0,
    exploited: false,
    history: []
};

const output = document.getElementById('output-buffer');
const shell = document.getElementById('terminal-input');
const termWindow = document.getElementById('terminal-interface');

// 3. AUDIO ENGINE (Synthesizer)
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let ctx;

const playSFX = (freq, type, dur, vol = 0.05) => {
    if (!state.audio) return;
    if (!ctx) ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + dur);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + dur);
};

// 4. CORE PRINT ENGINE (Typed output)
const print = async (text, color = "default", speed = 5) => {
    state.isProcessing = true;
    const div = document.createElement('div');
    div.classList.add('out-row');
    if (color === "warn") div.classList.add('log-warn');
    if (color === "critical") div.classList.add('log-critical');
    output.appendChild(div);

    for (let char of text) {
        div.textContent += char;
        if (char !== " ") playSFX(100 + Math.random() * 400, 'square', 0.04, 0.01);
        await new Promise(r => setTimeout(r, speed));
    }
    termWindow.scrollTop = termWindow.scrollHeight;
    state.isProcessing = false;
};

// 5. SYSTEM COMMANDS
const CMD_LOGIC = {
    help: async () => {
        await print("--- AUTHORIZED OPERATIVE CMDS ---");
        await print("LS           - List directory tree");
        await print("CD [dir]     - Change file node");
        await print("CAT [file]   - Read buffered data");
        await print("DECRYPT      - Execute bypass sequence");
        await print("EXPLOIT      - Trigger memory overflow");
        await print("STATUS       - Display kernel vitals");
        await print("CLEAR        - Purge display buffer");
        await print("EXIT         - Termination");
    },
    ls: async () => {
        const contents = FS[state.curDir] || [];
        await print(`Index of ${state.curDir}:`, "warn");
        await print(contents.join("   "));
    },
    cd: async (args) => {
        const target = args[0];
        if (!target || target === "..") {
            state.curDir = "/";
            return await print("Moved to ROOT");
        }
        let full = state.curDir === "/" ? "/" + target : state.curDir + "/" + target;
        if (FS[full]) {
            state.curDir = full;
            await print(`Link established: ${state.curDir}`);
        } else {
            await print(`ERR: PATH ${target} NOT FOUND`, "critical");
        }
    },
    cat: async (args) => {
        const file = args[0];
        if (FILE_DATA[file]) {
            await print(`-- READING ${file} --`);
            await print(FILE_DATA[file]);
        } else {
            await print("FILE NOT ACCESSIBLE OR PROTECTED", "critical");
        }
    },
    status: async () => {
        await print("NODE_ID: 0xFB22A");
        await print("LATENCY: 12ms");
        await print("IDENTITY: GHOST_ECHO");
        await print(state.exploited ? "SECURITY: BYPASSED" : "SECURITY: HIGH_ALERT", state.exploited ? "default" : "warn");
    },
    exploit: async () => {
        await print("INJECTING OVERFLOW PACKETS...", "warn");
        await new Promise(r => setTimeout(r, 1000));
        playSFX(80, 'sawtooth', 0.8, 0.1);
        document.body.style.filter = "invert(1) hue-rotate(180deg)";
        setTimeout(() => document.body.style.filter = "", 200);
        state.exploited = true;
        await print("K-FAULT RECOGNIZED. Memory addresses 0x001 through 0x99F exposed.");
        await print("Access 'DECRYPT' to finish breach.");
    },
    decrypt: async () => {
        if (!state.exploited) return await print("DENIED: Security shielding active. Use 'EXPLOIT' first.", "critical");
        await print("INITIALIZING NEURAL BRUTE-FORCE...");
        const loadContainer = document.createElement('div');
        loadContainer.className = "loading-container";
        const filler = document.createElement('div');
        filler.className = "loading-fill";
        loadContainer.appendChild(filler);
        output.appendChild(loadContainer);

        for (let i = 0; i <= 100; i += 2) {
            filler.style.width = i + "%";
            playSFX(200 + i * 5, 'sine', 0.1, 0.05);
            await new Promise(r => setTimeout(r, 50));
        }
        await print("DECRYPTION SUCCESS. SYSTEM OWNER LEVEL ACQUIRED.", "default");
        await print("GHOST ENTRY UNLOCKED in /usr/cobalt_ghost", "warn");
        FS["/usr/cobalt_ghost"] = ["CORE_FLUSH.sh", "THE_TRUTH.msg"];
        FILE_DATA["THE_TRUTH.msg"] = "You were never Echo-7. You are Cobalt. You hacked yourself to remember.";
    },
    clear: () => output.innerHTML = "",
    exit: async () => {
        await print("CLEANING LOGS... GOODBYE ARCHIVIST.");
        setTimeout(() => { document.body.innerHTML = ""; window.close(); }, 2000);
    }
};

// 6. IO EVENT HANDLING
shell.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && !state.isProcessing) {
        const raw = shell.value.trim();
        const [cmd, ...args] = raw.split(" ");
        shell.value = "";

        const prompt = document.createElement('div');
        prompt.innerHTML = `<span style="color:var(--warn)">${state.curDir}></span> ${raw}`;
        output.appendChild(prompt);

        if (CMD_LOGIC[cmd.toLowerCase()]) {
            await CMD_LOGIC[cmd.toLowerCase()](args);
        } else if (raw !== "") {
            playSFX(50, 'sawtooth', 0.3, 0.1);
            await print(`INTERNAL_SHELL_ERR: COMMAND '${cmd}' VOID`, "critical");
        }
        termWindow.scrollTop = termWindow.scrollHeight;
    }
});

// 7. INITIALIZATION & BOOT
window.onload = async () => {
    // Canvas Matrix Effect (Simplified High-Efficiency version)
    const c = document.getElementById('matrix-bg');
    const cc = c.getContext('2d');
    c.width = window.innerWidth; c.height = window.innerHeight;
    const chars = "0101ABCDEFあいうえお";
    const drops = Array(100).fill(1);

    setInterval(() => {
        cc.fillStyle = "rgba(0,0,0,0.05)"; cc.fillRect(0, 0, c.width, c.height);
        cc.fillStyle = "#0f0";
        drops.forEach((y, i) => {
            const text = chars[Math.floor(Math.random() * chars.length)];
            cc.fillText(text, i * 20, y * 20);
            if (y * 20 > c.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        });
    }, 50);

    // Narrated Boot
    await print("COBALT_BOOT_SEQUENCE_V.10.2", "warn", 10);
    await print("LOADING MODULES [SYS, KRNL, V-DATA]... OK");
    await print("ESTABLISHING VOIP_TUNNEL_001... OK");
    await print("LINK_UP: STABLE_SYNCING...");
    await print("TYPE 'HELP' TO START PROTOCOL.");
};

// Hardware Interactivity
document.getElementById('audio-init').onclick = (e) => {
    state.audio = !state.audio;
    e.target.textContent = `SYNT_AUDIO: ${state.audio ? "ON" : "OFF"}`;
    if (state.audio) playSFX(400, 'sine', 0.2, 0.1);
};

document.getElementById('glitch-trigger').onclick = () => {
    document.body.classList.add('log-critical');
    setTimeout(() => document.body.classList.remove('log-critical'), 500);
};

// Auto Focus
document.addEventListener('click', () => shell.focus());
setInterval(() => {
    document.getElementById('clock').innerText = new Date().toLocaleTimeString();
    document.getElementById('sig-val').innerText = (Math.random() * 100).toFixed(2) + "db";
    document.getElementById('disk-led').style.color = Math.random() > 0.8 ? "var(--red)" : "var(--p)";
}, 1000);