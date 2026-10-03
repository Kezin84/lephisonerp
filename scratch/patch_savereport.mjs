import fs from 'fs';

const filePath = 'C:\\chuSonFireBase\\reminder-main\\reminder-main\\src\\components\\reportFIREBASE.vue';
let content = fs.readFileSync(filePath, 'utf-8');

const old_saveReport = `  // Xử lý gửi dữ liệu ngầm
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    
    const result = await response.json()
    if (result.status === 'success') {
      if (action === 'add' && result.id) {
        const idx = reports.value.findIndex(r => r.id === tempId);
        if (idx !== -1) {
          reports.value[idx].id = result.id;
        }
        if (highlightedReportId.value === tempId) {
          highlightedReportId.value = result.id;
        }
        
        if (activeReminderForNewReport.value) {
          hideReminder(activeReminderForNewReport.value);
          activeReminderForNewReport.value = null;
        }
      }
    } else {
      console.error('Lưu ngầm thất bại:', result.message)
    }
  } catch (error) {
    console.error('Lỗi khi lưu ngầm:', error)
  }`;

const new_saveReport = `  // Xử lý gửi dữ liệu ngầm (Firebase Realtime Database)
  try {
    if (action === 'add') {
      const d = new Date()
      const pad = n => String(n).padStart(2, '0')
      const realId = \`RPT_\${d.getFullYear()}\${pad(d.getMonth()+1)}\${pad(d.getDate())}_\${pad(d.getHours())}\${pad(d.getMinutes())}\${pad(d.getSeconds())}\`
      
      const idx = reports.value.findIndex(r => r.id === tempId);
      if (idx !== -1) {
        reports.value[idx].id = realId;
      }
      if (highlightedReportId.value === tempId) {
        highlightedReportId.value = realId;
      }
      
      payload.id = realId;
      await set(dbRef(database, \`REPORT/\${realId}\`), payload);
      
      if (activeReminderForNewReport.value) {
        hideReminder(activeReminderForNewReport.value);
        activeReminderForNewReport.value = null;
      }
    } else {
      await update(dbRef(database, \`REPORT/\${payload.id}\`), payload);
    }
  } catch (error) {
    console.error('Lỗi khi lưu Firebase:', error)
  }`;

content = content.replace(old_saveReport, new_saveReport);

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Patched saveReport successfully!");
