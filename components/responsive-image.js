/**
 * Responsive Image Component with Modern Features
 * Supports WebP/AVIF, lazy loading, and responsive images
 */

class ResponsiveImage {
  constructor(options = {}) {
    this.options = {
      lazyLoading: true,
      modernFormats: true,
      placeholder: true,
      lightbox: false,
      ...options
    };
    
    this.imageManifest = null;
    this.loadManifest();
  }

  async loadManifest() {
    try {
      const response = await fetch('/image-manifest.json');
      this.imageManifest = await response.json();
    } catch (error) {
      console.warn('Image manifest not found, using fallback images');
    }
  }

  /**
   * Create responsive image element with modern formats
   */
  createResponsiveImage(imageName, options = {}) {
    const {
      alt = '',
      sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
      className = '',
      width,
      height,
      priority = false
    } = options;

    // Create picture element for format fallbacks
    const picture = document.createElement('picture');
    
    if (this.imageManifest && this.imageManifest[imageName]) {
      const imageData = this.imageManifest[imageName];
      
      // Add modern format sources
      if (this.options.modernFormats) {
        // AVIF source (best compression)
        if (imageData.formats.avif) {
          const avifSource = document.createElement('source');
          avifSource.type = 'image/avif';
          avifSource.srcset = this.generateSrcSet(imageData.formats.avif);
          avifSource.sizes = sizes;
          picture.appendChild(avifSource);
        }
        
        // WebP source (good compression, wide support)
        if (imageData.formats.webp) {
          const webpSource = document.createElement('source');
          webpSource.type = 'image/webp';
          webpSource.srcset = this.generateSrcSet(imageData.formats.webp);
          webpSource.sizes = sizes;
          picture.appendChild(webpSource);
        }
      }
    }
    
    // Fallback img element
    const img = document.createElement('img');
    img.alt = alt;
    img.className = className;
    
    if (width) img.width = width;
    if (height) img.height = height;
    
    // Set up lazy loading
    if (this.options.lazyLoading && !priority) {
      img.loading = 'lazy';
      img.decoding = 'async';
      
      // Add intersection observer for custom lazy loading
      if ('IntersectionObserver' in window) {
        this.setupLazyLoading(img);
      }
    }
    
    // Set source
    if (this.imageManifest && this.imageManifest[imageName]) {
      const imageData = this.imageManifest[imageName];
      img.src = imageData.optimized || imageData.original;
      
      if (imageData.formats.webp || imageData.formats.avif) {
        img.srcset = this.generateSrcSet(this.getOriginalSizes(imageData));
        img.sizes = sizes;
      }
    } else {
      // Fallback to original image
      img.src = `images/${imageName}.jpg`; // Assume jpg as fallback
    }
    
    // Add placeholder if enabled
    if (this.options.placeholder) {
      this.addPlaceholder(img);
    }
    
    // Add lightbox functionality
    if (this.options.lightbox) {
      this.addLightboxFeature(img);
    }
    
    picture.appendChild(img);
    return picture;
  }

  /**
   * Generate srcset string from image sizes object
   */
  generateSrcSet(sizesObj) {
    return Object.entries(sizesObj)
      .map(([size, url]) => `${url} ${size}w`)
      .join(', ');
  }

  /**
   * Get original format sizes from image data
   */
  getOriginalSizes(imageData) {
    // This would need to be implemented based on how you store original sizes
    return {};
  }

