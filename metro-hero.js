// Home hero: the Seoul metropolitan area as a tilted 3D map.
// Each column is a 345 kV substation from KEPCO's public supply-headroom page (Nov 2026):
// height = capacity, fill = KEPCO's load forecast, red cap = 0 MW headroom offered.
// Data center modules (20 MW) then connect where headroom is left, until none is.
// Station positions are approximate (weighted centre of the districts each one serves).
(function () {
  var host = document.getElementById('mx-scene');
  var DATA = window.METRO_HERO_DATA;
  if (!host || !DATA) return;

  var MOD = 20;                       // MW per data center module
  var YAW = -0.18, GF = 0.56;         // map rotation (rad) and ground foreshortening
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  host.appendChild(canvas);
  var tip = document.createElement('div');
  tip.className = 'mx-tip'; tip.hidden = true;
  host.appendChild(tip);

  var st = DATA.stations.map(function (s) {
    return { name: s[0], cap: s[1], fcst: s[2], head: s[3], x: s[4], y: s[5], peak: s[6], newld: s[7] };
  });
  var target = st.filter(function (s) { return s.head > 0; })[0];
  var fits = target ? Math.floor(target.head / MOD) : 0;
  var totalHead = st.reduce(function (a, s) { return a + s.head; }, 0);
  var zeroCount = st.filter(function (s) { return s.head === 0; }).length;

  var CY = Math.cos(YAW), SY = Math.sin(YAW);
  function rot(x, y) { return [x * CY - y * SY, x * SY + y * CY]; }

  var W = 0, H = 0, DPR = 1, K = 1, OX = 0, OY = 0, HS = 0, RX = 6, mapLayer = null;

  function P(x, y, z) { var r = rot(x, y); return [OX + K * r[0], OY - K * r[1] * GF - (z || 0), r[1]]; }

  // ---------- layout ----------
  function layout() {
    var rect = host.getBoundingClientRect();
    W = Math.max(320, rect.width); H = Math.max(300, rect.height);
    DPR = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';

    var wide = W > 900;
    // ground bbox in rotated, foreshortened km
    var b = [1e9, 1e9, -1e9, -1e9];
    DATA.districts.forEach(function (d) {
      d[4].forEach(function (r) {
        for (var i = 0; i < r.length; i += 2) {
          var p = rot(r[i], r[i + 1]); var sx = p[0], sy = -p[1] * GF;
          if (sx < b[0]) b[0] = sx; if (sy < b[1]) b[1] = sy; if (sx > b[2]) b[2] = sx; if (sy > b[3]) b[3] = sy;
        }
      });
    });
    var box = wide ? { l: W * 0.14, r: W * 0.80, t: 130, b: H - 26 } : { l: 14, r: W - 14, t: 40, b: H - 14 };
    var bw = b[2] - b[0], bh = b[3] - b[1];
    // leave room above the map for the tallest column (scales with K)
    var hsPerK = 0.0068;               // px per MW per (px/km)
    var tallest = 0;
    st.forEach(function (s) { var p = rot(s.x, s.y); var top = -p[1] * GF - s.cap * hsPerK; if (top < b[1] && b[1] - top > tallest) tallest = b[1] - top; });
    K = Math.min((box.r - box.l) / bw, (box.b - box.t) / (bh + tallest));
    HS = hsPerK * K;
    OX = (box.l + box.r) / 2 - K * (b[0] + b[2]) / 2;
    OY = box.b - K * b[3];
    RX = Math.max(5, Math.min(15, K * 1.9));
    renderMap();
  }

  // ---------- static map layer ----------
  function ringPath(c, r) {
    c.beginPath();
    for (var i = 0; i < r.length; i += 2) {
      var p = P(r[i], r[i + 1], 0);
      if (i) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]);
    }
    c.closePath();
  }
  function hatch(c) {
    var pc = document.createElement('canvas'); pc.width = pc.height = 8 * DPR;
    var x = pc.getContext('2d'); x.scale(DPR, DPR);
    x.strokeStyle = 'rgba(138,150,168,.28)'; x.lineWidth = 1;
    x.beginPath(); x.moveTo(0, 8); x.lineTo(8, 0); x.stroke();
    var pat = c.createPattern(pc, 'repeat');
    if (pat.setTransform) pat.setTransform(new DOMMatrix().scale(1 / DPR));
    return pat;
  }
  function renderMap() {
    mapLayer = document.createElement('canvas');
    mapLayer.width = canvas.width; mapLayer.height = canvas.height;
    var c = mapLayer.getContext('2d');
    c.scale(DPR, DPR);
    var T = Math.max(4, Math.min(12, K * 1.9));   // slab thickness

    // walls: the ground polygons smeared downwards
    c.fillStyle = '#1B2733';
    for (var t = T; t > 0; t -= 1) {
      c.save(); c.translate(0, t);
      DATA.districts.forEach(function (d) { d[4].forEach(function (r) { ringPath(c, r); c.fill(); }); });
      c.restore();
    }
    // a lit rim along the slab bottom
    c.save(); c.translate(0, T);
    c.strokeStyle = 'rgba(92,200,255,.10)'; c.lineWidth = 1;
    DATA.districts.forEach(function (d) { d[4].forEach(function (r) { ringPath(c, r); c.stroke(); }); });
    c.restore();

    var pat = hatch(c);
    DATA.districts.forEach(function (d) {
      var seoul = d[1] === '서울';
      d[4].forEach(function (r) {
        ringPath(c, r);
        c.fillStyle = seoul ? '#223244' : '#17222E'; c.fill();
        if (d[3] > 0.5) { c.fillStyle = pat; c.fill(); }
        c.strokeStyle = seoul ? '#46607A' : '#2F3F51'; c.lineWidth = seoul ? 1 : .8; c.stroke();
      });
    });
  }
  function labels(alpha) {
    var c = ctx;
    c.save(); c.globalAlpha = alpha;
    c.font = '600 ' + Math.round(Math.max(10, Math.min(13, K * 2.2))) + 'px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    c.shadowColor = 'rgba(11,15,20,.95)'; c.shadowBlur = 6;
    c.fillStyle = 'rgba(190,205,222,.75)';
    [['SEOUL', -10, -2], ['INCHEON', -46, -8], ['GYEONGGI', 44, 38]].forEach(function (l) {
      var p = P(l[1], l[2], 0); spaced(c, l[0], p[0], p[1], 3);
    });
    c.restore();
  }
  function spaced(c, s, x, y, sp) {
    var w = c.measureText(s).width + sp * (s.length - 1), cx = x - w / 2;
    c.textAlign = 'left';
    for (var i = 0; i < s.length; i++) { c.fillText(s[i], cx, y); cx += c.measureText(s[i]).width + sp; }
    c.textAlign = 'center';
  }

  // ---------- drawing helpers ----------
  function seg(bx, by, h0, h1, side, top) {
    if (h1 - h0 < .2) return;
    var ry = RX * GF;
    ctx.beginPath();
    ctx.moveTo(bx - RX, by - h1);
    ctx.lineTo(bx - RX, by - h0);
    ctx.ellipse(bx, by - h0, RX, ry, 0, Math.PI, 0, true);
    ctx.lineTo(bx + RX, by - h1);
    ctx.ellipse(bx, by - h1, RX, ry, 0, 0, Math.PI, false);
    ctx.closePath();
    ctx.fillStyle = side; ctx.fill();
    if (top) { ctx.beginPath(); ctx.ellipse(bx, by - h1, RX, ry, 0, 0, Math.PI * 2); ctx.fillStyle = top; ctx.fill(); }
  }
  function grad(bx, a, b) {
    var g = ctx.createLinearGradient(bx - RX, 0, bx + RX, 0);
    g.addColorStop(0, a); g.addColorStop(1, b); return g;
  }
  function cube(x, y, s, cols, alpha) {
    var h = s * 0.9, d = s * GF;
    ctx.globalAlpha = alpha;
    // top
    ctx.beginPath(); ctx.moveTo(x, y - h - d); ctx.lineTo(x + s, y - h - d / 2); ctx.lineTo(x, y - h); ctx.lineTo(x - s, y - h - d / 2); ctx.closePath();
    ctx.fillStyle = cols[0]; ctx.fill();
    // left
    ctx.beginPath(); ctx.moveTo(x - s, y - h - d / 2); ctx.lineTo(x, y - h); ctx.lineTo(x, y); ctx.lineTo(x - s, y - d / 2); ctx.closePath();
    ctx.fillStyle = cols[1]; ctx.fill();
    // right
    ctx.beginPath(); ctx.moveTo(x + s, y - h - d / 2); ctx.lineTo(x, y - h); ctx.lineTo(x, y); ctx.lineTo(x + s, y - d / 2); ctx.closePath();
    ctx.fillStyle = cols[2]; ctx.fill();
    ctx.globalAlpha = 1;
  }
  function ease(t) { t = Math.max(0, Math.min(1, t)); return 1 - Math.pow(1 - t, 3); }
  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  // ---------- story ----------
  var STEPS = [
    { d: 6.5, step: 'TODAY', title: st.length + ' substations, ' + (st.reduce(function (a, s) { return a + s.cap; }, 0) / 1000).toFixed(1) + ' GW',
      body: 'Each column is a 345 kV substation serving the Seoul metropolitan area. Height is its capacity; the blue fill is KEPCO’s load forecast.',
      v: null },
    { d: 7, step: 'HEADROOM', title: zeroCount + ' of ' + st.length + ' offer 0 MW',
      body: 'Red caps list no new supply headroom, even where the forecast sits below capacity. Across the whole metro area, ' + totalHead + ' MW is offered.',
      v: ['mx-bad', totalHead + ' MW LEFT'] },
    { d: 8, step: 'DATA CENTERS', title: fits + ' modules of ' + MOD + ' MW',
      body: 'Data center modules connect where headroom is left. Only one substation has any, and ' + fits + ' modules nearly use it up.',
      v: ['mx-warn', fits * MOD + ' / ' + totalHead + ' MW'] },
    { d: 5.5, step: 'FULL', title: 'The next one does not fit',
      body: (totalHead - fits * MOD) + ' MW is left, less than one module. Module ' + (fits + 1) + ' has nowhere to connect at the 345 kV level.',
      v: ['mx-bad', 'NO HEADROOM'] },
    { d: 7.5, step: 'MY STUDY', title: 'So, the 154 kV grid',
      body: 'Where can existing 154 kV substations still take modules under N-1, and how many more fit when each module brings its own BESS?',
      v: ['mx-good', 'IN PROGRESS'] }
  ];
  var T0 = [0]; STEPS.forEach(function (s, i) { T0.push(T0[i] + s.d); });
  var LOOP = T0[T0.length - 1];

  var elStep = document.getElementById('mx-step'), elTitle = document.getElementById('mx-title'),
      elBody = document.getElementById('mx-body'), elV = document.getElementById('mx-verdict'),
      elCard = document.getElementById('mx-card');
  var shown = -1;
  function showStep(i) {
    if (i === shown || !elStep) return; shown = i;
    var s = STEPS[i];
    elStep.textContent = s.step; elTitle.textContent = s.title; elBody.textContent = s.body;
    if (s.v) { elV.hidden = false; elV.className = 'mx-verdict ' + s.v[0]; elV.textContent = s.v[1]; } else elV.hidden = true;
    if (elCard) { elCard.classList.remove('in'); void elCard.offsetWidth; elCard.classList.add('in'); }
  }

  // ---------- frame ----------
  var hover = null, last = [];
  function frame(t) {
    var lt = reduce ? T0[3] + 1 : t % LOOP;
    var si = 0; while (si < STEPS.length - 1 && lt >= T0[si + 1]) si++;
    showStep(si);
    var intro = reduce ? 1 : Math.min(1, t / 1.2);

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = intro;
    ctx.drawImage(mapLayer, 0, 0, W, H);
    ctx.globalAlpha = 1;

    // timeline values
    var rise = ease((lt - 0.4) / 2.4);
    var red = si >= 1 ? ease((lt - T0[1]) / 1.2) : 0;
    var modT = lt - T0[2] - 0.8, nMods = si >= 2 ? Math.max(0, Math.min(fits, modT / 1.35 + 1)) : 0;
    if (si > 2) nMods = fits;
    if (si === 2 && elV) { var live = Math.floor(nMods) * MOD + ' / ' + totalHead + ' MW'; if (elV.textContent !== live) elV.textContent = live; }
    var failT = si >= 3 ? lt - T0[3] : -1;
    var fade = lt > LOOP - 1.2 ? 1 - ease((lt - (LOOP - 1.2)) / 1.0) : 1;
    var pulse = 0.5 + 0.5 * Math.sin(t * 3.2);

    var order = st.slice().sort(function (a, b) { return rot(b.x, b.y)[1] - rot(a.x, a.y)[1]; });
    last = [];
    order.forEach(function (s, idx) {
      var p = P(s.x, s.y, 0), bx = p[0], by = p[1];
      var stg = reduce ? 1 : ease((lt - 0.3 - idx * 0.05) / 1.6) * fade + (1 - fade) * 0;
      var hc = s.cap * HS * Math.max(stg, 0.0001), hf = s.fcst * HS * stg;
      var isT = s === target, dcMW = isT ? Math.floor(nMods) * MOD : 0;
      var hd = dcMW * HS * stg, hh = s.head * HS * stg;
      var on = hover === s;
      if (isT && si >= 1) { ctx.beginPath(); ctx.ellipse(bx, by, RX * 2.6, RX * GF * 2.6, 0, 0, Math.PI * 2); ctx.fillStyle = (s.head - dcMW >= MOD ? 'rgba(127,224,168,' : 'rgba(255,72,72,') + (.18 + .1 * pulse) * red + ')'; ctx.fill(); }
      // shadow
      ctx.beginPath(); ctx.ellipse(bx + RX * .5, by + 1, RX * 1.5, RX * GF * 1.2, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fill();
      // capacity ghost
      seg(bx, by, 0, hc, on ? 'rgba(159,192,222,.12)' : 'rgba(159,192,222,.06)', null);
      ctx.beginPath(); ctx.moveTo(bx - RX, by - hc); ctx.lineTo(bx - RX, by); ctx.moveTo(bx + RX, by - hc); ctx.lineTo(bx + RX, by);
      ctx.strokeStyle = 'rgba(159,192,222,.28)'; ctx.lineWidth = 1; ctx.stroke();
      // load forecast
      seg(bx, by, 0, hf, grad(bx, '#3E86B4', '#1F4A68'), hf >= hc - .5 ? null : '#6FB7E2');
      // data center modules inside the column
      if (dcMW) seg(bx, by, hf, hf + hd, grad(bx, '#FFC870', '#C77F1A'), '#FFD58F');
      // offered headroom
      if (s.head > 0 && hh - hd > .3) seg(bx, by, hf + hd, hf + hh, grad(bx, 'rgba(127,224,168,.95)', 'rgba(70,170,115,.95)'), 'rgba(160,240,190,.95)');
      // top rim at capacity
      ctx.beginPath(); ctx.ellipse(bx, by - hc, RX, RX * GF, 0, 0, Math.PI * 2);
      var full = s.head === 0 || (isT && nMods >= fits && si >= 3);
      if (full && red > 0) {
        ctx.save(); ctx.shadowColor = 'rgba(255,59,59,.9)'; ctx.shadowBlur = 10 * red * (.6 + .4 * pulse);
        ctx.fillStyle = 'rgba(255,72,72,' + (0.55 + 0.3 * pulse) * red * stg + ')'; ctx.fill(); ctx.restore();
      } else {
        ctx.strokeStyle = on ? 'rgba(220,235,250,.9)' : 'rgba(159,192,222,.5)'; ctx.lineWidth = 1; ctx.stroke();
      }
      last.push({ s: s, x: bx, top: by - hc, by: by });

      if (isT && si >= 1) {
        // label
        var left = Math.max(0, s.head - dcMW);
        ctx.font = '700 12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = left >= MOD ? '#7FE0A8' : '#FF7A7A';
        ctx.globalAlpha = red;
        ctx.fillText(left + ' MW left', bx, by - hc - RX * GF - 8);
        ctx.globalAlpha = 1;
        // module cubes on the ground beside it
        var cs = Math.max(9, Math.min(16, K * 2.5));
        var spots = [[2.2, .6], [4.3, 1.6], [2.2, 2.8], [4.3, 3.8], [3.25, 5.4]];
        var n = Math.floor(nMods);
        for (var m = 0; m < fits; m++) {
          var ft = modT - m * 1.35;
          if (si < 2 || ft < 0) { if (si <= 2) continue; }
          var dt = si > 2 ? 1 : ease(ft / .6);
          var cx0 = bx + spots[m][0] * cs, cy0 = by + spots[m][1] * cs * GF;
          ctx.beginPath(); ctx.moveTo(bx + RX * .8, by); ctx.lineTo(cx0, cy0 - cs * .4);
          ctx.strokeStyle = 'rgba(255,181,71,' + .7 * dt * fade + ')'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.4; ctx.stroke(); ctx.setLineDash([]);
          cube(cx0, cy0 - (1 - dt) * 60, cs, ['#FFD58F', '#E39A2E', '#B8721A'], dt * fade);
        }
        if (failT >= 0) {
          var fd = ease(failT / .7), sh = failT > .7 && failT < 2 ? Math.sin(failT * 40) * 2 : 0;
          var fa = failT < 3.5 ? 1 : 1 - ease((failT - 3.5) / 1.2);
          var fx = bx + spots[4][0] * cs + sh, fy = by + spots[4][1] * cs * GF - (1 - fd) * 70;
          cube(fx, fy - 10, cs, ['#FF9A9A', '#E04848', '#A82E2E'], fd * fa * fade);
          if (failT > .7) {
            ctx.globalAlpha = fa * fade; ctx.fillStyle = '#FF7A7A'; ctx.font = '700 15px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
            ctx.fillText('×', fx, fy - cs * 2.6 - 10); ctx.globalAlpha = 1;
          }
        }
      }
    });
    labels(intro);
  }

  // ---------- hover ----------
  function pick(e) {
    var r = canvas.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top, best = null;
    for (var i = last.length - 1; i >= 0; i--) {
      var c = last[i];
      if (Math.abs(mx - c.x) <= RX + 3 && my >= c.top - RX && my <= c.by + RX * GF + 2) { best = c; break; }
    }
    hover = best ? best.s : null;
    if (!best) { tip.hidden = true; return; }
    var s = best.s;
    tip.innerHTML = '<b>' + s.name + '</b> 345 kV<br>capacity ' + fmt(s.cap) + ' MW<br>load forecast ' + fmt(s.fcst) +
      ' MW<br><span class="' + (s.head ? 'ok' : 'no') + '">headroom offered ' + fmt(s.head) + ' MW</span>';
    tip.hidden = false;
    var tx = Math.min(W - tip.offsetWidth - 8, best.x + RX + 10), ty = Math.max(8, best.top - 10);
    tip.style.left = tx + 'px'; tip.style.top = ty + 'px';
  }
  canvas.addEventListener('mousemove', pick);
  canvas.addEventListener('mouseleave', function () { hover = null; tip.hidden = true; });

  // ---------- run ----------
  var running = false, start = null, raf = 0, paused = 0;
  function loop(now) {
    if (!running) return;
    if (start === null) start = now - paused * 1000;
    frame((now - start) / 1000);
    raf = requestAnimationFrame(loop);
  }
  function play() { if (running || reduce) return; running = true; start = null; raf = requestAnimationFrame(loop); }
  function stop(now) { if (!running) return; running = false; cancelAnimationFrame(raf); paused = start === null ? paused : (performance.now() - start) / 1000; }

  layout();
  if (reduce) frame(0); else play();
  var rt = 0;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { layout(); if (reduce) frame(0); }, 120); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) play(); else stop(); }); }).observe(host);
  }
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else play(); });
})();
