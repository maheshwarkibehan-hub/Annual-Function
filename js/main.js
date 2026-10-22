/**
 * AETHERIA 2026 — BESPOKE FRONTEND ENGINE
 * St. Joseph's School, Kajipur · Annual Cultural & Academic Gala
 * 
 * Strict Apple 2026 "Liquid Glass" Spatial Design System
 * Lenis 1.x + GSAP 3 + ScrollTrigger Architecture
 * Self-contained, production-grade, zero AI slop
 */

/* ==========================================================================
   1. GLOBAL CONFIGURATION & HERO VIDEO NEGATIVE SPACE CALIBRATION
   ========================================================================== */
const CONFIG = {
  // Event & Institution Metadata
  eventName: "AETHERIA 2026",
  eventSubtitle: "The Annual Cultural & Academic Gala",
  schoolName: "St. Joseph's Senior Sec. School, Kazipur, Kaushambi",
  schoolMotto: "Always Aim High · Kazipur, Kaushambi",
  eventDateISO: "2026-12-05T17:30:00+05:30", // 5 December 2026, 17:30 IST
  
  // Media Assets
  videoUrl: "assets/hero-video-1080.mp4",
  videoUrl4k: "assets/hero-video.mp4",
  posterUrl: "assets/hero-poster.png",
  mobileVideoUrl: "assets/hero-video-mobile-1080.mp4",
  mobileVideoUrl4k: "assets/hero-video-mobile.mp4",
  mobilePosterUrl: "assets/hero-poster-mobile.png",
  logoUrl: "assets/school-logo.png",
  audioUrl: "assets/ambient.mp3",
  
  // Default Negative Space Placement for Hero Video Countdown Timer
  // (Easily fine-tuned via on-screen Dev Calibration Mode: ?calibrate=true)
  timerCoordinates: {
    top: "clamp(6.25rem, 15vh, 9.5rem)",
    right: "clamp(1.5rem, 4.8vw, 4.5rem)",
    bottom: "auto",
    left: "auto",
    transform: "none"
  }
};

/* ==========================================================================
   2. LENIS SMOOTH SCROLL & GSAP TICKER SYNCHRONIZATION
   ========================================================================== */
let lenis = null;

function initSmoothScroll() {
  // Check if reduced motion is preferred
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || typeof Lenis === 'undefined') {
    return;
  }

  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Apple-grade exponential out
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 1.8
  });

  // Connect Lenis scroll events to GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  // Smooth scroll for anchor clicks
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        lenis.scrollTo(targetEl, {
          offset: -40,
          duration: 1.4,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });
      }
    });
  });
}

/* ==========================================================================
   3. FLOATING TOP OPTICAL HEADER
   ========================================================================== */
function initHeaderTransitions() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    if (scrollY > 70) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ==========================================================================
   4. HERO SCROLL-STUCK (PINNED SCRUB) SCALE-DOWN TRANSITION
   ========================================================================== */
function initHeroScrollScrub() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const heroStage = document.querySelector('#hero-stage');
  const mediaFrame = document.querySelector('.hero-media-frame');
  const heroPoster = document.querySelector('.hero-content-poster');
  const heroTimer = document.querySelector('.hero-timer-dock');

  if (!heroStage || !mediaFrame) return;

  // Pin Hero for 120vh scroll distance and smoothly scale down to 92vw x 84dvh
  const heroTl = gsap.timeline({
    scrollTrigger: {
      trigger: heroStage,
      start: 'top top',
      end: '+=120%',
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      onUpdate: (self) => {
        if (self.progress > 0.05) {
          mediaFrame.classList.add('is-pinned-scaled');
        } else {
          mediaFrame.classList.remove('is-pinned-scaled');
        }
      }
    }
  });

  // Scale frame down and apply 28px border-radius
  heroTl.to(mediaFrame, {
    width: '92vw',
    height: '84dvh',
    borderRadius: '28px',
    ease: 'power1.inOut'
  }, 0);

  // Parallax-fade hero copy and countdown upward with blur
  if (heroPoster) {
    heroTl.to(heroPoster, {
      y: -50,
      opacity: 0,
      filter: 'blur(10px)',
      ease: 'power1.in'
    }, 0);
  }

  if (heroTimer) {
    heroTl.to(heroTimer, {
      y: -40,
      opacity: 0,
      filter: 'blur(8px)',
      ease: 'power1.in'
    }, 0);
  }
}

