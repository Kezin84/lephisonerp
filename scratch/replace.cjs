const fs = require('fs');
const path = require('path');

const files = [
  'src/backendOfficial',
  'backend_baogia',
  'src/components/test.vue',
  'src/components/POPreview.vue',
  'src/components/Customer.vue',
  'src/components/PipelinePreviewModal.vue',
  'src/components/BaoGia.vue',
  'src/components/backupbaogia.vue',
  'baogiamau.vue'
];

files.forEach(f => {
  const p = path.resolve('c:/chuSonProject/reminder-main/reminder-main', f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    
    // Replace variable names
    content = content.replace(/cong_no_chua_thanh_toan/g, 'tong_loi_nhuan');
    content = content.replace(/Cong_no_chua_thanh_toan/g, 'Tong_loi_nhuan');
    
    // Replace UI strings in Customer.vue
    if (f.endsWith('Customer.vue')) {
      content = content.replace(/>Nợ:\s*\{\{/g, '>Lợi nhuận: {{');
      // Change color for lợi nhuận, from text-danger to text-success
      content = content.replace(/class="info-line text-danger"/g, 'class="info-line text-success"');
      content = content.replace(/'text-danger': kh\.tong_loi_nhuan > 0/g, "'text-success': kh.tong_loi_nhuan > 0");
    }

    // Replace UI strings in BaoGia.vue and test.vue
    if (f.endsWith('BaoGia.vue') || f.endsWith('test.vue') || f.endsWith('backupbaogia.vue') || f.endsWith('baogiamau.vue')) {
      content = content.replace(/placeholder="Công nợ"/g, 'placeholder="Lợi nhuận"');
      content = content.replace(/const congNoCu =/g, 'const tongLoiNhuanCu =');
    }

    fs.writeFileSync(p, content, 'utf8');
    console.log('Updated', f);
  }
});
