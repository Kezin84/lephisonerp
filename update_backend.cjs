const fs = require('fs');
let content = fs.readFileSync('C:/chuSonProject/reminder-main/reminder-main/src/backendOfficial', 'utf-8');

const newCode = `function licenseOldData_postData(payload) {
    const action = (payload.action || "add").toLowerCase();
    if (action === "add") return licenseOldData_addRow(payload);
    if (action === "update") return licenseOldData_updateRow(payload);
    if (action === "delete") return licenseOldData_deleteRow(payload);
    return { status: "error", message: "Invalid action for license_old_data" };
}

function licenseOldData_updateRow(p) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("license_old_data");
    if (!sheet) return { status: "error", message: "Sheet license_old_data khong ton tai" };
    
    const rowIdx = p.ROW_INDEX;
    if (rowIdx) {
        sheet.getRange(rowIdx, 1, 1, 12).setValues([[
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
            p.NAME_FILE || ""
        ]]);
        return { status: "success", action: "update" };
    }
    return { status: "error", message: "Missing ROW_INDEX" };
}

function licenseOldData_deleteRow(p) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("license_old_data");
    if (!sheet) return { status: "error", message: "Sheet license_old_data khong ton tai" };
    
    const rowIdx = p.ROW_INDEX;
    if (rowIdx) {
        sheet.deleteRow(rowIdx);
        return { status: "success", action: "delete" };
    }
    return { status: "error", message: "Missing ROW_INDEX" };
}`;

content = content.replace(/function licenseOldData_postData\(payload\) \{[\s\S]*?return \{ status: "error", message: "Invalid action for license_old_data" \};\s*\}/, newCode);

fs.writeFileSync('C:/chuSonProject/reminder-main/reminder-main/src/backendOfficial', content, 'utf-8');
console.log('Updated backendOfficial successfully');
