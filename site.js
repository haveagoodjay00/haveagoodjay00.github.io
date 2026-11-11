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
})();
