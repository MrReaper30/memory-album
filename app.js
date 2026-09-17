let playlist = [];
let currentIndex = 0;
let slideshowTimer = null;
let heroIndex = 0;

async function loadAlbum() {
  try {
    const res = await fetch('images/photos.json?v=7');
    const data = await res.json();
    const catalog = document.getElementById('catalog');
    catalog.innerHTML = '';
    playlist = [];

    data.forEach(section => {
      if (!section.photos || section.photos.length === 0) return;

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
          // Fast img element with native lazy loading instead of CSS background
          const imgEl = document.createElement('img');
          imgEl.src = item.src;
          imgEl.loading = 'lazy';
          imgEl.alt = item.title || 'Memory';
          imgEl.className = 'card-img';
          card.appendChild(imgEl);
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

// Preload next image in background for zero lag during slideshow
function preloadImage(url) {
  if (!url || url.endsWith('.mp4')) return;
  const img = new Image();
  img.src = url;
}

function startHeroSlideshow() {
  const imagesOnly = playlist.filter(item => item.type === 'image');
  if (imagesOnly.length === 0) return;

  const heroBg = document.getElementById('hero-bg');
  
  function updateBg() {
    heroBg.style.backgroundImage = `url('${imagesOnly[heroIndex].src}')`;
    heroBg.style.animation = 'none';
    heroBg.offsetHeight;
    heroBg.style.animation = 'heroZoom 6s ease-in-out infinite alternate';
    
    // Preload next background
    const nextIdx = (heroIndex + 1) % imagesOnly.length;
    preloadImage(imagesOnly[nextIdx].src);
  }

  updateBg();

  setInterval(() => {
    heroIndex = (heroIndex + 1) % imagesOnly.length;
    updateBg();
  }, 5000);
}

function playIntroSound() {
  const audio = new Audio('audio/intro.mp3');
  audio.play().catch(e => console.log('Audio playback info:', e));
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

  // Preload upcoming slide
  const nextItem = playlist[(currentIndex + 1) % playlist.length];
  if (nextItem) preloadImage(nextItem.src);

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
