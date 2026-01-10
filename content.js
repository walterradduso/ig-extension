/**
 * IG Improvements - Extension to add video controls to Instagram
 * @version 2.0.2
 * @author WalterRadduso
 * @description Adds custom playback controls to Instagram videos (Posts and Feed only)
 */

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

const CONFIG = {
  CONTROLS_HIDE_DELAY: 2000, // ms to hide controls
  DEBOUNCE_DELAY: 300, // ms for mutation debouncing
  FALLBACK_CHECK_INTERVAL: 2000, // ms for fallback check (reduced for faster detection)
  MAX_RETRIES: 8, // max attempts to configure a video (increased for Windows)
  INITIAL_RETRY_DELAY: 500, // ms for first retry
  MAX_RETRY_DELAY: 2000, // ms for max retry delay (exponential backoff)
  ELEMENT_WAIT_TIMEOUT: 10000, // ms to wait for elements to appear
};

const SELECTORS = {
  MUTE_BUTTON: 'button svg[aria-label="Audio is muted"], button svg[aria-label="Audio is playing"]',
  TAG_BUTTON: 'svg[aria-label="Tags"]',
  VIDEO: 'video',
};

const ICONS = {
  PAUSE: `<svg xmlns="http://www.w3.org/2000/svg" fill="#ffffff" height="14" width="14" viewBox="0 0 512 512"><path d="M139.6,0H46.5C20.9,0,0,20.9,0,46.5v418.9C0,491.1,20.9,512,46.5,512h93.1c25.7,0,46.5-20.9,46.5-46.5V46.5 C186.2,20.9,165.3,0,139.6,0z M465.5,0h-93.1c-25.7,0-46.5,20.9-46.5,46.5v418.9c0,25.7,20.9,46.5,46.5,46.5h93.1 c25.7,0,46.5-20.9,46.5-46.5V46.5C512,20.9,491.1,0,465.5,0z"/></svg>`,
  PLAY: `<svg xmlns="http://www.w3.org/2000/svg" fill="#ffffff" height="14" width="14" viewBox="0 0 512 512"><path d="M464.7,221.5L86.1,7.3C52.5-11.7,25,7.5,25,50v412c0,42.5,27.5,61.7,61.1,42.7l378.6-214.1 C498.2,271.5,498.2,240.5,464.7,221.5z"/></svg>`,
  FULLSCREEN: `<svg xmlns="http://www.w3.org/2000/svg" fill="#ffffff" height="14" width="14" viewBox="0 0 512 512"><path d="M93.1,139.6l46.5-46.5L93.1,46.5L139.6,0H0v139.6l46.5-46.5L93.1,139.6z M93.1,372.4l-46.5,46.5L0,372.4V512h139.6 l-46.5-46.5l46.5-46.5L93.1,372.4z M372.4,139.6H139.6v232.7h232.7V139.6z M325.8,325.8H186.2V186.2h139.6V325.8z M372.4,0 l46.5,46.5l-46.5,46.5l46.5,46.5l46.5-46.5l46.5,46.5V0H372.4z M418.9,372.4l-46.5,46.5l46.5,46.5L372.4,512H512V372.4l-46.5,46.5 L418.9,372.4z"/></svg>`,
  SPEED: `<svg xmlns="http://www.w3.org/2000/svg" fill="#ffffff" height="14" width="14" viewBox="0 0 512 512"><path d="M256,0C114.6,0,0,114.6,0,256s114.6,256,256,256s256-114.6,256-256S397.4,0,256,0z M256,448c-105.9,0-192-86.1-192-192S150.1,64,256,64s192,86.1,192,192S361.9,448,256,448z M336,256c0,44.2-35.8,80-80,80s-80-35.8-80-80c0-8.8,7.2-16,16-16h128C328.8,240,336,247.2,336,256z M128,192c-17.7,0-32-14.3-32-32s14.3-32,32-32s32,14.3,32,32S145.7,192,128,192z M256,128c-17.7,0-32-14.3-32-32s14.3-32,32-32s32,14.3,32,32S273.7,128,256,128z M384,192c-17.7,0-32-14.3-32-32s14.3-32,32-32s32,14.3,32,32S401.7,192,384,192z"/></svg>`,
};

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

