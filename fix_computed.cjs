const fs = require('fs');
const path = require('path');
const file = path.join('src', 'components', 'Pipeline.vue');
let content = fs.readFileSync(file, 'utf8');

const replacement = `const uniqueWorkflows = computed(() => {
  const map = new Map()
  pipelineWorkflows.value.forEach(item => {
    if (item.id_workflow && !map.has(item.id_workflow)) {
      map.set(item.id_workflow, {
        id_workflow: item.id_workflow,
        name_workflow: item.name_workflow || item.id_workflow
      })
    }
  })
  return Array.from(map.values())
})

const COLUMNS = [
  { id: 'nhap', label: 'TẠM', value: 'TẠM', percent: '0%' },
  { id: 'col_30', label: '30%: Pipeline', value: 'Pipeline (khảo sát nhu cầu khách hàng)', percent: '30%' },
  { id: 'col_50', label: '50%: Forecast', value: 'Forecast (đã lên báo giá gởi khách hàng)', percent: '50%' },
  { id: 'col_70', label: '70%: Commit', value: 'Commit (EU đồng ý giải pháp, chờ ngân sách đầu tư)', percent: '70%' },
  { id: 'col_90', label: '90%: Closed Won', value: 'Closed Won (đã ký xác nhận đặt hàng)', percent: '90%' },
  { id: 'hoan_thanh', label: 'THÀNH CÔNG', value: 'THÀNH CÔNG', percent: '100%' },
  { id: 'that_bai', label: 'THẤT BẠI', value: 'THẤT BẠI', percent: '0%' }
]

const dynamicColumns = computed(() => {
  if (selectedWorkflowId.value === 'WF_DEFAULT') return COLUMNS;
  
  const statuses = pipelineWorkflows.value.filter(w => w.id_workflow === selectedWorkflowId.value);
  if (statuses.length > 0) {
    // Sort by status_index if available
    statuses.sort((a, b) => {
      const idxA = parseInt(a.status_index) || 0;
      const idxB = parseInt(b.status_index) || 0;
      return idxA - idxB;
    });
    
    return statuses.map(s => ({
      id: 'wf_' + s.id_status_workflow,
      value: s.status_name,
      label: s.status_name,
      percent: s['%status']
    }));
  }
  return COLUMNS;
})`;

content = content.replace(/const uniqueWorkflows = computed\(\(\) => \{\s*return pipelineWorkflows\.value\s*\}\)[\s\S]*?return COLUMNS\n\}\)/, replacement);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed computed properties!');
