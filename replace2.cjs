const fs = require('fs');
const file = 'c:/chuSonProject/reminder-main/reminder-main/src/components/report.vue';
let content = fs.readFileSync(file, 'utf8');

const bgRegex = /<a v-for="\(link, i\) in (report|task)\.link_excel_bao_gia\.split\('\\n'\)\.filter\(Boolean\)" :key="'bg'\+i" href="#" @click\.prevent\.stop="downloadExcelFile\(link, getExcelFileName\((report|task), 'link_excel_bao_gia', i, 'Báo giá'\)\)"\s+class="tl-attach-badge" style=".*?<\/svg>\s*\{\{\s*getExcelFileName\((report|task), 'link_excel_bao_gia', i, 'Báo giá'\)\s*\}\}\s*<\/a>/gs;

const mhRegex = /<a v-for="\(link, i\) in (report|task)\.link_excel_mua_hang\.split\('\\n'\)\.filter\(Boolean\)" :key="'mh'\+i" href="#" @click\.prevent\.stop="downloadExcelFile\(link, getExcelFileName\((report|task), 'link_excel_mua_hang', i, 'Mua hàng'\)\)"\s+class="tl-attach-badge" style=".*?<\/svg>\s*\{\{\s*getExcelFileName\((report|task), 'link_excel_mua_hang', i, 'Mua hàng'\)\s*\}\}\s*<\/a>/gs;

content = content.replace(bgRegex, (match, p1) => {
    let obj = p1;
    return '<a v-for="(link, i) in ' + obj + '.link_excel_bao_gia.split(\\'\\\\n\\').filter(Boolean)" :key="\\'bg\\'+i" href="#" @click.prevent.stop="downloadExcelFile(link, getExcelFileName(' + obj + ', \\'link_excel_bao_gia\\', i, \\'Báo giá\\'))" class="file-attach-badge" :title="getExcelFileName(' + obj + ', \\'link_excel_bao_gia\\', i, \\'Báo giá\\')">\\n                          <span v-html="getFileIconSvg(getExcelFileName(' + obj + ', \\'link_excel_bao_gia\\', i, \\'Báo giá\\'))" style="display:flex;align-items:center;"></span>\\n                          <span class="file-attach-text">{{ getExcelFileName(' + obj + ', \\'link_excel_bao_gia\\', i, \\'Báo giá\\') }}</span>\\n                        </a>';
});

content = content.replace(mhRegex, (match, p1) => {
    let obj = p1;
    return '<a v-for="(link, i) in ' + obj + '.link_excel_mua_hang.split(\\'\\\\n\\').filter(Boolean)" :key="\\'mh\\'+i" href="#" @click.prevent.stop="downloadExcelFile(link, getExcelFileName(' + obj + ', \\'link_excel_mua_hang\\', i, \\'Mua hàng\\'))" class="file-attach-badge" :title="getExcelFileName(' + obj + ', \\'link_excel_mua_hang\\', i, \\'Mua hàng\\')">\\n                          <span v-html="getFileIconSvg(getExcelFileName(' + obj + ', \\'link_excel_mua_hang\\', i, \\'Mua hàng\\'))" style="display:flex;align-items:center;"></span>\\n                          <span class="file-attach-text">{{ getExcelFileName(' + obj + ', \\'link_excel_mua_hang\\', i, \\'Mua hàng\\') }}</span>\\n                        </a>';
});

fs.writeFileSync(file, content, 'utf8');
console.log("Replacement done");
