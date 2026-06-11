const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'backendOfficial');
let content = fs.readFileSync(filePath, 'utf-8');

let changes = 0;

// 1. getData: 13 -> 14 columns
const getDataRegex = /sheet\.getRange\(2,\s*1,\s*lastRow\s*-\s*1,\s*13\)\.getValues\(\)/;
if (content.match(getDataRegex)) {
  content = content.replace(getDataRegex, 'sheet.getRange(2, 1, lastRow - 1, 14).getValues()');
  changes++;
  console.log('✅ getData: 13 -> 14 columns');
}

// 2. updateRow: 13 -> 14 columns
const updateRegex = /sheet\.getRange\(rowIdx,\s*1,\s*1,\s*13\)\.setValues\(\[\[\s*p\.LICENSE_ID[^]*?p\.IS_GIA_HAN\s*\|\|\s*""\s*\]\]\)/;
if (content.match(updateRegex)) {
  const newUpdate = `sheet.getRange(rowIdx, 1, 1, 14).setValues([[
            p.LICENSE_ID || "",
            p.CUSTOMER || "",
            p.PRODUCT_NAME || "",
            p.LOCALIZATION || "",
            p.LICENSE_VOLUME || "",
            p.LICENSE_DESCRIPTION || "",
            p.DATE_OF_LICENSE || "",
            p.EXPIRATION_TIME || "",
            p.LICENSE_TYPE || "",
            p.PRODUCT_CODE || "",
            p.LINK_FILE || "",
            p.NAME_FILE || "",
            p.IS_GIA_HAN || "",
            p.SO_NGAY_HIEU_LUC || ""
        ]])`;
  content = content.replace(updateRegex, newUpdate);
  changes++;
  console.log('✅ updateRow: 13 -> 14 columns');
}

// 3. addRow: 13 -> 14 columns
const addRegex = /sheet\.appendRow\(\[\s*params\.LICENSE_ID[^]*?params\.IS_GIA_HAN\s*\|\|\s*""\s*\]\)/;
if (content.match(addRegex)) {
  const newAdd = `sheet.appendRow([
        params.LICENSE_ID || "",
        params.CUSTOMER || "",
        params.PRODUCT_NAME || "",
        params.LOCALIZATION || "",
        params.LICENSE_VOLUME || "",
        params.LICENSE_DESCRIPTION || "",
        params.DATE_OF_LICENSE || "",
        params.EXPIRATION_TIME || "",
        params.LICENSE_TYPE || "",
        params.PRODUCT_CODE || "",
        params.LINK_FILE || "",
        params.NAME_FILE || "",
        params.IS_GIA_HAN || "",
        params.SO_NGAY_HIEU_LUC || ""
      ])`;
  content = content.replace(addRegex, newAdd);
  changes++;
  console.log('✅ addRow: 13 -> 14 columns');
}

if (changes > 0) {
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`\nDONE: ${changes} functions updated`);
} else {
  console.log('ERROR: No changes applied');
}
