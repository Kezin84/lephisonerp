<template>
  <div class="workflow-design-page">
    <div class="elite-filter-panel workflow-header">
      <div class="header-content">
        <h2>Cấu hình Workflow (Pipeline)</h2>
        <p>Quản lý các quy trình và trạng thái trong Pipeline của bạn.</p>
      </div>
      <div class="header-actions">
        <button class="tech-vip-btn bg-blue" @click="openAddWorkflowModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Tạo Quy trình mới
        </button>
        <button class="tech-vip-btn bg-glass" @click="fetchWorkflows" :disabled="loading">
          <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 2v6h6M21.5 22v-6h-6"/><path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.2"/></svg>
          <span v-else class="spinner small"></span>
          Làm mới
        </button>
      </div>
    </div>

    <div class="workflow-content">
      <div v-if="loading && items.length === 0" class="loading-state">
        <span class="spinner large"></span>
        <p>Đang tải danh sách workflow...</p>
      </div>
      
      <div v-else-if="items.length === 0" class="empty-state">
        <p>Chưa có quy trình nào. Hãy tạo quy trình đầu tiên!</p>
      </div>

      <div v-else class="workflow-groups-container">
        <!-- Render each workflow group -->
        <div v-for="group in groupedWorkflows" :key="group.id_workflow" class="workflow-group-card">
          <div class="group-header" @click="toggleGroup(group.id_workflow)" style="cursor: pointer;">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
              {{ group.name_workflow || 'Quy trình chưa đặt tên' }}
            </h3>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span class="status-count-badge">{{ group.statuses.length }} bước</span>
              <svg class="mobile-only toggle-icon" :class="{ 'rotated': collapsedGroups[group.id_workflow] }" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
            </div>
          </div>
          
          <div v-show="!collapsedGroups[group.id_workflow]">
            <div class="workflow-list-header">
            <div class="col-drag"></div>
            <div class="col-status-name">Tên Trạng Thái</div>
            <div class="col-percent">% Hoàn Thành</div>
            <div class="col-actions">Thao tác</div>
          </div>

          <!-- Draggable List for this group -->
          <draggable 
            v-model="group.statuses" 
            :group="'wf-group-' + group.id_workflow" 
            item-key="id_status_workflow"
            @change="onListChange($event, group)"
            animation="200"
            ghost-class="ghost-item"
            drag-class="drag-item"
            :direction="isMobile ? 'vertical' : 'horizontal'"
            :disabled="isMobile"
            class="workflow-list"
          >
            <template #item="{ element, index }">
              <div class="workflow-item" @click="handleItemClick(element)" :style="{ cursor: 'pointer', border: `1px solid ${element.status_color || 'rgba(255,255,255,0.05)'}` }" :class="{ 'success-flash': element.isDraggingSuccess, 'swap-source': swapSourceItem && swapSourceItem.id_status_workflow === element.id_status_workflow }">
                
                <!-- Swap Button (Mobile Only) -->
                <button v-if="isMobile && (!swapSourceItem || swapSourceItem.id_workflow === element.id_workflow)" class="mobile-swap-btn" :class="{ 'active': swapSourceItem && swapSourceItem.id_status_workflow === element.id_status_workflow, 'target': swapSourceItem && swapSourceItem.id_status_workflow !== element.id_status_workflow }" @click.stop="handleSwapAction(element)">
                  <svg v-if="!swapSourceItem" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="11 17 7 21 3 17"></polyline><line x1="7" y1="21" x2="7" y2="9"></line><polyline points="13 7 17 3 21 7"></polyline><line x1="17" y1="3" x2="17" y2="15"></line></svg>
                  <svg v-else-if="swapSourceItem.id_status_workflow === element.id_status_workflow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </button>

                <div class="col-drag" title="Vị trí">
                  <span class="index-badge" style="background: #ef4444; color: #ffffff; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; box-shadow: 0 2px 4px rgba(239, 68, 68, 0.4);">{{ index + 1 }}</span>
                </div>
                <div class="col-status-name" style="display: flex; align-items: center; justify-content: center; text-align: center;">
                  <span style="color: #ffffff; font-weight: 700; font-size: 1.1rem; letter-spacing: 0.5px;">{{ element.status_name || '---' }}</span>
                </div>
                <div class="col-percent font-bold" style="color: #ffffff; font-size: 1.4rem;">{{ element['%status'] || '0%' }}</div>
              </div>
            </template>
          </draggable>

          <div class="group-footer">
            <button class="tech-vip-btn add-status-btn" @click="openAddStatusModal(group)">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Thêm Trạng thái vào quy trình này
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="elite-modal-overlay" @click.self="closeModal">
      <div class="elite-modal-content">
        <div class="elite-modal-header">
          <h2 class="elite-modal-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            {{ modalTitle }}
          </h2>
          <button class="elite-modal-close" @click="closeModal">&times;</button>
        </div>
        
        <div class="elite-modal-body">
          <div class="elite-form-grid">
            
            <!-- Only show when creating a new workflow -->
            <div v-if="modalMode === 'new_workflow'" class="elite-form-group">
              <label>Tên Quy trình (Workflow) <span class="required">*</span></label>
              <input v-model="formData.name_workflow" type="text" class="elite-input" placeholder="Ví dụ: Quy trình Bán lẻ..." />
              <small class="hint">Khởi tạo quy trình cần tạo luôn bước trạng thái đầu tiên bên dưới.</small>
            </div>

            <!-- Show inherited workflow name when adding status to existing workflow -->
            <div v-if="modalMode === 'new_status'" class="elite-form-group">
              <label>Quy trình</label>
              <div class="readonly-field">{{ formData.name_workflow }}</div>
            </div>

            <div class="elite-form-group">
              <label>Tên Trạng Thái (Bước) <span class="required">*</span></label>
              <input v-model="formData.status_name" type="text" class="elite-input" placeholder="Ví dụ: Tiếp cận khách hàng..." />
            </div>

            <div class="elite-form-group">
              <label>Tiến độ (%)</label>
              <input v-model="formData['%status']" type="text" class="elite-input" placeholder="Ví dụ: 10%" />
            </div>

            <div class="elite-form-group">
              <label>Màu hiển thị (Tùy chọn)</label>
              <div class="color-picker-container">
                <button 
                  v-for="color in PRESET_COLORS" 
                  :key="color.hex" 
                  class="color-swatch"
                  :class="{ 'active': formData.status_color === color.hex }"
                  :style="{ backgroundColor: color.hex }"
                  @click.prevent="formData.status_color = color.hex"
                  :title="color.name"
                >
                  <svg v-if="formData.status_color === color.hex" viewBox="0 0 24 24" width="16" height="16" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" style="mix-blend-mode: difference;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="elite-modal-footer" style="justify-content: space-between;">
          <button v-if="modalMode === 'edit_status'" class="tech-vip-btn" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3);" @click="confirmDelete(formData)" :disabled="saving">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Xóa trạng thái
          </button>
          <div v-else></div>
          <div style="display: flex; gap: 1rem;">
            <button class="tech-vip-btn bg-glass" @click="closeModal" :disabled="saving">Hủy bỏ</button>
            <button class="tech-vip-btn bg-blue" @click="saveWorkflow" :disabled="saving">
              <span v-if="saving" class="spinner small"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              {{ modalMode === 'edit_status' ? 'Lưu thay đổi' : 'Thêm mới' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="saving && !showModal && !isReordering" class="elite-modal-overlay">
      <div style="text-align: center;">
        <div class="spinner large"></div>
        <div style="color: #fff; margin-top: 1rem; font-weight: 600;">Đang xử lý dữ liệu...</div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div v-if="toastMessage" class="elite-toast" :class="toastType">
      <svg v-if="toastType === 'success'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      {{ toastMessage }}
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import draggable from 'vuedraggable'

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx1yDOQLxYgJb5w30KmxQHF8AYUZln_5q58HCKP4zlUmtJye6aJBiSt3oyT0j_3QaigdQ/exec'

// Raw flat list of items from DB
const items = ref([])
const loading = ref(false)
const saving = ref(false)
const isReordering = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

const isMobile = ref(window.innerWidth <= 768)
const collapsedGroups = ref({})
const swapSourceItem = ref(null)

const toggleGroup = (id) => {
  collapsedGroups.value[id] = !collapsedGroups.value[id]
}

const showToast = (msg, type = 'success') => {
  toastMessage.value = msg
  toastType.value = type
  setTimeout(() => { toastMessage.value = '' }, 3000)
}

// Modal state
const showModal = ref(false)
const modalMode = ref('new_workflow') // 'new_workflow', 'new_status', 'edit_status'
const targetGroup = ref(null)

const PRESET_COLORS = [
  { hex: '#94a3b8', name: 'Xám (Mặc định)' },
  { hex: '#3b82f6', name: 'Xanh dương' },
  { hex: '#10b981', name: 'Xanh ngọc' },
  { hex: '#84cc16', name: 'Xanh lá mạ' },
  { hex: '#eab308', name: 'Vàng' },
  { hex: '#f97316', name: 'Cam' },
  { hex: '#ef4444', name: 'Đỏ' },
  { hex: '#ec4899', name: 'Hồng' },
  { hex: '#8b5cf6', name: 'Tím' },
  { hex: '#06b6d4', name: 'Xanh Cyan' }
]

const defaultForm = {
  id_status_workflow: '',
  id_workflow: '',
  name_workflow: '',
  '%status': '',
  status_name: '',
  status_index: '',
  status_color: '#94a3b8'
}

const formData = ref({ ...defaultForm })

// Group items by id_workflow
const groupedWorkflows = computed(() => {
  const groups = {}
  items.value.forEach(item => {
    if (!groups[item.id_workflow]) {
      groups[item.id_workflow] = {
        id_workflow: item.id_workflow,
        name_workflow: item.name_workflow,
        statuses: []
      }
    }
    groups[item.id_workflow].statuses.push(item)
  })
  
  // Convert to array and sort statuses by status_index
  return Object.values(groups).map(g => {
    g.statuses.sort((a, b) => (parseInt(a.status_index) || 0) - (parseInt(b.status_index) || 0))
    return g
  })
})

const modalTitle = computed(() => {
  if (modalMode.value === 'new_workflow') return 'Tạo Quy trình mới'
  if (modalMode.value === 'new_status') return 'Thêm Trạng thái vào Quy trình'
  return 'Chỉnh sửa Trạng Thái'
})

onMounted(() => {
  window.addEventListener('resize', () => {
    const mobile = window.innerWidth <= 768
    if (mobile !== isMobile.value) {
      isMobile.value = mobile
      if (!mobile) {
        collapsedGroups.value = {}
      }
    }
  })
  fetchWorkflows()
})

const fetchWorkflows = async () => {
  loading.value = true
  try {
    const res = await fetch(`${SCRIPT_URL}?sheet=pipeline_workflow&action=get`)
    const result = await res.json()
    if (result.status === 'success') {
      items.value = (result.data || []).map(item => {
        let p = item['%status'];
        if (p !== null && p !== undefined && p !== '') {
          let strP = String(p).trim();
          if (!strP.endsWith('%')) {
            if (!isNaN(strP)) {
              let num = Number(strP);
              if (num >= 0 && num <= 1 && strP.includes('.')) {
                item['%status'] = Math.round(num * 100) + '%';
              } else {
                item['%status'] = strP + '%';
              }
            } else {
              item['%status'] = strP;
            }
          }
        }
        return item;
      });

      // Default collapse on mobile
      if (isMobile.value) {
        items.value.forEach(item => {
          collapsedGroups.value[item.id_workflow] = true
        })
      }
    } else {
      console.error('Fetch error:', result.message)
    }
  } catch (err) {
    console.error('Network error:', err)
  } finally {
    loading.value = false
  }
}

const openAddWorkflowModal = () => {
  formData.value = { ...defaultForm }
  modalMode.value = 'new_workflow'
  targetGroup.value = null
  showModal.value = true
}

const openAddStatusModal = (group) => {
  formData.value = { 
    ...defaultForm, 
    id_workflow: group.id_workflow,
    name_workflow: group.name_workflow
  }
  modalMode.value = 'new_status'
  targetGroup.value = group
  showModal.value = true
}

const handleItemClick = (element) => {
  if (swapSourceItem.value && swapSourceItem.value.id_workflow === element.id_workflow) {
    handleSwapAction(element)
  } else {
    openEditModal(element)
  }
}

const handleSwapAction = async (element) => {
  if (!swapSourceItem.value) {
    swapSourceItem.value = element
  } else if (swapSourceItem.value.id_status_workflow === element.id_status_workflow) {
    swapSourceItem.value = null // Cancel swap
  } else {
    // Execute Swap
    const sourceItem = swapSourceItem.value
    const targetItem = element
    
    if (sourceItem.id_workflow !== targetItem.id_workflow) return
    
    const mainSource = items.value.find(i => i.id_status_workflow === sourceItem.id_status_workflow)
    const mainTarget = items.value.find(i => i.id_status_workflow === targetItem.id_status_workflow)
    
    if (mainSource && mainTarget) {
      // Optimistic Swap
      const tempIndex = mainSource.status_index
      mainSource.status_index = mainTarget.status_index
      mainTarget.status_index = tempIndex
      
      swapSourceItem.value = null
      
      mainSource.isDraggingSuccess = true
      mainTarget.isDraggingSuccess = true
      setTimeout(() => { 
        mainSource.isDraggingSuccess = false
        mainTarget.isDraggingSuccess = false
      }, 1000)

      saving.value = true
      isReordering.value = true
      try {
        const payload = {
          sheet: 'pipeline_workflow',
          action: 'update_bulk',
          idField: 'id_status_workflow',
          items: [ { ...mainSource }, { ...mainTarget } ]
        }
        
        const res = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) })
        const result = await res.json()
        
        if (result.status === 'success') {
          showToast('Hoán đổi vị trí thành công!')
        } else {
          showToast("Lỗi khi hoán đổi: " + result.message, 'error')
          fetchWorkflows()
        }
      } catch (err) {
        console.error("Lỗi hoán đổi:", err)
        showToast("Lỗi mạng khi hoán đổi", 'error')
        fetchWorkflows()
      } finally {
        saving.value = false
        isReordering.value = false
      }
    }
  }
}