/* ==========================================================================
   5. SCROLL-DRIVEN PINNED HORIZONTAL GALLERY (#performances-slider)
   ========================================================================== */
function initHorizontalSlider() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const sliderSection = document.querySelector('#performances-slider');
  const track = document.querySelector('.horizontal-track');
  const progressBar = document.querySelector('.slider-progress-indicator');
  const stepActive = document.querySelector('.step-active');
  const slides = document.querySelectorAll('.performance-slide');

  if (!sliderSection || !track) return;

  const getScrollDistance = () => {
    return track.scrollWidth - window.innerWidth + window.innerWidth * 0.1;
  };

  const horizontalTl = gsap.timeline({
    scrollTrigger: {
      trigger: sliderSection,
      start: 'top top',
      end: '+=350%',
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        // Update minimal progress bar
        if (progressBar) {
          progressBar.style.width = `${Math.max(10, self.progress * 100)}%`;
        }

        // Update live step counter (01 to 05)
        if (stepActive) {
          const currentSlide = Math.min(5, Math.max(1, Math.floor(self.progress * 5) + 1));
          stepActive.textContent = `0${currentSlide}`;
        }
      }
    }
  });

  // Translate track along X axis
  horizontalTl.to(track, {
    x: () => -getScrollDistance(),
    ease: 'none'
  });

  // Parallax effect on internal slide images
  slides.forEach((slide) => {
    const slideImg = slide.querySelector('.slide-img');
    if (slideImg) {
      horizontalTl.fromTo(slideImg, {
        x: '8%'
      }, {
        x: '-8%',
        ease: 'none'
      }, 0);
    }
  });
}

/* ==========================================================================
   6. LIVE EVENT COUNTDOWN TIMER
   ========================================================================== */
