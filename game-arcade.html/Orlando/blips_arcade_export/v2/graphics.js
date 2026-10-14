/**
 * Graphics System for BLIP's Arcade
 * Manages all visual components and character designs
 */

// ============================================================================
// BLIP CHARACTER GRAPHICS
// ============================================================================

/**
 * Manages BLIP's limbs visibility and animation
 */
const BlipGraphics = {
    limbs: null,
    
    initialize() {
        this.limbs = {
            leftArm: document.querySelector('.blip-arm.left'),
            rightArm: document.querySelector('.blip-arm.right'),
            leftLeg: document.querySelector('.blip-leg.left'),
            rightLeg: document.querySelector('.blip-leg.right'),
        };
    },
    
    /**
     * Show all limbs when BLIP is launching
     */
    showLimbs() {
        if (!this.limbs.leftArm) this.initialize();
        Object.values(this.limbs).forEach(limb => {
            if (limb) limb.style.display = 'block';
        });
    },
    
    /**
     * Hide all limbs (for menu screen)
     */
    hideLimbs() {
        if (!this.limbs.leftArm) this.initialize();
        Object.values(this.limbs).forEach(limb => {
            if (limb) limb.style.display = 'none';
        });
    },
};

// ============================================================================
// PLAYER CHARACTER GRAPHICS (Platformer)
// ============================================================================

/**
 * Creates a visual player character for the platformer
 * Matches BLIP's color scheme but as a playable character
 */
const PlayerGraphics = {
    /**
     * Create visual player element
     * @returns {HTMLElement} The player element
     */
    createPlayerVisual() {
        const player = document.createElement('div');
        player.className = 'platformer-player';
        
        // Player has built-in ::before (eye) and ::after (accent line) via CSS
        return player;
    },
    
    /**
     * Update player position in DOM
     * @param {HTMLElement} player - Player element
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    updatePlayerPosition(player, x, y) {
        player.style.left = x + 'px';
        player.style.top = y + 'px';
    },
};

// ============================================================================
// PLATFORM GRAPHICS
// ============================================================================

/**
 * Creates visual platforms for the platformer
 */
const PlatformGraphics = {
    /**
     * Create a visual platform element
     * @param {number} width - Platform width
     * @param {number} height - Platform height
     * @returns {HTMLElement} The platform element
     */
    createPlatform(width, height) {
        const platform = document.createElement('div');
        platform.className = 'platformer-platform';
        platform.style.width = width + 'px';
        platform.style.height = height + 'px';
        return platform;
    },
    
    /**
     * Update platform position in DOM
     * @param {HTMLElement} platform - Platform element
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    updatePlatformPosition(platform, x, y) {
        platform.style.left = x + 'px';
        platform.style.top = y + 'px';
    },
};

// ============================================================================
// GOAL/OBJECTIVE GRAPHICS
// ============================================================================

/**
 * Creates the goal object that player must reach
 */
const GoalGraphics = {
    /**
     * Create a visual goal element
     * @returns {HTMLElement} The goal element
     */
    createGoal() {
        const goal = document.createElement('div');
        goal.className = 'platformer-goal';
        goal.style.cssText = `
            position: absolute;
            width: 35px;
            height: 35px;
            background: radial-gradient(circle at 30% 30%, #FFD700, #FFA500);
            border-radius: 50%;
            border: 2px solid #FF8C00;
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.8), inset 0 0 10px rgba(255, 255, 200, 0.6);
            z-index: 50;
            animation: goalPulse 1s infinite ease-in-out;
        `;
        return goal;
    },
    
    /**
     * Update goal position in DOM
     * @param {HTMLElement} goal - Goal element
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    updateGoalPosition(goal, x, y) {
        goal.style.left = x + 'px';
        goal.style.top = y + 'px';
    },
};

// ============================================================================
// BACKGROUND/PARALLAX GRAPHICS
// ============================================================================

/**
 * Manages parallax background layers
 */
const BackgroundGraphics = {
    /**
     * Create parallax background layer
     * @param {string} layerClass - CSS class for the layer ('back', 'mid', etc)
     * @returns {HTMLElement} The background layer
     */
    createParallaxLayer(layerClass) {
        const layer = document.createElement('div');
        layer.className = 'platformer-parallax ' + layerClass;
        return layer;
    },
    
    /**
     * Update parallax offset based on camera
     * @param {HTMLElement} layer - Background layer
     * @param {number} cameraX - Camera X position
     * @param {number} speed - Parallax speed multiplier (0.3-0.8)
     */
    updateParallaxPosition(layer, cameraX, speed) {
        const offset = cameraX * speed;
        layer.style.transform = `translateX(${-offset}px)`;
    },
};

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize all graphics systems
 */
function initializeGraphics() {
    BlipGraphics.initialize();
    console.log('Graphics system initialized');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGraphics);
} else {
    initializeGraphics();
}