  /**
   * Add placeholder blur effect while loading
   */
  addPlaceholder(img) {
    img.style.backgroundColor = '#f0f0f0';
    img.style.transition = 'opacity 0.3s ease';
    
    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    placeholder.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    `;
    
    img.addEventListener('load', () => {
      if (placeholder.parentNode) {
        placeholder.remove();
      }
    });
    
    img.parentNode?.insertBefore(placeholder, img);
  }

  /**
   * Setup custom lazy loading with intersection observer
   */
  setupLazyLoading(img) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const lazyImg = entry.target;
          lazyImg.classList.add('loaded');
          observer.unobserve(lazyImg);
        }
      });
    }, {
      rootMargin: '50px'
    });
    
    observer.observe(img);
  }

  /**
   * Add lightbox functionality
   */
  addLightboxFeature(img) {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => {
      this.openLightbox(img.src, img.alt);
    });
  }

  /**
   * Open image in lightbox
   */
  openLightbox(src, alt) {
    const lightbox = document.createElement('div');
    lightbox.className = 'image-lightbox';
    lightbox.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      cursor: pointer;
    `;
    
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.style.cssText = `
      max-width: 90%;
      max-height: 90%;
      object-fit: contain;
      border-radius: 8px;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = `
      position: absolute;
      top: 20px;
      right: 30px;
      background: none;
      border: none;
      color: white;
      font-size: 40px;
      cursor: pointer;
    `;
    
    lightbox.appendChild(img);
    lightbox.appendChild(closeBtn);
    document.body.appendChild(lightbox);
    
    // Close handlers
    const closeLightbox = () => {
      document.body.removeChild(lightbox);
      document.removeEventListener('keydown', handleKeydown);
    };
    
    const handleKeydown = (e) => {
      if (e.key === 'Escape') closeLightbox();
    };
    
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    
    closeBtn.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', handleKeydown);
  }

  /**
   * Create CSS-only image slider
   */
  createImageSlider(images, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.className = 'image-slider';
    container.innerHTML = `
      <div class="slider-wrapper">
        <div class="slider-container">
          ${images.map((img, index) => `
            <div class="slide ${index === 0 ? 'active' : ''}">
              ${this.createResponsiveImage(img.name, {
                alt: img.alt,
                className: 'slider-image'
              }).outerHTML}
            </div>
          `).join('')}
        </div>
        <div class="slider-nav">
          ${images.map((_, index) => `
            <button class="nav-dot ${index === 0 ? 'active' : ''}" data-slide="${index}"></button>
          `).join('')}
        </div>
        <button class="slider-btn prev">&lt;</button>
        <button class="slider-btn next">&gt;</button>
      </div>
    `;
    
    this.initSlider(container);
  }

  /**
   * Initialize slider functionality
   */
  initSlider(container) {
    const slides = container.querySelectorAll('.slide');
    const dots = container.querySelectorAll('.nav-dot');
    const prevBtn = container.querySelector('.prev');
    const nextBtn = container.querySelector('.next');
    let currentSlide = 0;
    
    const showSlide = (index) => {
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
      currentSlide = index;
    };
    
    prevBtn.addEventListener('click', () => {
      showSlide(currentSlide > 0 ? currentSlide - 1 : slides.length - 1);
    });
    
    nextBtn.addEventListener('click', () => {
      showSlide(currentSlide < slides.length - 1 ? currentSlide + 1 : 0);
    });
    
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => showSlide(index));
    });
    
    // Auto-play (optional)
    setInterval(() => {
      showSlide(currentSlide < slides.length - 1 ? currentSlide + 1 : 0);
    }, 5000);
  }
}

// Global instance
window.ResponsiveImage = new ResponsiveImage();

// CSS for components
const style = document.createElement('style');
style.textContent = `
  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  
  .image-slider {
    position: relative;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .slider-wrapper {
    position: relative;
    overflow: hidden;
    border-radius: 12px;
  }
  
  .slider-container {
    position: relative;
    width: 100%;
    height: 400px;
  }
  
  .slide {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 0.5s ease;
  }
  
  .slide.active {
    opacity: 1;
  }
  
  .slider-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .slider-nav {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
  }
  
  .nav-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: background 0.3s ease;
  }
  
  .nav-dot.active {
    background: white;
  }
  
  .slider-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 18px;
    transition: background 0.3s ease;
  }
  
  .slider-btn:hover {
    background: rgba(0, 0, 0, 0.7);
  }
  
  .slider-btn.prev {
    left: 20px;
  }
  
  .slider-btn.next {
    right: 20px;
  }
  
  @media (max-width: 768px) {
    .slider-container {
      height: 250px;
    }
    
    .slider-btn {
      width: 35px;
      height: 35px;
      font-size: 16px;
    }
    
    .slider-btn.prev {
      left: 10px;
    }
    
    .slider-btn.next {
      right: 10px;
    }
  }
`;

document.head.appendChild(style);