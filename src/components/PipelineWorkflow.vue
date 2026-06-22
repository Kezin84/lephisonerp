<template>
  <div class="workflow-design-page">
    <div class="elite-filter-panel workflow-header">
      <div class="header-content">
        <h2>Cấu hình Workflow (Pipeline)</h2>
        <p>Quản lý các quy trình và trạng thái trong Pipeline của bạn.</p>
      </div>
      <div class="header-actions">
        <div class="search-container">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" v-model="searchQuery" placeholder="Tìm tên quy trình..." class="elite-input search-input" />
        </div>
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
          <div class="group-header" @click="toggleGroup(group.id_workflow)">
            <h3 class="group-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
              {{ group.name_workflow || 'Quy trình chưa đặt tên' }}
            </h3>
            <div class="group-header-actions">
              <span class="status-count-badge">{{ group.statuses.length }} bước</span>
              <button class="action-btn delete-btn" @click.stop="confirmDeleteWorkflow(group)" title="Xóa quy trình này">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
              <button class="action-btn toggle-btn mobile-only">
                <svg class="toggle-icon" :class="{ 'rotated': collapsedGroups[group.id_workflow] }" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
              </button>
            </div>
          </div>
          
          <div v-show="!collapsedGroups[group.id_workflow]" class="workflow-group-content">
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
            
            <!-- Show inherited workflow name when adding status to existing workflow -->
            <div v-if="modalMode === 'new_status'" class="elite-form-group">
              <label>Quy trình</label>
              <div class="readonly-field">{{ formData.name_workflow }}</div>
            </div>

            <div v-if="modalMode === 'new_workflow'" class="elite-form-group">
              <template v-if="currentStep === 0">
                <label>Tên Quy trình (Workflow) <span class="required">*</span></label>
                <input v-model="formData.name_workflow" type="text" class="elite-input" placeholder="Ví dụ: Quy trình Bán lẻ..." />
              </template>
              <template v-else>
                <div class="status-block">
                  <div class="elite-form-group" style="margin-bottom: 1rem;">
                    <label>Tên Trạng Thái {{ currentStep }} <span class="required">*</span></label>
                    <input v-model="newWorkflowStatuses[currentStep - 1].status_name" type="text" class="elite-input" placeholder="Ví dụ: Tiếp cận..." />
                  </div>
                  <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    <div class="elite-form-group" style="flex: 1; min-width: 120px;">
                      <label>Tiến độ (%)</label>
                      <input v-model="newWorkflowStatuses[currentStep - 1]['%status']" type="text" class="elite-input" placeholder="10%" />
                    </div>
                    <div class="elite-form-group" style="flex: 2; min-width: 150px;">
                      <label>Màu hiển thị</label>
                      <div class="color-picker-container" style="gap: 4px;">
                        <button v-for="color in PRESET_COLORS" :key="color.hex" class="color-swatch" :class="{ 'active': newWorkflowStatuses[currentStep - 1].status_color === color.hex }" :style="{ backgroundColor: color.hex, width: '24px', height: '24px' }" @click.prevent="newWorkflowStatuses[currentStep - 1].status_color = color.hex" :title="color.name">
                          <svg v-if="newWorkflowStatuses[currentStep - 1].status_color === color.hex" viewBox="0 0 24 24" width="14" height="14" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" style="mix-blend-mode: difference;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
            
            <template v-else>
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
            </template>
          </div>
        </div>
        
        <div class="elite-modal-footer" :style="modalMode === 'new_workflow' && currentStep > 0 ? 'flex-direction: column; gap: 12px;' : 'justify-content: space-between;'">
          <!-- ROW 1 when wizard > 0 -->
          <div v-if="modalMode === 'new_workflow' && currentStep > 0" style="display: flex; gap: 12px; width: 100%;">
            <button class="tech-vip-btn bg-glass" style="flex: 1; justify-content: center;" @click="currentStep--" :disabled="saving">
              Quay lại
            </button>
            <button class="tech-vip-btn bg-blue" style="flex: 1; justify-content: center;" @click="addNextStatus" :disabled="saving">+ Thêm tiếp</button>
          </div>
          
          <!-- ROW 2 when wizard > 0 -->
          <div v-if="modalMode === 'new_workflow' && currentStep > 0" style="width: 100%;">
            <button class="tech-vip-btn" style="width: 100%; justify-content: center; background: #22c55e; color: white; border: none;" @click="saveWorkflow" :disabled="saving">
              <span v-if="saving" class="spinner small"></span>
              <span v-else>Hoàn thành</span>
            </button>
          </div>

          <!-- NORMAL FOOTER FOR OTHERS -->
          <template v-if="!(modalMode === 'new_workflow' && currentStep > 0)">
            <button v-if="modalMode === 'edit_status'" class="tech-vip-btn" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3);" @click="confirmDelete(formData)" :disabled="saving">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              Xóa trạng thái
            </button>
            <div v-else></div>

            <div style="display: flex; gap: 1rem;">
              <button class="tech-vip-btn bg-glass" @click="closeModal" :disabled="saving">Hủy bỏ</button>
              
              <button v-if="modalMode === 'new_workflow' && currentStep === 0" class="tech-vip-btn bg-blue" @click="nextStep" :disabled="saving">Tiếp tục</button>
              
              <button v-else-if="modalMode !== 'new_workflow'" class="tech-vip-btn bg-blue" @click="saveWorkflow" :disabled="saving">
                <span v-if="saving" class="spinner small"></span>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                {{ modalMode === 'edit_status' ? 'Lưu thay đổi' : 'Thêm mới' }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Confirm Delete Workflow Modal -->
    <div v-if="showDeleteWorkflowModal" class="elite-modal-overlay" @click.self="showDeleteWorkflowModal = false">
      <div class="elite-modal-content" style="max-width: 400px;">
        <div class="elite-modal-header">
          <h2 class="elite-modal-title" style="color: #ef4444;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            Xác nhận xóa
          </h2>
          <button class="elite-modal-close" @click="showDeleteWorkflowModal = false">&times;</button>
        </div>
        
        <div class="elite-modal-body">
          <p style="color: #f8fafc; font-size: 0.95rem; line-height: 1.5; margin: 0;">
            Bạn có chắc chắn muốn xóa toàn bộ quy trình <strong style="color: #3b82f6;">"{{ workflowToDelete?.name_workflow }}"</strong> và <strong style="color: #ef4444;">{{ workflowToDelete?.statuses?.length || 0 }}</strong> trạng thái bên trong không?
          </p>
          <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 12px; margin-bottom: 0;">
            ⚠️ Hành động này không thể hoàn tác.
          </p>
        </div>
        
        <div class="elite-modal-footer">
          <button class="tech-vip-btn bg-glass" @click="showDeleteWorkflowModal = false" :disabled="saving">Hủy bỏ</button>
          <button class="tech-vip-btn" style="background: #ef4444; color: white; border: none;" @click="executeDeleteWorkflow" :disabled="saving">
            <span v-if="saving" class="spinner small"></span>
            Xóa quy trình
          </button>
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
const searchQuery = ref('')

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

const showDeleteWorkflowModal = ref(false)
const workflowToDelete = ref(null)

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

const newWorkflowStatuses = ref([{ status_name: '', '%status': '', status_color: '#94a3b8' }])
const currentStep = ref(0)

const nextStep = () => {
  if (currentStep.value === 0 && !formData.value.name_workflow) {
    showToast("Vui lòng nhập Tên Quy trình", 'error')
    return
  }
  currentStep.value++
}

const addNextStatus = () => {
  if (!newWorkflowStatuses.value[currentStep.value - 1].status_name) {
    showToast("Vui lòng nhập Tên Trạng Thái trước khi thêm", 'error')
    return
  }
  if (currentStep.value === newWorkflowStatuses.value.length) {
    newWorkflowStatuses.value.push({ status_name: '', '%status': '', status_color: '#94a3b8' })
  }
  currentStep.value++
}

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
  let result = Object.values(groups).map(g => {
    g.statuses.sort((a, b) => (parseInt(a.status_index) || 0) - (parseInt(b.status_index) || 0))
    return g
  })

  if (searchQuery.value.trim() !== '') {
    const q = searchQuery.value.toLowerCase().trim()
    result = result.filter(g => {
      const name = String(g.name_workflow || 'Quy trình chưa đặt tên').toLowerCase()
      return name.includes(q)
    })
  }

  return result
})

