const fs = require('fs');
const file = 'c:/chuSonProject/reminder-main/reminder-main/src/components/SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

// 1. Add const isSwitchingTab = ref(false);
if (!content.includes('const isSwitchingTab')) {
  content = content.replace(/const chartModal = ref\(\{/, 'const isSwitchingTab = ref(false);\nconst chartModal = ref({');
}

// 2. Add :class="{ 'no-anim': isSwitchingTab }" to sr-modal-overlay and sr-modal
content = content.replace(/class="sr-modal-overlay"/g, 'class="sr-modal-overlay" :class="{ \'no-anim\': isSwitchingTab }"');
content = content.replace(/class="sr-modal sr-modal-large"/g, 'class="sr-modal sr-modal-large" :class="{ \'no-anim\': isSwitchingTab }"');

// 3. Update the @click handlers in tabs
content = content.replace(/@click="chartModal\.show = false; openTopCustomerModal\([^)]+\)"/g, '@click="isSwitchingTab = true; chartModal.show = false; openTopCustomerModal(chartModal.metric); setTimeout(() => isSwitchingTab = false, 50)"');
content = content.replace(/@click="chartModal\.show = false; openTopProductModal\([^)]+\)"/g, '@click="isSwitchingTab = true; chartModal.show = false; openTopProductModal(chartModal.metric); setTimeout(() => isSwitchingTab = false, 50)"');

content = content.replace(/@click="topCustomerModal\.show = false; openChart\([^)]+\)"/g, '@click="isSwitchingTab = true; topCustomerModal.show = false; openChart(topCustomerModal.metric, topCustomerModal.metric.includes(\'Pct\')); setTimeout(() => isSwitchingTab = false, 50)"');
content = content.replace(/@click="topCustomerModal\.show = false; openTopProductModal\([^)]+\)"/g, '@click="isSwitchingTab = true; topCustomerModal.show = false; openTopProductModal(topCustomerModal.metric); setTimeout(() => isSwitchingTab = false, 50)"');

content = content.replace(/@click="topProductModal\.show = false; openChart\([^)]+\)"/g, '@click="isSwitchingTab = true; topProductModal.show = false; openChart(topProductModal.metric, topProductModal.metric.includes(\'Pct\')); setTimeout(() => isSwitchingTab = false, 50)"');
content = content.replace(/@click="topProductModal\.show = false; openTopCustomerModal\([^)]+\)"/g, '@click="isSwitchingTab = true; topProductModal.show = false; openTopCustomerModal(topProductModal.metric); setTimeout(() => isSwitchingTab = false, 50)"');

// 4. Add .no-anim CSS
if (!content.includes('.no-anim {')) {
  content = content.replace(/<\/style>/, '.no-anim {\n  animation: none !important;\n  transition: none !important;\n}\n</style>');
}

fs.writeFileSync(file, content);
console.log('Fixed animations');
