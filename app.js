let playlist = [];
let currentIndex = 0;
let slideshowTimer = null;
let heroIndex = 0;

// Navbar Scroll Disappear Listener
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('top-navbar');
  if (window.scrollY > 80) {
    navbar.style.opacity = '0';
    navbar.style.pointerEvents = 'none';
  } else {
    navbar.style.opacity = '1';
    navbar.style.pointerEvents = 'auto';
  }
});

async function loadAlbum() {
  try {
    const cacheBuster = new Date().getTime();
    const res = await fetch(`images/photos.json?cb=${cacheBuster}`);
    const data = await res.json();
    const catalog = document.getElementById('catalog');
    catalog.innerHTML = '';
    playlist = [];

    data.forEach((section, idx) => {
      // Message Card Injection
      if (idx === 1) {
        const msgCard = document.createElement('div');
        msgCard.className = 'message-card';
        msgCard.innerHTML = `
          <div class="message-title">Thanks for not giving up on me</div>
          <div class="message-text">
            "Thank you for not giving up on me through all my mood swings and my illogical arguments in which I manipulate you without you realising to say yes to me 😗 so do know that I won't give up on you no matter what anyone says or no matter who comes in our way so thank you for always being with me and always having my back when I need you and for that I will always be grateful for you and I love you and continue loving you no matter what anyone says. So my Shanuli I love you and I'll always love you as innocently as the day u asked me if I would becoming friends with you when u sat behind me in the 11th std Xavier's classroom 😉"
          </div>
        `;
        catalog.appendChild(msgCard);
      }

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
        
        if (item.type === 'video' || item.src.endsWith('.mp4')) {
          // Native Video Preview Element (Muted & Preloaded to 1s)
          const vidEl = document.createElement('video');
          vidEl.src = `${item.src}#t=0.5`; // Seek to 0.5s for thumbnail frame
          vidEl.className = 'card-img';
          vidEl.muted = true;
          vidEl.playsInline = true;
          vidEl.preload = 'metadata';
          card.appendChild(vidEl);

          const badge = document.createElement('div');
          badge.className = 'video-badge';
          badge.innerText = '▶ VIDEO';
          card.appendChild(badge);
        } else {
          const imgEl = document.createElement('img');
          imgEl.src = item.src;
          imgEl.loading = 'lazy';
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
  }, 200);
}

function showMedia(item) {
  const modal = document.getElementById('modal');
  const img = document.getElementById('modal-img');
  const video = document.getElementById('modal-video');

  modal.style.display = 'flex';

  const activeMedia = (item.type === 'video' || item.src.endsWith('.mp4')) ? video : img;
  
  img.classList.add('fade-hidden');
  video.classList.add('fade-hidden');

  setTimeout(() => {
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
    activeMedia.classList.remove('fade-hidden');
  }, 150);
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

  const nextItem = playlist[(currentIndex + 1) % playlist.length];
  if (nextItem) preloadImage(nextItem.src);

  const video = document.getElementById('modal-video');
  
  if (item.type === 'video' || item.src.endsWith('.mp4')) {
    video.onended = () => advanceSlide();
  } else {
    slideshowTimer = setTimeout(() => advanceSlide(), 3500);
  }
}

function advanceSlide() {
  currentIndex = (currentIndex + 1) % playlist.length;
  playNextSlide();
}

loadAlbum();
