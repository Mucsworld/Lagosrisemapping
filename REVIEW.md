# Map update — 12 November 2026

This update was reviewed locally and approved for publication to the existing GitHub Pages map.

## Points

4,881 records replace the previous dataset: 461 markets, 1,608 men gathering points, 736 women gathering points, 1,743 community leader houses and 333 motor parks. Existing published attributes are retained. The new display labels and spatial links are stored separately in `data/SiteDetails.js`.

## Labels

- Markets: `market_name`.
- Men gathering: `men_location_name — men_gathering_type`.
- Community leaders: `leader_title`; an exact, case-insensitive `other` is replaced with `leader_title_other`.
- Women gathering: `women_group_name — women_group_type`; an exact, case-insensitive `other` in the name is replaced with `women_group_type_other`, as requested.
- Motor parks: `community`.

Labels appear at the zoom needed to fit the site's ward in the map viewport (minimum zoom 13). Sites outside the boundaries use zoom 15. Labels are suppressed where they overlap; zooming closer reveals more labels. Existing popup details remain available by clicking a point.

## Linked filters

The ward panel filters boundary polygons, all five site layers and Attribute Table Studio together. Membership is calculated by intersecting each point with the supplied ward polygons, rather than matching reported text fields. The original reported LGA/ward values in the site table are preserved and may differ from the geographic boundary assignment. Additional table search and filters narrow the selected area. CSV export respects both the boundary selection and table filters. Resetting the ward panel restores all sites and boundaries.

Eight records are outside the polygons: Markets ID 317; Women gathering ID 489; Community leaders IDs 594, 706, 958, 971, 974, 1261. They remain visible in the unfiltered map/table. No point coordinates were moved.

Ward outlines increased from 2 to 3 pixels. Ward geometry, colours, basemaps and the remaining map controls are preserved.

## Future data updates

Point replacements must now also regenerate `data/SiteDetails.js` so labels and spatial links match the new record IDs. Replacing the five data files alone is insufficient. The local preparation script is `prepare_review_data.py`; it reads the source GeoPackage without modifying it. Its source path and target folder are explicit at the top. Review geometry, labels and unmatched records each time before publishing.