function initCountdownTimer() {
  const targetDate = new Date(CONFIG.eventDateISO).getTime();

  const daysEl = document.querySelector('#timer-days');
  const hoursEl = document.querySelector('#timer-hours');
  const minutesEl = document.querySelector('#timer-minutes');
  const secondsEl = document.querySelector('#timer-seconds');

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  function updateTimer() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      secondsEl.textContent = "00";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* ==========================================================================
   7. DEV CALIBRATION MODE (Hero Video Blank-Space Placement HUD)
   ========================================================================== */
function initCalibrationMode() {
  const timerDock = document.querySelector('.hero-timer-dock');
  const hud = document.querySelector('.dev-calibration-hud');
  const readout = document.querySelector('#hud-readout-text');
  const copyBtn = document.querySelector('#hud-btn-copy');
  const closeBtn = document.querySelector('#hud-close-btn');
  const calibrateTrigger = document.querySelector('#timer-calibrate-trigger');
  const toast = document.querySelector('.toast-notice');

  if (!timerDock) return;

  // Check saved calibration from localStorage
  const savedCoords = localStorage.getItem('aetheria_timer_coords');
  if (savedCoords) {
    try {
      const parsed = JSON.parse(savedCoords);
      applyCoordinates(parsed);
    } catch (e) {
      console.warn("Could not parse saved timer coordinates:", e);
    }
  }

  // Detect URL parameter ?calibrate=true or local storage flag
  const urlParams = new URLSearchParams(window.location.search);
  const isCalibrationActive = urlParams.get('calibrate') === 'true' || localStorage.getItem('aetheria_calibrate') === 'true';

  if (isCalibrationActive && hud) {
    hud.classList.add('is-open');
    timerDock.classList.add('is-calibrating');
  }

  // Allow clicking "Calibrate" micro-button on timer
  if (calibrateTrigger && hud) {
    calibrateTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      hud.classList.toggle('is-open');
      timerDock.classList.toggle('is-calibrating');
    });
  }

  if (closeBtn && hud) {
    closeBtn.addEventListener('click', () => {
      hud.classList.remove('is-open');
      timerDock.classList.remove('is-calibrating');
    });
  }

  // Draggable interaction for calibration
  let isDragging = false;
  let startX, startY;
  let initialLeft, initialTop;

  timerDock.addEventListener('mousedown', (e) => {
    if (!timerDock.classList.contains('is-calibrating')) return;
    if (e.target.closest('button')) return;

    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;

    const rect = timerDock.getBoundingClientRect();
    const parentRect = timerDock.offsetParent.getBoundingClientRect();

    initialLeft = rect.left - parentRect.left;
    initialTop = rect.top - parentRect.top;

    timerDock.style.bottom = 'auto';
    timerDock.style.right = 'auto';
    timerDock.style.transform = 'none';

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  function onMouseMove(e) {
    if (!isDragging) return;
    const parentRect = timerDock.offsetParent.getBoundingClientRect();
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    let newLeftPx = initialLeft + deltaX;
    let newTopPx = initialTop + deltaY;

    // Convert to percentage for responsive fidelity
    const leftPct = ((newLeftPx / parentRect.width) * 100).toFixed(2);
    const topPct = ((newTopPx / parentRect.height) * 100).toFixed(2);

    timerDock.style.left = `${leftPct}%`;
    timerDock.style.top = `${topPct}%`;
    timerDock.style.right = 'auto';
    timerDock.style.bottom = 'auto';

    updateReadout({ top: `${topPct}%`, left: `${leftPct}%`, right: 'auto', bottom: 'auto' });
  }

  function onMouseUp() {
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }

  function updateReadout(coords) {
    if (readout) {
      readout.innerHTML = `
        --timer-top: ${coords.top};<br>
        --timer-left: ${coords.left};<br>
        --timer-right: ${coords.right};<br>
        --timer-bottom: ${coords.bottom};
      `;
    }
  }

  function applyCoordinates(coords) {
    timerDock.style.top = coords.top;
    timerDock.style.right = coords.right;
    timerDock.style.bottom = coords.bottom;
    timerDock.style.left = coords.left;
    timerDock.style.transform = coords.transform || 'none';
    updateReadout(coords);
  }

  // Preset positioning buttons in HUD
  document.querySelectorAll('.preset-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const preset = chip.getAttribute('data-preset');
      let coords = {};

      if (preset === 'top-right') {
        coords = { top: '14%', right: '5%', bottom: 'auto', left: 'auto', transform: 'none' };
      } else if (preset === 'top-left') {
        coords = { top: '14%', left: '5%', bottom: 'auto', right: 'auto', transform: 'none' };
      } else if (preset === 'bottom-right') {
        coords = { bottom: '12%', right: '5%', top: 'auto', left: 'auto', transform: 'none' };
      } else if (preset === 'bottom-left') {
        coords = { bottom: '12%', left: '5%', top: 'auto', right: 'auto', transform: 'none' };
      }

      applyCoordinates(coords);
      localStorage.setItem('aetheria_timer_coords', JSON.stringify(coords));
      showToast("Position applied & saved");
    });
  });

  // Copy CSS variables to clipboard
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const cssSnippet = `
.hero-timer-dock {
  --timer-top: ${timerDock.style.top || 'auto'};
  --timer-left: ${timerDock.style.left || 'auto'};
  --timer-right: ${timerDock.style.right || 'auto'};
  --timer-bottom: ${timerDock.style.bottom || 'auto'};
}`.trim();

      navigator.clipboard.writeText(cssSnippet).then(() => {
        showToast("CSS variables copied to clipboard!");
      });
    });
  }

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-visible');
    setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 2800);
  }
}

/* ==========================================================================
   8. MAGNETIC CUSTOM CURSOR FOLLOWER
   ========================================================================== */
function initCustomCursor() {
  const dot = document.querySelector('.cursor-dot');
  const pill = document.querySelector('.cursor-pill');
  const sliderTrack = document.querySelector('#performances-slider');

  if (!dot || !pill) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let dotX = mouseX, dotY = mouseY;
  let pillX = mouseX, pillY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!dot.classList.contains('is-visible')) {
      dot.classList.add('is-visible');
    }
  });

  function renderCursor() {
    // Sharp follower for dot
    dotX += (mouseX - dotX) * 0.45;
    dotY += (mouseY - dotY) * 0.45;
    dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;

    // Smooth fluid follower for pill
    pillX += (mouseX - pillX) * 0.16;
    pillY += (mouseY - pillY) * 0.16;
    pill.style.transform = `translate3d(${pillX}px, ${pillY}px, 0) translate(-50%, -50%)`;

    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Hover state over horizontal slider
  if (sliderTrack) {
    sliderTrack.addEventListener('mouseenter', () => {
      pill.textContent = "SCROLL / DRAG →";
      pill.classList.add('is-active');
    });
    sliderTrack.addEventListener('mouseleave', () => {
      pill.classList.remove('is-active');
    });
  }

  // Hover over clickable elements
  document.querySelectorAll('a, button, input, .itinerary-row, .bento-tile').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%) scale(2)`;
    });
    el.addEventListener('mouseleave', () => {
      dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%) scale(1)`;
    });
  });

  // Bento tile specific cursor pill prompt
  document.querySelectorAll('.bento-tile').forEach((tile) => {
    tile.addEventListener('mouseenter', () => {
      pill.textContent = "VIEW COLLAGE ↗";
      pill.classList.add('is-active');
    });
    tile.addEventListener('mouseleave', () => {
      pill.classList.remove('is-active');
    });
  });
}

