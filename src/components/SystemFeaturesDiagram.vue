<template>
  <div class="feat-shell" :class="{ 'theme-light-blue': uiTheme === 'light' }">
    <!-- Filter & Style Bar -->
    <div class="feat-filter-bar">
      <div class="feat-filter-top">
        <!-- Tree vs Business Flow Switcher -->
        <div class="feat-style-switch" role="tablist" aria-label="Kiểu sơ đồ chức năng">
          <button
            type="button"
            class="feat-style-btn"
            :class="{ active: styleMode === 'tree' }"
            @click="switchStyleMode('tree')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="12" r="2.5"/><circle cx="19" cy="5" r="2.5"/><circle cx="19" cy="12" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M7.5 12h9M12 12v-5a2 2 0 0 1 2-2h2.5M12 12v5a2 2 0 0 0 2 2h2.5"/></svg>
            <span>Cây phân hệ</span>
          </button>
          <button
            type="button"
            class="feat-style-btn"
            :class="{ active: styleMode === 'flow' }"
            @click="switchStyleMode('flow')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
            <span>Luồng nghiệp vụ</span>
          </button>
        </div>

        <div class="feat-search-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            v-model="searchQuery"
            type="text"
            class="feat-search-box__input"
            placeholder="Tìm chức năng, tính năng hoặc bảng Firebase..."
          />
          <button v-if="searchQuery" type="button" class="feat-clear-x" @click="searchQuery = ''">✕</button>
        </div>

        <!-- Mobile List vs Canvas toggle -->
        <div v-if="isMobile" class="feat-mob-mode-toggle">
          <button
            type="button"
            class="feat-mob-mode-btn"
            :class="{ active: mobileView === 'list' }"
            @click="mobileView = 'list'"
          >Danh sách</button>
          <button
            type="button"
            class="feat-mob-mode-btn"
            :class="{ active: mobileView === 'canvas' }"
            @click="switchMobileToCanvas"
          >Sơ đồ</button>
        </div>
      </div>

      <!-- Domain Group Chips -->
      <div class="feat-group-chips">
        <button
          type="button"
          class="feat-chip"
          :class="{ active: selectedGroup === 'all' }"
          @click="selectedGroup = 'all'"
        >
          Tất cả <span class="tabular-nums">({{ SYSTEM_FEATURES.length }})</span>
        </button>
        <button
          v-for="grp in groupOptions"
          :key="grp.id"
          type="button"
          class="feat-chip"
          :class="{ active: selectedGroup === grp.id }"
          @click="selectedGroup = selectedGroup === grp.id ? 'all' : grp.id"
        >
          <span class="feat-chip-dot" :style="{ background: grp.color }"></span>
          <span>{{ grp.shortLabel }}</span>
          <span class="tabular-nums">({{ grp.count }})</span>
        </button>
      </div>

      <!-- Detail Toggles -->
      <div class="feat-toggles">
        <button
          type="button"
          class="feat-toggle-btn"
          :class="{ active: showDbTables }"
          @click="toggleShowDbTables"
          title="Bật để xem kèm bảng Firebase trên thẻ & ảnh xuất; tắt để ảnh gọn hơn khi thuyết trình"
        >
          <span>{{ showDbTables ? 'Đang hiện bảng DB' : 'Chế độ gọn (ẩn bảng DB)' }}</span>
        </button>
        <button
          v-if="styleMode === 'flow' && (!isMobile || mobileView === 'canvas')"
          type="button"
          class="feat-toggle-btn"
          :class="{ active: showFlowLabels }"
          @click="showFlowLabels = !showFlowLabels"
        >
          <span>Nhãn luồng</span>
        </button>
        <span class="feat-stats-badge tabular-nums">
          {{ visibleFeatures.length }} chức năng · {{ graphData.edges.length }} kết nối
        </span>
      </div>
    </div>

    <!-- ═══════════════ MOBILE READABLE CARDS VIEW ═══════════════ -->
    <div v-if="isMobile && mobileView === 'list'" class="feat-mob-list">
      <div v-if="visibleFeatures.length === 0" class="feat-mob-empty">
        <p>Không tìm thấy chức năng phù hợp.</p>
        <button type="button" class="feat-btn-soft" @click="resetFilters">Xóa bộ lọc</button>
      </div>

      <article
        v-for="feat in visibleFeatures"
        :key="feat.id"
        class="feat-mob-card"
        :style="{ borderLeftColor: getGroupInfo(feat.group).color }"
      >
        <div class="feat-mob-card__head" @click="activeNodeId = feat.id">
          <div class="feat-mob-card__meta-row">
            <span class="feat-group-pill" :style="{ background: getGroupInfo(feat.group).color }">
              {{ getGroupInfo(feat.group).label }}
            </span>
            <span class="feat-route-tag">{{ feat.route }}</span>
          </div>
          <h3 class="feat-mob-card__title">{{ feat.name }}</h3>
          <p class="feat-mob-card__summary">{{ feat.summary }}</p>
        </div>

        <ul class="feat-mob-bullets">
          <li v-for="(b, bi) in feat.bullets" :key="bi">{{ b }}</li>
        </ul>

        <div v-if="showDbTables && feat.tables?.length" class="feat-mob-db-wrap">
          <span class="feat-mob-db-lbl">Bảng Firebase:</span>
          <div class="feat-db-chips">
            <button
              v-for="tbl in feat.tables"
              :key="tbl"
              type="button"
              class="feat-db-chip"
              @click="$emit('locate-table', tbl)"
            >
              {{ tbl }}
            </button>
          </div>
        </div>

        <div class="feat-mob-card__foot">
          <button type="button" class="feat-btn-ghost" @click="activeNodeId = feat.id">
            Chi tiết &amp; Luồng
          </button>
          <button type="button" class="feat-btn-primary" @click="$emit('open-route', feat.route)">
            Mở trang →
          </button>
        </div>
      </article>
    </div>

    <!-- ═══════════════ INTERACTIVE CANVAS + INSPECTOR ═══════════════ -->
    <div v-else class="feat-workspace">
      <div
        ref="stageRef"
        class="feat-stage"
        :class="{ 'is-panning': isPanning }"
        @pointerdown="onStagePointerDown"
        @wheel.prevent="onStageWheel"
      >
        <div v-if="visibleFeatures.length === 0" class="feat-empty-overlay">
          <p>Không tìm thấy chức năng nào khớp bộ lọc.</p>
          <button type="button" class="feat-btn-soft" @click="resetFilters">Xóa bộ lọc</button>
        </div>

        <!-- World Transform Layer -->
        <div v-show="visibleFeatures.length > 0" class="feat-world" :style="worldTransformStyle">
          <!-- SVG Connectors Layer -->
          <svg class="feat-svg-layer" width="1" height="1">
            <g
              v-for="edge in renderedEdges"
              :key="edge.id"
              class="feat-edge-group"
              :class="{ 'is-dimmed': edge.isDimmed, 'is-highlighted': edge.isHighlighted }"
            >
              <path
                :d="edge.geo.path"
                fill="none"
                stroke="transparent"
                stroke-width="14"
                class="feat-edge-hit"
                @pointerenter="hoveredEdgeId = edge.id"
                @pointerleave="hoveredEdgeId = null"
              />
              <path
                :d="edge.geo.path"
                fill="none"
                class="feat-edge-path"
                :style="{ stroke: edge.isHighlighted ? undefined : (edge.color || undefined) }"
                :class="{ 'is-highlighted': edge.isHighlighted }"
              />
              <circle
                :cx="edge.geo.x1"
                :cy="edge.geo.y1"
                r="3.5"
                class="feat-edge-dot"
                :style="{ fill: edge.isHighlighted ? undefined : (edge.color || undefined) }"
                :class="{ 'is-highlighted': edge.isHighlighted }"
              />
              <polygon
                :points="edge.geo.arrowPoints"
                class="feat-edge-dot"
                :style="{ fill: edge.isHighlighted ? undefined : (edge.color || undefined) }"
                :class="{ 'is-highlighted': edge.isHighlighted }"
              />

              <g
                v-if="edge.label && (showFlowLabels || edge.isHighlighted)"
                :transform="`translate(${edge.geo.midX}, ${edge.geo.midY})`"
                class="feat-edge-label"
              >
                <rect
                  :x="-edge.labelBoxW / 2"
                  y="-10"
                  :width="edge.labelBoxW"
                  height="20"
                  rx="10"
                  class="feat-edge-label__bg"
                  :class="{ 'is-highlighted': edge.isHighlighted }"
                />
                <text
                  x="0"
                  y="3.5"
                  text-anchor="middle"
                  class="feat-edge-label__txt"
                  :class="{ 'is-highlighted': edge.isHighlighted }"
                >{{ edge.shortLabel }}</text>
              </g>
            </g>
          </svg>

          <!-- HTML Diagram Nodes -->
          <div
            v-for="node in graphData.nodes"
            :key="node.id"
            class="feat-node"
            :class="[
              `is-${node.kind}`,
              {
                'is-selected': activeNodeId === node.id,
                'is-related': isNodeRelated(node.id),
                'is-dimmed': isNodeDimmed(node.id),
                'is-dragging': draggingNodeId === node.id
              }
            ]"
            :style="getNodeStyle(node)"
            @pointerenter="hoveredNodeId = node.id"
            @pointerleave="hoveredNodeId = null"
          >
            <!-- ROOT NODE (Tree mode) -->
            <template v-if="node.kind === 'root'">
              <div class="feat-root-card" @pointerdown.stop="onNodePointerDown($event, node.id)">
                <span class="feat-root-badge">CORE SYSTEM</span>
                <h2 class="feat-root-title">{{ node.name }}</h2>
                <p class="feat-root-sub">{{ node.subtitle }}</p>
                <ul class="feat-root-highlights">
                  <li v-for="(h, hi) in node.highlights" :key="hi">{{ h }}</li>
                </ul>
              </div>
            </template>

            <!-- DOMAIN HUB NODE (Tree mode) -->
            <template v-else-if="node.kind === 'hub'">
              <div
                class="feat-hub-card"
                :style="{ borderColor: node.groupInfo.color }"
                @pointerdown.stop="onNodePointerDown($event, node.id)"
              >
                <span class="feat-hub-bar" :style="{ background: node.groupInfo.color }"></span>
                <div class="feat-hub-content">
                  <div class="feat-hub-title">{{ node.name }}</div>
                  <div class="feat-hub-sub" :style="{ color: node.groupInfo.color }">{{ node.subtitle }}</div>
                </div>
              </div>
            </template>

            <!-- FEATURE MODULE CARD -->
            <template v-else>
              <div
                class="feat-card-head"
                :style="{ background: node.groupInfo.color }"
                @pointerdown.stop="onNodePointerDown($event, node.id)"
                @dblclick.stop="$emit('open-route', node.route)"
              >
                <div class="feat-card-head__name">{{ node.name }}</div>
                <div class="feat-card-head__route">{{ node.route }}</div>
              </div>

              <div class="feat-card-body" @click.stop="selectNode(node.id)">
                <ul class="feat-card-bullets">
                  <li v-for="(b, bi) in node.bullets" :key="bi">
                    <span class="feat-bullet-dot" :style="{ background: node.groupInfo.color }"></span>
                    <span>{{ b }}</span>
                  </li>
                </ul>

                <div v-if="showDbTables && node.tables?.length" class="feat-card-dbs">
                  <span class="feat-card-dbs__lbl">BẢNG FIREBASE</span>
                  <div class="feat-db-chips">
                    <button
                      v-for="tbl in node.tables"
                      :key="tbl"
                      type="button"
                      class="feat-db-chip"
                      @click.stop="$emit('locate-table', tbl)"
                      :title="`Định vị bảng ${tbl} trên Sơ đồ ERD`"
                    >{{ tbl }}</button>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Bottom-Left Legend -->
        <div class="feat-legend">
          <span class="feat-legend__item">
            <strong>{{ styleMode === 'tree' ? 'Cây phân hệ:' : 'Luồng nghiệp vụ:' }}</strong>
            {{ styleMode === 'tree' ? 'Hệ thống → 5 Phân hệ → 14 Chức năng' : 'Dữ liệu gốc → Báo giá → PO/Công nợ → License → Báo cáo & Bot' }}
          </span>
          <span class="feat-legend__hint">Kéo thẻ để sắp xếp • Cuộn để zoom • Double-click để mở trang</span>
        </div>

        <!-- Bottom-Right Controls -->
        <div class="feat-canvas-controls">
          <button type="button" class="feat-ctrl-btn" @click="zoomBy(-0.15)" title="Thu nhỏ">−</button>
          <span class="feat-zoom-pct tabular-nums">{{ Math.round(zoom * 100) }}%</span>
          <button type="button" class="feat-ctrl-btn" @click="zoomBy(0.15)" title="Phóng to">+</button>
          <span class="feat-ctrl-sep"></span>
          <button type="button" class="feat-ctrl-btn is-text" @click="fitToScreen" title="Vừa toàn bộ sơ đồ">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
            <span>Fit</span>
          </button>
          <button type="button" class="feat-ctrl-btn is-text" @click="resetLayout" title="Tự động sắp xếp lại">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span>Xếp lại</span>
          </button>
        </div>
      </div>

      <!-- Desktop Right Read-Only Feature Inspector -->
      <aside v-if="!isMobile && activeFeatureObj" class="feat-inspector">
        <div class="feat-inspector__head">
          <div class="feat-inspector__head-info">
            <span class="feat-group-pill" :style="{ background: getGroupInfo(activeFeatureObj.group).color }">
              {{ getGroupInfo(activeFeatureObj.group).label }}
            </span>
            <h3 class="feat-inspector__name">{{ activeFeatureObj.name }}</h3>
            <span class="feat-inspector__route">{{ activeFeatureObj.route }}</span>
          </div>
          <button type="button" class="feat-inspector__close" @click="activeNodeId = null" aria-label="Đóng">✕</button>
        </div>

        <div class="feat-inspector__body">
          <p class="feat-inspector__desc">{{ activeFeatureObj.summary }}</p>

          <button
            type="button"
            class="feat-btn-primary feat-inspector__cta"
            @click="$emit('open-route', activeFeatureObj.route)"
          >
            <span>Mở trang chức năng này</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>

          <div class="feat-inspector__section">
            <h4 class="feat-inspector__sec-title">Tính năng cốt lõi</h4>
            <ul class="feat-insp-bullets">
              <li v-for="(b, idx) in activeFeatureObj.bullets" :key="idx">{{ b }}</li>
            </ul>
          </div>

          <div class="feat-inspector__section">
            <h4 class="feat-inspector__sec-title">
              Bảng Firebase sử dụng <span class="tabular-nums">({{ activeFeatureObj.tables.length }})</span>
            </h4>
            <div class="feat-insp-table-list">
              <div v-for="tbl in activeFeatureObj.tables" :key="tbl" class="feat-insp-table-row">
                <span class="feat-insp-table-name">{{ tbl }}</span>
                <div class="feat-insp-table-acts">
                  <button type="button" class="feat-mini-link" @click="$emit('locate-table', tbl)">ERD</button>
                  <button type="button" class="feat-mini-link is-alt" @click="$emit('open-table', tbl)">Dữ liệu</button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeFlowOutgoing.length || activeFlowIncoming.length" class="feat-inspector__section">
            <h4 class="feat-inspector__sec-title">Luồng liên kết nghiệp vụ</h4>
            <div class="feat-flow-list">
              <button
                v-for="fl in activeFlowIncoming"
                :key="fl.id"
                type="button"
                class="feat-flow-item"
                @click="focusFeature(fl.from)"
              >
                <span class="feat-flow-dir is-in">← Đầu vào</span>
                <strong>{{ getFeatureName(fl.from) }}</strong>
                <span class="feat-flow-lbl">{{ fl.label }}</span>
              </button>
              <button
                v-for="fl in activeFlowOutgoing"
                :key="fl.id"
                type="button"
                class="feat-flow-item"
                @click="focusFeature(fl.to)"
              >
                <span class="feat-flow-dir is-out">Đầu ra →</span>
                <strong>{{ getFeatureName(fl.to) }}</strong>
                <span class="feat-flow-lbl">{{ fl.label }}</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <!-- Mobile Fullscreen Feature Inspector Sheet (Safe-Area Top 52px) -->
    <aside v-if="isMobile && activeFeatureObj" class="feat-inspector is-mobile-sheet">
      <div class="feat-inspector__head">
        <div class="feat-inspector__head-info">
          <span class="feat-group-pill" :style="{ background: getGroupInfo(activeFeatureObj.group).color }">
            {{ getGroupInfo(activeFeatureObj.group).label }}
          </span>
          <h3 class="feat-inspector__name">{{ activeFeatureObj.name }}</h3>
          <span class="feat-inspector__route">{{ activeFeatureObj.route }}</span>
        </div>
        <button type="button" class="feat-inspector__close" @click="activeNodeId = null" aria-label="Đóng">✕</button>
      </div>

      <div class="feat-inspector__body">
        <p class="feat-inspector__desc">{{ activeFeatureObj.summary }}</p>

        <div class="feat-inspector__section">
          <h4 class="feat-inspector__sec-title">Tính năng cốt lõi</h4>
          <ul class="feat-insp-bullets">
            <li v-for="(b, idx) in activeFeatureObj.bullets" :key="idx">{{ b }}</li>
          </ul>
        </div>

        <div class="feat-inspector__section">
          <h4 class="feat-inspector__sec-title">
            Bảng Firebase sử dụng <span class="tabular-nums">({{ activeFeatureObj.tables.length }})</span>
          </h4>
          <div class="feat-insp-table-list">
            <div v-for="tbl in activeFeatureObj.tables" :key="tbl" class="feat-insp-table-row">
              <span class="feat-insp-table-name">{{ tbl }}</span>
              <div class="feat-insp-table-acts">
                <button type="button" class="feat-mini-link" @click="$emit('locate-table', tbl)">ERD</button>
                <button type="button" class="feat-mini-link is-alt" @click="$emit('open-table', tbl)">Dữ liệu</button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeFlowOutgoing.length || activeFlowIncoming.length" class="feat-inspector__section">
          <h4 class="feat-inspector__sec-title">Luồng liên kết nghiệp vụ</h4>
          <div class="feat-flow-list">
            <button
              v-for="fl in activeFlowIncoming"
              :key="fl.id"
              type="button"
              class="feat-flow-item"
              @click="focusFeature(fl.from)"
            >
              <span class="feat-flow-dir is-in">← Đầu vào</span>
              <strong>{{ getFeatureName(fl.from) }}</strong>
              <span class="feat-flow-lbl">{{ fl.label }}</span>
            </button>
            <button
              v-for="fl in activeFlowOutgoing"
              :key="fl.id"
              type="button"
              class="feat-flow-item"
              @click="focusFeature(fl.to)"
            >
              <span class="feat-flow-dir is-out">Đầu ra →</span>
              <strong>{{ getFeatureName(fl.to) }}</strong>
              <span class="feat-flow-lbl">{{ fl.label }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="feat-inspector__mob-foot">
        <button
          type="button"
          class="feat-btn-primary feat-inspector__cta"
          @click="$emit('open-route', activeFeatureObj.route)"
        >
          <span>Mở trang {{ activeFeatureObj.name }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import {
  FEATURE_GROUPS,
  SYSTEM_FEATURES,
  FEATURE_FLOW_EDGES,
  buildFeatureGraph,
  computeFeatureLayout,
  computeFeatureEdgeGeometry,
  estimateFeatureNodeSize,
  exportFeaturesToPng
} from '../utils/systemFeaturesMeta';

const props = defineProps({
  uiTheme: { type: String, default: 'dark' },
  isMobile: { type: Boolean, default: false }
});

const emit = defineEmits(['open-table', 'locate-table', 'open-route', 'toast']);

const POS_KEY_PREFIX = 'nts_sys_feat_pos_v1_';

const styleMode = ref('tree'); // 'tree' (Cây phân hệ) | 'flow' (Luồng nghiệp vụ)
const mobileView = ref('list'); // 'list' | 'canvas'
const searchQuery = ref('');
const selectedGroup = ref('all');
const showDbTables = ref(true);
const showFlowLabels = ref(true);

const activeNodeId = ref(null);
const hoveredNodeId = ref(null);
const hoveredEdgeId = ref(null);
const positionsMap = ref({});

// Viewport transform
const stageRef = ref(null);
const panX = ref(36);
const panY = ref(36);
const zoom = ref(0.76);
const isPanning = ref(false);
const draggingNodeId = ref(null);

let dragCtx = null;
const activePointers = new Map();
let pinchState = null;

const getGroupInfo = (gid) => FEATURE_GROUPS[gid] || FEATURE_GROUPS.system;
const getFeatureName = (fid) => SYSTEM_FEATURES.find(f => f.id === fid)?.name || fid;

const groupOptions = computed(() => {
  const counts = {};
  SYSTEM_FEATURES.forEach(f => {
    counts[f.group] = (counts[f.group] || 0) + 1;
  });
  return Object.values(FEATURE_GROUPS)
    .sort((a, b) => a.order - b.order)
    .map(g => ({ ...g, count: counts[g.id] || 0 }))
    .filter(g => g.count > 0);
});

const visibleFeatures = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return SYSTEM_FEATURES.filter(f => {
    if (selectedGroup.value !== 'all' && f.group !== selectedGroup.value) return false;
    if (!q) return true;
    const blob = `${f.name} ${f.route} ${f.summary} ${(f.bullets || []).join(' ')} ${(f.tables || []).join(' ')} ${getGroupInfo(f.group).label}`.toLowerCase();
    return blob.includes(q);
  });
});

