const fs = require('fs');
const file = 'c:\\\\chuSonProject\\\\reminder-main\\\\reminder-main\\\\src\\\\components\\\\SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

const regex = /<div class="sr-rc-footer" v-if="r\.ghi_chu">\s*<strong>Note:<\/strong> \{\{\s*r\.ghi_chu\s*\}\}\s*<\/div>\s*<\/div>\s*<div v-if="displayLimit < filteredRows\.length" style="display: flex;/g;

const replace = `<div class="sr-rc-footer" v-if="r.ghi_chu">
          <strong>Note:</strong> {{ r.ghi_chu }}
        </div>
      </div>
      </div>
      </div>

      <div v-if="displayLimit < filteredRows.length" style="display: flex;`;

if (regex.test(content)) {
  content = content.replace(regex, replace);
  console.log('Successfully fixed end of loop.');
  fs.writeFileSync(file, content);
} else {
  console.log('Regex did not match.');
}
