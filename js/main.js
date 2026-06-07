/* ============================================
   Kuwang Precision Manufacturing - Main JS
   ============================================ */

const APP = (function() {
  'use strict';

  let config = null;

  // ── Helpers ────────────────────────────────
  // Boolean HTML attributes that don't need a value
  var BOOL_ATTRS = {
    autoplay:1, muted:1, loop:1, playsinline:1, controls:1,
    default:1, disablepictureinpicture:1, disableRemotePlayback:1
  };

  // Visible placeholder for broken images (dark theme)
  var PLACEHOLDER_IMG = 'data:image/svg+xml,' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">' +
    '<rect fill="%23161b22" width="300" height="200" rx="6"/>' +
    '<text x="150" y="95" text-anchor="middle" fill="%236e7681" font-size="13" font-family="sans-serif">Image Not Found</text>' +
    '</svg>';

  function h(tag, attrs, ...children) {
    attrs = attrs || {};
    var el = document.createElement(tag);

    // Auto-add image error fallback for all <img> elements
    var hasExplicitOnerror = false;
    for (var k in attrs) {
      if (attrs.hasOwnProperty(k) && k === 'onerror') { hasExplicitOnerror = true; break; }
    }

    for (var k in attrs) {
      if (!attrs.hasOwnProperty(k)) continue;
      var v = attrs[k];
      if (k === 'className') el.className = v;
      else if (k === 'innerHTML') el.innerHTML = v;
      else if (k.indexOf('on') === 0) el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (BOOL_ATTRS[k] && v) el.setAttribute(k, '');
      else if (v != null) el.setAttribute(k, v);
    }

    // If it's an img without explicit onerror, add a fallback
    if (tag === 'img' && !hasExplicitOnerror) {
      el.addEventListener('error', function() {
        if (this.src !== PLACEHOLDER_IMG) {
          this.src = PLACEHOLDER_IMG;
          this.style.minWidth = '60px';
          this.style.minHeight = '60px';
          this.title = 'Image not found: ' + (this.getAttribute('src') || '');
        }
      });
    }
    for (const child of children) {
      if (child == null || child === false) continue;
      if (typeof child === 'string' || typeof child === 'number')
        el.appendChild(document.createTextNode(child));
      else if (child instanceof Node) el.appendChild(child);
      else if (Array.isArray(child))
        child.forEach(c => el.appendChild(c instanceof Node ? c : document.createTextNode(String(c))));
    }
    return el;
  }

  // ── Data ───────────────────────────────────
  async function loadConfig() {
    try {
      const saved = localStorage.getItem('kuwang_config');
      if (saved) { config = JSON.parse(saved); return; }
    } catch(e) {}
    try {
      const resp = await fetch('./data/config.json');
      config = await resp.json();
    } catch(e) {
      config = { company:{name:'',intro:'',contactPerson:'',phone:'',address:'',email:'',social:{whatsapp:'',facebook:'',linkedin:''}}, homepage:{videoUrl:'',videoPoster:''}, products:[] };
    }
  }

  // ── Header ─────────────────────────────────
  function renderHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;
    header.innerHTML = '';
    const inner = h('div', {className: 'header-inner'});

    const logo = h('a', {href: '#home', className: 'logo', onclick: navToHome},
      'Kuwang', h('span', {}, 'Precision')
    );
    inner.appendChild(logo);

    const nav = h('nav', {className: 'nav-links', id: 'nav-links'});
    [
      ['#home', 'Home'],
      ['#products', 'Products'],
      ['#about', 'About'],
      ['#contact', 'Contact']
    ].forEach(([href, text]) => {
      nav.appendChild(h('a', {href: href, onclick: function(e) { e.preventDefault();
        document.getElementById('nav-links').classList.remove('open');
        window.location.hash = href; scrollToSection(href); }}, text));
    });
    inner.appendChild(nav);

    const menuBtn = h('button', {className: 'mobile-menu-btn', id: 'mobile-menu-btn',
      onclick: function(){ document.getElementById('nav-links').classList.toggle('open'); }},
      h('span'), h('span'), h('span')
    );
    inner.appendChild(menuBtn);
    header.appendChild(inner);
  }

  function navToHome(e) {
    if (e) e.preventDefault();
    window.location.hash = '#home';
    document.getElementById('nav-links').classList.remove('open');
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  function scrollToSection(hash) {
    setTimeout(() => {
      const id = hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({behavior: 'smooth', block: 'start'});
      else if (hash === '#home') window.scrollTo({top: 0, behavior: 'smooth'});
    }, 50);
  }

  // ── Footer ─────────────────────────────────
  function renderFooter() {
    const footer = document.getElementById('site-footer');
    if (!footer) return;
    const c = config.company;
    footer.innerHTML = '';

    footer.appendChild(
      h('div', {className: 'container'}, [
        h('div', {className: 'footer-grid'}, [
          // Col 1: Company
          h('div', {className: 'footer-col'}, [
            h('h4', {}, c.name),
            h('p', {}, (c.intro || '').substring(0, 180) + '...'),
            h('div', {className: 'footer-social'}, [
              c.social.whatsapp ? h('a', {href: 'https://wa.me/' + c.social.whatsapp.replace(/\+/g, ''), target: '_blank', rel: 'noopener'},
                h('span', {className: 'social-icon', innerHTML: '💬'}), ' WhatsApp') : null,
              c.social.facebook ? h('a', {href: 'https://facebook.com/' + c.social.facebook, target: '_blank', rel: 'noopener'},
                h('span', {className: 'social-icon', innerHTML: '📘'}), ' Facebook') : null,
              c.social.linkedin ? h('a', {href: 'https://linkedin.com/' + c.social.linkedin, target: '_blank', rel: 'noopener'},
                h('span', {className: 'social-icon', innerHTML: '💼'}), ' LinkedIn') : null
            ].filter(Boolean))
          ]),
          // Col 2: Quick Links
          h('div', {className: 'footer-col'}, [
            h('h4', {}, 'Quick Links'),
            h('ul', {}, [
              h('li', {}, h('a', {href: '#home', onclick: function(e){ e.preventDefault(); navToHome(e); }}, 'Home')),
              h('li', {}, h('a', {href: '#products', onclick: function(e){ e.preventDefault(); scrollToSection('#products'); }}, 'Products')),
              h('li', {}, h('a', {href: '#about', onclick: function(e){ e.preventDefault(); scrollToSection('#about'); }}, 'About Us')),
              h('li', {}, h('a', {href: '#contact', onclick: function(e){ e.preventDefault(); scrollToSection('#contact'); }}, 'Contact'))
            ])
          ]),
          // Col 3: Services
          h('div', {className: 'footer-col'}, [
            h('h4', {}, 'Capabilities'),
            h('ul', {}, [
              h('li', {}, 'CNC Machining (3/4/5-Axis)'),
              h('li', {}, 'SLM / SLS / SLA 3D Printing'),
              h('li', {}, 'Vacuum Casting'),
              h('li', {}, 'Sheet Metal Fabrication'),
              h('li', {}, 'Injection Mold Tooling'),
              h('li', {}, 'CMM & 3D Scanning Inspection')
            ])
          ]),
          // Col 4: Contact
          h('div', {className: 'footer-col'}, [
            h('h4', {}, 'Contact Us'),
            h('ul', {className: 'footer-contact-list'}, [
              c.contactPerson ? h('li', {}, [h('span', {className: 'ci-icon', innerHTML: '👤'}), c.contactPerson]) : null,
              c.phone ? h('li', {}, [h('span', {className: 'ci-icon', innerHTML: '📞'}), h('a', {href: 'tel:' + c.phone}, c.phone)]) : null,
              c.address ? h('li', {}, [h('span', {className: 'ci-icon', innerHTML: '📍'}), c.address]) : null,
              c.email ? h('li', {}, [h('span', {className: 'ci-icon', innerHTML: '✉️'}), h('a', {href: 'mailto:' + c.email}, c.email)]) : null
            ].filter(Boolean))
          ])
        ]),
        h('div', {className: 'footer-bottom'}, [
          h('p', {}, '© ' + new Date().getFullYear() + ' ' + c.name + '. All Rights Reserved.')
        ])
      ])
    );
  }

  // ── Main Render ────────────────────────────
  function renderPage() {
    const main = document.getElementById('main-content');
    if (!main) return;
    main.innerHTML = '';
    const c = config.company;
    const hp = config.homepage;

    // ═══ HERO SECTION ═══
    const hero = h('section', {className: 'hero-section', id: 'home'});

    // Company name centered
    hero.appendChild(h('h1', {className: 'hero-company-name'}, c.name));

    // Video player
    const videoWrapper = h('div', {className: 'hero-video-wrapper'});
    const videoId = 'hero-video-' + Date.now();

    if (hp.videoUrl) {
      // Create a proper video element with source for better compatibility
      const videoEl = document.createElement('video');
      videoEl.id = videoId;
      videoEl.muted = true;
      videoEl.loop = true;
      videoEl.playsInline = true;
      videoEl.autoplay = true;
      videoEl.setAttribute('playsinline', '');
      videoEl.setAttribute('muted', '');
      if (hp.videoPoster) videoEl.poster = hp.videoPoster;

      // Add source element for better format detection
      const sourceEl = document.createElement('source');
      sourceEl.src = hp.videoUrl;
      // Auto-detect MIME type from file extension
      var ext = (hp.videoUrl || '').split('.').pop().toLowerCase();
      var mimeTypes = { mp4:'video/mp4', webm:'video/webm', ogv:'video/ogg', ogg:'video/ogg', mov:'video/quicktime' };
      if (mimeTypes[ext]) sourceEl.type = mimeTypes[ext];
      videoEl.appendChild(sourceEl);

      // Fallback text
      videoEl.appendChild(document.createTextNode('Your browser does not support this video format. Please use MP4 (H.264) format.'));

      // Error handling with retry
      var retryCount = 0;
      videoEl.onerror = function(e) {
        console.warn('Video load error:', videoEl.error ? videoEl.error.message : 'unknown');
        retryCount++;
        if (retryCount <= 2) {
          // Retry loading after a short delay
          setTimeout(function() {
            videoEl.load();
            videoEl.play().catch(function(){});
          }, 1000);
        } else {
          // Show placeholder after retries exhausted
          showVideoPlaceholder(videoWrapper, hp.videoUrl);
        }
      };

      // Try to play (handle autoplay blocking)
      videoEl.onloadedmetadata = function() {
        videoEl.play().then(function() {
          console.log('✅ Video playing successfully');
        }).catch(function(err) {
          console.warn('Autoplay blocked:', err.message);
          // Show a manual play button if autoplay blocked
          showPlayOverlay(videoWrapper, videoEl);
        });
      };

      // Also handle the case where video loads before we attach the event
      if (videoEl.readyState >= 2) {
        videoEl.play().catch(function(err) {
          showPlayOverlay(videoWrapper, videoEl);
        });
      }

      videoWrapper.appendChild(videoEl);
    } else {
      showVideoPlaceholder(videoWrapper, null);
    }
    videoWrapper.appendChild(h('p', {className: 'hero-video-caption'},
      '▲ Rapid Prototyping & Precision CNC Machining Process'));
    hero.appendChild(videoWrapper);
    main.appendChild(hero);

    // ═══ COMPANY INTRO ═══
    const introSection = h('section', {className: 'intro-section', id: 'about'});
    const introCard = h('div', {className: 'intro-card'});
    introCard.appendChild(h('div', {className: 'intro-label'}, 'About Our Company'));
    introCard.appendChild(h('div', {className: 'intro-text'}, c.intro || ''));
    introSection.appendChild(h('div', {className: 'container'}, [introCard]));
    main.appendChild(introSection);

    // ═══ PRODUCTS ═══
    const products = config.products || [];
    const prodSection = h('section', {className: 'products-section', id: 'products'});
    prodSection.appendChild(h('div', {className: 'container'}, [
      h('div', {className: 'section-header'}, [
        h('h2', {}, 'Our Rapid Prototyping Showcase'),
        h('div', {className: 'section-divider'}),
        h('p', {}, products.length + ' precision-engineered prototypes demonstrating our advanced manufacturing capabilities')
      ]),
      h('div', {className: 'product-grid'},
        products.map(function(item, i) {
          return h('div', {className: 'product-card animate-in', style: {animationDelay: (i*0.04)+'s'},
            onclick: function(){ openDetailModal(item); }}, [
            h('div', {className: 'product-thumb'}, [
              item.thumbnail ? h('img', {src: item.thumbnail, alt: item.name, loading: 'lazy'}) :
              item.thumbnailVideo ? h('video', {src: item.thumbnailVideo, muted: 'true', loop: 'true', playsinline: 'true',
                onmouseenter: function(){ this.play(); }, onmouseleave: function(){ this.pause(); }}) :
              h('span', {className: 'thumb-placeholder', innerHTML: '⚙️'}),
              h('span', {className: 'thumb-number'}, '#' + String(i+1).padStart(2,'0'))
            ]),
            h('div', {className: 'product-body'}, [
              h('div', {className: 'product-name'}, item.name),
              h('div', {className: 'product-short-desc'}, item.shortDesc || '')
            ]),
            h('div', {className: 'product-footer'}, [
              h('span', {className: 'product-link'}, 'View Details')
            ])
          ]);
        })
      )
    ]));
    main.appendChild(prodSection);

    // ═══ CONTACT CTA ═══
    const ctaSection = h('section', {id: 'contact', style: {padding: '60px 0', textAlign: 'center', background: 'var(--bg-elevated)', borderTop: '1px solid var(--border)'}});
    ctaSection.appendChild(h('div', {className: 'container'}, [
      h('h2', {style: {fontSize:'1.6rem', fontWeight:700, color:'var(--text-primary)', marginBottom:'10px'}}, 'Start Your Prototyping Project'),
      h('p', {style: {color:'var(--text-muted)', marginBottom:'24px', fontSize:'0.95rem'}},
        'Contact our engineering team for a free design-for-manufacturing review and quote within 24 hours.'),
      h('div', {style: {display:'flex', gap:'14px', justifyContent:'center', flexWrap:'wrap'}}, [
        h('a', {href: 'mailto:' + c.email, className: 'btn btn-gold'}, '✉️ Email Us'),
        c.social.whatsapp ? h('a', {href: 'https://wa.me/' + (c.social.whatsapp||'').replace(/\+/g, ''), target: '_blank', rel: 'noopener', className: 'btn btn-outline'}, '💬 WhatsApp') : null,
        h('a', {href: 'tel:' + c.phone, className: 'btn btn-outline'}, '📞 Call Us')
      ].filter(Boolean))
    ]));
    main.appendChild(ctaSection);
  }

  function showVideoPlaceholder(wrapper, attemptedUrl) {
    wrapper.innerHTML = '';
    var ph = h('div', {className: 'hero-video-placeholder'}, [
      h('div', {className: 'play-icon', innerHTML: '▶'}),
      h('div', {style: {fontSize:'0.95rem', color:'var(--text-secondary)', marginBottom:'8px'}},
        'Rapid Prototyping Process Video'),
      attemptedUrl ? h('div', {style: {fontSize:'0.78rem', color:'var(--danger)', marginBottom:'6px'}},
        '⚠ Unable to load: ' + attemptedUrl) : null,
      h('div', {style: {fontSize:'0.75rem', color:'var(--text-muted)', maxWidth:'400px', textAlign:'center', lineHeight:'1.5'}},
        'Place your MP4 (H.264) video in the "videos" folder, then set the path in the admin panel. ' +
        'If the video still won\'t play, try: 1) Use MP4 H.264 format 2) Open the site via a local web server 3) Check the file path is correct.')
    ]);
    wrapper.appendChild(ph);
  }

  function showPlayOverlay(wrapper, videoEl) {
    // Remove existing overlay if any
    var existing = wrapper.querySelector('.play-overlay');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.className = 'play-overlay';
    overlay.innerHTML = '<div class="play-overlay-btn">▶ Play Video</div>';
    overlay.onclick = function() {
      videoEl.muted = true;
      videoEl.play().then(function() {
        overlay.remove();
      }).catch(function(){});
    };
    // Also clicking anywhere on the video wrapper should play
    wrapper.onclick = function(e) {
      if (e.target === wrapper || e.target.closest('.play-overlay')) {
        videoEl.muted = true;
        videoEl.play().then(function() {
          overlay.remove();
          wrapper.onclick = null;
        }).catch(function(){});
      }
    };
    wrapper.appendChild(overlay);
  }

  // ── Detail Modal ───────────────────────────
  function openDetailModal(item) {
    const existing = document.getElementById('detail-modal');
    if (existing) existing.remove();

    const overlay = h('div', {className: 'modal-overlay open', id: 'detail-modal',
      onclick: function(e) { if (e.target === this) closeModal(); }
    });
    const modal = h('div', {className: 'modal'});
    modal.appendChild(h('button', {className: 'modal-close', onclick: closeModal, innerHTML: '✕'}));

    // Media
    const mediaEl = h('div', {className: 'modal-media'});
    if (item.details && item.details.videos && item.details.videos.length > 0) {
      mediaEl.appendChild(h('video', {src: item.details.videos[0], controls: 'true', autoplay: 'true'}));
    } else if (item.details && item.details.images && item.details.images.length > 0) {
      mediaEl.appendChild(h('img', {src: item.details.images[0], alt: item.name}));
    } else if (item.thumbnail) {
      mediaEl.appendChild(h('img', {src: item.thumbnail, alt: item.name}));
    } else {
      mediaEl.appendChild(h('span', {className: 'placeholder-icon', innerHTML: '⚙️'}));
    }
    modal.appendChild(mediaEl);

    const body = h('div', {className: 'modal-body'});
    body.appendChild(h('h2', {}, item.name));
    body.appendChild(h('div', {className: 'modal-badge'}, 'Rapid Prototyping'));

    // Description
    if (item.details && item.details.description) {
      body.appendChild(h('div', {className: 'modal-desc'}, item.details.description));
    }

    // Specs table
    if (item.details && item.details.specs && item.details.specs.length > 0) {
      body.appendChild(h('h4', {className: 'modal-section-title'}, '📊 Technical Specifications'));
      const table = h('table', {className: 'modal-specs-table'});
      const thead = h('thead');
      thead.appendChild(h('tr', {}, [h('th', {}, 'Parameter'), h('th', {}, 'Specification')]));
      table.appendChild(thead);
      const tbody = h('tbody');
      item.details.specs.forEach(function(s) {
        tbody.appendChild(h('tr', {}, [h('td', {style: {fontWeight:600, color:'var(--text-primary)'}}, s.name), h('td', {}, s.value)]));
      });
      table.appendChild(tbody);
      body.appendChild(table);
    }

    // Image gallery
    if (item.details && item.details.images && item.details.images.length > 0) {
      body.appendChild(h('h4', {className: 'modal-section-title'}, '🖼️ Images'));
      body.appendChild(h('div', {className: 'modal-media-gallery'},
        item.details.images.map(function(img) {
          return h('img', {src: img, alt: '', loading: 'lazy', onclick: function() {
            // Swap main media
            const mainMedia = modal.querySelector('.modal-media');
            if (mainMedia) {
              mainMedia.innerHTML = '';
              mainMedia.appendChild(h('img', {src: img, alt: item.name, style: {maxHeight:'420px', objectFit:'contain', width:'100%'}}));
            }
          }});
        })
      ));
    }

    // Video gallery
    if (item.details && item.details.videos && item.details.videos.length > 0) {
      body.appendChild(h('h4', {className: 'modal-section-title'}, '🎬 Videos'));
      body.appendChild(h('div', {className: 'modal-media-gallery'},
        item.details.videos.map(function(v) {
          return h('video', {src: v, controls: 'true', preload: 'metadata'});
        })
      ));
    }

    modal.appendChild(body);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const m = document.getElementById('detail-modal');
    if (m) m.remove();
    document.body.style.overflow = '';
  }

  // ── Init ───────────────────────────────────
  async function init() {
    await loadConfig();
    renderHeader();
    renderPage();
    renderFooter();

    window.addEventListener('hashchange', function() {
      const hash = window.location.hash;
      if (hash === '#home' || hash === '') window.scrollTo({top: 0, behavior: 'smooth'});
      else scrollToSection(hash);
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeModal();
    });

    // Observer for animation on scroll
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) entry.target.classList.add('animate-in');
        });
      }, {threshold: 0.1});
      document.querySelectorAll('.product-card').forEach(function(c) { obs.observe(c); });
    }

    console.log('⚙️ Kuwang Precision Manufacturing Website Ready');
    console.log('📋 Admin panel: Open admin.html to edit content');
  }

  return { init: init, getConfig: function() { return config; },
    reload: async function() { await loadConfig(); renderPage(); renderFooter(); } };
})();

document.addEventListener('DOMContentLoaded', function() { APP.init(); });