const graphData = computed(() => buildFeatureGraph(styleMode.value, visibleFeatures.value));

const nodeMap = computed(() => {
  const m = {};
  graphData.value.nodes.forEach(n => { m[n.id] = n; });
  return m;
});

const loadPositionsForCurrentStyle = (useSaved = true) => {
  const smart = computeFeatureLayout(styleMode.value, SYSTEM_FEATURES, showDbTables.value);
  let saved = {};
  if (useSaved) {
    try {
      const raw = localStorage.getItem(POS_KEY_PREFIX + styleMode.value);
      if (raw) saved = JSON.parse(raw) || {};
    } catch {}
  }
  const merged = {};
  for (const [id, pos] of Object.entries(smart)) {
    merged[id] = saved[id] && typeof saved[id].x === 'number'
      ? { x: saved[id].x, y: saved[id].y }
      : pos;
  }
  positionsMap.value = merged;
};

const savePositions = () => {
  try {
    localStorage.setItem(POS_KEY_PREFIX + styleMode.value, JSON.stringify(positionsMap.value));
  } catch {}
};

const focusId = computed(() => hoveredNodeId.value || activeNodeId.value);

const neighborSet = computed(() => {
  const target = focusId.value;
  if (!target) return null;
  const s = new Set([target]);
  graphData.value.edges.forEach(e => {
    if (e.from === target) s.add(e.to);
    if (e.to === target) s.add(e.from);
  });
  return s;
});

