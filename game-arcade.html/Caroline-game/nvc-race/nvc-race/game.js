// ======================================================
// =============== CANVAS & CONTEXT SETUP ===============
// ======================================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 1280;
canvas.height = 720;


// ======================================================
// ===================== ASSET LOADING ==================
// ======================================================

// ---- Player ----
const playerImg = new Image();
playerImg.src = "assets/player/player.png";

// ---- Professor Sprites ----
const profIdle = new Image();
profIdle.src = "assets/professor/idle.png";

const profLeft1 = new Image();
profLeft1.src = "assets/professor/left1.png";

const profLeft2 = new Image();
profLeft2.src = "assets/professor/left2.png";

const profRight1 = new Image();
profRight1.src = "assets/professor/right1.png";

const profRight2 = new Image();
profRight2.src = "assets/professor/right2.png";

const profSuccess = new Image();
profSuccess.src = "assets/professor/success.png";

// ---- Map ----
const mapImg = new Image();
mapImg.src = "assets/campus-map.png";

// ---- Numbered Checkpoints ----
const checkpointImages = [
    new Image(), // index 0 unused
    new Image(),
    new Image(),
    new Image(),
    new Image(),
    new Image()
];

checkpointImages[1].src = "assets/checkpoints/1.png";
checkpointImages[2].src = "assets/checkpoints/2.png";
checkpointImages[3].src = "assets/checkpoints/3.png";
checkpointImages[4].src = "assets/checkpoints/4.png";
checkpointImages[5].src = "assets/checkpoints/5.png";

// ---- Checkpoint glow ring ----
const checkpointRing = new Image();
checkpointRing.src = "assets/checkpoints/ring.png";

// ---- Sounds ----
const checkpointSound = new Audio("assets/sounds/checkpoint.wav");
const meowSound = new Audio("assets/sounds/meow.wav");
const playlistSound = new Audio("assets/sounds/playlist.wav");
const winnerSound = new Audio("assets/sounds/winner.wav");

playlistSound.loop = true;
playlistSound.volume = 0.4;


// ======================================================
// ===================== GAME STATE ======================
// ======================================================

let keys = {};
let raceStarted = false;
let countdown = 8;
let countdownTimer = 0;
let showInstructions = true;
let instructionOpacity = 1;

let timer = 0;
let timerRunning = false;

let raceComplete = false;
let caught = false;

let caughtOverlay = 0;
let finishOverlay = 0;

let redFlash = 0;

// Fix autoplay issue
let firstInteraction = false;

// Global animation clock (used for pulses / bobbing)
let clock = 0;


// ======================================================
// ===================== PLAYER SETUP ====================
// ======================================================

const player = {
    x: 2054,
    y: 2550,
    size: 40,
    speed: 4
};

let playerFacing = 1;     // 1 = facing right, -1 = facing left
let playerMoving = false;


// ======================================================
// ==================== PROFESSOR SETUP ==================
// ======================================================

const professor = {
    x: 2326,
    y: 2686,
    size: 80,
    speed: 3.0
};

let profDirection = "idle";
let profFrame = 0;
let profFrameTimer = 0;
let profFrameInterval = 12;

let profTeleportCooldown = 0;


// ======================================================
// ===================== CHECKPOINTS =====================
// ======================================================

const checkpoints = [
    { name: "Start (Pecan Hall)", x: 1815, y: 2650, reached: false },
    { name: "Juniper Hall", x: 1265, y: 1145, reached: false },
    { name: "Cedar Elm STEM Center", x: 775, y: 625, reached: false },
    { name: "Huisache Hall", x: 635, y: 1170, reached: false },
    { name: "Finish (Pecan Hall)", x: 1525, y: 2390, reached: false }
];

let currentCheckpoint = 0;

// Neon palette to match the map art (cyan primary, pink accent)
const CHECKPOINT_GLOW = "#28f5ff";
const CHECKPOINT_GLOW_NEAR = "#ff3fb0";

// Minimap
const MAP_WORLD_SIZE = 3000; // campus-map.png is 3000x3000
const MINI_SIZE = 190;
const MINI_MARGIN = 24;


