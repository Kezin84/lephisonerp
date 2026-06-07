const fs = require('fs');
let content = fs.readFileSync('src/components/BaoGia.vue', 'utf8');

const badTextRegex = /<\/style>[\s\S]*?$/;
const match = content.match(badTextRegex);

if (match) {
  // Remove it from the end
  content = content.replace(badTextRegex, '\n</style>');
  
  // Also we should ensure the bad CSS block that was appended is removed.
  // The match contains "</style>" followed by whatever was appended.
  // So replacing it with "</style>" effectively removes the appended text.
  
  // Now we need to insert the CSS back into the <style scoped> tag.
  // Actually, wait, let's just find the closing </style> and insert before it.
  
  const cssToInsert = `
.totals-body [style*="grid"],
.totals-body > div[style*="flex"] {
    display: flex !important;
    flex-direction: column !important;
    gap: 16px !important;
    align-items: stretch !important;
    width: 100% !important;
}

.totals-body .action-buttons-grid {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    flex-direction: row !important;
    gap: 8px !important;
}
`;
  
  // In the file, the previous fix script appended BOTH rules to the end.
  // We need to make sure we don't duplicate them, so I just replace the badText.
  // But wait, the original file had `.totals-body [style*="grid"]` INSIDE the `<style>` tag,
  // inside the `@media (max-width: 1024px)` block.
  // The previous replacement replaced it AND appended it to the end because it couldn't find the exact match.
  // Wait! The output of the previous script was `Could not find CSS block, appending to end of file`
  // So the original `.totals-body [style*="grid"]` is STILL inside the `@media` block!
  // And the appended one is at the end!
  // Let's just restore the file by removing what was appended, and then we insert the override `.totals-body .action-buttons-grid` into the `@media` block, or just before `</style>`.
  
}
