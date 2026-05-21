<template>
  <div class="modal pipeline-modal-overlay" @click.self="$emit('close')">
    <!-- SIDE ARROWS on screen edges -->
    <button v-if="pipelineStep > 0" class="side-arrow side-arrow-left" @click.stop="goToStep(pipelineStep - 1)">
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
    </button>
    <button v-if="pipelineStep < 2" class="side-arrow side-arrow-right" @click.stop="goToStep(pipelineStep + 1)">
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </button>

    <div class="modal-card pipeline-modal-content">
      <div class="modal-head">
        <h3><i class="lucide-git-branch"></i> Preview Pipeline PO / DealReg</h3>
        <button class="pipeline-close-btn" @click="$emit('close')">✕</button>
      </div>

      <!-- STEP INDICATOR -->
      <div class="pipeline-steps">
        <div class="pipeline-step" :class="{ active: pipelineStep === 0, done: pipelineStep > 0 }" @click="goToStep(0)">
          <div class="step-circle">1</div>
          <div class="step-text">
            <span class="step-label">PO</span>
            <span class="step-sub">Thông tin đơn hàng</span>
          </div>
        </div>
        <div class="step-connector" :class="{ done: pipelineStep > 0 }"><div class="step-connector-fill"></div></div>
        <div class="pipeline-step" :class="{ active: pipelineStep === 1, done: pipelineStep > 1 }" @click="goToStep(1)">
          <div class="step-circle">2</div>
          <div class="step-text">
            <span class="step-label">Chi tiết mua hàng</span>
            <span class="step-sub">Sản phẩm & giá</span>
          </div>
        </div>
        <div class="step-connector" :class="{ done: pipelineStep > 1 }"><div class="step-connector-fill"></div></div>
        <div class="pipeline-step" :class="{ active: pipelineStep === 2 }" @click="goToStep(2)">
          <div class="step-circle">3</div>
          <div class="step-text">
            <span class="step-label">Deal Reg</span>
            <span class="step-sub">Đăng ký deal</span>
          </div>
        </div>
      </div>

      <div class="modal-body-scroll">
        <div class="po-preview-container" style="padding: 0; min-height: auto;">
          <div class="record-wrapper">
            <!-- File Header -->
            <div class="file-header-bar">
              <span class="file-name">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                Preview: PO {{ nextPoNumber !== 'Đang lấy số...' ? nextPoNumber : '...' }}
              </span>
              <span class="nav-info" style="font-size: 13px;">Bước {{ pipelineStep + 1 }} / 3</span>
            </div>

            <!-- ═══ SLIDE 1: PO ═══ -->
            <Transition :name="slideDirection" mode="out-in">
            <div v-if="pipelineStep === 0" key="slide-0" class="slide-panel">
              <!-- Sections Grid 2 columns -->
              <div class="sections-grid">
                <div v-for="(sec, sIndex) in tableSections" :key="'sec'+sIndex" class="section-card" :class="{'section-vertical': sec.vertical}" :style="sec.span ? { gridColumn: 'span ' + sec.span } : {}">
                  <div class="section-card-title">{{ sec.name }}</div>
                  <div class="section-card-body">
                    <div v-for="col in sec.columns" :key="col.key" class="data-item">
                      <span class="data-label">{{ col.label }}:</span>
                      <span class="data-value">
                        <span 
                          contenteditable="true" 
                          @blur="setEditable(col.key, ($event.target as HTMLElement).innerText)" 
                          class="pipeline-editable" 
                          :data-placeholder="String(rec[col.key] || '')"
                        >{{ getEditable(col.key) }}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </Transition>

            <!-- ═══ SLIDE 2: CHI TIẾT MUA HÀNG ═══ -->
            <Transition :name="slideDirection" mode="out-in">
            <div v-if="pipelineStep === 1" key="slide-1" class="slide-panel">
              <button class="slide-back-btn" @click="goToStep(0)">← Quay lại PO</button>
              <div class="product-card">
                <div class="product-card-header">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                  <span>8. CHI TIẾT MUA HÀNG</span>
                  <span class="product-badge" v-if="rec.products && rec.products.length">{{ rec.products.length }} sản phẩm</span>
                </div>
                <div class="product-table-wrapper" v-if="rec.products && rec.products.length > 0">
                  <table class="product-table">
                    <colgroup>
                      <col v-for="col in rec.flatCols" :key="'col-'+col.key" :style="{ width: getColWidth(col) }">
                    </colgroup>
                    <thead>
                      <tr>
                        <template v-for="(group, gi) in rec.headerGroups" :key="'g1-'+gi">
                          <th v-if="group.standalone" :rowspan="2" class="th-base">{{ group.cols[0].label }}</th>
                          <th v-else :colspan="group.cols.length" class="th-brand" :style="{ background: brandColor(group.brand).bg, color: brandColor(group.brand).text }">{{ group.brand }}</th>
                        </template>
                      </tr>
                      <tr>
                        <template v-for="(group, gi) in rec.headerGroups" :key="'g2-'+gi">
                          <template v-if="!group.standalone">
                            <th v-for="col in group.cols" :key="'sub-'+col.key" class="th-sub" :style="{ background: brandColor(group.brand).subBg, borderBottomColor: brandColor(group.brand).border }">{{ col.label }}</th>
                          </template>
                        </template>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(prod, pIdx) in rec.products" :key="'tr-'+pIdx">
                        <td v-for="col in rec.flatCols" :key="'td-'+col.key"
                            :class="{
                              'col-stt': col.label === 'STT',
                              'col-name': col.label.toLowerCase().includes('tên hàng') || col.label.toLowerCase().includes('tên sản phẩm'),
                              'col-number': ['sl','đơn giá','thành tiền','mức off', 'tỉ giá', 'list price', 'đvtt'].some(n => col.label.toLowerCase().includes(n))
                            }"
                            :style="col.brand && prod[col.key] && prod[col.key] !== 'x' && String(prod[col.key]).trim() !== '' ? { background: brandColor(col.brand).cellBg } : {}">
                          <template v-if="col.key === 'Ti_gia_pipeline'">
                            <FormattedInput 
                              v-model="customRates[pIdx]" 
                              class="rate-input"
                            />
                          </template>
                          <template v-else-if="String(prod[col.key] || '').includes('<div') || String(prod[col.key] || '').includes('<span')">
                            <div v-html="prod[col.key]" style="display: inline-block; width: 100%;"></div>
                          </template>
                          <template v-else>
                            {{ prod[col.key] }}
                          </template>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-if="rec.ghiChu" class="product-note">
                  <strong>Ghi chú khác:</strong>
                  <p>{{ rec.ghiChu }}</p>
                </div>
              </div>
            </div>
            </Transition>

            <!-- ═══ SLIDE 3: DEAL REG ═══ -->
            <Transition :name="slideDirection" mode="out-in">
            <div v-if="pipelineStep === 2" key="slide-2" class="slide-panel">
              <button class="slide-back-btn" @click="goToStep(1)">← Quay lại Chi tiết mua hàng</button>
              <div class="dealreg-grid" v-if="dealRegs.length">
                <div v-for="(dr, di) in dealRegs" :key="'dr-'+di" class="dealreg-card">
                  <table class="dr-table">
                    <tbody>
                    <tr class="dr-title-row"><td colspan="4"><strong>Deal Registration Form</strong></td></tr>
                    <tr>
                      <td class="dr-label-cyan">End user Company Name*:</td>
                      <td class="dr-value"><span contenteditable="true" @blur="setEditable('CUS_COMPANY', ($event.target as HTMLElement).innerText)" class="pipeline-editable">{{ getEditable('CUS_COMPANY') }}</span></td>
                      <td class="dr-label-blue-italic">End User Name*<br><small>(First, Last Name)</small>:</td>
                      <td class="dr-value"><span contenteditable="true" @blur="setEditable('CUS_CONTACT', ($event.target as HTMLElement).innerText)" class="pipeline-editable">{{ getEditable('CUS_CONTACT') }}</span></td>
                    </tr>
                    <tr>
                      <td class="dr-label">End user Company Name <span style="color:#FF0000">Vietnamese: *</span></td>
                      <td class="dr-value"><span contenteditable="true" @blur="setEditable('INV_CONG_TY', ($event.target as HTMLElement).innerText)" class="pipeline-editable">{{ getEditable('INV_CONG_TY') }}</span></td>
                      <td class="dr-label">End User Email:</td>
                      <td class="dr-value"><span contenteditable="true" @blur="setEditable('CUS_EMAIL', ($event.target as HTMLElement).innerText)" class="pipeline-editable">{{ getEditable('CUS_EMAIL') }}</span></td>
                    </tr>
                    <tr>
                      <td class="dr-label" rowspan="2">Company Address*:</td>
                      <td class="dr-value" rowspan="2"><span contenteditable="true" @blur="setEditable('CUS_ADDRESS', ($event.target as HTMLElement).innerText)" class="pipeline-editable">{{ getEditable('CUS_ADDRESS') }}</span></td>
                      <td class="dr-label-navy">End User Phone*:</td>
                      <td class="dr-value"><span contenteditable="true" @blur="setEditable('CUS_MOBILE', ($event.target as HTMLElement).innerText)" class="pipeline-editable">{{ getEditable('CUS_MOBILE') }}</span></td>
                    </tr>
                    <tr>
                      <td class="dr-label-navy">End User Website*:</td>
                      <td class="dr-value"><span contenteditable="true" @blur="setEditable('CUS_WEBSITE', ($event.target as HTMLElement).innerText)" class="pipeline-editable">{{ getEditable('CUS_WEBSITE') }}</span></td>
                    </tr>
                    <tr>
                      <td class="dr-label">Country*:</td>
                      <td class="dr-value"><span contenteditable="true" @blur="setEditable('DR_COUNTRY', ($event.target as HTMLElement).innerText)" class="pipeline-editable">{{ getEditable('DR_COUNTRY') || 'VIET NAM' }}</span></td>
                      <td class="dr-label-black">Existing Sophos Customer?</td>
                      <td class="dr-value"><span contenteditable="true" @blur="setEditable('DR_EXISTING_CUST', ($event.target as HTMLElement).innerText)" class="pipeline-editable">{{ getEditable('DR_EXISTING_CUST') }}</span></td>
                    </tr>
                    <tr>
                      <td class="dr-label-italic">Company Size*<br><small>(no. of employees)</small>:</td>
                      <td class="dr-value"><span contenteditable="true" @blur="setEditable('DR_SIZE', ($event.target as HTMLElement).innerText)" class="pipeline-editable">{{ getEditable('DR_SIZE') }}</span></td>
                      <td class="dr-label-black">Estimated Customer Budget<br><small>(in USD)</small>:</td>
                      <td class="dr-value"><span contenteditable="true" @blur="setEditable('DR_BUDGET', ($event.target as HTMLElement).innerText)" class="pipeline-editable">{{ getEditable('DR_BUDGET') }}</span></td>
                    </tr>
                    <tr>
                      <td class="dr-label-italic">Estimated Closure Date<br><small>(DD/MM/YYYY)</small>:*</td>
                      <td class="dr-value"><span contenteditable="true" @blur="setEditable('DR_CLOSE_DATE', ($event.target as HTMLElement).innerText)" class="pipeline-editable">{{ getEditable('DR_CLOSE_DATE') }}</span></td>
                      <td class="dr-label-black">Competition:*</td>
                      <td class="dr-value"><span contenteditable="true" @blur="setEditable('DR_COMP', ($event.target as HTMLElement).innerText)" class="pipeline-editable">{{ getEditable('DR_COMP') }}</span></td>
                    </tr>
                    <tr>
                      <td class="dr-label-black">Proposed POC Schedule:</td>
                      <td class="dr-value"><span contenteditable="true" @blur="setEditable('DR_POC', ($event.target as HTMLElement).innerText)" class="pipeline-editable">{{ getEditable('DR_POC') }}</span></td>
                      <td class="dr-label"></td>
                      <td class="dr-value"></td>
                    </tr>
                    <tr class="dr-title-row"><td colspan="4"><strong>Partner Information</strong></td></tr>
                    <tr>
                      <td class="dr-label">Partner Company Name*:</td>
                      <td class="dr-value"><span contenteditable="true" @blur="setEditable('DR_PARTNER_NAME', ($event.target as HTMLElement).innerText)" class="pipeline-editable">{{ getEditable('DR_PARTNER_NAME') || 'Nam Truong Son System Integration Corp' }}</span></td>
                      <td class="dr-label">Account Manager Email*:</td>
                      <td class="dr-value"><span contenteditable="true" @blur="setEditable('DR_AM_EMAIL', ($event.target as HTMLElement).innerText)" class="pipeline-editable">{{ getEditable('DR_AM_EMAIL') || 'sonlp@nts.com.vn' }}</span></td>
                    </tr>
                    <tr>
                      <td class="dr-label">Partner Address:*</td>
                      <td class="dr-value"><span contenteditable="true" @blur="setEditable('DR_PARTNER_ADDRESS', ($event.target as HTMLElement).innerText)" class="pipeline-editable">{{ getEditable('DR_PARTNER_ADDRESS') || '55/10 Trần Đình Xu, Phường Cầu Kho, Quận 1, Thành phố Hồ Chí Minh, Việt Nam' }}</span></td>
                      <td class="dr-label"></td>
                      <td class="dr-value"></td>
                    </tr>
                    <tr>
                      <td class="dr-label-blue-italic">Account Manager Name*<br><small>(First, Last Name)</small>:</td>
                      <td class="dr-value"><span contenteditable="true" @blur="setEditable('DR_AM_NAME', ($event.target as HTMLElement).innerText)" class="pipeline-editable">{{ getEditable('DR_AM_NAME') || 'LÊ PHI SƠN' }}</span></td>
                      <td class="dr-label">Account Manager <span style="color:#FF0000">Phone*</span></td>
                      <td class="dr-value"><span contenteditable="true" @blur="setEditable('DR_AM_PHONE', ($event.target as HTMLElement).innerText)" class="pipeline-editable">{{ getEditable('DR_AM_PHONE') || '090 8137488' }}</span></td>
                    </tr>
                    <tr class="dr-title-row"><td colspan="4"><strong><em>Remarks</em></strong><br><em style="font-weight:400;font-size:9pt;color:#000">(Any comments/ details/ requirements/ project name / tender specifications and etc.)</em></td></tr>
                    <tr><td colspan="4" class="dr-remarks" style="padding: 0;"><textarea :value="getEditable('DR_REMARKS')" @input="setEditable('DR_REMARKS', ($event.target as HTMLTextAreaElement).value)" class="pipeline-input" style="min-height: 60px; resize: vertical; padding: 8px; width: 100%; box-sizing: border-box;" placeholder="Nhập ghi chú..."></textarea></td></tr>
                    <tr class="dr-title-row"><td colspan="4"><strong>Bill of Materials</strong></td></tr>
                    <tr class="bom-header-row">
                      <td colspan="2"><strong>SKU / Product / Description*</strong></td>
                      <td><strong>Qty*</strong></td>
                      <td><strong>Estimated Value (USD)</strong></td>
                    </tr>
                    <tr v-for="(item, ii) in dr.items" :key="'bom-'+ii">
                      <td colspan="2">{{ item.name }}</td>
                      <td class="bom-qty">{{ item.qty }}</td>
                      <td class="bom-val">{{ formatNum(item.value) }}</td>
                    </tr>
                    <tr class="bom-total-row">
                      <td colspan="2"><strong>TOTAL</strong></td>
                      <td></td>
                      <td class="bom-val"><strong>{{ formatNum(dr.total) }}</strong></td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div v-else style="padding: 40px; text-align: center; color: #94a3b8; font-size: 14px;">
                Không có Deal Registration nào.
              </div>
            </div>
            </Transition>

          </div>
        </div>
      </div>

      <!-- BOTTOM SAVE BAR -->
      <div class="pipeline-nav">
        <span class="nav-info">Bước {{ pipelineStep + 1 }} / 3</span>
        <button class="nav-btn nav-save" @click="saveRecord" :disabled="saved || saving || nextPoNumber === 'Đang lấy số...' || nextPoNumber === '...'">
          <svg v-if="saving" class="spin" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
          {{ saved ? '✅ Đã lưu thành công' : '💾 Lưu Pipeline' }}
        </button>
      </div>
    </div>
  </div>

  <!-- ASYNC RESULT MODAL -->
  <Transition name="async-modal">
    <div v-if="asyncResult.show" class="async-overlay" @click.self="asyncResult.type !== 'loading' && (asyncResult.show = false)">
      <div class="async-card" :class="'async-' + asyncResult.type">
        <template v-if="asyncResult.type === 'loading'">
          <div class="async-spinner-wrap"><svg class="async-spinner" viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="none" stroke-width="4" stroke-linecap="round"/></svg></div>
          <div class="async-title">{{ asyncResult.title }}</div>
          <div class="async-subtitle">Vui lòng đợi trong giây lát...</div>
        </template>
        <template v-else-if="asyncResult.type === 'success'">
          <div class="async-icon-wrap async-icon-success"><svg viewBox="0 0 52 52" class="async-checkmark"><circle cx="26" cy="26" r="25" fill="none"/><path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/></svg></div>
          <div class="async-title">{{ asyncResult.title }}</div>
          <div v-if="asyncResult.msg" class="async-subtitle">{{ asyncResult.msg }}</div>
        </template>
        <template v-else>
          <div class="async-icon-wrap async-icon-error"><svg viewBox="0 0 52 52" class="async-xmark"><circle cx="26" cy="26" r="25" fill="none"/><path fill="none" d="M16 16 36 36 M36 16 16 36"/></svg></div>
          <div class="async-title">{{ asyncResult.title }}</div>
          <div v-if="asyncResult.msg" class="async-subtitle">{{ asyncResult.msg }}</div>
          <button class="async-close-btn" @click="asyncResult.show = false">Đóng</button>
        </template>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import FormattedInput from './FormattedInput.vue'

