let allPhotos = [];
let currentIndex = 0;

async function loadAlbum() {
  try {
    const res = await fetch('images/photos.json?v=2');
    const data = await res.json();
    const catalog = document.getElementById('catalog');
    catalog.innerHTML = '';

    data.forEach(section => {
      if (section.photos.length === 0) return;

      const row = document.createElement('div');
      row.className = 'category-row';

      const title = document.createElement('div');
      title.className = 'row-title';
      title.innerText = section.category;

      const thumbs = document.createElement('div');
      thumbs.className = 'thumbnails';

      section.photos.forEach(photo => {
        allPhotos.push(photo.src);
        const card = document.createElement('div');
        card.className = 'card';
        card.style.backgroundImage = `url('${photo.src}')`;
        card.onclick = () => openModal(photo.src);
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

function openModal(src) {
  const modal = document.getElementById('modal');
  const modalImg = document.getElementById('modal-img');
  modal.style.display = 'flex';
  modalImg.src = src;
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

function startSlideshow() {
  if (allPhotos.length === 0) return;
  currentIndex = 0;
  openModal(allPhotos[currentIndex]);
  
  const interval = setInterval(() => {
    const modal = document.getElementById('modal');
    if (modal.style.display === 'none') {
      clearInterval(interval);
      return;
    }
    currentIndex = (currentIndex + 1) % allPhotos.length;
    document.getElementById('modal-img').src = allPhotos[currentIndex];
  }, 2500);
}

loadAlbum();
