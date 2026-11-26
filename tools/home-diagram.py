# Generates the inline SVG one-line diagram used in index.html (section.sl-scene).
# Run: python3 tools/home-diagram.py  -> writes scene.svg.html; paste its <svg> over the one in index.html.
# Colours come from home-hero.css (classes: ic, ic-l, ic-t, pyl, bus, brk, sl-wire, sl-flow f|dc|lv, sl-name, sl-sub, sl-v).
# One-line diagram with simple pictograms for each node (inline SVG).
o = []
def a(s): o.append(s)
def flow(d, cls='f', delay=0): a(f'<path class="sl-wire" d="{d}"/><path class="sl-flow {cls}" style="animation-delay:{delay}s" d="{d}"/>')
def brk(x, y, s=10): a(f'<rect class="brk" x="{x-s/2}" y="{y-s/2}" width="{s}" height="{s}"/>')
def bus(x, y0, y1, label): a(f'<path class="bus" d="M{x} {y0} V{y1}"/><text class="sl-v" x="{x}" y="{y1+24}">{label}</text>')
def text(x, y, t, cls='sl-name', anchor='middle'): a(f'<text class="{cls}" x="{x}" y="{y}" text-anchor="{anchor}">{t}</text>')

# ---------- pictograms ----------
def nuclear(cx, by):
    for dx in (-30, -2):
        x = cx + dx
        a(f'<path class="ic" d="M{x-14} {by} V{by-26} A14 14 0 0 1 {x+14} {by-26} V{by} Z"/>')
    a(f'<rect class="ic" x="{cx+16}" y="{by-22}" width="30" height="22"/><path class="ic-l" d="M{cx+16} {by-15} h30"/>')
    a(f'<path class="ic-l" d="M{cx-52} {by} H{cx+54}"/>')
def wind(cx, by, h=56, d=0):
    a(f'<path class="ic-l" d="M{cx} {by} L{cx} {by-h}"/><path class="ic-l" d="M{cx-12} {by} H{cx+12}"/>')
    a(f'<g transform="translate({cx} {by-h})"><g class="rotor" style="animation-delay:{d}s">'
      + ''.join(f'<path class="blade" d="M0 0 L-2.5 -26 L2 -25 Z" transform="rotate({k*120})"/>' for k in range(3))
      + '</g><circle class="hub" r="3"/></g>')
def solar(cx, by):
    # tilted panel with cells on a stand
    x0, x1, y0, y1, sk = cx - 34, cx + 34, by - 30, by - 12, 10
    a(f'<path class="ic pv" d="M{x0+sk} {y0} H{x1+sk} L{x1} {y1} H{x0} Z"/>')
    for i in range(1, 4):
        xx = x0 + (x1 - x0) * i / 4
        a(f'<path class="ic-t" d="M{xx+sk} {y0} L{xx} {y1}"/>')
    a(f'<path class="ic-t" d="M{x0+sk/2} {(y0+y1)/2} H{x1+sk/2}"/>')
    a(f'<path class="ic-l" d="M{cx-20} {y1} V{by} M{cx+20} {y1} V{by} M{cx-40} {by} H{cx+40}"/>')
def xfmr(cx, cy, s=1.0):
    w, h = 22 * s, 26 * s
    x, y = cx - w / 2, cy - h / 2
    a(f'<rect class="ic xf" x="{x}" y="{y}" width="{w}" height="{h}" rx="2"/>')
    for i in range(1, 4):
        a(f'<path class="ic-t" d="M{x+3} {y+h*i/4} H{x+w-3}"/>')
    a(f'<path class="ic-l" d="M{cx-5*s} {y} V{y-7*s} M{cx+5*s} {y} V{y-7*s}"/>')
def pylon(cx, arms, base):
    top = arms[0] - 18
    a(f'<g class="pyl"><path d="M{cx-17} {base} L{cx-4} {top} M{cx+17} {base} L{cx+4} {top} M{cx-4} {top} L{cx} {top-8} L{cx+4} {top}"/>')
    n = 6
    for i in range(n):
        y0 = base - (base - top) * i / n; y1 = base - (base - top) * (i + 1) / n
        w0 = 17 - 13 * i / n; w1 = 17 - 13 * (i + 1) / n
        a(f'<path class="t" d="M{cx-w0:.1f} {y0:.1f} L{cx+w1:.1f} {y1:.1f} M{cx+w0:.1f} {y0:.1f} L{cx-w1:.1f} {y1:.1f}"/>')
    for ay in arms:
        a(f'<path d="M{cx-24} {ay-4} H{cx+24}"/><path class="t" d="M{cx-24} {ay-4} L{cx-6} {ay+6} M{cx+24} {ay-4} L{cx+6} {ay+6}"/>')
        a(f'<path class="ins" d="M{cx-20} {ay-4} V{ay} M{cx+20} {ay-4} V{ay}"/>')
    a('</g>')
def substation(cx, cy):
    # gantry frame + a large power transformer
    a(f'<path class="ic-l" d="M{cx-44} {cy+40} V{cy-34} M{cx+44} {cy+40} V{cy-34} M{cx-50} {cy-30} H{cx+50}"/>')
    a(f'<path class="ic-t" d="M{cx-44} {cy-30} L{cx-28} {cy-14} M{cx+44} {cy-30} L{cx+28} {cy-14}"/>')
    xfmr(cx, cy + 10, 1.6)
    a(f'<path class="ic-l" d="M{cx-60} {cy+40} H{cx+60}"/><path class="fence" d="M{cx-60} {cy+40} V{cy+28} M{cx-30} {cy+40} V{cy+28} M{cx+30} {cy+40} V{cy+28} M{cx+60} {cy+40} V{cy+28} M{cx-60} {cy+30} H{cx+60}"/>')
