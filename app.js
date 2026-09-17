async function loadAlbum() {
  try {
    const res = await fetch('images/photos.json');
    const data = await res.json();
    const catalog = document.getElementById('catalog');

    data.forEach(section => {
      const row = document.createElement('div');
      row.className = 'category-row';

      const title = document.createElement('div');
      title.className = 'row-title';
      title.innerText = section.category;

      const thumbs = document.createElement('div');
      thumbs.className = 'thumbnails';

      section.photos.forEach(photo => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.backgroundImage = `url(${photo.src})`;
        thumbs.appendChild(card);
      });

      row.appendChild(title);
      row.appendChild(thumbs);
      catalog.appendChild(row);
    });
  } catch (err) {
    console.error('Failed loading album data:', err);
  }
}

function startSlideshow() {
  alert('Slideshow triggered!');
}

loadAlbum();