const openEditModal = (item) => {
  formData.value = { ...item }
  modalMode.value = 'edit_status'
  showModal.value = true
}
const closeModal = () => {
  showModal.value = false
}

const saveWorkflow = async () => {
  if (modalMode.value === 'new_workflow' && !formData.value.name_workflow) {
    showToast("Vui lòng nhập Tên Quy trình", 'error')
    return
  }
  if (!formData.value.status_name) {
    showToast("Vui lòng nhập Tên Trạng Thái", 'error')
    return
  }

  // Auto format %status
  let percentStatus = String(formData.value['%status'] || '').trim()
  if (percentStatus && !percentStatus.endsWith('%')) {
    percentStatus += '%'
    formData.value['%status'] = percentStatus
  }

  const isNew = modalMode.value !== 'edit_status'
  
  // --- OPTIMISTIC UI ---
  const optimisticData = { ...formData.value }
  if (isNew) {
    if (modalMode.value === 'new_workflow') {
      optimisticData.id_workflow = generateWorkflowId()
      optimisticData.id_status_workflow = generateStatusWorkflowId()
      optimisticData.status_index = 1
    } else if (modalMode.value === 'new_status') {
      optimisticData.id_status_workflow = generateStatusWorkflowId()
      optimisticData.status_index = targetGroup.value.statuses.length + 1
    }
    items.value.push(optimisticData)
  } else {
    const idx = items.value.findIndex(i => i.id_status_workflow === optimisticData.id_status_workflow)
    if (idx !== -1) items.value[idx] = optimisticData
  }

  // Prepare payload and close modal immediately
  formData.value = { ...optimisticData }
  closeModal()

  // --- BACKGROUND API CALL ---
  saving.value = true
  try {
    const payload = {
      sheet: 'pipeline_workflow',
      action: isNew ? 'insert' : 'update',
      ...formData.value
    }
    
    if (!isNew) {
      payload.idField = 'id_status_workflow'
      payload.idValue = formData.value.id_status_workflow
    }

    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    
    const result = await res.json()
    
    if (result.status === 'success') {
      showToast(isNew ? 'Thêm mới thành công!' : 'Lưu thay đổi thành công!')
    } else {
      showToast("Lỗi khi lưu: " + result.message, 'error')
      fetchWorkflows() // Revert state
    }
  } catch (err) {
    console.error("Lỗi lưu workflow:", err)
    showToast("Lỗi mạng khi lưu", 'error')
    fetchWorkflows() // Revert state
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (item) => {
  if (!confirm(`Bạn có chắc chắn muốn xóa trạng thái "${item.status_name}" không?`)) return
  
  // --- OPTIMISTIC UI ---
  const originalItems = [...items.value]
  items.value = items.value.filter(i => i.id_status_workflow !== item.id_status_workflow)
  closeModal()

  // --- BACKGROUND API CALL ---
  saving.value = true
  try {
    const payload = {
      sheet: 'pipeline_workflow',
      action: 'delete',
      idField: 'id_status_workflow',
      idValue: item.id_status_workflow
    }
    
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    
    const result = await res.json()
    
    if (result.status === 'success') {
      showToast('Đã xóa trạng thái!')
      // Background reindex
      const group = groupedWorkflows.value.find(g => g.id_workflow === item.id_workflow)
      if (group && group.statuses.length > 0) {
        updateAllIndexesForGroup(group)
      }
    } else {
      showToast("Lỗi khi xóa: " + result.message, 'error')
      items.value = originalItems // Revert
      fetchWorkflows()
    }
  } catch (err) {
    console.error("Lỗi xóa:", err)
    alert("Lỗi mạng khi xóa")
  } finally {
    saving.value = false
  }
}

const onListChange = async (event, group) => {
  // Only handle drag and drop updates
  if (event.moved) {
    const movedItem = event.moved.element
    saving.value = true
    isReordering.value = true
    try {
      await updateAllIndexesForGroup(group)
      movedItem.isDraggingSuccess = true
      showToast('Cập nhật thứ tự thành công!')
      setTimeout(() => { movedItem.isDraggingSuccess = false }, 1000)
    } finally {
      saving.value = false
      isReordering.value = false
    }
  }
}

const updateAllIndexesForGroup = async (group) => {
  // Update status_index locally for this specific group
  const updates = []
  
  // group.statuses is sorted by draggable automatically due to v-model binding
  group.statuses.forEach((item, index) => {
    const newIndex = index + 1
    if (item.status_index !== newIndex) {
      item.status_index = newIndex
      updates.push({ ...item })
      
      // Update original flat list as well
      const mainIdx = items.value.findIndex(i => i.id_status_workflow === item.id_status_workflow)
      if (mainIdx !== -1) items.value[mainIdx].status_index = newIndex
    }
  })

  if (updates.length === 0) return

  try {
    const payload = {
      sheet: 'pipeline_workflow',
      action: 'update_bulk',
      idField: 'id_status_workflow', // Matches unique key
      items: updates
    }
    
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    
    const result = await res.json()
    if (result.status !== 'success') {
      console.warn("Bulk update failed, trying sequential updates.", result.message)
      await fallbackSequentialUpdate(updates)
    }
  } catch (err) {
    console.warn("Error doing bulk update, trying sequential. ", err)
    await fallbackSequentialUpdate(updates)
  }
}

const fallbackSequentialUpdate = async (updates) => {
  for (const update of updates) {
    const payload = {
      sheet: 'pipeline_workflow',
      action: 'update',
      idField: 'id_status_workflow',
      idValue: update.id_status_workflow,
      ...update
    }
    await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    }).catch(e => console.error("Update error for item", update, e))
  }
}

