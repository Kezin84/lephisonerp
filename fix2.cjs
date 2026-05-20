const fs = require('fs');
let c = fs.readFileSync('src/components/BaoGia.vue', 'utf8');
const p1 = '<!-- ================== MODAL: LOAD THÔNG TIN ================== -->';
const p2 = '<!-- ================== MODAL: CARD DETAIL (FULL FIELDS) ================== -->';
const start = c.indexOf(p1);
const end = c.indexOf(p2);

if (start > -1 && end > -1) {
  const replacement = `<!-- ================== MODAL: LOAD THÔNG TIN ================== -->
    <div v-if="showLoadInfoModal" class="modal" @click.self="showLoadInfoModal = false">
      <div class="modal-card" style="max-width: 320px;">
        <div class="modal-head">
          <h3><i class="lucide-download"></i> Chọn loại load dữ liệu</h3>
          <button class="icon-btn" @click="showLoadInfoModal = false">&times;</button>
        </div>
        <div class="modal-body" style="display: flex; flex-direction: column; gap: 12px; padding: 20px;">
          <button class="util-btn" @click="showLoadInfoModal = false; openLoadInvoiceModal()" style="padding: 10px !important; font-size: 13px !important; width: 100%; justify-content: center; min-height: 40px;">
            <i class="lucide-file-text" style="margin-right: 8px;"></i> Load hóa đơn
          </button>
          <button class="util-btn" @click="showLoadInfoModal = false; openLoadPipelineModal()" style="padding: 10px !important; font-size: 13px !important; width: 100%; justify-content: center; min-height: 40px;">
            <i class="lucide-folder-input" style="margin-right: 8px;"></i> Load Pipeline
          </button>
        </div>
      </div>
    </div>

    <!-- ================== MODAL: NHẬP TAY (FULL FIELDS) ================== -->
    <div v-if="showManualModal" class="modal" @click.self="showManualModal = false">
      <div class="modal-card modal-wide">
        <div class="modal-head">
          <h3><i class="lucide-plus-circle"></i> Nhập tay hàng</h3>
          <button class="x" @click="showManualModal = false">✕</button>
        </div>

        <div class="modal-group">
          <!-- Hidden inputs for reactivity -->
          <div v-if="false">
            <input v-model="itemForm.Ma_hang" />
            <input v-model="itemForm.Ma_nha_cung_cap" />
            <input v-model="itemForm.Trang_thai" />
            <input v-model="itemForm.Main_img" />
            <textarea v-model="itemForm.Mo_ta_chung" />
            <textarea v-model="itemForm.Mo_ta_chi_tiet" />
            <input v-model="itemForm.License_duration" />
            <input v-model="itemForm.Ma_hang_lien_ket" />
            <input v-model="itemForm.Ten_hang_lien_ket" />
            <FormattedInput :modelValue="itemForm.Gia_tieu_chuan" @update:modelValue="itemForm.Gia_tieu_chuan = $event" />
            <textarea v-model="itemForm.Ghi_chu" />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
            <!-- COLUMN 1 -->
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <h4 class="modal-group-title" style="margin-bottom: 0;"><i class="lucide-info"></i> Thông tin chung</h4>
              <div>
                <label>Tên hàng</label>
                <input v-model="itemForm.Ten_hang" list="dl-hh-ten" placeholder="Tên hàng" @input="updateMaHang" @blur="autoFillProduct(itemForm.Ten_hang)" />
                <datalist id="dl-hh-ten">
                  <option v-for="p in products" :key="p.Ma_hang + '_t'" :value="p.Ten_hang" />
                </datalist>
                <datalist id="dl-hh-ma">
                  <option v-for="p in products" :key="p.Ma_hang" :value="p.Ma_hang" />
                </datalist>
              </div>
              <div>
                <label>Danh mục</label>
                <input v-model="itemForm.Danh_muc" placeholder="Danh mục" @input="updateMaHang" />
              </div>
              <div>
                <label>ĐVT</label>
                <input v-model="itemForm.DVT" placeholder="ĐVT" />
              </div>
              <div>
                <label>Tên NCC</label>
                <input v-model="itemForm.Ten_nha_cung_cap" placeholder="Tên nhà cung cấp" @input="updateMaNcc" />
              </div>
              <div>
                <label>Features</label>
                <textarea v-model="itemForm.Features" rows="3" placeholder="Đặc tính kỹ thuật..." />
              </div>
            </div>

            <!-- COLUMN 2 -->
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <h4 class="modal-group-title" style="margin-bottom: 0;"><i class="lucide-dollar-sign"></i> Tài chính & Giá cả</h4>
              <div>
                <label>ĐƠN GIÁ (VND)</label>
                <FormattedInput :modelValue="(itemForm.Don_gia || 0) * (Number(itemForm.Ti_gia) || 1)" @update:modelValue="itemForm.Don_gia = $event / (Number(itemForm.Ti_gia) || 1)" placeholder="ĐƠN GIÁ (VND)" />
                <div v-if="itemForm.Don_vi_tien_te && itemForm.Don_vi_tien_te.toUpperCase() !== 'VND' && itemForm.Ti_gia > 1" style="font-size: 11px; color: #64748b; margin-top: 4px;">
                  ≈ {{ Number(itemForm.Don_gia || 0).toLocaleString('vi-VN') }} {{ itemForm.Don_vi_tien_te }}
                </div>
              </div>
              <div>
                <label>Giá Nhập (VND)</label>
                <FormattedInput :modelValue="(itemForm.gia_nhap || 0) * (Number(itemForm.Ti_gia) || 1)" @update:modelValue="itemForm.gia_nhap = $event / (Number(itemForm.Ti_gia) || 1)" placeholder="0" />
                <div v-if="itemForm.Don_vi_tien_te && itemForm.Don_vi_tien_te.toUpperCase() !== 'VND' && itemForm.Ti_gia > 1" style="font-size: 11px; color: #64748b; margin-top: 4px;">
                  ≈ {{ Number(itemForm.gia_nhap || 0).toLocaleString('vi-VN') }} {{ itemForm.Don_vi_tien_te }}
                </div>
              </div>
              <div>
                <label>Thuế VAT (%)</label>
                <FormattedInput v-model="itemForm.Thue_VAT" placeholder="VAT" />
              </div>
              <div>
                <label>Mức % Off</label>
                <FormattedInput v-model="itemForm.muc_phan_tram_off" placeholder="0" />
              </div>
            </div>
          </div>

          <!-- BOTTOM SECTION -->
          <div style="margin-top: 24px; padding-top: 20px; border-top: 1px dashed rgba(255,255,255,0.1);">
            <div class="grid3">
              <div>
                <label>Số lượng</label>
                <div style="display: flex; align-items: stretch; gap: 8px;">
                  <button class="util-btn small" style="width: 40px; justify-content: center;" @click="itemForm.So_luong = Math.max(1, toNum(itemForm.So_luong, 1) - 1)">-</button>
                  <FormattedInput v-model="itemForm.So_luong" placeholder="SL" style="text-align: center; flex: 1;" />
                  <button class="util-btn small" style="width: 40px; justify-content: center;" @click="itemForm.So_luong = toNum(itemForm.So_luong, 1) + 1">+</button>
                </div>
              </div>
              <div>
                <label>Đơn vị tiền tệ</label>
                <input v-model="itemForm.Don_vi_tien_te" placeholder="VND/USD/..." />
              </div>
              <div>
                <label>Tỉ giá</label>
                <FormattedInput v-model="itemForm.Ti_gia" placeholder="Tỉ giá" />
              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="primary" @click="addItem(itemForm)">Thêm vào báo giá</button>
          <button @click="resetItem">Reset</button>
          <button @click="showManualModal = false">Đóng</button>
        </div>
      </div>
    </div>\n\n    `;
  fs.writeFileSync('src/components/BaoGia.vue', c.slice(0, start) + replacement + c.slice(end));
  console.log('Fixed file');
} else {
  console.log('Bounds not found:', start, end);
}
