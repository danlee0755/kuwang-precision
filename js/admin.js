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

  function generateId() { return 'prod-' + String(Date.now()).slice(-6) + '-' + Math.random().toString(36).substr(2,4); }

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
    var panel = h('div', {className: 'admin-panel active'});

    // Header
    panel.appendChild(h('div', {style: {display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}, [
      h('div', {}, [
        h('h2', {style: {margin:0, padding:0, border:'none'}}, '📦 产品管理'),
        h('p', {style: {fontSize:'0.82rem', color:'var(--text-muted)', marginTop:'4px'}},
          '共 ' + products.length + ' 个产品 — 点击编号展开编辑')
      ]),
      h('button', {className: 'add-new-btn', onclick: function(){
        products.push({
          id: generateId(), name: '新产品 ' + (products.length+1), thumbnail: '', thumbnailVideo: '',
          shortDesc: '简短描述（≤20字）',
          details: { description: '详细描述', images: [], videos: [], specs: [] }
        });
        saveConfig(); renderProductsPanel(container);
      }}, '＋ 添加产品')
    ]));

    // Product list - clean table style
    if (products.length === 0) {
      panel.appendChild(h('p', {style: {color:'var(--text-muted)', padding:'40px', textAlign:'center'}},
        '暂无产品，点击上方按钮添加'));
    } else {
      var list = h('div', {});
      products.forEach(function(item, i) {
        list.appendChild(renderProductCard(item, i, products, container));
      });
      panel.appendChild(list);
    }

    container.appendChild(panel);
  }

  function renderProductCard(item, index, products, panelContainer) {
    var isExp = expandedItems[item.id] === true;
    var d = item.details || {};
    if (!item.details) item.details = { description:'', images:[], videos:[], specs:[] };

    var card = h('div', {
      className: 'card-section',
      style: {padding: '0', overflow: 'hidden', border: isExp ? '1px solid var(--accent)' : '1px solid var(--border)'}
    });

    // === Collapsed header bar ===
    var bar = h('div', {
      style: {
        display:'flex', alignItems:'center', padding:'12px 16px', cursor:'pointer',
        background: isExp ? 'var(--bg-elevated)' : 'var(--bg-card)',
        transition: 'background 0.2s'
      },
      onclick: function(){
        expandedItems[item.id] = !expandedItems[item.id];
        renderProductsPanel(panelContainer);
      }
    });

    // Number badge
    var numBadge = h('div', {
      style: {
        minWidth:'36px', height:'36px', borderRadius:'8px',
        background: isExp ? 'var(--accent)' : 'var(--bg-dark)',
        color: isExp ? '#fff' : 'var(--text-muted)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontWeight:'700', fontSize:'0.9rem', marginRight:'12px',
        border: '2px solid ' + (isExp ? 'var(--accent)' : 'var(--border)')
      }
    }, String(index+1));
    bar.appendChild(numBadge);

    // Thumbnail preview
    if (item.thumbnail) {
      bar.appendChild(h('img', {
        src: item.thumbnail, alt: '',
        style: {width:'48px', height:'36px', borderRadius:'4px', objectFit:'cover', marginRight:'10px', background:'var(--bg-dark)'}
      }));
    }

    // Name
    var infoDiv = h('div', {style: {flex:'1', minWidth:'0'}});
    infoDiv.appendChild(h('div', {style: {fontWeight:'600', color:'var(--text-primary)', fontSize:'0.88rem',
      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}},
      (item.name || '未命名产品')));
    infoDiv.appendChild(h('div', {style: {fontSize:'0.72rem', color:'var(--text-muted)', marginTop:'2px'}},
      'ID: ' + item.id + ' | 图:' + (item.thumbnail ? '✓' : '✗') + ' | 描述:' + (item.shortDesc ? '✓' : '✗')));
    bar.appendChild(infoDiv);

    // Expand icon
    bar.appendChild(h('span', {style: {color:'var(--text-muted)', marginLeft:'8px'}}, isExp ? '▲' : '▼'));

    // Action buttons
    var actionsDiv = h('div', {style: {display:'flex', gap:'4px', marginLeft:'6px'}});
    // Move up
    if (index > 0) {
      actionsDiv.appendChild(h('button', {
        className: 'btn-icon', title: '上移',
        style: {width:'28px', height:'28px', fontSize:'0.7rem'},
        onclick: function(e){ e.stopPropagation();
          var t=products[index]; products[index]=products[index-1]; products[index-1]=t;
          saveConfig(); renderProductsPanel(panelContainer); },
        innerHTML: '↑'
      }));
    }
    // Move down
    if (index < products.length-1) {
      actionsDiv.appendChild(h('button', {
        className: 'btn-icon', title: '下移',
        style: {width:'28px', height:'28px', fontSize:'0.7rem'},
        onclick: function(e){ e.stopPropagation();
          var t=products[index]; products[index]=products[index+1]; products[index+1]=t;
          saveConfig(); renderProductsPanel(panelContainer); },
        innerHTML: '↓'
      }));
    }
    // Delete
    var delBtn = h('button', {
      className: 'btn-icon danger', title: '删除',
      style: {width:'28px', height:'28px', fontSize:'0.7rem'},
      innerHTML: '✕'
    });
    var delClicked = false;
    delBtn.onclick = function(e) {
      e.stopPropagation();
      if (!delClicked) {
        delBtn.innerHTML = '‼';
        delBtn.style.background = 'var(--danger)';
        delBtn.style.color = '#fff';
        delClicked = true;
        setTimeout(function(){ delClicked = false; delBtn.innerHTML = '✕'; delBtn.style.background = ''; delBtn.style.color = ''; }, 2500);
      } else {
        if (confirm('确认删除产品 #' + (index+1) + '：「' + item.name + '」？')) {
          products.splice(index, 1);
          saveConfig();
          renderProductsPanel(panelContainer);
          toast('已删除产品 #' + (index+1));
        }
      }
    };
    actionsDiv.appendChild(delBtn);
    bar.appendChild(actionsDiv);

    card.appendChild(bar);

    // === Expanded edit form ===
    if (isExp) {
      var form = h('div', {style: {padding:'20px', background:'var(--bg-dark)', borderTop:'1px solid var(--border)'}});

      // -- Basic Info --
      form.appendChild(h('h4', {style: {color:'var(--accent-bright)', marginBottom:'12px', fontSize:'0.85rem'}}, '📌 基本信息'));

      form.appendChild(h('div', {className: 'form-row'}, [
        h('div', {className: 'form-group'}, [
          h('label', {}, '产品名称'),
          h('input', {type:'text', value: item.name, placeholder: '输入产品名称',
            oninput: function(e){ item.name=e.target.value; saveConfig(); }})
        ]),
        h('div', {className: 'form-group'}, [
          h('label', {}, '缩略图路径'),
          h('input', {type:'text', value: item.thumbnail||'', placeholder: 'images/601/01_xxx.png',
            oninput: function(e){ item.thumbnail=e.target.value; saveConfig(); }})
        ])
      ]));

      form.appendChild(h('div', {className: 'form-group'}, [
        h('label', {}, '简短描述（主页展示，≤20字）'),
        h('input', {type:'text', value: item.shortDesc||'', placeholder: '简要描述产品特点',
          oninput: function(e){ item.shortDesc=e.target.value; saveConfig(); }})
      ]));

      // -- Detail Section --
      form.appendChild(h('h4', {style: {color:'var(--accent-bright)', marginTop:'20px', marginBottom:'12px',
        fontSize:'0.85rem', borderTop:'1px solid var(--border)', paddingTop:'16px'}}, '📝 详情信息'));

      form.appendChild(h('div', {className: 'form-group'}, [
        h('label', {}, '完整描述'),
        h('textarea', {style: {minHeight:'100px'}, placeholder: '产品详细介绍，支持换行',
          oninput: function(e){ d.description=e.target.value; saveConfig(); }}, d.description||'')
      ]));

      // -- Specs --
      form.appendChild(h('div', {style: {marginBottom:'16px'}}, [
        h('div', {style: {display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px'}}, [
          h('label', {style: {margin:0}}, '📊 规格参数'),
          h('button', {className: 'btn btn-sm', style: {background:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--text-secondary)', padding:'4px 12px'}, onclick: function(){
            d.specs.push({name:'', value:''}); saveConfig(); renderProductsPanel(panelContainer);
          }}, '＋ 添加行')
        ]),
        h('div', {},
          (d.specs||[]).map(function(spec, si){
            return h('div', {className: 'spec-row', style: {marginBottom:'6px'}}, [
              h('input', {type:'text', value: spec.name, placeholder: '参数名', style: {flex:'1'},
                oninput: function(e){ spec.name=e.target.value; saveConfig(); }}),
              h('input', {type:'text', value: spec.value, placeholder: '参数值', style: {flex:'2'},
                oninput: function(e){ spec.value=e.target.value; saveConfig(); }}),
              h('button', {className: 'btn-icon danger', style: {flexShrink:0, width:'24px', height:'24px', fontSize:'0.65rem'}, onclick: function(){
                d.specs.splice(si,1); saveConfig(); renderProductsPanel(panelContainer);
              }, innerHTML: '✕'})
            ]);
          })
        ),
        (d.specs||[]).length === 0 ? h('p', {style: {fontSize:'0.78rem', color:'var(--text-muted)'}}, '暂无规格参数') : null
      ]));

      // -- Images --
      form.appendChild(h('div', {style: {marginBottom:'16px'}}, [
        h('div', {style: {display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px'}}, [
          h('label', {style: {margin:0}}, '🖼️ 详情图片'),
          h('button', {className: 'btn btn-sm', style: {background:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--text-secondary)', padding:'4px 12px'}, onclick: function(){
            if(!d.images) d.images=[]; d.images.push(''); saveConfig(); renderProductsPanel(panelContainer);
          }}, '＋ 添加图片')
        ]),
        h('div', {},
          (d.images||[]).map(function(url, i2){
            return h('div', {style: {display:'flex', gap:'8px', marginBottom:'6px', alignItems:'center'}}, [
              h('span', {style: {fontSize:'0.72rem', color:'var(--text-muted)', minWidth:'20px'}}, (i2+1)+'.'),
              h('input', {type:'text', value: url, placeholder: '图片URL', style: {flex:'1'},
                oninput: function(e){ d.images[i2]=e.target.value; saveConfig(); }}),
              url ? h('img', {src: url, alt:'', style: {width:'32px', height:'24px', borderRadius:'3px', objectFit:'cover', background:'var(--bg-dark)'}}) : null,
              h('button', {className: 'btn-icon danger', style: {width:'24px', height:'24px', fontSize:'0.65rem', flexShrink:0}, onclick: function(){
                d.images.splice(i2,1); saveConfig(); renderProductsPanel(panelContainer);
              }, innerHTML: '✕'})
            ]);
          })
        ),
        (d.images||[]).length === 0 ? h('p', {style: {fontSize:'0.78rem', color:'var(--text-muted)'}}, '暂无图片') : null
      ]));

      // -- Videos --
      form.appendChild(h('div', {}, [
        h('div', {style: {display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px'}}, [
          h('label', {style: {margin:0}}, '🎬 详情视频'),
          h('button', {className: 'btn btn-sm', style: {background:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--text-secondary)', padding:'4px 12px'}, onclick: function(){
            if(!d.videos) d.videos=[]; d.videos.push(''); saveConfig(); renderProductsPanel(panelContainer);
          }}, '＋ 添加视频')
        ]),
        h('div', {},
          (d.videos||[]).map(function(url, i2){
            return h('div', {style: {display:'flex', gap:'8px', marginBottom:'6px', alignItems:'center'}}, [
              h('span', {style: {fontSize:'0.72rem', color:'var(--text-muted)', minWidth:'20px'}}, (i2+1)+'.'),
              h('input', {type:'text', value: url, placeholder: '视频URL', style: {flex:'1'},
                oninput: function(e){ d.videos[i2]=e.target.value; saveConfig(); }}),
              h('button', {className: 'btn-icon danger', style: {width:'24px', height:'24px', fontSize:'0.65rem', flexShrink:0}, onclick: function(){
                d.videos.splice(i2,1); saveConfig(); renderProductsPanel(panelContainer);
              }, innerHTML: '✕'})
            ]);
          })
        ),
        (d.videos||[]).length === 0 ? h('p', {style: {fontSize:'0.78rem', color:'var(--text-muted)'}}, '暂无视频') : null
      ]));

      form.appendChild(h('div', {style: {marginTop:'24px', paddingTop:'16px', borderTop:'1px solid var(--border)'}}, [
        h('button', {className: 'btn btn-primary', style: {marginRight:'8px'}, onclick: function(){
          expandedItems[item.id] = false;
          saveConfig();
          renderProductsPanel(panelContainer);
          toast('✅ 产品 #' + (index+1) + ' 已保存');
        }}, '✅ 完成编辑'),
        h('span', {style: {fontSize:'0.75rem', color:'var(--text-muted)', marginLeft:'8px'}}, '按编号 ' + (index+1) + ' — ID: ' + item.id)
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