const emit = defineEmits(['close', 'saved'])

const BASE_URL = 'https://script.google.com/macros/s/AKfycbx1yDOQLxYgJb5w30KmxQHF8AYUZln_5q58HCKP4zlUmtJye6aJBiSt3oyT0j_3QaigdQ/exec'
const pipelineStep = ref(0)
const slideDirection = ref('slide-right')

function goToStep(step: number) {
  slideDirection.value = step > pipelineStep.value ? 'slide-right' : 'slide-left'
  pipelineStep.value = step
}
const nextPoNumber = ref('Đang lấy số...')

onMounted(async () => {
  if (props.loadedData && props.loadedData.po && props.loadedData.po.length > 0) {
    const po = props.loadedData.po
    nextPoNumber.value = String(po[2] || '')
    setEditable('STT_B2', po[2] || '')
    setEditable('TEN_C2', po[3] || '')
    setEditable('DO_UU_TIEN', po[4] || '')
    setEditable('TRANG_THAI', po[5] || '')
    setEditable('CUS_COMPANY', po[7] || '')
    setEditable('CUS_ADDRESS', po[8] || '')
    setEditable('CUS_TEL', po[9] || '')
    setEditable('CUS_FAX', po[10] || '')
    setEditable('CUS_CONTACT', po[11] || '')
    setEditable('CUS_EMAIL', po[12] || '')
    setEditable('CUS_MOBILE', po[13] || '')
    setEditable('CUS_WEBSITE', po[14] || '')
    setEditable('INV_CONG_TY', po[15] || '')
    setEditable('INV_DIA_CHI', po[16] || '')
    setEditable('INV_MST', po[17] || '')
    setEditable('INV_EMAIL', po[18] || '')
    setEditable('INV_THANH_LY', po[19] || '')
    setEditable('INV_DN_THANH_TOAN', po[20] || '')
    setEditable('INV_COCQ', po[21] || '')
    setEditable('DEL_M1', po[22] || '')
    setEditable('DEL_M2', po[23] || '')
    setEditable('DEL_M3', po[24] || '')
    setEditable('DEL_NGUOI_NHAN', po[25] || '')
    setEditable('DEL_DIA_CHI', po[26] || '')
    setEditable('DEL_SDT', po[27] || '')
    setEditable('DEL_NGUOI_LIEN_HE', po[28] || '')
    setEditable('PAY_NGAY_COC', po[29] || '')
    setEditable('PAY_TI_LE_COC', po[30] || '')
    setEditable('PAY_CONG_NO', po[31] || '')
    setEditable('PAY_NGAY_CO_HANG', po[32] || '')

    const drList = props.loadedData.dealReg || []
    if (drList.length > 0) {
      const dr = drList[0]
      setEditable('DR_COUNTRY', dr[13] || '')
      setEditable('DR_EXISTING_CUST', dr[14] || '')
      setEditable('DR_SIZE', dr[15] || '')
      setEditable('DR_BUDGET', dr[16] || '')
      setEditable('DR_CLOSE_DATE', dr[17] || '')
      setEditable('DR_COMP', dr[18] || '')
      setEditable('DR_POC', dr[19] || '')
      setEditable('DR_PARTNER_NAME', dr[20] || '')
      setEditable('DR_PARTNER_ADDRESS', dr[21] || '')
      setEditable('DR_AM_NAME', dr[22] || '')
      setEditable('DR_AM_EMAIL', dr[23] || '')
      setEditable('DR_AM_PHONE', dr[24] || '')
      setEditable('DR_REMARKS', dr[25] || '')
    }
  } else {
    try {
      const poData = await fetch(`${BASE_URL}?action=po_dxmh`).then(r => r.json())
      let maxPO = 0
      if (Array.isArray(poData)) {
        poData.forEach((row: any) => {
          const soPo = parseInt(String(row[2] || '').replace(/\D/g, ''))
          if (!isNaN(soPo) && soPo > maxPO) maxPO = soPo
        })
      }
      nextPoNumber.value = String(maxPO + 1)
    } catch (e) {
      nextPoNumber.value = '...'
    }
  }
})

