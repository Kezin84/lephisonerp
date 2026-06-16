const fs = require('fs');
const file = 'c:\\\\chuSonProject\\\\reminder-main\\\\reminder-main\\\\src\\\\components\\\\SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

// 1. Move Teleport into sr-page
const srEmptyDiv = `    <div v-if="!loading && filteredRows.length === 0" class="sr-empty">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      <p>Chưa có dữ liệu Sale Report</p>
    </div>`;

const tpRegex = /(<!-- Multi Edit Modal -->[\s\S]+?<\/Teleport>)/;
const match = content.match(tpRegex);
if (match) {
  const teleportStr = match[1];
  content = content.replace(teleportStr, '');
  
  // Insert teleport before the closing div of sr-page
  // Find the exact place
  // It's tricky with regex, let's just insert it before <div v-if="loading" class="sr-loading">
  // Wait, no, sr-loading is outside. 
  // Let's replace the selectSuggestion first.
}

const searchStr = `const selectSuggestion = async (item: any) => {
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

const replaceStr = `const selectSuggestion = (item: any) => {
  // Update search state FIRST
  searchStr.value = item.So_PO;
  showSearchSuggestions.value = false;
  
  // Delay modal opening to allow Vue to patch the DOM (cards list changing)
  setTimeout(() => {
    const fullRow = rows.value.find(r => String(r.So_PO).trim() === String(item.So_PO).trim());
    if (fullRow) {
      openMultiEditModal(fullRow);
    } else {
      openMultiEditModal(item);
    }
  }, 100);
}`;

content = content.replace(searchStr, replaceStr);

fs.writeFileSync(file, content);
console.log('Fixed selectSuggestion with setTimeout');
