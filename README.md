# 🌌 Space Background

An animated space scene (twinkling stars, nebulae, shooting stars and meteors) drawn on an HTML5 canvas. No dependencies: open `index.html` and it fills the window.

## 📁 Files
- `index.html` - Main HTML file with the canvas and styling
- `space-animation.js` - Complete animation logic (no external dependencies)

## 🚀 How to Use

### As a macOS desktop background (Plush)
1. Clone or download this repository
2. In the Plush app, set `index.html` as your desktop background

### Standalone Usage
Simply open `index.html` in any modern web browser. The animation will automatically:
- Fill the entire window
- Resize when the window is resized
- Show stars, nebulae, shooting stars, and meteors

### On your own page
Add a canvas and the script. The animation fills the canvas's CSS box, so size the canvas however you like:
```html
<canvas id="space-canvas" style="width: 100%; height: 400px"></canvas>
<script src="space-animation.js"></script>
```
For a canvas with a different id, start it yourself:
```javascript
const sky = SpaceAnimation.start(document.querySelector('#my-canvas'), { fps: 30 });
sky.stop(); // when you no longer need it
```

## ✨ Features

### Animated Elements
- **200 Twinkling Stars** - Various colors including white, blue, cream, orange, red, and cyan
- **Pulsating Stars** - 10% of stars have a gentle pulsing effect
- **5 Nebulae** - Colorful gas clouds in blue, purple, pink, green, and orange
- **Shooting Stars** - Random shooting stars from all directions
- **Meteors** - Fiery meteors with particle trails

### Effects
- Smooth twinkling animation
- Gentle nebula movement
- Particle trails behind meteors
- Fade-in/fade-out effects for shooting stars
- Color gradients for depth

## 🎨 Customization

### Add an Info Overlay
`index.html` already includes styles for a small info box in the bottom-right corner. To show it, add this inside `<body>`:
```html
<div class="info-overlay">
    <h3>🌌 Space Animation</h3>
    <p>Created by Festus26</p>
</div>
```

### Frame Rate
Lower the frame rate to save power, for example when using it as a wallpaper. Use a URL parameter or a data attribute on the canvas:

| Option | URL parameter | Data attribute | Default |
|---|---|---|---|
| Frame rate cap | `?fps=30` | `data-fps="30"` | 60 |
| Frame rate cap on battery | `?batteryFps=20` | `data-battery-fps="20"` | 30 |
| Frame rate cap while meteors or shooting stars are on screen | `?cometFps=60` | `data-comet-fps="60"` | display refresh rate |

Meteors and shooting stars move fast and look choppy at low frame rates, so by default the animation runs at the display's full refresh rate while one is visible, overriding the caps above. Since one is visible most of the time, set `cometFps` too if you want to save power (for example `?fps=30&cometFps=30`).

For example, set `index.html?fps=30` as the wallpaper URL in Plush.

### Adjust Number of Elements
Edit the constants at the top of `space-animation.js`:
```javascript
const NUM_STARS = 200;     // Number of stars
const NUM_NEBULAE = 5;     // Number of nebulae
```

### Change Colors
Modify the color arrays in `space-animation.js` (`[r, g, b, alpha]`):
```javascript
const STAR_COLORS = [...];    // Star colors
const NEBULA_COLORS = [...];  // Nebula colors
```

## 🔧 Technical Details

- **Canvas-based**: Uses HTML5 Canvas API
- **Responsive**: Fills its canvas's CSS box and follows it when it resizes, without regenerating the sky
- **Sharp on Retina**: Renders at the screen's pixel density (up to 2×)
- **Same speed on any display**: Motion is based on elapsed time, so 120Hz screens don't run it faster
- **No dependencies**: Pure vanilla JavaScript
- **Browser compatibility**: Works in all modern browsers

## 📱 Performance

- **Pauses** when the tab is hidden or the canvas is scrolled out of view
- **30 fps on battery** while no meteors or shooting stars are on screen, where the browser reports battery status (Chrome, Edge); adjustable, see above
- **Respects reduced motion**: with the system's "reduce motion" setting on, it shows a still sky and doesn't animate
- **Cheap background**: the background gradient and slowly drifting nebulae are redrawn 10 times a second, not every frame

## 🌐 Origin

This animation started as the hero background of [semihyildirim.dev](https://semihyildirim.dev).

## 📝 Notes

- The animation will work offline once loaded
- No internet connection required after initial load
- Works on macOS, Windows, and Linux
- Mobile-friendly (automatically adjusts for smaller screens)

## 📄 License

[MIT](LICENSE) © Semih Yıldırım

---

**Created by Festus26** 🚀
