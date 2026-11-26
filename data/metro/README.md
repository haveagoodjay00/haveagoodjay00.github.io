# Metro map data (work in progress)

Inputs for a planned Home hero: a 3D map of the Seoul metropolitan area with
345 kV substation headroom. Not used by the live site yet.

- `metro_boundaries_enc.txt`: Seoul (11), Incheon (23) and Gyeonggi (31)
  municipality outlines, simplified from southkorea/southkorea-maps
  (kostat 2013, `skorea_municipalities_geo_simple.json`). One line per area:
  `code|name|ring#ring`; a ring is `x0,y0 dx,dy ...` in 1/200 degree units
  (lon = x/200, lat = y/200), first point absolute, then running deltas.
- `kepco_345kv_headroom_2026-11-26.txt`: KEPCO Cyber Branch, supply headroom
  by address (345 kV level), looked up on 2026-11-26. Substation names are
  masked by the site. Gyeonggi is partly done; the missing areas are listed at
  the end of the file.