// ======================================================
// ====================== CAMERA =========================
// ======================================================

const camera = {
    x: 0,
    y: 0
};

let shakeTime = 0;
let shakeStrength = 0;


// ======================================================
// ===================== INPUT HANDLING ==================
// ======================================================

document.addEventListener("keydown", (e) => {
    keys[e.key] = true;

    // Allow audio after first user interaction
    if (!firstInteraction) {
        firstInteraction = true;
        playlistSound.play().catch(() => { });
    }

    if (e.key === "r" && (raceComplete || caught)) {
        restartGame();
    }
});

document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});


// ======================================================
// ===================== COUNTDOWN LOGIC =================
// ======================================================

function updateCountdown() {
    if (!raceStarted) {
        countdownTimer++;

        if (countdownTimer >= 60) {
            countdownTimer = 0;
            countdown--;

            if (countdown <= 0) {
                raceStarted = true;
                timerRunning = true;
            }
        }
    }
}


// ======================================================
// ===================== PLAYER MOVEMENT =================
// ======================================================

function updatePlayer() {
    playerMoving = false;

    if (!raceStarted || raceComplete || caught) return;

    if (keys["ArrowUp"] || keys["w"]) { player.y -= player.speed; playerMoving = true; }
    if (keys["ArrowDown"] || keys["s"]) { player.y += player.speed; playerMoving = true; }
    if (keys["ArrowLeft"] || keys["a"]) { player.x -= player.speed; playerMoving = true; playerFacing = -1; }
    if (keys["ArrowRight"] || keys["d"]) { player.x += player.speed; playerMoving = true; playerFacing = 1; }
}


// ======================================================
// ===================== PROFESSOR CHASE =================
// ======================================================

function updateProfessor() {
    if (!raceStarted) return;

    if (profTeleportCooldown > 0) {
        profTeleportCooldown--;
        return;
    }

    if (caught || raceComplete) return;

    let dx = player.x - professor.x;
    let dy = player.y - professor.y;
    let dist = Math.hypot(dx, dy);

    if (dist > 700) {
        professor.x = player.x - 300;
        professor.y = player.y + 100;

        redFlash = 10;
        profTeleportCooldown = 12;
        return;
    }

    if (dist > 1) {
        professor.x += (dx / dist) * professor.speed;
        professor.y += (dy / dist) * professor.speed;
    }

    if (Math.abs(dx) > 1) {
        profDirection = dx < 0 ? "left" : "right";
    } else {
        profDirection = "idle";
    }

    if (dist < 50) {
        caught = true;
        timerRunning = false;
        profDirection = "success";
        shakeTime = 10;
        shakeStrength = 4;

        playlistSound.pause();
        playlistSound.currentTime = 0;
        meowSound.play();
    }
}


// ======================================================
// ================= PROFESSOR ANIMATION =================
// ======================================================

function updateProfessorAnimation() {
    if (profTeleportCooldown > 0) return;
    if (profDirection === "success") return;

    profFrameTimer++;
    if (profFrameTimer >= profFrameInterval) {
        profFrameTimer = 0;
        profFrame = (profFrame + 1) % 2;
    }
}


// ======================================================
// ===================== CHECKPOINT LOGIC ================
// ======================================================

function updateCheckpoints() {
    if (currentCheckpoint >= checkpoints.length) return;

    let cp = checkpoints[currentCheckpoint];
    let dx = player.x - cp.x;
    let dy = player.y - cp.y;

    if (Math.hypot(dx, dy) < 60) {
        cp.reached = true;
        currentCheckpoint++;
        checkpointSound.play();

        if (currentCheckpoint >= checkpoints.length) {
            raceComplete = true;
            timerRunning = false;

            playlistSound.pause();
            playlistSound.currentTime = 0;
            winnerSound.play();
        }
    }
}


// ======================================================
// ======================== TIMER ========================
// ======================================================

function updateTimer() {
    if (timerRunning && !raceComplete && !caught) {
        timer++;
    }
}

function updateOverlays() {
    caughtOverlay = caught ? Math.min(1, caughtOverlay + 0.06) : 0;
    finishOverlay = raceComplete ? Math.min(1, finishOverlay + 0.06) : 0;
}


