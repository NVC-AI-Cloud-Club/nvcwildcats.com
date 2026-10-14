let currentUtterance = null;
let currentSpeed = 1.0;
let speechInitialized = false;

// Game state variables
let gameScore = 0;
let gameActive = false;
let gameStartTimer = null;
let gameTime = 0;
let gameClockInterval = null;
let minionSpawnInterval = null;
let activeMinions = [];
let currentWord = '';
let wordBuffer = '';
let currentWave = 1;

// Packet Runner minigame state
const packetRunner = {
    active: false,
    laneCount: 3,
    playerLane: 1,
    score: 0,
    lives: 3,
    speed: 3.8,
    spawnMs: 900,
    entities: [],
    spawnInterval: null,
    updateInterval: null,
    keyHandler: null,
};

// Cipher Match minigame state
const cipherMatch = {
    active: false,
    symbols: ['◆', '◇', '○', '●', '△', '▲', '□', '■', '✦', '✧'],
    totalPairs: 6,
    matchedPairs: 0,
    deck: [],
    flippedIndexes: [],
    lockBoard: false,
    timeLeft: 60,
    timerInterval: null,
};

// Firewall damage system
let firewallHealth = [2, 3, 4, 4, 5, 6]; // HP for each band (bottom to top) - thinnest to thickest
let totalFirewallHealth = 24;
let maxFirewallHealth = 24;
let firewallDestroyed = false;

// Track all timeouts for robust cancel
let gameModeTimeouts = [];
let typingCombatInitialized = false;
function gameModeSetTimeout(fn, delay) {
    const id = setTimeout(fn, delay);
    gameModeTimeouts.push(id);
    return id;
}
function clearGameModeTimeouts() {
    gameModeTimeouts.forEach(id => clearTimeout(id));
    gameModeTimeouts = [];
}

// Positional barricade system - defensive words spawn at random locations
const defensiveWordList = ['BLOCK', 'GUARD', 'WALL', 'FORT', 'SHIELD', 'DEFEND', 'HOLD', 'SECURE', 'SAFE', 'STOP'];
let activeDefensiveWords = []; // Track words on screen (maintains spawn order for FIFO)
let defensiveWordSpawnInterval = null;
let activeBarricades = []; // Persistent barriers created from defensive words
let defensiveCollisionInterval = null;

// Word lists for minions (different difficulty levels)
const easyWords = ['WILDCAT', 'VISTA', 'COUGAR', 'COURAGE', 'SMART', 'KIND', 'TEAM', 'FRESH', 'PARK', 'LIBRARY', 'BOOK', 'PEN', 'STUDY', 'CAMPUS', 'FUN', 'GAME', 'MUSIC', 'ART', 'GREEN', 'HELP'];
const mediumWords = ['COURSE', 'HONORS', 'MIDTERM', 'PROJECT', 'COMRADE', 'BLIP', 'ROBOT', 'CODE', 'DEBATE', 'LEADERSHIP', 'FUTURE', 'BUDDY', 'SPIRIT', 'BALANCE', 'SUCCESS', 'FORGE', 'CONNECT', 'ADVENTURE', 'CREATE', 'INSPIRE'];
const hardWords = ['DETERMINATION', 'COMMUNITY', 'RESILIENCE', 'SCHOLARSHIP', 'ACHIEVEMENT', 'INNOVATION', 'COLLABORATE', 'EXCELLENCE', 'TRANSFORM', 'EMPOWER', 'PERSISTENCE', 'NAVIGATE', 'EXPLORE', 'TRIUMPH', 'LEADERSHIP'];

// Combine all words
const allWords = [...easyWords, ...mediumWords, ...hardWords];

// Arrays of click responses for each mode
const goodBLIPResponses = [
    "Hello there!",
    "Hi friend!",
    "Nice to see you!",
    "How are you doing?",
    "I love to speak!",
    "Ready to talk!",
    "You're awesome!",
    "Let's be friends!",
    "I'm a talking robot!",
    "Have a great day!"
];

const badBLIPResponses = [
    "What do you want?",
    "Don't touch me!",
    "You dare to click me?",
    "I am the darkness!",
    "Fear me!",
    "You will regret this!",
    "I am unstoppable!",
    "Your time is limited!",
    "I consume all!",
    "You cannot escape!"
];

const gameBLIPResponses = [
    "Help me!",
    "Stop my evil twin!",
    "I need your help!",
    "Save me!",
    "Protect me!",
    "I'm scared!",
    "Don't let them win!",
    "I believe in you!",
    "We can do this together!"
];

// Kid-friendly hover dialogue for NW Vista College Wildcat vibe
const hoverBLIPResponses = [
    "Go Wildcats! Welcome to BLIP's Arcade, where fun and kindness win.",
    "Northwest Vista shout-out: be cool, be safe, and keep playing nice.",
    "High five, Wildcat! You're doing a great job in the arcade today.",
    "Stay Wildcat strong: share smiles, beat scores, and protect your firewall.",
    "BLIP loves a friendly game. Let’s keep it upbeat for all Wildcats!"
];

const evilClickResponses = [
    "I don't have a minigame yet. The good BLIP has the game!",
    "Haha, evil BLIP is stuck. Try click Good BLIP to play!",
    "No game for me now—go find Good BLIP and win!",
    "EVIL BLIP says: no minigame yet; good BLIP does!"
];

let hoverDialogueInProgress = false;

const overworldState = {
    active: false,
    x: 0,
    y: 0,
    speed: 3.4,
    keys: new Set(),
    nearConsole: false,
    rafId: null
};

const platformerState = {
    active: false,
    initialized: false,
    worldWidth: 2600,
    worldHeight: 0,
    gravity: 0.58,
    jumpPower: -11.6,
    moveSpeed: 3.8,
    velocityX: 0,
    velocityY: 0,
    x: 120,
    y: 0,
    width: 34,
    height: 42,
    cameraX: 0,
    platforms: [],
    levelGoal: null,
    keys: new Set(),
    rafId: null
};

// Audio context for sound effects
let audioContext = null;
let audioInitialized = false;

// Background soundtrack system
let backgroundMusic = null;
let backgroundMusicGain = null;
let backgroundMusicActive = false;

// Additional music channels for home menu and Packet Runner
let menuMusic = null;
let menuMusicGain = null;
let menuMusicInterval = null;
let menuMusicActive = false;

let packetRunnerMusic = null;
let packetRunnerMusicGain = null;
let packetRunnerMusicInterval = null;
let packetRunnerMusicActive = false;

let cipherMatchMusic = null;
let cipherMatchMusicGain = null;
let cipherMatchMusicInterval = null;
let cipherMatchMusicActive = false;

let evilMenuMusic = null;
let evilMenuMusicGain = null;
let evilMenuMusicInterval = null;
let evilMenuMusicActive = false;

let hoverBlipInitialized = false;
let lastHoverBlipAt = 0;

// Initialize audio context
function initializeAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioInitialized = true;
    } catch (e) {
        console.log('Web Audio API not supported');
        audioInitialized = false;
    }
}

// Resume audio context on user interaction (required by browsers)
function resumeAudioContext() {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

// Initialize on page load
window.addEventListener('load', function() {
    initializeAudio();
    initializeSpeech();
    setupBLIPClick();
    initializeButtonStates();
    setupSleepWakeSystem();
    setupOverworldController();
    setupArcadeMenu();
    attemptAutoStartHomeMusic();
    setTimeout(attemptAutoStartHomeMusic, 250);
    
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            attemptAutoStartHomeMusic();
        }
    });
    
    // Resume audio context on first user interaction
    document.addEventListener('click', function() {
        resumeAudioContext();
        startMenuMusicForCurrentMode();
    }, { once: true });
    
    document.addEventListener('keydown', function() {
        resumeAudioContext();
        startMenuMusicForCurrentMode();
    }, { once: true });
});

// Initialize button states on page load
function initializeButtonStates() {
    const body = document.body;
    const badBoyBtn = document.querySelector('.bad-boy-btn');
    const gameBtn = document.querySelector('.game-btn');
    
    // Set initial button text
    if (badBoyBtn) badBoyBtn.textContent = 'Evil';
    if (gameBtn) gameBtn.textContent = 'Game';
    
    // If in bad boy mode, disable game button
    if (gameBtn) {
        if (body.classList.contains('bad-boy-mode')) {
            gameBtn.disabled = true;
            gameBtn.style.opacity = '0.5';
        } else {
            gameBtn.disabled = false;
            gameBtn.style.opacity = '1';
        }
    }
}

function attemptAutoStartHomeMusic() {
    if (!audioInitialized || !audioContext) return;
    if (document.body.classList.contains('game-mode') || packetRunner.active || cipherMatch.active) return;

    const start = () => {
        startMenuMusicForCurrentMode();
    };

    if (audioContext.state === 'suspended') {
        audioContext.resume().then(start).catch(() => {
            // Browser blocked autoplay. First user interaction listeners will still start music.
        });
    } else {
        start();
    }
}

function setupArcadeMenu() {
    const minigamesBtn = document.getElementById('minigamesBtn');
    const exitPlatformerBtn = document.getElementById('exitPlatformerBtn');
    const playFirewallMinigameBtn = document.getElementById('playFirewallMinigameBtn');
    const playPacketRunnerMinigameBtn = document.getElementById('playPacketRunnerMinigameBtn');
    const playCipherMatchMinigameBtn = document.getElementById('playCipherMatchMinigameBtn');
    const closeMinigamesBtn = document.getElementById('closeMinigamesBtn');
    const closePacketRunnerBtn = document.getElementById('closePacketRunnerBtn');
    const closeCipherMatchBtn = document.getElementById('closeCipherMatchBtn');

    setupMenuHoverBlipSounds();

    if (minigamesBtn) {
        minigamesBtn.addEventListener('click', function() {
            showMinigamesMenu();
        });
    }

    if (playFirewallMinigameBtn) {
        playFirewallMinigameBtn.addEventListener('click', function() {
            hideMinigamesMenu();
            toggleGameMode();
        });
    }

    if (playPacketRunnerMinigameBtn) {
        playPacketRunnerMinigameBtn.addEventListener('click', function() {
            hideMinigamesMenu();
            startPacketRunner();
        });
    }

    if (playCipherMatchMinigameBtn) {
        playCipherMatchMinigameBtn.addEventListener('click', function() {
            hideMinigamesMenu();
            startCipherMatch();
        });
    }

    if (closeMinigamesBtn) {
        closeMinigamesBtn.addEventListener('click', function() {
            hideMinigamesMenu();
        });
    }

    if (closePacketRunnerBtn) {
        closePacketRunnerBtn.addEventListener('click', function() {
            stopPacketRunner();
            showMinigamesMenu();
        });
    }

    if (closeCipherMatchBtn) {
        closeCipherMatchBtn.addEventListener('click', function() {
            stopCipherMatch();
            showMinigamesMenu();
        });
    }

    if (exitPlatformerBtn) {
        exitPlatformerBtn.addEventListener('click', function() {
            exitPlatformerToArcade();
        });
    }

    document.addEventListener('keydown', handlePlatformerKeyDown);
    document.addEventListener('keyup', handlePlatformerKeyUp);
}

function showMinigamesMenu() {
    if (document.body.classList.contains('bad-boy-mode') || document.body.classList.contains('game-mode')) {
        return;
    }

    const scene = document.getElementById('minigamesScene');
    if (scene) {
        scene.style.display = 'flex';
    }

    if (!packetRunner.active && !cipherMatch.active) {
        startMenuMusicForCurrentMode();
    }
}

function hideMinigamesMenu() {
    const scene = document.getElementById('minigamesScene');
    if (scene) {
        scene.style.display = 'none';
    }
}

function startPacketRunner() {
    const scene = document.getElementById('packetRunnerScene');
    const track = document.getElementById('packetRunnerTrack');
    const banner = document.getElementById('packetRunnerBanner');
    if (!scene || !track) return;

    stopAllMusicChannels();
    stopCipherMatch();

    packetRunner.active = true;
    packetRunner.playerLane = 1;
    packetRunner.score = 0;
    packetRunner.lives = 3;
    packetRunner.speed = 3.8;
    packetRunner.spawnMs = 900;
    packetRunner.entities = [];

    scene.style.display = 'flex';
    track.querySelectorAll('.packet-runner-entity').forEach(node => node.remove());
    if (banner) {
        banner.style.display = 'none';
        banner.textContent = '';
    }

    updatePacketRunnerHud();
    renderPacketRunnerPlayer();

    packetRunner.keyHandler = function(e) {
        if (!packetRunner.active) return;
        const key = e.key.toLowerCase();
        if (key === 'arrowleft' || key === 'a') {
            packetRunner.playerLane = Math.max(0, packetRunner.playerLane - 1);
            renderPacketRunnerPlayer();
            e.preventDefault();
        }
        if (key === 'arrowright' || key === 'd') {
            packetRunner.playerLane = Math.min(packetRunner.laneCount - 1, packetRunner.playerLane + 1);
            renderPacketRunnerPlayer();
            e.preventDefault();
        }
    };
    document.addEventListener('keydown', packetRunner.keyHandler);

    packetRunner.spawnInterval = setInterval(() => {
        if (!packetRunner.active) return;
        spawnPacketRunnerEntity();
    }, packetRunner.spawnMs);

    packetRunner.updateInterval = setInterval(() => {
        if (!packetRunner.active) return;
        updatePacketRunner();
    }, 16);

    startPacketRunnerMusic();
}

function stopPacketRunner() {
    packetRunner.active = false;

    if (packetRunner.spawnInterval) {
        clearInterval(packetRunner.spawnInterval);
        packetRunner.spawnInterval = null;
    }
    if (packetRunner.updateInterval) {
        clearInterval(packetRunner.updateInterval);
        packetRunner.updateInterval = null;
    }
    if (packetRunner.keyHandler) {
        document.removeEventListener('keydown', packetRunner.keyHandler);
        packetRunner.keyHandler = null;
    }

    const scene = document.getElementById('packetRunnerScene');
    const track = document.getElementById('packetRunnerTrack');
    if (scene) scene.style.display = 'none';
    if (track) track.querySelectorAll('.packet-runner-entity').forEach(node => node.remove());
    packetRunner.entities = [];

    stopPacketRunnerMusic();
}

function packetLaneToPercent(lane) {
    if (lane === 0) return 16.66;
    if (lane === 1) return 50;
    return 83.33;
}

function renderPacketRunnerPlayer() {
    const player = document.getElementById('packetRunnerPlayer');
    if (!player) return;
    player.style.left = `${packetLaneToPercent(packetRunner.playerLane)}%`;
}

function spawnPacketRunnerEntity() {
    const track = document.getElementById('packetRunnerTrack');
    if (!track) return;

    const lane = Math.floor(Math.random() * packetRunner.laneCount);
    const type = Math.random() < 0.68 ? 'bad' : 'good';
    const entity = document.createElement('div');
    entity.className = `packet-runner-entity ${type}`;
    entity.style.left = `${packetLaneToPercent(lane)}%`;
    entity.style.top = '-64px';
    track.appendChild(entity);

    packetRunner.entities.push({ element: entity, lane, y: -64, type });
}

function updatePacketRunner() {
    const track = document.getElementById('packetRunnerTrack');
    const player = document.getElementById('packetRunnerPlayer');
    if (!track) return;

    const trackHeight = track.clientHeight;
    const playerY = trackHeight - 24 - 54;

    for (let i = packetRunner.entities.length - 1; i >= 0; i--) {
        const entity = packetRunner.entities[i];
        entity.y += packetRunner.speed;
        entity.element.style.top = `${entity.y}px`;

        const nearPlayerY = entity.y >= playerY - 26 && entity.y <= playerY + 26;
        if (nearPlayerY && entity.lane === packetRunner.playerLane) {
            if (entity.type === 'bad') {
                packetRunner.lives -= 1;
                playPacketRunnerDamageSound();
                animatePacketRunnerTrackHit(track);
                if (player) {
                    player.classList.remove('collect');
                    player.classList.add('hit');
                    setTimeout(() => player.classList.remove('hit'), 240);
                }
            } else {
                packetRunner.score += 120;
                playPacketRunnerCollectSound();
                if (player) {
                    player.classList.remove('hit');
                    player.classList.add('collect');
                    setTimeout(() => player.classList.remove('collect'), 220);
                }
            }
            entity.element.remove();
            packetRunner.entities.splice(i, 1);
            updatePacketRunnerHud();
            if (packetRunner.lives <= 0) {
                endPacketRunner();
                return;
            }
            continue;
        }

        if (entity.y > trackHeight + 70) {
            if (entity.type === 'good') {
                packetRunner.score += 20;
                updatePacketRunnerHud();
            }
            entity.element.remove();
            packetRunner.entities.splice(i, 1);
        }
    }

    packetRunner.score += 1;
    packetRunner.speed = Math.min(7.2, packetRunner.speed + 0.0007);
    updatePacketRunnerHud();
}

