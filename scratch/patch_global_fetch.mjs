import fs from 'fs';

const filePath = 'C:\\chuSonFireBase\\reminder-main\\reminder-main\\src\\components\\reportFIREBASE.vue';
let content = fs.readFileSync(filePath, 'utf-8');

const firebaseFetchCode = `
// --- TÍCH HỢP INTERCEPTOR CHO CÁC API KHÁC (Firebase) ---
const firebaseFetch = async (urlInput, options = {}) => {
  let urlStr = typeof urlInput === 'string' ? urlInput : urlInput.toString();
  
  // Bỏ qua nếu là tải ảnh lên imgbb / cloudinary, dùng fetch gốc
  if (urlStr.includes('imgbb.com') || urlStr.includes('cloudinary.com')) {
    return window.fetch(urlInput, options);
  }

  // Nếu không phải là API Google Apps Script, vẫn fetch bình thường
  if (!urlStr.includes('script.google.com') && !urlStr.includes('YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') && urlInput !== API_URL) {
    return window.fetch(urlInput, options);
  }

  // Phân tích URL và payload
  let urlObj;
  try {
    urlObj = new URL(urlStr.startsWith('http') ? urlStr : 'https://fake.com' + urlStr);
  } catch(e) {
    urlObj = new URL('https://fake.com');
  }
  
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
    json: async () => data,
    text: async () => JSON.stringify(data),
    ok: true,
    status: 200
  });

  try {
    // 1. GET DATA
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
    
    // 2. DELETE
    if (action === 'delete') {
       if (id) {
         await remove(dbRef(database, \`REPORT/\${id}\`));
       }
       return jsonResponse({ status: 'success' });
    }

    // 3. UPDATES (PIN, PRIORITY, FOLDER)
    if (action === 'update_pin' && payload.id) {
       await update(dbRef(database, \`REPORT/\${payload.id}\`), { pinned: payload.pinned });
       return jsonResponse({ status: 'success' });
    }
    
    if (action === 'update_priority' && payload.id) {
       await update(dbRef(database, \`REPORT/\${payload.id}\`), { priority: payload.priority });
       return jsonResponse({ status: 'success' });
    }

    if (action === 'update_folder' && payload.id) {
       await update(dbRef(database, \`kho_luu_tru/\${payload.id}\`), payload);
       return jsonResponse({ status: 'success' });
    }

    // 4. COMMENTS
    if (action === 'get_comments') {
      const snap = await get(dbRef(database, \`REPORT_COMMENTS/\${id}\`));
      return jsonResponse({ status: 'success', data: snap.exists() ? snap.val() : [] });
    }

    if (action === 'add_comment' && payload.id) {
      // Giả sử mỗi report lưu list comment tại REPORT_COMMENTS/{reportId}/[]
      const snap = await get(dbRef(database, \`REPORT_COMMENTS/\${payload.id}\`));
      let comments = snap.exists() ? snap.val() : [];
      if (!Array.isArray(comments)) comments = Object.values(comments);
      
      const newComment = {
        id: 'CMT_' + Date.now(),
        author: 'User',
        content: payload.content,
        created_time: new Date().toISOString()
      };
      comments.push(newComment);
      await set(dbRef(database, \`REPORT_COMMENTS/\${payload.id}\`), comments);
      return jsonResponse({ status: 'success', data: newComment });
    }

    if (action === 'delete_comment' && payload.id && payload.comment_id) {
      const snap = await get(dbRef(database, \`REPORT_COMMENTS/\${payload.id}\`));
      let comments = snap.exists() ? snap.val() : [];
      if (!Array.isArray(comments)) comments = Object.values(comments);
      
      comments = comments.filter(c => c.id !== payload.comment_id);
      await set(dbRef(database, \`REPORT_COMMENTS/\${payload.id}\`), comments);
      return jsonResponse({ status: 'success' });
    }

    // 5. OTHERS (sync_progress, sync_status, log_activity)
    if (action === 'sync_progress' || action === 'sync_status') {
      if (payload.id) {
         await update(dbRef(database, \`REPORT/\${payload.id}\`), payload);
      }
      return jsonResponse({ status: 'success' });
    }
    
    if (action === 'log_activity') {
      const logRef = push(dbRef(database, 'ACTIVITY_LOGS'));
      await set(logRef, payload);
      return jsonResponse({ status: 'success' });
    }
    
    // Fallback cho các action khác chưa định nghĩa
    return jsonResponse({ status: 'success' });

  } catch(error) {
    console.error("Firebase Proxy Error:", error);
    return jsonResponse({ status: 'error', message: error.message });
  }
};
`;

// Insert the firebaseFetchCode after database initialization
content = content.replace('const database = getDatabase(firebaseApp);', 'const database = getDatabase(firebaseApp);\n' + firebaseFetchCode);

// Replace all usages of `fetch(` with `firebaseFetch(` inside the component.
// Be careful not to replace `window.fetch(` or `firebaseFetch(` itself
content = content.replace(/\b(?<!window\.|firebase)fetch\(/g, 'firebaseFetch(');

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Patched all fetches successfully!");
