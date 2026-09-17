let playlist = [];
let currentIndex = 0;
let slideshowTimer = null;

async function loadAlbum() {
  try {
    const res = await fetch('images/photos.json?v=3');
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
          card.style.backgroundColor = '#333';
          card.innerText = '▶ Video';
          card.style.display = 'flex';
          card.style.alignItems = 'center';
          card.style.justifyContent = 'center';
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
  } catch (err) {
    console.error('Error loading album:', err);
  }
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
    video.onended = () => {
      advanceSlide();
    };
  } else {
    slideshowTimer = setTimeout(() => {
      advanceSlide();
    }, 3000); // 3 seconds per photo
  }
}

function advanceSlide() {
  currentIndex = (currentIndex + 1) % playlist.length;
  playNextSlide();
}

loadAlbum();