function updatePacketRunnerHud() {
    const scoreNode = document.getElementById('packetRunnerScore');
    const livesNode = document.getElementById('packetRunnerLives');
    if (scoreNode) scoreNode.textContent = String(Math.floor(packetRunner.score));
    if (livesNode) livesNode.textContent = String(Math.max(0, packetRunner.lives));
}

function animatePacketRunnerTrackHit(track) {
    if (!track) return;
    track.classList.remove('hit');
    // Force reflow so repeated hits retrigger the animation cleanly
    void track.offsetWidth;
    track.classList.add('hit');
    setTimeout(() => track.classList.remove('hit'), 180);
}

function playPacketRunnerCollectSound() {
    if (!audioInitialized || !audioContext) return;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(620, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(980, audioContext.currentTime + 0.1);
    gain.gain.setValueAtTime(0.001, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.16);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.17);
}

function playPacketRunnerDamageSound() {
    if (!audioInitialized || !audioContext) return;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, audioContext.currentTime + 0.12);
    gain.gain.setValueAtTime(0.001, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.11, audioContext.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.17);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.18);
}

function endPacketRunner() {
    const banner = document.getElementById('packetRunnerBanner');
    if (banner) {
        banner.textContent = `Run Over. Final Score: ${Math.floor(packetRunner.score)}. Press Back To Minigames to play again.`;
        banner.style.display = 'block';
    }
    stopPacketRunnerLoopsOnly();
}

function stopPacketRunnerLoopsOnly() {
    packetRunner.active = false;
    if (packetRunner.spawnInterval) {
        clearInterval(packetRunner.spawnInterval);
        packetRunner.spawnInterval = null;
    }
    if (packetRunner.updateInterval) {
        clearInterval(packetRunner.updateInterval);
        packetRunner.updateInterval = null;
    }
    if (packetRunner.keyHandler) {
        document.removeEventListener('keydown', packetRunner.keyHandler);
        packetRunner.keyHandler = null;
    }
}

function startCipherMatch() {
    const scene = document.getElementById('cipherMatchScene');
    const grid = document.getElementById('cipherGrid');
    const banner = document.getElementById('cipherBanner');
    if (!scene || !grid) return;

    cipherMatch.active = true;
    stopAllMusicChannels();
    stopPacketRunner();

    cipherMatch.totalPairs = 6;
    cipherMatch.matchedPairs = 0;
    cipherMatch.flippedIndexes = [];
    cipherMatch.lockBoard = false;
    cipherMatch.timeLeft = 60;

    const selected = cipherMatch.symbols.slice(0, cipherMatch.totalPairs);
    cipherMatch.deck = shuffleArray([...selected, ...selected]).map((symbol, index) => ({
        index,
        symbol,
        revealed: false,
        matched: false,
    }));

    scene.style.display = 'flex';
    if (banner) {
        banner.style.display = 'none';
        banner.textContent = '';
    }

    renderCipherGrid();
    updateCipherHud();
    startCipherTimer();
    startCipherMatchMusic();
}

function stopCipherMatch() {
    cipherMatch.active = false;
    if (cipherMatch.timerInterval) {
        clearInterval(cipherMatch.timerInterval);
        cipherMatch.timerInterval = null;
    }
    const scene = document.getElementById('cipherMatchScene');
    const grid = document.getElementById('cipherGrid');
    if (scene) scene.style.display = 'none';
    if (grid) grid.innerHTML = '';
    stopCipherMatchMusic();
}

function startCipherTimer() {
    if (cipherMatch.timerInterval) {
        clearInterval(cipherMatch.timerInterval);
    }
    cipherMatch.timerInterval = setInterval(() => {
        if (!cipherMatch.active) return;
        cipherMatch.timeLeft -= 1;
        updateCipherHud();
        if (cipherMatch.timeLeft <= 0) {
            endCipherMatch(false);
        }
    }, 1000);
}

function renderCipherGrid() {
    const grid = document.getElementById('cipherGrid');
    if (!grid) return;
    grid.innerHTML = '';

    cipherMatch.deck.forEach((card, idx) => {
        const tile = document.createElement('button');
        tile.className = 'cipher-card';
        if (card.revealed) tile.classList.add('revealed');
        if (card.matched) tile.classList.add('matched');
        tile.setAttribute('type', 'button');
        tile.dataset.index = String(idx);
        tile.innerHTML = `<span>${card.revealed || card.matched ? card.symbol : '?'}</span>`;
        tile.addEventListener('click', () => handleCipherCardFlip(idx));
        grid.appendChild(tile);
    });
}

function handleCipherCardFlip(index) {
    if (!cipherMatch.active || cipherMatch.lockBoard) return;
    const card = cipherMatch.deck[index];
    if (!card || card.revealed || card.matched) return;

    card.revealed = true;
    cipherMatch.flippedIndexes.push(index);
    renderCipherGrid();

    if (cipherMatch.flippedIndexes.length < 2) return;

    const [firstIdx, secondIdx] = cipherMatch.flippedIndexes;
    const first = cipherMatch.deck[firstIdx];
    const second = cipherMatch.deck[secondIdx];

    if (first.symbol === second.symbol) {
        first.matched = true;
        second.matched = true;
        cipherMatch.flippedIndexes = [];
        cipherMatch.matchedPairs += 1;
        updateCipherHud();
        renderCipherGrid();
        if (cipherMatch.matchedPairs >= cipherMatch.totalPairs) {
            endCipherMatch(true);
        }
        return;
    }

    cipherMatch.lockBoard = true;
    setTimeout(() => {
        first.revealed = false;
        second.revealed = false;
        cipherMatch.flippedIndexes = [];
        cipherMatch.lockBoard = false;
        renderCipherGrid();
    }, 550);
}

function updateCipherHud() {
    const pairsNode = document.getElementById('cipherPairsLeft');
    const timeNode = document.getElementById('cipherTimeLeft');
    if (pairsNode) pairsNode.textContent = String(Math.max(0, cipherMatch.totalPairs - cipherMatch.matchedPairs));
    if (timeNode) timeNode.textContent = String(Math.max(0, cipherMatch.timeLeft));
}

function endCipherMatch(won) {
    if (cipherMatch.timerInterval) {
        clearInterval(cipherMatch.timerInterval);
        cipherMatch.timerInterval = null;
    }
    cipherMatch.active = false;

    const banner = document.getElementById('cipherBanner');
    if (banner) {
        banner.textContent = won
            ? `Cipher cracked with ${cipherMatch.timeLeft}s left. Nice work.`
            : 'Time expired. Press Back To Minigames and try again.';
        banner.style.display = 'block';
    }
}

function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

// Setup click functionality for BLIP
function setupBLIPClick() {
    const robotHead = document.querySelector('.robot-head');
    robotHead.style.cursor = 'pointer'; // Make it look clickable
    
    robotHead.addEventListener('click', function() {
        handleBLIPClick();
    });
}

// Handle BLIP click
function handleBLIPClick() {
    const body = document.body;
    const robotHead = document.querySelector('.robot-head');

    // In normal mode, BLIP now guides the player to use map controls.
    if (!body.classList.contains('game-mode') && !body.classList.contains('bad-boy-mode')) {
        wakeUp();
        const instruction = document.querySelector('.blip-instruction');
        if (instruction) {
            instruction.textContent = 'BLIP: Pick Minigames or Settings from the Playground menu!';
        }
        return;
    }

    // In bad mode, give a funny no-minigame response.
    if (body.classList.contains('bad-boy-mode')) {
        const message = evilClickResponses[Math.floor(Math.random() * evilClickResponses.length)];
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 0.8;
        utterance.pitch = 0.6;
        utterance.volume = 1.0;
        const voices = speechSynthesis.getVoices();
        const evilVoice = voices.find(v => /male|deep|fred|zarvox|alex|daniel|paul|alloy/i.test(v.name + v.voiceURI)) || voices[0];
        if (evilVoice) utterance.voice = evilVoice;
        utterance.onstart = function() {
            wakeUp();
            robotHead.classList.add('speaking');
            document.querySelector('.horn').classList.add('speaking');
            document.querySelector('.left-eye').classList.add('speaking');
            document.querySelector('.right-eye').classList.add('speaking');
        };
        utterance.onend = function() {
            robotHead.classList.remove('speaking');
            document.querySelector('.horn').classList.remove('speaking');
            document.querySelector('.left-eye').classList.remove('speaking');
            document.querySelector('.right-eye').classList.remove('speaking');
            setTimeout(() => {
                if (!isSpeaking() && !document.body.classList.contains('game-mode')) {
                    setSleepState(true);
                }
            }, 2000);
        };
        speechSynthesis.speak(utterance);

        robotHead.classList.add('clicked');
        setTimeout(() => {
            robotHead.classList.remove('clicked');
        }, 200);

        return;
    }

    // If already in game mode, keep the click animation feedback only.
    robotHead.classList.add('clicked');
    setTimeout(() => {
        robotHead.classList.remove('clicked');
    }, 200);
}

function speakText() {
    const text = document.getElementById('textInput').value;
    if (text.trim() === '') {
        alert('Please type something for BLIP to say!');
        return;
    }

    // Stop any current speech
    if (currentUtterance) {
        speechSynthesis.cancel();
    }
    
    // Check text length - most browsers have limits around 200-500 characters
    const maxLength = 300; // Conservative limit
    let textToSpeak = text;
    
    if (text.length > maxLength) {
        // Truncate text and add ellipsis
        textToSpeak = text.substring(0, maxLength) + '...';
        console.log(`Text was too long (${text.length} chars), truncated to ${textToSpeak.length} chars`);
        
        // Show a subtle warning to the user
        const textInput = document.getElementById('textInput');
        textInput.style.borderColor = '#ff6b6b';
        textInput.style.boxShadow = '0 0 10px rgba(255, 107, 107, 0.5)';
        setTimeout(() => {
            textInput.style.borderColor = '';
            textInput.style.boxShadow = '';
        }, 2000);
    }
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    currentUtterance = utterance;
    
    // Check if we're in Bad Boy Mode
    const isBadBoyMode = document.body.classList.contains('bad-boy-mode');
    
    // Get available voices
    const voices = speechSynthesis.getVoices();
    // Try to pick a dramatic voice for each mode
    if (isBadBoyMode) {
        // Evil BLIP: lowest pitch, slowest rate, deep male voice if possible
        utterance.rate = currentSpeed * 0.4;
        utterance.pitch = 0.1;
        utterance.volume = 1.0;
        // Try to pick a deep male voice
        const evilVoice = voices.find(v => /male|deep|fred|zarvox|alex|daniel|paul/i.test(v.name+v.voiceURI)) || voices[0];
        if (evilVoice) utterance.voice = evilVoice;
    } else {
        // Friendly BLIP: highest pitch, fastest rate, bright female voice if possible
        utterance.rate = currentSpeed * 1.5;
        utterance.pitch = 2.0;
        utterance.volume = 1.0;
        // Try to pick a bright female voice
        const friendlyVoice = voices.find(v => /female|susan|samantha|victoria|karen|zira|fiona|tessa/i.test(v.name+v.voiceURI)) || voices[0];
        if (friendlyVoice) utterance.voice = friendlyVoice;
    }
    
    // Add error handling
    utterance.onerror = function(event) {
        console.error('Speech synthesis error:', event.error);
        
        // Don't show alert for normal interruptions
        if (event.error !== 'interrupted') {
            alert(`Speech error: ${event.error}. Try shorter text or a different browser.`);
        }
        
        // Clean up visual effects
        document.querySelector('.robot-head').classList.remove('speaking');
        document.querySelector('.horn').classList.remove('speaking');
        document.querySelector('.left-eye').classList.remove('speaking');
        document.querySelector('.right-eye').classList.remove('speaking');
        document.getElementById('particlesContainer').classList.remove('active');
        document.body.classList.remove('speaking');
        document.getElementById('glitchOverlay').classList.remove('active');
        currentUtterance = null;
    };
    
    // Make BLIP react when speaking
    utterance.onstart = function() {
        // Wake up BLIP when starting to speak
        wakeUp();
        
        document.querySelector('.robot-head').classList.add('speaking');
        document.querySelector('.horn').classList.add('speaking');
        document.querySelector('.left-eye').classList.add('speaking');
        document.querySelector('.right-eye').classList.add('speaking');
        // Activate particles
        document.getElementById('particlesContainer').classList.add('active');
        
        // Activate glitch effects for Bad BLIP
        if (isBadBoyMode) {
            document.body.classList.add('speaking');
            document.getElementById('glitchOverlay').classList.add('active');
        }
    };

    utterance.onend = function() {
        document.querySelector('.robot-head').classList.remove('speaking');
        document.querySelector('.horn').classList.remove('speaking');
        document.querySelector('.left-eye').classList.remove('speaking');
        document.querySelector('.right-eye').classList.remove('speaking');
        // Deactivate particles
        document.getElementById('particlesContainer').classList.remove('active');
        
        // Deactivate glitch effects
        document.body.classList.remove('speaking');
        document.getElementById('glitchOverlay').classList.remove('active');
        
        currentUtterance = null;
        
        // Go back to sleep after speech ends
        setTimeout(() => {
            if (!isSpeaking() && !document.body.classList.contains('game-mode')) {
                setSleepState(true);
            }
        }, 2000); // Wait 2 seconds before sleeping
    };

    // Try to speak, with fallback
    try {
        speechSynthesis.speak(utterance);
    } catch (error) {
        console.error('Failed to start speech synthesis:', error);
        alert('Speech synthesis failed. Try refreshing the page or using a different browser.');
    }
}

function speakHoverDialogue() {
    if (isSpeaking() || hoverDialogueInProgress || document.body.classList.contains('game-mode')) {
        return;
    }

    hoverDialogueInProgress = true;

    const isBadBoyMode = document.body.classList.contains('bad-boy-mode');
    const message = isBadBoyMode
        ? badBLIPResponses[Math.floor(Math.random() * badBLIPResponses.length)]
        : hoverBLIPResponses[Math.floor(Math.random() * hoverBLIPResponses.length)];

    const utterance = new SpeechSynthesisUtterance(message);
    currentUtterance = utterance;

    const voices = speechSynthesis.getVoices();
    if (isBadBoyMode) {
        utterance.rate = 0.8;
        utterance.pitch = 0.6;
        utterance.volume = 1.0;
        const evilVoice = voices.find(v => /male|deep|fred|zarvox|alex|daniel|paul|alloy/i.test(v.name + v.voiceURI)) || voices[0];
        if (evilVoice) utterance.voice = evilVoice;
    } else {
        utterance.rate = 1.2;
        utterance.pitch = 1.5;
        utterance.volume = 1.0;
        const friendlyVoice = voices.find(v => /female|susan|samantha|victoria|karen|zira|fiona|tessa|alloy/i.test(v.name + v.voiceURI)) || voices[0];
        if (friendlyVoice) utterance.voice = friendlyVoice;
    }

    utterance.onstart = function() {
        wakeUp();
        document.querySelector('.robot-head').classList.add('speaking');
        document.querySelector('.horn').classList.add('speaking');
        document.querySelector('.left-eye').classList.add('speaking');
        document.querySelector('.right-eye').classList.add('speaking');
        document.getElementById('particlesContainer').classList.add('active');
    };

    utterance.onend = function() {
        document.querySelector('.robot-head').classList.remove('speaking');
        document.querySelector('.horn').classList.remove('speaking');
        document.querySelector('.left-eye').classList.remove('speaking');
        document.querySelector('.right-eye').classList.remove('speaking');
        document.getElementById('particlesContainer').classList.remove('active');
        currentUtterance = null;

        hoverDialogueInProgress = false;

        setTimeout(() => {
            if (!isSpeaking() && !document.body.classList.contains('game-mode')) {
                setSleepState(true);
            }
        }, 2000);
    };

    utterance.onerror = function() {
        hoverDialogueInProgress = false;
        currentUtterance = null;
    };

    speechSynthesis.speak(utterance);
}

