/* Outpost Travel — presentation deck engine v2 (editorial).
   A deck page defines window.DECK = { brand, credits, slides:[...] } then loads this file.
   Slide types:
     cover, chapter, hero, tailor, quote, closing  — full-bleed photo
     spread   — photo panel + copy column (intro / day-by-day / pitch). imgs:[1-3], flip, wide, daynum, kicker, title, lead, body:[], ticks:[[b,t]], meta:[[k,v]], points:[[b,t]], cta
     mosaic   — cream-gutter photo grid, layouts m1–m7 (m1, m2, m3, m7 include a text cell)
     route    — map + overnight table (table:{head,rows}) or stop list
     price    — price panel + included / exclusions
     info     — headed text blocks, optional photo column
     stays    — hotel cards (items) or photo column + list (list)
     contents — tiles for every slide with a toc:{k,t,s}
   Any slide may carry sec:'Name' — the running head shows it (inherited until changed).
   Keys: ←/→ or space, Home/End, C = contents. ?clean hides chrome. #n jumps to slide n. Cmd+P = one slide per page. */
(function(){
  const D = window.DECK, root = document.getElementById('deck');
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  /* allow *italic* in titles */
  const rich = s => esc(s).replace(/\*([^*]+)\*/g,'<i>$1</i>');
  const img = (src, cls='bg', pos) => `<img class="${cls}" src="${esc(src)}" alt="" style="object-position:${pos||'center'}">`;
  const facts = f => f && f.length ? `<div class="facts">${f.map(x=>`<div class="${x[2]||''}"><span>${esc(x[0])}</span><b>${esc(x[1])}</b></div>`).join('')}</div>` : '';
  const norm = x => typeof x === 'string' ? {src:x} : x;
  const fig = (x,k) => { const o = norm(x);
    return `<figure class="f${k+1}"><img src="${esc(o.src)}" alt="${esc(o.cap||'')}" style="object-position:${o.pos||'center'}">${o.cap?`<figcaption>${esc(o.cap)}</figcaption>`:''}</figure>`; };
  const pics = (arr, cls='') => { const a = arr||[]; const n = a.length;
    return `<div class="pics ${n===2?(cls.includes('h')?'n2h':'n2'):n===3?'n3':''}">${a.map(fig).join('')}</div>`; };
  const paras = (b, lead) => `<div class="body">${lead?`<p class="lead">${esc(lead)}</p>`:''}${(b||[]).map(p=>`<p>${esc(p)}</p>`).join('')}</div>`;
  const ticks = t => t && t.length ? `<ul class="ticks">${t.map(x=>Array.isArray(x)?`<li><b>${esc(x[0])}</b> ${esc(x[1])}</li>`:`<li>${esc(x)}</li>`).join('')}</ul>` : '';
  const meta = m => m && m.length ? `<div class="meta">${m.map(x=>`<div><span>${esc(x[0])}</span><b>${esc(x[1])}</b></div>`).join('')}</div>` : '';
  const points = p => p && p.length ? `<ol class="points">${p.map(x=>`<li><div><b>${esc(x[0])}</b><p>${esc(x[1])}</p></div></li>`).join('')}</ol>` : '';
  const ul = a => `<ul>${(a||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
  const kick = (s, ink=true) => s ? `<div class="kicker${ink?' ink':''}">${esc(s)}</div>` : '';
  const head = s => `${s.daynum?`<div class="daynum">${esc(s.daynum)}</div>`:kick(s.kicker)}${s.title?`<h2>${rich(s.title)}</h2>`:''}`;
  const table = t => `<table class="tbl">${t.head?`<tr>${t.head.map(h=>`<th>${esc(h)}</th>`).join('')}</tr>`:''}${t.rows.map(r=>`<tr>${r.map((c,k)=>`<td class="${k===1?'pl':''}">${esc(c)}</td>`).join('')}</tr>`).join('')}</table>`;

  const R = {
    cover: s => `${img(s.img,'bg kb',s.pos)}<div class="shade cover"></div>
      <div class="over"><div class="kicker">${esc(s.kicker)}</div><h1>${rich(s.title)}</h1>${s.sub?`<p class="lede">${esc(s.sub)}</p>`:''}</div>`,
    chapter: s => `${img(s.img,'bg kb',s.pos)}<div class="shade left"></div>
      <div class="over"><div class="chapnum">${esc(s.num)}</div><h2>${rich(s.title)}</h2>${s.sub?`<p class="lede">${esc(s.sub)}</p>`:''}</div>`,
    hero: s => `${img(s.img,'bg kb',s.pos)}<div class="shade"></div>
      <div class="over"><div class="kicker">${esc(s.kicker)}</div><h1>${rich(s.title)}</h1>${s.tagline?`<p class="lede">${esc(s.tagline)}</p>`:''}${facts(s.facts)}</div>`,
    tailor: s => `${img(s.img,'bg kb',s.pos)}<div class="shade"></div>
      <div class="over tm"><div class="kicker">${esc(s.kicker||'Tailor-made')}</div><h1>${rich(s.title)}</h1>${s.tagline?`<p class="lede">${esc(s.tagline)}</p>`:''}<div class="ribbon">${esc(s.note||'Details & price on request')}</div></div>`,
    quote: s => `${img(s.img,'bg kb',s.pos)}<div class="shade soft"></div><div class="quote"><div><blockquote>${esc(s.text)}</blockquote>${s.cite?`<cite>${esc(s.cite)}</cite>`:''}</div></div>`,
    spread: s => `<div class="spread${s.flip?' flip':''}${s.wide?' wide':''}">${pics(s.imgs, s.split||'')}
      <div class="copy">${head(s)}${paras(s.body, s.lead)}${ticks(s.ticks)}${points(s.points)}${meta(s.meta)}${s.cta?`<div class="cta">${esc(s.cta)}</div>`:''}</div></div>`,
    mosaic: s => { const L = s.layout||'m1', withT = /m[1237]/.test(L);
      return `<div class="mos ${L}">${withT?`<div class="t">${head(s)}${s.text?`<p>${esc(s.text)}</p>`:''}</div>`:''}${s.imgs.map(fig).join('')}</div>`; },
    route: (s,i) => `<div class="route"><div class="map"><div class="ml" id="map${i}"></div></div>
      <div class="side">${kick(s.kicker||'The route')}<h2>${rich(s.title)}</h2>${s.sub?`<p class="sub">${esc(s.sub)}</p>`:''}
      ${s.table ? table(s.table) : `<ol class="stops${s.stops.filter(p=>!p.hide).length>7?' compact':''}">${(c=>s.stops.filter(p=>!p.hide).map(p=>`<li data-n="${p.pass?'·':esc(p.n ?? ++c)}" class="${p.pass?'x':''}"><b>${esc(p.name)}</b>${p.nights?`<em>${esc(p.nights)}</em>`:''}${p.note?`<p>${esc(p.note)}</p>`:''}</li>`).join(''))(0)}</ol>`}</div></div>`,
    price: s => `<div class="price"><div class="pbox">${kick(s.kicker||'Price & inclusions',false)}<h2>${rich(s.title)}</h2>
      <div class="from">${esc(s.fromLabel||'From')}</div><div class="amt">${esc(s.price)}</div><div class="per">${esc(s.per||'')}</div>
      ${(s.meta||[]).length?`<dl>${s.meta.map(m=>`<dt>${esc(m[0])}</dt><dd>${esc(m[1])}</dd>`).join('')}</dl>`:''}</div>
      <div class="lists"><div class="cols"><div><h4>Included</h4>${ul(s.inc)}</div><div><h4>Exclusions</h4>${ul(s.exc)}</div></div>
      ${s.extras?`<div class="extras"><b>On request</b>${esc(s.extras)}</div>`:''}${s.fine?`<p class="fine">${esc(s.fine)}</p>`:''}</div></div>`,
    info: s => `<div class="info${s.imgs?'':' noimg'}">${s.imgs?pics(s.imgs):''}<div class="pad">${head(s)}
      <div class="cols ${s.blocks.length>2?'c3':''}">${s.blocks.map(b=>`<div><h4>${esc(b.h)}</h4>${b.p?(Array.isArray(b.p)?b.p:[b.p]).map(x=>`<p>${esc(x)}</p>`).join(''):''}${b.list?ul(b.list):''}</div>`).join('')}</div>
      ${s.fine?`<p class="fine">${esc(s.fine)}</p>`:''}</div></div>`,
    stays: s => s.list
      ? `<div class="hlist">${pics(s.imgs)}<div class="pad">${head(s)}${table({head:s.head||['Nights','Hotel','Where'],rows:s.list})}${s.fine?`<p class="fine">${esc(s.fine)}</p>`:''}</div></div>`
      : `<div class="pad">${head(s)}<div class="stays">${s.items.map(x=>`<figure>${x.img?`<img src="${esc(x.img)}" alt="${esc(x.name)}" style="object-position:${x.pos||'center'}">`:''}<div class="cap"><b>${esc(x.name)}</b><span>${esc(x.place)}</span>${x.note?`<p>${esc(x.note)}</p>`:''}</div></figure>`).join('')}</div></div>`,
    contents: s => `<div class="pad"><div class="intro-row"><div>${kick(s.kicker||'The collection')}<h2>${rich(s.title||'Contents')}</h2></div>${s.text?`<p>${esc(s.text)}</p>`:''}</div><div class="toc">${
      D.slides.map((x,k)=>x.toc?`<a data-go="${k}"><img src="${esc(x.toc.img||x.img)}" alt=""><div><b>${esc(x.toc.t)}</b><span>${esc(x.toc.s||'')}</span></div></a>`:'').join('')}</div></div>`,
    closing: s => `${s.img?img(s.img,'bg kb',s.pos)+'<div class="shade" style="background:rgba(10,20,12,.55)"></div>':''}
      <div class="closing"><div><a href="${esc(D.url||'https://outposttravel.co')}" target="_blank" rel="noopener" style="display:block;color:inherit;text-decoration:none;font-family:var(--serif);font-size:15px;letter-spacing:.3em;text-transform:uppercase;margin-bottom:30px">${esc(D.brand||'Outpost Travel')}</a><h2>${rich(s.title)}</h2>${s.text?`<p class="lede">${esc(s.text)}</p>`:''}${s.contact?`<div class="contact">${esc(s.contact)}</div>`:''}</div></div>
      ${s.credits?`<div class="credits">${esc(s.credits)}</div>`:''}`
  };
  R.gallery = R.mosaic;

  /* running head per layout: [brand, folio] → 1 ink (on cream) · 0 white (on photo) · -1 hidden; 'L' = folio sits left */
  const MOS = {m1:[1,0],m2:[-1,1],m3:[0,0],m4:[0,0],m5:[0,0],m6:[0,0],m7:[1,0]};
  function inks(s){
    switch(s.type){
      case 'spread': return s.flip?[-1,1,'L']:[-1,1];
      case 'route': return [1,1];
      case 'price': return [0,1];
      case 'info': return s.imgs?[-1,1]:[1,1];
      case 'stays': return s.list?[-1,1]:[1,1];
      case 'contents': return [1,1];
      case 'mosaic': case 'gallery': return MOS[s.layout||'m1']||[0,0];
      default: return [0,0];
    }
  }
  let sec = '';
  const total = D.slides.length;
  root.innerHTML = D.slides.map((s,i)=>{
    if (s.sec !== undefined) sec = s.sec;
    const [bi,fi,side] = inks(s), chrome = !['cover','closing'].includes(s.type);
    const run = !chrome ? '' :
      (bi<0?'':`<a class="brand${bi?' ink':''}" href="${esc(D.url||'https://outposttravel.co')}" target="_blank" rel="noopener">${esc(D.brand||'Outpost Travel')}</a>`) +
      (fi<0?'':`<div class="folio${fi?' ink':''}${side==='L'?' left':''}">${sec?`<span>${esc(sec)}</span>`:''}<b>${String(i+1).padStart(2,'0')}</b></div>`);
    return `<section class="slide ${s.type==='closing'?'dark':''}" data-i="${i}">${R[s.type](s,i)}${run}</section>`;
  }).join('');
  const slides = [...root.children];
  document.body.insertAdjacentHTML('beforeend',
    `<button class="tocpill" aria-label="Back to contents" title="Contents (C)">C</button><div class="ui"><button aria-label="Previous" data-d="-1">‹</button><span class="count"></span><button aria-label="Next" data-d="1">›</button></div><div class="bar"></div><div class="hint">← → to navigate${D.slides.some(x=>x.type==='contents')?' · C for contents':''}</div>`);
  if (!D.slides.some(x=>x.type==='contents')) document.querySelector('.tocpill').remove();
  else document.querySelector('.tocpill').addEventListener('click',()=>go(D.slides.findIndex(x=>x.type==='contents')));
  const count = document.querySelector('.ui .count'), bar = document.querySelector('.bar');
  let cur = -1;
  const maps = {};

  function go(n){
    n = Math.max(0, Math.min(slides.length-1, n));
    if (n === cur) return;
    if (cur >= 0) slides[cur].classList.remove('on');
    slides[n].classList.add('on'); cur = n;
    count.textContent = `${String(n+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`;
    bar.style.width = ((n+1)/total*100)+'%';
    { const tp=document.querySelector('.tocpill'); if (tp) tp.classList.toggle('show', n>=2); }
    history.replaceState(null,'',location.search+'#'+(n+1));
    if (D.slides[n].type==='route') buildMap(n);
    [n+1,n+2].forEach(k=>slides[k]&&slides[k].querySelectorAll('img').forEach(im=>im.decode&&im.decode().catch(()=>{})));
  }

  function buildMap(i){
    const s = D.slides[i], el = document.getElementById('map'+i);
    if (maps[i]) { maps[i].resize(); return; }
    if (!window.maplibregl) { el.innerHTML = '<div class="mapfail">Map needs an internet connection</div>'; return; }
    const map = new maplibregl.Map({ container: el, attributionControl: {compact:true}, interactive: true,
      canvasContextAttributes:{preserveDrawingBuffer:true}, preserveDrawingBuffer:true, pixelRatio: Math.max(2, window.devicePixelRatio||1),
      style: { version: 8, sources: { base: { type:'raster', tileSize:256, maxzoom:16,
        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'],
        attribution: 'Tiles © Esri' } },
        layers: [{ id:'base', type:'raster', source:'base' }] },
      center: [s.stops[0].lng, s.stops[0].lat], zoom: 4 });
    maps[i] = map;
    map.scrollZoom.disable();
    const coords = s.stops.map(p=>[p.lng,p.lat]);
    const NS='http://www.w3.org/2000/svg', svg=document.createElementNS(NS,'svg'), pl=document.createElementNS(NS,'polyline');
    svg.setAttribute('style','position:absolute;inset:0;width:100%;height:100%;pointer-events:none');
    pl.setAttribute('fill','none'); pl.setAttribute('stroke','#14301A'); pl.setAttribute('stroke-width','2.2');
    pl.setAttribute('stroke-dasharray','7 5'); pl.setAttribute('stroke-linejoin','round'); pl.setAttribute('opacity','.85');
    svg.appendChild(pl); { const cc=map.getCanvasContainer(); cc.insertBefore(svg, map.getCanvas().nextSibling); }
    const draw = () => pl.setAttribute('points', coords.map(c=>{ const q=map.project(c); return q.x.toFixed(1)+','+q.y.toFixed(1); }).join(' '));
    map.on('move', draw); map.on('resize', draw); map.on('render', draw);
    const seen = {}; let n = 0;
    s.stops.forEach(p=>{
      const key = p.lat+','+p.lng;
      if (!p.pass) n++;
      if (seen[key] || p.hide) return; seen[key] = 1;
      const m = document.createElement('div'); m.className = 'pin'+(p.pass?' x':''); m.textContent = p.pass ? '' : (p.n ?? n);
      if (p.pass) { m.style.width = m.style.height = '12px'; }
      new maplibregl.Marker({element:m}).setLngLat([p.lng,p.lat]).addTo(map);
      if (p.nolabel) return;
      const l = document.createElement('div'); l.className='maplabel'; l.textContent = p.label || p.name;
      const side = p.side || 'top';
      const A = {top:['bottom',[0,p.pass?4:-2]], bottom:['top',[0,42]], left:['right',[-17,24]], right:['left',[17,24]]}[side];
      new maplibregl.Marker({element:l, anchor:A[0], offset:A[1]}).setLngLat([p.lng,p.lat]).addTo(map);
    });
    const b = coords.reduce((bb,c)=>bb.extend(c), new maplibregl.LngLatBounds(coords[0],coords[0]));
    map.fitBounds(b,{padding:s.pad||{top:70,bottom:50,left:70,right:70},duration:0,maxZoom:s.maxZoom||8});
    draw();
  }

  document.addEventListener('keydown', e=>{
    if (['ArrowRight','PageDown',' '].includes(e.key)) { e.preventDefault(); go(cur+1); }
    else if (['ArrowLeft','PageUp'].includes(e.key)) { e.preventDefault(); go(cur-1); }
    else if (e.key==='Home') go(0); else if (e.key==='End') go(slides.length-1);
    else if (e.key==='c' || e.key==='C') { const k = D.slides.findIndex(x=>x.type==='contents'); if (k>=0) go(k); }
  });
  document.querySelector('.ui').addEventListener('click', e=>{ const b=e.target.closest('button'); if(b) go(cur+ +b.dataset.d); });
  root.addEventListener('click', e=>{
    const a = e.target.closest('[data-go]'); if (a) { go(+a.dataset.go); return; }
    if (e.target.closest('.map,.ui,.tocpill,a,button,.copy,.pad,.lists,.side')) return;
    go(cur + (e.clientX > innerWidth*0.3 ? 1 : -1));
  });
  let tx=null, ty=null;
  root.addEventListener('touchstart', e=>{ tx=e.touches[0].clientX; ty=e.touches[0].clientY; }, {passive:true});
  root.addEventListener('touchend', e=>{ if(tx===null) return; const dx=e.changedTouches[0].clientX-tx, dy=e.changedTouches[0].clientY-ty;
    if (Math.abs(dx)>50 && Math.abs(dx)>Math.abs(dy) && !e.target.closest('.map')) go(cur+(dx<0?1:-1)); tx=null; }, {passive:true});
  setTimeout(()=>{ const h=document.querySelector('.hint'); if(h) h.style.opacity=0; }, 6000);

  window.addEventListener('beforeprint', ()=>{ D.slides.forEach((s,i)=>{ if(s.type==='route') buildMap(i); }); });
  if (/[?&]clean/.test(location.search)) document.querySelectorAll('.ui,.bar,.hint,.tocpill').forEach(e=>e.style.display='none');
  go((parseInt(location.hash.slice(1))||1)-1);
})();
