(function () {
  var P = window.PROJECT;
  if (!P) return;
  document.documentElement.classList.add('js');

  var STATUS = { done: 'Done', now: 'In progress', next: 'Ahead', later: 'Later' };
  var TAG = { mine: 'My idea', override: 'Against the recommendation', choice: 'My choice', accepted: 'Took the recommendation' };

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function recLine(path) {
    var inner = '<code>' + esc(path) + '</code>';
    if (P.REPO) inner = '<a href="' + esc(P.REPO.replace(/\/$/, '') + '/blob/main/' + path) + '" target="_blank" rel="noopener">' + inner + '</a>';
    return '<p class="rec">Record: ' + inner + '</p>';
  }

  // Four structures, drawn in the site palette
  function topoSVG() {
    function sub(x, y, t, b) { return '<rect class="sub' + (b ? ' b' : '') + '" x="' + (x - 12) + '" y="' + (y - 8) + '" width="24" height="16"/><text x="' + x + '" y="' + y + '">' + t + '</text>'; }
    function ld(x, y, t) { return '<circle class="ld" cx="' + x + '" cy="' + y + '" r="9"/><text x="' + x + '" y="' + y + '" style="font-size:8px">' + t + '</text>'; }
    function ln(a, b, c, d, cls) { return '<line class="' + (cls || 'ln') + '" x1="' + a + '" y1="' + b + '" x2="' + c + '" y2="' + d + '"/>'; }
    var panels = [
      { cap: '1 Radial + single', s: 'Baseline: one line outage cuts supply', base: true,
        g: ln(22, 14, 98, 14, 'ex') + ln(14, 14, 14, 70) + sub(14, 14, 'SA') + sub(106, 14, 'SB', 1) + ld(14, 72, 'C') },
      { cap: '2 Radial + dual', s: 'Two substations feed one campus bus',
        g: ln(22, 14, 98, 14, 'ex') + ln(14, 14, 60, 72) + ln(106, 14, 60, 72) + sub(14, 14, 'SA') + sub(106, 14, 'SB', 1) + ld(60, 72, 'C') },
      { cap: '3 Ring + single', s: 'Closed loop from one substation',
        g: ln(22, 14, 98, 14, 'ex') + ln(14, 14, 40, 72) + ln(14, 14, 82, 72) + ln(40, 72, 82, 72) + sub(14, 14, 'SA') + sub(106, 14, 'SB', 1) + ld(40, 72, 'M2') + ld(82, 72, 'M3') },
      { cap: '4 Ring + dual', s: 'Loop closed by the existing line',
        g: ln(14, 14, 106, 14) + ln(14, 14, 38, 72) + ln(106, 14, 82, 72) + ln(38, 72, 82, 72) + sub(14, 14, 'SA') + sub(106, 14, 'SB', 1) + ld(38, 72, 'M2') + ld(82, 72, 'M3') }
    ];
    return '<div class="topo">' + panels.map(function (p) {
      return '<figure' + (p.base ? ' class="base"' : '') + '><svg viewBox="0 0 120 86" role="img" aria-label="' + esc(p.cap) + '">' + p.g + '</svg><figcaption>' + esc(p.cap) + '<span>' + esc(p.s) + '</span></figcaption></figure>';
    }).join('') + '</div><p class="rec">SA, SB: 154 kV substations. Dashed: existing line, not part of the campus supply. Also tested: a T-tap variant of each, where the campus taps the existing line midway.</p>';
  }

  function card(id) {
    var d = P.decisions[id];
    if (!d) return '';
    var shown = id.replace(/F$/, ' follow-up');
    return '<article class="dcard ' + d.tag + '"><div class="dc-head"><span class="dc-id">' + esc(shown) + '</span><span class="dc-title">' + esc(d.title) + '</span><span class="tg ' + d.tag + '">' + TAG[d.tag] + '</span></div>' +
      '<p class="dc-q">' + esc(d.q) + '</p>' +
      '<ul class="dc-opts">' + d.options.map(function (o) { return '<li' + (o[1] ? ' class="on"' : '') + '>' + esc(o[0]) + '</li>'; }).join('') + '</ul>' +
      '<p class="dc-why">' + esc(d.why) + '</p><p class="dc-who">' + esc(d.who) + '</p></article>';
  }

  // ---- Render stations ----
  var host = document.getElementById('stations');
  var num = 0, html = '';
  P.stations.forEach(function (s, si) {
    var label = s.id === 'pilot' ? 'P' : String(++num);
    html += '<section class="stn ' + s.status + '" id="st-' + s.id + '" data-i="' + si + '">' +
      '<span class="stn-dot" aria-hidden="true">' + label + '</span><div class="stn-head">' +
      (s.status === 'now' ? '<span class="here-pin">You are here</span>' : '') +
      '<p class="stn-when">' + esc(s.when) + '<span class="st">' + STATUS[s.status] + '</span></p>' +
      '<h2 class="stn-title">' + esc(s.title) + '</h2><p class="stn-sub">' + esc(s.sub) + '</p></div>';
    if (s.steps && s.steps.length) {
      html += '<div class="stn-card"><ol class="steps">';
      s.steps.forEach(function (st, k) {
        var dec = st.decisions || [];
        var has = dec.length || st.predictions || st.diagram || st.record;
        var did = 'd-' + s.id + '-' + k;
        var inner = '';
        if (st.diagram) inner += topoSVG();
        if (st.predictions) inner += '<ol class="preds">' + st.predictions.map(function (p) { return '<li>' + esc(p) + '<span class="score">to be scored</span></li>'; }).join('') + '</ol>';
        if (st.record) inner += recLine(st.record);
        if (dec.length) inner += '<div class="dcards">' + dec.map(card).join('') + '</div>';
        var more = dec.length ? dec.length + (dec.length > 1 ? ' decisions' : ' decision') : 'Details';
        html += '<li class="step' + (has ? '' : ' static') + '">' +
          '<button type="button" class="step-btn"' + (has ? ' aria-expanded="false" aria-controls="' + did + '"' : ' tabindex="-1" aria-disabled="true"') + '>' +
          '<span class="step-t">' + esc(st.title) + '</span><span class="step-x">' + esc(st.text) + '</span>' +
          (has ? '<span class="step-more"><span class="lbl">' + more + '</span><span class="pm" aria-hidden="true"></span></span>' : '') +
          '</button>' + (has ? '<div class="drawer" id="' + did + '"><div><div class="drawer-in">' + inner + '</div></div></div>' : '') + '</li>';
      });
      html += '</ol></div>';
    }
    html += '</section>';
  });
  host.innerHTML = html;

  // ---- Status board ----
  var now = P.stations.filter(function (s) { return s.status === 'now'; })[0];
  var nextSt = P.stations.filter(function (s) { return s.status === 'next'; })[0];
  var doneN = P.stations.filter(function (s) { return s.status === 'done'; }).length;
  var decN = P.decisionCount || Object.keys(P.decisions).length;
  document.getElementById('pjStatus').textContent = 'In progress · updated ' + P.updated;
  document.getElementById('pjBoard').innerHTML =
    '<div class="here"><dt>You are here</dt><dd>' + esc(now ? now.title : '') + '<small>' + esc(now ? now.sub : '') + '</small></dd></div>' +
    '<div><dt>Stops done</dt><dd><span class="big">' + doneN + '/' + P.stations.length + '</span>Design locked</dd></div>' +
    '<div><dt>Decisions logged</dt><dd><span class="big">' + decN + '</span><small>Options, who proposed them, and why</small></dd></div>' +
    '<div><dt>Next stop</dt><dd>' + esc(nextSt ? nextSt.title : '') + '<small>' + esc(nextSt ? nextSt.when : '') + '. No results yet.</small></dd></div>';

  // ---- Trip bar ----
  var dots = document.getElementById('tripDots');
  dots.innerHTML = P.stations.map(function (s) {
    return '<li class="' + s.status + '"><a href="#st-' + s.id + '" aria-label="' + esc(s.title) + ' (' + STATUS[s.status] + ')" title="' + esc(s.title) + '"></a></li>';
  }).join('');
  var dotLis = dots.querySelectorAll('li');
  var tripNow = document.getElementById('tripNow');

  // ---- Drawers ----
  function setOpen(li, open) {
    var b = li.querySelector('.step-btn');
    if (!b || li.classList.contains('static')) return;
    li.classList.toggle('open', open);
    b.setAttribute('aria-expanded', String(open));
  }
  host.addEventListener('click', function (e) {
    var b = e.target.closest('.step-btn');
    if (!b) return;
    var li = b.parentNode;
    setOpen(li, !li.classList.contains('open'));
  });
  document.getElementById('openAll').addEventListener('click', function () { host.querySelectorAll('.step').forEach(function (l) { setOpen(l, true); }); });
  document.getElementById('closeAll').addEventListener('click', function () { host.querySelectorAll('.step').forEach(function (l) { setOpen(l, false); }); });

  // ---- Route geometry and scroll ----
  var route = document.getElementById('route');
  var base = route.querySelector('.rt-base');
  var done = document.getElementById('rtDone');
  var trail = document.getElementById('rtTrail');
  var puck = document.getElementById('rtPuck');
  var stns = Array.prototype.slice.call(host.querySelectorAll('.stn'));
  var flag = route.querySelector('.rt-end .flag');
  var TOP = 56, geo = { end: 0, now: 0, centers: [] };

  function centerOf(el) {
    var r = el.getBoundingClientRect(), rr = route.getBoundingClientRect();
    return r.top + r.height / 2 - rr.top;
  }
  function measure() {
    var hdr = document.querySelector('.top');
    if (hdr) document.documentElement.style.setProperty('--hdr', hdr.offsetHeight + 'px');
    geo.centers = stns.map(function (s) { return centerOf(s.querySelector('.stn-dot')); });
    geo.end = centerOf(flag);
    var nowEl = route.querySelector('.stn.now .stn-dot');
    geo.now = nowEl ? centerOf(nowEl) : TOP;
    base.style.height = Math.max(0, geo.end - TOP) + 'px';
    done.style.height = Math.max(0, geo.now - TOP) + 'px';
    update();
  }
  var ticking = false;
  function update() {
    ticking = false;
    var rr = route.getBoundingClientRect();
    var y = window.innerHeight * 0.42 - rr.top;
    var p = Math.min(Math.max(y, TOP), geo.end);
    trail.style.height = (p - TOP) + 'px';
    puck.style.transform = 'translateY(' + (p - TOP) + 'px)';
    var reading = -1;
    stns.forEach(function (s, i) {
      var passed = geo.centers[i] <= p + 2;
      s.classList.toggle('passed', passed);
      if (passed) reading = i;
    });
    stns.forEach(function (s, i) { s.classList.toggle('reading', i === reading); });
    dotLis.forEach(function (d, i) { d.classList.toggle('reading', i === reading); });
    tripNow.textContent = reading < 0 ? 'Overview' : P.stations[reading].title;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', measure);
  if ('ResizeObserver' in window) new ResizeObserver(function () { measure(); }).observe(host);
  else host.addEventListener('transitionend', measure);
  window.addEventListener('load', measure);
  measure();

  // ---- Reveal stations as they come into view ----
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('seen'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px' });
    stns.forEach(function (s) { io.observe(s); });
  } else stns.forEach(function (s) { s.classList.add('seen'); });
})();
