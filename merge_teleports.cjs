const fs = require('fs');
const file = 'c:/chuSonProject/reminder-main/reminder-main/src/components/SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

// Find the three teleports.
const chartTeleportStart = content.indexOf('<!-- Chart Modal -->');
const chartTeleportEnd = content.indexOf('</Teleport>', chartTeleportStart) + 11;

const customerTeleportStart = content.indexOf('<!-- Top Customer Chart Modal -->');
const customerTeleportEnd = content.indexOf('</Teleport>', customerTeleportStart) + 11;

const productTeleportStart = content.indexOf('<!-- Top Product Chart Modal -->');
const productTeleportEnd = content.indexOf('</Teleport>', productTeleportStart) + 11;

if (chartTeleportStart > -1 && customerTeleportStart > -1 && productTeleportStart > -1) {
  let chartBlock = content.slice(chartTeleportStart, chartTeleportEnd);
  let customerBlock = content.slice(customerTeleportStart, customerTeleportEnd);
  let productBlock = content.slice(productTeleportStart, productTeleportEnd);
  
  // Extract the inner content of each teleport (removing <Teleport to="body"> and </Teleport>)
  const extractInner = (block) => {
    return block.replace(/<Teleport to="body">/g, '').replace(/<\/Teleport>/g, '').trim();
  };
  
  const innerChart = extractInner(chartBlock);
  const innerCustomer = extractInner(customerBlock);
  const innerProduct = extractInner(productBlock);
  
  // Now we construct the unified teleport
  const unifiedTeleport = `
      <!-- UNIFIED MODALS -->
      <Teleport to="body">
        <div v-if="chartModal.show || topCustomerModal.show || topProductModal.show" class="sr-modal-overlay" @click.self="chartModal.show = false; topCustomerModal.show = false; topProductModal.show = false" style="z-index: 100000; padding: 24px;">
          
          <div v-if="chartModal.show" class="sr-modal sr-modal-large" style="width: 1100px; max-width: 95%; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; animation: none;">
            ${innerChart.replace(/<div v-if="chartModal\.show" class="sr-modal-overlay"[^>]+>/, '').replace(/<div class="sr-modal sr-modal-large"[^>]+>/, '').slice(0, -12)}
          </div>
          
          <div v-if="topCustomerModal.show" class="sr-modal sr-modal-large" style="width: 1100px; max-width: 95%; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; animation: none;">
            ${innerCustomer.replace(/<div v-if="topCustomerModal\.show" class="sr-modal-overlay"[^>]+>/, '').replace(/<div class="sr-modal sr-modal-large"[^>]+>/, '').slice(0, -12)}
          </div>
          
          <div v-if="topProductModal.show" class="sr-modal sr-modal-large" style="width: 1100px; max-width: 95%; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; animation: none;">
            ${innerProduct.replace(/<div v-if="topProductModal\.show" class="sr-modal-overlay"[^>]+>/, '').replace(/<div class="sr-modal sr-modal-large"[^>]+>/, '').slice(0, -12)}
          </div>
          
        </div>
      </Teleport>`;

  // Replace each with empty string
  let newContent = content.replace(chartBlock, '').replace(customerBlock, '').replace(productBlock, '');
  
  // Insert at the original position of chartBlock
  newContent = newContent.substring(0, chartTeleportStart) + unifiedTeleport + newContent.substring(chartTeleportStart);
  
  fs.writeFileSync(file, newContent);
  console.log('Merged teleports');
} else {
  console.log('Could not find all 3 teleports.');
}