const isNodeRelated = (id) => Boolean(focusId.value && neighborSet.value?.has(id) && id !== focusId.value);
const isNodeDimmed = (id) => {
  if (hoveredEdgeId.value) {
    const edge = graphData.value.edges.find(e => e.id === hoveredEdgeId.value);
    if (edge) return edge.from !== id && edge.to !== id;
  }
  if (!focusId.value) return false;
  return Boolean(neighborSet.value && !neighborSet.value.has(id));
};

const renderedEdges = computed(() => {
  const pos = positionsMap.value;
  const nMap = nodeMap.value;
  const focus = focusId.value;
  const hovEdge = hoveredEdgeId.value;

  return graphData.value.edges
    .map(edge => {
      const geo = computeFeatureEdgeGeometry(edge, pos, nMap, showDbTables.value);
      if (!geo) return null;
      const isHighlighted = hovEdge === edge.id || Boolean(focus && (edge.from === focus || edge.to === focus));
      const isDimmed = Boolean((focus || hovEdge) && !isHighlighted);
      const shortLabel = edge.label && edge.label.length > 18 ? edge.label.slice(0, 17) + '…' : (edge.label || '');
      const labelBoxW = Math.max(56, shortLabel.length * 6.4 + 16);
      return { ...edge, geo, isHighlighted, isDimmed, shortLabel, labelBoxW };
    })
    .filter(Boolean);
});

