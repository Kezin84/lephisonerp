<template>
  <div class="timeline-node">
    <div class="node-content">
      
      <!-- A. Bridge from above down to dot center (only if child) -->
      <div class="line-bridge" v-if="isChild"></div>

      <!-- B. Horizontal connector to dot (only if child) -->
      <div class="line-horizontal" v-if="isChild"></div>

      <!-- C. Pass-through line to next sibling (only if child AND not last) -->
      <div class="line-pass-through" v-if="isChild && !isLast"></div>

      <!-- D. Parent line to own children (only if has children) -->
      <div class="line-to-children" v-if="node.children && node.children.length > 0"></div>

      <div class="node-dot">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      </div>

      <!-- CONTENT CARD -->
      <div class="node-card tl-rect-card tl-rect--green" :class="{ 'is-highlighted': node.id == highlightedId }" :id="'tl-node-' + node.id" @click="$emit('edit', node)">
        <div class="tl-shimmer tl-shimmer--green"></div>
        <div class="tl-rect-border tl-border--green"></div>
        
        <div class="tl-rect-header" style="display: flex; flex-direction: row; justify-content: space-between; align-items: flex-start;">
          <div class="tl-rect-tags">
            <!-- Badge Thời gian -->
            <span class="tl-status-chip is-green" style="background: rgba(148,163,184,0.1); color: #94a3b8; border: 1px solid rgba(148,163,184,0.2);">
              {{ formatTime(node.createdTime) }}
            </span>
            <!-- Badge Mức độ ưu tiên -->
            <span v-if="node.mucDoUuTien" class="tl-status-chip" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2);">
              {{ node.mucDoUuTien }}
            </span>
            <!-- Badge Trạng thái xử lý -->
            <span v-if="node.trangThaiXuLy" class="tl-status-chip" :class="getStatusClass(node.trangThaiXuLy)">
              {{ node.trangThaiXuLy }}
            </span>
            <!-- Badge Trạng thái báo giá -->
            <span v-if="node.trangThaiBaoGia" class="tl-status-chip" :class="getQuoteClass(node.trangThaiBaoGia)">
              {{ node.trangThaiBaoGia }}
            </span>
          </div>
          
          <button @click.stop="$emit('delete', node.id)" title="Xóa card" style="background: #ef4444; color: #ffffff; border: none; cursor: pointer; padding: 4px; border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; opacity: 0.9; box-shadow: 0 2px 4px rgba(239,68,68,0.3);" onmouseover="this.style.opacity='1'; this.style.background='#dc2626'" onmouseout="this.style.opacity='0.9'; this.style.background='#ef4444'">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
        
        <div class="tl-rect-body" style="margin-top: 0.5rem; padding-top: 0.8rem; border-top: 1px dashed rgba(255,255,255,0.05);">
          <div class="tl-body-text">{{ node.noiDung }}</div>
          <div v-if="node.ghiChu && node.ghiChu.trim()" style="margin-top: 0.4rem; font-size: 0.85rem; font-weight: 600; font-style: italic; color: #ef4444;">
            * Ghi chú: {{ node.ghiChu }}
          </div>
        </div>
        
        <div v-if="hasAttachments(node)" class="tl-attachments" style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.5rem; padding: 0 0.5rem;">
          <!-- Tài liệu -->
          <div v-if="getFiles(node.linkFileBaoGia).length > 0" style="display: flex; flex-direction: column; gap: 0.4rem;">
            <div v-for="(fileObj, i) in getFiles(node.linkFileBaoGia)" :key="'f'+i" style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
              <a :href="typeof fileObj === 'string' ? fileObj : fileObj.url" target="_blank" @click.stop class="attach-badge" :class="getFileBadgeClass(fileObj)" style="flex: 1; min-width: 0;">
                <span v-html="getFileIconSvg(fileObj)" style="display: flex; align-items: center;"></span>
                <span class="attach-text" :title="getFileName(fileObj, 'File', i, node)">{{ truncateFileName(getFileName(fileObj, 'File đính kèm', i, node)) }}</span>
              </a>
              <button @click.stop.prevent="handleDownloadClick($event, typeof fileObj === 'string' ? fileObj : fileObj.url, getFileName(fileObj, 'File đính kèm', i, node))" title="Tải về" style="background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); border-radius: 6px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.2s;" onmouseover="this.style.background='#10b981'; this.style.color='white'" onmouseout="this.style.background='rgba(16,185,129,0.1)'; this.style.color='#10b981'">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              </button>
            </div>
          </div>
          
          <!-- Hình ảnh -->
          <div v-if="getFiles(node.linkImgSave).length > 0" style="display: flex; flex-direction: column; gap: 0.4rem;">
            <div v-for="(fileObj, i) in getFiles(node.linkImgSave)" :key="'i'+i" style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
              <a :href="typeof fileObj === 'string' ? fileObj : fileObj.url" target="_blank" @click.stop class="attach-badge badge-image" style="flex: 1; min-width: 0;">
                <img :src="typeof fileObj === 'string' ? fileObj : fileObj.url" style="width: 24px; height: 24px; object-fit: cover; border-radius: 4px; flex-shrink: 0; background: rgba(0,0,0,0.2);" />
                <span class="attach-text" :title="getFileName(fileObj, 'Hình ảnh', i, node)">{{ truncateFileName(getFileName(fileObj, 'Hình ảnh', i, node)) }}</span>
              </a>
              <button @click.stop.prevent="handleDownloadClick($event, typeof fileObj === 'string' ? fileObj : fileObj.url, getFileName(fileObj, 'Hình ảnh', i, node))" title="Tải về" style="background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); border-radius: 6px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.2s;" onmouseover="this.style.background='#10b981'; this.style.color='white'" onmouseout="this.style.background='rgba(16,185,129,0.1)'; this.style.color='#10b981'">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="children-list" v-if="node.children && node.children.length > 0">
      <FileTimelineNode v-for="(child, index) in node.children" 
                        :key="child.id" 
                        :node="child" :customer="customer" 
                        :isChild="true"
                        :isLast="index === node.children.length - 1"
                        :highlighted-id="highlightedId"
                        @edit="$emit('edit', $event)" 
                        @delete="$emit('delete', $event)" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  node: Object,
  customer: Object,
  isChild: { type: Boolean, default: false },
  isLast: { type: Boolean, default: false },
  highlightedId: { type: [String, Number], default: null }
});

