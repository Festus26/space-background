# 🌌 Standalone Space Animation Background

This is a standalone version of the space animation that can be used independently without any dependencies.

## 📁 Files
- `index.html` - Main HTML file with the canvas and styling
- `space-animation.js` - Complete animation logic (no external dependencies)

## 🚀 How to Use

### For Plush App (macOS Background)
1. Open the `background` folder
2. Open `index.html` in a web browser
3. Use Plush app to set this webpage as your desktop background

### Standalone Usage
Simply open `index.html` in any modern web browser. The animation will automatically:
- Fill the entire window
- Resize when the window is resized
- Show stars, nebulae, shooting stars, and meteors

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

### Remove Info Overlay
If you don't want the info box in the bottom-right corner, simply delete or comment out this section in `index.html`:
```html
<div class="info-overlay">
    <h3>🌌 Space Animation</h3>
    <p>Created by Festus26</p>
</div>
```

### Adjust Number of Elements
Edit `space-animation.js` to change quantities:
```javascript
const numStars = 200;      // Number of stars
const numNebulae = 5;      // Number of nebulae
```

### Change Colors
Modify the color arrays in `space-animation.js`:
```javascript
const starColors = [...];  // Star colors
const colors = [...];      // Nebula colors
```

## 🔧 Technical Details

- **Canvas-based**: Uses HTML5 Canvas API
- **Responsive**: Automatically resizes to window size
- **No dependencies**: Pure vanilla JavaScript
- **Performance optimized**: Uses requestAnimationFrame
- **Browser compatibility**: Works in all modern browsers

## 📱 Performance

The animation is optimized for smooth performance with:
- Efficient particle system
- Smart cleanup of off-screen elements
- Minimal CPU usage
- Smooth 60 FPS animation

## 🌐 Original Website

This animation is part of the main portfolio website but has been extracted into a standalone version that works independently.

## 📝 Notes

- The animation will work offline once loaded
- No internet connection required after initial load
- Works on macOS, Windows, and Linux
- Mobile-friendly (automatically adjusts for smaller screens)

---

**Created by Festus26** 🚀