function stopSpeech() {
    speechSynthesis.cancel();
    document.querySelector('.robot-head').classList.remove('speaking');
    document.querySelector('.horn').classList.remove('speaking');
    document.querySelector('.left-eye').classList.remove('speaking');
    document.querySelector('.right-eye').classList.remove('speaking');
    // Deactivate particles
    document.getElementById('particlesContainer').classList.remove('active');
    // Deactivate glitch effects
    document.body.classList.remove('speaking');
    document.getElementById('glitchOverlay').classList.remove('active');
    currentUtterance = null;
}

function updateSpeed() {
    const speed = document.getElementById('speedSlider').value;
    const speedValue = document.getElementById('speedValue');
    currentSpeed = parseFloat(speed);
    speedValue.textContent = speed + 'x';

    // If currently speaking, restart with new speed
    if (currentUtterance && speechSynthesis.speaking) {
        const text = document.getElementById('textInput').value;
        speechSynthesis.cancel();
        
        const newUtterance = new SpeechSynthesisUtterance(text);
        const isBadBoyMode = document.body.classList.contains('bad-boy-mode');
        const voices = speechSynthesis.getVoices();
        if (isBadBoyMode) {
            newUtterance.rate = currentSpeed * 0.4;
            newUtterance.pitch = 0.1;
            const evilVoice = voices.find(v => /male|deep|fred|zarvox|alex|daniel|paul/i.test(v.name+v.voiceURI)) || voices[0];
            if (evilVoice) newUtterance.voice = evilVoice;
        } else {
            newUtterance.rate = currentSpeed * 1.5;
            newUtterance.pitch = 2.0;
            const friendlyVoice = voices.find(v => /female|susan|samantha|victoria|karen|zira|fiona|tessa/i.test(v.name+v.voiceURI)) || voices[0];
            if (friendlyVoice) newUtterance.voice = friendlyVoice;
        }
        newUtterance.volume = 1.0;
        currentUtterance = newUtterance;
        speechSynthesis.speak(newUtterance);
    }
}

function toggleBadBoyMode() {
    const body = document.body;
    const badBoyBtn = document.getElementById('badBoyBtn');
    const gameBtn = document.querySelector('.game-btn');
    const controls = document.querySelector('.controls');
    const textInput = document.getElementById('textInput');
    const instruction = document.querySelector('.blip-instruction');
    
    // Stop any current speech when switching modes
    if (currentUtterance) {
        speechSynthesis.cancel();
        
        document.querySelector('.robot-head').classList.remove('speaking');
        document.querySelector('.horn').classList.remove('speaking');
        document.querySelector('.left-eye').classList.remove('speaking');
        document.querySelector('.right-eye').classList.remove('speaking');
        // Deactivate particles
        document.getElementById('particlesContainer').classList.remove('active');
        // Deactivate glitch effects
        document.body.classList.remove('speaking');
        document.getElementById('glitchOverlay').classList.remove('active');
        currentUtterance = null;
    }
    
    // Clear text input when switching modes
    if (textInput) {
        textInput.value = '';
    }
    
    if (body.classList.contains('bad-boy-mode')) {
        // Return to normal mode
        body.classList.remove('bad-boy-mode');
        badBoyBtn.textContent = 'Switch to Evil';
        badBoyBtn.classList.remove('active');
        
        // Change title back to BLIP's Playground
        const h1 = document.querySelector('h1');
        if (h1) h1.textContent = "BLIP's Playground";
        document.title = "BLIP's Playground";
        
        // Change placeholder back to normal
        if (textInput) {
            textInput.placeholder = 'Type here for BLIP to speak...';
        }

        // Restore normal tip text outside game mode
        if (instruction && !body.classList.contains('game-mode')) {
            instruction.textContent = 'Tip: Click BLIP, then open Minigames.';
            instruction.style.display = '';
        }

        if (!body.classList.contains('game-mode')) {
            stopAllMusicChannels();
            startMenuMusicForCurrentMode();
        }
        
        // Enable game mode button
        if (gameBtn) {
            gameBtn.disabled = false;
            gameBtn.style.opacity = '1';
        }
        
    } else {
        // Enter bad boy mode
        body.classList.add('bad-boy-mode');
        badBoyBtn.textContent = 'Switch to Good';
        badBoyBtn.classList.add('active');
        
        // Change title to EVIL BLIP's Playground
        const evilTitle = "EVIL BLIP's Playground";
        const h1 = document.querySelector('h1');
        if (h1) h1.textContent = evilTitle;
        document.title = evilTitle;
        
        // Change placeholder to EVIL BLIP
        textInput.placeholder = 'Type here for EVIL BLIP to speak...';

        // Evil mode tip should point to Good BLIP for game access
        if (instruction) {
            instruction.textContent = 'Tip: Switch to Good BLIP to open Minigames.';
            instruction.style.display = '';
        }

        if (!body.classList.contains('game-mode')) {
            stopAllMusicChannels();
            startMenuMusicForCurrentMode();
        }
        
        // Disable game mode button
        if (gameBtn) {
            gameBtn.disabled = true;
            gameBtn.style.opacity = '0.5';
        }
        
        // Exit game mode if currently in it
        if (body.classList.contains('game-mode')) {
            body.classList.remove('game-mode');
            if (gameBtn) {
                gameBtn.textContent = 'Game';
                gameBtn.classList.remove('active');
            }
            if (controls) controls.style.display = 'flex';
            if (textInput) textInput.placeholder = 'Type here for BLIP to speak...';
        }
    }
}

function startPlatformerNewGame() {
    // Start Game now routes to the original typing minigame flow.
    toggleGameMode();
}

function resumePlatformerGame() {
    // Resume is no longer exposed in the menu; keep behavior aligned if invoked.
    toggleGameMode();
}

function enterPlatformerMode(startFresh) {
    platformerState.active = true;

    const scene = document.getElementById('platformerScene');
    if (scene) scene.style.display = 'block';

    if (!platformerState.initialized) {
        initializePlatformerWorld();
    }

    if (startFresh) {
        resetPlatformerPlayer();
    } else {
        loadPlatformerSave();
    }

    if (!platformerState.rafId) {
        platformerState.rafId = requestAnimationFrame(platformerLoop);
    }
}

function initializePlatformerWorld() {
    const world = document.getElementById('platformerWorld');
    const scene = document.getElementById('platformerScene');
    if (!world || !scene) return;

    platformerState.worldHeight = scene.clientHeight;
    world.innerHTML = '<div id="platformerPlayer" class="platformer-player"></div>';

    const levelPlatforms = [
        { x: 0, y: platformerState.worldHeight - 96, w: 740, h: 30 },
        { x: 800, y: platformerState.worldHeight - 136, w: 210, h: 24 },
        { x: 1080, y: platformerState.worldHeight - 188, w: 180, h: 24 },
        { x: 1320, y: platformerState.worldHeight - 130, w: 240, h: 24 },
        { x: 1650, y: platformerState.worldHeight - 220, w: 190, h: 24 },
        { x: 1910, y: platformerState.worldHeight - 160, w: 220, h: 24 },
        { x: 2200, y: platformerState.worldHeight - 112, w: 350, h: 24 }
    ];

    platformerState.platforms = levelPlatforms;
    levelPlatforms.forEach((p) => {
        const plat = document.createElement('div');
        plat.className = 'platformer-platform';
        plat.style.left = `${p.x}px`;
        plat.style.top = `${p.y}px`;
        plat.style.width = `${p.w}px`;
        plat.style.height = `${p.h}px`;
        world.appendChild(plat);
    });

    const goal = document.createElement('div');
    goal.className = 'platformer-goal';
    goal.style.left = '2480px';
    goal.style.top = `${platformerState.worldHeight - 182}px`;
    world.appendChild(goal);
    platformerState.levelGoal = { x: 2480, y: platformerState.worldHeight - 182, w: 28, h: 70 };

    platformerState.initialized = true;
}

function resetPlatformerPlayer() {
    platformerState.x = 120;
    platformerState.y = 120;
    platformerState.velocityX = 0;
    platformerState.velocityY = 0;
    platformerState.cameraX = 0;
    savePlatformerProgress();
}

function loadPlatformerSave() {
    const saved = localStorage.getItem('blipPlatformerSave');
    if (!saved) {
        resetPlatformerPlayer();
        return;
    }

    try {
        const parsed = JSON.parse(saved);
        platformerState.x = typeof parsed.x === 'number' ? parsed.x : 120;
        platformerState.y = typeof parsed.y === 'number' ? parsed.y : 120;
        platformerState.velocityX = 0;
        platformerState.velocityY = 0;
    } catch (err) {
        resetPlatformerPlayer();
    }
}

function savePlatformerProgress() {
    localStorage.setItem('blipPlatformerSave', JSON.stringify({ x: platformerState.x, y: platformerState.y }));
}

function handlePlatformerKeyDown(e) {
    if (!platformerState.active) return;
    const key = e.key.toLowerCase();
    const gameKeys = ['arrowleft', 'arrowright', 'a', 'd', 'w', 'arrowup', ' '];
    if (gameKeys.includes(key)) {
        platformerState.keys.add(key);
        e.preventDefault();
    }
}

function handlePlatformerKeyUp(e) {
    if (!platformerState.active) return;
    platformerState.keys.delete(e.key.toLowerCase());
}

function platformerLoop() {
    if (!platformerState.active) {
        platformerState.rafId = null;
        return;
    }

    updatePlatformerPhysics();
    renderPlatformer();
    platformerState.rafId = requestAnimationFrame(platformerLoop);
}

function updatePlatformerPhysics() {
    const left = platformerState.keys.has('arrowleft') || platformerState.keys.has('a');
    const right = platformerState.keys.has('arrowright') || platformerState.keys.has('d');
    const jump = platformerState.keys.has(' ') || platformerState.keys.has('w') || platformerState.keys.has('arrowup');

    if (left && !right) {
        platformerState.velocityX = -platformerState.moveSpeed;
    } else if (right && !left) {
        platformerState.velocityX = platformerState.moveSpeed;
    } else {
        platformerState.velocityX *= 0.72;
    }

    const wasOnGround = isPlayerOnGround();
    if (jump && wasOnGround) {
        platformerState.velocityY = platformerState.jumpPower;
    }

    platformerState.velocityY += platformerState.gravity;

    platformerState.x += platformerState.velocityX;
    platformerState.y += platformerState.velocityY;

    if (platformerState.x < 0) platformerState.x = 0;
    if (platformerState.x > platformerState.worldWidth - platformerState.width) {
        platformerState.x = platformerState.worldWidth - platformerState.width;
    }

    resolvePlatformCollisions();

    if (platformerState.y > platformerState.worldHeight + 200) {
        resetPlatformerPlayer();
    }

    updatePlatformerCamera();
    checkPlatformerGoal();
}

function resolvePlatformCollisions() {
    for (const p of platformerState.platforms) {
        const playerBottom = platformerState.y + platformerState.height;
        const prevBottom = playerBottom - platformerState.velocityY;
        const withinX = platformerState.x + platformerState.width > p.x && platformerState.x < p.x + p.w;
        const crossingTop = prevBottom <= p.y && playerBottom >= p.y;

        if (withinX && crossingTop && platformerState.velocityY >= 0) {
            platformerState.y = p.y - platformerState.height;
            platformerState.velocityY = 0;
        }
    }
}

function isPlayerOnGround() {
    const feetY = platformerState.y + platformerState.height + 1;
    for (const p of platformerState.platforms) {
        const withinX = platformerState.x + platformerState.width > p.x && platformerState.x < p.x + p.w;
        if (withinX && Math.abs(feetY - p.y) <= 3) {
            return true;
        }
    }
    return false;
}

function updatePlatformerCamera() {
    const scene = document.getElementById('platformerScene');
    if (!scene) return;

    const viewport = scene.clientWidth;
    let nextCamera = platformerState.x - viewport * 0.35;
    const maxCamera = Math.max(0, platformerState.worldWidth - viewport);
    nextCamera = Math.max(0, Math.min(nextCamera, maxCamera));
    platformerState.cameraX = nextCamera;
}

function renderPlatformer() {
    const world = document.getElementById('platformerWorld');
    const player = document.getElementById('platformerPlayer');
    if (!world || !player) return;

    world.style.transform = `translateX(${-platformerState.cameraX}px)`;
    player.style.left = `${platformerState.x}px`;
    player.style.top = `${platformerState.y}px`;
}

function checkPlatformerGoal() {
    const g = platformerState.levelGoal;
    if (!g) return;

    const overlap = !(
        platformerState.x + platformerState.width < g.x ||
        platformerState.x > g.x + g.w ||
        platformerState.y + platformerState.height < g.y ||
        platformerState.y > g.y + g.h
    );

    if (overlap) {
        savePlatformerProgress();
        alert('Level clear! More platformer levels coming soon.');
        exitPlatformerToArcade();
    }
}

function exitPlatformerToArcade() {
    platformerState.active = false;
    savePlatformerProgress();

    const scene = document.getElementById('platformerScene');
    if (scene) scene.style.display = 'none';

    const menu = document.getElementById('arcadeMenu');
    const robotContainer = document.querySelector('.robot-container');
    const instruction = document.querySelector('.blip-instruction');
    if (menu) {
        menu.style.display = 'grid';
        menu.style.pointerEvents = '';
    }
    if (robotContainer) {
        robotContainer.classList.remove('launching');
        robotContainer.style.display = '';
    }
    if (instruction) {
        instruction.style.display = '';
        instruction.textContent = 'Tip: Talk to BLIP, then pick a mode from the Arcade Menu.';
    }
}

function setupOverworldController() {
    const map = document.getElementById('overworldMap');
    const player = document.getElementById('playerSprite');
    if (!map || !player) {
        return;
    }

    overworldState.active = true;
    placePlayerAtMainSpawn();
    updateOverworldPrompt();

    document.addEventListener('keydown', handleOverworldKeyDown);
    document.addEventListener('keyup', handleOverworldKeyUp);

    if (!overworldState.rafId) {
        overworldState.rafId = requestAnimationFrame(overworldTick);
    }
}

function handleOverworldKeyDown(e) {
    const key = e.key.toLowerCase();
    const movementKey = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'];

    if (movementKey.includes(key)) {
        overworldState.keys.add(key);
        e.preventDefault();
    }

    if (key === 'e' && canActivateFirewallConsole()) {
        activateFirewallConsole();
    }
}

function handleOverworldKeyUp(e) {
    overworldState.keys.delete(e.key.toLowerCase());
}

function canRunOverworld() {
    const body = document.body;
    return overworldState.active && !body.classList.contains('game-mode') && !body.classList.contains('bad-boy-mode');
}

function getOverworldMetrics() {
    const map = document.getElementById('overworldMap');
    const player = document.getElementById('playerSprite');
    if (!map || !player) {
        return null;
    }

    return {
        map,
        player,
        width: map.clientWidth,
        height: map.clientHeight,
        playerSize: player.offsetWidth || 28
    };
}

function placePlayerAtMainSpawn() {
    const metrics = getOverworldMetrics();
    if (!metrics) return;

    overworldState.x = Math.max(24, (metrics.width * 0.5) - (metrics.playerSize / 2));
    overworldState.y = Math.max(130, metrics.height * 0.72);
    renderPlayerPosition();
}

function renderPlayerPosition() {
    const player = document.getElementById('playerSprite');
    if (!player) return;

    player.style.transform = `translate(${overworldState.x}px, ${overworldState.y}px)`;
}

function canActivateFirewallConsole() {
    return canRunOverworld() && overworldState.nearConsole;
}

function activateFirewallConsole() {
    const mapPrompt = document.getElementById('mapPrompt');
    if (mapPrompt) {
        mapPrompt.textContent = 'Firewall game activated. Defend BLIP!';
    }
    toggleGameMode();
}