</script>

<style scoped>
.workflow-design-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 2rem;
}

.workflow-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: rgba(30, 41, 59, 0.7);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.05);
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
}

.header-content h2 {
  margin: 0;
  color: #f8fafc;
  font-size: 1.25rem;
  font-weight: 700;
}

.header-content p {
  margin: 0.5rem 0 0;
  color: #94a3b8;
  font-size: 0.9rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.bg-blue {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.bg-glass {
  background: rgba(255,255,255,0.1);
  color: #e2e8f0;
  border: 1px solid rgba(255,255,255,0.1);
}

.tech-vip-btn {
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tech-vip-btn:hover {
  transform: translateY(-2px);
}

.workflow-content {
  background: rgba(15, 23, 42, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.05);
  min-height: 400px;
  padding: 1.5rem;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #94a3b8;
}

.workflow-groups-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.workflow-group-card {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
}

.group-header {
  background: rgba(15, 23, 42, 0.8);
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.group-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #f8fafc;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-count-badge {
  background: rgba(56, 189, 248, 0.1);
  color: #38bdf8;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid rgba(56, 189, 248, 0.2);
}

.mobile-only {
  display: block;
}
@media (min-width: 769px) {
  .mobile-only { display: none; }
}
.toggle-icon {
  transition: transform 0.3s;
  color: #94a3b8;
}
.toggle-icon.rotated {
  transform: rotate(180deg);
}

.workflow-list-header {
  display: none !important;
}

.workflow-list {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  overflow-x: auto !important;
  gap: 32px !important;
  padding: 1rem 0.5rem 2rem 0.5rem !important;
  scrollbar-width: thin;
}

.workflow-list::-webkit-scrollbar {
  height: 6px;
}
.workflow-list::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2);
  border-radius: 3px;
}

.workflow-item {
  position: relative;
  display: flex !important;
  flex-direction: column !important;
  align-items: stretch !important;
  width: 220px !important;
  flex: 0 0 220px !important;
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9)) !important;
  margin-bottom: 0 !important;
  border-radius: 12px !important;
  padding: 16px !important;
  gap: 12px !important;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1) !important;
  transition: transform 0.2s, box-shadow 0.2s !important;
}

