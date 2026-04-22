/** UN Geoscheme-based region definitions used throughout the app.
 *  These match the groupings applied in scripts/02_preprocess.py.
 *  Source: UN Statistics Division geoscheme, adjusted to align with EM-DAT conventions.
 */

export const REGIONS = [
  "Sub-Saharan Africa",
  "North Africa & Middle East",
  "South Asia",
  "Southeast Asia",
  "East Asia & Pacific",
  "Central Asia",
  "Europe",
  "North America",
  "Latin America & Caribbean",
  "Oceania",
] as const;

export type RegionName = (typeof REGIONS)[number];

export const REGION_COUNTRY_LISTS: Record<RegionName, string[]> = {
  "Sub-Saharan Africa": [
    "Angola","Benin","Botswana","Burkina Faso","Burundi","Cameroon","Cape Verde",
    "Central African Republic","Chad","Comoros","Democratic Republic of the Congo",
    "Republic of the Congo","Côte d'Ivoire","Djibouti","Equatorial Guinea","Eritrea",
    "Eswatini","Ethiopia","Gabon","Gambia","Ghana","Guinea","Guinea-Bissau","Kenya",
    "Lesotho","Liberia","Madagascar","Malawi","Mali","Mauritania","Mauritius",
    "Mozambique","Namibia","Niger","Nigeria","Rwanda","São Tomé and Príncipe","Senegal",
    "Sierra Leone","Somalia","South Africa","South Sudan","Tanzania","Togo","Uganda",
    "Zambia","Zimbabwe",
  ],
  "North Africa & Middle East": [
    "Algeria","Egypt","Libya","Morocco","Sudan","Tunisia","Western Sahara","Bahrain",
    "Iraq","Iran","Israel","Jordan","Kuwait","Lebanon","Oman","Palestine","Qatar",
    "Saudi Arabia","Syria","United Arab Emirates","Yemen","Turkey","Cyprus",
  ],
  "South Asia": [
    "Afghanistan","Bangladesh","Bhutan","India","Maldives","Nepal","Pakistan","Sri Lanka",
  ],
  "Southeast Asia": [
    "Brunei","Cambodia","Timor-Leste","Indonesia","Laos","Malaysia","Myanmar",
    "Philippines","Singapore","Thailand","Vietnam",
  ],
  "East Asia & Pacific": [
    "China","Hong Kong","Macao","Mongolia","North Korea","South Korea","Japan","Taiwan",
    "Australia","Fiji","Kiribati","Marshall Islands","Micronesia","Nauru","New Zealand",
    "Palau","Papua New Guinea","Samoa","Solomon Islands","Tonga","Tuvalu","Vanuatu",
  ],
  "Central Asia": [
    "Kazakhstan","Kyrgyzstan","Tajikistan","Turkmenistan","Uzbekistan",
    "Armenia","Azerbaijan","Georgia",
  ],
  "Europe": [
    "Albania","Andorra","Austria","Belarus","Belgium","Bosnia and Herzegovina","Bulgaria",
    "Croatia","Czech Republic","Denmark","Estonia","Finland","France","Germany","Greece",
    "Hungary","Iceland","Ireland","Italy","Kosovo","Latvia","Liechtenstein","Lithuania",
    "Luxembourg","Malta","Moldova","Monaco","Montenegro","Netherlands","North Macedonia",
    "Norway","Poland","Portugal","Romania","Russia","San Marino","Serbia","Slovakia",
    "Slovenia","Spain","Sweden","Switzerland","Ukraine","United Kingdom","Vatican City",
  ],
  "North America": ["Canada","Mexico","United States of America"],
  "Latin America & Caribbean": [
    "Argentina","Antigua and Barbuda","Bahamas","Belize","Bolivia","Brazil","Barbados",
    "Chile","Colombia","Costa Rica","Cuba","Dominica","Dominican Republic","Ecuador",
    "El Salvador","Grenada","Guatemala","Guyana","Haiti","Honduras","Jamaica",
    "Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Suriname",
    "Trinidad and Tobago","Uruguay","Venezuela","Panama","Paraguay","Nicaragua","Peru",
  ],
  "Oceania": [
    "Australia","Fiji","Papua New Guinea","Solomon Islands","Vanuatu","Samoa","Tonga",
    "Kiribati","Micronesia","Marshall Islands","Nauru","Palau","Tuvalu","New Zealand",
  ],
};

export const REGION_RATIONALE =
  "Regions follow the UN Statistics Division Geoscheme (M49), which is also used as the " +
  "basis for EM-DAT regional classifications — the source database for the original " +
  "Ronco et al. dataset. This ensures consistency with the original research.";
