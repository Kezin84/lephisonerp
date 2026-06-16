const fs = require('fs');
const file = 'c:\\\\chuSonProject\\\\reminder-main\\\\reminder-main\\\\src\\\\components\\\\SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

// Update uniqueCustomers
const regexUnique = /const uniqueCustomers = computed\(\(\) => \{\s*const set = new Set<string>\(\);\s*rows\.value\.forEach\(r => \{\s*if \(r\.Ten_cong_ty\) set\.add\(String\(r\.Ten_cong_ty\)\.trim\(\)\);\s*\}\);\s*return Array\.from\(set\)\.sort\(\);\s*\}\);/;
const replaceUnique = `const uniqueCustomers = computed(() => {
  const map = new Map();
  rows.value.forEach(r => {
    const cty = String(r.Ten_cong_ty || '').trim();
    if (cty) {
      if (!map.has(cty)) {
        map.set(cty, {
          companyName: cty,
          customerName: r.Ten_khach_hang || '',
          companyCode: r.Ma_cong_ty || ''
        });
      }
    }
  });
  return Array.from(map.values()).sort((a, b) => a.companyName.localeCompare(b.companyName));
});`;
content = content.replace(regexUnique, replaceUnique);

// Update filteredCustomerOptions
const regexFilteredOpts = /const filteredCustomerOptions = computed\(\(\) => \{\s*const search = \(filterCustomer\.value \|\| ''\)\.toLowerCase\(\)\.trim\(\);\s*const all = \['Tất cả', \.\.\.uniqueCustomers\.value\];\s*if \(\!search \|\| search === 'tất cả'\) return all;\s*return all\.filter\(c => c\.toLowerCase\(\)\.includes\(search\)\);\s*\}\);/;
const replaceFilteredOpts = `const filteredCustomerOptions = computed(() => {
  const search = (filterCustomer.value || '').toLowerCase().trim();
  const allOptions = uniqueCustomers.value;
  if (!search || search === 'tất cả') return [{ companyName: 'Tất cả' }, ...allOptions];
  
  return allOptions.filter(c => 
    c.companyName.toLowerCase().includes(search) || 
    c.customerName.toLowerCase().includes(search) ||
    c.companyCode.toLowerCase().includes(search)
  );
});`;
content = content.replace(regexFilteredOpts, replaceFilteredOpts);

// Update selectCustomerOption
const regexSelectOpt = /const selectCustomerOption = \(c: string\) => \{\s*filterCustomer\.value = c;\s*showCustomerDropdown\.value = false;\s*\}/;
const replaceSelectOpt = `const selectCustomerOption = (c: any) => {
  filterCustomer.value = c.companyName === 'Tất cả' ? 'Tất cả' : c.companyName;
  showCustomerDropdown.value = false;
}`;
content = content.replace(regexSelectOpt, replaceSelectOpt);

// Update HTML dropdown template
// We need to replace the `v-for="c in filteredCustomerOptions"` loop body.
const templateRegex = /<li v-for="c in filteredCustomerOptions" :key="c" @mousedown="selectCustomerOption\(c\)" style="padding: 10px 14px; color: #cbd5e1; font-size: 13\.5px; font-weight: 500; cursor: pointer; border-radius: 6px; transition: all 0\.2s; text-align: left; display: flex; align-items: center; gap: 8px;" onmouseover="this\.style\.background='rgba\(16, 185, 129, 0\.15\)'; this\.style\.color='#10b981'" onmouseout="this\.style\.background='transparent'; this\.style\.color='#cbd5e1'">[\s\S]*?<\/li>/;
const replaceTemplate = `<li v-for="c in filteredCustomerOptions" :key="c.companyName + c.companyCode" @mousedown="selectCustomerOption(c)" style="padding: 10px 14px; cursor: pointer; border-radius: 6px; transition: all 0.2s; text-align: left; display: flex; align-items: center; gap: 8px;" onmouseover="this.style.background='rgba(16, 185, 129, 0.15)'" onmouseout="this.style.background='transparent'">
              <template v-if="c.companyName === 'Tất cả'">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.8;"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                <span style="color: #cbd5e1; font-size: 13.5px; font-weight: 500;">-- Tất cả khách hàng --</span>
              </template>
              <template v-else>
                <div style="display: flex; flex-direction: column; gap: 2px;">
                  <span style="font-weight: 700; color: #10b981; font-size: 14px;">{{ c.companyName }}</span>
                  <span style="font-size: 11.5px; color: #94a3b8;">{{ c.customerName }} <span v-if="c.companyCode" style="opacity: 0.6;">({{ c.companyCode }})</span></span>
                </div>
              </template>
            </li>`;
content = content.replace(templateRegex, replaceTemplate);

// Update search logic in filteredRows
const filterSearchRegex = /const ten = String\(r\.Ten_cong_ty \|\| ''\)\.toLowerCase\(\);\s*const makh = String\(r\.Ma_khach_hang \|\| ''\)\.toLowerCase\(\);\s*const macty = String\(r\.Ma_cong_ty \|\| ''\)\.toLowerCase\(\);\s*return ten\.includes\(target\) \|\| makh\.includes\(target\) \|\| macty\.includes\(target\);/;
const replaceFilterSearch = `const ten = String(r.Ten_cong_ty || '').toLowerCase();
      const tenKh = String(r.Ten_khach_hang || '').toLowerCase();
      const macty = String(r.Ma_cong_ty || '').toLowerCase();
      return ten.includes(target) || tenKh.includes(target) || macty.includes(target);`;
content = content.replace(filterSearchRegex, replaceFilterSearch);

fs.writeFileSync(file, content);
console.log('Finished updating customer search feature');
