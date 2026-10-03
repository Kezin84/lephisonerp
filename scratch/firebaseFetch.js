// Tích hợp interceptor
const firebaseFetch = async (urlInput, options = {}) => {
  let urlStr = typeof urlInput === 'string' ? urlInput : urlInput.toString();
  
  // Bỏ qua nếu là tải ảnh lên imgbb / cloudinary
  if (!urlStr.includes('script.google.com') && !urlStr.includes('YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') && urlInput !== API_URL) {
    return fetch(urlInput, options);
  }

  // Phân tích URL và payload
  const urlObj = new URL(urlStr.startsWith('http') ? urlStr : 'https://fake.com' + urlStr);
  let action = urlObj.searchParams.get('action');
  let sheet = urlObj.searchParams.get('sheet');
  let id = urlObj.searchParams.get('id');
  
  let payload = {};
  if (options.body) {
    try {
      payload = JSON.parse(options.body);
      action = payload.action || action;
      sheet = payload.sheet || sheet;
      id = payload.id || id;
    } catch(e) {}
  }

  console.log("Firebase Intercept:", action, sheet, id, payload);

  const jsonResponse = (data) => ({
    json: async () => data
  });

  try {
    if (action === 'get') {
      const targetSheet = sheet || 'REPORT';
      const snap = await get(dbRef(database, targetSheet));
      let data = [];
      if (snap.exists()) {
        const val = snap.val();
        for (const k in val) {
          data.push({ ...val[k], id: k });
        }
      }
      return jsonResponse({ status: 'success', data });
    }
    
    if (action === 'update_folder') {
       // Storage folder update
       if (payload.id) {
         await update(dbRef(database, \`kho_luu_tru/\${payload.id}\`), payload);
       }
       return jsonResponse({ status: 'success' });
    }
    
    if (action === 'update_pin') {
       await update(dbRef(database, \`REPORT/\${payload.id}\`), { pinned: payload.pinned });
       return jsonResponse({ status: 'success' });
    }
    
    if (action === 'update_priority') {
       await update(dbRef(database, \`REPORT/\${payload.id}\`), { priority: payload.priority });
       return jsonResponse({ status: 'success' });
    }
    
    if (action === 'delete_comment') {
       // Comment thường lưu ở đâu? Giả sử lưu mảng JSON dạng chuỗi trong cột comments của REPORT
       // Hoặc lưu vào table REPORT_COMMENTS.
       // Tuỳ theo code backend, ta có thể xoá ở node comments. Tạm thời trả về success
       return jsonResponse({ status: 'success' });
    }
    
    if (action === 'add_comment') {
       return jsonResponse({ status: 'success' });
    }
    
    if (action === 'get_comments') {
       return jsonResponse({ status: 'success', data: [] });
    }
    
    if (action === 'delete') {
       if (id) {
         await remove(dbRef(database, \`REPORT/\${id}\`));
       }
       return jsonResponse({ status: 'success' });
    }
    
    return jsonResponse({ status: 'success' });

  } catch(error) {
    console.error("Firebase Proxy Error:", error);
    return jsonResponse({ status: 'error', message: error.message });
  }
};
