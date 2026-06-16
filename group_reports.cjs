const fs = require('fs');
const file = 'c:\\\\chuSonProject\\\\reminder-main\\\\reminder-main\\\\src\\\\components\\\\SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

// 1. Add groupedDisplayedRows computed property
const computedInsertMatch = /const displayedRows = computed\(\(\) => {\s*return filteredRows\.value\.slice\(0, displayLimit\.value\)\s*}\)/;

if (computedInsertMatch.test(content) && !content.includes('groupedDisplayedRows')) {
  const computedStr = `const displayedRows = computed(() => {
  return filteredRows.value.slice(0, displayLimit.value)
})

const groupedDisplayedRows = computed(() => {
  const map = new Map();
  displayedRows.value.forEach(r => {
    const maCty = r.Ma_cong_ty || 'Khác';
    if (!map.has(maCty)) {
      map.set(maCty, {
        ma_cong_ty: maCty,
        ten_cong_ty: r.Ten_cong_ty || 'N/A',
        items: []
      });
    }
    map.get(maCty).items.push(r);
  });
  return Array.from(map.values());
});`;
  content = content.replace(computedInsertMatch, computedStr);
  console.log('Added groupedDisplayedRows');
}

// 2. Replace the template
const templateRegex = /<!-- Card List -->\s*<div class="sr-card-list" v-if="!loading && filteredRows\.length > 0">\s*<div v-for="\(r, idx\) in displayedRows" :key="r\.ID \|\| idx" class="sr-record-card" @click="openMultiEditModal\(r\)" style="cursor: pointer;">/g;

const replaceTemplate = `<!-- Grouped Card List -->
    <div class="sr-groups-container" v-if="!loading && filteredRows.length > 0">
      <div v-for="(group, gIdx) in groupedDisplayedRows" :key="group.ma_cong_ty + gIdx" class="sr-report-group" style="margin-bottom: 24px;">
        <div class="folder-header" style="cursor: pointer; margin-bottom: 16px;">
          <div class="folder-tab" style="background: linear-gradient(135deg, #059669, #10b981); border: 1px solid rgba(16, 185, 129, 0.5); border-bottom: none; border-radius: 10px 10px 0 0; padding: 8px 24px; width: max-content; color: #ffffff; font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="display: flex; align-items: center; gap: 6px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                <span>{{ group.ma_cong_ty }}</span>
              </span>
              <div style="width: 1px; height: 14px; background: rgba(255,255,255,0.3);"></div>
              <span style="max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ group.ten_cong_ty }}</span>
              <div style="width: 1px; height: 14px; background: rgba(255,255,255,0.3);"></div>
              <span>SỐ LƯỢNG: {{ group.items.length }}</span>
            </div>
          </div>
          <div class="folder-body-line" style="height: 4px; background: #10b981; border-radius: 0 4px 4px 4px; box-shadow: 0 2px 10px rgba(16,185,129,0.2);"></div>
        </div>
        
        <div class="sr-card-list">
          <div v-for="(r, idx) in group.items" :key="r.ID || idx" class="sr-record-card" @click="openMultiEditModal(r)" style="cursor: pointer;">`;

if (templateRegex.test(content)) {
  content = content.replace(templateRegex, replaceTemplate);
  console.log('Replaced start of loop');

  // We need to find the closing div of sr-card-list.
  // It is right before <!-- Load More -->
  const loadMoreRegex = /<\/div>\s*<\/div>\s*<!-- Load More -->/g;
  const loadMoreReplace = `</div>
        </div>
      </div>
    </div>

    <!-- Load More -->`;
  if (loadMoreRegex.test(content)) {
    content = content.replace(loadMoreRegex, loadMoreReplace);
    console.log('Replaced end of loop');
  } else {
    console.log('Could not find end of loop');
  }
}

fs.writeFileSync(file, content);
