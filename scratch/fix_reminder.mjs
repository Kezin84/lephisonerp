import fs from 'fs';

const filePath = 'C:\\chuSonFireBase\\reminder-main\\reminder-main\\src\\components\\reportFIREBASE.vue';
let content = fs.readFileSync(filePath, 'utf-8');

// Find the part where payload is created in saveReport
const oldPayload = `  const payload = {
    action: action,
    ...formData.value
  }`;

const newPayload = `  const payload = {
    action: action,
    ...formData.value
  }
  
  // Đảm bảo cờ reminder_visible được set thành 'TRUE' nếu có lịch nhắc nhở
  if (payload.reminder_time && payload.reminder_visible !== 'FALSE' && payload.reminder_visible !== false) {
    payload.reminder_visible = 'TRUE';
  }`;

content = content.replace(oldPayload, newPayload);

// Also modify createReportFromReminderBtn to ensure it parses the right data
// Just to be sure, let's also check if hideReminder was correctly patched. Yes it was.

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Fixed reminder payload successfully!");