const getNodeStyle = (node) => {
  const p = positionsMap.value[node.id] || { x: 0, y: 0 };
  const sz = estimateFeatureNodeSize(node, showDbTables.value);
  return {
    width: `${sz.w}px`,
    minHeight: `${sz.h}px`,
    transform: `translate3d(${p.x}px, ${p.y}px, 0)`
  };
};

const worldTransformStyle = computed(() => ({
  transform: `translate3d(${panX.value}px, ${panY.value}px, 0) scale(${zoom.value})`
}));

const activeFeatureObj = computed(() => {
  if (!activeNodeId.value) return null;
  return SYSTEM_FEATURES.find(f => f.id === activeNodeId.value) || null;
});

const activeFlowOutgoing = computed(() => {
  if (!activeFeatureObj.value) return [];
  return FEATURE_FLOW_EDGES.filter(e => e.from === activeFeatureObj.value.id);
});

const activeFlowIncoming = computed(() => {
  if (!activeFeatureObj.value) return [];
  return FEATURE_FLOW_EDGES.filter(e => e.to === activeFeatureObj.value.id);
});

const selectNode = (id) => {
  if (id === 'sys_root' || id.startsWith('hub_')) {
    activeNodeId.value = activeNodeId.value === id ? null : id;
    return;
  }
  activeNodeId.value = activeNodeId.value === id ? null : id;
};