const emit = defineEmits(['edit', 'delete']);

const formatTime = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
};

// Force color to green
const getCardColorMode = (node) => {
  return 'green';
};

const getStatusClass = (status) => {
  if (status === 'Đã gửi') return 'is-done';
  return 'is-pending';
};

const getQuoteClass = (status) => {
  if (status === 'Thành công') return 'is-done';
  if (status === 'Thất bại') return 'is-failed';
  return 'is-pending';
};

const getFiles = (field) => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  if (typeof field === 'string') return field.split('\n').filter(l => l.trim() !== '');
  return [];
};

const hasAttachments = (node) => {
  return getFiles(node.linkFileBaoGia).length > 0 || getFiles(node.linkImgSave).length > 0;
};

const getFileName = (fileObj, prefix, index, node) => {
  if (typeof fileObj === 'object' && fileObj.name) return fileObj.name;
  const url = typeof fileObj === 'string' ? fileObj : fileObj.url;
  try {
    const parts = url.split('/');
    let name = parts[parts.length - 1];
    name = name.split('?')[0];
    name = decodeURIComponent(name);
    return name;
  } catch (e) {
    return `${prefix} ${index + 1}`;
  }
};

const truncateFileName = (name) => {
  if (name.length > 25) {
    return name.substring(0, 15) + '...' + name.substring(name.length - 7);
  }
  return name;
};

// Use original file name for checking extension to ensure icons show correctly
const getOriginalFileName = (fileObj) => {
  if (typeof fileObj === 'object' && fileObj.name) return fileObj.name;
  return typeof fileObj === 'string' ? fileObj : fileObj.url;
};