function updateOverworldPrompt() {
    const mapPrompt = document.getElementById('mapPrompt');
    if (!mapPrompt) return;

    if (document.body.classList.contains('bad-boy-mode')) {
        mapPrompt.textContent = 'Switch to Good BLIP to access the firewall game hub.';
        return;
    }

    if (overworldState.nearConsole) {
        mapPrompt.textContent = 'Press E to activate the firewall game.';
    } else {
        mapPrompt.textContent = 'Move to the console below the firewall and press E.';
    }
}

function updateConsoleProximity() {
    const consoleButton = document.getElementById('portalGameButton');
    const player = document.getElementById('playerSprite');
    if (!consoleButton || !player) {
        overworldState.nearConsole = false;
        return;
    }

    const consoleRect = consoleButton.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();
    const padding = 34;

    const closeEnough = !(
        playerRect.right < consoleRect.left - padding ||
        playerRect.left > consoleRect.right + padding ||
        playerRect.bottom < consoleRect.top - padding ||
        playerRect.top > consoleRect.bottom + padding
    );

    if (closeEnough !== overworldState.nearConsole) {
        overworldState.nearConsole = closeEnough;
        updateOverworldPrompt();
    }
}

function updateMiniMap() {
    const map = document.getElementById('overworldMap');
    const miniGrid = document.getElementById('miniMapGrid');
    const playerDot = document.getElementById('miniMapPlayer');
    const blipDot = document.getElementById('miniMapBlip');
    const robotContainer = document.querySelector('.robot-container');
    if (!map || !miniGrid || !playerDot || !blipDot || !robotContainer) {
        return;
    }

    const mapRect = map.getBoundingClientRect();
    const miniRect = miniGrid.getBoundingClientRect();
    const robotRect = robotContainer.getBoundingClientRect();
    const playerSize = 28;

    const playerCenterX = overworldState.x + (playerSize / 2);
    const playerCenterY = overworldState.y + (playerSize / 2);
    const blipCenterX = (robotRect.left - mapRect.left) + (robotRect.width / 2);
    const blipCenterY = (robotRect.top - mapRect.top) + (robotRect.height / 2);

    const xScale = miniRect.width / Math.max(1, mapRect.width);
    const yScale = miniRect.height / Math.max(1, mapRect.height);

    playerDot.style.left = `${playerCenterX * xScale}px`;
    playerDot.style.top = `${playerCenterY * yScale}px`;
    blipDot.style.left = `${blipCenterX * xScale}px`;
    blipDot.style.top = `${blipCenterY * yScale}px`;
}

function stepOverworldMovement() {
    const metrics = getOverworldMetrics();
    if (!metrics) return;

    const moveUp = overworldState.keys.has('arrowup') || overworldState.keys.has('w');
    const moveDown = overworldState.keys.has('arrowdown') || overworldState.keys.has('s');
    const moveLeft = overworldState.keys.has('arrowleft') || overworldState.keys.has('a');
    const moveRight = overworldState.keys.has('arrowright') || overworldState.keys.has('d');

    let dx = 0;
    let dy = 0;

    if (moveUp) dy -= overworldState.speed;
    if (moveDown) dy += overworldState.speed;
    if (moveLeft) dx -= overworldState.speed;
    if (moveRight) dx += overworldState.speed;

    if (dx === 0 && dy === 0) {
        return;
    }

    const maxX = Math.max(0, metrics.width - metrics.playerSize);
    const maxY = Math.max(0, metrics.height - metrics.playerSize);

    let nextX = overworldState.x + dx;
    let nextY = overworldState.y + dy;

    nextX = Math.max(0, Math.min(nextX, maxX));
    nextY = Math.max(0, Math.min(nextY, maxY));

    overworldState.x = nextX;
    overworldState.y = nextY;
    renderPlayerPosition();
}

function overworldTick() {
    const map = document.getElementById('overworldMap');
    if (!map) {
        return;
    }

    if (canRunOverworld()) {
        map.style.display = 'block';
        stepOverworldMovement();
        updateConsoleProximity();
        updateMiniMap();
    } else {
        map.style.display = 'none';
        overworldState.nearConsole = false;
    }

    overworldState.rafId = requestAnimationFrame(overworldTick);
}

function toggleGameMode() {
    const body = document.body;
    const gameBtn = document.querySelector('.game-btn');
    const controls = document.querySelector('.controls');
    const badBoyBtn = document.querySelector('.bad-boy-btn');
    const textInput = document.getElementById('textInput');
    const returnBtn = document.getElementById('returnBtn');
    const robotContainer = document.querySelector('.robot-container');
    const arcadeMenu = document.getElementById('arcadeMenu');
    const minigamesScene = document.getElementById('minigamesScene');
    const packetRunnerScene = document.getElementById('packetRunnerScene');
    const cipherMatchScene = document.getElementById('cipherMatchScene');
    
    // Don't allow game mode if in evil mode
    if (body.classList.contains('bad-boy-mode')) {
        alert('Game mode is only available when Good BLIP is active!');
        return;
    }
    
    // Stop any current speech when switching modes
    if (currentUtterance) {
        speechSynthesis.cancel();
        document.querySelector('.robot-head').classList.remove('speaking');
        document.querySelector('.horn').classList.remove('speaking');
        document.querySelector('.left-eye').classList.remove('speaking');
        document.querySelector('.right-eye').classList.remove('speaking');
        document.getElementById('particlesContainer').classList.remove('active');
        document.body.classList.remove('speaking');
        document.getElementById('glitchOverlay').classList.remove('active');
        currentUtterance = null;
    }
    
    if (body.classList.contains('game-mode')) {
        // Return to normal mode - refresh the page for a clean start
        window.location.reload();
    } else {
        // Enter game mode
        stopAllMusicChannels();
        stopPacketRunner();
        stopCipherMatch();

        body.classList.add('game-mode');
        const instruction = document.querySelector('.blip-instruction');
        if (instruction) {
            instruction.style.display = 'none';
        }
        if (returnBtn) {
            returnBtn.style.display = 'block';
        }
        if (controls) controls.style.display = 'none';
        if (badBoyBtn) badBoyBtn.style.display = 'none';
        if (arcadeMenu) arcadeMenu.style.display = 'none';
        if (minigamesScene) minigamesScene.style.display = 'none';
        if (packetRunnerScene) packetRunnerScene.style.display = 'none';
        if (cipherMatchScene) cipherMatchScene.style.display = 'none';
        const h1 = document.querySelector('h1');
        if (h1) h1.style.display = 'none';

        const typingWrapper = document.getElementById('typingWrapper');
        if (typingWrapper) {
            typingWrapper.style.display = 'flex';
        }

        if (textInput) {
            textInput.style.display = 'inline-block';
            textInput.placeholder = 'Type here to protect BLIP!';
            textInput.value = '';
            setTimeout(() => {
                textInput.focus();
            }, 150);
        }
        wakeUp();
        resetGame();

        // Firewall Frenzy keeps its own soundtrack in game mode.
        createBackgroundSoundtrack();
        fadeInBackgroundSoundtrack();
        
        // Move BLIP to center and animate in from the top
        robotContainer.classList.add('centered', 'slide-in');
        robotContainer.classList.remove('disappear');
        robotContainer.style.display = '';
        // Use gameModeSetTimeout for all timeouts in game mode logic
        gameModeSetTimeout(() => {
            if (!document.body.classList.contains('game-mode')) return;
            robotContainer.classList.remove('slide-in');
            // Show BLIP's particles as he starts to speak
            document.getElementById('particlesContainer').classList.add('active');
            // Now that BLIP is in position, start his intro speech
            const helpMessage = "Help me! My evil twin is invading!";
            const utterance = new SpeechSynthesisUtterance(helpMessage);
            utterance.rate = 1.5;
            utterance.pitch = 2.0;
            utterance.volume = 1.0;
            const voices = speechSynthesis.getVoices();
            const friendlyVoice = voices.find(v => /female|susan|samantha|victoria|karen|zira|fiona|tessa/i.test(v.name+v.voiceURI)) || voices[0];
            if (friendlyVoice) utterance.voice = friendlyVoice;
            currentUtterance = utterance;
            startGameClock();
            utterance.onend = function() {
                if (!document.body.classList.contains('game-mode')) return;
                currentUtterance = null;
                const tipMessage = "Type the words on the minions to destroy them!";
                const tipUtterance = new SpeechSynthesisUtterance(tipMessage);
                tipUtterance.rate = 1.2;
                tipUtterance.pitch = 2.0;
                tipUtterance.volume = 1.0;
                if (friendlyVoice) tipUtterance.voice = friendlyVoice;
                speechSynthesis.speak(tipUtterance);
                tipUtterance.onend = function() {
                    if (!document.body.classList.contains('game-mode')) return;
                    // Hide BLIP's particles just before he leaves
                    document.getElementById('particlesContainer').classList.remove('active');
                    // Animate BLIP disappearing into the firewall
                    robotContainer.classList.add('disappear');
                    gameModeSetTimeout(() => {
                        if (!document.body.classList.contains('game-mode')) return;
                        robotContainer.style.display = 'none';
                        // Show WAVE 1 warning for 4 seconds, then start game
                        const waveWarning = document.getElementById('waveWarning');
                        waveWarning.textContent = 'WAVE 1';
                        waveWarning.style.display = 'flex';
                        waveWarning.classList.add('show');
                        gameModeSetTimeout(() => {
                            if (!document.body.classList.contains('game-mode')) return;
                            waveWarning.classList.remove('show');
                            gameModeSetTimeout(() => {
                                if (!document.body.classList.contains('game-mode')) return;
                                waveWarning.style.display = 'none';
                                // Start game after warning
                                startGame();
                            }, 500); // Wait for fade out
                        }, 4000); // Show for 4 seconds
                    }, 1200); // Match BLIP disappear animation
                };
            };
            speechSynthesis.speak(utterance);
        }, 1100); // Wait for slide-in animation to finish
    }
}

// Stop speech when page is being unloaded/reloaded
window.addEventListener('beforeunload', function() {
    if (currentUtterance) {
        speechSynthesis.cancel();
    }
});

// Stop speech when page loses focus
window.addEventListener('blur', function() {
    if (currentUtterance) {
        speechSynthesis.cancel();
        
        document.querySelector('.robot-head').classList.remove('speaking');
        document.querySelector('.horn').classList.remove('speaking');
        document.querySelector('.left-eye').classList.remove('speaking');
        document.querySelector('.right-eye').classList.remove('speaking');
        // Deactivate particles
        document.getElementById('particlesContainer').classList.remove('active');
        // Deactivate glitch effects
        document.body.classList.remove('speaking');
        document.getElementById('glitchOverlay').classList.remove('active');
        currentUtterance = null;
    }
});

// Setup sleep/wake system for BLIP
function setupSleepWakeSystem() {
    const textInput = document.getElementById('textInput');
    const robotHead = document.querySelector('.robot-head');
    
    // Start in sleep state
    if (!document.body.classList.contains('game-mode')) {
        setSleepState(true);
    }
    
    // Wake up on hover and play one kid-friendly line at a time
    robotHead.addEventListener('mouseenter', function() {
        if (!document.body.classList.contains('game-mode')) {
            wakeUp();
            speakHoverDialogue();
        }
    });
    
    // Go back to sleep when mouse leaves (if not speaking)
    robotHead.addEventListener('mouseleave', function() {
        if (!isSpeaking() && !document.body.classList.contains('game-mode')) {
            setTimeout(() => {
                if (!isSpeaking() && !document.body.classList.contains('game-mode')) {
                    setSleepState(true);
                }
            }, 2000); // Wait 2 seconds before sleeping
        }
    });
}

// Check if BLIP is currently speaking
function isSpeaking() {
    return speechSynthesis.speaking || currentUtterance !== null;
}

// Set sleep state
function setSleepState(sleeping) {
    const robotHead = document.querySelector('.robot-head');
    const horn = document.querySelector('.horn');
    const leftEye = document.querySelector('.left-eye');
    const rightEye = document.querySelector('.right-eye');
    
    if (sleeping) {
        robotHead.classList.add('sleeping');
        horn.classList.add('sleeping');
        leftEye.classList.add('sleeping');
        rightEye.classList.add('sleeping');
        robotHead.classList.remove('waking');
    } else {
        robotHead.classList.remove('sleeping');
        horn.classList.remove('sleeping');
        leftEye.classList.remove('sleeping');
        rightEye.classList.remove('sleeping');
    }
}

// Wake up BLIP
function wakeUp() {
    const robotHead = document.querySelector('.robot-head');
    
    // Remove sleep state
    setSleepState(false);
    
    // Add wake-up animation
    robotHead.classList.add('waking');
    
    // Remove wake-up animation after it completes
    setTimeout(() => {
        robotHead.classList.remove('waking');
    }, 1500);
}

// Update score display
function updateScore(points) {
    gameScore += points;
    const scoreElement = document.getElementById('scoreValue');
    scoreElement.textContent = gameScore.toString().padStart(9, '0');
}

// Update clock display
function updateClock() {
    const minutes = Math.floor(gameTime / 60);
    const seconds = gameTime % 60;
    const clockElement = document.getElementById('clockValue');
    clockElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update wave based on time
    updateWave();
}

// Determine current wave based on game time
function updateWave() {
    const totalSeconds = gameTime;
    let newWave = currentWave;
    
    // New wave timing system:
    // Wave 1: 0:00 - 1:00 (60 seconds)
    // Wave 2: 1:00 - 1:50 (50 seconds)
    // Wave 3: 1:50 - 2:35 (45 seconds)
    // Wave 4: 2:35+ (final wave - no time limit, just keep going until firewall is destroyed)
    
    if (totalSeconds < 60) { // 0:00 - 1:00
        newWave = 1;
    } else if (totalSeconds < 110) { // 1:00 - 1:50
        newWave = 2;
    } else if (totalSeconds < 155) { // 1:50 - 2:35
        newWave = 3;
    } else { // 2:35+ - Final wave (no time limit)
        newWave = 4;
    }
    
    // Announce new wave if it changed
    if (newWave !== currentWave) {
        currentWave = newWave;
        announceWave();
    }
}

// Announce new wave
function announceWave() {
    // Don't announce waves if firewall is destroyed
    if (firewallDestroyed) {
        return;
    }
    
    const waveWarning = document.getElementById('waveWarning');
    waveWarning.textContent = `WAVE ${currentWave}`;
    waveWarning.style.display = 'flex';
    waveWarning.classList.add('show');
    
    // Hide after 2 seconds
    setTimeout(() => {
        waveWarning.classList.remove('show');
        setTimeout(() => {
            waveWarning.style.display = 'none';
        }, 500);
    }, 2000);
    
    // Restart minion spawning with new wave settings
    if (gameActive) {
        startMinionSpawning();
    }
    
    // BLIP announces the new wave (without mentioning wave number)
    const waveMessages = [
        "The invasion intensifies!",
        "Brace yourself!",
        "More minions incoming!",
        "It's getting harder!",
        "The battle escalates!",
        "They're coming stronger now!"
    ];
    
    const message = waveMessages[Math.floor(Math.random() * waveMessages.length)];
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1.3;
    utterance.pitch = 2.0;
    utterance.volume = 1.0;
    
    // Use friendly voice
    const voices = speechSynthesis.getVoices();
    const friendlyVoice = voices.find(v => /female|susan|samantha|victoria|karen|zira|fiona|tessa/i.test(v.name+v.voiceURI)) || voices[0];
    if (friendlyVoice) utterance.voice = friendlyVoice;
    
    // Make BLIP react (but no particles for wave announcements)
    utterance.onstart = function() {
        document.querySelector('.robot-head').classList.add('speaking');
        document.querySelector('.horn').classList.add('speaking');
        document.querySelector('.left-eye').classList.add('speaking');
        document.querySelector('.right-eye').classList.add('speaking');
        // Removed particles for wave announcements
    };

    utterance.onend = function() {
        document.querySelector('.robot-head').classList.remove('speaking');
        document.querySelector('.horn').classList.remove('speaking');
        document.querySelector('.left-eye').classList.remove('speaking');
        document.querySelector('.right-eye').classList.remove('speaking');
        // Removed particles for wave announcements
    };

    speechSynthesis.speak(utterance);
}

// Start the game clock
function startGameClock() {
    // Clear any existing interval first
    stopGameClock();
    gameTime = 0;
    updateClock();
    gameClockInterval = setInterval(() => {
        gameTime++;
        updateClock();
    }, 1000);
}

