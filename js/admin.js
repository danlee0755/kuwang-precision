/* ============================================
   Kuwang Precision - Admin Panel JS
   ============================================ */

(function() {
  'use strict';

  let config = null;
  let expandedItems = {};

  // Visible placeholder for broken images (dark theme)
  var PLACEHOLDER_IMG = 'data:image/svg+xml,' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">' +
    '<rect fill="%23161b22" width="300" height="200" rx="6"/>' +
    '<text x="150" y="95" text-anchor="middle" fill="%236e7681" font-size="13" font-family="sans-serif">Image Not Found</text>' +
    '</svg>';

  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    var hasExplicitOnerror = false;
    for (var k in (attrs||{})) { if (attrs.hasOwnProperty(k) && k === 'onerror') { hasExplicitOnerror = true; break; } }

    for (const [k, v] of Object.entries(attrs||{})) {
      if (k === 'className') el.className = v;
      else if (k === 'innerHTML') el.innerHTML = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else el.setAttribute(k, v);
    }

    if (tag === 'img' && !hasExplicitOnerror) {
      el.addEventListener('error', function() {
        if (this.src !== PLACEHOLDER_IMG) {
          this.src = PLACEHOLDER_IMG;
          this.style.minWidth = '60px'; this.style.minHeight = '60px';
          this.title = 'Image not found: ' + (this.getAttribute('src') || '');
        }
      });
    }
    for (const child of (children||[])) {
      if (child == null || child === false) continue;
      if (typeof child === 'string' || typeof child === 'number') el.appendChild(document.createTextNode(child));
      else if (child instanceof Node) el.appendChild(child);
      else if (Array.isArray(child)) child.forEach(function(c) { el.appendChild(c instanceof Node ? c : document.createTextNode(String(c))); });
    }
    return el;
  }

  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    setTimeout(function(){ t.classList.remove('show'); }, 2500);
  }

  function generateId() { return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2,6); }

  // ── Data ───────────────────────────────────
  async function loadConfig() {
    try { var s = localStorage.getItem('kuwang_config'); if (s) { config = JSON.parse(s); return; } } catch(e) {}
    try { var r = await fetch('./data/config.json'); config = await r.json(); } catch(e) {
      config = { company:{name:'',intro:'',contactPerson:'',phone:'',address:'',email:'',social:{whatsapp:'',facebook:'',linkedin:''}}, homepage:{videoUrl:'',videoPoster:''}, products:[] };
    }
  }

  function saveConfig() {
    localStorage.setItem('kuwang_config', JSON.stringify(config));
    toast('✅ Changes saved to browser storage');
  }

  function exportJSON() {
    var blob = new Blob([JSON.stringify(config, null, 2)], {type:'application/json'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.href = url; a.download = 'config.json'; a.click();
    URL.revokeObjectURL(url);
    toast('📥 Config file downloaded! Replace data/config.json with this file.');
  }

  function importJSON(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
      try { config = JSON.parse(e.target.result); saveConfig(); renderAll(); toast('✅ Imported!'); }
      catch(err) { toast('❌ Invalid JSON file'); }
    };
    reader.readAsText(file);
  }

  // ── Panel Switching ────────────────────────
  window.switchPanel = function(name) {
    document.querySelectorAll('.admin-sidebar nav a').forEach(function(a) { a.classList.toggle('active', a.dataset.panel === name); });
    renderPanel(name);
  };

  function renderPanel(name) {
    var main = document.getElementById('admin-main'); if (!main) return; main.innerHTML = '';
    switch(name) {
      case 'company': renderCompanyPanel(main); break;
      case 'homepage': renderHomepagePanel(main); break;
      case 'products': renderProductsPanel(main); break;
      case 'export': renderExportPanel(main); break;
    }
  }

  function renderAll() {
    var active = document.querySelector('.admin-sidebar nav a.active');
    if (active) renderPanel(active.dataset.panel);
  }

  function fg(label, id, value, onChange, textarea, placeholder) {
    var g = h('div', {className: 'form-group'});
    g.appendChild(h('label', {for: id}, label));
    if (textarea) {
      g.appendChild(h('textarea', {id: id, placeholder: placeholder||'', oninput: function(e){ onChange(e.target.value); }}, value||''));
    } else {
      g.appendChild(h('input', {type: 'text', id: id, value: value||'', placeholder: placeholder||'', oninput: function(e){ onChange(e.target.value); }}));
    }
    return g;
  }

  // ── Company Panel ──────────────────────────
  function renderCompanyPanel(container) {
    var c = config.company;
    container.appendChild(h('div', {className: 'admin-panel active'}, [
      h('h2', {}, '🏢 Company Information'),
      h('div', {className: 'card-section'}, [
        h('h3', {}, 'Company Details'),
        fg('Company Name', 'co-name', c.name, function(v){ c.name=v; saveConfig(); }),
        fg('Company Introduction (max ~200 words, English)', 'co-intro', c.intro, function(v){ c.intro=v; saveConfig(); }, true,
          'Describe your company — location in Dongguan, manufacturing capabilities, industries served, certifications, etc. English only.'),
        h('div', {className: 'form-row'}, [
          fg('Contact Person', 'co-cp', c.contactPerson, function(v){ c.contactPerson=v; saveConfig(); }),
          fg('Phone', 'co-ph', c.phone, function(v){ c.phone=v; saveConfig(); })
        ]),
        fg('Address', 'co-addr', c.address, function(v){ c.address=v; saveConfig(); }, true),
        fg('Email', 'co-em', c.email, function(v){ c.email=v; saveConfig(); })
      ]),
      h('div', {className: 'card-section'}, [
        h('h3', {}, 'Social Media (clickable links in footer)'),
        h('div', {className: 'form-row-3'}, [
          fg('WhatsApp Number', 'soc-wa', c.social.whatsapp, function(v){ c.social.whatsapp=v; saveConfig(); }, false, '+8613800138000'),
          fg('Facebook Username', 'soc-fb', c.social.facebook, function(v){ c.social.facebook=v; saveConfig(); }, false, 'KuwangPrecision'),
          fg('LinkedIn Page', 'soc-li', c.social.linkedin, function(v){ c.social.linkedin=v; saveConfig(); }, false, 'company/kuwang-precision')
        ])
      ]),
      h('button', {className: 'btn btn-primary', style: {marginTop:'12px'}, onclick: function(){ saveConfig(); toast('✅ Company info saved!'); }}, '💾 Save Company Info')
    ]));
  }

  // ── Homepage Panel ─────────────────────────
  function renderHomepagePanel(container) {
    var hp = config.homepage;
    container.appendChild(h('div', {className: 'admin-panel active'}, [
      h('h2', {}, '🎬 Homepage Video'),
      h('div', {className: 'card-section'}, [
        h('h3', {}, 'Company Video (looping, auto-play)'),
        h('p', {style: {fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:'16px'}},
          'Upload a 20-second video showcasing your rapid prototyping manufacturing process. Place the video file in the "videos" folder and enter the relative path below.'),
        fg('Video File Path', 'hp-video', hp.videoUrl, function(v){ hp.videoUrl=v; saveConfig(); }, false, 'videos/your-video.mp4'),
        fg('Video Poster Image (optional)', 'hp-poster', hp.videoPoster||'', function(v){ hp.videoPoster=v; saveConfig(); }, false, 'images/video-poster.jpg'),
        hp.videoUrl ? h('div', {style: {marginTop:'12px', padding:'12px', background:'var(--bg-dark)', borderRadius:'6px', fontSize:'0.82rem', color:'var(--success)', border:'1px solid rgba(63,185,80,0.3)'}},
          '✅ Video path set: ' + hp.videoUrl) : null,
        h('div', {style: {marginTop:'16px', padding:'14px', background:'rgba(88,166,255,0.08)', borderRadius:'8px', border:'1px solid rgba(88,166,255,0.2)', fontSize:'0.82rem', color:'var(--text-secondary)', lineHeight:'1.6'}}, [
          h('strong', {style: {color:'var(--accent-bright)'}}, '📋 Video Troubleshooting:'),
          h('ul', {style: {marginTop:'8px', paddingLeft:'16px'}}, [
            h('li', {}, 'Use MP4 format with H.264 video codec — this works in all browsers'),
            h('li', {}, 'Place your .mp4 file in the videos/ folder, then enter "videos/your-filename.mp4"'),
            h('li', {}, 'If the video won\'t autoplay, click the ▶ Play button that appears on the video'),
            h('li', {}, 'Opening the site via file:// may block videos — use a local web server for best results')
          ])
        ])
      ])
    ]));
  }

  // ── Products Panel ─────────────────────────
  function renderProductsPanel(container) {
    var products = config.products || [];
    container.appendChild(h('div', {className: 'admin-panel active'}, [
      h('h2', {}, '📦 Products (' + products.length + ' of 20)'),
      h('p', {style: {fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:'20px'}},
        'Manage your 20 rapid prototyping showcase products. Click each product to expand and edit all details including text, images, specification tables, and videos.'),
      h('div', {id: 'products-list'}, products.map(function(item, i) { return renderProductCard(item, i, products, container); })),
      products.length < 20 ? h('button', {className: 'add-new-btn', style: {marginTop:'12px'}, onclick: function(){
        products.push({
          id: generateId(), name:'New Product '+(products.length+1), thumbnail:'', thumbnailVideo:'',
          shortDesc:'Brief description (max 20 words).',
          details: { description:'Detailed description with text, formatting, line breaks.', images:[], videos:[], specs:[] }
        });
        saveConfig(); renderProductsPanel(container);
      }}, '+ Add Product (' + products.length + '/20)') : null
    ]));
  }

  function renderProductCard(item, index, products, panelContainer) {
    var isExp = expandedItems[item.id] === true;
    var card = h('div', {className: 'card-section'});

    // Header
    var header = h('div', {style: {display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer'},
      onclick: function(){
        expandedItems[item.id] = !isExp; renderProductsPanel(panelContainer);
      }
    }, [
      h('div', {style: {display:'flex', alignItems:'center', gap:'10px'}}, [
        h('span', {}, isExp ? '▼' : '▶'),
        h('strong', {style: {color:'var(--text-primary)'}}, 'Product #'+(index+1)+': ' + (item.name||'Unnamed')),
        h('span', {style: {fontSize:'0.75rem', color:'var(--text-muted)'}}, '(ID: '+item.id.substring(0,8)+'...)')
      ]),
      h('div', {style: {display:'flex', gap:'6px'}}, [
        index > 0 ? h('button', {className: 'btn-icon', title: 'Move Up', onclick: function(e){ e.stopPropagation();
          var t=products[index]; products[index]=products[index-1]; products[index-1]=t; saveConfig(); renderProductsPanel(panelContainer); }, innerHTML: '⬆️'}) : null,
        index < products.length-1 ? h('button', {className: 'btn-icon', title: 'Move Down', onclick: function(e){ e.stopPropagation();
          var t=products[index]; products[index]=products[index+1]; products[index+1]=t; saveConfig(); renderProductsPanel(panelContainer); }, innerHTML: '⬇️'}) : null,
        h('button', {className: 'btn-icon danger', title: 'Delete', onclick: function(e){ e.stopPropagation();
          if (confirm('Delete product "'+item.name+'"?')) { products.splice(index,1); saveConfig(); renderProductsPanel(panelContainer); }}, innerHTML: '🗑️'})
      ])
    ]);
    card.appendChild(header);

    if (isExp) {
      var form = h('div', {style: {marginTop:'16px'}});

      // Basic info
      form.appendChild(h('div', {className: 'form-row'}, [
        h('div', {className: 'form-group'}, [
          h('label', {}, 'Product Name'),
          h('input', {type:'text', value: item.name, oninput: function(e){ item.name=e.target.value; saveConfig(); }})
        ]),
        h('div', {className: 'form-group'}, [
          h('label', {}, 'Thumbnail Image URL'),
          h('input', {type:'text', value: item.thumbnail||'', placeholder: 'images/product-01.jpg',
            oninput: function(e){ item.thumbnail=e.target.value; saveConfig(); }})
        ])
      ]));
      form.appendChild(h('div', {className: 'form-group'}, [
        h('label', {}, 'Short Description (max 20 words, shown as text link below thumbnail)'),
        h('textarea', {oninput: function(e){ item.shortDesc=e.target.value; saveConfig(); }}, item.shortDesc||'')
      ]));
      form.appendChild(h('div', {className: 'form-group'}, [
        h('label', {}, 'Thumbnail Video URL (optional — replaces thumbnail image on hover)'),
        h('input', {type:'text', value: item.thumbnailVideo||'', placeholder: 'videos/product-01-thumb.mp4',
          oninput: function(e){ item.thumbnailVideo=e.target.value; saveConfig(); }})
      ]));

      // Details
      var d = item.details || {};
      if (!item.details) item.details = { description:'', images:[], videos:[], specs:[] };
      d = item.details;

      form.appendChild(h('h4', {style: {marginTop:'20px', marginBottom:'12px', color:'var(--accent-bright)', borderTop:'1px solid var(--border)', paddingTop:'16px'}}, '📝 Detailed Information (shown when user clicks the product)'));

      form.appendChild(h('div', {className: 'form-group'}, [
        h('label', {}, 'Full Description (text, line breaks supported)'),
        h('textarea', {style: {minHeight:'120px'}, oninput: function(e){ d.description=e.target.value; saveConfig(); }}, d.description||'')
      ]));

      // Specs table
      form.appendChild(h('div', {className: 'card-section', style: {background:'var(--bg-dark)'}}, [
        h('h4', {style: {marginBottom:'10px', color:'var(--text-primary)', fontSize:'0.9rem'}}, '📊 Specification Table'),
        h('div', {id: 'specs-'+item.id},
          (d.specs||[]).map(function(spec, si){
            return h('div', {className: 'spec-row'}, [
              h('input', {type:'text', value: spec.name, placeholder: 'Parameter name', style: {flex:'1'},
                oninput: function(e){ spec.name=e.target.value; saveConfig(); }}),
              h('input', {type:'text', value: spec.value, placeholder: 'Specification value', style: {flex:'2'},
                oninput: function(e){ spec.value=e.target.value; saveConfig(); }}),
              h('button', {className: 'btn-icon danger', style: {flexShrink:0}, onclick: function(){
                d.specs.splice(si,1); saveConfig(); renderProductsPanel(panelContainer);
              }, innerHTML: '✕'})
            ]);
          })
        ),
        h('button', {className: 'btn btn-sm', style: {marginTop:'8px', background:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--text-secondary)'}, onclick: function(){
          d.specs.push({name:'', value:''}); saveConfig(); renderProductsPanel(panelContainer);
        }}, '+ Add Specification Row')
      ]));

      // Images
      form.appendChild(h('div', {className: 'card-section', style: {background:'var(--bg-dark)'}}, [
        h('h4', {style: {marginBottom:'10px', color:'var(--text-primary)', fontSize:'0.9rem'}}, '🖼️ Detail Images'),
        h('div', {},
          (d.images||[]).map(function(url, i2){
            return h('div', {className: 'media-url-row'}, [
              h('input', {type:'text', value: url, placeholder: 'Image URL '+(i2+1),
                oninput: function(e){ d.images[i2]=e.target.value; saveConfig(); }}),
              h('button', {className: 'btn-icon danger', style: {flexShrink:0}, onclick: function(){
                d.images.splice(i2,1); saveConfig(); renderProductsPanel(panelContainer);
              }, innerHTML: '✕'})
            ]);
          })
        ),
        h('button', {className: 'btn btn-sm', style: {marginTop:'8px', background:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--text-secondary)'}, onclick: function(){
          if(!d.images) d.images=[]; d.images.push(''); saveConfig(); renderProductsPanel(panelContainer);
        }}, '+ Add Image URL')
      ]));

      // Videos
      form.appendChild(h('div', {className: 'card-section', style: {background:'var(--bg-dark)'}}, [
        h('h4', {style: {marginBottom:'10px', color:'var(--text-primary)', fontSize:'0.9rem'}}, '🎬 Detail Videos'),
        h('div', {},
          (d.videos||[]).map(function(url, i2){
            return h('div', {className: 'media-url-row'}, [
              h('input', {type:'text', value: url, placeholder: 'Video URL '+(i2+1),
                oninput: function(e){ d.videos[i2]=e.target.value; saveConfig(); }}),
              h('button', {className: 'btn-icon danger', style: {flexShrink:0}, onclick: function(){
                d.videos.splice(i2,1); saveConfig(); renderProductsPanel(panelContainer);
              }, innerHTML: '✕'})
            ]);
          })
        ),
        h('button', {className: 'btn btn-sm', style: {marginTop:'8px', background:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--text-secondary)'}, onclick: function(){
          if(!d.videos) d.videos=[]; d.videos.push(''); saveConfig(); renderProductsPanel(panelContainer);
        }}, '+ Add Video URL')
      ]));

      card.appendChild(form);
    }

    return card;
  }

  // ── Export Panel ───────────────────────────
  function renderExportPanel(container) {
    container.appendChild(h('div', {className: 'admin-panel active'}, [
      h('h2', {}, '💾 Save & Export'),
      h('div', {className: 'card-section'}, [
        h('h3', {}, '💾 Browser Storage'), h('p', {style: {marginBottom:'10px', fontSize:'0.88rem', color:'var(--text-muted)'}}, 'Changes auto-save as you type.'),
        h('button', {className: 'btn btn-primary', onclick: function(){ saveConfig(); }}, '💾 Force Save Now')
      ]),
      h('div', {className: 'card-section'}, [
        h('h3', {}, '📥 Download config.json'),
        h('p', {style: {marginBottom:'10px', fontSize:'0.88rem', color:'var(--text-muted)'}}, 'Download configuration and replace data/config.json for permanent changes.'),
        h('button', {className: 'btn btn-primary', onclick: exportJSON}, '📥 Download config.json')
      ]),
      h('div', {className: 'card-section'}, [
        h('h3', {}, '📤 Import config.json'),
        h('input', {type:'file', accept:'.json', id:'import-file', style:{display:'none'},
          onchange: function(e){ if(e.target.files[0]) importJSON(e.target.files[0]); }}),
        h('button', {className: 'btn btn-outline', onclick: function(){ document.getElementById('import-file').click(); }}, '📤 Import config.json')
      ]),
      h('div', {className: 'card-section'}, [
        h('h3', {}, '📋 JSON Preview'),
        h('pre', {style: {background:'#0d1117', color:'#a5d6ff', padding:'18px', borderRadius:'8px', maxHeight:'350px', overflow:'auto', fontSize:'0.75rem', whiteSpace:'pre-wrap', border:'1px solid var(--border)'}},
          JSON.stringify(config, null, 2))
      ]),
      h('div', {className: 'alert alert-info'}, [
        h('strong', {}, '💡 How to make changes permanent:'),
        h('ol', {style: {marginTop:'6px', paddingLeft:'18px', fontSize:'0.84rem'}}, [
          h('li', {}, 'Edit all content through the panels above'),
          h('li', {}, 'Go to Export tab → click "Download config.json"'),
          h('li', {}, 'Replace the data/config.json file with your download'),
          h('li', {}, 'Refresh the website to see permanent changes')
        ])
      ])
    ]));
  }

  // ── Init ───────────────────────────────────
  async function init() {
    await loadConfig();
    renderPanel('company');
    console.log('⚙️ Kuwang Precision Admin Panel Ready');
  }

  init();
})();