const getFileIconType = (fileObj) => {
  const name = getOriginalFileName(fileObj).toLowerCase();
  if (name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.doc') || name.endsWith('.docx')) return 'word';
  if (name.endsWith('.xls') || name.endsWith('.xlsx') || name.endsWith('.csv')) return 'excel';
  if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.gif')) return 'image';
  return 'default';
};

const getFileBadgeClass = (fileObj) => {
  const type = getFileIconType(fileObj);
  if (type === 'pdf') return 'badge-pdf';
  if (type === 'word') return 'badge-word';
  if (type === 'excel') return 'badge-excel';
  return 'badge-default';
};

const getFileIconSvg = (fileObj) => {
  const type = getFileIconType(fileObj);
  const imgStyle = "width: 16px; height: 16px; object-fit: contain; border-radius: 2px;";
  if (type === 'pdf') return `<img src="https://i.ibb.co/3YdHRTFs/unnamed.webp" style="${imgStyle}" />`;
  if (type === 'word') return `<img src="https://i.ibb.co/d0Y6v4yD/images-7.jpg" style="${imgStyle}" />`;
  if (type === 'excel') return `<img src="https://i.ibb.co/b5yq09VP/images-8.jpg" style="${imgStyle}" />`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`;
};

const handleDownloadClick = async (event, url, defaultName) => {
  event.preventDefault();
  let name = defaultName;
  if (!url || typeof url !== 'string') return;
  const urlParts = url.split('?')[0].split('/');
  const lastPart = urlParts[urlParts.length - 1];
  let ext = '';
  const extIndex = lastPart.lastIndexOf('.');
  if (extIndex > -1) {
    ext = lastPart.substring(extIndex);
  }
  if (ext && !name.toLowerCase().endsWith(ext.toLowerCase())) {
    name = name + ext;
  }
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Fetch failed');
    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = objectUrl;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(objectUrl);
    }, 1000);
  } catch (err) {
    console.error("Lỗi khi tải file qua JS:", err);
    window.open(url, '_blank');
  }
};
</script>

<style scoped>
.timeline-node {
  margin-top: 16px;
}

.node-content {
  display: flex;
  gap: 16px;
  position: relative;
  cursor: pointer;
  align-items: stretch;
}

/* Original line offsets for 32x32 node-dot */
.line-bridge {
  position: absolute;
  left: -20px; 
  top: -16px; /* Covers the 16px margin-top */
  height: 31px; /* 16px + 15px to center of dot */
  width: 2px;
  background: rgba(16, 185, 129, 0.6);
  z-index: 1;
}

.line-horizontal {
  position: absolute;
  left: -20px;
  top: 15px; /* Center of dot */
  width: 20px;
  height: 2px;
  background: rgba(16, 185, 129, 0.6);
  z-index: 1;
}

.line-pass-through {
  position: absolute;
  left: -20px;
  top: 15px;
  bottom: 0;
  width: 2px;
  background: rgba(16, 185, 129, 0.6);
  z-index: 1;
}

.line-to-children {
  position: absolute;
  left: 15px; /* Center of dot (24px + 8px border = 32px / 2 = 16px. -1 for line width = 15px) */
  top: 30px; /* Just below dot */
  bottom: 0;
  width: 2px;
  background: rgba(16, 185, 129, 0.6);
  z-index: 1;
}

.children-list {
  padding-left: 35px; /* Shift children to the right (15px + 20px) */
}

.node-dot {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f172a; /* Solid background to mask crossing lines */
  border-radius: 4px;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  border: 1px solid rgba(255,255,255,0.1);
}

/* tl-rect-card styling matches QuanLyFile.vue History Mode */
.node-card {
  flex: 1;
  border-radius: 12px;
  padding: 12px 16px;
  max-width: 600px;
  position: relative;
  z-index: 2;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

/* Rect Modes */
.tl-rect--green { background: linear-gradient(180deg, rgba(15,23,34,0.95) 0%, rgba(15,23,34,0.85) 100%); border: 3px solid rgba(16,185,129,0.8) !important; box-shadow: 0 0 15px rgba(16,185,129,0.4); }

.node-content:hover .node-card {
  transform: translateY(-4px) scale(1.015);
  filter: brightness(1.1);
  z-index: 10;
}

.is-highlighted {
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 1) !important;
  transform: scale(1.03) !important;
  z-index: 9999 !important;
  border-color: #3b82f6 !important;
  border-width: 4px !important;
  animation: pulse-glow-strong 1.5s ease-out;
  background: linear-gradient(180deg, rgba(30,58,138,0.95) 0%, rgba(30,58,138,0.85) 100%) !important;
}

@keyframes pulse-glow-strong {
  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 1); transform: scale(1); }
  50% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0.5); transform: scale(1.05); }
  100% { box-shadow: 0 0 0 30px rgba(59, 130, 246, 0); transform: scale(1.03); }
}

.tl-rect-header {
  display: flex;
  flex-direction: column;
}
.tl-rect-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.tl-status-chip {
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: inline-flex;
  align-items: center;
}
.is-done { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
.is-pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }
.is-failed { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
.is-green { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }

.tl-body-text {
  color: #f8fafc;
  font-size: 0.95rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.attach-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
  max-width: 100%;
}
.attach-badge:hover {
  transform: translateY(-1px);
}
.attach-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #ffffff !important;
}
/* White text + 0.4 bg for attachments as requested */
.badge-pdf { background: rgba(239, 68, 68, 0.4); color: #ffffff !important; border: 1px solid rgba(239, 68, 68, 0.6); }
.badge-pdf:hover { background: rgba(239, 68, 68, 0.5); }
.badge-word { background: rgba(59, 130, 246, 0.4); color: #ffffff !important; border: 1px solid rgba(59, 130, 246, 0.6); }
.badge-word:hover { background: rgba(59, 130, 246, 0.5); }
.badge-excel { background: rgba(16, 185, 129, 0.4); color: #ffffff !important; border: 1px solid rgba(16, 185, 129, 0.6); }
.badge-excel:hover { background: rgba(16, 185, 129, 0.5); }
.badge-default { background: rgba(148, 163, 184, 0.4); color: #ffffff !important; border: 1px solid rgba(148, 163, 184, 0.6); }
.badge-default:hover { background: rgba(148, 163, 184, 0.5); }
.badge-image { background: rgba(168, 85, 247, 0.4); color: #ffffff !important; border: 1px solid rgba(168, 85, 247, 0.6); }
.badge-image:hover { background: rgba(168, 85, 247, 0.5); }

/* Shimmers */
.tl-shimmer {
  position: absolute;
  top: 0; left: 0; right: 0; height: 100%;
  pointer-events: none;
  z-index: 0;
  opacity: 0.5;
}
.tl-shimmer--green { background: linear-gradient(90deg, transparent, rgba(16,185,129,0.1), transparent); }

@media (max-width: 768px) {
  .children-list {
    padding-left: 0 !important;
  }
  .line-bridge, .line-pass-through {
    left: 15px !important;
  }
  .line-horizontal {
    display: none !important;
  }
}
</style>
