# Data notes — 19 November 2026

All 7,244 community rows and 356 facility rows have usable coordinates. Community sites use gps-Latitude/gps-Longitude; facilities use latitude/longitude. The CSVs have no fid, so IDs are generated from row order separately for each source. Rebuild spatial links whenever replacing records.

Community label rules remain unchanged. Facility labels use Facility_name, published as facility_name. Existing public community fields are retained; facility fields are limited to ID, name, level, LGA, ward and health district. Source CSVs are not uploaded wholesale.

Spatial filters use point-in-polygon membership. Original reported LGA/ward text is preserved. Twelve community sites and one facility (record ID 32) lie outside the supplied polygons and remain visible when all locations are shown. Coordinates were not moved or replaced.

Facility symbols and legends share an SVG medical cross and category colours. Facility labels have white text and a three-pixel outline in the category colour; they receive priority when labels overlap. Existing site symbols, ward geometry, basemaps and controls are retained.

The local preparation script prepare_nov19_data.py validates coordinates and regenerates the six point files plus SiteDetails.js from the CSVs and existing ward geometry.
