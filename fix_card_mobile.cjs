const fs = require('fs');
const file = 'src/components/SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

// 1. Ensure .sr-rc-customer wraps text properly
content = content.replace(
  /\.sr-rc-customer \{ margin: 6px 0 2px 0; font-size: 18px; font-weight: 700; color: #f8fafc; \}/g,
  `.sr-rc-customer { margin: 6px 0 2px 0; font-size: 18px; font-weight: 700; color: #f8fafc; word-break: break-word; white-space: normal; }`
);

// 2. Add media query to make .sr-card-list 1 column on mobile
if (!content.includes('.sr-card-list { grid-template-columns: 1fr !important; }')) {
  content = content.replace(
    /<\/style>/,
    `
@media (max-width: 768px) {
  .sr-card-list {
    grid-template-columns: 1fr !important;
  }
}
</style>`
  );
}

fs.writeFileSync(file, content);
console.log('Fixed card list layout and PO wrapping for mobile.');
