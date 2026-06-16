const fs = require('fs');
const file = 'c:/chuSonProject/reminder-main/reminder-main/src/components/SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

const regex = /if \(m\.mode === 'create'\) \{[\s\S]*?\} else \{\s*\/\/ Update sequence/;
const match = content.match(regex);

if (match) {
    const sIdx = match.index;
    const eIdx = sIdx + match[0].length - "} else {\n        // Update sequence".length;
    
    // Create replacement logic
    const newLogic = `if (m.mode === 'create') {
        // --- BULK CREATE SEQUENCE ---
        const bulkOfficialItems = [];
        const bulkSaleReportItems = [];
        
        for (const item of validItems) {
          let uploadedUrl = ''
          if (item.base64Img) {
            try {
              const formData = new FormData()
              formData.append('key', 'b202a4bdc79bf1dc72f6f6ded6b74501')
              formData.append('image', item.base64Img)
              const uploadRes = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: formData }).then(r => r.json())
              if (uploadRes.success) uploadedUrl = uploadRes.data.url
            } catch (e) {
              console.error('L?i upload ?nh:', e)
            }
          }
  
          const uploadCloudinary = async (file) => {
            try {
              const formData = new FormData()
              formData.append('upload_preset', 'upload_file')
              formData.append('file', file)
              const uploadRes = await fetch('https://api.cloudinary.com/v1_1/db6fzs3rh/auto/upload', { method: 'POST', body: formData }).then(r => r.json())
              return uploadRes.secure_url || ''
            } catch (e) { return '' }
          }
  
          let linkBG = '', linkMH = '', tenBG = '', tenMH = ''
          if (item.rawFileBaoGia) { linkBG = await uploadCloudinary(item.rawFileBaoGia); tenBG = item.rawFileBaoGia.name; }
          if (item.rawFileMuaHang) { linkMH = await uploadCloudinary(item.rawFileMuaHang); tenMH = item.rawFileMuaHang.name; }
  
          const maHD = 'HD' + Date.now() + Math.floor(Math.random() * 10000);
          hdLen++;
          const soHD = \`H? \${hdLen}\`;
  
          const maKHGen = genMaKhachHang(item.recipient || '', item.customer || '');
          const maCongTyGen = genMaCongTy(item.customer);
  
          const tTruoc = item.goodsTotal?.ttTruoc || item.doanhSoBan || 0;
          const tVat = item.goodsTotal?.vat || 0;
          const tSau = item.goodsTotal?.ttSau || (tTruoc + tVat);
  
          bulkSaleReportItems.push({
              sheet: 'sale_report',
              action: 'add', // Will be wrapped in add_bulk
              ma_hop_dong: maHD,
              so_hop_dong: soHD,
              So_PO: item.soPO,
              Ten_nha_cung_cap: item.productType,
              Ma_khach_hang: maKHGen,
              Ten_khach_hang: item.recipient || item.customer,
              Ma_cong_ty: maCongTyGen,
              Ten_cong_ty: item.customer,
              MST: item.mst,
              created_time: item.createdTime || getFormattedNow(),
              content_of_contract_PO: item.content,
              Tong_tien_truoc_thueVAT: tTruoc,
              Tong_thueVAT: tVat,
              Tong_tien_sau_thueVAT: tSau,
              chiet_khau_tong_truoc_thue: item.grossCom,
              phan_tram_thue_chenh_lech_gia: item.taxPct,
              thue_chenh_lech_gia: item.grossCom * (item.taxPct / 100),
              Tong_thanh_tien_chua_VAT_mua_hang: item.giaMua,
              Tong_CP_don_hang: item.tongCP,
              con_lai: item.netCom,
              account_manager_name: item.am,
              img_save: uploadedUrl,
              link_excel_bao_gia: linkBG,
              link_excel_mua_hang: linkMH,
              ten_file_bao_gia: tenBG,
              ten_file_mua_hang: tenMH
          });
  
          const hdTongRow = [
            maHD, soHD, maKHGen, item.recipient || item.customer, formatNgayTaoHopDong(),
            tTruoc, tVat, tSau, 0, tSau, 0, 0, 0, 0,
            'Chua thanh toA?n d? ', 'ChA-nh th?c', item.content || '', 'VND', 1, '', tTruoc, formatCreatedTimeDateOnly(),
            item.soPO || '', '', item.content || '', item.grossCom || 0, 0, (item.grossCom * (item.taxPct / 100)) || 0, item.taxPct || 0, 0, item.netCom || 0, 0
          ];
          
          let hdChiTietRows = [];
          if (item.goodsItems && item.goodsItems.length > 0) {
            item.goodsItems.forEach((g) => {
              hdChiTietRows.push([
                maHD, soHD, '', g.ten || 'HAng hA3a m?c d?nh', g.dvt || '', '', g.ncc || item.productType || '', '', '', g.moTa || item.content || '', '', '',
                'CA?i', g.soLuong || 1, g.giaBan || 0, 'VND', g.vat || 0, 0, 1, '', 0, 0, g.giaMua || 0
              ]);
            });
          } else {
            hdChiTietRows = [[
               maHD, soHD, '', 'HAng hA3a m?c d?nh', '', '', item.productType || '', '', '', item.content || '', '', '',
              'CA?i', tTruoc, tTruoc, 'VND', 1, 0, 1, '', 0, 0, 0
            ]];
          }
  
          bulkOfficialItems.push({
              hd_tong_quat_row: hdTongRow,
              hd_chi_tiet_rows: hdChiTietRows,
              ma_khach_hang: maKHGen,
              tong_sau_thue: (item.doanhSoBan > 0 ? item.doanhSoBan : 1) // Bypass backend zero check
          });
        }

        const promises = [];
        
        if (bulkSaleReportItems.length > 0) {
            promises.push(
                fetch(BASE_URL, { 
                    method: 'POST', 
                    body: JSON.stringify({
                        sheet: 'sale_report',
                        action: 'add_bulk',
                        items: bulkSaleReportItems
                    })
                }).then(r => r.json()).catch(e => console.error("Sale Report Bulk error:", e))
            );
        }

        if (bulkOfficialItems.length > 0) {
            const formData = new URLSearchParams();
            formData.set('action', 'save_contract_official_bulk');
            formData.set('payload', JSON.stringify({
                action: 'save_contract_official_bulk',
                items: bulkOfficialItems
            }));
    
            promises.push(
              fetch(BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
              }).then(r => r.json()).catch(e => console.error("Official Bulk error:", e))
            );
        }

        await Promise.all(promises);
        loadData()
      } else {
        // Update sequence`;

    content = content.replace(regex, newLogic);
    fs.writeFileSync(file, content);
    console.log("Successfully replaced with bulk save using regex!");
} else {
    console.log("Could not find the block using regex");
}