// ======================================================
// ===================== CAMERA FOLLOW ===================
// ======================================================

function updateCamera() {
    const targetX = player.x - canvas.width / 2;
    const targetY = player.y - canvas.height / 2;

    // Smooth follow instead of a hard snap
    camera.x += (targetX - camera.x) * 0.25;
    camera.y += (targetY - camera.y) * 0.25;

    if (shakeTime > 0) {
        shakeTime--;
        camera.x += (Math.random() - 0.5) * shakeStrength;
        camera.y += (Math.random() - 0.5) * shakeStrength;
    }
}


// ======================================================
// ======================== DRAWING ======================
// ======================================================

function drawMap() {
    ctx.drawImage(mapImg, -camera.x, -camera.y);
}

function drawPlayer() {
    const sx = player.x - camera.x;
    const sy = player.y - camera.y;

    // Soft neon-cyan ground glow beneath the player, matching the map's palette
    const bob = playerMoving ? Math.sin(clock * 0.35) * 3 : 0;

    ctx.save();
    ctx.globalAlpha = 0.3;
    const shadowGrad = ctx.createRadialGradient(sx, sy + player.size * 0.42, 2, sx, sy + player.size * 0.42, player.size * 0.55);
    shadowGrad.addColorStop(0, "rgba(40, 245, 255, 0.4)");
    shadowGrad.addColorStop(1, "rgba(40, 245, 255, 0)");
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(sx, sy + player.size * 0.42, player.size * 0.6, player.size * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.shadowColor = "rgba(40, 245, 255, 0.35)";
    ctx.shadowBlur = 6;

    // Flip horizontally to face movement direction
    ctx.translate(sx, sy + bob);
    ctx.scale(playerFacing, 1);

    ctx.drawImage(
        playerImg,
        -player.size / 2,
        -player.size / 2,
        player.size,
        player.size
    );
    ctx.restore();
}

function drawProfessor() {
    let img = profIdle;

    if (profDirection === "left") img = profFrame === 0 ? profLeft1 : profLeft2;
    if (profDirection === "right") img = profFrame === 0 ? profRight1 : profRight2;
    if (profDirection === "success") img = profSuccess;

    ctx.drawImage(
        img,
        professor.x - camera.x - professor.size / 2,
        professor.y - camera.y - professor.size / 2,
        professor.size,
        professor.size
    );
}

function drawCheckpoints() {
    checkpoints.forEach((cp, i) => {
        if (cp.reached) return;

        const isNext = i === currentCheckpoint;
        const sx = cp.x - camera.x;
        const sy = cp.y - camera.y;

        const dxToPlayer = player.x - cp.x;
        const dyToPlayer = player.y - cp.y;
        const distToPlayer = Math.hypot(dxToPlayer, dyToPlayer);
        const isNear = isNext && distToPlayer < 220;

        const pulse = 0.5 + 0.5 * Math.sin(clock * 0.045 + i);
        const glowColor = isNear ? CHECKPOINT_GLOW_NEAR : CHECKPOINT_GLOW;

        // Pulsing outer ring (uses ring.png), speeds up and shifts color when close
        ctx.save();
        ctx.globalAlpha = isNext ? (0.3 + 0.15 * pulse) : 0.15;
        const ringScale = isNext ? (1.15 + 0.1 * pulse) : 1.05;
        const ringSize = 70 * ringScale;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = isNext ? 12 : 5;
        ctx.drawImage(checkpointRing, sx - ringSize / 2, sy - ringSize / 2, ringSize, ringSize);
        ctx.restore();

        // Numbered badge on top, glowing to match the map's neon look
        ctx.save();
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = isNext ? 10 : 4;
        const badgeSize = isNext ? 58 + pulse * 2 : 54;
        const img = checkpointImages[i + 1];
        ctx.drawImage(img, sx - badgeSize / 2, sy - badgeSize / 2, badgeSize, badgeSize);
        ctx.restore();

        // Label above the next checkpoint so it reads like a real waypoint marker
        if (isNext) {
            ctx.save();
            ctx.textAlign = "center";
            ctx.font = "bold 18px Arial";
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 8;
            ctx.fillStyle = "#eafffe";
            ctx.fillText(cp.name, sx, sy - badgeSize / 2 - 14);
            ctx.restore();
        }
    });
}

function drawMinimap() {
    const miniScale = MINI_SIZE / MAP_WORLD_SIZE;
    const mx = canvas.width - MINI_SIZE - MINI_MARGIN;
    const my = canvas.height - MINI_SIZE - MINI_MARGIN;

    ctx.save();

    // Panel background to match the rest of the HUD
    ctx.fillStyle = "rgba(13, 13, 13, 0.65)";
    ctx.strokeStyle = "rgba(40, 245, 255, 0.55)";
    ctx.lineWidth = 1.5;
    roundRect(ctx, mx - 6, my - 6, MINI_SIZE + 12, MINI_SIZE + 12, 12);
    ctx.fill();
    ctx.stroke();

    // Clip the map thumbnail to the rounded panel
    ctx.save();
    roundRect(ctx, mx, my, MINI_SIZE, MINI_SIZE, 8);
    ctx.clip();
    ctx.globalAlpha = 0.85;
    ctx.drawImage(mapImg, mx, my, MINI_SIZE, MINI_SIZE);
    ctx.globalAlpha = 1;

    // Checkpoints
    checkpoints.forEach((cp, i) => {
        const px = mx + cp.x * miniScale;
        const py = my + cp.y * miniScale;
        const isNext = i === currentCheckpoint;

        ctx.beginPath();
        ctx.arc(px, py, isNext ? 4.5 : 3, 0, Math.PI * 2);

        if (cp.reached) {
            ctx.fillStyle = "rgba(234, 255, 254, 0.35)";
        } else if (isNext) {
            const pulse = 0.5 + 0.5 * Math.sin(clock * 0.09);
            ctx.shadowColor = CHECKPOINT_GLOW;
            ctx.shadowBlur = 6 + pulse * 4;
            ctx.fillStyle = CHECKPOINT_GLOW;
        } else {
            ctx.fillStyle = "rgba(40, 245, 255, 0.5)";
        }
        ctx.fill();
        ctx.shadowBlur = 0;
    });

    // Camera viewport rectangle
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(
        mx + camera.x * miniScale,
        my + camera.y * miniScale,
        canvas.width * miniScale,
        canvas.height * miniScale
    );

    // Professor
    ctx.beginPath();
    ctx.arc(mx + professor.x * miniScale, my + professor.y * miniScale, 4, 0, Math.PI * 2);
    ctx.shadowColor = "#ff3fb0";
    ctx.shadowBlur = 6;
    ctx.fillStyle = "#ff3fb0";
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player
    ctx.beginPath();
    ctx.arc(mx + player.x * miniScale, my + player.y * miniScale, 4, 0, Math.PI * 2);
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 6;
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore(); // clip
    ctx.restore();
}

function drawCountdown() {
    if (!raceStarted) {
        ctx.save();
        ctx.textAlign = "center";
        ctx.shadowColor = CHECKPOINT_GLOW;
        ctx.shadowBlur = 30;
        ctx.fillStyle = "white";
        ctx.font = "bold 90px Arial";
        const pop = 1 + 0.08 * Math.sin(clock * 0.3);
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(pop, pop);
        ctx.fillText(countdown, 0, 0);
        ctx.restore();
    }
}

function drawInstructions() {
    if (!showInstructions) return;

    ctx.save();
    ctx.globalAlpha = instructionOpacity;

    const panelW = 460, panelH = 70;
    ctx.fillStyle = "rgba(13, 13, 13, 0.6)";
    ctx.strokeStyle = "rgba(40, 245, 255, 0.6)";
    ctx.lineWidth = 1.5;
    roundRect(ctx, canvas.width / 2 - panelW / 2, 30, panelW, panelH, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#eafffe";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Reach all checkpoints. Avoid the professor!", canvas.width / 2, 60);
    ctx.font = "16px Arial";
    ctx.fillStyle = "rgba(234, 255, 254, 0.75)";
    ctx.fillText("Use WASD or Arrow Keys to move.", canvas.width / 2, 85);
    ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function fadeInstructions() {
    if (raceStarted && instructionOpacity > 0) {
        instructionOpacity -= 0.01;
        if (instructionOpacity <= 0) showInstructions = false;
    }
}

function drawTimer() {
    ctx.save();
    ctx.fillStyle = "rgba(13, 13, 13, 0.55)";
    ctx.strokeStyle = "rgba(40, 245, 255, 0.5)";
    ctx.lineWidth = 1.5;
    roundRect(ctx, 30, 20, 140, 46, 10);
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = CHECKPOINT_GLOW;
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#eafffe";
    ctx.font = "bold 26px Arial";
    ctx.textAlign = "left";
    ctx.fillText((timer / 60).toFixed(2), 46, 51);
    ctx.restore();
}

function drawCaught() {
    if (!caught) return;

    ctx.save();
    ctx.globalAlpha = caughtOverlay;

    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const pop = 0.9 + 0.1 * caughtOverlay;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(pop, pop);

    ctx.shadowColor = "#ff3fb0";
    ctx.shadowBlur = 25;
    ctx.fillStyle = "#ff4d6d";
    ctx.font = "bold 46px Arial";
    ctx.textAlign = "center";
    ctx.fillText("YOU WERE CAUGHT BY PROFESSOR BURCH!", 0, 0);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "26px Arial";
    ctx.fillText("Press R to restart", 0, 55);
    ctx.restore();
}

function drawFinish() {
    if (!raceComplete) return;

    ctx.save();
    ctx.globalAlpha = finishOverlay;

    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.shadowColor = "#28f5ff";
    ctx.shadowBlur = 30;
    const pop = (0.85 + 0.15 * finishOverlay) * (1 + 0.05 * Math.sin(clock * 0.15));
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(pop, pop);
    ctx.fillStyle = "lime";
    ctx.font = "bold 70px Arial";
    ctx.textAlign = "center";
    ctx.fillText("FINISH!", 0, 0);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "26px Arial";
    ctx.fillText("Press R to restart", 0, 55 / pop);
    ctx.restore();
}

function drawRedFlash() {
    if (redFlash > 0) {
        ctx.fillStyle = "rgba(255,0,0," + (redFlash / 10) + ")";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        redFlash--;
    }
}


// ======================================================
// ======================== RESTART ======================
// ======================================================

function restartGame() {
    playlistSound.pause();
    playlistSound.currentTime = 0;

    meowSound.pause();
    meowSound.currentTime = 0;

    winnerSound.pause();
    winnerSound.currentTime = 0;

    player.x = 2054;
    player.y = 2550;
    playerFacing = 1;
    playerMoving = false;

    professor.x = 2326;
    professor.y = 2686;

    currentCheckpoint = 0;
    checkpoints.forEach(cp => cp.reached = false);

    timer = 0;
    timerRunning = false;

    raceStarted = false;
    countdown = 5;
    countdownTimer = 0;

    raceComplete = false;
    caught = false;

    showInstructions = true;
    instructionOpacity = 1;

    caughtOverlay = 0;
    finishOverlay = 0;
    shakeTime = 0;
    shakeStrength = 0;

    profDirection = "idle";
    profFrame = 0;
    profTeleportCooldown = 0;

    firstInteraction = false;
}


// ======================================================
// ========================= UPDATE ======================
// ======================================================

function update() {
    clock++;
    updateCountdown();
    updatePlayer();
    updateProfessor();
    updateProfessorAnimation();
    updateCheckpoints();
    updateTimer();
    updateOverlays();
    updateCamera();
    fadeInstructions();
}


// ======================================================
// ========================== DRAW =======================
// ======================================================

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMap();
    drawCheckpoints();
    drawPlayer();
    drawProfessor();
    drawCountdown();
    drawInstructions();
    drawTimer();
    drawMinimap();
    drawCaught();
    drawFinish();
    drawRedFlash();
}


// ======================================================
// ======================== GAME LOOP ====================
// ======================================================

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