const focusFeature = async (featId) => {
  if (!nodeMap.value[featId]) {
    selectedGroup.value = 'all';
    searchQuery.value = '';
    await nextTick();
  }
  activeNodeId.value = featId;
  const stage = stageRef.value;
  const pos = positionsMap.value[featId];
  const node = nodeMap.value[featId];
  if (!stage || !pos || !node) return;
  const rect = stage.getBoundingClientRect();
  const sz = estimateFeatureNodeSize(node, showDbTables.value);
  zoom.value = Math.min(1.1, Math.max(zoom.value, 0.85));
  panX.value = Math.round(rect.width / 2 - (pos.x + sz.w / 2) * zoom.value);
  panY.value = Math.round(rect.height / 2 - (pos.y + sz.h / 2) * zoom.value);
};

const switchStyleMode = async (mode) => {
  if (styleMode.value === mode) return;
  styleMode.value = mode;
  activeNodeId.value = null;
  loadPositionsForCurrentStyle(true);
  await nextTick();
  fitToScreen();
};

const toggleShowDbTables = async () => {
  showDbTables.value = !showDbTables.value;
  // Recompute clean non-overlapping vertical layout if user hasn't dragged custom layout
  let hasCustom = false;
  try {
    hasCustom = Boolean(localStorage.getItem(POS_KEY_PREFIX + styleMode.value));
  } catch {}
  if (!hasCustom) {
    loadPositionsForCurrentStyle(false);
    await nextTick();
    fitToScreen();
  }
};

const switchMobileToCanvas = async () => {
  mobileView.value = 'canvas';
  await nextTick();
  fitToScreen();
};

const resetFilters = () => {
  searchQuery.value = '';
  selectedGroup.value = 'all';
};

const resetLayout = async () => {
  try {
    localStorage.removeItem(POS_KEY_PREFIX + styleMode.value);
  } catch {}
  loadPositionsForCurrentStyle(false);
  await nextTick();
  fitToScreen();
  emit('toast', { msg: 'Đã tự động sắp xếp lại sơ đồ chức năng!', type: 'info' });
};

const fitToScreen = () => {
  const stage = stageRef.value;
  const nodes = graphData.value.nodes;
  if (!stage || !nodes.length) return;
  const rect = stage.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodes.forEach(n => {
    const p = positionsMap.value[n.id];
    if (!p) return;
    const sz = estimateFeatureNodeSize(n, showDbTables.value);
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x + sz.w);
    maxY = Math.max(maxY, p.y + sz.h);
  });
  if (!Number.isFinite(minX)) return;

  const cw = Math.max(300, maxX - minX);
  const ch = Math.max(240, maxY - minY);
  const pad = props.isMobile ? 22 : 48;
  const nextZoom = Math.max(0.24, Math.min(1.0, Math.min((rect.width - pad * 2) / cw, (rect.height - pad * 2) / ch)));
  zoom.value = Number(nextZoom.toFixed(2));
  panX.value = Math.round((rect.width - cw * zoom.value) / 2 - minX * zoom.value);
  panY.value = Math.round((rect.height - ch * zoom.value) / 2 - minY * zoom.value);
};

const zoomBy = (delta) => {
  const stage = stageRef.value;
  const prev = zoom.value;
  const next = Math.max(0.24, Math.min(2.0, Number((prev + delta).toFixed(2))));
  if (next === prev) return;
  if (stage) {
    const rect = stage.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    panX.value = Math.round(cx - ((cx - panX.value) / prev) * next);
    panY.value = Math.round(cy - ((cy - panY.value) / prev) * next);
  }
  zoom.value = next;
};

const onStageWheel = (e) => {
  const stage = stageRef.value;
  if (!stage) return;
  const rect = stage.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const prev = zoom.value;
  const next = Math.max(0.24, Math.min(2.0, Number((prev * (e.deltaY < 0 ? 1.1 : 0.91)).toFixed(3))));
  if (next === prev) return;
  panX.value = Math.round(mx - ((mx - panX.value) / prev) * next);
  panY.value = Math.round(my - ((my - panY.value) / prev) * next);
  zoom.value = next;
};

const onStagePointerDown = (e) => {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (activePointers.size === 2) {
    const pts = Array.from(activePointers.values());
    pinchState = {
      startDist: Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) || 1,
      startZoom: zoom.value,
      startPanX: panX.value,
      startPanY: panY.value,
      midX: (pts[0].x + pts[1].x) / 2,
      midY: (pts[0].y + pts[1].y) / 2
    };
    dragCtx = null;
    isPanning.value = false;
  } else if (activePointers.size === 1) {
    isPanning.value = true;
    dragCtx = {
      type: 'pan',
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      origPanX: panX.value,
      origPanY: panY.value,
      moved: false
    };
  }
  window.addEventListener('pointermove', onWindowPointerMove);
  window.addEventListener('pointerup', onWindowPointerUp);
  window.addEventListener('pointercancel', onWindowPointerUp);
};

const onNodePointerDown = (e, id) => {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  const pos = positionsMap.value[id] || { x: 0, y: 0 };
  draggingNodeId.value = id;
  dragCtx = {
    type: 'node',
    pointerId: e.pointerId,
    id,
    startX: e.clientX,
    startY: e.clientY,
    origX: pos.x,
    origY: pos.y,
    moved: false
  };
  window.addEventListener('pointermove', onWindowPointerMove);
  window.addEventListener('pointerup', onWindowPointerUp);
  window.addEventListener('pointercancel', onWindowPointerUp);
};