/* ==========================================================================
   9. ITINERARY FLOATING PREVIEW CARDS
   ========================================================================== */
function initItineraryHoverPreview() {
  const previewCard = document.querySelector('.itinerary-preview-card');
  const previewImg = previewCard ? previewCard.querySelector('img') : null;
  const rows = document.querySelectorAll('.itinerary-row');

  if (!previewCard || !previewImg || !rows.length) return;

  rows.forEach((row) => {
    const imgUrl = row.getAttribute('data-preview');

    row.addEventListener('mouseenter', () => {
      if (imgUrl) {
        previewImg.src = imgUrl;
        previewCard.classList.add('is-visible');
      }
    });

    row.addEventListener('mousemove', (e) => {
      previewCard.style.left = `${e.clientX + 140}px`;
      previewCard.style.top = `${e.clientY}px`;
    });

    row.addEventListener('mouseleave', () => {
      previewCard.classList.remove('is-visible');
    });
  });
}

/* ==========================================================================
   9b. VISUAL CHRONICLES LIGHTBOX MODAL
   ========================================================================== */
function initCollageLightbox() {
  const lightbox = document.getElementById('collage-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const tiles = document.querySelectorAll('.bento-tile');

  if (!lightbox || !lightboxImg || !tiles.length) return;

  function openLightbox(tile) {
    const src = tile.getAttribute('data-modal-src');
    const title = tile.getAttribute('data-modal-title') || 'Stage Collage';
    const desc = tile.getAttribute('data-modal-desc') || '';

    if (!src) return;

    lightboxImg.src = src;
    lightboxImg.alt = title;
    lightboxTitle.textContent = title;
    lightboxDesc.textContent = desc;

    lightbox.hidden = false;
    requestAnimationFrame(() => {
      lightbox.classList.add('is-open');
    });

    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    setTimeout(() => {
      lightbox.hidden = true;
      lightboxImg.src = '';
      document.body.style.overflow = '';
    }, 350);
  }

  tiles.forEach((tile) => {
    tile.addEventListener('click', () => openLightbox(tile));
  });

  lightbox.querySelectorAll('[data-close-lightbox]').forEach((btn) => {
    btn.addEventListener('click', closeLightbox);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !lightbox.hidden) {
      closeLightbox();
    }
  });
}

/* ==========================================================================
   10. INTERACTIVE APPLE WALLET PASS GENERATOR
   ========================================================================== */
function initPassGenerator() {
  const nameInput = document.querySelector('#pass-input-name');
  const houseOptions = document.querySelectorAll('.house-option');
  const tierOptions = document.querySelectorAll('.tier-option');
  
  const passCard = document.querySelector('.apple-pass-card');
  const passName = document.querySelector('#card-guest-name');
  const passHouse = document.querySelector('#card-house-tag');
  const passTierBadge = document.querySelector('#card-tier-badge');
  const passSerial = document.querySelector('#card-serial-code');
  const qrCanvas = document.querySelector('#pass-qr-canvas');
  
  const downloadBtn = document.querySelector('#btn-download-pass');
  const sheen = document.querySelector('.pass-hologram-sheen');

  // Live Name binding
  if (nameInput && passName) {
    nameInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      passName.textContent = val.length ? val : "Alexander Vance";
      drawRealisticQRCode(qrCanvas, val);
    });
  }

  // House selection
  houseOptions.forEach((option) => {
    option.addEventListener('click', () => {
      houseOptions.forEach(opt => opt.classList.remove('is-selected'));
      option.classList.add('is-selected');
      const val = option.getAttribute('data-house');
      if (passHouse) passHouse.textContent = val;
    });
  });

  // Tier selection
  tierOptions.forEach((option) => {
    option.addEventListener('click', () => {
      tierOptions.forEach(opt => opt.classList.remove('is-selected'));
      option.classList.add('is-selected');
      const val = option.getAttribute('data-tier');
      if (passTierBadge) passTierBadge.textContent = val;
    });
  });

  // Draw initial QR Matrix
  drawRealisticQRCode(qrCanvas, "Alexander Vance · SJS-2026-AE");

  // 3D Card Tilt & Holographic Sheen on Mouse Movement
  if (passCard && sheen) {
    passCard.addEventListener('mousemove', (e) => {
      const rect = passCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;
      
      passCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      sheen.style.transform = `translate(${rotateY * 4}%, ${rotateX * 4}%)`;
    });

    passCard.addEventListener('mouseleave', () => {
      passCard.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      sheen.style.transform = 'translate(0, 0)';
    });
  }

  // Download / Print Pass Trigger
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

