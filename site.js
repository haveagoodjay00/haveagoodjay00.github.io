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
})();
