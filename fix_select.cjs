const fs = require('fs');
const file = 'c:\\\\chuSonProject\\\\reminder-main\\\\reminder-main\\\\src\\\\components\\\\SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

const searchStr = `const selectSuggestion = (item: any) => {
  openMultiEditModal(item)
  searchStr.value = item.So_PO
  showSearchSuggestions.value = false
}`;

const replaceStr = `const selectSuggestion = async (item: any) => {
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

content = content.replace(searchStr, replaceStr);

fs.writeFileSync(file, content);
console.log('Fixed selectSuggestion');