/**
 * Draws a clean, high-density QR matrix onto an HTML5 canvas element
 */
function drawRealisticQRCode(canvas, seedText) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = 180;
  canvas.width = size;
  canvas.height = size;

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = "#070708";
  const cells = 21;
  const cellSize = size / cells;

  // Simple pseudo-random hash generator based on seedText
  let hash = 0;
  for (let i = 0; i < seedText.length; i++) {
    hash = (hash << 5) - hash + seedText.charCodeAt(i);
    hash |= 0;
  }

  // Draw standard QR position corners (top-left, top-right, bottom-left)
  function drawFinderPattern(startX, startY) {
    ctx.fillRect(startX * cellSize, startY * cellSize, 7 * cellSize, 7 * cellSize);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect((startX + 1) * cellSize, (startY + 1) * cellSize, 5 * cellSize, 5 * cellSize);
    ctx.fillStyle = "#070708";
    ctx.fillRect((startX + 2) * cellSize, (startY + 2) * cellSize, 3 * cellSize, 3 * cellSize);
  }

  drawFinderPattern(0, 0);
  drawFinderPattern(14, 0);
  drawFinderPattern(0, 14);

  // Fill pseudo-random matrix cells
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      // Skip finder zones
      if ((r < 8 && c < 8) || (r < 8 && c >= 13) || (r >= 13 && c < 8)) continue;

      const val = Math.sin(r * 12.9898 + c * 78.233 + hash) * 43758.5453;
      if (val - Math.floor(val) > 0.45) {
        ctx.fillRect(c * cellSize, r * cellSize, cellSize - 0.4, cellSize - 0.4);
      }
    }
  }
}

/* ==========================================================================
   11. AMBIENT AUDIO SOUNDSCAPE & HIGH-CONTRAST ACCESSIBILITY
   ========================================================================= */
function initUtilities() {
  const audioBtn = document.querySelector('#util-btn-audio');
  const contrastBtn = document.querySelector('#util-btn-contrast');
  
  let audio = null;
  let isPlaying = false;

  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      if (!audio) {
        audio = new Audio(CONFIG.audioUrl);
        audio.loop = true;
        audio.volume = 0.4;
      }

      if (isPlaying) {
        audio.pause();
        audioBtn.classList.remove('is-playing', 'is-active');
        isPlaying = false;
      } else {
        audio.play().then(() => {
          audioBtn.classList.add('is-playing', 'is-active');
          isPlaying = true;
        }).catch(err => {
          console.warn("Audio autoplay blocked by browser policy:", err);
        });
      }
    });
  }

  const cinemaBtn = document.querySelector('#util-btn-cinema');
  if (cinemaBtn) {
    cinemaBtn.addEventListener('click', () => {
      document.body.classList.toggle('cinema-mode');
      cinemaBtn.classList.toggle('is-active');
    });
  }

  if (contrastBtn) {
    contrastBtn.addEventListener('click', () => {
      document.body.classList.toggle('high-contrast-mode');
      contrastBtn.classList.toggle('is-active');
    });
  }
}

/**
 * Ensures optimal hardware video playback between Desktop and Mobile
 */
function initHeroVideoSync() {
  const desktopVideo = document.querySelector('.video-desktop');
  const mobileVideo = document.querySelector('.video-mobile');

  function syncActiveVideo() {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      if (mobileVideo && mobileVideo.paused) {
        mobileVideo.play().catch(() => {});
      }
      if (desktopVideo && !desktopVideo.paused) {
        desktopVideo.pause();
      }
    } else {
      if (desktopVideo && desktopVideo.paused) {
        desktopVideo.play().catch(() => {});
      }
      if (mobileVideo && !mobileVideo.paused) {
        mobileVideo.pause();
      }
    }
  }

  window.addEventListener('resize', syncActiveVideo, { passive: true });
  syncActiveVideo();
}

