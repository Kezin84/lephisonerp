const fs = require('fs');

let file = 'C:/chuSonProject/reminder-main/reminder-main/src/components/BaoGia.vue';
let content = fs.readFileSync(file, 'utf8');
let lines = content.split(/\r?\n/);

let newLines = lines.slice(0, 5912);

newLines.push('            <div v-if="showRecentSearches && !keyword.trim() && recentSearches.length > 0" style="position: absolute; top: 100%; left: 0; right: 0; background: #1e293b; border: 1px solid #334155; border-radius: 8px; margin-top: 4px; z-index: 50; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); overflow: hidden;">');
newLines.push('              <div style="padding: 8px 12px; font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; border-bottom: 1px solid #334155;">Lịch sử tìm kiếm</div>');
newLines.push('              <div v-for="(rs, idx) in recentSearches" :key="idx" @mousedown.prevent="keyword = rs; showRecentSearches = false; saveRecentSearch(rs)" style="padding: 10px 12px; cursor: pointer; color: #e2e8f0; font-size: 13px; display: flex; align-items: center; gap: 8px;" onmouseover="this.style.backgroundColor=\'#334155\'" onmouseout="this.style.backgroundColor=\'transparent\'">');
newLines.push('                <i class="fas fa-history" style="width: 14px; height: 14px; color: #64748b;"></i>');
newLines.push('                {{ rs }}');
newLines.push('              </div>');
newLines.push('            </div>');

newLines = newLines.concat(lines.slice(5927)); // append from 5928 to end
fs.writeFileSync(file, newLines.join('\r\n'), 'utf8');

let testFile = 'C:/chuSonProject/reminder-main/reminder-main/src/components/test.vue';
let testContent = fs.readFileSync(testFile, 'utf8');
let testLines = testContent.split(/\r?\n/);
let startIdx = testLines.findIndex(l => l.includes('<div v-if="showRecentSearches && (!keyword.trim()'));

if(startIdx !== -1) {
    let endIdx = startIdx + 1;
    while(endIdx < testLines.length && !testLines[endIdx].includes('            </div>')) {
        endIdx++;
    }
    let tNewLines = testLines.slice(0, startIdx);
    tNewLines.push('            <div v-if="showRecentSearches && !keyword.trim() && recentSearches.length > 0" style="position: absolute; top: 100%; left: 0; right: 0; background: #1e293b; border: 1px solid #334155; border-radius: 8px; margin-top: 4px; z-index: 50; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); overflow: hidden;">');
    tNewLines.push('              <div style="padding: 8px 12px; font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; border-bottom: 1px solid #334155;">Lịch sử tìm kiếm</div>');
    tNewLines.push('              <div v-for="(rs, idx) in recentSearches" :key="idx" @mousedown.prevent="keyword = rs; showRecentSearches = false; saveRecentSearch(rs)" style="padding: 10px 12px; cursor: pointer; color: #e2e8f0; font-size: 13px; display: flex; align-items: center; gap: 8px;" onmouseover="this.style.backgroundColor=\'#334155\'" onmouseout="this.style.backgroundColor=\'transparent\'">');
    tNewLines.push('                <i class="fas fa-history" style="width: 14px; height: 14px; color: #64748b;"></i>');
    tNewLines.push('                {{ rs }}');
    tNewLines.push('              </div>');
    tNewLines.push('            </div>');
    tNewLines = tNewLines.concat(testLines.slice(endIdx + 1));
    fs.writeFileSync(testFile, tNewLines.join('\r\n'), 'utf8');
}
console.log('Fixed both files');
