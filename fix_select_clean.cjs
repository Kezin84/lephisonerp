const fs=require('fs'); 
let c=fs.readFileSync('src/components/SaleReport.vue','utf8'); 
const idx=c.indexOf('const selectSuggestion'); 
const endIdx=c.indexOf('}', idx)+1; 
const search=c.substring(idx, endIdx); 
const replace='const selectSuggestion = (item: any) => {\n  searchStr.value = item.So_PO;\n  showSearchSuggestions.value = false;\n  setTimeout(() => {\n    searchStr.value = "";\n    const fullRow = rows.value.find(r => String(r.So_PO).trim() === String(item.So_PO).trim());\n    if (fullRow) openMultiEditModal(fullRow); else openMultiEditModal(item);\n  }, 300);\n}'; 
fs.writeFileSync('src/components/SaleReport.vue', c.replace(search, replace)); 
console.log('Successfully replaced selectSuggestion cleanly');