// ============================================================================
// STATE AND RESOURCE MANAGEMENT
// ============================================================================

class VideoControlsManager {
  constructor() {
    this.observer = null;
    this.fallbackInterval = null;
    this.processedVideos = new WeakMap(); // Better than dataset for tracking
    this.cleanupHandlers = new WeakMap(); // To clean up event listeners
    this.debounceTimer = null;
    this.isInitialized = false;
  }

  /**
   * Initializes the manager and sets up observers
   */
  init() {
    if (this.isInitialized) return;

    try {
      this.log('Initializing IG Improvements...');

      // Wait for DOM to be ready with multiple checks for Windows compatibility
      const initializeWhenReady = () => {
        // Check if document and body are ready
        if (document.readyState === 'loading' || !document.body) {
          // Wait for DOMContentLoaded or body to appear
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
              // Additional wait for body (important for Windows)
              this.waitForBody(() => this.start());
            });
          } else {
            // Body not ready yet, wait a bit
            setTimeout(() => this.waitForBody(() => this.start()), 100);
          }
        } else {
          // DOM seems ready, but wait a bit more for Windows
          this.waitForBody(() => this.start());
        }
      };

      initializeWhenReady();
      this.isInitialized = true;
    } catch (error) {
      this.logError('Error during initialization', error);
    }
  }

  /**
   * Waits for body to be available (important for Windows)
   */
  waitForBody(callback, maxAttempts = 20) {
    if (document.body) {
      // Body is ready, execute callback with a small delay
      setTimeout(callback, 100);
    } else if (maxAttempts > 0) {
      setTimeout(() => this.waitForBody(callback, maxAttempts - 1), 100);
    } else {
      // Give up and try anyway
      this.logError('Body not found after max attempts, proceeding anyway', null);
      setTimeout(callback, 200);
    }
  }

  /**
   * Starts observers and initial configuration
   */
  start() {
    try {
      // Wait a bit more for Windows to ensure DOM is ready
      setTimeout(() => {
        this.setupMutationObserver();

        // Process existing videos with multiple attempts
        this.processExistingVideos();
        setTimeout(() => this.processExistingVideos(), 500);
        setTimeout(() => this.processExistingVideos(), 1500);

        this.setupFallbackCheck();
        this.setupNavigationListener();
        this.log('System started successfully');
      }, 200);
    } catch (error) {
      this.logError('Error starting system', error);
    }
  }

  /**
   * Sets up the MutationObserver with debouncing
   */
  setupMutationObserver() {
    if (!document.body) {
      this.log('Body not available, retrying...');
      setTimeout(() => this.setupMutationObserver(), 100);
      return;
    }

    const config = {
      childList: true,
      subtree: true,
      attributes: false, // Don't watch attributes to reduce overhead
    };

    this.observer = new MutationObserver((mutations) => {
      // Debounce to avoid excessive processing
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.handleMutations(mutations);
      }, CONFIG.DEBOUNCE_DELAY);
    });

    this.observer.observe(document.body, config);
    this.log('Observer configured');
  }

  /**
   * Handles DOM mutations
   */
  handleMutations(mutations) {
    try {
      // Check if there are new videos added or if structure changed
      const hasVideoChanges = mutations.some((mutation) => {
        return Array.from(mutation.addedNodes).some((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return false;
          // Check for video elements or containers that might contain videos
          return (
            node.tagName === 'VIDEO' ||
            node.querySelector?.(SELECTORS.VIDEO) ||
            node.querySelector?.(SELECTORS.MUTE_BUTTON) // Also trigger on mute button appearance
          );
        });
      });

      if (hasVideoChanges) {
        // Small delay to ensure DOM is fully updated
        setTimeout(() => {
          this.processExistingVideos();
        }, 150);
      }
    } catch (error) {
      this.logError('Error in handleMutations', error);
    }
  }

  /**
   * Processes all existing videos in the DOM
   */
  processExistingVideos() {
    try {
      // Wait a bit for DOM to stabilize (especially important for Windows)
      setTimeout(() => {
        try {
          const videos = document.querySelectorAll(SELECTORS.VIDEO);
          const videoArray = Array.from(videos);

          if (videoArray.length === 0) return;

          // Process each video
          videoArray.forEach((video) => {
            // Only process if video is in DOM and not already processed
            if (document.contains(video) && !this.processedVideos.has(video)) {
              this.configureVideo(video);
            }
          });
        } catch (error) {
          this.logError('Error in processExistingVideos delayed', error);
        }
      }, 100); // Small delay to ensure DOM is stable
    } catch (error) {
      this.logError('Error in processExistingVideos', error);
    }
  }

  /**
   * Configures custom controls for a video
   */
  configureVideo(video) {
    try {
      // Validate video element is still in DOM
      if (!document.contains(video)) {
        return;
      }

      // Check if already processed
      if (this.processedVideos.has(video)) return;

      // Check if video is ready
      if (!this.isVideoReady(video)) {
        // Wait for video to be ready
        const retryCount = video.dataset.igRetries ? parseInt(video.dataset.igRetries) : 0;
        if (retryCount < CONFIG.MAX_RETRIES) {
          video.dataset.igRetries = (retryCount + 1).toString();
          const delay = Math.min(
            CONFIG.INITIAL_RETRY_DELAY * Math.pow(1.5, retryCount),
            CONFIG.MAX_RETRY_DELAY
          );
          setTimeout(() => this.configureVideo(video), delay);
        }
        return;
      }

      // Find mute button (needed to know where to insert controls)
      const muteButton = this.findMuteButton(video);

      if (!muteButton) {
        // Retry if button wasn't found with exponential backoff
        const retryCount = video.dataset.igRetries ? parseInt(video.dataset.igRetries) : 0;
        if (retryCount < CONFIG.MAX_RETRIES) {
          video.dataset.igRetries = (retryCount + 1).toString();
          const delay = Math.min(
            CONFIG.INITIAL_RETRY_DELAY * Math.pow(1.5, retryCount),
            CONFIG.MAX_RETRY_DELAY
          );
          setTimeout(() => this.configureVideo(video), delay);
        } else {
          // Try alternative method to find container
          this.tryAlternativeContainerSetup(video);
        }
        return;
      }

      // Validate mute button is still in DOM
      if (!document.contains(muteButton)) {
        return;
      }

      // Validate parent elements exist
      const parentDiv = muteButton.parentElement;
      const grandParentDiv = parentDiv?.parentElement;

      if (!parentDiv || !grandParentDiv) {
        const retryCount = video.dataset.igRetries ? parseInt(video.dataset.igRetries) : 0;
        if (retryCount < CONFIG.MAX_RETRIES) {
          video.dataset.igRetries = (retryCount + 1).toString();
          const delay = Math.min(
            CONFIG.INITIAL_RETRY_DELAY * Math.pow(1.5, retryCount),
            CONFIG.MAX_RETRY_DELAY
          );
          setTimeout(() => this.configureVideo(video), delay);
        }
        return;
      }

      // Check if controls already exist
      if (grandParentDiv.querySelector('.ig-improvements-controls')) {
        this.processedVideos.set(video, true);
        return;
      }

      // Clear retry counter
      delete video.dataset.igRetries;

      // Mark as processed
      this.processedVideos.set(video, true);

      // Create controls
      this.createControls(video, muteButton);

      this.log('Video configured successfully');
    } catch (error) {
      this.logError('Error in configureVideo', error);
      // Don't mark as processed on error, allow retry
      this.processedVideos.delete(video);
    }
  }

  /**
   * Finds Instagram's mute button with multiple strategies
   */
  findMuteButton(video) {
    try {
      // Strategy 1: Search in immediate parent
      let button = video.parentElement?.querySelector(SELECTORS.MUTE_BUTTON)?.closest('button');
      if (button && document.contains(button)) return button;

      // Strategy 2: Search in article container
      const article = video.closest('article');
      if (article) {
        button = article.querySelector(SELECTORS.MUTE_BUTTON)?.closest('button');
        if (button && document.contains(button)) return button;
      }

      // Strategy 3: Search in broader parent hierarchy
      let current = video.parentElement;
      let depth = 0;
      while (current && depth < 5) {
        button = current.querySelector(SELECTORS.MUTE_BUTTON)?.closest('button');
        if (button && document.contains(button)) return button;
        current = current.parentElement;
        depth++;
      }

      // Strategy 4: Search by aria-label directly
      const buttons = Array.from(document.querySelectorAll('button')).filter((btn) => {
        const svg = btn.querySelector(
          'svg[aria-label="Audio is muted"], svg[aria-label="Audio is playing"]'
        );
        return svg && this.isElementNearVideo(btn, video);
      });

      if (buttons.length > 0) {
        return buttons[0];
      }

      return null;
    } catch (error) {
      this.logError('Error finding mute button', error);
      return null;
    }
  }

  /**
   * Checks if an element is near a video (same container context)
   */
  isElementNearVideo(element, video) {
    try {
      const videoContainer =
        video.closest('article') || video.parentElement?.parentElement?.parentElement;
      const elementContainer =
        element.closest('article') || element.parentElement?.parentElement?.parentElement;
      return videoContainer && elementContainer && videoContainer === elementContainer;
    } catch {
      return false;
    }
  }

  /**
   * Checks if video element is ready for configuration
   */
  isVideoReady(video) {
    try {
      // Video must be in DOM
      if (!document.contains(video)) return false;

      // Video should have some dimensions (loaded)
      if (video.offsetWidth === 0 && video.offsetHeight === 0) {
        // Give it a moment, might be loading
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Alternative method to setup controls when mute button can't be found
   */
  tryAlternativeContainerSetup(video) {
    try {
      // Try to find container by looking for common Instagram structures
      const article = video.closest('article');
      if (!article) return;

      // Look for any button container near the video
      const videoContainer = video.parentElement?.parentElement?.parentElement;
      if (!videoContainer) return;

      // Check if controls already exist
      if (videoContainer.querySelector('.ig-improvements-controls')) {
        this.processedVideos.set(video, true);
        return;
      }

      // Try to create controls with a dummy mute button reference
      // We'll position relative to video instead
      const tagButton = this.findTagButton(video);
      const controlsContainer = this.createControlsContainer(tagButton);

      // Adjust positioning if no mute button found
      if (!tagButton) {
        controlsContainer.style.left = '12px';
        controlsContainer.style.right = 'auto';
      }

      const playPauseButton = this.createPlayPauseButton(video);
      const progressContainer = this.createProgressBar(video);
      const speedButton = this.createSpeedButton(video);
      const fullScreenButton = this.createFullscreenButton(video);

      controlsContainer.appendChild(playPauseButton);
      controlsContainer.appendChild(progressContainer);
      controlsContainer.appendChild(speedButton);
      controlsContainer.appendChild(fullScreenButton);

      // Try to append to video container or article
      const targetContainer = videoContainer || article;
      if (targetContainer) {
        targetContainer.appendChild(controlsContainer);
        this.setupControlsVisibility(video, targetContainer);
        this.setupCleanup(video, targetContainer);
        this.processedVideos.set(video, true);
        this.log('Video configured with alternative method');
      }
    } catch (error) {
      this.logError('Error in alternative container setup', error);
    }
  }

  /**
   * Finds tag button in the video context
   */
  findTagButton(video) {
    try {
      // Search in video container, not in entire document
      const container =
        video.closest('article') || video.parentElement?.parentElement?.parentElement;
      return container?.querySelector(SELECTORS.TAG_BUTTON) || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Creates all custom controls
   */
  createControls(video, muteButton) {
    try {
      // Validate inputs
      if (!video || !document.contains(video)) {
        this.logError('Video element invalid or not in DOM', null);
        return;
      }

      if (!muteButton || !document.contains(muteButton)) {
        this.logError('Mute button invalid or not in DOM', null);
        return;
      }

      const parentDiv = muteButton.parentElement;
      const grandParentDiv = parentDiv?.parentElement;

      if (!grandParentDiv || !document.contains(grandParentDiv)) {
        this.logError('Parent containers not found or not in DOM', null);
        return;
      }

      // Check if controls already exist
      if (grandParentDiv.querySelector('.ig-improvements-controls')) {
        this.log('Controls already exist, skipping');
        return;
      }

      const tagButton = this.findTagButton(video);

      // Set up Instagram controls container
      this.setupControlsContainer(grandParentDiv, tagButton);

      // Create our custom controls
      const controlsContainer = this.createControlsContainer(tagButton);
      const playPauseButton = this.createPlayPauseButton(video);
      const progressContainer = this.createProgressBar(video);
      const speedButton = this.createSpeedButton(video);
      const fullScreenButton = this.createFullscreenButton(video);

      // Validate all controls were created
      if (
        !controlsContainer ||
        !playPauseButton ||
        !progressContainer ||
        !speedButton ||
        !fullScreenButton
      ) {
        this.logError('Failed to create one or more controls', null);
        return;
      }

      // Assemble
      controlsContainer.appendChild(playPauseButton);
      controlsContainer.appendChild(progressContainer);
      controlsContainer.appendChild(speedButton);
      controlsContainer.appendChild(fullScreenButton);

      // Ensure grandParentDiv is still in DOM before appending
      if (document.contains(grandParentDiv)) {
        grandParentDiv.appendChild(controlsContainer);

        // Set up controls visibility
        this.setupControlsVisibility(video, grandParentDiv);

        // Save cleanup handler
        this.setupCleanup(video, grandParentDiv);

        this.log('Controls created and attached successfully');
      } else {
        this.logError('Container removed from DOM during control creation', null);
      }
    } catch (error) {
      this.logError('Error in createControls', error);
      // Don't mark as processed on error, allow retry
      this.processedVideos.delete(video);
    }
  }

  /**
   * Sets up Instagram controls container
   */
  setupControlsContainer(container, hasTagButton) {
    Object.assign(container.style, {
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'row-reverse',
      gap: '8px',
      justifyContent: hasTagButton ? 'center' : 'start',
      width: '100%',
      zIndex: '9999',
      opacity: '0',
      pointerEvents: 'none',
      transition: 'opacity 0.2s ease-in-out',
    });
  }

  /**
   * Sets up automatic controls visibility
   */
  setupControlsVisibility(video, controlsContainer) {
    let hideTimeout = null;

    const showControls = () => {
      clearTimeout(hideTimeout);
      controlsContainer.style.opacity = '1';
      controlsContainer.style.pointerEvents = 'auto';
    };

    const hideControls = () => {
      hideTimeout = setTimeout(() => {
        controlsContainer.style.opacity = '0';
        controlsContainer.style.pointerEvents = 'none';
      }, CONFIG.CONTROLS_HIDE_DELAY);
    };

    // Event listeners
    video.addEventListener('mouseenter', showControls);
    video.addEventListener('mouseleave', hideControls);
    controlsContainer.addEventListener('mouseenter', showControls);
    controlsContainer.addEventListener('mouseleave', hideControls);

    // Save references for cleanup
    return { showControls, hideControls, hideTimeout };
  }

  /**
   * Creates the main container for custom controls
   */
  createControlsContainer(hasTagButton) {
    const container = document.createElement('div');
    Object.assign(container.style, {
      alignItems: 'center',
      display: 'flex',
      gap: '8px',
      marginLeft: hasTagButton ? '0px' : '12px',
      position: 'absolute',
      bottom: '12px',
      left: hasTagButton ? 'auto' : '0',
      right: hasTagButton ? 'auto' : '52px', // Space for mute button (40px) + gap
      width: hasTagButton ? 'calc(100% - 140px)' : 'auto',
    });
    container.className = 'ig-improvements-controls';
    return container;
  }

  /**
   * Creates the play/pause button
   */
  createPlayPauseButton(video) {
    const button = document.createElement('button');
    button.innerHTML = video.paused ? ICONS.PLAY : ICONS.PAUSE;
    button.setAttribute('aria-label', 'Play/Pause');
    this.styleButton(button);

    const updateIcon = () => {
      button.innerHTML = video.paused ? ICONS.PLAY : ICONS.PAUSE;
    };

    button.addEventListener('click', (e) => {
      e.stopPropagation();
      if (video.paused) {
        video.play().catch((err) => this.logError('Error playing video', err));
      } else {
        video.pause();
      }
      updateIcon();
    });

    // Sync with video state changes
    video.addEventListener('play', updateIcon);
    video.addEventListener('pause', updateIcon);

    return button;
  }

  /**
   * Creates the progress bar with time displays
   */
  createProgressBar(video) {
    const container = document.createElement('div');
    Object.assign(container.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flex: '1',
      minWidth: '0',
      position: 'relative',
    });

    // Current time
    const currentTime = document.createElement('span');
    currentTime.textContent = '0:00';
    Object.assign(currentTime.style, {
      color: 'white',
      fontSize: '11px',
      userSelect: 'none',
      flexShrink: '0',
    });

    // Progress bar
    const progressBar = document.createElement('input');
    progressBar.type = 'range';
    progressBar.min = '0';
    progressBar.max = '100';
    progressBar.value = '0';
    progressBar.setAttribute('aria-label', 'Video progress');
    this.styleProgressBar(progressBar);

    // Total time
    const totalTime = document.createElement('span');
    totalTime.textContent = '0:00';
    Object.assign(totalTime.style, {
      color: 'white',
      fontSize: '11px',
      minWidth: '35px',
      userSelect: 'none',
      flexShrink: '0',
    });

    // Update times and progress
    const updateProgress = () => {
      if (!isNaN(video.duration)) {
        const progress = (video.currentTime / video.duration) * 100;
        progressBar.value = progress.toString();
        currentTime.textContent = this.formatTime(video.currentTime);
        totalTime.textContent = this.formatTime(video.duration);
      }
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', updateProgress);

    // Allow seeking
    let isSeeking = false;

    progressBar.addEventListener('mousedown', () => {
      isSeeking = true;
    });

    progressBar.addEventListener('input', () => {
      if (isSeeking && !isNaN(video.duration)) {
        video.currentTime = (parseFloat(progressBar.value) / 100) * video.duration;
      }
    });

    progressBar.addEventListener('mouseup', () => {
      isSeeking = false;
    });

    // Assemble: currentTime - progressBar - totalTime
    container.appendChild(currentTime);
    container.appendChild(progressBar);
    container.appendChild(totalTime);

    return container;
  }

  /**
   * Creates the playback speed button with dropdown menu
   */
  createSpeedButton(video) {
    const container = document.createElement('div');
    Object.assign(container.style, {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    });

    // Speed button
    const button = document.createElement('button');
    button.textContent = '1x';
    button.setAttribute('aria-label', 'Playback speed');

    // Custom styling for speed button (not circular)
    Object.assign(button.style, {
      fontSize: '11px',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      color: 'white',
      padding: '6px 8px',
      backgroundColor: 'rgba(43, 48, 54, .8)',
      borderRadius: '4px',
      transition: 'background-color 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '28px',
      height: '28px',
    });

    // Hover effect for speed button
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = 'rgba(43, 48, 54, 1)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = 'rgba(43, 48, 54, .8)';
    });

    // Speed menu (using fixed positioning to avoid overflow issues)
    const menu = document.createElement('div');
    menu.className = 'ig-speed-menu';
    Object.assign(menu.style, {
      display: 'none',
      position: 'fixed',
      backgroundColor: 'rgba(26, 26, 26, 0.98)',
      borderRadius: '8px',
      padding: '4px 0',
      minWidth: '70px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
      zIndex: '999999',
      backdropFilter: 'blur(10px)',
      pointerEvents: 'auto',
      opacity: '1',
    });

    // Create speed options
    PLAYBACK_SPEEDS.forEach((speed) => {
      const option = document.createElement('div');
      option.textContent = `${speed}x`;
      Object.assign(option.style, {
        padding: '6px 12px',
        color: 'white',
        fontSize: '12px',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'background-color 0.15s ease',
        textAlign: 'center',
      });

      // Highlight current speed
      if (speed === 1) {
        option.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
        option.style.fontWeight = '600';
      }

      option.addEventListener('mouseenter', () => {
        option.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
      });

      option.addEventListener('mouseleave', () => {
        if (video.playbackRate !== speed) {
          option.style.backgroundColor =
            video.playbackRate === speed ? 'rgba(255, 255, 255, 0.15)' : 'transparent';
        } else {
          option.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
        }
      });

      option.addEventListener('click', (e) => {
        e.stopPropagation();

        // Set video playback speed
        video.playbackRate = speed;

        // Update button text
        button.textContent = `${speed}x`;

        // Update menu highlighting
        menu.querySelectorAll('div').forEach((opt) => {
          opt.style.backgroundColor = 'transparent';
          opt.style.fontWeight = 'normal';
        });
        option.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
        option.style.fontWeight = '600';

        // Close menu
        menu.style.display = 'none';
      });

      menu.appendChild(option);
    });

    // Function to position menu
    const positionMenu = () => {
      const rect = button.getBoundingClientRect();
      const menuHeight = 240; // Approximate height for 8 items
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;

      // Position menu above or below based on available space
      if (spaceAbove > menuHeight || spaceAbove > spaceBelow) {
        // Position above
        menu.style.bottom = `${window.innerHeight - rect.top + 8}px`;
        menu.style.top = 'auto';
      } else {
        // Position below
        menu.style.top = `${rect.bottom + 8}px`;
        menu.style.bottom = 'auto';
      }

      // Align to the right of the button
      menu.style.right = `${window.innerWidth - rect.right}px`;
      menu.style.left = 'auto';
    };

    // Toggle menu on button click
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = menu.style.display === 'block';

      if (isVisible) {
        menu.style.display = 'none';
      } else {
        positionMenu();
        menu.style.display = 'block';
      }
    });

    // Prevent menu from closing when clicking inside it
    menu.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Close menu when clicking outside (using capture phase)
    const closeMenu = (e) => {
      if (!button.contains(e.target) && !menu.contains(e.target)) {
        menu.style.display = 'none';
      }
    };

    // Add listener when menu opens, remove when closes
    const observer = new MutationObserver(() => {
      if (menu.style.display === 'block') {
        setTimeout(() => {
          document.addEventListener('click', closeMenu, true);
        }, 0);
      } else {
        document.removeEventListener('click', closeMenu, true);
      }
    });

    observer.observe(menu, { attributes: true, attributeFilter: ['style'] });

    // Cleanup when video/button is removed
    const cleanupMenu = () => {
      if (menu.parentElement) {
        menu.remove();
      }
      observer.disconnect();
    };

    // Watch for button removal
    const buttonObserver = new MutationObserver(() => {
      if (!document.contains(button)) {
        cleanupMenu();
        buttonObserver.disconnect();
      }
    });
    buttonObserver.observe(document.body, { childList: true, subtree: true });

    container.appendChild(button);
    document.body.appendChild(menu); // Append menu to body for fixed positioning

    return container;
  }

  /**
   * Creates the fullscreen button with cross-browser compatibility
   */
  createFullscreenButton(video) {
    const button = document.createElement('button');
    button.innerHTML = ICONS.FULLSCREEN;
    button.setAttribute('aria-label', 'Fullscreen');
    this.styleButton(button);

    button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleFullscreen(video);
    });

    return button;
  }

  /**
   * Toggles fullscreen with cross-browser compatibility
   */
  toggleFullscreen(video) {
    try {
      const isFullscreen =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;

      if (!isFullscreen) {
        // Enter fullscreen
        if (video.requestFullscreen) {
          video.requestFullscreen();
        } else if (video.webkitRequestFullscreen) {
          video.webkitRequestFullscreen();
        } else if (video.mozRequestFullScreen) {
          video.mozRequestFullScreen();
        } else if (video.msRequestFullscreen) {
          video.msRequestFullscreen();
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    } catch (error) {
      this.logError('Error in fullscreen', error);
    }
  }

  /**
   * Sets up resource cleanup when video is removed
   */
  setupCleanup(video, controlsContainer) {
    const cleanup = () => {
      // Remove from WeakMap
      this.processedVideos.delete(video);
      // Event listeners are automatically cleaned up when element is removed
    };

    this.cleanupHandlers.set(video, cleanup);

    // Use IntersectionObserver to detect when video is removed
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting && !document.contains(video)) {
          cleanup();
          observer.disconnect();
        }
      });
    });

    observer.observe(video);
  }

  /**
   * Sets up fallback check for videos that weren't detected
   */
  setupFallbackCheck() {
    // Clear previous interval if it exists
    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
    }

    // Periodically check for unprocessed videos
    this.fallbackInterval = setInterval(() => {
      try {
        // Check if there are unprocessed videos
        const videos = document.querySelectorAll(SELECTORS.VIDEO);
        const unprocessedVideos = Array.from(videos).filter(
          (video) => document.contains(video) && !this.processedVideos.has(video)
        );

        if (unprocessedVideos.length > 0) {
          this.log(`Found ${unprocessedVideos.length} unprocessed videos, processing...`);
          unprocessedVideos.forEach((video) => this.configureVideo(video));
        }
      } catch (error) {
        this.logError('Error in fallback check', error);
      }
    }, CONFIG.FALLBACK_CHECK_INTERVAL);
  }

  /**
   * Sets up listener for Instagram SPA navigation
   */
  setupNavigationListener() {
    // Instagram uses SPA routing, listen for URL changes
    let lastUrl = location.href;

    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        this.log('Navigation detected, reprocessing videos...');
        // Wait a bit for Instagram to load content
        setTimeout(() => this.processExistingVideos(), 500);
      }
    }).observe(document, { subtree: true, childList: true });
  }

  /**
   * Cleans up all resources
   */
  cleanup() {
    try {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }

      if (this.fallbackInterval) {
        clearInterval(this.fallbackInterval);
        this.fallbackInterval = null;
      }

      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      this.processedVideos = new WeakMap();
      this.cleanupHandlers = new WeakMap();
      this.isInitialized = false;

      this.log('Resources cleaned up');
    } catch (error) {
      this.logError('Error in cleanup', error);
    }
  }

  // ============================================================================
  // UTILITIES AND HELPERS
  // ============================================================================

  /**
   * Formats seconds to MM:SS format
   */
  formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  /**
   * Applies styles to a button
   */
  styleButton(button) {
    Object.assign(button.style, {
      fontSize: '14px',
      border: 'none',
      cursor: 'pointer',
      color: 'white',
      padding: '7px 8px 7px',
      backgroundColor: 'rgba(43, 48, 54, .8)',
      borderRadius: '50%',
      transition: 'background-color 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '28px',
      height: '28px',
    });

    // Hover effect
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = 'rgba(43, 48, 54, 1)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = 'rgba(43, 48, 54, .8)';
    });
  }

  /**
   * Applies styles to the progress bar
   */
  styleProgressBar(bar) {
    Object.assign(bar.style, {
      flex: '1',
      minWidth: '0',
      cursor: 'pointer',
      background: 'rgba(255, 255, 255, 0.3)',
      borderRadius: '4px',
      height: '5px',
      margin: '0',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      appearance: 'none',
      outline: 'none',
      accentColor: 'white',
    });

    // Thumb styles for different browsers
    const thumbStyles = `
      .ig-improvements-controls input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: white;
        cursor: pointer;
      }

      .ig-improvements-controls input[type="range"]::-moz-range-thumb {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: white;
        cursor: pointer;
        border: none;
      }

      .ig-improvements-controls input[type="range"]::-ms-thumb {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: white;
        cursor: pointer;
      }
    `;

    // Inject styles if they don't exist
    if (!document.getElementById('ig-improvements-styles')) {
      const style = document.createElement('style');
      style.id = 'ig-improvements-styles';
      style.textContent = thumbStyles;
      document.head.appendChild(style);
    }
  }

  /**
   * Development log (only in debug mode)
   */
  log(...args) {}

  /**
   * Error logging
   */
  logError(message, error) {
    console.error('[IG Improvements Error]', message, error);
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Global manager instance
const videoControlsManager = new VideoControlsManager();

// Initialize when script loads
videoControlsManager.init();

// Cleanup on page close/reload
window.addEventListener('beforeunload', () => {
  videoControlsManager.cleanup();
});