const onWindowPointerMove = (e) => {
  if (activePointers.has(e.pointerId)) {
    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  }
  if (pinchState && activePointers.size >= 2) {
    const stage = stageRef.value;
    const pts = Array.from(activePointers.values());
    const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) || 1;
    const nextZoom = Math.max(0.24, Math.min(2.0, Number((pinchState.startZoom * (dist / pinchState.startDist)).toFixed(3))));
    if (stage) {
      const rect = stage.getBoundingClientRect();
      const fx = pinchState.midX - rect.left;
      const fy = pinchState.midY - rect.top;
      panX.value = Math.round(fx - ((fx - pinchState.startPanX) / pinchState.startZoom) * nextZoom);
      panY.value = Math.round(fy - ((fy - pinchState.startPanY) / pinchState.startZoom) * nextZoom);
    }
    zoom.value = nextZoom;
    return;
  }

  if (!dragCtx || dragCtx.pointerId !== e.pointerId) return;
  const dx = e.clientX - dragCtx.startX;
  const dy = e.clientY - dragCtx.startY;
  if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragCtx.moved = true;

  if (dragCtx.type === 'pan') {
    panX.value = dragCtx.origPanX + dx;
    panY.value = dragCtx.origPanY + dy;
  } else if (dragCtx.type === 'node') {
    positionsMap.value = {
      ...positionsMap.value,
      [dragCtx.id]: {
        x: Math.round(dragCtx.origX + dx / zoom.value),
        y: Math.round(dragCtx.origY + dy / zoom.value)
      }
    };
  }
};

const onWindowPointerUp = (e) => {
  activePointers.delete(e.pointerId);
  if (activePointers.size < 2) pinchState = null;

  if (dragCtx && dragCtx.pointerId === e.pointerId) {
    if (dragCtx.type === 'node') {
      if (dragCtx.moved) savePositions();
      else selectNode(dragCtx.id);
    } else if (dragCtx.type === 'pan' && !dragCtx.moved) {
      activeNodeId.value = null;
    }
    isPanning.value = false;
    draggingNodeId.value = null;
    dragCtx = null;
  }

  if (activePointers.size === 0 && !dragCtx) {
    window.removeEventListener('pointermove', onWindowPointerMove);
    window.removeEventListener('pointerup', onWindowPointerUp);
    window.removeEventListener('pointercancel', onWindowPointerUp);
  }
};

const exportPng = async () => {
  if (!graphData.value.nodes.length) return null;
  const res = await exportFeaturesToPng({
    styleMode: styleMode.value,
    nodes: graphData.value.nodes,
    edges: graphData.value.edges,
    positions: positionsMap.value,
    theme: props.uiTheme,
    showDbTables: showDbTables.value,
    showFlowLabels: showFlowLabels.value
  });
  return res;
};

defineExpose({ exportPng, fitToScreen });

watch([selectedGroup, searchQuery], async () => {
  await nextTick();
  if (!props.isMobile || mobileView.value === 'canvas') {
    fitToScreen();
  }
});

onMounted(async () => {
  loadPositionsForCurrentStyle(true);
  await nextTick();
  fitToScreen();
});

onUnmounted(() => {
  window.removeEventListener('pointermove', onWindowPointerMove);
  window.removeEventListener('pointerup', onWindowPointerUp);
  window.removeEventListener('pointercancel', onWindowPointerUp);
});
</script>

<style scoped>
.feat-shell {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}

/* Filter Bar */
.feat-filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 9px 14px;
  background: var(--db-panel);
  border: 1px solid var(--db-border);
  border-radius: 13px;
  box-shadow: var(--db-shadow);
  flex-shrink: 0;
}
.feat-filter-top {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.feat-style-switch {
  display: inline-flex;
  background: var(--db-well);
  border: 1px solid var(--db-border-strong);
  border-radius: 10px;
  padding: 2.5px;
  gap: 2.5px;
}
.feat-style-btn {
  height: 30px;
  padding: 0 11px;
  border: none;
  border-radius: 7.5px;
  background: transparent;
  color: var(--db-ink-muted);
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: all 0.16s ease;
}
.feat-style-btn:hover {
  color: var(--db-blue);
  background: var(--db-blue-bg);
}
.feat-style-btn.active {
  background: var(--db-blue-grad);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

.feat-search-box {
  width: 230px;
  height: 34px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 10px;
  border-radius: 9px;
  background: var(--db-well);
  border: 1px solid var(--db-border-strong);
  color: var(--db-ink-muted);
}
.feat-search-box:focus-within {
  border-color: var(--db-blue-strong);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.14);
  color: var(--db-blue);
}
.feat-search-box__input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--db-ink);
  font-size: 12.5px;
  font-weight: 600;
  font-family: inherit;
}
.feat-clear-x {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: var(--db-blue-bg);
  color: var(--db-blue);
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.feat-mob-mode-toggle {
  display: inline-flex;
  background: var(--db-well);
  border: 1px solid var(--db-border-strong);
  border-radius: 9px;
  padding: 2px;
  gap: 2px;
}
.feat-mob-mode-btn {
  height: 28px;
  padding: 0 10px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: var(--db-ink-muted);
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}
.feat-mob-mode-btn.active {
  background: var(--db-blue-grad);
  color: #ffffff;
}

.feat-group-chips {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  flex: 1;
}
.feat-chip {
  height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid var(--db-border);
  background: var(--db-well);
  color: var(--db-ink-sec);
  font-size: 11.5px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  flex-shrink: 0;
}
.feat-chip.active {
  background: var(--db-blue-grad);
  border-color: transparent;
  color: #ffffff;
}
.feat-chip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.feat-chip.active .feat-chip-dot {
  background: #ffffff !important;
}

.feat-toggles {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
}
.feat-toggle-btn {
  height: 30px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid var(--db-border-strong);
  background: var(--db-well);
  color: var(--db-ink-muted);
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}
.feat-toggle-btn.active {
  background: var(--db-blue-bg);
  border-color: var(--db-blue-border);
  color: var(--db-blue);
}
.feat-stats-badge {
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--db-blue-bg);
  border: 1px solid var(--db-blue-border);
  color: var(--db-blue);
  font-size: 11.5px;
  font-weight: 800;
  white-space: nowrap;
}

/* Workspace & Stage */
.feat-workspace {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 12px;
  overflow: hidden;
  position: relative;
}
.feat-stage {
  flex: 1;
  min-width: 0;
  min-height: 0;
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid var(--db-border-strong);
  background-color: var(--db-stage-bg);
  background-image: radial-gradient(var(--db-grid-dot) 1.25px, transparent 1.25px);
  background-size: 24px 24px;
  box-shadow: var(--db-shadow);
  cursor: grab;
  user-select: none;
  touch-action: none;
}
.feat-stage.is-panning {
  cursor: grabbing;
}
.feat-world {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
  will-change: transform;
}

