// Home hero: isometric grid fed by a nuclear plant. A data center with BESS
// moves between four candidate sites; nearby lines overload or trip.
// Concept animation only: the loadings shown are illustrative, not study results.
(function () {
  var host = document.getElementById('gx-scene');
  if (!host) return;

  var K = 40, OX = 620, OY = -30, E = '#0B0F14', RX = 1.2247 * K, RY = 0.7071 * K;
  var MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
  function P(x, y, z) { return [OX + (x - y) * 0.866 * K, OY + (x + y) * 0.5 * K - (z || 0) * K]; }
  function f(n) { return Math.round(n * 10) / 10; }
  function pt(p) { return f(p[0]) + ' ' + f(p[1]); }
  function poly(a) { return 'M' + a.map(pt).join(' L') + ' Z'; }

  var S = [], cur = S;
  function add(k, d, fill, stroke, sw, tf) { cur.push({ k: k, d: d, fill: fill, stroke: stroke || 'none', sw: sw || 0, tf: tf || '' }); }
  function box(x, y, z, w, d, h, c, k) {
    var kk = k == null ? x + y + (w + d) / 2 : k;
    add(kk, poly([P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x, y + d, z)]), c[1], E, .6);
    add(kk, poly([P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x + w, y, z)]), c[2], E, .6);
    add(kk, poly([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)]), c[0], E, .6);
  }
  function ell(cx, cy, rx, ry) {
    return 'M' + f(cx - rx) + ' ' + f(cy) + ' A' + f(rx) + ' ' + f(ry) + ' 0 1 0 ' + f(cx + rx) + ' ' + f(cy) +
      ' A' + f(rx) + ' ' + f(ry) + ' 0 1 0 ' + f(cx - rx) + ' ' + f(cy) + ' Z';
  }
  function cyl(x, y, r, h, c, dome) {
    var b = P(x, y, 0), cx = b[0], cy = b[1], rx = r * RX, ry = r * RY, ht = h * K, k = x + y;
    add(k, 'M' + f(cx - rx) + ' ' + f(cy - ht) + ' L' + f(cx - rx) + ' ' + f(cy) + ' A' + f(rx) + ' ' + f(ry) + ' 0 0 0 ' +
      f(cx + rx) + ' ' + f(cy) + ' L' + f(cx + rx) + ' ' + f(cy - ht) + ' Z', c[1], E, .6);
    add(k, ell(cx, cy - ht, rx, ry), c[0], E, .6);
    if (dome) add(k, 'M' + f(cx - rx) + ' ' + f(cy - ht) + ' A' + f(rx) + ' ' + f(rx * .8) + ' 0 0 1 ' + f(cx + rx) + ' ' +
      f(cy - ht) + ' A' + f(rx) + ' ' + f(ry) + ' 0 0 1 ' + f(cx - rx) + ' ' + f(cy - ht) + ' Z', dome, E, .6);
  }
  function coolingTower(x, y, H) {
    var b = P(x, y, 0), bx = b[0], by = b[1], r0 = RX, r0y = RY, r1 = .62 * RX, r2 = .72 * RX, r2y = .72 * RY, hk = H * K;
    add(x + y, 'M' + f(bx - r0) + ' ' + f(by) + ' Q' + f(bx - r1) + ' ' + f(by - .62 * hk) + ' ' + f(bx - r2) + ' ' + f(by - hk) +
      ' L' + f(bx + r2) + ' ' + f(by - hk) + ' Q' + f(bx + r1) + ' ' + f(by - .62 * hk) + ' ' + f(bx + r0) + ' ' + f(by) +
      ' A' + f(r0) + ' ' + f(r0y) + ' 0 0 1 ' + f(bx - r0) + ' ' + f(by) + ' Z', '#5A6574', E, .6);
    add(x + y, 'M' + f(bx) + ' ' + f(by + r0y) + ' Q' + f(bx + r1 * .5) + ' ' + f(by - .62 * hk) + ' ' + f(bx + r2 * .6) + ' ' +
      f(by - hk + r2y * .8) + ' L' + f(bx + r2) + ' ' + f(by - hk) + ' Q' + f(bx + r1) + ' ' + f(by - .62 * hk) + ' ' +
      f(bx + r0) + ' ' + f(by) + ' Z', '#47515F', 'none', 0);
    add(x + y, ell(bx, by - hk, r2, r2y), '#1A2028', '#7A8594', .8);
    return [bx, by - hk];
  }

  // Ground
  var G = 22;
  var ground = poly([P(0, 0), P(G, 0), P(G, G), P(0, G)]);
  var grid = '';
  for (var i = 2; i < G; i += 2) grid += 'M' + pt(P(i, 0)) + ' L' + pt(P(i, G)) + ' M' + pt(P(0, i)) + ' L' + pt(P(G, i)) + ' ';

  // Nuclear plant
  var steam = [];
  [coolingTower(1.2, 7.2, 3.8), coolingTower(7.4, 1.4, 3.8)].forEach(function (tp, j) {
    [0, 1.5, 3].forEach(function (dl) { steam.push({ x: f(tp[0]), y: f(tp[1] - 8), dl: dl + j * .7 }); });
  });
  cyl(2.4, 2.2, 1.1, 1.9, ['#A9B5C3', '#7D8897'], '#D3DAE3');
  box(3.6, 1.4, 0, 2.2, 1.4, 1.3, ['#55606F', '#3A4452', '#2E3743']);

  // Substations
  var N = {}, MET = ['#8B96A5', '#5E6979', '#4A5463'];
  function sub(id, x, y, w, d, nT) {
    var cx = x + w / 2, cy = y + d / 2;
    box(x, y, 0, w, d, .06, ['#2C333D', '#1F252D', '#1A1F26'], x + y);
    add(x + y + .01, poly([P(x, y, .3), P(x + w, y, .3), P(x + w, y + d, .3), P(x, y + d, .3)]) +
      ' M' + pt(P(x + w, y + d, 0)) + ' L' + pt(P(x + w, y + d, .3)) + ' M' + pt(P(x, y + d, 0)) + ' L' + pt(P(x, y + d, .3)) +
      ' M' + pt(P(x + w, y, 0)) + ' L' + pt(P(x + w, y, .3)), 'none', '#4C5664', .8);
    box(x + .3, y + .3, .06, .7, .55, .65, MET);
    box(x + w - 1.0, y + .3, .06, .7, .55, .65, MET);
    if (nT > 2) box(x + .3, y + d - .9, .06, .7, .55, .65, MET);
    add(cx + cy + .8, 'M' + pt(P(cx - .8, cy + .3, 0)) + ' L' + pt(P(cx - .8, cy + .3, 1.4)) + ' L' + pt(P(cx + .8, cy + .3, 1.4)) +
      ' L' + pt(P(cx + .8, cy + .3, 0)), 'none', '#9AA6B6', 1.8);
    N[id] = { x: cx, y: cy, s: P(cx, cy + .3, 1.4) };
  }
  sub('GS', 6, 6, 2.6, 2.2, 3); sub('HUB', 10, 10, 3.2, 3.2, 3); sub('L', 3, 15, 2.2, 2, 2);
  sub('R', 15, 3, 2, 2.2, 2); sub('B', 16.3, 16.3, 2.4, 2.4, 2);
  N.N = { x: 4.7, y: 2.1, s: P(4.7, 2.1, 1.3) };
  var labels = [['NUCLEAR PLANT', 3.2, 1.0, 3.6], ['STEP-UP 345 kV', 7.3, 7.1, -1.2], ['HUB 345 kV', 11.6, 11.6, -1.3],
    ['SUB WEST', 4.1, 16, -1.2], ['SUB EAST', 16, 4.1, -1.2], ['SUB SOUTH', 17.5, 17.5, -1.3]].map(function (a) {
    var p = P(a[1], a[2], Math.max(a[3], 0));
    return { t: a[0], x: f(p[0]), y: f(a[3] < 0 ? p[1] - a[3] * K + 6 : p[1]) };
  });

  // Transmission lines on lattice towers
  var PY = 'M-40 220 L-10 40 L0 0 L10 40 L40 220 M-50 50 H50 M-70 90 H70 M-14 62 L21 104 L-28 150 L35 190 M14 62 L-21 104 L28 150 L-35 190 M-21 104 H21 M-35 190 H35 M-50 50 V62 M50 50 V62 M-70 90 V102 M70 90 V102';
  var sc = .62;
  var LINES = [['N', 'GS'], ['GS', 'HUB'], ['HUB', 'L'], ['HUB', 'R'], ['HUB', 'B'], ['GS', 'L'], ['GS', 'R'], ['L', 'B'], ['R', 'B']];
  var lines = LINES.map(function (ab) {
    var A = N[ab[0]], B = N[ab[1]], dist = Math.hypot(A.x - B.x, A.y - B.y);
    var n = dist >= 11 ? 2 : dist >= 6 ? 1 : 0, tops = [];
    for (var i = 1; i <= n; i++) {
      var t = i / (n + 1), x = A.x + (B.x - A.x) * t, y = A.y + (B.y - A.y) * t, b = P(x, y, 0);
      add(x + y, PY, 'none', '#8E9BAD', 1.4 / sc, 'translate(' + f(b[0]) + ' ' + f(b[1] - 220 * sc) + ') scale(' + sc + ')');
      tops.push([b[0], b[1] - 220 * sc + 62 * sc]);
    }
    function cond(o) {
      var pts = [[A.s[0] + o * 8, A.s[1]]].concat(tops.map(function (p) { return [p[0] + o * 50 * sc, p[1]]; }), [[B.s[0] + o * 8, B.s[1]]]);
      var d = 'M' + pt(pts[0]);
      for (var i = 1; i < pts.length; i++) {
        var m = [(pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2 + 16];
        d += ' Q' + pt(m) + ' ' + pt(pts[i]);
      }
      return d;
    }
    var mid = tops.length ? tops[Math.floor((tops.length - 1) / 2)] : [(A.s[0] + B.s[0]) / 2, (A.s[1] + B.s[1]) / 2];
    return { id: ab[0] + '-' + ab[1], d1: cond(-1), d2: cond(1), mx: f(mid[0]), my: f(mid[1]) };
  });
  S.sort(function (p, q) { return p.k - q.k; });

  // Data center sites (building + BESS containers)
  var SITES = [[9.2, 1.6, 4, 2.2, 'GS', 'SITE 1'], [1, 18, 4, 2.4, 'L', 'SITE 2'], [18, 1, 2.4, 4, 'R', 'SITE 3'], [19.2, 15.8, 2.4, 4, 'B', 'SITE 4']];
  var sites = [], dcs = [];
  SITES.forEach(function (st) {
    var x = st[0], y = st[1], w = st[2], d = st[3], at = st[4], name = st[5], lp = P(x + w / 2, y + d / 2, 0);
    sites.push({ pad: poly([P(x - .3, y - .3), P(x + w + .3, y - .3), P(x + w + .3, y + d + .9), P(x - .3, y + d + .9)]), tx: f(lp[0]), ty: f(lp[1] + 4), name: name });
    cur = [];
    box(x, y, 0, w, d, 1.7, ['#D5DCE4', '#9AA5B3', '#77828F']);
    var fx = w > d;
    [.55, 1.05].forEach(function (z) {
      if (fx) add(x + y + 9, poly([P(x + .15, y + d, z), P(x + w - .15, y + d, z), P(x + w - .15, y + d, z + .22), P(x + .15, y + d, z + .22)]), '#1F2A38');
      else add(x + y + 9, poly([P(x + w, y + .15, z), P(x + w, y + d - .15, z), P(x + w, y + d - .15, z + .22), P(x + w, y + .15, z + .22)]), '#1F2A38');
    });
    for (var i = 0; i < 5; i++) {
      var cx = fx ? x + .3 + i * .72 : x + .5, cy = fx ? y + .5 : y + .3 + i * .72;
      if ((fx ? cx + .5 : cy + .5) < (fx ? x + w : y + d)) box(cx, cy, 1.7, .5, .5, .22, ['#5D6878', '#3F4957', '#343C48']);
    }
    for (var j = 0; j < 4; j++) {
      var ex = fx ? x + j * 1.0 : x + w + .35, ey = fx ? y + d + .3 : y + j * 1.0, ew = fx ? .85 : .45, ed = fx ? .45 : .85;
      box(ex, ey, 0, ew, ed, .5, ['#E9EDF2', '#BCC5D0', '#9DA8B5']);
      if (fx) add(ex + ey + 2, poly([P(ex, ey + ed, .32), P(ex + ew, ey + ed, .32), P(ex + ew, ey + ed, .4), P(ex, ey + ed, .4)]), '#3FBF7F');
      else add(ex + ey + 2, poly([P(ex + ew, ey, .32), P(ex + ew, ey + ed, .32), P(ex + ew, ey + ed, .4), P(ex + ew, ey, .4)]), '#3FBF7F');
    }
    cur.sort(function (p, q) { return p.k - q.k; });
    var paths = cur; cur = S;
    var c = P(x + w / 2, y + d / 2, 1.7), lab = P(x + w / 2, y + d / 2, 4.2);
    dcs.push({ paths: paths, name: name, link: 'M' + pt(c) + ' L' + pt(N[at].s), lead: 'M' + pt(c) + ' L' + pt([lab[0], lab[1] + 26]), lx: f(lab[0]), ly: f(lab[1] - 6), ly2: f(lab[1] + 16) });
  });

  // Markup
  function pathTag(s) {
    return '<path d="' + s.d + '" fill="' + (s.fill || 'none') + '" stroke="' + s.stroke + '" stroke-width="' + s.sw + '"' +
      (s.tf ? ' transform="' + s.tf + '"' : '') + ' stroke-linejoin="round"/>';
  }
  var h = [];
  h.push('<svg viewBox="0 0 1240 820" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><g class="gx-cam"><g class="gx-drift">');
  h.push('<path d="' + ground + '" fill="#10161F" stroke="#1C2633"/><path d="' + grid + '" fill="none" stroke="#141C27"/>');
  sites.forEach(function (st, i) {
    h.push('<path class="gx-pad" data-i="' + i + '" d="' + st.pad + '" stroke-width="1.5"/>');
    h.push('<text class="gx-padt" data-i="' + i + '" x="' + st.tx + '" y="' + st.ty + '" text-anchor="middle" font-family="' + MONO + '" font-size="14" letter-spacing="1.5">' + st.name + '</text>');
  });
  S.forEach(function (s) { h.push(pathTag(s)); });
  steam.forEach(function (m) {
    h.push('<circle class="gx-steam" cx="' + m.x + '" cy="' + m.y + '" r="18" fill="#B7C1CE" style="animation-delay:' + m.dl + 's"/>');
  });
  dcs.forEach(function (dc, i) {
    h.push('<g class="gx-dc" data-i="' + i + '"><path d="' + dc.link + '" fill="none" stroke="#FFB547" stroke-width="4" stroke-dasharray="5 6"/>');
    dc.paths.forEach(function (s) { h.push(pathTag(s)); });
    h.push('<path d="' + dc.lead + '" stroke="#FFB547" stroke-width="1.2"/>');
    h.push('<text x="' + dc.lx + '" y="' + dc.ly + '" text-anchor="middle" font-size="28" font-weight="700" fill="#FFFFFF">Data Center</text>');
    h.push('<text x="' + dc.lx + '" y="' + dc.ly2 + '" text-anchor="middle" font-family="' + MONO + '" font-size="14" letter-spacing="1.5" fill="#FFB547">+ BESS · ' + dc.name + '</text></g>');
  });
  lines.forEach(function (l) {
    h.push('<g class="gx-line" data-id="' + l.id + '">');
    [l.d1, l.d2].forEach(function (d) { h.push('<path class="gx-halo" d="' + d + '"/>'); });
    [l.d1, l.d2].forEach(function (d) { h.push('<path class="gx-base" d="' + d + '"/>'); });
    [l.d1, l.d2].forEach(function (d, k) { h.push('<path class="gx-pulse' + (k ? ' gx-p2' : '') + '" d="' + d + '" pathLength="1"/>'); });
    h.push('</g>');
  });
  lines.forEach(function (l) {
    h.push('<g class="gx-tag" data-id="' + l.id + '"><rect x="' + f(l.mx - 42) + '" y="' + f(l.my - 52) + '" width="84" height="32" rx="4"/>' +
      '<text x="' + l.mx + '" y="' + f(l.my - 30) + '" text-anchor="middle" font-family="' + MONO + '" font-size="17" font-weight="700" fill="#0B0F14"></text></g>');
  });
  labels.forEach(function (lb) {
    h.push('<text x="' + lb.x + '" y="' + lb.y + '" text-anchor="middle" font-family="' + MONO + '" font-size="13" letter-spacing="1.5" fill="#8A96A8">' + lb.t + '</text>');
  });
  h.push('</g></g></svg>');
  host.innerHTML = h.join('');

  // Scenarios (illustrative)
  var SC = [
    { site: -1, load: {}, trip: [], cam: [10.5, 10.5, .86], step: 'BASELINE', title: 'One plant, one grid',
      body: 'A nuclear plant feeds the whole grid through 345 kV lines. Every line is within its limit.', verdict: 'STABLE', v: 0 },
    { site: 0, load: { 'N-GS': '92%' }, trip: [], cam: [10.9, 6.6, .96], step: 'SITE 1 / 4', title: 'Next to the plant',
      body: 'Power reaches the data center in one short hop. The lines carry the extra load comfortably.', verdict: 'GOOD SITE', v: 0 },
    { site: 1, load: { 'HUB-L': '118%', 'GS-L': '104%' }, trip: [], cam: [8.5, 13.5, .96], step: 'SITE 2 / 4', title: 'Far west',
      body: 'Power has to cross the hub and the west corridor to get here. Two lines run past their limit.', verdict: 'RISKY', v: 1 },
    { site: 2, load: { 'HUB-R': '121%' }, trip: ['GS-R'], cam: [14.9, 6.8, .96], step: 'SITE 3 / 4', title: 'East, one weak corridor',
      body: 'Only one strong path feeds this area. It overloads, and the backup line trips off.', verdict: 'POOR SITE', v: 2 },
    { site: 3, load: { 'HUB-B': '126%', 'L-B': '109%' }, trip: ['R-B'], cam: [16.5, 13.5, .96], step: 'SITE 4 / 4', title: 'Far south',
      body: 'Farthest from the plant. Long paths overload, and one trip pushes the flow onto other lines.', verdict: 'POOR SITE', v: 2 }
  ];
  var VCLASS = ['gx-good', 'gx-warn', 'gx-bad'];
  var camEl = host.querySelector('.gx-cam');
  var panel = document.querySelector('.gx-card');
  function q(sel) { return document.querySelector(sel); }
  function each(sel, fn) { Array.prototype.forEach.call(host.querySelectorAll(sel), fn); }

  function apply(k) {
    var s = SC[k];
    var cp = P(s.cam[0], s.cam[1], 1), z = s.cam[2];
    camEl.style.transform = 'translate(' + Math.round(620 - z * cp[0]) + 'px,' + Math.round((s.site < 0 ? 430 : 450) - z * cp[1]) + 'px) scale(' + z + ')';
    each('.gx-pad', function (el) { el.classList.toggle('on', +el.getAttribute('data-i') === s.site); });
    each('.gx-padt', function (el) { el.classList.toggle('on', +el.getAttribute('data-i') === s.site); });
    each('.gx-dc', function (el) { el.classList.toggle('on', +el.getAttribute('data-i') === s.site); });
    each('.gx-line', function (el) {
      var id = el.getAttribute('data-id'), pct = s.load[id], tr = s.trip.indexOf(id) >= 0, hv = !!pct && parseInt(pct, 10) >= 100;
      el.classList.toggle('hot', hv); el.classList.toggle('trip', tr);
    });
    each('.gx-tag', function (el) {
      var id = el.getAttribute('data-id'), pct = s.load[id], tr = s.trip.indexOf(id) >= 0, hv = !!pct && parseInt(pct, 10) >= 100;
      el.classList.toggle('hot', hv); el.classList.toggle('trip', tr); el.classList.toggle('on', hv || tr);
      el.querySelector('text').textContent = tr ? 'TRIP' : (pct || '');
    });
    if (panel) {
      q('#gx-step').textContent = s.step; q('#gx-title').textContent = s.title; q('#gx-body').textContent = s.body;
      var vd = q('#gx-verdict'); vd.textContent = s.verdict; vd.className = 'gx-verdict ' + VCLASS[s.v];
      panel.classList.remove('in'); void panel.offsetWidth; panel.classList.add('in');
    }
  }
  var k = 0;
  apply(0);
  setInterval(function () { k = (k + 1) % SC.length; apply(k); }, 7500);
})();