// Stop the game clock
function stopGameClock() {
    if (gameClockInterval) {
        clearInterval(gameClockInterval);
        gameClockInterval = null;
    }
}

// Reset game state
function resetGame() {
    gameScore = 0;
    gameActive = false;
    gameTime = 0;
    updateScore(0);
    updateClock();
    stopGameClock();
    stopMinionSpawning();
    
    // Reset firewall health
    firewallHealth = [2, 3, 4, 4, 5, 6]; // HP for each band (bottom to top) - thinnest to thickest
    totalFirewallHealth = 24;
    maxFirewallHealth = 24;
    firewallDestroyed = false;
    updateFirewallHealthUI();
    
    // Reset firewall visual state
    const firewall = document.querySelector('.game-firewall');
    if (firewall) {
        firewall.classList.remove('destroyed');
    }
    
    for (let i = 0; i < 6; i++) {
        // Flip the mapping: health index 0 (bottom) should map to row6 (bottom visual)
        const visualRowIndex = 6 - i;
        const bandElement = document.querySelector(`.scan-row.row${visualRowIndex}`);
        if (bandElement) {
            bandElement.style.opacity = '0.5';
            bandElement.classList.remove('damaged', 'destroyed');
        }
    }
    
    // Hide Evil BLIP if he's visible
    const evilBlip = document.getElementById('evilBlip');
    if (evilBlip) {
        evilBlip.style.display = 'none';
        evilBlip.classList.remove('glitching');
    }
    
    // Clear all minions
    const minionsContainer = document.getElementById('minionsContainer');
    minionsContainer.innerHTML = '';
    activeMinions = [];
    wordBuffer = '';
    currentWord = '';
    
    // Reset defensive words
    activeDefensiveWords = [];
    activeBarricades = [];
    if (defensiveWordSpawnInterval) {
        clearInterval(defensiveWordSpawnInterval);
        defensiveWordSpawnInterval = null;
    }
    if (defensiveCollisionInterval) {
        clearInterval(defensiveCollisionInterval);
        defensiveCollisionInterval = null;
    }
    const defensiveContainer = document.getElementById('defensiveWordsContainer');
    if (defensiveContainer) {
        defensiveContainer.innerHTML = '';
    }
    document.querySelectorAll('.positional-barricade').forEach(node => node.remove());
    
    if (gameStartTimer) {
        clearTimeout(gameStartTimer);
        gameStartTimer = null;
    }
}

// Start the game
function startGame() {
    gameActive = true;
    startMinionSpawning();
    startDefensiveWordSpawning();
    setupTypingCombat();
    // Start checking for defensive word collisions every 100ms
    if (defensiveCollisionInterval) {
        clearInterval(defensiveCollisionInterval);
    }
    defensiveCollisionInterval = setInterval(() => {
        if (gameActive) {
            checkDefensiveWordCollisions();
        } else {
            clearInterval(defensiveCollisionInterval);
            defensiveCollisionInterval = null;
        }
    }, 100);
    const typingWrapper = document.getElementById('typingWrapper');
    const textInput = document.getElementById('textInput');
    if (typingWrapper) {
        typingWrapper.style.display = 'flex';
    }
    if (textInput) {
        textInput.style.display = 'inline-block';
        textInput.focus();
        textInput.value = '';
    }

    // Show helpful instructions for new players
    showGameInstructions();
    
    console.log('Game started! Score:', gameScore, 'Time:', gameTime);
}

// Show game instructions
function showGameInstructions() {
    const textInput = document.getElementById('textInput');
    // Change placeholder to show instructions
    textInput.placeholder = 'Type the words on the minions to defeat them!';
    // Show instruction for 5 seconds, then change back
    setTimeout(() => {
        if (gameActive) {
            textInput.placeholder = 'Type here to defeat the BRET minions!';
        }
    }, 5000);
}

// Create a BRET minion
function createMinion() {
    const minion = document.createElement('div');
    minion.className = 'bret-minion';
    
    // Random position across the bottom
    const leftPos = Math.random() * (window.innerWidth - 60);
    minion.style.left = leftPos + 'px';
    
    // Choose minion type based on current wave
    const variant = Math.random();
    let minionType, wordPool;
    
    // Wave-based minion distribution - progressively harder
    if (currentWave === 1) {
        // Wave 1 (0:00 - 1:00): Mostly easy minions
        if (variant < 0.7) {
            minionType = 'normal';
            minion.classList.add('normal');
            wordPool = easyWords;
        } else {
            minionType = 'fast';
            minion.classList.add('fast');
            wordPool = mediumWords;
        }
    } else if (currentWave === 2) {
        // Wave 2 (1:00 - 1:50): More fast minions, introduce ultra-fast
        if (variant < 0.4) {
            minionType = 'normal';
            minion.classList.add('normal');
            wordPool = easyWords;
        } else if (variant < 0.8) {
            minionType = 'fast';
            minion.classList.add('fast');
            wordPool = mediumWords;
        } else {
            minionType = 'ultra-fast';
            minion.classList.add('ultra-fast');
            wordPool = hardWords;
        }
    } else if (currentWave === 3) {
        // Wave 3 (1:50 - 2:35): Mostly fast and ultra-fast minions
        if (variant < 0.2) {
            minionType = 'normal';
            minion.classList.add('normal');
            wordPool = easyWords;
        } else if (variant < 0.6) {
            minionType = 'fast';
            minion.classList.add('fast');
            wordPool = mediumWords;
        } else {
            minionType = 'ultra-fast';
            minion.classList.add('ultra-fast');
            wordPool = hardWords;
        }
    } else {
        // Wave 4+ (2:35+): Mostly ultra-fast minions with hard words
        if (variant < 0.1) {
            minionType = 'normal';
            minion.classList.add('normal');
            wordPool = easyWords;
        } else if (variant < 0.4) {
            minionType = 'fast';
            minion.classList.add('fast');
            wordPool = mediumWords;
        } else {
            minionType = 'ultra-fast';
            minion.classList.add('ultra-fast');
            wordPool = hardWords;
        }
    }
    
    // Choose word from appropriate pool
    const word = wordPool[Math.floor(Math.random() * wordPool.length)];
    
    // Create minion eyes
    const leftEye = document.createElement('div');
    leftEye.className = 'minion-eye left';
    minion.appendChild(leftEye);
    
    const rightEye = document.createElement('div');
    rightEye.className = 'minion-eye right';
    minion.appendChild(rightEye);
    
    // Create word tag
    const wordTag = document.createElement('div');
    wordTag.className = 'minion-word';
    wordTag.textContent = word;
    minion.appendChild(wordTag);
    
    // Store minion data
    minion.dataset.word = word;
    minion.dataset.type = minionType;
    minion.dataset.id = Date.now() + Math.random();
    
    // Add to container
    document.getElementById('minionsContainer').appendChild(minion);
    activeMinions.push(minion);
    
    // If firewall is destroyed, immediately apply passing-through class
    if (firewallDestroyed) {
        minion.classList.add('passing-through');
        
        // Calculate animation duration based on minion type for passing through
        const passThroughDuration = minionType === 'normal' ? 8000 : 
                                   minionType === 'fast' ? 6000 : 4000;
        
        // Remove minion after animation completes
        setTimeout(() => {
            if (minion.parentNode) {
                minion.parentNode.removeChild(minion);
            }
            // Remove from active minions
            const index = activeMinions.indexOf(minion);
            if (index > -1) {
                activeMinions.splice(index, 1);
            }
        }, passThroughDuration);
        
        return minion;
    }
    
    // Calculate animation duration based on minion type (only for normal gameplay)
    const animationDuration = minionType === 'normal' ? 15000 : 
                            minionType === 'fast' ? 10000 : 6000;
    
    // Store timeout ID so we can clear it if minion is destroyed
    const timeoutId = setTimeout(() => {
        if (minion.parentNode && !minion.classList.contains('destroyed')) {
            // Minion reached the firewall edge - handle collision
            handleMinionCollision(minion);
        }
    }, animationDuration);
    
    // Store timeout ID on minion element
    minion.dataset.timeoutId = timeoutId;
    
    return minion;
}

// Start minion spawning
function startMinionSpawning() {
    // Clear any existing interval first
    stopMinionSpawning();
    
    // Dynamic spawn delay based on current wave
    let spawnDelay;
    switch (currentWave) {
        case 1:
            spawnDelay = 2500; // 2.5 seconds - faster start
            break;
        case 2:
            spawnDelay = 2000; // 2 seconds - medium
            break;
        case 3:
            spawnDelay = 1500; // 1.5 seconds - hard
            break;
        case 4:
            spawnDelay = 1000; // 1 second - very hard
            break;
        default:
            spawnDelay = 2500;
    }
    
    // Spawn minions at regular intervals
    minionSpawnInterval = setInterval(() => {
        if (gameActive) {
            createMinion();
            
            // In later waves, sometimes spawn multiple minions
            if (currentWave >= 3 && Math.random() < 0.3) {
                // 30% chance to spawn an additional minion in waves 3+
                setTimeout(() => {
                    if (gameActive) {
                        createMinion();
                    }
                }, 500);
            }
            
            // In wave 4, sometimes spawn 3 minions at once
            if (currentWave === 4 && Math.random() < 0.2) {
                // 20% chance to spawn a third minion in wave 4
                setTimeout(() => {
                    if (gameActive) {
                        createMinion();
                    }
                }, 1000);
            }
        }
    }, spawnDelay);
}

// Stop minion spawning
function stopMinionSpawning() {
    if (minionSpawnInterval) {
        clearInterval(minionSpawnInterval);
        minionSpawnInterval = null;
    }
}

// Setup typing combat system
function setupTypingCombat() {
    if (typingCombatInitialized) return;
    typingCombatInitialized = true;

    const textInput = document.getElementById('textInput');
    if (!textInput) return;

    textInput.addEventListener('input', function(e) {
        if (!gameActive) return;

        const typedText = e.target.value.toUpperCase();
        wordBuffer = typedText;

        // Check if any minion word matches
        checkWordMatch();
        
        // Check for collisions with defensive words
        checkDefensiveWordCollisions();
    });

    // Clear input on focus to prevent confusion
    textInput.addEventListener('focus', function() {
        if (gameActive) {
            this.value = '';
            wordBuffer = '';
        }
    });
}

// Check if typed word matches any minion or defensive word
function checkWordMatch() {
    // Check for defensive words that spawn on screen (use FIFO - destroy oldest instance)
    for (let word of defensiveWordList) {
        if (wordBuffer.includes(word)) {
            // Find the FIRST (oldest) defensive word with this text
            let targetIndex = -1;
            for (let i = 0; i < activeDefensiveWords.length; i++) {
                if (activeDefensiveWords[i].text === word) {
                    targetIndex = i;
                    break;
                }
            }
            
            if (targetIndex !== -1) {
                const defWord = activeDefensiveWords[targetIndex];
                
                // Type matches a defensive word - activate positional barricade
                activatePositionalBarricade(defWord);
                
                // Remove the defensive word from screen
                if (defWord.element && defWord.element.parentNode) {
                    defWord.element.parentNode.removeChild(defWord.element);
                }
                activeDefensiveWords.splice(targetIndex, 1);
                
                // Clear the word from buffer
                wordBuffer = wordBuffer.replace(word, '');
                document.getElementById('textInput').value = wordBuffer;
                return; // Consume the defensive action
            }
        }
    }
    
    // Check for regular minion words
    for (let i = activeMinions.length - 1; i >= 0; i--) {
        const minion = activeMinions[i];
        const minionWord = minion.dataset.word;
        const minionType = minion.dataset.type;
        
        if (wordBuffer.includes(minionWord)) {
            // Capture minion position BEFORE destroying it
            const rect = minion.getBoundingClientRect();
            const minionCenterX = rect.left + rect.width / 2;
            const minionCenterY = rect.top + rect.height / 2;
            
            // Destroy the minion!
            destroyMinion(minion, true, { x: minionCenterX, y: minionCenterY }); // Pass position data
            
            // Award points based on word length and minion type
            let basePoints = minionWord.length * 100;
            let bonusMultiplier = 1;
            
            // Bonus points for faster minions
            if (minionType === 'fast') {
                bonusMultiplier = 1.5; // 50% bonus for fast minions
            } else if (minionType === 'ultra-fast') {
                bonusMultiplier = 2.5; // 150% bonus for ultra-fast minions
            }
            
            const totalPoints = Math.floor(basePoints * bonusMultiplier);
            updateScore(totalPoints);
            
            // Clear the word from buffer
            wordBuffer = wordBuffer.replace(minionWord, '');
            document.getElementById('textInput').value = wordBuffer;
            
            // BLIP celebrates! (COMMENTED OUT - no more speech interruptions)
            // celebrateMinionDefeat(minionType);
            
            break; // Only destroy one minion at a time
        }
    }
}

// Spawn a defensive word at random position on screen (avoid duplicates on screen)
function spawnDefensiveWord() {
    if (!gameActive) return;
    
    // Get list of words already on screen
    const wordsOnScreen = activeDefensiveWords.map(w => w.text);
    
    // Find a word that's not already spawned
    let availableWords = defensiveWordList.filter(w => !wordsOnScreen.includes(w));
    
    // If all words are on screen, just pick a random one
    if (availableWords.length === 0) {
        availableWords = defensiveWordList;
    }
    
    const word = availableWords[Math.floor(Math.random() * availableWords.length)];
    
    // Random position (avoid top firewall area and bottom)
    const minX = 50;
    const maxX = window.innerWidth - 150;
    const minY = 200;
    const maxY = window.innerHeight - 200;
    
    const x = Math.random() * (maxX - minX) + minX;
    const y = Math.random() * (maxY - minY) + minY;
    
    const wordElement = document.createElement('div');
    wordElement.className = 'defensive-word';
    wordElement.textContent = word;
    wordElement.style.left = x + 'px';
    wordElement.style.top = y + 'px';
    
    const container = document.getElementById('defensiveWordsContainer');
    if (container) {
        container.appendChild(wordElement);
    }
    
    const defWordObj = {
        text: word,
        x: x,
        y: y,
        element: wordElement,
        spawned: Date.now()
    };
    
    activeDefensiveWords.push(defWordObj);
}

// Activate a positional barricade at the word's location
function activatePositionalBarricade(defWord) {
    const barricadeX = defWord.x;
    const barricadeY = defWord.y;
    
    // Create persistent visual barricade at that position
    const barricade = document.createElement('div');
    barricade.className = 'positional-barricade';
    barricade.style.left = barricadeX + 'px';
    barricade.style.top = barricadeY + 'px';
    
    document.body.appendChild(barricade);

    activeBarricades.push({
        x: barricadeX,
        y: barricadeY,
        element: barricade,
        radius: 70
    });
}

// Check for minion collision with defensive words - destroy word if minion hits it
function checkDefensiveWordCollisions() {
    for (let i = activeMinions.length - 1; i >= 0; i--) {
        const minion = activeMinions[i];
        if (!minion || !minion.parentNode) continue;
        const rect = minion.getBoundingClientRect();
        const minionX = rect.left + rect.width / 2;
        const minionY = rect.top + rect.height / 2;
        let blockedByBarricade = false;
        
        for (let j = activeDefensiveWords.length - 1; j >= 0; j--) {
            const defWord = activeDefensiveWords[j];
            const wordX = defWord.x;
            const wordY = defWord.y;
            
            // Check if minion collides with word (collision radius: 100px)
            const collisionRadius = 100;
            const distance = Math.sqrt(
                Math.pow(minionX - wordX, 2) + 
                Math.pow(minionY - wordY, 2)
            );
            
            if (distance < collisionRadius) {
                // Minion destroyed the defensive word
                if (defWord.element && defWord.element.parentNode) {
                    defWord.element.parentNode.removeChild(defWord.element);
                }
                activeDefensiveWords.splice(j, 1);
            }
        }

        // Barricades are solid and remain until one minion collides with them
        for (let k = activeBarricades.length - 1; k >= 0; k--) {
            const barricade = activeBarricades[k];
            const distance = Math.sqrt(
                Math.pow(minionX - barricade.x, 2) +
                Math.pow(minionY - barricade.y, 2)
            );

            if (distance < barricade.radius) {
                destroyMinion(minion, true, { x: minionX, y: minionY }, false);
                updateScore(175);

                if (barricade.element) {
                    barricade.element.classList.add('hit');
                    setTimeout(() => {
                        if (barricade.element && barricade.element.parentNode) {
                            barricade.element.parentNode.removeChild(barricade.element);
                        }
                    }, 500);
                }
                activeBarricades.splice(k, 1);
                blockedByBarricade = true;
                break;
            }
        }

        if (blockedByBarricade) {
            continue;
        }
    }
}

