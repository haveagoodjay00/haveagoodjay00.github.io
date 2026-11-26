// Home hero: a Korean-style grid, from a coastal nuclear plant to city homes.
// Data center modules are added at one existing 154 kV substation at a time,
// as in my siting study; nearby lines overload or trip.
// Concept animation only: the loadings and module counts are illustrative, not study results.
(function () {
  var host = document.getElementById('gx-scene');
  if (!host) return;

  // Low-angle projection: the ground reads as a wide, flat diamond.
  var K = 40, OX = 620, OY = 0, E = '#0B0F14', PA = .866, PB = .34, RX = PA * 1.4142 * K, RY = PB * 1.4142 * K;
  var VW = 1240, VH = 820, BB = [1e9, 1e9, -1e9, -1e9], track = true;
  var MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
  function P(x, y, z) {
    var p = [OX + (x - y) * PA * K, OY + (x + y) * PB * K - (z || 0) * K];
    if (track) { BB[0] = Math.min(BB[0], p[0]); BB[1] = Math.min(BB[1], p[1]); BB[2] = Math.max(BB[2], p[0]); BB[3] = Math.max(BB[3], p[1]); }
    return p;
  }
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
    add(x + y, ell(bx, by - hk, r2, r2y), '#1A2028', '#7A8594', .8);
    return [bx, by - hk];
  }
  function house(x, y, w, d, h) {
    var r = .32, k = x + y + (w + d) / 2;
    box(x, y, 0, w, d, h, ['#B9B1A3', '#8F877A', '#766F64'], k);
    add(k + .01, poly([P(x, y, h), P(x + w, y, h), P(x + w, y + d / 2, h + r), P(x, y + d / 2, h + r)]), '#8A4F3E', E, .5);
    add(k + .02, poly([P(x, y + d, h), P(x + w, y + d, h), P(x + w, y + d / 2, h + r), P(x, y + d / 2, h + r)]), '#6E3B2E', E, .5);
    add(k + .03, poly([P(x + w, y, h), P(x + w, y + d, h), P(x + w, y + d / 2, h + r)]), '#766F64', E, .5);
  }
  function apartment(x, y, w, d, h) {
    var k = x + y + (w + d) / 2;
    box(x, y, 0, w, d, h, ['#CDD2DA', '#9AA1AC', '#7D8592'], k);
    for (var z = .35, i = 0; z < h - .2; z += .32, i++) {
      add(k + .01, poly([P(x + .08, y + d, z), P(x + w - .08, y + d, z), P(x + w - .08, y + d, z + .12), P(x + .08, y + d, z + .12)]), i % 3 ? '#2A3442' : '#E8B85A');
      add(k + .01, poly([P(x + w, y + .08, z), P(x + w, y + d - .08, z), P(x + w, y + d - .08, z + .12), P(x + w, y + .08, z + .12)]), i % 4 === 1 ? '#E8B85A' : '#232C38');
    }
  }

  // Main metro tile, plus a separate coastal tile far to the north for the nuclear plant
  var G = 22, PT = [-7, -0.8];
  var ground = poly([P(0, 0), P(G, 0), P(G, G), P(0, G)]) + ' ' + poly([P(PT[0], PT[0]), P(PT[1], PT[0]), P(PT[1], PT[1]), P(PT[0], PT[1])]);
  var sea = poly([P(PT[0], -9.4), P(PT[1], -9.4), P(PT[1], PT[0]), P(PT[0], PT[0])]);
  var waves = '';
  for (var wv = 0; wv < 3; wv++) waves += 'M' + pt(P(PT[0] + 1 + wv * 1.6, -8.6 + wv * .5)) + ' L' + pt(P(PT[0] + 2.2 + wv * 1.6, -8.6 + wv * .5)) + ' ';
  var grid = '';
  for (var i = 2; i < G; i += 2) grid += 'M' + pt(P(i, 0)) + ' L' + pt(P(i, G)) + ' M' + pt(P(0, i)) + ' L' + pt(P(G, i)) + ' ';

  // Coastal nuclear plant
  var steam = [];
  [coolingTower(-5.9, -2.6, 2.6), coolingTower(-2.2, -6.0, 2.6)].forEach(function (tp, j) {
    [0, 1.5, 3].forEach(function (dl) { steam.push({ x: f(tp[0]), y: f(tp[1] - 8), dl: dl + j * .7 }); });
  });
  cyl(-4.6, -4.6, 1.0, 1.8, ['#A9B5C3', '#7D8897'], '#D3DAE3');
  box(-3.4, -5.4, 0, 1.6, 1.2, 1.2, ['#55606F', '#3A4452', '#2E3743']);

  // Substations
  var N = {}, MET = ['#8B96A5', '#5E6979', '#4A5463'];
  function sub(id, x, y, w, d, nT, gz) {
    var cx = x + w / 2, cy = y + d / 2, gh = gz || 1.4;
    box(x, y, 0, w, d, .06, ['#2C333D', '#1F252D', '#1A1F26'], x + y);
    add(x + y + .01, poly([P(x, y, .3), P(x + w, y, .3), P(x + w, y + d, .3), P(x, y + d, .3)]) +
      ' M' + pt(P(x + w, y + d, 0)) + ' L' + pt(P(x + w, y + d, .3)) + ' M' + pt(P(x, y + d, 0)) + ' L' + pt(P(x, y + d, .3)) +
      ' M' + pt(P(x + w, y, 0)) + ' L' + pt(P(x + w, y, .3)), 'none', '#4C5664', .8);
    var tw = Math.min(.7, w / 3), td = Math.min(.55, d / 2.6);
    box(x + .2, y + .25, .06, tw, td, tw * .9, MET);
    box(x + w - tw - .2, y + .25, .06, tw, td, tw * .9, MET);
    if (nT > 2) box(x + .2, y + d - td - .25, .06, tw, td, tw * .9, MET);
    var gw = Math.min(.8, w / 2.4);
    add(cx + cy + .8, 'M' + pt(P(cx - gw, cy + .2, 0)) + ' L' + pt(P(cx - gw, cy + .2, gh)) + ' L' + pt(P(cx + gw, cy + .2, gh)) +
      ' L' + pt(P(cx + gw, cy + .2, 0)), 'none', '#9AA6B6', 1.6);
    N[id] = { x: cx, y: cy, s: P(cx, cy + .2, gh) };
  }
  sub('SU', -2.6, -2.6, 1.6, 1.6, 2);                // step-up yard at the plant
  sub('GS', 6, 6, 2.6, 2.2, 3);                       // 765/345 kV bulk substation
  sub('HUB', 10, 10, 3.2, 3.2, 3);                    // 345 kV hub
  sub('L', 3, 15, 2.2, 2, 2); sub('R', 15, 3, 2, 2.2, 2); sub('B', 16.3, 16.3, 2.4, 2.4, 2); // 345/154 kV
  // Existing 154/22.9 kV substations = the four candidate data center sites
  sub('S1', 9.4, 2.6, 1.4, 1.2, 2, 1.0); sub('S2', 1.0, 18.2, 1.4, 1.2, 2, 1.0);
  sub('S3', 18.2, 1.0, 1.4, 1.2, 2, 1.0); sub('S4', 19.4, 16.0, 1.4, 1.2, 2, 1.0);
  N.N = { x: -2.6, y: -4.8, s: P(-2.6, -4.8, 1.2) };

  // City: apartments and houses, fed at 22.9 kV
  var feeders = [];
  [[12.2, 18.2, 2.4], [13.4, 18.2, 1.9], [12.2, 19.6, 2.1], [13.6, 19.7, 2.6], [12.4, 21.0, 1.6]].forEach(function (a) { apartment(a[0], a[1], .8, .8, a[2]); });
  [[14.9, 18.4], [14.9, 19.5], [15.0, 20.6], [16.1, 20.8], [17.2, 20.9]].forEach(function (a) { house(a[0], a[1], .7, .6, .38); });
  [[7.8, 18.3, 2.2], [9.0, 18.2, 1.7], [8.0, 19.7, 2.5], [9.3, 19.6, 1.9]].forEach(function (a) { apartment(a[0], a[1], .8, .8, a[2]); });
  [[10.5, 18.4], [10.6, 19.6], [7.9, 21.0], [9.0, 21.0], [10.2, 20.9]].forEach(function (a) { house(a[0], a[1], .7, .6, .38); });
  [[18.4, 8.2, 2.0], [19.7, 8.3, 2.6], [18.5, 9.6, 1.7], [19.8, 9.8, 2.2]].forEach(function (a) { apartment(a[0], a[1], .8, .8, a[2]); });
  [[18.6, 11.1], [19.7, 11.2], [20.8, 11.1], [20.9, 8.6], [21.0, 9.8]].forEach(function (a) { house(a[0], a[1], .7, .6, .38); });
  feeders.push(['S4', 15.2, 19.2], ['S2', 8.6, 19.0], ['S3', 19.0, 9.0]);

  var labels = [['Nuclear plant', 'COAST · 24 kV', -4.6, -4.6, 3.3, 2.3], ['Step-up yard', '24 → 765 kV', -1.8, -1.8, 1.6, 1.0, 150],
    ['Bulk substation', '765 → 345 kV', 7.3, 7.1, 2.0, 1.4], ['Hub substation', '345 kV', 11.6, 11.6, 2.0, 1.4],
    ['West substation', '345 → 154 kV', 4.1, 16, 2.0, 1.4], ['East substation', '345 → 154 kV', 16, 4.1, 2.0, 1.4],
    ['South substation', '345 → 154 kV', 17.5, 17.5, 2.0, 1.4], ['Homes', '22.9 kV → 220 V', 13.6, 19.6, 3.4, 2.7]].map(function (a) {
    var p = P(a[2], a[3], a[4]), base = P(a[2], a[3], a[5]), w = Math.max(a[0].length * 8.6, a[1].length * 7.6) + 26, dx = a[6] || 0;
    return { t: a[0], s: a[1], x: f(p[0] + dx), y: f(p[1]), bx: f(base[0]), by: f(base[1]), w: f(w), dx: dx };
  });

  // Lines on lattice towers: 765 kV (tall), 345 kV, 154 kV (short)
  var PY = 'M-40 220 L-10 40 L0 0 L10 40 L40 220 M-50 50 H50 M-70 90 H70 M-14 62 L21 104 L-28 150 L35 190 M14 62 L-21 104 L28 150 L-35 190 M-21 104 H21 M-35 190 H35 M-50 50 V62 M50 50 V62 M-70 90 V102 M70 90 V102';
  var LINES = [['N', 'SU', .62], ['SU', 'GS', .78], ['GS', 'HUB', .62], ['HUB', 'L', .62], ['HUB', 'R', .62], ['HUB', 'B', .62],
    ['GS', 'L', .62], ['GS', 'R', .62], ['L', 'B', .62], ['R', 'B', .62],
    ['R', 'S1', .42], ['L', 'S2', .42], ['R', 'S3', .42], ['B', 'S4', .42]];
  var lines = LINES.map(function (ab) {
    var A = N[ab[0]], B = N[ab[1]], sc = ab[2], dist = Math.hypot(A.x - B.x, A.y - B.y);
    var n = dist >= 11 ? 2 : dist >= 5 ? 1 : 0, tops = [];
    for (var i = 1; i <= n; i++) {
      var t = i / (n + 1), x = A.x + (B.x - A.x) * t, y = A.y + (B.y - A.y) * t, b = P(x, y, 0);
      add(x + y, PY, 'none', '#8E9BAD', 1.4 / sc, 'translate(' + f(b[0]) + ' ' + f(b[1] - 220 * sc) + ') scale(' + sc + ')');
      tops.push([b[0], b[1] - 220 * sc + 62 * sc]);
    }
    function cond(o) {
      var pts = [[A.s[0] + o * 8, A.s[1]]].concat(tops.map(function (p) { return [p[0] + o * 50 * sc, p[1]]; }), [[B.s[0] + o * 8, B.s[1]]]);
      var d = 'M' + pt(pts[0]);
      for (var i = 1; i < pts.length; i++) {
        var m = [(pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2 + 12];
        d += ' Q' + pt(m) + ' ' + pt(pts[i]);
      }
      return d;
    }
    var mid = tops.length ? tops[Math.floor((tops.length - 1) / 2)] : [(A.s[0] + B.s[0]) / 2, (A.s[1] + B.s[1]) / 2];
    return { id: ab[0] + '-' + ab[1], d1: cond(-1), d2: cond(1), mx: f(mid[0]), my: f(mid[1]), kv: ab[2] > .7 ? 765 : ab[2] > .5 ? 345 : 154 };
  });
  var feederPaths = feeders.map(function (fd) {
    var a = N[fd[0]].s, b = P(fd[1], fd[2], .6);
    return 'M' + pt(a) + ' Q' + pt([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 14]) + ' ' + pt(b);
  });
  S.sort(function (p, q) { return p.k - q.k; });

  // Candidate sites: data center modules line up next to each 154 kV substation
  // [sub, first module x, y, step dx, step dy, module w, d, site name, label dx]
  var SITES = [['S1', 9.4, .7, 1.0, 0, .9, 1.2, 'SITE 1', 0], ['S2', 2.8, 18.3, 1.0, 0, .9, 1.2, 'SITE 2', 0, -1.7],
    ['S3', 19.9, 2.4, 0, 1.0, 1.2, .9, 'SITE 3', 30, 4.4], ['S4', 19.3, 17.6, 0, 1.0, 1.2, .9, 'SITE 4', 130, 2.2]];
  var sites = [], dcs = [], dcCenter = [];
  SITES.forEach(function (st) {
    var sb = N[st[0]], x0 = st[1], y0 = st[2], dx = st[3], dy = st[4], w = st[5], d = st[6];
    var xe = x0 + dx * 3 + w, ye = y0 + dy * 3 + d;
    var px0 = Math.min(x0, sb.x - .9) - .3, py0 = Math.min(y0, sb.y - .8) - .3, px1 = Math.max(xe, sb.x + .9) + .3, py1 = Math.max(ye, sb.y + .8) + .3;
    var lp = P((px0 + px1) / 2, (py0 + py1) / 2, 0);
    sites.push({ pad: poly([P(px0, py0), P(px1, py0), P(px1, py1), P(px0, py1)]), tx: f(lp[0]), ty: f(lp[1] + 22), name: st[7] });
    var mods = [];
    for (var m = 0; m < 4; m++) {
      cur = [];
      var mx = x0 + dx * m, my = y0 + dy * m;
      box(mx, my, 0, w, d, 1.0, ['#D5DCE4', '#9AA5B3', '#77828F']);
      if (dx) add(mx + my + 9, poly([P(mx + .1, my + d, .45), P(mx + w - .1, my + d, .45), P(mx + w - .1, my + d, .62), P(mx + .1, my + d, .62)]), '#1F2A38');
      else add(mx + my + 9, poly([P(mx + w, my + .1, .45), P(mx + w, my + d - .1, .45), P(mx + w, my + d - .1, .62), P(mx + w, my + .1, .62)]), '#1F2A38');
      box(mx + .25, my + .3, 1.0, .4, .4, .18, ['#5D6878', '#3F4957', '#343C48']);
      cur.sort(function (p, q) { return p.k - q.k; });
      mods.push(cur);
    }
    cur = S;
    var c = P((x0 + xe) / 2, (y0 + ye) / 2, 1.0), lab = P((x0 + xe) / 2, (y0 + ye) / 2, st[9] == null ? 3.2 : st[9]);
    lab = [lab[0] + st[8], lab[1]];
    dcCenter.push(c);
    var s1 = sb.s, link = 'M' + pt([c[0] - 6, c[1]]) + ' L' + pt([s1[0] - 6, s1[1]]) + ' M' + pt([c[0] + 6, c[1] + 4]) + ' L' + pt([s1[0] + 6, s1[1] + 4]);
    dcs.push({ mods: mods, name: st[7], link: link, lead: (st[9] != null && st[9] < 0) ? 'M' + pt(c) + ' L' + pt([lab[0], lab[1] - 30]) : 'M' + pt(c) + ' L' + pt([lab[0] - Math.sign(st[8]) * 60, lab[1] + 26]),
      lx: f(lab[0]), ly: f(lab[1] - 6), ly2: f(lab[1] + 16) });
  });

  // Markup
  function pathTag(s) {
    return '<path d="' + s.d + '" fill="' + (s.fill || 'none') + '" stroke="' + s.stroke + '" stroke-width="' + s.sw + '"' +
      (s.tf ? ' transform="' + s.tf + '"' : '') + ' stroke-linejoin="round"/>';
  }
  var h = [];
  h.push('<svg viewBox="0 0 ' + VW + ' ' + VH + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"><g class="gx-cam"><g class="gx-drift">');
  h.push('<path d="' + sea + '" fill="#0E2436" stroke="#163550"/><path d="' + waves + '" stroke="#2C5C82" stroke-width="2" stroke-linecap="round" fill="none"/>');
  h.push('<path d="' + ground + '" fill="#10161F" stroke="#1C2633"/><path d="' + grid + '" fill="none" stroke="#141C27"/>');
  sites.forEach(function (st, i) {
    h.push('<path class="gx-pad" data-i="' + i + '" d="' + st.pad + '" stroke-width="1.5"/>');
    h.push('<text class="gx-padt" data-i="' + i + '" x="' + st.tx + '" y="' + st.ty + '" text-anchor="middle" font-family="' + MONO + '" font-size="14" letter-spacing="1.5">' + st.name + '</text>');
  });
  feederPaths.forEach(function (d) { h.push('<path class="gx-feeder" d="' + d + '"/>'); });
  S.forEach(function (s) { h.push(pathTag(s)); });
  steam.forEach(function (m) {
    h.push('<circle class="gx-steam" cx="' + m.x + '" cy="' + m.y + '" r="18" fill="#B7C1CE" style="animation-delay:' + m.dl + 's"/>');
  });
  dcs.forEach(function (dc, i) {
    h.push('<g class="gx-dc" data-i="' + i + '"><path class="gx-dclink" d="' + dc.link + '"/>');
    dc.mods.forEach(function (paths, m) {
      h.push('<g class="gx-mod" data-m="' + m + '" style="transition-delay:' + (m * .55) + 's">');
      paths.forEach(function (s) { h.push(pathTag(s)); });
      h.push('</g>');
    });
    h.push('</g>');
  });
  lines.forEach(function (l) {
    h.push('<g class="gx-line kv' + l.kv + '" data-id="' + l.id + '">');
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
    h.push('<g class="gx-lbl"><path d="M' + (lb.dx ? f(lb.x - lb.w / 2) + ' ' + f(lb.y - 27) : lb.x + ' ' + lb.y) + ' L' + lb.bx + ' ' + lb.by + '" stroke="#5F6B7D" stroke-width="1.2" stroke-dasharray="3 3"/>' +
      '<rect x="' + f(lb.x - lb.w / 2) + '" y="' + f(lb.y - 50) + '" width="' + lb.w + '" height="46" rx="5" fill="rgba(11,15,20,.88)" stroke="#3A4656"/>' +
      '<text x="' + lb.x + '" y="' + f(lb.y - 29) + '" text-anchor="middle" font-size="16" font-weight="700" fill="#FFFFFF">' + lb.t + '</text>' +
      '<text x="' + lb.x + '" y="' + f(lb.y - 12) + '" text-anchor="middle" font-family="' + MONO + '" font-size="12" letter-spacing="1" fill="#9FB0C4">' + lb.s + '</text></g>');
  });
  dcs.forEach(function (dc, i) {
    h.push('<g class="gx-dc gx-dct" data-i="' + i + '"><path d="' + dc.lead + '" stroke="#FFB547" stroke-width="1.2"/>' +
      '<text x="' + dc.lx + '" y="' + dc.ly + '" text-anchor="middle" font-size="22" font-weight="700" fill="#FFFFFF" stroke="#0B0F14" stroke-width="5" paint-order="stroke">Data center</text>' +
      '<text x="' + dc.lx + '" y="' + dc.ly2 + '" text-anchor="middle" font-family="' + MONO + '" font-size="14" letter-spacing="1.5" fill="#FFB547" stroke="#0B0F14" stroke-width="4" paint-order="stroke">' + dc.name + ' · 154 kV</text></g>');
  });
  h.push('</g></g></svg>');
  host.innerHTML = h.join('');
  track = false;
  // Fit the whole scene (plus room for tags and steam) inside the view
  var FIT = [(BB[0] + BB[2]) / 2, (BB[1] + BB[3]) / 2 - 20, Math.min((VW - 40) / (BB[2] - BB[0]), (VH - 40) / (BB[3] - BB[1] + 110))];

  // Scenarios (illustrative)
  var SC = [
    { site: -1, mods: 0, load: {}, trip: [], step: 'BASELINE', title: "Today's grid",
      body: 'A coastal nuclear plant steps power up to 765 kV. The metro grid steps it down 345 → 154 → 22.9 kV, and homes get 220 V. Every line is within its limit.', verdict: 'STABLE', v: 0 },
    { site: 0, mods: 4, load: {}, trip: [], step: 'SITE 1 / 4', title: 'North 154 kV substation',
      body: 'Closest to where 765 kV power enters the metro grid. Four data center modules connect and the grid still passes N-1.', verdict: 'HOSTS 4 MODULES', v: 0 },
    { site: 1, mods: 3, load: { 'HUB-L': '112%', 'GS-L': '104%' }, trip: [], step: 'SITE 2 / 4', title: 'West 154 kV substation',
      body: 'Two modules fit. The third pushes the west 345 kV corridor past its limit.', verdict: '2 MODULES · RISKY', v: 1 },
    { site: 2, mods: 2, load: { 'R-S3': '124%' }, trip: ['GS-R'], step: 'SITE 3 / 4', title: 'East 154 kV substation',
      body: 'Fed through one weak corridor. The second module overloads it and the backup line trips.', verdict: '1 MODULE · POOR', v: 2 },
    { site: 3, mods: 1, load: { 'HUB-B': '118%', 'B-S4': '109%' }, trip: ['L-B'], step: 'SITE 4 / 4', title: 'South, among the homes',
      body: 'These lines already carry the city’s evening peak. Even one module overloads them.', verdict: 'NO SPARE CAPACITY', v: 2 }
  ];
  var VCLASS = ['gx-good', 'gx-warn', 'gx-bad'];
  var camEl = host.querySelector('.gx-cam');
  var panel = document.querySelector('.gx-card');
  function q(sel) { return document.querySelector(sel); }
  function each(sel, fn) { Array.prototype.forEach.call(host.querySelectorAll(sel), fn); }

  function apply(k) {
    var s = SC[k];
    // Whole grid always in view; a site only gets a slight push-in toward it.
    var cx = FIT[0], cy = FIT[1], z = FIT[2];
    if (s.site >= 0) { var dp = dcCenter[s.site]; cx += (dp[0] - cx) * .18; cy += (dp[1] - cy) * .18; z *= 1.06; }
    camEl.style.transform = 'translate(' + Math.round(VW / 2 - z * cx) + 'px,' + Math.round(VH / 2 - z * cy) + 'px) scale(' + z + ')';
    each('.gx-pad', function (el) { el.classList.toggle('on', +el.getAttribute('data-i') === s.site); });
    each('.gx-padt', function (el) { el.classList.toggle('on', +el.getAttribute('data-i') === s.site); });
    each('.gx-dc', function (el) { el.classList.toggle('on', +el.getAttribute('data-i') === s.site); });
    each('.gx-mod', function (el) { el.classList.toggle('on', +el.getAttribute('data-m') < s.mods); });
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
  setInterval(function () { k = (k + 1) % SC.length; apply(k); }, 8500);
})();