/* SVG Edges */
.feat-svg-layer {
  position: absolute;
  top: 0;
  left: 0;
  overflow: visible;
  pointer-events: none;
  z-index: 1;
}
.feat-edge-hit {
  pointer-events: stroke;
  cursor: pointer;
}
.feat-edge-group {
  transition: opacity 0.2s ease;
}
.feat-edge-group.is-dimmed {
  opacity: 0.14;
}
.feat-edge-path {
  stroke: var(--db-edge);
  stroke-width: 2.2;
  stroke-opacity: 0.78;
}
.feat-edge-path.is-highlighted {
  stroke: var(--db-edge-hi) !important;
  stroke-width: 3.2;
  stroke-opacity: 1;
}
.feat-edge-dot {
  fill: var(--db-edge);
}
.feat-edge-dot.is-highlighted {
  fill: var(--db-edge-hi) !important;
}
.feat-edge-label {
  pointer-events: none;
}
.feat-edge-label__bg {
  fill: var(--db-edge-pill-bg);
  stroke: var(--db-blue-border);
  stroke-width: 1;
}
.feat-edge-label__bg.is-highlighted {
  stroke: var(--db-edge-hi);
  stroke-width: 1.6;
}
.feat-edge-label__txt {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 10.5px;
  font-weight: 700;
  fill: var(--db-blue);
}
.feat-edge-label__txt.is-highlighted {
  fill: var(--db-ink);
}

/* Nodes */
.feat-node {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  box-sizing: border-box;
  border-radius: 13px;
  background: var(--db-card);
  border: 1.5px solid var(--db-border-strong);
  box-shadow: 0 10px 26px -10px rgba(2, 6, 23, 0.55);
  overflow: hidden;
  transition: opacity 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.feat-shell.theme-light-blue .feat-node {
  box-shadow: 0 8px 22px -8px rgba(30, 64, 175, 0.16);
}
.feat-node.is-root {
  border-color: #60a5fa;
  border-width: 2px;
  border-radius: 16px;
}
.feat-node.is-dimmed {
  opacity: 0.2;
}
.feat-node.is-related {
  border-color: var(--db-blue);
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.36), 0 14px 30px -8px rgba(37, 99, 235, 0.32);
  z-index: 4;
}
.feat-node.is-selected {
  border-color: var(--db-edge-hi);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.45), 0 18px 38px -10px rgba(37, 99, 235, 0.44);
  z-index: 6;
}
.feat-node.is-dragging {
  z-index: 10;
  cursor: grabbing;
}

/* Root Card */
.feat-root-card {
  padding: 16px;
  height: 100%;
  box-sizing: border-box;
  background: linear-gradient(135deg, #0f2f6e 0%, #1d4ed8 54%, #0284c7 100%);
  color: #ffffff;
  cursor: grab;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.feat-root-badge {
  align-self: flex-start;
  padding: 2px 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.6px;
}
.feat-root-title {
  margin: 4px 0 0;
  font-size: 16px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.2px;
}
.feat-root-sub {
  margin: 0;
  font-size: 11.5px;
  font-weight: 600;
  color: #bae6fd;
}
.feat-root-highlights {
  margin: 8px 0 0;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 11.5px;
  font-weight: 600;
  color: #f8fafc;
}

/* Hub Card */
.feat-hub-card {
  position: relative;
  height: 100%;
  min-height: 82px;
  display: flex;
  align-items: center;
  padding: 12px 14px 12px 18px;
  box-sizing: border-box;
  cursor: grab;
  background: var(--db-card);
}
.feat-hub-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
}
.feat-hub-title {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--db-ink);
}
.feat-hub-sub {
  margin-top: 3px;
  font-size: 11.5px;
  font-weight: 700;
}

/* Feature Module Card */
.feat-card-head {
  padding: 10px 13px;
  color: #ffffff;
  cursor: grab;
}
.feat-card-head:active {
  cursor: grabbing;
}
.feat-card-head__name {
  font-size: 13.5px;
  font-weight: 800;
  line-height: 1.25;
}
.feat-card-head__route {
  margin-top: 2px;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 10.5px;
  font-weight: 600;
  opacity: 0.9;
}
.feat-card-body {
  padding: 11px 13px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: pointer;
}
.feat-card-bullets {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.feat-card-bullets li {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  font-size: 11.5px;
  line-height: 1.4;
  color: var(--db-ink-sec);
  font-weight: 500;
}
.feat-bullet-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-top: 5px;
  flex-shrink: 0;
}

.feat-card-dbs {
  padding-top: 8px;
  border-top: 1px dashed var(--db-border-strong);
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.feat-card-dbs__lbl {
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.45px;
  color: var(--db-ink-muted);
}
.feat-db-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.feat-db-chip {
  padding: 2px 7px;
  border-radius: 6px;
  background: var(--db-code-bg);
  border: 1px solid var(--db-code-border);
  color: var(--db-code-ink);
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 10.5px;
  font-weight: 700;
  cursor: pointer;
}
.feat-db-chip:hover {
  filter: brightness(1.08);
  border-color: var(--db-blue-strong);
}

/* Legend & Canvas Controls */
.feat-empty-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--db-ink-muted);
}
.feat-legend {
  position: absolute;
  left: 14px;
  bottom: 14px;
  z-index: 15;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 7px 12px;
  border-radius: 10px;
  background: var(--db-panel);
  border: 1px solid var(--db-border-strong);
  box-shadow: var(--db-shadow);
  font-size: 11.5px;
  color: var(--db-ink-sec);
  max-width: calc(100% - 280px);
}
.feat-legend__item strong {
  color: var(--db-blue);
}
.feat-legend__hint {
  color: var(--db-ink-muted);
  font-size: 11px;
}
.feat-canvas-controls {
  position: absolute;
  right: 14px;
  bottom: 14px;
  z-index: 15;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px;
  border-radius: 11px;
  background: var(--db-panel);
  border: 1px solid var(--db-border-strong);
  box-shadow: var(--db-shadow);
}
.feat-ctrl-btn {
  height: 30px;
  min-width: 30px;
  padding: 0 8px;
  border-radius: 7px;
  border: none;
  background: transparent;
  color: var(--db-blue);
  font-size: 15px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  font-family: inherit;
}
.feat-ctrl-btn.is-text {
  font-size: 12px;
  font-weight: 700;
}
.feat-ctrl-btn:hover {
  background: var(--db-blue-bg);
}
.feat-zoom-pct {
  font-size: 12px;
  font-weight: 800;
  color: var(--db-ink);
  min-width: 42px;
  text-align: center;
}
.feat-ctrl-sep {
  width: 1px;
  height: 18px;
  background: var(--db-border-strong);
  margin: 0 2px;
}