.workflow-item:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3) !important;
  border-color: rgba(59, 130, 246, 0.3) !important;
}

/* Arrow right after each card except the last one */
.workflow-item:not(:last-child)::after {
  content: '' !important;
  position: absolute !important;
  top: 50% !important;
  right: -22px !important;
  width: 12px !important;
  height: 12px !important;
  transform: translateY(-50%) rotate(45deg) !important;
  border-top: 2px solid #64748b !important;
  border-right: 2px solid #64748b !important;
  z-index: 10 !important;
}

.col-drag { flex: none !important; width: 100% !important; display: flex !important; justify-content: space-between !important; align-items: center !important; }
.col-status-name { flex: 1 !important; display: flex !important; justify-content: center !important; padding: 10px 0 !important; }
.col-percent { flex: none !important; text-align: center !important; font-size: 1.1rem !important; margin-bottom: 8px !important; }
.col-actions { flex: none !important; width: 100% !important; justify-content: center !important; gap: 16px !important; border-top: 1px solid rgba(255,255,255,0.05) !important; padding-top: 12px !important; }

.ghost-item {
  opacity: 0.3 !important;
  background: rgba(59, 130, 246, 0.05) !important;
  border: 2px dashed rgba(59, 130, 246, 0.5) !important;
  transform: scale(0.95) !important;
}

