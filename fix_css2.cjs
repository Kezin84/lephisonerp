const fs = require('fs');
let content = fs.readFileSync('src/components/BaoGia.vue', 'utf8');

// Remove anything after </style>
const badTextRegex = /<\/style>[\s\S]*?$/;
content = content.replace(badTextRegex, '\n</style>');

// Find the line that has `.totals-body [style*="grid"]`
// We will just append our override before `</style>` so it takes highest precedence inside the <style> block.
const cssToInsert = `
.totals-body .action-buttons-grid {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    flex-direction: row !important;
    gap: 8px !important;
}
`;

content = content.replace('</style>', cssToInsert + '\n</style>');

fs.writeFileSync('src/components/BaoGia.vue', content, 'utf8');
console.log('Fixed CSS placement');
