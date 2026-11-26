// Home hero: the Seoul Capital Area as a tilted 3D map.
// Each column is a 345 kV substation from KEPCO's public supply-headroom page (Nov 2026):
// height = capacity, fill = KEPCO's load forecast, red cap = 0 MW headroom offered.
// A data center (four 20 MW modules) then connects where headroom is left.
// Station positions are approximate (weighted centre of the districts each one serves).
(function () {
  var host = document.getElementById('mx-map');
  var DATA = window.METRO_HERO_DATA;
  if (!host || !DATA) return;

  var MOD = 20, NMOD = 4;              // one data center = 4 modules of 20 MW
  var YAW = -0.18, GF = 0.72;          // map rotation (rad) and ground foreshortening
  var UI = "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif";
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
  var totalHead = st.reduce(function (a, s) { return a + s.head; }, 0);
  var zeroCount = st.filter(function (s) { return s.head === 0; }).length;
  var campus = NMOD * MOD;

  // ---------- locator inset (South Korea, capital area highlighted) ----------
  var inset = document.getElementById('mx-inset');
  if (inset && DATA.korea) {
    var paths = ['', ''], bb = [1e9, 1e9, -1e9, -1e9];
    var rings = DATA.korea.map(function (k) {
      var f = k[1], x = f[0], y = f[1], pts = [[x, y]];
      for (var i = 2; i < f.length; i += 2) { x += f[i]; y += f[i + 1]; pts.push([x, y]); }
      pts.forEach(function (p) { bb[0] = Math.min(bb[0], p[0]); bb[1] = Math.min(bb[1], p[1]); bb[2] = Math.max(bb[2], p[0]); bb[3] = Math.max(bb[3], p[1]); });
      return [k[0], pts];
    });
    var cosL = Math.cos(36 * Math.PI / 180);
    rings.forEach(function (r) {
      paths[r[0]] += 'M' + r[1].map(function (p) { return ((p[0] - bb[0]) * cosL).toFixed(1) + ' ' + (bb[3] - p[1]).toFixed(1); }).join('L') + 'Z';
    });
    var vw = ((bb[2] - bb[0]) * cosL), vh = (bb[3] - bb[1]);
    inset.setAttribute('viewBox', '-2 -2 ' + (vw + 4).toFixed(1) + ' ' + (vh + 4).toFixed(1));
    inset.innerHTML = '<path d="' + paths[0] + '" class="k-land"/><path d="' + paths[1] + '" class="k-cap"/>';
  }

  var CY = Math.cos(YAW), SY = Math.sin(YAW);
  function rot(x, y) { return [x * CY - y * SY, x * SY + y * CY]; }
  var W = 0, H = 0, DPR = 1, K = 1, OX = 0, OY = 0, HS = 0, RX = 6, mapLayer = null;
  function P(x, y, z) { var r = rot(x, y); return [OX + K * r[0], OY - K * r[1] * GF - (z || 0), r[1]]; }

  // ---------- layout ----------
  function layout() {
    var rect = host.getBoundingClientRect();
    W = Math.max(300, rect.width); H = Math.max(260, rect.height);
    DPR = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    var b = [1e9, 1e9, -1e9, -1e9];
    DATA.districts.forEach(function (d) {
      d[4].forEach(function (r) {
        for (var i = 0; i < r.length; i += 2) {
          var p = rot(r[i], r[i + 1]), sx = p[0], sy = -p[1] * GF;
          if (sx < b[0]) b[0] = sx; if (sy < b[1]) b[1] = sy; if (sx > b[2]) b[2] = sx; if (sy > b[3]) b[3] = sy;
        }
      });
    });
    var wide = W > 900;
    var box = wide ? { l: W * 0.07, r: W * 0.67, t: 84, b: H - 40 } : { l: 8, r: W - 8, t: 8, b: H - 8 };
    var hsPerK = 0.0058, tallest = 0;
    st.forEach(function (s) { var p = rot(s.x, s.y); var top = -p[1] * GF - s.cap * hsPerK; if (b[1] - top > tallest) tallest = b[1] - top; });
    K = Math.min((box.r - box.l) / (b[2] - b[0]), (box.b - box.t) / (b[3] - b[1] + tallest));
    HS = hsPerK * K;
    OX = (box.l + box.r) / 2 - K * (b[0] + b[2]) / 2;
    OY = box.b - K * b[3] - ((box.b - box.t) - K * (b[3] - b[1] + tallest)) / 2;
    RX = Math.max(4, Math.min(11, K * 1.15));
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
  function each(c, filter, fn) {
    DATA.districts.forEach(function (d) { if (filter(d)) d[4].forEach(function (r) { ringPath(c, r); fn(d); }); });
  }
  function hatch(c) {
    var pc = document.createElement('canvas'); pc.width = pc.height = 8 * DPR;
    var x = pc.getContext('2d'); x.scale(DPR, DPR);
    x.strokeStyle = 'rgba(138,150,168,.3)'; x.lineWidth = 1;
    x.beginPath(); x.moveTo(0, 8); x.lineTo(8, 0); x.stroke();
    var pat = c.createPattern(pc, 'repeat');
    if (pat.setTransform && window.DOMMatrix) pat.setTransform(new DOMMatrix().scale(1 / DPR));
    return pat;
  }
  function renderMap() {
    mapLayer = document.createElement('canvas');
    mapLayer.width = canvas.width; mapLayer.height = canvas.height;
    var c = mapLayer.getContext('2d');
    c.scale(DPR, DPR);
    var T = Math.max(4, Math.min(14, K * 1.6));
    var all = function () { return true; }, isSeoul = function (d) { return d[1] === '서울'; },
        isInch = function (d) { return d[1] === '인천'; }, notSeoul = function (d) { return d[1] !== '서울'; };

    // slab walls
    c.fillStyle = '#1B2733';
    for (var t = T; t > 0; t -= 1) { c.save(); c.translate(0, t); each(c, all, function () { c.fill(); }); c.restore(); }
    c.save(); c.translate(0, T); c.strokeStyle = 'rgba(92,200,255,.12)'; c.lineWidth = 1; each(c, all, function () { c.stroke(); }); c.restore();

    // Gyeonggi + Incheon
    var pat = hatch(c);
    var fillOther = function (d) { c.fillStyle = isInch(d) ? '#182533' : '#16212C'; c.fill(); if (d[3] > 0.5) { c.fillStyle = pat; c.fill(); } };
    each(c, notSeoul, fillOther);
    each(c, notSeoul, function () { c.strokeStyle = '#2C3B4C'; c.lineWidth = .7; c.stroke(); });
    // Incheon outline: thick stroke then refill, so only the outer edge stays
    c.strokeStyle = 'rgba(159,192,222,.45)'; c.lineWidth = 2.4; each(c, isInch, function () { c.stroke(); });
    each(c, isInch, fillOther);
    each(c, isInch, function () { c.strokeStyle = '#2C3B4C'; c.lineWidth = .7; c.stroke(); });
    // Seoul: glowing outer edge, lighter fill
    c.save(); c.shadowColor = 'rgba(120,200,255,.9)'; c.shadowBlur = 14;
    c.strokeStyle = 'rgba(170,220,255,.95)'; c.lineWidth = 4; each(c, isSeoul, function () { c.stroke(); });
    c.restore();
    each(c, isSeoul, function () { c.fillStyle = '#243A52'; c.fill(); });
    each(c, isSeoul, function () { c.strokeStyle = '#3E5874'; c.lineWidth = .7; c.stroke(); });
  }

  // ---------- labels (drawn on top) ----------
  function spaced(s, x, y, sp) { for (var i = 0; i < s.length; i++) { ctx.fillText(s[i], x, y); x += ctx.measureText(s[i]).width + sp; } }
  function label(gx, gy, ax, ay, big, small, col, alpha) {
    var p = P(gx, gy, 0), a = ax == null ? null : P(ax, ay, 0);
    var fs = Math.round(Math.max(13, Math.min(24, K * 3.3))), sfs = Math.max(11, Math.round(fs * .52));
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.font = '700 ' + fs + 'px ' + UI;
    var w = ctx.measureText(big).width + fs * .18 * (big.length - 1);
    if (small) { ctx.font = '500 ' + sfs + 'px ' + UI; w = Math.max(w, ctx.measureText(small).width); }
    var x = Math.max(8, Math.min(W - w - 8, p[0])), y = p[1];
    if (a) {
      var ex = a[0] < x ? x - 6 : x + w + 6;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(ex, y - fs * .35);
      ctx.strokeStyle = col; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.beginPath(); ctx.arc(a[0], a[1], 3, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
    }
    ctx.shadowColor = 'rgba(11,15,20,.95)'; ctx.shadowBlur = 8;
    ctx.font = '700 ' + fs + 'px ' + UI; ctx.fillStyle = col; ctx.textAlign = 'left';
    spaced(big, x, y, fs * .18);
    if (small) { ctx.font = '500 ' + sfs + 'px ' + UI; ctx.fillStyle = 'rgba(201,210,222,.85)'; ctx.fillText(small, x, y + fs * .95); }
    ctx.restore();
  }

  // ---------- drawing helpers ----------
  function seg(bx, by, h0, h1, side, top) {
    if (h1 - h0 < .2) return;
    var ry = RX * GF;
    ctx.beginPath();
    ctx.moveTo(bx - RX, by - h1); ctx.lineTo(bx - RX, by - h0);
    ctx.ellipse(bx, by - h0, RX, ry, 0, Math.PI, 0, true);
    ctx.lineTo(bx + RX, by - h1);
    ctx.ellipse(bx, by - h1, RX, ry, 0, 0, Math.PI, false);
    ctx.closePath(); ctx.fillStyle = side; ctx.fill();
    if (top) { ctx.beginPath(); ctx.ellipse(bx, by - h1, RX, ry, 0, 0, Math.PI * 2); ctx.fillStyle = top; ctx.fill(); }
  }
  function grad(bx, a, b) { var g = ctx.createLinearGradient(bx - RX, 0, bx + RX, 0); g.addColorStop(0, a); g.addColorStop(1, b); return g; }
  function cube(x, y, s, cols, alpha) {
    var h = s * 0.9, d = s * GF;
    ctx.globalAlpha = alpha;
    ctx.beginPath(); ctx.moveTo(x, y - h - d); ctx.lineTo(x + s, y - h - d / 2); ctx.lineTo(x, y - h); ctx.lineTo(x - s, y - h - d / 2); ctx.closePath(); ctx.fillStyle = cols[0]; ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - s, y - h - d / 2); ctx.lineTo(x, y - h); ctx.lineTo(x, y); ctx.lineTo(x - s, y - d / 2); ctx.closePath(); ctx.fillStyle = cols[1]; ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + s, y - h - d / 2); ctx.lineTo(x, y - h); ctx.lineTo(x, y); ctx.lineTo(x + s, y - d / 2); ctx.closePath(); ctx.fillStyle = cols[2]; ctx.fill();
    ctx.globalAlpha = 1;
  }
  function ease(t) { t = Math.max(0, Math.min(1, t)); return 1 - Math.pow(1 - t, 3); }
  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  // ---------- story ----------
  // callout next to the data center site: step, headline, keyword line, verdict
  var STEPS = [
    { d: 7, c: ['HOW TO READ', '1 column = 1 substation', 'hover any column for its numbers', null, null] },
    { d: 6, c: ['HEADROOM', totalHead + ' MW free', 'only 1 of ' + st.length + ' substations', 'mx-good', 'LAST SPACE'] },
    { d: 6.5, c: ['DATA CENTER', '+' + campus + ' MW campus', NMOD + ' \u00d7 ' + MOD + ' MW modules', 'mx-warn', (totalHead - campus) + ' MW LEFT'] },
    { d: 6, c: ['NEXT CAMPUS', 'No room', (totalHead - campus) + ' MW < one ' + MOD + ' MW module', 'mx-bad', 'FULL'] },
    { d: 7, c: ['MY STUDY', 'Go down to 154 kV', 'N-1 \u00b7 module limit \u00b7 BESS', 'mx-good', 'IN PROGRESS'] }
  ];
  var T0 = [0]; STEPS.forEach(function (s, i) { T0.push(T0[i] + s.d); });
  var LOOP = T0[T0.length - 1];
  var elStep = document.getElementById('mx-step'), elTitle = document.getElementById('mx-title'),
      elBody = document.getElementById('mx-body'), elV = document.getElementById('mx-verdict'),
      elCall = document.getElementById('mx-call'), shown = -1, callPos = '';
  function showStep(i) {
    if (i === shown || !elCall) return; shown = i;
    var c = STEPS[i].c;
    if (!c) { elCall.hidden = true; return; }
    elStep.textContent = c[0]; elTitle.textContent = c[1]; elBody.textContent = c[2];
    elV.hidden = !c[3]; if (c[3]) { elV.className = 'mx-verdict ' + c[3]; elV.textContent = c[4]; }
    elCall.className = 'mx-call ' + (c[3] === 'mx-bad' ? 'k-bad' : c[3] === 'mx-good' ? 'k-good' : '');
    elCall.hidden = false; void elCall.offsetWidth; elCall.classList.add('in');
  }
  function placeCall(x, y, ax, ay, alpha) {
    if (!elCall || elCall.hidden) return;
    var w = elCall.offsetWidth, h = elCall.offsetHeight;
    var px = Math.round(Math.max(6, Math.min(W - w - 6, x))), py = Math.round(Math.max(6, Math.min(H - h - 6, y - h)));
    var v = px + ',' + py;
    if (v !== callPos) { callPos = v; elCall.style.left = px + 'px'; elCall.style.top = py + 'px'; }
    // thin leader from the substation to the callout
    var ex = px < ax ? px + w : px, ey = Math.max(py + 10, Math.min(py + h - 10, ay));
    ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = 'rgba(255,181,71,.7)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.beginPath(); ctx.arc(ax, ay, 2.5, 0, Math.PI * 2); ctx.fillStyle = '#FFB547'; ctx.fill(); ctx.restore();
  }

  var LIT = ['159,216,255', '127,224,168', '255,181,71', '255,90,90', '127,224,168'];
  function tag(x, y, text, col) {
    ctx.font = '600 12px ' + UI; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    var w = ctx.measureText(text).width;
    ctx.fillStyle = 'rgba(11,15,20,.88)'; ctx.fillRect(x - w - 6, y - 9, w + 12, 18);
    ctx.fillStyle = col; ctx.fillText(text, x, y);
    ctx.textBaseline = 'alphabetic';
  }
  function dims(bx, by, hc, hf, s, a) {
    var x0 = bx - RX - 8, xl = x0 - 14;
    ctx.save(); ctx.globalAlpha = a; ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(230,235,242,.85)';
    ctx.beginPath(); ctx.moveTo(x0 + 4, by); ctx.lineTo(x0, by); ctx.lineTo(x0, by - hc); ctx.lineTo(x0 + 4, by - hc); ctx.stroke();
    ctx.strokeStyle = 'rgba(111,183,226,.9)';
    ctx.beginPath(); ctx.moveTo(x0 - 4, by - hf); ctx.lineTo(bx - RX, by - hf); ctx.stroke();
    var yc = by - hc - 2, yh = yc + 20, yf = Math.max(by - hf / 2, yh + 20);
    ctx.strokeStyle = 'rgba(230,235,242,.5)';
    [[yc, by - hc], [yh, by - hc + (hc - hf) / 2], [yf, by - hf / 2]].forEach(function (l) { ctx.beginPath(); ctx.moveTo(xl + 2, l[0]); ctx.lineTo(x0 - 1, l[1]); ctx.stroke(); });
    tag(xl, yc, fmt(s.cap) + ' MW capacity', '#E6EBF2');
    tag(xl, yh, fmt(s.head) + ' MW headroom', '#7FE0A8');
    tag(xl, yf, fmt(s.fcst) + ' MW load forecast', '#8FCBF0');
    ctx.restore();
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
    ctx.globalAlpha = intro; ctx.drawImage(mapLayer, 0, 0, W, H); ctx.globalAlpha = 1;

    var red = si >= 1 ? ease((lt - T0[1]) / 1.2) : 0;
    var drop = si >= 2 ? (reduce ? 1 : ease((lt - T0[2] - 0.6) / 0.9)) : 0;   // the whole campus lands at once
    var landed = drop > 0.98;
    var failT = si >= 3 ? lt - T0[3] : -1;
    var fade = lt > LOOP - 1.2 ? 1 - ease((lt - (LOOP - 1.2)) / 1.0) : 1;
    var pulse = 0.5 + 0.5 * Math.sin(t * 3.2);

    var order = st.slice().sort(function (a, b) { return rot(b.x, b.y)[1] - rot(a.x, a.y)[1]; });
    last = []; var post = [];
    order.forEach(function (s, idx) {
      var p = P(s.x, s.y, 0), bx = p[0], by = p[1];
      var stg = reduce ? 1 : ease((lt - 0.3 - idx * 0.05) / 1.6) * fade;
      var hc = s.cap * HS * Math.max(stg, 0.0001), hf = s.fcst * HS * stg;
      var isT = s === target, dcMW = isT && landed ? campus : 0;
      var hd = dcMW * HS * stg, hh = s.head * HS * stg, on = hover === s;
      // the substation the callout points at lights up as a whole column
      var lit = isT ? (reduce ? 1 : ease((lt - 1.8) / .8)) * fade : 0;
      var litC = LIT[si];
      if (lit > 0) {
        ctx.beginPath(); ctx.ellipse(bx, by, RX * 2.6, RX * GF * 2.6, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + litC + ',' + (.2 + .1 * pulse) * lit + ')'; ctx.fill();
        ctx.save(); ctx.shadowColor = 'rgba(' + litC + ',1)'; ctx.shadowBlur = (26 + 14 * pulse) * lit;
        seg(bx, by, 0, hc, 'rgba(' + litC + ',' + .8 * lit + ')', null); seg(bx, by, 0, hc, 'rgba(' + litC + ',' + .5 * lit + ')', null); ctx.restore();
      }
      ctx.beginPath(); ctx.ellipse(bx + RX * .5, by + 1, RX * 1.5, RX * GF * 1.2, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fill();
      seg(bx, by, 0, hc, on ? 'rgba(159,192,222,.14)' : 'rgba(159,192,222,.06)', null);
      ctx.beginPath(); ctx.moveTo(bx - RX, by - hc); ctx.lineTo(bx - RX, by); ctx.moveTo(bx + RX, by - hc); ctx.lineTo(bx + RX, by);
      ctx.strokeStyle = 'rgba(159,192,222,.28)'; ctx.lineWidth = 1; ctx.stroke();
      seg(bx, by, 0, hf, grad(bx, '#4790BE', '#1F4A68'), hf >= hc - .5 ? null : '#6FB7E2');
      if (dcMW) seg(bx, by, hf, hf + hd, grad(bx, '#FFC870', '#C77F1A'), '#FFD58F');
      if (s.head > 0 && hh - hd > .3) seg(bx, by, hf + hd, hf + hh, grad(bx, 'rgba(127,224,168,.95)', 'rgba(70,170,115,.95)'), 'rgba(160,240,190,.95)');
      if (lit > 0) {
        seg(bx, by, 0, hc, 'rgba(' + litC + ',' + (.3 + .15 * pulse) * lit + ')', null);
        seg(bx, by, 0, hc, 'rgba(255,255,255,' + (.08 + .06 * pulse) * lit + ')', null);
        ctx.beginPath(); ctx.moveTo(bx - RX, by - hc); ctx.lineTo(bx - RX, by); ctx.ellipse(bx, by, RX, RX * GF, 0, Math.PI, 0, true); ctx.lineTo(bx + RX, by - hc);
        ctx.strokeStyle = 'rgba(' + litC + ',' + lit + ')'; ctx.lineWidth = 2; ctx.stroke();
      }
      ctx.beginPath(); ctx.ellipse(bx, by - hc, RX, RX * GF, 0, 0, Math.PI * 2);
      var full = s.head === 0 || (isT && si >= 3);
      if (full && red > 0) {
        ctx.save(); ctx.shadowColor = 'rgba(255,59,59,.9)'; ctx.shadowBlur = 10 * red * (.6 + .4 * pulse);
        ctx.fillStyle = 'rgba(255,72,72,' + (0.55 + 0.3 * pulse) * red * stg + ')'; ctx.fill(); ctx.restore();
      } else { ctx.strokeStyle = on ? 'rgba(220,235,250,.9)' : 'rgba(159,192,222,.5)'; ctx.lineWidth = 1; ctx.stroke(); }
      last.push({ s: s, x: bx, top: by - hc, by: by });

      if (isT) {
        var cs = Math.max(7, Math.min(12, K * 1.5));
        var spots = [[2.4, .4], [4.4, 1.5], [2.4, 2.6], [4.4, 3.7]];
        placeCall(bx + 8.5 * cs, by - hc + 6, bx + RX + 3, by - hc, lit);
        // first step: read this one column with its real numbers
        if (si === 0 && lit > 0) post.push(function () { dims(bx, by, hc, hf, s, lit); });
      }
      if (isT && si >= 1) {
        // the campus: four module cubes landing together beside the substation
        if (si >= 2) {
          var cx = bx + 3.4 * cs, cy = by + 2.05 * cs * GF;
          ctx.beginPath(); ctx.moveTo(bx + RX * .8, by); ctx.lineTo(cx, cy - cs * .3);
          ctx.strokeStyle = 'rgba(255,181,71,' + .75 * drop * fade + ')'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([]);
          spots.forEach(function (sp) {
            cube(bx + sp[0] * cs, by + sp[1] * cs * GF - (1 - drop) * 70, cs, ['#FFD58F', '#E39A2E', '#B8721A'], drop * fade);
          });
        }
        if (failT >= 0) post.push(function () {
          var fd = reduce ? 1 : ease(failT / .7), sh = failT > .7 && failT < 2 ? Math.sin(failT * 40) * 2 : 0;
          var fa = reduce ? 1 : (failT < 3.8 ? 1 : 1 - ease((failT - 3.8) / 1.2));
          var fx = bx + 7.4 * cs + sh, fy = by + 1.6 * cs * GF - (1 - fd) * 70;
          for (var m = 0; m < NMOD; m++) cube(fx + (m % 2) * 1.6 * cs, fy + m * .55 * cs * GF, cs * .8, ['#FF9A9A', '#E04848', '#A82E2E'], fd * fa * fade * .9);
          if (failT > .7) { ctx.globalAlpha = fa * fade; ctx.fillStyle = '#FF7A7A'; ctx.font = '700 16px ' + UI; ctx.fillText('×', fx + .8 * cs, fy - cs * 2.4); ctx.globalAlpha = 1; }
        });
      }
    });

    post.forEach(function (f) { f(); });
    // place names on top, with leader lines into empty space
    label(32, 15, 15.5, 12, 'SEOUL', 'capital · 9.3 M people', '#BFE3FF', intro);
    label(-74, -26, -42, -2, 'INCHEON', null, 'rgba(201,214,228,.85)', intro);
    label(24, -30, null, null, 'GYEONGGI', null, 'rgba(201,214,228,.7)', intro);
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
    tip.style.left = Math.min(W - tip.offsetWidth - 8, best.x + RX + 10) + 'px';
    tip.style.top = Math.max(8, best.top - 10) + 'px';
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
  function stop() { if (!running) return; running = false; cancelAnimationFrame(raf); paused = start === null ? paused : (performance.now() - start) / 1000; }

  layout();
  if (reduce) frame(0); else play();
  var rt = 0;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { layout(); if (reduce) frame(0); }, 120); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) play(); else stop(); }); }).observe(host);
  }
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else play(); });
})();
