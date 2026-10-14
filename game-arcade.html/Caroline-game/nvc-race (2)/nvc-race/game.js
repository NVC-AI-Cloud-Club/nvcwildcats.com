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

let redFlash = 0;

// Fix autoplay issue
let firstInteraction = false;


// ======================================================
// ===================== PLAYER SETUP ====================
// ======================================================

const player = {
    x: 2054,
    y: 2550,
    size: 40,
    speed: 4
};


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


// ======================================================
// ====================== CAMERA =========================
// ======================================================

const camera = {
    x: 0,
    y: 0
};


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
    if (!raceStarted || raceComplete || caught) return;

    if (keys["ArrowUp"] || keys["w"]) player.y -= player.speed;
    if (keys["ArrowDown"] || keys["s"]) player.y += player.speed;
    if (keys["ArrowLeft"] || keys["a"]) player.x -= player.speed;
    if (keys["ArrowRight"] || keys["d"]) player.x += player.speed;
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


// ======================================================
// ===================== CAMERA FOLLOW ===================
// ======================================================

function updateCamera() {
    camera.x = player.x - canvas.width / 2;
    camera.y = player.y - canvas.height / 2;
}


// ======================================================
// ======================== DRAWING ======================
// ======================================================

function drawMap() {
    ctx.drawImage(mapImg, -camera.x, -camera.y);
}

function drawPlayer() {
    ctx.drawImage(
        playerImg,
        player.x - camera.x - player.size / 2,
        player.y - camera.y - player.size / 2,
        player.size,
        player.size
    );
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
        if (!cp.reached) {
            const img = checkpointImages[i + 1]; // checkpoint # matches image #

            ctx.drawImage(
                img,
                cp.x - camera.x - 30,
                cp.y - camera.y - 30,
                60,
                60
            );
        }
    });
}

function drawCountdown() {
    if (!raceStarted) {
        ctx.fillStyle = "white";
        ctx.font = "80px Arial";
        ctx.textAlign = "center";
        ctx.fillText(countdown, canvas.width / 2, canvas.height / 2);
    }
}

function drawInstructions() {
    if (!showInstructions) return;

    ctx.globalAlpha = instructionOpacity;
    ctx.fillStyle = "white";
    ctx.font = "28px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Reach all checkpoints. Avoid the professor!", canvas.width / 2, 80);
    ctx.fillText("Use WASD or Arrow Keys to move.", canvas.width / 2, 120);
    ctx.globalAlpha = 1;
}

function fadeInstructions() {
    if (raceStarted && instructionOpacity > 0) {
        instructionOpacity -= 0.01;
        if (instructionOpacity <= 0) showInstructions = false;
    }
}

function drawTimer() {
    ctx.fillStyle = "white";
    ctx.font = "32px Arial";
    ctx.fillText((timer / 60).toFixed(2), 100, 50);
}

function drawCaught() {
    if (caught) {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "red";
        ctx.font = "50px Arial";
        ctx.textAlign = "center";
        ctx.fillText("YOU WERE CAUGHT BY PROFESSOR BURCH!", canvas.width / 2, canvas.height / 2);

        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText("Press R to restart", canvas.width / 2, canvas.height / 2 + 60);
    }
}

function drawFinish() {
    if (raceComplete) {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "lime";
        ctx.font = "70px Arial";
        ctx.textAlign = "center";
        ctx.fillText("FINISH!", canvas.width / 2, canvas.height / 2);

        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText("Press R to restart", canvas.width / 2, canvas.height / 2 + 60);
    }
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

    profDirection = "idle";
    profFrame = 0;
    profTeleportCooldown = 0;

    firstInteraction = false;
}


// ======================================================
// ========================= UPDATE ======================
// ======================================================

function update() {
    updateCountdown();
    updatePlayer();
    updateProfessor();
    updateProfessorAnimation();
    updateCheckpoints();
    updateTimer();
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