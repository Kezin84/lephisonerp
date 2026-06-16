const fs = require('fs');
const file = 'c:\\\\chuSonProject\\\\reminder-main\\\\reminder-main\\\\src\\\\components\\\\SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

// 1. Update uniqueCustomers
const regexUnique = /const uniqueCustomers = computed\(\(\) => \{\s*const map = new Map\(\);\s*rows\.value\.forEach\(r => \{\s*const cty = String\(r\.Ten_cong_ty \|\| ''\)\.trim\(\);\s*if \(cty\) \{\s*if \(!map\.has\(cty\)\) \{\s*map\.set\(cty, \{\s*companyName: cty,\s*customerName: r\.Ten_khach_hang \|\| '',\s*companyCode: r\.Ma_cong_ty \|\| ''\s*\}\);\s*\}\s*\}\s*\}\);\s*return Array\.from\(map\.values\(\)\)\.sort\(\(a, b\) => a\.companyName\.localeCompare\(b\.companyName\)\);\s*\}\);/;

const replaceUnique = `const uniqueCustomers = computed(() => {
  const map = new Map();
  rows.value.forEach(r => {
    const maCty = String(r.Ma_cong_ty || '').trim();
    if (maCty) {
      if (!map.has(maCty)) {
        map.set(maCty, {
          companyName: String(r.Ten_cong_ty || '').trim() || maCty,
          customerName: String(r.Ten_khach_hang || '').trim(),
          companyCode: maCty
        });
      }
    } else {
      const cty = String(r.Ten_cong_ty || '').trim();
      if (cty && !map.has(cty)) {
         map.set(cty, {
            companyName: cty,
            customerName: String(r.Ten_khach_hang || '').trim(),
            companyCode: ''
         });
      }
    }
  });
  return Array.from(map.values()).sort((a, b) => a.companyName.localeCompare(b.companyName));
});`;

content = content.replace(regexUnique, replaceUnique);

// 2. Update filteredRows
const regexFilter = /if \(filterCustomer\.value && filterCustomer\.value !== 'Tất cả'\) \{\s*const target = filterCustomer\.value\.toLowerCase\(\)\.trim\(\)\s*list = list\.filter\(r => \{\s*const ten = String\(r\.Ten_cong_ty \|\| ''\)\.toLowerCase\(\);\s*const tenKh = String\(r\.Ten_khach_hang \|\| ''\)\.toLowerCase\(\);\s*const macty = String\(r\.Ma_cong_ty \|\| ''\)\.toLowerCase\(\);\s*return ten\.includes\(target\) \|\| tenKh\.includes\(target\) \|\| macty\.includes\(target\);\s*\}\)\s*\}/;

const replaceFilter = `if (filterCustomer.value && filterCustomer.value !== 'Tất cả') {
    const target = filterCustomer.value.toLowerCase().trim();
    const exactMatch = uniqueCustomers.value.find(c => c.companyName.toLowerCase() === target);
    const targetCode = exactMatch ? exactMatch.companyCode.toLowerCase() : '';

    list = list.filter(r => {
      const ten = String(r.Ten_cong_ty || '').toLowerCase();
      const tenKh = String(r.Ten_khach_hang || '').toLowerCase();
      const macty = String(r.Ma_cong_ty || '').toLowerCase();
      
      if (targetCode && macty === targetCode) return true;
      return ten.includes(target) || tenKh.includes(target) || macty.includes(target);
    });
  }`;

content = content.replace(regexFilter, replaceFilter);

fs.writeFileSync(file, content);
console.log('Finished updating grouping logic');
