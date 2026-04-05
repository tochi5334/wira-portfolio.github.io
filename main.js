/* ============================================
   Wira Portfolio - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all features
  initNavigation();
  initGallery();        // ギャラリー生成（先に実行）
  initGalleryFilter();  // フィルター設定
  initLightbox();
  initFadeInAnimation();
  initHeroSlideshow();
});

/* ============================================
   Gallery Generation from config.js
   ============================================ */
function initGallery() {
  const galleryGrid = document.getElementById('galleryGrid');
  if (!galleryGrid) return;

  // config.js から画像リストを取得
  const starrailImages = (typeof galleryStarrail !== 'undefined') ? galleryStarrail : [];
  const otherImages = (typeof galleryOther !== 'undefined') ? galleryOther : [];

  // 画像がない場合は何もしない（プレースホルダーメッセージを表示）
  if (starrailImages.length === 0 && otherImages.length === 0) {
    return;
  }

  // ギャラリーをクリア
  galleryGrid.innerHTML = '';

  // ファイル名からタイトルを生成（拡張子を除去）
  function getTitle(filename) {
    return filename.replace(/\.[^/.]+$/, '');
  }

  // 崩壊スターレイル画像を追加
  starrailImages.forEach(filename => {
    const item = createGalleryItem(
      `images/gallery/starrail/${filename}`,
      getTitle(filename),
      'starrail'
    );
    galleryGrid.appendChild(item);
  });

  // その他の画像を追加
  otherImages.forEach(filename => {
    const item = createGalleryItem(
      `images/gallery/other/${filename}`,
      getTitle(filename),
      'other'
    );
    galleryGrid.appendChild(item);
  });
}

function createGalleryItem(src, title, category) {
  const item = document.createElement('div');
  item.className = 'gallery-item fade-in';
  item.dataset.category = category;

  item.innerHTML = `
    <img src="${src}" alt="${title}" loading="lazy">
    <div class="gallery-overlay">
      <span class="gallery-title">${title}</span>
    </div>
  `;

  return item;
}

/* ============================================
   Mobile Navigation
   ============================================ */
function initNavigation() {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }
}

/* ============================================
   Gallery Category Filter
   ============================================ */
function initGalleryFilter() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      // Filter gallery items
      galleryItems.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.classList.remove('hidden');
          // Re-trigger fade-in animation
          item.classList.remove('visible');
          setTimeout(() => item.classList.add('visible'), 10);
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });
}

/* ============================================
   Lightbox
   ============================================ */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = lightbox.querySelector('.lightbox-image');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');

  const galleryItems = document.querySelectorAll('.gallery-item');
  let currentIndex = 0;
  let visibleItems = [];

  function updateVisibleItems() {
    visibleItems = Array.from(galleryItems).filter(
      item => !item.classList.contains('hidden')
    );
  }

  function openLightbox(index) {
    updateVisibleItems();
    currentIndex = index;
    const item = visibleItems[index];

    if (item) {
      const img = item.querySelector('img');
      const placeholder = item.querySelector('.gallery-placeholder');
      const title = item.querySelector('.gallery-title');

      if (img) {
        lightboxImage.src = img.src;
        lightboxImage.alt = img.alt;
      } else if (placeholder) {
        // プレースホルダーの場合はダミー画像を表示
        lightboxImage.src = '';
        lightboxImage.alt = 'プレースホルダー';
      }

      lightboxCaption.textContent = title ? title.textContent : '';
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showPrev() {
    updateVisibleItems();
    currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
    openLightbox(currentIndex);
  }

  function showNext() {
    updateVisibleItems();
    currentIndex = (currentIndex + 1) % visibleItems.length;
    openLightbox(currentIndex);
  }

  // Event listeners
  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      updateVisibleItems();
      const visibleIndex = visibleItems.indexOf(item);
      if (visibleIndex !== -1) {
        openLightbox(visibleIndex);
      }
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', showPrev);
  nextBtn.addEventListener('click', showNext);

  // Close on background click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        showPrev();
        break;
      case 'ArrowRight':
        showNext();
        break;
    }
  });
}

/* ============================================
   Fade-in Animation on Scroll
   ============================================ */
function initFadeInAnimation() {
  const fadeElements = document.querySelectorAll('.fade-in');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  fadeElements.forEach(el => observer.observe(el));
}

/* ============================================
   Hero Slideshow
   ============================================ */
function initHeroSlideshow() {
  const slideshow = document.getElementById('heroSlideshow');
  if (!slideshow) return;

  // config.js で定義された heroImages 配列をチェック
  if (typeof heroImages === 'undefined' || heroImages.length === 0) {
    // 画像がない場合はデフォルト背景のまま
    return;
  }

  // 既存のスライドをクリア
  slideshow.innerHTML = '';

  // config.js の画像リストからスライドを生成
  heroImages.forEach((imageName, index) => {
    const slide = document.createElement('div');
    slide.className = 'slide' + (index === 0 ? ' active' : '');
    slide.style.backgroundImage = `url('images/hero/${imageName}')`;
    slideshow.appendChild(slide);
  });

  // スライドを取得
  const slides = slideshow.querySelectorAll('.slide');
  if (slides.length <= 1) return; // 1枚以下なら切り替え不要

  let currentSlide = 0;
  const slideInterval = 4000; // 4秒ごとに切り替え

  function nextSlide() {
    // 現在のスライドを非アクティブに
    slides[currentSlide].classList.remove('active');

    // 次のスライドへ
    currentSlide = (currentSlide + 1) % slides.length;

    // 新しいスライドをアクティブに
    slides[currentSlide].classList.add('active');
  }

  // 自動スライドショー開始
  setInterval(nextSlide, slideInterval);
}

