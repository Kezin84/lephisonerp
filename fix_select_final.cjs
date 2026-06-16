const fs = require('fs');
const file = 'c:\\\\chuSonProject\\\\reminder-main\\\\reminder-main\\\\src\\\\components\\\\SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

const searchStr = `const selectSuggestion = (item: any) => {
  openMultiEditModal(item)
  searchStr.value = item.So_PO
  showSearchSuggestions.value = false
}`;

const replaceStr = `const selectSuggestion = (item: any) => {
  // Update search state FIRST for visual feedback
  searchStr.value = item.So_PO;
  showSearchSuggestions.value = false;
  
  // Delay 0.3s, then clear search text so the modal can appear properly
  setTimeout(() => {
    searchStr.value = '';
    
    // Also use the full row instead of the summary item to avoid empty details
    const fullRow = rows.value.find(r => String(r.So_PO).trim() === String(item.So_PO).trim());
    if (fullRow) {
      openMultiEditModal(fullRow);
    } else {
      openMultiEditModal(item);
    }
  }, 300);
}`;

if (content.includes(searchStr)) {
  content = content.replace(searchStr, replaceStr);
  fs.writeFileSync(file, content);
  console.log('Successfully replaced selectSuggestion');
} else {
  console.log('searchStr not found! File not modified.');
}
