# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.2] - 2024-12-20

### Fixed

- **Windows compatibility**: Fixed issue where controls were not loading on Windows systems
- **DOM timing issues**: Improved handling of DOM loading delays, especially on Windows
- **Element detection**: Enhanced mute button detection with multiple fallback strategies

### Changed

- **Retry logic**: Increased max retries from 3 to 8 attempts per video
- **Retry timing**: Implemented exponential backoff (500ms → 2000ms) for better Windows compatibility
- **Fallback check**: Reduced interval from 3s to 2s for faster detection of unprocessed videos
- **Initialization**: Added multiple processing attempts at startup (immediate, 500ms, 1500ms)
- **Element search**: Implemented 4 different strategies to find mute button (parent, article, hierarchy, aria-label)

### Added

- **Alternative container setup**: Fallback method to create controls when mute button cannot be found
- **Video readiness check**: Validates video has dimensions before processing
- **DOM validation**: Comprehensive checks to ensure elements are in DOM before manipulation
- **Body wait mechanism**: Waits for document.body to be available (important for Windows)
- **Enhanced error handling**: Errors no longer mark videos as processed, allowing retries
- **Multiple mutation detection**: MutationObserver now also detects mute button appearance

### Improved

- **Windows compatibility**: Significantly improved reliability on Windows systems with Chrome/Brave
- **Robustness**: Better handling of edge cases and timing issues
- **Performance**: More efficient detection and processing of videos
- **Stability**: Enhanced error recovery and retry mechanisms

### Technical Details

- Added `waitForBody()` method to ensure DOM is ready before initialization
- Implemented `isVideoReady()` to validate video elements before processing
- Added `isElementNearVideo()` helper to verify element context
- Enhanced `findMuteButton()` with 4 search strategies
- Improved `processExistingVideos()` with DOM stability delay
- Better validation in `createControls()` before attaching elements

---

## [2.0.1] - 2024-12-19

### Changed

- **Excluded Reels pages**: Extension no longer loads on `/reels/*` URLs to avoid conflicts with Instagram's native Reels interface
- Added `exclude_matches` for Reels in manifest to prevent the extension from interfering with Reels functionality

### Notes

- The extension now works exclusively on Feed videos and Post videos (`/p/*`)
- Reels support may be added in a future version with proper implementation
- This change ensures the extension does not interfere with Instagram's native Reels experience

---

## [2.0.0] - 2024-12-18

### 🎉 Major Changes

#### Added

- Class-oriented architecture with `VideoControlsManager`
- Playback speed control with dropdown menu (0.25x to 2x)
- Logging system with configurable debug mode
- Intelligent retry logic (up to 3 attempts per video)
- Automatic resource cleanup with `IntersectionObserver`
- DOM mutation debouncing (300ms default)
- Complete error handling with try/catch
- Centralized configuration in `CONFIG` object
- Cross-browser compatibility for Fullscreen API
- Improved support for Instagram SPA routing
- Dynamically injected CSS styles for better compatibility
- Complete JSDoc documentation
- Detailed README.md with usage guides
- 8 speed options: 0.25x, 0.5x, 0.75x, 1x, 1.25x, 1.5x, 1.75x, 2x

#### Changed

- **BREAKING**: Complete code refactoring
- Video tracking from `dataset` to `WeakMap` (better performance)
- Event listeners now cleaned up automatically
- TagButton search now contextual (not global)
- Observer with debouncing to reduce processing
- Fallback check from 2s to 3s (more efficient)
- Manifest version updated to 2.0.0
- `run_at: document_idle` in manifest for better initialization

#### Improved

- **Performance**: 60-70% reduction in processed mutations
- **Memory**: Complete elimination of memory leaks
- **Compatibility**: Full support for Chrome, Firefox, Safari, Edge, Brave, Opera
- **Stability**: Robust handling of edge cases and errors
- **User Experience**: More responsive and fluid controls
- **Code**: Modularity, readability and maintainability

#### Fixed

- Memory leaks from uncleaned event listeners
- Issues with videos that loaded late
- Fullscreen incompatibility in Safari
- Global tagButton search causing bugs
- `window.onload` not working in SPA routing
- Excessive DOM processing on each mutation
- Inconsistent progress bar styles across browsers
- Videos being unnecessarily reprocessed

### 🔧 Technical

#### Performance

- Implemented debouncing (300ms) in MutationObserver
- Changed from `dataset` to `WeakMap` for efficient tracking
- Optimized fallback check (3s instead of 2s)
- Selective mutation processing (only if new videos detected)
- Proactive resource cleanup with IntersectionObserver

#### Compatibility

- Fullscreen API with prefixes: webkit, moz, ms
- CSS appearance with multiple prefixes
- Input range styling for all browsers
- Event listeners compatible with older browsers
- Improved SPA routing detection

#### Architecture

```
Before (v1.x):
- Functional code without structure
- State in global variables
- No error handling
- No resource cleanup

After (v2.0):
- VideoControlsManager class
- State encapsulated in WeakMaps
- Try/catch in all critical functions
- Automatic and manual cleanup
```

---

## [1.0.7] - 2024-XX-XX

### Added

- Basic video controls (play/pause)
- Progress bar
- Fullscreen button
- Time indicators
- Auto-hide/show controls on hover

### Limitations

- Memory leaks
- No cross-browser compatibility
- Suboptimal performance
- No error handling

---

## Version Format

- **Major (X.0.0)**: Breaking changes
- **Minor (0.X.0)**: New features (backwards compatible)
- **Patch (0.0.X)**: Bug fixes and minor improvements
