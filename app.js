let playlist = [];
let currentIndex = 0;
let slideshowTimer = null;
let heroIndex = 0;

async function loadAlbum() {
  try {
    const res = await fetch('images/photos.json?v=5');
    const data = await res.json();
    const catalog = document.getElementById('catalog');
    catalog.innerHTML = '';
    playlist = [];

    data.forEach(section => {
      if (section.photos.length === 0) return;

      const row = document.createElement('div');
      row.className = 'category-row';

      const title = document.createElement('div');
      title.className = 'row-title';
      title.innerText = section.category;

      const thumbs = document.createElement('div');
      thumbs.className = 'thumbnails';

      section.photos.forEach(item => {
        playlist.push(item);

        const card = document.createElement('div');
        card.className = 'card';
        
        if (item.type === 'video') {
          card.style.backgroundColor = '#222';
          card.innerText = '▶ Video';
          card.style.display = 'flex';
          card.style.alignItems = 'center';
          card.style.justifyContent = 'center';
          card.style.fontWeight = 'bold';
        } else {
          card.style.backgroundImage = `url('${item.src}')`;
        }

        card.onclick = () => showMedia(item);
        thumbs.appendChild(card);
      });

      row.appendChild(title);
      row.appendChild(thumbs);
      catalog.appendChild(row);
    });

    startHeroSlideshow();
  } catch (err) {
    console.error('Error loading album:', err);
  }
}

// Netflix Hero Image Switcher with Zoom Reset
function startHeroSlideshow() {
  const imagesOnly = playlist.filter(item => item.type === 'image');
  if (imagesOnly.length === 0) return;

  const heroBg = document.getElementById('hero-bg');
  
  function updateBg() {
    heroBg.style.backgroundImage = `url('${imagesOnly[heroIndex].src}')`;
    // Restart animation on image change
    heroBg.style.animation = 'none';
    heroBg.offsetHeight; /* trigger reflow */
    heroBg.style.animation = 'heroZoom 6s ease-in-out infinite alternate';
  }

  updateBg();

  setInterval(() => {
    heroIndex = (heroIndex + 1) % imagesOnly.length;
    updateBg();
  }, 5000); // Changes image every 5 seconds
}

function playIntroSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 1.2);

    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 2.0);
  } catch (e) {
    console.log('Audio error:', e);
  }
}

function playIntro() {
  playIntroSound();
  const intro = document.getElementById('intro-screen');
  intro.classList.add('fade-out');
  setTimeout(() => {
    intro.style.display = 'none';
  }, 800);
}

function showMedia(item) {
  const modal = document.getElementById('modal');
  const img = document.getElementById('modal-img');
  const video = document.getElementById('modal-video');

  modal.style.display = 'flex';

  if (item.type === 'video' || item.src.endsWith('.mp4')) {
    img.style.display = 'none';
    video.style.display = 'block';
    video.src = item.src;
    video.play();
  } else {
    video.style.display = 'none';
    video.pause();
    img.style.display = 'block';
    img.src = item.src;
  }
}

function closeModal() {
  const modal = document.getElementById('modal');
  const video = document.getElementById('modal-video');
  modal.style.display = 'none';
  video.pause();
  if (slideshowTimer) clearTimeout(slideshowTimer);
}

function startSlideshow() {
  if (playlist.length === 0) return;
  currentIndex = 0;
  playNextSlide();
}

function playNextSlide() {
  const modal = document.getElementById('modal');
  if (modal.style.display === 'none' && currentIndex > 0) return;

  const item = playlist[currentIndex];
  showMedia(item);

  const video = document.getElementById('modal-video');
  
  if (item.type === 'video' || item.src.endsWith('.mp4')) {
    video.onended = () => advanceSlide();
  } else {
    slideshowTimer = setTimeout(() => advanceSlide(), 3000);
  }
}

function advanceSlide() {
  currentIndex = (currentIndex + 1) % playlist.length;
  playNextSlide();
}

loadAlbum();