/* Buttons */
.feat-btn-primary,
.feat-btn-soft,
.feat-btn-ghost {
  height: 36px;
  padding: 0 13px;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  font-family: inherit;
  border: 1px solid transparent;
}
.feat-btn-primary {
  background: var(--db-blue-grad);
  color: #ffffff;
  box-shadow: var(--db-blue-glow);
}
.feat-btn-soft {
  background: var(--db-blue-bg);
  color: var(--db-blue);
  border-color: var(--db-blue-border);
}
.feat-btn-ghost {
  background: var(--db-well);
  color: var(--db-blue);
  border-color: var(--db-blue-border);
}

/* Read-only Feature Inspector */
.feat-inspector {
  width: 332px;
  flex-shrink: 0;
  background: var(--db-panel);
  border: 1px solid var(--db-border-strong);
  border-radius: 16px;
  box-shadow: var(--db-shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: var(--db-ink);
}
.feat-inspector__head {
  padding: 14px 15px;
  border-bottom: 1px solid var(--db-border);
  background: var(--db-insp-head);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  flex-shrink: 0;
}
.feat-inspector__head-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.feat-group-pill {
  align-self: flex-start;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 800;
  color: #ffffff;
}
.feat-inspector__name {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: var(--db-ink);
}
.feat-inspector__route {
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--db-blue);
}
.feat-inspector__close {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid var(--db-border-strong);
  background: var(--db-card);
  color: var(--db-ink);
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  flex-shrink: 0;
}
.feat-inspector__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 14px 15px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.feat-inspector__desc {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--db-ink-sec);
}
.feat-inspector__cta {
  width: 100%;
  height: 39px;
}
.feat-inspector__section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.feat-inspector__sec-title {
  margin: 0;
  font-size: 11.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.45px;
  color: var(--db-ink-muted);
}
.feat-insp-bullets {
  margin: 0;
  padding-left: 17px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12.5px;
  line-height: 1.45;
  color: var(--db-ink);
}
.feat-insp-table-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.feat-insp-table-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 7px 9px;
  border-radius: 8px;
  background: var(--db-insp-row);
  border: 1px solid var(--db-border);
}
.feat-insp-table-name {
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 12px;
  font-weight: 700;
  color: var(--db-ink);
  word-break: break-all;
}
.feat-insp-table-acts {
  display: inline-flex;
  gap: 5px;
  flex-shrink: 0;
}
.feat-mini-link {
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid var(--db-blue-border);
  background: var(--db-blue-bg);
  color: var(--db-blue);
  font-size: 10.5px;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
}
.feat-mini-link.is-alt {
  background: var(--db-well);
  color: var(--db-ink-sec);
  border-color: var(--db-border-strong);
}

.feat-flow-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.feat-flow-item {
  width: 100%;
  text-align: left;
  padding: 8px 10px;
  border-radius: 9px;
  border: 1px solid var(--db-border-strong);
  background: var(--db-card);
  cursor: pointer;
  font-family: inherit;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.feat-flow-item:hover {
  background: var(--db-blue-bg);
  border-color: var(--db-blue-strong);
}
.feat-flow-item strong {
  font-size: 13px;
  color: var(--db-blue);
}
.feat-flow-dir {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.feat-flow-dir.is-in { color: #059669; }
.feat-flow-dir.is-out { color: #2563eb; }
.feat-flow-lbl {
  font-size: 11.5px;
  color: var(--db-ink-muted);
  font-weight: 600;
}

.feat-inspector__mob-foot {
  padding: 10px 14px max(calc(env(safe-area-inset-bottom, 0px) + 10px), 14px);
  background: var(--db-panel);
  border-top: 1px solid var(--db-border);
  flex-shrink: 0;
}

/* Mobile List Cards */
.feat-mob-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.feat-mob-empty {
  padding: 32px 14px;
  text-align: center;
  background: var(--db-panel);
  border-radius: 14px;
  border: 1px solid var(--db-border);
  color: var(--db-ink-muted);
}
.feat-mob-card {
  background: var(--db-panel);
  border: 1px solid var(--db-border);
  border-left: 4px solid #2563eb;
  border-radius: 14px;
  padding: 13px;
  box-shadow: var(--db-shadow);
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.feat-mob-card__meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 5px;
}
.feat-route-tag {
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 10.5px;
  font-weight: 700;
  color: var(--db-ink-muted);
}
.feat-mob-card__title {
  margin: 0;
  font-size: 15.5px;
  font-weight: 800;
  color: var(--db-ink);
}
.feat-mob-card__summary {
  margin: 3px 0 0;
  font-size: 12px;
  line-height: 1.45;
  color: var(--db-ink-sec);
}
.feat-mob-bullets {
  margin: 0;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--db-ink);
}
.feat-mob-db-wrap {
  padding: 8px 9px;
  border-radius: 9px;
  background: var(--db-well);
  border: 1px solid var(--db-border);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.feat-mob-db-lbl {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--db-ink-muted);
}
.feat-mob-card__foot {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--db-border);
}
.feat-mob-card__foot button {
  width: 100%;
  height: 34px;
  font-size: 12px;
}

@media (max-width: 768px) {
  .feat-shell {
    overflow: visible;
  }
  .feat-filter-bar {
    padding: 10px;
    gap: 8px;
  }
  .feat-filter-top {
    width: 100%;
  }
  .feat-style-switch {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .feat-style-btn {
    justify-content: center;
  }
  .feat-search-box {
    flex: 1;
    width: auto;
    min-width: 0;
  }
  .feat-group-chips {
    width: 100%;
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding-bottom: 2px;
  }
  .feat-group-chips::-webkit-scrollbar {
    display: none;
  }
  .feat-toggles {
    width: 100%;
    justify-content: space-between;
  }
  .feat-stage {
    height: calc(100dvh - 280px);
    min-height: 410px;
  }
  .feat-legend {
    display: none;
  }
  .feat-canvas-controls {
    left: 10px;
    right: 10px;
    bottom: 10px;
    justify-content: space-between;
    padding: 4px 6px;
  }
  .feat-inspector.is-mobile-sheet {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100dvh;
    border-radius: 0;
    border: none;
    z-index: 10080;
  }
  .feat-inspector.is-mobile-sheet .feat-inspector__head {
    padding-top: max(calc(env(safe-area-inset-top, 0px) + 6px), 52px) !important;
  }
  .feat-inspector.is-mobile-sheet .feat-inspector__close {
    width: 34px;
    height: 34px;
  }
}
</style>