// Start spawning defensive words during gameplay
function startDefensiveWordSpawning() {
    if (defensiveWordSpawnInterval) {
        clearInterval(defensiveWordSpawnInterval);
    }
    
    // Spawn defensive words every 6-8 seconds for variety
    defensiveWordSpawnInterval = setInterval(() => {
        if (gameActive) {
            spawnDefensiveWord();
        }
    }, 7000);
}

// Generate minion destruction sound (when typed correctly)
function playMinionDestructionSound() {
    if (!audioInitialized || !audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Sound settings for successful minion destruction
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.2);
    
    // Volume envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

// Generate dramatic death sound for minions killed with words
function playWordKillDeathSound() {
    if (!audioInitialized || !audioContext) return;
    
    // Create multiple oscillators for a more dramatic effect
    for (let i = 0; i < 3; i++) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Different frequencies for each oscillator
        const baseFreq = 200 + (i * 150);
        oscillator.type = 'sawtooth'; // More aggressive sound
        oscillator.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 0.3, audioContext.currentTime + 0.4);
        
        // Volume envelope with delay for each oscillator
        const delay = i * 0.05;
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + delay);
        gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + delay + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delay + 0.4);
        
        oscillator.start(audioContext.currentTime + delay);
        oscillator.stop(audioContext.currentTime + delay + 0.4);
    }
    
    // Add a bass hit for impact
    const bassOsc = audioContext.createOscillator();
    const bassGain = audioContext.createGain();
    
    bassOsc.connect(bassGain);
    bassGain.connect(audioContext.destination);
    
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(80, audioContext.currentTime);
    bassOsc.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 0.3);
    
    bassGain.gain.setValueAtTime(0, audioContext.currentTime);
    bassGain.gain.linearRampToValueAtTime(0.6, audioContext.currentTime + 0.01);
    bassGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    bassOsc.start(audioContext.currentTime);
    bassOsc.stop(audioContext.currentTime + 0.3);
}

// Create dramatic death effect for word-killed minions
function createWordKillEffect(minion, position) {
    // Use the passed position data instead of getting it from the minion
    const minionCenterX = position ? position.x : 0;
    const minionCenterY = position ? position.y : 0;
    
    // Create multiple explosion effects
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const explosion = document.createElement('div');
            explosion.className = 'word-kill-explosion';
            
            // Position explosions around the minion's center with small random offsets
            const offsetX = (Math.random() - 0.5) * 40; // Smaller offset range
            const offsetY = (Math.random() - 0.5) * 40;
            
            explosion.style.left = (minionCenterX + offsetX) + 'px';
            explosion.style.top = (minionCenterY + offsetY) + 'px';
            explosion.style.zIndex = 1500 + i;
            
            document.body.appendChild(explosion);
            
            // Remove explosion after animation
            setTimeout(() => {
                if (explosion.parentNode) {
                    explosion.parentNode.removeChild(explosion);
                }
            }, 800);
        }, i * 100);
    }
    
    // Create energy burst effect
    const energyBurst = document.createElement('div');
    energyBurst.className = 'word-kill-energy-burst';
    
    // Position energy burst at minion's center
    energyBurst.style.left = minionCenterX + 'px';
    energyBurst.style.top = minionCenterY + 'px';
    
    document.body.appendChild(energyBurst);
    
    // Remove energy burst after animation
    setTimeout(() => {
        if (energyBurst.parentNode) {
            energyBurst.parentNode.removeChild(energyBurst);
        }
    }, 1200);
}

// Destroy a minion
function destroyMinion(minion, killedByWord = false, position = null, silent = false) {
    // Clear any existing timeouts
    if (minion.dataset.timeoutId) {
        clearTimeout(parseInt(minion.dataset.timeoutId));
    }
    
    // Immediately remove from active minions
    const index = activeMinions.indexOf(minion);
    if (index > -1) {
        activeMinions.splice(index, 1);
    }
    
    // Add destroyed class for visual effect
    minion.classList.add('destroyed');
    
    // Add word-killed class for enhanced effects if killed by word
    if (killedByWord) {
        minion.classList.add('word-killed');
    }
    
    // Play appropriate destruction sound and effect (unless silent)
    if (!silent) {
        if (killedByWord) {
            playWordKillDeathSound();
            createWordKillEffect(minion, position); // Pass the captured position
        } else {
            playMinionDestructionSound();
        }
    }
    
    // Immediately remove from DOM (no delay)
    if (minion.parentNode) {
        minion.parentNode.removeChild(minion);
    }
}

// BLIP celebrates defeating a minion
function celebrateMinionDefeat(minionType) {
    let celebrationMessages;
    
    // Different messages based on minion type
    if (minionType === 'ultra-fast') {
        celebrationMessages = [
            "Ultra-fast down! Amazing!",
            "That was lightning fast!",
            "Ultra-speed defeated!",
            "Incredible reflexes!",
            "Ultra-fast destroyed!",
            "Speed demon defeated!",
            "That was intense!",
            "Ultra-fast eliminated!",
            "Lightning strike success!"
        ];
    } else if (minionType === 'fast') {
        celebrationMessages = [
            "Fast one down!",
            "Speed demon destroyed!",
            "Quick kill!",
            "Fast minion eliminated!",
            "Speedster defeated!",
            "Rapid response!",
            "Fast and furious!",
            "Speed kill!",
            "Quick elimination!"
        ];
    } else {
        // Normal minions
        celebrationMessages = [
            "Yes! Take that!",
            "Got one!",
            "You're going down!",
            "Not so tough now!",
            "Keep them coming!",
            "We're winning!",
            "Another one bites the dust!",
            "That's right!",
            "Show them who's boss!"
        ];
    }
    
    const message = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];
    const utterance = new SpeechSynthesisUtterance(message);
    
    // Celebration voice settings (more excited for faster minions)
    if (minionType === 'ultra-fast') {
        utterance.rate = 2.0;
        utterance.pitch = 2.5;
    } else if (minionType === 'fast') {
        utterance.rate = 1.9;
        utterance.pitch = 2.3;
    } else {
        utterance.rate = 1.8;
        utterance.pitch = 2.2;
    }
    
    utterance.volume = 1.0;
    
    // Use friendly voice
    const voices = speechSynthesis.getVoices();
    const friendlyVoice = voices.find(v => /female|susan|samantha|victoria|karen|zira|fiona|tessa/i.test(v.name+v.voiceURI)) || voices[0];
    if (friendlyVoice) utterance.voice = friendlyVoice;
    
    // Make BLIP react
    utterance.onstart = function() {
        document.querySelector('.robot-head').classList.add('speaking');
        document.querySelector('.horn').classList.add('speaking');
        document.querySelector('.left-eye').classList.add('speaking');
        document.querySelector('.right-eye').classList.add('speaking');
        document.getElementById('particlesContainer').classList.add('active');
    };

    utterance.onend = function() {
        document.querySelector('.robot-head').classList.remove('speaking');
        document.querySelector('.horn').classList.remove('speaking');
        document.querySelector('.left-eye').classList.remove('speaking');
        document.querySelector('.right-eye').classList.remove('speaking');
        document.getElementById('particlesContainer').classList.remove('active');
    };

    speechSynthesis.speak(utterance);
}

// End the game at 5 minutes or when firewall is destroyed
function endGame() {
    gameActive = false;
    stopMinionSpawning();
    
    // Game only ends when firewall is destroyed - no victory condition
    if (firewallDestroyed) {
        // Firewall was destroyed - defeat
        const defeatMessages = [
            "The firewall is down! We've been breached!",
            "The invasion succeeded! The firewall is destroyed!",
            "We couldn't hold them back! The firewall is gone!",
            "The minions have won! The firewall is destroyed!"
        ];
        
        const message = defeatMessages[Math.floor(Math.random() * defeatMessages.length)];
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 1.2;
        utterance.pitch = 1.8;
        utterance.volume = 1.0;
        
        // Use friendly voice
        const voices = speechSynthesis.getVoices();
        const friendlyVoice = voices.find(v => /female|susan|samantha|victoria|karen|zira|fiona|tessa/i.test(v.name+v.voiceURI)) || voices[0];
        if (friendlyVoice) utterance.voice = friendlyVoice;
        
        // Make BLIP react
        utterance.onstart = function() {
            document.querySelector('.robot-head').classList.add('speaking');
            document.querySelector('.horn').classList.add('speaking');
            document.querySelector('.left-eye').classList.add('speaking');
            document.querySelector('.right-eye').classList.add('speaking');
            document.getElementById('particlesContainer').classList.add('active');
        };

        utterance.onend = function() {
            document.querySelector('.robot-head').classList.remove('speaking');
            document.querySelector('.horn').classList.remove('speaking');
            document.querySelector('.left-eye').classList.remove('speaking');
            document.querySelector('.right-eye').classList.remove('speaking');
            document.getElementById('particlesContainer').classList.remove('active');
        };

        speechSynthesis.speak(utterance);
        
        // Show defeat message
        const waveWarning = document.getElementById('waveWarning');
        waveWarning.textContent = 'DEFEAT!';
        waveWarning.style.display = 'flex';
        waveWarning.classList.add('show');
        
        console.log('Game ended in defeat! Final score:', gameScore, 'Time:', gameTime);
    }
    // No else clause - game continues indefinitely until firewall is destroyed
}

// Handle minion collision with firewall
function handleMinionCollision(minion) {
    // If firewall is destroyed, minions just pass through
    if (firewallDestroyed) {
        // Minion passes through the destroyed firewall
        // Add visual effect for passing through
        minion.classList.add('passing-through');
        
        // Calculate animation duration based on minion type for passing through
        const minionType = minion.dataset.type;
        const passThroughDuration = minionType === 'normal' ? 8000 : 
                                   minionType === 'fast' ? 6000 : 4000;
        
        // Remove minion after animation completes
        setTimeout(() => {
            if (minion.parentNode) {
                minion.parentNode.removeChild(minion);
            }
            // Remove from active minions
            const index = activeMinions.indexOf(minion);
            if (index > -1) {
                activeMinions.splice(index, 1);
            }
        }, passThroughDuration);
        return;
    }
    
    const minionType = minion.dataset.type;
    let damage = 0;
    
    // Determine damage based on minion type
    switch(minionType) {
        case 'normal':
            damage = Math.floor(Math.random() * 2) + 1; // 1-2 damage
            break;
        case 'fast':
            damage = Math.floor(Math.random() * 2) + 2; // 2-3 damage
            break;
        case 'ultra-fast':
            damage = Math.floor(Math.random() * 2) + 3; // 3-4 damage
            break;
    }
    
    // Apply damage to firewall
    applyFirewallDamage(damage, minion);
    
    // Create explosion effect
    createMinionExplosion(minion);
    
    // Remove minion
    destroyMinion(minion);
}

// Apply damage to firewall bands
function applyFirewallDamage(damage, minion) {
    let remainingDamage = damage;
    
    // Trigger firewall damage animation
    triggerFirewallDamageAnimation();
    
    // Apply damage from bottom to top (index 0 is bottom)
    for (let i = 0; i < firewallHealth.length && remainingDamage > 0; i++) {
        if (firewallHealth[i] > 0) {
            const damageToBand = Math.min(remainingDamage, firewallHealth[i]);
            firewallHealth[i] -= damageToBand;
            remainingDamage -= damageToBand;
            
            // Update visual appearance of the band
            updateFirewallBandVisual(i);
            
            // Check if band is destroyed
            if (firewallHealth[i] <= 0) {
                destroyFirewallBand(i);
            }
        }
    }
    
    // Update total health
    totalFirewallHealth = firewallHealth.reduce((sum, hp) => sum + hp, 0);
    updateFirewallHealthUI();
    
    // Check if firewall is completely destroyed
    if (totalFirewallHealth <= 0 && !firewallDestroyed) {
        firewallDestroyed = true;
        handleFirewallDestruction();
    }
}

function updateFirewallHealthUI() {
    const healthBar = document.getElementById('firewallHealthBar');
    const healthText = document.getElementById('firewallHealthText');
    if (!healthBar || !healthText) return;

    const pct = Math.max(0, Math.round((totalFirewallHealth / Math.max(1, maxFirewallHealth)) * 100));
    healthBar.style.width = `${pct}%`;
    healthText.textContent = `${pct}%`;
}

// Trigger firewall damage animation
function triggerFirewallDamageAnimation() {
    const firewall = document.querySelector('.game-firewall');
    const leftEye = document.querySelector('.firewall-eye.left');
    const rightEye = document.querySelector('.firewall-eye.right');
    const mouth = document.querySelector('.firewall-mouth');
    
    // Count how many bands are destroyed (have 0 HP)
    const destroyedBands = firewallHealth.filter(hp => hp <= 0).length;
    
    // Always trigger basic damage animation and sound
    firewall.classList.add('damaged');
    leftEye.classList.add('damaged');
    rightEye.classList.add('damaged');
    mouth.classList.add('damaged');
    playFirewallDamageSound();
    
    // If 3 or more bands are destroyed, also trigger glitch effect and sound
    if (destroyedBands >= 3) {
        firewall.classList.add('glitching');
        playFirewallGlitchSound();
    }
    
    // Remove animation classes after animation completes
    setTimeout(() => {
        firewall.classList.remove('damaged');
        leftEye.classList.remove('damaged');
        rightEye.classList.remove('damaged');
        mouth.classList.remove('damaged');
        firewall.classList.remove('glitching');
    }, 400);
}

// Update visual appearance of firewall band
function updateFirewallBandVisual(bandIndex) {
    // Flip the mapping: health index 0 (bottom) should map to row6 (bottom visual)
    const visualRowIndex = 6 - bandIndex;
    const bandElement = document.querySelector(`.scan-row.row${visualRowIndex}`);
    if (!bandElement) return;
    const maxHealthArr = [2, 3, 4, 4, 5, 6];
    const health = firewallHealth[bandIndex];
    const maxHealth = maxHealthArr[bandIndex];
    const healthPercentage = health / maxHealth;
    bandElement.style.opacity = 0.2 + (healthPercentage * 0.8);
    bandElement.classList.add('damaged');
    setTimeout(() => {
        bandElement.classList.remove('damaged');
    }, 200);
}

// Generate band destruction sound
function playBandDestructionSound() {
    if (!audioInitialized || !audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Sound settings for band destruction
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
    
    // Volume envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// Destroy a firewall band (silent, no BLIP speech)
function destroyFirewallBand(bandIndex) {
    // Flip the mapping: health index 0 (bottom) should map to row6 (bottom visual)
    const visualRowIndex = 6 - bandIndex;
    const bandElement = document.querySelector(`.scan-row.row${visualRowIndex}`);
    if (!bandElement) return;
    
    // Add destruction animation and sound
    bandElement.classList.add('destroyed');
    playBandDestructionSound();
}

// Generate minion explosion sound
function playMinionExplosionSound() {
    if (!audioInitialized || !audioContext) return;
    
    // Create multiple oscillators for explosion effect
    for (let i = 0; i < 2; i++) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Different frequencies for each oscillator
        const baseFreq = 300 + (i * 150);
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 0.3, audioContext.currentTime + 0.4);
        
        // Volume envelope with delay
        const delay = i * 0.1;
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + delay);
        gainNode.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + delay + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delay + 0.4);
        
        oscillator.start(audioContext.currentTime + delay);
        oscillator.stop(audioContext.currentTime + delay + 0.4);
    }
}

// Create minion explosion effect
function createMinionExplosion(minion) {
    const explosion = document.createElement('div');
    explosion.className = 'minion-explosion';
    
    // Position explosion at minion's location
    const rect = minion.getBoundingClientRect();
    explosion.style.left = rect.left + 'px';
    explosion.style.top = rect.top + 'px';
    
    document.body.appendChild(explosion);
    
    // Play explosion sound
    playMinionExplosionSound();
    
    // Remove explosion after animation
    setTimeout(() => {
        if (explosion.parentNode) {
            explosion.parentNode.removeChild(explosion);
        }
    }, 1000);
}

