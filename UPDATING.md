# Updating the Lagos RISE map

Public map: https://mucsworld.github.io/Lagosrisemapping/

The map and web Attribute Table Studio read the same published data files. Updating those files updates both. Saving edits in QGIS alone does not update the website. The web panel is a view-only custom viewer; the desktop QGIS plugin itself is not running in the browser.

## 1. Prepare and check the new data in QGIS

Back up the working GeoPackage and project first. Open `Lagos_RISE_Community_Sites.qgz` using the supplied `Open in QGIS.cmd` launcher. Edit the existing layers, or point them at the updated GeoPackage. Keep the five layer names, their order, and field names unchanged. If the new delivery contains only additions, merge them into the existing data and check duplicates; if it is a full replacement, replace the records rather than append them.

Save edits. Check feature counts, missing point locations, duplicates, and the LGA/ward/community values. Use the desktop Attribute Table Studio for review if helpful. Keep the existing public field selection: the full GeoPackage contains more fields than this website publishes.

## 2. Export to a separate folder

Use qgis2web's Create web map and choose Leaflet. Export into a NEW folder, keeping the original five layers and OpenStreetMap in their original order. This preserves the expected generated names. Do not export directly over the live website files: a fresh qgis2web index would remove the custom table panel and satellite switch.

For an update with the same fields and layers, copy only these five files from the new export's `data` folder:

| Layer | File in the published repository |
|---|---|
| Markets | `data/Markets_5.js` |
| Men gathering points | `data/Mengatheringpoints_4.js` |
| Women gathering points | `data/Womengatheringpoints_3.js` |
| Community leader houses | `data/Communityleaderhouses_2.js` |
| Motor parks | `data/Motorparks_1.js` |

The filename AND the `json_...` variable declared inside each file must match the existing version. If the exporter generates different names or numbers, stop and reconcile the layer order/export settings before uploading; renaming a file alone is insufficient. Check the exported properties contain only intended public fields.

If layer names, field names, categories, or styling change, the map code and table configuration may also need updating. Treat that as a template update instead of a data-only replacement.

## 3. Publish the five data files

1. Sign in to GitHub and open https://github.com/Mucsworld/Lagosrisemapping/tree/main/data .
2. Choose **Add file > Upload files** inside the `data` folder.
3. Upload the five replacement `.js` files (not the GeoPackage or the whole new export).
4. Commit the changes to `main` with a description such as `Update community sites - 2026-11-15`.
5. Open the repository's **Actions** tab and wait for the Pages deployment to succeed.
6. Open the public map and hard-refresh it. Check all five table counts, search a changed site, click its row to check its position, and check both basemaps.

The public URL stays the same. Preserve `index.html`, `css/attribute-studio.css`, `js/attribute-studio.js`, and all other existing map assets during a data-only update. Public visitors can download filtered CSVs but cannot save edits back to QGIS or GitHub through the table.

GitHub upload reference: https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository

## Ward boundaries (added 9 November 2026)

The boundary layer uses `data/Wards.js`, `js/ward-boundaries.js`, and `css/ward-boundaries.css`. Preserve these files and the references to them in `index.html` during site-point updates. The LGA and ward dropdowns are populated automatically from the boundary data, and affect boundaries only. Labels use the `ward` value.

To replace boundaries, export the new polygon layer to WGS84 (EPSG:4326), retaining `fid`, `lga`, and `ward`. Prepare `data/Wards.js` as `var json_Wards = <GeoJSON FeatureCollection>;`, with each feature also containing a `label_point` property in `[latitude, longitude]` order calculated from a point on the polygon surface. Keep valid Polygon/MultiPolygon geometry. Replace this data file and verify both filters, labels and boundary placement before publishing. A normal qgis2web polygon export needs adaptation to this format; do not merely rename it.
