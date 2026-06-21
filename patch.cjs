const fs = require('fs');
const path = require('path');
const file = path.join('src', 'components', 'Pipeline.vue');
let content = fs.readFileSync(file, 'utf8');

// 1. Add Workflow selector in template
content = content.replace(
  '<div class="header-actions" style="display: flex; gap: 0.75rem;">',
  `<div class="workflow-selector" style="display: flex; align-items: center; gap: 8px; margin-right: 12px;">
        <span style="color: #94a3b8; font-size: 0.85rem; font-weight: 600;">Quy trình:</span>
        <select v-model="selectedWorkflowId" class="elite-input" style="background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 4px 12px; border-radius: 6px; font-size: 0.85rem; cursor: pointer; outline: none; min-width: 150px;">
          <option value="WF_DEFAULT">Mặc định</option>
          <option v-for="wf in uniqueWorkflows" :key="wf.id_workflow" :value="wf.id_workflow" style="background: #1e293b; color: #f8fafc;">{{ wf.name_workflow }}</option>
        </select>
      </div>
      <div class="header-actions" style="display: flex; gap: 0.75rem;">`
);

// 2. Add workflows ref and dynamicColumns
const oldCols = `const COLUMNS = [
  { id: 'nhap', label: 'TẠM', value: 'TẠM', percent: '0%' },
  { id: 'col_30', label: '30%: Pipeline', value: 'Pipeline (khảo sát nhu cầu khách hàng)', percent: '30%' },
  { id: 'col_50', label: '50%: Forecast', value: 'Forecast (đã lên báo giá gởi khách hàng)', percent: '50%' },
  { id: 'col_70', label: '70%: Commit', value: 'Commit (EU đồng ý giải pháp, chờ ngân sách đầu tư)', percent: '70%' },
  { id: 'col_90', label: '90%: Closed Won', value: 'Closed Won (đã ký xác nhận đặt hàng)', percent: '90%' },
  { id: 'hoan_thanh', label: 'THÀNH CÔNG', value: 'THÀNH CÔNG', percent: '100%' },
  { id: 'that_bai', label: 'THẤT BẠI', value: 'THẤT BẠI', percent: '0%' }
]`;

const newCols = `const pipelineWorkflows = ref([])
const selectedWorkflowId = ref('WF_DEFAULT')

const uniqueWorkflows = computed(() => {
  return pipelineWorkflows.value
})

${oldCols}

const dynamicColumns = computed(() => {
  if (selectedWorkflowId.value === 'WF_DEFAULT') {
    return COLUMNS
  }
  const wf = pipelineWorkflows.value.find(w => w.id_workflow === selectedWorkflowId.value)
  if (wf && wf.statuses) {
    return wf.statuses.map(s => ({
      id: 'wf_' + s.id_status_workflow,
      value: s.status_name,
      label: s.status_name,
      percent: s['%status']
    }))
  }
  return COLUMNS
})`;

content = content.replace(oldCols, newCols);

// 3. Replace all COLUMNS with dynamicColumns
content = content.replace(/COLUMNS\.forEach/g, 'dynamicColumns.value.forEach');
content = content.replace(/COLUMNS\.map/g, 'dynamicColumns.value.map');
content = content.replace(/COLUMNS\.find/g, 'dynamicColumns.value.find');
content = content.replace(/v-for="col in COLUMNS"/g, 'v-for="col in dynamicColumns"');
content = content.replace('watch(COLUMNS,', 'watch(dynamicColumns,');

// 4. Update fetchWorkflows
content = content.replace('const fetchData = async () => {', 
`const fetchWorkflows = async () => {
  try {
    const res = await fetch(\`\${SCRIPT_URL}?sheet=pipeline_workflow&action=get\`)
    const result = await res.json()
    if (result.status === 'success') {
      pipelineWorkflows.value = result.data || []
    }
  } catch (err) {
    console.error(err)
  }
}

const fetchData = async () => {`);

// 5. Update onMounted
content = content.replace(
`onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  fetchData()
  fetchReports()
})`, 
`onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  fetchWorkflows()
  fetchData()
  fetchReports()
})`);

// 6. Update distributeItems to filter by selectedWorkflowId
content = content.replace(
`rootItems.forEach(item => {
    const colConfig = dynamicColumns.value.find`, 
`rootItems.forEach(item => {
    if (item.id_workflow !== selectedWorkflowId.value && !(selectedWorkflowId.value === 'WF_DEFAULT' && (!item.id_workflow || item.id_workflow === 'WF_DEFAULT'))) return;
    const colConfig = dynamicColumns.value.find`);

// 7. Update openAddModal
content = content.replace(
`formData.value.created_time = getCurrentFormattedTime()`, 
`formData.value.created_time = getCurrentFormattedTime()
  formData.value.id_workflow = selectedWorkflowId.value`);

// 8. Update duplicateItem
content = content.replace(
`newItem['%status'] = ''
  newItem.status_name`, 
`newItem['%status'] = ''
  newItem.id_workflow = selectedWorkflowId.value
  newItem.status_name`);

// 9. Update checkMobile
content = content.replace(
`const checkMobile = () => {
  const wasMobile = isMobile.value
  isMobile.value = window.innerWidth <= 768
  
  if (isMobile.value && !wasMobile) {
    dynamicColumns.value.forEach(c => {
      collapsedCols.value[c.id] = true
    })
    collapsedCols.value.unassigned = true
    if (dynamicColumns.value.length > 0) collapsedCols.value[dynamicColumns.value[0].id] = false
  } else if (!isMobile.value && wasMobile) {
    dynamicColumns.value.forEach(c => {
      collapsedCols.value[c.id] = (c.id === 'that_bai' || c.id === 'hoan_thanh')
    })
    collapsedCols.value.unassigned = false
  }
}`, 
`const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}`);

// 10. CSS Mobile
content = content.replace('</style>',
`
@media (max-width: 768px) {
  .kanban-wrapper {
    overflow-x: auto !important;
    overflow-y: hidden;
    padding-bottom: 20px;
    -webkit-overflow-scrolling: touch;
    width: calc(100vw - 48px);
    margin-left: 0;
    scroll-snap-type: x mandatory;
    flex-wrap: nowrap;
    display: flex;
  }
  .kanban-board {
    overflow-x: visible;
    width: max-content;
    flex: none;
  }
  .kanban-column {
    min-width: 280px !important;
    max-width: 280px !important;
    flex: 0 0 280px !important;
    scroll-snap-align: start;
    margin-right: 8px;
  }
  .unassigned-col {
    min-width: 280px !important;
    max-width: 280px !important;
    flex: 0 0 280px !important;
    scroll-snap-align: start;
  }
  .header-actions {
    flex-wrap: wrap;
  }
}
</style>`);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed Pipeline.vue successfully');
