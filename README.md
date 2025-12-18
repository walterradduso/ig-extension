# IG Improvements 🎬

Browser extension that adds custom playback controls to Instagram videos.

## 🌟 Features

- ✅ Playback controls (Play/Pause)
- ✅ Interactive progress bar with seek
- ✅ Time indicators (current/total)
- ✅ Playback speed control (0.25x to 2x)
- ✅ Fullscreen button
- ✅ Auto-hide/show controls on hover
- ✅ Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- ✅ Optimized for performance and memory
- ✅ Respects Instagram's native controls (mute/unmute, tags)

## 📦 Installation

### Chrome / Edge / Brave / Opera

1. Download or clone this repository
2. Open `chrome://extensions` (or `edge://extensions`)
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the project folder

### Firefox

1. Download or clone this repository
2. Open `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select the `manifest.json` file

## 🔧 Technical Features

### Performance Improvements v2.0.0

- **Class-oriented architecture**: More organized and maintainable code
- **WeakMap for tracking**: Better memory management than data-attributes
- **Mutation debouncing**: Reduces unnecessary DOM processing
- **Automatic resource cleanup**: Prevents memory leaks
- **Optimized observers**: Detects only relevant changes
- **Intelligent retry logic**: Retries configuring videos that aren't ready yet

### Cross-Browser Compatibility

- **Fullscreen API**: Support for webkit/moz/ms prefixes
- **CSS appearance**: Multiple prefixes for input range
- **Event listeners**: Compatible with all modern browsers
- **SPA routing**: Detects navigation in Instagram (Single Page App)

### State Management

- **MutationObserver with debounce**: Avoids excessive processing
- **IntersectionObserver**: Detects when videos leave the DOM
- **WeakMap**: Efficient tracking without memory impact
- **Fallback check**: Captures videos that weren't initially detected

## 🎨 Customization

### Modify Configuration

Edit constants in `content.js`:

```javascript
const CONFIG = {
  CONTROLS_HIDE_DELAY: 2000,      // ms to hide controls
  DEBOUNCE_DELAY: 300,            // ms for mutation debouncing
  FALLBACK_CHECK_INTERVAL: 3000,  // ms for fallback check
  MAX_RETRIES: 3,                 // max retry attempts per video
};
```

### Debug Mode

To enable development logs, change values in `content.js`:

```javascript
log(...args) {
  if (true) { // Change false to true
    console.log('[IG Improvements]', ...args);
  }
}

// At the end of the file
if (true) { // Change false to true
  window.igImprovements = videoControlsManager;
}
```

### Custom Styles

Modify `styles.css` to change the appearance of controls.

## 🐛 Troubleshooting

### Controls don't appear

1. Verify you're not on Instagram Stories (excluded by design)
2. Refresh the page (F5)
3. Check browser console for errors
4. Ensure the extension is active

### Controls disappear too quickly/slowly

Modify `CONTROLS_HIDE_DELAY` in the configuration (value in milliseconds).

### Performance issues

1. Verify you only have one instance of the extension active
2. Close unnecessary Instagram tabs
3. Disable other extensions that modify Instagram

### Doesn't work in my browser

- **Chrome/Edge/Brave**: Minimum version 88+
- **Firefox**: Minimum version 89+
- **Safari**: Minimum version 14+

## 📊 Version Comparison

### v1.0.7 → v2.0.0

| Aspect | v1.0.7 | v2.0.0 |
|---------|--------|--------|
| Architecture | Functional | Class-oriented |
| Video tracking | `dataset` | `WeakMap` |
| Memory leaks | ❌ Yes | ✅ No |
| Debouncing | ❌ No | ✅ Yes |
| Retry logic | ❌ No | ✅ Yes (3 attempts) |
| Resource cleanup | ❌ Manual | ✅ Automatic |
| Fullscreen | ⚠️ Chrome only | ✅ Cross-browser |
| SPA routing | ⚠️ Partial | ✅ Complete |
| Error handling | ❌ Minimal | ✅ Complete |
| Debug mode | ❌ No | ✅ Yes |
| Documentation | ⚠️ Comments | ✅ Complete |

## 🤝 Contributing

Contributions are welcome:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Changelog

### v2.0.0 (2024)
- ✨ Complete refactoring with class-oriented architecture
- ⚡ Significant performance improvements (debouncing, WeakMap)
- 🔧 Improved cross-browser compatibility
- 🛡️ Robust error handling
- 🧹 Automatic resource cleanup (memory leak prevention)
- 📱 Better support for Instagram SPA routing
- 🐛 Retry logic for videos that load late
- 📚 Complete documentation

### v1.0.7
- Initial version with basic controls

## 📄 License

This project is under the MIT license. See `LICENSE` file for more details.

## 👤 Author

**Walter Radduso**
- GitHub: [@walterradduso](https://github.com/walterradduso)

## 🙏 Acknowledgments

- Instagram community for feedback
- Users who reported bugs and suggested improvements

## ⚠️ Disclaimer

This extension is not affiliated with, associated with, authorized by, endorsed by, or in any way officially connected with Instagram or Meta Platforms, Inc.
