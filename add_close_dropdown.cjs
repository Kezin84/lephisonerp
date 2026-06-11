const fs = require('fs');

function updateDropdownHeader(file) {
    let content = fs.readFileSync(file, 'utf8');
    let lines = content.split(/\r?\n/);

    let newLines = [];
    let insideDropdown = false;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('<div v-if="showRecentSearches && !keyword.trim() && recentSearches.length > 0"')) {
            newLines.push(lines[i]);
            
            // Expected next line to be the header: <div style="padding: 8px 12px...
            i++; 
            newLines.push('              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-bottom: 1px solid #334155;">');
            newLines.push('                <span style="font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Lịch sử tìm kiếm</span>');
            newLines.push('                <button @mousedown.prevent="showRecentSearches = false" style="background: transparent; border: none; color: #94a3b8; cursor: pointer; padding: 0; font-size: 14px; display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 4px;" onmouseover="this.style.color=\'#ef4444\'; this.style.backgroundColor=\'rgba(239, 68, 68, 0.1)\'" onmouseout="this.style.color=\'#94a3b8\'; this.style.backgroundColor=\'transparent\'" title="Đóng">✕</button>');
            newLines.push('              </div>');
        } else {
            newLines.push(lines[i]);
        }
    }

    fs.writeFileSync(file, newLines.join('\r\n'), 'utf8');
}

updateDropdownHeader('C:/chuSonProject/reminder-main/reminder-main/src/components/BaoGia.vue');
updateDropdownHeader('C:/chuSonProject/reminder-main/reminder-main/src/components/test.vue');
console.log('Fixed dropdown header with close button in both files');
