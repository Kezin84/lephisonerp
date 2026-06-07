const fs = require('fs');
let content = fs.readFileSync('src/components/BaoGia.vue', 'utf8');

// Modal Cấu Hình & Excel (availableColumns & defaultColumns)
content = content.replace(/{ value: 'features', label: 'MÔ TẢ SẢN PHẨM' }/g, "{ value: 'features', label: 'DIỄN GIẢI' }");
content = content.replace(/{ header: 'MÔ TẢ SẢN PHẨM', field: 'features' }/g, "{ header: 'DIỄN GIẢI', field: 'features' }");
content = content.replace(/{ value: 'so_luong', label: 'SỐ LƯỢNG' }/g, "{ value: 'so_luong', label: 'SL' }");
content = content.replace(/{ header: 'SỐ LƯỢNG', field: 'so_luong' }/g, "{ header: 'SL', field: 'so_luong' }");

// Replace in the web table and form as well to be consistent
content = content.replace(/<th class=\"col-desc\">Mô tả sản phẩm<\/th>/g, '<th class=\"col-desc\">Diễn giải</th>');
content = content.replace(/data-label=\"Mô tả sản phẩm\"/g, 'data-label=\"Diễn giải\"');
content = content.replace(/>Mô tả sản phẩm</g, '>Diễn giải<');
content = content.replace(/placeholder=\"Nhập mô tả sản phẩm\.\.\.\"/g, 'placeholder=\"Nhập diễn giải...\"');

content = content.replace(/data-label=\"Số lượng\"/g, 'data-label=\"SL\"');
// Form labels for Số lượng -> SL
content = content.replace(/<label>Số lượng<\/label>/g, '<label>SL</label>');
content = content.replace(/placeholder=\"Số lượng\"/g, 'placeholder=\"SL\"');

fs.writeFileSync('src/components/BaoGia.vue', content, 'utf8');
console.log('Success replace');