/* ==========================================================================
   0. APPLE LIQUID GLASS 4K OVERTURE PRELOADER
   ========================================================================== */
function initPreloader() {
  const preloader = document.getElementById('app-preloader');
  const progressBar = document.getElementById('preloader-progress-bar');
  const percentText = document.getElementById('preloader-percent');
  const statusText = document.getElementById('preloader-status-text');

  if (!preloader) return;

  const isMobile = window.innerWidth <= 768;
  const targetVideo = isMobile ? document.querySelector('.video-mobile') : document.querySelector('.video-desktop');

  let currentProgress = 0;
  let targetProgress = 20;
  let isDone = false;

  const updateUI = (pct, status) => {
    if (progressBar) progressBar.style.width = `${pct}%`;
    if (percentText) percentText.textContent = `${Math.round(pct)}%`;
    if (status && statusText) statusText.textContent = status;
  };

  // Smooth tick loop for fluid progress bar movement
  const progressInterval = setInterval(() => {
    if (currentProgress < targetProgress) {
      currentProgress += Math.min(3, (targetProgress - currentProgress) * 0.16 + 0.6);
      if (currentProgress > targetProgress) currentProgress = targetProgress;
      updateUI(currentProgress);
    }
  }, 35);

  function finishLoading() {
    if (isDone) return;
    isDone = true;
    targetProgress = 100;
    updateUI(100, "STAGE READY · OVERTURE SYNC");

    setTimeout(() => {
      clearInterval(progressInterval);
      preloader.classList.add('is-loaded');

      // Start the appropriate hero video cleanly
      if (targetVideo) {
        targetVideo.play().catch(() => {});
      }

      // Refresh ScrollTrigger and layout engines
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }

      setTimeout(() => {
        preloader.style.display = 'none';
      }, 900);
    }, 450);
  }

  // Preload video buffer
  if (targetVideo) {
    targetProgress = 35;
    updateUI(targetProgress, "CONNECTING 4K FEED...");

    if (targetVideo.readyState >= 3) {
      targetProgress = 90;
      updateUI(targetProgress, "SYNCHRONIZING AUDIO-VISUAL...");
      setTimeout(finishLoading, 400);
    } else {
      targetVideo.addEventListener('loadeddata', () => {
        targetProgress = Math.max(targetProgress, 60);
        updateUI(targetProgress, "BUFFERING 4K FRAMES...");
      }, { once: true });

      targetVideo.addEventListener('canplay', () => {
        targetProgress = Math.max(targetProgress, 88);
        updateUI(targetProgress, "FINALIZING STAGE...");
      }, { once: true });

      targetVideo.addEventListener('canplaythrough', () => {
        finishLoading();
      }, { once: true });
    }
  }

  // Graceful fallback: guarantee full reveal after max 4 seconds even on slow networks
  setTimeout(() => {
    if (!isDone) {
      finishLoading();
    }
  }, 4200);
}

/* ==========================================================================
   12. APPLICATION LIFECYCLE BOOTSTRAP
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // 0. Stage 4K Video Preloader
  initPreloader();

  // 1. Initialise Smooth Inertial Scroll
  initSmoothScroll();

  // 2. Optical Header Scroll Transitions
  initHeaderTransitions();

  // 3. Responsive Hero Video Sync (Dedicated vertical 9:16 for mobile)
  initHeroVideoSync();

  // 4. Hero Video Pinned Scrub & Scale-down
  initHeroScrollScrub();

  // 4. Scroll-pinned Horizontal 5-Acts Slider
  initHorizontalSlider();

  // 5. Live Stage Countdown Timer
  initCountdownTimer();

  // 6. Dev Calibration HUD for Negative Space Fine-tuning
  initCalibrationMode();

  // 7. Apple Magnetic Cursor Follower
  initCustomCursor();

  // 8. Itinerary Hover Previews
  initItineraryHoverPreview();

  // 8b. Stage Chronicles Lightbox
  initCollageLightbox();

  // 9. Apple Wallet Digital Pass Studio
  initPassGenerator();

  // 10. Soundscape & High Contrast Utilities
  initUtilities();

  // Refresh ScrollTrigger after font loading
  if (document.fonts) {
    document.fonts.ready.then(() => {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    });
  }
});