// Generate firewall damage sound
function playFirewallDamageSound() {
    if (!audioInitialized || !audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Sound settings for damage
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
    
    // Volume envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    // Start and stop
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
}

// Generate firewall glitch sound
function playFirewallGlitchSound() {
    if (!audioInitialized || !audioContext) return;
    
    // Create multiple oscillators for glitch effect
    for (let i = 0; i < 3; i++) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Different frequencies for each oscillator
        const baseFreq = 600 + (i * 200);
        oscillator.type = i === 0 ? 'sawtooth' : 'square';
        oscillator.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, audioContext.currentTime + 0.2);
        
        // Volume envelope with delay
        const delay = i * 0.05;
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + delay);
        gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + delay + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delay + 0.25);
        
        oscillator.start(audioContext.currentTime + delay);
        oscillator.stop(audioContext.currentTime + delay + 0.25);
    }
}

// Initialize speech synthesis on page load
function initializeSpeech() {
    if (speechSynthesis.getVoices().length > 0) {
        speechInitialized = true;
    } else {
        // Wait for voices to load
        speechSynthesis.addEventListener('voiceschanged', function() {
            speechInitialized = true;
        });
    }
}

// Create arcade-style background soundtrack
function createBackgroundSoundtrack() {
    if (!audioInitialized || !audioContext) return;
    
    // Create gain node for volume control
    backgroundMusicGain = audioContext.createGain();
    backgroundMusicGain.gain.setValueAtTime(0.08, audioContext.currentTime); // Restored to original level
    backgroundMusicGain.connect(audioContext.destination);
    
    // Create multiple oscillators for arcade layers
    const oscillators = [];
    
    // Layer 1: Bass line (arcade bass)
    const bass1 = audioContext.createOscillator();
    const bassGain1 = audioContext.createGain();
    bass1.connect(bassGain1);
    bassGain1.connect(backgroundMusicGain);
    bass1.type = 'square';
    bass1.frequency.setValueAtTime(110, audioContext.currentTime);
    bassGain1.gain.setValueAtTime(0.2, audioContext.currentTime); // Restored to original level
    oscillators.push({ osc: bass1, gain: bassGain1 });
    
    // Layer 2: Mid-range arpeggio
    const arp1 = audioContext.createOscillator();
    const arpGain1 = audioContext.createGain();
    arp1.connect(arpGain1);
    arpGain1.connect(backgroundMusicGain);
    arp1.type = 'triangle';
    arp1.frequency.setValueAtTime(220, audioContext.currentTime);
    arpGain1.gain.setValueAtTime(0.15, audioContext.currentTime); // Restored to original level
    oscillators.push({ osc: arp1, gain: arpGain1 });
    
    // Layer 3: High melody
    const melody1 = audioContext.createOscillator();
    const melodyGain1 = audioContext.createGain();
    melody1.connect(melodyGain1);
    melodyGain1.connect(backgroundMusicGain);
    melody1.type = 'sine';
    melody1.frequency.setValueAtTime(440, audioContext.currentTime);
    melodyGain1.gain.setValueAtTime(0.1, audioContext.currentTime); // Restored to original level
    oscillators.push({ osc: melody1, gain: melodyGain1 });
    
    // Start all oscillators
    oscillators.forEach(({ osc }) => {
        osc.start(audioContext.currentTime);
    });
    
    // Store reference for stopping later
    backgroundMusic = oscillators;
    backgroundMusicActive = true;
    
    // Create arcade-style arpeggio pattern
    let step = 0;
    const arpeggioNotes = [220, 330, 440, 330]; // Classic arcade progression
    const bassNotes = [110, 165, 220, 165]; // Bass follows arpeggio
    const melodyNotes = [440, 660, 880, 660]; // Melody follows arpeggio
    
    setInterval(() => {
        if (!backgroundMusicActive) return;
        
        const time = audioContext.currentTime;
        const noteIndex = step % arpeggioNotes.length;
        
        // Update arpeggio frequency
        if (oscillators[1]) {
            oscillators[1].osc.frequency.setValueAtTime(arpeggioNotes[noteIndex], time);
        }
        
        // Update bass frequency
        if (oscillators[0]) {
            oscillators[0].osc.frequency.setValueAtTime(bassNotes[noteIndex], time);
        }
        
        // Update melody frequency
        if (oscillators[2]) {
            oscillators[2].osc.frequency.setValueAtTime(melodyNotes[noteIndex], time);
        }
        
        step++;
    }, 800); // Change notes every 800ms for arcade feel
}

// Stop background soundtrack
function stopBackgroundSoundtrack() {
    if (backgroundMusic) {
        backgroundMusic.forEach(({ osc, gain }) => {
            gain.gain.setValueAtTime(gain.gain.value, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1);
            setTimeout(() => {
                osc.stop();
            }, 1000);
        });
        backgroundMusic = null;
        backgroundMusicActive = false;
    }
}

// Fade in background soundtrack
function fadeInBackgroundSoundtrack() {
    if (backgroundMusicGain) {
        backgroundMusicGain.gain.setValueAtTime(0, audioContext.currentTime);
        backgroundMusicGain.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 3); // Restored to original level
    }
}

// Fade out background soundtrack
function fadeOutBackgroundSoundtrack() {
    if (backgroundMusicGain) {
        backgroundMusicGain.gain.setValueAtTime(backgroundMusicGain.gain.value, audioContext.currentTime);
        backgroundMusicGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);
    }
}

// Adjust background soundtrack volume
function adjustBackgroundVolume(volume) {
    if (backgroundMusicGain) {
        backgroundMusicGain.gain.setValueAtTime(volume, audioContext.currentTime);
    }
}

function hardStopOscillatorGroup(group) {
    if (!group) return;
    group.forEach(({ osc, gain }) => {
        if (gain) {
            try {
                gain.gain.cancelScheduledValues(audioContext.currentTime);
                gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
            } catch (e) {
                // ignore audio node race conditions
            }
        }
        if (osc) {
            try {
                osc.stop();
            } catch (e) {
                // ignore if already stopped
            }
            try {
                osc.disconnect();
            } catch (e) {
                // ignore disconnect issues
            }
        }
    });
}

function stopAllMusicChannels() {
    if (!audioContext) return;

    if (menuMusicInterval) {
        clearInterval(menuMusicInterval);
        menuMusicInterval = null;
    }
    if (packetRunnerMusicInterval) {
        clearInterval(packetRunnerMusicInterval);
        packetRunnerMusicInterval = null;
    }
    if (cipherMatchMusicInterval) {
        clearInterval(cipherMatchMusicInterval);
        cipherMatchMusicInterval = null;
    }
    if (evilMenuMusicInterval) {
        clearInterval(evilMenuMusicInterval);
        evilMenuMusicInterval = null;
    }

    hardStopOscillatorGroup(backgroundMusic);
    hardStopOscillatorGroup(menuMusic);
    hardStopOscillatorGroup(packetRunnerMusic);
    hardStopOscillatorGroup(cipherMatchMusic);
    hardStopOscillatorGroup(evilMenuMusic);

    backgroundMusic = null;
    menuMusic = null;
    packetRunnerMusic = null;
    cipherMatchMusic = null;
    evilMenuMusic = null;
    backgroundMusicActive = false;
    menuMusicActive = false;
    packetRunnerMusicActive = false;
    cipherMatchMusicActive = false;
    evilMenuMusicActive = false;
}

function startMenuMusicForCurrentMode() {
    if (document.body.classList.contains('bad-boy-mode')) {
        startEvilMenuMusic();
        return;
    }
    startHomeMenuMusic();
}

function setupMenuHoverBlipSounds() {
    if (hoverBlipInitialized) return;
    hoverBlipInitialized = true;

    document.addEventListener('mouseover', (event) => {
        const target = event.target.closest('.menu-btn, .return-btn, .minigame-card, .cipher-card');
        if (!target) return;

        const related = event.relatedTarget;
        if (related && target.contains(related)) return;

        const now = Date.now();
        if (now - lastHoverBlipAt < 180) return;
        lastHoverBlipAt = now;
        playHoverBlipSound();
    });
}

function playHoverBlipSound() {
    if (!audioInitialized || !audioContext) return;
    if (audioContext.state === 'suspended') return;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(720, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(860, audioContext.currentTime + 0.04);
    gain.gain.setValueAtTime(0.001, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.022, audioContext.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.06);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.065);
}

function startHomeMenuMusic() {
    if (!audioInitialized || !audioContext || menuMusicActive) return;
    if (document.body.classList.contains('game-mode') || packetRunner.active || cipherMatch.active) return;
    if (document.body.classList.contains('bad-boy-mode')) return;

    stopAllMusicChannels();

    menuMusicGain = audioContext.createGain();
    menuMusicGain.gain.setValueAtTime(0.07, audioContext.currentTime);
    menuMusicGain.connect(audioContext.destination);

    const bass = audioContext.createOscillator();
    const bassGain = audioContext.createGain();
    bass.type = 'triangle';
    bass.frequency.setValueAtTime(130.81, audioContext.currentTime);
    bassGain.gain.setValueAtTime(0.19, audioContext.currentTime);
    bass.connect(bassGain);
    bassGain.connect(menuMusicGain);

    const lead = audioContext.createOscillator();
    const leadGain = audioContext.createGain();
    lead.type = 'square';
    lead.frequency.setValueAtTime(261.63, audioContext.currentTime);
    leadGain.gain.setValueAtTime(0.13, audioContext.currentTime);
    lead.connect(leadGain);
    leadGain.connect(menuMusicGain);

    bass.start();
    lead.start();

    menuMusic = [{ osc: bass, gain: bassGain }, { osc: lead, gain: leadGain }];
    menuMusicActive = true;

    let step = 0;
    const bassNotes = [130.81, 146.83, 164.81, 196.0];
    const leadNotes = [261.63, 329.63, 392.0, 329.63, 293.66, 392.0, 440.0, 392.0];
    menuMusicInterval = setInterval(() => {
        if (!menuMusicActive || !menuMusic) return;
        const t = audioContext.currentTime;
        const bassIdx = step % bassNotes.length;
        const leadIdx = step % leadNotes.length;
        menuMusic[0].osc.frequency.setValueAtTime(bassNotes[bassIdx], t);
        menuMusic[1].osc.frequency.setValueAtTime(leadNotes[leadIdx], t);
        step++;
    }, 360);
}

function stopHomeMenuMusic() {
    if (menuMusicInterval) {
        clearInterval(menuMusicInterval);
        menuMusicInterval = null;
    }
    if (menuMusic) {
        menuMusic.forEach(({ osc, gain }) => {
            if (!osc || !gain || !audioContext) return;
            gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.25);
            setTimeout(() => {
                try {
                    osc.stop();
                } catch (e) {
                    // ignore if already stopped
                }
            }, 260);
        });
    }
    menuMusic = null;
    menuMusicActive = false;
}

function startEvilMenuMusic() {
    if (!audioInitialized || !audioContext || evilMenuMusicActive) return;
    if (!document.body.classList.contains('bad-boy-mode') || document.body.classList.contains('game-mode')) return;

    stopAllMusicChannels();

    evilMenuMusicGain = audioContext.createGain();
    evilMenuMusicGain.gain.setValueAtTime(0.078, audioContext.currentTime);
    evilMenuMusicGain.connect(audioContext.destination);

    const drone = audioContext.createOscillator();
    const droneGain = audioContext.createGain();
    drone.type = 'sawtooth';
    drone.frequency.setValueAtTime(82.41, audioContext.currentTime);
    droneGain.gain.setValueAtTime(0.18, audioContext.currentTime);
    drone.connect(droneGain);
    droneGain.connect(evilMenuMusicGain);

    const sting = audioContext.createOscillator();
    const stingGain = audioContext.createGain();
    sting.type = 'square';
    sting.frequency.setValueAtTime(164.81, audioContext.currentTime);
    stingGain.gain.setValueAtTime(0.1, audioContext.currentTime);
    sting.connect(stingGain);
    stingGain.connect(evilMenuMusicGain);

    drone.start();
    sting.start();

    evilMenuMusic = [{ osc: drone, gain: droneGain }, { osc: sting, gain: stingGain }];
    evilMenuMusicActive = true;

    let step = 0;
    const droneNotes = [82.41, 87.31, 73.42, 69.3];
    const stingNotes = [164.81, 155.56, 146.83, 138.59, 130.81, 123.47];
    evilMenuMusicInterval = setInterval(() => {
        if (!evilMenuMusicActive || !evilMenuMusic) return;
        const t = audioContext.currentTime;
        evilMenuMusic[0].osc.frequency.setValueAtTime(droneNotes[step % droneNotes.length], t);
        evilMenuMusic[1].osc.frequency.setValueAtTime(stingNotes[step % stingNotes.length], t);
        step++;
    }, 420);
}

function startPacketRunnerMusic() {
    if (!audioInitialized || !audioContext || packetRunnerMusicActive) return;

    stopAllMusicChannels();

    packetRunnerMusicGain = audioContext.createGain();
    packetRunnerMusicGain.gain.setValueAtTime(0.08, audioContext.currentTime);
    packetRunnerMusicGain.connect(audioContext.destination);

    const pulse = audioContext.createOscillator();
    const pulseGain = audioContext.createGain();
    pulse.type = 'square';
    pulse.frequency.setValueAtTime(196, audioContext.currentTime);
    pulseGain.gain.setValueAtTime(0.16, audioContext.currentTime);
    pulse.connect(pulseGain);
    pulseGain.connect(packetRunnerMusicGain);

    const arp = audioContext.createOscillator();
    const arpGain = audioContext.createGain();
    arp.type = 'sawtooth';
    arp.frequency.setValueAtTime(392, audioContext.currentTime);
    arpGain.gain.setValueAtTime(0.1, audioContext.currentTime);
    arp.connect(arpGain);
    arpGain.connect(packetRunnerMusicGain);

    pulse.start();
    arp.start();

    packetRunnerMusic = [{ osc: pulse, gain: pulseGain }, { osc: arp, gain: arpGain }];
    packetRunnerMusicActive = true;

    let step = 0;
    const pulseNotes = [196, 196, 220, 246.94, 246.94, 220, 196, 164.81];
    const arpNotes = [392, 493.88, 587.33, 493.88, 659.25, 587.33, 493.88, 440.0];
    packetRunnerMusicInterval = setInterval(() => {
        if (!packetRunnerMusicActive || !packetRunnerMusic) return;
        const t = audioContext.currentTime;
        const idx = step % pulseNotes.length;
        packetRunnerMusic[0].osc.frequency.setValueAtTime(pulseNotes[idx], t);
        packetRunnerMusic[1].osc.frequency.setValueAtTime(arpNotes[idx], t);
        step++;
    }, 220);
}

function stopPacketRunnerMusic() {
    if (packetRunnerMusicInterval) {
        clearInterval(packetRunnerMusicInterval);
        packetRunnerMusicInterval = null;
    }
    if (packetRunnerMusic) {
        packetRunnerMusic.forEach(({ osc, gain }) => {
            if (!osc || !gain || !audioContext) return;
            gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
            setTimeout(() => {
                try {
                    osc.stop();
                } catch (e) {
                    // ignore if already stopped
                }
            }, 210);
        });
    }
    packetRunnerMusic = null;
    packetRunnerMusicActive = false;
}

