# Alejandro Marin — Luxury Portfolio & Smooth Scroll Video Animation

A luxury editorial portfolio website featuring interactive scroll-driven video animation. Built with vanilla HTML5, CSS3, and high-performance Canvas 2D frame interpolation.

## ✨ Highlights

- **Smooth Scroll Frame Interpolation**: 192 high-resolution cinematic video frames scrubbed smoothly using requestAnimationFrame linear spring damping (`DAMPING = 0.09`).
- **Retina / High-DPI Support**: Automatically scales to device pixel ratio for crisp rendering on 4K and Retina screens.
- **Prioritized Keyframe Preloader**: Caches video frames in memory with a concurrent worker queue and nearest-frame fallback to prevent stutter or blank flashes.
- **Editorial Dark Luxury Aesthetic**:
  - Full-viewport typography with monumental `PORTFOLIO` display header.
  - Profile & Metrics Card (3-column layout with stats, location, and worldwide availability).
  - Selected Work Showcase (4 interactive project cards with hover animations).
  - Bento Grid (Education, Experience, 5-step Design Process, and Client Testimonial).
  - Footer with bold statement, direct contact channels, "Get in Touch" pill button, and scan QR code.
- **Zero External Runtime Dependencies**: Pure HTML, CSS, JavaScript, and native SVG graphics.

## 🚀 Getting Started

### Option 1: One-Click Launch (Windows)
Double-click `run.bat` to launch the local server and open your browser automatically.

### Option 2: Using Node.js
```bash
node server.js
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 3: Direct Browser Launch
Open `index.html` directly in any modern web browser.

## 📁 Project Structure

```text
├── assets/                  # SVG assets for showcase cards, portraits & QR code
│   ├── arte-luma.svg
│   ├── james-thompson.svg
│   ├── nexus-studio.svg
│   ├── noir-atelier.svg
│   ├── payera.svg
│   └── qr-code.svg
├── frames/                  # 192 extracted high-quality video frames (1080x1920)
├── .gitignore
├── index.html               # Main portfolio HTML markup
├── main.js                  # Canvas scroll interpolation engine & preloader
├── README.md
├── run.bat                  # One-click Windows runner script
├── server.js                # Zero-dependency local caching HTTP server
└── style.css                # Luxury dark-mode editorial stylesheet
```
