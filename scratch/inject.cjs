const fs = require('fs');
let code = fs.readFileSync('src/backend', 'utf8');

if(!code.includes('create_dieu_khoan')) {
  const injection = `        if (action === 'create_dieu_khoan') {
            const rs = createDieuKhoan_(payload)
            clearGetCache_()
            return bg_json({ ok: true, action, ...rs })
        }
        if (action === 'update_dieu_khoan') {
            const rs = updateDieuKhoan_(payload)
            clearGetCache_()
            return bg_json({ ok: true, action, ...rs })
        }
        if (action === 'delete_dieu_khoan') {
            const rs = deleteDieuKhoan_(payload)
            clearGetCache_()
            return bg_json({ ok: true, action, ...rs })
        }\n`;

  code = code.replace(/return bg_json\(\{ ok: false, error: 'INVALID_ACTION', action \}\)/, injection + "        return bg_json({ ok: false, error: 'INVALID_ACTION', action })");
  
  const funcs = `
/* =========================
 * CRUD ĐIỀU KHOẢN
 * ========================= */
function createDieuKhoan_(payload) {
    const sh = getSheet_(BG_SHEETS.dieu_khoan)
    const id = Utilities.getUuid()
    sh.appendRow([
        id,
        payload.Ma_khach_hang || '',
        payload.Ten_khach_hang || '',
        payload.Ma_cong_ty || '',
        payload.Ten_cong_ty || '',
        payload.Noi_dung || ''
    ])
    return { inserted_id: id }
}

function updateDieuKhoan_(payload) {
    const sh = getSheet_(BG_SHEETS.dieu_khoan)
    const id = payload.ID
    if (!id) throw new Error('MISSING_ID')
    const lastRow = sh.getLastRow()
    if (lastRow < 2) throw new Error('NOT_FOUND')
    const data = sh.getRange(2, 1, lastRow - 1, 1).getValues()
    let foundRow = -1
    for (let i = 0; i < data.length; i++) {
        if (String(data[i][0]) === String(id)) {
            foundRow = i + 2; break;
        }
    }
    if (foundRow === -1) throw new Error('NOT_FOUND')
    sh.getRange(foundRow, 2, 1, 5).setValues([[
        payload.Ma_khach_hang || '',
        payload.Ten_khach_hang || '',
        payload.Ma_cong_ty || '',
        payload.Ten_cong_ty || '',
        payload.Noi_dung || ''
    ]])
    return { updated_id: id }
}

function deleteDieuKhoan_(payload) {
    const sh = getSheet_(BG_SHEETS.dieu_khoan)
    const id = payload.ID
    if (!id) throw new Error('MISSING_ID')
    const lastRow = sh.getLastRow()
    if (lastRow < 2) throw new Error('NOT_FOUND')
    const data = sh.getRange(2, 1, lastRow - 1, 1).getValues()
    let foundRow = -1
    for (let i = 0; i < data.length; i++) {
        if (String(data[i][0]) === String(id)) {
            foundRow = i + 2; break;
        }
    }
    if (foundRow === -1) throw new Error('NOT_FOUND')
    sh.deleteRow(foundRow)
    return { deleted_id: id }
}
`;

  code = code + funcs;
  fs.writeFileSync('src/backend', code);
  console.log('Done injection');
} else {
  console.log('Already injected');
}
