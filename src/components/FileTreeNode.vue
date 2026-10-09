<template>
  <div class="tree-node">
    <div class="tree-node-line" v-if="isChild"></div>
    <div class="tree-node-card" @click="$emit('edit', node)">
      <div class="node-header">
        <span class="node-date">{{ formatTime(node.createdTime) }}</span>
        <span class="badge badge-status" :class="getStatusClass(node.trangThaiXuLy)">{{ node.trangThaiXuLy }}</span>
        <span v-if="node.trangThaiBaoGia" class="badge badge-quote" :class="getQuoteClass(node.trangThaiBaoGia)">{{ node.trangThaiBaoGia }}</span>
      </div>
      <div class="node-body">{{ node.noiDung }}</div>
    </div>
    
    <div class="tree-node-children" v-if="node.children && node.children.length > 0">
      <FileTreeNode v-for="child in node.children" :key="child.id" :node="child" :isChild="true" @edit="$emit('edit', $event)" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  node: Object,
  isChild: { type: Boolean, default: false }
});

defineEmits(['edit']);

const formatTime = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
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
</script>

<style scoped>
.tree-node {
  position: relative;
  margin-left: 20px;
  margin-top: 10px;
}
.tree-node-line {
  position: absolute;
  left: -20px;
  top: -10px;
  bottom: 0;
  width: 2px;
  background: rgba(255,255,255,0.2);
}
.tree-node-line::before {
  content: '';
  position: absolute;
  left: 0;
  top: 30px;
  width: 20px;
  height: 2px;
  background: rgba(255,255,255,0.2);
}
.tree-node-card {
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: all 0.2s;
  max-width: 500px;
  position: relative;
  z-index: 2;
  color: #f8fafc;
}
.tree-node-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px rgba(0,0,0,0.2);
  border-color: #3b82f6;
  background: rgba(30, 41, 59, 0.9);
}
.node-header {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.8rem;
}
.node-date {
  color: #94a3b8;
  font-weight: 500;
}
.badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.7rem;
}
.is-done { background: rgba(16, 185, 129, 0.2); color: #34d399; }
.is-pending { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
.is-failed { background: rgba(239, 68, 68, 0.2); color: #f87171; }
.node-body {
  color: #cbd5e1;
  font-size: 0.9rem;
  line-height: 1.5;
}
.tree-node-children {
  margin-top: 8px;
  position: relative;
}
</style>