def datacenter(x, cy):
    w, h = 120, 58
    y = cy - h / 2
    a(f'<rect class="ic dc" x="{x}" y="{y}" width="{w}" height="{h}" rx="2"/>')
    for i in range(4):
        rx = x + 8 + i * 28
        a(f'<rect class="rack" x="{rx}" y="{y+16}" width="20" height="{h-24}" rx="1.5"/>')
        for j in range(4):
            a(f'<rect class="led" x="{rx+4}" y="{y+21+j*8}" width="12" height="3" style="animation-delay:{-(i*4+j)*0.21:.2f}s"/>')
    a(f'<path class="ic-t" d="M{x} {y+10} H{x+w}"/>')
    for i in range(3):
        a(f'<rect class="ic" x="{x+14+i*34}" y="{y-9}" width="22" height="9"/>')
def factory(x, by):
    a(f'<path class="ic" d="M{x} {by} V{by-30} L{x+22} {by-44} V{by-30} L{x+44} {by-44} V{by-30} L{x+66} {by-44} V{by-30} H{x+96} V{by} Z"/>')
    a(f'<rect class="ic" x="{x+74}" y="{by-64}" width="10" height="34"/>')
    for i in range(4):
        a(f'<rect class="win" x="{x+8+i*22}" y="{by-20}" width="12" height="9"/>')
def homes(x, by):
    a(f'<rect class="ic" x="{x}" y="{by-62}" width="30" height="62"/>')
    for r in range(5):
        for c in range(2):
            a(f'<rect class="win" x="{x+6+c*11}" y="{by-55+r*11}" width="7" height="6"/>')
    for k, hx in enumerate((x + 40, x + 82)):
        a(f'<path class="ic" d="M{hx} {by} V{by-24} L{hx+17} {by-40} L{hx+34} {by-24} V{by} Z"/><rect class="win" x="{hx+12}" y="{by-16}" width="10" height="9"/>')
def poletx(cx, base, top):
    a(f'<path class="pole" d="M{cx} {base} V{top} M{cx-14} {top+4} H{cx+14}"/>')
    a(f'<rect class="ic xf" x="{cx+3}" y="{top+12}" width="12" height="16" rx="2"/>')

# faint drafting grid
g = ''.join(f'M{x} 60 V440 ' for x in range(40, 1441, 40)) + ''.join(f'M0 {y} H1440 ' for y in range(80, 441, 40))
a(f'<path class="sl-grid" d="{g}"/>')

# ---------- generation ----------
nuclear(72, 160); text(72, 184, 'NUCLEAR')
wind(56, 278, 52, 0); wind(92, 278, 60, -.8); text(74, 302, 'WIND')
solar(72, 382); text(72, 406, 'SOLAR')
for y, ys in ((140, 140), (250, 250), (360, 360)):
    flow(f'M130 {y} H178', 'f'); xfmr(190, y, .9); flow(f'M201 {y} H250', 'f'); brk(262, y); flow(f'M267 {y} H310', 'f')
text(190, 112, 'step-up', 'sl-sub')
bus(310, 110, 384, '345 kV')

# ---------- transmission: two circuits on towers ----------
for y, d in ((205, 0), (265, -.6)):
    flow(f'M310 {y} H330', 'f', d); brk(340, y); flow(f'M345 {y} H735', 'f', d); brk(745, y); flow(f'M750 {y} H770', 'f', d)
for px in (440, 560, 680):
    pylon(px, (205, 265), 330)
text(560, 354, 'TRANSMISSION', 'sl-name')

# ---------- substation ----------
bus(770, 160, 310, '345 kV')
flow('M770 235 H798', 'f'); brk(808, 235); flow('M813 235 H852', 'f')
substation(880, 225)
flow('M902 235 H960', 'f')
text(880, 162, 'SUBSTATION · 345/154 kV', 'sl-sub')
bus(960, 100, 380, '154 kV')

# ---------- feeders ----------
flow('M960 130 H990', 'dc'); brk(1000, 130); flow('M1005 130 H1140', 'dc')
datacenter(1140, 130); text(1276, 135, 'DATA CENTER', 'sl-name', 'start')
flow('M960 235 H990', 'f'); brk(1000, 235); flow('M1005 235 H1146', 'f')
factory(1146, 258); text(1276, 240, 'FACTORY', 'sl-name', 'start')
flow('M960 340 H990', 'lv'); brk(1000, 340); flow('M1005 340 H1062', 'lv')
poletx(1072, 382, 318); text(1072, 404, '22.9 kV', 'sl-sub')
flow('M1086 342 H1146', 'lv')
homes(1146, 376); text(1276, 345, 'HOMES', 'sl-name', 'start')

svg = ('<svg viewBox="0 60 1420 370" preserveAspectRatio="xMidYMid meet" aria-hidden="true">'
       '<defs><filter id="slGlow" filterUnits="userSpaceOnUse" x="0" y="0" width="1600" height="500"><feGaussianBlur stdDeviation="2" result="b"/>'
       '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' + ''.join(o) + '</svg>')
open('scene.svg.html', 'w').write(svg); print(len(svg))