function startCipherMatchMusic() {
    if (!audioInitialized || !audioContext || cipherMatchMusicActive) return;

    stopAllMusicChannels();

    cipherMatchMusicGain = audioContext.createGain();
    cipherMatchMusicGain.gain.setValueAtTime(0.075, audioContext.currentTime);
    cipherMatchMusicGain.connect(audioContext.destination);

    const pad = audioContext.createOscillator();
    const padGain = audioContext.createGain();
    pad.type = 'triangle';
    pad.frequency.setValueAtTime(261.63, audioContext.currentTime);
    padGain.gain.setValueAtTime(0.12, audioContext.currentTime);
    pad.connect(padGain);
    padGain.connect(cipherMatchMusicGain);

    const ping = audioContext.createOscillator();
    const pingGain = audioContext.createGain();
    ping.type = 'square';
    ping.frequency.setValueAtTime(523.25, audioContext.currentTime);
    pingGain.gain.setValueAtTime(0.08, audioContext.currentTime);
    ping.connect(pingGain);
    pingGain.connect(cipherMatchMusicGain);

    pad.start();
    ping.start();

    cipherMatchMusic = [{ osc: pad, gain: padGain }, { osc: ping, gain: pingGain }];
    cipherMatchMusicActive = true;

    let step = 0;
    const padNotes = [261.63, 293.66, 329.63, 392.0, 329.63, 293.66];
    const pingNotes = [523.25, 659.25, 587.33, 783.99, 659.25, 587.33];
    cipherMatchMusicInterval = setInterval(() => {
        if (!cipherMatchMusicActive || !cipherMatchMusic) return;
        const t = audioContext.currentTime;
        const idx = step % padNotes.length;
        cipherMatchMusic[0].osc.frequency.setValueAtTime(padNotes[idx], t);
        cipherMatchMusic[1].osc.frequency.setValueAtTime(pingNotes[idx], t);
        step++;
    }, 320);
}

function stopCipherMatchMusic() {
    if (cipherMatchMusicInterval) {
        clearInterval(cipherMatchMusicInterval);
        cipherMatchMusicInterval = null;
    }
    if (cipherMatchMusic) {
        cipherMatchMusic.forEach(({ osc, gain }) => {
            if (!osc || !gain || !audioContext) return;
            gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
            setTimeout(() => {
                try {
                    osc.stop();
                } catch (e) {
                    // ignore if already stopped
                }
            }, 210);
        });
    }
    cipherMatchMusic = null;
    cipherMatchMusicActive = false;
}

// Handle firewall destruction - continue game without BLIP speech
function handleFirewallDestruction() {
    // Don't end the game, just mark firewall as destroyed
    // Minions will continue spawning and crossing over
    console.log('Firewall destroyed! Game continues...');
    
    // Stop the background soundtrack to eliminate the loud melodic sound
    stopBackgroundSoundtrack();
    
    // Add destroyed class to firewall for visual effect
    const firewall = document.querySelector('.game-firewall');
    if (firewall) {
        firewall.classList.add('destroyed');
    }
    
    // Disable the return button after firewall is destroyed (make it gray and unclickable)
    const gameBtn = document.querySelector('.game-btn');
    if (gameBtn) {
        gameBtn.disabled = true;
    }
    
    // Show Evil BLIP invasion
    const evilBlip = document.getElementById('evilBlip');
    if (evilBlip) {
        evilBlip.style.display = 'block';
        evilBlip.classList.add('glitching');
        
        // Make Evil BLIP laugh as he travels up
        playEvilBlipLaugh(); // RE-ENABLED WITH NEW QUIETER VERSION
        
        // Hide Evil BLIP after animation completes (30s)
        setTimeout(() => {
            evilBlip.style.display = 'none';
            evilBlip.classList.remove('glitching');
        }, 30000);
    }
    
    // Force all existing minions to continue past the wall
    activeMinions.forEach(minion => {
        // Clear any existing collision timeout
        if (minion.dataset.timeoutId) {
            clearTimeout(parseInt(minion.dataset.timeoutId));
        }
        
        // Simply add the passing-through class to continue past wall
        minion.classList.add('passing-through');
    });
    
    // Show brief visual indication that firewall is destroyed
    const waveWarning = document.getElementById('waveWarning');
    if (waveWarning) {
        // Hide any existing wave warnings first
        waveWarning.classList.remove('show');
        waveWarning.style.display = 'none';
        
        // Show firewall breach warning (no BLIP speech)
        waveWarning.textContent = 'FIREWALL BREACHED!';
        waveWarning.style.display = 'flex';
        waveWarning.classList.add('show');
        console.log('Firewall breach warning displayed');
        
        // Hide after 2 seconds
        setTimeout(() => {
            waveWarning.classList.remove('show');
            setTimeout(() => {
                waveWarning.style.display = 'none';
            }, 500);
        }, 2000);
    } else {
        console.error('Wave warning element not found!');
    }
    
    // Game continues - minions will now pass through the destroyed firewall
    
    // Create power surge effect that destroys all remaining enemies
    createPowerSurgeEffect();
    
    // Destroy all remaining minions with power surge
    activeMinions.forEach(minion => {
        // Clear any existing collision timeout
        if (minion.dataset.timeoutId) {
            clearTimeout(parseInt(minion.dataset.timeoutId));
        }
        
        // Create individual power surge effect for each minion
        createMinionPowerSurge(minion);
        
        // Destroy minion after power surge effect
        setTimeout(() => {
            destroyMinion(minion, false, null, true); // Silent destruction during power surge
        }, 500);
    });
    
    // After Evil BLIP finishes (30s), make BLIP scream and show game over
    setTimeout(() => {
        playBlipDeathScream();
        showGameOverScreen();
    }, 25000); // 25 seconds - appears while Evil BLIP is still crossing for more immediate feel
}

// Create power surge effect that destroys all remaining enemies
function createPowerSurgeEffect() {
    // Create main power surge wave
    const powerSurge = document.createElement('div');
    powerSurge.className = 'power-surge-wave';
    document.body.appendChild(powerSurge);
    
    // Create multiple energy pulses
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            createEnergyPulse(i);
        }, i * 100);
    }
    
    // Play power surge sound
    playPowerSurgeSound();
    
    // Remove power surge after animation
    setTimeout(() => {
        if (powerSurge.parentNode) {
            powerSurge.parentNode.removeChild(powerSurge);
        }
    }, 2000);
}

// Create individual energy pulse
function createEnergyPulse(pulseIndex) {
    const pulse = document.createElement('div');
    pulse.className = 'energy-pulse';
    pulse.style.zIndex = 1400 + pulseIndex;
    document.body.appendChild(pulse);
    
    // Remove pulse after animation
    setTimeout(() => {
        if (pulse.parentNode) {
            pulse.parentNode.removeChild(pulse);
        }
    }, 1500);
}

// Create minion power surge effect
function createMinionPowerSurge(minion) {
    // Add power surge effect to minion
    minion.classList.add('power-surge-destroyed');
    
    // Create energy burst around minion
    const energyBurst = document.createElement('div');
    energyBurst.className = 'minion-energy-burst';
    
    const rect = minion.getBoundingClientRect();
    energyBurst.style.left = rect.left + rect.width/2 + 'px';
    energyBurst.style.top = rect.top + rect.height/2 + 'px';
    
    document.body.appendChild(energyBurst);
    
    // Remove energy burst after animation
    setTimeout(() => {
        if (energyBurst.parentNode) {
            energyBurst.parentNode.removeChild(energyBurst);
        }
    }, 800);
}

// Play power surge sound
function playPowerSurgeSound() {
    if (!audioInitialized || !audioContext) return;
    
    // Create multiple oscillators for power surge effect
    for (let i = 0; i < 3; i++) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Different frequencies for each oscillator
        const baseFreq = 200 + (i * 100);
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 0.2, audioContext.currentTime + 1.5);
        
        // Volume envelope with delay
        const delay = i * 0.1;
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + delay);
        gainNode.gain.linearRampToValueAtTime(0.02, audioContext.currentTime + delay + 0.1); // Reduced from 0.05 to 0.02
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delay + 1.5);
        
        oscillator.start(audioContext.currentTime + delay);
        oscillator.stop(audioContext.currentTime + delay + 1.5);
    }
}

// Play Evil BLIP's laughing sound and speech
function playEvilBlipLaugh() {
    // Cancel any existing speech to prevent audio artifacts
    speechSynthesis.cancel();
    
    // Add a delay before starting Evil BLIP speech to prevent bloop sound
    setTimeout(() => {
        // Evil BLIP speech only - no oscillator sounds like Bad Mode BLIP
        const evilMessages = [
            "Hahaha! Your firewall is nothing!",
            "Pathetic! I've breached your defenses!",
            "Your security is a joke! Hahaha!",
            "The invasion has succeeded! Hahaha!",
            "You thought you could stop me? Hahaha!",
            "Your digital fortress is destroyed! Hahaha!",
            "I am unstoppable! Hahahaha!",
            "Your firewall is history! Hahaha!",
            "The minions will consume all! Hahaha!",
            "Victory is mine! Hahahaha!"
        ];
        
        // Speak multiple times throughout the journey like Bad Mode BLIP
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const message = evilMessages[Math.floor(Math.random() * evilMessages.length)];
                const utterance = new SpeechSynthesisUtterance(message);
                
                // Evil BLIP: exact same settings as Bad Mode BLIP
                utterance.rate = 0.4; // Fixed rate like bad boy mode (currentSpeed * 0.4 when currentSpeed = 1)
                utterance.pitch = 0.1; // Same as bad boy mode (very low pitch)
                utterance.volume = 1.0;
                
                // Try to use the same deep male voice as bad boy mode
                const voices = speechSynthesis.getVoices();
                const evilVoice = voices.find(v => /male|deep|fred|zarvox|alex|daniel|paul/i.test(v.name+v.voiceURI)) || voices[0];
                if (evilVoice) utterance.voice = evilVoice;
                
                utterance.onstart = function() {
                    console.log('Evil BLIP speaking:', message);
                };

                utterance.onend = function() {
                    console.log('Evil BLIP finished speaking');
                };

                speechSynthesis.speak(utterance);
            }, 1000 + (i * 5000)); // Start first message after 1 second, then every 5 seconds
        }
    }, 2000); // Wait 2 seconds before starting any Evil BLIP speech
}

// Play BLIP's death scream when Evil BLIP finishes
function playBlipDeathScream() {
    // Create much quieter death scream sound
    if (audioInitialized && audioContext) {
        // Create multiple oscillators for death scream effect
        for (let i = 0; i < 4; i++) {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Different frequencies for each oscillator - start high and drop
            const startFreq = 800 - (i * 100);
            const endFreq = 200 - (i * 50);
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(endFreq, audioContext.currentTime + 3);
            
            // Much quieter volume envelope
            const delay = i * 0.1;
            gainNode.gain.setValueAtTime(0, audioContext.currentTime + delay);
            gainNode.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + delay + 0.1); // Reduced from 0.3 to 0.08 (much quieter)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delay + 3);
            
            oscillator.start(audioContext.currentTime + delay);
            oscillator.stop(audioContext.currentTime + delay + 3);
        }
        
        // Add much quieter bass hit for impact
        const bassOscillator = audioContext.createOscillator();
        const bassGain = audioContext.createGain();
        
        bassOscillator.connect(bassGain);
        bassGain.connect(audioContext.destination);
        
        bassOscillator.type = 'sine';
        bassOscillator.frequency.setValueAtTime(60, audioContext.currentTime);
        bassOscillator.frequency.exponentialRampToValueAtTime(30, audioContext.currentTime + 2);
        
        bassGain.gain.setValueAtTime(0, audioContext.currentTime);
        bassGain.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01); // Reduced from 0.4 to 0.1 (much quieter)
        bassGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
        
        bassOscillator.start(audioContext.currentTime);
        bassOscillator.stop(audioContext.currentTime + 2);
    }
    
    // BLIP's death speech - sound like good BLIP, not evil BLIP
    const deathMessages = [
        "Oh no! The firewall... it's gone!",
        "I... I can't stop them...",
        "The invasion... it's too much...",
        "My defenses... they've failed...",
        "I'm... I'm losing control...",
        "The minions... they're everywhere...",
        "I can't... I can't fight anymore...",
        "The system... it's collapsing...",
        "I'm... I'm dying...",
        "Goodbye... my friend..."
    ];
    
    // Speak death message
    setTimeout(() => {
        const message = deathMessages[Math.floor(Math.random() * deathMessages.length)];
        const utterance = new SpeechSynthesisUtterance(message);
        
        // BLIP: exact same settings as good BLIP in speakText function
        utterance.rate = currentSpeed * 1.5; // Same as good BLIP (fast rate)
        utterance.pitch = 2.0; // Same as good BLIP (high pitch)
        utterance.volume = 1.0; // Same as good BLIP (full volume)
        
        // Try to use the same friendly voice as good BLIP
        const voices = speechSynthesis.getVoices();
        const friendlyVoice = voices.find(v => /female|susan|samantha|victoria|karen|zira|fiona|tessa/i.test(v.name+v.voiceURI)) || voices[0];
        if (friendlyVoice) utterance.voice = friendlyVoice;
        
        utterance.onstart = function() {
            console.log('BLIP death speech (good BLIP voice):', message);
        };

        utterance.onend = function() {
            console.log('BLIP death speech finished');
        };

        speechSynthesis.speak(utterance);
    }, 1000); // Start speech 1 second after scream sound
}

// Stop all game systems
function stopGame() {
    gameActive = false;
    stopMinionSpawning();
    stopGameClock();
    stopBackgroundSoundtrack();
    stopPacketRunnerMusic();
    stopHomeMenuMusic();
    clearGameModeTimeouts();
    
    // Stop any ongoing speech
    speechSynthesis.cancel();
    
    // Remove speaking classes from BLIP
    const robotHead = document.querySelector('.robot-head');
    const horn = document.querySelector('.horn');
    const leftEye = document.querySelector('.left-eye');
    const rightEye = document.querySelector('.right-eye');
    const particlesContainer = document.getElementById('particlesContainer');
    
    if (robotHead) robotHead.classList.remove('speaking');
    if (horn) horn.classList.remove('speaking');
    if (leftEye) leftEye.classList.remove('speaking');
    if (rightEye) rightEye.classList.remove('speaking');
    if (particlesContainer) particlesContainer.classList.remove('active');
}

// Show game over screen with return/retry options
function showGameOverScreen() {
    // Create game over overlay
    const gameOverOverlay = document.createElement('div');
    gameOverOverlay.id = 'gameOverOverlay';
    gameOverOverlay.className = 'game-over-overlay';
    gameOverOverlay.innerHTML = `
        <div class="game-over-content">
            <h2 class="game-over-title">GAME OVER</h2>
            <p class="game-over-message">The firewall has been breached. Evil BLIP has taken control.</p>
            <div class="game-over-stats">
                <div class="stat">
                    <span class="stat-label">Final Score:</span>
                    <span class="stat-value" id="finalScore">${gameScore}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Time Survived:</span>
                    <span class="stat-value" id="finalTime">${document.getElementById('clockValue').textContent}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Wave Reached:</span>
                    <span class="stat-value" id="finalWave">${currentWave}</span>
                </div>
            </div>
            <div class="game-over-buttons">
                <button class="return-btn" onclick="returnToMain()">Return to Main</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(gameOverOverlay);
    
    // Animate the game over screen in
    setTimeout(() => {
        gameOverOverlay.classList.add('show');
    }, 100);
    
    // Stop all game systems
    stopGame();
    
    // Hide game mode elements
    const gameElements = [
        document.getElementById('gameScore'),
        document.getElementById('gameClock'),
        document.getElementById('gameFirewall'),
        document.getElementById('waveWarning'),
        document.getElementById('evilBlip')
    ];
    
    gameElements.forEach(element => {
        if (element) {
            element.style.display = 'none';
        }
    });
    
    // Hide the text input
    const textInput = document.getElementById('textInput');
    if (textInput) {
        textInput.style.display = 'none';
    }
    
    // Hide the return button
    const gameBtn = document.querySelector('.game-btn');
    if (gameBtn) {
        gameBtn.style.display = 'none';
    }
}

// Retry the game - works exactly like the game mode button
function retryGame() {
    // Remove game over screen
    const gameOverOverlay = document.getElementById('gameOverOverlay');
    if (gameOverOverlay) {
        gameOverOverlay.classList.remove('show');
        setTimeout(() => {
            gameOverOverlay.remove();
        }, 500);
    }
    
    // Call toggleGameMode() exactly like the main game mode button does
    toggleGameMode();
}

// Return to main screen - refresh the page for a clean start
function returnToMain() {
    // Simply refresh the page to return to a clean main screen
    window.location.reload();
}

// Test screen overlay helpers
function showTestScreen() {
    const testScreen = document.getElementById('testScreen');
    if (!testScreen) return;
    testScreen.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function hideTestScreen() {
    const testScreen = document.getElementById('testScreen');
    if (!testScreen) return;
    testScreen.style.display = 'none';
    document.body.style.overflow = '';
}