const customRates = ref<any>({})

const editableFields = ref<Record<string, string>>({})

const getEditable = (key: string) => {
  if (editableFields.value[key] !== undefined) return editableFields.value[key]
  // Fall back to rec
  const val = (rec.value as any)[key]
  return val !== undefined && val !== null ? String(val) : ''
}

const setEditable = (key: string, val: string) => {
  editableFields.value[key] = val
}

const saving = ref(false)
const saved = ref(false)

const asyncResult = ref<{ show: boolean, type: 'loading' | 'success' | 'error', title: string, msg: string }>({
  show: false, type: 'loading', title: '', msg: ''
})
let asyncTimeout: any = null

const saveRecord = async () => {
  if (saving.value || saved.value) return
  saving.value = true
  asyncResult.value = { show: true, type: 'loading', title: 'Đang lưu Pipeline...', msg: '' }

  try {
    const maHD = props.maHopDong || `HD${new Date().toISOString().replace(/\D/g, '')}`
    const soHD = props.soHopDong || `HĐ${new Date().getTime()}`
    const soPO = getEditable('STT_B2') || nextPoNumber.value
    const tenPO = getEditable('TEN_C2') || ''

    const tenKhachHangSave = getEditable('DEL_NGUOI_NHAN') || props.khach?.Ten_khach_hang || getEditable('CUS_CONTACT') || ''
    const tenKHChinh = getEditable('CUS_CONTACT') || getEditable('DEL_NGUOI_NHAN') || ''
    const congTy = getEditable('CUS_COMPANY') || getEditable('INV_CONG_TY') || ''
    const sdtChinh = getEditable('CUS_MOBILE') || getEditable('DEL_SDT') || ''
    
    // Auto-gen mã khách hàng
    const abbr = (s: string) => (s||'').trim().split(/\s+/).map(w => w[0]?.toUpperCase()).join('')
    const maKH = props.khach?.Ma_khach_hang || [abbr(tenKhachHangSave), abbr(congTy), sdtChinh.replace(/\D/g, '')].filter(Boolean).join('_')
    const maCT = congTy ? `CT_${abbr(congTy)}` : ''

    // 0. Cập nhật / Thêm mới khach_hang
    const isExisting = props.customers?.some((c: any) => c.Ma_khach_hang === maKH) || !!props.khach?.Ma_khach_hang
    if (maKH) {
      const resKH = await fetch(BASE_URL, {
        method: 'POST',
        body: JSON.stringify({
          sheet: 'khach_hang',
          action: isExisting ? 'update' : 'add',
          ma_khach_hang: maKH,
          ma_cong_ty: props.khach?.Ma_cong_ty || maCT,
          ten_khach_hang: tenKhachHangSave,
          so_dien_thoai_ca_nhan: getEditable('DEL_SDT') || props.khach?.So_dien_thoai_ca_nhan || sdtChinh,
          email_ca_nhan: getEditable('CUS_EMAIL') || props.khach?.Email_ca_nhan || '',
          ten_cong_ty: getEditable('INV_CONG_TY') || props.khach?.Ten_cong_ty || congTy,
          dia_chi_cong_ty: getEditable('INV_DIA_CHI') || props.khach?.Dia_chi_cong_ty || '',
          so_dien_thoai_cong_ty: getEditable('CUS_TEL') || props.khach?.So_dien_thoai_cong_ty || '',
          so_fax_cong_ty: getEditable('CUS_FAX') || props.khach?.So_fax_cong_ty || '',
          email_cong_ty: getEditable('INV_EMAIL') || props.khach?.Email_cong_ty || '',
          mst: getEditable('INV_MST') || props.khach?.MST || '',
          website_cong_ty: getEditable('CUS_WEBSITE') || props.khach?.Website_cong_ty || '',
          company: getEditable('CUS_COMPANY') || props.khach?.COMPANY || '',
          address: getEditable('CUS_ADDRESS') || props.khach?.ADDRESS || '',
          tel: getEditable('CUS_TEL') || props.khach?.TEL || '',
          ten_khach_hang_phu: getEditable('CUS_CONTACT') || props.khach?.Ten_khach_hang_phu || '',
          so_dien_thoai_ca_nhan_phu: getEditable('CUS_MOBILE') || props.khach?.So_dien_thoai_ca_nhan_phu || '',
          trang_thai: props.khach?.Trang_thai || 'Hoạt động',
          tong_chi_tieu: props.khach?.Tong_chi_tieu || 0,
          cong_no_chua_thanh_toan: props.khach?.Cong_no_chua_thanh_toan || 0,
          hoa_hong: props.khach?.Hoa_hong || ''
        })
      })
      const resKhJson = await resKH.json()
      if (resKhJson.status === 'error') {
        throw new Error(resKhJson.message || 'Lỗi khi lưu khách hàng')
      }
    }

    // 1. POST PO_DXMH
    await fetch(BASE_URL, {
      method: 'POST',
      body: JSON.stringify({
        sheet: 'po_dxmh', action: 'add',
        ma_hop_dong: maHD, so_hop_dong: soHD, so_po: soPO, ten_po: tenPO,
        ma_khach_hang: maKH,
        do_uu_tien: getEditable('DO_UU_TIEN'),
        trang_thai_don_hang: getEditable('TRANG_THAI'),
        company: getEditable('CUS_COMPANY'), address: getEditable('CUS_ADDRESS'),
        tel: getEditable('CUS_TEL'), fax: getEditable('CUS_FAX'),
        contact: getEditable('CUS_CONTACT'), email: getEditable('CUS_EMAIL'),
        mobile: getEditable('CUS_MOBILE'), website: getEditable('CUS_WEBSITE'),
        cong_ty: getEditable('INV_CONG_TY'), dia_chi: getEditable('INV_DIA_CHI'),
        mst: getEditable('INV_MST'), email_inv: getEditable('INV_EMAIL'),
        thanh_ly: getEditable('INV_THANH_LY'), dn_thanh_toan: getEditable('INV_DN_THANH_TOAN'),
        co_cq: getEditable('INV_COCQ'),
        giao_hang_hoa_don: getEditable('DEL_M1'), giao_hang_ky_thuat: getEditable('DEL_M2'),
        lien_he_kd_truoc: getEditable('DEL_M3'),
        nguoi_nhan_hang: getEditable('DEL_NGUOI_NHAN'), dia_chi_nhan: getEditable('DEL_DIA_CHI'),
        so_dien_thoai: getEditable('DEL_SDT'), nguoi_lien_he_trien_khai: getEditable('DEL_NGUOI_LIEN_HE'),
        ngay_dat_coc: getEditable('PAY_NGAY_COC'), ti_le_dat_coc: getEditable('PAY_TI_LE_COC'),
        cong_no_ngay: getEditable('PAY_CONG_NO'), ngay_co_hang_du_kien: getEditable('PAY_NGAY_CO_HANG'),
      })
    })

    // 1b. POST hop_dong_tong_quat + hop_dong_chi_tiet
    const n = new Date()
    const p = (v: number) => String(v).padStart(2,'0')
    const ngayTao = `${p(n.getHours())}:${p(n.getMinutes())}:${p(n.getSeconds())} ${p(n.getDate())}/${p(n.getMonth()+1)}/${n.getFullYear()}`
    
    // ✅ Dùng quoteTotals đã tính đúng từ BaoGia (bao gồm giá sau khi tăng giá kí HĐ)
    const tongTruocThue = props.quoteTotals?.truoc ?? 0
    const vat = props.quoteTotals?.vat ?? 0
    const sau = props.quoteTotals?.sau ?? 0

    const hdTongRow = [
      maHD,                        // 0  ma_hop_dong
      soHD,                        // 1  so_hop_dong
      maKH,                        // 2  ma_khach_hang
      tenKhachHangSave,            // 3  ten_khach_hang
      ngayTao,                     // 4  ngay_tao_hop_dong
      tongTruocThue,               // 5  truoc_thue
      vat,                         // 6  vat
      sau,                         // 7  sau_thue
      0,                           // 8  tong_giam_gia
      sau,                         // 9  tong_cong
      0,                           // 10 tong_thanh_toan
      0,                           // 11 hh_khach
      0,                           // 12 hh_ca_nhan
      0,                           // 13 cong_no_cu
      'Chưa thanh toán đủ',        // 14 trang_thai_thanh_toan
      'Tạm',                       // 15 trang_thai_hop_dong
      props.ghiChuHopDong || '',   // 16 ghi_chu
      'VND',                       // 17 don_vi_tien_te
      1,                           // 18 ti_gia
      props.maHopDongCu || '',      // 19 ma_hop_dong_cu
      props.quoteTongGiaThucTe ?? tongTruocThue,  // 20 tong_gia_thuc_te (lấy theo FE)
      `${p(n.getHours())}:${p(n.getMinutes())}, ${p(n.getDate())}/${p(n.getMonth()+1)}/${n.getFullYear()}`, // 21 created_time
      soPO,                        // 22 So_PO
      tenPO,                       // 23 Ten_PO
      '',                          // 24 content_of_contract_po
      props.quoteFinancials?.chietKhauTruocThue ?? 0,       // 25 chiet_khau_tong_truoc_thue
      props.quoteFinancials?.chietKhauTruocThuePct ?? 0,    // 26 phan_tram_chiet_khau_tong_truoc_thue
      props.quoteFinancials?.thueChenhLech ?? 0,            // 27 thue_chenh_lech_gia
      props.quoteFinancials?.thueChenhLechPct ?? 0,         // 28 phan_tram_thue_chenh_lech_gia
      props.quoteFinancials?.chenhLechGia ?? 0,             // 29 chenh_lech_gia
      props.quoteFinancials?.conLai ?? 0,                   // 30 con_lai
      props.quoteFinancials?.tongChietKhau ?? 0,            // 31 tong_chiet_khau
      props.maHopDongGoc || maHD,                                  // 32 ma_hop_dong_goc
      false                                                 // 33 isCompleted
    ]

    const hdChiTietRows: any[] = []
    props.selectedItems.forEach((item, idx) => {
      const tg = customRates.value[idx] !== undefined ? customRates.value[idx] : (Number(item.Ti_gia) || 1)
      const isUSD = (item.Don_vi_tien_te || 'USD').toUpperCase().includes('US')
      const giaTCToSave = isUSD ? (item.Gia_tieu_chuan || 0) * tg : (item.Gia_tieu_chuan || 0)
      const donGiaToSave = isUSD ? (item.Don_gia || 0) * tg : (item.Don_gia || 0)

      hdChiTietRows.push([
        maHD,                           // 0  ma_hop_dong
        soHD,                           // 1  so_hop_dong
        item.Ma_hang || '',             // 2  Ma_hang
        item.Ten_hang || '',            // 3  Ten_hang
        item.Main_img || '',            // 4  Main_img
        item.Ma_nha_cung_cap || '',     // 5  Ma_nha_cung_cap
        item.Ten_nha_cung_cap || '',    // 6  Ten_nha_cung_cap
        item.Mo_ta_chung || '',         // 7  Mo_ta_chung
        item.Mo_ta_chi_tiet || '',      // 8  Mo_ta_chi_tiet
        item.Features || '',            // 9  Features
        item.Danh_muc || '',            // 10 Danh_muc
        item.License_duration || '',    // 11 License_duration
        item.DVT || '',                 // 12 DVT
        giaTCToSave,                    // 13 Gia_tieu_chuan
        donGiaToSave,                   // 14 Don_gia
        'VND',                          // 15 Don_vi_tien_te
        1,                              // 16 Ti_gia
        item.Thue_VAT !== undefined ? item.Thue_VAT : 10, // 17 Thue_VAT
        item.So_luong || 1,             // 18 So_luong
        'Tạm',                          // 19 Trang_thai_hop_dong
        0,                              // 20 gia_hardware
        0,                              // 21 gia_nhap
        item.muc_phan_tram_off || 0,    // 22 muc_phan_tram_off
      ])
    })

    const resContract = await fetch(`${BASE_URL}?action=save_contract_temp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `payload=${encodeURIComponent(JSON.stringify({
        hd_tong_quat_row: hdTongRow,
        hd_chi_tiet_rows: hdChiTietRows,
      }))}`
    })
    const resContractJson = await resContract.json()
    if (!resContractJson.ok) {
      throw new Error(resContractJson.error || 'Failed to save temp contract')
    }

    // 1c. POST chi_tiet_mua_hang (bulk)
    if (props.selectedItems && props.selectedItems.length) {
      const ctmhItems = props.selectedItems.map(item => ({
        ma_hop_dong: maHD, so_hop_dong: soHD, so_po: soPO, ten_po: tenPO,
        ma_hang_hoa: '', ma_sku: item.Ma_hang || '',
        ten_hang_hoa: item.Ten_hang || '',
        ma_nha_cung_cap: item.Ma_nha_cung_cap || '', ten_nha_cung_cap: item.Ten_nha_cung_cap || '',
        sl: item.So_luong || '', list_price_usd: item.Don_gia || '',
        muc_off: item.muc_phan_tram_off || '', don_gia: (item.Don_gia || 0) * (1 - (item.muc_phan_tram_off || 0) / 100),
        thanh_tien: (item.Don_gia || 0) * (1 - (item.muc_phan_tram_off || 0) / 100) * (item.So_luong || 1),
        start_date_sophos: '',
        serial_number_sophos: '',
        license_id_sophos: '',
        base_code_kaspersky: '',
        expiration_time_kaspersky: '',
        start_date_other: '',
        ghi_chu: '',
      }))
      await fetch(BASE_URL, { method: 'POST', body: JSON.stringify({ sheet: 'chi_tiet_mua_hang', action: 'add_bulk', items: ctmhItems }) })
    }

    // 2. POST deal_reg
    if (dealRegs.value && dealRegs.value.length) {
      const drItems = []
      for (const dr of dealRegs.value) {
        for (const item of dr.items) {
          drItems.push({
            ma_hop_dong: maHD, so_hop_dong: soHD, so_po: soPO, ten_po: tenPO,
            ma_nha_cung_cap: '', ten_nha_cung_cap: dr.brand,
            end_user_company_name: getEditable('CUS_COMPANY'),
            end_user_company_name_vietnamese: getEditable('INV_CONG_TY'),
            end_username: getEditable('CUS_CONTACT'), end_user_email: getEditable('CUS_EMAIL'),
            company_address: getEditable('CUS_ADDRESS'), end_user_phone: getEditable('CUS_MOBILE'),
            end_user_website: getEditable('CUS_WEBSITE'), country: getEditable('DR_COUNTRY') || 'VIET NAM',
            is_existing_sophos_customer: getEditable('DR_EXISTING_CUST'), company_size: getEditable('DR_SIZE'),
            estimated_customer_budget_usd: getEditable('DR_BUDGET'), estimated_closure_date: getEditable('DR_CLOSE_DATE'),
            competition: getEditable('DR_COMP'), proposed_poc_schedule: getEditable('DR_POC'),
            partner_company_name: getEditable('DR_PARTNER_NAME') || 'Nam Truong Son System Integration Corp',
            partner_address: getEditable('DR_PARTNER_ADDRESS') || '55/10 Trần Đình Xu, Phường Cầu Kho, Quận 1, Thành phố Hồ Chí Minh, Việt Nam',
            account_manager_name: getEditable('DR_AM_NAME') || 'LÊ PHI SƠN',
            account_manager_email: getEditable('DR_AM_EMAIL') || 'sonlp@nts.com.vn',
            account_manager_phone: getEditable('DR_AM_PHONE') || '090 8137488',
            remark: getEditable('DR_REMARKS'),
            ma_hang_hoa: '', ma_sku: item.sku || '',
            ten_hang_hoa: item.name || '',
            ma_nha_cung_cap_item: '', ten_nha_cung_cap_item: dr.brand,
            qty: item.qty || '', estimated_value_usd: formatNum(item.value),
            total: formatNum(dr.total),
          })
        }
      }
      if (drItems.length) {
        await fetch(BASE_URL, { method: 'POST', body: JSON.stringify({ sheet: 'deal_reg', action: 'add_bulk', items: drItems }) })
      }
    }

    // 3. POST sale_report
    {
      let linkBaoGia = ''
      if (props.excelBlob) {
        try {
          const formData = new FormData()
          formData.append('upload_preset', 'upload_file')
          formData.append('file', props.excelBlob, `BaoGia_${soHD || maHD}.xlsx`)
          const uploadRes = await fetch('https://api.cloudinary.com/v1_1/db6fzs3rh/auto/upload', {
            method: 'POST',
            body: formData
          }).then(r => r.json())
          linkBaoGia = uploadRes.secure_url || ''
        } catch (e) {
          console.error('Lỗi upload file báo giá lên Cloudinary:', e)
        }
      }

      // Lấy nhà cung cấp đầu tiên
      const firstItem = props.selectedItems[0] || {}
      const maNCC = firstItem.Ma_nha_cung_cap || ''
      const tenNCC = firstItem.Ten_nha_cung_cap || ''

      const srPayload = {
        sheet: 'sale_report',
        action: 'add',
        ma_hop_dong: maHD,
        so_hop_dong: soHD,
        So_PO: soPO,
        content_of_contract_PO: tenPO,
        Ma_khach_hang: maKH,
        Ten_khach_hang: tenKhachHangSave,
        Ma_cong_ty: props.khach?.Ma_cong_ty || maCT,
        Ten_cong_ty: getEditable('INV_CONG_TY') || props.khach?.Ten_cong_ty || congTy,
        MST: getEditable('INV_MST') || props.khach?.MST || '',
        Ma_nha_cung_cap: maNCC,
        Ten_nha_cung_cap: tenNCC,
        Tong_tien_truoc_thueVAT: props.quoteTotals?.truoc ?? tongTruocThue,
        Tong_thueVAT: props.quoteTotals?.vat ?? vat,
        Tong_tien_sau_thueVAT: props.quoteTotals?.sau ?? sau,
        chiet_khau_tong_truoc_thue: props.quoteFinancials?.chietKhauTruocThue ?? 0,
        phan_tram_chiet_khau_tong_truoc_thue: props.quoteFinancials?.chietKhauTruocThuePct ?? 0,
        thue_chenh_lech_gia: props.quoteFinancials?.thueChenhLech ?? 0,
        phan_tram_thue_chenh_lech_gia: props.quoteFinancials?.thueChenhLechPct ?? 0,
        chenh_lech_gia: props.quoteFinancials?.chenhLechGia ?? 0,
        con_lai: props.quoteFinancials?.conLai ?? 0,
        tong_chiet_khau: props.quoteFinancials?.tongChietKhau ?? 0,
        Tong_thanh_tien_chua_VAT_mua_hang: 0,
        Tong_CP_don_hang: 0,
        account_manager_name: getEditable('DR_AM_NAME') || 'LÊ PHI SƠN',
        link_excel_bao_gia: linkBaoGia
      }
      await fetch(BASE_URL, { method: 'POST', body: JSON.stringify(srPayload) })
    }

    saved.value = true
    emit('saved')
    asyncResult.value = { show: true, type: 'success', title: 'Lưu Pipeline thành công', msg: `PO: ${soPO}\nKH: ${tenKhachHangSave || maKH}` }
    if (asyncTimeout) window.clearTimeout(asyncTimeout)
    asyncTimeout = window.setTimeout(() => { asyncResult.value.show = false }, 3000)
  } catch (err: any) {
    console.error('Lỗi đẩy dữ liệu:', err)
    asyncResult.value = { show: true, type: 'error', title: 'Lưu Pipeline thất bại', msg: err.message }
  } finally {
    saving.value = false
  }
}

const props = defineProps<{
  khach: any,
  customers?: any[],
  soHopDong: string,
  maHopDong: string,
  maHopDongCu?: string,
  maHopDongGoc?: string,
  selectedItems: any[],
  ghiChuHopDong: string,
  exchangeRate: number,
  loadedData?: any,
  excelBlob?: Blob | null,
  quoteTotals?: { truoc: number, vat: number, sau: number },
  quoteTongGiaThucTe?: number,
  quoteFinancials?: {
    chietKhauTruocThue: number,
    chietKhauTruocThuePct: number,
    thueChenhLech: number,
    thueChenhLechPct: number,
    chenhLechGia: number,
    conLai: number,
    tongChietKhau: number
  }
}>()

watch(() => props.selectedItems, (newItems) => {
  if (newItems && newItems.length > 0) {
    newItems.forEach((item, idx) => {
      if (customRates.value[idx] === undefined) {
        customRates.value[idx] = Number(item.Ti_gia) || 1;
      }
    });
  }
}, { immediate: true, deep: true })

const formatNum = (v: any) => {
  if (!v) return '0'
  return parseFloat(String(v)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

const tableSections = [
  {
    name: '1. THÔNG TIN PO/HĐ',
    columns: [
      { key: 'STT_B2', label: 'STT' },
      { key: 'TEN_C2', label: 'TÊN' },
      { key: 'DO_UU_TIEN', label: 'Độ ưu tiên' },
    ]
  },
  {
    name: '2. TRẠNG THÁI ĐƠN HÀNG',
    columns: [
      { key: 'TRANG_THAI', label: 'Trạng thái đơn hàng' }
    ]
  },
  {
    name: '3. KHÁCH HÀNG NHẬN LICENSE (TIẾNG ANH)',
    vertical: true,
    span: 3,
    columns: [
      { key: 'CUS_COMPANY', label: 'Company' },
      { key: 'CUS_ADDRESS', label: 'Address' },
      { key: 'CUS_TEL', label: 'Tel' },
      { key: 'CUS_FAX', label: 'Fax' },
      { key: 'CUS_CONTACT', label: 'Contact' },
      { key: 'CUS_EMAIL', label: 'Email' },
      { key: 'CUS_MOBILE', label: 'Mobile' },
      { key: 'CUS_WEBSITE', label: 'Website' },
    ]
  },
  {
    name: '4. THÔNG TIN XUẤT HÓA ĐƠN, CHỨNG TỪ KHÁC',
    vertical: true,
    span: 3,
    columns: [
      { key: 'INV_CONG_TY', label: 'Công ty' },
      { key: 'INV_DIA_CHI', label: 'Địa chỉ' },
      { key: 'INV_MST', label: 'MST' },
      { key: 'INV_EMAIL', label: 'Email' },
      { key: 'INV_THANH_LY', label: 'Thanh lý' },
      { key: 'INV_DN_THANH_TOAN', label: 'ĐN thanh toán' },
      { key: 'INV_COCQ', label: 'CO/CQ' },
    ]
  },
  {
    name: '5. THÔNG TIN GIAO HÀNG TRIỂN KHAI',
    vertical: true,
    span: 2,
    columns: [
      { key: 'DEL_M1', label: 'Giao hàng và hóa đơn ngay khi có hàng' },
      { key: 'DEL_M2', label: 'Giao hàng và có kỹ thuật triển khai dự án' },
      { key: 'DEL_M3', label: 'Liên hệ Kinh Doanh trước khi giao hàng' }
    ]
  },
  {
    name: '6. LIÊN HỆ GIAO HÀNG',
    vertical: true,
    span: 2,
    columns: [
      { key: 'DEL_NGUOI_NHAN', label: 'Người nhận hàng' },
      { key: 'DEL_DIA_CHI', label: 'Địa chỉ' },
      { key: 'DEL_SDT', label: 'Số điện thoại' },
      { key: 'DEL_NGUOI_LIEN_HE', label: 'Người liên hệ triển khai' },
    ]
  },
  {
    name: '7. THÔNG TIN THANH TOÁN',
    vertical: true,
    span: 2,
    columns: [
      { key: 'PAY_NGAY_COC', label: 'Ngày đặt cọc' },
      { key: 'PAY_TI_LE_COC', label: 'Tỉ lệ đặt cọc (%)' },
      { key: 'PAY_CONG_NO', label: 'Công nợ (ngày)' },
      { key: 'PAY_NGAY_CO_HANG', label: 'Ngày có hàng dự kiến' },
    ]
  }
]

const brandColors: Record<string, any> = {
  'Sophos':    { bg: '#1B4F72', text: '#fff', subBg: '#D4E6F1', border: '#1B4F72', cellBg: '#EBF5FB' },
  'Kaspersky': { bg: '#1E8449', text: '#fff', subBg: '#D5F5E3', border: '#1E8449', cellBg: '#EAFAF1' },
  'Khác':      { bg: '#7D3C98', text: '#fff', subBg: '#E8DAEF', border: '#7D3C98', cellBg: '#F5EEF8' },
}
const defaultBrand = { bg: '#0f172a', text: '#fff', subBg: '#f1f5f9', border: '#94a3b8', cellBg: '#fafbfc' }

const brandColor = (name: string) => {
  if (!name) return defaultBrand
  for (const [key, val] of Object.entries(brandColors)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return val
  }
  return defaultBrand
}

const localKhach = ref({ ...props.khach })

watch(() => props.khach, (newVal) => {
  localKhach.value = { ...newVal }
}, { deep: true })

const getColWidth = (col: any) => {
  const label = col.label.toLowerCase()
  if (label === 'stt') return '3%'
  if (label.includes('mã sku')) return '6%'
  if (label.includes('tên hàng') || label.includes('tên sản phẩm')) return '18%'
  if (label.includes('nhà cung cấp')) return '6%'
  if (label === 'sl' || label.includes('số lượng')) return '3%'
  if (label.includes('list price')) return '6%'
  if (label.includes('tỉ giá')) return '5%'
  if (label.includes('đvtt') || label.includes('đơn vị')) return '4%'
  if (label.includes('mức off')) return '4%'
  if (label.includes('đơn giá')) return '5%'
  if (label.includes('thành tiền')) return '6%'
  if (label.includes('start date')) return '6%'
  if (label.includes('seri') || label.includes('serial')) return '7%'
  if (label.includes('license')) return '7%'
  if (label.includes('base code')) return '6%'
  if (label.includes('expiration')) return '6%'
  if (label.includes('ghi chú')) return '5%'
  return '6%'
}

const rec = computed<any>(() => {
  const brandMap: Record<string, boolean> = {}
  props.selectedItems.forEach(p => {
    let b = p.Ten_nha_cung_cap || 'Khác'
    brandMap[b] = true
  })
  const brands = Object.keys(brandMap)
  
  let flatCols: any[] = []
  let headerGroups: any[] = []

  let baseCols = [
    { key: 'STT', label: 'STT', brand: '' },
    { key: 'Ma_hang', label: 'MÃ SKU', brand: '' },
    { key: 'Ten_hang', label: 'TÊN HÀNG HÓA', brand: '' },
    { key: 'Nha_cung_cap', label: 'NHÀ CUNG CẤP', brand: '' },
    { key: 'So_luong', label: 'SL', brand: '' },
    { key: 'List_price', label: 'List Price', brand: '' },
    { key: 'Ti_gia_pipeline', label: 'TỈ GIÁ', brand: '' },
    { key: 'Don_vi_tien_te', label: 'ĐVTT', brand: '' },
    { key: 'Muc_off', label: 'MỨC OFF', brand: '' },
    { key: 'Don_gia', label: 'ĐƠN GIÁ', brand: '' },
    { key: 'Thanh_tien', label: 'THÀNH TIỀN', brand: '' }
  ]
  flatCols.push(...baseCols)
  
  baseCols.forEach(col => {
    headerGroups.push({ brand: '', cols: [col], standalone: true })
  })

  brands.forEach(b => {
    let bUpper = b.toUpperCase()
    let bCols: any[] = []
    
    if (bUpper === 'SOPHOS') {
      bCols = [
        { key: `${b}::Start_date`, label: 'Start date', brand: b },
        { key: `${b}::Seri`, label: 'Số Seri tbị (Serial number)', brand: b },
        { key: `${b}::License`, label: 'License ID', brand: b }
      ]
    } else if (bUpper === 'KASPERSKY') {
      bCols = [
        { key: `${b}::Base_code`, label: 'Base code', brand: b },
        { key: `${b}::Expiration`, label: 'Expiration Time', brand: b }
      ]
    } else {
      bCols = [
        { key: `${b}::Start_date`, label: 'Start date', brand: b }
      ]
    }
    
    flatCols.push(...bCols)
    headerGroups.push({ brand: b, cols: bCols, standalone: false })
  })

  let noteCol = { key: 'Ghi_chu', label: 'GHI CHÚ', brand: '' }
  flatCols.push(noteCol)
  headerGroups.push({ brand: '', cols: [noteCol], standalone: true })

  let finalProducts: any[] = []
  props.selectedItems.forEach((p, idx) => {
    let b = p.Ten_nha_cung_cap || 'Khác'
    
    // Calculate VND pre-off price
    const hardware = Number(p.gia_hardware || 0)
    const nhap = Number(p.gia_nhap || 0)
    const donGiaGoc = Number(p.Don_gia || 0)
    const basePriceOrig = hardware + nhap + donGiaGoc
    const tg = Number(p.Ti_gia || 1)
    const vndPreOffPrice = basePriceOrig * tg

    const rate = customRates.value[idx] !== undefined ? customRates.value[idx] : (Number(p.Ti_gia) || 1)
    const usdPreOffPrice = vndPreOffPrice / rate

    const isUSD = (p.Don_vi_tien_te || 'USD').toUpperCase().includes('US')
    const lpUsd = p.Don_gia || 0
    const dgUsd = lpUsd * (1 - (p.muc_phan_tram_off || 0) / 100)
    const ttUsd = dgUsd * (p.So_luong || 1)

    const lpText = isUSD ? `<div class="price-dual"><span class="price-main">${formatNum(lpUsd)}</span><span class="price-sub">(${formatNum(lpUsd * rate)} đ)</span></div>` : formatNum(lpUsd)
    const dgText = isUSD ? `<div class="price-dual"><span class="price-main">${formatNum(dgUsd)}</span><span class="price-sub">(${formatNum(dgUsd * rate)} đ)</span></div>` : formatNum(dgUsd)
    const ttText = isUSD ? `<div class="price-dual"><span class="price-main">${formatNum(ttUsd)}</span><span class="price-sub">(${formatNum(ttUsd * rate)} đ)</span></div>` : formatNum(ttUsd)

    let rowObj: any = { 
      STT: idx + 1, 
      Ma_hang: p.Ma_hang,
      Ten_hang: p.Ten_hang,
      Nha_cung_cap: b,
      So_luong: p.So_luong,
      List_price: lpText,
      Ti_gia_pipeline: rate,
      Don_vi_tien_te: `<span style="color: ${isUSD ? '#1e40af' : '#b91c1c'}; font-weight: 700;">${p.Don_vi_tien_te || 'USD'}</span>`,
      Muc_off: p.muc_phan_tram_off ? `${p.muc_phan_tram_off}%` : '',
      Don_gia: dgText,
      Thanh_tien: ttText,
      Ghi_chu: p.Ghi_chu || '',
      _brand: b
    }
    
    flatCols.filter(c => c.brand).forEach(c => {
      rowObj[c.key] = ''
    })
    
    finalProducts.push(rowObj)
  })

  return {
    STT_B2: nextPoNumber.value,
    TEN_C2: localKhach.value?.Ten_cong_ty || 'Hợp đồng mới',
    DO_UU_TIEN: '',
    TRANG_THAI: '',
    CUS_COMPANY: localKhach.value?.COMPANY || localKhach.value?.Ten_cong_ty,
    CUS_ADDRESS: localKhach.value?.ADDRESS || localKhach.value?.Dia_chi_cong_ty,
    CUS_TEL: localKhach.value?.TEL || localKhach.value?.So_dien_thoai_cong_ty,
    CUS_FAX: localKhach.value?.So_fax_cong_ty,
    CUS_CONTACT: localKhach.value?.Ten_khach_hang_phu || localKhach.value?.Ten_khach_hang,
    CUS_EMAIL: localKhach.value?.Email_ca_nhan_phu || localKhach.value?.Email_ca_nhan || localKhach.value?.Email_cong_ty,
    CUS_MOBILE: localKhach.value?.So_dien_thoai_ca_nhan_phu || localKhach.value?.So_dien_thoai_ca_nhan,
    CUS_WEBSITE: localKhach.value?.Website_cong_ty,
    INV_CONG_TY: localKhach.value?.Ten_cong_ty,
    INV_DIA_CHI: localKhach.value?.Dia_chi_cong_ty,
    INV_MST: localKhach.value?.MST || '',
    INV_EMAIL: localKhach.value?.Email_cong_ty,
    INV_THANH_LY: '', INV_DN_THANH_TOAN: '', INV_COCQ: '',
    DEL_M1: '', DEL_M2: '', DEL_M3: '',
    DEL_NGUOI_NHAN: '', DEL_DIA_CHI: '', DEL_SDT: '', DEL_NGUOI_LIEN_HE: '',
    PAY_NGAY_COC: '', PAY_TI_LE_COC: '', PAY_CONG_NO: '', PAY_NGAY_CO_HANG: '',
    ghiChu: props.ghiChuHopDong,
    products: finalProducts,
    flatCols,
    headerGroups
  }
})

const dealRegs = computed(() => {
  if (!rec.value.products || !rec.value.products.length) return []
  let brandMap: Record<string, any[]> = {}
  props.selectedItems.forEach((p, idx) => {
    let b = p.Ten_nha_cung_cap || 'Khác'
    if (!brandMap[b]) brandMap[b] = []
    brandMap[b].push({ p, idx })
  })
  return Object.entries(brandMap).map(([brand, wrapperList]) => {
    let items = wrapperList.map(({ p, idx }) => {
      const hardware = Number(p.gia_hardware || 0)
      const nhap = Number(p.gia_nhap || 0)
      const donGiaGoc = Number(p.Don_gia || 0)
      const basePriceOrig = hardware + nhap + donGiaGoc
      const tg = Number(p.Ti_gia || 1)
      const vndPreOffPrice = basePriceOrig * tg
      
      const rate = customRates.value[idx] !== undefined ? customRates.value[idx] : (Number(p.Ti_gia) || 1)
      const usdPreOffPrice = vndPreOffPrice / rate
      const usdPostOffTotal = usdPreOffPrice * (1 - (p.muc_phan_tram_off || 0) / 100) * (p.So_luong || 1)

      return {
        name: p.Ten_hang,
        sku: p.Ma_hang,
        qty: p.So_luong,
        value: usdPostOffTotal
      }
    })
    let total = items.reduce((s, i) => s + i.value, 0)
    return { brand, items, total }
  })
})
</script>

<style scoped>
.pipeline-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  z-index: 999999;
  display: flex; align-items: center; justify-content: center;
}
.pipeline-modal-content {
  position: relative;
  width: 98vw;
  max-width: 1800px;
  max-height: 96vh;
  display: flex;
  flex-direction: column;
}
.modal-body-scroll {
  overflow-y: auto;
  padding: 20px;
  flex: 1;
  background-color: var(--surface-light, #f8fafc);
}

/* ═══ PIPELINE STEP INDICATOR ═══ */
.pipeline-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: 24px 40px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.pipeline-step {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 10px 20px;
  border-radius: 24px;
  transition: all 0.3s ease;
}
.pipeline-step:hover {
  background: rgba(255,255,255,0.06);
}
.step-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 18px;
  border: 2.5px solid #475569;
  color: #94a3b8;
  background: transparent;
  transition: all 0.3s ease;
  flex-shrink: 0;
}
.pipeline-step.active .step-circle {
  border-color: #10b981;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  box-shadow: 0 0 20px rgba(16,185,129,0.4), 0 0 40px rgba(16,185,129,0.15);
  transform: scale(1.1);
}
.pipeline-step.done .step-circle {
  border-color: #10b981;
  background: rgba(16,185,129,0.15);
  color: #34d399;
}
.step-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.step-label {
  font-size: 15px;
  font-weight: 700;
  color: #64748b;
  white-space: nowrap;
  transition: color 0.3s;
}
.step-sub {
  font-size: 11px;
  color: #475569;
  white-space: nowrap;
  transition: color 0.3s;
}
.pipeline-step.active .step-label {
  color: #f0fdf4;
}
.pipeline-step.active .step-sub {
  color: #86efac;
}
.pipeline-step.done .step-label {
  color: #34d399;
}
.pipeline-step.done .step-sub {
  color: #065f46;
}
.step-connector {
  width: 80px;
  height: 3px;
  background: #334155;
  flex-shrink: 0;
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}
.step-connector-fill {
  position: absolute;
  top: 0; left: 0; bottom: 0;
  width: 0;
  background: linear-gradient(90deg, #10b981, #34d399);
  border-radius: 2px;
  transition: width 0.5s cubic-bezier(0.4,0,0.2,1);
}
.step-connector.done .step-connector-fill {
  width: 100%;
}

/* ═══ SLIDE TRANSITIONS ═══ */
.slide-panel {
  min-height: 200px;
}

/* Slide right (going forward) */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-right-enter-from {
  opacity: 0;
  transform: translateX(60px);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(-60px);
}

/* Slide left (going backward) */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-left-enter-from {
  opacity: 0;
  transform: translateX(-60px);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(60px);
}

/* ═══ SLIDE BACK BUTTON ═══ */
.slide-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  margin-bottom: 16px;
  border: 1px solid rgba(148,163,184,0.25);
  border-radius: 10px;
  background: rgba(255,255,255,0.04);
  color: #94a3b8;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  letter-spacing: 0.2px;
}
.slide-back-btn:hover {
  background: rgba(16,185,129,0.08);
  color: #34d399;
  border-color: rgba(16,185,129,0.3);
  transform: translateX(-3px);
}

/* ═══ SIDE ARROW BUTTONS ═══ */
.side-arrow {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1001;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 20px rgba(239,68,68,0.4), 0 0 0 1px rgba(255,255,255,0.1);
}
.side-arrow-left {
  left: 28px;
}
.side-arrow-right {
  right: 28px;
}
.side-arrow:hover {
  background: linear-gradient(135deg, #f87171, #ef4444);
  color: #fff;
  box-shadow: 0 4px 28px rgba(239,68,68,0.6), 0 0 0 1px rgba(255,255,255,0.15);
  transform: translateY(-50%) scale(1.15);
}

/* ═══ PIPELINE BOTTOM SAVE BAR ═══ */
.pipeline-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 28px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  border-top: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}
.nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.25s ease;
  letter-spacing: 0.3px;
}
.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}
.nav-save {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  box-shadow: 0 2px 12px rgba(16,185,129,0.3);
  padding: 14px 36px;
  font-size: 15px;
}
.nav-save:not(:disabled):hover {
  box-shadow: 0 4px 24px rgba(16,185,129,0.5);
  transform: translateY(-2px);
}
.nav-info {
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 2px;
}

.file-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);
  border-radius: 12px 12px 0 0;
  color: white;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.btn-save {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-save:hover:not(:disabled) { background-color: #2563eb; }
.btn-save:disabled { background-color: #10b981; cursor: not-allowed; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

.sections-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-top: none;
  border-radius: 0 0 12px 12px;
  overflow: hidden;
}

.section-card {
  grid-column: span 3;
  border-right: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}

.section-card-title {
  padding: 8px 14px;
  font-weight: 700;
  color: #334155;
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.section-card-body {
  padding: 10px 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
}

.section-vertical .section-card-body {
  flex-direction: column;
  gap: 6px;
}

.data-item {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 6px;
  min-width: 120px;
}

.data-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 600;
  letter-spacing: 0.04em;
  white-space: nowrap;
  flex-shrink: 0;
}

.data-value {
  font-size: 0.88rem;
  color: #0f172a;
  font-weight: 500;
  white-space: pre-wrap;
  word-break: break-word;
}

/* ===== Product Detail Card ===== */
.product-card {
  margin-top: 20px;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04);
  border: 1px solid #e2e8f0;
}

.product-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);
  font-weight: 700;
  font-size: 0.92rem;
  color: white;
  letter-spacing: 0.02em;
}

.rate-input {
  width: 100%;
  text-align: right;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.88rem;
  font-weight: 600;
  color: #0284c7;
  padding: 3px 6px;
  outline: none;
  transition: all 0.2s;
}
.rate-input:hover {
  background: rgba(255, 255, 255, 0.7);
  border-color: #e2e8f0;
}
.rate-input:focus {
  background: white;
  border-color: #93c5fd;
  box-shadow: 0 0 0 2px rgba(147, 197, 253, 0.2);
}

.pipeline-input {
  width: 100%;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.9rem;
  color: #0f172a;
  padding: 2px 4px;
  outline: none;
  transition: all 0.2s;
}
.pipeline-editable {
  display: inline-block;
  min-width: 50px;
  min-height: 1.2em;
  width: 100%;
  border-bottom: 1px dashed transparent;
  outline: none;
  transition: all 0.2s;
  cursor: text;
  word-break: break-word;
}
.pipeline-editable:hover {
  border-bottom: 1px dashed #94a3b8;
}
.pipeline-editable:focus {
  border-bottom: 1px solid #3b82f6;
  background: rgba(255, 255, 255, 0.5);
}
.pipeline-editable[data-placeholder]:empty:before {
  content: attr(data-placeholder);
  color: #94a3b8;
  pointer-events: none;
}

.product-badge {
  margin-left: auto;
  background: rgba(16, 185, 129, 0.9);
  color: white;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 12px;
  border-radius: 99px;
  letter-spacing: 0.02em;
}

.product-table-wrapper {
  overflow-x: auto;
}

.product-table-wrapper::-webkit-scrollbar {
  height: 5px;
}

.product-table-wrapper::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.product-table-wrapper::-webkit-scrollbar-thumb {
  background-color: #94a3b8;
  border-radius: 3px;
}

.product-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.78rem;
  table-layout: fixed;
}

.product-table th,
.product-table td {
  padding: 8px 10px;
  border: 1px solid #dce3eb;
  text-align: left;
  vertical-align: top;
  white-space: normal;
  word-break: break-word;
  overflow: hidden;
}

/* Brand group header (Sophos, Kaspersky, Khác) */
.th-brand {
  font-weight: 700;
  font-size: 0.82rem;
  text-align: center;
  letter-spacing: 0.05em;
  padding: 9px 12px;
  border-left: 2px solid rgba(255,255,255,0.3);
  text-transform: uppercase;
}

/* Standalone base column header (STT, Mã SKU, etc.) */
.th-base {
  background: linear-gradient(180deg, #1e3a5f 0%, #0f172a 100%);
  font-weight: 600;
  color: #cbd5e1;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  vertical-align: middle;
  padding: 9px 10px;
  border-color: #334155;
}

/* Sub-column header under brand */
.th-sub {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.72rem;
  border-bottom: 2.5px solid;
  text-align: center;
  padding: 7px 8px;
  letter-spacing: 0.02em;
}

.product-table tbody tr {
  transition: background-color 0.15s ease;
}

.product-table tbody tr:hover {
  background-color: #f1f5f9 !important;
}

.product-table tbody tr:nth-child(even) {
  background-color: #f8fafc;
}

/* Cell type styles */
.product-table td.col-stt {
  text-align: center;
  color: #475569;
  font-weight: 700;
  font-size: 0.82rem;
}

.product-table td.col-name {
  white-space: normal;
  word-break: break-word;
  line-height: 1.45;
  color: #0f172a;
  font-size: 0.77rem;
}

.product-table td.col-number {
  text-align: center;
  font-variant-numeric: tabular-nums;
  color: #0f172a;
  font-weight: 700;
  white-space: nowrap;
}

:deep(.price-dual) {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.2;
}
:deep(.price-main) {
  font-weight: 700;
  color: #0f172a;
}
:deep(.price-sub) {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
  margin-top: 2px;
}

.product-table td {
  color: #334155;
  font-size: 0.77rem;
  line-height: 1.4;
}

.product-note {
  padding: 14px 20px;
  background: #fffbeb;
  border-top: 2px solid #fde68a;
  color: #92400e;
  font-size: 0.82rem;
  line-height: 1.5;
}

.product-note strong {
  color: #78350f;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.product-note p {
  margin: 6px 0 0;
  white-space: pre-wrap;
}

/* ===== Deal Registration Cards ===== */
.dealreg-grid {
  display: flex;
  gap: 16px;
  margin-top: 16px;
  align-items: start;
}

.dealreg-card {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.dr-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11pt;
  font-family: 'Calibri', 'Segoe UI', sans-serif;
  border: 1.5px solid #2F5496;
}

.dr-table td {
  border: 1px solid #2F5496;
  padding: 4px 8px;
  vertical-align: top;
  line-height: 1.4;
  font-size: 10pt;
}

/* Section title rows — FBE4D5 bg, bold, black text */
.dr-title-row td {
  background: #FBE4D5;
  text-align: left;
  padding: 5px 8px;
  color: #000;
  font-size: 11pt;
}

/* Label cells — EDEDED bg, #2E74B5 blue text (default) */
.dr-table .dr-label {
  background: #EDEDED;
  font-weight: 400;
  color: #2E74B5;
  width: 20%;
  white-space: normal;
  font-size: 10pt;
}

/* Label cyan #00B0F0 — End user Company Name */
.dr-table .dr-label-cyan {
  background: #EDEDED;
  font-weight: 400;
  color: #00B0F0;
  width: 20%;
  white-space: normal;
  font-size: 10pt;
}

/* Label navy #2F5496 — End User Phone, End User Website */
.dr-table .dr-label-navy {
  background: #EDEDED;
  font-weight: 400;
  color: #2F5496;
  width: 20%;
  white-space: normal;
  font-size: 10pt;
}

/* Label blue italic #2E74B5 — End User Name, Account Manager Name */
.dr-table .dr-label-blue-italic {
  background: #EDEDED;
  font-weight: 400;
  color: #2E74B5;
  font-style: italic;
  width: 20%;
  white-space: normal;
  font-size: 10pt;
}

/* Label italic #0070C0 — Company Size, Estimated Closure Date */
.dr-table .dr-label-italic {
  background: #EDEDED;
  font-weight: 400;
  color: #0070C0;
  font-style: italic;
  width: 20%;
  white-space: normal;
  font-size: 10pt;
}

/* Label red #FF0000 — Company Name VN, Account Manager Phone */
.dr-table .dr-label-red {
  background: #EDEDED;
  font-weight: 400;
  color: #FF0000;
  width: 20%;
  white-space: normal;
  font-size: 10pt;
}

/* Label black/auto — Existing Customer, Estimated Budget, Competition, POC Schedule */
.dr-table .dr-label-black {
  background: #EDEDED;
  font-weight: 400;
  color: #000;
  width: 20%;
  white-space: normal;
  font-size: 10pt;
}

/* Value cells — white bg, black text, NOT bold */
.dr-table .dr-value {
  color: #000;
  font-weight: 400;
  width: 30%;
  word-break: break-word;
  background: #fff;
  font-size: 10pt;
}

/* Remarks */
.dr-remarks {
  min-height: 24px;
  background: #fff;
}

/* BOM header row — FBE4D5 bg, NOT bold, black text */
.bom-header-row td {
  background: #FBE4D5;
  font-size: 10pt;
  color: #000;
  font-weight: 400;
}

.bom-qty {
  text-align: center;
}

.bom-val {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.dr-table small {
  color: #000;
  font-size: 9pt;
}

/* TOTAL row — white bg, bold text */
.bom-total-row td {
  background: #fff;
  border-top: 1.5px solid #2F5496;
  font-weight: 700;
}

/* ═══ ASYNC RESULT MODAL — VIP ═══ */
.async-overlay { position: fixed; inset: 0; z-index: 9999999; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.6); backdrop-filter: blur(12px) saturate(1.2); }
.async-card { background: linear-gradient(160deg, rgba(30,41,59,0.95), rgba(15,23,42,0.98)); border: 1px solid rgba(255,255,255,0.06); border-radius: 24px; padding: 48px 56px 40px; text-align: center; min-width: 340px; max-width: 440px; box-shadow: 0 32px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06); position: relative; overflow: hidden; }
.async-card::before { content: ''; position: absolute; top: -2px; left: -2px; right: -2px; bottom: -2px; border-radius: 26px; background: conic-gradient(from 0deg, transparent 0%, rgba(56,189,248,0.3) 25%, transparent 50%, rgba(16,185,129,0.3) 75%, transparent 100%); z-index: -1; animation: async-border-spin 4s linear infinite; opacity: 0.5; }
@keyframes async-border-spin { to { transform: rotate(360deg); } }
.async-title { font-size: 20px; font-weight: 800; color: #f8fafc; margin-top: 20px; letter-spacing: 0.4px; line-height: 1.4; }
.async-subtitle { font-size: 13.5px; color: #94a3b8; margin-top: 10px; line-height: 1.6; white-space: pre-line; }
.async-spinner-wrap { display: flex; justify-content: center; position: relative; width: 80px; height: 80px; margin: 0 auto; }
.async-spinner { width: 80px; height: 80px; animation: async-spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite; filter: drop-shadow(0 0 8px rgba(56,189,248,0.4)); position: relative; z-index: 2; }
.async-spinner circle { stroke: #38bdf8; stroke-dasharray: 80, 200; stroke-dashoffset: 0; animation: async-dash 1.5s ease-in-out infinite; }
@keyframes async-spin { to { transform: rotate(360deg); } }
@keyframes async-dash { 0% { stroke-dasharray: 1, 200; stroke-dashoffset: 0; } 50% { stroke-dasharray: 80, 200; stroke-dashoffset: -30; } 100% { stroke-dasharray: 80, 200; stroke-dashoffset: -120; } }
.async-spinner-wrap::before, .async-spinner-wrap::after { content: ''; position: absolute; width: 8px; height: 8px; border-radius: 50%; top: 50%; left: 50%; margin: -4px 0 0 -4px; }
.async-spinner-wrap::before { background: #38bdf8; box-shadow: 0 0 12px rgba(56,189,248,0.6); animation: async-orbit 2s linear infinite; }
.async-spinner-wrap::after { background: #a78bfa; box-shadow: 0 0 12px rgba(167,139,250,0.6); animation: async-orbit 2s linear infinite reverse; animation-delay: -1s; }
@keyframes async-orbit { 0% { transform: rotate(0deg) translateX(44px) rotate(0deg) scale(1); } 50% { transform: rotate(180deg) translateX(44px) rotate(-180deg) scale(0.6); } 100% { transform: rotate(360deg) translateX(44px) rotate(-360deg) scale(1); } }
.async-icon-wrap { display: flex; justify-content: center; position: relative; width: 80px; height: 80px; margin: 0 auto; }
.async-checkmark { width: 80px; height: 80px; position: relative; z-index: 2; }
.async-checkmark circle { stroke: #10b981; stroke-width: 2.5; stroke-dasharray: 166; stroke-dashoffset: 166; animation: async-circle-draw 0.7s cubic-bezier(0.65, 0, 0.45, 1) forwards; filter: drop-shadow(0 0 6px rgba(16,185,129,0.5)); }
.async-checkmark path { stroke: #34d399; stroke-width: 3.5; stroke-dasharray: 48; stroke-dashoffset: 48; animation: async-check-draw 0.5s 0.5s cubic-bezier(0.65, 0, 0.45, 1) forwards; filter: drop-shadow(0 0 4px rgba(52,211,153,0.6)); }
@keyframes async-circle-draw { to { stroke-dashoffset: 0; } }
@keyframes async-check-draw { to { stroke-dashoffset: 0; } }
.async-icon-success { animation: async-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.async-icon-success::before { content: ''; position: absolute; inset: -12px; border-radius: 50%; border: 2px solid rgba(16,185,129,0.3); animation: async-ring-burst 0.8s 0.3s ease-out forwards; opacity: 0; }
.async-icon-success::after { content: ''; position: absolute; inset: -24px; border-radius: 50%; border: 1px solid rgba(16,185,129,0.15); animation: async-ring-burst 1s 0.5s ease-out forwards; opacity: 0; }
@keyframes async-ring-burst { 0% { transform: scale(0.5); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }
.async-xmark { width: 80px; height: 80px; position: relative; z-index: 2; }
.async-xmark circle { stroke: #ef4444; stroke-width: 2.5; stroke-dasharray: 166; stroke-dashoffset: 166; animation: async-circle-draw 0.7s cubic-bezier(0.65, 0, 0.45, 1) forwards; filter: drop-shadow(0 0 6px rgba(239,68,68,0.5)); }
.async-xmark path { stroke: #f87171; stroke-width: 3.5; stroke-dasharray: 56; stroke-dashoffset: 56; animation: async-check-draw 0.4s 0.5s cubic-bezier(0.65, 0, 0.45, 1) forwards; filter: drop-shadow(0 0 4px rgba(248,113,113,0.6)); }
.async-icon-error { animation: async-shake-vip 0.6s 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97); }
.async-icon-error::before { content: ''; position: absolute; inset: -8px; border-radius: 50%; background: radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%); animation: async-error-pulse 1.5s 0.5s ease-in-out infinite; }
@keyframes async-shake-vip { 0%, 100% { transform: translateX(0) rotate(0deg); } 15% { transform: translateX(-10px) rotate(-2deg); } 30% { transform: translateX(10px) rotate(2deg); } 45% { transform: translateX(-7px) rotate(-1deg); } 60% { transform: translateX(7px) rotate(1deg); } 75% { transform: translateX(-3px); } 90% { transform: translateX(3px); } }
@keyframes async-error-pulse { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.15); } }
@keyframes async-pop { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.15); } 70% { transform: scale(0.95); } 100% { transform: scale(1); opacity: 1; } }
.async-close-btn { margin-top: 24px; padding: 12px 36px; border-radius: 12px; background: linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.08)); border: 1px solid rgba(239,68,68,0.25); color: #f87171; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); letter-spacing: 0.3px; }
.async-close-btn:hover { background: linear-gradient(135deg, rgba(239,68,68,0.25), rgba(239,68,68,0.15)); transform: translateY(-2px); box-shadow: 0 4px 16px rgba(239,68,68,0.2); }
.async-modal-enter-active { animation: async-modal-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.async-modal-leave-active { animation: async-modal-out 0.25s cubic-bezier(0.4, 0, 1, 1); }
@keyframes async-modal-in { 0% { opacity: 0; transform: scale(0.7) translateY(20px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
@keyframes async-modal-out { 0% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(0.85) translateY(10px); } }

.pipeline-close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  background-color: #ef4444;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.pipeline-close-btn:hover {
  background-color: #dc2626;
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}
</style>
