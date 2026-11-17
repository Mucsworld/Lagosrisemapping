# Lagosrisemapping
Lagos RISE community sites map with OpenStreetMap and satellite imagery.

Public map: https://mucsworld.github.io/Lagosrisemapping/

Updated 17 November 2026: includes 6,927 site records across five layers (612 markets, 2,341 men gathering points, 968 women gathering points, 2,550 community leader houses, and 456 motor parks). Select OpenStreetMap or Satellite imagery in the layer control.

The **Ward boundaries** layer contains 376 boundaries across 20 LGAs. Use the Ward boundaries panel to filter by LGA and ward and zoom to the selected area. Labels use the supplied `ward` field and appear at zoom 12 or closer, or whenever a specific ward is selected. On a phone, tap the panel heading to open it. Boundary filters also filter site points and the attribute table using point-in-polygon membership. See [review notes](REVIEW.md) for site labels and unmatched records.

Click **Attribute Table Studio** on the map to browse a view-only table, search all published columns, filter by LGA/ward/community, sort columns, download filtered CSVs, and click a site to locate it on the map. This is a custom web viewer, not the QGIS desktop plugin.

See [Updating the map from QGIS](UPDATING.md) for the data replacement and publishing workflow. Both the map and table use the same point data; SiteDetails.js must also be regenerated to update labels and spatial ward links.



Legend symbols are generated from the map marker styles. Motor parks use red triangles, matching the actual map.

