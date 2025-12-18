/**
 * IG Improvements - Example Configuration File
 *
 * Copy this file as 'config.js' and customize according to your needs.
 * This file is NOT included in the repo (it's in .gitignore)
 *
 * Usage:
 * 1. Copy this file: cp config.example.js config.js
 * 2. Edit config.js with your preferences
 * 3. Import in content.js if you want custom configuration
 */

const CONFIG = {
  // ========================================
  // TIMING
  // ========================================

  /**
   * Time in ms to hide controls after mouse leaves
   * @default 2000
   * @range 500-5000
   */
  CONTROLS_HIDE_DELAY: 2000,

  /**
   * Time in ms for DOM mutation debouncing
   * Reduces processing when there are many rapid changes
   * @default 300
   * @range 100-1000
   */
  DEBOUNCE_DELAY: 300,

  /**
   * Interval in ms for fallback check
   * Looks for videos that weren't detected by the observer
   * @default 3000
   * @range 2000-10000
   */
  FALLBACK_CHECK_INTERVAL: 3000,

  /**
   * Maximum number of retries to configure a video
   * @default 3
   * @range 1-10
   */
  MAX_RETRIES: 3,

  // ========================================
  // CSS SELECTORS
  // ========================================

  /**
   * Selectors for Instagram elements
   * Only change if Instagram updates its structure
   */
  SELECTORS: {
    MUTE_BUTTON: 'button svg[aria-label="Audio is muted"], button svg[aria-label="Audio is playing"]',
    TAG_BUTTON: 'svg[aria-label="Tags"]',
    VIDEO: 'video',
  },

  // ========================================
  // STYLES
  // ========================================

  /**
   * Customizable colors and styles
   */
  STYLES: {
    // Button background color
    BUTTON_BG: 'rgba(43, 48, 54, .8)',
    BUTTON_BG_HOVER: 'rgba(43, 48, 54, 1)',

    // Icon color
    ICON_COLOR: '#ffffff',

    // Icon size (px)
    ICON_SIZE: 14,

    // Progress bar color
    PROGRESS_BAR_BG: 'rgba(255, 255, 255, 0.3)',
    PROGRESS_BAR_FILL: 'white',

    // Progress bar height (px)
    PROGRESS_BAR_HEIGHT: 5,

    // Time text size
    TIME_FONT_SIZE: '12px',
    TIME_COLOR: 'white',

    // Z-index for controls
    CONTROLS_Z_INDEX: 9999,
  },

  // ========================================
  // FEATURES
  // ========================================

  /**
   * Enable/disable specific features
   */
  FEATURES: {
    /**
     * Show progress bar
     */
    SHOW_PROGRESS_BAR: true,

    /**
     * Show time indicators
     */
    SHOW_TIME_INDICATORS: true,

    /**
     * Fullscreen button
     */
    SHOW_FULLSCREEN_BUTTON: true,

    /**
     * Play/pause button
     */
    SHOW_PLAY_PAUSE_BUTTON: true,

    /**
     * Auto-hide controls
     */
    AUTO_HIDE_CONTROLS: true,

    /**
     * Allow click on video for play/pause
     */
    CLICK_TO_PLAY_PAUSE: true,
  },

  // ========================================
  // DEVELOPMENT
  // ========================================

  /**
   * Options for development and debugging
   */
  DEBUG: {
    /**
     * Enable console logs
     */
    ENABLE_LOGS: false,

    /**
     * Expose manager globally (window.igImprovements)
     */
    EXPOSE_MANAGER: false,

    /**
     * Logging level
     * 'error' | 'warn' | 'info' | 'debug'
     */
    LOG_LEVEL: 'error',

    /**
     * Show performance stats
     */
    SHOW_PERFORMANCE_STATS: false,
  },

  // ========================================
  // ADVANCED
  // ========================================

  /**
   * Advanced configurations
   * ⚠️ Only change if you know what you're doing
   */
  ADVANCED: {
    /**
     * Use IntersectionObserver for cleanup
     */
    USE_INTERSECTION_OBSERVER: true,

    /**
     * Threshold for IntersectionObserver
     */
    INTERSECTION_THRESHOLD: 0,

    /**
     * Use WeakMap for tracking (recommended)
     */
    USE_WEAKMAP_TRACKING: true,

    /**
     * MutationObserver configuration
     */
    MUTATION_OBSERVER_CONFIG: {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false,
    },
  },
};

// ========================================
// PRESETS
// ========================================

/**
 * Predefined configurations for different use cases
 */
const PRESETS = {
  /**
   * Maximum performance preset
   * Recommended for resource-limited devices
   */
  PERFORMANCE: {
    CONTROLS_HIDE_DELAY: 1500,
    DEBOUNCE_DELAY: 500,
    FALLBACK_CHECK_INTERVAL: 5000,
    MAX_RETRIES: 2,
    DEBUG: {
      ENABLE_LOGS: false,
      EXPOSE_MANAGER: false,
    },
  },

  /**
   * Development preset
   * All logs and debugging tools active
   */
  DEVELOPMENT: {
    CONTROLS_HIDE_DELAY: 5000,
    DEBOUNCE_DELAY: 100,
    FALLBACK_CHECK_INTERVAL: 2000,
    MAX_RETRIES: 5,
    DEBUG: {
      ENABLE_LOGS: true,
      EXPOSE_MANAGER: true,
      LOG_LEVEL: 'debug',
      SHOW_PERFORMANCE_STATS: true,
    },
  },

  /**
   * Minimalist preset
   * Only essentials
   */
  MINIMAL: {
    FEATURES: {
      SHOW_PROGRESS_BAR: true,
      SHOW_TIME_INDICATORS: false,
      SHOW_FULLSCREEN_BUTTON: false,
      SHOW_PLAY_PAUSE_BUTTON: true,
      AUTO_HIDE_CONTROLS: true,
      CLICK_TO_PLAY_PAUSE: true,
    },
  },

  /**
   * Full preset
   * All features enabled
   */
  FULL: {
    FEATURES: {
      SHOW_PROGRESS_BAR: true,
      SHOW_TIME_INDICATORS: true,
      SHOW_FULLSCREEN_BUTTON: true,
      SHOW_PLAY_PAUSE_BUTTON: true,
      AUTO_HIDE_CONTROLS: true,
      CLICK_TO_PLAY_PAUSE: true,
    },
  },
};

/**
 * Export configuration
 * Uncomment and adjust according to your preferred preset
 */

// Default configuration
// export default CONFIG;

// Use performance preset
// export default { ...CONFIG, ...PRESETS.PERFORMANCE };

// Use development preset
// export default { ...CONFIG, ...PRESETS.DEVELOPMENT };

// Use minimalist preset
// export default { ...CONFIG, ...PRESETS.MINIMAL };

// Use full preset
// export default { ...CONFIG, ...PRESETS.FULL };

// Custom: mix presets
// export default {
//   ...CONFIG,
//   ...PRESETS.PERFORMANCE,
//   FEATURES: PRESETS.FULL.FEATURES,
// };

