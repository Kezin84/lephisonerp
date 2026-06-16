const fs = require('fs');
const file = 'c:/chuSonProject/reminder-main/reminder-main/src/components/SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

const regex = /function genMaCongTy\(company: string\) \{\s*if \(!company\) return '';\s*return String\(company\)\.normalize\('NFD'\)\.replace\(\/\[\\u0300-\\u036f\]\/g, ''\)\.replace\(\/đ\/g, 'd'\)\.replace\(\/Đ\/g, 'D'\)\.replace\(\/\[\^a-zA-Z0-9\]\/g, ''\)\.toUpperCase\(\);\s*\}/;

const newLogic = `function genMaCongTy(company: string) {
    if (!company) return '';
    // XoA h?u t? lA d?u g?ch ngang vA s? ? cu?i (vA d?: " -725", "- 725")
    const baseName = String(company).replace(/\\s*-\\s*\\d+.*$/, '');
    return baseName.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}`;

if (regex.test(content)) {
    content = content.replace(regex, newLogic);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Successfully replaced genMaCongTy");
} else {
    console.log("genMaCongTy not found. Pattern might be incorrect.");
}