const modalTitle = computed(() => {
  if (modalMode.value === 'new_workflow') {
    if (currentStep.value === 0) return 'Tạo Quy trình mới'
    return `Khai báo Trạng thái ${currentStep.value}`
  }
  if (modalMode.value === 'new_status') return 'Thêm Trạng thái vào Quy trình'
  return 'Chỉnh sửa Trạng Thái'
})

onMounted(() => {
  window.addEventListener('resize', () => {
    const mobile = window.innerWidth <= 768
    if (mobile !== isMobile.value) {
      isMobile.value = mobile
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

      // Default collapse
      items.value.forEach(item => {
        collapsedGroups.value[item.id_workflow] = true
      })
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
  newWorkflowStatuses.value = [{ status_name: '', '%status': '', status_color: '#94a3b8' }]
  currentStep.value = 0
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
  if (modalMode.value === 'new_workflow') {
    if (!formData.value.name_workflow) {
      showToast("Vui lòng nhập Tên Quy trình", 'error')
      return
    }
    const validStatuses = newWorkflowStatuses.value.filter(s => s.status_name.trim() !== '')
    if (validStatuses.length === 0) {
      showToast("Vui lòng nhập ít nhất 1 Tên Trạng Thái", 'error')
      return
    }
    newWorkflowStatuses.value = validStatuses
  } else {
    if (!formData.value.status_name) {
      showToast("Vui lòng nhập Tên Trạng Thái", 'error')
      return
    }
  }

  const generateWorkflowId = () => 'WF_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  const generateStatusWorkflowId = () => 'ST_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

  if (modalMode.value === 'new_workflow') {
    newWorkflowStatuses.value.forEach(s => {
      let percentStatus = String(s['%status'] || '').trim()
      if (percentStatus && !percentStatus.endsWith('%')) {
        s['%status'] = percentStatus + '%'
      }
    })

    const wfId = generateWorkflowId()
    const payloadItems = []
    
    newWorkflowStatuses.value.forEach((s, idx) => {
      const stId = generateStatusWorkflowId() + idx
      const optimisticData = {
        id_workflow: wfId,
        name_workflow: formData.value.name_workflow,
        id_status_workflow: stId,
        status_index: idx + 1,
        status_name: s.status_name,
        '%status': s['%status'],
        status_color: s.status_color
      }
      items.value.push(optimisticData)
      payloadItems.push(optimisticData)
    })
    
    closeModal()
    saving.value = true
    try {
      let hasError = false
      for (const st of payloadItems) {
        const payload = {
          sheet: 'pipeline_workflow',
          action: 'insert',
          ...st
        }
        const res = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) })
        const result = await res.json()
        if (result.status !== 'success') {
          hasError = true
          console.error("Lỗi khi thêm trạng thái:", result.message)
        }
      }
      if (hasError) {
        showToast("Có lỗi khi thêm một số trạng thái.", 'error')
        fetchWorkflows()
      } else {
        showToast('Tạo quy trình thành công!')
      }
    } catch (err) {
      console.error("Lỗi lưu workflow:", err)
      showToast("Lỗi mạng khi lưu", 'error')
      fetchWorkflows()
    } finally {
      saving.value = false
    }
    return
  }

  // --- OPTIMISTIC UI for new_status & edit_status ---
  let percentStatus = String(formData.value['%status'] || '').trim()
  if (percentStatus && !percentStatus.endsWith('%')) {
    percentStatus += '%'
    formData.value['%status'] = percentStatus
  }

  const isNew = modalMode.value !== 'edit_status'
  const optimisticData = { ...formData.value }

  if (isNew) {
    if (modalMode.value === 'new_status') {
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

const confirmDeleteWorkflow = (group) => {
  workflowToDelete.value = group
  showDeleteWorkflowModal.value = true
}

const executeDeleteWorkflow = async () => {
  if (!workflowToDelete.value) return
  const group = workflowToDelete.value
  showDeleteWorkflowModal.value = false
  
  // --- OPTIMISTIC UI ---
  const originalItems = [...items.value]
  items.value = items.value.filter(i => i.id_workflow !== group.id_workflow)

  saving.value = true
  try {
    let hasError = false
    for (const status of group.statuses) {
      const payload = {
        sheet: 'pipeline_workflow',
        action: 'delete',
        idField: 'id_status_workflow',
        idValue: status.id_status_workflow
      }
      
      const res = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      const result = await res.json()
      if (result.status !== 'success') {
        hasError = true
        console.error("Lỗi khi xóa trạng thái:", result.message)
      }
    }
    
    if (hasError) {
      showToast("Có lỗi khi xóa một số trạng thái, vui lòng tải lại trang.", 'error')
      fetchWorkflows()
    } else {
      showToast('Đã xóa toàn bộ quy trình!')
    }
  } catch (err) {
    console.error("Lỗi xóa workflow:", err)
    showToast("Lỗi mạng khi xóa", 'error')
    items.value = originalItems // Revert
    fetchWorkflows()
  } finally {
    saving.value = false
    workflowToDelete.value = null
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
  align-items: center;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
  pointer-events: none;
}
.search-input {
  padding-left: 2.5rem !important;
  width: 250px;
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
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.workflow-group-content {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
  width: 100%;
}

.group-header {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  padding: 0.75rem 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  position: relative;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  cursor: pointer;
}

.group-header .group-title {
  margin: 0;
  font-size: 1.1rem;
  color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-align: center;
}

.group-header .group-header-actions {
  position: absolute;
  right: 1.5rem;
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-count-badge {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

@media (min-width: 769px) {
  .mobile-only { display: none !important; }
}
.toggle-icon {
  transition: transform 0.3s;
  color: #ffffff;
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
  right: -28px !important;
  width: 24px !important;
  height: 24px !important;
  transform: translateY(-50%) !important;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='5' y1='12' x2='19' y2='12'%3E%3C/line%3E%3Cpolyline points='12 5 19 12 12 19'%3E%3C/polyline%3E%3C/svg%3E") !important;
  background-repeat: no-repeat !important;
  background-position: center !important;
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

.group-header .action-btn {
  color: #ffffff;
}

.group-header .delete-btn {
  background: #ef4444;
}
.group-header .delete-btn:hover {
  background: #dc2626;
  color: white;
}

.group-header .toggle-btn {
  background: #ffffff;
}
.group-header .toggle-btn .toggle-icon {
  color: #16a34a;
}

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
  .search-container {
    width: 100%;
  }
  .search-input {
    width: 100%;
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
    padding: 1rem;
    justify-content: space-between;
  }
  .group-header .group-title {
    font-size: 1rem;
    justify-content: flex-start;
    text-align: left;
    flex: 1;
  }
  .group-header .group-header-actions {
    position: static;
  }
  .workflow-list {
    flex-direction: column !important;
    align-items: center !important;
    padding: 1.5rem !important;
    gap: 40px !important;
  }
  .workflow-item {
    width: 100% !important;
    max-width: 320px !important;
    flex: none !important;
  }
  .workflow-item:not(:last-child)::after {
    top: auto !important;
    bottom: -32px !important;
    right: 50% !important;
    transform: translateX(50%) rotate(90deg) !important;
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
