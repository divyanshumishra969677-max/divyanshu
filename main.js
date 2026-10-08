/**
 * Ultra-Smooth Scroll-Driven Video Canvas Engine
 * Apple-grade interpolated frame scrubbing with zero extra UI components.
 */

(() => {
  const TOTAL_FRAMES = 192;
  const DAMPING = 0.09; // Buttery smooth spring inertia factor (0.05 to 0.12)
  const CONCURRENCY_LIMIT = 8; // Parallel frame download workers

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for non-transparent canvas

  const loader = document.getElementById('loader');
  const loaderBar = document.getElementById('loader-bar');
  const loaderText = document.getElementById('loader-text');
  const scrollHint = document.getElementById('scroll-hint');

  // Frame path resolver
  const getFramePath = (index) => {
    const padded = String(index).padStart(6, '0');
    return `frames/frame_${padded}.jpg`;
  };

  // Image cache
  const images = new Array(TOTAL_FRAMES);
  const loadedFlags = new Array(TOTAL_FRAMES).fill(false);

  let loadedCount = 0;
  let currentFrame = 0;
  let targetFrame = 0;
  let lastDrawnIndex = -1;
  let isInitialFrameDrawn = false;
  let animationFrameId = null;

  // Track viewport & canvas scale
  let dpr = 1;
  let canvasWidth = 0;
  let canvasHeight = 0;

  /**
   * Resize canvas backing buffer to match screen resolution with high-DPI scaling
   */
  function handleResize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    canvas.width = Math.round(canvasWidth * dpr);
    canvas.height = Math.round(canvasHeight * dpr);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Force re-render of current frame
    if (lastDrawnIndex >= 0) {
      renderFrame(lastDrawnIndex, true);
    }
  }

  /**
   * Draw the image centered onto the canvas with seamless aspect ratio preservation
   */
  function renderFrame(index, force = false) {
    if (index === lastDrawnIndex && !force) return;

    // Retrieve requested frame, or fallback to the nearest loaded frame
    let img = images[index];
    if (!img || !loadedFlags[index]) {
      // Find nearest loaded frame
      let closest = -1;
      let minDiff = Infinity;
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        if (loadedFlags[i]) {
          const diff = Math.abs(i - index);
          if (diff < minDiff) {
            minDiff = diff;
            closest = i;
          }
        }
      }
      if (closest !== -1) {
        img = images[closest];
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const w = canvas.width;
    const h = canvas.height;
    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;

    const canvasRatio = w / h;
    const imgRatio = imgW / imgH;

    let drawW, drawH, drawX, drawY;

    if (canvasRatio > imgRatio) {
      // Viewport is wider than frame (landscape screen)
      drawH = h;
      drawW = h * imgRatio;
      drawX = (w - drawW) / 2;
      drawY = 0;
    } else {
      // Viewport is narrower than frame (portrait screen)
      drawW = w;
      drawH = w / imgRatio;
      drawX = 0;
      drawY = (h - drawH) / 2;
    }

    // Clear background to pure black to match frame borders
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    // Draw frame centered
    ctx.drawImage(img, Math.round(drawX), Math.round(drawY), Math.round(drawW), Math.round(drawH));
    lastDrawnIndex = index;
  }

  /**
   * Smooth continuous animation loop with damped inertia
   */
  function tick() {
    const diff = targetFrame - currentFrame;

    // Apply damping
    if (Math.abs(diff) > 0.0001) {
      currentFrame += diff * DAMPING;
    } else {
      currentFrame = targetFrame;
    }

    const frameToRender = Math.min(Math.max(Math.round(currentFrame), 0), TOTAL_FRAMES - 1);
    renderFrame(frameToRender);

    animationFrameId = requestAnimationFrame(tick);
  }

  /**
   * Synchronize scroll position with target frame
   */
  function handleScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollMax = document.documentElement.scrollHeight - window.innerHeight;

    if (scrollMax > 0) {
      const progress = Math.min(Math.max(scrollTop / scrollMax, 0), 1);
      targetFrame = progress * (TOTAL_FRAMES - 1);
    } else {
      targetFrame = 0;
    }

    // Toggle scroll hint
    if (scrollHint) {
      if (scrollTop > 40) {
        scrollHint.classList.add('hidden');
      } else {
        scrollHint.classList.remove('hidden');
      }
    }
  }

  /**
   * Preload an image by index
   */
  function loadImage(index) {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = getFramePath(index);

      img.onload = () => {
        images[index] = img;
        loadedFlags[index] = true;
        loadedCount++;
        onFrameLoaded(index);
        resolve();
      };

      img.onerror = () => {
        console.warn(`Failed to load frame ${index}`);
        resolve();
      };
    });
  }

  /**
   * Handle individual frame load event
   */
  function onFrameLoaded(index) {
    // If first frame loaded, draw immediately for instant visual
    if (index === 0 && !isInitialFrameDrawn) {
      isInitialFrameDrawn = true;
      renderFrame(0, true);
    }

    // Update progress
    const pct = Math.round((loadedCount / TOTAL_FRAMES) * 100);
    if (loaderBar) loaderBar.style.width = `${pct}%`;
    if (loaderText) loaderText.textContent = `${pct}%`;

    // Unlock once fully loaded or sufficiently buffered
    if (loadedCount >= TOTAL_FRAMES || (loadedCount >= 24 && pct >= 15 && !loader.classList.contains('loaded'))) {
      if (loadedCount === TOTAL_FRAMES) {
        loader.classList.add('loaded');
      }
    }
  }

  /**
   * Optimized preload pipeline with keyframe priority
   */
  async function preloadAllFrames() {
    // Phase 1: Load initial frame immediately
    await loadImage(0);

    // Phase 2: Load keyframes across timeline every 4th frame (rapid scrub readiness)
    const keyframes = [];
    for (let i = 4; i < TOTAL_FRAMES; i += 4) {
      keyframes.push(i);
    }

    // Phase 3: All remaining intermediate frames
    const remainingFrames = [];
    for (let i = 1; i < TOTAL_FRAMES; i++) {
      if (i % 4 !== 0) {
        remainingFrames.push(i);
      }
    }

    const queue = [...keyframes, ...remainingFrames];

    // Worker pool
    const runWorker = async () => {
      while (queue.length > 0) {
        const nextIndex = queue.shift();
        if (nextIndex !== undefined) {
          await loadImage(nextIndex);
        }
      }
    };

    const workers = [];
    for (let i = 0; i < CONCURRENCY_LIMIT; i++) {
      workers.push(runWorker());
    }

    await Promise.all(workers);
    loader.classList.add('loaded');
  }

  // Initialization
  function init() {
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Begin preload and animation loop
    preloadAllFrames();
    animationFrameId = requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
