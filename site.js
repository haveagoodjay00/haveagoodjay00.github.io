(function () {
  var root = document.documentElement;
  var buttons = document.querySelectorAll('.lang button');

  // Language: remembered across pages
  function setLang(lang, remember) {
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang);
    var title = document.body.getAttribute('data-title-' + lang);
    if (title) document.title = title;
    buttons.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-set') === lang));
    });
    if (remember) { try { localStorage.setItem('lang', lang); } catch (e) {} }
  }
  var saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  setLang(saved || ((navigator.language || '').toLowerCase().indexOf('ko') === 0 ? 'ko' : 'en'), false);
  buttons.forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-set'), true); });
  });

  // Chart tooltips: hover, tap or keyboard focus on a point
  var tip = document.getElementById('tip');
  function show(el) {
    var lang = root.getAttribute('data-lang');
    tip.textContent = el.getAttribute('data-tip-' + lang) || el.getAttribute('data-tip-en');
    tip.hidden = false;
    var r = el.getBoundingClientRect();
    var w = tip.offsetWidth, h = tip.offsetHeight;
    var x = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), window.innerWidth - w - 8);
    var y = r.top - h - 6;
    if (y < 8) y = r.bottom + 6;
    tip.style.left = x + 'px';
    tip.style.top = y + 'px';
  }
  function hide() { tip.hidden = true; }
  document.querySelectorAll('.chart .hit').forEach(function (el) {
    el.addEventListener('mouseenter', function () { show(el); });
    el.addEventListener('mouseleave', hide);
    el.addEventListener('focus', function () { show(el); });
    el.addEventListener('blur', hide);
    el.addEventListener('click', function () { show(el); });
  });
  window.addEventListener('scroll', hide, { passive: true });

  // Floating scroll buttons: top hides at the top, bottom hides at the bottom
  var box = document.createElement('div');
  box.className = 'scrollbtns';
  box.innerHTML = '<button type="button" class="up" aria-label="Scroll to top" title="Top">\u2191</button>' +
                  '<button type="button" class="down" aria-label="Scroll to bottom" title="Bottom">\u2193</button>';
  document.body.appendChild(box);
  var up = box.querySelector('.up'), down = box.querySelector('.down');
  var smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto';
  up.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: smooth }); });
  down.addEventListener('click', function () { window.scrollTo({ top: document.documentElement.scrollHeight, behavior: smooth }); });
  function updateBtns() {
    var y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
    up.hidden = y < 40;
    down.hidden = y > max - 40;
    box.hidden = max < 200;
  }
  window.addEventListener('scroll', updateBtns, { passive: true });
  window.addEventListener('resize', updateBtns);
  document.addEventListener('toggle', updateBtns, true);
  updateBtns();

  // Section rail (research page): stage blocks, sub-sections, scroll-spy
  (function () {
    var stages = document.querySelectorAll('.stage[data-stage]');
    if (!stages.length) { genericRail(); return; }
    function label(el, short) {
      var h = el.querySelector('h2');
      var txt = h ? h.textContent.replace(/\s+/g, ' ').trim() : '';
      if (short) txt = txt.split(':')[0];
      return txt;
    }
    var entries = [];   // {el, li, stage, sub}
    var nav = document.createElement('nav');
    nav.className = 'rail';
    nav.setAttribute('aria-label', 'Sections on this page');
    var ul = document.createElement('ul');
    nav.appendChild(ul);
    function mk(el, text, cls, parentUl) {
      var li = document.createElement('li');
      li.className = cls;
      var a = document.createElement('a');
      a.href = '#' + el.id;
      a.innerHTML = '<span class="lbl"></span><span class="dot"></span>';
      a.querySelector('.lbl').textContent = text;
      li.appendChild(a);
      parentUl.appendChild(li);
      return li;
    }
    function plain(id) {
      var el = document.getElementById(id);
      if (!el) return;
      entries.push({ el: el, li: mk(el, label(el), 'l1', ul), stage: null, sub: false });
    }
    plain('motivation');
    plain('roadmap');
    stages.forEach(function (st) {
      var li = mk(st, 'Stage ' + st.getAttribute('data-stage'), 'l1 stagehead', ul);
      var subUl = document.createElement('ul');
      subUl.className = 'sub';
      li.appendChild(subUl);
      var rec = { el: st, li: li, stage: st, sub: false };
      entries.push(rec);
      st.querySelectorAll('.section[id]').forEach(function (sec) {
        entries.push({ el: sec, li: mk(sec, label(sec, true), 'l2', subUl), stage: st, sub: true });
      });
    });
    plain('glossary');
    document.body.appendChild(nav);

    var ticking = false;
    function update() {
      ticking = false;
      var y = window.scrollY;
      nav.classList.toggle('show', y > 160);
      var line = window.innerHeight * 0.35, cur = null;
      entries.forEach(function (e) {
        if (e.el.getBoundingClientRect().top <= line) cur = e;
      });
      var activeStage = cur && cur.stage ? cur.stage : null;
      entries.forEach(function (e) {
        e.li.classList.toggle('on', e === cur);
        if (!e.sub && e.stage) e.li.classList.toggle('open', e.stage === activeStage);
      });
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    document.addEventListener('toggle', update, true);
    update();
  })();

  // Section rail for the other pages: top-level sections (or items) with headings
  function genericRail() {
    var main = document.querySelector('main');
    if (!main) return;
    var targets = [];
    var hero = document.getElementById('hero');
    if (hero) targets.push({ el: hero, text: 'Top' });
    main.querySelectorAll(':scope > section.section, :scope > .section').forEach(function (sec) {
      var h = sec.querySelector('h2');
      if (h) targets.push({ el: sec, text: h.textContent.replace(/\s+/g, ' ').trim() });
    });
    var items = main.querySelectorAll('.item h3');
    if (targets.length < 3 && items.length >= 2) {
      targets = [];
      items.forEach(function (h) {
        targets.push({ el: h.closest('.item'), text: h.textContent.split(',')[0].trim() });
      });
    }
    if (targets.length < 2) return;
    var nav = document.createElement('nav');
    nav.className = 'rail';
    nav.setAttribute('aria-label', 'Sections on this page');
    var ul = document.createElement('ul');
    nav.appendChild(ul);
    var entries = [];
    targets.forEach(function (t, i) {
      if (!t.el.id) t.el.id = 'sec-' + (i + 1);
      t.el.style.scrollMarginTop = '96px';
      var li = document.createElement('li');
      li.className = 'l1';
      var a = document.createElement('a');
      a.href = '#' + t.el.id;
      a.innerHTML = '<span class="lbl"></span><span class="dot"></span>';
      a.querySelector('.lbl').textContent = t.text;
      li.appendChild(a); ul.appendChild(li);
      entries.push({ el: t.el, li: li });
    });
    document.body.appendChild(nav);
    var ticking = false;
    function update() {
      ticking = false;
      nav.classList.toggle('show', window.scrollY > 160 || !hero);
      var line = window.innerHeight * 0.35, cur = entries[0];
      entries.forEach(function (e) { if (e.el.getBoundingClientRect().top <= line) cur = e; });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = entries[entries.length - 1];
      entries.forEach(function (e) { e.li.classList.toggle('on', e === cur); });
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }
})();