.drag-item {
  opacity: 1 !important;
  transform: scale(1.05) rotate(2deg) !important;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5) !important;
  z-index: 100 !important;
}

.success-flash {
  animation: flashGreen 1s ease-out;
}

.swap-source {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5) !important;
}

.mobile-swap-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  width: 32px;
  height: 32px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  cursor: pointer;
  transition: all 0.3s;
}
.mobile-swap-btn:active { transform: scale(0.9); }
.mobile-swap-btn.active {
  background: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
}
.mobile-swap-btn.target {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.5);
  animation: pulseGreen 1.5s infinite;
}

@keyframes flashGreen {
  0% { box-shadow: 0 0 0 2px #22c55e, 0 0 20px rgba(34, 197, 94, 0.5) !important; border-color: #22c55e !important; }
  100% { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1) !important; border-color: rgba(255,255,255,0.05) !important; }
}

.elite-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 9999;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5);
  animation: slideDown 0.3s ease-out;
}
.elite-toast.success { border-bottom: 3px solid #22c55e; }
.elite-toast.error { border-bottom: 3px solid #ef4444; }

@keyframes slideDown {
  from { top: -50px; opacity: 0; }
  to { top: 20px; opacity: 1; }
}

.drag-handle {
  cursor: grab;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.drag-handle:active {
  cursor: grabbing;
}

.index-badge {
  background: rgba(255,255,255,0.1);
  color: #94a3b8;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.8rem;
  font-weight: 700;
}

/* Columns setup */
.col-drag { flex: 0 0 60px; }
.col-status-name { flex: 2; }
.col-percent { flex: 1; }
.col-actions { flex: 0 0 100px; display: flex; gap: 0.5rem; justify-content: flex-end; }

.font-bold { font-weight: 700; }
.text-blue { color: #38bdf8; }

.status-badge {
  background: rgba(255,255,255,0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #e2e8f0;
  border: 1px solid rgba(255,255,255,0.1);
}

.action-btn {
  background: rgba(255,255,255,0.05);
  border: none;
  color: #94a3b8;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn:hover { background: rgba(56, 189, 248, 0.2); color: #38bdf8; }
.delete-btn:hover { background: rgba(244, 63, 94, 0.2); color: #fb7185; }

.group-footer {
  padding: 1rem 1.5rem;
  background: rgba(15, 23, 42, 0.4);
  border-top: 1px solid rgba(255,255,255,0.02);
}

.add-status-btn {
  background: transparent;
  color: #94a3b8;
  border: 1px dashed rgba(255,255,255,0.2);
  width: 100%;
  justify-content: center;
  padding: 0.75rem;
}

.add-status-btn:hover {
  background: rgba(255,255,255,0.05);
  color: #f8fafc;
  border-color: rgba(255,255,255,0.4);
}

/* Modal */
.elite-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.elite-modal-content {
  background: #1e293b;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
  overflow: hidden;
}

.elite-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: rgba(15, 23, 42, 0.5);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.elite-modal-title {
  margin: 0;
  font-size: 1.1rem;
  color: #f8fafc;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.elite-modal-close {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s;
}
.elite-modal-close:hover { color: #f8fafc; }

.elite-modal-body {
  padding: 1.5rem;
}

.elite-form-grid {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.elite-form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.elite-form-group label {
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 600;
}
.required { color: #ef4444; }

.elite-input {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255,255,255,0.1);
  color: #f8fafc;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s;
}
.elite-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.readonly-field {
  background: rgba(15, 23, 42, 0.3);
  border: 1px solid rgba(255,255,255,0.05);
  color: #94a3b8;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: not-allowed;
}

.hint {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.elite-modal-footer {
  padding: 1.25rem 1.5rem;
  background: rgba(15, 23, 42, 0.5);
  border-top: 1px solid rgba(255,255,255,0.05);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.spinner {
  border: 2px solid rgba(255,255,255,0.2);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
.spinner.small { width: 14px; height: 14px; border-width: 2px; }
.spinner.large { width: 40px; height: 40px; border-width: 3px; }

.color-picker-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.color-swatch {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
}

.color-swatch:hover {
  transform: scale(1.1);
}

.color-swatch.active {
  border-color: #fff;
  box-shadow: 0 0 0 2px rgba(255,255,255,0.2);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .workflow-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
  }
  .header-actions {
    width: 100%;
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 8px;
  }
  .header-actions button {
    flex: 1;
    justify-content: center;
    white-space: nowrap;
    padding: 8px 12px;
  }
  .workflow-list-header {
    display: none;
  }
  .mobile-only {
    display: inline-block;
  }
  .group-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
  }
  .group-header h3 {
    font-size: 1rem;
  }
  .workflow-list {
    flex-direction: column !important;
    align-items: center !important;
    padding: 1.5rem !important;
    gap: 24px !important;
  }
  .workflow-item {
    width: 100% !important;
    max-width: 320px !important;
    flex: none !important;
  }
  .workflow-item:not(:last-child)::after {
    top: auto !important;
    bottom: -18px !important;
    right: 50% !important;
    transform: translateX(50%) rotate(135deg) !important;
  }
  .elite-modal-content {
    width: 95% !important;
    margin: 1rem !important;
    max-height: 90vh !important;
  }
  .color-picker-container {
    justify-content: center;
  }
}
</style>
