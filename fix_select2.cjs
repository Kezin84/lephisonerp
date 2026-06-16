const fs = require('fs');
const file = 'c:\\\\chuSonProject\\\\reminder-main\\\\reminder-main\\\\src\\\\components\\\\SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

const searchStr = `const selectSuggestion = async (item: any) => {
  searchStr.value = item.So_PO;
  showSearchSuggestions.value = false;
  
  // Wait for the DOM and filteredRows to update before opening the modal
  await nextTick();
  
  // Find the full row to pass to openMultiEditModal, since item is just a summary
  const fullRow = rows.value.find(r => r.So_PO === item.So_PO);
  if (fullRow) {
    openMultiEditModal(fullRow);
  } else {
    openMultiEditModal(item);
  }
}`;

const replaceStr = `const selectSuggestion = async (item: any) => {
  // First, find the full row synchronously before we do anything else
  const fullRow = rows.value.find(r => String(r.So_PO).trim() === String(item.So_PO).trim());
  
  // Open the modal IMMEDIATELY with the full row
  if (fullRow) {
    openMultiEditModal(fullRow);
  } else {
    openMultiEditModal(item);
  }
  
  // Update search state
  searchStr.value = item.So_PO;
  showSearchSuggestions.value = false;
}`;

content = content.replace(searchStr, replaceStr);

fs.writeFileSync(file, content);
console.log('Fixed selectSuggestion string comparison and execution order');
