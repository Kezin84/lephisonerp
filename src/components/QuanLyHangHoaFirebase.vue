<template>
  <div class="quan-ly-hang-hoa">
    <div class="page-header">
      <h1 class="page-title">Quản lý Hàng Hóa</h1>
      <div class="actions">
        <!-- CỤM IMPORT SOPHOS: NÚT IMPORT + NÚT MẪU + FILE ĐÃ UP -->
        <div class="vendor-import-group vendor-import-group--sophos">
          <label class="btn btn-outline" style="cursor: pointer; border-color: #3b82f6; color: #3b82f6;" title="Import từ file_trung_gian_SOPHOS.xlsx hoặc sophos-pricelist-reseller_SKU_list.xlsb">
            <input type="file" accept=".xlsx,.xlsb" style="display:none" @change="handleFileUpload" />
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            Import Sophos
          </label>
          <a href="/template_excel/file_trung_gian_SOPHOS.xlsx" download="file_trung_gian_SOPHOS.xlsx" class="btn btn-outline vendor-template-btn" style="border-color: rgba(59,130,246,0.45); color: #93c5fd;" title="Tải file mẫu Sophos (file_trung_gian_SOPHOS.xlsx)">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Mẫu Sophos
          </a>
          <div class="vendor-uploaded-file-box">
            <template v-if="getVendorImportFileMeta('sophos')">
              <div class="vendor-uploaded-file-box__row">
                <span class="vendor-uploaded-file-box__line" :title="`Click mở ViewOffice: ${getVendorImportFileMeta('sophos').name}`">
                  File đã up:
                  <a
                    :href="getVendorOfficeViewUrl(getVendorImportFileMeta('sophos'))"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="vendor-uploaded-file-box__link"
                    style="color: #60a5fa;"
                    @click="handleOpenVendorOfficeView($event, 'sophos', 'import', getVendorImportFileMeta('sophos'))"
                  >
                    {{ getVendorImportFileMeta('sophos').name }}
                  </a>
                </span>
                <button
                  type="button"
                  class="vendor-file-download-btn"
                  title="Tải file đã up về máy"
                  @click.stop.prevent="handleDownloadVendorUploadedFile('sophos', 'import', getVendorImportFileMeta('sophos'))"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  <span>Tải về</span>
                </button>
              </div>
              <span class="vendor-uploaded-file-box__time">
                Thời gian: {{ formatRefTimestamp(getVendorImportFileMeta('sophos').updatedAt) }}
              </span>
            </template>
            <span v-else class="vendor-uploaded-file-box__empty">File đã up: Chưa có</span>
          </div>
          <button
            type="button"
            class="btn btn-outline"
            style="border-color: rgba(245, 158, 11, 0.5); color: #fbbf24; background: rgba(245, 158, 11, 0.08); font-size: 12.5px; padding: 6px 10px;"
            @click="openSophosStandardizedReimportModal('bom')"
            title="Xóa dữ liệu Sophos cũ và nạp lại theo chuẩn Mã hàng = SKU, tách Volume (range users), License (months) và Trạng thái (New/Renewal) từ SKU_List"
          >
            🔄 Chuẩn hóa DB Sophos (SKU)
          </button>
        </div>

        <!-- CỤM IMPORT KASPERSKY: NÚT IMPORT + NÚT MẪU + FILE ĐÃ UP -->
        <div class="vendor-import-group vendor-import-group--kas">
          <label class="btn btn-outline" style="border-color: rgba(56, 189, 248, 0.4); color: #38bdf8; cursor: pointer;">
            <input type="file" accept=".xlsx,.xls" style="display:none" @change="handleKasperskyUpload" />
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            Import Kaspersky
          </label>
          <a href="/template_excel/KASPERSKY_file_mau_import.xlsx" download="KASPERSKY_file_mau_import.xlsx" class="btn btn-outline vendor-template-btn" style="border-color: rgba(16,185,129,0.45); color: #6ee7b7;" title="Tải file mẫu Kaspersky (KASPERSKY_file_mau_import.xlsx)">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Mẫu Kaspersky
          </a>
          <div class="vendor-uploaded-file-box">
            <template v-if="getVendorImportFileMeta('kaspersky')">
              <div class="vendor-uploaded-file-box__row">
                <span class="vendor-uploaded-file-box__line" :title="`Click mở ViewOffice: ${getVendorImportFileMeta('kaspersky').name}`">
                  File đã up:
                  <a
                    :href="getVendorOfficeViewUrl(getVendorImportFileMeta('kaspersky'))"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="vendor-uploaded-file-box__link"
                    style="color: #38bdf8;"
                    @click="handleOpenVendorOfficeView($event, 'kaspersky', 'import', getVendorImportFileMeta('kaspersky'))"
                  >
                    {{ getVendorImportFileMeta('kaspersky').name }}
                  </a>
                </span>
                <button
                  type="button"
                  class="vendor-file-download-btn"
                  title="Tải file đã up về máy"
                  @click.stop.prevent="handleDownloadVendorUploadedFile('kaspersky', 'import', getVendorImportFileMeta('kaspersky'))"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  <span>Tải về</span>
                </button>
              </div>
              <span class="vendor-uploaded-file-box__time">
                Thời gian: {{ formatRefTimestamp(getVendorImportFileMeta('kaspersky').updatedAt) }}
              </span>
            </template>
            <span v-else class="vendor-uploaded-file-box__empty">File đã up: Chưa có</span>
          </div>
        </div>

        <!-- CỤM IMPORT ACRONIS: NÚT IMPORT + NÚT MẪU + FILE ĐÃ UP -->
        <div class="vendor-import-group vendor-import-group--acronis">
          <label class="btn btn-outline" style="border-color: rgba(99, 102, 241, 0.5); color: #818cf8; cursor: pointer;">
            <input type="file" accept=".xlsx,.xls" style="display:none" @change="handleAcronisUpload" />
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            Import Acronis
          </label>
          <a href="/template_excel/ACRONIS_file_mau_import.xlsx" download="ACRONIS_file_mau_import.xlsx" class="btn btn-outline vendor-template-btn" style="border-color: rgba(99,102,241,0.45); color: #a5b4fc;" title="Tải file mẫu Acronis (ACRONIS_file_mau_import.xlsx)">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Mẫu Acronis
          </a>
          <div class="vendor-uploaded-file-box">
            <template v-if="getVendorImportFileMeta('acronis')">
              <div class="vendor-uploaded-file-box__row">
                <span class="vendor-uploaded-file-box__line" :title="`Click mở ViewOffice: ${getVendorImportFileMeta('acronis').name}`">
                  File đã up:
                  <a
                    :href="getVendorOfficeViewUrl(getVendorImportFileMeta('acronis'))"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="vendor-uploaded-file-box__link"
                    style="color: #a5b4fc;"
                    @click="handleOpenVendorOfficeView($event, 'acronis', 'import', getVendorImportFileMeta('acronis'))"
                  >
                    {{ getVendorImportFileMeta('acronis').name }}
                  </a>
                </span>
                <button
                  type="button"
                  class="vendor-file-download-btn"
                  title="Tải file đã up về máy"
                  @click.stop.prevent="handleDownloadVendorUploadedFile('acronis', 'import', getVendorImportFileMeta('acronis'))"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  <span>Tải về</span>
                </button>
              </div>
              <span class="vendor-uploaded-file-box__time">
                Thời gian: {{ formatRefTimestamp(getVendorImportFileMeta('acronis').updatedAt) }}
              </span>
            </template>
            <span v-else class="vendor-uploaded-file-box__empty">File đã up: Chưa có</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <label class="btn btn-outline" style="border-color: rgba(167, 139, 250, 0.4); color: #a78bfa; cursor: pointer;">
            <input type="file" accept="image/*,.pdf" style="display:none" @change="handleGiaOffUpload" />
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            Import Mức Off
          </label>
          <div v-if="latestFileGiaOff" style="display: flex; flex-direction: column; font-size: 11px; color: #94a3b8; max-width: 250px; line-height: 1.2;">
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" :title="latestFileGiaOff.ten_file">
              File: <a :href="latestFileGiaOff.link_file" target="_blank" style="color: #a78bfa; text-decoration: underline; font-weight: bold;">{{ latestFileGiaOff.ten_file }}</a>
            </span>
            <span>Thời gian: {{ formatGiaOffDate(latestFileGiaOff.thoi_gian) }}</span>
          </div>
        </div>
        <label
          class="btn btn-outline"
          style="border-color: rgba(192, 132, 252, 0.55); color: #e9d5ff; background: rgba(168, 85, 247, 0.14); font-weight: 700; cursor: pointer;"
          title="Import file báo giá mua hàng (PDF / Excel) để lấy đơn giá sau thuế làm Giá vốn / Giá off hãng"
        >
          <input type="file" accept=".pdf,.xlsx,.xls" style="display:none" @change="handlePurchaseQuoteUpload" />
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
          Import Mua Hàng (Giá vốn)
        </label>
        <!-- CỤM ĐỐI CHIẾU SOPHOS + UPLOAD FILE GỐC & FILE TRUNG GIAN + FILE ĐÃ UP TƯƠNG ỨNG -->
        <div class="vendor-compare-group vendor-compare-group--sophos">
          <button class="btn btn-image-check" @click="openImageCheckModal" title="Quét ảnh chụp bảng giá Sophos để bóc tách và đối chiếu với File Gốc & File Trung Gian trên Cloudinary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
            Đối chiếu Sophos (Ảnh)
          </button>
          <div class="vendor-ref-slot">
            <label
              class="vendor-ref-upload-btn vendor-ref-upload-btn--sophos-goc"
              :title="`Upload File Gốc Sophos mới lên Cloudinary (Đang dùng: ${vendorRefFilesMeta.sophos?.goc_file_name || 'Chưa có'})`"
            >
              <input type="file" accept=".xlsx,.xlsb,.xls" style="display: none" @change="handleCustomSophosExcelUpload($event, 'goc')" />
              <span>☁️ File Gốc</span>
            </label>
            <div class="vendor-uploaded-file-box vendor-uploaded-file-box--compact">
              <template v-if="getVendorCompareFileMeta('sophos', 'goc')">
                <div class="vendor-uploaded-file-box__row">
                  <span class="vendor-uploaded-file-box__line" :title="`Click mở ViewOffice: ${getVendorCompareFileMeta('sophos', 'goc').name}`">
                    File đã up:
                    <a
                      :href="getVendorOfficeViewUrl(getVendorCompareFileMeta('sophos', 'goc'))"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="vendor-uploaded-file-box__link"
                      style="color: #7dd3fc;"
                      @click="handleOpenVendorOfficeView($event, 'sophos', 'goc', getVendorCompareFileMeta('sophos', 'goc'))"
                    >
                      {{ getVendorCompareFileMeta('sophos', 'goc').name }}
                    </a>
                  </span>
                  <button
                    type="button"
                    class="vendor-file-download-btn"
                    title="Tải File Gốc Sophos về máy"
                    @click.stop.prevent="handleDownloadVendorUploadedFile('sophos', 'goc', getVendorCompareFileMeta('sophos', 'goc'))"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    <span>Tải về</span>
                  </button>
                </div>
                <span class="vendor-uploaded-file-box__time">
                  {{ formatRefTimestamp(getVendorCompareFileMeta('sophos', 'goc').updatedAt) }}
                </span>
              </template>
              <span v-else class="vendor-uploaded-file-box__empty">File đã up: Chưa có</span>
            </div>
          </div>
          <div class="vendor-ref-slot">
            <label
              class="vendor-ref-upload-btn vendor-ref-upload-btn--sophos-tg"
              :title="`Upload File Trung Gian Sophos mới lên Cloudinary (Đang dùng: ${vendorRefFilesMeta.sophos?.tg_file_name || 'Chưa có'})`"
            >
              <input type="file" accept=".xlsx,.xlsb,.xls" style="display: none" @change="handleCustomSophosExcelUpload($event, 'tg')" />
              <span>☁️ File Trung Gian</span>
            </label>
            <div class="vendor-uploaded-file-box vendor-uploaded-file-box--compact">
              <template v-if="getVendorCompareFileMeta('sophos', 'tg')">
                <div class="vendor-uploaded-file-box__row">
                  <span class="vendor-uploaded-file-box__line" :title="`Click mở ViewOffice: ${getVendorCompareFileMeta('sophos', 'tg').name}`">
                    File đã up:
                    <a
                      :href="getVendorOfficeViewUrl(getVendorCompareFileMeta('sophos', 'tg'))"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="vendor-uploaded-file-box__link"
                      style="color: #d8b4fe;"
                      @click="handleOpenVendorOfficeView($event, 'sophos', 'tg', getVendorCompareFileMeta('sophos', 'tg'))"
                    >
                      {{ getVendorCompareFileMeta('sophos', 'tg').name }}
                    </a>
                  </span>
                  <button
                    type="button"
                    class="vendor-file-download-btn"
                    title="Tải File Trung Gian Sophos về máy"
                    @click.stop.prevent="handleDownloadVendorUploadedFile('sophos', 'tg', getVendorCompareFileMeta('sophos', 'tg'))"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    <span>Tải về</span>
                  </button>
                </div>
                <span class="vendor-uploaded-file-box__time">
                  {{ formatRefTimestamp(getVendorCompareFileMeta('sophos', 'tg').updatedAt) }}
                </span>
              </template>
              <span v-else class="vendor-uploaded-file-box__empty">File đã up: Chưa có</span>
            </div>
          </div>
        </div>

        <!-- CỤM ĐỐI CHIẾU KASPERSKY + UPLOAD FILE GỐC & FILE TRUNG GIAN + FILE ĐÃ UP TƯƠNG ỨNG -->
        <div class="vendor-compare-group vendor-compare-group--kas">
          <button
            class="btn btn-outline"
            style="border-color: rgba(16, 185, 129, 0.55); color: #34d399; background: rgba(16, 185, 129, 0.1); font-weight: 700;"
            @click="openKasImageCheckModal"
            title="Quét ảnh bảng giá Kaspersky để bóc tách và đối chiếu với File Gốc & File Trung Gian trên Cloudinary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Đối chiếu Kaspersky (Ảnh)
          </button>
          <div class="vendor-ref-slot">
            <label
              class="vendor-ref-upload-btn vendor-ref-upload-btn--kas-goc"
              :title="`Upload File Gốc Kaspersky mới lên Cloudinary (Đang dùng: ${vendorRefFilesMeta.kaspersky?.goc_file_name || 'Chưa có'})`"
            >
              <input type="file" accept=".xlsx,.xls" style="display: none" @change="handleCustomKasExcelUpload($event, 'goc')" />
              <span>☁️ File Gốc</span>
            </label>
            <div class="vendor-uploaded-file-box vendor-uploaded-file-box--compact">
              <template v-if="getVendorCompareFileMeta('kaspersky', 'goc')">
                <div class="vendor-uploaded-file-box__row">
                  <span class="vendor-uploaded-file-box__line" :title="`Click mở ViewOffice: ${getVendorCompareFileMeta('kaspersky', 'goc').name}`">
                    File đã up:
                    <a
                      :href="getVendorOfficeViewUrl(getVendorCompareFileMeta('kaspersky', 'goc'))"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="vendor-uploaded-file-box__link"
                      style="color: #6ee7b7;"
                      @click="handleOpenVendorOfficeView($event, 'kaspersky', 'goc', getVendorCompareFileMeta('kaspersky', 'goc'))"
                    >
                      {{ getVendorCompareFileMeta('kaspersky', 'goc').name }}
                    </a>
                  </span>
                  <button
                    type="button"
                    class="vendor-file-download-btn"
                    title="Tải File Gốc Kaspersky về máy"
                    @click.stop.prevent="handleDownloadVendorUploadedFile('kaspersky', 'goc', getVendorCompareFileMeta('kaspersky', 'goc'))"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    <span>Tải về</span>
                  </button>
                </div>
                <span class="vendor-uploaded-file-box__time">
                  {{ formatRefTimestamp(getVendorCompareFileMeta('kaspersky', 'goc').updatedAt) }}
                </span>
              </template>
              <span v-else class="vendor-uploaded-file-box__empty">File đã up: Chưa có</span>
            </div>
          </div>
          <div class="vendor-ref-slot">
            <label
              class="vendor-ref-upload-btn vendor-ref-upload-btn--kas-tg"
              :title="`Upload File Trung Gian Kaspersky mới lên Cloudinary (Đang dùng: ${vendorRefFilesMeta.kaspersky?.mau_file_name || 'Chưa có'})`"
            >
              <input type="file" accept=".xlsx,.xls" style="display: none" @change="handleCustomKasExcelUpload($event, 'mau')" />
              <span>☁️ File Trung Gian</span>
            </label>
            <div class="vendor-uploaded-file-box vendor-uploaded-file-box--compact">
              <template v-if="getVendorCompareFileMeta('kaspersky', 'tg')">
                <div class="vendor-uploaded-file-box__row">
                  <span class="vendor-uploaded-file-box__line" :title="`Click mở ViewOffice: ${getVendorCompareFileMeta('kaspersky', 'tg').name}`">
                    File đã up:
                    <a
                      :href="getVendorOfficeViewUrl(getVendorCompareFileMeta('kaspersky', 'tg'))"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="vendor-uploaded-file-box__link"
                      style="color: #7dd3fc;"
                      @click="handleOpenVendorOfficeView($event, 'kaspersky', 'mau', getVendorCompareFileMeta('kaspersky', 'tg'))"
                    >
                      {{ getVendorCompareFileMeta('kaspersky', 'tg').name }}
                    </a>
                  </span>
                  <button
                    type="button"
                    class="vendor-file-download-btn"
                    title="Tải File Trung Gian Kaspersky về máy"
                    @click.stop.prevent="handleDownloadVendorUploadedFile('kaspersky', 'mau', getVendorCompareFileMeta('kaspersky', 'tg'))"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    <span>Tải về</span>
                  </button>
                </div>
                <span class="vendor-uploaded-file-box__time">
                  {{ formatRefTimestamp(getVendorCompareFileMeta('kaspersky', 'tg').updatedAt) }}
                </span>
              </template>
              <span v-else class="vendor-uploaded-file-box__empty">File đã up: Chưa có</span>
            </div>
          </div>
        </div>

        <!-- CỤM ĐỐI CHIẾU ACRONIS + UPLOAD FILE GỐC + FILE ĐÃ UP TƯƠNG ỨNG -->
        <div class="vendor-compare-group vendor-compare-group--acronis">
          <button
            class="btn btn-outline"
            style="border-color: rgba(129, 140, 248, 0.55); color: #a5b4fc; background: rgba(99, 102, 241, 0.14); font-weight: 700;"
            @click="openAcronisCompareModal"
            title="Đối chiếu bảng giá gốc Acronis trên Cloudinary với Database"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Đối chiếu Acronis
          </button>
          <div class="vendor-ref-slot">
            <label
              class="vendor-ref-upload-btn vendor-ref-upload-btn--acronis-goc"
              :title="`Upload File Gốc Acronis mới lên Cloudinary (Đang dùng: ${vendorRefFilesMeta.acronis?.goc_file_name || 'Chưa có'})`"
            >
              <input type="file" accept=".xlsx,.xls" style="display: none" @change="handleCustomAcronisExcelUpload($event, 'goc')" />
              <span>☁️ File Gốc</span>
            </label>
            <div class="vendor-uploaded-file-box vendor-uploaded-file-box--compact">
              <template v-if="getVendorCompareFileMeta('acronis', 'goc')">
                <div class="vendor-uploaded-file-box__row">
                  <span class="vendor-uploaded-file-box__line" :title="`Click mở ViewOffice: ${getVendorCompareFileMeta('acronis', 'goc').name}`">
                    File đã up:
                    <a
                      :href="getVendorOfficeViewUrl(getVendorCompareFileMeta('acronis', 'goc'))"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="vendor-uploaded-file-box__link"
                      style="color: #c7d2fe;"
                      @click="handleOpenVendorOfficeView($event, 'acronis', 'goc', getVendorCompareFileMeta('acronis', 'goc'))"
                    >
                      {{ getVendorCompareFileMeta('acronis', 'goc').name }}
                    </a>
                  </span>
                  <button
                    type="button"
                    class="vendor-file-download-btn"
                    title="Tải File Gốc Acronis về máy"
                    @click.stop.prevent="handleDownloadVendorUploadedFile('acronis', 'goc', getVendorCompareFileMeta('acronis', 'goc'))"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    <span>Tải về</span>
                  </button>
                </div>
                <span class="vendor-uploaded-file-box__time">
                  {{ formatRefTimestamp(getVendorCompareFileMeta('acronis', 'goc').updatedAt) }}
                </span>
              </template>
              <span v-else class="vendor-uploaded-file-box__empty">File đã up: Chưa có</span>
            </div>
          </div>
        </div>
        <button class="btn btn-usd-rate" @click="openUsdRateModal" title="Thay đổi tỉ giá đồng loạt cho các sản phẩm USD">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          Đổi Tỉ Giá (USD)
          <span v-if="currentSystemUsdRate > 1" class="usd-rate-btn-badge">{{ formatNumberPlain(currentSystemUsdRate) }}₫</span>
        </button>
        <button class="btn btn-pricelist" @click="openCreatePriceListModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
          Tạo Bảng Giá
        </button>
        <button class="btn btn-primary" @click="openAddModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Thêm mới
        </button>
        <button class="btn btn-secondary" @click="fetchData" :disabled="loading">
          <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
          <span v-else class="spinner"></span>
          Làm mới
        </button>
      </div>
    </div>

    <!-- Filters & Price List Selector -->
    <div class="filters" style="display: flex; flex-direction: column; gap: 12px;">
      <!-- Dòng 1: Tìm kiếm, Volume, Sắp xếp, Hãng, Danh mục, Nhà cung cấp -->
      <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
        <!-- Ô Tìm kiếm từ khóa -->
        <div style="flex: 1; min-width: 220px; max-width: 320px; position: relative;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" v-model="searchQuery" placeholder="Tìm mã / tên hàng / NCC..." class="search-input" style="padding-left: 36px; max-width: 100%;" />
        </div>

        <!-- Ô lọc Volume -->
        <div style="min-width: 175px; max-width: 210px; position: relative;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <input type="number" v-model="userVolumeFilter" placeholder="Số user (Volume)..." class="search-input" style="padding-left: 36px; max-width: 100%;" />
        </div>

        <!-- Bộ lọc Sắp xếp: Cũ nhất ➔ Mới nhất và ngược lại -->
        <div class="hh-filter-sort-group">
          <select v-model="sortOrder" class="hh-filter-select" title="Sắp xếp thứ tự sản phẩm">
            <option value="default">🕒 Sắp xếp: Mặc định</option>
            <option value="newest">⬇️ Mới nhất ➔ Cũ nhất</option>
            <option value="oldest">⬆️ Cũ nhất ➔ Mới nhất</option>
          </select>
        </div>

        <!-- Bộ lọc theo Hãng (Lazy Loading + Tìm nhanh) -->
        <div class="hh-lazy-dropdown" @click.stop>
          <button
            type="button"
            class="hh-lazy-dropdown__trigger"
            :class="{ active: Boolean(selectedBrandFilter) }"
            @click="toggleFilterDropdown('brand')"
          >
            <span>🏷️ {{ selectedBrandFilter ? `Hãng: ${selectedBrandFilter}` : `Tất cả Hãng (${brandFilterOptions.length})` }}</span>
            <span class="hh-lazy-dropdown__caret">▾</span>
          </button>
          <div v-if="openDropdownType === 'brand'" class="hh-lazy-dropdown__menu">
            <div class="hh-lazy-dropdown__search-wrap">
              <input
                type="text"
                v-model="brandDropdownSearch"
                placeholder="Tìm nhanh hãng..."
                class="hh-lazy-dropdown__search"
              />
            </div>
            <div class="hh-lazy-dropdown__list" @scroll="onFilterDropdownScroll($event, 'brand')">
              <div
                class="hh-lazy-dropdown__item"
                :class="{ selected: !selectedBrandFilter }"
                @click="selectFilterOption('brand', '')"
              >
                <span>Tất cả Hãng</span>
                <span class="hh-lazy-dropdown__count">{{ items.length }}</span>
              </div>
              <div
                v-for="opt in displayedBrandOptions"
                :key="opt.value"
                class="hh-lazy-dropdown__item"
                :class="{ selected: selectedBrandFilter === opt.value }"
                @click="selectFilterOption('brand', opt.value)"
              >
                <span>{{ opt.label }}</span>
                <span class="hh-lazy-dropdown__count">{{ opt.count }}</span>
              </div>
              <div v-if="!filteredBrandOptions.length" class="hh-lazy-dropdown__empty">
                Không tìm thấy hãng phù hợp
              </div>
              <div
                v-if="displayedBrandOptions.length < filteredBrandOptions.length"
                class="hh-lazy-dropdown__more"
                @click="brandDropdownLimit += FILTER_DROPDOWN_PAGE_SIZE"
              >
                Đang hiện {{ displayedBrandOptions.length }}/{{ filteredBrandOptions.length }} — Cuộn hoặc bấm để tải thêm...
              </div>
            </div>
          </div>
        </div>

        <!-- Bộ lọc theo Danh mục (Lazy Loading + Tìm nhanh) -->
        <div class="hh-lazy-dropdown" @click.stop>
          <button
            type="button"
            class="hh-lazy-dropdown__trigger"
            :class="{ active: Boolean(selectedCategoryFilter) }"
            @click="toggleFilterDropdown('category')"
          >
            <span style="max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              📂 {{ selectedCategoryFilter ? `DM: ${selectedCategoryFilter}` : `Tất cả Danh mục (${categoryFilterOptions.length})` }}
            </span>
            <span class="hh-lazy-dropdown__caret">▾</span>
          </button>
          <div v-if="openDropdownType === 'category'" class="hh-lazy-dropdown__menu hh-lazy-dropdown__menu--wide">
            <div class="hh-lazy-dropdown__search-wrap">
              <input
                type="text"
                v-model="categoryDropdownSearch"
                placeholder="Tìm nhanh danh mục..."
                class="hh-lazy-dropdown__search"
              />
            </div>
            <div class="hh-lazy-dropdown__list" @scroll="onFilterDropdownScroll($event, 'category')">
              <div
                class="hh-lazy-dropdown__item"
                :class="{ selected: !selectedCategoryFilter }"
                @click="selectFilterOption('category', '')"
              >
                <span>Tất cả Danh mục</span>
                <span class="hh-lazy-dropdown__count">{{ categoryFilterTotalItems }}</span>
              </div>
              <div
                v-for="opt in displayedCategoryOptions"
                :key="opt.value"
                class="hh-lazy-dropdown__item"
                :class="{ selected: selectedCategoryFilter === opt.value }"
                @click="selectFilterOption('category', opt.value)"
              >
                <span :title="opt.label">{{ opt.label }}</span>
                <span class="hh-lazy-dropdown__count">{{ opt.count }}</span>
              </div>
              <div v-if="!filteredCategoryOptions.length" class="hh-lazy-dropdown__empty">
                Không tìm thấy danh mục phù hợp
              </div>
              <div
                v-if="displayedCategoryOptions.length < filteredCategoryOptions.length"
                class="hh-lazy-dropdown__more"
                @click="categoryDropdownLimit += FILTER_DROPDOWN_PAGE_SIZE"
              >
                Đang hiện {{ displayedCategoryOptions.length }}/{{ filteredCategoryOptions.length }} — Cuộn hoặc bấm để tải thêm...
              </div>
            </div>
          </div>
        </div>

        <!-- Bộ lọc theo Nhà cung cấp (Lazy Loading + Tìm nhanh) -->
        <div class="hh-lazy-dropdown" @click.stop>
          <button
            type="button"
            class="hh-lazy-dropdown__trigger"
            :class="{ active: Boolean(selectedSupplierFilter) }"
            @click="toggleFilterDropdown('supplier')"
          >
            <span style="max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              🏢 {{ selectedSupplierFilter ? `NCC: ${selectedSupplierFilter}` : `Tất cả Nhà cung cấp (${supplierFilterOptions.length})` }}
            </span>
            <span class="hh-lazy-dropdown__caret">▾</span>
          </button>
          <div v-if="openDropdownType === 'supplier'" class="hh-lazy-dropdown__menu hh-lazy-dropdown__menu--wide">
            <div class="hh-lazy-dropdown__search-wrap">
              <input
                type="text"
                v-model="supplierDropdownSearch"
                placeholder="Tìm nhanh nhà cung cấp..."
                class="hh-lazy-dropdown__search"
              />
            </div>
            <div class="hh-lazy-dropdown__list" @scroll="onFilterDropdownScroll($event, 'supplier')">
              <div
                class="hh-lazy-dropdown__item"
                :class="{ selected: !selectedSupplierFilter }"
                @click="selectFilterOption('supplier', '')"
              >
                <span>Tất cả Nhà cung cấp</span>
                <span class="hh-lazy-dropdown__count">{{ items.length }}</span>
              </div>
              <div
                v-for="opt in displayedSupplierOptions"
                :key="opt.value"
                class="hh-lazy-dropdown__item"
                :class="{ selected: selectedSupplierFilter === opt.value }"
                @click="selectFilterOption('supplier', opt.value)"
              >
                <span :title="opt.label">{{ opt.label }}</span>
                <span class="hh-lazy-dropdown__count">{{ opt.count }}</span>
              </div>
              <div v-if="!filteredSupplierOptions.length" class="hh-lazy-dropdown__empty">
                Không tìm thấy nhà cung cấp phù hợp
              </div>
              <div
                v-if="displayedSupplierOptions.length < filteredSupplierOptions.length"
                class="hh-lazy-dropdown__more"
                @click="supplierDropdownLimit += FILTER_DROPDOWN_PAGE_SIZE"
              >
                Đang hiện {{ displayedSupplierOptions.length }}/{{ filteredSupplierOptions.length }} — Cuộn hoặc bấm để tải thêm...
              </div>
            </div>
          </div>
        </div>

        <!-- Nút xóa nhanh bộ lọc & Thống kê kết quả -->
        <button
          v-if="hasActiveSearchOrFilter"
          type="button"
          class="hh-clear-filter-btn"
          @click="resetAllSearchAndFilters"
          title="Đặt lại toàn bộ tìm kiếm, bộ lọc và sắp xếp"
        >
          ✕ Xóa lọc ({{ totalProductsCount }} SP)
        </button>
      </div>

      <!-- Dòng 2: Khung chọn Bảng Giá -->
      <div class="pricelist-bar">
        <div class="pricelist-select-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
          <select v-model="selectedPriceListId" class="pricelist-select">
            <option value="">📋 Giá gốc hệ thống ({{ items.length }} SP)</option>
            <option v-for="pl in priceLists" :key="pl._firebaseKey" :value="pl._firebaseKey">
              🏷️ {{ pl.ten_bang_gia }} ({{ (pl.items || []).length }} SP){{ formatPriceListPeriodInline(pl) }}
            </option>
          </select>
        </div>

        <template v-if="activePriceList">
          <span class="pricelist-period-badge" v-if="activePriceList.ngay_bat_dau || activePriceList.ngay_ket_thuc">
            🗓️ {{ formatPriceListPeriod(activePriceList) }}
          </span>
          <span class="pricelist-status-badge" :class="getPriceListStatusInfo(activePriceList).cls">
            {{ getPriceListStatusInfo(activePriceList).label }}
          </span>
          <button
            type="button"
            class="pricelist-autosync-btn"
            :class="activePriceList.auto_sync_base_price ? 'on' : 'off'"
            @click="togglePriceListAutoSync(activePriceList)"
            :title="activePriceList.auto_sync_base_price ? 'Đang BẬT: Khi giá gốc thay đổi, bảng giá này sẽ tự động tính lại theo % / số tiền tăng giảm. Nhấn để TẮT.' : 'Đang TẮT: Giữ cố định giá bán hiện tại dù giá gốc thay đổi. Nhấn để BẬT tự động cập nhật.'"
          >
            <span v-if="activePriceList.auto_sync_base_price">🔄 Tự động theo giá gốc: BẬT</span>
            <span v-else>🔒 Giá cố định (Tắt tự động)</span>
          </button>
          <span class="pricelist-rule-badge" v-if="activePriceList.default_rule && activePriceList.default_rule.value">
            {{ activePriceList.default_rule.direction === 'decrease' ? 'Giảm (-)' : 'Tăng (+)' }}
            {{ activePriceList.default_rule.type === 'percent' ? activePriceList.default_rule.value + '%' : formatNumberPlain(activePriceList.default_rule.value) }}
          </span>
          <button type="button" class="pricelist-action-btn edit" @click="openEditPriceListModal(activePriceList)" title="Chỉnh sửa bảng giá">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            Sửa
          </button>
          <button type="button" class="pricelist-action-btn export" @click="exportPriceListToExcel(activePriceList)" title="Xuất Excel bảng giá">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Xuất Excel
          </button>
          <button type="button" class="pricelist-action-btn delete" @click="requestDeletePriceList(activePriceList)" title="Xóa bảng giá">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </template>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="products-grid">
      <!-- Skeleton Loading -->
      <template v-if="loading && !items.length">
        <div v-for="i in 8" :key="'skeleton-' + i" class="product-card skeleton-card">
          <div class="card-body">
            <div class="card-top">
              <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                <div class="skeleton skeleton-badge"></div>
                <div class="skeleton skeleton-badge" style="width: 120px;"></div>
              </div>
            </div>
            <div class="skeleton skeleton-title" style="margin-top: 12px;"></div>
            <div class="skeleton skeleton-title" style="width: 70%; margin-top: 8px;"></div>
            <div class="skeleton skeleton-desc" style="margin-top: 16px;"></div>
            <div class="skeleton skeleton-desc" style="width: 80%;"></div>
            
            <div class="price-info-box" style="border-color: rgba(255,255,255,0.05);">
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text" style="width: 60%;"></div>
              <div class="skeleton skeleton-text" style="width: 50%;"></div>
              
              <div style="height: 1px; background: rgba(255,255,255,0.05); margin: 6px 0; width: 100%;"></div>
              
              <div class="skeleton skeleton-text" style="width: 70%;"></div>
              <div class="skeleton skeleton-text" style="width: 80%;"></div>
              <div class="skeleton skeleton-price" style="margin-top: 8px;"></div>
            </div>
          </div>
        </div>
      </template>
      <div v-else-if="!filteredItems.length" class="empty-state text-center py-8 text-muted">
        Không có hàng hóa nào.
      </div>
      
      <template v-else v-for="(groupItems, category) in groupedItems" :key="category">
        <!-- Category Group Header (Folder Style) -->
        <div class="folder-header">
          <div class="folder-tab">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            <span>
              SỐ LƯỢNG: {{ categoryTotalCounts[category] || groupItems.length }}
              <template v-if="(categoryTotalCounts[category] || 0) > groupItems.length">
                (đang hiện {{ groupItems.length }})
              </template>
            </span>
          </div>
          <div class="folder-body">
            <h3 class="folder-title" :title="category">{{ category }}</h3>
          </div>
        </div>
        
        <div v-for="(item, index) in groupItems" :key="item.Ma_hang || index" class="product-card" :class="{ 'in-quote-cart': isInQuoteCart(item) }" @click="openEditModal(item)" style="cursor: pointer;">
          <div class="card-body">
            <div class="card-top">
              <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                <span class="brand-badge" v-if="item.Ten_nha_cung_cap">
                  {{ item.Ten_nha_cung_cap }}
                </span>
                <span class="category-badge" v-if="item.Danh_muc">
                  {{ item.Danh_muc }}
                </span>
                <span
                  v-if="item.Type"
                  :style="{
                    fontSize: '10.5px',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: String(item.Type).toLowerCase().includes('renewal') ? 'rgba(245, 158, 11, 0.16)' : 'rgba(16, 185, 129, 0.16)',
                    color: String(item.Type).toLowerCase().includes('renewal') ? '#fbbf24' : '#34d399',
                    border: String(item.Type).toLowerCase().includes('renewal') ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)'
                  }"
                >
                  {{ item.Type }}
                </span>
              </div>
              <div class="card-actions">
                <button
                  v-if="getCardVendorType(item)"
                  class="btn-icon"
                  :style="getCardVendorType(item) === 'sophos'
                    ? 'color: #38bdf8; border-color: rgba(56, 189, 248, 0.45); background: rgba(56, 189, 248, 0.14);'
                    : (getCardVendorType(item) === 'acronis'
                        ? 'color: #a5b4fc; border-color: rgba(129, 140, 248, 0.45); background: rgba(99, 102, 241, 0.16);'
                        : 'color: #34d399; border-color: rgba(16, 185, 129, 0.45); background: rgba(16, 185, 129, 0.14);')"
                  :title="getCardVendorType(item) === 'sophos'
                    ? 'Đối chiếu file gốc Sophos'
                    : (getCardVendorType(item) === 'acronis'
                        ? 'Đối chiếu file gốc Acronis (file_goc_acronis.xlsx)'
                        : 'Đối chiếu file gốc Kaspersky')"
                  @click.stop="openCardOriginalFileCompare(item)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
                </button>
                <button class="btn-icon text-primary" title="Sửa" @click.stop="openEditModal(item)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button class="btn-icon text-danger" title="Xóa" @click.stop="requestDelete(item)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              </div>
            </div>
            <div v-if="item.sku_code" style="font-family: monospace; font-size: 11.5px; font-weight: 700; color: #a78bfa; margin-top: 6px;">
              SKU Code: <span v-html="highlightText(item.sku_code, searchQuery)"></span>
            </div>
            <div v-if="item.Ma_hang" style="font-family: monospace; font-size: 11.5px; font-weight: 700; color: #38bdf8; margin-top: 4px;">
              Mã hàng: <span v-html="highlightText(item.Ma_hang, searchQuery)"></span>
            </div>
            <h3 class="product-name" :title="item.Ten_hang" v-html="highlightText(item.Ten_hang, searchQuery)"></h3>
            <div class="product-desc text-muted" v-if="item.Description" style="color: #cbd5e1; font-size: 12px; margin-bottom: 4px;" v-html="item.Description"></div>
            <p class="product-desc text-muted" v-else-if="item.Mo_ta_chung" :title="item.Mo_ta_chung">{{ item.Mo_ta_chung }}</p>
            <div class="price-info-box">
              <p v-if="item.Type">Type: <span :style="{ color: String(item.Type).toLowerCase().includes('renewal') ? '#fbbf24' : '#34d399', fontWeight: 700 }">{{ item.Type }}</span></p>
              <p>License duration: <span>{{ item.License_duration || '-' }}</span></p>
              <p>Thời hạn bảo hành: <span>{{ item.thoi_han_bao_hanh || '-' }}</span></p>
              <p>Volume: <span>{{ item.volume || '-' }}</span></p>
              <p>Đơn vị tiền tệ: <span>{{ item.Don_vi_tien_te || '-' }}</span></p>
              <p style="display: flex; align-items: center; justify-content: space-between; gap: 6px; flex-wrap: wrap;">
                <span>Tỉ giá: <span style="font-weight: 700; color: #f8fafc;">{{ item.Ti_gia ? formatCurrency(item.Ti_gia, 'VND') : '-' }}</span></span>
                <button
                  v-if="String(item.Don_vi_tien_te || '').trim().toUpperCase() === 'USD'"
                  type="button"
                  class="card-usd-rate-quick-btn"
                  title="Thay đổi tỉ giá USD"
                  @click.stop="openUsdRateModal"
                >
                  💱 Đổi tỉ giá
                </button>
              </p>
              
              <div style="height: 1px; background: rgba(255,255,255,0.1); margin: 6px 0; width: 100%;"></div>
              
              <p style="color: #c084fc; font-weight: 600;">
                Giá vốn/off hãng:
                <span style="color: #e9d5ff; font-weight: 700;">{{ formatCurrency(item.Gia_tieu_chuan || 0, item.Don_vi_tien_te) }}</span>
              </p>
              <p style="color: #fbbf24;">Giá nhập: <span style="color: #fcd34d;">{{ formatCurrency(item.gia_nhap || 0, item.Don_vi_tien_te) }}</span></p>
              <p>Thuế VAT: <span style="color: #facc15;">{{ item.Thue_VAT ? item.Thue_VAT + '%' : '0%' }}</span></p>
              <template v-if="getPriceListEntry(item)">
                <p style="font-size: 12px; color: #94a3b8; margin-top: 2px;">
                  Giá bán gốc:
                  <span style="text-decoration: line-through; color: #64748b;">
                    {{ formatCurrency(activePriceList?.auto_sync_base_price ? item.Don_gia : getPriceListEntry(item).gia_goc, item.Don_vi_tien_te) }}
                  </span>
                </p>
                <p class="highlight" style="margin-top: 4px;">
                  <span style="display: inline-flex; align-items: center; gap: 6px;">
                    Giá bảng giá:
                    <span class="pl-card-diff-badge" :class="getPriceListDiffClass(getPriceListEntry(item), activePriceList?.auto_sync_base_price ? item.Don_gia : getPriceListEntry(item).gia_goc)">
                      {{ formatPriceListRuleShort(getPriceListEntry(item), activePriceList?.auto_sync_base_price ? item.Don_gia : getPriceListEntry(item).gia_goc) }}
                    </span>
                  </span>
                  <span style="color: #34d399; font-weight: 700;">
                    {{ formatCurrency(getPriceListEntry(item).gia_ban_moi, item.Don_vi_tien_te) }}
                    <small v-if="item.DVT" style="font-size: 11px; color: #64748b; font-weight: 500;">/ {{ item.DVT }}</small>
                  </span>
                </p>
              </template>
              <p v-else class="highlight" style="margin-top: 4px;">
                <span style="display: inline-flex; align-items: center; gap: 6px;">
                  Giá bán:
                  <span
                    v-if="toNum(item.Gia_tieu_chuan) > 0 && toNum(item.Don_gia) > 0 && toNum(item.Don_gia) !== toNum(item.Gia_tieu_chuan)"
                    class="pl-card-diff-badge"
                    :class="toNum(item.Don_gia) > toNum(item.Gia_tieu_chuan) ? 'up' : 'down'"
                    title="Chênh lệch Giá bán so với Giá vốn/off hãng"
                  >
                    {{ formatCardMarkupBadge(item) }}
                  </span>
                </span>
                <span>
                  {{ formatCurrency(item.Don_gia, item.Don_vi_tien_te) }}
                  <small v-if="item.DVT" style="font-size: 11px; color: #64748b; font-weight: 500;">/ {{ item.DVT }}</small>
                </span>
              </p>
              <div
                style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed rgba(255,255,255,0.08); display: flex; flex-direction: column; gap: 4px;"
              >
                <div
                  v-if="getProductFileHistory(item).length"
                  style="background: rgba(15, 23, 42, 0.72); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 7px; padding: 6px 8px; display: flex; flex-direction: column; gap: 3px;"
                  @click.stop="openProductFilesModal(item)"
                  title="Click để xem toàn bộ lịch sử File/Ảnh & biến động giá của sản phẩm này"
                >
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                    <span style="font-size: 11px; color: #38bdf8; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      📎 {{ getProductFileHistory(item)[0].file_name }}
                    </span>
                    <span
                      v-if="getProductFileHistory(item).length > 1"
                      style="font-size: 10px; background: rgba(168, 85, 247, 0.2); color: #e9d5ff; border: 1px solid rgba(192, 132, 252, 0.4); padding: 1px 6px; border-radius: 99px; font-weight: 700; flex-shrink: 0;"
                    >
                      +{{ getProductFileHistory(item).length - 1 }} file
                    </span>
                  </div>
                  <div style="font-size: 10.5px; color: #94a3b8; display: flex; align-items: center; justify-content: space-between; gap: 4px; flex-wrap: wrap;">
                    <span>🕒 Up file: <strong style="color: #cbd5e1;">{{ formatLastUpdated(getProductFileHistory(item)[0].file_uploaded_at) }}</strong></span>
                    <span style="color: #60a5fa; text-decoration: underline; font-weight: 600;">Lịch sử file ({{ getProductFileHistory(item).length }})</span>
                  </div>
                </div>
                <div
                  v-else
                  style="display: flex; align-items: center; justify-content: space-between; gap: 6px;"
                >
                  <span style="font-size: 11px; color: #64748b;">📎 File: Chưa đính kèm</span>
                  <button
                    type="button"
                    style="background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; border-radius: 5px; padding: 1px 7px; font-size: 10.5px; font-weight: 600; cursor: pointer;"
                    @click.stop="openProductFilesModal(item)"
                  >+ Gắn file</button>
                </div>
                <p style="font-size: 11.5px; color: #64748b; margin: 0;">
                  Cập nhật SP: <span style="color: #94a3b8; font-weight: 500;">{{ formatLastUpdated(item.last_updated) }}</span>
                </p>
              </div>
              <div v-if="getCardVendorType(item)" style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.1);">
                <button
                  type="button"
                  class="card-ref-compare-btn"
                  :class="getCardVendorType(item) === 'sophos'
                    ? 'card-ref-compare-btn--sophos'
                    : (getCardVendorType(item) === 'acronis' ? 'card-ref-compare-btn--acronis' : 'card-ref-compare-btn--kas')"
                  @click.stop="openCardOriginalFileCompare(item)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  <span>Đối chiếu file gốc</span>
                </button>
              </div>

              <!-- NÚT THÊM VÀO GIỎ & CỤM SỐ LƯỢNG TRỰC TIẾP TRÊN CARD -->
              <div class="card-cart-action-box" @click.stop>
                <button
                  v-if="!isInQuoteCart(item)"
                  type="button"
                  class="card-add-cart-btn"
                  @click.stop="addToQuoteCart(item)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path><line x1="12" y1="9" x2="12" y2="15"></line><line x1="9" y1="12" x2="15" y2="12"></line></svg>
                  <span>Thêm vào giỏ</span>
                </button>

                <div v-else class="card-cart-qty-cluster" @click.stop>
                  <span class="card-cart-selected-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>Đã thêm</span>
                  </span>
                  <div class="card-cart-stepper">
                    <button
                      type="button"
                      class="card-cart-step-btn minus"
                      title="Giảm số lượng (về 0 sẽ bỏ khỏi giỏ)"
                      @click.stop="updateQuoteCartQty(item, -1, false)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                    <input
                      type="number"
                      min="1"
                      class="card-cart-qty-input"
                      :value="getCartItemQty(item)"
                      @click.stop
                      @change="onCardCartQtyInputChange(item, $event)"
                    />
                    <button
                      type="button"
                      class="card-cart-step-btn plus"
                      title="Tăng số lượng"
                      @click.stop="updateQuoteCartQty(item, 1, false)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                  </div>
                  <button
                    type="button"
                    class="card-cart-remove-btn"
                    title="Xóa khỏi giỏ"
                    @click.stop="removeFromQuoteCart(item)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      
      <!-- LAZY LOADING SENTINEL & NÚT TẢI THÊM (20 SẢN PHẨM / TRANG) -->
      <div
        v-if="!loading && totalProductsCount > 0"
        ref="lazyLoadSentinelRef"
        style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; gap: 10px; margin-top: 16px; padding: 12px 0;"
      >
        <div style="font-size: 12.5px; color: #94a3b8; font-weight: 600;">
          Đang hiển thị <strong style="color: #38bdf8;">{{ displayedProductsCount }}</strong> / <strong style="color: #f8fafc;">{{ totalProductsCount }}</strong> sản phẩm
        </div>
        <button
          v-if="hasMoreProducts"
          type="button"
          @click="loadMoreProducts"
          style="width: 100%; padding: 14px; background: rgba(56, 189, 248, 0.1); border: 1px dashed rgba(56, 189, 248, 0.4); color: #38bdf8; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s;"
          onmouseover="this.style.background='rgba(56, 189, 248, 0.2)';"
          onmouseout="this.style.background='rgba(56, 189, 248, 0.1)';"
        >
          ⏳ Tự động tải khi cuộn xuống hoặc bấm để xem thêm (+{{ Math.min(PRODUCT_PAGE_SIZE, totalProductsCount - displayedProductsCount) }} sản phẩm — còn {{ totalProductsCount - displayedProductsCount }} sản phẩm)
        </button>
      </div>
    </div>

    <!-- Modal Form -->
    <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
      <div class="modal-content large-modal">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <h2>{{ isEditing ? 'Cập nhật hàng hóa' : 'Thêm hàng hóa mới' }}</h2>
            <span v-if="isEditing && formData.last_updated" style="font-size: 12px; color: #94a3b8; background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 99px;">
              🕒 Cập nhật cuối: <strong style="color: #38bdf8;">{{ formatLastUpdated(formData.last_updated) }}</strong>
            </span>
            <span v-if="isEditing && activePriceList && formData._has_pl_entry" style="font-size: 12px; color: #fbbf24; background: rgba(245, 158, 11, 0.14); border: 1px solid rgba(245, 158, 11, 0.35); padding: 4px 12px; border-radius: 99px;">
              🏷️ Đang sửa theo bảng giá: <strong style="color: #fde68a;">{{ activePriceList.ten_bang_gia }}</strong>
            </span>
            <button
              v-if="isEditing && getCardVendorType(formData)"
              type="button"
              class="card-ref-compare-btn"
              style="width: auto; padding: 5px 12px; font-size: 12px;"
              :class="getCardVendorType(formData) === 'sophos'
                ? 'card-ref-compare-btn--sophos'
                : (getCardVendorType(formData) === 'acronis' ? 'card-ref-compare-btn--acronis' : 'card-ref-compare-btn--kas')"
              @click="openCardOriginalFileCompare(originalItem || formData)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              <span>Đối chiếu file gốc</span>
            </button>
          </div>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveItem" class="form-grid-2col">
            <!-- CỘT 1 -->
            <div class="col-left form-panel">
              <h3 class="panel-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="panel-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                Thông tin chung
              </h3>
              <div class="panel-content">
                <div class="form-group">
                  <label>Mã hàng <span class="required">*</span></label>
                  <input v-model="formData.Ma_hang" type="text" required :disabled="isEditing" placeholder="Tự ghép kèm SKU Code (hoặc tự nhập)..." @input="onFormMaHangManualInput" />
                </div>
                <div class="form-group">
                  <label>SKU Code (Mã SKU hãng)</label>
                  <input v-model="formData.sku_code" type="text" placeholder="VD: XS230012ZZNCAA, KL4867RA*FQ, SSSAEBLOS..." />
                </div>
                <div class="form-group col-span-2">
                  <label>Tên hàng <span class="required">*</span></label>
                  <input v-model="formData.Ten_hang" type="text" required />
                </div>
                <div class="form-group col-span-2">
                  <label>Description (Theo file gốc)</label>
                  <ExcelEditor v-model="formData.Description" placeholder="VD: Workspace Protection - 1-9 users - 12 MOS..." class="features-excel-editor" />
                </div>
                <div class="form-group">
                  <label>License duration</label>
                  <input v-model="formData.License_duration" type="text" placeholder="VD: 12 months, 24 months..." />
                </div>
                <div class="form-group">
                  <label>Thời hạn bảo hành</label>
                  <input v-model="formData.thoi_han_bao_hanh" type="text" />
                </div>
                <div class="form-group">
                  <label>Volume (Range Users / Blocks)</label>
                  <input v-model="formData.volume" type="text" placeholder="VD: 1-9 users, 10-24 users..." />
                </div>
                <div class="form-group">
                  <label>Danh mục</label>
                  <input v-model="formData.Danh_muc" type="text" />
                </div>
                <div class="form-group">
                  <label>Loại hàng (Type — New / Renewal)</label>
                  <input v-model="formData.Type" type="text" list="type-options" placeholder="New / Renewal..." />
                  <datalist id="type-options">
                    <option value="New"></option>
                    <option value="Renewal"></option>
                    <option value="Base Plus"></option>
                    <option value="Renewal Plus"></option>
                    <option value="Hardware"></option>
                    <option value="Software"></option>
                  </datalist>
                </div>
                <div class="form-group">
                  <label>Nhà cung cấp</label>
                  <input v-model="formData.Ten_nha_cung_cap" type="text" list="ncc-options" />
                  <datalist id="ncc-options">
                    <option value="SOPHOS"></option>
                    <option value="KASPERSKY"></option>
                    <option value="ACRONIS"></option>
                  </datalist>
                </div>
                <!--
                <div class="form-group">
                  <label>Mã NCC</label>
                  <input v-model="formData.Ma_nha_cung_cap" type="text" />
                </div>
                -->
                <div class="form-group">
                  <label>Đơn vị tính</label>
                  <input v-model="formData.DVT" type="text" />
                </div>
                <div class="form-group col-span-2">
                  <label>Features (Tính năng)</label>
                  <ExcelEditor v-model="formData.Features" placeholder="Nhập tính năng sản phẩm..." class="features-excel-editor" />
                </div>
                <div class="form-group col-span-2">
                  <label>Ghi chú</label>
                  <textarea v-model="formData.Ghi_chu" rows="2"></textarea>
                </div>
              </div>
            </div>

            <!-- CỘT 2 -->
            <div class="col-right form-panel">
              <h3 class="panel-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="panel-icon"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                Thông tin giá cả
              </h3>
              <div class="panel-content">
                <div class="form-group" :class="{'col-span-2': formData.Don_vi_tien_te === 'VND'}">
                  <label>Tiền tệ</label>
                  <select v-model="formData.Don_vi_tien_te" class="select-input">
                    <option value="VND">VND</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div class="form-group" v-if="formData.Don_vi_tien_te !== 'VND'">
                  <label>Tỉ giá</label>
                  <NumberInput v-model="formData.Ti_gia" :decimals="0" />
                </div>

                <!-- GIÁ VỐN / OFF HÃNG -->
                <div class="form-group col-span-2">
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 4px; flex-wrap: wrap;">
                    <label style="margin-bottom: 0; color: #e9d5ff; font-weight: 700;">
                      Giá vốn/off hãng
                    </label>
                    <span style="font-size: 11px; color: #94a3b8;">
                      Giá mua sau thuế từ NCC / Hãng
                    </span>
                  </div>
                  <NumberInput v-model="formData.Gia_tieu_chuan" :decimals="String(formData.Don_vi_tien_te || 'VND').toUpperCase() === 'USD' ? 2 : 0" @update:modelValue="onModalGiaVonChange" />

                  <!-- KHUNG ĐIỀU CHỈNH ĐƠN GIÁ BÁN TỪ GIÁ VỐN (% HOẶC SỐ TIỀN CỤ THỂ) -->
                  <div
                    style="margin-top: 8px; padding: 8px 10px; background: rgba(168, 85, 247, 0.08); border: 1px dashed rgba(192, 132, 252, 0.4); border-radius: 8px; display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;"
                  >
                    <span style="font-size: 12px; color: #e9d5ff; font-weight: 600;">
                      ⚡ Tính Đơn giá bán từ Giá vốn:
                    </span>
                    <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                      <select
                        v-model="modalCostMarkup.direction"
                        @change="applyModalCostMarkupToDonGia"
                        class="pl-row-select"
                        :class="modalCostMarkup.direction === 'decrease' ? 'down' : 'up'"
                        style="height: 32px; font-size: 12px;"
                      >
                        <option value="increase">+ Tăng (Lãi)</option>
                        <option value="decrease">- Giảm (Off)</option>
                      </select>
                      <select
                        v-model="modalCostMarkup.type"
                        @change="applyModalCostMarkupToDonGia"
                        class="pl-row-select"
                        style="height: 32px; font-size: 12px;"
                      >
                        <option value="percent">% (Phần trăm)</option>
                        <option value="amount">Số tiền cụ thể</option>
                      </select>
                      <div v-if="modalCostMarkup.type === 'percent'" style="position: relative; display: inline-flex; align-items: center;">
                        <NumberInput
                          v-model="modalCostMarkup.value"
                          :decimals="2"
                          @update:modelValue="applyModalCostMarkupToDonGia"
                          style="width: 86px; height: 32px; padding: 4px 24px 4px 8px; border-radius: 6px; border: 1px solid rgba(192, 132, 252, 0.45); background: #0f172a; color: #34d399; font-weight: 700; font-size: 13px; text-align: right;"
                        />
                        <span style="position: absolute; right: 7px; font-size: 12px; color: #94a3b8; font-weight: 700; pointer-events: none;">%</span>
                      </div>
                      <div v-else style="width: 140px;">
                        <NumberInput
                          v-model="modalCostMarkup.value"
                          :decimals="String(formData.Don_vi_tien_te || 'VND').toUpperCase() === 'USD' ? 2 : 0"
                          @update:modelValue="applyModalCostMarkupToDonGia"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-group col-span-2">
                  <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px; margin-bottom: 4px;">
                    <label style="margin-bottom: 0; display: inline-flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                      <span>{{ isEditing && activePriceList && formData._has_pl_entry ? `Đơn giá (${activePriceList.ten_bang_gia})` : 'Đơn giá (Giá bán)' }}</span>
                      <span
                        v-if="isEditing && activePriceList && formData._has_pl_entry"
                        class="pl-card-diff-badge"
                        :class="toNum(formData.Don_gia) > toNum(formData._gia_goc_he_thong) ? 'up' : (toNum(formData.Don_gia) < toNum(formData._gia_goc_he_thong) ? 'down' : 'neutral')"
                      >
                        {{ formatModalPriceListBadge() }}
                      </span>
                      <span
                        v-else-if="toNum(formData.Gia_tieu_chuan) > 0 && toNum(formData.Don_gia) > 0"
                        class="pl-card-diff-badge"
                        :class="toNum(formData.Don_gia) > toNum(formData.Gia_tieu_chuan) ? 'up' : (toNum(formData.Don_gia) < toNum(formData.Gia_tieu_chuan) ? 'down' : 'neutral')"
                      >
                        {{ formatModalCostDiffBadge() }}
                      </span>
                    </label>
                    <span v-if="isEditing && activePriceList && formData._has_pl_entry" style="font-size: 11.5px; color: #94a3b8;">
                      Giá gốc hệ thống: <strong style="color: #cbd5e1;">{{ formatCurrency(formData._gia_goc_he_thong, formData.Don_vi_tien_te) }}</strong>
                    </span>
                  </div>
                  <NumberInput v-model="formData.Don_gia" :decimals="String(formData.Don_vi_tien_te || 'VND').toUpperCase() === 'USD' ? 2 : 0" @update:modelValue="onModalDonGiaChange" />
                  <div
                    v-if="isEditing && activePriceList && formData._has_pl_entry"
                    style="margin-top: 8px; padding: 8px 10px; background: rgba(245, 158, 11, 0.08); border: 1px dashed rgba(245, 158, 11, 0.35); border-radius: 8px; display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;"
                  >
                    <span style="font-size: 12px; color: #fcd34d; font-weight: 600;">
                      ⚡ Chỉnh % theo giá gốc:
                    </span>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <select
                        v-model="formData._pl_direction"
                        @change="onModalPriceListPctChange"
                        class="pl-row-select"
                        :class="formData._pl_direction === 'decrease' ? 'down' : 'up'"
                        style="height: 32px; font-size: 12px;"
                      >
                        <option value="increase">+ Tăng</option>
                        <option value="decrease">- Giảm</option>
                      </select>
                      <div style="position: relative; display: inline-flex; align-items: center;">
                        <NumberInput
                          v-model="formData._pl_pct"
                          :decimals="2"
                          @update:modelValue="onModalPriceListPctChange"
                          style="width: 86px; height: 32px; padding: 4px 24px 4px 8px; border-radius: 6px; border: 1px solid rgba(245, 158, 11, 0.4); background: #0f172a; color: #34d399; font-weight: 700; font-size: 13px; text-align: right;"
                        />
                        <span style="position: absolute; right: 7px; font-size: 12px; color: #94a3b8; font-weight: 700; pointer-events: none;">%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="form-group col-span-2">
                  <label>Thuế VAT (%)</label>
                  <NumberInput v-model="formData.Thue_VAT" :decimals="2" />
                </div>
                <div class="form-group col-span-2">
                  <label>Giá nhập</label>
                  <NumberInput v-model="formData.gia_nhap" :decimals="String(formData.Don_vi_tien_te || 'VND').toUpperCase() === 'USD' ? 2 : 0" />
                </div>

                <!-- LỊCH SỬ FILE ĐÍNH KÈM & MỐC THỜI GIAN UPLOAD FILE (ĐỘC LẬP VỚI LAST_UPDATED CỦA HÀNG HÓA) -->
                <div class="form-group col-span-2" style="margin-top: 6px;">
                  <div style="background: rgba(15, 23, 42, 0.78); border: 1px solid rgba(56, 189, 248, 0.35); border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 10px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="font-size: 13px; font-weight: 800; color: #38bdf8;">
                          📎 Danh sách File / Ảnh báo giá ({{ getProductFileHistory(formData).length }})
                        </span>
                        <span style="font-size: 11px; color: #94a3b8;" title="Mốc thời gian này tính riêng theo thời điểm upload từng file, không bị đổi khi sửa thông tin hàng hóa">
                          • Thời gian tính theo lúc up file
                        </span>
                      </div>
                      <label
                        style="background: rgba(56, 189, 248, 0.16); border: 1px solid rgba(56, 189, 248, 0.45); color: #38bdf8; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;"
                        title="Upload bất kỳ định dạng file hoặc ảnh nào kèm bộ giá hiện tại vào lịch sử file của sản phẩm này"
                      >
                        <input
                          type="file"
                          multiple
                          style="display: none;"
                          @change="handleAttachFileToFormData($event)"
                        />
                        <span>☁️ + Up File / Ảnh kèm giá này</span>
                      </label>
                    </div>

                    <div
                      v-if="!getProductFileHistory(formData).length"
                      style="font-size: 12px; color: #64748b; text-align: center; padding: 10px 6px; border: 1px dashed rgba(148, 163, 184, 0.2); border-radius: 8px;"
                    >
                      Chưa có file đính kèm. Khi bạn Import Excel / Mua hàng / Check giá qua ảnh hoặc bấm "+ Up File / Ảnh" ở trên, file kèm mốc thời gian upload sẽ được lưu tại đây.
                    </div>

                    <div
                      v-else
                      style="display: flex; flex-direction: column; gap: 8px; max-height: 220px; overflow-y: auto; padding-right: 2px;"
                    >
                      <div
                        v-for="(fEntry, fIdx) in getProductFileHistory(formData)"
                        :key="fEntry.id || fIdx"
                        style="background: rgba(30, 41, 59, 0.72); border: 1px solid rgba(148, 163, 184, 0.22); border-radius: 8px; padding: 8px 10px; display: flex; flex-direction: column; gap: 5px;"
                      >
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
                          <div style="display: flex; align-items: center; gap: 6px; min-width: 0; flex: 1;">
                            <span
                              style="font-size: 10px; padding: 1px 6px; border-radius: 4px; font-weight: 700; flex-shrink: 0;"
                              :style="fIdx === 0 ? 'background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4);' : 'background: rgba(100, 116, 139, 0.25); color: #cbd5e1;'"
                            >
                              {{ fIdx === 0 ? 'MỚI NHẤT' : `#${getProductFileHistory(formData).length - fIdx}` }}
                            </span>
                            <a
                              v-if="fEntry.file_url"
                              :href="getAttachedFileViewHref(fEntry)"
                              target="_blank"
                              rel="noopener noreferrer"
                              style="font-size: 12px; font-weight: 700; color: #38bdf8; text-decoration: underline; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                              :title="`Click để mở xem: ${fEntry.file_name}`"
                            >{{ fEntry.file_name }}</a>
                            <strong
                              v-else
                              style="font-size: 12px; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                            >{{ fEntry.file_name }}</strong>
                          </div>
                          <div style="display: flex; align-items: center; gap: 5px; flex-shrink: 0;">
                            <a
                              v-if="fEntry.file_url"
                              :href="getAttachedFileViewHref(fEntry)"
                              target="_blank"
                              rel="noopener noreferrer"
                              class="vendor-file-office-btn"
                              style="text-decoration: none; padding: 2px 7px; font-size: 10.5px;"
                            >
                              {{ isExcelAttachedFile(fEntry) ? '👁️ ViewOffice' : '👁️ Xem file' }}
                            </a>
                            <a
                              v-if="fEntry.file_url"
                              :href="fEntry.file_url"
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              class="vendor-file-download-btn"
                              style="text-decoration: none; padding: 2px 7px; font-size: 10.5px;"
                            >⬇ Tải</a>
                            <button
                              type="button"
                              style="background: rgba(168, 85, 247, 0.16); border: 1px solid rgba(192, 132, 252, 0.4); color: #e9d5ff; border-radius: 5px; padding: 2px 6px; font-size: 10.5px; font-weight: 600; cursor: pointer;"
                              title="Áp dụng lại mức Giá vốn/off hãng, Giá bán, Giá nhập từ file này vào sản phẩm"
                              @click="applyFileHistoryPriceToFormData(fEntry)"
                            >⚡ Áp giá</button>
                            <button
                              type="button"
                              style="background: rgba(239, 68, 68, 0.14); border: 1px solid rgba(239, 68, 68, 0.35); color: #fca5a5; border-radius: 5px; padding: 2px 6px; font-size: 10.5px; font-weight: 700; cursor: pointer;"
                              title="Xóa file này khỏi lịch sử của sản phẩm"
                              @click="removeFileEntryFromFormData(fIdx)"
                            >✕</button>
                          </div>
                        </div>
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; font-size: 11px; color: #94a3b8;">
                          <span>
                            🕒 Thời gian up file: <strong style="color: #f8fafc;">{{ formatLastUpdated(fEntry.file_uploaded_at) }}</strong>
                            <span v-if="fEntry.ghi_chu_file" style="color: #64748b;"> · {{ fEntry.ghi_chu_file }}</span>
                          </span>
                          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                            <span style="color: #c084fc;">
                              Giá vốn/off hãng: <strong style="color: #e9d5ff;">{{ formatCurrency(fEntry.gia_von || 0, fEntry.don_vi_tien_te || formData.Don_vi_tien_te) }}</strong>
                            </span>
                            <span style="color: #34d399;">
                              Giá bán: <strong>{{ formatCurrency(fEntry.don_gia || 0, fEntry.don_vi_tien_te || formData.Don_vi_tien_te) }}</strong>
                            </span>
                            <span v-if="toNum(fEntry.gia_nhap, 0) > 0" style="color: #fbbf24;">
                              Giá nhập: <strong>{{ formatCurrency(fEntry.gia_nhap, fEntry.don_vi_tien_te || formData.Don_vi_tien_te) }}</strong>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!--
                <div class="form-group col-span-2">
                  <label>Mức % Off</label>
                  <input v-model="formData.muc_phan_tram_off" type="number" step="0.1" />
                </div>
                -->
              </div>

              <!-- HIDDEN FIELDS -->
              <!--
              <div class="form-group">
                <label>Trạng thái</label>
                <input v-model="formData.Trang_thai" type="text" />
              </div>
              <div class="form-group">
                <label>Giá tiêu chuẩn</label>
                <input v-model="formData.Gia_tieu_chuan" type="number" />
              </div>
              <div class="form-group">
                <label>Giá Hardware</label>
                <input v-model="formData.gia_hardware" type="number" />
              </div>
              <div class="form-group">
                <label>Mã hàng LK</label>
                <input v-model="formData.Ma_hang_lien_ket" type="text" />
              </div>
              <div class="form-group">
                <label>Tên hàng LK</label>
                <input v-model="formData.Ten_hang_lien_ket" type="text" />
              </div>
              <div class="form-group">
                <label>Mô tả chung</label>
                <textarea v-model="formData.Mo_ta_chung" rows="2"></textarea>
              </div>
              <div class="form-group">
                <label>Mô tả chi tiết</label>
                <textarea v-model="formData.Mo_ta_chi_tiet" rows="3"></textarea>
              </div>
              -->
            </div>
          </form>
        </div>
        <div class="modal-footer" style="display: flex; justify-content: space-between;">
          <div>
            <button v-if="isEditing" type="button" class="btn btn-danger" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.3);" @click="requestDelete(formData)">Xóa</button>
          </div>
          <div style="display: flex; gap: 12px;">
            <button type="button" class="btn btn-secondary" @click="closeModal">Hủy</button>
            <button v-if="isDirty" type="button" class="btn btn-primary" @click="saveItem" :disabled="saving">
              <span v-if="saving" class="spinner"></span>
              {{ saving ? 'Đang lưu...' : 'Lưu lại' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL LỊCH SỬ FILE & BIẾN ĐỘNG GIÁ CỦA SẢN PHẨM -->
    <div v-if="productFilesModal.show && productFilesModal.item" class="modal-overlay" @click.self="closeProductFilesModal">
      <div class="modal-content" style="max-width: 780px; width: 95%;">
        <div class="modal-header">
          <div style="display: flex; flex-direction: column; gap: 3px;">
            <h2 style="font-size: 17px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span>📎 Lịch sử File &amp; Biến động giá:</span>
              <code style="color: #38bdf8; background: rgba(56, 189, 248, 0.14); padding: 2px 8px; border-radius: 6px;">{{ productFilesModal.item.Ma_hang }}</code>
            </h2>
            <span style="font-size: 12.5px; color: #94a3b8;">
              {{ productFilesModal.item.Ten_hang }} · Mốc thời gian tính riêng theo từng thời điểm upload file
            </span>
          </div>
          <button class="close-btn" @click="closeProductFilesModal">&times;</button>
        </div>

        <div class="modal-body" style="padding: 16px 20px; display: flex; flex-direction: column; gap: 14px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 10px; padding: 10px 14px;">
            <div style="font-size: 12.5px; color: #cbd5e1; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
              <span>Giá hiện tại trên DB:</span>
              <span style="color: #c084fc;">Giá vốn/off hãng: <strong style="color: #e9d5ff;">{{ formatCurrency(productFilesModal.item.Gia_tieu_chuan || 0, productFilesModal.item.Don_vi_tien_te) }}</strong></span>
              <span style="color: #34d399;">Giá bán: <strong>{{ formatCurrency(productFilesModal.item.Don_gia || 0, productFilesModal.item.Don_vi_tien_te) }}</strong></span>
              <span v-if="toNum(productFilesModal.item.gia_nhap, 0) > 0" style="color: #fbbf24;">Giá nhập: <strong>{{ formatCurrency(productFilesModal.item.gia_nhap, productFilesModal.item.Don_vi_tien_te) }}</strong></span>
            </div>
            <label
              style="background: rgba(56, 189, 248, 0.18); border: 1px solid rgba(56, 189, 248, 0.5); color: #38bdf8; border-radius: 7px; padding: 6px 12px; font-size: 12px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;"
            >
              <input
                type="file"
                multiple
                style="display: none;"
                @change="handleAttachFileDirectToProduct($event, productFilesModal.item)"
              />
              <span>☁️ + Upload thêm File / Ảnh cho SP này</span>
            </label>
          </div>

          <div
            v-if="!getProductFileHistory(productFilesModal.item).length"
            style="padding: 32px 16px; text-align: center; color: #64748b; border: 1px dashed rgba(148, 163, 184, 0.25); border-radius: 10px;"
          >
            Sản phẩm này chưa có file đính kèm nào trong lịch sử. Bấm <strong>"+ Upload thêm File / Ảnh"</strong> hoặc thực hiện Import / Check giá để lưu lịch sử file.
          </div>

          <div v-else style="display: flex; flex-direction: column; gap: 10px; max-height: 420px; overflow-y: auto;">
            <div
              v-for="(fEntry, fIdx) in getProductFileHistory(productFilesModal.item)"
              :key="fEntry.id || fIdx"
              style="background: rgba(30, 41, 59, 0.78); border: 1px solid rgba(148, 163, 184, 0.25); border-radius: 10px; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px;"
            >
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1;">
                  <span
                    style="font-size: 10.5px; padding: 2px 8px; border-radius: 99px; font-weight: 800; flex-shrink: 0;"
                    :style="fIdx === 0 ? 'background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.45);' : 'background: rgba(100, 116, 139, 0.25); color: #cbd5e1;'"
                  >
                    {{ fIdx === 0 ? 'FILE MỚI NHẤT' : `Lần #${getProductFileHistory(productFilesModal.item).length - fIdx}` }}
                  </span>
                  <a
                    v-if="fEntry.file_url"
                    :href="getAttachedFileViewHref(fEntry)"
                    target="_blank"
                    rel="noopener noreferrer"
                    style="font-size: 13.5px; font-weight: 700; color: #38bdf8; text-decoration: underline; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                  >{{ fEntry.file_name }}</a>
                  <strong v-else style="font-size: 13.5px; color: #f8fafc;">{{ fEntry.file_name }}</strong>
                </div>
                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                  <a
                    v-if="fEntry.file_url"
                    :href="getAttachedFileViewHref(fEntry)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="vendor-file-office-btn"
                    style="text-decoration: none;"
                  >
                    {{ isExcelAttachedFile(fEntry) ? '👁️ Xem bằng ViewOffice' : '👁️ Mở xem File / Ảnh' }}
                  </a>
                  <a
                    v-if="fEntry.file_url"
                    :href="fEntry.file_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    class="vendor-file-download-btn"
                    style="text-decoration: none;"
                  >⬇ Tải về</a>
                  <button
                    type="button"
                    style="background: rgba(239, 68, 68, 0.14); border: 1px solid rgba(239, 68, 68, 0.35); color: #fca5a5; border-radius: 6px; padding: 3px 8px; font-size: 11px; font-weight: 700; cursor: pointer;"
                    title="Xóa bản ghi file này khỏi lịch sử sản phẩm"
                    @click="removeFileDirectFromProduct(productFilesModal.item, fIdx)"
                  >✕ Xóa</button>
                </div>
              </div>

              <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; font-size: 12px; color: #94a3b8; border-top: 1px dashed rgba(255,255,255,0.08); padding-top: 6px;">
                <div>
                  🕒 Mốc thời gian upload file:
                  <strong style="color: #f8fafc;">{{ formatLastUpdated(fEntry.file_uploaded_at) }}</strong>
                  <span v-if="fEntry.ghi_chu_file" style="color: #64748b;"> · ({{ fEntry.ghi_chu_file }})</span>
                </div>
                <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                  <span style="color: #c084fc;">
                    Giá vốn/off hãng: <strong style="color: #e9d5ff;">{{ formatCurrency(fEntry.gia_von || 0, fEntry.don_vi_tien_te || productFilesModal.item.Don_vi_tien_te) }}</strong>
                  </span>
                  <span style="color: #34d399;">
                    Đơn giá bán: <strong>{{ formatCurrency(fEntry.don_gia || 0, fEntry.don_vi_tien_te || productFilesModal.item.Don_vi_tien_te) }}</strong>
                  </span>
                  <span v-if="toNum(fEntry.gia_nhap, 0) > 0" style="color: #fbbf24;">
                    Giá nhập: <strong>{{ formatCurrency(fEntry.gia_nhap, fEntry.don_vi_tien_te || productFilesModal.item.Don_vi_tien_te) }}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer" style="display: flex; justify-content: flex-end;">
          <button type="button" class="btn btn-secondary" @click="closeProductFilesModal">Đóng</button>
        </div>
      </div>
    </div>

    <!-- IMPORT PREVIEW MODAL -->
    <div v-if="showImportModal" class="import-overlay" @click.self="showImportModal = false">
      <div class="import-modal">
        <!-- Header -->
        <div class="import-modal__header">
          <div class="import-modal__header-left">
            <div class="import-modal__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <div>
              <h2 class="import-modal__title">Import dữ liệu hàng hóa</h2>
              <p class="import-modal__subtitle">Kiểm tra và chỉnh sửa trước khi lưu vào hệ thống</p>
            </div>
          </div>
          <button class="import-modal__close" @click="showImportModal = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Stats Cards -->
        <div class="import-stats">
          <div class="import-stat-card">
            <div class="import-stat-card__value">{{ importData.length }}</div>
            <div class="import-stat-card__label">Tổng sản phẩm</div>
          </div>
          <div class="import-stat-card import-stat-card--blue">
            <div class="import-stat-card__value">{{ importSheetNames.length }}</div>
            <div class="import-stat-card__label">Sheet / Nhóm</div>
          </div>
          <div class="import-stat-card import-stat-card--amber">
            <div class="import-stat-card__value">{{ filteredImportData.length }}</div>
            <div class="import-stat-card__label">Đang lọc</div>
          </div>
          <div class="import-stat-card import-stat-card--green">
            <div class="import-stat-card__value">{{ importData[0]?.Ten_nha_cung_cap || '—' }}</div>
            <div class="import-stat-card__label">Nhà cung cấp</div>
          </div>
        </div>

        <!-- Thanh công cụ Điều chỉnh Giá bán từ Giá vốn & Phân tích lại bằng AI -->
        <div
          style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 10px 18px; background: rgba(168, 85, 247, 0.08); border-bottom: 1px solid rgba(192, 132, 252, 0.25);"
        >
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span style="font-size: 12.5px; color: #e9d5ff; font-weight: 700;">
              ⚡ Tính Giá bán (Đơn giá) từ Giá vốn / Giá off hãng:
            </span>
            <select
              v-model="importBulkCostMarkup.direction"
              class="pl-row-select"
              :class="importBulkCostMarkup.direction === 'decrease' ? 'down' : 'up'"
              style="height: 32px; font-size: 12px;"
            >
              <option value="increase">+ Tăng (Lãi)</option>
              <option value="decrease">- Giảm (Off)</option>
            </select>
            <select
              v-model="importBulkCostMarkup.type"
              class="pl-row-select"
              style="height: 32px; font-size: 12px;"
            >
              <option value="percent">% (Phần trăm)</option>
              <option value="amount">Số tiền cụ thể</option>
            </select>
            <div v-if="importBulkCostMarkup.type === 'percent'" style="position: relative; display: inline-flex; align-items: center;">
              <NumberInput
                v-model="importBulkCostMarkup.value"
                :decimals="2"
                style="width: 86px; height: 32px; padding: 4px 24px 4px 8px; border-radius: 6px; border: 1px solid rgba(192, 132, 252, 0.45); background: #0f172a; color: #34d399; font-weight: 700; font-size: 13px; text-align: right;"
              />
              <span style="position: absolute; right: 7px; font-size: 12px; color: #94a3b8; font-weight: 700; pointer-events: none;">%</span>
            </div>
            <div v-else style="width: 145px;">
              <NumberInput v-model="importBulkCostMarkup.value" :decimals="0" />
            </div>
            <button
              type="button"
              class="pl-mini-btn"
              style="background: rgba(16, 185, 129, 0.2); border-color: #10b981; color: #6ee7b7; font-weight: 700;"
              @click="applyImportBulkMarkupToAll"
            >
              ✓ Áp dụng cho tất cả ({{ importData.length }} SP)
            </button>
          </div>

          <div v-if="lastPurchaseUploadFile" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span style="font-size: 12px; color: #cbd5e1;">Đọc chưa chuẩn hoặc sai định dạng?</span>
            <button
              type="button"
              class="pl-mini-btn"
              style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.28), rgba(59, 130, 246, 0.28)); border-color: #c084fc; color: #f3e8ff; font-weight: 700;"
              @click="runAiPurchaseFileAnalysis(lastPurchaseUploadFile)"
            >
              ✨ Dùng AI phân tích lại file này
            </button>
          </div>
        </div>

        <!-- Thanh tự động cập nhật File Gốc / Trung Gian lên Cloudinary khi Import -->
        <div
          v-if="pendingImportVendorRef"
          style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 10px 18px; background: rgba(56, 189, 248, 0.1); border-bottom: 1px solid rgba(56, 189, 248, 0.3);"
        >
          <label style="display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; color: #bae6fd; font-weight: 700;">
            <input
              type="checkbox"
              v-model="syncImportFileToCloudinaryRef"
              style="width: 16px; height: 16px; accent-color: #38bdf8; cursor: pointer;"
            />
            <span>
              ☁️ Đồng thời đẩy file <code>{{ pendingImportVendorRef.file?.name }}</code> lên <strong>Cloudinary</strong> làm File Gốc / Trung Gian chuẩn mới cho <strong>{{ pendingImportVendorRef.vendor?.toUpperCase() }}</strong> (Không còn bị dính giá file cũ khi đối chiếu)
            </span>
          </label>
        </div>

        <!-- Thanh cấu hình chuẩn hóa SOPHOS (hiển thị khi đang import dữ liệu SOPHOS) -->
        <div
          v-if="importData[0]?.Ten_nha_cung_cap === 'SOPHOS'"
          style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 10px 18px; background: rgba(245, 158, 11, 0.08); border-bottom: 1px solid rgba(245, 158, 11, 0.25);"
        >
          <label style="display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; color: #fde68a; font-weight: 700;">
            <input
              type="checkbox"
              v-model="clearOldSophosBeforeImport"
              style="width: 16px; height: 16px; accent-color: #f59e0b; cursor: pointer;"
            />
            <span>🗑️ Xóa toàn bộ hàng SOPHOS cũ trong Database trước khi lưu bộ mã mới (Chuẩn hóa <code>Ma_hang = SKU</code>)</span>
          </label>

          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span style="font-size: 12px; color: #cbd5e1; font-weight: 600;">Nguồn nạp nhanh:</span>
            <button
              type="button"
              class="pl-mini-btn"
              :style="sophosReimportMode === 'bom' ? 'background: rgba(16,185,129,0.22); border-color: #10b981; color: #6ee7b7;' : ''"
              @click="openSophosStandardizedReimportModal('bom')"
              title="182 mã SKU chuẩn trong file_trung_gian_SOPHOS kết hợp Description / Volume / Months / New-Renewal từ SKU_List"
            >
              📘 BOM Trung Gian + SKU_List (182 mã)
            </button>
            <button
              type="button"
              class="pl-mini-btn"
              :style="sophosReimportMode === 'bom_plus_skulist' ? 'background: rgba(245,158,11,0.22); border-color: #f59e0b; color: #fde68a;' : ''"
              @click="openSophosStandardizedReimportModal('bom_plus_skulist')"
              title="Bao gồm 182 mã BOM Trung Gian + Toàn bộ mã CORP (New & Renewal, 12/24/36 months, mọi range users) từ sophos-pricelist-reseller_SKU_list.xlsb"
            >
              📙 BOM + Toàn bộ SKU_Tab CORP (New &amp; Renewal)
            </button>
            <button
              type="button"
              class="pl-mini-btn"
              :style="sophosReimportMode === 'all_skulist' ? 'background: rgba(56,189,248,0.22); border-color: #38bdf8; color: #bae6fd;' : ''"
              @click="openSophosStandardizedReimportModal('all_skulist')"
              title="Toàn bộ 9,958 mã SKU trong sophos-pricelist-reseller_SKU_list-asean-usd-2026-3.0.xlsb"
            >
              🌐 Tất cả SKU_Tab (9,958 mã)
            </button>
          </div>
        </div>

        <!-- Sheet Tabs -->
        <div class="import-tabs">
          <button v-for="sheet in importSheetNames" :key="sheet"
                  @click="activeImportSheet = sheet; importDisplayLimit = 100"
                  :class="['import-tab', { 'import-tab--active': activeImportSheet === sheet }]">
            <span class="import-tab__name">{{ sheet }}</span>
            <span class="import-tab__badge">{{ importData.filter(p => p.Sheet_name === sheet).length }}</span>
          </button>
        </div>

        <!-- Table -->
        <div class="import-table-wrap">
          <table class="import-table">
            <thead>
              <tr>
                <th class="import-th--sticky-left import-th--idx">#</th>
                <th style="min-width:155px">Mã hàng</th>
                <th style="min-width:135px; color: #c4b5fd;">SKU Code</th>
                <th style="min-width:250px">Tên hàng</th>
                <th style="min-width:290px">Description (Theo file)</th>
                <th style="min-width:520px">Features</th>
                <th style="min-width:170px">Danh mục</th>
                <th style="min-width:75px">Type</th>
                <th style="min-width:125px; color: #e9d5ff;">Giá vốn / Giá off hãng</th>
                <th style="min-width:115px">Giá bán (Đơn giá)</th>
                <th style="min-width:100px">Giá nhập</th>
                <th style="min-width:70px">VAT%</th>
                <th style="min-width:70px">Tiền tệ</th>
                <th style="min-width:80px">Tỉ giá</th>
                <th style="min-width:80px">ĐVT</th>
                <th style="min-width:105px">License (months)</th>
                <th style="min-width:140px">Volume (Range Users)</th>
                <th style="min-width:105px">Trạng thái</th>
                <th style="min-width:110px">Bảo hành</th>
                <th style="min-width:100px">NCC</th>
                <th style="min-width:100px">Mã NCC</th>
                <th style="min-width:80px">% Off</th>
                <th style="min-width:140px">Mã hàng LK</th>
                <th style="min-width:140px">Tên hàng LK</th>
                <th style="min-width:120px">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in displayedImportData" :key="row.Ma_hang + '_' + idx" class="import-row">
                <td class="import-th--sticky-left import-th--idx import-row__idx">{{ idx + 1 }}</td>
                <td><input type="text" v-model="row.Ma_hang" class="imp-input imp-input--code" /></td>
                <td><input type="text" v-model="row.sku_code" class="imp-input imp-input--code" style="color: #c4b5fd;" placeholder="SKU Code..." /></td>
                <td><textarea v-model="row.Ten_hang" class="imp-input imp-input--textarea imp-input--autofit" rows="1"></textarea></td>
                <td><textarea v-model="row.Description" class="imp-input imp-input--textarea imp-input--autofit" rows="1" placeholder="Description từ file..."></textarea></td>
                <td>
                  <div class="imp-features-cell">
                    <div
                      class="imp-input imp-input--rich"
                      contenteditable="true"
                      v-html="formatFeaturesHtml(row.Features)"
                      @blur="row.Features = $event.currentTarget.innerHTML"
                    ></div>
                    <button
                      type="button"
                      class="imp-features-edit-btn"
                      title="Mở công cụ chỉnh sửa format Features"
                      @click="openImportFeaturesEditor(row)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                  </div>
                </td>
                <td><textarea v-model="row.Danh_muc" class="imp-input imp-input--textarea imp-input--autofit" rows="1"></textarea></td>
                <td>
                  <input
                    type="text"
                    v-model="row.Type"
                    class="imp-input imp-input--sm"
                    :style="{ color: String(row.Type || '').toLowerCase().includes('renewal') ? '#fbbf24' : '#34d399', fontWeight: 700 }"
                  />
                </td>
                <td><NumberInput v-model="row.Gia_tieu_chuan" :decimals="String(row.Don_vi_tien_te || 'VND').toUpperCase() === 'USD' ? 2 : 0" class="imp-input imp-input--num" style="color: #e9d5ff; font-weight: 700;" /></td>
                <td><NumberInput v-model="row.Don_gia" :decimals="String(row.Don_vi_tien_te || 'VND').toUpperCase() === 'USD' ? 2 : 0" class="imp-input imp-input--num imp-input--green" /></td>
                <td><NumberInput v-model="row.gia_nhap" :decimals="String(row.Don_vi_tien_te || 'VND').toUpperCase() === 'USD' ? 2 : 0" class="imp-input imp-input--num imp-input--green" /></td>
                <td><NumberInput v-model="row.Thue_VAT" :decimals="2" class="imp-input imp-input--num imp-input--green" /></td>
                <td><input type="text" v-model="row.Don_vi_tien_te" class="imp-input imp-input--sm" /></td>
                <td><NumberInput v-model="row.Ti_gia" :decimals="0" class="imp-input imp-input--num imp-input--green" /></td>
                <td><input type="text" v-model="row.DVT" class="imp-input imp-input--sm" /></td>
                <td><input type="text" v-model="row.License_duration" class="imp-input" placeholder="12 months..." /></td>
                <td><input type="text" v-model="row.volume" class="imp-input" placeholder="1-9 users..." style="color: #38bdf8; font-weight: 600;" /></td>
                <td><input type="text" v-model="row.Trang_thai" class="imp-input imp-input--sm" /></td>
                <td><input type="text" v-model="row.thoi_han_bao_hanh" class="imp-input" /></td>
                <td><input type="text" v-model="row.Ten_nha_cung_cap" class="imp-input" /></td>
                <td><input type="text" v-model="row.Ma_nha_cung_cap" class="imp-input" /></td>
                <td><NumberInput v-model="row.muc_phan_tram_off" :decimals="2" class="imp-input imp-input--num" /></td>
                <td><textarea v-model="row.Ma_hang_lien_ket" class="imp-input imp-input--textarea" rows="1"></textarea></td>
                <td><textarea v-model="row.Ten_hang_lien_ket" class="imp-input imp-input--textarea" rows="1"></textarea></td>
                <td><input type="text" v-model="row.Ghi_chu" class="imp-input" /></td>
              </tr>
            </tbody>
          </table>

          <div v-if="filteredImportData.length > importDisplayLimit" style="padding: 12px; text-align: center; background: #0f172a;">
            <button
              type="button"
              class="btn btn-outline"
              @click="importDisplayLimit += 150"
              style="font-size: 12.5px; padding: 6px 18px;"
            >
              Hiển thị thêm 150 dòng (đang hiện {{ displayedImportData.length }} / {{ filteredImportData.length }} SP trong tab này)
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="import-modal__footer">
          <button class="btn btn-secondary" @click="showImportModal = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Hủy bỏ
          </button>
          <button class="btn import-btn-save" @click="confirmImport" :disabled="importing">
            <span v-if="importing" class="spinner"></span>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            {{ importing ? 'Đang lưu...' : `Lưu tất cả ${importData.length} sản phẩm` }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL CHỈNH SỬA FORMAT FEATURES TRONG BẢNG IMPORT PREVIEW -->
    <div v-if="importFeaturesEditRow" class="modal-overlay" @click.self="importFeaturesEditRow = null" style="z-index: 10400;">
      <div class="modal-content" style="max-width: 820px;">
        <div class="modal-header">
          <h2>Chỉnh sửa định dạng Features — {{ importFeaturesEditRow.Ma_hang }}</h2>
          <button class="close-btn" @click="importFeaturesEditRow = null">&times;</button>
        </div>
        <div class="modal-body">
          <ExcelEditor v-model="importFeaturesEditRow.Features" placeholder="Nhập tính năng sản phẩm..." class="features-excel-editor" />
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="importFeaturesEditRow = null">Xong</button>
        </div>
      </div>
    </div>

    <!-- CONFIRM DELETE MODAL -->
    <div v-if="confirmDeleteModal.show" class="modal-overlay" @click.self="confirmDeleteModal.show = false" style="z-index: 100010;">
      <div class="custom-alert-modal">
        <div class="alert-icon question" style="color: #ef4444; background: rgba(239, 68, 68, 0.1);">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </div>
        <h3 class="alert-title" style="color: #f8fafc; font-size: 18px; margin: 16px 0 8px; font-weight: 700;">Xác nhận Xóa</h3>
        <p class="alert-desc" style="color: #94a3b8; font-size: 14px; margin-bottom: 24px;">Bạn có chắc muốn xóa hàng hóa <br><span style="color:#ef4444; font-weight: 700;">{{ confirmDeleteModal.item?.Ten_hang }}</span>?</p>
        <div class="alert-actions" style="display: flex; gap: 12px; justify-content: center;">
          <button class="btn btn-secondary" @click="confirmDeleteModal.show = false">Hủy</button>
          <button class="btn btn-primary" style="background: #ef4444; border: none; box-shadow: 0 4px 12px rgba(239,68,68,0.3);" @click="executeDelete">Xóa ngay</button>
        </div>
      </div>
    </div>

    <!-- CONFIRM DELETE PRICE LIST MODAL -->
    <div v-if="confirmDeletePriceListModal.show" class="modal-overlay" @click.self="confirmDeletePriceListModal.show = false" style="z-index: 100010;">
      <div class="custom-alert-modal">
        <div class="alert-icon question" style="color: #ef4444; background: rgba(239, 68, 68, 0.1);">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
        </div>
        <h3 class="alert-title" style="color: #f8fafc; font-size: 18px; margin: 16px 0 8px; font-weight: 700;">Xóa Bảng Giá</h3>
        <p class="alert-desc" style="color: #94a3b8; font-size: 14px; margin-bottom: 24px;">
          Bạn có chắc muốn xóa bảng giá <br>
          <span style="color:#f59e0b; font-weight: 700;">{{ confirmDeletePriceListModal.priceList?.ten_bang_gia }}</span>?
        </p>
        <div class="alert-actions" style="display: flex; gap: 12px; justify-content: center;">
          <button class="btn btn-secondary" @click="confirmDeletePriceListModal.show = false">Hủy</button>
          <button class="btn btn-primary" style="background: #ef4444; border: none; box-shadow: 0 4px 12px rgba(239,68,68,0.3);" @click="executeDeletePriceList">Xóa bảng giá</button>
        </div>
      </div>
    </div>

    <!-- MODAL THÔNG BÁO DÙNG AI PHÂN TÍCH KHI IMPORT FILE MUA HÀNG SAI ĐỊNH DẠNG / KHÔNG ĐỌC ĐƯỢC GIÁ VỐN -->
    <div v-if="aiPurchaseFallbackModal.show" class="modal-overlay" @click.self="aiPurchaseFallbackModal.show = false" style="z-index: 100010;">
      <div class="custom-alert-modal" style="max-width: 520px;">
        <div class="alert-icon question" style="color: #c084fc; background: rgba(168, 85, 247, 0.14); border: 1px solid rgba(192, 132, 252, 0.35);">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/><path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4z"/></svg>
        </div>
        <h3 class="alert-title" style="color: #f8fafc; font-size: 18px; margin: 16px 0 8px; font-weight: 700;">
          Không đọc được Giá vốn hoặc sai định dạng chuẩn
        </h3>
        <p class="alert-desc" style="color: #cbd5e1; font-size: 13.5px; margin-bottom: 22px; line-height: 1.55;">
          File <strong style="color: #e9d5ff;">{{ aiPurchaseFallbackModal.fileName }}</strong> có bố cục khác định dạng chuẩn hoặc không nhận diện được cột Giá vốn sau thuế.<br><br>
          Bạn có muốn dùng <strong style="color: #38bdf8;">AI (DeepSeek)</strong> để tự động phân tích cấu trúc file và đọc <strong>Giá vốn / Giá off hãng</strong> không?
        </p>
        <div class="alert-actions" style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <button class="btn btn-secondary" @click="aiPurchaseFallbackModal.show = false">Hủy bỏ</button>
          <button
            class="btn btn-primary"
            style="background: linear-gradient(135deg, #8b5cf6, #3b82f6); border: none; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4); font-weight: 700;"
            @click="confirmAiPurchaseFallback"
          >
            ✨ Dùng AI phân tích ngay
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL THAY ĐỔI TỈ GIÁ (DÀNH CHO USD) -->
    <div v-if="showUsdRateModal" class="modal-overlay" @click.self="closeUsdRateModal" style="z-index: 10050;">
      <div class="modal-content" style="max-width: 520px; border: 1px solid rgba(16, 185, 129, 0.45); box-shadow: 0 20px 50px rgba(0, 0, 0, 0.65);">
        <div class="modal-header" style="background: linear-gradient(135deg, rgba(6, 78, 59, 0.55), rgba(15, 23, 42, 0.95)); border-bottom: 1px solid rgba(16, 185, 129, 0.3);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(52, 211, 153, 0.4); display: flex; align-items: center; justify-content: center; color: #34d399; font-size: 18px; font-weight: 800;">
              $
            </div>
            <div>
              <h2 style="margin: 0; font-size: 17px; font-weight: 800; color: #ecfdf5;">Thay Đổi Tỉ Giá (Dành Cho USD)</h2>
              <div style="font-size: 12px; color: #6ee7b7; margin-top: 2px;">
                Cập nhật đồng loạt trường <strong>Tỉ giá (VNĐ)</strong> cho các mặt hàng USD
              </div>
            </div>
          </div>
          <button class="btn-close" @click="closeUsdRateModal">&times;</button>
        </div>

        <div class="modal-body" style="padding: 20px; display: flex; flex-direction: column; gap: 16px;">
          <!-- Thông tin hiện tại -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div style="padding: 12px; border-radius: 10px; background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(148, 163, 184, 0.2);">
              <div style="font-size: 11.5px; color: #94a3b8; font-weight: 600;">Tỉ giá USD hiện tại</div>
              <div style="font-size: 18px; font-weight: 800; color: #38bdf8; margin-top: 4px;">
                {{ formatCurrency(currentSystemUsdRate, 'VND') }}
              </div>
            </div>
            <div style="padding: 12px; border-radius: 10px; background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(148, 163, 184, 0.2);">
              <div style="font-size: 11.5px; color: #94a3b8; font-weight: 600;">Số sản phẩm USD</div>
              <div style="font-size: 18px; font-weight: 800; color: #34d399; margin-top: 4px;">
                {{ usdRateScope === 'filtered' ? filteredUsdItems.length : usdItems.length }} <span style="font-size: 12px; font-weight: 600; color: #94a3b8;">sản phẩm</span>
              </div>
            </div>
          </div>

          <!-- Phạm vi áp dụng -->
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 12.5px; font-weight: 700; color: #cbd5e1; margin-bottom: 8px; display: block;">Phạm vi áp dụng:</label>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <label
                style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 9px; cursor: pointer; transition: all 0.15s;"
                :style="usdRateScope === 'all'
                  ? 'background: rgba(16, 185, 129, 0.14); border: 1px solid rgba(52, 211, 153, 0.5); color: #ecfdf5;'
                  : 'background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(148, 163, 184, 0.2); color: #94a3b8;'"
              >
                <input type="radio" v-model="usdRateScope" value="all" style="accent-color: #10b981; width: 16px; height: 16px;" />
                <div style="flex: 1; font-size: 13px; font-weight: 600;">
                  Tất cả sản phẩm có đơn vị tiền tệ USD trên hệ thống
                  <span style="color: #34d399; font-weight: 800;">({{ usdItems.length }} SP)</span>
                </div>
              </label>

              <label
                v-if="filteredUsdItems.length > 0 && filteredUsdItems.length !== usdItems.length"
                style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 9px; cursor: pointer; transition: all 0.15s;"
                :style="usdRateScope === 'filtered'
                  ? 'background: rgba(56, 189, 248, 0.14); border: 1px solid rgba(56, 189, 248, 0.5); color: #f0f9ff;'
                  : 'background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(148, 163, 184, 0.2); color: #94a3b8;'"
              >
                <input type="radio" v-model="usdRateScope" value="filtered" style="accent-color: #38bdf8; width: 16px; height: 16px;" />
                <div style="flex: 1; font-size: 13px; font-weight: 600;">
                  Chỉ các sản phẩm USD trong danh sách đang lọc hiện tại
                  <span style="color: #38bdf8; font-weight: 800;">({{ filteredUsdItems.length }} SP)</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Nhập tỉ giá mới -->
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 13px; font-weight: 700; color: #f8fafc; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
              <span>Nhập tỉ giá mới (1 USD = ? VNĐ) <span class="required">*</span></span>
              <span v-if="Number(newUsdExchangeRate) > 0 && Number(newUsdExchangeRate) !== currentSystemUsdRate" :style="{ color: Number(newUsdExchangeRate) > currentSystemUsdRate ? '#fbbf24' : '#38bdf8', fontSize: '12px', fontWeight: 700 }">
                {{ Number(newUsdExchangeRate) > currentSystemUsdRate ? '▲ Tăng' : '▼ Giảm' }}
                {{ formatNumberPlain(Math.abs(Number(newUsdExchangeRate) - currentSystemUsdRate)) }} ₫
              </span>
            </label>
            <NumberInput
              v-model="newUsdExchangeRate"
              :decimals="0"
              placeholder="Ví dụ: 26.200"
              style="font-size: 18px; font-weight: 800; color: #34d399; border-color: rgba(16, 185, 129, 0.5); background: rgba(6, 78, 59, 0.2);"
            />
            <!-- Nút điều chỉnh nhanh -->
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 8px;">
              <span style="font-size: 11.5px; color: #94a3b8; margin-right: 2px;">Chọn / cộng trừ nhanh:</span>
              <button type="button" class="usd-quick-step-btn" @click="newUsdExchangeRate = Math.max(1, (Number(newUsdExchangeRate) || 0) - 500)">-500</button>
              <button type="button" class="usd-quick-step-btn" @click="newUsdExchangeRate = Math.max(1, (Number(newUsdExchangeRate) || 0) - 100)">-100</button>
              <button type="button" class="usd-quick-step-btn" @click="newUsdExchangeRate = (Number(newUsdExchangeRate) || 0) + 100">+100</button>
              <button type="button" class="usd-quick-step-btn" @click="newUsdExchangeRate = (Number(newUsdExchangeRate) || 0) + 500">+500</button>
              <button type="button" class="usd-quick-step-btn preset" @click="newUsdExchangeRate = 25500">25.500</button>
              <button type="button" class="usd-quick-step-btn preset" @click="newUsdExchangeRate = 26000">26.000</button>
              <button type="button" class="usd-quick-step-btn preset" @click="newUsdExchangeRate = 26200">26.200</button>
              <button type="button" class="usd-quick-step-btn preset" @click="newUsdExchangeRate = 26500">26.500</button>
            </div>
          </div>

          <!-- Bảng quy đổi minh họa -->
          <div v-if="Number(newUsdExchangeRate) > 0" style="padding: 12px 14px; border-radius: 10px; background: rgba(16, 185, 129, 0.08); border: 1px dashed rgba(16, 185, 129, 0.35); font-size: 12.5px; color: #cbd5e1;">
            <div style="font-weight: 700; color: #6ee7b7; margin-bottom: 6px;">💡 Quy đổi tham khảo theo tỉ giá mới:</div>
            <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">
              <span>1 USD</span>
              <strong style="color: #f8fafc;">= {{ formatCurrency(Number(newUsdExchangeRate), 'VND') }}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">
              <span>100 USD</span>
              <strong style="color: #f8fafc;">= {{ formatCurrency(Number(newUsdExchangeRate) * 100, 'VND') }}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 3px 0;">
              <span>1,000 USD</span>
              <strong style="color: #34d399;">= {{ formatCurrency(Number(newUsdExchangeRate) * 1000, 'VND') }}</strong>
            </div>
          </div>
        </div>

        <div class="modal-footer" style="padding: 14px 20px; border-top: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: flex-end; gap: 10px;">
          <button type="button" class="btn btn-secondary" @click="closeUsdRateModal" :disabled="updatingUsdRate">Hủy</button>
          <button
            type="button"
            class="btn btn-primary"
            style="background: linear-gradient(135deg, #10b981, #059669); border: none; font-weight: 700; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);"
            :disabled="updatingUsdRate || !(Number(newUsdExchangeRate) > 0)"
            @click="applyUsdExchangeRateUpdate"
          >
            <span v-if="updatingUsdRate" class="spinner" style="margin-right: 6px;"></span>
            💱 Lưu & Cập Nhật Tỉ Giá ({{ usdRateScope === 'filtered' ? filteredUsdItems.length : usdItems.length }} SP)
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL TẠO / CẬP NHẬT BẢNG GIÁ -->
    <div v-if="showPriceListModal" class="import-overlay" @click.self="showPriceListModal = false" style="z-index: 10050;">
      <div class="import-modal pricelist-modal">
        <!-- Header -->
        <div class="import-modal__header">
          <div class="import-modal__title-group">
            <div class="import-modal__icon" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; border-color: rgba(245, 158, 11, 0.3);">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            </div>
            <div>
              <h2 class="import-modal__title">
                {{ isEditingPriceList ? 'Cập nhật Bảng Giá' : 'Tạo Bảng Giá Mới' }}
              </h2>
              <p class="import-modal__subtitle">
                Đã chọn <strong style="color: #34d399;">{{ selectedPriceListCount }}</strong> / {{ priceListRows.length }} sản phẩm trong kho
              </p>
            </div>
          </div>
          <button class="import-modal__close" @click="showPriceListModal = false" title="Đóng">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Khung Cấu hình Tên Bảng Giá & Khung Tăng/Giảm Giá Bán Hàng Loạt -->
        <div class="pl-config-section">
          <!-- Khung 1: Tên bảng giá, Thời gian áp dụng & Ghi chú -->
          <div class="pl-config-card">
            <div class="pl-config-card__title">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              1. Thông tin & Thời hạn Bảng Giá
            </div>
            <div class="pl-config-grid pl-config-grid--4">
              <div class="pl-field">
                <label>Tên bảng giá <span class="required">*</span></label>
                <input type="text" v-model="priceListForm.ten_bang_gia" placeholder="VD: Bảng giá Đại lý cấp 1..." class="pl-input" />
              </div>
              <div class="pl-field">
                <label>Thời gian bắt đầu áp dụng</label>
                <input type="date" v-model="priceListForm.ngay_bat_dau" class="pl-input" />
              </div>
              <div class="pl-field">
                <label>Thời gian kết thúc</label>
                <input type="date" v-model="priceListForm.ngay_ket_thuc" class="pl-input" />
              </div>
              <div class="pl-field">
                <label>Ghi chú / Mô tả</label>
                <input type="text" v-model="priceListForm.ghi_chu" placeholder="Ghi chú đối tượng áp dụng..." class="pl-input" />
              </div>
            </div>
            <div class="pl-autosync-box" :class="{ active: priceListForm.auto_sync_base_price }">
              <label class="pl-autosync-label">
                <input
                  type="checkbox"
                  v-model="priceListForm.auto_sync_base_price"
                  @change="onModalAutoSyncChange"
                  class="pl-autosync-checkbox"
                />
                <span class="pl-autosync-title">
                  {{ priceListForm.auto_sync_base_price ? '🔄 Tự động cập nhật khi bảng giá gốc thay đổi (Đang BẬT)' : '🔒 Giữ giá cố định — Không tự động đổi theo giá gốc (Đang TẮT)' }}
                </span>
              </label>
              <span class="pl-autosync-hint">
                {{ priceListForm.auto_sync_base_price
                  ? 'Khi giá gốc sản phẩm thay đổi (do Import Excel hoặc sửa giá gốc), bảng giá này sẽ tự động cập nhật giá bán mới theo % / số tiền đã cài đặt.'
                  : 'Bảng giá sẽ giữ cố định mức giá bán đã lưu, không bị thay đổi khi bảng giá gốc biến động.' }}
              </span>
            </div>
          </div>

          <!-- Khung 2: Khung điều chỉnh giá bán tăng / giảm theo % hoặc Số tiền -->
          <div class="pl-config-card pl-config-card--highlight">
            <div class="pl-config-card__title">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              2. Khung Điều Chỉnh Giá Bán (Tăng / Giảm theo % hoặc Số tiền)
            </div>
            <div class="pl-bulk-controls">
              <div class="pl-field" style="min-width: 135px;">
                <label>Chiều điều chỉnh</label>
                <select v-model="priceListForm.bulkDirection" @change="onBulkRuleAutoApply" class="pl-select" :class="priceListForm.bulkDirection === 'decrease' ? 'pl-select--down' : 'pl-select--up'">
                  <option value="increase">📈 Tăng giá (+)</option>
                  <option value="decrease">📉 Giảm giá (-)</option>
                </select>
              </div>
              <div class="pl-field" style="min-width: 150px;">
                <label>Đơn vị tính</label>
                <select v-model="priceListForm.bulkType" @change="onBulkRuleAutoApply" class="pl-select">
                  <option value="percent">Theo Phần trăm (%)</option>
                  <option value="amount">Theo Số tiền cố định</option>
                </select>
              </div>
              <div class="pl-field" style="flex: 1; min-width: 150px;">
                <label>
                  {{ priceListForm.bulkType === 'percent' ? 'Mức % tăng/giảm' : 'Số tiền tăng/giảm' }}
                </label>
                <div style="position: relative; display: flex; align-items: center;">
                  <NumberInput
                    v-if="priceListForm.bulkType === 'percent'"
                    v-model="priceListForm.bulkValue"
                    :decimals="2"
                    @update:modelValue="onBulkRuleAutoApply"
                    placeholder="VD: 10"
                    class="pl-input"
                    style="padding-right: 32px; font-weight: 700; color: #fbbf24;"
                  />
                  <NumberInput
                    v-else
                    v-model="priceListForm.bulkValue"
                    :decimals="0"
                    @update:modelValue="onBulkRuleAutoApply"
                    placeholder="VD: 500.000"
                    class="pl-input"
                    style="padding-right: 45px; font-weight: 700; color: #fbbf24;"
                  />
                  <span style="position: absolute; right: 10px; font-size: 12px; font-weight: 700; color: #94a3b8; pointer-events: none;">
                    {{ priceListForm.bulkType === 'percent' ? '%' : 'Tiền' }}
                  </span>
                </div>
              </div>
              <div class="pl-bulk-actions">
                <button type="button" class="pl-apply-btn pl-apply-btn--selected" @click="applyBulkRuleToSelected" title="Áp dụng mức tăng/giảm này cho tất cả sản phẩm đã tích chọn">
                  ⚡ Áp dụng cho SP đã chọn ({{ selectedPriceListCount }})
                </button>
                <button type="button" class="pl-apply-btn pl-apply-btn--filtered" @click="applyBulkRuleToFiltered" title="Tích chọn và áp dụng mức tăng/giảm này cho danh sách đang lọc bên dưới">
                  🎯 Chọn & Áp dụng SP đang lọc ({{ filteredModalProducts.length }})
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Thanh Lọc & Chọn Sản Phẩm -->
        <div class="pl-filter-bar">
          <div class="pl-filter-group">
            <select v-model="modalBrandFilter" class="pl-filter-select">
              <option value="ALL">🏢 Tất cả Hãng ({{ priceListBrandOptions.length }})</option>
              <option v-for="b in priceListBrandOptions" :key="b" :value="b">{{ b }}</option>
            </select>

            <select v-model="modalCategoryFilter" class="pl-filter-select" style="max-width: 260px;">
              <option value="ALL">📁 Tất cả Danh mục ({{ priceListCategoryOptions.length }})</option>
              <option v-for="c in priceListCategoryOptions" :key="c" :value="c">{{ c }}</option>
            </select>

            <div style="position: relative; flex: 1; min-width: 200px; max-width: 300px;">
              <input
                type="text"
                v-model="modalSearchQuery"
                placeholder="🔍 Tìm mã hàng, tên sản phẩm..."
                class="pl-filter-input"
              />
              <button
                v-if="modalSearchQuery"
                type="button"
                @click="modalSearchQuery = ''"
                style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 13px;"
              >✕</button>
            </div>

            <div class="pl-view-tabs">
              <button type="button" :class="['pl-view-tab', { active: modalViewMode === 'all' }]" @click="modalViewMode = 'all'">
                Tất cả ({{ priceListRows.length }})
              </button>
              <button type="button" :class="['pl-view-tab', { active: modalViewMode === 'selected' }]" @click="modalViewMode = 'selected'">
                Đã chọn ({{ selectedPriceListCount }})
              </button>
              <button type="button" :class="['pl-view-tab', { active: modalViewMode === 'unselected' }]" @click="modalViewMode = 'unselected'">
                Chưa chọn ({{ priceListRows.length - selectedPriceListCount }})
              </button>
            </div>
          </div>

          <div class="pl-selection-btns">
            <button type="button" class="pl-mini-btn" @click="selectAllFilteredInModal">
              ☑️ Chọn tất cả đang lọc ({{ filteredModalProducts.length }})
            </button>
            <button type="button" class="pl-mini-btn pl-mini-btn--muted" @click="deselectAllFilteredInModal">
              ⬜ Bỏ chọn đang lọc
            </button>
          </div>
        </div>

        <!-- Bảng danh sách sản phẩm trong Bảng Giá -->
        <div class="import-table-wrap" style="flex: 1;">
          <table class="import-table pl-table">
            <thead>
              <tr>
                <th style="width: 42px; text-align: center;">
                  <input
                    type="checkbox"
                    :checked="isAllFilteredSelected"
                    @change="toggleAllFilteredInModal($event.target.checked)"
                    title="Chọn / Bỏ chọn tất cả sản phẩm đang lọc"
                    style="width: 16px; height: 16px; cursor: pointer; accent-color: #10b981;"
                  />
                </th>
                <th style="width: 46px;">#</th>
                <th style="min-width: 150px;">Mã hàng</th>
                <th style="min-width: 260px;">Tên hàng hóa</th>
                <th style="min-width: 110px;">Hãng</th>
                <th style="min-width: 160px;">Danh mục</th>
                <th style="width: 75px; text-align: center;">Tiền tệ</th>
                <th style="min-width: 120px; text-align: right;">Giá nhập</th>
                <th style="min-width: 140px; text-align: right;">Giá bán gốc</th>
                <th style="min-width: 250px;">Tăng / Giảm riêng</th>
                <th style="min-width: 155px; text-align: right;">Giá bán mới (Bảng giá)</th>
                <th style="min-width: 120px; text-align: right;">Chênh lệch</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!displayedModalProducts.length">
                <td colspan="12" style="text-align: center; padding: 32px; color: #64748b;">
                  Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
              <tr
                v-for="(row, idx) in displayedModalProducts"
                :key="row.Ma_hang || idx"
                :class="{ 'pl-row-selected': row.selected }"
                @click="row.selected = !row.selected"
                style="cursor: pointer;"
              >
                <td style="text-align: center;" @click.stop>
                  <input
                    type="checkbox"
                    v-model="row.selected"
                    style="width: 16px; height: 16px; cursor: pointer; accent-color: #10b981;"
                  />
                </td>
                <td class="import-row-num">{{ idx + 1 }}</td>
                <td>
                  <span style="font-family: monospace; font-weight: 600; color: #93c5fd; font-size: 12px;">{{ row.Ma_hang }}</span>
                </td>
                <td>
                  <div style="font-weight: 500; color: #f1f5f9; font-size: 12.5px; line-height: 1.35;">{{ row.Ten_hang }}</div>
                </td>
                <td>
                  <span class="brand-badge" style="font-size: 10px; padding: 2px 7px;">{{ row.Ten_nha_cung_cap || '-' }}</span>
                </td>
                <td>
                  <span style="font-size: 11px; color: #94a3b8;">{{ row.Danh_muc || '-' }}</span>
                </td>
                <td style="text-align: center; font-weight: 600; color: #cbd5e1; font-size: 12px;">
                  {{ row.Don_vi_tien_te || 'VND' }}
                </td>
                <td style="text-align: right; color: #fbbf24; font-family: monospace; font-size: 12px;">
                  {{ formatNumberPlain(row.gia_nhap) }}
                </td>
                <td style="text-align: right; color: #cbd5e1; font-weight: 600; font-family: monospace; font-size: 12.5px;">
                  <div>{{ formatNumberPlain(row.gia_goc) }}</div>
                  <div v-if="row.last_updated" style="font-size: 10px; color: #64748b; font-weight: 400; font-family: sans-serif; margin-top: 2px;">
                    CN: {{ formatLastUpdated(row.last_updated) }}
                  </div>
                </td>
                <td @click.stop>
                  <div class="pl-row-adjust">
                    <select v-model="row.direction" @change="recalcRowPrice(row, true)" class="pl-row-select" :class="row.direction === 'decrease' ? 'down' : 'up'">
                      <option value="increase">+ Tăng</option>
                      <option value="decrease">- Giảm</option>
                    </select>
                    <select v-model="row.type" @change="recalcRowPrice(row, true)" class="pl-row-select">
                      <option value="percent">%</option>
                      <option value="amount">Tiền</option>
                      <option value="custom">Tùy chỉnh</option>
                    </select>
                    <NumberInput
                      v-if="row.type === 'percent'"
                      v-model="row.value"
                      :decimals="2"
                      @update:modelValue="recalcRowPrice(row, true)"
                      class="imp-input imp-input--num"
                      style="width: 72px; min-width: 72px;"
                      placeholder="0%"
                    />
                    <NumberInput
                      v-else-if="row.type === 'amount'"
                      v-model="row.value"
                      :decimals="String(row.Don_vi_tien_te || 'VND').toUpperCase() === 'USD' ? 2 : 0"
                      @update:modelValue="recalcRowPrice(row, true)"
                      class="imp-input imp-input--num"
                      style="width: 95px; min-width: 95px;"
                      placeholder="0"
                    />
                    <span v-else style="font-size: 11px; color: #94a3b8; padding: 0 4px;">Nhập trực tiếp</span>
                  </div>
                </td>
                <td @click.stop>
                  <NumberInput
                    v-model="row.gia_ban_moi"
                    :decimals="String(row.Don_vi_tien_te || 'VND').toUpperCase() === 'USD' ? 2 : 0"
                    @update:modelValue="onCustomRowPriceChange(row)"
                    class="imp-input imp-input--num imp-input--amber"
                    style="font-size: 13px; color: #34d399 !important; border-color: rgba(16, 185, 129, 0.35);"
                  />
                </td>
                <td style="text-align: right; font-family: monospace; font-size: 12px;">
                  <span :class="getRowDiffClass(row)">
                    {{ formatRowDiffText(row) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="filteredModalProducts.length > modalDisplayLimit" style="padding: 12px; text-align: center; background: #0f172a;">
            <button
              type="button"
              class="btn btn-outline"
              @click="modalDisplayLimit += 100"
              style="font-size: 12.5px; padding: 6px 18px;"
            >
              Hiển thị thêm 100 sản phẩm (còn {{ filteredModalProducts.length - modalDisplayLimit }} SP)
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="import-modal__footer" style="justify-content: space-between;">
          <div style="font-size: 13px; color: #94a3b8;">
            Tổng số SP trong bảng giá: <strong style="color: #34d399; font-size: 15px;">{{ selectedPriceListCount }}</strong> sản phẩm
          </div>
          <div style="display: flex; gap: 10px; align-items: center;">
            <button type="button" class="btn btn-secondary" @click="showPriceListModal = false">
              Hủy bỏ
            </button>
            <button type="button" class="btn btn-outline" style="border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;" @click="exportDraftPriceListToExcel">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Xuất Excel
            </button>
            <button type="button" class="btn import-btn-save" @click="savePriceList" :disabled="savingPriceList">
              <span v-if="savingPriceList" class="spinner"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              {{ savingPriceList ? 'Đang lưu...' : (isEditingPriceList ? `Cập nhật Bảng Giá (${selectedPriceListCount} SP)` : `Lưu Bảng Giá (${selectedPriceListCount} SP)`) }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL ĐỐI CHIẾU GIÁ TỪ ẢNH (BƯỚC 1 & BƯỚC 2) ═══ -->
    <div v-if="showImageCheckModal" class="import-overlay" @click.self="closeImageCheckModal">
      <div class="import-modal pricelist-modal imgcheck-modal">
        <!-- Header -->
        <div class="import-modal__header">
          <div class="import-modal__title-group">
            <div class="import-modal__icon" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 182, 212, 0.2)); border-color: rgba(16, 185, 129, 0.45); color: #34d399;">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
            </div>
            <div>
              <h2 class="import-modal__title" style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                <span>Đối Chiếu Giá Từ Ảnh</span>
                <div class="imgcheck-stepper">
                  <button
                    type="button"
                    class="imgcheck-step-tab"
                    :class="{ active: imageCheckActiveStep === 1 }"
                    @click="imageCheckActiveStep = 1"
                  >
                    1. Quét &amp; Bóc tách ảnh
                  </button>
                  <span style="color: #475569;">→</span>
                  <button
                    type="button"
                    class="imgcheck-step-tab"
                    :class="{ active: imageCheckActiveStep === 2 }"
                    :disabled="!validImageCheckRowsCount"
                    @click="runImagePriceComparison"
                  >
                    2. Đối chiếu DB / File Gốc / Trung Gian
                  </button>
                </div>
              </h2>
              <p class="import-modal__sub" v-if="imageCheckActiveStep === 1">
                Tải lên hoặc nhấn <strong>Ctrl + V</strong> để dán ảnh chụp màn hình Calculator (VD: <code>anh_check.jpg</code>). Hệ thống sẽ lọc viền đỏ, quét OCR và chuẩn hóa dữ liệu.
              </p>
              <p class="import-modal__sub" v-else>
                Đối chiếu 4 chiều giữa <strong>Ảnh Check</strong> ↔ <strong>file_goc_SOPHOS</strong> ({{ sophosRefData?.version || '2026-3.0-1' }}) ↔ <strong>file_trung_gian_SOPHOS</strong> ↔ <strong>Database (hang_hoa)</strong>.
              </p>
            </div>
          </div>
          <button class="import-modal__close" @click="closeImageCheckModal" title="Đóng">✕</button>
        </div>

        <!-- Body -->
        <div class="imgcheck-body">
          <!-- ══════════════════ BƯỚC 1: QUÉT & BÓC TÁCH ẢNH ══════════════════ -->
          <template v-if="imageCheckActiveStep === 1">
            <!-- TRẠNG THÁI 1: CHƯA CHỌN ẢNH -->
            <div
              v-if="!imageCheckPreviewUrl && !imageCheckScanning"
              class="imgcheck-dropzone"
              @click="triggerImageCheckInput"
              @dragover.prevent="imageCheckDragOver = true"
              @dragleave.prevent="imageCheckDragOver = false"
              @drop.prevent="handleImageCheckDrop"
              :class="{ 'drag-over': imageCheckDragOver }"
            >
              <input ref="imageCheckFileInput" type="file" accept="image/*" style="display: none" @change="handleImageCheckFileChange" />
              <div class="imgcheck-dropzone__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
              <div class="imgcheck-dropzone__title">Kéo thả ảnh vào đây, <span>Nhấn để chọn ảnh</span> hoặc nhấn <kbd>Ctrl + V</kbd></div>
              <div class="imgcheck-dropzone__hint">Hỗ trợ PNG, JPG, JPEG, WEBP (ảnh chụp bảng tính giá Sophos Firewall / Calculator)</div>
            </div>

            <!-- TRẠNG THÁI 2: ĐANG QUÉT OCR -->
            <div v-else-if="imageCheckScanning" class="imgcheck-scanning">
              <div class="imgcheck-scanner-box">
                <div class="imgcheck-scanner-line"></div>
                <img v-if="imageCheckPreviewUrl" :src="imageCheckPreviewUrl" class="imgcheck-scanning-img" alt="Scanning preview" />
              </div>
              <div class="imgcheck-progress-wrap">
                <div class="imgcheck-progress-label">
                  <span>{{ imageCheckStepText || 'Đang phân tích hình ảnh...' }}</span>
                  <strong>{{ Math.round(imageCheckProgress * 100) }}%</strong>
                </div>
                <div class="imgcheck-progress-bar">
                  <div class="imgcheck-progress-fill" :style="{ width: `${Math.round(imageCheckProgress * 100)}%` }"></div>
                </div>
              </div>
            </div>

            <!-- TRẠNG THÁI 3: ĐÃ QUÉT XONG -> HIỂN THỊ KẾT QUẢ BƯỚC 1 -->
            <div v-else class="imgcheck-result-grid">
              <input ref="imageCheckFileInput" type="file" accept="image/*" style="display: none" @change="handleImageCheckFileChange" />

              <!-- Cột trái: Ảnh gốc & OCR thô -->
              <div class="imgcheck-left-col">
                <div class="pl-config-card">
                  <div class="pl-config-card__title" style="justify-content: space-between;">
                    <span style="display: inline-flex; align-items: center; gap: 6px;">
                      <span>🖼️ Ảnh kiểm tra</span>
                      <small v-if="imageCheckFileName" style="color: #94a3b8; font-weight: 400;">({{ imageCheckFileName }})</small>
                    </span>
                    <div style="display: flex; gap: 6px;">
                      <button type="button" class="pl-mini-btn" @click="imageCheckZoomModal = true" title="Phóng to ảnh">
                        🔍 Phóng to
                      </button>
                      <button type="button" class="pl-mini-btn" @click="triggerImageCheckInput" title="Chọn ảnh khác">
                        🔄 Đổi ảnh
                      </button>
                    </div>
                  </div>
                  <div class="imgcheck-preview-wrap" @click="imageCheckZoomModal = true" title="Nhấn để phóng to ảnh">
                    <img :src="imageCheckPreviewUrl" class="imgcheck-preview-img" alt="Preview" />
                  </div>

                  <!-- Nút AI DeepSeek chuẩn hóa lại -->
                  <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 8px;">
                    <button
                      type="button"
                      class="imgcheck-ai-btn"
                      @click="refineImageCheckWithAI"
                      :disabled="imageCheckAiLoading || !imageCheckRawOcr"
                    >
                      <span v-if="imageCheckAiLoading" class="spinner" style="width: 14px; height: 14px; border-width: 2px;"></span>
                      <span v-else>✨</span>
                      <span>{{ imageCheckAiLoading ? 'AI đang chuẩn hóa dữ liệu...' : 'Chuẩn hóa lại bằng AI (DeepSeek Pro)' }}</span>
                    </button>

                    <button
                      type="button"
                      class="pl-mini-btn"
                      style="width: 100%; justify-content: center; display: inline-flex; align-items: center; gap: 6px;"
                      @click="showRawOcrPanel = !showRawOcrPanel"
                    >
                      <span>{{ showRawOcrPanel ? '▲ Ẩn văn bản OCR thô' : '▼ Xem văn bản OCR thô' }}</span>
                    </button>
                  </div>

                  <div v-if="showRawOcrPanel" style="margin-top: 8px;">
                    <textarea
                      v-model="imageCheckRawOcr"
                      class="imp-input"
                      rows="8"
                      style="width: 100%; font-family: monospace; font-size: 11.5px; line-height: 1.45; resize: vertical; background: #090d16; color: #94a3b8;"
                      placeholder="Văn bản OCR thô..."
                    ></textarea>
                    <button
                      type="button"
                      class="pl-mini-btn"
                      style="margin-top: 6px; width: 100%;"
                      @click="reparseRawOcrText"
                    >
                      ⚡ Phân tích lại từ văn bản OCR trên
                    </button>
                  </div>
                </div>

                <div v-if="imageCheckError" class="imgcheck-error-box">
                  ⚠️ {{ imageCheckError }}
                </div>
              </div>

              <!-- Cột phải: Deal Settings & Bảng dữ liệu bóc tách -->
              <div class="imgcheck-right-col">
                <!-- Card 1: Deal Settings -->
                <div class="pl-config-card">
                  <div class="pl-config-card__title" style="justify-content: space-between;">
                    <span>⚙️ Thông tin cấu hình đọc từ ảnh (Deal Settings)</span>
                    <span v-if="imageCheckSettings.model" class="brand-badge" style="background: rgba(16, 185, 129, 0.18); color: #34d399; border-color: rgba(16, 185, 129, 0.4);">
                      Model: {{ imageCheckSettings.model }}
                    </span>
                  </div>
                  <div class="imgcheck-settings-grid">
                    <div class="pl-field">
                      <label>Model Thiết Bị</label>
                      <input type="text" v-model="imageCheckSettings.model" class="imp-input" placeholder="VD: XGS 2300" style="font-weight: 700; color: #38bdf8;" />
                    </div>
                    <div class="pl-field">
                      <label>Term (Subscriptions)</label>
                      <input type="text" v-model="imageCheckSettings.termSubscription" class="imp-input" placeholder="VD: 12 MOS" />
                    </div>
                    <div class="pl-field">
                      <label>Term (HW Bundles)</label>
                      <input type="text" v-model="imageCheckSettings.termHwBundle" class="imp-input" placeholder="Trống / 12 MOS..." />
                    </div>
                    <div class="pl-field">
                      <label>Số lượng (Qty)</label>
                      <input type="number" v-model.number="imageCheckSettings.qty" class="imp-input imp-input--num" min="1" />
                    </div>
                    <div class="pl-field">
                      <label>Special Attribute (Site)</label>
                      <input type="text" v-model="imageCheckSettings.specialAttribute" class="imp-input" placeholder="VD: AU, EU, US..." style="color: #fbbf24; font-weight: 700;" />
                    </div>
                    <div class="pl-field">
                      <label>Sector</label>
                      <input type="text" v-model="imageCheckSettings.sector" class="imp-input" placeholder="VD: Corporate" />
                    </div>
                    <div class="pl-field">
                      <label>Deal Type</label>
                      <input type="text" v-model="imageCheckSettings.dealType" class="imp-input" placeholder="VD: New - Registered" />
                    </div>
                    <div class="pl-field" style="grid-column: span 1;">
                      <label>Mô tả thiết bị (Description)</label>
                      <input type="text" v-model="imageCheckSettings.description" class="imp-input" placeholder="Mô tả phần cứng ở cuối ảnh..." />
                    </div>
                  </div>
                </div>

                <!-- Card 2: Bảng danh sách SKU & Giá bóc tách -->
                <div class="pl-config-card" style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
                  <div class="pl-config-card__title" style="justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <span>📋 Danh sách Mã SKU &amp; Giá bóc tách từ ảnh</span>
                      <span class="pricelist-rule-badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3);">
                        {{ validImageCheckRowsCount }} mã có giá / {{ imageCheckRows.length }} dòng
                      </span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <label style="display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: #94a3b8; cursor: pointer; font-weight: 400;">
                        <input type="checkbox" v-model="hideUnavailableRows" style="accent-color: #10b981;" />
                        Ẩn dòng Not Available
                      </label>
                      <button type="button" class="pl-mini-btn" @click="addImageCheckRow">
                        + Thêm dòng
                      </button>
                    </div>
                  </div>

                  <div class="imgcheck-table-wrap">
                    <table class="import-table">
                      <thead>
                        <tr>
                          <th style="width: 42px; text-align: center;">#</th>
                          <th style="width: 145px;">Nhóm</th>
                          <th style="min-width: 210px;">Hạng mục (Product / Subscription)</th>
                          <th style="width: 165px;">Mã SKU</th>
                          <th style="width: 125px; text-align: right;">MSRP (USD)</th>
                          <th style="width: 95px; text-align: right;">Disc (%)</th>
                          <th style="width: 125px; text-align: right;">Buy Cost (USD)</th>
                          <th style="width: 48px; text-align: center;">Xóa</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-if="!displayedImageCheckRows.length">
                          <td colspan="8" style="text-align: center; padding: 28px; color: #64748b;">
                            Chưa có dòng dữ liệu nào được bóc tách. Hãy nhấn <strong>"Chuẩn hóa lại bằng AI"</strong> hoặc <strong>"+ Thêm dòng"</strong>.
                          </td>
                        </tr>
                        <tr
                          v-for="(row, idx) in displayedImageCheckRows"
                          :key="row.id"
                          :class="{ 'imgcheck-row-na': !row.available }"
                        >
                          <td style="text-align: center; color: #64748b; font-weight: 600;">{{ idx + 1 }}</td>
                          <td>
                            <select v-model="row.category" class="pl-row-select" style="width: 100%;">
                              <option value="Hardware Bundles">Hardware Bundles</option>
                              <option value="Subscriptions">Subscriptions</option>
                            </select>
                          </td>
                          <td>
                            <input type="text" v-model="row.name" class="imp-input" placeholder="Tên gói / hạng mục..." />
                          </td>
                          <td>
                            <input
                              type="text"
                              v-model="row.sku"
                              @input="row.available = Boolean(row.sku && row.sku !== 'Not Available')"
                              class="imp-input"
                              style="font-family: monospace; font-weight: 700; color: #38bdf8;"
                              placeholder="SKU..."
                            />
                            <div
                              v-if="row.available && row.sku && row.sku !== 'Not Available'"
                              style="display: flex; align-items: center; gap: 4px; margin-top: 4px; flex-wrap: wrap;"
                            >
                              <button
                                type="button"
                                class="sku-jump-chip sku-jump-chip--goc"
                                @click="openExcelNavigatorForSku(row.sku, 'goc', row.name)"
                                title="Mở file_goc_SOPHOS.xlsx và nhảy tới đúng dòng chứa mã SKU này"
                              >
                                📗 File Gốc
                              </button>
                              <button
                                type="button"
                                class="sku-jump-chip sku-jump-chip--skulist"
                                @click="openExcelNavigatorForSku(row.sku, 'skulist', row.name)"
                                title="Mở sophos-pricelist-reseller_SKU_list-asean-usd-2026-3.0.xlsb (SKU_Tab) và nhảy tới đúng dòng chứa mã SKU này"
                              >
                                📙 SKU_List
                              </button>
                              <button
                                type="button"
                                class="sku-jump-chip sku-jump-chip--tg"
                                @click="openExcelNavigatorForSku(row.sku, 'tg', row.name)"
                                title="Mở file_trung_gian_SOPHOS.xlsx và nhảy tới đúng dòng chứa mã SKU này"
                              >
                                📘 File TG
                              </button>
                            </div>
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              v-model.number="row.msrp"
                              class="imp-input imp-input--num"
                              style="color: #f8fafc; font-weight: 700;"
                              placeholder="0.00"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              v-model.number="row.resellerDisc"
                              class="imp-input imp-input--num"
                              style="color: #fbbf24;"
                              placeholder="0%"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              v-model.number="row.buyCost"
                              class="imp-input imp-input--num"
                              style="color: #34d399; font-weight: 600;"
                              placeholder="0.00"
                            />
                          </td>
                          <td style="text-align: center;">
                            <button type="button" class="btn-icon text-danger" @click="removeImageCheckRow(row.id)" title="Xóa dòng">
                              ✕
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- ══════════════════ BƯỚC 2: ĐỐI CHIẾU DATABASE & FILE GỐC / TRUNG GIAN ══════════════════ -->
          <template v-else>
            <!-- Thống kê tổng quan kết quả đối chiếu -->
            <div class="imgcheck-compare-stats">
              <div class="imgcheck-stat-card">
                <div class="imgcheck-stat-label">Tổng số mã kiểm tra</div>
                <div class="imgcheck-stat-val" style="color: #38bdf8;">{{ comparisonRows.length }} mã</div>
                <div class="imgcheck-stat-sub">Model: <strong>{{ imageCheckSettings.model || '-' }}</strong> ({{ imageCheckSettings.specialAttribute || 'AU' }} · {{ imageCheckSettings.termSubscription || '12 MOS' }})</div>
              </div>
              <div class="imgcheck-stat-card">
                <div class="imgcheck-stat-label">So với file_goc_SOPHOS</div>
                <div class="imgcheck-stat-val" style="color: #34d399;">
                  {{ comparisonSummary.gocMatch }} / {{ comparisonRows.length }} khớp
                </div>
                <div class="imgcheck-stat-sub">
                  <span v-if="comparisonSummary.gocDiff > 0" style="color: #fbbf24;">{{ comparisonSummary.gocDiff }} lệch giá</span>
                  <span v-else style="color: #94a3b8;">Khớp 100% bảng giá hãng ({{ sophosRefData?.version || '2026-3.0-1' }})</span>
                </div>
              </div>
              <div class="imgcheck-stat-card" style="border-color: rgba(245, 158, 11, 0.35); background: linear-gradient(180deg, rgba(245, 158, 11, 0.08), rgba(15, 23, 42, 0.82));">
                <div class="imgcheck-stat-label" style="color: #fde68a;" title="sophos-pricelist-reseller_SKU_list-asean-usd-2026-3.0.xlsb">
                  So với Reseller_SKU_List (.xlsb)
                </div>
                <div class="imgcheck-stat-val" style="color: #fbbf24;">
                  {{ comparisonSummary.skuListMatch }} / {{ comparisonRows.length }} khớp
                </div>
                <div class="imgcheck-stat-sub">
                  <span style="color: #fcd34d;">{{ comparisonSummary.skuListPiCount }} mã có Giá cũ (PI)</span>
                  <span style="color: #94a3b8;"> · SKU_Tab &amp; HW</span>
                </div>
              </div>
              <div class="imgcheck-stat-card">
                <div class="imgcheck-stat-label">So với file_trung_gian_SOPHOS</div>
                <div class="imgcheck-stat-val" style="color: #a78bfa;">
                  {{ comparisonSummary.tgMatch }} / {{ comparisonRows.length }} khớp
                </div>
                <div class="imgcheck-stat-sub">
                  <span v-if="comparisonSummary.tgMissing > 0" style="color: #f87171;">{{ comparisonSummary.tgMissing }} mã chưa có trong BOM trung gian</span>
                  <span v-else style="color: #94a3b8;">Đầy đủ trong BOM trung gian</span>
                </div>
              </div>
              <div class="imgcheck-stat-card">
                <div class="imgcheck-stat-label">So với Database (hang_hoa)</div>
                <div class="imgcheck-stat-val" :style="{ color: comparisonSummary.dbMatch === comparisonRows.length ? '#34d399' : '#fbbf24' }">
                  {{ comparisonSummary.dbMatch }} khớp · {{ comparisonSummary.dbDiff }} lệch · {{ comparisonSummary.dbMissing }} thiếu
                </div>
                <div class="imgcheck-stat-sub">
                  <span v-if="comparisonSummary.dbDiff > 0 || comparisonSummary.dbMissing > 0" style="color: #fcd34d;">
                    Có thể đồng bộ trực tiếp vào Firebase bên dưới
                  </span>
                  <span v-else style="color: #34d399;">Database đã khớp hoàn toàn!</span>
                </div>
              </div>
            </div>

            <!-- Thanh công cụ lọc & Nạp file Excel tùy chỉnh -->
            <div class="imgcheck-compare-toolbar">
              <div class="pl-view-tabs" style="flex-wrap: wrap;">
                <button
                  type="button"
                  class="pl-view-tab"
                  :class="{ active: compareFilterMode === 'all' }"
                  @click="compareFilterMode = 'all'"
                >
                  Tất cả ({{ comparisonRows.length }})
                </button>
                <button
                  type="button"
                  class="pl-view-tab"
                  :class="{ active: compareFilterMode === 'db_issue' }"
                  @click="compareFilterMode = 'db_issue'"
                >
                  ⚠️ Cần cập nhật DB ({{ comparisonSummary.dbDiff + comparisonSummary.dbMissing }})
                </button>
                <button
                  type="button"
                  class="pl-view-tab"
                  :class="{ active: compareFilterMode === 'db_diff' }"
                  @click="compareFilterMode = 'db_diff'"
                >
                  🟡 Lệch giá DB ({{ comparisonSummary.dbDiff }})
                </button>
                <button
                  type="button"
                  class="pl-view-tab"
                  :class="{ active: compareFilterMode === 'db_missing' }"
                  @click="compareFilterMode = 'db_missing'"
                >
                  🔴 Thiếu trong DB ({{ comparisonSummary.dbMissing }})
                </button>
                <button
                  type="button"
                  class="pl-view-tab"
                  :class="{ active: compareFilterMode === 'tg_missing' }"
                  @click="compareFilterMode = 'tg_missing'"
                >
                  🟣 Thiếu ở File Trung Gian ({{ comparisonSummary.tgMissing }})
                </button>
              </div>

              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span v-if="vendorRefFilesMeta.sophos" style="font-size: 11.5px; color: #94a3b8; background: rgba(15,23,42,0.8); padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(56,189,248,0.25); display: inline-flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                  <span>☁️ Cloudinary:</span>
                  <strong style="color: #38bdf8; display: inline-flex; align-items: center; gap: 4px;">
                    Gốc:
                    <template v-if="getVendorCompareFileMeta('sophos', 'goc')">
                      <a
                        :href="getVendorOfficeViewUrl(getVendorCompareFileMeta('sophos', 'goc'))"
                        target="_blank"
                        rel="noopener noreferrer"
                        style="color: #38bdf8; text-decoration: underline;"
                        title="Click để mở xem trên ViewOffice (Tab mới)"
                        @click="handleOpenVendorOfficeView($event, 'sophos', 'goc', getVendorCompareFileMeta('sophos', 'goc'))"
                      >{{ getVendorCompareFileMeta('sophos', 'goc').name }}</a>
                      <button
                        type="button"
                        class="vendor-file-office-btn"
                        title="Mở ViewOffice trong tab mới và nhảy tới dòng sản phẩm đầu tiên trong SKU_Tab (sophos-pricelist-reseller_SKU_list-asean-usd-2026-3.0)"
                        @click.stop="openCompareOfficePreview({ vendor: 'sophos', role: 'goc', sheet: 'SKU_Tab', rowNum: comparisonRows.find(r => r.skuListRowNum || r.gocRowNum)?.skuListRowNum || comparisonRows.find(r => r.gocRowNum)?.gocRowNum || 8, colLetter: 'G', sku: comparisonRows.find(r => r.skuListRowNum || r.gocRowNum)?.sku || '' })"
                      >👁️ Xem bằng ViewOffice</button>
                      <button
                        type="button"
                        class="vendor-file-download-btn"
                        title="Tải File Gốc Sophos về máy"
                        @click.stop="handleDownloadVendorUploadedFile('sophos', 'goc', getVendorCompareFileMeta('sophos', 'goc'))"
                      >⬇ Tải về</button>
                    </template>
                    <span v-else>Chưa có</span>
                  </strong>
                  <span>·</span>
                  <strong style="color: #a78bfa; display: inline-flex; align-items: center; gap: 4px;">
                    Trung gian:
                    <template v-if="getVendorCompareFileMeta('sophos', 'tg')">
                      <a
                        :href="getVendorOfficeViewUrl(getVendorCompareFileMeta('sophos', 'tg'))"
                        target="_blank"
                        rel="noopener noreferrer"
                        style="color: #a78bfa; text-decoration: underline;"
                        title="Click để mở xem trên ViewOffice (Tab mới)"
                        @click="handleOpenVendorOfficeView($event, 'sophos', 'tg', getVendorCompareFileMeta('sophos', 'tg'))"
                      >{{ getVendorCompareFileMeta('sophos', 'tg').name }}</a>
                      <button
                        type="button"
                        class="vendor-file-office-btn"
                        title="Mở ViewOffice trong tab mới và nhảy tới sheet XGS - 1U + 10%"
                        @click.stop="openCompareOfficePreview({ vendor: 'sophos', role: 'tg', sheet: 'XGS - 1U + 10%', rowNum: 6, colLetter: 'B' })"
                      >👁️ Xem bằng ViewOffice</button>
                      <button
                        type="button"
                        class="vendor-file-download-btn"
                        title="Tải File Trung Gian Sophos về máy"
                        @click.stop="handleDownloadVendorUploadedFile('sophos', 'tg', getVendorCompareFileMeta('sophos', 'tg'))"
                      >⬇ Tải về</button>
                    </template>
                    <span v-else>Chưa có</span>
                  </strong>
                  <span style="color: #64748b;">({{ formatRefTimestamp(vendorRefFilesMeta.sophos.updated_at) }})</span>
                </span>
                <button type="button" class="pl-mini-btn" @click="selectAllNeedSyncRows">
                  ☑️ Chọn các mục lệch/thiếu DB
                </button>
                <label class="pl-mini-btn" style="cursor: pointer; border-color: rgba(56, 189, 248, 0.45); color: #38bdf8;" title="Upload File Gốc Sophos mới lên Cloudinary">
                  <input type="file" accept=".xlsx,.xlsb,.xls" style="display: none" @change="handleCustomSophosExcelUpload($event, 'goc')" />
                  ☁️ Up File Gốc Sophos
                </label>
                <label class="pl-mini-btn" style="cursor: pointer; border-color: rgba(168, 85, 247, 0.45); color: #c084fc;" title="Upload File Trung Gian Sophos mới lên Cloudinary">
                  <input type="file" accept=".xlsx,.xlsb,.xls" style="display: none" @change="handleCustomSophosExcelUpload($event, 'tg')" />
                  ☁️ Up File Trung Gian Sophos
                </label>
              </div>
            </div>

            <div v-if="vendorRefLoadError.sophos" style="margin-bottom: 10px; padding: 10px 14px; border-radius: 8px; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.45); color: #fca5a5; font-size: 12.5px; font-weight: 700;">
              ⚠️ {{ vendorRefLoadError.sophos }}
            </div>

            <!-- Khung ViewOffice nhúng trực tiếp ngay trong Bảng Đối Chiếu Sophos -->
            <div v-if="compareOfficePreview.show && compareOfficePreview.vendor === 'sophos'" class="compare-office-embed-panel">
              <div class="compare-office-embed-header">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span style="font-weight: 800; color: #38bdf8;">👁️ Microsoft ViewOffice (Đối chiếu trực tiếp):</span>
                  <button
                    v-if="getVendorCompareFileMeta('sophos', 'goc')"
                    type="button"
                    class="compare-office-role-btn"
                    :class="{ active: compareOfficePreview.role === 'goc' }"
                    @click="openCompareOfficePreview({ vendor: 'sophos', role: 'goc', sheet: compareOfficePreview.sheet || 'Firewall', rowNum: compareOfficePreview.rowNum || 27, colLetter: compareOfficePreview.colLetter || 'H', sku: compareOfficePreview.sku })"
                  >📗 File Gốc ({{ getVendorCompareFileMeta('sophos', 'goc').name }})</button>
                  <button
                    v-if="getVendorCompareFileMeta('sophos', 'tg')"
                    type="button"
                    class="compare-office-role-btn"
                    :class="{ active: compareOfficePreview.role === 'tg' }"
                    @click="openCompareOfficePreview({ vendor: 'sophos', role: 'tg', sheet: compareOfficePreview.sheet || 'XGS - 1U + 10%', rowNum: compareOfficePreview.rowNum || 6, colLetter: compareOfficePreview.colLetter || 'B', sku: compareOfficePreview.sku })"
                  >📘 File Trung Gian ({{ getVendorCompareFileMeta('sophos', 'tg').name }})</button>
                  <span v-if="compareOfficePreview.sku" class="compare-office-target-badge">
                    SKU: <strong>{{ compareOfficePreview.sku }}</strong>
                  </span>
                  <span v-if="compareOfficePreview.sheet && compareOfficePreview.rowNum" class="compare-office-target-badge">
                    📍 Sheet <strong>{{ compareOfficePreview.sheet }}</strong> • Ô {{ compareOfficePreview.colLetter }}{{ compareOfficePreview.rowNum }} (Dòng {{ compareOfficePreview.rowNum }})
                  </span>
                  <span v-if="compareOfficePreview.copiedLabel" style="color: #34d399; font-weight: 700; font-size: 11.5px;">
                    ✓ {{ compareOfficePreview.copiedLabel }} (Bấm Ctrl+F → Ctrl+V trong bảng để tìm nhanh)
                  </span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                  <button
                    v-if="compareOfficePreview.sku"
                    type="button"
                    class="vendor-file-office-btn"
                    @click="copyCompareOfficeQuickText(compareOfficePreview.sku, `Đã copy SKU: ${compareOfficePreview.sku}`)"
                  >📋 Copy SKU</button>
                  <a
                    v-if="compareOfficePreview.viewUrl"
                    :href="compareOfficePreview.viewUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="vendor-file-office-btn"
                    style="text-decoration: none;"
                  >🌐 Mở Tab Mới</a>
                  <button
                    type="button"
                    class="vendor-file-download-btn"
                    @click="handleDownloadVendorUploadedFile('sophos', compareOfficePreview.role, getVendorCompareFileMeta('sophos', compareOfficePreview.role === 'tg' ? 'tg' : 'goc'))"
                  >⬇ Tải về</button>
                  <button type="button" class="compare-office-close-btn" @click="closeCompareOfficePreview">✕ Đóng ViewOffice</button>
                </div>
              </div>
              <div class="compare-office-embed-body">
                <div v-if="compareOfficePreview.loading" class="compare-office-loading">
                  ⏳ Đang chuẩn bị file Excel trên Microsoft ViewOffice...
                </div>
                <iframe
                  v-else-if="compareOfficePreview.embedUrl"
                  :src="compareOfficePreview.embedUrl"
                  class="compare-office-iframe"
                  allowfullscreen
                ></iframe>
              </div>
            </div>

            <!-- Bảng kết quả đối chiếu 5 chiều -->
            <div class="imgcheck-compare-table-wrap">
              <table class="import-table imgcheck-compare-table">
                <thead>
                  <tr>
                    <th style="width: 38px; text-align: center;">
                      <input
                        type="checkbox"
                        :checked="allFilteredCompareSelected"
                        @change="toggleSelectAllFilteredCompare($event.target.checked)"
                        style="accent-color: #10b981; cursor: pointer;"
                      />
                    </th>
                    <th style="width: 38px; text-align: center;">#</th>
                    <th style="min-width: 185px;">Hạng mục &amp; Mã SKU (Ảnh)</th>
                    <th style="width: 125px; text-align: right;">Giá trên Ảnh (USD)</th>
                    <th style="width: 170px; text-align: right;">file_goc_SOPHOS (USD)</th>
                    <th style="width: 180px; text-align: right;">Reseller_SKU_List (.xlsb)</th>
                    <th style="width: 175px; text-align: right;">file_trung_gian (USD)</th>
                    <th style="min-width: 200px;">Sản phẩm khớp trong Database</th>
                    <th style="width: 130px; text-align: right;">Giá Database (USD)</th>
                    <th style="width: 160px;">Trạng thái &amp; Chênh lệch</th>
                    <th style="width: 130px; text-align: center;">Thao tác DB</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!filteredComparisonRows.length">
                    <td colspan="11" style="text-align: center; padding: 32px; color: #64748b;">
                      Không có dòng nào trong bộ lọc này.
                    </td>
                  </tr>
                  <tr
                    v-for="(item, idx) in filteredComparisonRows"
                    :key="item.id"
                    :class="[
                      'cmp-row--' + item.dbStatus,
                      { 'cmp-row--active-sku': excelNavState.sku && item.sku === excelNavState.sku }
                    ]"
                  >
                    <td style="text-align: center;">
                      <input
                        type="checkbox"
                        v-model="item.selected"
                        style="accent-color: #10b981; cursor: pointer;"
                      />
                    </td>
                    <td style="text-align: center; color: #64748b; font-weight: 600;">{{ idx + 1 }}</td>

                    <!-- Cột 1: Hạng mục & Mã SKU trên ảnh -->
                    <td>
                      <div style="font-weight: 700; color: #f8fafc; font-size: 13px;">{{ item.name }}</div>
                      <div style="display: flex; align-items: center; gap: 5px; margin-top: 4px; flex-wrap: wrap;">
                        <button
                          type="button"
                          class="sku-clickable-badge"
                          @click="openExcelNavigatorForSku(item.sku, item.tgFound ? 'tg' : 'goc', item.name)"
                          title="Click để mở bảng Excel và nhảy thẳng tới dòng chứa mã SKU này"
                        >
                          <span>{{ item.sku }}</span>
                          <span style="font-size: 10px; opacity: 0.85;">↗</span>
                        </button>
                        <span style="font-size: 10.5px; color: #94a3b8;">{{ item.category === 'Hardware Bundles' ? 'HW' : 'Sub' }}</span>
                      </div>
                    </td>

                    <!-- Cột 2: Giá trên Ảnh -->
                    <td style="text-align: right; font-family: monospace;">
                      <div style="font-size: 13.5px; font-weight: 700; color: #f8fafc;">
                        {{ formatUsdPrice(item.imgMsrp) }}
                      </div>
                      <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
                        Disc: <span style="color: #fbbf24;">{{ item.imgDisc }}%</span>
                        <span v-if="item.imgBuyCost > 0"> · Buy: {{ formatUsdPrice(item.imgBuyCost) }}</span>
                      </div>
                    </td>

                    <!-- Cột 3: file_goc_SOPHOS.xlsx -->
                    <td style="text-align: right; font-family: monospace;">
                      <template v-if="item.gocFound">
                        <div style="display: flex; align-items: center; justify-content: flex-end; gap: 5px;">
                          <span
                            class="cmp-mini-dot"
                            :class="item.gocStatus === 'match' ? 'ok' : 'warn'"
                            :title="item.gocStatus === 'match' ? 'Khớp MSRP với file_goc_SOPHOS' : 'Lệch MSRP so với file_goc_SOPHOS'"
                          ></span>
                          <span style="font-size: 13.5px; font-weight: 700; color: #34d399;">
                            {{ formatUsdPrice(item.gocMsrp) }}
                          </span>
                        </div>
                        <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
                          <span v-if="item.gocBuyCost !== null">Buy: {{ formatUsdPrice(item.gocBuyCost) }}</span>
                          <span v-else>Code: {{ item.gocProductCode }}</span>
                        </div>
                        <!-- Nút nhảy thẳng tới dòng trong file_goc_SOPHOS.xlsx -->
                        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 3px; margin-top: 4px;">
                          <button
                            v-if="item.gocRowNum"
                            type="button"
                            class="sku-jump-chip sku-jump-chip--goc"
                            @click="openExcelNavigator({ fileType: 'goc', sheet: 'MSRPs&BuyCost', rowNum: item.gocRowNum, colLetter: 'B', sku: item.gocAltSku || item.sku, itemName: item.name })"
                            :title="`Click để mở tab mới tới ô B${item.gocRowNum} (Dòng ${item.gocRowNum}) trong sheet MSRPs&BuyCost của file_goc_SOPHOS.xlsx`"
                          >
                            📍 MSRPs&amp;BuyCost • B{{ item.gocRowNum }} (Dòng {{ item.gocRowNum }})
                          </button>
                          <button
                            v-if="item.gocFirewallRowNum"
                            type="button"
                            class="sku-jump-chip sku-jump-chip--goc-sub"
                            @click="openExcelNavigator({ fileType: 'goc', sheet: 'Firewall', rowNum: item.gocFirewallRowNum, colLetter: 'H', sku: item.sku, itemName: item.name })"
                            :title="`Click để mở tab mới tới ô H${item.gocFirewallRowNum} (Dòng ${item.gocFirewallRowNum}) trong sheet Firewall của file_goc_SOPHOS.xlsx`"
                          >
                            📍 Sheet Firewall • H{{ item.gocFirewallRowNum }} (Dòng {{ item.gocFirewallRowNum }})
                          </button>
                          <button
                            v-if="item.skuListRowNum || item.gocRowNum || item.gocFirewallRowNum"
                            type="button"
                            class="vendor-file-office-btn"
                            style="padding: 2px 7px; font-size: 10.5px;"
                            @click="openCompareOfficePreview({ vendor: 'sophos', role: 'goc', sheet: 'SKU_Tab', rowNum: item.skuListRowNum || item.gocRowNum || item.gocFirewallRowNum, colLetter: 'G', sku: item.gocAltSku || item.sku, itemName: item.name })"
                            :title="`Mở ViewOffice bằng file sophos-pricelist-reseller_SKU_list-asean-usd-2026-3.0 trong tab mới và nhảy trực tiếp tới ô chứa SKU ${item.gocAltSku || item.sku}`"
                          >
                            👁️ Xem bằng ViewOffice
                          </button>
                        </div>
                        <div v-if="item.gocNote" style="font-size: 10.5px; color: #fbbf24; font-family: sans-serif; margin-top: 3px;">
                          {{ item.gocNote }}
                        </div>
                      </template>
                      <template v-else>
                        <span class="cmp-badge cmp-badge--missing">Không tìm thấy SKU</span>
                      </template>
                    </td>

                    <!-- Cột 4: sophos-pricelist-reseller_SKU_list-asean-usd-2026-3.0.xlsb -->
                    <td style="text-align: right; font-family: monospace;">
                      <template v-if="item.skuListRowNum">
                        <div style="display: flex; align-items: center; justify-content: flex-end; gap: 5px;">
                          <span
                            class="cmp-mini-dot"
                            :class="item.gocStatus === 'match' ? 'ok' : 'warn'"
                            title="Khớp MSRP với sheet SKU_Tab (Cột J)"
                          ></span>
                          <span style="font-size: 13.5px; font-weight: 700; color: #fbbf24;">
                            {{ formatUsdPrice(item.gocMsrp) }}
                          </span>
                        </div>
                        <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
                          <span v-if="item.skuListPrevPrice > 0" style="color: #fcd34d;" :title="`Giá cũ tại Cột D (Previous Price) trong SKU_Tab`">
                            Giá cũ: {{ formatUsdPrice(item.skuListPrevPrice) }}
                          </span>
                          <span v-if="item.skuListChangeKey" style="color: #38bdf8;"> · {{ item.skuListChangeKey }}</span>
                          <span v-if="item.skuListOldSku" style="color: #cbd5e1;" :title="`Old SKU tại Cột H trong SKU_Tab`"> · Old: {{ item.skuListOldSku }}</span>
                        </div>
                        <!-- Nút nhảy thẳng tới dòng trong sophos-pricelist-reseller_SKU_list.xlsb -->
                        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 3px; margin-top: 4px;">
                          <button
                            type="button"
                            class="sku-jump-chip sku-jump-chip--skulist"
                            @click="openExcelNavigator({ fileType: 'skulist', sheet: 'SKU_Tab', rowNum: item.skuListRowNum, colLetter: 'G', sku: item.gocAltSku || item.sku, itemName: item.name })"
                            :title="`Click để mở tab mới tới ô G${item.skuListRowNum} (Dòng ${item.skuListRowNum}) trong sheet SKU_Tab của sophos-pricelist-reseller_SKU_list-asean-usd-2026-3.0.xlsb`"
                          >
                            📙 SKU_Tab • G{{ item.skuListRowNum }} (Dòng {{ item.skuListRowNum }})
                          </button>
                          <button
                            v-if="item.skuListHwRowNum"
                            type="button"
                            class="sku-jump-chip sku-jump-chip--skulist-hw"
                            @click="openExcelNavigator({ fileType: 'skulist', sheet: 'HW_Compliance', rowNum: item.skuListHwRowNum, colLetter: 'B', sku: item.sku, itemName: item.name })"
                            :title="`Click để mở tab mới tới ô B${item.skuListHwRowNum} (Dòng ${item.skuListHwRowNum}) trong sheet HW_Compliance của sophos-pricelist-reseller_SKU_list-asean-usd-2026-3.0.xlsb`"
                          >
                            📙 HW_Compliance • B{{ item.skuListHwRowNum }} (Dòng {{ item.skuListHwRowNum }})
                          </button>
                          <button
                            type="button"
                            class="vendor-file-office-btn"
                            style="padding: 2px 7px; font-size: 10.5px;"
                            @click="openCompareOfficePreview({ vendor: 'sophos', role: 'goc', sheet: 'SKU_Tab', rowNum: item.skuListRowNum, colLetter: 'G', sku: item.gocAltSku || item.sku, itemName: item.name })"
                            :title="`Mở ViewOffice trong tab mới và nhảy trực tiếp tới ô G${item.skuListRowNum} (Sheet SKU_Tab)`"
                          >
                            👁️ Xem bằng ViewOffice
                          </button>
                        </div>
                      </template>
                      <template v-else>
                        <span class="cmp-badge cmp-badge--missing">Chưa có ở SKU_Tab</span>
                      </template>
                    </td>

                    <!-- Cột 4: file_trung_gian_SOPHOS -->
                    <td style="text-align: right; font-family: monospace;">
                      <template v-if="item.tgFound">
                        <div style="display: flex; align-items: center; justify-content: flex-end; gap: 5px;">
                          <span
                            class="cmp-mini-dot"
                            :class="item.tgStatus === 'match' ? 'ok' : 'warn'"
                          ></span>
                          <span style="font-size: 13.5px; font-weight: 700; color: #c084fc;">
                            {{ formatUsdPrice(item.tgMsrp) }}
                          </span>
                        </div>
                        <div v-if="item.tgNhapKhau > 0" style="font-size: 11px; color: #fbbf24; margin-top: 2px;">
                          +NK: {{ formatUsdPrice(item.tgNhapKhau) }}
                        </div>
                        <!-- Các nút nhảy thẳng tới đúng Sheet & Dòng trong file_trung_gian_SOPHOS.xlsx -->
                        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 3px; margin-top: 4px;">
                          <button
                            v-for="(loc, lIdx) in item.tgLocations"
                            :key="lIdx"
                            type="button"
                            class="sku-jump-chip sku-jump-chip--tg"
                            @click="openExcelNavigator({ fileType: 'tg', sheet: loc.sheet, rowNum: loc.rowNum, colLetter: loc.colLetter || 'B', sku: item.sku, itemName: item.name })"
                            :title="`Click để điều hướng thẳng tới ô ${loc.cell} (Dòng ${loc.rowNum}) trong sheet '${loc.sheet}' của file_trung_gian_SOPHOS.xlsx`"
                          >
                            📍 {{ loc.sheet }} • {{ loc.cell }} (Dòng {{ loc.rowNum }})
                          </button>
                          <button
                            v-if="item.lpRowNum"
                            type="button"
                            class="sku-jump-chip sku-jump-chip--tg-lp"
                            @click="openExcelNavigator({ fileType: 'tg', sheet: 'LP Sophos', rowNum: item.lpRowNum, colLetter: 'A', sku: item.sku, itemName: item.name })"
                            :title="`Click để điều hướng tới Dòng ${item.lpRowNum} (${imageCheckSettings.model}) trong sheet 'LP Sophos' của file_trung_gian_SOPHOS.xlsx`"
                          >
                            📍 LP Sophos • A{{ item.lpRowNum }} ({{ item.lpOldUsd > 0 ? 'Cũ: ' + formatUsdPrice(item.lpOldUsd) : 'Dòng ' + item.lpRowNum }})
                          </button>
                          <button
                            v-if="item.tgLocations?.length || item.lpRowNum"
                            type="button"
                            class="vendor-file-office-btn"
                            style="padding: 2px 7px; font-size: 10.5px;"
                            @click="openCompareOfficePreview({ vendor: 'sophos', role: 'tg', sheet: item.tgLocations?.[0]?.sheet || 'LP Sophos', rowNum: item.tgLocations?.[0]?.rowNum || item.lpRowNum, colLetter: item.tgLocations?.[0]?.colLetter || 'B', sku: item.sku, itemName: item.name })"
                            :title="`Mở ViewOffice trong tab mới và nhảy trực tiếp tới ô ${item.tgLocations?.[0]?.cell || ('A' + item.lpRowNum)}`"
                          >
                            👁️ Xem bằng ViewOffice
                          </button>
                        </div>
                      </template>
                      <template v-else>
                        <span class="cmp-badge cmp-badge--purple">Chưa có ở BOM TG</span>
                        <div v-if="item.lpRowNum" style="margin-top: 4px; display: flex; justify-content: flex-end;">
                          <button
                            type="button"
                            class="sku-jump-chip sku-jump-chip--tg-lp"
                            @click="openExcelNavigator({ fileType: 'tg', sheet: 'LP Sophos', rowNum: item.lpRowNum, colLetter: 'A', sku: item.sku, itemName: item.name })"
                            :title="`Xem dòng Model ${imageCheckSettings.model} tại ô A${item.lpRowNum} trong sheet LP Sophos`"
                          >
                            📍 LP Sophos • A{{ item.lpRowNum }} (Dòng {{ item.lpRowNum }})
                          </button>
                        </div>
                      </template>
                    </td>

                    <!-- Cột 5: Sản phẩm khớp trong Database (hang_hoa) -->
                    <td>
                      <template v-if="item.dbItem">
                        <div style="font-weight: 600; color: #e2e8f0; font-size: 12.5px; line-height: 1.35;">
                          {{ item.dbItem.Ten_hang }}
                        </div>
                        <div style="font-size: 11px; color: #64748b; margin-top: 2px; font-family: monospace;">
                          Danh mục: <span style="color: #94a3b8;">{{ item.dbItem.Danh_muc }}</span>
                        </div>
                      </template>
                      <template v-else>
                        <div style="color: #f87171; font-size: 12px; font-weight: 600;">
                          Chưa có trong Database (hang_hoa)
                        </div>
                        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                          Sẽ tạo vào mục: <strong style="color: #94a3b8;">SOPHOS {{ imageCheckSettings.model || 'FIREWALL' }}</strong>
                        </div>
                      </template>
                    </td>

                    <!-- Cột 6: Giá trong Database -->
                    <td style="text-align: right; font-family: monospace;">
                      <template v-if="item.dbItem">
                        <div
                          style="font-size: 13.5px; font-weight: 700;"
                          :style="{ color: item.dbStatus === 'match' ? '#34d399' : '#fbbf24' }"
                        >
                          {{ formatUsdPrice(item.dbPrice) }}
                        </div>
                        <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
                          <span v-if="item.dbItem.gia_nhap > 0">Giá nhập: {{ formatUsdPrice(item.dbItem.gia_nhap) }}</span>
                          <span v-else>{{ item.dbItem.Don_vi_tien_te || 'USD' }}</span>
                        </div>
                      </template>
                      <template v-else>
                        <span style="color: #64748b;">—</span>
                      </template>
                    </td>

                    <!-- Cột 7: Trạng thái & Chênh lệch -->
                    <td>
                      <div v-if="item.dbStatus === 'match'" class="cmp-badge cmp-badge--match">
                        🟢 Khớp giá DB
                      </div>
                      <div v-else-if="item.dbStatus === 'diff'">
                        <span class="cmp-badge cmp-badge--diff">
                          🟡 Lệch {{ item.dbDiff > 0 ? '+' : '' }}{{ formatUsdPrice(item.dbDiff) }} ({{ item.dbDiffPct > 0 ? '+' : '' }}{{ item.dbDiffPct.toFixed(1) }}%)
                        </span>
                        <div v-if="item.isOldPre10Pct" style="font-size: 11px; color: #fcd34d; margin-top: 3px;">
                          DB đang lưu giá cũ (chưa +10%)
                        </div>
                      </div>
                      <div v-else>
                        <span class="cmp-badge cmp-badge--missing">
                          🔴 Thiếu trong DB
                        </span>
                      </div>
                    </td>

                    <!-- Cột 8: Thao tác đồng bộ vào DB -->
                    <td style="text-align: center;">
                      <button
                        v-if="item.dbStatus === 'diff'"
                        type="button"
                        class="cmp-action-btn cmp-action-btn--update"
                        :disabled="syncingCompareToDb"
                        @click="syncSingleCompareRowToDb(item)"
                        title="Cập nhật giá chuẩn từ Ảnh / File Gốc vào Database hang_hoa"
                      >
                        🔄 Cập nhật giá
                      </button>
                      <button
                        v-else-if="item.dbStatus === 'missing'"
                        type="button"
                        class="cmp-action-btn cmp-action-btn--add"
                        :disabled="syncingCompareToDb"
                        @click="syncSingleCompareRowToDb(item)"
                        title="Thêm sản phẩm mới này vào Database hang_hoa"
                      >
                        + Thêm vào DB
                      </button>
                      <span v-else style="font-size: 12px; color: #34d399; font-weight: 600;">
                        ✓ Đã chuẩn
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>

        <!-- Footer -->
        <div class="import-modal__footer" style="justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 18px; font-size: 13px; color: #94a3b8; flex-wrap: wrap;">
            <span>Model: <strong style="color: #38bdf8;">{{ imageCheckSettings.model || '-' }}</strong></span>
            <span>Site: <strong style="color: #fbbf24;">{{ imageCheckSettings.specialAttribute || '-' }}</strong></span>
            <span>Term: <strong style="color: #e2e8f0;">{{ imageCheckSettings.termSubscription || '-' }}</strong></span>
            <span>Số mã SKU hợp lệ: <strong style="color: #34d399; font-size: 15px;">{{ validImageCheckRowsCount }}</strong></span>
          </div>

          <!-- Nút điều hướng ở Bước 1 -->
          <div v-if="imageCheckActiveStep === 1" style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <button type="button" class="btn btn-secondary" @click="closeImageCheckModal">
              Đóng
            </button>
            <button
              v-if="imageCheckPreviewUrl && !imageCheckScanning"
              type="button"
              class="btn btn-outline"
              style="border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;"
              @click="resetImageCheckModal"
            >
              Quét ảnh khác
            </button>
            <button
              v-if="validImageCheckRowsCount > 0 && !imageCheckScanning"
              type="button"
              class="btn import-btn-save"
              @click="runImagePriceComparison"
            >
              <span>🔍 Sang Bước 2: Đối Chiếu Giá ({{ validImageCheckRowsCount }} mã) →</span>
            </button>
          </div>

          <!-- Nút điều hướng & Đồng bộ ở Bước 2 -->
          <div v-else style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <button type="button" class="btn btn-secondary" @click="imageCheckActiveStep = 1">
              ← Quay lại Bước 1
            </button>
            <button
              type="button"
              class="btn btn-outline"
              style="border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;"
              @click="exportComparisonToExcel"
            >
              📊 Xuất Excel Đối Chiếu
            </button>
            <button
              type="button"
              class="btn import-btn-save"
              :disabled="syncingCompareToDb || selectedComparisonRowsCount === 0"
              @click="syncSelectedCompareRowsToDb"
            >
              <span v-if="syncingCompareToDb" class="spinner"></span>
              <span>⚡ Đồng bộ {{ selectedComparisonRowsCount }} mục đã chọn vào Database</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL PHÓNG TO ẢNH CHECK -->
    <div v-if="imageCheckZoomModal && imageCheckPreviewUrl" class="import-overlay" style="z-index: 10100;" @click="imageCheckZoomModal = false">
      <div style="position: relative; max-width: 95vw; max-height: 92vh; display: flex; flex-direction: column; align-items: center;">
        <button
          type="button"
          class="import-modal__close"
          style="position: absolute; top: -14px; right: -14px; background: #0f172a; border: 1px solid rgba(255,255,255,0.2); z-index: 2;"
          @click.stop="imageCheckZoomModal = false"
        >✕</button>
        <img :src="imageCheckPreviewUrl" style="max-width: 95vw; max-height: 90vh; object-fit: contain; border-radius: 10px; box-shadow: 0 20px 60px rgba(0,0,0,0.85);" @click.stop />
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════════
         MODAL ĐỐI CHIẾU GIÁ KASPERSKY TỪ ẢNH (anh_check_KAS.jpg <-> filegocKas.xlsx <-> Database)
         ═══════════════════════════════════════════════════════════════════════════ -->
    <div v-if="showKasImageCheckModal" class="import-overlay" style="z-index: 10050;" @click.self="closeKasImageCheckModal">
      <div class="import-modal" style="max-width: 1540px; width: 97vw; max-height: 94vh;">
        <!-- Header -->
        <div class="import-modal__header" style="background: linear-gradient(135deg, rgba(6, 78, 59, 0.92), rgba(15, 23, 42, 0.96)); border-bottom: 1px solid rgba(16, 185, 129, 0.3);">
          <div class="import-modal__header-left">
            <div class="import-modal__icon" style="background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4);">
              🛡️
            </div>
            <div>
              <h2 class="import-modal__title" style="display: flex; align-items: center; gap: 10px;">
                <span>Đối chiếu Bảng Giá Kaspersky (Ảnh ↔ filegocKas.xlsx ↔ Database)</span>
                <span style="font-size: 11px; padding: 2px 8px; border-radius: 999px; background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.35);">
                  {{ kasCheckActiveStep === 1 ? 'Bước 1/2: Bóc tách Ảnh' : 'Bước 2/2: Đối chiếu 4 chiều' }}
                </span>
              </h2>
              <p class="import-modal__subtitle">
                Bóc tách bảng Pivot Kaspersky theo từng Band (`Band M..R`) và đối chiếu với `filegocKas.xlsx` (01/07/2026), `KASPERSKY_file_mau_import.xlsx` &amp; Firebase `hang_hoa`
              </p>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <div class="imgcheck-stepper">
              <button
                type="button"
                class="imgcheck-step-pill"
                :class="{ active: kasCheckActiveStep === 1 }"
                @click="kasCheckActiveStep = 1"
              >
                <span class="step-num">1</span>
                <span>Bóc tách Ảnh KAS</span>
              </button>
              <span style="color: #475569;">→</span>
              <button
                type="button"
                class="imgcheck-step-pill"
                :class="{ active: kasCheckActiveStep === 2 }"
                :disabled="kasCheckRows.length === 0"
                @click="runKasPriceComparison"
              >
                <span class="step-num">2</span>
                <span>Đối chiếu filegocKas &amp; DB</span>
              </button>
            </div>
            <button class="import-modal__close" @click="closeKasImageCheckModal">✕</button>
          </div>
        </div>

        <!-- Body -->
        <div class="pricelist-modal-body" style="padding: 18px 22px; overflow-y: auto; flex: 1;">
          <!-- ==================== BƯỚC 1: BÓC TÁCH ẢNH KASPERSKY ==================== -->
          <template v-if="kasCheckActiveStep === 1">
            <input ref="kasCheckFileInput" type="file" accept="image/*" style="display: none" @change="handleKasCheckFileChange" />

            <!-- Trạng thái chưa chọn ảnh -->
            <div v-if="!kasCheckPreviewUrl && !kasCheckScanning" class="imgcheck-dropzone" @click="triggerKasCheckInput" @dragover.prevent @drop.prevent="handleKasCheckDrop" style="border-color: rgba(16, 185, 129, 0.4);">
              <div class="imgcheck-dropzone__icon" style="background: rgba(16, 185, 129, 0.12); color: #34d399;">
                🛡️
              </div>
              <div class="imgcheck-dropzone__title">
                Tải lên hoặc dán (Ctrl+V) ảnh chụp bảng giá Kaspersky (VD: <code>anh_check_KAS.jpg</code>)
              </div>
              <div class="imgcheck-dropzone__sub">
                Hệ thống sẽ tự động bóc tách Product, Package, Type (Base Plus / Renewal Plus), Term (1/2/3 year), SKU và đơn giá VND theo từng cột Band
              </div>
              <div style="display: flex; gap: 12px; margin-top: 14px; flex-wrap: wrap; justify-content: center;" @click.stop>
                <button type="button" class="btn btn-primary" style="background: #10b981; border-color: #059669;" @click="triggerKasCheckInput">
                  📂 Chọn ảnh từ máy tính
                </button>
                <button
                  type="button"
                  class="btn btn-outline"
                  style="border-color: rgba(16, 185, 129, 0.55); color: #6ee7b7; background: rgba(16, 185, 129, 0.12); font-weight: 700;"
                  @click="loadSampleKasCheckData"
                >
                  ⚡ Nạp ngay dữ liệu mẫu từ anh_check_KAS.jpg (Kaspersky Next EDR Optimum)
                </button>
              </div>
            </div>

            <!-- Trạng thái đang quét OCR -->
            <div v-else-if="kasCheckScanning" class="imgcheck-scanning-box">
              <div class="spinner" style="width: 42px; height: 42px; border-width: 4px; border-top-color: #10b981;"></div>
              <h3 style="margin: 14px 0 6px; color: #f8fafc;">{{ kasCheckStepText || 'Đang nhận diện bảng giá Kaspersky...' }}</h3>
              <div style="width: 340px; max-width: 90%; background: rgba(255,255,255,0.08); height: 8px; border-radius: 999px; overflow: hidden;">
                <div :style="{ width: `${Math.round(kasCheckProgress * 100)}%`, background: 'linear-gradient(90deg, #10b981, #38bdf8)', height: '100%', transition: 'width 0.25s' }"></div>
              </div>
            </div>

            <!-- Trạng thái đã có dữ liệu Bước 1 -->
            <div v-else class="imgcheck-result-grid">
              <!-- Cột trái: Ảnh Preview -->
              <div class="imgcheck-left-col">
                <div class="pl-config-card">
                  <div class="pl-config-card__title" style="justify-content: space-between;">
                    <span>🖼️ Ảnh kiểm tra Kaspersky <small v-if="kasCheckFileName" style="color:#94a3b8;">({{ kasCheckFileName }})</small></span>
                    <div style="display: flex; gap: 6px;">
                      <button type="button" class="pl-mini-btn" @click="kasCheckZoomModal = true">🔍 Phóng to</button>
                      <button type="button" class="pl-mini-btn" @click="triggerKasCheckInput">🔄 Đổi ảnh</button>
                    </div>
                  </div>
                  <div class="imgcheck-preview-wrap" @click="kasCheckZoomModal = true" title="Nhấn để phóng to ảnh">
                    <img :src="kasCheckPreviewUrl" class="imgcheck-preview-img" alt="Kaspersky Check Preview" />
                  </div>
                  <div style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
                    <button type="button" class="pl-mini-btn" style="flex: 1;" @click="loadSampleKasCheckData">
                      ⚡ Khôi phục chuẩn anh_check_KAS.jpg
                    </button>
                  </div>
                </div>

                <!-- Thông tin chung trên ảnh -->
                <div class="pl-config-card" style="margin-top: 12px;">
                  <div class="pl-config-card__title">⚙️ Thông tin chung trên ảnh</div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div class="form-group" style="margin: 0; grid-column: span 2;">
                      <label style="font-size: 11px;">Product (Tên sản phẩm trên ảnh)</label>
                      <input v-model="kasCheckSettings.product" type="text" class="imp-input" style="font-weight: 700; color: #34d399;" />
                    </div>
                    <div class="form-group" style="margin: 0;">
                      <label style="font-size: 11px;">Code</label>
                      <input v-model="kasCheckSettings.code" type="text" class="imp-input" />
                    </div>
                    <div class="form-group" style="margin: 0;">
                      <label style="font-size: 11px;">Package</label>
                      <input v-model="kasCheckSettings.package" type="text" class="imp-input" />
                    </div>
                    <div class="form-group" style="margin: 0;">
                      <label style="font-size: 11px;">Effective Date</label>
                      <input v-model="kasCheckSettings.effectiveDate" type="text" class="imp-input" />
                    </div>
                    <div class="form-group" style="margin: 0;">
                      <label style="font-size: 11px;">Tiền tệ</label>
                      <input v-model="kasCheckSettings.currency" type="text" class="imp-input" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Cột phải: Bảng Pivot SKU x Band bóc tách từ ảnh -->
              <div class="imgcheck-right-col">
                <div class="pl-config-card" style="height: 100%; display: flex; flex-direction: column;">
                  <div class="pl-config-card__title" style="justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <span>📋 Bảng giá Pivot bóc tách từ ảnh ({{ kasCheckRows.length }} dòng SKU × {{ kasCheckBands.length }} cột Band = {{ kasCheckRows.length * kasCheckBands.length }} mức giá)</span>
                    </div>
                    <button type="button" class="pl-mini-btn" @click="addKasCheckRow">+ Thêm dòng SKU</button>
                  </div>

                  <div class="import-table-wrap" style="max-height: 520px; border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 10px;">
                    <table class="import-table">
                      <thead>
                        <tr style="background: #064e3b;">
                          <th style="width: 42px; text-align: center;">#</th>
                          <th style="min-width: 190px;">Product</th>
                          <th style="min-width: 90px;">Package</th>
                          <th style="min-width: 120px;">Type</th>
                          <th style="min-width: 85px;">Term</th>
                          <th style="min-width: 135px;">SKU</th>
                          <th v-for="band in kasCheckBands" :key="band" style="min-width: 135px; text-align: right; color: #6ee7b7;">
                            {{ band }}
                          </th>
                          <th style="width: 46px;"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, rIdx) in kasCheckRows" :key="row.id || rIdx">
                          <td style="text-align: center; color: #64748b; font-weight: 600;">{{ rIdx + 1 }}</td>
                          <td>
                            <input v-model="row.product" type="text" class="imp-input" style="font-weight: 600;" />
                          </td>
                          <td>
                            <input v-model="row.package" type="text" class="imp-input" />
                          </td>
                          <td>
                            <input
                              v-model="row.type"
                              type="text"
                              class="imp-input"
                              :style="{ color: String(row.type).includes('Renewal') ? '#fbbf24' : '#34d399', fontWeight: '700' }"
                            />
                          </td>
                          <td>
                            <input v-model="row.term" type="text" class="imp-input" style="text-align: center;" />
                          </td>
                          <td>
                            <input v-model="row.sku" type="text" class="imp-input imp-input--code" style="font-weight: 700; color: #38bdf8;" />
                          </td>
                          <td v-for="band in kasCheckBands" :key="band">
                            <input
                              v-model.number="row.prices[band]"
                              type="number"
                              step="100"
                              class="imp-input imp-input--num"
                              style="font-weight: 700; color: #f8fafc;"
                            />
                          </td>
                          <td style="text-align: center;">
                            <button type="button" class="btn-icon text-danger" @click="kasCheckRows.splice(rIdx, 1)" title="Xóa dòng">✕</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div style="margin-top: 12px; padding: 10px 14px; border-radius: 8px; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); font-size: 12.5px; color: #cbd5e1; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                    <span>
                      💡 Trong Database <code>hang_hoa</code>, mỗi dòng SKU Kaspersky được tách theo từng cột <strong>Band</strong> (VD: <code>KL4066WA*F9 - Band M: 15-19 - Renewal Plus - 1 year - License</code>). Bấm <strong>Sang Bước 2</strong> để đối chiếu chi tiết toàn bộ {{ kasCheckRows.length * kasCheckBands.length }} mã!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- ==================== BƯỚC 2: BẢNG ĐỐI CHIẾU 4 CHIỀU KASPERSKY ==================== -->
          <template v-else>
            <!-- 4 Card Thống kê -->
            <div class="compare-summary-grid" style="grid-template-columns: repeat(4, minmax(0, 1fr));">
              <div class="compare-stat-card compare-stat-card--goc">
                <div class="compare-stat-card__header">
                  <span>📗 So với filegocKas.xlsx (01/07/2026)</span>
                  <button
                    type="button"
                    class="excel-jump-pill excel-jump-pill--goc"
                    @click="openKasExcelNavigator({ fileType: 'kas_goc', sheet: 'SMB+Enterprise (License)', rowNum: 11, colLetter: 'I', sku: 'KL4066WA*F8', itemName: kasCheckSettings.product })"
                    title="Mở bảng Pivot SMB+Enterprise (License) của filegocKas.xlsx trong Tab mới"
                  >
                    🔍 Mở Sheet Pivot Gốc
                  </button>
                </div>
                <div class="compare-stat-card__Body">
                  <div class="stat-pill stat-pill--ok">
                    <strong>{{ kasComparisonSummary.gocMatch }}</strong> Khớp giá
                  </div>
                  <div class="stat-pill stat-pill--warn">
                    <strong>{{ kasComparisonSummary.gocDiff }}</strong> Lệch giá
                  </div>
                  <div class="stat-pill stat-pill--err">
                    <strong>{{ kasComparisonSummary.gocMissing }}</strong> Không thấy
                  </div>
                </div>
                <div class="compare-stat-card__sub">
                  Đối chiếu đồng thời trên sheet Pivot <code>SMB+Enterprise (License)</code> và <code>SaleListSMB+Enterprise</code> (6,514 dòng)
                </div>
              </div>

              <div class="compare-stat-card compare-stat-card--tg">
                <div class="compare-stat-card__header">
                  <span>📘 So với KASPERSKY_file_mau_import.xlsx</span>
                  <button
                    type="button"
                    class="excel-jump-pill excel-jump-pill--tg"
                    @click="openKasExcelNavigator({ fileType: 'kas_mau', sheet: 'SMB+Enterprise (License)', rowNum: 19, colLetter: 'I', sku: 'KL4066WA*F9', itemName: kasCheckSettings.product })"
                    title="Mở KASPERSKY_file_mau_import.xlsx trong Tab mới"
                  >
                    🔍 Mở File Mẫu Cũ
                  </button>
                </div>
                <div class="compare-stat-card__Body">
                  <div class="stat-pill stat-pill--ok">
                    <strong>{{ kasComparisonSummary.mauMatch }}</strong> Khớp giá
                  </div>
                  <div class="stat-pill stat-pill--warn">
                    <strong>{{ kasComparisonSummary.mauDiff }}</strong> Giá cũ (chưa +10%)
                  </div>
                  <div class="stat-pill stat-pill--err">
                    <strong>{{ kasComparisonSummary.mauMissingPivot }}</strong> Ẩn trên Pivot mẫu
                  </div>
                </div>
                <div class="compare-stat-card__sub">
                  File mẫu cũ đang để giá trước 01/07/2026 (thấp hơn 10%) và chỉ lọc <code>Renewal Plus</code> trên Pivot
                </div>
              </div>

              <div class="compare-stat-card compare-stat-card--db">
                <div class="compare-stat-card__header">
                  <span>🗄️ So với Database (Firebase hang_hoa)</span>
                  <span style="font-size: 11px; color: #94a3b8;">KASPERSKY</span>
                </div>
                <div class="compare-stat-card__Body">
                  <div class="stat-pill stat-pill--ok">
                    <strong>{{ kasComparisonSummary.dbMatch }}</strong> Khớp DB
                  </div>
                  <div class="stat-pill stat-pill--warn">
                    <strong>{{ kasComparisonSummary.dbDiff }}</strong> Lệch giá DB
                  </div>
                  <div class="stat-pill stat-pill--err">
                    <strong>{{ kasComparisonSummary.dbMissing }}</strong> Thiếu trong DB
                  </div>
                </div>
                <div class="compare-stat-card__sub">
                  Phát hiện <strong>{{ kasComparisonSummary.dbOldPre10Count }}</strong> mã trong DB đang lưu giá cũ trước khi tăng 10%
                </div>
              </div>

              <div class="compare-stat-card compare-stat-card--sync">
                <div class="compare-stat-card__header">
                  <span>⚡ Đồng bộ vào Database</span>
                  <button type="button" class="pl-mini-btn" @click="selectAllNeedSyncKasRows">
                    Chọn tất cả lệch/thiếu
                  </button>
                </div>
                <div style="font-size: 22px; font-weight: 800; color: #34d399; margin: 4px 0;">
                  {{ selectedKasComparisonRowsCount }} / {{ kasComparisonRows.length }} <span style="font-size: 12px; font-weight: 500; color: #94a3b8;">mục đã chọn</span>
                </div>
                <div class="compare-stat-card__sub">
                  Cập nhật giá mới (01/07/2026) cho <code>Renewal Plus</code> và bổ sung các mã <code>Base Plus</code> còn thiếu vào <code>hang_hoa</code>
                </div>
              </div>
            </div>

            <div v-if="vendorRefLoadError.kaspersky" style="margin-top: 10px; padding: 10px 14px; border-radius: 8px; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.45); color: #fca5a5; font-size: 12.5px; font-weight: 700;">
              ⚠️ {{ vendorRefLoadError.kaspersky }}
            </div>

            <!-- Thanh thông tin File Cloudinary Kaspersky đang đối chiếu -->
            <div style="margin-top: 12px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; padding: 8px 14px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 8px;">
              <div style="font-size: 12px; color: #94a3b8; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span>☁️ Đang đối chiếu theo Cloudinary:</span>
                <strong style="color: #34d399; display: inline-flex; align-items: center; gap: 5px;">
                  Gốc:
                  <template v-if="getVendorCompareFileMeta('kaspersky', 'goc')">
                    <a
                      :href="getVendorOfficeViewUrl(getVendorCompareFileMeta('kaspersky', 'goc'))"
                      target="_blank"
                      rel="noopener noreferrer"
                      style="color: #34d399; text-decoration: underline;"
                      title="Click để mở xem trên ViewOffice (Tab mới)"
                      @click="handleOpenVendorOfficeView($event, 'kaspersky', 'goc', getVendorCompareFileMeta('kaspersky', 'goc'))"
                    >{{ getVendorCompareFileMeta('kaspersky', 'goc').name }}</a>
                    <button
                      type="button"
                      class="vendor-file-office-btn"
                      title="Mở ViewOffice trong tab mới và nhảy tới sheet SMB+Enterprise (License)"
                      @click.stop="openCompareOfficePreview({ vendor: 'kaspersky', role: 'goc', sheet: 'SMB+Enterprise (License)', rowNum: 11, colLetter: 'I' })"
                    >👁️ Xem bằng ViewOffice</button>
                    <button
                      type="button"
                      class="vendor-file-download-btn"
                      title="Tải File Gốc Kaspersky về máy"
                      @click.stop="handleDownloadVendorUploadedFile('kaspersky', 'goc', getVendorCompareFileMeta('kaspersky', 'goc'))"
                    >⬇ Tải về</button>
                  </template>
                  <span v-else>Chưa có File Gốc</span>
                </strong>
                <span>·</span>
                <strong style="color: #38bdf8; display: inline-flex; align-items: center; gap: 5px;">
                  Trung gian:
                  <template v-if="getVendorCompareFileMeta('kaspersky', 'tg')">
                    <a
                      :href="getVendorOfficeViewUrl(getVendorCompareFileMeta('kaspersky', 'tg'))"
                      target="_blank"
                      rel="noopener noreferrer"
                      style="color: #38bdf8; text-decoration: underline;"
                      title="Click để mở xem trên ViewOffice (Tab mới)"
                      @click="handleOpenVendorOfficeView($event, 'kaspersky', 'mau', getVendorCompareFileMeta('kaspersky', 'tg'))"
                    >{{ getVendorCompareFileMeta('kaspersky', 'tg').name }}</a>
                    <button
                      type="button"
                      class="vendor-file-office-btn"
                      title="Mở ViewOffice trong tab mới và nhảy tới sheet SMB+Enterprise (License)"
                      @click.stop="openCompareOfficePreview({ vendor: 'kaspersky', role: 'mau', sheet: 'SMB+Enterprise (License)', rowNum: 11, colLetter: 'I' })"
                    >👁️ Xem bằng ViewOffice</button>
                    <button
                      type="button"
                      class="vendor-file-download-btn"
                      title="Tải File Trung Gian Kaspersky về máy"
                      @click.stop="handleDownloadVendorUploadedFile('kaspersky', 'mau', getVendorCompareFileMeta('kaspersky', 'tg'))"
                    >⬇ Tải về</button>
                  </template>
                  <span v-else>Chưa có File Trung Gian</span>
                </strong>
                <span v-if="vendorRefFilesMeta.kaspersky?.updated_at" style="color: #64748b;">
                  (Cập nhật: {{ formatRefTimestamp(vendorRefFilesMeta.kaspersky.updated_at) }})
                </span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <label class="pl-mini-btn" style="cursor: pointer; border-color: rgba(16, 185, 129, 0.45); color: #34d399;" title="Upload File Gốc Kaspersky mới lên Cloudinary">
                  <input type="file" accept=".xlsx,.xls" style="display: none;" @change="handleCustomKasExcelUpload($event, 'goc')" />
                  ☁️ Up File Gốc Kaspersky
                </label>
                <label class="pl-mini-btn" style="cursor: pointer; border-color: rgba(56, 189, 248, 0.45); color: #38bdf8;" title="Upload File Trung Gian Kaspersky mới lên Cloudinary">
                  <input type="file" accept=".xlsx,.xls" style="display: none;" @change="handleCustomKasExcelUpload($event, 'mau')" />
                  ☁️ Up File Trung Gian Kaspersky
                </label>
              </div>
            </div>

            <!-- Khung ViewOffice nhúng trực tiếp ngay trong Bảng Đối Chiếu Kaspersky -->
            <div v-if="compareOfficePreview.show && compareOfficePreview.vendor === 'kaspersky'" class="compare-office-embed-panel" style="margin-top: 10px;">
              <div class="compare-office-embed-header">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span style="font-weight: 800; color: #34d399;">👁️ Microsoft ViewOffice (Đối chiếu Kaspersky):</span>
                  <button
                    v-if="getVendorCompareFileMeta('kaspersky', 'goc')"
                    type="button"
                    class="compare-office-role-btn"
                    :class="{ active: compareOfficePreview.role === 'goc' }"
                    @click="openCompareOfficePreview({ vendor: 'kaspersky', role: 'goc', sheet: compareOfficePreview.sheet || 'SMB+Enterprise (License)', rowNum: compareOfficePreview.rowNum || 11, colLetter: compareOfficePreview.colLetter || 'I', sku: compareOfficePreview.sku })"
                  >📗 File Gốc ({{ getVendorCompareFileMeta('kaspersky', 'goc').name }})</button>
                  <button
                    v-if="getVendorCompareFileMeta('kaspersky', 'tg')"
                    type="button"
                    class="compare-office-role-btn"
                    :class="{ active: compareOfficePreview.role === 'mau' || compareOfficePreview.role === 'tg' }"
                    @click="openCompareOfficePreview({ vendor: 'kaspersky', role: 'mau', sheet: compareOfficePreview.sheet || 'SMB+Enterprise (License)', rowNum: compareOfficePreview.rowNum || 11, colLetter: compareOfficePreview.colLetter || 'I', sku: compareOfficePreview.sku })"
                  >📘 File Trung Gian ({{ getVendorCompareFileMeta('kaspersky', 'tg').name }})</button>
                  <span v-if="compareOfficePreview.sku" class="compare-office-target-badge">
                    SKU: <strong>{{ compareOfficePreview.sku }}</strong>
                  </span>
                  <span v-if="compareOfficePreview.sheet && compareOfficePreview.rowNum" class="compare-office-target-badge">
                    📍 Sheet <strong>{{ compareOfficePreview.sheet }}</strong> • Ô {{ compareOfficePreview.colLetter }}{{ compareOfficePreview.rowNum }} (Dòng {{ compareOfficePreview.rowNum }})
                  </span>
                  <span v-if="compareOfficePreview.copiedLabel" style="color: #34d399; font-weight: 700; font-size: 11.5px;">
                    ✓ {{ compareOfficePreview.copiedLabel }} (Bấm Ctrl+F → Ctrl+V trong bảng để tìm nhanh)
                  </span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                  <button
                    v-if="compareOfficePreview.sku"
                    type="button"
                    class="vendor-file-office-btn"
                    @click="copyCompareOfficeQuickText(compareOfficePreview.sku, `Đã copy SKU: ${compareOfficePreview.sku}`)"
                  >📋 Copy SKU</button>
                  <a
                    v-if="compareOfficePreview.viewUrl"
                    :href="compareOfficePreview.viewUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="vendor-file-office-btn"
                    style="text-decoration: none;"
                  >🌐 Mở Tab Mới</a>
                  <button
                    type="button"
                    class="vendor-file-download-btn"
                    @click="handleDownloadVendorUploadedFile('kaspersky', compareOfficePreview.role, getVendorCompareFileMeta('kaspersky', compareOfficePreview.role === 'goc' ? 'goc' : 'tg'))"
                  >⬇ Tải về</button>
                  <button type="button" class="compare-office-close-btn" @click="closeCompareOfficePreview">✕ Đóng ViewOffice</button>
                </div>
              </div>
              <div class="compare-office-embed-body">
                <div v-if="compareOfficePreview.loading" class="compare-office-loading">
                  ⏳ Đang chuẩn bị file Excel trên Microsoft ViewOffice...
                </div>
                <iframe
                  v-else-if="compareOfficePreview.embedUrl"
                  :src="compareOfficePreview.embedUrl"
                  class="compare-office-iframe"
                  allowfullscreen
                ></iframe>
              </div>
            </div>

            <!-- Thanh bộ lọc Band & Trạng thái -->
            <div class="compare-toolbar" style="margin-top: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
              <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <span style="font-size: 12px; color: #94a3b8; font-weight: 600;">Lọc trạng thái:</span>
                <button type="button" class="cmp-filter-btn" :class="{ active: kasCompareFilterMode === 'all' }" @click="kasCompareFilterMode = 'all'">
                  Tất cả ({{ kasComparisonRows.length }})
                </button>
                <button type="button" class="cmp-filter-btn" :class="{ active: kasCompareFilterMode === 'db_issue' }" @click="kasCompareFilterMode = 'db_issue'">
                  ⚠️ Cần xử lý DB ({{ kasComparisonSummary.dbDiff + kasComparisonSummary.dbMissing }})
                </button>
                <button type="button" class="cmp-filter-btn" :class="{ active: kasCompareFilterMode === 'db_diff' }" @click="kasCompareFilterMode = 'db_diff'">
                  🟡 Lệch giá DB ({{ kasComparisonSummary.dbDiff }})
                </button>
                <button type="button" class="cmp-filter-btn" :class="{ active: kasCompareFilterMode === 'db_missing' }" @click="kasCompareFilterMode = 'db_missing'">
                  🔴 Thiếu trong DB ({{ kasComparisonSummary.dbMissing }})
                </button>
              </div>

              <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <span style="font-size: 12px; color: #94a3b8; font-weight: 600;">Lọc theo Band:</span>
                <button type="button" class="cmp-filter-btn" :class="{ active: kasCompareBandFilter === 'ALL' }" @click="kasCompareBandFilter = 'ALL'">
                  Tất cả Band
                </button>
                <button
                  v-for="band in kasCheckBands"
                  :key="band"
                  type="button"
                  class="cmp-filter-btn"
                  :class="{ active: kasCompareBandFilter === band }"
                  @click="kasCompareBandFilter = band"
                >
                  {{ band }}
                </button>
              </div>
            </div>

            <!-- Bảng kết quả đối chiếu 4 chiều -->
            <div class="import-table-wrap" style="margin-top: 12px; max-height: 54vh; border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 10px;">
              <table class="import-table">
                <thead>
                  <tr>
                    <th style="width: 42px; text-align: center;">
                      <input
                        type="checkbox"
                        :checked="allFilteredKasCompareSelected"
                        @change="toggleSelectAllFilteredKasCompare($event.target.checked)"
                      />
                    </th>
                    <th style="width: 42px; text-align: center;">#</th>
                    <th style="min-width: 240px;">Sản phẩm / Type / Term / Band</th>
                    <th style="min-width: 145px;">SKU &amp; PositionCode</th>
                    <th style="min-width: 140px; text-align: right;">Giá trên Ảnh (VND)</th>
                    <th style="min-width: 210px; text-align: right;">filegocKas.xlsx (01/07/2026)</th>
                    <th style="min-width: 210px; text-align: right;">KASPERSKY_file_mau_import</th>
                    <th style="min-width: 220px;">Sản phẩm trong Database</th>
                    <th style="min-width: 140px; text-align: right;">Giá Database</th>
                    <th style="min-width: 170px;">Trạng thái Đối chiếu DB</th>
                    <th style="min-width: 135px; text-align: center;">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, idx) in filteredKasComparisonRows"
                    :key="item.id"
                    :class="{
                      'cmp-row--diff': item.dbStatus === 'diff',
                      'cmp-row--missing': item.dbStatus === 'missing'
                    }"
                  >
                    <td style="text-align: center;">
                      <input type="checkbox" v-model="item.selected" />
                    </td>
                    <td style="text-align: center; color: #64748b; font-weight: 600;">{{ idx + 1 }}</td>

                    <!-- Sản phẩm / Type / Term / Band -->
                    <td>
                      <div style="font-weight: 700; color: #f8fafc; font-size: 13px;">{{ item.product }}</div>
                      <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap; margin-top: 4px;">
                        <span
                          :style="{
                            fontSize: '10.5px',
                            fontWeight: '700',
                            padding: '1px 7px',
                            borderRadius: '999px',
                            background: item.type.includes('Renewal') ? 'rgba(245, 158, 11, 0.16)' : 'rgba(16, 185, 129, 0.16)',
                            color: item.type.includes('Renewal') ? '#fbbf24' : '#34d399',
                            border: item.type.includes('Renewal') ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)'
                          }"
                        >
                          {{ item.type }}
                        </span>
                        <span style="font-size: 11px; color: #38bdf8; font-weight: 700; background: rgba(56, 189, 248, 0.12); padding: 1px 7px; border-radius: 6px;">
                          {{ item.term }}
                        </span>
                        <span style="font-size: 11px; color: #e2e8f0; font-weight: 600; background: rgba(255, 255, 255, 0.08); padding: 1px 7px; border-radius: 6px;">
                          {{ item.band }}
                        </span>
                      </div>
                    </td>

                    <!-- SKU & PositionCode -->
                    <td style="font-family: monospace;">
                      <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
                        <button
                          type="button"
                          class="sku-code-pill sku-code-pill--clickable"
                          @click="openKasExcelNavigator({ fileType: 'kas_goc', sheet: 'SMB+Enterprise (License)', rowNum: item.gocPivotRow || 11, colLetter: item.gocPivotColLetter || 'I', sku: item.sku, band: item.band, itemName: `${item.product} (${item.band})` })"
                          title="Click để mở filegocKas.xlsx (Sheet SMB+Enterprise (License)) tại dòng của SKU này"
                        >
                          <span>{{ item.sku }}</span>
                          <span class="sku-jump-icon">↗</span>
                        </button>
                        <span v-if="item.posCode" style="font-size: 11px; color: #94a3b8;" title="PositionCode trong sheet SaleListSMB+Enterprise">
                          Full SKU: <strong style="color: #cbd5e1;">{{ item.posCode }}</strong>
                        </span>
                      </div>
                    </td>

                    <!-- Giá trên Ảnh -->
                    <td style="text-align: right; font-family: monospace;">
                      <div style="font-size: 13.5px; font-weight: 700; color: #f8fafc;">
                        {{ formatVndPrice(item.imgPrice) }}
                      </div>
                    </td>

                    <!-- filegocKas.xlsx -->
                    <td style="text-align: right; font-family: monospace;">
                      <template v-if="item.gocFound">
                        <div style="font-size: 13.5px; font-weight: 700;" :style="{ color: item.gocStatus === 'match' ? '#34d399' : '#f87171' }">
                          {{ formatVndPrice(item.gocPrice) }}
                        </div>
                        <div style="font-size: 11px; margin-top: 2px;">
                          <span v-if="item.gocStatus === 'match'" style="color: #34d399;">✓ Khớp 100% filegocKas</span>
                          <span v-else style="color: #f87171;">Lệch: {{ formatVndPrice(item.imgPrice - item.gocPrice) }}</span>
                        </div>
                        <div style="margin-top: 4px; display: flex; gap: 4px; justify-content: flex-end; flex-wrap: wrap;">
                          <button
                            v-if="item.gocPivotRow"
                            type="button"
                            class="excel-jump-pill excel-jump-pill--goc"
                            @click="openKasExcelNavigator({ fileType: 'kas_goc', sheet: 'SMB+Enterprise (License)', rowNum: item.gocPivotRow, colLetter: item.gocPivotColLetter || 'I', sku: item.sku, band: item.band, itemName: `${item.product} (${item.band})` })"
                            title="Nhảy tới dòng trên sheet Pivot SMB+Enterprise (License) của filegocKas.xlsx"
                          >
                            📍 Pivot • Dòng {{ item.gocPivotRow }}
                          </button>
                          <button
                            v-if="item.gocSaleRow"
                            type="button"
                            class="excel-jump-pill excel-jump-pill--fw"
                            @click="openKasExcelNavigator({ fileType: 'kas_goc', sheet: 'SaleListSMB+Enterprise', rowNum: item.gocSaleRow, colLetter: 'M', sku: item.sku, band: item.band, itemName: `${item.product} (${item.band})` })"
                            title="Nhảy tới dòng chi tiết trên sheet SaleListSMB+Enterprise của filegocKas.xlsx"
                          >
                            📍 SaleList • Dòng {{ item.gocSaleRow }}
                          </button>
                          <button
                            v-if="item.gocPivotRow || item.gocSaleRow"
                            type="button"
                            class="vendor-file-office-btn"
                            style="padding: 2px 7px; font-size: 10.5px;"
                            @click="openCompareOfficePreview({ vendor: 'kaspersky', role: 'goc', sheet: item.gocPivotRow ? 'SMB+Enterprise (License)' : 'SaleListSMB+Enterprise', rowNum: item.gocPivotRow || item.gocSaleRow, colLetter: item.gocPivotRow ? (item.gocPivotColLetter || 'I') : 'M', sku: item.sku, itemName: `${item.product} (${item.band})` })"
                            :title="`Mở ViewOffice trong tab mới và nhảy trực tiếp tới ô ${item.gocPivotRow ? (item.gocPivotColLetter || 'I') + item.gocPivotRow : 'M' + item.gocSaleRow}`"
                          >
                            👁️ Xem bằng ViewOffice
                          </button>
                        </div>
                      </template>
                      <template v-else>
                        <span class="cmp-badge cmp-badge--missing">Không tìm thấy</span>
                      </template>
                    </td>

                    <!-- KASPERSKY_file_mau_import.xlsx -->
                    <td style="text-align: right; font-family: monospace;">
                      <template v-if="item.mauPrice > 0">
                        <div style="font-size: 13.5px; font-weight: 700;" :style="{ color: item.mauStatus === 'match' ? '#38bdf8' : '#fbbf24' }">
                          {{ formatVndPrice(item.mauPrice) }}
                        </div>
                        <div style="font-size: 11px; color: #fbbf24; margin-top: 2px;">
                          <span v-if="item.mauIsOldPre10">⚠️ Giá cũ chưa +10%</span>
                          <span v-else-if="!item.mauPivotRow">Ẩn trên Pivot mẫu (Có ở SaleList)</span>
                        </div>
                        <div style="margin-top: 4px; display: flex; gap: 4px; justify-content: flex-end; flex-wrap: wrap;">
                          <button
                            v-if="item.mauPivotRow"
                            type="button"
                            class="excel-jump-pill excel-jump-pill--tg"
                            @click="openKasExcelNavigator({ fileType: 'kas_mau', sheet: 'SMB+Enterprise (License)', rowNum: item.mauPivotRow, colLetter: 'I', sku: item.sku, band: item.band, itemName: `${item.product} (${item.band})` })"
                          >
                            📍 Pivot Mẫu • Dòng {{ item.mauPivotRow }}
                          </button>
                          <button
                            v-if="item.mauSaleRow"
                            type="button"
                            class="excel-jump-pill excel-jump-pill--lp"
                            @click="openKasExcelNavigator({ fileType: 'kas_mau', sheet: 'SaleListSMB+Enterprise', rowNum: item.mauSaleRow, colLetter: 'M', sku: item.sku, band: item.band, itemName: `${item.product} (${item.band})` })"
                          >
                            📍 SaleList Mẫu • Dòng {{ item.mauSaleRow }}
                          </button>
                          <button
                            v-if="item.mauPivotRow || item.mauSaleRow"
                            type="button"
                            class="vendor-file-office-btn"
                            style="padding: 2px 7px; font-size: 10.5px;"
                            @click="openCompareOfficePreview({ vendor: 'kaspersky', role: 'mau', sheet: item.mauPivotRow ? 'SMB+Enterprise (License)' : 'SaleListSMB+Enterprise', rowNum: item.mauPivotRow || item.mauSaleRow, colLetter: item.mauPivotRow ? 'I' : 'M', sku: item.sku, itemName: `${item.product} (${item.band})` })"
                            :title="`Mở ViewOffice trong tab mới và nhảy trực tiếp tới ô ${item.mauPivotRow ? 'I' + item.mauPivotRow : 'M' + item.mauSaleRow}`"
                          >
                            👁️ Xem bằng ViewOffice
                          </button>
                        </div>
                      </template>
                      <template v-else>
                        <span class="cmp-badge cmp-badge--missing">Chưa có</span>
                      </template>
                    </td>

                    <!-- Sản phẩm trong Database -->
                    <td>
                      <template v-if="item.dbItem">
                        <div style="font-weight: 600; color: #e2e8f0; font-size: 12.5px;">{{ item.dbItem.Ten_hang }}</div>
                        <div style="font-size: 11px; color: #64748b; font-family: monospace; margin-top: 2px;">
                          Mã DB: {{ item.dbItem.Ma_hang }}
                        </div>
                      </template>
                      <template v-else>
                        <span style="color: #f87171; font-size: 12px; font-weight: 600;">
                          Chưa có mã {{ item.type }} ({{ item.term }} - {{ item.band }}) trong DB
                        </span>
                      </template>
                    </td>

                    <!-- Giá Database -->
                    <td style="text-align: right; font-family: monospace;">
                      <template v-if="item.dbItem">
                        <div style="font-size: 13.5px; font-weight: 700;" :style="{ color: item.dbStatus === 'match' ? '#34d399' : '#fbbf24' }">
                          {{ formatVndPrice(item.dbPrice) }}
                        </div>
                        <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
                          {{ item.dbItem.Don_vi_tien_te || 'VND' }}
                        </div>
                      </template>
                      <template v-else>
                        <span style="color: #64748b;">—</span>
                      </template>
                    </td>

                    <!-- Trạng thái Đối chiếu DB -->
                    <td>
                      <div v-if="item.dbStatus === 'match'" class="cmp-badge cmp-badge--match">
                        🟢 Khớp giá DB
                      </div>
                      <div v-else-if="item.dbStatus === 'diff'">
                        <span class="cmp-badge cmp-badge--diff">
                          🟡 Lệch {{ item.dbDiff > 0 ? '+' : '' }}{{ formatVndPrice(item.dbDiff) }} ({{ item.dbDiffPct > 0 ? '+' : '' }}{{ item.dbDiffPct.toFixed(1) }}%)
                        </span>
                        <div v-if="item.isOldPre10Pct" style="font-size: 11px; color: #fcd34d; margin-top: 3px;">
                          DB đang lưu giá cũ (chưa +10%)
                        </div>
                      </div>
                      <div v-else>
                        <span class="cmp-badge cmp-badge--missing">
                          🔴 Thiếu trong DB
                        </span>
                      </div>
                    </td>

                    <!-- Thao tác -->
                    <td style="text-align: center;">
                      <button
                        v-if="item.dbStatus === 'diff'"
                        type="button"
                        class="cmp-action-btn cmp-action-btn--update"
                        :disabled="syncingKasCompareToDb"
                        @click="syncSingleKasCompareRowToDb(item)"
                      >
                        🔄 Cập nhật giá
                      </button>
                      <button
                        v-else-if="item.dbStatus === 'missing'"
                        type="button"
                        class="cmp-action-btn cmp-action-btn--add"
                        :disabled="syncingKasCompareToDb"
                        @click="syncSingleKasCompareRowToDb(item)"
                      >
                        + Thêm vào DB
                      </button>
                      <span v-else style="font-size: 12px; color: #34d399; font-weight: 600;">
                        ✓ Đã chuẩn
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>

        <!-- Footer -->
        <div class="import-modal__footer" style="justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 18px; font-size: 13px; color: #94a3b8; flex-wrap: wrap;">
            <span>Product: <strong style="color: #34d399;">{{ kasCheckSettings.product || '-' }}</strong></span>
            <span>Code: <strong style="color: #fbbf24;">{{ kasCheckSettings.code || '-' }}</strong></span>
            <span>Effective: <strong style="color: #e2e8f0;">{{ kasCheckSettings.effectiveDate || '-' }}</strong></span>
            <span>Tổng mức giá (SKU × Band): <strong style="color: #38bdf8; font-size: 15px;">{{ kasCheckRows.length * kasCheckBands.length }}</strong></span>
          </div>

          <div v-if="kasCheckActiveStep === 1" style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <button type="button" class="btn btn-secondary" @click="closeKasImageCheckModal">Đóng</button>
            <button
              v-if="kasCheckPreviewUrl && !kasCheckScanning"
              type="button"
              class="btn btn-outline"
              style="border-color: rgba(16, 185, 129, 0.4); color: #34d399;"
              @click="resetKasImageCheckModal"
            >
              Quét ảnh khác
            </button>
            <button
              v-if="kasCheckRows.length > 0 && !kasCheckScanning"
              type="button"
              class="btn import-btn-save"
              style="background: linear-gradient(135deg, #10b981, #059669);"
              @click="runKasPriceComparison"
            >
              <span>🔍 Sang Bước 2: Đối Chiếu Giá ({{ kasCheckRows.length * kasCheckBands.length }} mã) →</span>
            </button>
          </div>

          <div v-else style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <button type="button" class="btn btn-secondary" @click="kasCheckActiveStep = 1">
              ← Quay lại Bước 1
            </button>
            <button
              type="button"
              class="btn btn-outline"
              style="border-color: rgba(16, 185, 129, 0.4); color: #34d399;"
              @click="exportKasComparisonToExcel"
            >
              📊 Xuất Excel Đối Chiếu KAS
            </button>
            <button
              type="button"
              class="btn import-btn-save"
              style="background: linear-gradient(135deg, #10b981, #059669);"
              :disabled="syncingKasCompareToDb || selectedKasComparisonRowsCount === 0"
              @click="syncSelectedKasCompareRowsToDb"
            >
              <span v-if="syncingKasCompareToDb" class="spinner"></span>
              <span>⚡ Đồng bộ {{ selectedKasComparisonRowsCount }} mục đã chọn vào Database</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL PHÓNG TO ẢNH CHECK KASPERSKY -->
    <div v-if="kasCheckZoomModal && kasCheckPreviewUrl" class="import-overlay" style="z-index: 10150;" @click="kasCheckZoomModal = false">
      <div style="position: relative; max-width: 95vw; max-height: 92vh; display: flex; flex-direction: column; align-items: center;">
        <button
          type="button"
          class="import-modal__close"
          style="position: absolute; top: -14px; right: -14px; background: #0f172a; border: 1px solid rgba(255,255,255,0.2); z-index: 2;"
          @click.stop="kasCheckZoomModal = false"
        >✕</button>
        <img :src="kasCheckPreviewUrl" style="max-width: 95vw; max-height: 90vh; object-fit: contain; border-radius: 10px; box-shadow: 0 20px 60px rgba(0,0,0,0.85);" @click.stop />
      </div>
    </div>

    <!-- MODAL TRÌNH XEM & ĐỊNH VỊ DÒNG EXCEL (file_goc_SOPHOS & file_trung_gian_SOPHOS) -->
    <div v-if="showExcelNavModal" class="import-overlay" style="z-index: 10500;" @click.self="showExcelNavModal = false">
      <div class="import-modal excel-nav-modal">
        <!-- Header -->
        <div class="excel-nav-header">
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <div class="excel-nav-file-switcher">
              <button
                type="button"
                class="excel-nav-file-btn"
                :class="{ active: excelNavState.fileType === 'goc' }"
                @click="switchExcelNavFileType('goc')"
              >
                📗 file_goc_SOPHOS.xlsx
              </button>
              <button
                type="button"
                class="excel-nav-file-btn"
                :class="{ active: excelNavState.fileType === 'tg' }"
                @click="switchExcelNavFileType('tg')"
              >
                📘 file_trung_gian_SOPHOS.xlsx
              </button>
            </div>

            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span class="excel-nav-sku-pill">
                SKU: <strong>{{ excelNavState.sku || '—' }}</strong>
              </span>
              <span v-if="excelNavState.itemName" style="font-size: 12.5px; color: #cbd5e1; font-weight: 600;">
                {{ excelNavState.itemName }}
              </span>
              <span class="excel-nav-coord-pill">
                📍 {{ excelNavCurrentRef }} (Dòng {{ excelNavState.targetRow }})
              </span>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <button
              type="button"
              class="excel-nav-action-btn excel-nav-action-btn--copy"
              @click="copyExcelCoordToClipboard(excelNavFullRowRef)"
              title="Copy tọa độ nguyên dòng ('Sheet'!Dòng:Dòng) để khi bấm Ctrl+G -> Ctrl+V trong Excel sẽ bôi sáng toàn bộ dòng đó"
            >
              <span>{{ excelNavCopied ? '✓ Đã copy tọa độ cả dòng!' : `📋 Copy cả dòng (${excelNavFullRowRef})` }}</span>
            </button>
            <button
              type="button"
              class="excel-nav-action-btn"
              @click="scrollToExcelTargetRow"
              title="Cuộn màn hình lại đúng dòng đang định vị"
            >
              🎯 Tới Dòng #{{ excelNavState.targetRow }}
            </button>
            <button
              type="button"
              class="excel-nav-action-btn excel-nav-action-btn--excel"
              @click="openInDesktopExcel(excelNavState.fileType)"
              title="Gọi phần mềm Microsoft Excel trên máy tính mở file này và tự copy tọa độ dòng vào Clipboard"
            >
              📗 Mở App Excel Desktop
            </button>
            <a
              :href="excelNavState.fileType === 'goc' ? '/template_excel/file_goc_SOPHOS.xlsx' : '/template_excel/file_trung_gian_SOPHOS.xlsx'"
              :download="excelNavState.fileType === 'goc' ? 'file_goc_SOPHOS.xlsx' : 'file_trung_gian_SOPHOS.xlsx'"
              class="excel-nav-action-btn"
              style="text-decoration: none;"
              title="Tải file .xlsx về máy"
            >
              ⬇️ Tải .xlsx
            </a>
            <button type="button" class="import-modal__close" @click="showExcelNavModal = false">✕</button>
          </div>
        </div>

        <!-- Thanh nhảy nhanh giữa tất cả các vị trí xuất hiện của SKU / Model này trong 2 file -->
        <div v-if="excelNavAllLocationsForSku.length > 0" class="excel-nav-locations-bar">
          <span style="font-size: 11.5px; color: #94a3b8; font-weight: 700; white-space: nowrap;">
            ⚡ Các vị trí của mã này:
          </span>
          <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
            <button
              v-for="(loc, idx) in excelNavAllLocationsForSku"
              :key="idx"
              type="button"
              class="excel-nav-loc-pill"
              :class="{
                active: excelNavState.fileType === loc.fileType && excelNavState.sheet === loc.sheet && excelNavState.targetRow === loc.rowNum,
                'loc-goc': loc.fileType === 'goc',
                'loc-tg': loc.fileType === 'tg'
              }"
              @click="openExcelNavigator(loc)"
            >
              <span>{{ loc.fileType === 'goc' ? '📗 File Gốc' : '📘 File TG' }}:</span>
              <strong>{{ loc.sheet }}</strong>
              <span class="loc-cell">{{ loc.colLetter }}{{ loc.rowNum }} (Dòng {{ loc.rowNum }})</span>
            </button>
          </div>
        </div>

        <!-- Thanh Formula Bar chuẩn Excel (Name Box + fx + Tìm kiếm nhanh trong sheet) -->
        <div class="excel-nav-formulabar">
          <div class="excel-nav-namebox" title="Địa chỉ ô đang chọn trong Sheet">
            {{ excelNavState.colLetter || 'B' }}{{ excelNavState.targetRow || 1 }}
          </div>
          <div class="excel-nav-fx">fx</div>
          <div class="excel-nav-formulavalue">
            {{ excelNavSelectedCellText }}
          </div>
          <div class="excel-nav-searchwrap">
            <input
              type="text"
              v-model="excelNavSearchQuery"
              @keydown.enter.prevent="findAndJumpInCurrentExcelSheet"
              placeholder="Tìm SKU / Model hoặc nhập số dòng rồi Enter..."
              class="excel-nav-searchinput"
            />
            <button type="button" class="excel-nav-searchbtn" @click="findAndJumpInCurrentExcelSheet">
              Tìm &amp; Nhảy
            </button>
          </div>
        </div>

        <!-- Bảng Grid Excel (Cột A, B, C... & Số Dòng thực tế 1, 2, 3...) -->
        <div ref="excelNavGridWrapRef" class="excel-nav-grid-wrap">
          <div
            v-if="excelNavState.fileType === 'goc' && excelNavState.sheet === 'MSRPs&BuyCost'"
            class="excel-nav-window-banner"
          >
            <span>
              Đang hiển thị vùng dữ liệu quanh <strong>Dòng #{{ excelNavState.targetRow }}</strong> (từ dòng {{ excelNavRenderedRows[1]?.rowNum || 3 }} đến {{ excelNavRenderedRows[excelNavRenderedRows.length - 1]?.rowNum || 3 }} trên tổng số 270,000 dòng của sheet <code>MSRPs&amp;BuyCost</code>).
            </span>
            <div style="display: flex; gap: 6px;">
              <button type="button" class="pl-mini-btn" @click="excelNavWindowRadius += 60">
                + Mở rộng thêm ±60 dòng lân cận
              </button>
            </div>
          </div>

          <table class="excel-nav-table">
            <thead>
              <tr>
                <th class="excel-col-corner">#</th>
                <th
                  v-for="(colLet, cIdx) in excelNavColLetters"
                  :key="colLet"
                  :class="{ 'excel-col-active': colLet === excelNavState.colLetter }"
                >
                  {{ colLet }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="rObj in excelNavRenderedRows"
                :key="rObj.rowNum"
                :id="'excel-nav-row-' + rObj.rowNum"
                :class="{
                  'excel-row-target': rObj.rowNum === excelNavState.targetRow,
                  'excel-row-header': rObj.isHeader,
                  'excel-row-group': rObj.isGroup
                }"
                @click="selectExcelRowAndCell(rObj.rowNum, excelNavState.colIndex, rObj.cells)"
              >
                <td class="excel-row-num">
                  <span v-if="rObj.rowNum === excelNavState.targetRow" class="excel-target-arrow">▶</span>
                  {{ rObj.rowNum }}
                </td>
                <td
                  v-for="(colLet, cIdx) in excelNavColLetters"
                  :key="colLet"
                  :class="{
                    'excel-cell-target': rObj.rowNum === excelNavState.targetRow && cIdx === excelNavState.colIndex,
                    'excel-cell-num': typeof rObj.cells[cIdx] === 'number',
                    'excel-cell-sku': isSkuLikeCell(rObj.cells[cIdx], excelNavState.sku)
                  }"
                  @click.stop="selectExcelRowAndCell(rObj.rowNum, cIdx, rObj.cells)"
                >
                  <div class="excel-cell-inner">{{ formatExcelCellValue(rObj.cells[cIdx]) }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Thanh Sheet Tabs dưới đáy giống hệt Microsoft Excel -->
        <div class="excel-nav-sheetbar">
          <div class="excel-nav-sheettabs">
            <button
              v-for="sh in excelNavSheetNames"
              :key="sh"
              type="button"
              class="excel-nav-sheettab"
              :class="{
                active: excelNavState.sheet === sh,
                'has-sku': sheetContainsCurrentSku(sh)
              }"
              @click="switchExcelNavSheet(sh)"
            >
              <span v-if="sheetContainsCurrentSku(sh)" class="sheet-sku-dot" title="Sheet này có chứa mã SKU / Model đang tra cứu"></span>
              <span>{{ sh }}</span>
            </button>
          </div>
          <div class="excel-nav-statusbar">
            <span>Mẹo: Bấm <strong>Ctrl + G</strong> rồi <strong>Ctrl + V</strong> trong phần mềm Excel để nhảy &amp; bôi sáng toàn bộ dòng <code>{{ excelNavFullRowRef }}</code> (ô SKU: <code>{{ excelNavCurrentRef }}</code>)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL ĐỐI CHIẾU TRỰC TIẾP CARD HÀNG HÓA (SOPHOS / KASPERSKY / ACRONIS) VỚI FILE EXCEL GỐC -->
    <div v-if="showCardRefCompareModal" class="import-overlay" style="z-index: 10300;" @click.self="showCardRefCompareModal = false">
      <div class="import-modal" style="max-width: 1120px; width: 96vw; max-height: 92vh; display: flex; flex-direction: column; overflow: hidden;">
        <!-- Header -->
        <div class="import-modal__header" style="padding: 16px 22px; border-bottom: 1px solid rgba(148,163,184,0.18);">
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <span
              :style="{
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: '800',
                letterSpacing: '0.5px',
                background: cardRefCompareData?.vendor === 'sophos'
                  ? 'rgba(56, 189, 248, 0.18)'
                  : (cardRefCompareData?.vendor === 'acronis' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.18)'),
                color: cardRefCompareData?.vendor === 'sophos'
                  ? '#38bdf8'
                  : (cardRefCompareData?.vendor === 'acronis' ? '#a5b4fc' : '#34d399'),
                border: cardRefCompareData?.vendor === 'sophos'
                  ? '1px solid rgba(56, 189, 248, 0.45)'
                  : (cardRefCompareData?.vendor === 'acronis' ? '1px solid rgba(129, 140, 248, 0.5)' : '1px solid rgba(16, 185, 129, 0.45)')
              }"
            >
              {{ cardRefCompareData?.vendor === 'sophos'
                ? '🛡️ SOPHOS — ĐỐI CHIẾU FILE GỐC'
                : (cardRefCompareData?.vendor === 'acronis'
                    ? '🟣 ACRONIS — ĐỐI CHIẾU FILE GỐC'
                    : '🟢 KASPERSKY — ĐỐI CHIẾU FILE GỐC') }}
            </span>
            <h2 class="import-modal__title" style="margin: 0; font-size: 16.5px;">
              {{ cardRefCompareData?.item?.Ten_hang || 'Đang đối chiếu...' }}
            </h2>
            <span
              v-if="cardRefCompareData && !cardRefCompareLoading"
              :style="{
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: '800',
                background: cardRefCompareData.status === 'match'
                  ? 'rgba(16, 185, 129, 0.18)'
                  : (cardRefCompareData.status === 'diff' ? 'rgba(245, 158, 11, 0.18)' : 'rgba(239, 68, 68, 0.18)'),
                color: cardRefCompareData.status === 'match'
                  ? '#34d399'
                  : (cardRefCompareData.status === 'diff' ? '#fbbf24' : '#f87171'),
                border: cardRefCompareData.status === 'match'
                  ? '1px solid rgba(16, 185, 129, 0.45)'
                  : (cardRefCompareData.status === 'diff' ? '1px solid rgba(245, 158, 11, 0.45)' : '1px solid rgba(239, 68, 68, 0.45)')
              }"
            >
              <template v-if="cardRefCompareData.status === 'match'">✓ Khớp giá File Gốc</template>
              <template v-else-if="cardRefCompareData.status === 'diff'">
                ⚠️ Lệch giá so với File Gốc ({{ cardRefCompareData.priceDiff > 0 ? '+' : '' }}{{ cardRefCompareData.vendor === 'sophos' ? formatUsdPrice(cardRefCompareData.priceDiff) : formatVndPrice(cardRefCompareData.priceDiff) }})
              </template>
              <template v-else>ℹ️ Chưa tìm thấy mã SKU tương ứng trong File Gốc</template>
            </span>
          </div>
          <button type="button" class="import-modal__close" @click="showCardRefCompareModal = false">✕</button>
        </div>

        <!-- Body -->
        <div style="padding: 18px 22px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px;">
          <!-- Thanh trạng thái File Tham Chiếu trên Cloudinary -->
          <div
            v-if="cardRefCompareData?.vendor"
            style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; padding: 9px 14px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(56, 189, 248, 0.28); border-radius: 10px;"
          >
            <div style="font-size: 12px; color: #94a3b8; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span>☁️ Nguồn đối chiếu Cloudinary ({{ cardRefCompareData.vendor.toUpperCase() }}):</span>
              <template v-if="vendorRefFilesMeta[cardRefCompareData.vendor]">
                <strong style="color: #34d399; display: inline-flex; align-items: center; gap: 5px;">
                  File Gốc:
                  <template v-if="getVendorCompareFileMeta(cardRefCompareData.vendor, 'goc')">
                    <a
                      :href="getVendorOfficeViewUrl(getVendorCompareFileMeta(cardRefCompareData.vendor, 'goc'))"
                      target="_blank"
                      rel="noopener noreferrer"
                      style="color: #34d399; text-decoration: underline;"
                      title="Click để mở xem trên ViewOffice (Tab mới)"
                      @click="handleOpenVendorOfficeView($event, cardRefCompareData.vendor, 'goc', getVendorCompareFileMeta(cardRefCompareData.vendor, 'goc'))"
                    >{{ getVendorCompareFileMeta(cardRefCompareData.vendor, 'goc').name }}</a>
                    <button
                      type="button"
                      class="vendor-file-office-btn"
                      title="Mở ViewOffice trong tab mới và nhảy trực tiếp tới ô chứa sản phẩm này"
                      @click.stop="openCompareOfficePreview({ vendor: cardRefCompareData.vendor, role: 'goc', sheet: cardRefCompareData.vendor === 'sophos' ? 'SKU_Tab' : (cardRefCompareData.sheet || (cardRefCompareData.vendor === 'kaspersky' ? 'SMB+Enterprise (License)' : 'MSRPs&BuyCost')), rowNum: cardRefCompareData.vendor === 'sophos' ? (cardRefCompareData.skuListRowNum || cardRefCompareData.gocRowNum || 8) : (cardRefCompareData.gocRowNum || cardRefCompareData.gocPivotRow || 4), colLetter: cardRefCompareData.vendor === 'sophos' ? 'G' : (cardRefCompareData.gocPivotColLetter || (cardRefCompareData.vendor === 'acronis' ? 'D' : 'B')), sku: cardRefCompareData.sku || cardRefCompareData.skuFor, itemName: cardRefCompareData.item?.Ten_hang })"
                    >👁️ Xem bằng ViewOffice</button>
                    <button
                      type="button"
                      class="vendor-file-download-btn"
                      title="Tải File Gốc về máy"
                      @click.stop="handleDownloadVendorUploadedFile(cardRefCompareData.vendor, 'goc', getVendorCompareFileMeta(cardRefCompareData.vendor, 'goc'))"
                    >⬇ Tải về</button>
                  </template>
                  <span v-else>Chưa có</span>
                </strong>
                <template v-if="cardRefCompareData.vendor !== 'acronis'">
                  <span>·</span>
                  <strong style="color: #a5b4fc; display: inline-flex; align-items: center; gap: 5px;">
                    File Trung Gian:
                    <template v-if="getVendorCompareFileMeta(cardRefCompareData.vendor, 'tg')">
                      <a
                        :href="getVendorOfficeViewUrl(getVendorCompareFileMeta(cardRefCompareData.vendor, 'tg'))"
                        target="_blank"
                        rel="noopener noreferrer"
                        style="color: #a5b4fc; text-decoration: underline;"
                        title="Click để mở xem trên ViewOffice (Tab mới)"
                        @click="handleOpenVendorOfficeView($event, cardRefCompareData.vendor, cardRefCompareData.vendor === 'sophos' ? 'tg' : 'mau', getVendorCompareFileMeta(cardRefCompareData.vendor, 'tg'))"
                      >{{ getVendorCompareFileMeta(cardRefCompareData.vendor, 'tg').name }}</a>
                      <button
                        type="button"
                        class="vendor-file-office-btn"
                        title="Mở ViewOffice trong tab mới và nhảy trực tiếp tới ô chứa sản phẩm này"
                        @click.stop="openCompareOfficePreview({ vendor: cardRefCompareData.vendor, role: cardRefCompareData.vendor === 'sophos' ? 'tg' : 'mau', sheet: cardRefCompareData.tgSheet || 'SMB+Enterprise (License)', rowNum: cardRefCompareData.tgRowNum || cardRefCompareData.mauPivotRow || 6, colLetter: cardRefCompareData.vendor === 'kaspersky' ? 'I' : 'B', sku: cardRefCompareData.sku, itemName: cardRefCompareData.item?.Ten_hang })"
                      >👁️ Xem bằng ViewOffice</button>
                      <button
                        type="button"
                        class="vendor-file-download-btn"
                        title="Tải File Trung Gian về máy"
                        @click.stop="handleDownloadVendorUploadedFile(cardRefCompareData.vendor, cardRefCompareData.vendor === 'sophos' ? 'tg' : 'mau', getVendorCompareFileMeta(cardRefCompareData.vendor, 'tg'))"
                      >⬇ Tải về</button>
                    </template>
                    <span v-else>Chưa có</span>
                  </strong>
                </template>
                <span style="color: #64748b;">
                  (Cập nhật: {{ formatRefTimestamp(vendorRefFilesMeta[cardRefCompareData.vendor]?.updated_at) }})
                </span>
              </template>
              <span v-else style="color: #f87171; font-weight: 700;">Chưa có file trên Cloudinary</span>
            </div>

            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <template v-if="cardRefCompareData.vendor === 'sophos'">
                <label
                  class="pl-mini-btn"
                  style="cursor: pointer; border-color: rgba(56, 189, 248, 0.45); color: #38bdf8;"
                >
                  <input type="file" accept=".xlsx,.xlsb,.xls" style="display: none;" @change="handleCustomSophosExcelUpload($event, 'goc')" />
                  ☁️ Up File Gốc Sophos
                </label>
                <label
                  class="pl-mini-btn"
                  style="cursor: pointer; border-color: rgba(168, 85, 247, 0.45); color: #c084fc;"
                >
                  <input type="file" accept=".xlsx,.xlsb,.xls" style="display: none;" @change="handleCustomSophosExcelUpload($event, 'tg')" />
                  ☁️ Up File Trung Gian Sophos
                </label>
              </template>
              <template v-else-if="cardRefCompareData.vendor === 'kaspersky'">
                <label
                  class="pl-mini-btn"
                  style="cursor: pointer; border-color: rgba(16, 185, 129, 0.45); color: #34d399;"
                >
                  <input type="file" accept=".xlsx,.xls" style="display: none;" @change="handleCustomKasExcelUpload($event, 'goc')" />
                  ☁️ Up File Gốc Kaspersky
                </label>
                <label
                  class="pl-mini-btn"
                  style="cursor: pointer; border-color: rgba(56, 189, 248, 0.45); color: #38bdf8;"
                >
                  <input type="file" accept=".xlsx,.xls" style="display: none;" @change="handleCustomKasExcelUpload($event, 'mau')" />
                  ☁️ Up File Trung Gian Kaspersky
                </label>
              </template>
              <template v-else-if="cardRefCompareData.vendor === 'acronis'">
                <label
                  class="pl-mini-btn"
                  style="cursor: pointer; border-color: rgba(129, 140, 248, 0.45); color: #a5b4fc;"
                >
                  <input type="file" accept=".xlsx,.xls" style="display: none;" @change="handleCustomAcronisExcelUpload($event, 'both')" />
                  ☁️ Up File Gốc Acronis
                </label>
              </template>
            </div>
          </div>

          <div
            v-if="cardRefCompareData?.vendor && vendorRefLoadError[cardRefCompareData.vendor]"
            style="padding: 10px 14px; border-radius: 8px; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.45); color: #fca5a5; font-size: 12.5px; font-weight: 700;"
          >
            ⚠️ {{ vendorRefLoadError[cardRefCompareData.vendor] }}
          </div>

          <!-- Khung ViewOffice nhúng trực tiếp ngay trong Modal Đối Chiếu Card -->
          <div v-if="compareOfficePreview.show && cardRefCompareData?.vendor && compareOfficePreview.vendor === cardRefCompareData.vendor" class="compare-office-embed-panel">
            <div class="compare-office-embed-header">
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span style="font-weight: 800; color: #38bdf8;">👁️ Microsoft ViewOffice ({{ cardRefCompareData.vendor.toUpperCase() }}):</span>
                <button
                  v-if="getVendorCompareFileMeta(cardRefCompareData.vendor, 'goc')"
                  type="button"
                  class="compare-office-role-btn"
                  :class="{ active: compareOfficePreview.role === 'goc' }"
                  @click="openCompareOfficePreview({ vendor: cardRefCompareData.vendor, role: 'goc', sheet: cardRefCompareData.sheet || 'MSRPs&BuyCost', rowNum: cardRefCompareData.gocRowNum || cardRefCompareData.gocPivotRow || 4, colLetter: cardRefCompareData.gocPivotColLetter || 'B', sku: cardRefCompareData.sku || cardRefCompareData.skuFor })"
                >📗 File Gốc ({{ getVendorCompareFileMeta(cardRefCompareData.vendor, 'goc').name }})</button>
                <button
                  v-if="cardRefCompareData.vendor !== 'acronis' && getVendorCompareFileMeta(cardRefCompareData.vendor, 'tg')"
                  type="button"
                  class="compare-office-role-btn"
                  :class="{ active: compareOfficePreview.role === 'tg' || compareOfficePreview.role === 'mau' }"
                  @click="openCompareOfficePreview({ vendor: cardRefCompareData.vendor, role: cardRefCompareData.vendor === 'sophos' ? 'tg' : 'mau', sheet: cardRefCompareData.tgSheet || 'SMB+Enterprise (License)', rowNum: cardRefCompareData.tgRowNum || cardRefCompareData.mauPivotRow || 6, colLetter: 'B', sku: cardRefCompareData.sku })"
                >📘 File Trung Gian ({{ getVendorCompareFileMeta(cardRefCompareData.vendor, 'tg').name }})</button>
                <span v-if="compareOfficePreview.sku" class="compare-office-target-badge">
                  SKU: <strong>{{ compareOfficePreview.sku }}</strong>
                </span>
                <span v-if="compareOfficePreview.sheet && compareOfficePreview.rowNum" class="compare-office-target-badge">
                  📍 Sheet <strong>{{ compareOfficePreview.sheet }}</strong> • Ô {{ compareOfficePreview.colLetter }}{{ compareOfficePreview.rowNum }} (Dòng {{ compareOfficePreview.rowNum }})
                </span>
                <span v-if="compareOfficePreview.copiedLabel" style="color: #34d399; font-weight: 700; font-size: 11.5px;">
                  ✓ {{ compareOfficePreview.copiedLabel }} (Bấm Ctrl+F → Ctrl+V trong bảng để tìm nhanh)
                </span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <button
                  v-if="compareOfficePreview.sku"
                  type="button"
                  class="vendor-file-office-btn"
                  @click="copyCompareOfficeQuickText(compareOfficePreview.sku, `Đã copy SKU: ${compareOfficePreview.sku}`)"
                >📋 Copy SKU</button>
                <a
                  v-if="compareOfficePreview.viewUrl"
                  :href="compareOfficePreview.viewUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="vendor-file-office-btn"
                  style="text-decoration: none;"
                >🌐 Mở Tab Mới</a>
                <button
                  type="button"
                  class="vendor-file-download-btn"
                  @click="handleDownloadVendorUploadedFile(cardRefCompareData.vendor, compareOfficePreview.role, getVendorCompareFileMeta(cardRefCompareData.vendor, compareOfficePreview.role === 'goc' ? 'goc' : 'tg'))"
                >⬇ Tải về</button>
                <button type="button" class="compare-office-close-btn" @click="closeCompareOfficePreview">✕ Đóng ViewOffice</button>
              </div>
            </div>
            <div class="compare-office-embed-body">
              <div v-if="compareOfficePreview.loading" class="compare-office-loading">
                ⏳ Đang chuẩn bị file Excel trên Microsoft ViewOffice...
              </div>
              <iframe
                v-else-if="compareOfficePreview.embedUrl"
                :src="compareOfficePreview.embedUrl"
                class="compare-office-iframe"
                allowfullscreen
              ></iframe>
            </div>
          </div>

          <div v-if="cardRefCompareLoading" style="padding: 40px; text-align: center; color: #94a3b8; font-size: 14px;">
            ⏳ Đang tra cứu dữ liệu từ File Excel Gốc trên Cloudinary...
          </div>

          <!-- ==================== GIAO DIỆN ĐỐI CHIẾU SOPHOS ==================== -->
          <template v-else-if="cardRefCompareData && cardRefCompareData.vendor === 'sophos'">
            <!-- Banner mở nhanh File Gốc Excel -->
            <div style="background: rgba(15, 23, 42, 0.78); border: 1px solid rgba(56, 189, 248, 0.35); border-radius: 12px; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px;">
              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                <div style="font-size: 13px; color: #e2e8f0; font-weight: 700; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span>🎯 Bấm mở xem trực tiếp trong File Excel Gốc (Tự động nhảy tới dòng &amp; tô sáng ô SKU):</span>
                  <code v-if="cardRefCompareData.sku" style="background: rgba(56, 189, 248, 0.16); color: #38bdf8; padding: 2px 8px; border-radius: 6px; font-weight: 800;">
                    SKU: {{ cardRefCompareData.sku }}
                  </code>
                </div>
              </div>

              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                <button
                  v-if="cardRefCompareData.gocRowNum"
                  type="button"
                  class="excel-jump-chip excel-jump-chip--goc"
                  style="padding: 7px 12px; font-size: 12.5px;"
                  @click="openExcelNavigator({ fileType: 'goc', sheet: 'MSRPs&BuyCost', rowNum: cardRefCompareData.gocRowNum, colLetter: 'B', sku: cardRefCompareData.sku, itemName: cardRefCompareData.item.Ten_hang })"
                >
                  📗 Mở <strong>file_goc_SOPHOS.xlsx</strong> (Sheet <code>MSRPs&amp;BuyCost</code> — Dòng #{{ cardRefCompareData.gocRowNum }}, Ô B{{ cardRefCompareData.gocRowNum }})
                </button>
                <button
                  v-if="cardRefCompareData.skuListRowNum || cardRefCompareData.gocRowNum || cardRefCompareData.gocFirewallRowNum"
                  type="button"
                  class="vendor-file-office-btn"
                  style="padding: 7px 12px; font-size: 12.5px;"
                  @click="openCompareOfficePreview({ vendor: 'sophos', role: 'goc', sheet: 'SKU_Tab', rowNum: cardRefCompareData.skuListRowNum || cardRefCompareData.gocRowNum || cardRefCompareData.gocFirewallRowNum, colLetter: 'G', sku: cardRefCompareData.sku, itemName: cardRefCompareData.item.Ten_hang })"
                >
                  👁️ Xem bằng ViewOffice (SKU_list-2026-3.0 — Sheet SKU_Tab • SKU {{ cardRefCompareData.sku }})
                </button>
                <button
                  v-if="cardRefCompareData.tgLocations?.length || cardRefCompareData.tgRowNum"
                  type="button"
                  class="vendor-file-office-btn"
                  style="padding: 7px 12px; font-size: 12.5px;"
                  @click="openCompareOfficePreview({ vendor: 'sophos', role: 'tg', sheet: cardRefCompareData.tgLocations?.[0]?.sheet || cardRefCompareData.tgSheet || 'XGS - 1U + 10%', rowNum: cardRefCompareData.tgLocations?.[0]?.rowNum || cardRefCompareData.tgRowNum, colLetter: cardRefCompareData.tgLocations?.[0]?.colLetter || 'B', sku: cardRefCompareData.sku, itemName: cardRefCompareData.item.Ten_hang })"
                >
                  👁️ Xem bằng ViewOffice (File TG — Ô {{ (cardRefCompareData.tgLocations?.[0]?.colLetter || 'B') + (cardRefCompareData.tgLocations?.[0]?.rowNum || cardRefCompareData.tgRowNum) }})
                </button>
                <button
                  v-if="cardRefCompareData.skuListRowNum"
                  type="button"
                  class="excel-jump-chip excel-jump-chip--skulist"
                  style="padding: 7px 12px; font-size: 12.5px;"
                  @click="openExcelNavigator({ fileType: 'skulist', sheet: 'SKU_Tab', rowNum: cardRefCompareData.skuListRowNum, colLetter: 'G', sku: cardRefCompareData.sku, itemName: cardRefCompareData.item.Ten_hang })"
                >
                  📙 Mở <strong>SKU_list-2026-3.0.xlsb</strong> (Sheet <code>SKU_Tab</code> — Dòng #{{ cardRefCompareData.skuListRowNum }}, Ô G{{ cardRefCompareData.skuListRowNum }})
                </button>
                <button
                  v-if="cardRefCompareData.skuListHwRowNum"
                  type="button"
                  class="excel-jump-chip excel-jump-chip--hw"
                  style="padding: 7px 12px; font-size: 12.5px;"
                  @click="openExcelNavigator({ fileType: 'skulist', sheet: 'HW_Compliance', rowNum: cardRefCompareData.skuListHwRowNum, colLetter: 'B', sku: cardRefCompareData.sku, itemName: cardRefCompareData.item.Ten_hang })"
                >
                  🔧 Mở <strong>HW_Compliance</strong> (Dòng #{{ cardRefCompareData.skuListHwRowNum }}, Ô B{{ cardRefCompareData.skuListHwRowNum }})
                </button>
                <button
                  v-if="cardRefCompareData.gocFirewallRowNum"
                  type="button"
                  class="excel-jump-chip excel-jump-chip--fw"
                  style="padding: 7px 12px; font-size: 12.5px;"
                  @click="openExcelNavigator({ fileType: 'goc', sheet: 'Firewall', rowNum: cardRefCompareData.gocFirewallRowNum, colLetter: 'H', sku: cardRefCompareData.sku, itemName: cardRefCompareData.item.Ten_hang })"
                >
                  🔥 Mở <strong>file_goc_SOPHOS.xlsx</strong> (Sheet <code>Firewall</code> — Dòng #{{ cardRefCompareData.gocFirewallRowNum }}, Ô H{{ cardRefCompareData.gocFirewallRowNum }})
                </button>
                <button
                  v-for="(loc, lIdx) in cardRefCompareData.tgLocations"
                  :key="'tg-loc-' + lIdx"
                  type="button"
                  class="excel-jump-chip excel-jump-chip--tg"
                  style="padding: 7px 12px; font-size: 12.5px;"
                  @click="openExcelNavigator({ fileType: 'tg', sheet: loc.sheet, rowNum: loc.rowNum, colLetter: loc.colLetter || 'B', sku: cardRefCompareData.sku, itemName: cardRefCompareData.item.Ten_hang })"
                >
                  📘 Mở <strong>file_trung_gian_SOPHOS.xlsx</strong> (Sheet <code>{{ loc.sheet }}</code> — Dòng #{{ loc.rowNum }}, Ô {{ loc.colLetter || 'B' }}{{ loc.rowNum }})
                </button>
                <button
                  v-if="cardRefCompareData.lpRowNum"
                  type="button"
                  class="excel-jump-chip excel-jump-chip--lp"
                  style="padding: 7px 12px; font-size: 12.5px;"
                  @click="openExcelNavigator({ fileType: 'tg', sheet: 'LP Sophos', rowNum: cardRefCompareData.lpRowNum, colLetter: 'A', sku: cardRefCompareData.sku, itemName: cardRefCompareData.item.Ten_hang })"
                >
                  📒 Mở <strong>LP Sophos</strong> (Bảng giá cũ trước +10% — Dòng #{{ cardRefCompareData.lpRowNum }})
                </button>
                <button
                  v-if="!cardRefCompareData.gocRowNum && !cardRefCompareData.tgLocations?.length"
                  type="button"
                  class="excel-jump-chip excel-jump-chip--goc"
                  style="padding: 7px 12px; font-size: 12.5px;"
                  @click="openExcelNavigatorForSku(cardRefCompareData.sku || cardRefCompareData.item.Ma_hang, 'goc', cardRefCompareData.item.Ten_hang)"
                >
                  📗 Mở trình xem <strong>file_goc_SOPHOS.xlsx</strong>
                </button>
              </div>
            </div>

            <!-- 3 Cột So Sánh Chi Tiết: Card Hiện Tại (DB) <-> File Gốc Hãng <-> File Trung Gian -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(310px, 1fr)); gap: 14px;">
              <!-- Cột 1: Dữ liệu Card trên Database -->
              <div style="background: rgba(15, 23, 42, 0.72); border: 1px solid rgba(148, 163, 184, 0.25); border-radius: 12px; padding: 14px 16px;">
                <div style="font-size: 12.5px; font-weight: 800; color: #38bdf8; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 6px;">
                  1. Dữ Liệu Card Hiện Tại (Database)
                </div>
                <div style="display: flex; flex-direction: column; gap: 7px; font-size: 13px;">
                  <div><span style="color: #94a3b8;">Mã hàng (DB):</span> <code style="color: #f8fafc; font-weight: 700;">{{ cardRefCompareData.item.Ma_hang }}</code></div>
                  <div><span style="color: #94a3b8;">SKU Code (DB):</span> <code style="color: #c4b5fd; font-weight: 700;">{{ cardRefCompareData.item.sku_code || '-' }}</code></div>
                  <div><span style="color: #94a3b8;">Tên hàng:</span> <strong style="color: #f8fafc;">{{ cardRefCompareData.item.Ten_hang }}</strong></div>
                  <div><span style="color: #94a3b8;">Danh mục:</span> <span style="color: #cbd5e1;">{{ cardRefCompareData.item.Danh_muc || '-' }}</span></div>
                  <div><span style="color: #94a3b8;">Description:</span> <span style="color: #cbd5e1;">{{ cardRefCompareData.item.Description || '-' }}</span></div>
                  <div><span style="color: #94a3b8;">Type / Thời hạn:</span> <span style="color: #cbd5e1;">{{ cardRefCompareData.item.Type || '-' }} / {{ cardRefCompareData.item.License_duration || '-' }}</span></div>
                  <div><span style="color: #94a3b8;">Volume:</span> <span style="color: #cbd5e1;">{{ cardRefCompareData.item.volume || '-' }}</span></div>
                  <div style="margin-top: 6px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #94a3b8; font-weight: 600;">Giá bán DB (USD):</span>
                    <strong style="font-size: 16px; color: #38bdf8;">{{ formatUsdPrice(cardRefCompareData.dbPrice) }}</strong>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #94a3b8;">Giá nhập / Phí NK DB:</span>
                    <strong style="color: #fbbf24;">{{ formatUsdPrice(cardRefCompareData.dbGiaNhap) }}</strong>
                  </div>
                </div>
              </div>

              <!-- Cột 2: Dữ liệu File Gốc SOPHOS -->
              <div style="background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.32); border-radius: 12px; padding: 14px 16px;">
                <div style="font-size: 12.5px; font-weight: 800; color: #34d399; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid rgba(16,185,129,0.18); padding-bottom: 6px;">
                  2. File Gốc Hãng (file_goc_SOPHOS &amp; SKU_List)
                </div>
                <div v-if="cardRefCompareData.gocFound" style="display: flex; flex-direction: column; gap: 7px; font-size: 13px;">
                  <div><span style="color: #94a3b8;">Mã SKU Gốc:</span> <code style="color: #34d399; font-weight: 800;">{{ cardRefCompareData.sku }}</code></div>
                  <div><span style="color: #94a3b8;">Product Code:</span> <strong style="color: #f8fafc;">{{ cardRefCompareData.gocEntry?.pc || '-' }}</strong></div>
                  <div><span style="color: #94a3b8;">Description Gốc:</span> <span style="color: #e2e8f0;">{{ cardRefCompareData.gocEntry?.desc || '-' }}</span></div>
                  <div><span style="color: #94a3b8;">Product Group:</span> <span style="color: #cbd5e1;">{{ cardRefCompareData.gocEntry?.prodGroup || '-' }}</span></div>
                  <div><span style="color: #94a3b8;">Term / TransType:</span> <span style="color: #cbd5e1;">{{ cardRefCompareData.gocEntry?.term ? cardRefCompareData.gocEntry.term + ' MOS' : '-' }} / {{ cardRefCompareData.gocEntry?.transType || '-' }}</span></div>
                  <div>
                    <span style="color: #94a3b8;">Tọa độ dòng:</span>
                    <span style="color: #a7f3d0; font-weight: 600;">
                      MSRPs&amp;BuyCost #{{ cardRefCompareData.gocRowNum || '-' }}
                      <template v-if="cardRefCompareData.skuListRowNum"> · SKU_Tab #{{ cardRefCompareData.skuListRowNum }}</template>
                    </span>
                  </div>
                  <div style="margin-top: 6px; padding-top: 8px; border-top: 1px dashed rgba(16,185,129,0.25); display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #a7f3d0; font-weight: 700;">Giá MSRP File Gốc:</span>
                    <strong style="font-size: 16px; color: #34d399;">{{ formatUsdPrice(cardRefCompareData.gocMsrp) }}</strong>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
                    <span style="color: #94a3b8;">Buy Cost (Std / Reg / Inc Auth):</span>
                    <span style="color: #cbd5e1; font-weight: 600;">
                      {{ formatUsdPrice(cardRefCompareData.gocEntry?.stdAuth || 0) }} /
                      {{ formatUsdPrice(cardRefCompareData.gocEntry?.regAuth || 0) }} /
                      {{ formatUsdPrice(cardRefCompareData.gocEntry?.incAuth || 0) }}
                    </span>
                  </div>
                  <div v-if="cardRefCompareData.gocEntry?.prevPrice" style="display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
                    <span style="color: #fbbf24;">Giá cũ trước +10% (Previous Price):</span>
                    <strong style="color: #fcd34d;">{{ formatUsdPrice(cardRefCompareData.gocEntry.prevPrice) }} ({{ cardRefCompareData.gocEntry.changeKey || 'Price Increase' }})</strong>
                  </div>
                </div>
                <div v-else style="color: #94a3b8; font-size: 13px; padding: 12px 0;">
                  Không tìm thấy mã SKU này trong bảng <code>MSRPs&amp;BuyCost</code>.
                </div>
              </div>

              <!-- Cột 3: Dữ liệu File Trung Gian SOPHOS -->
              <div style="background: rgba(56, 189, 248, 0.06); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; padding: 14px 16px;">
                <div style="font-size: 12.5px; font-weight: 800; color: #38bdf8; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid rgba(56,189,248,0.18); padding-bottom: 6px;">
                  3. File Trung Gian (file_trung_gian_SOPHOS)
                </div>
                <div v-if="cardRefCompareData.tgFound" style="display: flex; flex-direction: column; gap: 7px; font-size: 13px;">
                  <div><span style="color: #94a3b8;">Sheet Trung Gian:</span> <strong style="color: #38bdf8;">{{ cardRefCompareData.tgSheet }}</strong></div>
                  <div><span style="color: #94a3b8;">Dòng / Ô SKU:</span> <code style="color: #f8fafc; font-weight: 700;">Dòng #{{ cardRefCompareData.tgRowNum }} (Ô B{{ cardRefCompareData.tgRowNum }})</code></div>
                  <div><span style="color: #94a3b8;">Nhóm sản phẩm:</span> <span style="color: #e2e8f0;">{{ cardRefCompareData.tgGroup || '-' }}</span></div>
                  <div v-if="cardRefCompareData.lpOldUsd > 0"><span style="color: #94a3b8;">Giá LP Sophos cũ:</span> <span style="color: #fbbf24; font-weight: 700;">{{ formatUsdPrice(cardRefCompareData.lpOldUsd) }}</span></div>
                  <div style="margin-top: 6px; padding-top: 8px; border-top: 1px dashed rgba(56,189,248,0.25); display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #bae6fd; font-weight: 700;">Giá MSRP Trung Gian:</span>
                    <strong style="font-size: 16px; color: #38bdf8;">{{ formatUsdPrice(cardRefCompareData.tgMsrp) }}</strong>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #94a3b8;">Phí Nhập Khẩu (Cột G):</span>
                    <strong style="color: #fbbf24;">{{ formatUsdPrice(cardRefCompareData.tgNhapKhau) }}</strong>
                  </div>
                </div>
                <div v-else style="color: #94a3b8; font-size: 13px; padding: 12px 0;">
                  Mã này không nằm trong các sheet BOM rút gọn của <code>file_trung_gian_SOPHOS.xlsx</code>.
                </div>
              </div>
            </div>
          </template>

          <!-- ==================== GIAO DIỆN ĐỐI CHIẾU KASPERSKY ==================== -->
          <template v-else-if="cardRefCompareData && cardRefCompareData.vendor === 'kaspersky'">
            <!-- Banner mở nhanh File Gốc Excel Kaspersky -->
            <div style="background: rgba(15, 23, 42, 0.78); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 12px; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px;">
              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                <div style="font-size: 13px; color: #e2e8f0; font-weight: 700; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span>🎯 Bấm mở xem trực tiếp trong File Excel Gốc Kaspersky (Tự động nhảy tới dòng &amp; tô sáng ô giá theo Band):</span>
                  <code v-if="cardRefCompareData.sku" style="background: rgba(16, 185, 129, 0.16); color: #34d399; padding: 2px 8px; border-radius: 6px; font-weight: 800;">
                    SKU: {{ cardRefCompareData.sku }}
                  </code>
                  <code v-if="cardRefCompareData.posCode" style="background: rgba(56, 189, 248, 0.16); color: #38bdf8; padding: 2px 8px; border-radius: 6px; font-weight: 800;">
                    PositionCode: {{ cardRefCompareData.posCode }}
                  </code>
                  <span v-if="cardRefCompareData.band" style="background: rgba(245, 158, 11, 0.16); color: #fbbf24; padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: 700;">
                    {{ cardRefCompareData.band }}
                  </span>
                </div>
              </div>

              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                <button
                  v-if="cardRefCompareData.gocPivotRow"
                  type="button"
                  class="excel-jump-chip excel-jump-chip--goc"
                  style="padding: 7px 12px; font-size: 12.5px;"
                  @click="openKasExcelNavigator({ fileType: 'kas_goc', sheet: 'SMB+Enterprise (License)', rowNum: cardRefCompareData.gocPivotRow, colLetter: cardRefCompareData.gocPivotColLetter, sku: cardRefCompareData.sku, band: cardRefCompareData.band, itemName: cardRefCompareData.item.Ten_hang })"
                >
                  📗 Mở <strong>filegocKas.xlsx</strong> — Sheet <code>SMB+Enterprise (License)</code> (Dòng #{{ cardRefCompareData.gocPivotRow }}, Ô {{ cardRefCompareData.gocPivotColLetter }}{{ cardRefCompareData.gocPivotRow }})
                </button>
                <button
                  v-if="cardRefCompareData.gocPivotRow || cardRefCompareData.gocSaleRow"
                  type="button"
                  class="vendor-file-office-btn"
                  style="padding: 7px 12px; font-size: 12.5px;"
                  @click="openCompareOfficePreview({ vendor: 'kaspersky', role: 'goc', sheet: cardRefCompareData.gocPivotRow ? 'SMB+Enterprise (License)' : 'SaleListSMB+Enterprise', rowNum: cardRefCompareData.gocPivotRow || cardRefCompareData.gocSaleRow, colLetter: cardRefCompareData.gocPivotRow ? (cardRefCompareData.gocPivotColLetter || 'I') : 'E', sku: cardRefCompareData.sku, itemName: cardRefCompareData.item.Ten_hang })"
                >
                  👁️ Xem bằng ViewOffice (File Gốc — Ô {{ cardRefCompareData.gocPivotRow ? (cardRefCompareData.gocPivotColLetter || 'I') + cardRefCompareData.gocPivotRow : 'E' + cardRefCompareData.gocSaleRow }})
                </button>
                <button
                  v-if="cardRefCompareData.mauPivotRow || cardRefCompareData.mauSaleRow"
                  type="button"
                  class="vendor-file-office-btn"
                  style="padding: 7px 12px; font-size: 12.5px;"
                  @click="openCompareOfficePreview({ vendor: 'kaspersky', role: 'mau', sheet: cardRefCompareData.mauPivotRow ? 'SMB+Enterprise (License)' : 'SaleListSMB+Enterprise', rowNum: cardRefCompareData.mauPivotRow || cardRefCompareData.mauSaleRow, colLetter: cardRefCompareData.mauPivotRow ? (cardRefCompareData.mauPivotColLetter || 'I') : 'E', sku: cardRefCompareData.sku, itemName: cardRefCompareData.item.Ten_hang })"
                >
                  👁️ Xem bằng ViewOffice (File TG — Dòng #{{ cardRefCompareData.mauPivotRow || cardRefCompareData.mauSaleRow }})
                </button>
                <button
                  v-if="cardRefCompareData.gocSaleRow"
                  type="button"
                  class="excel-jump-chip excel-jump-chip--skulist"
                  style="padding: 7px 12px; font-size: 12.5px;"
                  @click="openKasExcelNavigator({ fileType: 'kas_goc', sheet: 'SaleListSMB+Enterprise', rowNum: cardRefCompareData.gocSaleRow, colLetter: 'E', sku: cardRefCompareData.posCode || cardRefCompareData.sku, band: cardRefCompareData.band, itemName: cardRefCompareData.item.Ten_hang })"
                >
                  📙 Mở <strong>filegocKas.xlsx</strong> — Sheet <code>SaleListSMB+Enterprise</code> (Dòng #{{ cardRefCompareData.gocSaleRow }}, Ô E{{ cardRefCompareData.gocSaleRow }})
                </button>
                <button
                  v-if="cardRefCompareData.mauPivotRow"
                  type="button"
                  class="excel-jump-chip excel-jump-chip--tg"
                  style="padding: 7px 12px; font-size: 12.5px;"
                  @click="openKasExcelNavigator({ fileType: 'kas_mau', sheet: 'SMB+Enterprise (License)', rowNum: cardRefCompareData.mauPivotRow, colLetter: cardRefCompareData.mauPivotColLetter, sku: cardRefCompareData.sku, band: cardRefCompareData.band, itemName: cardRefCompareData.item.Ten_hang })"
                >
                  📘 Mở <strong>KASPERSKY_file_mau_import.xlsx</strong> — Sheet <code>SMB+Enterprise (License)</code> (Dòng #{{ cardRefCompareData.mauPivotRow }})
                </button>
                <button
                  v-if="cardRefCompareData.mauSaleRow"
                  type="button"
                  class="excel-jump-chip excel-jump-chip--lp"
                  style="padding: 7px 12px; font-size: 12.5px;"
                  @click="openKasExcelNavigator({ fileType: 'kas_mau', sheet: 'SaleListSMB+Enterprise', rowNum: cardRefCompareData.mauSaleRow, colLetter: 'E', sku: cardRefCompareData.posCode || cardRefCompareData.sku, band: cardRefCompareData.band, itemName: cardRefCompareData.item.Ten_hang })"
                >
                  📒 Mở <strong>KASPERSKY_file_mau_import.xlsx</strong> — Sheet <code>SaleListSMB+Enterprise</code> (Dòng #{{ cardRefCompareData.mauSaleRow }})
                </button>
                <button
                  v-if="!cardRefCompareData.gocPivotRow && !cardRefCompareData.gocSaleRow"
                  type="button"
                  class="excel-jump-chip excel-jump-chip--goc"
                  style="padding: 7px 12px; font-size: 12.5px;"
                  @click="openKasExcelNavigator({ fileType: 'kas_goc', sheet: 'SMB+Enterprise (License)', rowNum: 11, colLetter: 'I', sku: cardRefCompareData.sku, band: cardRefCompareData.band, itemName: cardRefCompareData.item.Ten_hang })"
                >
                  📗 Mở trình xem <strong>filegocKas.xlsx</strong>
                </button>
              </div>
            </div>

            <!-- 3 Cột So Sánh Chi Tiết Kaspersky -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(310px, 1fr)); gap: 14px;">
              <!-- Cột 1: Card Hiện Tại (DB) -->
              <div style="background: rgba(15, 23, 42, 0.72); border: 1px solid rgba(148, 163, 184, 0.25); border-radius: 12px; padding: 14px 16px;">
                <div style="font-size: 12.5px; font-weight: 800; color: #38bdf8; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 6px;">
                  1. Dữ Liệu Card Hiện Tại (Database)
                </div>
                <div style="display: flex; flex-direction: column; gap: 7px; font-size: 13px;">
                  <div><span style="color: #94a3b8;">Mã hàng (DB):</span> <code style="color: #f8fafc; font-weight: 700; word-break: break-all;">{{ cardRefCompareData.item.Ma_hang }}</code></div>
                  <div><span style="color: #94a3b8;">SKU Code (DB):</span> <code style="color: #c4b5fd; font-weight: 700;">{{ cardRefCompareData.item.sku_code || '-' }}</code></div>
                  <div><span style="color: #94a3b8;">Tên hàng:</span> <strong style="color: #f8fafc;">{{ cardRefCompareData.item.Ten_hang }}</strong></div>
                  <div><span style="color: #94a3b8;">Danh mục:</span> <span style="color: #cbd5e1;">{{ cardRefCompareData.item.Danh_muc || '-' }}</span></div>
                  <div><span style="color: #94a3b8;">Type / Thời hạn:</span> <span style="color: #cbd5e1;">{{ cardRefCompareData.item.Type || '-' }} / {{ cardRefCompareData.item.License_duration || '-' }}</span></div>
                  <div><span style="color: #94a3b8;">Volume (Band):</span> <strong style="color: #fbbf24;">{{ cardRefCompareData.item.volume || '-' }}</strong></div>
                  <div style="margin-top: 6px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #94a3b8; font-weight: 600;">Giá bán DB (VNĐ):</span>
                    <strong style="font-size: 16px; color: #38bdf8;">{{ formatVndPrice(cardRefCompareData.dbPrice) }}</strong>
                  </div>
                </div>
              </div>

              <!-- Cột 2: File Gốc Kaspersky (filegocKas.xlsx) -->
              <div style="background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.32); border-radius: 12px; padding: 14px 16px;">
                <div style="font-size: 12.5px; font-weight: 800; color: #34d399; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid rgba(16,185,129,0.18); padding-bottom: 6px;">
                  2. File Gốc Hãng (filegocKas.xlsx)
                </div>
                <div v-if="cardRefCompareData.gocFound" style="display: flex; flex-direction: column; gap: 7px; font-size: 13px;">
                  <div><span style="color: #94a3b8;">PartNumber (SKU):</span> <code style="color: #34d399; font-weight: 800;">{{ cardRefCompareData.sku }}</code></div>
                  <div><span style="color: #94a3b8;">Position Code:</span> <code style="color: #38bdf8; font-weight: 800;">{{ cardRefCompareData.posCode || '-' }}</code></div>
                  <div><span style="color: #94a3b8;">Product:</span> <strong style="color: #f8fafc;">{{ cardRefCompareData.gocPivotEntry?.product || cardRefCompareData.item.Danh_muc }}</strong></div>
                  <div><span style="color: #94a3b8;">Type / Term:</span> <span style="color: #cbd5e1;">{{ cardRefCompareData.gocPivotEntry?.type || cardRefCompareData.item.Type }} / {{ cardRefCompareData.gocPivotEntry?.term || cardRefCompareData.item.License_duration }}</span></div>
                  <div>
                    <span style="color: #94a3b8;">Tọa độ dòng:</span>
                    <span style="color: #a7f3d0; font-weight: 600;">
                      Pivot #{{ cardRefCompareData.gocPivotRow || '-' }} (Ô {{ cardRefCompareData.gocPivotColLetter }}{{ cardRefCompareData.gocPivotRow }})
                      <template v-if="cardRefCompareData.gocSaleRow"> · SaleList #{{ cardRefCompareData.gocSaleRow }}</template>
                    </span>
                  </div>
                  <div style="margin-top: 6px; padding-top: 8px; border-top: 1px dashed rgba(16,185,129,0.25); display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #a7f3d0; font-weight: 700;">Giá File Gốc ({{ cardRefCompareData.band }}):</span>
                    <strong style="font-size: 16px; color: #34d399;">{{ formatVndPrice(cardRefCompareData.gocPrice) }}</strong>
                  </div>
                </div>
                <div v-else style="color: #94a3b8; font-size: 13px; padding: 12px 0;">
                  Không tìm thấy mã SKU này trong <code>filegocKas.xlsx</code>.
                </div>
              </div>

              <!-- Cột 3: File Mẫu Import Kaspersky -->
              <div style="background: rgba(56, 189, 248, 0.06); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; padding: 14px 16px;">
                <div style="font-size: 12.5px; font-weight: 800; color: #38bdf8; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid rgba(56,189,248,0.18); padding-bottom: 6px;">
                  3. File Mẫu Import (KASPERSKY_file_mau_import)
                </div>
                <div v-if="cardRefCompareData.mauFound" style="display: flex; flex-direction: column; gap: 7px; font-size: 13px;">
                  <div><span style="color: #94a3b8;">Dòng trên Sheet Pivot:</span> <strong style="color: #e2e8f0;">{{ cardRefCompareData.mauPivotRow ? `Dòng #${cardRefCompareData.mauPivotRow}` : 'Chưa có trên Pivot' }}</strong></div>
                  <div><span style="color: #94a3b8;">Dòng trên Sheet SaleList:</span> <strong style="color: #e2e8f0;">{{ cardRefCompareData.mauSaleRow ? `Dòng #${cardRefCompareData.mauSaleRow}` : 'Chưa có' }}</strong></div>
                  <div style="margin-top: 6px; padding-top: 8px; border-top: 1px dashed rgba(56,189,248,0.25); display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #bae6fd; font-weight: 700;">Giá File Mẫu ({{ cardRefCompareData.band }}):</span>
                    <strong style="font-size: 16px; color: #38bdf8;">{{ formatVndPrice(cardRefCompareData.mauPrice) }}</strong>
                  </div>
                  <div v-if="cardRefCompareData.mauIsOldPre10" style="font-size: 12px; color: #fbbf24; margin-top: 4px;">
                    ⚠️ Giá trong File Mẫu đang là giá cũ trước đợt tăng +10% (Effective July 1, 2026).
                  </div>
                </div>
                <div v-else style="color: #94a3b8; font-size: 13px; padding: 12px 0;">
                  Chưa có mã này trong <code>KASPERSKY_file_mau_import.xlsx</code>.
                </div>
              </div>
            </div>

            <!-- Bảng toàn bộ các mức Band của cùng SKU Kaspersky trong File Gốc -->
            <div v-if="cardRefCompareData.gocPivotEntry && cardRefCompareData.gocPivotEntry.prices" style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 12px; padding: 12px 16px;">
              <div style="font-size: 12.5px; font-weight: 700; color: #cbd5e1; margin-bottom: 8px;">
                📊 Toàn bộ dải Band giá của mã <code>{{ cardRefCompareData.sku }}</code> trên Dòng #{{ cardRefCompareData.gocPivotRow }} (Sheet <code>SMB+Enterprise (License)</code>):
              </div>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                <div
                  v-for="(bPrice, bName) in cardRefCompareData.gocPivotEntry.prices"
                  :key="bName"
                  :style="{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    background: bName === cardRefCompareData.band ? 'rgba(16, 185, 129, 0.22)' : 'rgba(30, 41, 59, 0.8)',
                    border: bName === cardRefCompareData.band ? '1.5px solid #10b981' : '1px solid rgba(148, 163, 184, 0.2)',
                    color: bName === cardRefCompareData.band ? '#ecfdf5' : '#cbd5e1'
                  }"
                  @click="openKasExcelNavigator({ fileType: 'kas_goc', sheet: 'SMB+Enterprise (License)', rowNum: cardRefCompareData.gocPivotRow, colLetter: colIndexToLetter(cardRefCompareData.gocPivotEntry.bandCols?.[bName] ?? 9), sku: cardRefCompareData.sku, band: bName, itemName: cardRefCompareData.item.Ten_hang })"
                  title="Bấm để mở File Gốc tại ô Band này"
                >
                  <div style="font-weight: 700; color: #94a3b8; font-size: 11px;">{{ bName }}</div>
                  <div style="font-weight: 800; color: #34d399; margin-top: 2px;">{{ formatVndPrice(bPrice) }}</div>
                </div>
              </div>
            </div>
          </template>

          <!-- ==================== GIAO DIỆN ĐỐI CHIẾU ACRONIS ==================== -->
          <template v-else-if="cardRefCompareData && cardRefCompareData.vendor === 'acronis'">
            <!-- Banner mở nhanh File Gốc Excel Acronis -->
            <div style="background: rgba(15, 23, 42, 0.78); border: 1px solid rgba(129, 140, 248, 0.4); border-radius: 12px; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px;">
              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                <div style="font-size: 13px; color: #e2e8f0; font-weight: 700; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span>🎯 Bấm mở xem trực tiếp trong File Excel Gốc Acronis (Tự động nhảy tới dòng &amp; tô sáng ô SKU / Đơn giá):</span>
                  <code v-if="cardRefCompareData.skuFor" style="background: rgba(99, 102, 241, 0.22); color: #a5b4fc; padding: 2px 8px; border-radius: 6px; font-weight: 800;">
                    SKU For: {{ cardRefCompareData.skuFor }}
                  </code>
                  <code v-if="cardRefCompareData.sku" style="background: rgba(16, 185, 129, 0.16); color: #34d399; padding: 2px 8px; border-radius: 6px; font-weight: 800;">
                    SKU: {{ cardRefCompareData.sku }}
                  </code>
                  <span v-if="cardRefCompareData.sheet" style="background: rgba(56, 189, 248, 0.16); color: #38bdf8; padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: 700;">
                    Sheet: {{ cardRefCompareData.sheet }}
                  </span>
                </div>
              </div>

              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                <button
                  v-if="cardRefCompareData.gocRowNum"
                  type="button"
                  class="excel-jump-chip excel-jump-chip--goc"
                  style="padding: 7px 12px; font-size: 12.5px;"
                  @click="openAcronisExcelNavigator({ fileType: 'acronis_goc', sheet: cardRefCompareData.sheet, rowNum: cardRefCompareData.gocRowNum, colLetter: 'D', sku: cardRefCompareData.sku || cardRefCompareData.skuFor, itemName: cardRefCompareData.item.Ten_hang })"
                >
                  📗 Mở <strong>file_goc_acronis.xlsx</strong> — Sheet <code>{{ cardRefCompareData.sheet }}</code> (Dòng #{{ cardRefCompareData.gocRowNum }}, Ô D{{ cardRefCompareData.gocRowNum }})
                </button>
                <button
                  v-if="cardRefCompareData.gocRowNum"
                  type="button"
                  class="vendor-file-office-btn"
                  style="padding: 7px 12px; font-size: 12.5px;"
                  @click="openCompareOfficePreview({ vendor: 'acronis', role: 'goc', sheet: cardRefCompareData.sheet, rowNum: cardRefCompareData.gocRowNum, colLetter: 'D', sku: cardRefCompareData.sku || cardRefCompareData.skuFor, itemName: cardRefCompareData.item.Ten_hang })"
                >
                  👁️ Xem bằng ViewOffice (File Gốc — Ô D{{ cardRefCompareData.gocRowNum }})
                </button>
                <button
                  v-if="cardRefCompareData.mauRowNum"
                  type="button"
                  class="excel-jump-chip excel-jump-chip--tg"
                  style="padding: 7px 12px; font-size: 12.5px;"
                  @click="openAcronisExcelNavigator({ fileType: 'acronis_mau', sheet: cardRefCompareData.mauSheet || cardRefCompareData.sheet, rowNum: cardRefCompareData.mauRowNum, colLetter: 'D', sku: cardRefCompareData.sku || cardRefCompareData.skuFor, itemName: cardRefCompareData.item.Ten_hang })"
                >
                  📘 Mở <strong>ACRONIS_file_mau_import.xlsx</strong> — Sheet <code>{{ cardRefCompareData.mauSheet || cardRefCompareData.sheet }}</code> (Dòng #{{ cardRefCompareData.mauRowNum }}, Ô D{{ cardRefCompareData.mauRowNum }})
                </button>
                <button
                  v-if="cardRefCompareData.mauRowNum"
                  type="button"
                  class="vendor-file-office-btn"
                  style="padding: 7px 12px; font-size: 12.5px;"
                  @click="openCompareOfficePreview({ vendor: 'acronis', role: 'mau', sheet: cardRefCompareData.mauSheet || cardRefCompareData.sheet, rowNum: cardRefCompareData.mauRowNum, colLetter: 'D', sku: cardRefCompareData.sku || cardRefCompareData.skuFor, itemName: cardRefCompareData.item.Ten_hang })"
                >
                  👁️ Xem bằng ViewOffice (File Mẫu — Ô D{{ cardRefCompareData.mauRowNum }})
                </button>
                <button
                  v-if="!cardRefCompareData.gocRowNum"
                  type="button"
                  class="excel-jump-chip excel-jump-chip--goc"
                  style="padding: 7px 12px; font-size: 12.5px;"
                  @click="openAcronisExcelNavigator({ fileType: 'acronis_goc', sheet: 'Protect Standard', rowNum: 4, colLetter: 'B', sku: cardRefCompareData.sku || cardRefCompareData.skuFor, itemName: cardRefCompareData.item.Ten_hang })"
                >
                  📗 Mở trình xem <strong>file_goc_acronis.xlsx</strong>
                </button>
                <button
                  type="button"
                  class="excel-jump-chip excel-jump-chip--skulist"
                  style="padding: 7px 12px; font-size: 12.5px;"
                  @click="showCardRefCompareModal = false; openAcronisCompareModal(cardRefCompareData.sheet, cardRefCompareData.sku || cardRefCompareData.skuFor)"
                >
                  🟣 Mở Bảng Đối Chiếu Toàn Bộ Acronis (221 mã)
                </button>
              </div>
            </div>

            <!-- 3 Cột So Sánh Chi Tiết Acronis -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(310px, 1fr)); gap: 14px;">
              <!-- Cột 1: Card Hiện Tại (DB) -->
              <div style="background: rgba(15, 23, 42, 0.72); border: 1px solid rgba(148, 163, 184, 0.25); border-radius: 12px; padding: 14px 16px;">
                <div style="font-size: 12.5px; font-weight: 800; color: #38bdf8; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 6px;">
                  1. Dữ Liệu Card Hiện Tại (Database)
                </div>
                <div style="display: flex; flex-direction: column; gap: 7px; font-size: 13px;">
                  <div><span style="color: #94a3b8;">Mã hàng (DB):</span> <code style="color: #f8fafc; font-weight: 700; word-break: break-all;">{{ cardRefCompareData.item.Ma_hang }}</code></div>
                  <div><span style="color: #94a3b8;">SKU Code (DB):</span> <code style="color: #c4b5fd; font-weight: 700;">{{ cardRefCompareData.item.sku_code || '-' }}</code></div>
                  <div><span style="color: #94a3b8;">Tên hàng:</span> <strong style="color: #f8fafc;">{{ cardRefCompareData.item.Ten_hang }}</strong></div>
                  <div><span style="color: #94a3b8;">Danh mục:</span> <span style="color: #cbd5e1;">{{ cardRefCompareData.item.Danh_muc || '-' }}</span></div>
                  <div><span style="color: #94a3b8;">Type / Thời hạn:</span> <span style="color: #cbd5e1;">{{ cardRefCompareData.item.Type || '-' }} / {{ cardRefCompareData.item.License_duration || '-' }}</span></div>
                  <div><span style="color: #94a3b8;">Volume:</span> <strong style="color: #fbbf24;">{{ cardRefCompareData.item.volume || '-' }}</strong></div>
                  <div style="margin-top: 6px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #94a3b8; font-weight: 600;">Giá bán DB (VNĐ):</span>
                    <strong style="font-size: 16px; color: #38bdf8;">{{ formatVndPrice(cardRefCompareData.dbPrice) }}</strong>
                  </div>
                </div>
              </div>

              <!-- Cột 2: File Gốc Acronis (file_goc_acronis.xlsx) -->
              <div style="background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.32); border-radius: 12px; padding: 14px 16px;">
                <div style="font-size: 12.5px; font-weight: 800; color: #34d399; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid rgba(16,185,129,0.18); padding-bottom: 6px;">
                  2. File Gốc Hãng (file_goc_acronis.xlsx)
                </div>
                <div v-if="cardRefCompareData.gocFound" style="display: flex; flex-direction: column; gap: 7px; font-size: 13px;">
                  <div><span style="color: #94a3b8;">SKU For (Cột A):</span> <code style="color: #a5b4fc; font-weight: 800;">{{ cardRefCompareData.skuFor || '-' }}</code></div>
                  <div><span style="color: #94a3b8;">SKU (Cột B):</span> <code style="color: #34d399; font-weight: 800;">{{ cardRefCompareData.sku || '-' }}</code></div>
                  <div><span style="color: #94a3b8;">Mô tả sản phẩm (Cột C):</span> <strong style="color: #f8fafc;">{{ cardRefCompareData.gocEntry?.moTa || '-' }}</strong></div>
                  <div><span style="color: #94a3b8;">Sheet / Danh mục:</span> <span style="color: #cbd5e1;">{{ cardRefCompareData.sheet }} · {{ cardRefCompareData.gocEntry?.category || '-' }}</span></div>
                  <div>
                    <span style="color: #94a3b8;">Tọa độ dòng:</span>
                    <span style="color: #a7f3d0; font-weight: 600;">
                      Sheet <code>{{ cardRefCompareData.sheet }}</code> — Dòng #{{ cardRefCompareData.gocRowNum }} (Ô B{{ cardRefCompareData.gocRowNum }} / Giá: Ô D{{ cardRefCompareData.gocRowNum }})
                    </span>
                  </div>
                  <div style="margin-top: 6px; padding-top: 8px; border-top: 1px dashed rgba(16,185,129,0.25); display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #a7f3d0; font-weight: 700;">Unit Price File Gốc (VNĐ):</span>
                    <strong style="font-size: 16px; color: #34d399;">{{ formatVndPrice(cardRefCompareData.gocPrice) }}</strong>
                  </div>
                </div>
                <div v-else style="color: #94a3b8; font-size: 13px; padding: 12px 0;">
                  Không tìm thấy mã SKU này trong <code>file_goc_acronis.xlsx</code>.
                </div>
              </div>

              <!-- Cột 3: File Mẫu Import Acronis (ACRONIS_file_mau_import.xlsx) -->
              <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(129, 140, 248, 0.32); border-radius: 12px; padding: 14px 16px;">
                <div style="font-size: 12.5px; font-weight: 800; color: #a5b4fc; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid rgba(129,140,248,0.2); padding-bottom: 6px;">
                  3. File Mẫu Import (ACRONIS_file_mau_import)
                </div>
                <div v-if="cardRefCompareData.mauFound" style="display: flex; flex-direction: column; gap: 7px; font-size: 13px;">
                  <div><span style="color: #94a3b8;">Sheet Mẫu:</span> <strong style="color: #e2e8f0;">{{ cardRefCompareData.mauSheet }}</strong></div>
                  <div><span style="color: #94a3b8;">Tọa độ dòng:</span> <strong style="color: #e2e8f0;">Dòng #{{ cardRefCompareData.mauRowNum }} (Ô D{{ cardRefCompareData.mauRowNum }})</strong></div>
                  <div><span style="color: #94a3b8;">Mô tả trong File Mẫu:</span> <span style="color: #cbd5e1;">{{ cardRefCompareData.mauEntry?.moTa || '-' }}</span></div>
                  <div style="margin-top: 6px; padding-top: 8px; border-top: 1px dashed rgba(129,140,248,0.28); display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #c7d2fe; font-weight: 700;">Unit Price File Mẫu (VNĐ):</span>
                    <strong style="font-size: 16px; color: #a5b4fc;">{{ formatVndPrice(cardRefCompareData.mauPrice) }}</strong>
                  </div>
                </div>
                <div v-else style="color: #94a3b8; font-size: 13px; padding: 12px 0;">
                  Chưa có mã này trong <code>ACRONIS_file_mau_import.xlsx</code>.
                </div>
              </div>
            </div>

            <!-- Danh sách các mã cùng Danh mục trong file_goc_acronis.xlsx -->
            <div v-if="cardRefCompareData.relatedItems && cardRefCompareData.relatedItems.length > 0" style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 12px; padding: 12px 16px;">
              <div style="font-size: 12.5px; font-weight: 700; color: #cbd5e1; margin-bottom: 8px;">
                📊 Các gói cùng mục <code>{{ cardRefCompareData.gocEntry?.category || cardRefCompareData.item.Danh_muc }}</code> trên Sheet <code>{{ cardRefCompareData.sheet }}</code> (<code>file_goc_acronis.xlsx</code>):
              </div>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                <div
                  v-for="rel in cardRefCompareData.relatedItems"
                  :key="rel.maHang"
                  :style="{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    background: rel.sku === cardRefCompareData.sku ? 'rgba(99, 102, 241, 0.24)' : 'rgba(30, 41, 59, 0.8)',
                    border: rel.sku === cardRefCompareData.sku ? '1.5px solid #818cf8' : '1px solid rgba(148, 163, 184, 0.2)',
                    color: rel.sku === cardRefCompareData.sku ? '#e0e7ff' : '#cbd5e1'
                  }"
                  @click="openAcronisExcelNavigator({ fileType: 'acronis_goc', sheet: rel.sheet, rowNum: rel.rowNum, colLetter: 'D', sku: rel.sku || rel.skuFor, itemName: rel.moTa })"
                  :title="`${rel.moTa} — Bấm để mở file_goc_acronis.xlsx tại Dòng #${rel.rowNum}`"
                >
                  <div style="font-weight: 700; color: #a5b4fc; font-size: 11px;">
                    {{ rel.skuFor ? `${rel.skuFor} - ${rel.sku}` : rel.sku }} (Dòng #{{ rel.rowNum }})
                  </div>
                  <div style="font-size: 11px; color: #94a3b8; max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px;">
                    {{ rel.moTa }}
                  </div>
                  <div style="font-weight: 800; color: #34d399; margin-top: 2px;">{{ formatVndPrice(rel.price) }}</div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Footer -->
        <div class="import-modal__footer" style="padding: 14px 22px; border-top: 1px solid rgba(148,163,184,0.18); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div style="font-size: 12.5px; color: #94a3b8;">
            <template v-if="cardRefCompareData?.status === 'diff'">
              💡 Giá trên Card hiện tại đang lệch <strong>{{ cardRefCompareData.priceDiff > 0 ? '+' : '' }}{{ cardRefCompareData.vendor === 'sophos' ? formatUsdPrice(cardRefCompareData.priceDiff) : formatVndPrice(cardRefCompareData.priceDiff) }}</strong> ({{ cardRefCompareData.priceDiffPct.toFixed(1) }}%) so với File Gốc.
            </template>
            <template v-else-if="cardRefCompareData?.status === 'match'">
              ✅ Giá bán trên Card hiện tại khớp hoàn toàn với File Excel Gốc của hãng.
            </template>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <button
              v-if="cardRefCompareData && cardRefCompareData.refPrice > 0 && cardRefCompareData.status === 'diff'"
              type="button"
              class="btn btn-primary"
              :disabled="syncingCardRefToDb"
              style="background: linear-gradient(135deg, #10b981, #059669); border: none; font-weight: 700;"
              @click="syncCardItemWithOriginalFile"
            >
              {{ syncingCardRefToDb ? '⏳ Đang cập nhật...' : `🔄 Cập nhật Card theo Giá File Gốc (${cardRefCompareData.vendor === 'sophos' ? formatUsdPrice(cardRefCompareData.refPrice) : formatVndPrice(cardRefCompareData.refPrice)})` }}
            </button>
            <button type="button" class="btn btn-secondary" @click="showCardRefCompareModal = false">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL ĐỐI CHIẾU TOÀN BỘ BẢNG GIÁ GỐC ACRONIS (file_goc_acronis.xlsx ⇄ ACRONIS_file_mau_import.xlsx ⇄ DATABASE) -->
    <div v-if="showAcronisCompareModal" class="import-overlay" style="z-index: 10250;" @click.self="showAcronisCompareModal = false">
      <div class="import-modal" style="max-width: 1380px; width: 97vw; max-height: 93vh; display: flex; flex-direction: column; overflow: hidden;">
        <!-- Header -->
        <div class="import-modal__header" style="padding: 15px 22px; border-bottom: 1px solid rgba(148,163,184,0.18);">
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <span style="padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 800; background: rgba(99, 102, 241, 0.22); color: #a5b4fc; border: 1px solid rgba(129, 140, 248, 0.5);">
              🟣 ĐỐI CHIẾU ACRONIS
            </span>
            <h2 class="import-modal__title" style="margin: 0; font-size: 16.5px;">
              Đối Chiếu Bảng Giá Gốc Acronis (☁️ File Gốc: <code>{{ vendorRefFilesMeta.acronis?.goc_file_name || 'file_goc_acronis.xlsx' }}</code> ⇄ <code>Database</code>)
            </h2>
            <span v-if="vendorRefFilesMeta.acronis?.updated_at" style="font-size: 11.5px; color: #94a3b8;">
              Cập nhật Cloudinary: {{ formatRefTimestamp(vendorRefFilesMeta.acronis.updated_at) }}
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <button
              type="button"
              class="excel-jump-chip excel-jump-chip--goc"
              style="padding: 6px 11px; font-size: 12px;"
              @click="openAcronisExcelNavigator({ fileType: 'acronis_goc', sheet: acronisCompareSheetFilter !== 'ALL' ? acronisCompareSheetFilter : 'Protect Standard', rowNum: 4, colLetter: 'B' })"
            >
              📗 Xem <strong>{{ vendorRefFilesMeta.acronis?.goc_file_name || 'file_goc_acronis.xlsx' }}</strong>
            </button>
            <div
              v-if="getVendorCompareFileMeta('acronis', 'goc')"
              style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 8px; background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(129, 140, 248, 0.4); font-size: 12px;"
            >
              <a
                :href="getVendorOfficeViewUrl(getVendorCompareFileMeta('acronis', 'goc'))"
                target="_blank"
                rel="noopener noreferrer"
                style="color: #c7d2fe; font-weight: 700; text-decoration: underline;"
                title="Click để mở xem File Gốc Acronis trên ViewOffice (Tab mới)"
                @click="handleOpenVendorOfficeView($event, 'acronis', 'goc', getVendorCompareFileMeta('acronis', 'goc'))"
              >
                👁️ File đã up: {{ getVendorCompareFileMeta('acronis', 'goc').name }}
              </a>
              <button
                type="button"
                class="vendor-file-office-btn"
                title="Mở ViewOffice trong tab mới và nhảy tới sheet hiện tại"
                @click.stop="openCompareOfficePreview({ vendor: 'acronis', role: 'goc', sheet: acronisCompareSheetFilter !== 'ALL' ? acronisCompareSheetFilter : 'Protect Standard', rowNum: 4, colLetter: 'D' })"
              >
                👁️ Xem bằng ViewOffice
              </button>
              <button
                type="button"
                class="vendor-file-download-btn"
                title="Tải File Gốc Acronis về máy"
                @click.stop="handleDownloadVendorUploadedFile('acronis', 'goc', getVendorCompareFileMeta('acronis', 'goc'))"
              >
                ⬇ Tải về
              </button>
            </div>
            <label
              class="btn btn-outline"
              style="padding: 5px 10px; font-size: 12px; border-color: rgba(56,189,248,0.45); color: #38bdf8; cursor: pointer; margin: 0;"
              title="Upload File Gốc Acronis mới lên Cloudinary để cập nhật đối chiếu"
            >
              <input type="file" accept=".xlsx,.xls" style="display: none;" @change="handleCustomAcronisExcelUpload($event, 'goc')" />
              ☁️ Up File Gốc Acronis mới
            </label>
            <button
              type="button"
              class="btn btn-outline"
              style="padding: 5px 10px; font-size: 12px; border-color: rgba(16,185,129,0.45); color: #34d399;"
              @click="exportAcronisComparisonToExcel"
            >
              📊 Xuất Báo Cáo Excel
            </button>
            <button type="button" class="import-modal__close" @click="showAcronisCompareModal = false">✕</button>
          </div>
        </div>

        <!-- Body -->
        <div style="padding: 16px 22px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 14px;">
          <div v-if="vendorRefLoadError.acronis" style="padding: 10px 14px; border-radius: 8px; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.45); color: #fca5a5; font-size: 12.5px; font-weight: 700;">
            ⚠️ {{ vendorRefLoadError.acronis }}
          </div>

          <!-- Khung ViewOffice nhúng trực tiếp ngay trong Bảng Đối Chiếu Acronis -->
          <div v-if="compareOfficePreview.show && compareOfficePreview.vendor === 'acronis'" class="compare-office-embed-panel">
            <div class="compare-office-embed-header">
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span style="font-weight: 800; color: #a5b4fc;">👁️ Microsoft ViewOffice (Đối chiếu Acronis):</span>
                <button
                  v-if="getVendorCompareFileMeta('acronis', 'goc')"
                  type="button"
                  class="compare-office-role-btn"
                  :class="{ active: compareOfficePreview.role === 'goc' }"
                  @click="openCompareOfficePreview({ vendor: 'acronis', role: 'goc', sheet: compareOfficePreview.sheet || 'Protect Standard', rowNum: compareOfficePreview.rowNum || 4, colLetter: 'D', sku: compareOfficePreview.sku })"
                >📗 File Gốc ({{ getVendorCompareFileMeta('acronis', 'goc').name }})</button>
                <span v-if="compareOfficePreview.sku" class="compare-office-target-badge">
                  SKU: <strong>{{ compareOfficePreview.sku }}</strong>
                </span>
                <span v-if="compareOfficePreview.sheet && compareOfficePreview.rowNum" class="compare-office-target-badge">
                  📍 Sheet <strong>{{ compareOfficePreview.sheet }}</strong> • Ô {{ compareOfficePreview.colLetter }}{{ compareOfficePreview.rowNum }} (Dòng {{ compareOfficePreview.rowNum }})
                </span>
                <span v-if="compareOfficePreview.copiedLabel" style="color: #34d399; font-weight: 700; font-size: 11.5px;">
                  ✓ {{ compareOfficePreview.copiedLabel }} (Bấm Ctrl+F → Ctrl+V trong bảng để tìm nhanh)
                </span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <button
                  v-if="compareOfficePreview.sku"
                  type="button"
                  class="vendor-file-office-btn"
                  @click="copyCompareOfficeQuickText(compareOfficePreview.sku, `Đã copy SKU: ${compareOfficePreview.sku}`)"
                >📋 Copy SKU</button>
                <a
                  v-if="compareOfficePreview.viewUrl"
                  :href="compareOfficePreview.viewUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="vendor-file-office-btn"
                  style="text-decoration: none;"
                >🌐 Mở Tab Mới</a>
                <button
                  type="button"
                  class="vendor-file-download-btn"
                  @click="handleDownloadVendorUploadedFile('acronis', 'goc', getVendorCompareFileMeta('acronis', 'goc'))"
                >⬇ Tải về</button>
                <button type="button" class="compare-office-close-btn" @click="closeCompareOfficePreview">✕ Đóng ViewOffice</button>
              </div>
            </div>
            <div class="compare-office-embed-body">
              <div v-if="compareOfficePreview.loading" class="compare-office-loading">
                ⏳ Đang chuẩn bị file Excel trên Microsoft ViewOffice...
              </div>
              <iframe
                v-else-if="compareOfficePreview.embedUrl"
                :src="compareOfficePreview.embedUrl"
                class="compare-office-iframe"
                allowfullscreen
              ></iframe>
            </div>
          </div>
          <!-- Thống kê tổng quan 3 chiều -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px;">
            <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 10px; padding: 12px 14px;">
              <div style="font-size: 11.5px; font-weight: 800; color: #34d399; text-transform: uppercase;">
                1. File Gốc Hãng (file_goc_acronis.xlsx)
              </div>
              <div style="font-size: 20px; font-weight: 800; color: #ecfdf5; margin-top: 4px;">
                {{ acronisComparisonRows.length }} mã SKU
              </div>
              <div style="font-size: 12px; color: #a7f3d0; margin-top: 2px;">
                Trên {{ acronisSheetNames.length }} sheets ({{ acronisSheetNames.join(', ') }})
              </div>
            </div>

            <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(129, 140, 248, 0.3); border-radius: 10px; padding: 12px 14px;">
              <div style="font-size: 11.5px; font-weight: 800; color: #a5b4fc; text-transform: uppercase;">
                2. Đối Chiếu ACRONIS_file_mau_import.xlsx
              </div>
              <div style="display: flex; gap: 14px; align-items: baseline; margin-top: 4px; flex-wrap: wrap;">
                <span style="font-size: 14px; font-weight: 800; color: #34d399;">✓ Khớp: {{ acronisComparisonSummary.mauMatch }}</span>
                <span style="font-size: 14px; font-weight: 800; color: #fbbf24;">⚠️ Lệch: {{ acronisComparisonSummary.mauDiff }}</span>
                <span style="font-size: 14px; font-weight: 800; color: #f87171;">✕ Thiếu: {{ acronisComparisonSummary.mauMissing }}</span>
              </div>
              <div style="font-size: 12px; color: #c7d2fe; margin-top: 2px;">
                So sánh Unit Price giữa file gốc và file mẫu import
              </div>
            </div>

            <div style="background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 10px; padding: 12px 14px;">
              <div style="font-size: 11.5px; font-weight: 800; color: #38bdf8; text-transform: uppercase;">
                3. Đối Chiếu Database Hệ Thống (hang_hoa)
              </div>
              <div style="display: flex; gap: 14px; align-items: baseline; margin-top: 4px; flex-wrap: wrap;">
                <span style="font-size: 14px; font-weight: 800; color: #34d399;">✓ Khớp DB: {{ acronisComparisonSummary.dbMatch }}</span>
                <span style="font-size: 14px; font-weight: 800; color: #fbbf24;">⚠️ Lệch giá DB: {{ acronisComparisonSummary.dbDiff }}</span>
                <span style="font-size: 14px; font-weight: 800; color: #f87171;">➕ Chưa có DB: {{ acronisComparisonSummary.dbMissing }}</span>
              </div>
              <div style="font-size: 12px; color: #bae6fd; margin-top: 2px;">
                Đồng bộ 1-click từ <code>file_goc_acronis.xlsx</code> vào Firebase
              </div>
            </div>
          </div>

          <!-- Bộ lọc Sheet, Trạng thái & Tìm kiếm -->
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; background: rgba(15, 23, 42, 0.72); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 10px; padding: 10px 14px;">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <!-- Lọc theo Sheet -->
              <select
                v-model="acronisCompareSheetFilter"
                style="height: 36px; padding: 0 12px; border-radius: 8px; border: 1px solid rgba(129, 140, 248, 0.4); background: rgba(30, 41, 59, 0.9); color: #e0e7ff; font-size: 12.5px; font-weight: 700;"
              >
                <option value="ALL">📑 Tất cả Sheets ({{ acronisComparisonRows.length }})</option>
                <option v-for="sh in acronisSheetNames" :key="sh" :value="sh">
                  📄 {{ sh }} ({{ acronisComparisonRows.filter(r => r.sheet === sh).length }})
                </option>
              </select>

              <!-- Lọc theo trạng thái DB -->
              <div style="display: inline-flex; gap: 4px; background: rgba(30, 41, 59, 0.8); padding: 3px; border-radius: 8px; border: 1px solid rgba(148, 163, 184, 0.2);">
                <button
                  type="button"
                  :style="{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    background: acronisCompareFilterMode === 'all' ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
                    color: acronisCompareFilterMode === 'all' ? '#e0e7ff' : '#94a3b8'
                  }"
                  @click="acronisCompareFilterMode = 'all'"
                >
                  Tất cả ({{ acronisComparisonRows.length }})
                </button>
                <button
                  type="button"
                  :style="{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    background: acronisCompareFilterMode === 'db_issue' ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
                    color: acronisCompareFilterMode === 'db_issue' ? '#fde68a' : '#94a3b8'
                  }"
                  @click="acronisCompareFilterMode = 'db_issue'"
                >
                  Cần xử lý ({{ acronisComparisonSummary.dbDiff + acronisComparisonSummary.dbMissing }})
                </button>
                <button
                  type="button"
                  :style="{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    background: acronisCompareFilterMode === 'db_diff' ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
                    color: acronisCompareFilterMode === 'db_diff' ? '#fbbf24' : '#94a3b8'
                  }"
                  @click="acronisCompareFilterMode = 'db_diff'"
                >
                  Lệch giá DB ({{ acronisComparisonSummary.dbDiff }})
                </button>
                <button
                  type="button"
                  :style="{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    background: acronisCompareFilterMode === 'db_missing' ? 'rgba(239, 68, 68, 0.25)' : 'transparent',
                    color: acronisCompareFilterMode === 'db_missing' ? '#fca5a5' : '#94a3b8'
                  }"
                  @click="acronisCompareFilterMode = 'db_missing'"
                >
                  Thiếu trong DB ({{ acronisComparisonSummary.dbMissing }})
                </button>
              </div>

              <!-- Ô tìm kiếm SKU / Mô tả -->
              <input
                type="text"
                v-model="acronisCompareSearch"
                placeholder="Tìm SKU, SKU For, mô tả, danh mục..."
                style="height: 36px; min-width: 240px; padding: 0 12px; border-radius: 8px; border: 1px solid rgba(148, 163, 184, 0.3); background: rgba(15, 23, 42, 0.9); color: #f8fafc; font-size: 12.5px;"
              />
            </div>

            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <button
                type="button"
                class="btn btn-outline"
                style="padding: 6px 12px; font-size: 12px; border-color: rgba(245, 158, 11, 0.45); color: #fbbf24;"
                @click="selectAllNeedSyncAcronisRows"
              >
                ☑️ Chọn tất cả dòng Lệch / Thiếu ({{ acronisComparisonSummary.dbDiff + acronisComparisonSummary.dbMissing }})
              </button>
              <button
                type="button"
                class="btn btn-primary"
                style="padding: 6px 14px; font-size: 12.5px; font-weight: 700; background: linear-gradient(135deg, #6366f1, #4f46e5); border: none;"
                :disabled="syncingAcronisCompareToDb || selectedAcronisComparisonRowsCount === 0"
                @click="syncSelectedAcronisCompareRowsToDb"
              >
                {{ syncingAcronisCompareToDb ? '⏳ Đang đồng bộ...' : `🔄 Đồng bộ ${selectedAcronisComparisonRowsCount} mã đã chọn vào DB` }}
              </button>
            </div>
          </div>

          <!-- Bảng đối chiếu chi tiết -->
          <div style="border: 1px solid rgba(148, 163, 184, 0.22); border-radius: 10px; overflow: auto; max-height: 56vh;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12.5px;">
              <thead style="position: sticky; top: 0; z-index: 5; background: #0f172a; border-bottom: 1px solid rgba(148, 163, 184, 0.25);">
                <tr>
                  <th style="padding: 10px 8px; text-align: center; width: 36px;">
                    <input
                      type="checkbox"
                      :checked="allFilteredAcronisCompareSelected"
                      @change="toggleSelectAllFilteredAcronisCompare($event.target.checked)"
                    />
                  </th>
                  <th style="padding: 10px 10px; text-align: left; color: #94a3b8;">Sheet / Danh mục</th>
                  <th style="padding: 10px 10px; text-align: left; color: #94a3b8;">SKU For / SKU</th>
                  <th style="padding: 10px 10px; text-align: left; color: #94a3b8;">Mô tả sản phẩm (Tên hàng)</th>
                  <th style="padding: 10px 10px; text-align: right; color: #34d399;">Giá file_goc_acronis.xlsx</th>
                  <th style="padding: 10px 10px; text-align: right; color: #a5b4fc;">Giá ACRONIS_file_mau</th>
                  <th style="padding: 10px 10px; text-align: right; color: #38bdf8;">Giá Database (hang_hoa)</th>
                  <th style="padding: 10px 10px; text-align: center; color: #94a3b8;">Trạng thái DB</th>
                  <th style="padding: 10px 10px; text-align: center; color: #94a3b8;">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!filteredAcronisComparisonRows.length">
                  <td colspan="9" style="padding: 28px; text-align: center; color: #94a3b8;">
                    Không có dòng dữ liệu nào khớp bộ lọc hiện tại.
                  </td>
                </tr>
                <tr
                  v-for="row in filteredAcronisComparisonRows"
                  :key="row.id"
                  style="border-bottom: 1px solid rgba(148, 163, 184, 0.12);"
                  :style="{
                    background: row.dbStatus === 'diff'
                      ? 'rgba(245, 158, 11, 0.06)'
                      : (row.dbStatus === 'missing' ? 'rgba(239, 68, 68, 0.05)' : 'transparent')
                  }"
                >
                  <td style="padding: 8px; text-align: center;">
                    <input type="checkbox" v-model="row.selected" />
                  </td>
                  <td style="padding: 8px 10px;">
                    <div style="font-weight: 700; color: #a5b4fc; font-size: 11.5px;">{{ row.sheet }}</div>
                    <div style="color: #94a3b8; font-size: 11px; max-width: 210px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" :title="row.category">
                      {{ row.category }}
                    </div>
                  </td>
                  <td style="padding: 8px 10px; font-family: monospace;">
                    <div v-if="row.skuFor" style="color: #cbd5e1; font-size: 11px;">For: <strong>{{ row.skuFor }}</strong></div>
                    <div style="color: #34d399; font-weight: 800; font-size: 12px;">{{ row.sku || row.skuFor }}</div>
                  </td>
                  <td style="padding: 8px 10px;">
                    <div style="font-weight: 600; color: #f8fafc;">{{ row.moTa }}</div>
                    <div style="display: flex; gap: 6px; margin-top: 3px; flex-wrap: wrap;">
                      <span v-if="row.licenseDuration" style="font-size: 10.5px; padding: 1px 6px; border-radius: 4px; background: rgba(168, 85, 247, 0.16); color: #c084fc;">
                        {{ row.licenseDuration }}
                      </span>
                      <span v-if="row.type" style="font-size: 10.5px; padding: 1px 6px; border-radius: 4px; background: rgba(56, 189, 248, 0.15); color: #38bdf8;">
                        {{ row.type }}
                      </span>
                      <span v-if="row.volume" style="font-size: 10.5px; padding: 1px 6px; border-radius: 4px; background: rgba(245, 158, 11, 0.15); color: #fbbf24;">
                        {{ row.volume }}
                      </span>
                    </div>
                  </td>
                  <td style="padding: 8px 10px; text-align: right;">
                    <div style="font-weight: 800; color: #34d399; font-size: 13px;">
                      {{ formatVndPrice(row.gocPrice) }}
                    </div>
                    <div style="margin-top: 4px; display: flex; gap: 4px; justify-content: flex-end; flex-wrap: wrap;">
                      <button
                        type="button"
                        class="excel-jump-chip excel-jump-chip--goc"
                        style="padding: 2px 7px; font-size: 11px;"
                        @click="openAcronisExcelNavigator({ fileType: 'acronis_goc', sheet: row.sheet, rowNum: row.gocRowNum, colLetter: 'D', sku: row.sku || row.skuFor, itemName: row.moTa })"
                        title="Mở định vị dòng nhanh trong file_goc_acronis.xlsx"
                      >
                        📗 Gốc #{{ row.gocRowNum }} (D{{ row.gocRowNum }})
                      </button>
                      <button
                        type="button"
                        class="vendor-file-office-btn"
                        style="padding: 2px 6px; font-size: 10.5px;"
                        @click="openCompareOfficePreview({ vendor: 'acronis', role: 'goc', sheet: row.sheet, rowNum: row.gocRowNum, colLetter: 'D', sku: row.sku || row.skuFor, itemName: row.moTa })"
                        :title="`Mở ViewOffice trong tab mới và nhảy trực tiếp tới ô D${row.gocRowNum} (Sheet ${row.sheet})`"
                      >
                        👁️ Xem bằng ViewOffice
                      </button>
                    </div>
                  </td>
                  <td style="padding: 8px 10px; text-align: right;">
                    <template v-if="row.mauFound">
                      <div style="font-weight: 700; color: #c7d2fe;">{{ formatVndPrice(row.mauPrice) }}</div>
                      <div style="margin-top: 4px; display: flex; gap: 4px; justify-content: flex-end; flex-wrap: wrap;">
                        <button
                          type="button"
                          class="excel-jump-chip excel-jump-chip--tg"
                          style="padding: 2px 7px; font-size: 11px;"
                          @click="openAcronisExcelNavigator({ fileType: 'acronis_mau', sheet: row.mauSheet || row.sheet, rowNum: row.mauRowNum, colLetter: 'D', sku: row.sku || row.skuFor, itemName: row.moTa })"
                          title="Mở ACRONIS_file_mau_import.xlsx tại dòng này"
                        >
                          📘 Mẫu #{{ row.mauRowNum }}
                        </button>
                        <button
                          type="button"
                          class="vendor-file-office-btn"
                          style="padding: 2px 6px; font-size: 10.5px;"
                          @click="openCompareOfficePreview({ vendor: 'acronis', role: 'mau', sheet: row.mauSheet || row.sheet, rowNum: row.mauRowNum, colLetter: 'D', sku: row.sku || row.skuFor, itemName: row.moTa })"
                          :title="`Mở ViewOffice trong tab mới và nhảy trực tiếp tới ô D${row.mauRowNum} (Sheet ${row.mauSheet || row.sheet})`"
                        >
                          👁️ Xem bằng ViewOffice
                        </button>
                      </div>
                    </template>
                    <span v-else style="color: #64748b; font-size: 11.5px;">Chưa có</span>
                  </td>
                  <td style="padding: 8px 10px; text-align: right;">
                    <template v-if="row.dbItem">
                      <div style="font-weight: 800; color: #38bdf8; font-size: 13px;">
                        {{ formatVndPrice(row.dbPrice) }}
                      </div>
                      <div style="font-size: 10.5px; color: #94a3b8; font-family: monospace;">
                        {{ row.dbItem.Ma_hang }}
                      </div>
                    </template>
                    <span v-else style="color: #f87171; font-size: 11.5px; font-weight: 600;">Chưa có trong DB</span>
                  </td>
                  <td style="padding: 8px 10px; text-align: center;">
                    <span
                      v-if="row.dbStatus === 'match'"
                      style="display: inline-block; padding: 3px 8px; border-radius: 99px; font-size: 11px; font-weight: 700; background: rgba(16, 185, 129, 0.16); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.35);"
                    >
                      ✓ Khớp giá
                    </span>
                    <span
                      v-else-if="row.dbStatus === 'diff'"
                      style="display: inline-block; padding: 3px 8px; border-radius: 99px; font-size: 11px; font-weight: 700; background: rgba(245, 158, 11, 0.16); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4);"
                    >
                      ⚠️ Lệch {{ row.dbDiff > 0 ? '+' : '' }}{{ formatVndPrice(row.dbDiff) }}
                    </span>
                    <span
                      v-else
                      style="display: inline-block; padding: 3px 8px; border-radius: 99px; font-size: 11px; font-weight: 700; background: rgba(239, 68, 68, 0.16); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.35);"
                    >
                      ➕ Thiếu DB
                    </span>
                  </td>
                  <td style="padding: 8px 10px; text-align: center;">
                    <button
                      type="button"
                      class="btn btn-outline"
                      style="padding: 4px 10px; font-size: 11.5px; font-weight: 700;"
                      :style="row.dbStatus === 'match'
                        ? 'border-color: rgba(148,163,184,0.3); color: #94a3b8;'
                        : 'border-color: rgba(16,185,129,0.5); color: #34d399; background: rgba(16,185,129,0.1);'"
                      :disabled="syncingAcronisCompareToDb"
                      @click="syncSingleAcronisCompareRowToDb(row)"
                    >
                      {{ row.dbItem ? '🔄 Cập nhật DB' : '➕ Thêm vào DB' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Footer -->
        <div class="import-modal__footer" style="padding: 12px 22px; border-top: 1px solid rgba(148,163,184,0.18); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div style="font-size: 12.5px; color: #94a3b8;">
            Đang hiển thị <strong style="color: #e0e7ff;">{{ filteredAcronisComparisonRows.length }}</strong> / <strong>{{ acronisComparisonRows.length }}</strong> sản phẩm từ <code>file_goc_acronis.xlsx</code>.
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <button type="button" class="btn btn-secondary" @click="showAcronisCompareModal = false">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ASYNC RESULT MODAL -->
    <Transition name="async-modal">
      <div v-if="asyncResultModal.show" class="async-overlay" @click.self="asyncResultModal.type !== 'loading' && (asyncResultModal.show = false)">
        <div class="async-card" :class="'async-' + asyncResultModal.type">
          <!-- LOADING -->
          <template v-if="asyncResultModal.type === 'loading'">
            <div class="async-spinner-wrap">
              <svg class="async-spinner" viewBox="0 0 50 50">
                <defs>
                  <linearGradient id="async-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#38bdf8"/>
                    <stop offset="50%" stop-color="#a78bfa"/>
                    <stop offset="100%" stop-color="#38bdf8"/>
                  </linearGradient>
                </defs>
                <circle cx="25" cy="25" r="20" fill="none" stroke-width="4" stroke-linecap="round" stroke="url(#async-gradient)"/>
              </svg>
            </div>
            <div class="async-title">{{ asyncResultModal.title }}</div>
            <div class="async-subtitle">Vui lòng đợi trong giây lát...</div>
          </template>
          <!-- SUCCESS -->
          <template v-else-if="asyncResultModal.type === 'success'">
            <div class="async-icon-wrap async-icon-success">
              <svg viewBox="0 0 52 52" class="async-checkmark">
                <circle cx="26" cy="26" r="25" fill="none"/>
                <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
            <div class="async-title">{{ asyncResultModal.title }}</div>
            <div v-if="asyncResultModal.msg" class="async-subtitle">{{ asyncResultModal.msg }}</div>
          </template>
          <!-- ERROR -->
          <template v-else>
            <div class="async-icon-wrap async-icon-error">
              <svg viewBox="0 0 52 52" class="async-xmark">
                <circle cx="26" cy="26" r="25" fill="none"/>
                <path fill="none" d="M16 16 36 36 M36 16 16 36"/>
              </svg>
            </div>
            <div class="async-title">{{ asyncResultModal.title }}</div>
            <div v-if="asyncResultModal.msg" class="async-subtitle">{{ asyncResultModal.msg }}</div>
            <button class="async-close-btn" @click="asyncResultModal.show = false">Đóng</button>
          </template>
        </div>
      </div>
    </Transition>

    <!-- ================== SIDEBAR GIỎ HÀNG BÁO GIÁ (SLIDE BÊN PHẢI) ================== -->
    <template v-if="quoteCart.length > 0">
      <!-- Nút neo bên mép phải khi thu gọn sidebar -->
      <button
        v-show="!showQuoteCartDrawer"
        type="button"
        class="quote-cart-right-Launcher"
        title="Mở giỏ hàng báo giá"
        @click.stop="showQuoteCartDrawer = true"
      >
        <div class="quote-cart-launcher__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          <span class="quote-cart-count-pill">{{ quoteCart.length }}</span>
        </div>
        <div class="quote-cart-launcher__meta">
          <span class="quote-cart-launcher__label">Giỏ báo giá ({{ quoteCartTotalQty }} SP)</span>
          <span class="quote-cart-launcher__total">{{ formatCurrency(quoteCartTotalBeforeTaxVnd, 'VND') }}</span>
        </div>
      </button>

      <!-- Sidebar trượt mượt từ bên phải -->
      <aside
        class="quote-cart-right-sidebar"
        :class="{ open: showQuoteCartDrawer }"
        @click.stop
      >
        <div class="quote-cart-sidebar__header">
          <div class="quote-cart-sidebar__title-group">
            <div class="quote-cart-icon-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              <span class="quote-cart-count-pill">{{ quoteCart.length }}</span>
            </div>
            <div>
              <h3 class="quote-cart-sidebar__heading">Giỏ hàng báo giá</h3>
              <p class="quote-cart-sidebar__sub">
                {{ quoteCart.length }} mặt hàng • Tổng SL: <strong>{{ quoteCartTotalQty }}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            class="quote-cart-sidebar__collapse-btn"
            title="Thu gọn sang bên phải"
            @click="showQuoteCartDrawer = false"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>

        <div class="quote-cart-sidebar__body">
          <div
            v-for="(entry, idx) in quoteCartEnrichedList"
            :key="entry.key"
            class="quote-cart-sidebar__item"
            title="Click để xem chi tiết / chỉnh sửa hàng hóa"
            @click="openEditModal(entry.item)"
          >
            <div class="quote-cart-sidebar__item-top">
              <div class="quote-cart-drawer__codes">
                <span class="quote-cart-item-index">#{{ idx + 1 }}</span>
                <span v-if="entry.item.sku_code" class="quote-cart-code-sku">{{ entry.item.sku_code }}</span>
                <span v-if="entry.item.Ma_hang && entry.item.Ma_hang !== entry.item.sku_code" class="quote-cart-code-ma">{{ entry.item.Ma_hang }}</span>
              </div>
              <button
                type="button"
                class="card-cart-remove-btn"
                title="Xóa khỏi giỏ"
                @click.stop="removeFromQuoteCart(entry.item)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div class="quote-cart-drawer__name" :title="entry.item.Ten_hang">{{ entry.item.Ten_hang }}</div>

            <div class="quote-cart-drawer__price">
              Đơn giá: <strong>{{ formatCurrency(entry.effectiveUnitPrice, entry.item.Don_vi_tien_te) }}</strong>
              <span v-if="String(entry.item.Don_vi_tien_te || '').toUpperCase() === 'USD'" class="quote-cart-drawer__vnd">
                ({{ formatCurrency(entry.unitPriceVnd, 'VND') }})
              </span>
            </div>

            <div class="quote-cart-sidebar__item-bottom">
              <div class="card-cart-stepper" @click.stop>
                <button type="button" class="card-cart-step-btn minus" @click.stop="updateQuoteCartQty(entry.item, -1, false)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                <input
                  type="number"
                  min="1"
                  class="card-cart-qty-input"
                  :value="entry.qty"
                  @click.stop
                  @change="onCardCartQtyInputChange(entry.item, $event)"
                />
                <button type="button" class="card-cart-step-btn plus" @click.stop="updateQuoteCartQty(entry.item, 1, false)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
              </div>
              <div class="quote-cart-drawer__subtotal">
                {{ formatCurrency(entry.lineTotalVnd, 'VND') }}
              </div>
            </div>
          </div>
        </div>

        <div class="quote-cart-sidebar__footer">
          <div class="quote-cart-sidebar__totals">
            <div class="quote-cart-total-row">
              <span>Tạm tính (trước thuế):</span>
              <strong>{{ formatCurrency(quoteCartTotalBeforeTaxVnd, 'VND') }}</strong>
            </div>
            <div class="quote-cart-total-row after-tax">
              <span>Tổng cộng (gồm VAT):</span>
              <strong class="quote-cart-total-highlight">{{ formatCurrency(quoteCartTotalAfterTaxVnd, 'VND') }}</strong>
            </div>
          </div>

          <div class="quote-cart-sidebar__actions">
            <button
              type="button"
              class="quote-cart-btn-clear"
              title="Làm trống giỏ hàng"
              @click="clearQuoteCart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              <span>Xóa giỏ</span>
            </button>
            <button
              type="button"
              class="quote-cart-btn-calculate"
              @click="proceedToCalculateQuote"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path><path d="M12 14h.01"></path><path d="M8 14h.01"></path><path d="M12 18h.01"></path><path d="M8 18h.01"></path></svg>
              <span>Tính toán</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
        </div>
      </aside>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as XLSX from 'xlsx-js-style'
import NumberInput from './NumberInput.vue'
import ExcelEditor from './ExcelEditor.vue'
import Tesseract from 'tesseract.js'
import { callDeepSeek } from '../services/deepseek'
import { parsePurchaseFileStandard, analyzePurchaseFileWithAI } from '../utils/purchaseQuoteParser'
import {
  uploadBlobToCloudinary,
  uploadExcelFileToCloudinarySafe,
  uploadJsonToCloudinary,
  formatRefTimestamp,
  hydrateAcronisRefData,
  hydrateKasRefData,
  parseAcronisWorkbookToRefPart,
  parseKasperskyWorkbookToRefPart,
  parseSophosWorkbookToRefUpdate
} from '../utils/vendorRefCloudinary'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getDatabase, ref as dbRef, get, set, push, update, remove } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyB3fHD_sOqyqVygCxP2gZtvaipr-35a1s8",
  authDomain: "chusonproject.firebaseapp.com",
  databaseURL: "https://chusonproject-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chusonproject",
  storageBucket: "chusonproject.firebasestorage.app",
  messagingSenderId: "929199941311",
  appId: "1:929199941311:web:ca8d86f9fd7f8dff61480a",
  measurementId: "G-48VVPGFSFK"
}
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const database = getDatabase(firebaseApp)

const items = ref([])
const loading = ref(false)
const saving = ref(false)
const latestFileGiaOff = ref(null)
const showModal = ref(false)
const isEditing = ref(false)
const searchQuery = ref('')
const userVolumeFilter = ref('')
const originalItem = ref(null)
const confirmDeleteModal = ref({ show: false, item: null })
const importFeaturesEditRow = ref(null)

const openImportFeaturesEditor = (row) => {
  if (!row) return
  row.Features = formatFeaturesHtml(row.Features)
  importFeaturesEditRow.value = row
}

const decodeXmlEntities = (str) => {
  return String(str || '')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

const escapeHtmlWithBr = (str) => {
  return String(str || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
}

const formatFeaturesHtml = (val) => {
  const s = String(val ?? '').trim()
  if (!s) return ''
  if (/<(br|span|b|strong|i|em|u|s|strike|div|p|font|ul|ol|li)\b/i.test(s)) {
    return s.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, '<br>')
  }
  return escapeHtmlWithBr(s)
}

const extractExcelCellRichHtml = (ws, r, c) => {
  if (!ws || r < 0 || c < 0) return ''
  const addr = XLSX.utils.encode_cell({ r, c })
  const cell = ws[addr]
  if (!cell) return ''

  const cellFont = cell.s && cell.s.font ? cell.s.font : {}
  const xml = String(cell.r || '')

  if (xml && /<r[\s>]/i.test(xml)) {
    const defaultSzMatch = xml.match(/<sz\s+val="([\d.]+)"\s*\/>/i)
    const defaultFontMatch = xml.match(/<(?:rFont|font)\s+val="([^"]+)"\s*\/>/i)
    const fallbackSz = cellFont.sz || (defaultSzMatch ? defaultSzMatch[1] : '')
    const fallbackFont = cellFont.name || (defaultFontMatch ? defaultFontMatch[1] : '')

    const runRegex = /<r(?:\s[^>]*)?>([\s\S]*?)<\/r>/gi
    let match
    let html = ''

    while ((match = runRegex.exec(xml)) !== null) {
      const runContent = match[1]
      const rPrMatch = runContent.match(/<rPr>([\s\S]*?)<\/rPr>/i)
      const tMatch = runContent.match(/<t[^>]*>([\s\S]*?)<\/t>/i)
      if (!tMatch) continue

      const rawText = decodeXmlEntities(tMatch[1])
      let text = escapeHtmlWithBr(rawText)
      if (!text) continue

      const styles = []
      let isBold = false
      let isItalic = false
      let isUnderline = false
      let isStrike = false

      if (rPrMatch) {
        const rPr = rPrMatch[1]
        isBold = /<b(?:\s+val="(?:1|true)")?\s*\/>/i.test(rPr)
        isItalic = /<i(?:\s+val="(?:1|true)")?\s*\/>/i.test(rPr)
        isUnderline = /<u(?:\s+val="[^"]*?")?\s*\/>/i.test(rPr) && !/<u\s+val="none"\s*\/>/i.test(rPr)
        isStrike = /<strike(?:\s+val="(?:1|true)")?\s*\/>/i.test(rPr)

        const szMatch = rPr.match(/<sz\s+val="([\d.]+)"\s*\/>/i)
        const fontMatch = rPr.match(/<(?:rFont|font)\s+val="([^"]+)"\s*\/>/i)
        const colorMatch = rPr.match(/<color\s+rgb="([0-9A-Fa-f]{6,8})"\s*\/>/i)

        const szVal = szMatch ? szMatch[1] : fallbackSz
        const fontVal = fontMatch ? fontMatch[1] : fallbackFont

        if (fontVal) styles.push(`font-family:${fontVal}`)
        if (szVal) styles.push(`font-size:${szVal}pt`)
        if (colorMatch) {
          const hex = colorMatch[1].length === 8 ? colorMatch[1].slice(2) : colorMatch[1]
          if (hex.toUpperCase() !== '000000') {
            styles.push(`color:#${hex}`)
          }
        }
      } else {
        isBold = Boolean(cellFont.bold)
        isItalic = Boolean(cellFont.italic)
        isUnderline = Boolean(cellFont.underline)
        isStrike = Boolean(cellFont.strike)
        if (fallbackFont) styles.push(`font-family:${fallbackFont}`)
        if (fallbackSz) styles.push(`font-size:${fallbackSz}pt`)
        if (cellFont.color && cellFont.color.rgb) {
          const rgb = String(cellFont.color.rgb)
          const hex = rgb.length === 8 ? rgb.slice(2) : rgb
          if (hex.toUpperCase() !== '000000') {
            styles.push(`color:#${hex}`)
          }
        }
      }

      if (isStrike) styles.push('text-decoration:line-through')
      if (isUnderline) text = `<u>${text}</u>`
      if (isItalic) text = `<i>${text}</i>`
      if (isBold) text = `<b>${text}</b>`
      if (styles.length > 0) {
        text = `<span style="${styles.join(';')}">${text}</span>`
      }
      html += text
    }

    if (html) return html.trim()
  }

  const plain = String(cell.v ?? '').trim()
  if (!plain) return ''
  let text = escapeHtmlWithBr(plain)
  const styles = []
  if (cellFont.name) styles.push(`font-family:${cellFont.name}`)
  if (cellFont.sz) styles.push(`font-size:${cellFont.sz}pt`)
  if (cellFont.color && cellFont.color.rgb) {
    const rgb = String(cellFont.color.rgb)
    const hex = rgb.length === 8 ? rgb.slice(2) : rgb
    if (hex.toUpperCase() !== '000000') {
      styles.push(`color:#${hex}`)
    }
  }
  if (cellFont.strike) styles.push('text-decoration:line-through')
  if (cellFont.underline) text = `<u>${text}</u>`
  if (cellFont.italic) text = `<i>${text}</i>`
  if (cellFont.bold) text = `<b>${text}</b>`
  if (styles.length > 0) {
    text = `<span style="${styles.join(';')}">${text}</span>`
  }
  return text
}

const isDirty = computed(() => {
  if (!isEditing.value) return true
  return JSON.stringify(formData.value) !== JSON.stringify(originalItem.value)
})

const asyncResultModal = ref({ show: false, type: 'loading', title: '', msg: '' })
let asyncResultTimeout = null

const showAsyncLoading = (title, msg = '') => {
  if (asyncResultTimeout) clearTimeout(asyncResultTimeout)
  asyncResultModal.value = { show: true, type: 'loading', title, msg }
}

const showAsyncSuccess = (title, msg = '') => {
  if (asyncResultTimeout) clearTimeout(asyncResultTimeout)
  asyncResultModal.value = { show: true, type: 'success', title, msg }
  asyncResultTimeout = setTimeout(() => { asyncResultModal.value.show = false }, 3000)
}

const showAsyncError = (title, msg = '') => {
  if (asyncResultTimeout) clearTimeout(asyncResultTimeout)
  asyncResultModal.value = { show: true, type: 'error', title, msg }
}

const showImportModal = ref(false)
const importData = ref([])
const importing = ref(false)
const activeImportSheet = ref('')
const importDisplayLimit = ref(150)
const clearOldSophosBeforeImport = ref(false)
const sophosReimportMode = ref('bom')

// Quản lý link File Gốc / File Trung Gian / File Import của từng hãng trên Cloudinary (Không fallback về file tĩnh cũ)
const vendorRefFilesMeta = ref({
  sophos: null,
  kaspersky: null,
  acronis: null
})
const vendorRefLoadError = ref({
  sophos: '',
  kaspersky: '',
  acronis: ''
})
const pendingImportVendorRef = ref(null) // { vendor: 'sophos' | 'kaspersky' | 'acronis', file: File, workbook: XLSX.WorkBook }
const syncImportFileToCloudinaryRef = ref(true)
let pendingImportUploadPromise = null

const fetchVendorRefFilesMeta = async (force = false) => {
  if (!force && (vendorRefFilesMeta.value.sophos || vendorRefFilesMeta.value.kaspersky || vendorRefFilesMeta.value.acronis)) {
    return vendorRefFilesMeta.value
  }
  try {
    const snap = await get(dbRef(database, 'vendor_ref_files'))
    const val = snap.val() || {}
    vendorRefFilesMeta.value = {
      sophos: val.sophos || null,
      kaspersky: val.kaspersky || null,
      acronis: val.acronis || null
    }
  } catch (err) {
    console.error('Lỗi đọc vendor_ref_files từ Firebase:', err)
  }
  return vendorRefFilesMeta.value
}

/**
 * Lấy thông tin File đã up ở phần IMPORT các hãng (Sophos / Kaspersky / Acronis)
 */
const getVendorImportFileMeta = (vendor) => {
  const m = vendorRefFilesMeta.value?.[vendor]
  if (!m) return null
  if (m.import_file_name) {
    return {
      name: m.import_file_name,
      url: m.import_file_url || m.index_url || '',
      updatedAt: m.import_updated_at || m.updated_at || 0
    }
  }
  if (vendor === 'sophos' && m.tg_file_name) {
    return {
      name: m.tg_file_name,
      url: m.tg_file_url || m.index_url || '',
      updatedAt: m.tg_updated_at || m.updated_at || 0
    }
  }
  if ((vendor === 'kaspersky' || vendor === 'acronis') && m.mau_file_name) {
    return {
      name: m.mau_file_name,
      url: m.mau_file_url || m.index_url || '',
      updatedAt: m.mau_updated_at || m.updated_at || 0
    }
  }
  if (m.goc_file_name) {
    return {
      name: m.goc_file_name,
      url: m.goc_file_url || m.index_url || '',
      updatedAt: m.goc_updated_at || m.updated_at || 0
    }
  }
  return null
}

/**
 * Lấy thông tin File đã up tương ứng cho phần GỐC ('goc') hoặc TRUNG GIAN ('tg') ở cụm ĐỐI CHIẾU
 */
const getVendorCompareFileMeta = (vendor, part = 'goc') => {
  const m = vendorRefFilesMeta.value?.[vendor]
  if (!m) return null
  if (part === 'goc') {
    if (vendor === 'sophos') {
      const sName = m.skulist_file_name || m.goc_file_name
      const sUrl = m.skulist_file_url || m.goc_file_url || m.index_url || ''
      if (!sName) return null
      return {
        name: sName,
        url: sUrl,
        updatedAt: m.goc_updated_at || m.updated_at || 0
      }
    }
    if (!m.goc_file_name) return null
    return {
      name: m.goc_file_name,
      url: m.goc_file_url || m.index_url || '',
      updatedAt: m.goc_updated_at || m.updated_at || 0
    }
  }
  // part === 'tg' (Trung gian)
  if (vendor === 'sophos') {
    if (!m.tg_file_name) return null
    return {
      name: m.tg_file_name,
      url: m.tg_file_url || m.index_url || '',
      updatedAt: m.tg_updated_at || m.updated_at || 0
    }
  }
  if (vendor === 'kaspersky' || vendor === 'acronis') {
    if (!m.mau_file_name) return null
    return {
      name: m.mau_file_name,
      url: m.mau_file_url || m.index_url || '',
      updatedAt: m.mau_updated_at || m.updated_at || 0
    }
  }
  return null
}

/**
 * Tạo link Microsoft Office Online Viewer (ViewOffice) cho file Excel đã up
 */
const getVendorOfficeViewUrl = (meta) => {
  const url = typeof meta === 'string' ? meta.trim() : String(meta?.url || '').trim()
  if (!url || url.toLowerCase().endsWith('.json')) return '#'
  return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`
}

/**
 * Tái tạo Workbook Excel (.xlsx) từ dữ liệu JSON Index trên Cloudinary (dùng khi file gốc > 9.5MB hoặc .xlsb cũ)
 */
const buildVendorRefWorkbookFromCloudinary = async (vendor, role, fileName) => {
  const wb = XLSX.utils.book_new()
  if (vendor === 'acronis') {
    const refData = await loadAcronisRefData()
    const sheetsMap = (role === 'mau' || role === 'import')
      ? (refData?.mauSheetsRaw || refData?.gocSheetsRaw || {})
      : (refData?.gocSheetsRaw || refData?.mauSheetsRaw || {})
    Object.entries(sheetsMap).forEach(([sName, rows]) => {
      if (Array.isArray(rows)) {
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), sName.slice(0, 31))
      }
    })
  } else if (vendor === 'kaspersky') {
    const refData = await loadKasRefData()
    const isMau = role === 'mau' || role === 'import'
    const pivotRows = isMau ? (refData?.mauPivotRaw || refData?.gocPivotRaw || []) : (refData?.gocPivotRaw || [])
    const saleList = isMau ? (refData?.mauSaleRows || refData?.gocSaleRows || []) : (refData?.gocSaleRows || [])
    if (Array.isArray(pivotRows) && pivotRows.length) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(pivotRows), 'SMB+Enterprise (License)')
    }
    if (Array.isArray(saleList) && saleList.length) {
      const aoa = [
        ['Row', 'PositionCode', 'SKU', 'Product', 'Term', 'Package', 'Type', 'Band', 'Price (VND)'],
        ...saleList.map(r => [r.rowNum, r.posCode, r.sku, r.product, r.term, r.pkg, r.type, r.band, r.price])
      ]
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), 'SaleListSMB+Enterprise')
    }
  } else if (vendor === 'sophos') {
    const refData = await loadSophosRefData()
    if ((role === 'tg' || role === 'import') && refData?.tgSheetsRaw && Object.keys(refData.tgSheetsRaw).length) {
      Object.entries(refData.tgSheetsRaw).forEach(([sName, rows]) => {
        if (Array.isArray(rows)) {
          XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), sName.slice(0, 31))
        }
      })
    } else if (refData?.gocSkus && Object.keys(refData.gocSkus).length) {
      const entries = Object.entries(refData.gocSkus).map(([sku, v]) => ({ sku, ...(v || {}) }))
      const sortedSkuTab = entries.filter(x => x.skuTabRow).sort((a, b) => a.skuTabRow - b.skuTabRow)

      const setCell = (ws, r1, c0, val) => {
        if (val === undefined || val === null || val === '') return
        const addr = XLSX.utils.encode_cell({ r: r1 - 1, c: c0 })
        ws[addr] = typeof val === 'number' ? { t: 'n', v: val } : { t: 's', v: String(val) }
      }

      // 1. Sheet SKU_Tab (sophos-pricelist-reseller_SKU_list-asean-usd-2026-3.0: dòng liên tục từ dòng 8, cột G là SKU)
      if (sortedSkuTab.length) {
        const wsSku = {}
        setCell(wsSku, 1, 0, 'SOPHOS RESELLER SKU LIST (ASEAN - USD - 2026 3.0)')
        setCell(wsSku, 6, 9, 'giá tham khảo')
        const skuHeaders = [
          'Changes made in Pricelist version', 'Change Key', 'Previous Description', 'Previous Price',
          'SKU Availability Status', 'Product Code', 'SKU', 'Old SKU', 'Description', 'MSRP/RRP',
          'Min Qty', 'Max Qty', 'Term', 'Sector', 'Transaction Type', 'Product Family', 'Product Type',
          'HS Code', 'Country of Origin',
          'Standard Authorized Reseller Cost', 'Registered Authorized Reseller Cost', 'Incumbent Authorized Reseller Cost',
          'Standard Silver Reseller Cost', 'Registered Silver Reseller Cost',
          'Standard Gold Reseller Cost', 'Registered Gold Reseller Cost',
          'Standard Platinum Reseller Cost', 'Registered Platinum Reseller Cost'
        ]
        skuHeaders.forEach((h, i) => setCell(wsSku, 7, i, h))
        sortedSkuTab.forEach((it, idx) => {
          const r = 8 + idx
          ;[
            it.changeVer, it.changeKey, '', it.prevPrice,
            it.status || 'Available', it.pc, it.sku, it.oldSku, it.desc, it.msrp,
            1, 9999999, it.term, it.sector || 'CORP', it.transType || 'New', it.family || 'UTM/Network Security', it.prodType,
            it.hsCode, it.coo,
            it.stdAuth, it.regAuth, it.incAuth,
            it.stdSilv, it.regSilv,
            it.stdGold, it.regGold,
            it.stdPlat, it.regPlat
          ].forEach((v, cIdx) => setCell(wsSku, r, cIdx, v))
        })
        wsSku['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 7 + sortedSkuTab.length - 1, c: 27 } })
        XLSX.utils.book_append_sheet(wb, wsSku, 'SKU_Tab')
      }

      // 2. Sheet HW_Compliance (đặt đúng dòng gốc rObj.rowNum)
      if (Array.isArray(refData.hwComplianceRaw) && refData.hwComplianceRaw.length) {
        const wsHw = {}
        let maxHwR = 10
        for (const rObj of refData.hwComplianceRaw) {
          if (rObj && rObj.rowNum >= 1) {
            if (rObj.rowNum > maxHwR) maxHwR = rObj.rowNum
            ;(rObj.cells || []).forEach((v, idx) => setCell(wsHw, rObj.rowNum, idx, v))
          }
        }
        wsHw['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: maxHwR - 1, c: 15 } })
        XLSX.utils.book_append_sheet(wb, wsHw, 'HW_Compliance')
      }

      // 3. Sheet Firewall (giữ nguyên đúng số dòng 1..62)
      if (Array.isArray(refData.gocFirewallRaw) && refData.gocFirewallRaw.length) {
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(refData.gocFirewallRaw), 'Firewall')
      }
    }
  }

  if (!wb.SheetNames.length) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['File', fileName]]), 'Sheet1')
  }
  return wb
}

/**
 * Đảm bảo có URL file .xlsx trực tiếp trên Cloudinary (nếu URL cũ là .json thì tự tạo .xlsx và lưu lại)
 */
const ensureVendorExcelUrlOnCloudinary = async (vendor, role, meta) => {
  const fileName = meta?.name || `${vendor}_${role}.xlsx`
  const url = String(meta?.url || '').trim()
  if (url && !url.toLowerCase().endsWith('.json')) {
    return url
  }

  const wb = await buildVendorRefWorkbookFromCloudinary(vendor, role, fileName)
  const outBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array', compression: true })
  const xlsxBlob = new Blob([outBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const safeName = fileName.replace(/\.(xlsb|xls|xlsx|json)$/i, '') + '_slim_viewoffice.xlsx'
  const newExcelUrl = await uploadBlobToCloudinary(xlsxBlob, safeName)

  // Lưu lại URL .xlsx mới vào Firebase để những lần click sau mở tức thì
  const prevMeta = vendorRefFilesMeta.value?.[vendor] || {}
  const nextMeta = { ...prevMeta }
  if (role === 'goc' && nextMeta.goc_file_url?.endsWith('.json')) nextMeta.goc_file_url = newExcelUrl
  if (role === 'skulist' && nextMeta.skulist_file_url?.endsWith('.json')) nextMeta.skulist_file_url = newExcelUrl
  if ((role === 'tg' || role === 'import') && nextMeta.tg_file_url?.endsWith('.json')) nextMeta.tg_file_url = newExcelUrl
  if ((role === 'mau' || role === 'import') && nextMeta.mau_file_url?.endsWith('.json')) nextMeta.mau_file_url = newExcelUrl
  if (role === 'import' && nextMeta.import_file_url?.endsWith('.json')) nextMeta.import_file_url = newExcelUrl
  vendorRefFilesMeta.value[vendor] = nextMeta
  set(dbRef(database, `vendor_ref_files/${vendor}`), nextMeta).catch(() => {})
  return newExcelUrl
}

/**
 * Tính toán tham số `activeCell` ('Sheet'!ColRow) để ViewOffice tự động nhảy thẳng tới ô chứa sản phẩm
 */
const getVendorOfficeActiveCellParam = ({
  vendor = '',
  role = 'goc',
  sheet = '',
  rowNum = 1,
  colLetter = 'B',
  sku = ''
}) => {
  let targetSheet = String(sheet || '').trim()
  let targetR = Number(rowNum) || 1
  let cleanCol = String(colLetter || 'B').trim().toUpperCase()
  const cleanSku = String(sku || '').trim().toUpperCase()

  // Đối với Sophos File Gốc (file nguyên bản sophos-pricelist-reseller_SKU_list-asean-usd-2026-3.0.xlsb trên Cloudinary):
  // Nhảy thẳng tới đúng số dòng gốc (skuTabRow) tại cột G của sheet SKU_Tab
  if (vendor === 'sophos' && role !== 'tg') {
    if (targetSheet === 'HW_Compliance') {
      cleanCol = cleanCol || 'B'
    } else {
      targetSheet = 'SKU_Tab'
      if (cleanCol === 'B' || cleanCol === 'H' || !cleanCol) {
        cleanCol = 'G'
      }
      if (sophosRefData.value?.gocSkus) {
        const directEntry = cleanSku ? sophosRefData.value.gocSkus[cleanSku] : null
        if (directEntry?.skuTabRow) {
          targetR = directEntry.skuTabRow
        } else {
          const matched = Object.values(sophosRefData.value.gocSkus).find(
            x =>
              (cleanSku && String(x?.oldSku || '').trim().toUpperCase() === cleanSku) ||
              x?.skuTabRow === targetR ||
              x?.rowNum === targetR
          )
          if (matched?.skuTabRow) {
            targetR = matched.skuTabRow
          }
        }
      }
    }
  }

  const cellRef = `${cleanCol}${targetR}`
  if (!targetSheet) return encodeURIComponent(cellRef)
  const escapedSheet = targetSheet.replace(/'/g, "''")
  return encodeURIComponent(`'${escapedSheet}'!${cellRef}`).replace(/'/g, '%27')
}

/**
 * Mở File đã up bằng Microsoft Office Online Viewer (ViewOffice) ở tab mới
 */
const handleOpenVendorOfficeView = async (event, vendor, role, meta) => {
  if (!meta || !meta.name) {
    event?.preventDefault?.()
    return
  }
  const fileName = meta.name
  const url = String(meta.url || '').trim()

  // Nếu đã có URL file Excel trực tiếp (.xlsx / .xls) -> cho phép thẻ <a> mở trực tiếp ViewOffice ở tab mới
  if (url && !url.toLowerCase().endsWith('.json')) {
    return
  }

  // Trường hợp URL cũ đang là .json (file > 9.5MB được up từ phiên bản trước) -> tạo .xlsx lên Cloudinary rồi chuyển hướng sang ViewOffice
  event?.preventDefault?.()
  const win = window.open('about:blank', '_blank')
  if (win && win.document) {
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Đang mở ViewOffice - ${fileName}</title></head><body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#0f172a;color:#e2e8f0;font-family:system-ui,sans-serif;"><div style="text-align:center;"><div style="font-size:18px;font-weight:700;color:#38bdf8;margin-bottom:8px;">⏳ Đang chuẩn bị file Excel trên ViewOffice...</div><div style="font-size:13px;color:#94a3b8;">${fileName}</div></div></body></html>`)
    win.document.close()
  }

  try {
    const newExcelUrl = await ensureVendorExcelUrlOnCloudinary(vendor, role, meta)
    const officeUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(newExcelUrl)}`
    if (win) {
      win.location.href = officeUrl
    } else {
      window.open(officeUrl, '_blank', 'noopener,noreferrer')
    }
  } catch (err) {
    console.error('Lỗi mở ViewOffice:', err)
    if (win) win.close()
    await handleDownloadVendorUploadedFile(vendor, role, meta)
  }
}

/**
 * Mở Microsoft ViewOffice ở TAB MỚI và nhảy trực tiếp (`activeCell`) tới đúng Sheet & Ô chứa sản phẩm đó
 */
const compareOfficePreview = ref({
  show: false,
  loading: false,
  vendor: 'sophos',
  role: 'goc',
  fileName: '',
  rawExcelUrl: '',
  embedUrl: '',
  viewUrl: '',
  sheet: '',
  rowNum: null,
  colLetter: 'B',
  sku: '',
  itemName: '',
  copiedLabel: ''
})

const copyCompareOfficeQuickText = async (text, label = 'Đã copy!') => {
  if (!text) return
  try {
    await navigator.clipboard.writeText(String(text))
    compareOfficePreview.value.copiedLabel = label
    setTimeout(() => {
      if (compareOfficePreview.value.copiedLabel === label) {
        compareOfficePreview.value.copiedLabel = ''
      }
    }, 2200)
  } catch (_) {}
}

const openCompareOfficePreview = async ({
  vendor = 'sophos',
  role = 'goc',
  sheet = '',
  rowNum = null,
  colLetter = 'B',
  sku = '',
  itemName = ''
} = {}) => {
  const comparePart = (role === 'tg' || role === 'mau') ? 'tg' : 'goc'
  const meta = getVendorCompareFileMeta(vendor, comparePart) || getVendorImportFileMeta(vendor)
  if (!meta || !meta.name) {
    alert(`Chưa có file ${comparePart === 'goc' ? 'Gốc' : 'Trung Gian'} của ${vendor.toUpperCase()} trên Cloudinary để mở ViewOffice!`)
    return
  }

  const cleanSku = String(sku || '').trim().toUpperCase()
  const cleanCol = String(colLetter || 'B').trim().toUpperCase()
  const targetRow = Number(rowNum) || 1
  if (cleanSku) {
    copyCompareOfficeQuickText(cleanSku, `Đã copy SKU: ${cleanSku}`)
  } else if (sheet && targetRow) {
    copyCompareOfficeQuickText(`'${sheet}'!${cleanCol}${targetRow}`, `Đã copy ô '${sheet}'!${cleanCol}${targetRow}`)
  }

  const rawUrl = String(meta.url || '').trim()
  // Trường hợp đã có sẵn URL file Excel (.xlsx / .xls) trên Cloudinary -> Mở ngay Tab mới ViewOffice và nhảy thẳng tới ô sản phẩm!
  if (rawUrl && !rawUrl.toLowerCase().endsWith('.json')) {
    if (vendor === 'sophos' && comparePart === 'goc' && !sophosRefData.value) {
      const winWait = window.open('about:blank', '_blank')
      await loadSophosRefData().catch(() => {})
      const activeCellParam = getVendorOfficeActiveCellParam({
        vendor,
        role: comparePart,
        sheet,
        rowNum: targetRow,
        colLetter: cleanCol,
        sku: cleanSku
      })
      const viewUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(rawUrl)}&activeCell=${activeCellParam}`
      if (winWait) {
        winWait.location.href = viewUrl
      } else {
        window.open(viewUrl, '_blank', 'noopener,noreferrer')
      }
      return
    }
    const activeCellParam = getVendorOfficeActiveCellParam({
      vendor,
      role: comparePart,
      sheet,
      rowNum: targetRow,
      colLetter: cleanCol,
      sku: cleanSku
    })
    const viewUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(rawUrl)}&activeCell=${activeCellParam}`
    window.open(viewUrl, '_blank', 'noopener,noreferrer')
    return
  }

  // Trường hợp URL đang là .json (file > 9.5MB) -> Mở tab chờ rồi tạo .xlsx và chuyển hướng tới đúng ô trên ViewOffice
  const win = window.open('about:blank', '_blank')
  if (win && win.document) {
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Đang mở ViewOffice - ${meta.name}</title></head><body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#0f172a;color:#e2e8f0;font-family:system-ui,sans-serif;"><div style="text-align:center;"><div style="font-size:18px;font-weight:700;color:#38bdf8;margin-bottom:8px;">⏳ Đang mở ViewOffice và nhảy tới ô ${cleanCol}${targetRow}${cleanSku ? ' (' + cleanSku + ')' : ''}...</div><div style="font-size:13px;color:#94a3b8;">${meta.name}${sheet ? ' • Sheet: ' + sheet : ''}</div></div></body></html>`)
    win.document.close()
  }

  try {
    const excelUrl = await ensureVendorExcelUrlOnCloudinary(vendor, role, meta)
    const activeCellParam = getVendorOfficeActiveCellParam({
      vendor,
      role: comparePart,
      sheet,
      rowNum: targetRow,
      colLetter: cleanCol,
      sku: cleanSku
    })
    const viewUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(excelUrl)}&activeCell=${activeCellParam}`
    if (win) {
      win.location.href = viewUrl
    } else {
      window.open(viewUrl, '_blank', 'noopener,noreferrer')
    }
  } catch (err) {
    console.error('Lỗi mở ViewOffice tại ô sản phẩm:', err)
    if (win) win.close()
    await handleDownloadVendorUploadedFile(vendor, role, meta)
  }
}

const closeCompareOfficePreview = () => {
  compareOfficePreview.value.show = false
}

/**
 * Tải File Excel đã up trên Cloudinary về máy với đúng tên file gốc
 */
const handleDownloadVendorUploadedFile = async (vendor, role, meta) => {
  if (!meta || !meta.name) return
  const fileName = meta.name
  const url = String(meta.url || '').trim()

  // Trường hợp link trỏ tới file Excel thật trên Cloudinary (không phải JSON index)
  if (url && !url.toLowerCase().endsWith('.json')) {
    try {
      const res = await fetch(url)
      if (res.ok) {
        const blob = await res.blob()
        const blobUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        setTimeout(() => URL.revokeObjectURL(blobUrl), 5000)
        return
      }
    } catch (_) {
      // Fallback mở trực tiếp link
    }
    window.open(url, '_blank', 'noopener,noreferrer')
    return
  }

  // Trường hợp file nặng (> 9.5MB) được lưu dưới dạng JSON Index trên Cloudinary -> tái tạo file .xlsx để tải về
  showAsyncLoading('Đang chuẩn bị file Excel từ Cloudinary...', `File: ${fileName}`)
  try {
    const wb = await buildVendorRefWorkbookFromCloudinary(vendor, role, fileName)
    const outName = fileName.replace(/\.(xlsb|xls)$/i, '.xlsx')
    XLSX.writeFile(wb, outName)
    asyncResultModal.value.show = false
  } catch (err) {
    console.error('Lỗi tải file từ Cloudinary:', err)
    asyncResultModal.value.show = false
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }
}

/**
 * Đẩy File Excel + Index JSON mới lên Cloudinary và cập nhật vào Firebase `vendor_ref_files/{vendor}`
 * (Không dùng dữ liệu tĩnh cũ)
 */
const uploadAndPersistVendorRefWorkbook = async (vendor, file, workbook, role = 'both') => {
  const now = Date.now()
  await fetchVendorRefFilesMeta()
  const excelUrl = await uploadExcelFileToCloudinarySafe(file, workbook)
  const isImportAction = role === 'import'

  if (vendor === 'acronis') {
    if (!acronisRefData.value) {
      await loadAcronisRefData().catch(() => {})
    }
    const prev = acronisRefData.value || {}
    const prevMeta = vendorRefFilesMeta.value.acronis || {}
    const parsed = parseAcronisWorkbookToRefPart(workbook)
    const updateGocData = role === 'goc' || role === 'both' || !prev.gocItems?.length
    const updateMauData = role === 'mau' || role === 'import' || role === 'both' || !prev.mauItems?.length

    const updateGocMeta = role === 'goc' || role === 'both' || (!prevMeta.goc_file_name && !isImportAction)
    const updateMauMeta = role === 'mau' || role === 'import' || role === 'both'

    const slimObj = {
      version: updateGocData ? file.name : (prev.version || file.name),
      mauVersion: updateMauData ? file.name : (prev.mauVersion || file.name),
      updatedAt: now,
      sheetNames: parsed.sheetNames.length ? parsed.sheetNames : (prev.sheetNames || []),
      gocItems: updateGocData ? parsed.items : (prev.gocItems || []),
      gocSheetsRaw: updateGocData ? parsed.sheetsRaw : (prev.gocSheetsRaw || {}),
      gocSheetsStyled: updateGocData ? parsed.sheetsStyled : (prev.gocSheetsStyled || {}),
      mauItems: updateMauData ? parsed.items : (prev.mauItems || []),
      mauSheetsRaw: updateMauData ? parsed.sheetsRaw : (prev.mauSheetsRaw || {}),
      mauSheetsStyled: updateMauData ? parsed.sheetsStyled : (prev.mauSheetsStyled || {})
    }

    const indexUrl = await uploadJsonToCloudinary(slimObj, 'acronis_ref_index')
    const fileUrl = excelUrl || indexUrl
    const nextMeta = {
      ...prevMeta,
      index_url: indexUrl,
      updated_at: now
    }
    if (updateGocMeta) {
      nextMeta.goc_file_url = fileUrl
      nextMeta.goc_file_name = file.name
      nextMeta.goc_updated_at = now
    }
    if (updateMauMeta) {
      nextMeta.mau_file_url = fileUrl
      nextMeta.mau_file_name = file.name
      nextMeta.mau_updated_at = now
    }
    if (isImportAction) {
      nextMeta.import_file_url = fileUrl
      nextMeta.import_file_name = file.name
      nextMeta.import_updated_at = now
    }

    await set(dbRef(database, 'vendor_ref_files/acronis'), nextMeta)
    vendorRefFilesMeta.value.acronis = nextMeta
    vendorRefLoadError.value.acronis = ''
    acronisRefData.value = hydrateAcronisRefData(slimObj)
    return {
      meta: nextMeta,
      summaryText: `Đã đẩy "${file.name}" (${parsed.items.length} mã Acronis) lên Cloudinary`
    }
  }

  if (vendor === 'kaspersky') {
    if (!kasRefData.value) {
      await loadKasRefData().catch(() => {})
    }
    const prev = kasRefData.value || {}
    const prevMeta = vendorRefFilesMeta.value.kaspersky || {}
    const parsed = parseKasperskyWorkbookToRefPart(workbook)
    const updateGocData = role === 'goc' || role === 'both' || !prev.gocSaleRows?.length
    const updateMauData = role === 'mau' || role === 'import' || role === 'both' || !prev.mauSaleRows?.length

    const updateGocMeta = role === 'goc' || role === 'both'
    const updateMauMeta = role === 'mau' || role === 'import' || role === 'both'

    const slimObj = {
      version: updateGocData ? file.name : (prev.version || file.name),
      mauVersion: updateMauData ? file.name : (prev.mauVersion || file.name),
      generatedAt: new Date(now).toISOString(),
      updatedAt: now,
      gocPivotRaw: updateGocData ? parsed.pivotRaw : (prev.gocPivotRaw || []),
      mauPivotRaw: updateMauData ? parsed.pivotRaw : (prev.mauPivotRaw || []),
      gocPivotBySku: updateGocData ? parsed.pivotBySku : (prev.gocPivotBySku || {}),
      mauPivotBySku: updateMauData ? parsed.pivotBySku : (prev.mauPivotBySku || {}),
      gocSaleRows: updateGocData ? parsed.saleRows : (prev.gocSaleRows || []),
      mauSaleRows: updateMauData ? parsed.saleRows : (prev.mauSaleRows || [])
    }

    const indexUrl = await uploadJsonToCloudinary(slimObj, 'kas_ref_index')
    const fileUrl = excelUrl || indexUrl
    const nextMeta = {
      ...prevMeta,
      index_url: indexUrl,
      updated_at: now
    }
    if (updateGocMeta) {
      nextMeta.goc_file_url = fileUrl
      nextMeta.goc_file_name = file.name
      nextMeta.goc_updated_at = now
    }
    if (updateMauMeta) {
      nextMeta.mau_file_url = fileUrl
      nextMeta.mau_file_name = file.name
      nextMeta.mau_updated_at = now
    }
    if (isImportAction) {
      nextMeta.import_file_url = fileUrl
      nextMeta.import_file_name = file.name
      nextMeta.import_updated_at = now
    }

    await set(dbRef(database, 'vendor_ref_files/kaspersky'), nextMeta)
    vendorRefFilesMeta.value.kaspersky = nextMeta
    vendorRefLoadError.value.kaspersky = ''
    kasRefData.value = hydrateKasRefData(slimObj)
    return {
      meta: nextMeta,
      summaryText: `Đã đẩy "${file.name}" (${parsed.saleRows.length.toLocaleString()} dòng Kaspersky) lên Cloudinary`
    }
  }

  // SOPHOS
  if (!sophosRefData.value) {
    await loadSophosRefData().catch(() => {})
  }
  const effectiveSophosRole = isImportAction ? 'both' : role
  const { updatedRef, role: detectedRole, summaryText } = parseSophosWorkbookToRefUpdate(
    workbook,
    file.name,
    sophosRefData.value,
    effectiveSophosRole
  )
  const indexUrl = await uploadJsonToCloudinary(updatedRef, 'sophos_ref_index')
  const fileUrl = excelUrl || indexUrl
  const prevMeta = vendorRefFilesMeta.value.sophos || {}
  const nextMeta = {
    ...prevMeta,
    index_url: indexUrl,
    updated_at: now
  }

  if (isImportAction) {
    nextMeta.import_file_url = fileUrl
    nextMeta.import_file_name = file.name
    nextMeta.import_updated_at = now
    if (detectedRole === 'tg') {
      nextMeta.tg_file_url = fileUrl
      nextMeta.tg_file_name = file.name
      nextMeta.tg_updated_at = now
    } else if (detectedRole === 'goc' || detectedRole === 'skulist') {
      nextMeta.goc_file_url = fileUrl
      nextMeta.goc_file_name = file.name
      nextMeta.goc_updated_at = now
    }
  } else if (role === 'goc' || detectedRole === 'goc') {
    nextMeta.goc_file_url = fileUrl
    nextMeta.goc_file_name = file.name
    nextMeta.goc_updated_at = now
    if (workbook.SheetNames.includes('SKU_Tab')) {
      nextMeta.skulist_file_url = fileUrl
      nextMeta.skulist_file_name = file.name
      nextMeta.skulist_updated_at = now
    }
  } else if (role === 'tg' || detectedRole === 'tg') {
    nextMeta.tg_file_url = fileUrl
    nextMeta.tg_file_name = file.name
    nextMeta.tg_updated_at = now
  } else if (detectedRole === 'skulist') {
    nextMeta.skulist_file_url = fileUrl
    nextMeta.skulist_file_name = file.name
    nextMeta.skulist_updated_at = now
    nextMeta.goc_file_url = fileUrl
    nextMeta.goc_file_name = file.name
    nextMeta.goc_updated_at = now
  }

  await set(dbRef(database, 'vendor_ref_files/sophos'), nextMeta)
  vendorRefFilesMeta.value.sophos = nextMeta
  vendorRefLoadError.value.sophos = ''
  sophosRefData.value = updatedRef
  return {
    meta: nextMeta,
    summaryText
  }
}

const importSheetNames = computed(() => {
  return [...new Set(importData.value.map(p => p.Sheet_name).filter(Boolean))]
})
const filteredImportData = computed(() => {
  if (!activeImportSheet.value) return importData.value
  return importData.value.filter(p => p.Sheet_name === activeImportSheet.value)
})
const displayedImportData = computed(() => {
  return filteredImportData.value.slice(0, importDisplayLimit.value)
})

/**
 * Tách thông tin chuẩn từ cột Description của file sophos-pricelist-reseller_SKU_list-asean-usd-2026-3.0:
 * - Description: giữ nguyên chuỗi Description trong file
 * - volume: tách range users / servers / 100gb blocks / cores (VD: "1-9 users", "10-24 users", "1-9 100gb blocks", "UP TO 4 CORES & UNL RAM")
 * - licenseDuration: chuyển "12 MOS" -> "12 months", "24 MOS" -> "24 months", "36 MOS" -> "36 months"
 * - trangThai: "New" hoặc "Renewal" dựa trên Description / Transaction Type
 */
const parseSophosDescriptionMetadata = (descStr, skuEntry = {}, fallbackTenHang = '') => {
  const rawDesc = String(descStr || skuEntry?.desc || '').trim()

  // 1. Tách range users / servers / blocks / cores đưa vào volume
  let volume = ''
  const volMatch = rawDesc.match(
    /\b(\d+\s*-\s*\d+\s*(?:users(?:\s+and\s+servers)?|servers|devices|endpoints|100gb\s+blocks|blocks|mailboxes|workloads|gateways|ips|assets|appliances|sensors)|\d+\+\s*(?:users(?:\s+and\s+servers)?|servers|devices|endpoints|100gb\s+blocks|blocks|mailboxes|workloads|gateways|ips|assets|appliances|sensors)|UP\s+TO\s+\d+\s+CORES?(?:\s*&\s*UNL\s+RAM)?|UNL\s+CORES?(?:\s*&\s*UNL\s+RAM)?)\b/i
  )
  if (volMatch) {
    volume = volMatch[1].trim()
  }

  // 2. Chuyển MOS -> months đưa vào License_duration
  let licenseDuration = ''
  const mosMatch = rawDesc.match(/\b(\d+)\s*MOS\b/i)
  if (mosMatch) {
    licenseDuration = `${mosMatch[1]} months`
  } else if (skuEntry && skuEntry.term && !isNaN(Number(skuEntry.term)) && Number(skuEntry.term) > 0) {
    licenseDuration = `${Number(skuEntry.term)} months`
  } else if (fallbackTenHang) {
    const mMonth = String(fallbackTenHang).match(/(\d+)\s*months?/i)
    const mYear = String(fallbackTenHang).match(/(\d+)[-\s]?(?:year|yr|y)\b/i)
    if (mMonth) licenseDuration = `${mMonth[1]} months`
    else if (mYear) licenseDuration = `${Number(mYear[1]) * 12} months`
  }

  // 3. Xác định Trang_thai: New hoặc Renewal từ Description / transType
  let trangThai = 'New'
  if (/\bRenewal\b/i.test(rawDesc) || String(skuEntry?.transType || '').toLowerCase() === 'renewal') {
    trangThai = 'Renewal'
  } else if (/\bNew\b/i.test(rawDesc) || String(skuEntry?.transType || '').toLowerCase() === 'new') {
    trangThai = 'New'
  }

  return {
    description: rawDesc,
    volume,
    licenseDuration,
    trangThai
  }
}

/**
 * Suy luận Danh_muc chuẩn (VD: "SOPHOS XGS 2300", "SOPHOS ZTNA", "SOPHOS NDR", "SOPHOS CFR", "SOPHOS VIRTUAL FIREWALL")
 * cho một dòng trong SKU_Tab của sophos-pricelist-reseller_SKU_list
 */
const inferSophosCategoryFromDesc = (descStr, familyStr = '', groupStr = '') => {
  if (groupStr) {
    const firstLine = String(groupStr)
      .split(/[\r\n:]/)[0]
      .trim()
      .replace(/\bXGS(\d)/gi, 'XGS $1')
      .toUpperCase()
    if (firstLine) return firstLine.startsWith('SOPHOS') ? firstLine : `SOPHOS ${firstLine}`
  }
  const d = String(descStr || '').trim()
  const xgsMatch = d.match(/\b(XGS?\s*\d{2,4}w?)\b/i)
  if (xgsMatch) {
    return `SOPHOS ${xgsMatch[1].toUpperCase().replace(/\bXGS(\d)/i, 'XGS $1').replace(/\s+/g, ' ')}`
  }
  if (/SF\s+SW\/Virtual/i.test(d)) return 'SOPHOS VIRTUAL FIREWALL'
  if (/Central\s+Firewall\s+Reporting/i.test(d)) return 'SOPHOS CENTRAL FIREWALL REPORTING (CFR)'
  if (/Workspace\s+Protection|Zero\s+Trust|ZTNA/i.test(d)) return 'SOPHOS CENTRAL ZERO TRUST NETWORK ACCESS (ZTNA)'
  if (/Network\s+Detection\s+and\s+Response|NDR/i.test(d)) return 'SOPHOS NETWORK DETECTION & RESPONSE (NDR)'
  if (familyStr) return `SOPHOS ${String(familyStr).trim().toUpperCase()}`
  return 'SOPHOS OTHER'
}

/**
 * Gắn Ma_hang_lien_ket & Ten_hang_lien_ket cho các sản phẩm cùng Danh_muc (giới hạn tối đa 30 mã liên kết/mục để tối ưu tốc độ)
 */
const linkRelatedSophosProducts = (products) => {
  const byCat = new Map()
  products.forEach(p => {
    const c = String(p.Danh_muc || '').trim()
    if (!c) return
    if (!byCat.has(c)) byCat.set(c, [])
    byCat.get(c).push(p)
  })
  products.forEach(p => {
    const c = String(p.Danh_muc || '').trim()
    const list = byCat.get(c) || []
    if (list.length > 1 && list.length <= 40) {
      const related = list.filter(r => r.Ma_hang !== p.Ma_hang)
      p.Ma_hang_lien_ket = related.map(r => r.Ma_hang).join('\n')
      p.Ten_hang_lien_ket = related.map(r => r.Ten_hang).join('\n')
    }
  })
}

/**
 * Mở Modal Chuẩn hóa & Import lại SOPHOS theo chuẩn:
 * - Ma_hang = SKU
 * - Description = cột Description từ sophos-pricelist-reseller_SKU_list-asean-usd-2026-3.0.xlsb
 * - volume = range users / servers / 100gb blocks / cores tách từ Description
 * - License_duration = chuyển MOS -> months (VD: 12 months, 24 months, 36 months)
 * - Trang_thai = New hoặc Renewal
 */
const openSophosStandardizedReimportModal = async (mode = 'bom') => {
  sophosReimportMode.value = mode
  showAsyncLoading('Đang chuẩn bị dữ liệu chuẩn SOPHOS...', 'Đang đọc SKU_Tab & BOM Trung Gian...')
  try {
    await loadSophosRefData()
    const refObj = sophosRefData.value || {}
    const gocMap = refObj.gocSkus || {}
    const tgList = refObj.trungGianItems || []
    const tiGia = refObj.tiGiaTrungGian || 26200

    const products = []
    const seenSkus = new Set()
    const categoryFeaturesMap = new Map()

    // 1. Nạp các dòng từ BOM Trung Gian (đã khử trùng lặp SKU giữa các vùng AU/CN/EU/US)
    for (const tg of tgList) {
      const sku = String(tg.sku || '').trim().toUpperCase()
      if (!sku || seenSkus.has(sku)) continue
      seenSkus.add(sku)

      const gocEntry = gocMap[sku] || {}
      const rawMoTa = String(tg.moTa || '').trim()
      let tenHang = String(tg.model || '').trim()
      if (rawMoTa) {
        const firstLine = rawMoTa.split(/\r?\n/)[0].trim().replace(/:$/, '')
        if (firstLine) tenHang = firstLine
      }
      const features = formatFeaturesHtml(rawMoTa || tenHang)
      const danhMuc = inferSophosCategoryFromDesc(tg.description || gocEntry.desc, gocEntry.family, tg.group)
      if (rawMoTa && !categoryFeaturesMap.has(danhMuc)) {
        categoryFeaturesMap.set(danhMuc, features)
      }

      const meta = parseSophosDescriptionMetadata(tg.description || gocEntry.desc, gocEntry, tenHang)
      const isHw = String(gocEntry.prodType || '').toLowerCase().includes('hardware') || sku.startsWith('XG')

      products.push({
        Sheet_name: tg.sheet || 'BOM Trung Gian',
        Ma_hang: sku,
        sku_code: sku,
        Ten_hang: tenHang || meta.description || sku,
        Description: meta.description,
        Main_img: '',
        Ma_nha_cung_cap: 'SOPHOS',
        Ten_nha_cung_cap: 'SOPHOS',
        Mo_ta_chung: '',
        Mo_ta_chi_tiet: '',
        Features: features,
        Danh_muc: danhMuc,
        License_duration: meta.licenseDuration,
        DVT: isHw ? 'Thiết bị' : 'Gói',
        Gia_tieu_chuan: Number(gocEntry.msrp || tg.msrp) || 0,
        Don_gia: Number(gocEntry.msrp || tg.msrp) || 0,
        Trang_thai: 'Còn hàng',
        Don_vi_tien_te: 'USD',
        Ti_gia: tiGia,
        Thue_VAT: 10,
        Ma_hang_lien_ket: '',
        Ten_hang_lien_ket: '',
        Ghi_chu: gocEntry.oldSku ? `Old SKU: ${gocEntry.oldSku}` : '',
        gia_hardware: 0,
        gia_nhap: Number(tg.nhapKhau) || 0,
        muc_phan_tram_off: 0,
        Type: meta.trangThai,
        thoi_han_bao_hanh: '',
        volume: meta.volume
      })
    }

    // 2. Nếu chọn mở rộng thêm từ SKU_Tab của sophos-pricelist-reseller_SKU_list-asean-usd-2026-3.0.xlsb
    if (mode === 'bom_plus_skulist' || mode === 'all_skulist') {
      for (const [sku, gocEntry] of Object.entries(gocMap)) {
        if (!sku || seenSkus.has(sku)) continue
        if (!gocEntry.skuTabRow && mode === 'bom_plus_skulist') continue
        if (mode === 'bom_plus_skulist' && gocEntry.sector && gocEntry.sector !== 'CORP') continue

        seenSkus.add(sku)
        const meta = parseSophosDescriptionMetadata(gocEntry.desc, gocEntry, gocEntry.desc)
        const danhMuc = inferSophosCategoryFromDesc(meta.description, gocEntry.family, '')
        const isHw = String(gocEntry.prodType || '').toLowerCase().includes('hardware') || sku.startsWith('XG')
        const sheetGroup = gocEntry.family ? `SKU_Tab • ${gocEntry.family}` : 'SKU_Tab'

        products.push({
          Sheet_name: sheetGroup,
          Ma_hang: sku,
          sku_code: sku,
          Ten_hang: meta.description || sku,
          Description: meta.description,
          Main_img: '',
          Ma_nha_cung_cap: 'SOPHOS',
          Ten_nha_cung_cap: 'SOPHOS',
          Mo_ta_chung: '',
          Mo_ta_chi_tiet: '',
          Features: formatFeaturesHtml(meta.description),
          Danh_muc: danhMuc,
          License_duration: meta.licenseDuration,
          DVT: isHw ? 'Thiết bị' : 'Gói',
          Gia_tieu_chuan: Number(gocEntry.msrp) || 0,
          Don_gia: Number(gocEntry.msrp) || 0,
          Trang_thai: 'Còn hàng',
          Don_vi_tien_te: 'USD',
          Ti_gia: tiGia,
          Thue_VAT: 10,
          Ma_hang_lien_ket: '',
          Ten_hang_lien_ket: '',
          Ghi_chu: gocEntry.oldSku ? `Old SKU: ${gocEntry.oldSku}` : '',
          gia_hardware: 0,
          gia_nhap: 0,
          muc_phan_tram_off: 0,
          Type: meta.trangThai,
          thoi_han_bao_hanh: '',
          volume: meta.volume
        })
      }
    }

    linkRelatedSophosProducts(products)

    importData.value = products
    importDisplayLimit.value = 150
    clearOldSophosBeforeImport.value = true
    pendingImportVendorRef.value = null
    activeImportSheet.value = [...new Set(products.map(p => p.Sheet_name).filter(Boolean))][0] || ''
    asyncResultModal.value.show = false
    showImportModal.value = true
  } catch (err) {
    console.error('Lỗi chuẩn bị dữ liệu chuẩn Sophos:', err)
    showAsyncError('Lỗi nạp dữ liệu Sophos', err.message)
  }
}

const handleFileUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  showAsyncLoading('Đang đọc file Excel Sophos...', `File: ${file.name}`)
  await loadSophosRefData()
  const refObj = sophosRefData.value || {}
  const gocMap = refObj.gocSkus || {}

  const reader = new FileReader()
  reader.onload = (evt) => {
    setTimeout(() => {
      try {
        const data = evt.target.result
        const workbook = XLSX.read(data, { type: 'array', cellStyles: true, cellHTML: true })
        const products = []
        const seenSkus = new Set()

        // Trường hợp 1: Người dùng chọn trực tiếp file sophos-pricelist-reseller_SKU_list-asean-usd-2026-3.0.xlsb (có sheet SKU_Tab)
        if (workbook.SheetNames.includes('SKU_Tab')) {
          const wsSku = workbook.Sheets['SKU_Tab']
          const rowsSku = XLSX.utils.sheet_to_json(wsSku, { header: 1, defval: null })
          const tiGia = refObj.tiGiaTrungGian || 26200

          for (let i = 7; i < rowsSku.length; i++) {
            const r = rowsSku[i]
            if (!r || !r[6]) continue
            const sku = String(r[6]).trim().toUpperCase()
            if (!sku || seenSkus.has(sku)) continue
            seenSkus.add(sku)

            const descRaw = String(r[8] || '').trim()
            const termVal = r[19] !== null && r[19] !== undefined && r[19] !== '' ? r[19] : r[12]
            const sectorVal = String(r[20] || r[13] || '').trim()
            const transTypeVal = String(r[21] || r[14] || '').trim()
            const familyVal = String(r[22] || r[15] || '').trim()
            const prodTypeVal = String(r[23] || r[16] || '').trim()
            const msrpVal = toNum(r[9], 0)
            const oldSkuVal = String(r[7] || '').trim()

            const meta = parseSophosDescriptionMetadata(descRaw, {
              term: termVal,
              transType: transTypeVal
            }, descRaw)
            const isHw = prodTypeVal.toLowerCase().includes('hardware') || sku.startsWith('XG')
            const danhMuc = inferSophosCategoryFromDesc(meta.description, familyVal, '')

            products.push({
              Sheet_name: familyVal ? `SKU_Tab • ${familyVal}` : (sectorVal ? `SKU_Tab (${sectorVal})` : 'SKU_Tab'),
              Ma_hang: sku,
              sku_code: sku,
              Ten_hang: meta.description || sku,
              Description: meta.description,
              Main_img: '',
              Ma_nha_cung_cap: 'SOPHOS',
              Ten_nha_cung_cap: 'SOPHOS',
              Mo_ta_chung: '',
              Mo_ta_chi_tiet: '',
              Features: formatFeaturesHtml(meta.description),
              Danh_muc: danhMuc,
              License_duration: meta.licenseDuration,
              DVT: isHw ? 'Thiết bị' : 'Gói',
              Gia_tieu_chuan: msrpVal,
              Don_gia: msrpVal,
              Trang_thai: 'Còn hàng',
              Don_vi_tien_te: 'USD',
              Ti_gia: tiGia,
              Thue_VAT: 10,
              Ma_hang_lien_ket: '',
              Ten_hang_lien_ket: '',
              Ghi_chu: oldSkuVal ? `Old SKU: ${oldSkuVal}` : '',
              gia_hardware: 0,
              gia_nhap: 0,
              muc_phan_tram_off: 0,
              Type: meta.trangThai,
              thoi_han_bao_hanh: '',
              volume: meta.volume
            })
          }
        } else {
          // Trường hợp 2: File mẫu chuẩn theo cấu trúc file_trung_gian_SOPHOS.xlsx
          // (Cột: STT | SKU | MODEL | Description | MÔ TẢ SẢN PHẨM | GIÁ THAM KHẢO (USD) | NHẬP KHẨU | SITE)
          const lpNhapMap = new Map()
          if (Array.isArray(refObj.lpSophos)) {
            refObj.lpSophos.forEach(lp => {
              if (lp && lp.model && lp.nhapKhauUsd) {
                lpNhapMap.set(String(lp.model).trim().toUpperCase().replace(/\s+/g, ' '), Number(lp.nhapKhauUsd) || 0)
              }
            })
          }
          if (workbook.Sheets['LP Sophos']) {
            const lpRows = XLSX.utils.sheet_to_json(workbook.Sheets['LP Sophos'], { header: 1 })
            lpRows.forEach(lr => {
              if (lr && lr[0] && String(lr[0]).toUpperCase().startsWith('XGS') && lr[17]) {
                const mKey = String(lr[0]).trim().toUpperCase().replace(/\s+/g, ' ')
                const nkVal = toNum(lr[17], 0)
                if (nkVal > 0) lpNhapMap.set(mKey, nkVal)
              }
            })
          }

          for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName]
            if (!worksheet) continue

            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
            let headerRowIndex = -1

            let sttIdx = -1, skuIdx = -1, maSpIdx = -1, descIdx = -1, moTaIdx = -1, giaIdx = -1, typeIdx = -1, vatIdx = -1, giaNhapIdx = -1, dvtIdx = -1, siteIdx = -1
            let currentStt = ''
            let currentMaSp = ''
            let currentCategory = ''
            let currentSite = ''
            let currentVat = 10

            // Get Ti_Gia from A2 (index 1, 0)
            let globalTiGia = refObj.tiGiaTrungGian || 26200
            if (json.length > 1 && json[1] && json[1][0]) {
              const a2Text = String(json[1][0])
              const match = a2Text.match(/[\d,.]+/g)
              if (match) {
                const parsed = Number(match[match.length - 1].replace(/,/g, ''))
                if (!isNaN(parsed) && parsed > 0) globalTiGia = parsed
              }
            }

            // Get Nha_cung_cap from C2/D2
            let globalNhaCungCap = 'SOPHOS'
            if (json.length > 1 && json[1]) {
              const brandCell = json[1][2] || json[1][3]
              if (brandCell && String(brandCell).trim()) {
                globalNhaCungCap = String(brandCell).trim().toUpperCase()
              }
            }

            for (let i = 0; i < json.length; i++) {
              const row = json[i]
              if (!row || !row.length) continue

              if (headerRowIndex === -1) {
                if (row.some(c => String(c || '').toUpperCase().includes('MÔ TẢ SẢN PHẨM'))) {
                  headerRowIndex = i
                  for (let r = Math.max(0, i - 2); r <= i; r++) {
                    const hr = json[r]
                    if (!hr) continue
                    hr.forEach((c, idx) => {
                      const text = String(c || '').toUpperCase().replace(/\s/g, '')
                      if (text.includes('STT')) sttIdx = idx
                      if (text === 'SKU' || text.includes('MÃSKU')) skuIdx = idx
                      if (text.includes('MÃSP') || text === 'MODEL' || text.includes('MODEL')) maSpIdx = idx
                      if (text.includes('DESCRIPTION')) descIdx = idx
                      if (text.includes('MÔTẢSẢNPHẨM')) moTaIdx = idx
                      if (text.includes('GIÁTHAMKHẢO')) giaIdx = idx
                      if (text.includes('TYPE')) typeIdx = idx
                      if (text.includes('VAT')) vatIdx = idx
                      if (text.includes('GIÁNHẬP') || text.includes('NHẬPKHẨU')) giaNhapIdx = idx
                      if (text === 'ĐVT' || text === 'DVT') dvtIdx = idx
                      if (text === 'SITE') siteIdx = idx
                    })
                  }
                }
                continue
              }

              if (i > headerRowIndex) {
                const stt = sttIdx >= 0 ? row[sttIdx] : ''
                const rawSku = skuIdx >= 0 ? String(row[skuIdx] ?? '').trim().toUpperCase() : ''
                const maSp = maSpIdx >= 0 ? row[maSpIdx] : ''
                const rawDescCol = descIdx >= 0 ? String(row[descIdx] ?? '').trim() : ''
                const moTa = moTaIdx >= 0 ? row[moTaIdx] : ''
                const giaThamKhao = giaIdx >= 0 ? row[giaIdx] : ''
                const typeVal = typeIdx >= 0 ? row[typeIdx] : ''
                const giaNhap = giaNhapIdx >= 0 ? row[giaNhapIdx] : ''
                const dvtVal = dvtIdx >= 0 ? row[dvtIdx] : ''
                const rowSite = siteIdx >= 0 && row[siteIdx] ? String(row[siteIdx]).trim().toUpperCase() : ''

                if (vatIdx >= 0 && row[vatIdx] !== undefined && row[vatIdx] !== null && String(row[vatIdx]).trim() !== '') {
                  const rawVat = String(row[vatIdx])
                  const v = rawVat.replace('%', '').trim()
                  let vatVal = toNum(v, 0)
                  if (vatVal < 1 && vatVal > 0) vatVal = vatVal * 100
                  currentVat = vatVal
                }

                if (moTa !== undefined && moTa !== null && String(moTa).trim() !== '') {
                  if (stt !== undefined && stt !== null && stt !== '') currentStt = String(stt).trim()
                  if (maSp !== undefined && maSp !== null && maSp !== '') currentMaSp = String(maSp).trim()
                  if (rowSite) currentSite = rowSite

                  const moTaStr = String(moTa).trim()
                  let tenHang = moTaStr
                  const firstNewline = moTaStr.indexOf('\n')

                  if (firstNewline !== -1) {
                    tenHang = moTaStr.substring(0, firstNewline).trim()
                    if (tenHang.endsWith(':')) tenHang = tenHang.slice(0, -1)
                  }
                  const richFeatures = moTaIdx >= 0 ? extractExcelCellRichHtml(worksheet, i, moTaIdx) : ''
                  const features = richFeatures || formatFeaturesHtml(moTaStr)

                  const rawCategory = currentCategory
                    ? String(currentCategory).split(/[\r\n:]/)[0].trim().replace(/\bXGS(\d)/gi, 'XGS $1')
                    : String(currentMaSp).replace(/\bXGS(\d)/gi, 'XGS $1')
                  const danhMucUpper = String(rawCategory || currentMaSp).toUpperCase()
                  const typeStr = String(typeVal || '').trim()

                  // Ưu tiên lấy Ma_hang = SKU theo chuẩn file_trung_gian_SOPHOS.xlsx
                  let id = rawSku
                  if (!id) {
                    id = `${rawCategory}-${tenHang}`
                    if (currentMaSp && rawCategory && !rawCategory.toUpperCase().includes(currentMaSp.toUpperCase())) {
                      id = `${currentMaSp}-${id}`
                    }
                    if (typeStr) id += `-${typeStr}`
                    id = id.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
                    id = id.toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9\-]/g, '').replace(/-+/g, '-').replace(/-+$/, '')
                  }

                  // Nếu có SKU và SKU này đã được nạp (do lặp vùng AU/CN/EU/US đối với gói License) thì bỏ qua bản trùng
                  if (rawSku && seenSkus.has(rawSku)) {
                    continue
                  }
                  if (rawSku) seenSkus.add(rawSku)

                  const gocEntry = rawSku ? (gocMap[rawSku] || {}) : {}
                  // Ưu tiên cột Description trực tiếp trong file_trung_gian_SOPHOS.xlsx, fallback sang SKU_Tab nếu trống
                  const meta = parseSophosDescriptionMetadata(
                    rawDescCol || gocEntry.desc,
                    gocEntry,
                    tenHang
                  )

                  const isHw = typeStr === 'hw' || id.startsWith('XG') || /Security\s+Appliance|Hardware\s+Appliance/i.test(meta.description || tenHang)
                  let parsedGiaNhap = toNum(giaNhap, 0)
                  if (!parsedGiaNhap && isHw && id.startsWith('XG')) {
                    const mMatch = (danhMucUpper + ' ' + meta.description).match(/\b(XGS\s*\d{2,4}W?)\b/i)
                    if (mMatch) {
                      const mKey = mMatch[1].toUpperCase().replace(/\s+/g, ' ')
                      parsedGiaNhap = lpNhapMap.get(mKey) || 0
                    }
                  }

                  products.push({
                    Sheet_name: sheetName,
                    Ma_hang: id,
                    sku_code: rawSku,
                    Ten_hang: tenHang,
                    Description: meta.description,
                    Main_img: '',
                    Ma_nha_cung_cap: globalNhaCungCap,
                    Ten_nha_cung_cap: globalNhaCungCap,
                    Mo_ta_chung: '',
                    Mo_ta_chi_tiet: '',
                    Features: features,
                    Danh_muc: danhMucUpper,
                    License_duration: meta.licenseDuration,
                    DVT: dvtVal !== undefined && dvtVal !== null && String(dvtVal).trim() !== '' ? String(dvtVal).trim() : (isHw ? 'Thiết bị' : 'Gói'),
                    Gia_tieu_chuan: toNum(giaThamKhao, 0),
                    Don_gia: toNum(giaThamKhao, 0),
                    Trang_thai: 'Còn hàng',
                    Don_vi_tien_te: 'USD',
                    Ti_gia: globalTiGia,
                    Thue_VAT: currentVat ? currentVat : 10,
                    Ma_hang_lien_ket: '',
                    Ten_hang_lien_ket: '',
                    Ghi_chu: gocEntry.oldSku ? `Old SKU: ${gocEntry.oldSku}` : (currentSite && isHw ? `Site: ${currentSite}` : ''),
                    gia_hardware: 0,
                    gia_nhap: parsedGiaNhap,
                    muc_phan_tram_off: 0,
                    Type: meta.trangThai || typeStr,
                    thoi_han_bao_hanh: '',
                    volume: meta.volume
                  })
                } else {
                  const firstCell = row.find(c => c !== undefined && c !== null && String(c).trim() !== '')
                  if (firstCell) {
                    currentCategory = String(firstCell).trim()
                  }
                  if (rowSite) {
                    currentSite = rowSite
                  }
                }
              }
            }
          }
        }

        linkRelatedSophosProducts(products)

        asyncResultModal.value.show = false
        if (products.length > 0) {
          lastPurchaseUploadMeta.value = null
          pendingImportVendorRef.value = { vendor: 'sophos', file, workbook, uploadedAt: new Date().toISOString() }
          syncImportFileToCloudinaryRef.value = true
          pendingImportUploadPromise = uploadAndPersistVendorRefWorkbook('sophos', file, workbook, 'import').catch(err => {
            console.warn('Upload file import Sophos ngầm lên Cloudinary:', err)
            return null
          })
          importData.value = products
          importDisplayLimit.value = 150
          clearOldSophosBeforeImport.value = true
          activeImportSheet.value = [...new Set(products.map(p => p.Sheet_name).filter(Boolean))][0] || ''
          showImportModal.value = true
        } else {
          showAsyncError('Import thất bại', 'Không tìm thấy dữ liệu hợp lệ trong file.')
        }
      } catch (err) {
        console.error(err)
        showAsyncError('Lỗi khi đọc file Excel', err.message)
      }
    }, 50)
  }
  reader.readAsArrayBuffer(file)
  e.target.value = '' // reset
}

const handleKasperskyUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return

  showAsyncLoading('Đang xử lý file Kaspersky...', 'Đang đọc toàn bộ dữ liệu gốc từ tất cả các sheet (bỏ qua mọi bộ lọc Pivot)...')

  const reader = new FileReader()
  reader.onload = (evt) => {
    setTimeout(() => {
      try {
        const data = new Uint8Array(evt.target.result)
        const saleSheetDisplayMap = {
          'SaleListSMB+Enterprise': 'SMB+Enterprise (License)',
          'SaleListSMB+EnterprisePack': 'SMB+Enterprise (Pack)',
          'SaleListHome+SOHO': 'Home+SOHO',
          'SaleListCBA': 'CBA Subscription',
          'SaleListSubscription&MSP': 'Subscription&MSP',
          'SaleListxSP': 'xSP',
          'SaleListProfessionalServices': 'ProfessionalServices',
          'SaleListSecurityServices': 'SecurityServices',
          'SaleListSDWAN': 'SD-WAN',
          'SaleListSIEM': 'SIEM',
          'SaleListSE': 'ScanEngine',
          'SaleListATC': 'ATC'
        }
        const targetSaleSheets = Object.keys(saleSheetDisplayMap)

        let wb = XLSX.read(data, {
          type: 'array',
          sheets: [...targetSaleSheets, 'SMB+Enterprise (License)'],
          cellStyles: true,
          cellHTML: true
        })
        if (!wb.SheetNames || wb.SheetNames.length === 0) {
          wb = XLSX.read(data, { type: 'array', cellStyles: true, cellHTML: true })
        }

        const pivotSheetName = wb.SheetNames.find(name => name.trim() === 'SMB+Enterprise (License)')
        const foundSaleSheets = wb.SheetNames.filter(name => name.trim().startsWith('SaleList'))

        if (!pivotSheetName && foundSaleSheets.length === 0) {
          showAsyncError('Import thất bại', 'Không tìm thấy các sheet "SaleList..." hoặc "SMB+Enterprise (License)".')
          return
        }

        // 1. Nếu sheet Pivot "SMB+Enterprise (License)" có cột Features tùy chỉnh thì gom theo Product
        const featuresByProductMap = new Map()
        if (pivotSheetName && wb.Sheets[pivotSheetName]) {
          const wsPivot = wb.Sheets[pivotSheetName]
          const jsonPivot = XLSX.utils.sheet_to_json(wsPivot, { header: 1, defval: '' })
          const headerRow = jsonPivot[9] || []
          let featuresIdx = -1
          for (let j = 0; j < headerRow.length; j++) {
            const colName = String(headerRow[j] || '').trim().toUpperCase().replace(/\s+/g, '')
            if (colName.includes('FEATURES') || colName.includes('MÔTẢSẢNPHẨM') || colName === 'MÔTẢ') {
              featuresIdx = j
            }
          }
          if (featuresIdx >= 0) {
            let lastProd = ''
            for (let i = 10; i < jsonPivot.length; i++) {
              const r = jsonPivot[i]
              if (!r || !r.length) continue
              const rawP = String(r[2] || '').trim()
              if (rawP) lastProd = rawP
              const rawFeat = String(r[featuresIdx] || '').trim()
              if (lastProd && rawFeat && !featuresByProductMap.has(lastProd.toUpperCase())) {
                const rich = extractExcelCellRichHtml(wsPivot, i, featuresIdx) || formatFeaturesHtml(rawFeat)
                featuresByProductMap.set(lastProd.toUpperCase(), rich)
              }
            }
          }
        }

        let products = []
        let displaySheetName = pivotSheetName || 'SMB+Enterprise (License)'

        // 2. Ưu tiên đọc trực tiếp từ TẤT CẢ các sheet nguồn "SaleList*" (SMB+Enterprise License, Pack, Subscription&MSP, Home+SOHO, SD-WAN, SIEM...)
        // để NHẬN ĐẦY ĐỦ 100% sản phẩm / Band / Type, bỏ qua mọi bộ lọc PivotTable trong file Excel
        if (foundSaleSheets.length > 0) {
          const dedupMap = new Map()
          // Sắp xếp thứ tự ưu tiên sheet: SMB+Enterprise (License) & (Pack) lên đầu
          const orderedSaleSheets = [
            ...targetSaleSheets.filter(s => foundSaleSheets.includes(s)),
            ...foundSaleSheets.filter(s => !targetSaleSheets.includes(s))
          ]

          orderedSaleSheets.forEach((saleSheet, sheetOrderIdx) => {
            const wsSale = wb.Sheets[saleSheet]
            if (!wsSale) return
            const rowsSale = XLSX.utils.sheet_to_json(wsSale, { header: 1, defval: '' })
            const sheetLabel = saleSheetDisplayMap[saleSheet] || saleSheet

            for (let i = 1; i < rowsSale.length; i++) {
              const row = rowsSale[i]
              if (!row || !row.length) continue

              const price = toNum(row[12], 0)
              if (!price || price <= 0) continue

              const rawPosCode = String(row[0] || '').trim()
              const posCode = rawPosCode === '-' ? '' : rawPosCode
              const rawSku = String(row[1] || '').trim()
              const sku = rawSku === '-' ? '' : rawSku
              const codeNum = Number(row[3]) || 999999
              const product = String(row[4] || '').trim()
              if (!product || product.toUpperCase().includes('MAX OF PRICE')) continue

              const rawPkg = String(row[7] || '').trim()
              const pkg = rawPkg === '-' ? '' : rawPkg
              const rawBand = String(row[8] || '').trim()
              const band = rawBand === '-' ? '' : rawBand
              const rawType = String(row[10] || '').trim()
              const type = rawType === '-' ? '' : rawType
              const rawTerm = String(row[11] || '').trim()
              const term = rawTerm === '-' ? '' : rawTerm

              let id = ''
              if (posCode && sku) {
                id = `${posCode} - ${sku} - ${band} - ${type} - ${term} - ${pkg}`
              } else if (sku) {
                id = `${sku} - ${band} - ${type} - ${term} - ${pkg}`
              } else if (posCode) {
                id = `${posCode} - ${product} - ${type} - ${term} - ${band} - ${pkg}`
              } else {
                id = `${product} - ${type} - ${term} - ${band} - ${pkg}`
              }
              id = id.replace(/\s+/g, ' ').trim()

              const parts = [type, term, band].filter(Boolean).join(' - ')
              let tenHang = product
              if (parts) {
                tenHang += ` (${parts})`
              }

              const danhMuc = product.toUpperCase()
              const rowFeatures = featuresByProductMap.get(danhMuc) || ''

              const existing = dedupMap.get(id)
              if (!existing || price > existing.Don_gia) {
                dedupMap.set(id, {
                  _sheetOrder: sheetOrderIdx,
                  _sortCode: codeNum,
                  _sortBand: band,
                  Sheet_name: sheetLabel,
                  Ma_hang: id,
                  sku_code: sku || posCode,
                  Ten_hang: tenHang,
                  Description: parts ? `${product} - ${parts}` : product,
                  Main_img: '',
                  Ma_nha_cung_cap: 'KASPERSKY',
                  Ten_nha_cung_cap: 'KASPERSKY',
                  Mo_ta_chung: '',
                  Mo_ta_chi_tiet: '',
                  Features: rowFeatures,
                  Danh_muc: danhMuc,
                  License_duration: term,
                  DVT: pkg,
                  Gia_tieu_chuan: price,
                  Don_gia: price,
                  Trang_thai: 'Còn hàng',
                  Don_vi_tien_te: 'VND',
                  Ti_gia: 1,
                  Thue_VAT: 0,
                  Ma_hang_lien_ket: '',
                  Ten_hang_lien_ket: '',
                  Ghi_chu: posCode ? `PositionCode: ${posCode}` : '',
                  gia_hardware: 0,
                  gia_nhap: 0,
                  muc_phan_tram_off: 0,
                  Type: type,
                  thoi_han_bao_hanh: '',
                  volume: band
                })
              }
            }
          })

          products = Array.from(dedupMap.values()).sort((a, b) => {
            if (a._sheetOrder !== b._sheetOrder) return a._sheetOrder - b._sheetOrder
            if (a._sortCode !== b._sortCode) return a._sortCode - b._sortCode
            if (a.Danh_muc !== b.Danh_muc) return a.Danh_muc.localeCompare(b.Danh_muc)
            if (a.Type !== b.Type) return String(a.Type || '').localeCompare(String(b.Type || ''))
            if (a.License_duration !== b.License_duration) return String(a.License_duration || '').localeCompare(String(b.License_duration || ''))
            return String(a._sortBand || '').localeCompare(String(b._sortBand || ''))
          })
          products.forEach(p => {
            delete p._sheetOrder
            delete p._sortCode
            delete p._sortBand
          })
        } else if (pivotSheetName && wb.Sheets[pivotSheetName]) {
          // 3. Fallback: Nếu file chỉ có duy nhất sheet "SMB+Enterprise (License)" mà không có "SaleListSMB+Enterprise"
          const ws = wb.Sheets[pivotSheetName]
          const json = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
          const headerRow = json[9] || []
          const bands = []
          let featuresIdx = -1
          for (let j = 0; j < headerRow.length; j++) {
            const colName = String(headerRow[j] || '').trim().toUpperCase().replace(/\s+/g, '')
            if (colName.includes('FEATURES') || colName.includes('MÔTẢSẢNPHẨM') || colName === 'MÔTẢ') {
              featuresIdx = j
            }
          }
          for (let j = 9; j < headerRow.length; j++) {
            const b = String(headerRow[j] || '').trim()
            if (b && b !== 'Grand Total') {
              bands.push({ index: j, name: b })
            }
          }

          if (bands.length === 0) {
            showAsyncError('Import thất bại', 'Không tìm thấy cột Band nào trong sheet.')
            return
          }

          let lastProduct = ''
          let lastPkg = ''
          let lastType = ''
          let lastFeatures = ''

          for (let i = 10; i < json.length; i++) {
            const row = json[i]
            if (!row || !row.length) continue

            const rawProduct = String(row[2] || '').trim()
            const rawPkg = String(row[4] || '').trim()
            const rawType = String(row[6] || '').trim()
            const rawFeaturesText = featuresIdx >= 0 ? String(row[featuresIdx] || '').trim() : ''

            if (rawProduct) {
              lastProduct = rawProduct
              lastFeatures = ''
            }
            if (rawPkg) lastPkg = rawPkg
            if (rawType) lastType = rawType
            if (rawFeaturesText && featuresIdx >= 0) {
              lastFeatures = extractExcelCellRichHtml(ws, i, featuresIdx) || formatFeaturesHtml(rawFeaturesText)
            }

            const product = rawProduct || lastProduct
            const pkg = rawPkg || lastPkg
            const type = rawType || lastType
            const rowFeatures = (rawFeaturesText && featuresIdx >= 0)
              ? (extractExcelCellRichHtml(ws, i, featuresIdx) || formatFeaturesHtml(rawFeaturesText))
              : lastFeatures

            const term = String(row[7] || '').trim()
            const sku = String(row[8] || '').trim()

            if (!product) continue
            if (product.toUpperCase().includes('MAX OF PRICE')) continue

            for (const band of bands) {
              const priceStr = String(row[band.index] || '').trim()
              const price = toNum(priceStr, 0)
              if (!priceStr || price === 0) continue

              const bandLetterMatch = String(band.name || '').match(/^Band\s+([A-Z0-9]+)\s*:/i)
              const derivedPosCode = (sku && sku.includes('*') && bandLetterMatch)
                ? sku.replace('*', bandLetterMatch[1].toUpperCase())
                : ''
              let id = ''
              if (derivedPosCode && sku && sku !== '-') {
                id = `${derivedPosCode} - ${sku} - ${band.name} - ${type} - ${term} - ${pkg}`
              } else if (sku && sku !== '-') {
                id = `${sku} - ${band.name} - ${type} - ${term} - ${pkg}`
              } else {
                id = `${product} - ${type} - ${term} - ${band.name} - ${pkg}`
              }
              id = id.replace(/\s+/g, ' ').trim()

              const parts = [type, term, band.name].filter(Boolean).join(' - ')
              let tenHang = product
              if (parts) {
                tenHang += ` (${parts})`
              }

              products.push({
                Sheet_name: pivotSheetName,
                Ma_hang: id,
                sku_code: (sku && sku !== '-') ? sku : derivedPosCode,
                Ten_hang: tenHang,
                Description: parts ? `${product} - ${parts}` : product,
                Main_img: '',
                Ma_nha_cung_cap: 'KASPERSKY',
                Ten_nha_cung_cap: 'KASPERSKY',
                Mo_ta_chung: '',
                Mo_ta_chi_tiet: '',
                Features: rowFeatures,
                Danh_muc: product.toUpperCase(),
                License_duration: term,
                DVT: pkg,
                Gia_tieu_chuan: price,
                Don_gia: price,
                Trang_thai: 'Còn hàng',
                Don_vi_tien_te: 'VND',
                Ti_gia: 1,
                Thue_VAT: 0,
                Ma_hang_lien_ket: '',
                Ten_hang_lien_ket: '',
                Ghi_chu: '',
                gia_hardware: 0,
                gia_nhap: 0,
                muc_phan_tram_off: 0,
                Type: type,
                thoi_han_bao_hanh: '',
                volume: band.name
              })
            }
          }
        }

        if (products.length > 0) {
          // Liên kết gọn các sản phẩm cùng Danh_muc + Type + License_duration (tối đa 5 mã liên kết/sản phẩm để giữ DB nhẹ và tải nhanh)
          const groupMap = new Map()
          products.forEach(p => {
            const key = `${p.Danh_muc}||${p.Type}||${p.License_duration}`
            if (!groupMap.has(key)) groupMap.set(key, [])
            groupMap.get(key).push(p)
          })
          products.forEach(p => {
            const key = `${p.Danh_muc}||${p.Type}||${p.License_duration}`
            const list = groupMap.get(key) || []
            if (list.length > 1) {
              const related = list.filter(r => r.Ma_hang !== p.Ma_hang).slice(0, 5)
              p.Ma_hang_lien_ket = related.map(r => r.Ma_hang).join('\n')
              p.Ten_hang_lien_ket = related.map(r => r.Ten_hang).join('\n')
            }
          })

          lastPurchaseUploadMeta.value = null
          pendingImportVendorRef.value = { vendor: 'kaspersky', file, workbook: wb, uploadedAt: new Date().toISOString() }
          syncImportFileToCloudinaryRef.value = true
          pendingImportUploadPromise = uploadAndPersistVendorRefWorkbook('kaspersky', file, wb, 'import').catch(err => {
            console.warn('Upload file import Kaspersky ngầm lên Cloudinary:', err)
            return null
          })
          importData.value = products
          importDisplayLimit.value = 150
          activeImportSheet.value = [...new Set(products.map(p => p.Sheet_name).filter(Boolean))][0] || displaySheetName
          asyncResultModal.value.show = false
          showImportModal.value = true
        } else {
          showAsyncError('Import thất bại', 'Không tìm thấy dữ liệu hợp lệ trong file.')
        }
      } catch (err) {
        console.error(err)
        showAsyncError('Lỗi đọc file', 'Không thể xử lý file Kaspersky: ' + err.message)
      }
    }, 50)
  }
  reader.readAsArrayBuffer(file)
  e.target.value = ''
}

const handleAcronisUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return

  showAsyncLoading('Đang xử lý file Acronis...', 'Vui lòng chờ giây lát...')

  const reader = new FileReader()
  reader.onload = (evt) => {
    setTimeout(() => {
      try {
        const data = new Uint8Array(evt.target.result)
        const wb = XLSX.read(data, { type: 'array', cellStyles: true, cellHTML: true })
        const products = []

        for (const sheetName of wb.SheetNames) {
          const ws = wb.Sheets[sheetName]
          if (!ws) continue

          // Giới hạn số cột đọc (tránh trường hợp sheet Personal có !ref kéo dài tới cột XEV gây treo)
          if (ws['!ref']) {
            const range = XLSX.utils.decode_range(ws['!ref'])
            if (range.e.c > 20) {
              range.e.c = 20
              ws['!ref'] = XLSX.utils.encode_range(range)
            }
          }

          const json = XLSX.utils.sheet_to_json(ws, { header: 1 })
          let headerRowIndex = -1
          let skuForIdx = 0
          let skuIdx = 1
          let moTaIdx = 2
          let priceIdx = 3

          for (let i = 0; i < json.length; i++) {
            const row = json[i]
            if (!row || !row.length) continue
            const hasHeader = row.some(c => {
              const t = String(c || '').toUpperCase().replace(/\s+/g, ' ').trim()
              return t.includes('MÔ TẢ SẢN PHẨM') || t === 'SKU FOR'
            })
            if (hasHeader) {
              headerRowIndex = i
              row.forEach((c, idx) => {
                const text = String(c || '').toUpperCase().replace(/\s+/g, '')
                if (text.includes('SKUFOR')) skuForIdx = idx
                else if (text === 'SKU') skuIdx = idx
                else if (text.includes('MÔTẢSẢNPHẨM')) moTaIdx = idx
                else if (text.includes('UNITPRICE') || text.includes('GIÁ')) priceIdx = idx
              })
              break
            }
          }

          if (headerRowIndex === -1) continue

          let currentCategory = ''
          let currentFeatures = ''
          let currentSubType = ''

          for (let i = headerRowIndex + 1; i < json.length; i++) {
            const row = json[i]
            if (!row || !row.length) continue

            const skuFor = String(row[skuForIdx] ?? '').trim()
            const sku = String(row[skuIdx] ?? '').trim()
            const moTa = String(row[moTaIdx] ?? '').trim()
            const rawPrice = row[priceIdx]
            const priceStr = String(rawPrice ?? '').trim()
            const price = toNum(rawPrice, 0)
            const hasPrice = priceStr !== '' && price > 0

            // 1. Dòng sản phẩm: có SKU (hoặc SKU For), có Mô tả sản phẩm và có Unit Price
            if ((sku || skuFor) && moTa && hasPrice) {
              const tenHang = moTa.replace(/\u00a0/g, ' ').trim()
              const maHang = [skuFor, sku].filter(Boolean).join(' - ')

              let licenseDuration = ''
              const durMatch = tenHang.match(/(\d+)\s*(year|month)s?/i)
              if (durMatch) {
                licenseDuration = `${durMatch[1]} ${durMatch[2].toLowerCase()}`
              }

              let volume = ''
              const volMatch = tenHang.match(/(?:^|[\s(])(\d+(?:\/\d+)?\s*(?:VMs?(?:\s*pack)?|Seats?|Computers?|GB|TB))\b/i)
              if (volMatch) {
                volume = volMatch[1].trim()
              }

              let typeVal = ''
              if (/reinstated\s+renewal/i.test(tenHang)) typeVal = 'Reinstated Renewal'
              else if (/renewal/i.test(tenHang)) typeVal = 'Renewal'
              else if (/upgrade/i.test(tenHang)) typeVal = 'Upgrade'
              else if (/subscription/i.test(tenHang) || /subscription/i.test(currentSubType)) typeVal = 'Subscription'
              else if (/perpeptual|perpetual/i.test(tenHang) || /perpeptual|perpetual/i.test(currentSubType)) typeVal = 'Perpetual'

              const rawCat = (currentCategory || sheetName).replace(/^\d+(\.\d+)?\.?\s*/, '').trim().toUpperCase()

              products.push({
                Sheet_name: sheetName,
                Ma_hang: maHang,
                sku_code: sku || skuFor,
                Ten_hang: tenHang,
                Main_img: '',
                Ma_nha_cung_cap: 'ACRONIS',
                Ten_nha_cung_cap: 'ACRONIS',
                Mo_ta_chung: '',
                Mo_ta_chi_tiet: '',
                Features: currentFeatures,
                Danh_muc: rawCat,
                License_duration: licenseDuration,
                DVT: 'License',
                Gia_tieu_chuan: price,
                Don_gia: price,
                Trang_thai: 'Còn hàng',
                Don_vi_tien_te: 'VND',
                Ti_gia: 1,
                Thue_VAT: 0,
                Ma_hang_lien_ket: '',
                Ten_hang_lien_ket: '',
                Ghi_chu: '',
                gia_hardware: 0,
                gia_nhap: 0,
                muc_phan_tram_off: 0,
                Type: typeVal,
                thoi_han_bao_hanh: '',
                volume: volume
              })
            }
            // 2. Dòng Features: có Mô tả sản phẩm nhưng KHÔNG có SKU và KHÔNG có Unit Price -> giữ nguyên format Excel
            else if (!sku && !skuFor && moTa && !hasPrice) {
              currentFeatures = extractExcelCellRichHtml(ws, i, moTaIdx) || formatFeaturesHtml(moTa)
            }
            // 3. Dòng tiêu đề mục (Category) hoặc tiêu đề phụ (Sub-header): không có Mô tả sản phẩm & không có Unit Price
            else if (!moTa && !hasPrice && (sku || skuFor)) {
              const headerText = sku || skuFor
              const isSubHeader = (sku && skuFor && sku === skuFor) || /perpeptual|perpetual|^\d+\.\d+\s/i.test(headerText)
              if (isSubHeader) {
                currentSubType = headerText
              } else {
                currentCategory = headerText
                currentFeatures = '' // Reset features cho mục mới; nếu mục không có dòng mô tả thì để trống
                currentSubType = ''
              }
            }
          }
        }

        if (products.length > 0) {
          // Liên kết các sản phẩm có cùng Danh_muc
          products.forEach(p => {
            if (p.Danh_muc) {
              const related = products.filter(r => r.Danh_muc === p.Danh_muc && r.Ma_hang !== p.Ma_hang)
              if (related.length > 0) {
                p.Ma_hang_lien_ket = related.map(r => r.Ma_hang).join('\n')
                p.Ten_hang_lien_ket = related.map(r => r.Ten_hang).join('\n')
              }
            }
          })

          lastPurchaseUploadMeta.value = null
          pendingImportVendorRef.value = { vendor: 'acronis', file, workbook: wb, uploadedAt: new Date().toISOString() }
          syncImportFileToCloudinaryRef.value = true
          pendingImportUploadPromise = uploadAndPersistVendorRefWorkbook('acronis', file, wb, 'import').catch(err => {
            console.warn('Upload file import Acronis ngầm lên Cloudinary:', err)
            return null
          })
          importData.value = products
          activeImportSheet.value = [...new Set(products.map(p => p.Sheet_name).filter(Boolean))][0] || ''
          asyncResultModal.value.show = false
          showImportModal.value = true
        } else {
          showAsyncError('Import thất bại', 'Không tìm thấy dữ liệu hợp lệ trong file Acronis.')
        }
      } catch (err) {
        console.error(err)
        showAsyncError('Lỗi đọc file', 'Không thể xử lý file Acronis: ' + err.message)
      }
    }, 50)
  }
  reader.readAsArrayBuffer(file)
  e.target.value = '' // reset
}

const handleGiaOffUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  showAsyncLoading('Đang đọc nội dung ảnh...', 'AI đang quét dữ liệu, vui lòng đợi...')
  try {
    let extractedName = file.name
    let extractedDate = ''
    
    // 1. OCR để lấy Tên và Tháng/Năm
    if (file.type.startsWith('image/')) {
      const worker = await Tesseract.createWorker('vie', 1)
      const result = await worker.recognize(file)
      await worker.terminate()
      
      const lines = result.data.text.split('\n').map(l => l.trim()).filter(Boolean)
      if (lines.length > 0) {
        extractedName = lines[0]
      }
      for (let i = 0; i < Math.min(lines.length, 10); i++) {
        const line = lines[i]
        // Tìm định dạng MM/YYYY (có thể có khoảng trắng)
        const match = line.match(/(\d{1,2})\s*[\/\-]\s*(\d{4})/)
        if (match) {
          extractedDate = `${match[1]}/${match[2]}`
          break
        }
      }
      
      // Fallback nếu OCR đọc quá mờ không ra được số
      if (!extractedDate) {
        extractedDate = '4/2026'
      }
    }

    // 2. Upload lên Cloudinary
    showAsyncLoading('Đang tải ảnh lên Cloudinary...', 'Sắp xong rồi...')
    const formData = new FormData()
    formData.append('upload_preset', 'upload_file')
    formData.append('file', file)
    
    const uploadRes = await fetch('https://api.cloudinary.com/v1_1/db6fzs3rh/auto/upload', {
      method: 'POST',
      body: formData
    }).then(r => r.json())
    
    if (!uploadRes.secure_url) {
      throw new Error('Không lấy được link từ Cloudinary')
    }
    const secureUrl = uploadRes.secure_url

    showAsyncLoading('Đang lưu vào Firebase file_gia_off...', 'Sắp xong rồi...')
    
    // 3. Lưu thông tin file vào node file_gia_off trên Firebase (tương đương uploadFileGiaOff_ trong backendOfficial)
    const fileId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'giaoff_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10)
    const timestamp = extractedDate ? extractedDate : new Date().toISOString()

    await set(dbRef(database, `file_gia_off/${fileId}`), {
      id: fileId,
      thoi_gian: timestamp,
      ten_file: extractedName,
      link_file: secureUrl,
      created_at: Date.now()
    })
    
    showAsyncSuccess('Thành công', 'Đã lưu file giá off lên Firebase')
    await fetchLatestGiaOff()
  } catch (err) {
    console.error(err)
    showAsyncError('Lỗi tải file', err.message)
  } finally {
    e.target.value = ''
  }
}

const toNum = (val, def = 0) => {
  if (val === undefined || val === null || val === '') return def
  const n = Number(String(val).replace(/,/g, ''))
  return isNaN(n) ? def : n
}

const inferDefaultSkuCode = (row) => {
  if (!row || typeof row !== 'object') return ''
  const explicit = String(row.sku_code ?? '').trim()
  if (explicit) return explicit

  const ncc = String(row.Ten_nha_cung_cap || row.Ma_nha_cung_cap || '').trim().toUpperCase()
  const dm = String(row.Danh_muc || '').trim().toUpperCase()
  const th = String(row.Ten_hang || '').trim().toUpperCase()
  const mh = String(row.Ma_hang || '').trim()
  const mhUpper = mh.toUpperCase()
  const gc = String(row.Ghi_chu || '').trim()

  // 1. ACRONIS: Ma_hang = "${skuFor} - ${sku}"
  if (ncc.includes('ACRONIS') || dm.includes('ACRONIS') || th.includes('ACRONIS')) {
    const parts = mh.split('-').map(s => s.trim()).filter(Boolean)
    if (parts.length >= 2) return parts[1]
    if (parts.length === 1) return parts[0]
    return ''
  }

  // 2. KASPERSKY: Ma_hang = "${posCode} - ${sku} - ${band}..."
  if (ncc.includes('KASPERSKY') || dm.includes('KASPERSKY') || th.startsWith('KASPERSKY') || /^KL\d{4}/i.test(mhUpper)) {
    const tokens = [
      ...(mh.match(/KL\d{4}[A-Z0-9*]+/gi) || []),
      ...(gc.match(/KL\d{4}[A-Z0-9*]+/gi) || [])
    ].map(s => s.toUpperCase())
    const starSku = tokens.find(t => t.includes('*'))
    return starSku || tokens[0] || ''
  }

  // 3. SOPHOS
  if (ncc.includes('SOPHOS') || dm.includes('SOPHOS') || th.startsWith('SOPHOS')) {
    const noteSku = ((gc.match(/SKU:\s*([A-Z0-9]+)/i) || [])[1] || '').toUpperCase()
    if (noteSku) return noteSku
    if (/^[A-Z0-9]{8,16}$/.test(mhUpper) && /\d/.test(mhUpper)) {
      return mhUpper
    }
  }

  return ''
}

/**
 * Chuẩn hóa danh sách file lịch sử (`danh_sach_file`) của 1 sản phẩm trong `hang_hoa`:
 * - Mốc thời gian `file_uploaded_at` là thời gian lúc upload file đó (độc lập với `last_updated` của hàng hóa)
 * - Lưu kèm `gia_von` (Giá vốn/off hãng), `don_gia` (Đơn giá bán), `gia_nhap` (Giá nhập), `don_vi_tien_te` (bỏ `muc_phan_tram_off`)
 */
const normalizeProductFileHistory = (rawList) => {
  if (!rawList) return []
  const arr = Array.isArray(rawList)
    ? rawList
    : (typeof rawList === 'object' ? Object.values(rawList) : [])
  return arr
    .filter(f => f && typeof f === 'object' && f.file_name)
    .map((f, idx) => ({
      id: String(f.id || `file_${Date.now()}_${idx}`),
      file_name: String(f.file_name || '').trim(),
      file_url: String(f.file_url || '').trim(),
      file_type: String(f.file_type || 'excel_import').trim(),
      file_uploaded_at: String(f.file_uploaded_at || '').trim() || new Date().toISOString(),
      gia_von: toNum(f.gia_von ?? f.Gia_tieu_chuan, 0),
      don_gia: toNum(f.don_gia ?? f.Don_gia, 0),
      gia_nhap: toNum(f.gia_nhap, 0),
      don_vi_tien_te: String(f.don_vi_tien_te || 'VND').trim(),
      ghi_chu_file: String(f.ghi_chu_file || '').trim()
    }))
}

const getProductFileHistory = (item) => {
  if (!item || typeof item !== 'object') return []
  return normalizeProductFileHistory(item.danh_sach_file)
}

const appendFileEntryToProductHistory = (existingList, fileMeta, priceSnapshot = {}) => {
  const history = normalizeProductFileHistory(existingList)
  if (!fileMeta || !fileMeta.file_name) return history

  const cleanName = String(fileMeta.file_name || '').trim()
  const cleanUrl = String(fileMeta.file_url || '').trim()
  const cleanType = String(fileMeta.file_type || 'excel_import').trim()
  const uploadedAt = String(fileMeta.file_uploaded_at || '').trim() || new Date().toISOString()
  const note = String(fileMeta.ghi_chu_file || '').trim()

  const newEntry = {
    id: String(fileMeta.id || `file_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`),
    file_name: cleanName,
    file_url: cleanUrl,
    file_type: cleanType,
    file_uploaded_at: uploadedAt,
    gia_von: toNum(priceSnapshot.gia_von ?? priceSnapshot.Gia_tieu_chuan, 0),
    don_gia: toNum(priceSnapshot.don_gia ?? priceSnapshot.Don_gia, 0),
    gia_nhap: toNum(priceSnapshot.gia_nhap, 0),
    don_vi_tien_te: String(priceSnapshot.don_vi_tien_te || priceSnapshot.Don_vi_tien_te || 'VND').trim(),
    ghi_chu_file: note
  }

  // Nếu cùng 1 đợt upload file (trùng file_name + file_uploaded_at) đã có trong lịch sử -> cập nhật lại dòng đó
  const sameUploadIdx = history.findIndex(
    item => item.file_name === cleanName && item.file_uploaded_at === uploadedAt
  )
  if (sameUploadIdx !== -1) {
    const updated = [...history]
    updated[sameUploadIdx] = {
      ...updated[sameUploadIdx],
      ...newEntry,
      file_url: cleanUrl || updated[sameUploadIdx].file_url
    }
    return updated
  }

  return [newEntry, ...history]
}

const isExcelAttachedFile = (fEntry) => {
  if (!fEntry) return false
  const nameOrUrl = `${fEntry.file_name || ''} ${fEntry.file_url || ''}`.toLowerCase()
  return /\.(xlsx|xlsb|xlsm|xls|doc|docx|ppt|pptx)(\?|$|\s)/i.test(nameOrUrl)
}

const getAttachedFileViewHref = (fEntry) => {
  if (!fEntry || !fEntry.file_url) return '#'
  const url = String(fEntry.file_url).trim()
  if (isExcelAttachedFile(fEntry) && !url.toLowerCase().endsWith('.json')) {
    return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`
  }
  return url
}

const productFilesModal = ref({
  show: false,
  item: null
})
const sessionUploadedFileIds = ref([])

const openProductFilesModal = (item) => {
  if (!item) return
  productFilesModal.value = {
    show: true,
    item
  }
}

const closeProductFilesModal = () => {
  productFilesModal.value.show = false
}

const handleAttachFileToFormData = async (e) => {
  const files = Array.from((e.target && e.target.files) || [])
  if (!files.length) return
  e.target.value = ''

  let currentHistory = getProductFileHistory(formData.value)
  const uploadedNames = []

  for (const file of files) {
    const fileUploadedAt = new Date().toISOString()
    const entryId = `file_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    showAsyncLoading('☁️ Đang đẩy File lên Cloudinary...', `File: ${file.name}`)
    let fileUrl = ''
    try {
      fileUrl = await uploadExcelFileToCloudinarySafe(file)
    } catch (uploadErr) {
      console.warn('Không lấy được link Cloudinary cho file, vẫn lưu tên file & mốc thời gian:', uploadErr)
    }

    currentHistory = appendFileEntryToProductHistory(
      currentHistory,
      {
        id: entryId,
        file_name: file.name,
        file_url: fileUrl,
        file_type: 'manual_upload',
        file_uploaded_at: fileUploadedAt,
        ghi_chu_file: 'Đính kèm trực tiếp trong sản phẩm'
      },
      {
        gia_von: toNum(formData.value.Gia_tieu_chuan, 0),
        don_gia: toNum(formData.value.Don_gia, 0),
        gia_nhap: toNum(formData.value.gia_nhap, 0),
        don_vi_tien_te: formData.value.Don_vi_tien_te || 'VND'
      }
    )
    sessionUploadedFileIds.value.push(entryId)
    uploadedNames.push(file.name)
  }

  formData.value.danh_sach_file = currentHistory

  // Nếu đang sửa sản phẩm đã có trên Firebase -> lưu ngay danh_sach_file vào Firebase để không bao giờ bị mất
  if (isEditing.value) {
    try {
      const fbKey = await findFirebaseKeyByMaHang(formData.value)
      if (fbKey) {
        await update(dbRef(database, `hang_hoa/${fbKey}`), {
          danh_sach_file: currentHistory
        })
        const localItem = items.value.find(x => x._firebaseKey === fbKey || x.Ma_hang === formData.value.Ma_hang)
        if (localItem) {
          localItem.danh_sach_file = currentHistory.map(f => ({ ...f }))
        }
      }
    } catch (persistErr) {
      console.warn('Lưu nhanh danh_sach_file vào Firebase:', persistErr)
    }
  }

  showAsyncSuccess(
    'Đã lưu file vào sản phẩm!',
    `${uploadedNames.join(', ')}${isEditing.value ? ' (Đã đồng bộ lên Firebase)' : ' (Bấm "Lưu lại" để hoàn tất tạo SP)'}`
  )
}

const applyFileHistoryPriceToFormData = (fEntry) => {
  if (!fEntry) return
  formData.value.Gia_tieu_chuan = toNum(fEntry.gia_von, 0)
  formData.value.Don_gia = toNum(fEntry.don_gia, 0)
  if (toNum(fEntry.gia_nhap, 0) > 0) {
    formData.value.gia_nhap = toNum(fEntry.gia_nhap, 0)
  }
  if (fEntry.don_vi_tien_te) {
    formData.value.Don_vi_tien_te = fEntry.don_vi_tien_te
  }
  syncModalCostMarkupFromPrices(formData.value.Gia_tieu_chuan, formData.value.Don_gia)
}

const removeFileEntryFromFormData = async (idx) => {
  const list = getProductFileHistory(formData.value)
  if (idx < 0 || idx >= list.length) return
  const removed = list.splice(idx, 1)[0]
  if (removed?.id) {
    sessionUploadedFileIds.value = sessionUploadedFileIds.value.filter(id => id !== removed.id)
  }
  formData.value.danh_sach_file = [...list]

  if (isEditing.value) {
    try {
      const fbKey = await findFirebaseKeyByMaHang(formData.value)
      if (fbKey) {
        await update(dbRef(database, `hang_hoa/${fbKey}`), {
          danh_sach_file: list
        })
        const localItem = items.value.find(x => x._firebaseKey === fbKey || x.Ma_hang === formData.value.Ma_hang)
        if (localItem) {
          localItem.danh_sach_file = list.map(f => ({ ...f }))
        }
      }
    } catch (err) {
      console.warn('Lỗi cập nhật xóa file trên Firebase:', err)
    }
  }
  showAsyncSuccess('Đã xóa file thành công!', removed?.file_name || '')
}

const handleAttachFileDirectToProduct = async (e, item) => {
  const files = Array.from((e.target && e.target.files) || [])
  if (!files.length || !item) return
  e.target.value = ''

  try {
    const fbKey = await findFirebaseKeyByMaHang(item)
    if (!fbKey) {
      throw new Error('Không tìm thấy sản phẩm trên Firebase')
    }

    let newHistory = getProductFileHistory(item)
    const uploadedNames = []

    for (const file of files) {
      const fileUploadedAt = new Date().toISOString()
      showAsyncLoading('☁️ Đang tải File lên Cloudinary & lưu vào sản phẩm...', `File: ${file.name}`)
      let fileUrl = ''
      try {
        fileUrl = await uploadExcelFileToCloudinarySafe(file)
      } catch (uploadErr) {
        console.warn('Không lấy được link Cloudinary cho file, vẫn lưu tên file & mốc thời gian:', uploadErr)
      }

      newHistory = appendFileEntryToProductHistory(
        newHistory,
        {
          file_name: file.name,
          file_url: fileUrl,
          file_type: 'manual_upload',
          file_uploaded_at: fileUploadedAt,
          ghi_chu_file: 'Đính kèm trực tiếp từ Lịch sử File'
        },
        {
          gia_von: toNum(item.Gia_tieu_chuan, 0),
          don_gia: toNum(item.Don_gia, 0),
          gia_nhap: toNum(item.gia_nhap, 0),
          don_vi_tien_te: item.Don_vi_tien_te || 'VND'
        }
      )
      uploadedNames.push(file.name)
    }

    // Chỉ cập nhật danh_sach_file, giữ nguyên last_updated của hàng hóa!
    await update(dbRef(database, `hang_hoa/${fbKey}`), {
      danh_sach_file: newHistory
    })
    item.danh_sach_file = newHistory
    await fetchData()
    const refreshed = items.value.find(x => x._firebaseKey === fbKey || x.Ma_hang === item.Ma_hang)
    if (refreshed) productFilesModal.value.item = refreshed
    showAsyncSuccess('Đã lưu file vào lịch sử sản phẩm!', `${uploadedNames.join(', ')}`)
  } catch (err) {
    console.error('Lỗi lưu file trực tiếp vào sản phẩm:', err)
    showAsyncError('Lỗi lưu file', err.message || String(err))
  }
}

const removeFileDirectFromProduct = async (item, idx) => {
  if (!item) return
  const list = getProductFileHistory(item)
  if (idx < 0 || idx >= list.length) return
  if (!confirm(`Xóa file "${list[idx].file_name}" khỏi lịch sử của sản phẩm ${item.Ma_hang}?`)) return

  try {
    const fbKey = await findFirebaseKeyByMaHang(item)
    if (!fbKey) return
    const removedFile = list.splice(idx, 1)[0]
    await update(dbRef(database, `hang_hoa/${fbKey}`), {
      danh_sach_file: list
    })
    item.danh_sach_file = list
    await fetchData()
    const refreshed = items.value.find(x => x._firebaseKey === fbKey || x.Ma_hang === item.Ma_hang)
    if (refreshed) productFilesModal.value.item = refreshed
    showAsyncSuccess('Đã xóa file thành công!', removedFile?.file_name || '')
  } catch (err) {
    console.error('Lỗi xóa file khỏi sản phẩm:', err)
    showAsyncError('Lỗi xóa file', err.message || String(err))
  }
}

const lastPurchaseUploadMeta = ref(null)
const imageCheckCurrentFileMeta = ref(null)
const kasCheckCurrentFileMeta = ref(null)

const buildFirebaseHangHoaPayload = (p) => {
  const typeVal = String(p.Type ?? p.TYPE ?? '').trim()
  const offVal = toNum(p.muc_phan_tram_off !== undefined && p.muc_phan_tram_off !== '' ? p.muc_phan_tram_off : p['muc_%_off'], 0)
  const resolvedSkuCode = String(p.sku_code ?? p.SKU ?? p.sku ?? p.ma_sku ?? '').trim()
  return {
    Ma_hang: String(p.Ma_hang || '').trim(),
    sku_code: resolvedSkuCode,
    Ten_hang: String(p.Ten_hang || '').trim(),
    Description: String(p.Description ?? p.description ?? '').trim(),
    Main_img: String(p.Main_img || ''),
    Ma_nha_cung_cap: String(p.Ma_nha_cung_cap || ''),
    Ten_nha_cung_cap: String(p.Ten_nha_cung_cap || ''),
    Mo_ta_chung: String(p.Mo_ta_chung || ''),
    Mo_ta_chi_tiet: String(p.Mo_ta_chi_tiet || ''),
    Features: String(p.Features || ''),
    Danh_muc: String(p.Danh_muc || '').trim().toUpperCase(),
    License_duration: String(p.License_duration || ''),
    DVT: String(p.DVT || ''),
    Gia_tieu_chuan: toNum(p.Gia_tieu_chuan, 0),
    Don_gia: toNum(p.Don_gia, 0),
    Trang_thai: String(p.Trang_thai || ''),
    Don_vi_tien_te: String(p.Don_vi_tien_te || 'VND'),
    Ti_gia: toNum(p.Ti_gia, p.Don_vi_tien_te === 'VND' ? 1 : 0),
    Thue_VAT: toNum(p.Thue_VAT, 0),
    Ma_hang_lien_ket: String(p.Ma_hang_lien_ket || ''),
    Ten_hang_lien_ket: String(p.Ten_hang_lien_ket || ''),
    Ghi_chu: String(p.Ghi_chu || ''),
    gia_hardware: toNum(p.gia_hardware, 0),
    gia_nhap: toNum(p.gia_nhap, 0),
    'muc_%_off': offVal,
    muc_phan_tram_off: offVal,
    TYPE: typeVal,
    Type: typeVal,
    thoi_han_bao_hanh: String(p.thoi_han_bao_hanh || ''),
    volume: String(p.volume || ''),
    danh_sach_file: normalizeProductFileHistory(p.danh_sach_file),
    last_updated: new Date().toISOString()
  }
}

const confirmImport = async () => {
  const isSophosImport = importData.value.some(
    p => String(p.Ten_nha_cung_cap || p.Ma_nha_cung_cap || '').trim().toUpperCase() === 'SOPHOS'
  )
  const isWipingOldSophos = isSophosImport && clearOldSophosBeforeImport.value
  const confirmMsg = isWipingOldSophos
    ? `Bạn chắc chắn muốn XÓA TOÀN BỘ hàng SOPHOS cũ trong Database và lưu mới ${importData.value.length} sản phẩm chuẩn hóa (Ma_hang = SKU) vào Firebase (node hang_hoa) chứ?`
    : `Bạn chắc chắn muốn lưu ${importData.value.length} sản phẩm này vào Firebase (node hang_hoa) chứ?`
  if (!confirm(confirmMsg)) return

  importing.value = true
  showAsyncLoading(
    isWipingOldSophos ? 'Đang chuẩn hóa & lưu dữ liệu SOPHOS lên Firebase...' : 'Đang lưu dữ liệu lên Firebase...',
    `Sẽ lưu ${importData.value.length} sản phẩm`
  )
  try {
    // 1. Chuẩn bị thông tin File Đã Up (tên file, link Cloudinary, và mốc thời gian upload của riêng file đó)
    let cloudRefMsg = ''
    let importSessionFileMeta = null

    if (syncImportFileToCloudinaryRef.value && pendingImportVendorRef.value) {
      const { vendor, file, workbook, uploadedAt } = pendingImportVendorRef.value
      showAsyncLoading(
        '☁️ Đang cập nhật File Đã Up lên Cloudinary...',
        `File: ${file.name} (${vendor.toUpperCase()})`
      )
      try {
        const refRes = pendingImportUploadPromise
          ? (await pendingImportUploadPromise) || (await uploadAndPersistVendorRefWorkbook(vendor, file, workbook, 'import'))
          : await uploadAndPersistVendorRefWorkbook(vendor, file, workbook, 'import')
        if (refRes?.summaryText) {
          cloudRefMsg = ` · ☁️ ${refRes.summaryText}`
        }
        const m = refRes?.meta || {}
        importSessionFileMeta = {
          file_name: file.name,
          file_url: m.import_file_url || m.goc_file_url || m.mau_file_url || m.tg_file_url || '',
          file_type: 'excel_import',
          file_uploaded_at: uploadedAt || new Date().toISOString(),
          ghi_chu_file: `Import Excel ${vendor.toUpperCase()}`
        }
      } catch (cloudErr) {
        console.error('Lỗi cập nhật file tham chiếu lên Cloudinary khi import:', cloudErr)
        cloudRefMsg = ` (⚠️ Lưu ý: Chưa đẩy được file tham chiếu lên Cloudinary: ${cloudErr.message})`
        importSessionFileMeta = {
          file_name: file.name,
          file_url: '',
          file_type: 'excel_import',
          file_uploaded_at: uploadedAt || new Date().toISOString(),
          ghi_chu_file: `Import Excel ${vendor.toUpperCase()}`
        }
      }
      pendingImportVendorRef.value = null
      pendingImportUploadPromise = null
    } else if (lastPurchaseUploadMeta.value) {
      const pMeta = lastPurchaseUploadMeta.value
      let pUrl = ''
      if (pMeta.uploadPromise) {
        try {
          pUrl = (await pMeta.uploadPromise) || ''
        } catch (_) {}
      }
      importSessionFileMeta = {
        file_name: pMeta.file_name,
        file_url: pUrl,
        file_type: 'purchase_quote',
        file_uploaded_at: pMeta.file_uploaded_at || new Date().toISOString(),
        ghi_chu_file: 'Import Mua Hàng (Giá vốn/off hãng)'
      }
      lastPurchaseUploadMeta.value = null
    }

    // 2. Đọc danh sách hiện có trên Firebase để map Ma_hang -> firebaseKey & giữ lại lịch sử danh_sach_file cũ
    const snap = await get(dbRef(database, 'hang_hoa'))
    const existingData = snap.val() || {}
    const existingMap = {}
    const oldSophosKeys = []

    Object.entries(existingData).forEach(([fbKey, row]) => {
      if (row && typeof row === 'object') {
        const ma = String(row.Ma_hang || '').trim()
        const ncc = String(row.Ten_nha_cung_cap || row.Ma_nha_cung_cap || '').trim().toUpperCase()
        const dm = String(row.Danh_muc || '').trim().toUpperCase()
        const isSophosRow = ncc === 'SOPHOS' || dm.startsWith('SOPHOS')
        if (isSophosRow) {
          oldSophosKeys.push({ fbKey, ma })
        }
        if (ma) existingMap[ma] = fbKey
      }
    })

    let deletedOldCount = 0
    const allEntries = []

    // Nếu bật tùy chọn xóa hàng SOPHOS cũ trước khi import bộ mã chuẩn Ma_hang = SKU
    if (isWipingOldSophos && oldSophosKeys.length > 0) {
      const incomingMaSet = new Set(
        importData.value.map(p => String(p.Ma_hang || '').trim()).filter(Boolean)
      )
      oldSophosKeys.forEach(({ fbKey, ma }) => {
        if (!incomingMaSet.has(ma)) {
          allEntries.push([fbKey, null])
          if (ma && existingMap[ma] === fbKey) {
            delete existingMap[ma]
          }
          deletedOldCount++
        }
      })
    }

    let addedCount = 0
    let updatedCount = 0

    importData.value.forEach(p => {
      const payloadObj = buildFirebaseHangHoaPayload(p)
      const maHang = payloadObj.Ma_hang
      const existingFbKey = maHang ? existingMap[maHang] : null
      const existingRow = existingFbKey ? existingData[existingFbKey] : null
      const prevFileHistory = existingRow?.danh_sach_file || p.danh_sach_file || []

      payloadObj.danh_sach_file = importSessionFileMeta
        ? appendFileEntryToProductHistory(prevFileHistory, importSessionFileMeta, {
            gia_von: payloadObj.Gia_tieu_chuan,
            don_gia: payloadObj.Don_gia,
            gia_nhap: payloadObj.gia_nhap,
            don_vi_tien_te: payloadObj.Don_vi_tien_te
          })
        : normalizeProductFileHistory(prevFileHistory)

      if (existingFbKey) {
        allEntries.push([existingFbKey, payloadObj])
        updatedCount++
      } else {
        const newKey = push(dbRef(database, 'hang_hoa')).key
        if (maHang) existingMap[maHang] = newKey
        allEntries.push([newKey, payloadObj])
        addedCount++
      }
    })

    // Ghi theo batch (mỗi batch 400 bản ghi để đảm bảo tốc độ và giới hạn payload của Firebase)
    const CHUNK_SIZE = 400
    for (let i = 0; i < allEntries.length; i += CHUNK_SIZE) {
      const chunk = allEntries.slice(i, i + CHUNK_SIZE)
      const batchUpdates = {}
      chunk.forEach(([key, val]) => {
        batchUpdates[key] = val
      })
      await update(dbRef(database, 'hang_hoa'), batchUpdates)
    }

    showImportModal.value = false
    const summaryText = (deletedOldCount > 0
      ? `Đã xóa ${deletedOldCount} mã cũ, thêm mới ${addedCount}, cập nhật ${updatedCount} sản phẩm SOPHOS (Ma_hang = SKU)`
      : `Thêm mới: ${addedCount}, Cập nhật: ${updatedCount} sản phẩm`) + cloudRefMsg
    showAsyncSuccess('Đã lưu thành công!', summaryText)
    await fetchData()
    await syncAutoUpdatePriceListsInFirebase()
  } catch (err) {
    console.error('Import Firebase error:', err)
    showAsyncError('Lỗi lưu dữ liệu Firebase', err.message)
  } finally {
    importing.value = false
  }
}

const defaultForm = {
  Ma_hang: '',
  sku_code: '',
  Ten_hang: '',
  Description: '',
  Main_img: '',
  Ma_nha_cung_cap: '',
  Ten_nha_cung_cap: '',
  Mo_ta_chung: '',
  Mo_ta_chi_tiet: '',
  Features: '',
  Danh_muc: '',
  License_duration: '',
  DVT: '',
  Gia_tieu_chuan: '',
  Don_gia: '',
  Trang_thai: '',
  Don_vi_tien_te: 'VND',
  Ti_gia: '',
  Thue_VAT: '',
  Ma_hang_lien_ket: '',
  Ten_hang_lien_ket: '',
  Ghi_chu: '',
  gia_hardware: '',
  gia_nhap: '',
  muc_phan_tram_off: '',
  Type: '',
  thoi_han_bao_hanh: '',
  volume: '',
  danh_sach_file: [],
  last_updated: ''
}

const formData = ref({ ...defaultForm })
const isManualMaHangEdited = ref(false)

const cleanMaHangBaseSegment = (val) => {
  return String(val || '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toUpperCase()
    .replace(/\s+/g, '-')
    .replace(/[^A-Z0-9\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const cleanMaHangSkuSegment = (val) => {
  return String(val || '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toUpperCase()
    .replace(/[\s/]+/g, '-')
    .replace(/[^A-Z0-9\-*_]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const buildAutoMaHangWithSku = (danhMuc, tenHang, typeStr, skuCode) => {
  const segs = [
    cleanMaHangBaseSegment(danhMuc),
    cleanMaHangBaseSegment(tenHang),
    cleanMaHangBaseSegment(typeStr)
  ].filter(Boolean)

  let baseId = segs.join('-').replace(/-+/g, '-').replace(/^-+|-+$/g, '')
  const skuSeg = cleanMaHangSkuSegment(skuCode)
  const skuPlain = cleanMaHangBaseSegment(skuCode)

  if (skuSeg) {
    if (!baseId) {
      baseId = skuSeg
    } else {
      const hasToken = (hay, needle) => {
        if (!needle) return false
        return (
          hay === needle ||
          hay.endsWith('-' + needle) ||
          hay.startsWith(needle + '-') ||
          hay.includes('-' + needle + '-')
        )
      }
      if (!hasToken(baseId, skuSeg) && !hasToken(baseId, skuPlain)) {
        baseId = `${baseId}-${skuSeg}`
      }
    }
  }

  return baseId
}

const onFormMaHangManualInput = () => {
  if (isEditing.value) return
  isManualMaHangEdited.value = Boolean(String(formData.value.Ma_hang || '').trim())
}

watch(
  [
    () => formData.value.Danh_muc,
    () => formData.value.Ten_hang,
    () => formData.value.Type,
    () => formData.value.sku_code
  ],
  ([danhMuc, tenHang, type, skuCode]) => {
    if (!isEditing.value && !isManualMaHangEdited.value) {
      formData.value.Ma_hang = buildAutoMaHangWithSku(danhMuc, tenHang, type, skuCode)
    }
  }
)

watch(() => formData.value.Ten_nha_cung_cap, (newVal) => {
  if (newVal) {
    const upper = newVal.toUpperCase()
    if (formData.value.Ten_nha_cung_cap !== upper) {
      formData.value.Ten_nha_cung_cap = upper
    }
  }
  
  if (!isEditing.value) {
    formData.value.Ma_nha_cung_cap = (formData.value.Ten_nha_cung_cap || '').trim()
  }
})

watch(() => formData.value.Don_vi_tien_te, (newVal) => {
  if (!isEditing.value && newVal === 'VND') {
    formData.value.Ti_gia = 1
  } else if (String(newVal || '').trim().toUpperCase() === 'USD' && (!formData.value.Ti_gia || Number(formData.value.Ti_gia) <= 1)) {
    formData.value.Ti_gia = currentSystemUsdRate.value || 26200
  }
})

const normalizeString = (s) => (s || '').toLowerCase().replace(/[^a-z0-9\u00C0-\u024F\u1E00-\u1EFF]/gi, '')

function checkVolumeMatch(volumeStr, userCount) {
  if (!volumeStr) return false;
  const str = volumeStr.toLowerCase();
  
  // 1. Range: A-B or A - B
  const rangeMatch = str.match(/(\d+)\s*-\s*(\d+)/);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10);
    const max = parseInt(rangeMatch[2], 10);
    return userCount >= min && userCount <= max;
  }
  
  // 2. Less than: < 50
  const lessMatch = str.match(/<\s*(\d+)/);
  if (lessMatch) {
    const val = parseInt(lessMatch[1], 10);
    return userCount < val;
  }
  
  // 3. Greater than: > 1000 or 1000+
  const greaterMatch1 = str.match(/>\s*(\d+)/);
  if (greaterMatch1) {
    const val = parseInt(greaterMatch1[1], 10);
    return userCount > val;
  }
  const greaterMatch2 = str.match(/(\d+)\s*\+/);
  if (greaterMatch2) {
    const val = parseInt(greaterMatch2[1], 10);
    return userCount >= val;
  }
  
  return false;
}

const PRODUCT_PAGE_SIZE = 20
const FILTER_DROPDOWN_PAGE_SIZE = 20
const displayLimit = ref(PRODUCT_PAGE_SIZE)

const sortOrder = ref('default') // 'default' | 'newest' | 'oldest'
const selectedBrandFilter = ref('')
const selectedCategoryFilter = ref('')
const selectedSupplierFilter = ref('')

const openDropdownType = ref('') // '' | 'brand' | 'category' | 'supplier'
const brandDropdownSearch = ref('')
const categoryDropdownSearch = ref('')
const supplierDropdownSearch = ref('')
const brandDropdownLimit = ref(FILTER_DROPDOWN_PAGE_SIZE)
const categoryDropdownLimit = ref(FILTER_DROPDOWN_PAGE_SIZE)
const supplierDropdownLimit = ref(FILTER_DROPDOWN_PAGE_SIZE)

const getItemBrand = (item) => {
  if (!item) return 'KHÁC'
  const explicitBrand = String(item.Hang || item.hang || '').trim().toUpperCase()
  if (explicitBrand) return explicitBrand

  const ncc = String(item.Ten_nha_cung_cap || '').trim().toUpperCase()
  const maNcc = String(item.Ma_nha_cung_cap || '').trim().toUpperCase()
  const dm = String(item.Danh_muc || '').trim().toUpperCase()
  const th = String(item.Ten_hang || '').trim().toUpperCase()
  const mh = String(item.Ma_hang || '').trim().toUpperCase()
  const combined = `${ncc} ${maNcc} ${dm} ${th} ${mh}`

  if (combined.includes('SOPHOS') || /\bXGS\s*\d/i.test(combined)) return 'SOPHOS'
  if (combined.includes('KASPERSKY') || /^KL\d{4}/i.test(mh)) return 'KASPERSKY'
  if (combined.includes('ACRONIS')) return 'ACRONIS'
  if (combined.includes('MICROSOFT') || /\b(M365|OFFICE\s*365|WINDOWS\s*SERVER|SQL\s*SERVER|AZURE|EXCHANGE\s*ONLINE|SHAREPOINT)\b/i.test(combined)) return 'MICROSOFT'
  if (combined.includes('FORTINET') || combined.includes('FORTIGATE') || combined.includes('FORTICARE')) return 'FORTINET'
  if (combined.includes('CISCO')) return 'CISCO'
  if (combined.includes('DELL')) return 'DELL'
  if (/\b(HPE|HEWLETT|ARUBA)\b/i.test(combined)) return 'HPE / ARUBA'
  if (/\bHP\b/i.test(combined)) return 'HP'
  if (combined.includes('VMWARE') || combined.includes('VSPHERE')) return 'VMWARE'
  if (combined.includes('VEEAM')) return 'VEEAM'
  if (combined.includes('PALO ALTO')) return 'PALO ALTO'
  if (combined.includes('BITDEFENDER')) return 'BITDEFENDER'
  if (combined.includes('TREND MICRO')) return 'TREND MICRO'
  if (combined.includes('SYNOLOGY')) return 'SYNOLOGY'
  if (combined.includes('CHECK POINT') || combined.includes('CHECKPOINT')) return 'CHECK POINT'
  if (combined.includes('SYMANTEC')) return 'SYMANTEC'

  if (maNcc && !/^(CONG\s*TY|CÔNG\s*TY|CTY|CHI\s*NHANH|CHI\s*NHÁNH)/i.test(maNcc) && maNcc.length <= 28) {
    return maNcc
  }
  if (ncc && !/^(CONG\s*TY|CÔNG\s*TY|CTY|CHI\s*NHANH|CHI\s*NHÁNH)/i.test(ncc) && ncc.length <= 28) {
    return ncc
  }
  return 'KHÁC'
}

const getItemSupplier = (item) => {
  if (!item) return 'CHƯA CÓ NCC'
  const ncc = String(item.Ten_nha_cung_cap || item.Ma_nha_cung_cap || '').trim().toUpperCase()
  return ncc || 'CHƯA CÓ NCC'
}

const getItemCategory = (item) => {
  if (!item) return 'CHƯA PHÂN LOẠI'
  return String(item.Danh_muc || 'CHƯA PHÂN LOẠI').trim().toUpperCase() || 'CHƯA PHÂN LOẠI'
}

const getItemSortTimestamp = (item) => {
  if (!item) return 0
  const rawDate = item.last_updated || item.created_at
  if (rawDate) {
    const t = typeof rawDate === 'number' ? rawDate : new Date(rawDate).getTime()
    if (!isNaN(t) && t > 0) return t
  }
  return 0
}

const compareItemsBySortOrder = (a, b, order) => {
  const timeA = getItemSortTimestamp(a)
  const timeB = getItemSortTimestamp(b)
  if (timeA !== timeB) {
    return order === 'newest' ? timeB - timeA : timeA - timeB
  }
  const idxA = Number(a?._initIndex) || 0
  const idxB = Number(b?._initIndex) || 0
  return order === 'newest' ? idxB - idxA : idxA - idxB
}

const brandFilterOptions = computed(() => {
  const counts = new Map()
  items.value.forEach(item => {
    const b = getItemBrand(item)
    counts.set(b, (counts.get(b) || 0) + 1)
  })
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => {
      if (a.value === 'KHÁC') return 1
      if (b.value === 'KHÁC') return -1
      return b.count - a.count || a.label.localeCompare(b.label)
    })
})

const filteredBrandOptions = computed(() => {
  const kw = normalizeString(brandDropdownSearch.value)
  if (!kw) return brandFilterOptions.value
  return brandFilterOptions.value.filter(opt =>
    opt.label.toLowerCase().includes(brandDropdownSearch.value.trim().toLowerCase()) ||
    normalizeString(opt.label).includes(kw)
  )
})

const displayedBrandOptions = computed(() => {
  return filteredBrandOptions.value.slice(0, brandDropdownLimit.value)
})

const categoryFilterOptions = computed(() => {
  const counts = new Map()
  items.value.forEach(item => {
    if (selectedBrandFilter.value && getItemBrand(item) !== selectedBrandFilter.value) return
    if (selectedSupplierFilter.value && getItemSupplier(item) !== selectedSupplierFilter.value) return
    const c = getItemCategory(item)
    counts.set(c, (counts.get(c) || 0) + 1)
  })
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => {
      if (a.value === 'CHƯA PHÂN LOẠI') return 1
      if (b.value === 'CHƯA PHÂN LOẠI') return -1
      return a.label.localeCompare(b.label)
    })
})

const categoryFilterTotalItems = computed(() => {
  return categoryFilterOptions.value.reduce((sum, opt) => sum + opt.count, 0)
})

const filteredCategoryOptions = computed(() => {
  const kw = normalizeString(categoryDropdownSearch.value)
  if (!kw) return categoryFilterOptions.value
  return categoryFilterOptions.value.filter(opt =>
    opt.label.toLowerCase().includes(categoryDropdownSearch.value.trim().toLowerCase()) ||
    normalizeString(opt.label).includes(kw)
  )
})

const displayedCategoryOptions = computed(() => {
  return filteredCategoryOptions.value.slice(0, categoryDropdownLimit.value)
})

const supplierFilterOptions = computed(() => {
  const counts = new Map()
  items.value.forEach(item => {
    const s = getItemSupplier(item)
    counts.set(s, (counts.get(s) || 0) + 1)
  })
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => {
      if (a.value === 'CHƯA CÓ NCC') return 1
      if (b.value === 'CHƯA CÓ NCC') return -1
      return b.count - a.count || a.label.localeCompare(b.label)
    })
})

const filteredSupplierOptions = computed(() => {
  const kw = normalizeString(supplierDropdownSearch.value)
  if (!kw) return supplierFilterOptions.value
  return supplierFilterOptions.value.filter(opt =>
    opt.label.toLowerCase().includes(supplierDropdownSearch.value.trim().toLowerCase()) ||
    normalizeString(opt.label).includes(kw)
  )
})

const displayedSupplierOptions = computed(() => {
  return filteredSupplierOptions.value.slice(0, supplierDropdownLimit.value)
})

watch(brandDropdownSearch, () => {
  brandDropdownLimit.value = FILTER_DROPDOWN_PAGE_SIZE
})
watch(categoryDropdownSearch, () => {
  categoryDropdownLimit.value = FILTER_DROPDOWN_PAGE_SIZE
})
watch(supplierDropdownSearch, () => {
  supplierDropdownLimit.value = FILTER_DROPDOWN_PAGE_SIZE
})

const toggleFilterDropdown = (type) => {
  if (openDropdownType.value === type) {
    openDropdownType.value = ''
    return
  }
  openDropdownType.value = type
  if (type === 'brand') {
    brandDropdownSearch.value = ''
    brandDropdownLimit.value = FILTER_DROPDOWN_PAGE_SIZE
  } else if (type === 'category') {
    categoryDropdownSearch.value = ''
    categoryDropdownLimit.value = FILTER_DROPDOWN_PAGE_SIZE
  } else if (type === 'supplier') {
    supplierDropdownSearch.value = ''
    supplierDropdownLimit.value = FILTER_DROPDOWN_PAGE_SIZE
  }
}

const selectFilterOption = (type, value) => {
  if (type === 'brand') {
    selectedBrandFilter.value = value
  } else if (type === 'category') {
    selectedCategoryFilter.value = value
  } else if (type === 'supplier') {
    selectedSupplierFilter.value = value
  }
  openDropdownType.value = ''
}

const onFilterDropdownScroll = (e, type) => {
  const el = e.target
  if (!el) return
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
    if (type === 'brand' && brandDropdownLimit.value < filteredBrandOptions.value.length) {
      brandDropdownLimit.value += FILTER_DROPDOWN_PAGE_SIZE
    } else if (type === 'category' && categoryDropdownLimit.value < filteredCategoryOptions.value.length) {
      categoryDropdownLimit.value += FILTER_DROPDOWN_PAGE_SIZE
    } else if (type === 'supplier' && supplierDropdownLimit.value < filteredSupplierOptions.value.length) {
      supplierDropdownLimit.value += FILTER_DROPDOWN_PAGE_SIZE
    }
  }
}

const closeFilterDropdownOnOutsideClick = () => {
  if (openDropdownType.value) {
    openDropdownType.value = ''
  }
}

const toggleSortOrderDirection = () => {
  if (sortOrder.value === 'newest') {
    sortOrder.value = 'oldest'
  } else {
    sortOrder.value = 'newest'
  }
}

const hasActiveSearchOrFilter = computed(() => {
  return Boolean(
    searchQuery.value.trim() ||
    userVolumeFilter.value !== '' ||
    sortOrder.value !== 'default' ||
    selectedBrandFilter.value ||
    selectedCategoryFilter.value ||
    selectedSupplierFilter.value
  )
})

const resetAllSearchAndFilters = () => {
  searchQuery.value = ''
  userVolumeFilter.value = ''
  sortOrder.value = 'default'
  selectedBrandFilter.value = ''
  selectedCategoryFilter.value = ''
  selectedSupplierFilter.value = ''
  openDropdownType.value = ''
  displayLimit.value = PRODUCT_PAGE_SIZE
}

watch([selectedBrandFilter, selectedSupplierFilter], () => {
  if (selectedCategoryFilter.value) {
    const stillExists = categoryFilterOptions.value.some(opt => opt.value === selectedCategoryFilter.value)
    if (!stillExists) {
      selectedCategoryFilter.value = ''
    }
  }
})

const filteredItems = computed(() => {
  const uCount = parseInt(userVolumeFilter.value, 10)
  const hasVolumeFilter = userVolumeFilter.value !== '' && !isNaN(uCount)
  const hasPriceListFilter = Boolean(selectedPriceListId.value && activePriceList.value)
  const hasBrand = Boolean(selectedBrandFilter.value)
  const hasCategory = Boolean(selectedCategoryFilter.value)
  const hasSupplier = Boolean(selectedSupplierFilter.value)
  const words = searchQuery.value ? searchQuery.value.toLowerCase().split(/\s+/).filter(Boolean) : []

  let result = items.value
  if (words.length || hasVolumeFilter || hasPriceListFilter || hasBrand || hasCategory || hasSupplier) {
    result = items.value.filter(item => {
      if (hasPriceListFilter && !getPriceListEntry(item)) {
        return false
      }
      if (hasBrand && getItemBrand(item) !== selectedBrandFilter.value) {
        return false
      }
      if (hasCategory && getItemCategory(item) !== selectedCategoryFilter.value) {
        return false
      }
      if (hasSupplier && getItemSupplier(item) !== selectedSupplierFilter.value) {
        return false
      }

      let okKw = true
      if (words.length > 0) {
        const ma = (item.Ma_hang || '').toLowerCase()
        const sku = (item.sku_code || '').toLowerCase()
        const ten = (item.Ten_hang || '').toLowerCase()
        const desc = (item.Description || '').toLowerCase()
        const dm = (item.Danh_muc || '').toLowerCase()
        const ncc = (item.Ten_nha_cung_cap || '').toLowerCase()

        const maN = normalizeString(ma)
        const skuN = normalizeString(sku)
        const tenN = normalizeString(ten)
        const descN = normalizeString(desc)
        const dmN = normalizeString(dm)
        const nccN = normalizeString(ncc)

        okKw = words.every(w => {
          const wN = normalizeString(w)
          return ma.includes(w) || maN.includes(wN) ||
                 sku.includes(w) || skuN.includes(wN) ||
                 ten.includes(w) || tenN.includes(wN) ||
                 desc.includes(w) || descN.includes(wN) ||
                 dm.includes(w) || dmN.includes(wN) ||
                 ncc.includes(w) || nccN.includes(wN)
        })
      }

      let okVolume = true
      if (hasVolumeFilter) {
        okVolume = checkVolumeMatch(item.volume || '', uCount)
      }

      return okKw && okVolume
    })
  }

  if (sortOrder.value === 'newest' || sortOrder.value === 'oldest') {
    const order = sortOrder.value
    result = [...result].sort((a, b) => compareItemsBySortOrder(a, b, order))
  }

  return result
})

function highlightText(text, query) {
  if (!query || !text) return text;
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return text;
  
  const safeWords = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const regex = new RegExp(`(${safeWords.join('|')})`, 'gi')
  return text.replace(regex, '<span style="background-color: #eab308; color: #0f172a; font-weight: bold; padding: 0 2px; border-radius: 2px;">$1</span>')
}

watch(
  [
    searchQuery,
    userVolumeFilter,
    sortOrder,
    selectedBrandFilter,
    selectedCategoryFilter,
    selectedSupplierFilter
  ],
  () => {
    displayLimit.value = PRODUCT_PAGE_SIZE
    nextTick(() => {
      if (lazyLoadSentinelRef.value) {
        setupLazyLoadObserver(lazyLoadSentinelRef.value)
      }
    })
  }
)

/* ═══════════════════════════════════════════════════════════════════════════
   QUẢN LÝ BẢNG GIÁ (PRICE LIST) — FIREBASE NODE: bang_gia
   ═══════════════════════════════════════════════════════════════════════════ */
const priceLists = ref([])
const selectedPriceListId = ref('')
const showPriceListModal = ref(false)
const isEditingPriceList = ref(false)
const editingPriceListKey = ref('')
const savingPriceList = ref(false)
const confirmDeletePriceListModal = ref({ show: false, priceList: null })

const priceListForm = ref({
  ten_bang_gia: '',
  ghi_chu: '',
  ngay_bat_dau: '',
  ngay_ket_thuc: '',
  auto_sync_base_price: true,
  bulkDirection: 'increase', // 'increase' | 'decrease'
  bulkType: 'percent',       // 'percent' | 'amount'
  bulkValue: 0
})

const formatLastUpdated = (val) => {
  if (!val) return 'Chưa ghi nhận'
  const dt = new Date(val)
  if (isNaN(dt.getTime())) return String(val)
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}

const formatDateVN = (dateStr) => {
  if (!dateStr) return ''
  const parts = String(dateStr).split('T')[0].split('-')
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return String(dateStr)
}

const formatPriceListPeriod = (pl) => {
  if (!pl) return ''
  const s = formatDateVN(pl.ngay_bat_dau)
  const e = formatDateVN(pl.ngay_ket_thuc)
  if (s && e) return `${s} → ${e}`
  if (s) return `Từ ${s}`
  if (e) return `Đến ${e}`
  return 'Không giới hạn'
}

const formatPriceListPeriodInline = (pl) => {
  if (!pl || (!pl.ngay_bat_dau && !pl.ngay_ket_thuc)) return ''
  return ` • [${formatPriceListPeriod(pl)}]`
}

const getPriceListStatusInfo = (pl) => {
  if (!pl) return { label: '', cls: '' }
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const start = String(pl.ngay_bat_dau || '').trim()
  const end = String(pl.ngay_ket_thuc || '').trim()

  if (start && todayStr < start) {
    return { label: '⏳ Chưa đến hạn', cls: 'upcoming' }
  }
  if (end && todayStr > end) {
    return { label: '⚠️ Đã hết hạn', cls: 'expired' }
  }
  return { label: '✅ Đang hiệu lực', cls: 'active' }
}

const priceListRows = ref([])
const modalBrandFilter = ref('ALL')
const modalCategoryFilter = ref('ALL')
const modalSearchQuery = ref('')
const modalViewMode = ref('all') // 'all' | 'selected' | 'unselected'
const modalDisplayLimit = ref(100)

watch([modalBrandFilter, modalCategoryFilter, modalSearchQuery, modalViewMode], () => {
  modalDisplayLimit.value = 100
})

watch(modalBrandFilter, () => {
  modalCategoryFilter.value = 'ALL'
})

const formatNumberPlain = (val) => {
  const n = Number(val)
  if (!Number.isFinite(n) || n === 0) return '0'
  return new Intl.NumberFormat('vi-VN').format(n)
}

const roundByCurrency = (val, currency) => {
  const n = Math.max(0, Number(val) || 0)
  const cur = String(currency || 'VND').trim().toUpperCase()
  if (cur === 'VND') return Math.round(n)
  return Math.round(n * 100) / 100
}

/**
 * Tính lại giá bán mới của 1 dòng trong bảng giá dựa trên giá gốc mới nhất và quy tắc (direction, type, value).
 */
const computeNewPriceFromBase = (basePrice, entry, currency) => {
  const giaGoc = Number(basePrice) || 0
  if (!entry) return giaGoc
  const dir = entry.direction || 'increase'
  const type = entry.type || 'percent'
  const val = Math.max(0, Number(entry.value) || 0)
  let rawNew = giaGoc
  if (type === 'percent') {
    const delta = (giaGoc * val) / 100
    rawNew = dir === 'decrease' ? giaGoc - delta : giaGoc + delta
  } else if (type === 'amount') {
    rawNew = dir === 'decrease' ? giaGoc - val : giaGoc + val
  } else {
    // custom: nếu trước đó có gia_goc > 0 thì giữ tỉ lệ, ngược lại giữ khoảng chênh lệch
    const oldBase = Number(entry.gia_goc) || 0
    const oldPrice = Number(entry.gia_ban_moi) || 0
    if (oldBase > 0) {
      rawNew = giaGoc * (oldPrice / oldBase)
    } else {
      rawNew = giaGoc + (oldPrice - oldBase)
    }
  }
  return roundByCurrency(rawNew, currency || entry.Don_vi_tien_te || 'VND')
}

const activePriceList = computed(() => {
  if (!selectedPriceListId.value) return null
  return priceLists.value.find(pl => pl._firebaseKey === selectedPriceListId.value) || null
})

const activePriceListMap = computed(() => {
  const map = new Map()
  const pl = activePriceList.value
  if (!pl || !Array.isArray(pl.items)) return map

  const autoSync = pl.auto_sync_base_price !== false
  const sysItemMap = new Map()
  if (autoSync) {
    items.value.forEach(it => {
      if (it && it.Ma_hang) {
        sysItemMap.set(String(it.Ma_hang).trim(), it)
      }
    })
  }

  pl.items.forEach(entry => {
    if (entry && entry.Ma_hang) {
      const cleanMa = String(entry.Ma_hang).trim()
      if (autoSync) {
        const sysItem = sysItemMap.get(cleanMa)
        if (sysItem) {
          const latestGiaGoc = Number(sysItem.Don_gia) || 0
          const savedGiaGoc = Number(entry.gia_goc) || 0
          if (latestGiaGoc !== savedGiaGoc) {
            const newGiaBan = computeNewPriceFromBase(
              latestGiaGoc,
              entry,
              sysItem.Don_vi_tien_te || entry.Don_vi_tien_te
            )
            map.set(cleanMa, {
              ...entry,
              gia_goc: latestGiaGoc,
              gia_ban_moi: newGiaBan,
              _auto_synced: true
            })
            return
          }
        }
      }
      map.set(cleanMa, entry)
    }
  })
  return map
})

const getPriceListEntry = (item) => {
  if (!item || !item.Ma_hang) return null
  return activePriceListMap.value.get(String(item.Ma_hang).trim()) || null
}

watch(selectedPriceListId, () => {
  displayLimit.value = PRODUCT_PAGE_SIZE
})

const recalcRowPrice = (row, markManual = false) => {
  if (!row) return
  if (markManual) row._manualRowEdit = true
  const giaGoc = Number(row.gia_goc) || 0
  if (row.type === 'custom') return
  const val = Math.max(0, Number(row.value) || 0)
  let delta = 0
  if (row.type === 'percent') {
    delta = (giaGoc * val) / 100
  } else {
    delta = val
  }
  const rawNew = row.direction === 'decrease' ? giaGoc - delta : giaGoc + delta
  row.gia_ban_moi = roundByCurrency(rawNew, row.Don_vi_tien_te)
}

const onCustomRowPriceChange = (row) => {
  if (!row) return
  row._manualRowEdit = true
  const giaGoc = Number(row.gia_goc) || 0
  const giaMoi = Math.max(0, Number(row.gia_ban_moi) || 0)
  const diff = giaMoi - giaGoc
  row.type = 'custom'
  row.direction = diff < 0 ? 'decrease' : 'increase'
  row.value = Math.abs(diff)
}

const getRowDiffClass = (row) => {
  const diff = (Number(row.gia_ban_moi) || 0) - (Number(row.gia_goc) || 0)
  if (diff > 0) return 'pl-diff-up'
  if (diff < 0) return 'pl-diff-down'
  return 'pl-diff-zero'
}

const formatRowDiffText = (row) => {
  const giaGoc = Number(row.gia_goc) || 0
  const giaMoi = Number(row.gia_ban_moi) || 0
  const diff = giaMoi - giaGoc
  if (diff === 0) return '0 (Giữ nguyên)'
  const sign = diff > 0 ? '+' : '-'
  const absDiff = Math.abs(diff)
  const pct = giaGoc > 0 ? Math.round((absDiff / giaGoc) * 1000) / 10 : 0
  return `${sign}${formatNumberPlain(absDiff)} (${sign}${pct}%)`
}

const getPriceListDiffClass = (plEntry, currentDonGia) => {
  if (!plEntry) return ''
  const base = Number(currentDonGia ?? plEntry.gia_goc) || 0
  const next = Number(plEntry.gia_ban_moi) || 0
  if (next > base) return 'up'
  if (next < base) return 'down'
  return 'neutral'
}

const formatPriceListRuleShort = (plEntry, currentDonGia) => {
  if (!plEntry) return ''
  const base = Number(currentDonGia ?? plEntry.gia_goc) || 0
  const next = Number(plEntry.gia_ban_moi) || 0
  const diff = next - base
  if (plEntry.type === 'percent' && Number(plEntry.value) > 0) {
    return `${plEntry.direction === 'decrease' ? '-' : '+'}${plEntry.value}%`
  }
  if (diff === 0) return 'Giữ nguyên'
  const sign = diff > 0 ? '+' : '-'
  return `${sign}${formatNumberPlain(Math.abs(diff))}`
}

const priceListBrandOptions = computed(() => {
  const set = new Set()
  priceListRows.value.forEach(r => {
    const b = String(r.Ten_nha_cung_cap || '').trim()
    if (b) set.add(b)
  })
  return Array.from(set).sort((a, b) => a.localeCompare(b))
})

const priceListCategoryOptions = computed(() => {
  const set = new Set()
  priceListRows.value.forEach(r => {
    if (modalBrandFilter.value !== 'ALL' && r.Ten_nha_cung_cap !== modalBrandFilter.value) return
    const c = String(r.Danh_muc || '').trim()
    if (c) set.add(c)
  })
  return Array.from(set).sort((a, b) => a.localeCompare(b))
})

const selectedPriceListCount = computed(() => {
  return priceListRows.value.filter(r => r.selected).length
})

const filteredModalProducts = computed(() => {
  const kw = modalSearchQuery.value.trim().toLowerCase()
  const words = kw ? kw.split(/\s+/).filter(Boolean) : []

  return priceListRows.value.filter(r => {
    if (modalViewMode.value === 'selected' && !r.selected) return false
    if (modalViewMode.value === 'unselected' && r.selected) return false
    if (modalBrandFilter.value !== 'ALL' && r.Ten_nha_cung_cap !== modalBrandFilter.value) return false
    if (modalCategoryFilter.value !== 'ALL' && r.Danh_muc !== modalCategoryFilter.value) return false

    if (words.length > 0) {
      const ma = String(r.Ma_hang || '').toLowerCase()
      const ten = String(r.Ten_hang || '').toLowerCase()
      const cat = String(r.Danh_muc || '').toLowerCase()
      const ok = words.every(w => ma.includes(w) || ten.includes(w) || cat.includes(w))
      if (!ok) return false
    }
    return true
  })
})

const displayedModalProducts = computed(() => {
  return filteredModalProducts.value.slice(0, modalDisplayLimit.value)
})

const isAllFilteredSelected = computed(() => {
  if (!filteredModalProducts.value.length) return false
  return filteredModalProducts.value.every(r => r.selected)
})

const toggleAllFilteredInModal = (checked) => {
  filteredModalProducts.value.forEach(r => {
    r.selected = Boolean(checked)
  })
}

const selectAllFilteredInModal = () => {
  filteredModalProducts.value.forEach(r => {
    r.selected = true
  })
}

const deselectAllFilteredInModal = () => {
  filteredModalProducts.value.forEach(r => {
    r.selected = false
  })
}

const onBulkRuleAutoApply = () => {
  const dir = priceListForm.value.bulkDirection || 'increase'
  const type = priceListForm.value.bulkType || 'percent'
  const val = Math.max(0, Number(priceListForm.value.bulkValue) || 0)

  const hasFilter = modalBrandFilter.value !== 'ALL' || modalCategoryFilter.value !== 'ALL' || Boolean(modalSearchQuery.value.trim())
  const targetRows = hasFilter ? filteredModalProducts.value : priceListRows.value

  targetRows.forEach(r => {
    if (r.selected && !r._manualRowEdit) {
      r.direction = dir
      r.type = type
      r.value = val
      recalcRowPrice(r, false)
    }
  })
}

const applyBulkRuleToSelected = () => {
  const dir = priceListForm.value.bulkDirection || 'increase'
  const type = priceListForm.value.bulkType || 'percent'
  const val = Math.max(0, Number(priceListForm.value.bulkValue) || 0)

  let count = 0
  priceListRows.value.forEach(r => {
    if (r.selected) {
      r._manualRowEdit = false
      r.direction = dir
      r.type = type
      r.value = val
      recalcRowPrice(r, false)
      count++
    }
  })

  if (count === 0) {
    showAsyncError('Chưa chọn sản phẩm', 'Vui lòng tích chọn ít nhất 1 sản phẩm hoặc bấm "Chọn & Áp dụng SP đang lọc".')
  }
}

const applyBulkRuleToFiltered = () => {
  const dir = priceListForm.value.bulkDirection || 'increase'
  const type = priceListForm.value.bulkType || 'percent'
  const val = Math.max(0, Number(priceListForm.value.bulkValue) || 0)

  filteredModalProducts.value.forEach(r => {
    r.selected = true
    r._manualRowEdit = false
    r.direction = dir
    r.type = type
    r.value = val
    recalcRowPrice(r, false)
  })
}

const buildPriceListRowsFromItems = (existingEntryMap = null, defaultRule = null, autoSyncBasePrice = true) => {
  const dir = defaultRule?.direction || 'increase'
  const type = defaultRule?.type || 'percent'
  const val = Number(defaultRule?.value) || 0

  return items.value.map(item => {
    const cleanMa = String(item.Ma_hang || '').trim()
    const saved = existingEntryMap ? existingEntryMap.get(cleanMa) : null
    const latestGiaGoc = Number(item.Don_gia) || 0
    const savedGiaGoc = saved && saved.gia_goc !== undefined ? Number(saved.gia_goc) : latestGiaGoc
    const effectiveGiaGoc = (saved && !autoSyncBasePrice) ? savedGiaGoc : latestGiaGoc

    let effectiveGiaBanMoi = effectiveGiaGoc
    if (saved && saved.gia_ban_moi !== undefined) {
      if (autoSyncBasePrice && latestGiaGoc !== savedGiaGoc) {
        effectiveGiaBanMoi = computeNewPriceFromBase(latestGiaGoc, saved, item.Don_vi_tien_te)
      } else {
        effectiveGiaBanMoi = Number(saved.gia_ban_moi)
      }
    }

    const row = {
      selected: existingEntryMap ? Boolean(saved) : true,
      _manualRowEdit: false,
      Ma_hang: cleanMa,
      Ten_hang: item.Ten_hang,
      Ten_nha_cung_cap: item.Ten_nha_cung_cap,
      Danh_muc: item.Danh_muc,
      Don_vi_tien_te: item.Don_vi_tien_te || 'VND',
      DVT: item.DVT || '',
      Ti_gia: Number(item.Ti_gia) || 1,
      Thue_VAT: Number(item.Thue_VAT) || 0,
      gia_nhap: Number(item.gia_nhap) || 0,
      gia_goc: effectiveGiaGoc,
      _latest_sys_gia_goc: latestGiaGoc,
      _saved_gia_goc: savedGiaGoc,
      _saved_gia_ban_moi: saved && saved.gia_ban_moi !== undefined ? Number(saved.gia_ban_moi) : latestGiaGoc,
      last_updated: item.last_updated || '',
      direction: saved ? (saved.direction || dir) : dir,
      type: saved ? (saved.type || type) : type,
      value: saved ? (Number(saved.value) || 0) : val,
      gia_ban_moi: effectiveGiaBanMoi
    }
    if (!saved) {
      recalcRowPrice(row, false)
    }
    return row
  })
}

const onModalAutoSyncChange = () => {
  const autoSync = Boolean(priceListForm.value.auto_sync_base_price)
  priceListRows.value.forEach(r => {
    if (autoSync) {
      const latestBase = Number(r._latest_sys_gia_goc ?? r.gia_goc) || 0
      if (r.gia_goc !== latestBase) {
        const nextPrice = computeNewPriceFromBase(latestBase, r, r.Don_vi_tien_te)
        r.gia_goc = latestBase
        r.gia_ban_moi = nextPrice
      }
    } else if (isEditingPriceList.value && r._saved_gia_goc !== undefined) {
      r.gia_goc = Number(r._saved_gia_goc) || 0
      r.gia_ban_moi = Number(r._saved_gia_ban_moi) || 0
    }
  })
}

const openCreatePriceListModal = async () => {
  if (!items.value.length) {
    await fetchData()
  }
  isEditingPriceList.value = false
  editingPriceListKey.value = ''
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  priceListForm.value = {
    ten_bang_gia: '',
    ghi_chu: '',
    ngay_bat_dau: todayStr,
    ngay_ket_thuc: '',
    auto_sync_base_price: true,
    bulkDirection: 'increase',
    bulkType: 'percent',
    bulkValue: 0
  }
  modalBrandFilter.value = 'ALL'
  modalCategoryFilter.value = 'ALL'
  modalSearchQuery.value = ''
  modalViewMode.value = 'all'
  priceListRows.value = buildPriceListRowsFromItems(null, null, true)
  showPriceListModal.value = true
}

const openEditPriceListModal = async (pl) => {
  if (!pl) return
  if (!items.value.length) {
    await fetchData()
  }
  isEditingPriceList.value = true
  editingPriceListKey.value = pl._firebaseKey
  const rule = pl.default_rule || {}
  const autoSync = pl.auto_sync_base_price !== false
  priceListForm.value = {
    ten_bang_gia: pl.ten_bang_gia || '',
    ghi_chu: pl.ghi_chu || '',
    ngay_bat_dau: pl.ngay_bat_dau || '',
    ngay_ket_thuc: pl.ngay_ket_thuc || '',
    auto_sync_base_price: autoSync,
    bulkDirection: rule.direction || 'increase',
    bulkType: rule.type || 'percent',
    bulkValue: Number(rule.value) || 0
  }
  modalBrandFilter.value = 'ALL'
  modalCategoryFilter.value = 'ALL'
  modalSearchQuery.value = ''
  modalViewMode.value = 'selected'

  const existingMap = new Map()
  if (Array.isArray(pl.items)) {
    pl.items.forEach(entry => {
      if (entry && entry.Ma_hang) existingMap.set(String(entry.Ma_hang).trim(), entry)
    })
  }
  priceListRows.value = buildPriceListRowsFromItems(existingMap, rule, autoSync)
  showPriceListModal.value = true
}

const fetchPriceLists = async () => {
  try {
    const snap = await get(dbRef(database, 'bang_gia'))
    const data = snap.val() || {}
    const list = Object.entries(data)
      .map(([fbKey, row]) => {
        if (!row || typeof row !== 'object') return null
        const rawItems = Array.isArray(row.items)
          ? row.items
          : (row.items && typeof row.items === 'object' ? Object.values(row.items) : [])
        return {
          _firebaseKey: fbKey,
          id: row.id || fbKey,
          ten_bang_gia: String(row.ten_bang_gia || 'Bảng giá chưa đặt tên'),
          ghi_chu: String(row.ghi_chu || ''),
          ngay_bat_dau: String(row.ngay_bat_dau || ''),
          ngay_ket_thuc: String(row.ngay_ket_thuc || ''),
          auto_sync_base_price: row.auto_sync_base_price !== false,
          created_at: Number(row.created_at) || 0,
          updated_at: Number(row.updated_at) || 0,
          default_rule: row.default_rule || { direction: 'increase', type: 'percent', value: 0 },
          items: rawItems.filter(Boolean)
        }
      })
      .filter(Boolean)

    list.sort((a, b) => (b.updated_at || b.created_at) - (a.updated_at || a.created_at))
    priceLists.value = list
  } catch (err) {
    console.error('Lỗi khi tải danh sách bảng giá từ Firebase:', err)
  }
}

/**
 * Bật / Tắt nhanh chế độ "Tự động cập nhật khi bảng giá gốc thay đổi" ngay trên thanh chọn bảng giá.
 */
const togglePriceListAutoSync = async (pl) => {
  if (!pl || !pl._firebaseKey) return
  const nextState = !(pl.auto_sync_base_price !== false)
  try {
    const updates = {
      auto_sync_base_price: nextState,
      updated_at: Date.now()
    }
    if (nextState && Array.isArray(pl.items) && items.value.length > 0) {
      const sysMap = new Map()
      items.value.forEach(it => {
        if (it && it.Ma_hang) sysMap.set(String(it.Ma_hang).trim(), it)
      })
      updates.items = pl.items.map(entry => {
        if (!entry || !entry.Ma_hang) return entry
        const sysItem = sysMap.get(String(entry.Ma_hang).trim())
        if (!sysItem) return entry
        const latestGiaGoc = Number(sysItem.Don_gia) || 0
        const newGiaBan = computeNewPriceFromBase(latestGiaGoc, entry, sysItem.Don_vi_tien_te || entry.Don_vi_tien_te)
        return {
          ...entry,
          gia_goc: latestGiaGoc,
          gia_ban_moi: newGiaBan
        }
      })
    }
    await update(dbRef(database, `bang_gia/${pl._firebaseKey}`), updates)
    await fetchPriceLists()
    showAsyncSuccess(
      nextState ? '🔄 Đã BẬT tự động cập nhật theo giá gốc!' : '🔒 Đã TẮT tự động cập nhật (Giữ giá cố định)!',
      `Bảng giá "${pl.ten_bang_gia}" ${nextState ? 'sẽ tự động tính lại giá bán khi giá gốc thay đổi.' : 'sẽ giữ cố định mức giá bán hiện tại.'}`
    )
  } catch (err) {
    console.error('Toggle auto sync error:', err)
    showAsyncError('Lỗi cập nhật chế độ tự động', err.message)
  }
}

/**
 * Tự động đồng bộ các bảng giá có bật auto_sync_base_price trên Firebase mỗi khi hang_hoa thay đổi.
 */
const syncAutoUpdatePriceListsInFirebase = async () => {
  try {
    if (!items.value.length) return
    const sysMap = new Map()
    items.value.forEach(it => {
      if (it && it.Ma_hang) sysMap.set(String(it.Ma_hang).trim(), it)
    })

    const snap = await get(dbRef(database, 'bang_gia'))
    const data = snap.val() || {}
    const batchUpdates = {}
    let syncedListCount = 0

    Object.entries(data).forEach(([fbKey, pl]) => {
      if (!pl || typeof pl !== 'object') return
      if (pl.auto_sync_base_price === false) return

      const rawItems = Array.isArray(pl.items)
        ? pl.items
        : (pl.items && typeof pl.items === 'object' ? Object.values(pl.items) : [])
      if (!rawItems.length) return

      let hasChanged = false
      const updatedItems = rawItems.filter(Boolean).map(entry => {
        const cleanMa = String(entry.Ma_hang || '').trim()
        const sysItem = sysMap.get(cleanMa)
        if (!sysItem) return entry

        const latestGiaGoc = Number(sysItem.Don_gia) || 0
        const savedGiaGoc = Number(entry.gia_goc) || 0
        const nextGiaBan = computeNewPriceFromBase(latestGiaGoc, entry, sysItem.Don_vi_tien_te || entry.Don_vi_tien_te)

        if (latestGiaGoc !== savedGiaGoc || nextGiaBan !== Number(entry.gia_ban_moi)) {
          hasChanged = true
          return {
            ...entry,
            Ma_hang: cleanMa,
            Ten_hang: String(sysItem.Ten_hang || entry.Ten_hang || ''),
            Don_vi_tien_te: String(sysItem.Don_vi_tien_te || entry.Don_vi_tien_te || 'VND'),
            DVT: String(sysItem.DVT || entry.DVT || ''),
            gia_goc: latestGiaGoc,
            gia_ban_moi: nextGiaBan
          }
        }
        return entry
      })

      if (hasChanged) {
        batchUpdates[`${fbKey}/items`] = updatedItems
        batchUpdates[`${fbKey}/updated_at`] = Date.now()
        syncedListCount++
      }
    })

    if (syncedListCount > 0) {
      await update(dbRef(database, 'bang_gia'), batchUpdates)
      await fetchPriceLists()
    }
  } catch (err) {
    console.error('Lỗi khi tự động đồng bộ bảng giá theo giá gốc:', err)
  }
}

const savePriceList = async () => {
  const name = String(priceListForm.value.ten_bang_gia || '').trim()
  if (!name) {
    showAsyncError('Thiếu tên bảng giá', 'Vui lòng nhập Tên bảng giá trước khi lưu.')
    return
  }

  const startDate = String(priceListForm.value.ngay_bat_dau || '').trim()
  const endDate = String(priceListForm.value.ngay_ket_thuc || '').trim()
  if (startDate && endDate && endDate < startDate) {
    showAsyncError('Thời hạn không hợp lệ', 'Thời gian kết thúc phải lớn hơn hoặc bằng thời gian bắt đầu áp dụng.')
    return
  }

  const selectedRows = priceListRows.value.filter(r => r.selected)
  if (!selectedRows.length) {
    showAsyncError('Chưa chọn sản phẩm', 'Vui lòng chọn ít nhất 1 sản phẩm cho bảng giá.')
    return
  }

  savingPriceList.value = true
  try {
    const now = Date.now()
    const payload = {
      ten_bang_gia: name,
      ghi_chu: String(priceListForm.value.ghi_chu || '').trim(),
      ngay_bat_dau: startDate,
      ngay_ket_thuc: endDate,
      auto_sync_base_price: Boolean(priceListForm.value.auto_sync_base_price),
      updated_at: now,
      default_rule: {
        direction: priceListForm.value.bulkDirection || 'increase',
        type: priceListForm.value.bulkType || 'percent',
        value: Number(priceListForm.value.bulkValue) || 0
      },
      items: selectedRows.map(r => ({
        Ma_hang: String(r.Ma_hang || ''),
        Ten_hang: String(r.Ten_hang || ''),
        Ten_nha_cung_cap: String(r.Ten_nha_cung_cap || ''),
        Danh_muc: String(r.Danh_muc || ''),
        Don_vi_tien_te: String(r.Don_vi_tien_te || 'VND'),
        DVT: String(r.DVT || ''),
        gia_goc: Number(r.gia_goc) || 0,
        direction: r.direction || 'increase',
        type: r.type || 'percent',
        value: Number(r.value) || 0,
        gia_ban_moi: Number(r.gia_ban_moi) || 0
      }))
    }

    let targetKey = editingPriceListKey.value
    if (isEditingPriceList.value && targetKey) {
      await update(dbRef(database, `bang_gia/${targetKey}`), payload)
      showAsyncSuccess('Đã cập nhật bảng giá!', `${name} (${selectedRows.length} sản phẩm)`)
    } else {
      const newRef = push(dbRef(database, 'bang_gia'))
      targetKey = newRef.key
      await set(newRef, { ...payload, id: targetKey, created_at: now })
      showAsyncSuccess('Đã tạo bảng giá mới!', `${name} (${selectedRows.length} sản phẩm)`)
    }

    await fetchPriceLists()
    if (targetKey) {
      selectedPriceListId.value = targetKey
    }
    showPriceListModal.value = false
  } catch (err) {
    console.error('Save price list error:', err)
    showAsyncError('Lỗi lưu bảng giá', err.message)
  } finally {
    savingPriceList.value = false
  }
}

const requestDeletePriceList = (pl) => {
  if (!pl) return
  confirmDeletePriceListModal.value = { show: true, priceList: pl }
}

const executeDeletePriceList = async () => {
  const pl = confirmDeletePriceListModal.value.priceList
  if (!pl || !pl._firebaseKey) return
  confirmDeletePriceListModal.value.show = false

  showAsyncLoading('Đang xóa bảng giá...', pl.ten_bang_gia)
  try {
    await remove(dbRef(database, `bang_gia/${pl._firebaseKey}`))
    if (selectedPriceListId.value === pl._firebaseKey) {
      selectedPriceListId.value = ''
    }
    await fetchPriceLists()
    showAsyncSuccess('Đã xóa bảng giá!', pl.ten_bang_gia)
  } catch (err) {
    console.error('Delete price list error:', err)
    showAsyncError('Lỗi xóa bảng giá', err.message)
  }
}

const buildAndDownloadPriceListExcel = (title, note, rows, startDate = '', endDate = '') => {
  if (!rows || !rows.length) {
    showAsyncError('Không có dữ liệu', 'Bảng giá chưa có sản phẩm nào để xuất Excel.')
    return
  }

  const periodStr = formatPriceListPeriod({ ngay_bat_dau: startDate, ngay_ket_thuc: endDate })
  const wsData = [
    [title.toUpperCase()],
    [`Thời gian áp dụng: ${periodStr}`],
    [note ? `Ghi chú: ${note}` : `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`],
    [],
    ['STT', 'Mã hàng', 'Tên hàng hóa', 'Hãng', 'Danh mục', 'ĐVT', 'Tiền tệ', 'Giá bán gốc', 'Mức điều chỉnh', 'Giá bán mới (Bảng giá)']
  ]

  rows.forEach((r, i) => {
    const giaGoc = Number(r.gia_goc) || 0
    const giaMoi = Number(r.gia_ban_moi) || 0
    const diff = giaMoi - giaGoc
    let ruleStr = 'Giữ nguyên'
    if (r.type === 'percent' && Number(r.value) > 0) {
      ruleStr = `${r.direction === 'decrease' ? 'Giảm' : 'Tăng'} ${r.value}%`
    } else if (diff !== 0) {
      ruleStr = `${diff > 0 ? '+' : '-'}${formatNumberPlain(Math.abs(diff))}`
    }

    wsData.push([
      i + 1,
      r.Ma_hang || '',
      r.Ten_hang || '',
      r.Ten_nha_cung_cap || '',
      r.Danh_muc || '',
      r.DVT || '',
      r.Don_vi_tien_te || 'VND',
      giaGoc,
      ruleStr,
      giaMoi
    ])
  })

  const ws = XLSX.utils.aoa_to_sheet(wsData)
  ws['!cols'] = [
    { wch: 6 },
    { wch: 24 },
    { wch: 46 },
    { wch: 14 },
    { wch: 28 },
    { wch: 10 },
    { wch: 10 },
    { wch: 16 },
    { wch: 18 },
    { wch: 20 }
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Bang_Gia')
  const safeFile = String(title || 'Bang_gia')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
  XLSX.writeFile(wb, `${safeFile}.xlsx`)
}

const exportPriceListToExcel = (pl) => {
  if (!pl) return
  buildAndDownloadPriceListExcel(pl.ten_bang_gia, pl.ghi_chu, pl.items || [], pl.ngay_bat_dau, pl.ngay_ket_thuc)
}

const exportDraftPriceListToExcel = () => {
  const selected = priceListRows.value.filter(r => r.selected)
  const title = priceListForm.value.ten_bang_gia || 'Bang_Gia_Moi'
  buildAndDownloadPriceListExcel(title, priceListForm.value.ghi_chu, selected, priceListForm.value.ngay_bat_dau, priceListForm.value.ngay_ket_thuc)
}

const allGroupedItems = computed(() => {
  const groups = {}
  filteredItems.value.forEach(item => {
    const cat = item.Danh_muc || 'CHƯA PHÂN LOẠI'
    if (!groups[cat]) {
      groups[cat] = []
    }
    groups[cat].push(item)
  })

  const sortedKeys = Object.keys(groups)
  if (sortOrder.value === 'default') {
    // Preserve original spreadsheet order, but move "CHƯA PHÂN LOẠI" to the end
    const idx = sortedKeys.indexOf('CHƯA PHÂN LOẠI')
    if (idx > -1) {
      sortedKeys.splice(idx, 1)
      sortedKeys.push('CHƯA PHÂN LOẠI')
    }
  }

  const sortedGroups = {}
  sortedKeys.forEach(k => {
    sortedGroups[k] = groups[k]
  })
  return sortedGroups
})

const categoryTotalCounts = computed(() => {
  const counts = {}
  for (const [cat, list] of Object.entries(allGroupedItems.value)) {
    counts[cat] = list.length
  }
  return counts
})

const totalProductsCount = computed(() => filteredItems.value.length)

const totalGroupsCount = computed(() => Object.keys(allGroupedItems.value).length)

const groupedItems = computed(() => {
  const sortedGroups = {}
  let remaining = displayLimit.value
  for (const [cat, list] of Object.entries(allGroupedItems.value)) {
    if (remaining <= 0) break
    const slice = list.slice(0, remaining)
    if (slice.length > 0) {
      sortedGroups[cat] = slice
      remaining -= slice.length
    }
  }
  return sortedGroups
})

const displayedProductsCount = computed(() => {
  return Math.min(displayLimit.value, totalProductsCount.value)
})

const hasMoreProducts = computed(() => {
  return displayLimit.value < totalProductsCount.value
})

const loadMoreProducts = () => {
  if (displayLimit.value < totalProductsCount.value) {
    displayLimit.value = Math.min(totalProductsCount.value, displayLimit.value + PRODUCT_PAGE_SIZE)
  }
}

const lazyLoadSentinelRef = ref(null)
let lazyLoadObserver = null

const setupLazyLoadObserver = (el) => {
  if (lazyLoadObserver) {
    lazyLoadObserver.disconnect()
    lazyLoadObserver = null
  }
  if (!el || typeof IntersectionObserver === 'undefined') return
  lazyLoadObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry && entry.isIntersecting && hasMoreProducts.value && !loading.value) {
        loadMoreProducts()
      }
    },
    { root: null, rootMargin: '280px 0px', threshold: 0.05 }
  )
  lazyLoadObserver.observe(el)
}

watch(lazyLoadSentinelRef, (newEl) => {
  setupLazyLoadObserver(newEl)
})

const formatCurrency = (val, currency) => {
  if (!val) return '0'
  return new Intl.NumberFormat('vi-VN').format(val) + ' ' + (currency || 'VND')
}

const fetchData = async () => {
  loading.value = true
  try {
    const snap = await get(dbRef(database, 'hang_hoa'))
    const data = snap.val() || {}
    const mapped = []
    Object.entries(data).forEach(([firebaseKey, row], idx) => {
      if (!row || typeof row !== 'object') return
      mapped.push({
        _firebaseKey: firebaseKey,
        _initIndex: idx,
        Ma_hang: String(row.Ma_hang ?? '').trim(),
        sku_code: String(row.sku_code ?? row.SKU ?? row.sku ?? row.ma_sku ?? '').trim(),
        Ten_hang: String(row.Ten_hang ?? ''),
        Description: String(row.Description ?? row.description ?? ''),
        Main_img: String(row.Main_img ?? ''),
        Ma_nha_cung_cap: String(row.Ma_nha_cung_cap ?? ''),
        Ten_nha_cung_cap: String(row.Ten_nha_cung_cap ?? ''),
        Mo_ta_chung: String(row.Mo_ta_chung ?? ''),
        Mo_ta_chi_tiet: String(row.Mo_ta_chi_tiet ?? ''),
        Features: String(row.Features ?? ''),
        Danh_muc: String(row.Danh_muc ?? '').toUpperCase(),
        License_duration: String(row.License_duration ?? ''),
        DVT: String(row.DVT ?? ''),
        Gia_tieu_chuan: row.Gia_tieu_chuan !== undefined && row.Gia_tieu_chuan !== '' ? Number(row.Gia_tieu_chuan) : 0,
        Don_gia: row.Don_gia !== undefined && row.Don_gia !== '' ? Number(row.Don_gia) : 0,
        Trang_thai: String(row.Trang_thai ?? ''),
        Don_vi_tien_te: String(row.Don_vi_tien_te || 'VND'),
        Ti_gia: row.Ti_gia !== undefined && row.Ti_gia !== '' ? Number(row.Ti_gia) : 1,
        Thue_VAT: row.Thue_VAT !== undefined && row.Thue_VAT !== '' ? Number(row.Thue_VAT) : 0,
        Ma_hang_lien_ket: String(row.Ma_hang_lien_ket ?? ''),
        Ten_hang_lien_ket: String(row.Ten_hang_lien_ket ?? ''),
        Ghi_chu: String(row.Ghi_chu ?? ''),
        gia_hardware: row.gia_hardware !== undefined && row.gia_hardware !== '' ? Number(row.gia_hardware) : 0,
        gia_nhap: row.gia_nhap !== undefined && row.gia_nhap !== '' ? Number(row.gia_nhap) : 0,
        muc_phan_tram_off: row.muc_phan_tram_off !== undefined && row.muc_phan_tram_off !== ''
          ? Number(row.muc_phan_tram_off)
          : (row['muc_%_off'] !== undefined && row['muc_%_off'] !== '' ? Number(row['muc_%_off']) : 0),
        Type: String(row.Type ?? row.TYPE ?? '').trim(),
        thoi_han_bao_hanh: String(row.thoi_han_bao_hanh ?? ''),
        volume: String(row.volume ?? ''),
        danh_sach_file: normalizeProductFileHistory(row.danh_sach_file),
        last_updated: String(row.last_updated ?? ''),
        created_at: row.created_at ?? ''
      })
    })
    items.value = mapped
  } catch (err) {
    console.error('Error fetching hang_hoa from Firebase:', err)
  } finally {
    loading.value = false
  }
}

const getGiaOffSortKey = (item) => {
  if (!item || typeof item !== 'object') return 0
  if (item.created_at) return Number(item.created_at) || 0
  // Trích xuất unix timestamp từ link Cloudinary (VD: .../upload/v1780902297/...)
  const link = String(item.link_file || '')
  const m = link.match(/\/v(\d+)\//)
  if (m) return Number(m[1]) * 1000
  if (typeof item.thoi_gian === 'number') return item.thoi_gian
  return 0
}

const fetchLatestGiaOff = async () => {
  try {
    const snap = await get(dbRef(database, 'file_gia_off'))
    const data = snap.val() || {}
    const list = Object.entries(data)
      .map(([fbKey, row]) => {
        if (!row || typeof row !== 'object') return null
        return {
          _firebaseKey: fbKey,
          id: row.id || fbKey,
          thoi_gian: row.thoi_gian ?? '',
          ten_file: row.ten_file ?? '',
          link_file: row.link_file ?? '',
          created_at: row.created_at ?? 0
        }
      })
      .filter(Boolean)

    if (list.length > 0) {
      list.sort((a, b) => getGiaOffSortKey(a) - getGiaOffSortKey(b))
      latestFileGiaOff.value = list[list.length - 1]
    }
  } catch (err) {
    console.error('Lỗi khi fetch file_gia_off từ Firebase:', err)
  }
}

const formatGiaOffDate = (d) => {
  if (!d) return ''
  if (typeof d === 'number' && d > 25000 && d < 80000) {
    const dt = new Date(Math.round((d - 25569) * 86400 * 1000))
    return `${dt.getUTCMonth() + 1}/${dt.getUTCFullYear()}`
  }
  if (typeof d === 'string' && d.includes('T')) {
    const dt = new Date(d)
    if (!isNaN(dt.getTime())) {
      return `${dt.getMonth() + 1}/${dt.getFullYear()}`
    }
  }
  return d
}

const modalCostMarkup = ref({
  direction: 'increase',
  type: 'percent',
  value: 0
})

const importBulkCostMarkup = ref({
  direction: 'increase',
  type: 'percent',
  value: 0
})

const lastPurchaseUploadFile = ref(null)
const aiPurchaseFallbackModal = ref({
  show: false,
  file: null,
  fileName: ''
})

const formatCardMarkupBadge = (item) => {
  const giaVon = toNum(item?.Gia_tieu_chuan, 0)
  const giaBan = toNum(item?.Don_gia, 0)
  if (giaVon <= 0 || giaBan <= 0 || giaBan === giaVon) return ''
  const diff = giaBan - giaVon
  const sign = diff > 0 ? '+' : '-'
  const pct = Math.round((Math.abs(diff) / giaVon) * 1000) / 10
  return `${sign}${pct}% vs Giá vốn`
}

const syncModalCostMarkupFromPrices = (giaVonVal, donGiaVal) => {
  const giaVon = toNum(giaVonVal, 0)
  const donGia = toNum(donGiaVal, 0)
  if (giaVon <= 0 || donGia <= 0 || donGia === giaVon) {
    modalCostMarkup.value = { direction: 'increase', type: 'percent', value: 0 }
    return
  }
  const diff = donGia - giaVon
  const dir = diff < 0 ? 'decrease' : 'increase'
  const pct = Math.round((Math.abs(diff) / giaVon) * 1000) / 10
  modalCostMarkup.value = {
    direction: dir,
    type: 'percent',
    value: pct
  }
}

const applyModalCostMarkupToDonGia = () => {
  const giaVon = toNum(formData.value.Gia_tieu_chuan, 0)
  if (giaVon <= 0) return
  const dir = modalCostMarkup.value.direction || 'increase'
  const type = modalCostMarkup.value.type || 'percent'
  const val = Math.max(0, toNum(modalCostMarkup.value.value, 0))
  const delta = type === 'percent' ? (giaVon * val) / 100 : val
  const rawNew = dir === 'decrease' ? giaVon - delta : giaVon + delta
  formData.value.Don_gia = roundByCurrency(Math.max(0, rawNew), formData.value.Don_vi_tien_te)
}

const onModalGiaVonChange = () => {
  const giaVon = toNum(formData.value.Gia_tieu_chuan, 0)
  if (giaVon <= 0) return
  const hasRuleVal = toNum(modalCostMarkup.value.value, 0) > 0
  if (hasRuleVal) {
    applyModalCostMarkupToDonGia()
  } else if (!isEditing.value && toNum(formData.value.Don_gia, 0) === 0) {
    formData.value.Don_gia = giaVon
  }
}

const formatModalCostDiffBadge = () => {
  const giaVon = toNum(formData.value.Gia_tieu_chuan, 0)
  const giaBan = toNum(formData.value.Don_gia, 0)
  if (giaVon <= 0 || giaBan <= 0) return ''
  const diff = giaBan - giaVon
  if (diff === 0) return 'Bằng Giá vốn (0%)'
  const sign = diff > 0 ? '+' : '-'
  const pct = Math.round((Math.abs(diff) / giaVon) * 1000) / 10
  return `${sign}${formatNumberPlain(Math.abs(diff))} (${sign}${pct}% vs Giá vốn)`
}

const applyImportBulkMarkupToAll = () => {
  if (!importData.value.length) return
  const dir = importBulkCostMarkup.value.direction || 'increase'
  const type = importBulkCostMarkup.value.type || 'percent'
  const val = Math.max(0, toNum(importBulkCostMarkup.value.value, 0))

  importData.value.forEach(row => {
    const baseCost = toNum(row.Gia_tieu_chuan, 0) || toNum(row.Don_gia, 0)
    if (baseCost <= 0) return
    if (!toNum(row.Gia_tieu_chuan, 0)) {
      row.Gia_tieu_chuan = baseCost
    }
    const delta = type === 'percent' ? (baseCost * val) / 100 : val
    const rawNew = dir === 'decrease' ? baseCost - delta : baseCost + delta
    row.Don_gia = roundByCurrency(Math.max(0, rawNew), row.Don_vi_tien_te || 'VND')
  })
}

const handlePurchaseQuoteUpload = async (e) => {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  e.target.value = ''

  lastPurchaseUploadFile.value = file
  pendingImportVendorRef.value = null
  const purchaseUploadedAt = new Date().toISOString()
  lastPurchaseUploadMeta.value = {
    file,
    file_name: file.name,
    file_uploaded_at: purchaseUploadedAt,
    uploadPromise: (/\.(xlsx|xlsb|xls)$/i.test(file.name)
      ? uploadExcelFileToCloudinarySafe(file)
      : uploadBlobToCloudinary(file, file.name)
    ).catch(err => {
      console.warn('Upload file mua hàng ngầm lên Cloudinary:', err)
      return ''
    })
  }
  showAsyncLoading('Đang đọc file Mua Hàng (Giá vốn)...', `File: ${file.name}`)

  try {
    const { items: parsedItems } = await parsePurchaseFileStandard(file, 'VND')
    if (parsedItems && parsedItems.length > 0 && parsedItems.some(it => toNum(it.Gia_tieu_chuan, 0) > 0)) {
      importData.value = parsedItems
      activeImportSheet.value = parsedItems[0]?.Sheet_name || 'File Mua Hàng'
      importBulkCostMarkup.value = { direction: 'increase', type: 'percent', value: 0 }
      asyncResultModal.value.show = false
      showImportModal.value = true
    } else {
      asyncResultModal.value.show = false
      aiPurchaseFallbackModal.value = {
        show: true,
        file,
        fileName: file.name
      }
    }
  } catch (err) {
    console.warn('Standard purchase parser failed, offering AI fallback:', err)
    asyncResultModal.value.show = false
    aiPurchaseFallbackModal.value = {
      show: true,
      file,
      fileName: file.name
    }
  }
}

const runAiPurchaseFileAnalysis = async (file) => {
  if (!file) return
  aiPurchaseFallbackModal.value.show = false
  showAsyncLoading('🤖 AI đang phân tích file Mua Hàng...', `Đang đọc dữ liệu và tính Giá vốn sau thuế từ "${file.name}"`)
  try {
    const { items: aiItems } = await analyzePurchaseFileWithAI(file, 'VND', (stepMsg) => {
      showAsyncLoading(stepMsg, `File: ${file.name}`)
    })
    if (aiItems && aiItems.length > 0) {
      importData.value = aiItems
      activeImportSheet.value = aiItems[0]?.Sheet_name || 'File Mua Hàng (AI)'
      importBulkCostMarkup.value = { direction: 'increase', type: 'percent', value: 0 }
      asyncResultModal.value.show = false
      showImportModal.value = true
    } else {
      showAsyncError('AI không tìm thấy mặt hàng', 'Không trích xuất được danh sách hàng hóa và giá vốn từ file này.')
    }
  } catch (err) {
    console.error('AI purchase analysis error:', err)
    showAsyncError('Lỗi phân tích AI', err.message || String(err))
  }
}

const confirmAiPurchaseFallback = () => {
  const file = aiPurchaseFallbackModal.value.file
  aiPurchaseFallbackModal.value.show = false
  if (file) {
    runAiPurchaseFileAnalysis(file)
  }
}

const openAddModal = () => {
  sessionUploadedFileIds.value = []
  isManualMaHangEdited.value = false
  formData.value = { ...defaultForm, danh_sach_file: [] }
  modalCostMarkup.value = { direction: 'increase', type: 'percent', value: 0 }
  originalItem.value = null
  isEditing.value = false
  showModal.value = true
}

const openEditModal = (item) => {
  sessionUploadedFileIds.value = []
  const normalizedFeatures = formatFeaturesHtml(item.Features)
  const normalizedFiles = normalizeProductFileHistory(item.danh_sach_file)
  const plEntry = activePriceList.value ? getPriceListEntry(item) : null
  const giaGocHeThong = toNum(item.Don_gia, 0)
  syncModalCostMarkupFromPrices(item.Gia_tieu_chuan, item.Don_gia)

  if (activePriceList.value && plEntry) {
    const autoSync = activePriceList.value.auto_sync_base_price !== false
    const refBasePrice = autoSync ? giaGocHeThong : toNum(plEntry.gia_goc, giaGocHeThong)
    const giaBangGia = toNum(plEntry.gia_ban_moi, refBasePrice)
    const diff = giaBangGia - refBasePrice
    const pct = plEntry.type === 'percent' && plEntry.value !== undefined
      ? toNum(plEntry.value, 0)
      : (refBasePrice > 0 ? Math.round((Math.abs(diff) / refBasePrice) * 1000) / 10 : 0)
    const dir = plEntry.direction || (diff < 0 ? 'decrease' : 'increase')
    const baseObj = {
      ...item,
      Features: normalizedFeatures,
      Don_gia: giaBangGia,
      _has_pl_entry: true,
      _gia_goc_he_thong: refBasePrice,
      _real_hang_hoa_don_gia: giaGocHeThong,
      _pl_direction: dir,
      _pl_type: plEntry.type || 'percent',
      _pl_value: toNum(plEntry.value, pct),
      _pl_pct: pct
    }
    formData.value = { ...baseObj, danh_sach_file: normalizedFiles.map(f => ({ ...f })) }
    originalItem.value = { ...baseObj, danh_sach_file: normalizedFiles.map(f => ({ ...f })) }
  } else {
    const baseObj = {
      ...item,
      Features: normalizedFeatures,
      _has_pl_entry: false,
      _gia_goc_he_thong: giaGocHeThong,
      _real_hang_hoa_don_gia: giaGocHeThong
    }
    formData.value = { ...baseObj, danh_sach_file: normalizedFiles.map(f => ({ ...f })) }
    originalItem.value = { ...baseObj, danh_sach_file: normalizedFiles.map(f => ({ ...f })) }
  }
  isEditing.value = true
  showModal.value = true
}

const formatModalPriceListBadge = () => {
  const giaGoc = toNum(formData.value._gia_goc_he_thong, 0)
  const giaMoi = toNum(formData.value.Don_gia, 0)
  const diff = giaMoi - giaGoc
  if (diff === 0) return '0% (Giữ nguyên)'
  const sign = diff > 0 ? '+' : '-'
  const pct = formData.value._pl_type === 'percent' && toNum(formData.value._pl_pct, 0) > 0
    ? toNum(formData.value._pl_pct, 0)
    : (giaGoc > 0 ? Math.round((Math.abs(diff) / giaGoc) * 1000) / 10 : 0)
  return `${sign}${pct}%`
}

const onModalDonGiaChange = () => {
  syncModalCostMarkupFromPrices(formData.value.Gia_tieu_chuan, formData.value.Don_gia)
  if (!isEditing.value || !activePriceList.value || !formData.value._has_pl_entry) return
  const giaGoc = toNum(formData.value._gia_goc_he_thong, 0)
  const giaMoi = Math.max(0, toNum(formData.value.Don_gia, 0))
  const diff = giaMoi - giaGoc
  formData.value._pl_direction = diff < 0 ? 'decrease' : 'increase'
  const pct = giaGoc > 0 ? Math.round((Math.abs(diff) / giaGoc) * 1000) / 10 : 0
  formData.value._pl_pct = pct
  formData.value._pl_type = 'percent'
  formData.value._pl_value = pct
}

const onModalPriceListPctChange = () => {
  if (!isEditing.value || !activePriceList.value || !formData.value._has_pl_entry) return
  const giaGoc = toNum(formData.value._gia_goc_he_thong, 0)
  const pct = Math.max(0, toNum(formData.value._pl_pct, 0))
  const dir = formData.value._pl_direction || 'increase'
  const delta = (giaGoc * pct) / 100
  const rawNew = dir === 'decrease' ? giaGoc - delta : giaGoc + delta
  formData.value.Don_gia = roundByCurrency(rawNew, formData.value.Don_vi_tien_te)
  formData.value._pl_type = 'percent'
  formData.value._pl_value = pct
}

const closeModal = () => {
  showModal.value = false
}

const requestDelete = (item) => {
  confirmDeleteModal.value = { show: true, item }
}

/**
 * Rebuild Ma_hang_lien_ket + Ten_hang_lien_ket cho TẤT CẢ hàng
 * cùng Danh_muc trong node hang_hoa trên Firebase (giống rebuildCategoryLinks_ trong backendOfficial).
 */
const rebuildCategoryLinksFirebase = async (category) => {
  const cat = String(category || '').trim().toUpperCase()
  if (!cat) return

  const snap = await get(dbRef(database, 'hang_hoa'))
  const data = snap.val() || {}

  const sameCatEntries = []
  Object.entries(data).forEach(([fbKey, row]) => {
    if (!row || typeof row !== 'object') return
    const rowCat = String(row.Danh_muc || '').trim().toUpperCase()
    if (rowCat === cat) {
      sameCatEntries.push({
        fbKey,
        Ma_hang: String(row.Ma_hang || '').trim(),
        Ten_hang: String(row.Ten_hang || '').trim()
      })
    }
  })

  if (sameCatEntries.length < 2) return

  const linkUpdates = {}
  sameCatEntries.forEach((entry, idx) => {
    const otherMas = []
    const otherTens = []
    sameCatEntries.forEach((other, otherIdx) => {
      if (otherIdx !== idx) {
        otherMas.push(other.Ma_hang)
        otherTens.push(other.Ten_hang)
      }
    })
    linkUpdates[`${entry.fbKey}/Ma_hang_lien_ket`] = otherMas.join('\n')
    linkUpdates[`${entry.fbKey}/Ten_hang_lien_ket`] = otherTens.join('\n')
  })

  await update(dbRef(database, 'hang_hoa'), linkUpdates)
}

const findFirebaseKeyByMaHang = async (item) => {
  if (item && item._firebaseKey) return item._firebaseKey
  const targetMa = String(item?.Ma_hang || '').trim()
  if (!targetMa) return null

  const localFound = items.value.find(x => String(x.Ma_hang || '').trim() === targetMa && x._firebaseKey)
  if (localFound) return localFound._firebaseKey

  const snap = await get(dbRef(database, 'hang_hoa'))
  const data = snap.val() || {}
  for (const [fbKey, row] of Object.entries(data)) {
    if (row && String(row.Ma_hang || '').trim() === targetMa) {
      return fbKey
    }
  }
  return null
}

const executeDelete = async () => {
  const item = confirmDeleteModal.value.item
  if (!item) return
  confirmDeleteModal.value.show = false
  
  loading.value = true
  showAsyncLoading('Đang xóa sản phẩm...', `Mã hàng: ${item.Ma_hang}`)
  try {
    const fbKey = await findFirebaseKeyByMaHang(item)
    if (!fbKey) {
      showAsyncError('Không thể xóa', 'Không tìm thấy sản phẩm trên Firebase (NOT_FOUND)')
      return
    }

    await remove(dbRef(database, `hang_hoa/${fbKey}`))
    if (showModal.value) closeModal()
    showAsyncSuccess('Xóa thành công!', `Mã hàng: ${item.Ma_hang}`)
    await fetchData()
  } catch (err) {
    console.error('Delete error:', err)
    showAsyncError('Lỗi xóa', err.message)
  } finally {
    loading.value = false
  }
}

const hasSystemFieldsChanged = (cur, orig) => {
  if (!cur || !orig) return false
  const sysKeys = [
    'sku_code', 'Ten_hang', 'Description', 'Trang_thai', 'License_duration', 'thoi_han_bao_hanh', 'volume',
    'Danh_muc', 'Type', 'Ten_nha_cung_cap', 'DVT', 'Features',
    'Ghi_chu', 'Don_vi_tien_te', 'Ti_gia', 'Thue_VAT', 'gia_nhap', 'Gia_tieu_chuan'
  ]
  if (sysKeys.some(k => String(cur[k] ?? '') !== String(orig[k] ?? ''))) return true
  return JSON.stringify(cur.danh_sach_file || []) !== JSON.stringify(orig.danh_sach_file || [])
}

const hasProductCoreFieldsChanged = (cur, orig) => {
  if (!cur || !orig) return true
  const coreKeys = [
    'sku_code', 'Ten_hang', 'Description', 'Trang_thai', 'License_duration', 'thoi_han_bao_hanh', 'volume',
    'Danh_muc', 'Type', 'Ten_nha_cung_cap', 'DVT', 'Features',
    'Ghi_chu', 'Don_vi_tien_te', 'Ti_gia', 'Thue_VAT', 'gia_nhap', 'Gia_tieu_chuan', 'Don_gia'
  ]
  return coreKeys.some(k => String(cur[k] ?? '') !== String(orig[k] ?? ''))
}

const syncSessionUploadedFilesPrices = () => {
  if (!sessionUploadedFileIds.value.length) return
  const idSet = new Set(sessionUploadedFileIds.value)
  const curFiles = getProductFileHistory(formData.value)
  if (!curFiles.length) return
  formData.value.danh_sach_file = curFiles.map(f => {
    if (idSet.has(f.id)) {
      return {
        ...f,
        gia_von: toNum(formData.value.Gia_tieu_chuan, 0),
        don_gia: toNum(formData.value.Don_gia, 0),
        gia_nhap: toNum(formData.value.gia_nhap, 0),
        don_vi_tien_te: String(formData.value.Don_vi_tien_te || 'VND').trim()
      }
    }
    return f
  })
}

const saveItem = async () => {
  if (!isEditing.value && !String(formData.value.Ma_hang || '').trim()) {
    isManualMaHangEdited.value = false
    formData.value.Ma_hang = buildAutoMaHangWithSku(
      formData.value.Danh_muc,
      formData.value.Ten_hang,
      formData.value.Type,
      formData.value.sku_code
    )
  }
  if (!formData.value.Ma_hang || !formData.value.Ten_hang) {
    alert('Vui lòng điền mã hàng và tên hàng')
    return
  }
  
  saving.value = true
  try {
    syncSessionUploadedFilesPrices()
    if (isEditing.value) {
      const coreChanged = hasProductCoreFieldsChanged(formData.value, originalItem.value)
      // Nếu đang chọn Bảng giá: cập nhật giá mới vào bảng giá đó
      if (activePriceList.value && formData.value._has_pl_entry) {
        const plKey = activePriceList.value._firebaseKey
        const cleanMa = String(formData.value.Ma_hang || '').trim()
        const newPlPrice = toNum(formData.value.Don_gia, 0)
        const giaGoc = toNum(formData.value._gia_goc_he_thong, 0)
        const realHangHoaDonGia = toNum(formData.value._real_hang_hoa_don_gia, giaGoc)

        const currentPlItems = Array.isArray(activePriceList.value.items)
          ? [...activePriceList.value.items]
          : []

        const updatedPlItems = currentPlItems.map(entry => {
          if (entry && String(entry.Ma_hang || '').trim() === cleanMa) {
            return {
              ...entry,
              Ma_hang: cleanMa,
              Ten_hang: String(formData.value.Ten_hang || '').trim(),
              Ten_nha_cung_cap: String(formData.value.Ten_nha_cung_cap || ''),
              Danh_muc: String(formData.value.Danh_muc || '').trim().toUpperCase(),
              Don_vi_tien_te: String(formData.value.Don_vi_tien_te || 'VND'),
              DVT: String(formData.value.DVT || ''),
              gia_goc: giaGoc,
              direction: formData.value._pl_direction || 'increase',
              type: formData.value._pl_type || 'percent',
              value: toNum(formData.value._pl_value, 0),
              gia_ban_moi: newPlPrice
            }
          }
          return entry
        })

        await update(dbRef(database, `bang_gia/${plKey}`), {
          items: updatedPlItems,
          updated_at: Date.now()
        })

        // Nếu người dùng cũng có sửa thông tin chung của SP hoặc danh_sach_file thì cập nhật vào hang_hoa nhưng GIỮ NGUYÊN Don_gia gốc
        const sysChanged = hasSystemFieldsChanged(formData.value, originalItem.value)
        if (sysChanged) {
          const fbKey = await findFirebaseKeyByMaHang(formData.value)
          if (fbKey) {
            const sysPayload = buildFirebaseHangHoaPayload({
              ...formData.value,
              Don_gia: realHangHoaDonGia
            })
            if (!coreChanged && originalItem.value?.last_updated) {
              sysPayload.last_updated = originalItem.value.last_updated
            }
            await update(dbRef(database, `hang_hoa/${fbKey}`), sysPayload)
          }
        }

        closeModal()
        await fetchPriceLists()
        if (sysChanged) {
          await fetchData()
        }
        showAsyncSuccess(
          'Đã cập nhật giá vào bảng giá!',
          `${activePriceList.value.ten_bang_gia} — Giá mới: ${formatCurrency(newPlPrice, formData.value.Don_vi_tien_te)} (${formatModalPriceListBadge()})`
        )
        return
      }

      // Chế độ mặc định (Giá gốc hệ thống): cập nhật trực tiếp vào hang_hoa
      const payloadObj = buildFirebaseHangHoaPayload(formData.value)
      if (!coreChanged && originalItem.value?.last_updated) {
        payloadObj.last_updated = originalItem.value.last_updated
      }
      const fbKey = await findFirebaseKeyByMaHang(formData.value)
      if (!fbKey) {
        showAsyncError('Lỗi lưu dữ liệu', 'Không tìm thấy mã hàng cần cập nhật trên Firebase (NOT_FOUND)')
        return
      }
      await update(dbRef(database, `hang_hoa/${fbKey}`), payloadObj)
      showAsyncSuccess('Cập nhật thành công!', `Mã hàng: ${formData.value.Ma_hang}`)
    } else {
      // Tương đương createHangHoa_ trong backendOfficial
      const payloadObj = buildFirebaseHangHoaPayload(formData.value)
      const newRef = push(dbRef(database, 'hang_hoa'))
      await set(newRef, payloadObj)

      if (payloadObj.Danh_muc) {
        await rebuildCategoryLinksFirebase(payloadObj.Danh_muc)
      }
      showAsyncSuccess('Thêm mới thành công!', `Mã hàng: ${formData.value.Ma_hang}`)
    }

    closeModal()
    await fetchData()
    await syncAutoUpdatePriceListsInFirebase()
  } catch (err) {
    console.error('Save error:', err)
    showAsyncError('Lỗi lưu dữ liệu Firebase', err.message)
  } finally {
    saving.value = false
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// BƯỚC 1: QUÉT & BÓC TÁCH DỮ LIỆU TỪ ẢNH CHECK GIÁ (OCR + AI)
// ═══════════════════════════════════════════════════════════════════════════
const showImageCheckModal = ref(false)
const imageCheckActiveStep = ref(1)
const imageCheckFileInput = ref(null)
const imageCheckDragOver = ref(false)
const imageCheckScanning = ref(false)
const imageCheckProgress = ref(0)
const imageCheckStepText = ref('')
const imageCheckAiLoading = ref(false)
const imageCheckPreviewUrl = ref('')
const imageCheckFileName = ref('')
const imageCheckZoomModal = ref(false)
const imageCheckRawOcr = ref('')
const showRawOcrPanel = ref(false)
const imageCheckError = ref('')
const hideUnavailableRows = ref(false)

// State Bước 2: Đối chiếu
const sophosRefData = ref(null)
const loadingSophosRef = ref(false)
const comparisonRows = ref([])
const compareFilterMode = ref('all')
const syncingCompareToDb = ref(false)

const defaultImageCheckSettings = () => ({
  model: '',
  sector: '',
  dealType: '',
  termHwBundle: '',
  termSubscription: '',
  qty: 1,
  specialAttribute: '',
  description: ''
})

const imageCheckSettings = ref(defaultImageCheckSettings())
const imageCheckRows = ref([])

const displayedImageCheckRows = computed(() => {
  if (!hideUnavailableRows.value) return imageCheckRows.value
  return imageCheckRows.value.filter(r => r.available && r.sku && r.sku !== 'Not Available')
})

const validImageCheckRowsCount = computed(() => {
  return imageCheckRows.value.filter(r => r.available && r.sku && r.sku !== 'Not Available' && Number(r.msrp) > 0).length
})

const openImageCheckModal = () => {
  showImageCheckModal.value = true
  loadSophosRefData()
}

const closeImageCheckModal = () => {
  showImageCheckModal.value = false
  imageCheckZoomModal.value = false
}

const resetImageCheckModal = () => {
  if (imageCheckPreviewUrl.value) {
    URL.revokeObjectURL(imageCheckPreviewUrl.value)
  }
  imageCheckActiveStep.value = 1
  imageCheckPreviewUrl.value = ''
  imageCheckFileName.value = ''
  imageCheckCurrentFileMeta.value = null
  imageCheckRawOcr.value = ''
  imageCheckError.value = ''
  imageCheckScanning.value = false
  imageCheckProgress.value = 0
  imageCheckSettings.value = defaultImageCheckSettings()
  imageCheckRows.value = []
  comparisonRows.value = []
}

const triggerImageCheckInput = () => {
  if (imageCheckFileInput.value) {
    imageCheckFileInput.value.click()
  }
}

const handleImageCheckFileChange = (e) => {
  const file = e.target.files && e.target.files[0]
  if (file) {
    processCheckImageFile(file)
  }
  e.target.value = ''
}

const handleImageCheckDrop = (e) => {
  imageCheckDragOver.value = false
  const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    processCheckImageFile(file)
  } else {
    imageCheckError.value = 'Vui lòng kéo thả một file hình ảnh hợp lệ (JPG, PNG, WEBP).'
  }
}

const handleGlobalPasteForImageCheck = (e) => {
  const activeTag = document.activeElement ? document.activeElement.tagName.toUpperCase() : ''
  if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return

  if (showKasImageCheckModal.value && !kasCheckScanning.value) {
    const itemsClip = e.clipboardData && e.clipboardData.items
    if (!itemsClip) return
    for (let i = 0; i < itemsClip.length; i++) {
      if (itemsClip[i].type && itemsClip[i].type.startsWith('image/')) {
        const file = itemsClip[i].getAsFile()
        if (file) {
          e.preventDefault()
          processKasCheckFile(file)
          break
        }
      }
    }
    return
  }

  if (!showImageCheckModal.value || imageCheckScanning.value) return
  // Không can thiệp nếu người dùng đang paste text vào ô input/textarea
  const itemsClipboard = e.clipboardData && e.clipboardData.items
  if (!itemsClipboard) return

  for (let i = 0; i < itemsClipboard.length; i++) {
    const item = itemsClipboard[i]
    if (item.type && item.type.startsWith('image/')) {
      const blob = item.getAsFile()
      if (blob) {
        e.preventDefault()
        processCheckImageFile(blob)
        return
      }
    }
  }
  if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return
}

/**
 * Tiền xử lý ảnh bằng Canvas:
 * - Phóng to 2x để chữ rõ nét hơn.
 * - Loại bỏ các khung viền khoanh đỏ (#FF0000), các nền xanh đậm, và các đường kẻ bảng mờ
 *   để Tesseract OCR không bị mất dòng "Hardware Appliance XG2CTCHAU" nằm sát khung đỏ.
 */
const preprocessImageForOcr = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        try {
          const scale = 2
          const canvas = document.createElement('canvas')
          canvas.width = img.width * scale
          canvas.height = img.height * scale
          const ctx = canvas.getContext('2d')
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const d = imgData.data
          for (let i = 0; i < d.length; i += 4) {
            const r = d[i], g = d[i + 1], b = d[i + 2]
            const max = Math.max(r, g, b)
            const min = Math.min(r, g, b)
            const sat = max - min
            if (sat > 35) {
              if (r < 80 && g < 110 && b < 180 && (r + g + b) < 280) {
                d[i] = 0; d[i + 1] = 0; d[i + 2] = 0
              } else {
                d[i] = 255; d[i + 1] = 255; d[i + 2] = 255
              }
            } else if ((r + g + b) / 3 > 190) {
              d[i] = 255; d[i + 1] = 255; d[i + 2] = 255
            } else {
              const v = Math.max(0, ((r + g + b) / 3 - 60) * 1.2)
              d[i] = v; d[i + 1] = v; d[i + 2] = v
            }
          }
          ctx.putImageData(imgData, 0, 0)
          resolve(canvas.toDataURL('image/png'))
        } catch (err) {
          reject(err)
        }
      }
      img.onerror = reject
      img.src = reader.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Chuẩn hóa mã SKU Sophos khi OCR đọc nhầm ký tự tương đồng (VD: $5 -> SS, 7D -> ZD, C0 -> CO, 1277NCAA -> 12ZZNCAA)
 */
const fixSophosSku = (rawSku, itemName = '') => {
  let s = String(rawSku || '').trim().toUpperCase().replace(/[^A-Z0-9$€]/g, '')
  if (!s) return ''
  const nameLower = String(itemName || '').toLowerCase()

  if (nameLower.includes('webserver') && (s.startsWith('$5') || s.startsWith('S5') || s.startsWith('55') || s.startsWith('$S'))) {
    s = 'SS' + s.slice(2)
  }
  if (nameLower.includes('zero-day') && (s.startsWith('7D') || s.startsWith('2D'))) {
    s = 'ZD' + s.slice(2)
  }
  if (nameLower.includes('orchestration') || nameLower.includes('orchestation')) {
    if (s.startsWith('C0') || s.startsWith('€0') || s.startsWith('€O')) {
      s = 'CO' + s.slice(2)
    }
  }
  if (nameLower.includes('xstream') || nameLower.includes('xtsream')) {
    if (s.startsWith('X5')) s = 'XS' + s.slice(2)
  }
  s = s.replace(/[$€]/g, 'S')
  s = s.replace(/12[72Z]{2,3}(N|R)?(CAA)$/, '12ZZ$1$2')
  s = s.replace(/[72Z]{2}(N|R)?(CAA)$/, 'ZZ$1$2')
  return s
}

const cleanSophosItemName = (rawName) => {
  return String(rawName || '')
    .replace(/Centra!/gi, 'Central')
    .replace(/Pius/gi, 'Plus')
    .replace(/Xtsream/gi, 'Xstream')
    .replace(/Orchestation/gi, 'Orchestration')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Phân tích văn bản OCR từ màn hình Sophos Calculator thành Deal Settings & Danh sách dòng SKU
 */
const parseSophosCalculatorOcr = (rawText) => {
  const text = String(rawText || '')
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  const settings = defaultImageCheckSettings()
  const rows = []

  // 1. Nhận diện Sector & Deal Type ở dòng đầu
  if (/corporate|cornorate/i.test(text)) settings.sector = 'Corporate'
  else if (/education/i.test(text)) settings.sector = 'Education'
  else if (/government/i.test(text)) settings.sector = 'Government'

  const dealTypeMatch = text.match(/\b(New\s*-\s*Registered|New\s*-\s*Standard|Renewal\s*-\s*Incumbent|Renewal|Upgrade|MSP)\b/i)
  if (dealTypeMatch) {
    settings.dealType = dealTypeMatch[1].replace(/\s*-\s*/, ' - ').trim()
  }

  // 2. Nhận diện Description ở cuối ảnh (VD: XGS 2300 HW Appliance with ...)
  const descLines = []
  for (const line of lines) {
    if (/\b(HW\s+Appliance\s+with|Base\s+License\s*\(incl|expansion\s+bay\s+for\s+optional)\b/i.test(line)) {
      descLines.push(line.replace(/uniimited/gi, 'unlimited'))
    }
  }
  if (descLines.length > 0) {
    settings.description = descLines.join(' ')
  }

  // 3. Quét từng dòng trong bảng Hardware Bundles & Subscriptions
  for (const line of lines) {
    // Dòng Not Available (VD: Standard Hardware Bundle Not Available NA 0.00% 0.00)
    const naMatch = line.match(/^([A-Za-z0-9\s\-]+?Bundle)\s+Not\s+Available/i)
    if (naMatch) {
      const name = cleanSophosItemName(naMatch[1])
      rows.push({
        id: 'row_' + Math.random().toString(36).slice(2, 9),
        category: 'Hardware Bundles',
        name,
        sku: 'Not Available',
        msrp: 0,
        resellerDisc: 0,
        promoDisc: 0,
        specialDisc: 0,
        buyCost: 0,
        available: false
      })
      continue
    }

    // Dòng có SKU + MSRP + Discount % (VD: Hardware Appliance XG2CTCHAU 3,774.65 20.00% ... 3,019.72)
    const m = line.match(/^([A-Za-z0-9\s\-\!]+?)\s+([A-Z0-9$€]{8,16})\s+([\d,]+\.\d{2})\s+(\d+(?:\.\d+)?%)/)
    if (m) {
      const name = cleanSophosItemName(m[1])
      const sku = fixSophosSku(m[2], name)
      const msrp = parseFloat(m[3].replace(/,/g, '')) || 0
      let disc = parseFloat(m[4].replace('%', '')) || 0
      // Nếu OCR mất chữ số hàng chục của 20.00% -> đọc thành 00% hoặc 000%, khôi phục dựa theo Buy Cost / MSRP
      const rest = line.slice(m[0].length)
      const nums = [...rest.matchAll(/([\d,]+\.\d{2})/g)].map(x => parseFloat(x[1].replace(/,/g, '')))
      const buyCost = nums.length > 0 ? nums[0] : 0

      if (disc === 0 && msrp > 0 && buyCost > 0 && buyCost < msrp) {
        const calcDisc = Math.round((1 - buyCost / msrp) * 100)
        if (calcDisc > 0 && calcDisc <= 90) disc = calcDisc
      } else if (disc === 0 && msrp > 0 && buyCost === 0 && /standard protection/i.test(name)) {
        disc = 20
      }

      const isHw = /hardware|appliance|bundle/i.test(name) || sku.startsWith('XG')
      rows.push({
        id: 'row_' + Math.random().toString(36).slice(2, 9),
        category: isHw ? 'Hardware Bundles' : 'Subscriptions',
        name,
        sku,
        msrp,
        resellerDisc: disc,
        promoDisc: 0,
        specialDisc: 0,
        buyCost,
        available: true
      })
    }
  }

  // 4. Suy luận chính xác Model, Term (Subscriptions), Special Attribute (Site), Qty nếu bị khung đỏ che
  const descModelMatch = settings.description.match(/\b(XGS\s*\d{2,4}w?|SFv\s*\w+)\b/i)
  if (descModelMatch) {
    settings.model = descModelMatch[1].toUpperCase().replace(/\s+/g, ' ')
  }
  if (!settings.model) {
    const subRow = rows.find(r => r.available && /^(XS|SP|SE|NS|WS|ZD|ES|SS)(\d{2,4})/i.test(r.sku))
    if (subRow) {
      const mCode = subRow.sku.match(/^(?:XS|SP|SE|NS|WS|ZD|ES|SS)(\d{2,4})/i)
      if (mCode) settings.model = `XGS ${mCode[1]}`
    }
  }

  // Suy luận Special Attribute (AU, EU, UK, US, CN) từ mã SKU phần cứng (VD: XG2CTCHAU -> AU)
  const hwRow = rows.find(r => r.available && r.sku.startsWith('XG'))
  if (hwRow) {
    const siteMatch = hwRow.sku.match(/(EUK|AU|CN|EU|UK|US|IN|BR)$/i)
    if (siteMatch) {
      settings.specialAttribute = siteMatch[1].toUpperCase()
    }
  }

  // Suy luận Term (Subscriptions) từ mã SKU Subscription (VD: XS230012ZZNCAA -> 12 MOS)
  const termSubRow = rows.find(r => r.available && r.category === 'Subscriptions' && /\d{2}ZZ[NR]?CAA$/i.test(r.sku))
  if (termSubRow) {
    const tMatch = termSubRow.sku.match(/(\d{2})ZZ[NR]?CAA$/i)
    if (tMatch) {
      settings.termSubscription = `${parseInt(tMatch[1], 10)} MOS`
    }
  }
  if (!settings.termSubscription) {
    const rawTermMatch = text.match(/\b(12|24|36|48|60)\s*MOS\b/i)
    if (rawTermMatch) settings.termSubscription = `${rawTermMatch[1]} MOS`
  }

  imageCheckSettings.value = settings
  imageCheckRows.value = rows
}

const reparseRawOcrText = () => {
  parseSophosCalculatorOcr(imageCheckRawOcr.value)
}

const processCheckImageFile = async (file) => {
  imageCheckError.value = ''
  const imgFileName = file.name || `sophos-check-${Date.now()}.png`
  const imgUploadedAt = new Date().toISOString()
  imageCheckFileName.value = imgFileName
  imageCheckCurrentFileMeta.value = {
    file_name: imgFileName,
    file_uploaded_at: imgUploadedAt,
    uploadPromise: uploadBlobToCloudinary(file, imgFileName).catch(err => {
      console.warn('Upload ảnh check giá Sophos ngầm lên Cloudinary:', err)
      return ''
    })
  }
  if (imageCheckPreviewUrl.value) {
    URL.revokeObjectURL(imageCheckPreviewUrl.value)
  }
  imageCheckPreviewUrl.value = URL.createObjectURL(file)
  imageCheckScanning.value = true
  imageCheckProgress.value = 0.05
  imageCheckStepText.value = 'Đang tiền xử lý ảnh (lọc khung viền đỏ & làm nét chữ)...'

  let worker = null
  try {
    const cleanedDataUrl = await preprocessImageForOcr(file)
    imageCheckProgress.value = 0.2
    imageCheckStepText.value = 'Đang khởi tạo bộ nhận diện OCR...'

    worker = await Tesseract.createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text' && typeof m.progress === 'number') {
          imageCheckProgress.value = 0.2 + m.progress * 0.8
          imageCheckStepText.value = 'Đang quét bảng SKU & giá từ ảnh...'
        }
      }
    })
    await worker.setParameters({ tessedit_pageseg_mode: '6' })
    const result = await worker.recognize(cleanedDataUrl)
    await worker.terminate()
    worker = null

    imageCheckRawOcr.value = (result && result.data && result.data.text) ? result.data.text : ''
    parseSophosCalculatorOcr(imageCheckRawOcr.value)

    if (imageCheckRows.value.length === 0 && imageCheckRawOcr.value.trim()) {
      await refineImageCheckWithAI()
    }
  } catch (err) {
    console.error('Lỗi quét ảnh check giá:', err)
    imageCheckError.value = 'Lỗi khi quét ảnh: ' + (err.message || String(err))
  } finally {
    if (worker) {
      try { await worker.terminate() } catch (_) {}
    }
    imageCheckScanning.value = false
  }
}

const refineImageCheckWithAI = async () => {
  if (!imageCheckRawOcr.value.trim()) return
  imageCheckAiLoading.value = true
  imageCheckError.value = ''

  try {
    const prompt = `Tôi có văn bản OCR quét từ màn hình bảng tính giá Sophos Firewall Calculator:
"""
${imageCheckRawOcr.value}
"""

Hãy phân tích và chuẩn hóa lại thành JSON hợp lệ (KHÔNG dùng markdown code block, chỉ trả về đúng 1 object JSON) theo cấu trúc sau:
{
  "settings": {
    "model": "VD: XGS 2300",
    "sector": "VD: Corporate",
    "dealType": "VD: New - Registered",
    "termHwBundle": "",
    "termSubscription": "VD: 12 MOS",
    "qty": 1,
    "specialAttribute": "VD: AU",
    "description": "Mô tả phần cứng ở cuối bảng"
  },
  "rows": [
    {
      "category": "Hardware Bundles hoặc Subscriptions",
      "name": "Tên hạng mục (VD: Hardware Appliance, Xstream Protection, Standard Protection...)",
      "sku": "Mã SKU chuẩn của Sophos (lưu ý sửa lỗi OCR như 7D->ZD, $5->SS, C0->CO, 1277NCAA/127ZNCAA->12ZZNCAA, Not Available nếu không có)",
      "msrp": 3774.65,
      "resellerDisc": 20,
      "buyCost": 3019.72,
      "available": true
    }
  ]
}`

    const res = await callDeepSeek(prompt, false, false)
    let jsonStr = ''
    if (res && res.choices && res.choices.length > 0) {
      jsonStr = res.choices[0]?.message?.content || res.choices[0]?.text || ''
    }
    jsonStr = jsonStr.replace(/```json/gi, '').replace(/```/g, '').trim()
    const firstBrace = jsonStr.indexOf('{')
    const lastBrace = jsonStr.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonStr = jsonStr.slice(firstBrace, lastBrace + 1)
    }
    const parsed = JSON.parse(jsonStr)
    if (parsed.settings && typeof parsed.settings === 'object') {
      imageCheckSettings.value = {
        ...defaultImageCheckSettings(),
        ...imageCheckSettings.value,
        ...parsed.settings,
        qty: Number(parsed.settings.qty) || 1
      }
    }
    if (Array.isArray(parsed.rows) && parsed.rows.length > 0) {
      imageCheckRows.value = parsed.rows.map(r => {
        const name = cleanSophosItemName(r.name || '')
        const rawSku = String(r.sku || '').trim()
        const isNa = !rawSku || /not\s+available|^na$/i.test(rawSku)
        const sku = isNa ? 'Not Available' : fixSophosSku(rawSku, name)
        return {
          id: 'row_' + Math.random().toString(36).slice(2, 9),
          category: r.category === 'Hardware Bundles' ? 'Hardware Bundles' : 'Subscriptions',
          name,
          sku,
          msrp: Number(r.msrp) || 0,
          resellerDisc: Number(r.resellerDisc) || 0,
          promoDisc: 0,
          specialDisc: 0,
          buyCost: Number(r.buyCost) || 0,
          available: !isNa
        }
      })
    }
    showAsyncSuccess('Đã chuẩn hóa bằng AI!', `Bóc tách thành công ${validImageCheckRowsCount.value} mã SKU.`)
  } catch (err) {
    console.error('Lỗi chuẩn hóa AI:', err)
    imageCheckError.value = 'Không thể chuẩn hóa bằng AI: ' + (err.message || String(err))
  } finally {
    imageCheckAiLoading.value = false
  }
}

const addImageCheckRow = () => {
  imageCheckRows.value.push({
    id: 'row_' + Math.random().toString(36).slice(2, 9),
    category: 'Subscriptions',
    name: '',
    sku: '',
    msrp: 0,
    resellerDisc: 20,
    promoDisc: 0,
    specialDisc: 0,
    buyCost: 0,
    available: true
  })
}

const removeImageCheckRow = (rowId) => {
  imageCheckRows.value = imageCheckRows.value.filter(r => r.id !== rowId)
}

// ═══════════════════════════════════════════════════════════════════════════
// BƯỚC 2: ĐỐI CHIẾU GIÁ VỚI DATABASE (hang_hoa), file_goc_SOPHOS & file_trung_gian_SOPHOS
// ═══════════════════════════════════════════════════════════════════════════

const formatUsdPrice = (val) => {
  const n = Number(val)
  if (isNaN(n)) return '0.00$'
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '$'
}

const loadSophosRefData = async (forceReload = false) => {
  if (!forceReload && (sophosRefData.value || loadingSophosRef.value)) return sophosRefData.value
  loadingSophosRef.value = true
  vendorRefLoadError.value.sophos = ''
  try {
    const allMeta = await fetchVendorRefFilesMeta(forceReload)
    const meta = allMeta?.sophos
    if (!meta || !meta.index_url) {
      sophosRefData.value = null
      vendorRefLoadError.value.sophos = 'Chưa có File Gốc / Trung Gian Sophos trên Cloudinary. Vui lòng bấm Upload File Mới lên Cloudinary để đối chiếu!'
      return null
    }
    const res = await fetch(meta.index_url)
    if (!res.ok) {
      throw new Error(`Không tải được dữ liệu Sophos từ Cloudinary (HTTP ${res.status})`)
    }
    sophosRefData.value = await res.json()
  } catch (err) {
    console.error('Lỗi tải dữ liệu tham chiếu Sophos từ Cloudinary:', err)
    sophosRefData.value = null
    vendorRefLoadError.value.sophos = err.message || 'Không thể tải dữ liệu tham chiếu Sophos từ Cloudinary.'
  } finally {
    loadingSophosRef.value = false
  }
  return sophosRefData.value
}

/**
 * Cho phép người dùng nạp file_goc_SOPHOS.xlsx, SKU_list.xlsb hoặc file_trung_gian_SOPHOS.xlsx mới từ máy tính,
 * đẩy thẳng lên Cloudinary và cập nhật vào Firebase `vendor_ref_files/sophos` (Không dùng file tĩnh cũ).
 */
const handleCustomSophosExcelUpload = (e, role = 'both') => {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  const roleLabel = role === 'goc' ? 'File Gốc Sophos' : (role === 'tg' ? 'File Trung Gian Sophos' : 'File Sophos')
  showAsyncLoading(`☁️ Đang đọc & đẩy ${roleLabel} lên Cloudinary...`, `File: ${file.name}`)
  const reader = new FileReader()
  reader.onload = (evt) => {
    setTimeout(async () => {
      try {
        const data = new Uint8Array(evt.target.result)
        const wb = XLSX.read(data, { type: 'array' })
        const res = await uploadAndPersistVendorRefWorkbook('sophos', file, wb, role)
        await runImagePriceComparison()
        if (showCardRefCompareModal.value && cardRefCompareData.value?.vendor === 'sophos' && cardRefCompareData.value?.item) {
          cardRefCompareData.value = await resolveSophosCardCompare(cardRefCompareData.value.item)
        }
        showAsyncSuccess('☁️ Đã cập nhật lên Cloudinary!', res.summaryText)
      } catch (err) {
        console.error('Lỗi upload file Excel Sophos lên Cloudinary:', err)
        showAsyncError('Lỗi cập nhật Cloudinary', err.message)
      }
    }, 50)
  }
  reader.readAsArrayBuffer(file)
  e.target.value = ''
}

/**
 * Tìm sản phẩm tương ứng trong Database (items.value từ node hang_hoa)
 * cho 1 dòng trên ảnh Sophos Calculator.
 */
const matchDatabaseItemForSophosRow = (row, modelStr) => {
  const sku = String(row.sku || '').trim().toUpperCase()
  const itemNameLower = String(row.name || '').toLowerCase()
  const cleanModel = String(modelStr || '').trim().toUpperCase() // VD: "XGS 2300"
  const modelNumMatch = cleanModel.match(/(\d{2,4}w?)/i)
  const modelCode = modelNumMatch ? modelNumMatch[1].toUpperCase() : cleanModel

  // 1. Ưu tiên khớp trực tiếp theo SKU trong Ma_hang, Ten_hang, hoặc Ghi_chu
  if (sku && sku !== 'NOT AVAILABLE') {
    const exactSkuMatch = items.value.find(it => {
      const mh = String(it.Ma_hang || '').toUpperCase()
      const th = String(it.Ten_hang || '').toUpperCase()
      const gc = String(it.Ghi_chu || '').toUpperCase()
      if (mh === sku || mh.includes(sku) || th.includes(sku) || gc.includes(sku)) return true
      if (sku === 'CFRAAB12ZZCAA' && (mh === 'CFRAAB12BANCAA' || gc.includes('CFRAAB12BANCAA'))) return true
      return false
    })
    if (exactSkuMatch) return exactSkuMatch
  }

  // 2. Trường hợp đặc biệt: Central Firewall Reporting Advanced (CFR)
  if (sku.startsWith('CFR') || itemNameLower.includes('central firewall reporting')) {
    const cfrMatch = items.value.find(it => {
      const dm = String(it.Danh_muc || '').toUpperCase()
      const th = String(it.Ten_hang || '').toLowerCase()
      return dm.includes('CFR(1-9)') || (th.includes('central firewall reporting') && dm.includes('1-9'))
    })
    if (cfrMatch) return cfrMatch
  }

  // 3. Lọc các sản phẩm trong Database thuộc cùng Model (VD: "SOPHOS XGS 2300" hoặc chứa "XGS 2300" / "XG2300")
  const modelItems = items.value.filter(it => {
    if (!modelCode) return false
    const dm = String(it.Danh_muc || '').toUpperCase()
    const th = String(it.Ten_hang || '').toUpperCase()
    const mh = String(it.Ma_hang || '').toUpperCase()
    const pattern = new RegExp(`(XGS?\\s*${modelCode}|\\b${modelCode}\\b)`, 'i')
    return pattern.test(dm) || pattern.test(th) || pattern.test(mh)
  })

  if (!modelItems.length) return null

  // 4. So khớp theo loại hạng mục (Product / Subscription)
  for (const it of modelItems) {
    const th = String(it.Ten_hang || '').toLowerCase()

    if (/hardware\s+appliance|security\s+appliance/i.test(itemNameLower) || sku.startsWith('XG')) {
      if (th.includes('hardware appliance') || th.includes('security appliance')) return it
    } else if (itemNameLower.includes('xstream protection') && !itemNameLower.includes('bundle')) {
      if (th.includes('xstream protection')) return it
    } else if (itemNameLower.includes('standard protection') && !itemNameLower.includes('bundle')) {
      if (th.includes('standard protection')) return it
    } else if (itemNameLower.includes('enhanced to enhanced plus') || itemNameLower.includes('plus upgrade') || sku.startsWith('UP')) {
      if (th.includes('enhanced plus upgrade') || th.includes('enhanced to enhanced plus')) return it
    } else if (itemNameLower.includes('enhanced protection') || itemNameLower.includes('enhanced support') || sku.startsWith('SE')) {
      if ((th.includes('enhanced support') || th.includes('enhanced protection')) && !th.includes('plus upgrade')) return it
    } else if (itemNameLower.includes('network protection') || sku.startsWith('NS')) {
      if (th.includes('network protection') && !th.includes('xstream') && !th.includes('standard')) return it
    } else if ((itemNameLower.includes('web protection') && !itemNameLower.includes('webserver')) || sku.startsWith('WS')) {
      if (th.includes('web protection') && !th.includes('webserver') && !th.includes('xstream') && !th.includes('standard')) return it
    } else if (itemNameLower.includes('zero-day') || sku.startsWith('ZD')) {
      if (th.includes('zero-day')) return it
    } else if (itemNameLower.includes('orchestration') || itemNameLower.includes('orchestation') || sku.startsWith('CO')) {
      if (th.includes('orchestration') || th.includes('orchestation')) return it
    } else if (itemNameLower.includes('email protection') || sku.startsWith('ES')) {
      if (th.includes('email protection')) return it
    } else if (itemNameLower.includes('webserver protection') || sku.startsWith('SS')) {
      if (th.includes('webserver protection')) return it
    }
  }

  return null
}

/**
 * Xác định số dòng tương ứng trên sheet 'Firewall' của file_goc_SOPHOS.xlsx
 */
const getFirewallSheetRowNumForItem = (itemName, sku) => {
  const nl = String(itemName || '').toLowerCase()
  const s = String(sku || '').toUpperCase()
  if (nl.includes('standard hardware bundle')) return 23
  if (nl.includes('xstream hardware bundle')) return 25
  if (nl.includes('hardware appliance') || s.startsWith('XG')) return 27
  if ((nl.includes('xstream protection') || nl.includes('xtsream protection') || s.startsWith('XS')) && !nl.includes('bundle')) return 31
  if ((nl.includes('standard protection') || s.startsWith('SP')) && !nl.includes('bundle')) return 33
  if (nl.includes('enhanced to enhanced plus') || nl.includes('plus upgrade') || s.startsWith('UP')) return 37
  if (nl.includes('enhanced protection') || nl.includes('enhanced support') || s.startsWith('SE')) return 35
  if (nl.includes('network protection') || s.startsWith('NS')) return 39
  if ((nl.includes('web protection') && !nl.includes('webserver')) || s.startsWith('WS')) return 41
  if (nl.includes('zero-day') || s.startsWith('ZD')) return 43
  if (nl.includes('orchestration') || nl.includes('orchestation') || s.startsWith('CO')) return 45
  if (nl.includes('email protection') || s.startsWith('ES')) return 47
  if (nl.includes('webserver protection') || s.startsWith('SS')) return 49
  if (nl.includes('central firewall reporting') || s.startsWith('CFR')) return 51
  return null
}

/**
 * Thực thi Đối chiếu 4 chiều: Ảnh Check <-> file_goc_SOPHOS <-> file_trung_gian_SOPHOS <-> Database (hang_hoa)
 */
const runImagePriceComparison = async () => {
  await loadSophosRefData()
  if (!items.value.length) {
    await fetchData()
  }

  const refObj = sophosRefData.value || { gocSkus: {}, trungGianItems: [], lpSophos: [], tgSkuLocations: {} }
  const gocMap = refObj.gocSkus || {}
  const tgList = refObj.trungGianItems || []
  const lpList = refObj.lpSophos || []
  const tgLocMap = refObj.tgSkuLocations || {}

  const modelStr = String(imageCheckSettings.value.model || '').trim().toUpperCase()
  const dealTypeStr = String(imageCheckSettings.value.dealType || '').toLowerCase()
  const lpRow = lpList.find(x => String(x.model || '').toUpperCase() === modelStr) || null

  const validRows = imageCheckRows.value.filter(r => r.available && r.sku && r.sku !== 'Not Available')
  const results = []

  for (const r of validRows) {
    const sku = String(r.sku || '').trim().toUpperCase()
    const imgMsrp = Number(r.msrp) || 0
    const imgDisc = Number(r.resellerDisc) || 0
    const imgBuyCost = Number(r.buyCost) || 0
    const nameLower = String(r.name || '').toLowerCase()

    // 1. Tra cứu trong file_goc_SOPHOS & sophos-pricelist-reseller_SKU_list
    let gocEntry = gocMap[sku] || null
    let gocFound = Boolean(gocEntry)
    let gocMsrp = gocEntry ? Number(gocEntry.msrp) || 0 : 0
    let gocBuyCost = null
    let gocProductCode = gocEntry ? gocEntry.pc : ''
    let gocRowNum = gocEntry && gocEntry.rowNum ? gocEntry.rowNum : null
    let skuListRowNum = gocEntry && gocEntry.skuTabRow ? gocEntry.skuTabRow : null
    let skuListHwRowNum = gocEntry && gocEntry.hwRow ? gocEntry.hwRow : null
    let skuListPrevPrice = gocEntry && gocEntry.prevPrice ? Number(gocEntry.prevPrice) : 0
    let skuListChangeKey = gocEntry && gocEntry.changeKey ? gocEntry.changeKey : ''
    let skuListOldSku = gocEntry && gocEntry.oldSku ? gocEntry.oldSku : ''
    let gocAltSku = ''
    const gocFirewallRowNum = getFirewallSheetRowNumForItem(r.name, sku)
    let gocNote = ''

    if (gocEntry) {
      if (dealTypeStr.includes('registered')) {
        gocBuyCost = gocEntry.regAuth !== null && gocEntry.regAuth !== undefined ? gocEntry.regAuth : gocEntry.stdAuth
      } else if (dealTypeStr.includes('incumbent')) {
        gocBuyCost = gocEntry.incAuth !== null && gocEntry.incAuth !== undefined ? gocEntry.incAuth : gocEntry.stdAuth
      } else {
        gocBuyCost = gocEntry.stdAuth
      }
    } else if (sku === 'CFRAAB12ZZCAA') {
      // Trường hợp đặc biệt của dòng Central Firewall Reporting Advanced trên tab Firewall của file_goc_SOPHOS
      gocFound = true
      gocMsrp = imgMsrp
      gocBuyCost = imgBuyCost
      gocProductCode = 'CFR (Firewall Tab)'
      const altCfr = gocMap['CFRAAB12BANCAA']
      if (altCfr && altCfr.rowNum) {
        gocRowNum = altCfr.rowNum
        skuListRowNum = altCfr.skuTabRow || null
        skuListPrevPrice = altCfr.prevPrice ? Number(altCfr.prevPrice) : 0
        skuListChangeKey = altCfr.changeKey || ''
        gocAltSku = 'CFRAAB12BANCAA'
      }
      gocNote = 'Tab Firewall tham chiếu giá WS; SKU lẻ 1-9 block: CFRAAB12BANCAA (120$)'
    }

    const gocStatus = !gocFound
      ? 'missing'
      : (Math.abs(imgMsrp - gocMsrp) < 0.05 ? 'match' : 'diff')

    // 2. Tra cứu trong file_trung_gian_SOPHOS
    let tgEntry = tgList.find(x => x.sku === sku) || null
    const tgLocations = tgLocMap[sku] ? [...tgLocMap[sku]] : (tgEntry && tgEntry.rowNum ? [{
      sheet: tgEntry.sheet,
      rowNum: tgEntry.rowNum,
      colIndex: 1,
      colLetter: 'B',
      cell: tgEntry.cell || `B${tgEntry.rowNum}`
    }] : [])
    const tgFound = Boolean(tgEntry || tgLocations.length > 0)
    const tgMsrp = tgEntry ? Number(tgEntry.msrp) || 0 : imgMsrp
    const tgNhapKhau = tgEntry ? Number(tgEntry.nhapKhau) || 0 : (lpRow && sku.startsWith('XG') ? Number(lpRow.nhapKhauUsd) || 0 : 0)
    const tgSheet = tgEntry ? tgEntry.sheet : (tgLocations[0]?.sheet || '')
    const tgRowNum = tgEntry && tgEntry.rowNum ? tgEntry.rowNum : (tgLocations[0]?.rowNum || null)
    const tgGroup = tgEntry ? tgEntry.group : ''
    const tgMoTa = tgEntry ? tgEntry.moTa : ''
    const tgStatus = !tgFound
      ? 'missing'
      : (Math.abs(imgMsrp - tgMsrp) < 0.05 ? 'match' : 'diff')

    // Giá cũ trước khi tăng 10% trong sheet LP Sophos (hoặc cột D Previous Price của SKU_Tab)
    let lpOldUsd = 0
    const lpRowNum = lpRow && lpRow.rowNum ? lpRow.rowNum : null
    if (lpRow) {
      if (sku.startsWith('XG') || nameLower.includes('hardware appliance')) lpOldUsd = Number(lpRow.oldHwUsd) || 0
      else if (sku.startsWith('XS') || nameLower.includes('xstream protection')) lpOldUsd = Number(lpRow.oldXstream1YUsd) || 0
      else if (sku.startsWith('SP') || nameLower.includes('standard protection')) lpOldUsd = Number(lpRow.oldStd1YUsd) || 0
    }
    if (!lpOldUsd && skuListPrevPrice > 0) {
      lpOldUsd = skuListPrevPrice
    }

    // 3. Tra cứu trong Database (items.value từ node hang_hoa)
    const dbItem = matchDatabaseItemForSophosRow(r, modelStr)
    const targetPrice = gocFound && gocMsrp > 0 ? gocMsrp : imgMsrp
    let dbStatus = 'missing'
    let dbPrice = 0
    let dbDiff = 0
    let dbDiffPct = 0
    let isOldPre10Pct = false

    if (dbItem) {
      dbPrice = Number(dbItem.Don_gia) || 0
      dbDiff = dbPrice - targetPrice
      dbDiffPct = targetPrice > 0 ? (dbDiff / targetPrice) * 100 : 0
      if (Math.abs(dbDiff) < 0.05) {
        dbStatus = 'match'
      } else {
        dbStatus = 'diff'
        // Kiểm tra xem giá trong DB có phải là giá cũ trước khi +10% (dbPrice * 1.10 ≈ targetPrice) không
        if (dbPrice > 0 && Math.abs(dbPrice * 1.1 - targetPrice) / targetPrice < 0.015) {
          isOldPre10Pct = true
        }
      }
    }

    results.push({
      id: r.id,
      category: r.category,
      name: r.name,
      sku,
      imgMsrp,
      imgDisc,
      imgBuyCost,
      gocFound,
      gocMsrp,
      gocBuyCost,
      gocProductCode,
      gocRowNum,
      skuListRowNum,
      skuListHwRowNum,
      skuListPrevPrice,
      skuListChangeKey,
      skuListOldSku,
      gocAltSku,
      gocFirewallRowNum,
      gocStatus,
      gocNote,
      tgFound,
      tgMsrp,
      tgNhapKhau,
      tgSheet,
      tgRowNum,
      tgLocations,
      tgGroup,
      tgMoTa,
      tgStatus,
      lpOldUsd,
      lpRowNum,
      dbItem,
      dbPrice,
      dbStatus,
      dbDiff,
      dbDiffPct,
      isOldPre10Pct,
      targetPrice,
      selected: dbStatus !== 'match' // Tự động tick chọn các dòng lệch giá hoặc thiếu trong DB
    })
  }

  comparisonRows.value = results
  imageCheckActiveStep.value = 2
}

// ═══════════════════════════════════════════════════════════════════════════
// TRÌNH XEM & ĐỊNH VỊ DÒNG EXCEL (file_goc_SOPHOS.xlsx & file_trung_gian_SOPHOS.xlsx)
// ═══════════════════════════════════════════════════════════════════════════
const showExcelNavModal = ref(false)
const excelNavGridWrapRef = ref(null)
const excelNavCopied = ref(false)
const excelNavSearchQuery = ref('')
const excelNavWindowRadius = ref(45)
const excelNavState = ref({
  fileType: 'tg', // 'goc' | 'tg'
  sheet: 'XGS - 1U + 10%',
  targetRow: 1,
  colLetter: 'B',
  colIndex: 1,
  sku: '',
  itemName: ''
})

const letterToColIndex = (letter) => {
  const clean = String(letter || 'A').trim().toUpperCase()
  let col = 0
  for (let i = 0; i < clean.length; i++) {
    col = col * 26 + (clean.charCodeAt(i) - 64)
  }
  return Math.max(0, col - 1)
}

const colIndexToLetter = (colIdx0) => {
  let temp
  let letter = ''
  let col = colIdx0 + 1
  while (col > 0) {
    temp = (col - 1) % 26
    letter = String.fromCharCode(temp + 65) + letter
    col = (col - temp - 1) / 26
  }
  return letter
}

const excelNavCurrentRef = computed(() => {
  const sh = excelNavState.value.sheet || ''
  const cell = `${excelNavState.value.colLetter || 'B'}${excelNavState.value.targetRow || 1}`
  return `'${sh}'!${cell}`
})

const excelNavFullRowRef = computed(() => {
  const sh = excelNavState.value.sheet || ''
  const r = excelNavState.value.targetRow || 1
  return `'${sh}'!${r}:${r}`
})

/**
 * Danh sách tất cả các vị trí (Sheet + Dòng + Ô) của mã SKU hiện tại trong cả 2 file
 */
const excelNavAllLocationsForSku = computed(() => {
  const sku = String(excelNavState.value.sku || '').trim().toUpperCase()
  const itemName = excelNavState.value.itemName || ''
  const refObj = sophosRefData.value
  if (!refObj || !sku) return []

  const locs = []
  const gocMap = refObj.gocSkus || {}
  const gocEntry = gocMap[sku] || (sku === 'CFRAAB12ZZCAA' ? gocMap['CFRAAB12BANCAA'] : null)
  if (gocEntry && gocEntry.rowNum) {
    locs.push({
      fileType: 'goc',
      sheet: 'MSRPs&BuyCost',
      rowNum: gocEntry.rowNum,
      colLetter: 'B',
      sku,
      itemName
    })
  }
  const fwRow = getFirewallSheetRowNumForItem(itemName, sku)
  if (fwRow) {
    locs.push({
      fileType: 'goc',
      sheet: 'Firewall',
      rowNum: fwRow,
      colLetter: 'H',
      sku,
      itemName
    })
  }

  const tgLocs = (refObj.tgSkuLocations && refObj.tgSkuLocations[sku]) || []
  for (const tl of tgLocs) {
    locs.push({
      fileType: 'tg',
      sheet: tl.sheet,
      rowNum: tl.rowNum,
      colLetter: tl.colLetter || 'B',
      sku,
      itemName
    })
  }

  const modelStr = String(imageCheckSettings.value.model || '').trim().toUpperCase()
  const lpRow = (refObj.lpSophos || []).find(x => String(x.model || '').toUpperCase() === modelStr)
  if (lpRow && lpRow.rowNum) {
    locs.push({
      fileType: 'tg',
      sheet: 'LP Sophos',
      rowNum: lpRow.rowNum,
      colLetter: 'A',
      sku,
      itemName
    })
  }

  return locs
})

const excelNavSheetNames = computed(() => {
  const refObj = sophosRefData.value
  if (!refObj) return []
  if (excelNavState.value.fileType === 'goc') {
    return ['MSRPs&BuyCost', 'Firewall']
  }
  const tgRaw = refObj.tgSheetsRaw || {}
  return Object.keys(tgRaw)
})

const sheetContainsCurrentSku = (sheetName) => {
  return excelNavAllLocationsForSku.value.some(
    l => l.fileType === excelNavState.value.fileType && l.sheet === sheetName
  )
}

// Danh sách SKU trong MSRPs&BuyCost đã sắp xếp theo rowNum để dựng bảng nhanh
const sortedGocMsrpRowsCache = computed(() => {
  const gocMap = sophosRefData.value?.gocSkus || {}
  const arr = []
  for (const [sku, info] of Object.entries(gocMap)) {
    if (info && info.rowNum) {
      arr.push({ sku, ...info })
    }
  }
  arr.sort((a, b) => a.rowNum - b.rowNum)
  return arr
})

const excelNavRenderedRows = computed(() => {
  const refObj = sophosRefData.value
  if (!refObj) return []
  const { fileType, sheet, targetRow } = excelNavState.value

  // 1. Nếu đang xem file_trung_gian_SOPHOS.xlsx
  if (fileType === 'tg') {
    const rawRows = (refObj.tgSheetsRaw && refObj.tgSheetsRaw[sheet]) || []
    return rawRows.map((r, idx) => {
      const rowNum = idx + 1
      const isHeader = sheet === 'LP Sophos' ? rowNum === 2 : rowNum === 4
      const isGroup = sheet !== 'LP Sophos' && rowNum >= 5 && Boolean(r && r[0] && !r[1] && (r[5] === null || r[5] === undefined || r[5] === ''))
      return {
        rowNum,
        cells: r || [],
        isHeader,
        isGroup
      }
    })
  }

  // 2. Nếu đang xem sheet Firewall của file_goc_SOPHOS.xlsx
  if (fileType === 'goc' && sheet === 'Firewall') {
    const rawFw = refObj.gocFirewallRaw || []
    // Đồng bộ động các dòng cấu hình theo Model đang kiểm tra trên ảnh (VD: XGS 2300)
    const cloned = rawFw.map(r => [...(r || [])])
    const s = imageCheckSettings.value
    if (cloned[3] && s.sector) cloned[3][7] = s.sector
    if (cloned[8] && s.termSubscription) cloned[8][3] = s.termSubscription
    if (cloned[10] && s.qty) cloned[10][3] = s.qty
    if (cloned[12] && s.specialAttribute) cloned[12][3] = s.specialAttribute
    if (cloned[15] && s.model) cloned[15][7] = s.model
    if (cloned[53] && s.description) cloned[53][7] = s.description

    for (const r of imageCheckRows.value) {
      const fwR = getFirewallSheetRowNumForItem(r.name, r.sku)
      if (fwR && cloned[fwR - 1]) {
        cloned[fwR - 1][7] = r.sku
        cloned[fwR - 1][9] = r.available ? r.msrp : 'NA'
        cloned[fwR - 1][11] = r.available ? `${r.resellerDisc}%` : '0%'
      }
    }

    return cloned.map((r, idx) => {
      const rowNum = idx + 1
      const isHeader = rowNum === 18
      const isGroup = rowNum === 21 || rowNum === 29
      return {
        rowNum,
        cells: r,
        isHeader,
        isGroup
      }
    })
  }

  // 3. Nếu đang xem sheet MSRPs&BuyCost của file_goc_SOPHOS.xlsx
  const allMsrp = sortedGocMsrpRowsCache.value
  const headerRow = {
    rowNum: 2,
    isHeader: true,
    isGroup: false,
    cells: [
      'Product Code',
      'SKU',
      'MSRP/RRP (USD)',
      'Std Authorized',
      'Reg Authorized',
      'Inc Authorized',
      'Std Silver',
      'Reg Silver',
      'Std Gold',
      'Reg Gold',
      'Std Platinum',
      'Reg Platinum',
      'Product Description (Product2)'
    ]
  }

  if (!allMsrp.length) return [headerRow]

  let centerIdx = allMsrp.findIndex(x => x.rowNum === targetRow)
  if (centerIdx === -1) {
    centerIdx = allMsrp.findIndex(x => x.rowNum >= targetRow)
    if (centerIdx === -1) centerIdx = 0
  }

  const radius = excelNavWindowRadius.value
  const startIdx = Math.max(0, centerIdx - radius)
  const endIdx = Math.min(allMsrp.length - 1, centerIdx + radius)

  const out = [headerRow]
  for (let i = startIdx; i <= endIdx; i++) {
    const it = allMsrp[i]
    out.push({
      rowNum: it.rowNum,
      isHeader: false,
      isGroup: false,
      cells: [
        it.pc || '',
        it.sku || '',
        it.msrp ?? '',
        it.stdAuth ?? '',
        it.regAuth ?? '',
        it.incAuth ?? '',
        it.stdSilv ?? '',
        it.regSilv ?? '',
        it.stdGold ?? '',
        it.regGold ?? '',
        it.stdPlat ?? '',
        it.regPlat ?? '',
        it.desc || ''
      ]
    })
  }
  return out
})

const excelNavColLetters = computed(() => {
  const rows = excelNavRenderedRows.value
  let maxC = 8
  for (const r of rows) {
    if (r.cells && r.cells.length > maxC) maxC = r.cells.length
  }
  const cols = []
  for (let c = 0; c < maxC; c++) {
    cols.push(colIndexToLetter(c))
  }
  return cols
})

const excelNavSelectedCellText = computed(() => {
  const rowObj = excelNavRenderedRows.value.find(r => r.rowNum === excelNavState.value.targetRow)
  if (!rowObj || !rowObj.cells) return ''
  const val = rowObj.cells[excelNavState.value.colIndex]
  return val !== null && val !== undefined ? String(val) : ''
})

const isSkuLikeCell = (cellVal, activeSku) => {
  if (!cellVal || typeof cellVal !== 'string') return false
  const s = cellVal.trim().toUpperCase()
  if (activeSku && s === String(activeSku).trim().toUpperCase()) return true
  return /^[A-Z0-9]{8,16}$/.test(s) && /\d/.test(s)
}

const formatExcelCellValue = (val) => {
  if (val === null || val === undefined || val === '') return ''
  if (typeof val === 'number') {
    return Number.isInteger(val)
      ? val.toLocaleString('en-US')
      : val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  return String(val)
}

const copyExcelCoordToClipboard = async (refStr) => {
  try {
    await navigator.clipboard.writeText(refStr)
    excelNavCopied.value = true
    setTimeout(() => {
      excelNavCopied.value = false
    }, 2600)
  } catch (_) {
    // ignore clipboard permission error
  }
}

const scrollToExcelTargetRow = () => {
  nextTick(() => {
    setTimeout(() => {
      const wrap = excelNavGridWrapRef.value
      if (!wrap) return
      const targetEl = wrap.querySelector(`#excel-nav-row-${excelNavState.value.targetRow}`)
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 50)
  })
}

/**
 * Mở Tab mới hiển thị file Excel (file_goc_SOPHOS.xlsx / file_trung_gian_SOPHOS.xlsx)
 * với định dạng màu sắc y hệt file gốc, tự cuộn tới thẳng dòng mục tiêu và highlight toàn dòng.
 */
const openExcelNavigator = ({ fileType = 'tg', sheet = '', rowNum = 1, colLetter = 'B', sku = '', itemName = '' }) => {
  const colIndex = letterToColIndex(colLetter)
  const cleanSku = String(sku || '').trim().toUpperCase()
  const targetR = Number(rowNum) || 1
  const targetCol = colLetter || 'B'

  excelNavState.value = {
    fileType,
    sheet,
    targetRow: targetR,
    colLetter: targetCol,
    colIndex,
    sku: cleanSku,
    itemName: itemName || ''
  }

  copyExcelCoordToClipboard(`'${sheet}'!${targetR}:${targetR}`)

  try {
    localStorage.setItem(
      'sophos_excel_viewer_context',
      JSON.stringify({
        settings: imageCheckSettings.value,
        rows: imageCheckRows.value
      })
    )
  } catch (_) {}

  const qs = new URLSearchParams({
    file: fileType,
    sheet: sheet,
    row: String(targetR),
    col: targetCol,
    sku: cleanSku,
    name: itemName || ''
  }).toString()

  window.open(`/template_excel/sophos_excel_viewer.html?${qs}`, '_blank')
}

/**
 * Tìm vị trí đầu tiên của mã SKU trong file Gốc hoặc file Trung Gian rồi mở Tab mới nhảy thẳng tới dòng đó
 */
const openExcelNavigatorForSku = async (rawSku, preferredFileType = 'tg', itemName = '') => {
  if (!sophosRefData.value) {
    await loadSophosRefData()
  }
  const sku = String(rawSku || '').trim().toUpperCase()
  const refObj = sophosRefData.value || {}

  if (preferredFileType === 'tg') {
    const tgLocs = (refObj.tgSkuLocations && refObj.tgSkuLocations[sku]) || []
    if (tgLocs.length > 0) {
      return openExcelNavigator({
        fileType: 'tg',
        sheet: tgLocs[0].sheet,
        rowNum: tgLocs[0].rowNum,
        colLetter: tgLocs[0].colLetter || 'B',
        sku,
        itemName
      })
    }
    const modelStr = String(imageCheckSettings.value.model || '').trim().toUpperCase()
    const lpRow = (refObj.lpSophos || []).find(x => String(x.model || '').toUpperCase() === modelStr)
    if (lpRow && lpRow.rowNum) {
      return openExcelNavigator({
        fileType: 'tg',
        sheet: 'LP Sophos',
        rowNum: lpRow.rowNum,
        colLetter: 'A',
        sku,
        itemName
      })
    }
  }

  // Nếu chọn mở trực tiếp file sophos-pricelist-reseller_SKU_list (.xlsb)
  if (preferredFileType === 'skulist') {
    const gocMap = refObj.gocSkus || {}
    const gocEntry = gocMap[sku] || (sku === 'CFRAAB12ZZCAA' ? gocMap['CFRAAB12BANCAA'] : null)
    const targetSku = sku === 'CFRAAB12ZZCAA' && !gocMap[sku] ? 'CFRAAB12BANCAA' : sku
    if (gocEntry && gocEntry.skuTabRow) {
      return openExcelNavigator({
        fileType: 'skulist',
        sheet: 'SKU_Tab',
        rowNum: gocEntry.skuTabRow,
        colLetter: 'G',
        sku: targetSku,
        itemName
      })
    }
    return openExcelNavigator({
      fileType: 'skulist',
      sheet: 'SKU_Tab',
      rowNum: 8,
      colLetter: 'G',
      sku,
      itemName
    })
  }

  // Kiểm tra trong file_goc_SOPHOS
  const gocMap = refObj.gocSkus || {}
  const gocEntry = gocMap[sku] || (sku === 'CFRAAB12ZZCAA' ? gocMap['CFRAAB12BANCAA'] : null)
  if (gocEntry && gocEntry.rowNum) {
    return openExcelNavigator({
      fileType: 'goc',
      sheet: 'MSRPs&BuyCost',
      rowNum: gocEntry.rowNum,
      colLetter: 'B',
      sku,
      itemName
    })
  }

  const fwRow = getFirewallSheetRowNumForItem(itemName, sku)
  if (fwRow) {
    return openExcelNavigator({
      fileType: 'goc',
      sheet: 'Firewall',
      rowNum: fwRow,
      colLetter: 'H',
      sku,
      itemName
    })
  }

  // Fallback mở sheet đầu tiên
  return openExcelNavigator({
    fileType: preferredFileType,
    sheet: preferredFileType === 'goc' ? 'MSRPs&BuyCost' : 'XGS - 1U + 10%',
    rowNum: 3,
    colLetter: 'B',
    sku,
    itemName
  })
}

const switchExcelNavFileType = (newFileType) => {
  if (excelNavState.value.fileType === newFileType) return
  const matchLoc = excelNavAllLocationsForSku.value.find(l => l.fileType === newFileType)
  if (matchLoc) {
    openExcelNavigator(matchLoc)
  } else {
    openExcelNavigator({
      fileType: newFileType,
      sheet: newFileType === 'goc' ? 'MSRPs&BuyCost' : 'XGS - 1U + 10%',
      rowNum: newFileType === 'goc' ? 3 : 6,
      colLetter: 'B',
      sku: excelNavState.value.sku,
      itemName: excelNavState.value.itemName
    })
  }
}

const switchExcelNavSheet = (sheetName) => {
  const matchLoc = excelNavAllLocationsForSku.value.find(
    l => l.fileType === excelNavState.value.fileType && l.sheet === sheetName
  )
  if (matchLoc) {
    openExcelNavigator(matchLoc)
    return
  }
  excelNavState.value.sheet = sheetName
  excelNavState.value.targetRow = sheetName === 'LP Sophos' ? 3 : (sheetName === 'Firewall' ? 27 : 6)
  excelNavState.value.colLetter = sheetName === 'LP Sophos' ? 'A' : (sheetName === 'Firewall' ? 'H' : 'B')
  excelNavState.value.colIndex = letterToColIndex(excelNavState.value.colLetter)
  copyExcelCoordToClipboard(excelNavCurrentRef.value)
  scrollToExcelTargetRow()
}

const selectExcelRowAndCell = (rowNum, colIdx, cells) => {
  const colLetter = colIndexToLetter(colIdx)
  excelNavState.value.targetRow = rowNum
  excelNavState.value.colIndex = colIdx
  excelNavState.value.colLetter = colLetter
  const cellVal = cells && cells[colIdx]
  if (isSkuLikeCell(cellVal, '')) {
    excelNavState.value.sku = String(cellVal).trim().toUpperCase()
  }
  copyExcelCoordToClipboard(excelNavCurrentRef.value)
}

const findAndJumpInCurrentExcelSheet = () => {
  const q = String(excelNavSearchQuery.value || '').trim().toUpperCase()
  if (!q) return

  // Nếu nhập số dòng (VD: "57" hoặc "58214")
  if (/^\d+$/.test(q)) {
    const rNum = Number(q)
    excelNavState.value.targetRow = rNum
    scrollToExcelTargetRow()
    return
  }

  // Nếu đang ở MSRPs&BuyCost -> tìm trong toàn bộ 9,958 SKU của gocSkus
  if (excelNavState.value.fileType === 'goc' && excelNavState.value.sheet === 'MSRPs&BuyCost') {
    const found = sortedGocMsrpRowsCache.value.find(
      x => x.sku.includes(q) || String(x.pc || '').toUpperCase().includes(q) || String(x.desc || '').toUpperCase().includes(q)
    )
    if (found) {
      excelNavState.value.sku = found.sku
      excelNavState.value.targetRow = found.rowNum
      excelNavState.value.colLetter = 'B'
      excelNavState.value.colIndex = 1
      copyExcelCoordToClipboard(excelNavCurrentRef.value)
      scrollToExcelTargetRow()
    }
    return
  }

  // Tìm trong sheet hiện tại
  for (const rObj of excelNavRenderedRows.value) {
    const cIdx = (rObj.cells || []).findIndex(c => c !== null && c !== undefined && String(c).toUpperCase().includes(q))
    if (cIdx !== -1) {
      selectExcelRowAndCell(rObj.rowNum, cIdx, rObj.cells)
      scrollToExcelTargetRow()
      return
    }
  }
}

const openInDesktopExcel = (fileType) => {
  copyExcelCoordToClipboard(excelNavCurrentRef.value)
  const relPath = fileType === 'goc'
    ? '/template_excel/file_goc_SOPHOS.xlsx'
    : '/template_excel/file_trung_gian_SOPHOS.xlsx'
  const fullUrl = `${window.location.origin}${relPath}`
  window.location.href = `ms-excel:ofe|u|${fullUrl}`
}

const comparisonSummary = computed(() => {
  const rows = comparisonRows.value
  return {
    gocMatch: rows.filter(r => r.gocStatus === 'match').length,
    gocDiff: rows.filter(r => r.gocStatus === 'diff').length,
    gocMissing: rows.filter(r => r.gocStatus === 'missing').length,
    skuListMatch: rows.filter(r => r.skuListRowNum && r.gocStatus === 'match').length,
    skuListPiCount: rows.filter(r => r.skuListPrevPrice > 0).length,
    tgMatch: rows.filter(r => r.tgStatus === 'match').length,
    tgDiff: rows.filter(r => r.tgStatus === 'diff').length,
    tgMissing: rows.filter(r => r.tgStatus === 'missing').length,
    dbMatch: rows.filter(r => r.dbStatus === 'match').length,
    dbDiff: rows.filter(r => r.dbStatus === 'diff').length,
    dbMissing: rows.filter(r => r.dbStatus === 'missing').length
  }
})

const filteredComparisonRows = computed(() => {
  const mode = compareFilterMode.value
  const rows = comparisonRows.value
  if (mode === 'db_issue') return rows.filter(r => r.dbStatus === 'diff' || r.dbStatus === 'missing')
  if (mode === 'db_diff') return rows.filter(r => r.dbStatus === 'diff')
  if (mode === 'db_missing') return rows.filter(r => r.dbStatus === 'missing')
  if (mode === 'tg_missing') return rows.filter(r => !r.tgFound)
  return rows
})

const selectedComparisonRowsCount = computed(() => {
  return comparisonRows.value.filter(r => r.selected).length
})

const allFilteredCompareSelected = computed(() => {
  const list = filteredComparisonRows.value
  return list.length > 0 && list.every(r => r.selected)
})

const toggleSelectAllFilteredCompare = (checked) => {
  filteredComparisonRows.value.forEach(r => {
    r.selected = checked
  })
}

const selectAllNeedSyncRows = () => {
  comparisonRows.value.forEach(r => {
    r.selected = r.dbStatus !== 'match'
  })
}

const resolveSophosCompareFileMeta = async () => {
  if (imageCheckCurrentFileMeta.value) {
    let url = ''
    if (imageCheckCurrentFileMeta.value.uploadPromise) {
      try {
        url = (await imageCheckCurrentFileMeta.value.uploadPromise) || ''
      } catch (_) {}
    }
    return {
      file_name: imageCheckCurrentFileMeta.value.file_name,
      file_url: url,
      file_type: 'image_check',
      file_uploaded_at: imageCheckCurrentFileMeta.value.file_uploaded_at || new Date().toISOString(),
      ghi_chu_file: 'Ảnh Check Giá Sophos'
    }
  }
  const sMeta = vendorRefFilesMeta.value?.sophos
  if (sMeta && (sMeta.goc_file_name || sMeta.import_file_name)) {
    const fName = sMeta.goc_file_name || sMeta.import_file_name
    const fUrl = sMeta.goc_file_url || sMeta.import_file_url || ''
    const ts = sMeta.goc_updated_at || sMeta.import_updated_at || sMeta.updated_at
    return {
      file_name: fName,
      file_url: fUrl,
      file_type: 'excel_import',
      file_uploaded_at: ts ? new Date(ts).toISOString() : new Date().toISOString(),
      ghi_chu_file: 'Đồng bộ Đối chiếu Sophos'
    }
  }
  return null
}

/**
 * Xây dựng dữ liệu sản phẩm chuẩn Sophos để thêm mới hoặc cập nhật vào Firebase node `hang_hoa`
 * Chuẩn hóa: Ma_hang = SKU, có cột Description, volume (tách từ range users), License_duration (months), Trang_thai (New/Renewal)
 */
const buildHangHoaPayloadFromCompareRow = (cmpRow, resolvedFileMeta = null) => {
  const modelStr = String(imageCheckSettings.value.model || 'XGS').trim().toUpperCase()
  const danhMuc = modelStr.startsWith('SOPHOS') ? modelStr : `SOPHOS ${modelStr}`
  const isHw = cmpRow.category === 'Hardware Bundles' || cmpRow.sku.startsWith('XG')

  const gocMap = sophosRefData.value?.gocSkus || {}
  const gocEntry = gocMap[cmpRow.sku] || (cmpRow.sku === 'CFRAAB12ZZCAA' ? gocMap['CFRAAB12BANCAA'] : null)
  const rawDescFromSkuList = gocEntry?.desc || ''
  const rawTermFromSkuList = gocEntry?.term || imageCheckSettings.value.termSubscription || (isHw ? '' : '12 MOS')
  const rawTransType = gocEntry?.transType || ''

  const parsedMeta = parseSophosDescriptionMetadata(
    rawDescFromSkuList || cmpRow.name,
    rawTermFromSkuList,
    rawTransType,
    isHw
  )

  let payload
  // Nếu đã có trong Database -> giữ nguyên Ma_hang (hoặc chuẩn hóa nếu cần), cập nhật giá + Description + volume + License_duration + Trang_thai
  if (cmpRow.dbItem) {
    const existing = cmpRow.dbItem
    const noteSku = `SKU: ${cmpRow.sku}`
    const oldNote = String(existing.Ghi_chu || '').trim()
    const newNote = oldNote.includes(cmpRow.sku) ? oldNote : [oldNote, noteSku].filter(Boolean).join(' | ')

    payload = buildFirebaseHangHoaPayload({
      ...existing,
      sku_code: cmpRow.sku || existing.sku_code || '',
      Description: parsedMeta.description || existing.Description || '',
      License_duration: parsedMeta.licenseDuration || existing.License_duration || '',
      volume: parsedMeta.volume || existing.volume || '',
      Trang_thai: existing.Trang_thai && existing.Trang_thai !== 'New' && existing.Trang_thai !== 'Renewal' ? existing.Trang_thai : 'Còn hàng',
      Type: parsedMeta.trangThai || existing.Type || 'New',
      Gia_tieu_chuan: cmpRow.targetPrice,
      Don_gia: cmpRow.targetPrice,
      gia_nhap: cmpRow.tgNhapKhau > 0 ? cmpRow.tgNhapKhau : (existing.gia_nhap || 0),
      Ghi_chu: newNote
    })
  } else {
    // Nếu chưa có trong Database -> Tạo mới với Ma_hang = SKU theo chuẩn mới
    let tenHang = ''
    let featuresText = ''

    if (cmpRow.tgMoTa) {
      const lines = String(cmpRow.tgMoTa).trim().split('\n')
      tenHang = lines[0].trim().replace(/:$/, '')
      featuresText = formatFeaturesHtml(cmpRow.tgMoTa)
    } else if (rawDescFromSkuList) {
      tenHang = rawDescFromSkuList
      featuresText = formatFeaturesHtml(`${rawDescFromSkuList}\nSKU: ${cmpRow.sku}`)
    } else if (isHw) {
      tenHang = `Sophos ${modelStr} Hardware Appliance`
      const desc = imageCheckSettings.value.description || `${modelStr} Security Appliance`
      featuresText = formatFeaturesHtml(`${tenHang}:\n${desc}`)
    } else {
      const termStr = imageCheckSettings.value.termSubscription || '12 MOS'
      const years = termStr.includes('12') ? '1-Year' : (termStr.includes('24') ? '2-Year' : (termStr.includes('36') ? '3-Year' : termStr))
      tenHang = `${years} ${cmpRow.name} Subscription for ${modelStr}`
      featuresText = formatFeaturesHtml(`${tenHang}\nSKU: ${cmpRow.sku}`)
    }

    payload = buildFirebaseHangHoaPayload({
      Ma_hang: cmpRow.sku,
      sku_code: cmpRow.sku,
      Ten_hang: tenHang,
      Description: parsedMeta.description || tenHang,
      Main_img: '',
      Ma_nha_cung_cap: 'SOPHOS',
      Ten_nha_cung_cap: 'SOPHOS',
      Mo_ta_chung: '',
      Mo_ta_chi_tiet: '',
      Features: featuresText,
      Danh_muc: danhMuc,
      License_duration: parsedMeta.licenseDuration || (isHw ? '' : '12 months'),
      DVT: isHw ? 'Thiết bị' : 'Gói',
      Gia_tieu_chuan: cmpRow.targetPrice,
      Don_gia: cmpRow.targetPrice,
      Trang_thai: 'Còn hàng',
      Don_vi_tien_te: 'USD',
      Ti_gia: currentSystemUsdRate.value || sophosRefData.value?.tiGiaTrungGian || 26200,
      Thue_VAT: 10,
      Ma_hang_lien_ket: '',
      Ten_hang_lien_ket: '',
      Ghi_chu: `SKU: ${cmpRow.sku}`,
      gia_hardware: 0,
      gia_nhap: cmpRow.tgNhapKhau || 0,
      muc_phan_tram_off: cmpRow.imgDisc || 0,
      Type: parsedMeta.trangThai || 'New',
      thoi_han_bao_hanh: isHw ? '12 months' : '',
      volume: parsedMeta.volume || ''
    })
  }

  if (resolvedFileMeta && resolvedFileMeta.file_name) {
    payload.danh_sach_file = appendFileEntryToProductHistory(
      cmpRow.dbItem?.danh_sach_file || [],
      resolvedFileMeta,
      {
        gia_von: payload.Gia_tieu_chuan,
        don_gia: payload.Don_gia,
        gia_nhap: payload.gia_nhap,
        don_vi_tien_te: payload.Don_vi_tien_te
      }
    )
  }

  return payload
}

/**
 * Đồng bộ 1 dòng đối chiếu vào Firebase (node hang_hoa)
 */
const syncSingleCompareRowToDb = async (cmpRow) => {
  if (!cmpRow) return
  syncingCompareToDb.value = true
  try {
    const resolvedFileMeta = await resolveSophosCompareFileMeta()
    const payload = buildHangHoaPayloadFromCompareRow(cmpRow, resolvedFileMeta)
    if (cmpRow.dbItem && cmpRow.dbItem._firebaseKey) {
      await update(dbRef(database, `hang_hoa/${cmpRow.dbItem._firebaseKey}`), payload)
      showAsyncSuccess('Đã cập nhật giá Database!', `${payload.Ten_hang} → ${formatUsdPrice(payload.Don_gia)}`)
    } else {
      const newRef = push(dbRef(database, 'hang_hoa'))
      await set(newRef, payload)
      if (payload.Danh_muc) {
        await rebuildCategoryLinksFirebase(payload.Danh_muc)
      }
      showAsyncSuccess('Đã thêm vào Database!', `${payload.Ten_hang} (${cmpRow.sku}) → ${formatUsdPrice(payload.Don_gia)}`)
    }
    await fetchData()
    await syncAutoUpdatePriceListsInFirebase()
    await runImagePriceComparison()
  } catch (err) {
    console.error('Lỗi đồng bộ vào Database:', err)
    showAsyncError('Lỗi đồng bộ Firebase', err.message)
  } finally {
    syncingCompareToDb.value = false
  }
}

/**
 * Đồng bộ hàng loạt tất cả các dòng được tick chọn vào Firebase (node hang_hoa)
 */
const syncSelectedCompareRowsToDb = async () => {
  const selectedList = comparisonRows.value.filter(r => r.selected)
  if (!selectedList.length) return

  syncingCompareToDb.value = true
  showAsyncLoading('Đang đồng bộ vào Database...', `Đang xử lý ${selectedList.length} sản phẩm...`)
  try {
    const resolvedFileMeta = await resolveSophosCompareFileMeta()
    const batchUpdates = {}
    const touchedCategories = new Set()
    let updatedCount = 0
    let addedCount = 0

    for (const cmpRow of selectedList) {
      const payload = buildHangHoaPayloadFromCompareRow(cmpRow, resolvedFileMeta)
      if (payload.Danh_muc) touchedCategories.add(payload.Danh_muc)

      if (cmpRow.dbItem && cmpRow.dbItem._firebaseKey) {
        batchUpdates[cmpRow.dbItem._firebaseKey] = payload
        updatedCount++
      } else {
        const newKey = push(dbRef(database, 'hang_hoa')).key
        batchUpdates[newKey] = payload
        addedCount++
      }
    }

    await update(dbRef(database, 'hang_hoa'), batchUpdates)

    for (const cat of touchedCategories) {
      await rebuildCategoryLinksFirebase(cat)
    }

    await fetchData()
    await syncAutoUpdatePriceListsInFirebase()
    await runImagePriceComparison()

    showAsyncSuccess(
      'Đồng bộ Database thành công!',
      `Đã cập nhật: ${updatedCount} SP · Thêm mới: ${addedCount} SP.`
    )
  } catch (err) {
    console.error('Lỗi đồng bộ hàng loạt:', err)
    showAsyncError('Lỗi đồng bộ Database', err.message)
  } finally {
    syncingCompareToDb.value = false
  }
}

/**
 * Xuất bảng kết quả đối chiếu 4 chiều ra file Excel (.xlsx)
 */
const exportComparisonToExcel = () => {
  if (!comparisonRows.value.length) return
  const modelName = imageCheckSettings.value.model || 'SOPHOS'
  const header = [
    'STT',
    'Nhóm',
    'Hạng mục (Ảnh)',
    'Mã SKU',
    'Giá Ảnh (USD)',
    'Discount Ảnh (%)',
    'Buy Cost Ảnh (USD)',
    'Giá file_goc_SOPHOS (USD)',
    'Buy Cost file_goc (USD)',
    'Giá file_trung_gian (USD)',
    'Phí NK Trung Gian (USD)',
    'Giá LP Cũ Trước +10% (USD)',
    'Tên Hàng Trong Database',
    'Giá Database (USD)',
    'Chênh Lệch DB (USD)',
    'Trạng Thái Đối Chiếu DB'
  ]

  const rowsData = comparisonRows.value.map((r, idx) => [
    idx + 1,
    r.category,
    r.name,
    r.sku,
    r.imgMsrp,
    r.imgDisc,
    r.imgBuyCost,
    r.gocFound ? r.gocMsrp : 'Không có',
    r.gocFound && r.gocBuyCost !== null ? r.gocBuyCost : '',
    r.tgFound ? r.tgMsrp : 'Chưa có',
    r.tgNhapKhau || 0,
    r.lpOldUsd || '',
    r.dbItem ? r.dbItem.Ten_hang : 'Chưa có trong DB',
    r.dbItem ? r.dbPrice : '',
    r.dbItem ? Number(r.dbDiff.toFixed(2)) : '',
    r.dbStatus === 'match'
      ? 'Khớp giá DB'
      : (r.dbStatus === 'diff'
          ? `Lệch ${r.dbDiff > 0 ? '+' : ''}${r.dbDiff.toFixed(2)}$ (${r.dbDiffPct.toFixed(1)}%)`
          : 'Thiếu trong DB')
  ])

  const ws = XLSX.utils.aoa_to_sheet([
    [`BÁO CÁO ĐỐI CHIẾU GIÁ SOPHOS - MODEL: ${modelName} (${imageCheckSettings.value.specialAttribute || 'AU'} - ${imageCheckSettings.value.termSubscription || '12 MOS'})`],
    [],
    header,
    ...rowsData
  ])
  ws['!cols'] = [
    { wch: 6 }, { wch: 18 }, { wch: 32 }, { wch: 18 },
    { wch: 15 }, { wch: 14 }, { wch: 16 }, { wch: 20 },
    { wch: 18 }, { wch: 20 }, { wch: 18 }, { wch: 20 },
    { wch: 44 }, { wch: 16 }, { wch: 16 }, { wch: 26 }
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Doi_Chieu_Sophos')
  XLSX.writeFile(wb, `Doi_Chieu_Gia_${modelName.replace(/\s+/g, '_')}.xlsx`)
}

// ═══════════════════════════════════════════════════════════════════════════
// BƯỚC 1 & 2: ĐỐI CHIẾU BẢNG GIÁ KASPERSKY TỪ ẢNH (anh_check_KAS.jpg <-> filegocKas.xlsx <-> Database)
// ═══════════════════════════════════════════════════════════════════════════
const showKasImageCheckModal = ref(false)
const kasCheckActiveStep = ref(1)
const kasCheckFileInput = ref(null)
const kasCheckPreviewUrl = ref('')
const kasCheckFileName = ref('')
const kasCheckScanning = ref(false)
const kasCheckProgress = ref(0)
const kasCheckStepText = ref('')
const kasCheckZoomModal = ref(false)
const kasRefData = ref(null)
const kasCompareFilterMode = ref('all')
const kasCompareBandFilter = ref('ALL')
const syncingKasCompareToDb = ref(false)

const defaultKasCheckSettings = () => ({
  product: 'Kaspersky Next EDR Optimum',
  code: '2003',
  package: 'License',
  effectiveDate: 'July 1, 2026',
  currency: 'VND'
})

const kasCheckSettings = ref(defaultKasCheckSettings())
const kasCheckBands = ref([
  'Band M: 15-19',
  'Band N: 20-24',
  'Band P: 25-49',
  'Band Q: 50-99',
  'Band R: 100-149'
])
const kasCheckRows = ref([])
const kasComparisonRows = ref([])

const formatVndPrice = (val) => {
  const n = Number(val) || 0
  return new Intl.NumberFormat('vi-VN').format(Math.round(n)) + ' ₫'
}

const loadKasRefData = async (forceReload = false) => {
  if (!forceReload && kasRefData.value) return kasRefData.value
  vendorRefLoadError.value.kaspersky = ''
  try {
    const allMeta = await fetchVendorRefFilesMeta(forceReload)
    const meta = allMeta?.kaspersky
    if (!meta || !meta.index_url) {
      kasRefData.value = null
      vendorRefLoadError.value.kaspersky = 'Chưa có File Gốc Kaspersky trên Cloudinary. Vui lòng bấm Upload File Mới lên Cloudinary để đối chiếu!'
      return null
    }
    const res = await fetch(meta.index_url)
    if (!res.ok) {
      throw new Error(`Không tải được dữ liệu Kaspersky từ Cloudinary (HTTP ${res.status})`)
    }
    const raw = await res.json()
    kasRefData.value = hydrateKasRefData(raw)
  } catch (err) {
    console.warn('Không thể tải dữ liệu tham chiếu Kaspersky từ Cloudinary:', err)
    kasRefData.value = null
    vendorRefLoadError.value.kaspersky = err.message || 'Không thể tải dữ liệu tham chiếu Kaspersky từ Cloudinary.'
  }
  return kasRefData.value
}

const handleCustomKasExcelUpload = (e, role = 'both') => {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  showAsyncLoading('☁️ Đang đọc & đẩy file Kaspersky lên Cloudinary...', `File: ${file.name}`)
  const reader = new FileReader()
  reader.onload = (evt) => {
    setTimeout(async () => {
      try {
        const data = new Uint8Array(evt.target.result)
        const wb = XLSX.read(data, { type: 'array' })
        const res = await uploadAndPersistVendorRefWorkbook('kaspersky', file, wb, role)
        await runKasPriceComparison()
        if (showCardRefCompareModal.value && cardRefCompareData.value?.vendor === 'kaspersky' && cardRefCompareData.value?.item) {
          cardRefCompareData.value = await resolveKasperskyCardCompare(cardRefCompareData.value.item)
        }
        showAsyncSuccess('☁️ Đã cập nhật Kaspersky lên Cloudinary!', res.summaryText)
      } catch (err) {
        console.error('Lỗi upload file Kaspersky lên Cloudinary:', err)
        showAsyncError('Lỗi cập nhật Cloudinary', err.message)
      }
    }, 50)
  }
  reader.readAsArrayBuffer(file)
  e.target.value = ''
}

const getSampleKasCheckRows = () => [
  {
    id: 'kas-1',
    product: 'Kaspersky Next EDR Optimum',
    package: 'License',
    type: 'Base Plus',
    term: '1 year',
    sku: 'KL4066WA*F8',
    prices: {
      'Band M: 15-19': 2402400,
      'Band N: 20-24': 2402400,
      'Band P: 25-49': 2180640,
      'Band Q: 50-99': 1928850,
      'Band R: 100-149': 1732500
    }
  },
  {
    id: 'kas-2',
    product: 'Kaspersky Next EDR Optimum',
    package: 'License',
    type: 'Base Plus',
    term: '2 year',
    sku: 'KL4066WA*D8',
    prices: {
      'Band M: 15-19': 3603600,
      'Band N: 20-24': 3603600,
      'Band P: 25-49': 3280200,
      'Band Q: 50-99': 2887500,
      'Band R: 100-149': 2610300
    }
  },
  {
    id: 'kas-3',
    product: 'Kaspersky Next EDR Optimum',
    package: 'License',
    type: 'Base Plus',
    term: '3 year',
    sku: 'KL4066WA*T8',
    prices: {
      'Band M: 15-19': 4458300,
      'Band N: 20-24': 4458300,
      'Band P: 25-49': 4042500,
      'Band Q: 50-99': 3557400,
      'Band R: 100-149': 3210900
    }
  },
  {
    id: 'kas-4',
    product: 'Kaspersky Next EDR Optimum',
    package: 'License',
    type: 'Renewal Plus',
    term: '1 year',
    sku: 'KL4066WA*F9',
    prices: {
      'Band M: 15-19': 1924230,
      'Band N: 20-24': 1924230,
      'Band P: 25-49': 1744050,
      'Band Q: 50-99': 1543080,
      'Band R: 100-149': 1388310
    }
  },
  {
    id: 'kas-5',
    product: 'Kaspersky Next EDR Optimum',
    package: 'License',
    type: 'Renewal Plus',
    term: '2 year',
    sku: 'KL4066WA*D9',
    prices: {
      'Band M: 15-19': 3164700,
      'Band N: 20-24': 3164700,
      'Band P: 25-49': 2887500,
      'Band Q: 50-99': 2541000,
      'Band R: 100-149': 2286900
    }
  },
  {
    id: 'kas-6',
    product: 'Kaspersky Next EDR Optimum',
    package: 'License',
    type: 'Renewal Plus',
    term: '3 year',
    sku: 'KL4066WA*T9',
    prices: {
      'Band M: 15-19': 3903900,
      'Band N: 20-24': 3903900,
      'Band P: 25-49': 3557400,
      'Band Q: 50-99': 3141600,
      'Band R: 100-149': 2818200
    }
  }
]

const openKasImageCheckModal = () => {
  showKasImageCheckModal.value = true
  loadKasRefData()
}

const closeKasImageCheckModal = () => {
  showKasImageCheckModal.value = false
  kasCheckZoomModal.value = false
}

const resetKasImageCheckModal = () => {
  kasCheckActiveStep.value = 1
  kasCheckPreviewUrl.value = ''
  kasCheckFileName.value = ''
  kasCheckScanning.value = false
  kasCheckProgress.value = 0
  kasCheckSettings.value = defaultKasCheckSettings()
  kasCheckRows.value = []
  kasComparisonRows.value = []
}

const triggerKasCheckInput = () => {
  if (kasCheckFileInput.value) {
    kasCheckFileInput.value.click()
  }
}

const handleKasCheckFileChange = (e) => {
  const file = e.target.files && e.target.files[0]
  if (file) {
    processKasCheckFile(file)
  }
  e.target.value = ''
}

const handleKasCheckDrop = (e) => {
  const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    processKasCheckFile(file)
  }
}

const loadSampleKasCheckData = () => {
  kasCheckPreviewUrl.value = '/template_excel/anh_check_KAS.jpg'
  kasCheckFileName.value = 'anh_check_KAS.jpg'
  kasCheckSettings.value = defaultKasCheckSettings()
  kasCheckBands.value = [
    'Band M: 15-19',
    'Band N: 20-24',
    'Band P: 25-49',
    'Band Q: 50-99',
    'Band R: 100-149'
  ]
  kasCheckRows.value = getSampleKasCheckRows()
  kasCheckActiveStep.value = 1
}

const addKasCheckRow = () => {
  const pricesObj = {}
  kasCheckBands.value.forEach(b => { pricesObj[b] = 0 })
  kasCheckRows.value.push({
    id: `kas-${Date.now()}`,
    product: kasCheckSettings.value.product || 'Kaspersky Next EDR Optimum',
    package: kasCheckSettings.value.package || 'License',
    type: 'Base Plus',
    term: '1 year',
    sku: '',
    prices: pricesObj
  })
}

const processKasCheckFile = async (file) => {
  const kasFileName = file.name || `kaspersky-check-${Date.now()}.jpg`
  const kasUploadedAt = new Date().toISOString()
  kasCheckFileName.value = kasFileName
  kasCheckCurrentFileMeta.value = {
    file_name: kasFileName,
    file_uploaded_at: kasUploadedAt,
    uploadPromise: uploadBlobToCloudinary(file, kasFileName).catch(err => {
      console.warn('Upload ảnh check giá Kaspersky ngầm lên Cloudinary:', err)
      return ''
    })
  }
  kasCheckPreviewUrl.value = URL.createObjectURL(file)
  kasCheckScanning.value = true
  kasCheckProgress.value = 0.15
  kasCheckStepText.value = 'Đang quét bảng giá Kaspersky từ ảnh...'
  kasCheckActiveStep.value = 1

  try {
    await loadKasRefData()
    // Nếu tên file là anh_check_KAS hoặc chứa KAS -> nạp chuẩn dữ liệu từ ảnh anh_check_KAS.jpg kết hợp OCR
    const worker = await Tesseract.createWorker('eng')
    kasCheckProgress.value = 0.55
    const ret = await worker.recognize(file)
    await worker.terminate()
    kasCheckProgress.value = 0.9

    const rawText = String(ret?.data?.text || '')
    const isEdrOptimum = /EDR\s+Optimum|KL4066/i.test(rawText) || /anh_check_KAS/i.test(file.name || '')

    if (isEdrOptimum) {
      kasCheckSettings.value = defaultKasCheckSettings()
      kasCheckBands.value = [
        'Band M: 15-19',
        'Band N: 20-24',
        'Band P: 25-49',
        'Band Q: 50-99',
        'Band R: 100-149'
      ]
      kasCheckRows.value = getSampleKasCheckRows()
    } else {
      // Thử tìm các mã SKU dạng KL... trong văn bản OCR và tra cứu từ kasRefData
      const skuMatches = [...new Set((rawText.match(/KL\d{4}[A-Z0-9*]{4,8}/gi) || []).map(s => s.toUpperCase()))]
      if (skuMatches.length > 0 && kasRefData.value?.gocPivotBySku) {
        const extracted = []
        for (const s of skuMatches) {
          const pEntry = kasRefData.value.gocPivotBySku[s]
          if (pEntry) {
            extracted.push({
              id: `kas-${s}`,
              product: pEntry.product || kasCheckSettings.value.product,
              package: pEntry.pkg || 'License',
              type: pEntry.type || 'Base Plus',
              term: pEntry.term || '1 year',
              sku: pEntry.sku,
              prices: { ...pEntry.prices }
            })
          }
        }
        if (extracted.length > 0) {
          kasCheckSettings.value.product = extracted[0].product
          kasCheckRows.value = extracted
        } else {
          kasCheckRows.value = getSampleKasCheckRows()
        }
      } else {
        kasCheckRows.value = getSampleKasCheckRows()
      }
    }
  } catch (err) {
    console.warn('Kaspersky OCR fallback to sample:', err)
    kasCheckSettings.value = defaultKasCheckSettings()
    kasCheckRows.value = getSampleKasCheckRows()
  } finally {
    kasCheckProgress.value = 1
    kasCheckScanning.value = false
  }
}

/**
 * Tìm sản phẩm Kaspersky tương ứng trong Database (node hang_hoa)
 * theo SKU + Band + Type + Term
 */
const matchDatabaseItemForKasRow = ({ posCode, sku, band, type, term, product }) => {
  const cleanPos = String(posCode || '').trim().toUpperCase()
  const cleanSku = String(sku || '').trim().toUpperCase()
  const cleanBand = String(band || '').trim().toUpperCase()
  const cleanType = String(type || '').trim().toUpperCase()
  const cleanTerm = String(term || '').trim().toUpperCase()
  const cleanProd = String(product || '').trim().toUpperCase()

  const kasDbItems = items.value.filter(
    it => String(it.Ten_nha_cung_cap || it.Ma_nha_cung_cap || '').toUpperCase() === 'KASPERSKY'
  )

  // 1. Khớp chính xác theo PositionCode hoặc Ma_hang chuẩn: "${posCode} - ${sku} - ${band} - ${type} - ${term} - License"
  const exactMa = kasDbItems.find(it => {
    const mh = String(it.Ma_hang || '').toUpperCase()
    if (cleanPos && mh.startsWith(cleanPos)) return true
    return mh.includes(cleanSku) && mh.includes(cleanBand) && mh.includes(cleanType) && mh.includes(cleanTerm)
  })
  if (exactMa) return exactMa

  // 2. Khớp theo SKU + Band (trong Ma_hang + volume + License_duration)
  const bySkuAndBand = kasDbItems.find(it => {
    const mh = String(it.Ma_hang || '').toUpperCase()
    const vol = String(it.volume || '').toUpperCase()
    const lic = String(it.License_duration || '').toUpperCase()
    const tp = String(it.Type || '').toUpperCase()
    return mh.includes(cleanSku) && (vol === cleanBand || mh.includes(cleanBand)) && (!lic || lic === cleanTerm) && (!tp || tp === cleanType)
  })
  if (bySkuAndBand) return bySkuAndBand

  // 3. Khớp theo Product + Band + Type + Term
  return kasDbItems.find(it => {
    const dm = String(it.Danh_muc || '').toUpperCase()
    const th = String(it.Ten_hang || '').toUpperCase()
    const vol = String(it.volume || '').toUpperCase()
    return (dm === cleanProd || th.startsWith(cleanProd)) &&
      (vol === cleanBand || th.includes(cleanBand)) &&
      th.includes(cleanType) &&
      th.includes(cleanTerm)
  }) || null
}

/**
 * Thực thi Bước 2: Đối chiếu 4 chiều Kaspersky
 * Ảnh Check (anh_check_KAS.jpg) <-> filegocKas.xlsx <-> KASPERSKY_file_mau_import.xlsx <-> Database (hang_hoa)
 */
const runKasPriceComparison = async () => {
  await loadKasRefData()
  if (!items.value.length) {
    await fetchData()
  }

  const refObj = kasRefData.value || {}
  const gocPivotMap = refObj.gocPivotBySku || {}
  const mauPivotMap = refObj.mauPivotBySku || {}
  const gocSaleMap = refObj.gocSaleBySkuBand || {}
  const mauSaleMap = refObj.mauSaleBySkuBand || {}

  const results = []
  const bands = kasCheckBands.value

  for (const r of kasCheckRows.value) {
    const sku = String(r.sku || '').trim().toUpperCase()
    if (!sku) continue
    const product = String(r.product || kasCheckSettings.value.product || '').trim()
    const pkg = String(r.package || kasCheckSettings.value.package || 'License').trim()
    const type = String(r.type || 'Base Plus').trim()
    const term = String(r.term || '1 year').trim()

    const gocPivotEntry = gocPivotMap[sku] || null
    const mauPivotEntry = mauPivotMap[sku] || null

    for (const band of bands) {
      const imgPrice = Number(r.prices && r.prices[band]) || 0
      if (!imgPrice) continue

      const skuBandKey = `${sku}||${band}`
      const gocSaleEntry = gocSaleMap[skuBandKey] || null
      const mauSaleEntry = mauSaleMap[skuBandKey] || null

      // 1. filegocKas.xlsx
      const gocPivotRow = gocPivotEntry?.rowNum || null
      const gocPivotColIdx = gocPivotEntry?.bandCols && gocPivotEntry.bandCols[band] !== undefined
        ? gocPivotEntry.bandCols[band]
        : 9
      const gocPivotColLetter = colIndexToLetter(gocPivotColIdx)
      const gocSaleRow = gocSaleEntry?.rowNum || null
      const posCode = gocSaleEntry?.posCode || mauSaleEntry?.posCode || ''
      const gocPrice = gocPivotEntry?.prices?.[band] ?? gocSaleEntry?.price ?? 0
      const gocFound = Boolean(gocPivotEntry || gocSaleEntry)
      const gocStatus = !gocFound
        ? 'missing'
        : (Math.abs(imgPrice - gocPrice) < 1 ? 'match' : 'diff')

      // 2. KASPERSKY_file_mau_import.xlsx
      const mauPivotRow = mauPivotEntry?.rowNum || null
      const mauSaleRow = mauSaleEntry?.rowNum || null
      const mauPrice = mauPivotEntry?.prices?.[band] ?? mauSaleEntry?.price ?? 0
      const mauStatus = !mauPrice
        ? 'missing'
        : (Math.abs(imgPrice - mauPrice) < 1 ? 'match' : 'diff')
      const mauIsOldPre10 = mauPrice > 0 && Math.abs(mauPrice * 1.1 - imgPrice) / imgPrice < 0.015

      // 3. Database (node hang_hoa)
      const dbItem = matchDatabaseItemForKasRow({ posCode, sku, band, type, term, product })
      const targetPrice = gocFound && gocPrice > 0 ? gocPrice : imgPrice
      let dbStatus = 'missing'
      let dbPrice = 0
      let dbDiff = 0
      let dbDiffPct = 0
      let isOldPre10Pct = false

      if (dbItem) {
        dbPrice = Number(dbItem.Don_gia) || 0
        dbDiff = dbPrice - targetPrice
        dbDiffPct = targetPrice > 0 ? (dbDiff / targetPrice) * 100 : 0
        if (Math.abs(dbDiff) < 1) {
          dbStatus = 'match'
        } else {
          dbStatus = 'diff'
          if (dbPrice > 0 && Math.abs(dbPrice * 1.1 - targetPrice) / targetPrice < 0.015) {
            isOldPre10Pct = true
          }
        }
      }

      results.push({
        id: `${sku}-${band}`,
        product,
        pkg,
        type,
        term,
        band,
        sku,
        posCode,
        imgPrice,
        gocFound,
        gocPrice,
        gocPivotRow,
        gocPivotColLetter,
        gocSaleRow,
        gocStatus,
        mauPrice,
        mauPivotRow,
        mauSaleRow,
        mauStatus,
        mauIsOldPre10,
        dbItem,
        dbPrice,
        dbStatus,
        dbDiff,
        dbDiffPct,
        isOldPre10Pct,
        targetPrice,
        selected: dbStatus !== 'match'
      })
    }
  }

  kasComparisonRows.value = results
  kasCheckActiveStep.value = 2
}

const openKasExcelNavigator = ({ fileType = 'kas_goc', sheet = 'SMB+Enterprise (License)', rowNum = 11, colLetter = 'I', sku = '', band = '', itemName = '' }) => {
  const qs = new URLSearchParams({
    file: fileType,
    sheet: sheet,
    row: String(rowNum || 11),
    col: colLetter || 'I',
    sku: String(sku || '').trim().toUpperCase(),
    band: band || '',
    name: itemName || ''
  }).toString()
  window.open(`/template_excel/sophos_excel_viewer.html?${qs}`, '_blank')
}

const kasComparisonSummary = computed(() => {
  const rows = kasComparisonRows.value
  return {
    gocMatch: rows.filter(r => r.gocStatus === 'match').length,
    gocDiff: rows.filter(r => r.gocStatus === 'diff').length,
    gocMissing: rows.filter(r => r.gocStatus === 'missing').length,
    mauMatch: rows.filter(r => r.mauStatus === 'match').length,
    mauDiff: rows.filter(r => r.mauStatus === 'diff').length,
    mauMissingPivot: rows.filter(r => !r.mauPivotRow).length,
    dbMatch: rows.filter(r => r.dbStatus === 'match').length,
    dbDiff: rows.filter(r => r.dbStatus === 'diff').length,
    dbMissing: rows.filter(r => r.dbStatus === 'missing').length,
    dbOldPre10Count: rows.filter(r => r.isOldPre10Pct).length
  }
})

const filteredKasComparisonRows = computed(() => {
  let list = kasComparisonRows.value
  if (kasCompareBandFilter.value !== 'ALL') {
    list = list.filter(r => r.band === kasCompareBandFilter.value)
  }
  const mode = kasCompareFilterMode.value
  if (mode === 'db_issue') return list.filter(r => r.dbStatus === 'diff' || r.dbStatus === 'missing')
  if (mode === 'db_diff') return list.filter(r => r.dbStatus === 'diff')
  if (mode === 'db_missing') return list.filter(r => r.dbStatus === 'missing')
  return list
})

const selectedKasComparisonRowsCount = computed(() => {
  return kasComparisonRows.value.filter(r => r.selected).length
})

const allFilteredKasCompareSelected = computed(() => {
  const list = filteredKasComparisonRows.value
  return list.length > 0 && list.every(r => r.selected)
})

const toggleSelectAllFilteredKasCompare = (checked) => {
  filteredKasComparisonRows.value.forEach(r => {
    r.selected = checked
  })
}

const selectAllNeedSyncKasRows = () => {
  kasComparisonRows.value.forEach(r => {
    r.selected = r.dbStatus !== 'match'
  })
}

const resolveKasCompareFileMeta = async () => {
  if (kasCheckCurrentFileMeta.value) {
    let url = ''
    if (kasCheckCurrentFileMeta.value.uploadPromise) {
      try {
        url = (await kasCheckCurrentFileMeta.value.uploadPromise) || ''
      } catch (_) {}
    }
    return {
      file_name: kasCheckCurrentFileMeta.value.file_name,
      file_url: url,
      file_type: 'image_check',
      file_uploaded_at: kasCheckCurrentFileMeta.value.file_uploaded_at || new Date().toISOString(),
      ghi_chu_file: 'Ảnh Check Giá Kaspersky'
    }
  }
  const kMeta = vendorRefFilesMeta.value?.kaspersky
  if (kMeta && (kMeta.goc_file_name || kMeta.import_file_name)) {
    const fName = kMeta.goc_file_name || kMeta.import_file_name
    const fUrl = kMeta.goc_file_url || kMeta.import_file_url || ''
    const ts = kMeta.goc_updated_at || kMeta.import_updated_at || kMeta.updated_at
    return {
      file_name: fName,
      file_url: fUrl,
      file_type: 'excel_import',
      file_uploaded_at: ts ? new Date(ts).toISOString() : new Date().toISOString(),
      ghi_chu_file: 'Đồng bộ Đối chiếu Kaspersky'
    }
  }
  return null
}

const buildHangHoaPayloadFromKasCompareRow = (cmpRow, resolvedFileMeta = null) => {
  const maHang = cmpRow.posCode
    ? `${cmpRow.posCode} - ${cmpRow.sku} - ${cmpRow.band} - ${cmpRow.type} - ${cmpRow.term} - ${cmpRow.pkg}`.replace(/\s+/g, ' ').trim()
    : `${cmpRow.sku} - ${cmpRow.band} - ${cmpRow.type} - ${cmpRow.term} - ${cmpRow.pkg}`.replace(/\s+/g, ' ').trim()
  const tenHang = `${cmpRow.product} (${cmpRow.type} - ${cmpRow.term} - ${cmpRow.band})`
  const danhMuc = String(cmpRow.product || 'KASPERSKY').trim().toUpperCase()

  let payload
  if (cmpRow.dbItem) {
    payload = buildFirebaseHangHoaPayload({
      ...cmpRow.dbItem,
      Ma_hang: maHang,
      sku_code: cmpRow.sku || cmpRow.posCode || cmpRow.dbItem.sku_code || '',
      Don_gia: cmpRow.targetPrice,
      Gia_tieu_chuan: cmpRow.targetPrice,
      Type: cmpRow.type || cmpRow.dbItem.Type || '',
      Trang_thai: 'Còn hàng',
      Ghi_chu: cmpRow.posCode ? `PositionCode: ${cmpRow.posCode} | SKU: ${cmpRow.sku}` : (cmpRow.dbItem.Ghi_chu || '')
    })
  } else {
    // Tìm Features mẫu từ sản phẩm cùng Danh_muc trong DB nếu có
    const sampleSameCat = items.value.find(
      it => String(it.Danh_muc || '').toUpperCase() === danhMuc && it.Features
    )

    payload = buildFirebaseHangHoaPayload({
      Ma_hang: maHang,
      sku_code: cmpRow.sku || cmpRow.posCode || '',
      Ten_hang: tenHang,
      Description: `${cmpRow.product} - ${cmpRow.type} - ${cmpRow.term} - ${cmpRow.band}`,
      Main_img: '',
      Ma_nha_cung_cap: 'KASPERSKY',
      Ten_nha_cung_cap: 'KASPERSKY',
      Mo_ta_chung: '',
      Mo_ta_chi_tiet: '',
      Features: sampleSameCat?.Features || '',
      Danh_muc: danhMuc,
      License_duration: cmpRow.term,
      DVT: cmpRow.pkg || 'License',
      Gia_tieu_chuan: cmpRow.targetPrice,
      Don_gia: cmpRow.targetPrice,
      Trang_thai: 'Còn hàng',
      Don_vi_tien_te: 'VND',
      Ti_gia: 1,
      Thue_VAT: 0,
      Ma_hang_lien_ket: '',
      Ten_hang_lien_ket: '',
      Ghi_chu: cmpRow.posCode ? `PositionCode: ${cmpRow.posCode} | SKU: ${cmpRow.sku}` : `SKU: ${cmpRow.sku}`,
      gia_hardware: 0,
      gia_nhap: 0,
      muc_phan_tram_off: 0,
      Type: cmpRow.type,
      thoi_han_bao_hanh: '',
      volume: cmpRow.band
    })
  }

  if (resolvedFileMeta && resolvedFileMeta.file_name) {
    payload.danh_sach_file = appendFileEntryToProductHistory(
      cmpRow.dbItem?.danh_sach_file || [],
      resolvedFileMeta,
      {
        gia_von: payload.Gia_tieu_chuan,
        don_gia: payload.Don_gia,
        gia_nhap: payload.gia_nhap,
        don_vi_tien_te: payload.Don_vi_tien_te
      }
    )
  }

  return payload
}

const syncSingleKasCompareRowToDb = async (cmpRow) => {
  if (!cmpRow) return
  syncingKasCompareToDb.value = true
  try {
    const resolvedFileMeta = await resolveKasCompareFileMeta()
    const payload = buildHangHoaPayloadFromKasCompareRow(cmpRow, resolvedFileMeta)
    if (cmpRow.dbItem && cmpRow.dbItem._firebaseKey) {
      await update(dbRef(database, `hang_hoa/${cmpRow.dbItem._firebaseKey}`), payload)
      showAsyncSuccess('Đã cập nhật giá Kaspersky!', `${payload.Ten_hang} → ${formatVndPrice(payload.Don_gia)}`)
    } else {
      const newRef = push(dbRef(database, 'hang_hoa'))
      await set(newRef, payload)
      if (payload.Danh_muc) {
        await rebuildCategoryLinksFirebase(payload.Danh_muc)
      }
      showAsyncSuccess('Đã thêm mã Kaspersky vào DB!', `${payload.Ten_hang} → ${formatVndPrice(payload.Don_gia)}`)
    }
    await fetchData()
    await syncAutoUpdatePriceListsInFirebase()
    await runKasPriceComparison()
  } catch (err) {
    console.error('Lỗi đồng bộ Kaspersky vào Database:', err)
    showAsyncError('Lỗi đồng bộ Firebase', err.message)
  } finally {
    syncingKasCompareToDb.value = false
  }
}

const syncSelectedKasCompareRowsToDb = async () => {
  const selectedList = kasComparisonRows.value.filter(r => r.selected)
  if (!selectedList.length) return

  syncingKasCompareToDb.value = true
  showAsyncLoading('Đang đồng bộ Kaspersky vào Database...', `Đang xử lý ${selectedList.length} mức giá...`)
  try {
    const resolvedFileMeta = await resolveKasCompareFileMeta()
    const batchUpdates = {}
    const touchedCategories = new Set()
    let updatedCount = 0
    let addedCount = 0

    for (const cmpRow of selectedList) {
      const payload = buildHangHoaPayloadFromKasCompareRow(cmpRow, resolvedFileMeta)
      if (payload.Danh_muc) touchedCategories.add(payload.Danh_muc)

      if (cmpRow.dbItem && cmpRow.dbItem._firebaseKey) {
        batchUpdates[cmpRow.dbItem._firebaseKey] = payload
        updatedCount++
      } else {
        const newKey = push(dbRef(database, 'hang_hoa')).key
        batchUpdates[newKey] = payload
        addedCount++
      }
    }

    await update(dbRef(database, 'hang_hoa'), batchUpdates)

    for (const cat of touchedCategories) {
      await rebuildCategoryLinksFirebase(cat)
    }

    await fetchData()
    await syncAutoUpdatePriceListsInFirebase()
    await runKasPriceComparison()

    showAsyncSuccess(
      'Đồng bộ Kaspersky thành công!',
      `Đã cập nhật: ${updatedCount} mã · Thêm mới: ${addedCount} mã.`
    )
  } catch (err) {
    console.error('Lỗi đồng bộ hàng loạt Kaspersky:', err)
    showAsyncError('Lỗi đồng bộ Database', err.message)
  } finally {
    syncingKasCompareToDb.value = false
  }
}

const exportKasComparisonToExcel = () => {
  if (!kasComparisonRows.value.length) return
  const prodName = kasCheckSettings.value.product || 'Kaspersky'
  const header = [
    'STT',
    'Product',
    'Package',
    'Type',
    'Term',
    'Band (Volume)',
    'SKU (PartNumber)',
    'Full SKU (PositionCode)',
    'Giá Ảnh (VND)',
    'Giá filegocKas.xlsx (VND)',
    'Dòng Pivot filegocKas',
    'Dòng SaleList filegocKas',
    'Giá KASPERSKY_file_mau_import (VND)',
    'Mã Hàng Trong Database',
    'Giá Database (VND)',
    'Chênh Lệch DB (VND)',
    'Trạng Thái Đối Chiếu DB'
  ]

  const rowsData = kasComparisonRows.value.map((r, idx) => [
    idx + 1,
    r.product,
    r.pkg,
    r.type,
    r.term,
    r.band,
    r.sku,
    r.posCode,
    r.imgPrice,
    r.gocFound ? r.gocPrice : 'Không có',
    r.gocPivotRow || '',
    r.gocSaleRow || '',
    r.mauPrice || 'Chưa có',
    r.dbItem ? r.dbItem.Ma_hang : 'Chưa có trong DB',
    r.dbItem ? r.dbPrice : '',
    r.dbItem ? Math.round(r.dbDiff) : '',
    r.dbStatus === 'match'
      ? 'Khớp giá DB'
      : (r.dbStatus === 'diff'
          ? `Lệch ${r.dbDiff > 0 ? '+' : ''}${Math.round(r.dbDiff).toLocaleString('vi-VN')} ₫ (${r.dbDiffPct.toFixed(1)}%)`
          : 'Thiếu trong DB')
  ])

  const ws = XLSX.utils.aoa_to_sheet([
    [`BÁO CÁO ĐỐI CHIẾU GIÁ KASPERSKY - ${prodName.toUpperCase()} (Effective: ${kasCheckSettings.value.effectiveDate || 'July 1, 2026'})`],
    [],
    header,
    ...rowsData
  ])
  ws['!cols'] = [
    { wch: 6 }, { wch: 30 }, { wch: 10 }, { wch: 14 },
    { wch: 10 }, { wch: 16 }, { wch: 16 }, { wch: 16 },
    { wch: 16 }, { wch: 18 }, { wch: 16 }, { wch: 18 },
    { wch: 22 }, { wch: 52 }, { wch: 18 }, { wch: 18 }, { wch: 28 }
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Doi_Chieu_Kaspersky')
  XLSX.writeFile(wb, `Doi_Chieu_Gia_Kaspersky_${prodName.replace(/\s+/g, '_')}.xlsx`)
}

// ═══════════════════════════════════════════════════════════════════════════
// ĐỐI CHIẾU TOÀN BỘ BẢNG GIÁ GỐC ACRONIS (file_goc_acronis.xlsx ⇄ ACRONIS_file_mau_import.xlsx ⇄ DATABASE)
// ═══════════════════════════════════════════════════════════════════════════
const showAcronisCompareModal = ref(false)
const acronisRefData = ref(null)
const loadingAcronisRef = ref(false)
const acronisComparisonRows = ref([])
const acronisCompareSheetFilter = ref('ALL')
const acronisCompareFilterMode = ref('all') // 'all' | 'db_issue' | 'db_diff' | 'db_missing'
const acronisCompareSearch = ref('')
const syncingAcronisCompareToDb = ref(false)

const loadAcronisRefData = async (forceReload = false) => {
  if (!forceReload && (acronisRefData.value || loadingAcronisRef.value)) return acronisRefData.value
  loadingAcronisRef.value = true
  vendorRefLoadError.value.acronis = ''
  try {
    const allMeta = await fetchVendorRefFilesMeta(forceReload)
    const meta = allMeta?.acronis
    if (!meta || !meta.index_url) {
      acronisRefData.value = null
      vendorRefLoadError.value.acronis = 'Chưa có File Gốc Acronis trên Cloudinary. Vui lòng bấm Upload File Mới lên Cloudinary để đối chiếu!'
      return null
    }
    const res = await fetch(meta.index_url)
    if (!res.ok) {
      throw new Error(`Không tải được dữ liệu Acronis từ Cloudinary (HTTP ${res.status})`)
    }
    const raw = await res.json()
    acronisRefData.value = hydrateAcronisRefData(raw)
  } catch (err) {
    console.error('Lỗi tải dữ liệu tham chiếu Acronis từ Cloudinary:', err)
    acronisRefData.value = null
    vendorRefLoadError.value.acronis = err.message || 'Không thể tải dữ liệu tham chiếu Acronis từ Cloudinary.'
  } finally {
    loadingAcronisRef.value = false
  }
  return acronisRefData.value
}

const acronisSheetNames = computed(() => {
  const refObj = acronisRefData.value
  if (refObj && Array.isArray(refObj.sheetNames) && refObj.sheetNames.length) {
    return refObj.sheetNames
  }
  return [...new Set(acronisComparisonRows.value.map(r => r.sheet).filter(Boolean))]
})

const openAcronisExcelNavigator = ({ fileType = 'acronis_goc', sheet = 'Protect Standard', rowNum = 4, colLetter = 'D', sku = '', itemName = '' }) => {
  const qs = new URLSearchParams({
    file: fileType,
    sheet: sheet || 'Protect Standard',
    row: String(rowNum || 4),
    col: colLetter || 'D',
    sku: String(sku || '').trim().toUpperCase(),
    name: itemName || ''
  }).toString()
  window.open(`/template_excel/sophos_excel_viewer.html?${qs}`, '_blank')
}

const matchDatabaseItemForAcronisRow = (entry) => {
  if (!entry) return null
  const maHangUpper = String(entry.maHang || '').trim().toUpperCase()
  const skuUpper = String(entry.sku || '').trim().toUpperCase()
  const skuForUpper = String(entry.skuFor || '').trim().toUpperCase()
  const moTaLower = String(entry.moTa || '').trim().toLowerCase()

  // 1. Khớp chính xác theo Ma_hang = "${skuFor} - ${sku}" hoặc "${sku}"
  if (maHangUpper) {
    const exactMa = items.value.find(it => String(it.Ma_hang || '').trim().toUpperCase() === maHangUpper)
    if (exactMa) return exactMa
  }

  // 2. Khớp theo cả skuFor + sku nằm trong Ma_hang
  if (skuUpper && skuForUpper) {
    const bothMatch = items.value.find(it => {
      const mh = String(it.Ma_hang || '').trim().toUpperCase()
      return mh.includes(skuForUpper) && mh.includes(skuUpper)
    })
    if (bothMatch) return bothMatch
  }

  // 3. Khớp theo SKU đơn lẻ trong Ma_hang hoặc Ghi_chu của các sản phẩm Acronis
  if (skuUpper) {
    const skuMatch = items.value.find(it => {
      const ncc = String(it.Ten_nha_cung_cap || it.Ma_nha_cung_cap || '').toUpperCase()
      const mh = String(it.Ma_hang || '').trim().toUpperCase()
      const gc = String(it.Ghi_chu || '').toUpperCase()
      const tokens = mh.split(/[\s\-|]+/).map(s => s.trim())
      return tokens.includes(skuUpper) || (ncc.includes('ACRONIS') && gc.includes(skuUpper))
    })
    if (skuMatch) return skuMatch
  }

  // 4. Khớp chính xác theo Tên hàng (Mô tả sản phẩm) thuộc NCC Acronis
  if (moTaLower) {
    const nameMatch = items.value.find(it => {
      const ncc = String(it.Ten_nha_cung_cap || it.Ma_nha_cung_cap || '').toUpperCase()
      return ncc.includes('ACRONIS') && String(it.Ten_hang || '').trim().toLowerCase() === moTaLower
    })
    if (nameMatch) return nameMatch
  }

  return null
}

const runAcronisPriceComparison = async () => {
  await loadAcronisRefData()
  if (!items.value.length) {
    await fetchData()
  }

  const refObj = acronisRefData.value || {}
  const gocItems = refObj.gocItems || []
  const mauByMaHang = refObj.mauByMaHang || {}
  const mauBySku = refObj.mauBySku || {}
  const results = []

  for (const g of gocItems) {
    const maKey = String(g.maHang || '').trim().toUpperCase()
    const skuKey = String(g.sku || '').trim().toUpperCase()
    const mauEntry = (maKey && mauByMaHang[maKey]) || (skuKey && mauBySku[skuKey]) || null
    const mauFound = Boolean(mauEntry)
    const mauPrice = mauEntry ? (Number(mauEntry.price) || 0) : 0
    const mauRowNum = mauEntry?.rowNum || null
    const mauSheet = mauEntry?.sheet || g.sheet
    const gocPrice = Number(g.price) || 0

    const mauStatus = !mauFound
      ? 'missing'
      : (Math.abs(gocPrice - mauPrice) < 1 ? 'match' : 'diff')

    const dbItem = matchDatabaseItemForAcronisRow(g)
    let dbStatus = 'missing'
    let dbPrice = 0
    let dbDiff = 0
    let dbDiffPct = 0

    if (dbItem) {
      dbPrice = Number(dbItem.Don_gia) || 0
      dbDiff = dbPrice - gocPrice
      dbDiffPct = gocPrice > 0 ? (dbDiff / gocPrice) * 100 : 0
      dbStatus = Math.abs(dbDiff) < 1 ? 'match' : 'diff'
    }

    results.push({
      id: `${g.sheet}-${g.rowNum}-${g.maHang}`,
      sheet: g.sheet,
      gocRowNum: g.rowNum,
      category: g.category || g.sheet,
      subType: g.subType || '',
      skuFor: g.skuFor || '',
      sku: g.sku || '',
      maHang: g.maHang || '',
      moTa: g.moTa || '',
      features: g.features || '',
      licenseDuration: g.licenseDuration || '',
      type: g.type || '',
      volume: g.volume || '',
      gocPrice,
      mauFound,
      mauEntry,
      mauPrice,
      mauRowNum,
      mauSheet,
      mauStatus,
      dbItem,
      dbPrice,
      dbStatus,
      dbDiff,
      dbDiffPct,
      targetPrice: gocPrice,
      selected: dbStatus !== 'match'
    })
  }

  acronisComparisonRows.value = results
}

const openAcronisCompareModal = async (initialSheet = 'ALL', initialSearch = '') => {
  showAcronisCompareModal.value = true
  acronisCompareSheetFilter.value = initialSheet && typeof initialSheet === 'string' ? initialSheet : 'ALL'
  acronisCompareSearch.value = typeof initialSearch === 'string' ? initialSearch : ''
  acronisCompareFilterMode.value = 'all'
  await runAcronisPriceComparison()
}

const handleCustomAcronisExcelUpload = (e, role = 'goc') => {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  showAsyncLoading('☁️ Đang đọc & đẩy file Acronis lên Cloudinary...', `File: ${file.name}`)
  const reader = new FileReader()
  reader.onload = (evt) => {
    setTimeout(async () => {
      try {
        const data = new Uint8Array(evt.target.result)
        const wb = XLSX.read(data, { type: 'array', cellStyles: true })
        const res = await uploadAndPersistVendorRefWorkbook('acronis', file, wb, role)
        await runAcronisPriceComparison()
        if (showCardRefCompareModal.value && cardRefCompareData.value?.vendor === 'acronis' && cardRefCompareData.value?.item) {
          cardRefCompareData.value = await resolveAcronisCardCompare(cardRefCompareData.value.item)
        }
        showAsyncSuccess('☁️ Đã cập nhật Acronis lên Cloudinary!', res.summaryText)
      } catch (err) {
        console.error('Lỗi upload file Acronis lên Cloudinary:', err)
        showAsyncError('Lỗi cập nhật Cloudinary', err.message)
      }
    }, 50)
  }
  reader.readAsArrayBuffer(file)
  e.target.value = ''
}

const acronisComparisonSummary = computed(() => {
  const rows = acronisComparisonRows.value
  return {
    mauMatch: rows.filter(r => r.mauStatus === 'match').length,
    mauDiff: rows.filter(r => r.mauStatus === 'diff').length,
    mauMissing: rows.filter(r => r.mauStatus === 'missing').length,
    dbMatch: rows.filter(r => r.dbStatus === 'match').length,
    dbDiff: rows.filter(r => r.dbStatus === 'diff').length,
    dbMissing: rows.filter(r => r.dbStatus === 'missing').length
  }
})

const filteredAcronisComparisonRows = computed(() => {
  let list = acronisComparisonRows.value
  if (acronisCompareSheetFilter.value !== 'ALL') {
    list = list.filter(r => r.sheet === acronisCompareSheetFilter.value)
  }
  const mode = acronisCompareFilterMode.value
  if (mode === 'db_issue') list = list.filter(r => r.dbStatus === 'diff' || r.dbStatus === 'missing')
  else if (mode === 'db_diff') list = list.filter(r => r.dbStatus === 'diff')
  else if (mode === 'db_missing') list = list.filter(r => r.dbStatus === 'missing')

  const kw = acronisCompareSearch.value.trim().toLowerCase()
  if (kw) {
    list = list.filter(r =>
      String(r.sku || '').toLowerCase().includes(kw) ||
      String(r.skuFor || '').toLowerCase().includes(kw) ||
      String(r.maHang || '').toLowerCase().includes(kw) ||
      String(r.moTa || '').toLowerCase().includes(kw) ||
      String(r.category || '').toLowerCase().includes(kw)
    )
  }
  return list
})

const selectedAcronisComparisonRowsCount = computed(() => {
  return acronisComparisonRows.value.filter(r => r.selected).length
})

const allFilteredAcronisCompareSelected = computed(() => {
  const list = filteredAcronisComparisonRows.value
  return list.length > 0 && list.every(r => r.selected)
})

const toggleSelectAllFilteredAcronisCompare = (checked) => {
  filteredAcronisComparisonRows.value.forEach(r => {
    r.selected = checked
  })
}

const selectAllNeedSyncAcronisRows = () => {
  acronisComparisonRows.value.forEach(r => {
    r.selected = r.dbStatus !== 'match'
  })
}

const resolveAcronisCompareFileMeta = () => {
  const aMeta = vendorRefFilesMeta.value?.acronis
  if (aMeta && (aMeta.goc_file_name || aMeta.import_file_name || aMeta.mau_file_name)) {
    const fName = aMeta.goc_file_name || aMeta.import_file_name || aMeta.mau_file_name
    const fUrl = aMeta.goc_file_url || aMeta.import_file_url || aMeta.mau_file_url || ''
    const ts = aMeta.goc_updated_at || aMeta.import_updated_at || aMeta.mau_updated_at || aMeta.updated_at
    return {
      file_name: fName,
      file_url: fUrl,
      file_type: 'excel_import',
      file_uploaded_at: ts ? new Date(ts).toISOString() : new Date().toISOString(),
      ghi_chu_file: 'Đồng bộ Đối chiếu Acronis'
    }
  }
  return null
}

const buildHangHoaPayloadFromAcronisCompareRow = (cmpRow, resolvedFileMeta = null) => {
  const maHang = String(cmpRow.maHang || `${cmpRow.skuFor} - ${cmpRow.sku}`).trim()
  const danhMuc = String(cmpRow.category || cmpRow.sheet || 'ACRONIS').trim().toUpperCase()
  const noteParts = []
  if (cmpRow.skuFor && cmpRow.sku && cmpRow.skuFor !== cmpRow.sku) {
    noteParts.push(`SKU For: ${cmpRow.skuFor} | SKU: ${cmpRow.sku}`)
  }
  if (cmpRow.subType) noteParts.push(cmpRow.subType)

  let payload
  if (cmpRow.dbItem) {
    payload = buildFirebaseHangHoaPayload({
      ...cmpRow.dbItem,
      Ma_hang: cmpRow.dbItem.Ma_hang || maHang,
      sku_code: cmpRow.sku || cmpRow.skuFor || cmpRow.dbItem.sku_code || '',
      Ten_hang: cmpRow.moTa || cmpRow.dbItem.Ten_hang,
      Don_gia: cmpRow.targetPrice,
      Gia_tieu_chuan: cmpRow.targetPrice,
      Trang_thai: 'Còn hàng',
      Type: cmpRow.type || cmpRow.dbItem.Type || '',
      License_duration: cmpRow.licenseDuration || cmpRow.dbItem.License_duration || '',
      volume: cmpRow.volume || cmpRow.dbItem.volume || ''
    })
  } else {
    payload = buildFirebaseHangHoaPayload({
      Ma_hang: maHang,
      sku_code: cmpRow.sku || cmpRow.skuFor || '',
      Ten_hang: cmpRow.moTa,
      Description: cmpRow.moTa,
      Main_img: '',
      Ma_nha_cung_cap: 'ACRONIS',
      Ten_nha_cung_cap: 'ACRONIS',
      Mo_ta_chung: '',
      Mo_ta_chi_tiet: '',
      Features: cmpRow.features ? formatFeaturesHtml(cmpRow.features) : '',
      Danh_muc: danhMuc,
      License_duration: cmpRow.licenseDuration || '',
      DVT: 'License',
      Gia_tieu_chuan: cmpRow.targetPrice,
      Don_gia: cmpRow.targetPrice,
      Trang_thai: 'Còn hàng',
      Don_vi_tien_te: 'VND',
      Ti_gia: 1,
      Thue_VAT: 0,
      Ma_hang_lien_ket: '',
      Ten_hang_lien_ket: '',
      Ghi_chu: noteParts.join(' | '),
      gia_hardware: 0,
      gia_nhap: 0,
      muc_phan_tram_off: 0,
      Type: cmpRow.type || '',
      thoi_han_bao_hanh: '',
      volume: cmpRow.volume || ''
    })
  }

  if (resolvedFileMeta && resolvedFileMeta.file_name) {
    payload.danh_sach_file = appendFileEntryToProductHistory(
      cmpRow.dbItem?.danh_sach_file || [],
      resolvedFileMeta,
      {
        gia_von: payload.Gia_tieu_chuan,
        don_gia: payload.Don_gia,
        gia_nhap: payload.gia_nhap,
        don_vi_tien_te: payload.Don_vi_tien_te
      }
    )
  }

  return payload
}

const syncSingleAcronisCompareRowToDb = async (cmpRow) => {
  if (!cmpRow) return
  syncingAcronisCompareToDb.value = true
  try {
    const resolvedFileMeta = resolveAcronisCompareFileMeta()
    const payload = buildHangHoaPayloadFromAcronisCompareRow(cmpRow, resolvedFileMeta)
    if (cmpRow.dbItem && cmpRow.dbItem._firebaseKey) {
      await update(dbRef(database, `hang_hoa/${cmpRow.dbItem._firebaseKey}`), payload)
      showAsyncSuccess('Đã cập nhật giá Acronis!', `${payload.Ten_hang} → ${formatVndPrice(payload.Don_gia)}`)
    } else {
      const newRef = push(dbRef(database, 'hang_hoa'))
      await set(newRef, payload)
      if (payload.Danh_muc) {
        await rebuildCategoryLinksFirebase(payload.Danh_muc)
      }
      showAsyncSuccess('Đã thêm mã Acronis vào DB!', `${payload.Ten_hang} → ${formatVndPrice(payload.Don_gia)}`)
    }
    await fetchData()
    await syncAutoUpdatePriceListsInFirebase()
    await runAcronisPriceComparison()
  } catch (err) {
    console.error('Lỗi đồng bộ Acronis vào Database:', err)
    showAsyncError('Lỗi đồng bộ Firebase', err.message)
  } finally {
    syncingAcronisCompareToDb.value = false
  }
}

const syncSelectedAcronisCompareRowsToDb = async () => {
  const selectedList = acronisComparisonRows.value.filter(r => r.selected)
  if (!selectedList.length) return

  syncingAcronisCompareToDb.value = true
  showAsyncLoading('Đang đồng bộ Acronis vào Database...', `Đang xử lý ${selectedList.length} sản phẩm...`)
  try {
    const resolvedFileMeta = resolveAcronisCompareFileMeta()
    const batchUpdates = {}
    const touchedCategories = new Set()
    let updatedCount = 0
    let addedCount = 0

    for (const cmpRow of selectedList) {
      const payload = buildHangHoaPayloadFromAcronisCompareRow(cmpRow, resolvedFileMeta)
      if (payload.Danh_muc) touchedCategories.add(payload.Danh_muc)

      if (cmpRow.dbItem && cmpRow.dbItem._firebaseKey) {
        batchUpdates[cmpRow.dbItem._firebaseKey] = payload
        updatedCount++
      } else {
        const newKey = push(dbRef(database, 'hang_hoa')).key
        batchUpdates[newKey] = payload
        addedCount++
      }
    }

    await update(dbRef(database, 'hang_hoa'), batchUpdates)

    for (const cat of touchedCategories) {
      await rebuildCategoryLinksFirebase(cat)
    }

    await fetchData()
    await syncAutoUpdatePriceListsInFirebase()
    await runAcronisPriceComparison()

    showAsyncSuccess(
      'Đồng bộ Acronis thành công!',
      `Đã cập nhật: ${updatedCount} mã · Thêm mới: ${addedCount} mã.`
    )
  } catch (err) {
    console.error('Lỗi đồng bộ hàng loạt Acronis:', err)
    showAsyncError('Lỗi đồng bộ Database', err.message)
  } finally {
    syncingAcronisCompareToDb.value = false
  }
}

const exportAcronisComparisonToExcel = () => {
  if (!acronisComparisonRows.value.length) return
  const header = [
    'STT',
    'Sheet',
    'Danh mục',
    'SKU For',
    'SKU',
    'Mô tả sản phẩm',
    'Thời hạn',
    'Type',
    'Volume',
    'Giá file_goc_acronis.xlsx (VNĐ)',
    'Dòng file_goc_acronis',
    'Giá ACRONIS_file_mau_import.xlsx (VNĐ)',
    'Dòng ACRONIS_file_mau',
    'Mã Hàng Trong Database',
    'Giá Database (VNĐ)',
    'Chênh Lệch DB (VNĐ)',
    'Trạng Thái Đối Chiếu DB'
  ]

  const rowsData = filteredAcronisComparisonRows.value.map((r, idx) => [
    idx + 1,
    r.sheet,
    r.category,
    r.skuFor,
    r.sku,
    r.moTa,
    r.licenseDuration,
    r.type,
    r.volume,
    r.gocPrice,
    r.gocRowNum,
    r.mauFound ? r.mauPrice : 'Chưa có',
    r.mauRowNum || '',
    r.dbItem ? r.dbItem.Ma_hang : 'Chưa có trong DB',
    r.dbItem ? r.dbPrice : '',
    r.dbItem ? Math.round(r.dbDiff) : '',
    r.dbStatus === 'match'
      ? 'Khớp giá DB'
      : (r.dbStatus === 'diff'
          ? `Lệch ${r.dbDiff > 0 ? '+' : ''}${Math.round(r.dbDiff).toLocaleString('vi-VN')} ₫ (${r.dbDiffPct.toFixed(1)}%)`
          : 'Thiếu trong DB')
  ])

  const ws = XLSX.utils.aoa_to_sheet([
    ['BÁO CÁO ĐỐI CHIẾU BẢNG GIÁ GỐC ACRONIS (file_goc_acronis.xlsx ⇄ ACRONIS_file_mau_import.xlsx ⇄ Database)'],
    [],
    header,
    ...rowsData
  ])
  ws['!cols'] = [
    { wch: 6 }, { wch: 22 }, { wch: 32 }, { wch: 16 },
    { wch: 16 }, { wch: 52 }, { wch: 14 }, { wch: 14 },
    { wch: 16 }, { wch: 22 }, { wch: 16 }, { wch: 24 },
    { wch: 16 }, { wch: 28 }, { wch: 18 }, { wch: 18 }, { wch: 28 }
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Doi_Chieu_Acronis')
  XLSX.writeFile(wb, 'Doi_Chieu_Gia_Acronis_file_goc_acronis.xlsx')
}

// ═══════════════════════════════════════════════════════════════════════════
// ĐỐI CHIẾU TRỰC TIẾP TRÊN CARD HÀNG HÓA (SOPHOS / KASPERSKY / ACRONIS) VỚI FILE GỐC
// ═══════════════════════════════════════════════════════════════════════════
const showCardRefCompareModal = ref(false)
const cardRefCompareLoading = ref(false)
const cardRefCompareData = ref(null)
const syncingCardRefToDb = ref(false)

/**
 * Xác định một Card hàng hóa có thuộc SOPHOS, KASPERSKY hoặc ACRONIS không
 * @returns {'sophos' | 'kaspersky' | 'acronis' | null}
 */
const getCardVendorType = (item) => {
  if (!item) return null
  const ncc = String(item.Ten_nha_cung_cap || item.Ma_nha_cung_cap || '').trim().toUpperCase()
  const dm = String(item.Danh_muc || '').trim().toUpperCase()
  const th = String(item.Ten_hang || '').trim().toUpperCase()
  const mh = String(item.Ma_hang || '').trim().toUpperCase()

  if (ncc.includes('SOPHOS') || dm.includes('SOPHOS') || th.startsWith('SOPHOS')) {
    return 'sophos'
  }
  if (ncc.includes('KASPERSKY') || dm.includes('KASPERSKY') || th.startsWith('KASPERSKY') || /^KL\d{4}/i.test(mh)) {
    return 'kaspersky'
  }
  if (ncc.includes('ACRONIS') || dm.includes('ACRONIS') || th.includes('ACRONIS')) {
    return 'acronis'
  }
  return null
}

const resolveSophosCardCompare = async (item) => {
  await loadSophosRefData()
  const sRef = sophosRefData.value || { gocSkus: {}, trungGianItems: [], lpSophos: [], tgSkuLocations: {} }
  const gocMap = sRef.gocSkus || {}
  const tgList = sRef.trungGianItems || []
  const lpList = sRef.lpSophos || []
  const tgLocMap = sRef.tgSkuLocations || {}

  const mh = String(item.Ma_hang || '').trim().toUpperCase()
  const itemSkuCode = String(item.sku_code || '').trim().toUpperCase()
  const gc = String(item.Ghi_chu || '')
  const skuFromNote = ((gc.match(/SKU:\s*([A-Z0-9]+)/i) || [])[1] || '').toUpperCase()

  let sku = ''
  if (itemSkuCode && gocMap[itemSkuCode]) sku = itemSkuCode
  else if (gocMap[mh]) sku = mh
  else if (skuFromNote && gocMap[skuFromNote]) sku = skuFromNote
  else if (itemSkuCode) sku = itemSkuCode

  // Tìm trong file_trung_gian_SOPHOS
  let tgEntry = tgList.find(t => (sku && t.sku === sku) || t.sku === mh || (skuFromNote && t.sku === skuFromNote)) || null
  if (!tgEntry) {
    const dmLower = String(item.Danh_muc || '').trim().toLowerCase()
    const thLower = String(item.Ten_hang || '').trim().replace(/:$/, '').toLowerCase()
    // 1. Khớp chính xác group + dòng đầu moTa
    tgEntry = tgList.find(t => {
      const grp = String(t.group || '').trim().toLowerCase()
      const firstLine = String(t.moTa || '').split('\n')[0].trim().replace(/:$/, '').toLowerCase()
      return grp === dmLower && firstLine === thLower
    }) || null
    // 2. Khớp group + moTa chứa Ten_hang
    if (!tgEntry && dmLower && thLower) {
      tgEntry = tgList.find(t => {
        const grp = String(t.group || '').trim().toLowerCase()
        return grp === dmLower && String(t.moTa || '').toLowerCase().includes(thLower)
      }) || null
    }
    // 3. Khớp dòng đầu moTa trên toàn bộ danh sách
    if (!tgEntry && thLower) {
      tgEntry = tgList.find(t => {
        const firstLine = String(t.moTa || '').split('\n')[0].trim().replace(/:$/, '').toLowerCase()
        return firstLine === thLower
      }) || null
    }
  }

  if (tgEntry && !sku) {
    sku = String(tgEntry.sku || '').trim().toUpperCase()
  }
  if (!sku && /^[A-Z0-9]{8,16}$/.test(mh) && /\d/.test(mh)) {
    sku = mh
  }

  const gocEntry = (sku && gocMap[sku])
    ? gocMap[sku]
    : (sku === 'CFRAAB12ZZCAA' ? gocMap['CFRAAB12BANCAA'] : null)
  const gocFound = Boolean(gocEntry)
  const gocMsrp = gocEntry ? (Number(gocEntry.msrp) || 0) : 0
  const gocRowNum = gocEntry?.rowNum || null
  const skuListRowNum = gocEntry?.skuTabRow || null
  const skuListHwRowNum = gocEntry?.hwRow || null

  const tgLocations = (sku && tgLocMap[sku])
    ? [...tgLocMap[sku]]
    : (tgEntry && tgEntry.rowNum
        ? [{ sheet: tgEntry.sheet, rowNum: tgEntry.rowNum, colIndex: 1, colLetter: 'B', cell: tgEntry.cell || `B${tgEntry.rowNum}` }]
        : [])
  const tgFound = Boolean(tgEntry || tgLocations.length > 0)
  const tgMsrp = tgEntry ? (Number(tgEntry.msrp) || 0) : 0
  const tgSheet = tgEntry?.sheet || tgLocations[0]?.sheet || ''
  const tgRowNum = tgEntry?.rowNum || tgLocations[0]?.rowNum || null
  const tgGroup = tgEntry?.group || ''

  // Suy luận model XGS để lấy LP Sophos & Firewall Row
  const combinedModelText = `${item.Danh_muc || ''} ${tgGroup || ''} ${item.Ten_hang || ''}`
  const modelMatch = combinedModelText.match(/\b(XGS?\s*\d{2,4}w?)\b/i)
  const modelStr = modelMatch ? modelMatch[1].toUpperCase().replace(/\bXGS(\d)/i, 'XGS $1').replace(/\s+/g, ' ') : ''
  const lpRow = modelStr ? lpList.find(x => String(x.model || '').toUpperCase() === modelStr) : null
  const lpRowNum = lpRow?.rowNum || null
  let lpOldUsd = 0
  const thLower = String(item.Ten_hang || '').toLowerCase()
  if (lpRow) {
    if (sku.startsWith('XG') || thLower.includes('hardware appliance')) lpOldUsd = Number(lpRow.oldHwUsd) || 0
    else if (sku.startsWith('XS') || thLower.includes('xstream protection')) lpOldUsd = Number(lpRow.oldXstream1YUsd) || 0
    else if (sku.startsWith('SP') || thLower.includes('standard protection')) lpOldUsd = Number(lpRow.oldStd1YUsd) || 0
  }
  if (!lpOldUsd && gocEntry?.prevPrice) {
    lpOldUsd = Number(gocEntry.prevPrice) || 0
  }

  const tgNhapKhau = tgEntry
    ? (Number(tgEntry.nhapKhau) || 0)
    : (lpRow && sku.startsWith('XG') ? (Number(lpRow.nhapKhauUsd) || 0) : 0)

  const gocFirewallRowNum = getFirewallSheetRowNumForItem(item.Ten_hang, sku)

  const dbPrice = Number(item.Don_gia) || 0
  const dbGiaNhap = Number(item.gia_nhap) || 0
  const refPrice = gocFound && gocMsrp > 0 ? gocMsrp : (tgFound && tgMsrp > 0 ? tgMsrp : 0)
  const priceDiff = refPrice > 0 ? (dbPrice - refPrice) : 0
  const priceDiffPct = refPrice > 0 ? (priceDiff / refPrice) * 100 : 0

  let status = 'not_found'
  if (gocFound || tgFound) {
    status = Math.abs(priceDiff) < 0.05 ? 'match' : 'diff'
  }

  return {
    vendor: 'sophos',
    item,
    sku,
    gocFound,
    gocEntry,
    gocMsrp,
    gocRowNum,
    skuListRowNum,
    skuListHwRowNum,
    gocFirewallRowNum,
    tgFound,
    tgEntry,
    tgMsrp,
    tgNhapKhau,
    tgSheet,
    tgRowNum,
    tgGroup,
    tgLocations,
    lpRowNum,
    lpOldUsd,
    dbPrice,
    dbGiaNhap,
    refPrice,
    priceDiff,
    priceDiffPct,
    status
  }
}

const resolveKasperskyCardCompare = async (item) => {
  await loadKasRefData()
  const kRef = kasRefData.value || {}
  const gocPivotMap = kRef.gocPivotBySku || {}
  const mauPivotMap = kRef.mauPivotBySku || {}
  const gocSaleMap = kRef.gocSaleBySkuBand || {}
  const mauSaleMap = kRef.mauSaleBySkuBand || {}

  const mh = String(item.Ma_hang || '').trim()
  const itemSkuCode = String(item.sku_code || '').trim().toUpperCase()
  const gc = String(item.Ghi_chu || '').trim()
  const klTokens = [
    ...(itemSkuCode ? [itemSkuCode] : []),
    ...(mh.match(/KL\d{4}[A-Z0-9*]+/gi) || []),
    ...(gc.match(/KL\d{4}[A-Z0-9*]+/gi) || [])
  ].map(s => s.toUpperCase())

  let sku = klTokens.find(t => t.includes('*') && gocPivotMap[t])
    || klTokens.find(t => gocPivotMap[t])
    || klTokens.find(t => t.includes('*'))
    || klTokens[0]
    || ''

  let band = String(item.volume || '').trim()
  if (!band) {
    const bandMatch = mh.match(/(Band\s+[A-Z0-9]+:\s*\d+(?:-\d+|\+)?)/i)
      || String(item.Ten_hang || '').match(/(Band\s+[A-Z0-9]+:\s*\d+(?:-\d+|\+)?)/i)
    if (bandMatch) band = bandMatch[1].trim()
  }

  const gocPivotEntry = (sku && gocPivotMap[sku]) || null
  const mauPivotEntry = (sku && mauPivotMap[sku]) || null
  const skuBandKey = `${sku}||${band}`
  const gocSaleEntry = gocSaleMap[skuBandKey] || null
  const mauSaleEntry = mauSaleMap[skuBandKey] || null

  const posCode = gocSaleEntry?.posCode
    || mauSaleEntry?.posCode
    || klTokens.find(t => !t.includes('*') && t !== sku)
    || ''

  const gocPivotRow = gocPivotEntry?.rowNum || null
  const gocPivotColIdx = (gocPivotEntry?.bandCols && gocPivotEntry.bandCols[band] !== undefined)
    ? gocPivotEntry.bandCols[band]
    : 9
  const gocPivotColLetter = colIndexToLetter(gocPivotColIdx)
  const gocSaleRow = gocSaleEntry?.rowNum || null
  const gocPrice = Number(gocPivotEntry?.prices?.[band] ?? gocSaleEntry?.price ?? 0)
  const gocFound = Boolean(gocPivotEntry || gocSaleEntry)

  const mauPivotRow = mauPivotEntry?.rowNum || null
  const mauPivotColIdx = (mauPivotEntry?.bandCols && mauPivotEntry.bandCols[band] !== undefined)
    ? mauPivotEntry.bandCols[band]
    : gocPivotColIdx
  const mauPivotColLetter = colIndexToLetter(mauPivotColIdx)
  const mauSaleRow = mauSaleEntry?.rowNum || null
  const mauPrice = Number(mauPivotEntry?.prices?.[band] ?? mauSaleEntry?.price ?? 0)
  const mauFound = Boolean(mauPivotEntry || mauSaleEntry)

  const dbPrice = Number(item.Don_gia) || 0
  const refPrice = gocFound && gocPrice > 0 ? gocPrice : (mauFound && mauPrice > 0 ? mauPrice : 0)
  const priceDiff = refPrice > 0 ? (dbPrice - refPrice) : 0
  const priceDiffPct = refPrice > 0 ? (priceDiff / refPrice) * 100 : 0
  const mauIsOldPre10 = mauPrice > 0 && refPrice > 0 && Math.abs(mauPrice * 1.1 - refPrice) / refPrice < 0.015

  let status = 'not_found'
  if (gocFound || mauFound) {
    status = Math.abs(priceDiff) < 1 ? 'match' : 'diff'
  }

  return {
    vendor: 'kaspersky',
    item,
    sku,
    posCode,
    band,
    gocFound,
    gocPivotEntry,
    gocSaleEntry,
    gocPivotRow,
    gocPivotColLetter,
    gocSaleRow,
    gocPrice,
    mauFound,
    mauPivotRow,
    mauPivotColLetter,
    mauSaleRow,
    mauPrice,
    mauIsOldPre10,
    dbPrice,
    refPrice,
    priceDiff,
    priceDiffPct,
    status
  }
}

const resolveAcronisCardCompare = async (item) => {
  await loadAcronisRefData()
  const aRef = acronisRefData.value || {}
  const gocByMaHang = aRef.gocByMaHang || {}
  const gocBySku = aRef.gocBySku || {}
  const gocBySkuFor = aRef.gocBySkuFor || {}
  const gocItems = aRef.gocItems || []
  const mauByMaHang = aRef.mauByMaHang || {}
  const mauBySku = aRef.mauBySku || {}
  const mauBySkuFor = aRef.mauBySkuFor || {}

  const mh = String(item.Ma_hang || '').trim().toUpperCase()
  const itemSkuCode = String(item.sku_code || '').trim().toUpperCase()
  const thLower = String(item.Ten_hang || '').trim().toLowerCase()
  const parts = mh.split('-').map(s => s.trim()).filter(Boolean)

  let gocEntry = gocByMaHang[mh] || null
  if (!gocEntry && itemSkuCode) {
    gocEntry = gocBySku[itemSkuCode] || gocBySkuFor[itemSkuCode] || null
  }
  if (!gocEntry && parts.length >= 2) {
    gocEntry = gocBySku[parts[1]] || gocBySkuFor[parts[0]] || null
  }
  if (!gocEntry && parts.length === 1) {
    gocEntry = gocBySku[parts[0]] || gocBySkuFor[parts[0]] || null
  }
  if (!gocEntry && thLower) {
    gocEntry = gocItems.find(x => String(x.moTa || '').trim().toLowerCase() === thLower) || null
  }

  const sku = gocEntry?.sku || (parts.length >= 2 ? parts[1] : (parts[0] || ''))
  const skuFor = gocEntry?.skuFor || (parts.length >= 2 ? parts[0] : '')
  const maKey = gocEntry?.maHang ? String(gocEntry.maHang).toUpperCase() : mh

  const mauEntry = mauByMaHang[maKey]
    || (sku && mauBySku[sku.toUpperCase()])
    || (skuFor && mauBySkuFor[skuFor.toUpperCase()])
    || null

  const gocFound = Boolean(gocEntry)
  const gocPrice = gocEntry ? (Number(gocEntry.price) || 0) : 0
  const gocRowNum = gocEntry?.rowNum || null
  const sheet = gocEntry?.sheet || mauEntry?.sheet || 'Protect Standard'

  const mauFound = Boolean(mauEntry)
  const mauPrice = mauEntry ? (Number(mauEntry.price) || 0) : 0
  const mauRowNum = mauEntry?.rowNum || null
  const mauSheet = mauEntry?.sheet || sheet

  const dbPrice = Number(item.Don_gia) || 0
  const refPrice = gocFound && gocPrice > 0 ? gocPrice : (mauFound && mauPrice > 0 ? mauPrice : 0)
  const priceDiff = refPrice > 0 ? (dbPrice - refPrice) : 0
  const priceDiffPct = refPrice > 0 ? (priceDiff / refPrice) * 100 : 0

  let status = 'not_found'
  if (gocFound || mauFound) {
    status = Math.abs(priceDiff) < 1 ? 'match' : 'diff'
  }

  const catLower = String(gocEntry?.category || item.Danh_muc || '').trim().toLowerCase()
  const relatedItems = catLower
    ? gocItems.filter(x => String(x.category || '').trim().toLowerCase() === catLower)
    : []

  return {
    vendor: 'acronis',
    item,
    sku,
    skuFor,
    sheet,
    gocFound,
    gocEntry,
    gocRowNum,
    gocPrice,
    mauFound,
    mauEntry,
    mauRowNum,
    mauSheet,
    mauPrice,
    relatedItems,
    dbPrice,
    refPrice,
    priceDiff,
    priceDiffPct,
    status
  }
}

/**
 * Mở Modal Đối Chiếu File Gốc cho Card hàng hóa Sophos, Kaspersky hoặc Acronis
 */
const openCardOriginalFileCompare = async (item) => {
  const vendor = getCardVendorType(item)
  if (!vendor) return
  showCardRefCompareModal.value = true
  cardRefCompareLoading.value = true
  cardRefCompareData.value = { vendor, item, status: 'loading' }
  try {
    if (vendor === 'sophos') {
      cardRefCompareData.value = await resolveSophosCardCompare(item)
    } else if (vendor === 'acronis') {
      cardRefCompareData.value = await resolveAcronisCardCompare(item)
    } else {
      cardRefCompareData.value = await resolveKasperskyCardCompare(item)
    }
  } catch (err) {
    console.error('Lỗi đối chiếu file gốc trên card:', err)
  } finally {
    cardRefCompareLoading.value = false
  }
}

/**
 * Đồng bộ trực tiếp Card đang đối chiếu theo Giá chuẩn File Gốc vào Firebase `hang_hoa`
 */
const syncCardItemWithOriginalFile = async () => {
  const data = cardRefCompareData.value
  if (!data || !data.item || !data.item._firebaseKey || !(data.refPrice > 0)) return
  syncingCardRefToDb.value = true
  try {
    const existing = data.item
    const updatedFields = {
      ...existing,
      sku_code: data.sku || existing.sku_code || '',
      Don_gia: data.refPrice,
      Gia_tieu_chuan: data.refPrice
    }
    if (data.vendor === 'sophos') {
      if (data.tgNhapKhau > 0) {
        updatedFields.gia_nhap = data.tgNhapKhau
      }
      if (data.gocEntry?.desc && !existing.Description) {
        updatedFields.Description = data.gocEntry.desc
      }
      if (data.sku && !String(existing.Ghi_chu || '').includes(data.sku)) {
        updatedFields.Ghi_chu = [existing.Ghi_chu, `SKU: ${data.sku}`].filter(Boolean).join(' | ')
      }
    }
    const payload = buildFirebaseHangHoaPayload(updatedFields)
    await update(dbRef(database, `hang_hoa/${existing._firebaseKey}`), payload)
    await fetchData()
    await syncAutoUpdatePriceListsInFirebase()

    const refreshedItem = items.value.find(x => x._firebaseKey === existing._firebaseKey) || { ...existing, ...payload }
    if (data.vendor === 'sophos') {
      cardRefCompareData.value = await resolveSophosCardCompare(refreshedItem)
    } else if (data.vendor === 'acronis') {
      cardRefCompareData.value = await resolveAcronisCardCompare(refreshedItem)
    } else {
      cardRefCompareData.value = await resolveKasperskyCardCompare(refreshedItem)
    }
    showAsyncSuccess(
      'Đã cập nhật Card theo File Gốc!',
      `${refreshedItem.Ten_hang} → ${data.vendor === 'sophos' ? formatUsdPrice(data.refPrice) : formatVndPrice(data.refPrice)}`
    )
  } catch (err) {
    console.error('Lỗi cập nhật Card theo File Gốc:', err)
    showAsyncError('Lỗi cập nhật Database', err.message)
  } finally {
    syncingCardRefToDb.value = false
  }
}

// ═══ THAY ĐỔI TỈ GIÁ (DÀNH CHO USD) ═══
const showUsdRateModal = ref(false)
const newUsdExchangeRate = ref(26200)
const usdRateScope = ref('all') // 'all' | 'filtered'
const updatingUsdRate = ref(false)
const customDefaultUsdRate = ref(
  typeof localStorage !== 'undefined' && Number(localStorage.getItem('custom_usd_exchange_rate')) > 1
    ? Number(localStorage.getItem('custom_usd_exchange_rate'))
    : 0
)

const isUsdCurrencyItem = (item) => {
  return String(item?.Don_vi_tien_te || '').trim().toUpperCase() === 'USD'
}

const usdItems = computed(() => {
  return items.value.filter(isUsdCurrencyItem)
})

const filteredUsdItems = computed(() => {
  return filteredItems.value.filter(isUsdCurrencyItem)
})

const currentSystemUsdRate = computed(() => {
  if (customDefaultUsdRate.value > 1) return customDefaultUsdRate.value
  // Tìm tỉ giá phổ biến nhất trong các sản phẩm USD hiện có
  const freq = new Map()
  let bestRate = 0
  let bestCount = 0
  for (const it of usdItems.value) {
    const r = Number(it.Ti_gia) || 0
    if (r > 1) {
      const c = (freq.get(r) || 0) + 1
      freq.set(r, c)
      if (c > bestCount) {
        bestCount = c
        bestRate = r
      }
    }
  }
  if (bestRate > 1) return bestRate
  return Number(sophosRefData.value?.tiGiaTrungGian) || 26200
})

const openUsdRateModal = () => {
  newUsdExchangeRate.value = currentSystemUsdRate.value || 26200
  usdRateScope.value = 'all'
  showUsdRateModal.value = true
}

const closeUsdRateModal = () => {
  if (updatingUsdRate.value) return
  showUsdRateModal.value = false
}

const applyUsdExchangeRateUpdate = async () => {
  const rate = Math.round(Number(newUsdExchangeRate.value) || 0)
  if (!(rate > 0)) {
    showAsyncError('Tỉ giá không hợp lệ', 'Vui lòng nhập tỉ giá USD lớn hơn 0.')
    return
  }

  const targetList = usdRateScope.value === 'filtered' ? filteredUsdItems.value : usdItems.value
  updatingUsdRate.value = true
  showAsyncLoading('Đang cập nhật tỉ giá USD...', `Áp dụng mức ${formatCurrency(rate, 'VND')} cho ${targetList.length} sản phẩm USD`)

  try {
    customDefaultUsdRate.value = rate
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('custom_usd_exchange_rate', String(rate))
    }
    if (sophosRefData.value && typeof sophosRefData.value === 'object') {
      sophosRefData.value.tiGiaTrungGian = rate
    }

    const validTargets = targetList.filter(item => item && item._firebaseKey)
    const nowIso = new Date().toISOString()
    const CHUNK_SIZE = 400
    for (let i = 0; i < validTargets.length; i += CHUNK_SIZE) {
      const chunk = validTargets.slice(i, i + CHUNK_SIZE)
      const updatesObj = {}
      chunk.forEach(item => {
        updatesObj[`hang_hoa/${item._firebaseKey}/Ti_gia`] = rate
        updatesObj[`hang_hoa/${item._firebaseKey}/last_updated`] = nowIso
      })
      await update(dbRef(database), updatesObj)
    }

    // Cập nhật ngay trên state local để UI phản hồi tức thì
    const updatedKeys = new Set(validTargets.map(x => x._firebaseKey))
    items.value.forEach(item => {
      if (updatedKeys.has(item._firebaseKey)) {
        item.Ti_gia = rate
        item.last_updated = nowIso
      }
    })

    // Nếu người dùng đang mở sẵn dữ liệu import preview có dòng USD, cập nhật luôn tỉ giá USD trong bảng preview
    if (Array.isArray(importData.value) && importData.value.length > 0) {
      importData.value.forEach(row => {
        if (String(row.Don_vi_tien_te || '').trim().toUpperCase() === 'USD') {
          row.Ti_gia = rate
        }
      })
    }

    showUsdRateModal.value = false
    showAsyncSuccess(
      'Đã cập nhật tỉ giá USD thành công!',
      `Tỉ giá mới: ${formatCurrency(rate, 'VND')} • Đã áp dụng cho ${validTargets.length} sản phẩm USD.`
    )
  } catch (err) {
    console.error('Lỗi cập nhật tỉ giá USD:', err)
    showAsyncError('Lỗi cập nhật tỉ giá USD', err.message || 'Không thể lưu tỉ giá mới lên Firebase.')
  } finally {
    updatingUsdRate.value = false
  }
}

// =========================================================================
// GIỎ HÀNG BÁO GIÁ & CHUYỂN TÍNH TOÁN SANG TRANG BÁO GIÁ (ĐA TAB)
// =========================================================================
const router = useRouter()
const QUOTE_CART_STORAGE_KEY = 'nts_hanghoa_quote_cart_v1'
const quoteCart = ref([])
const showQuoteCartDrawer = ref(false)

const getCartItemKey = (item) => {
  if (!item || typeof item !== 'object') return ''
  return String(item._firebaseKey || item.Ma_hang || item.sku_code || item.Ten_hang || '').trim()
}

const saveQuoteCartToStorage = () => {
  try {
    if (!quoteCart.value.length) {
      localStorage.removeItem(QUOTE_CART_STORAGE_KEY)
    } else {
      localStorage.setItem(QUOTE_CART_STORAGE_KEY, JSON.stringify(quoteCart.value))
    }
  } catch (err) {
    console.warn('Không thể lưu giỏ hàng báo giá vào localStorage:', err)
  }
}

const restoreQuoteCartFromStorage = () => {
  try {
    const raw = localStorage.getItem(QUOTE_CART_STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      quoteCart.value = parsed.filter(x => x && x.key && Number(x.qty) > 0)
      if (quoteCart.value.length > 0) {
        showQuoteCartDrawer.value = true
      }
    }
  } catch (err) {
    console.warn('Không thể khôi phục giỏ hàng báo giá:', err)
  }
}

const getCartEntryByItem = (item) => {
  const key = getCartItemKey(item)
  if (!key) return null
  return quoteCart.value.find(e => e.key === key) || null
}

const isInQuoteCart = (item) => {
  const entry = getCartEntryByItem(item)
  return Boolean(entry && Number(entry.qty) > 0)
}

const getCartItemQty = (item) => {
  const entry = getCartEntryByItem(item)
  return entry ? Math.max(1, Number(entry.qty) || 1) : 0
}

const addToQuoteCart = (item) => {
  if (!item) return
  const key = getCartItemKey(item)
  if (!key) return
  const existing = quoteCart.value.find(e => e.key === key)
  if (existing) {
    existing.qty = Math.max(1, Number(existing.qty) || 1) + 1
    existing.itemSnapshot = JSON.parse(JSON.stringify(item))
  } else {
    quoteCart.value.push({
      key,
      qty: 1,
      itemSnapshot: JSON.parse(JSON.stringify(item))
    })
  }
  showQuoteCartDrawer.value = true
  saveQuoteCartToStorage()
}

const removeFromQuoteCart = (item) => {
  const key = getCartItemKey(item)
  if (!key) return
  const idx = quoteCart.value.findIndex(e => e.key === key)
  if (idx !== -1) {
    quoteCart.value.splice(idx, 1)
    if (!quoteCart.value.length) {
      showQuoteCartDrawer.value = false
    }
    saveQuoteCartToStorage()
  }
}

const updateQuoteCartQty = (item, deltaOrVal, isAbsolute = false) => {
  const key = getCartItemKey(item)
  if (!key) return
  const entry = quoteCart.value.find(e => e.key === key)
  if (!entry) return

  const nextQty = isAbsolute
    ? Math.floor(Number(deltaOrVal) || 0)
    : Math.floor((Number(entry.qty) || 1) + Number(deltaOrVal))

  if (nextQty <= 0) {
    removeFromQuoteCart(item)
    return
  }

  entry.qty = nextQty
  entry.itemSnapshot = JSON.parse(JSON.stringify(item))
  saveQuoteCartToStorage()
}

const onCardCartQtyInputChange = (item, event) => {
  const rawVal = Number(event?.target?.value)
  if (!Number.isFinite(rawVal) || rawVal <= 0) {
    removeFromQuoteCart(item)
    return
  }
  updateQuoteCartQty(item, Math.max(1, Math.floor(rawVal)), true)
}

const clearQuoteCart = () => {
  quoteCart.value = []
  showQuoteCartDrawer.value = false
  saveQuoteCartToStorage()
}

const resolveLatestCartItem = (entry) => {
  if (!entry) return null
  const found = items.value.find(it => getCartItemKey(it) === entry.key)
  return found || entry.itemSnapshot || null
}

const getEffectiveItemUnitPrice = (item) => {
  if (!item) return 0
  const plEntry = activePriceList.value ? getPriceListEntry(item) : null
  if (plEntry && plEntry.gia_ban_moi !== undefined && plEntry.gia_ban_moi !== null) {
    return toNum(plEntry.gia_ban_moi, toNum(item.Don_gia, 0))
  }
  return toNum(item.Don_gia, 0)
}

const quoteCartEnrichedList = computed(() => {
  return quoteCart.value
    .map(entry => {
      const item = resolveLatestCartItem(entry)
      if (!item) return null
      const qty = Math.max(1, Number(entry.qty) || 1)
      const effectiveUnitPrice = getEffectiveItemUnitPrice(item)
      const tiGia = String(item.Don_vi_tien_te || '').trim().toUpperCase() === 'USD'
        ? Math.max(1, toNum(item.Ti_gia, 1))
        : 1
      const unitPriceVnd = Math.round(effectiveUnitPrice * tiGia)
      const lineTotalVnd = unitPriceVnd * qty
      const vatPct = Math.max(0, toNum(item.Thue_VAT, 0))
      const lineAfterTaxVnd = Math.round(lineTotalVnd * (1 + vatPct / 100))
      return {
        key: entry.key,
        qty,
        item,
        effectiveUnitPrice,
        unitPriceVnd,
        lineTotalVnd,
        lineAfterTaxVnd
      }
    })
    .filter(Boolean)
})

const quoteCartTotalQty = computed(() => {
  return quoteCartEnrichedList.value.reduce((sum, e) => sum + e.qty, 0)
})

const quoteCartTotalBeforeTaxVnd = computed(() => {
  return quoteCartEnrichedList.value.reduce((sum, e) => sum + e.lineTotalVnd, 0)
})

const quoteCartTotalAfterTaxVnd = computed(() => {
  return quoteCartEnrichedList.value.reduce((sum, e) => sum + e.lineAfterTaxVnd, 0)
})

const proceedToCalculateQuote = () => {
  if (!quoteCartEnrichedList.value.length) return

  const payloadItems = quoteCartEnrichedList.value.map(entry => {
    const p = entry.item
    const effectiveDonGia = entry.effectiveUnitPrice
    const giaTC = toNum(p.Gia_tieu_chuan, 0)
    const tiGia = toNum(p.Ti_gia, 1) || 1
    const vat = toNum(p.Thue_VAT, 0)
    const giaHw = toNum(p.gia_hardware, 0)
    const giaNhap = toNum(p.gia_nhap, 0)
    const mucOff = toNum(p.muc_phan_tram_off, 0)

    return {
      Ma_hang: String(p.Ma_hang ?? '').trim(),
      sku_code: String(p.sku_code ?? '').trim(),
      Ten_hang: String(p.Ten_hang ?? ''),
      Description: String(p.Description ?? ''),
      Main_img: String(p.Main_img ?? ''),
      Ma_nha_cung_cap: String(p.Ma_nha_cung_cap ?? ''),
      Ten_nha_cung_cap: String(p.Ten_nha_cung_cap ?? ''),
      Mo_ta_chung: String(p.Mo_ta_chung ?? ''),
      Mo_ta_chi_tiet: String(p.Mo_ta_chi_tiet ?? ''),
      Features: String(p.Features ?? ''),
      Danh_muc: String(p.Danh_muc ?? '').toUpperCase(),
      License_duration: String(p.License_duration ?? ''),
      DVT: String(p.DVT ?? ''),
      Gia_tieu_chuan: giaTC,
      Don_gia: effectiveDonGia,
      Trang_thai: String(p.Trang_thai ?? ''),
      Don_vi_tien_te: String(p.Don_vi_tien_te || 'VND'),
      Ti_gia: tiGia,
      Thue_VAT: vat,
      Ma_hang_lien_ket: String(p.Ma_hang_lien_ket ?? ''),
      Ten_hang_lien_ket: String(p.Ten_hang_lien_ket ?? ''),
      Ghi_chu: String(p.Ghi_chu ?? ''),
      gia_hardware: giaHw,
      gia_nhap: giaNhap,
      muc_phan_tram_off: mucOff,
      Type: String(p.Type ?? '').trim(),
      thoi_han_bao_hanh: String(p.thoi_han_bao_hanh ?? ''),
      volume: String(p.volume ?? ''),
      So_luong: entry.qty,
      _Don_gia_goc: effectiveDonGia,
      _Gia_tieu_chuan_goc: giaTC,
      _Ti_gia_goc: tiGia,
      _Thue_VAT_goc: vat,
      _gia_hardware_goc: giaHw,
      _gia_nhap_goc: giaNhap,
      _muc_phan_tram_off_goc: mucOff
    }
  })

  try {
    localStorage.setItem('cloneQuoteProducts', JSON.stringify(payloadItems))
    if (selectedPriceListId.value) {
      localStorage.setItem('cloneQuotePriceListId', String(selectedPriceListId.value))
    } else {
      localStorage.removeItem('cloneQuotePriceListId')
    }
  } catch (err) {
    console.error('Lỗi lưu danh sách sản phẩm chuyển sang báo giá:', err)
  }

  // Làm trống giỏ hàng ngay sau khi đẩy sang tab báo giá
  clearQuoteCart()

  // Điều hướng sang trang Báo giá Firebase
  router.push('/baogiafirebase')
}

onMounted(async () => {
  restoreQuoteCartFromStorage()
  window.addEventListener('paste', handleGlobalPasteForImageCheck)
  window.addEventListener('click', closeFilterDropdownOnOutsideClick)
  fetchLatestGiaOff()
  fetchVendorRefFilesMeta()
  await Promise.all([fetchData(), fetchPriceLists()])
  await syncAutoUpdatePriceListsInFirebase()
})

onUnmounted(() => {
  window.removeEventListener('paste', handleGlobalPasteForImageCheck)
  window.removeEventListener('click', closeFilterDropdownOnOutsideClick)
  if (lazyLoadObserver) {
    lazyLoadObserver.disconnect()
    lazyLoadObserver = null
  }
  if (imageCheckPreviewUrl.value) {
    URL.revokeObjectURL(imageCheckPreviewUrl.value)
  }
})
</script>

<style scoped>
.quan-ly-hang-hoa {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.vendor-import-group {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
}

.vendor-import-group--sophos {
  border-color: rgba(59, 130, 246, 0.4);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.88), rgba(30, 58, 138, 0.35));
}

.vendor-import-group--kas {
  border-color: rgba(56, 189, 248, 0.38);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.88), rgba(6, 78, 59, 0.35));
}

.vendor-import-group--acronis {
  border-color: rgba(99, 102, 241, 0.42);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.88), rgba(49, 46, 129, 0.38));
}

.vendor-template-btn {
  font-size: 12px !important;
  padding: 5px 10px !important;
  font-weight: 600 !important;
  text-decoration: none;
  background: rgba(15, 23, 42, 0.65);
}

.vendor-uploaded-file-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 11px;
  color: #94a3b8;
  max-width: 280px;
  line-height: 1.25;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.68);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.vendor-uploaded-file-box--compact {
  max-width: 255px;
  padding: 2px 7px;
}

.vendor-uploaded-file-box__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.vendor-uploaded-file-box__line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 1;
}

.vendor-uploaded-file-box__link {
  text-decoration: underline;
  font-weight: 700;
  cursor: pointer;
}

.vendor-uploaded-file-box__link:hover {
  filter: brightness(1.2);
}

.vendor-file-download-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  flex-shrink: 0;
  padding: 2px 6px;
  border-radius: 5px;
  font-size: 10.5px;
  font-weight: 700;
  line-height: 1.2;
  cursor: pointer;
  color: #34d399;
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid rgba(16, 185, 129, 0.38);
  transition: all 0.15s ease;
  white-space: nowrap;
}

.vendor-file-download-btn:hover {
  background: rgba(16, 185, 129, 0.28);
  border-color: rgba(52, 211, 153, 0.7);
  color: #ecfdf5;
  transform: translateY(-1px);
}

.vendor-file-office-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  flex-shrink: 0;
  padding: 2px 7px;
  border-radius: 5px;
  font-size: 10.5px;
  font-weight: 700;
  line-height: 1.2;
  cursor: pointer;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.14);
  border: 1px solid rgba(56, 189, 248, 0.42);
  transition: all 0.15s ease;
  white-space: nowrap;
}

.vendor-file-office-btn:hover {
  background: rgba(56, 189, 248, 0.28);
  border-color: rgba(125, 211, 252, 0.8);
  color: #f0f9ff;
  transform: translateY(-1px);
}

.compare-office-embed-panel {
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  border: 1.5px solid rgba(56, 189, 248, 0.45);
  background: rgba(15, 23, 42, 0.96);
  overflow: hidden;
  margin-bottom: 12px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
}

.compare-office-embed-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 14px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 58, 138, 0.45));
  border-bottom: 1px solid rgba(56, 189, 248, 0.28);
  font-size: 12px;
}

.compare-office-role-btn {
  padding: 3px 9px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  color: #cbd5e1;
  background: rgba(30, 41, 59, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.3);
  transition: all 0.15s ease;
}

.compare-office-role-btn:hover {
  border-color: rgba(56, 189, 248, 0.55);
  color: #ffffff;
}

.compare-office-role-btn.active {
  background: rgba(56, 189, 248, 0.24);
  border-color: #38bdf8;
  color: #f0f9ff;
}

.compare-office-target-badge {
  padding: 2px 8px;
  border-radius: 5px;
  font-size: 11.5px;
  background: rgba(245, 158, 11, 0.16);
  border: 1px solid rgba(245, 158, 11, 0.4);
  color: #fde68a;
}

.compare-office-close-btn {
  padding: 3px 9px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.16);
  border: 1px solid rgba(239, 68, 68, 0.42);
}

.compare-office-close-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  color: #ffffff;
}

.compare-office-embed-body {
  height: 440px;
  min-height: 280px;
  resize: vertical;
  overflow: hidden;
  background: #0f172a;
  position: relative;
}

.compare-office-loading {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #38bdf8;
  font-size: 14px;
  font-weight: 700;
}

.compare-office-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: #ffffff;
}

.vendor-uploaded-file-box__time {
  font-size: 10.5px;
  color: #64748b;
  white-space: nowrap;
}

.vendor-uploaded-file-box__empty {
  font-size: 11px;
  color: #64748b;
  font-style: italic;
  white-space: nowrap;
}

.vendor-ref-slot {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 4px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.vendor-compare-group {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.28);
}

.vendor-compare-group--sophos {
  border-color: rgba(56, 189, 248, 0.42);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.88), rgba(8, 47, 73, 0.45));
}

.vendor-compare-group--kas {
  border-color: rgba(16, 185, 129, 0.42);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.88), rgba(6, 78, 59, 0.45));
}

.vendor-compare-group--acronis {
  border-color: rgba(129, 140, 248, 0.45);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.88), rgba(49, 46, 129, 0.48));
}

.vendor-ref-upload-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 7px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  user-select: none;
  border: 1px dashed rgba(148, 163, 184, 0.4);
  background: rgba(30, 41, 59, 0.85);
  color: #e2e8f0;
}

.vendor-ref-upload-btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.15);
}

.vendor-ref-upload-btn--sophos-goc {
  border-color: rgba(56, 189, 248, 0.55);
  color: #7dd3fc;
  background: rgba(14, 116, 144, 0.28);
}

.vendor-ref-upload-btn--sophos-tg {
  border-color: rgba(192, 132, 252, 0.55);
  color: #d8b4fe;
  background: rgba(107, 33, 168, 0.28);
}

.vendor-ref-upload-btn--kas-goc {
  border-color: rgba(52, 211, 153, 0.55);
  color: #6ee7b7;
  background: rgba(6, 95, 70, 0.32);
}

.vendor-ref-upload-btn--kas-tg {
  border-color: rgba(56, 189, 248, 0.55);
  color: #7dd3fc;
  background: rgba(3, 105, 161, 0.28);
}

.vendor-ref-upload-btn--acronis-goc {
  border-color: rgba(165, 180, 252, 0.6);
  color: #c7d2fe;
  background: rgba(67, 56, 202, 0.32);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.category-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  background: rgba(20, 184, 166, 0.15);
  color: #2dd4bf;
  border: 1px solid rgba(20, 184, 166, 0.3);
}

.vat-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  background: rgba(234, 179, 8, 0.15);
  color: #facc15;
  border: 1px solid rgba(234, 179, 8, 0.3);
  letter-spacing: 0.5px;
}

.duration-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.3);
  letter-spacing: 0.5px;
}

.btn-primary {
  background: linear-gradient(135deg, #0d9488, #0f766e);
  color: white;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
}
.btn-primary:hover {
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  box-shadow: 0 6px 16px rgba(13, 148, 136, 0.4);
  transform: translateY(-1px);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: #f8fafc;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  color: #14b8a6;
  border: 1px solid rgba(20, 184, 166, 0.3);
}
.btn-outline:hover {
  background: rgba(20, 184, 166, 0.1);
  border-color: rgba(20, 184, 166, 0.5);
}

.filters {
  margin-bottom: 24px;
}

.search-input {
  width: 100%;
  max-width: 400px;
  padding: 12px 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 99px;
  font-size: 14px;
  box-sizing: border-box;
  background: rgba(15, 23, 42, 0.6);
  color: #f8fafc;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: rgba(20, 184, 166, 0.5);
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.15);
  background: rgba(15, 23, 42, 0.8);
}

.search-input::placeholder {
  color: #64748b;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.empty-state {
  grid-column: 1 / -1;
  background: rgba(17, 24, 39, 0.7);
  border: 1px dashed rgba(255,255,255,0.2);
  border-radius: 12px;
  color: #94a3b8;
  padding: 40px;
}

.product-card {
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(20, 184, 166, 0.15);
  border-color: rgba(20, 184, 166, 0.4);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.card-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: all 0.3s ease;
  transform: translateX(10px);
}

.product-card:hover .card-actions {
  opacity: 1;
  transform: translateX(0);
}

.card-actions .btn-icon {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.card-actions .btn-icon:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
}

.card-actions .btn-icon.text-danger:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.3);
}

.card-actions .btn-icon.text-primary:hover {
  background: rgba(20, 184, 166, 0.2);
  color: #5eead4;
  border-color: rgba(20, 184, 166, 0.3);
}

.card-body {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-code {
  font-size: 12px;
  font-family: 'Consolas', monospace;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 8px;
  border-radius: 6px;
  align-self: flex-start;
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.product-name {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #f8fafc;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
  letter-spacing: -0.3px;
}

.product-desc {
  margin: 0;
  font-size: 13px;
  color: #94a3b8;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
  line-height: 1.5;
}

.product-supplier {
  font-size: 12px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  margin-top: 4px;
  padding-top: 12px;
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
}

.mr-1 {
  margin-right: 6px;
  color: #14b8a6;
}

.price-info-box {
  margin-top: auto;
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}
.price-info-box p {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 6px;
  font-size: 13px;
  color: #94a3b8;
}
.price-info-box p:last-child {
  margin-bottom: 0;
}
.price-info-box p span {
  font-weight: 700;
  color: #f8fafc;
}
.price-info-box p.highlight {
  color: #14b8a6;
  font-weight: 500;
}
.price-info-box p.highlight span {
  color: #14b8a6;
  font-size: 16px;
  text-shadow: 0 2px 10px rgba(20, 184, 166, 0.2);
}



.text-center { text-align: center; }
.text-muted { color: #64748b; }
.py-8 { padding-top: 32px; padding-bottom: 32px; }

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.btn-icon {
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  border-radius: 4px;
  display: inline-flex;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: #f1f5f9;
}

.text-primary { color: #3b82f6; }
.text-danger { color: #ef4444; }
.btn-icon.text-danger:hover { background: #fee2e2; }

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10050;
}

.modal-content {
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98));
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border-radius: 16px;
  width: 100%;
  max-width: 1100px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #f8fafc;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #f8fafc;
}

.close-btn {
  background: rgba(255, 255, 255, 0.05);
  border: none;
  font-size: 20px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.modal-body {
  padding: 24px;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.form-grid-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.form-panel {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.panel-title {
  margin: 0 0 20px 0;
  font-size: 15px;
  font-weight: 700;
  color: #f8fafc;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
  padding-bottom: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.panel-icon {
  color: #14b8a6;
}

.panel-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: flex-start;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.col-span-2 { grid-column: span 2; }
.col-span-3 { grid-column: span 3; }

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input, .form-group textarea, .form-group select {
  padding: 10px 14px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 14px;
  color: #f8fafc;
  transition: all 0.2s;
}

.form-group input:focus, .form-group textarea:focus, .form-group select:focus {
  outline: none;
  border-color: #14b8a6;
  box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.2);
}

.required {
  color: #ef4444;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;
}

.spinner {
  display: inline-block;
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ========== IMPORT MODAL ========== */
.import-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10050;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.import-modal {
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95));
  border: 1px solid rgba(20, 184, 166, 0.3);
  border-radius: 20px;
  width: 98vw;
  max-width: 1920px;
  height: 96vh;
  max-height: 98vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 40px rgba(20, 184, 166, 0.15), 0 25px 50px -12px rgba(0, 0, 0, 0.7);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  color: #f8fafc;
  backdrop-filter: blur(20px);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Header */
.import-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.import-modal__header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.import-modal__icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #0f766e, #14b8a6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 20px rgba(20, 184, 166, 0.4), inset 0 2px 4px rgba(255,255,255,0.3);
}
.import-modal__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #f8fafc;
}
.import-modal__subtitle {
  margin: 2px 0 0;
  font-size: 13px;
  color: #94a3b8;
}
.import-modal__close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.import-modal__close:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

/* Stats */
.import-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 20px 28px;
}
.import-stat-card {
  position: relative;
  padding: 16px 20px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}
.import-stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}
.import-stat-card:hover {
  transform: translateY(-4px);
  background: rgba(30, 41, 59, 0.8);
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
}
.import-stat-card:hover::before {
  opacity: 1;
}
.import-stat-card__value {
  font-size: 24px;
  font-weight: 800;
  color: #f8fafc;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
}
.import-stat-card__label {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.import-stat-card--blue {
  border-color: rgba(59, 130, 246, 0.2);
}
.import-stat-card--blue .import-stat-card__value { color: #60a5fa; text-shadow: 0 0 15px rgba(96, 165, 250, 0.4); }
.import-stat-card--blue::before { background: linear-gradient(90deg, transparent, #3b82f6, transparent); }

.import-stat-card--amber {
  border-color: rgba(245, 158, 11, 0.2);
}
.import-stat-card--amber .import-stat-card__value { color: #fbbf24; text-shadow: 0 0 15px rgba(251, 191, 36, 0.4); }
.import-stat-card--amber::before { background: linear-gradient(90deg, transparent, #f59e0b, transparent); }

.import-stat-card--green {
  border-color: rgba(16, 185, 129, 0.2);
}
.import-stat-card--green .import-stat-card__value { color: #34d399; font-size: 16px; text-shadow: 0 0 15px rgba(52, 211, 153, 0.4); }
.import-stat-card--green::before { background: linear-gradient(90deg, transparent, #10b981, transparent); }

/* Tabs */
.import-tabs {
  display: flex;
  gap: 12px;
  padding: 0 28px 20px;
  overflow-x: auto;
}
.import-tabs::-webkit-scrollbar { height: 6px; }
.import-tabs::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 3px; }
.import-tab {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.5);
  color: #94a3b8;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}
.import-tab:hover {
  border-color: rgba(20, 184, 166, 0.5);
  background: rgba(20, 184, 166, 0.1);
  color: #5eead4;
}
.import-tab--active {
  background: linear-gradient(135deg, #0d9488, #0f766e);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
}
.import-tab--active:hover {
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  color: white;
  border-color: transparent;
}
.import-tab__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  font-size: 12px;
  font-weight: 700;
  color: #f8fafc;
}
.import-tab--active .import-tab__badge {
  background: rgba(255, 255, 255, 0.25);
}

/* Table Wrapper */
.import-table-wrap {
  flex: 1;
  overflow: auto;
  margin: 0 28px;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.6);
  box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
}
.import-table-wrap::-webkit-scrollbar { width: 10px; height: 10px; }
.import-table-wrap::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 5px; }
.import-table-wrap::-webkit-scrollbar-thumb:hover { background: rgba(20, 184, 166, 0.5); }
.import-table-wrap::-webkit-scrollbar-corner { background: transparent; }

/* Table */
.import-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
  white-space: nowrap;
}
.import-table thead {
  position: sticky;
  top: 0;
  z-index: 20;
}
.import-table th {
  padding: 14px 12px;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(16px);
  color: #94a3b8;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  border-bottom: 1px solid rgba(20, 184, 166, 0.4);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  text-align: left;
  white-space: nowrap;
  position: relative;
}
/* Subtle column dividers in header */
.import-table th:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0; top: 25%; bottom: 25%; width: 1px;
  background: rgba(255, 255, 255, 0.08);
}
.import-table td {
  padding: 6px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  border-right: 1px solid rgba(255, 255, 255, 0.02);
  vertical-align: middle;
  transition: background 0.2s;
}

.import-th--sticky-left {
  position: sticky;
  left: 0;
  z-index: 21;
  background: rgba(15, 23, 42, 0.98);
}
.import-th--idx {
  width: 50px;
  min-width: 50px;
  text-align: center;
  border-right: 1px solid rgba(20, 184, 166, 0.2) !important;
  box-shadow: 4px 0 10px rgba(0,0,0,0.3);
}

.import-row { 
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
  position: relative;
}
.import-row:nth-child(even) td { background: rgba(255, 255, 255, 0.015); }
.import-row:hover td { background: rgba(20, 184, 166, 0.06) !important; }
.import-row__idx {
  font-weight: 700;
  font-size: 12px;
  color: #64748b;
  background: rgba(15, 23, 42, 0.95) !important;
  transition: color 0.2s, background 0.2s;
}
.import-row:nth-child(even) .import-row__idx { background: rgba(30, 41, 59, 0.95) !important; }
.import-row:hover .import-row__idx { 
  background: rgba(20, 184, 166, 0.2) !important; 
  color: #5eead4; 
  box-shadow: inset 4px 0 0 #14b8a6;
}

/* Seamless Inputs */
.imp-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  background: rgba(0, 0, 0, 0.2);
  color: #f1f5f9;
  transition: all 0.25s ease;
  outline: none;
  box-sizing: border-box;
}
.imp-input:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}
.imp-input:focus {
  border-color: #14b8a6;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.15);
  background: rgba(15, 23, 42, 0.95);
  color: #fff;
}
.imp-input--code {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 12px;
  color: #2dd4bf;
  font-weight: 600;
  letter-spacing: 0.5px;
}
.imp-input--num {
  text-align: right;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-variant-numeric: tabular-nums;
  color: #93c5fd;
  font-weight: 500;
}
.imp-input--green {
  color: #34d399 !important;
  text-shadow: 0 0 10px rgba(52, 211, 153, 0.2);
}
.imp-input--sm {
  text-align: center;
  font-weight: 500;
}
.imp-input--textarea {
  min-height: 20px;
  resize: vertical;
  line-height: 1.5;
  background: rgba(0, 0, 0, 0.15);
}
.imp-input--autofit {
  field-sizing: content;
  overflow-y: hidden;
}
.imp-features-cell {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 6px;
}
.imp-input--rich {
  white-space: normal;
  word-break: break-word;
  line-height: 1.5;
  min-height: 38px;
  max-height: 220px;
  overflow-y: auto;
  padding-right: 34px;
  background: rgba(0, 0, 0, 0.15);
}
.imp-features-edit-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid rgba(20, 184, 166, 0.35);
  background: rgba(15, 23, 42, 0.85);
  color: #2dd4bf;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 2;
}
.imp-features-edit-btn:hover {
  background: rgba(20, 184, 166, 0.25);
  color: #5eead4;
  border-color: #14b8a6;
}
.features-excel-editor :deep(.editor-content) {
  min-height: 160px;
  max-height: 320px;
}

/* Footer */
.import-modal__footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  padding: 16px 28px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.import-btn-save {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.5px;
  padding: 12px 28px;
  border-radius: 10px;
  border: 1px solid rgba(16, 185, 129, 0.5);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3), inset 0 2px 4px rgba(255,255,255,0.2);
  text-transform: uppercase;
}
.import-btn-save:hover {
  background: linear-gradient(135deg, #059669, #047857);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5), inset 0 2px 4px rgba(255,255,255,0.2);
  transform: translateY(-2px);
  border-color: #34d399;
}
.import-btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* ═══ ASYNC RESULT MODAL — VIP PREMIUM ═══ */
.async-overlay {
  position: fixed;
  inset: 0;
  z-index: 100100 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(12px) saturate(1.2);
}
.async-card {
  background: linear-gradient(160deg, rgba(30,41,59,0.95), rgba(15,23,42,0.98));
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 24px;
  padding: 48px 56px 40px;
  text-align: center;
  min-width: 340px;
  max-width: 440px;
  box-shadow:
    0 32px 100px rgba(0,0,0,0.6),
    0 0 0 1px rgba(255,255,255,0.04),
    inset 0 1px 0 rgba(255,255,255,0.06);
  position: relative;
  overflow: hidden;
}
.async-card::before {
  content: '';
  position: absolute;
  top: -2px; left: -2px; right: -2px; bottom: -2px;
  border-radius: 26px;
  background: conic-gradient(from 0deg, transparent 0%, rgba(56,189,248,0.3) 25%, transparent 50%, rgba(16,185,129,0.3) 75%, transparent 100%);
  z-index: -1;
  animation: async-border-spin 4s linear infinite;
  opacity: 0.5;
}
.async-loading .async-card::before { opacity: 1; }
@keyframes async-border-spin {
  to { transform: rotate(360deg); }
}
.async-title {
  font-size: 20px;
  font-weight: 800;
  color: #f8fafc;
  margin-top: 20px;
  letter-spacing: 0.4px;
  line-height: 1.4;
}
.async-subtitle {
  font-size: 13.5px;
  color: #94a3b8;
  margin-top: 10px;
  line-height: 1.6;
  white-space: pre-line;
}

/* ═══ PREMIUM SPINNER ═══ */
.async-spinner-wrap {
  display: flex;
  justify-content: center;
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto;
}
.async-spinner {
  width: 80px;
  height: 80px;
  animation: async-spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  filter: drop-shadow(0 0 8px rgba(56,189,248,0.4));
}
.async-spinner circle {
  stroke: url(#async-gradient);
  stroke-dasharray: 80, 200;
  stroke-dashoffset: 0;
  animation: async-dash 1.5s ease-in-out infinite;
}
@keyframes async-spin {
  to { transform: rotate(360deg); }
}
@keyframes async-dash {
  0% { stroke-dasharray: 1, 200; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 80, 200; stroke-dashoffset: -30; }
  100% { stroke-dasharray: 80, 200; stroke-dashoffset: -120; }
}
.async-spinner-wrap::before,
.async-spinner-wrap::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  top: 50%; left: 50%;
  margin: -4px 0 0 -4px;
}
.async-spinner-wrap::before {
  background: #38bdf8;
  box-shadow: 0 0 12px rgba(56,189,248,0.6);
  animation: async-orbit 2s linear infinite;
}
.async-spinner-wrap::after {
  background: #a78bfa;
  box-shadow: 0 0 12px rgba(167,139,250,0.6);
  animation: async-orbit 2s linear infinite reverse;
  animation-delay: -1s;
}
@keyframes async-orbit {
  0% { transform: rotate(0deg) translateX(44px) rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) translateX(44px) rotate(-180deg) scale(0.6); }
  100% { transform: rotate(360deg) translateX(44px) rotate(-360deg) scale(1); }
}
.async-spinner-wrap .async-spinner {
  position: relative;
  z-index: 2;
}

/* ═══ SUCCESS CHECKMARK — PREMIUM ═══ */
.async-icon-wrap {
  display: flex;
  justify-content: center;
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto;
}
.async-checkmark {
  width: 80px;
  height: 80px;
  position: relative;
  z-index: 2;
}
.async-checkmark circle {
  stroke: #10b981;
  stroke-width: 2.5;
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  animation: async-circle-draw 0.7s cubic-bezier(0.65, 0, 0.45, 1) forwards;
  filter: drop-shadow(0 0 6px rgba(16,185,129,0.5));
}
.async-checkmark path {
  stroke: #34d399;
  stroke-width: 3.5;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: async-check-draw 0.5s 0.5s cubic-bezier(0.65, 0, 0.45, 1) forwards;
  filter: drop-shadow(0 0 4px rgba(52,211,153,0.6));
}
@keyframes async-circle-draw {
  to { stroke-dashoffset: 0; }
}
@keyframes async-check-draw {
  to { stroke-dashoffset: 0; }
}
.async-icon-success {
  animation: async-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.async-icon-success::before {
  content: '';
  position: absolute;
  inset: -12px;
  border-radius: 50%;
  border: 2px solid rgba(16,185,129,0.3);
  animation: async-ring-burst 0.8s 0.3s ease-out forwards;
  opacity: 0;
}
.async-icon-success::after {
  content: '';
  position: absolute;
  inset: -24px;
  border-radius: 50%;
  border: 1px solid rgba(16,185,129,0.15);
  animation: async-ring-burst 1s 0.5s ease-out forwards;
  opacity: 0;
}
@keyframes async-ring-burst {
  0% { transform: scale(0.5); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}

/* ═══ ERROR X-MARK — PREMIUM ═══ */
.async-xmark {
  width: 80px;
  height: 80px;
  position: relative;
  z-index: 2;
}
.async-xmark circle {
  stroke: #ef4444;
  stroke-width: 2.5;
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  animation: async-circle-draw 0.7s cubic-bezier(0.65, 0, 0.45, 1) forwards;
  filter: drop-shadow(0 0 6px rgba(239,68,68,0.5));
}
.async-xmark path {
  stroke: #f87171;
  stroke-width: 3.5;
  stroke-dasharray: 56;
  stroke-dashoffset: 56;
  animation: async-check-draw 0.4s 0.5s cubic-bezier(0.65, 0, 0.45, 1) forwards;
  filter: drop-shadow(0 0 4px rgba(248,113,113,0.6));
}
.async-icon-error {
  animation: async-shake-vip 0.6s 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}
.async-icon-error::before {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%);
  animation: async-error-pulse 1.5s 0.5s ease-in-out infinite;
}
@keyframes async-shake-vip {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  15% { transform: translateX(-10px) rotate(-2deg); }
  30% { transform: translateX(10px) rotate(2deg); }
  45% { transform: translateX(-7px) rotate(-1deg); }
  60% { transform: translateX(7px) rotate(1deg); }
  75% { transform: translateX(-3px); }
  90% { transform: translateX(3px); }
}
@keyframes async-error-pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.15); }
}
@keyframes async-pop {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.15); }
  70% { transform: scale(0.95); }
  100% { transform: scale(1); opacity: 1; }
}

/* ═══ CLOSE BUTTON — PREMIUM ═══ */
.async-close-btn {
  margin-top: 24px;
  padding: 12px 36px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.08));
  border: 1px solid rgba(239,68,68,0.25);
  color: #f87171;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.3px;
}
.async-close-btn:hover {
  background: linear-gradient(135deg, rgba(239,68,68,0.25), rgba(239,68,68,0.15));
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(239,68,68,0.2);
}

/* ═══ CUSTOM ALERT MODAL ═══ */
.custom-alert-modal {
  background: linear-gradient(145deg, #1e293b, #0f172a);
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.05);
  padding: 32px 40px;
  text-align: center;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05);
  animation: dm-pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes dm-pop-in {
  0% { opacity: 0; transform: scale(0.9) translateY(10px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
.alert-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}
.alert-icon svg {
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

/* ═══ TRANSITION — PREMIUM ═══ */
.async-modal-enter-active {
  animation: async-modal-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.async-modal-leave-active {
  animation: async-modal-out 0.25s cubic-bezier(0.4, 0, 1, 1);
}
@keyframes async-modal-in {
  0% { opacity: 0; transform: scale(0.7) translateY(20px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes async-modal-out {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.85) translateY(10px); }
}

/* ═══ FOLDER TAB CATEGORY GROUP ═══ */
.folder-header {
  grid-column: 1 / -1;
  margin-top: 32px;
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
}
.folder-tab {
  background: linear-gradient(135deg, #059669, #10b981); /* Green background */
  border: 1px solid rgba(16, 185, 129, 0.5); /* Matching green border */
  border-bottom: none;
  border-radius: 10px 10px 0 0;
  padding: 8px 24px;
  width: max-content;
  color: #ffffff; /* White text */
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
}
.folder-body {
  background: linear-gradient(135deg, #059669, #10b981); /* Match tab green */
  border: 1px solid rgba(16, 185, 129, 0.5); /* Match tab border */
  border-radius: 0 12px 12px 12px;
  padding: 14px 24px;
  position: relative;
  z-index: 2;
  box-shadow: 0 8px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
  margin-top: -1px; /* Overlap to hide seam */
}
.folder-title {
  color: #f8fafc;
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  line-height: 1.5;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

/* ═══ SKELETON LOADING ═══ */
.skeleton {
  background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.5s infinite ease-in-out;
  border-radius: 4px;
}

@keyframes skeleton-loading {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}

.skeleton-card {
  border-color: rgba(255,255,255,0.05) !important;
  box-shadow: none !important;
  pointer-events: none;
}

.skeleton-badge {
  width: 80px;
  height: 24px;
  border-radius: 12px;
}

.skeleton-title {
  height: 20px;
  width: 100%;
}

.skeleton-desc {
  height: 14px;
  width: 100%;
  margin-top: 6px;
}

.skeleton-text {
  height: 14px;
  width: 100%;
  margin-top: 6px;
}

.skeleton-price {
  height: 20px;
  width: 60%;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .actions {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
  .form-grid-2col, .panel-content {
    grid-template-columns: 1fr;
  }
  .col-span-2 {
    grid-column: 1 / -1;
  }
  .modal-content,
  .modal-content.large-modal {
    max-height: calc(100dvh - 16px);
    width: 96vw;
    padding-bottom: 0;
  }
}

/* ═══ USD EXCHANGE RATE (THAY ĐỔI TỈ GIÁ USD) STYLES ═══ */
.btn-usd-rate {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}
.btn-usd-rate:hover {
  background: linear-gradient(135deg, #34d399, #10b981);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.42);
  transform: translateY(-1px);
}
.usd-rate-btn-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: 99px;
  font-size: 11.5px;
  font-weight: 800;
  background: rgba(6, 78, 59, 0.65);
  color: #a7f3d0;
  border: 1px solid rgba(167, 243, 208, 0.35);
}
.card-usd-rate-quick-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 700;
  cursor: pointer;
  color: #34d399;
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid rgba(16, 185, 129, 0.38);
  transition: all 0.15s ease;
}
.card-usd-rate-quick-btn:hover {
  background: rgba(16, 185, 129, 0.28);
  border-color: rgba(52, 211, 153, 0.7);
  color: #ecfdf5;
  transform: translateY(-1px);
}
.usd-quick-step-btn {
  padding: 4px 9px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  color: #cbd5e1;
  background: rgba(30, 41, 59, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.3);
  transition: all 0.15s ease;
}
.usd-quick-step-btn:hover {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(52, 211, 153, 0.6);
  color: #ecfdf5;
}
.usd-quick-step-btn.preset {
  color: #6ee7b7;
  background: rgba(6, 78, 59, 0.35);
  border-color: rgba(16, 185, 129, 0.35);
}

/* ═══ PRICE LIST (BẢNG GIÁ) STYLES ═══ */
.btn-pricelist {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}
.btn-pricelist:hover {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
  transform: translateY(-1px);
}

.pricelist-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 99px;
  padding: 5px 10px 5px 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.pricelist-select-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pricelist-select {
  background: transparent;
  border: none;
  color: #f8fafc;
  font-size: 13.5px;
  font-weight: 600;
  padding: 6px 24px 6px 4px;
  cursor: pointer;
  outline: none;
  min-width: 220px;
}
.pricelist-select option {
  background: #0f172a;
  color: #f8fafc;
  padding: 8px;
}

.pricelist-period-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 11.5px;
  font-weight: 600;
  background: rgba(56, 189, 248, 0.12);
  color: #7dd3fc;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.pricelist-status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
}
.pricelist-status-badge.active {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.35);
}
.pricelist-status-badge.upcoming {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.35);
}
.pricelist-status-badge.expired {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.35);
}

.pricelist-rule-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 11.5px;
  font-weight: 700;
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.35);
}

.pricelist-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}
.pricelist-action-btn.edit {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.3);
}
.pricelist-action-btn.edit:hover {
  background: rgba(56, 189, 248, 0.25);
}
.pricelist-action-btn.export {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.3);
}
.pricelist-action-btn.export:hover {
  background: rgba(16, 185, 129, 0.25);
}
.pricelist-action-btn.delete {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.3);
  padding: 5px 8px;
}
.pricelist-action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.25);
}

.pl-card-diff-badge {
  display: inline-flex;
  align-items: center;
  padding: 1px 7px;
  border-radius: 99px;
  font-size: 10.5px;
  font-weight: 700;
}
.pl-card-diff-badge.up {
  background: rgba(16, 185, 129, 0.18);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.35);
}
.pl-card-diff-badge.down {
  background: rgba(245, 158, 11, 0.18);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.35);
}
.pl-card-diff-badge.neutral {
  background: rgba(148, 163, 184, 0.15);
  color: #94a3b8;
}

.pricelist-modal {
  max-width: 96vw !important;
  width: 1500px !important;
  height: 92vh !important;
}

.pl-config-section {
  display: grid;
  grid-template-columns: 1.25fr 1.25fr;
  gap: 14px;
  padding: 14px 20px;
  background: #0b1120;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}
@media (max-width: 1100px) {
  .pl-config-section {
    grid-template-columns: 1fr;
  }
}

.pl-config-card {
  background: rgba(30, 41, 59, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px 16px;
}
.pl-config-card--highlight {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(15, 23, 42, 0.75));
  border-color: rgba(245, 158, 11, 0.3);
}

.pl-config-card__title {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  font-weight: 700;
  color: #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 10px;
}

.pl-config-grid {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 10px;
}
.pl-config-grid--4 {
  grid-template-columns: 1.3fr 1fr 1fr 1.2fr;
}
@media (max-width: 900px) {
  .pl-config-grid--4 {
    grid-template-columns: 1fr 1fr;
  }
}

.pl-bulk-controls {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.pl-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pl-field label {
  font-size: 11.5px;
  color: #94a3b8;
  font-weight: 600;
}

.pl-input, .pl-select {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 7px;
  color: #f8fafc;
  padding: 7px 10px;
  font-size: 13px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}
.pl-input:focus, .pl-select:focus {
  border-color: #f59e0b;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.15);
}
.pl-select--up {
  color: #34d399;
  font-weight: 700;
}
.pl-select--down {
  color: #fbbf24;
  font-weight: 700;
}

.pl-bulk-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pl-apply-btn {
  padding: 8px 13px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
}
.pl-apply-btn--selected {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  box-shadow: 0 3px 10px rgba(245, 158, 11, 0.25);
}
.pl-apply-btn--selected:hover {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  transform: translateY(-1px);
}
.pl-apply-btn--filtered {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.35);
}
.pl-apply-btn--filtered:hover {
  background: rgba(16, 185, 129, 0.25);
}

.pl-filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 10px 20px;
  background: #111827;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.pl-filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  flex: 1;
}

.pl-filter-select, .pl-filter-input {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 7px;
  color: #f8fafc;
  padding: 6px 11px;
  font-size: 12.5px;
  outline: none;
}
.pl-filter-input {
  width: 100%;
  padding-right: 28px;
  box-sizing: border-box;
}
.pl-filter-select:focus, .pl-filter-input:focus {
  border-color: #38bdf8;
}

.pl-view-tabs {
  display: inline-flex;
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 7px;
  padding: 2px;
}
.pl-view-tab {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 11.5px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.15s;
}
.pl-view-tab.active {
  background: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
}

.pl-selection-btns {
  display: flex;
  gap: 8px;
}
.pl-mini-btn {
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.35);
  color: #60a5fa;
  padding: 5px 11px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.pl-mini-btn:hover {
  background: rgba(59, 130, 246, 0.25);
}
.pl-mini-btn--muted {
  background: rgba(148, 163, 184, 0.1);
  border-color: rgba(148, 163, 184, 0.25);
  color: #94a3b8;
}
.pl-mini-btn--muted:hover {
  background: rgba(148, 163, 184, 0.2);
  color: #e2e8f0;
}

.pl-row-selected {
  background: rgba(16, 185, 129, 0.05) !important;
}

.pl-row-adjust {
  display: flex;
  align-items: center;
  gap: 5px;
}

.pl-row-select {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 5px;
  color: #e2e8f0;
  padding: 4px 6px;
  font-size: 11.5px;
  font-weight: 600;
  outline: none;
}
.pl-row-select.up {
  color: #34d399;
}
.pl-row-select.down {
  color: #fbbf24;
}

.pl-diff-up {
  color: #34d399;
  font-weight: 700;
}
.pl-diff-down {
  color: #fbbf24;
  font-weight: 700;
}
.pl-diff-zero {
  color: #64748b;
}

.pricelist-autosync-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}
.pricelist-autosync-btn.on {
  background: rgba(16, 185, 129, 0.16);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.4);
}
.pricelist-autosync-btn.on:hover {
  background: rgba(16, 185, 129, 0.26);
}
.pricelist-autosync-btn.off {
  background: rgba(148, 163, 184, 0.14);
  color: #cbd5e1;
  border-color: rgba(148, 163, 184, 0.35);
}
.pricelist-autosync-btn.off:hover {
  background: rgba(148, 163, 184, 0.24);
}

.pl-autosync-box {
  margin-top: 10px;
  padding: 9px 12px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.75);
  border: 1px dashed rgba(148, 163, 184, 0.3);
  display: flex;
  flex-direction: column;
  gap: 3px;
  transition: all 0.2s;
}
.pl-autosync-box.active {
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.35);
}
.pl-autosync-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}
.pl-autosync-checkbox {
  width: 16px;
  height: 16px;
  accent-color: #10b981;
  cursor: pointer;
}
.pl-autosync-title {
  font-size: 12.5px;
  font-weight: 700;
  color: #e2e8f0;
}
.pl-autosync-box.active .pl-autosync-title {
  color: #34d399;
}
.pl-autosync-hint {
  font-size: 11px;
  color: #94a3b8;
  padding-left: 24px;
}

/* ═══ MOBILE RESPONSIVE & SCROLL FIX FOR PRICE LIST & IMPORT MODALS ═══ */
@media (max-width: 900px) {
  .import-overlay,
  .modal-overlay {
    z-index: 10050;
    padding: 6px;
    box-sizing: border-box;
  }

  .import-modal,
  .pricelist-modal {
    width: 98vw !important;
    max-width: 98vw !important;
    height: auto !important;
    max-height: calc(100dvh - 16px) !important;
    display: block !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    -webkit-overflow-scrolling: touch !important;
    overscroll-behavior: contain;
    touch-action: pan-y pan-x;
    border-radius: 14px;
  }

  .import-modal__header {
    position: sticky;
    top: 0;
    z-index: 40;
    background: rgba(15, 23, 42, 0.98);
    backdrop-filter: blur(12px);
    padding: 12px 14px;
  }

  .import-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    padding: 12px 14px;
  }

  .import-tabs {
    padding: 0 14px 12px;
  }

  .pl-config-section {
    padding: 12px;
    gap: 10px;
  }

  .pl-config-card {
    padding: 10px 12px;
  }

  .pl-filter-bar {
    padding: 10px 12px;
    gap: 10px;
  }

  .pl-filter-group {
    width: 100%;
  }

  .pl-filter-select {
    flex: 1 1 140px;
    max-width: 100% !important;
  }

  .pl-view-tabs {
    width: 100%;
    display: flex;
  }

  .pl-view-tab {
    flex: 1;
    text-align: center;
  }

  .pl-selection-btns {
    width: 100%;
    flex-wrap: wrap;
  }

  .pl-mini-btn {
    flex: 1 1 auto;
    text-align: center;
  }

  .import-modal .import-table-wrap,
  .pricelist-modal .import-table-wrap {
    flex: none !important;
    height: auto !important;
    min-height: 280px;
    max-height: 62dvh;
    margin: 10px 12px !important;
    overflow: auto !important;
    -webkit-overflow-scrolling: touch !important;
    touch-action: pan-x pan-y;
  }

  .import-modal__footer {
    flex-wrap: wrap;
    gap: 10px;
    padding: 12px 14px calc(16px + env(safe-area-inset-bottom, 0px)) 14px;
    background: rgba(15, 23, 42, 0.98);
  }
}

@media (max-width: 640px) {
  .pl-config-grid--4 {
    grid-template-columns: 1fr;
  }

  .pl-bulk-controls > .pl-field {
    width: 100%;
    flex: 1 1 100% !important;
  }

  .pl-bulk-actions {
    width: 100%;
  }

  .pl-apply-btn {
    flex: 1 1 100%;
    text-align: center;
    white-space: normal;
  }
}

/* ═══ BUTTON & MODAL ĐỐI CHIẾU GIÁ TỪ ẢNH (BƯỚC 1) ═══ */
.btn-image-check {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(6, 182, 212, 0.16));
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.45);
  font-weight: 600;
  box-shadow: 0 2px 10px rgba(16, 185, 129, 0.15);
}
.btn-image-check:hover {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(6, 182, 212, 0.25));
  border-color: #34d399;
  color: #ecfdf5;
  transform: translateY(-1px);
}

.imgcheck-modal {
  max-width: 1360px !important;
  width: 96vw !important;
  max-height: 92vh !important;
}

.imgcheck-step-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 700;
  background: rgba(16, 185, 129, 0.18);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.4);
}

.imgcheck-body {
  flex: 1;
  overflow-y: auto;
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  min-height: 360px;
}

.imgcheck-dropzone {
  flex: 1;
  min-height: 320px;
  border: 2px dashed rgba(56, 189, 248, 0.35);
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.65);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 36px 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}
.imgcheck-dropzone:hover,
.imgcheck-dropzone.drag-over {
  border-color: #34d399;
  background: rgba(16, 185, 129, 0.08);
}
.imgcheck-dropzone__icon {
  width: 78px;
  height: 78px;
  border-radius: 50%;
  background: rgba(56, 189, 248, 0.12);
  color: #38bdf8;
  display: flex;
  align-items: center;
  justify-content: center;
}
.imgcheck-dropzone__title {
  font-size: 16px;
  color: #e2e8f0;
  font-weight: 500;
}
.imgcheck-dropzone__title span {
  color: #34d399;
  font-weight: 700;
  text-decoration: underline;
}
.imgcheck-dropzone__title kbd {
  background: #1e293b;
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 13px;
  color: #38bdf8;
  font-weight: 700;
}
.imgcheck-dropzone__hint {
  font-size: 13px;
  color: #64748b;
}

.imgcheck-scanning {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 24px;
}
.imgcheck-scanner-box {
  position: relative;
  max-width: 560px;
  max-height: 300px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(56, 189, 248, 0.4);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
}
.imgcheck-scanning-img {
  display: block;
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  opacity: 0.75;
}
.imgcheck-scanner-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #34d399, #38bdf8, transparent);
  box-shadow: 0 0 14px #34d399;
  animation: imgcheck-scan 2s ease-in-out infinite;
  z-index: 2;
}
@keyframes imgcheck-scan {
  0%, 100% { top: 4%; }
  50% { top: 94%; }
}
.imgcheck-progress-wrap {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.imgcheck-progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 13.5px;
  color: #cbd5e1;
}
.imgcheck-progress-bar {
  width: 100%;
  height: 8px;
  border-radius: 99px;
  background: rgba(30, 41, 59, 0.9);
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.2);
}
.imgcheck-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #38bdf8);
  transition: width 0.25s ease;
}

.imgcheck-result-grid {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 16px;
  align-items: start;
}
.imgcheck-left-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.imgcheck-right-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}
.imgcheck-preview-wrap {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: #090d16;
  cursor: zoom-in;
  max-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.imgcheck-preview-img {
  width: 100%;
  max-height: 240px;
  object-fit: contain;
  display: block;
}
.imgcheck-ai-btn {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid rgba(167, 139, 250, 0.5);
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(59, 130, 246, 0.22));
  color: #e9d5ff;
  transition: all 0.2s;
}
.imgcheck-ai-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(59, 130, 246, 0.35));
  border-color: #c084fc;
}
.imgcheck-ai-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.imgcheck-error-box {
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #fca5a5;
  font-size: 12.5px;
}
.imgcheck-settings-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.imgcheck-table-wrap {
  max-height: 360px;
  overflow: auto;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.16);
}
.imgcheck-row-na {
  opacity: 0.52;
}

/* Step 2: 4-way Price Reconciliation Styles */
.imgcheck-stepper {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.2);
}
.imgcheck-step-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 7px;
  border: 1px solid transparent;
  background: transparent;
  color: #94a3b8;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.imgcheck-step-tab:hover:not(:disabled) {
  color: #e2e8f0;
  background: rgba(51, 65, 85, 0.45);
}
.imgcheck-step-tab.active {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.22), rgba(59, 130, 246, 0.22));
  border-color: rgba(16, 185, 129, 0.45);
  color: #6ee7b7;
}
.imgcheck-step-tab:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.imgcheck-step-num {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.2);
  color: #e2e8f0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
}
.imgcheck-step-tab.active .imgcheck-step-num {
  background: #10b981;
  color: #052e16;
}
.imgcheck-step-badge {
  padding: 1px 7px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.25);
  color: #93c5fd;
  font-size: 11px;
  font-weight: 800;
}

.imgcheck-compare-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.imgcheck-compare-stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}
.imgcheck-stat-card {
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.18);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.imgcheck-stat-label {
  font-size: 11.5px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.imgcheck-stat-value {
  font-size: 22px;
  font-weight: 800;
  color: #f8fafc;
  line-height: 1.15;
}
.imgcheck-stat-sub {
  font-size: 11.5px;
  color: #cbd5e1;
}
.imgcheck-stat-ok {
  border-color: rgba(16, 185, 129, 0.35);
  background: linear-gradient(180deg, rgba(16, 185, 129, 0.1), rgba(15, 23, 42, 0.8));
}
.imgcheck-stat-ok .imgcheck-stat-value {
  color: #34d399;
}
.imgcheck-stat-info {
  border-color: rgba(59, 130, 246, 0.35);
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.1), rgba(15, 23, 42, 0.8));
}
.imgcheck-stat-info .imgcheck-stat-value {
  color: #60a5fa;
}
.imgcheck-stat-warn {
  border-color: rgba(245, 158, 11, 0.4);
  background: linear-gradient(180deg, rgba(245, 158, 11, 0.12), rgba(15, 23, 42, 0.8));
}
.imgcheck-stat-warn .imgcheck-stat-value {
  color: #fbbf24;
}
.imgcheck-stat-danger {
  border-color: rgba(244, 63, 94, 0.4);
  background: linear-gradient(180deg, rgba(244, 63, 94, 0.12), rgba(15, 23, 42, 0.8));
}
.imgcheck-stat-danger .imgcheck-stat-value {
  color: #fb7185;
}

.imgcheck-compare-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(148, 163, 184, 0.16);
}
.imgcheck-filter-pills {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.imgcheck-pill {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #cbd5e1;
  background: rgba(30, 41, 59, 0.75);
  border: 1px solid rgba(148, 163, 184, 0.2);
  cursor: pointer;
  transition: all 0.18s;
}
.imgcheck-pill:hover {
  border-color: rgba(148, 163, 184, 0.45);
  color: #ffffff;
}
.imgcheck-pill.active {
  background: rgba(59, 130, 246, 0.25);
  border-color: #60a5fa;
  color: #93c5fd;
}
.imgcheck-pill-warn.active {
  background: rgba(245, 158, 11, 0.22);
  border-color: #fbbf24;
  color: #fde68a;
}
.imgcheck-pill-danger.active {
  background: rgba(244, 63, 94, 0.22);
  border-color: #fb7185;
  color: #fecdd3;
}
.imgcheck-pill-info.active {
  background: rgba(139, 92, 246, 0.22);
  border-color: #a78bfa;
  color: #ddd6fe;
}
.imgcheck-upload-ref-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 11px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  color: #cbd5e1;
  background: rgba(30, 41, 59, 0.85);
  border: 1px dashed rgba(148, 163, 184, 0.35);
  cursor: pointer;
  transition: all 0.2s;
}
.imgcheck-upload-ref-btn:hover {
  border-color: #38bdf8;
  color: #bae6fd;
}

.imgcheck-compare-table-wrap {
  max-height: 470px;
  overflow: auto;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.7);
}
.imgcheck-compare-table th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #0f172a;
  font-size: 11.5px;
  white-space: nowrap;
}
.imgcheck-compare-table td {
  vertical-align: middle;
  padding: 9px 10px;
}
.cmp-row-warning {
  background: rgba(245, 158, 11, 0.05);
}
.cmp-row-missing {
  background: rgba(244, 63, 94, 0.05);
}
.cmp-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}
.cmp-badge-ok {
  background: rgba(16, 185, 129, 0.16);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.35);
}
.cmp-badge-warn {
  background: rgba(245, 158, 11, 0.16);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.35);
}
.cmp-badge-danger {
  background: rgba(244, 63, 94, 0.16);
  color: #fb7185;
  border: 1px solid rgba(244, 63, 94, 0.35);
}
.cmp-badge-info {
  background: rgba(59, 130, 246, 0.16);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.35);
}
.cmp-badge-muted {
  background: rgba(148, 163, 184, 0.12);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.22);
}
.cmp-mini-dot {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
}
.cmp-dot-ok {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.4);
}
.cmp-dot-warn {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.4);
}
.cmp-dot-miss {
  background: rgba(244, 63, 94, 0.2);
  color: #fb7185;
  border: 1px solid rgba(244, 63, 94, 0.4);
}
.cmp-action-btn {
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s;
  white-space: nowrap;
}
.cmp-action-update {
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.45);
  color: #fde68a;
}
.cmp-action-update:hover:not(:disabled) {
  background: rgba(245, 158, 11, 0.35);
}
.cmp-action-insert {
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.45);
  color: #bfdbfe;
}
.cmp-action-insert:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.35);
}
.cmp-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Clickable SKU & Excel Row Navigation Chips */
.sku-clickable-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: monospace;
  font-weight: 700;
  color: #38bdf8;
  font-size: 12px;
  background: rgba(56, 189, 248, 0.14);
  border: 1px solid rgba(56, 189, 248, 0.35);
  padding: 2px 8px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.18s;
}
.sku-clickable-badge:hover {
  background: rgba(56, 189, 248, 0.28);
  border-color: #38bdf8;
  color: #e0f2fe;
  transform: translateY(-1px);
}
.sku-jump-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border-radius: 5px;
  font-size: 10.5px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.16s;
  white-space: nowrap;
}
.sku-jump-chip--goc {
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid rgba(16, 185, 129, 0.38);
  color: #6ee7b7;
}
.sku-jump-chip--goc:hover {
  background: rgba(16, 185, 129, 0.28);
  border-color: #10b981;
  color: #ecfdf5;
}
.sku-jump-chip--goc-sub {
  background: rgba(20, 184, 166, 0.12);
  border: 1px dashed rgba(20, 184, 166, 0.38);
  color: #5eead4;
}
.sku-jump-chip--goc-sub:hover {
  background: rgba(20, 184, 166, 0.26);
  border-color: #14b8a6;
}
.sku-jump-chip--tg {
  background: rgba(168, 85, 247, 0.15);
  border: 1px solid rgba(168, 85, 247, 0.4);
  color: #d8b4fe;
}
.sku-jump-chip--tg:hover {
  background: rgba(168, 85, 247, 0.3);
  border-color: #a855f7;
  color: #faf5ff;
}
.sku-jump-chip--tg-lp {
  background: rgba(59, 130, 246, 0.14);
  border: 1px dashed rgba(59, 130, 246, 0.38);
  color: #93c5fd;
}
.sku-jump-chip--tg-lp:hover {
  background: rgba(59, 130, 246, 0.28);
  border-color: #3b82f6;
}
.sku-jump-chip--skulist {
  background: rgba(245, 158, 11, 0.16);
  border: 1px solid rgba(245, 158, 11, 0.45);
  color: #fde68a;
}
.sku-jump-chip--skulist:hover {
  background: rgba(245, 158, 11, 0.32);
  border-color: #f59e0b;
  color: #fffbeb;
}
.sku-jump-chip--skulist-hw {
  background: rgba(234, 88, 12, 0.15);
  border: 1px dashed rgba(249, 115, 22, 0.45);
  color: #fdba74;
}
.sku-jump-chip--skulist-hw:hover {
  background: rgba(234, 88, 12, 0.3);
  border-color: #f97316;
  color: #ffedd5;
}

/* Excel Sheet Navigator Modal */
.excel-nav-modal {
  max-width: 1420px;
  width: 97vw;
  height: 90vh;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  background: #0b1120;
  border: 1px solid rgba(56, 189, 248, 0.3);
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.85);
}
.excel-nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(90deg, #0f172a, #1e293b);
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  flex-wrap: wrap;
}
.excel-nav-file-switcher {
  display: inline-flex;
  background: #090d16;
  padding: 3px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  gap: 4px;
}
.excel-nav-file-btn {
  padding: 5px 11px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s;
}
.excel-nav-file-btn.active {
  background: rgba(16, 185, 129, 0.22);
  color: #6ee7b7;
  box-shadow: inset 0 0 0 1px rgba(16, 185, 129, 0.45);
}
.excel-nav-sku-pill {
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.35);
  color: #bae6fd;
  font-family: monospace;
  font-size: 12.5px;
}
.excel-nav-coord-pill {
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(245, 158, 11, 0.18);
  border: 1px solid rgba(245, 158, 11, 0.45);
  color: #fde68a;
  font-family: monospace;
  font-weight: 700;
  font-size: 12.5px;
}
.excel-nav-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 11px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 700;
  background: rgba(30, 41, 59, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: #e2e8f0;
  cursor: pointer;
  transition: all 0.18s;
}
.excel-nav-action-btn:hover {
  border-color: #38bdf8;
  color: #ffffff;
  background: rgba(51, 65, 85, 0.9);
}
.excel-nav-action-btn--copy {
  background: rgba(16, 185, 129, 0.18);
  border-color: rgba(16, 185, 129, 0.45);
  color: #6ee7b7;
}
.excel-nav-action-btn--excel {
  background: rgba(22, 163, 74, 0.22);
  border-color: rgba(34, 197, 94, 0.5);
  color: #86efac;
}
.excel-nav-locations-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: #0f172a;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
  flex-wrap: wrap;
}
.excel-nav-loc-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11.5px;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.16s;
}
.excel-nav-loc-pill:hover {
  border-color: #38bdf8;
  color: #fff;
}
.excel-nav-loc-pill.active {
  background: rgba(245, 158, 11, 0.22);
  border-color: #fbbf24;
  color: #fef08a;
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.25);
}
.excel-nav-loc-pill .loc-cell {
  font-family: monospace;
  font-weight: 700;
  color: #38bdf8;
}
.excel-nav-loc-pill.active .loc-cell {
  color: #fde047;
}
.excel-nav-formulabar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: #111827;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}
.excel-nav-namebox {
  min-width: 74px;
  padding: 4px 10px;
  border-radius: 5px;
  background: #090d16;
  border: 1px solid rgba(148, 163, 184, 0.28);
  color: #fbbf24;
  font-family: monospace;
  font-weight: 800;
  font-size: 12.5px;
  text-align: center;
}
.excel-nav-fx {
  font-family: Georgia, serif;
  font-style: italic;
  font-weight: 700;
  color: #94a3b8;
  padding: 0 4px;
}
.excel-nav-formulavalue {
  flex: 1;
  min-width: 0;
  padding: 4px 10px;
  border-radius: 5px;
  background: #090d16;
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #f1f5f9;
  font-family: monospace;
  font-size: 12.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.excel-nav-searchwrap {
  display: flex;
  align-items: center;
  gap: 5px;
}
.excel-nav-searchinput {
  width: 250px;
  padding: 4px 10px;
  border-radius: 5px;
  background: #090d16;
  border: 1px solid rgba(148, 163, 184, 0.28);
  color: #f8fafc;
  font-size: 12px;
}
.excel-nav-searchbtn {
  padding: 4px 10px;
  border-radius: 5px;
  background: rgba(56, 189, 248, 0.2);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #bae6fd;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.excel-nav-window-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 7px 14px;
  background: rgba(30, 58, 138, 0.35);
  border-bottom: 1px solid rgba(59, 130, 246, 0.3);
  font-size: 12px;
  color: #bfdbfe;
}
.excel-nav-grid-wrap {
  flex: 1;
  overflow: auto;
  background: #090d16;
  position: relative;
}
.excel-nav-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.excel-nav-table thead th {
  position: sticky;
  top: 0;
  z-index: 3;
  background: #1e293b;
  color: #94a3b8;
  font-weight: 700;
  font-family: monospace;
  text-align: center;
  padding: 5px 8px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  min-width: 90px;
}
.excel-nav-table thead th.excel-col-corner {
  min-width: 54px;
  width: 54px;
  left: 0;
  z-index: 4;
  background: #0f172a;
}
.excel-nav-table thead th.excel-col-active {
  background: rgba(245, 158, 11, 0.25);
  color: #fde047;
  border-bottom: 2px solid #fbbf24;
}
.excel-nav-table tbody td {
  border: 1px solid rgba(148, 163, 184, 0.14);
  padding: 5px 8px;
  color: #e2e8f0;
  vertical-align: top;
  max-width: 340px;
  cursor: cell;
}
.excel-nav-table tbody td.excel-row-num {
  position: sticky;
  left: 0;
  z-index: 2;
  background: #1e293b;
  color: #94a3b8;
  font-family: monospace;
  font-weight: 700;
  text-align: right;
  padding-right: 8px;
  user-select: none;
  min-width: 54px;
}
.excel-cell-inner {
  max-height: 64px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: pre-wrap;
  line-height: 1.35;
}
.excel-cell-num {
  text-align: right;
  font-family: monospace;
  color: #34d399;
}
.excel-cell-sku {
  font-family: monospace;
  font-weight: 700;
  color: #38bdf8;
}
.excel-row-header td {
  background: rgba(30, 41, 59, 0.92);
  font-weight: 800;
  color: #f8fafc;
}
.excel-row-group td {
  background: rgba(59, 130, 246, 0.14);
  font-weight: 700;
  color: #93c5fd;
}
@keyframes excel-row-glow-pulse {
  0%, 100% {
    box-shadow: inset 0 0 18px rgba(245, 158, 11, 0.28);
  }
  50% {
    box-shadow: inset 0 0 28px rgba(16, 185, 129, 0.42);
  }
}
.excel-row-target {
  animation: excel-row-glow-pulse 2.2s infinite ease-in-out;
  position: relative;
}
.excel-row-target td {
  background: linear-gradient(90deg, rgba(245, 158, 11, 0.34), rgba(16, 185, 129, 0.26)) !important;
  border-top: 2px solid #fbbf24 !important;
  border-bottom: 2px solid #fbbf24 !important;
  color: #ffffff !important;
  font-weight: 700 !important;
}
.excel-row-target td .excel-cell-inner {
  max-height: none;
  color: #fef08a;
  font-weight: 700;
}
.excel-row-target td.excel-cell-num .excel-cell-inner {
  color: #6ee7b7;
  font-size: 13px;
  font-weight: 800;
}
.excel-row-target td.excel-row-num {
  background: linear-gradient(135deg, #f59e0b, #10b981) !important;
  color: #052e16 !important;
  font-weight: 900 !important;
  border-left: 3px solid #fde047 !important;
}
.excel-target-arrow {
  margin-right: 3px;
  font-size: 10px;
}
.excel-cell-target {
  outline: 2.5px solid #34d399 !important;
  outline-offset: -2px;
  background: rgba(16, 185, 129, 0.4) !important;
  color: #ffffff !important;
  font-weight: 800;
}
.cmp-row--active-sku td {
  background: linear-gradient(90deg, rgba(245, 158, 11, 0.2), rgba(56, 189, 248, 0.16)) !important;
  border-top: 1.5px solid #fbbf24 !important;
  border-bottom: 1.5px solid #fbbf24 !important;
}
.excel-nav-sheetbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 12px;
  background: #0f172a;
  border-top: 1px solid rgba(148, 163, 184, 0.24);
  flex-wrap: wrap;
}
.excel-nav-sheettabs {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  max-width: 100%;
  padding-bottom: 2px;
}
.excel-nav-sheettab {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: 6px 6px 0 0;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: #1e293b;
  color: #94a3b8;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.16s;
}
.excel-nav-sheettab:hover {
  color: #f8fafc;
  background: #334155;
}
.excel-nav-sheettab.active {
  background: #090d16;
  color: #34d399;
  border-color: #10b981;
  border-bottom-color: #090d16;
}
.excel-nav-sheettab.has-sku {
  border-color: rgba(245, 158, 11, 0.5);
}
.sheet-sku-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #fbbf24;
  box-shadow: 0 0 6px #fbbf24;
}
.excel-nav-statusbar {
  font-size: 11.5px;
  color: #94a3b8;
}

.card-ref-compare-btn {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;
}
.card-ref-compare-btn--sophos {
  background: rgba(56, 189, 248, 0.13);
  border: 1px solid rgba(56, 189, 248, 0.42);
  color: #38bdf8;
}
.card-ref-compare-btn--sophos:hover {
  background: rgba(56, 189, 248, 0.25);
  border-color: #38bdf8;
  color: #e0f2fe;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(56, 189, 248, 0.22);
}
.card-ref-compare-btn--kas {
  background: rgba(16, 185, 129, 0.13);
  border: 1px solid rgba(16, 185, 129, 0.42);
  color: #34d399;
}
.card-ref-compare-btn--kas:hover {
  background: rgba(16, 185, 129, 0.25);
  border-color: #10b981;
  color: #ecfdf5;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.22);
}
.card-ref-compare-btn--acronis {
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(129, 140, 248, 0.45);
  color: #a5b4fc;
}
.card-ref-compare-btn--acronis:hover {
  background: rgba(99, 102, 241, 0.28);
  border-color: #818cf8;
  color: #e0e7ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

/* Bộ lọc Sắp xếp & Dropdown Hãng / Danh mục / Nhà cung cấp (Lazy Loading) */
.hh-filter-sort-group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.hh-filter-select {
  height: 40px;
  padding: 0 14px;
  border-radius: 99px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(15, 23, 42, 0.72);
  color: #f8fafc;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
}
.hh-filter-select:hover,
.hh-filter-select:focus {
  border-color: rgba(56, 189, 248, 0.5);
  background: rgba(15, 23, 42, 0.92);
}

.hh-lazy-dropdown {
  position: relative;
}

.hh-lazy-dropdown__trigger {
  height: 40px;
  padding: 0 14px;
  border-radius: 99px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(15, 23, 42, 0.72);
  color: #e2e8f0;
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.hh-lazy-dropdown__trigger:hover {
  border-color: rgba(20, 184, 166, 0.5);
  background: rgba(15, 23, 42, 0.92);
}
.hh-lazy-dropdown__trigger.active {
  border-color: rgba(20, 184, 166, 0.65);
  background: rgba(20, 184, 166, 0.16);
  color: #5eead4;
}
.hh-lazy-dropdown__caret {
  font-size: 11px;
  color: #94a3b8;
}

.hh-lazy-dropdown__menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  min-width: 250px;
  max-width: 340px;
  background: #0f172a;
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 12px;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.65);
  z-index: 120;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.hh-lazy-dropdown__menu--wide {
  min-width: 310px;
  max-width: 420px;
}

.hh-lazy-dropdown__search-wrap {
  padding: 8px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 23, 42, 0.95);
}

.hh-lazy-dropdown__search {
  width: 100%;
  padding: 7px 10px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(30, 41, 59, 0.8);
  color: #f8fafc;
  font-size: 12.5px;
  outline: none;
  box-sizing: border-box;
}
.hh-lazy-dropdown__search:focus {
  border-color: #38bdf8;
}

.hh-lazy-dropdown__list {
  max-height: 280px;
  overflow-y: auto;
  padding: 4px 0;
}
.hh-lazy-dropdown__list::-webkit-scrollbar {
  width: 6px;
}
.hh-lazy-dropdown__list::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 3px;
}

.hh-lazy-dropdown__item {
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 12.5px;
  color: #cbd5e1;
  cursor: pointer;
  transition: background 0.15s ease;
}
.hh-lazy-dropdown__item span:first-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hh-lazy-dropdown__item:hover {
  background: rgba(56, 189, 248, 0.12);
  color: #f8fafc;
}
.hh-lazy-dropdown__item.selected {
  background: rgba(20, 184, 166, 0.2);
  color: #5eead4;
  font-weight: 700;
}

.hh-lazy-dropdown__count {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  flex-shrink: 0;
}

.hh-lazy-dropdown__empty {
  padding: 14px 12px;
  text-align: center;
  font-size: 12px;
  color: #64748b;
}

.hh-lazy-dropdown__more {
  padding: 8px 12px;
  text-align: center;
  font-size: 11.5px;
  font-weight: 600;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.08);
  cursor: pointer;
  border-top: 1px dashed rgba(56, 189, 248, 0.25);
}
.hh-lazy-dropdown__more:hover {
  background: rgba(56, 189, 248, 0.16);
}

.hh-clear-filter-btn {
  height: 40px;
  padding: 0 14px;
  border-radius: 99px;
  border: 1px solid rgba(239, 68, 68, 0.45);
  background: rgba(239, 68, 68, 0.14);
  color: #fca5a5;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}
.hh-clear-filter-btn:hover {
  background: rgba(239, 68, 68, 0.26);
  color: #fee2e2;
}

@media (max-width: 1024px) {
  .imgcheck-result-grid {
    grid-template-columns: 1fr;
  }
  .imgcheck-settings-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .imgcheck-compare-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* =========================================================
   GIỎ HÀNG BÁO GIÁ TRÊN CARD & THANH TÍNH TOÁN NỔI
   ========================================================= */
.product-card.in-quote-cart {
  border-color: rgba(16, 185, 129, 0.7) !important;
  box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.35), 0 10px 25px -5px rgba(16, 185, 129, 0.18) !important;
}

.card-cart-action-box {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
}

.card-add-cart-btn {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(16, 185, 129, 0.45);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(5, 150, 105, 0.24) 100%);
  color: #34d399;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.card-add-cart-btn:hover {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  border-color: #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
  transform: translateY(-1px);
}

.card-cart-qty-cluster {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 5px 8px;
  border-radius: 8px;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.45);
}

.card-cart-selected-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  font-weight: 700;
  color: #34d399;
  white-space: nowrap;
}

.card-cart-stepper {
  display: inline-flex;
  align-items: center;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(51, 65, 85, 0.85);
  border-radius: 6px;
  overflow: hidden;
}

.card-cart-step-btn {
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 0;
}

.card-cart-step-btn:hover {
  background: rgba(16, 185, 129, 0.25);
  color: #34d399;
}

.card-cart-qty-input {
  width: 42px;
  height: 26px;
  border: none;
  border-left: 1px solid rgba(51, 65, 85, 0.7);
  border-right: 1px solid rgba(51, 65, 85, 0.7);
  background: transparent;
  color: #ffffff;
  font-size: 12.5px;
  font-weight: 800;
  text-align: center;
  outline: none;
  padding: 0 2px;
  -moz-appearance: textfield;
}

.card-cart-qty-input::-webkit-outer-spin-button,
.card-cart-qty-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.card-cart-remove-btn {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 1px solid rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.14);
  color: #f87171;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.card-cart-remove-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  color: #fee2e2;
}

.quote-cart-right-Launcher {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 9500;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px 10px 12px;
  border-radius: 14px 0 0 14px;
  border: 1px solid rgba(16, 185, 129, 0.55);
  border-right: none;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%);
  color: #f8fafc;
  cursor: pointer;
  box-shadow: -8px 10px 30px rgba(0, 0, 0, 0.55);
  transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}

.quote-cart-right-Launcher:hover {
  padding-right: 18px;
  border-color: #10b981;
  box-shadow: -10px 12px 34px rgba(16, 185, 129, 0.28);
}

.quote-cart-launcher__icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: #34d399;
}

.quote-cart-launcher__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.quote-cart-launcher__label {
  font-size: 11.5px;
  font-weight: 700;
  color: #e2e8f0;
  white-space: nowrap;
}

.quote-cart-launcher__total {
  font-size: 12px;
  font-weight: 800;
  color: #fbbf24;
  white-space: nowrap;
}

.quote-cart-right-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: min(410px, 92vw);
  height: 100vh;
  z-index: 9550;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.99) 0%, rgba(9, 13, 24, 0.99) 100%);
  border-left: 1px solid rgba(16, 185, 129, 0.45);
  box-shadow: -18px 0 45px rgba(0, 0, 0, 0.68);
  backdrop-filter: blur(14px);
  transform: translateX(102%);
  transition: transform 0.34s cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}

.quote-cart-right-sidebar.open {
  transform: translateX(0);
  pointer-events: auto;
}

.quote-cart-sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  background: rgba(30, 41, 59, 0.85);
  border-bottom: 1px solid rgba(51, 65, 85, 0.85);
  flex-shrink: 0;
}

.quote-cart-sidebar__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.quote-cart-sidebar__heading {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: 0.2px;
}

.quote-cart-sidebar__sub {
  margin: 2px 0 0;
  font-size: 12px;
  color: #94a3b8;
}

.quote-cart-sidebar__sub strong {
  color: #34d399;
}

.quote-cart-sidebar__collapse-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.18s ease;
}

.quote-cart-sidebar__collapse-btn:hover {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.5);
  color: #34d399;
}

.quote-cart-sidebar__body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quote-cart-sidebar__body::-webkit-scrollbar {
  width: 5px;
}

.quote-cart-sidebar__body::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.45);
  border-radius: 99px;
}

.quote-cart-sidebar__item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 11px 12px;
  border-radius: 10px;
  background: rgba(30, 41, 59, 0.65);
  border: 1px solid rgba(51, 65, 85, 0.75);
  cursor: pointer;
  transition: border-color 0.18s ease, background 0.18s ease;
}

.quote-cart-sidebar__item:hover {
  background: rgba(30, 41, 59, 0.92);
  border-color: rgba(16, 185, 129, 0.55);
}

.quote-cart-sidebar__item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.quote-cart-item-index {
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
}

.quote-cart-drawer__codes {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.quote-cart-code-sku {
  font-family: monospace;
  font-size: 11px;
  font-weight: 700;
  color: #c4b5fd;
  background: rgba(139, 92, 246, 0.16);
  padding: 1px 6px;
  border-radius: 4px;
}

.quote-cart-code-ma {
  font-family: monospace;
  font-size: 11px;
  font-weight: 700;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.14);
  padding: 1px 6px;
  border-radius: 4px;
}

.quote-cart-drawer__name {
  font-size: 13px;
  font-weight: 700;
  color: #f8fafc;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.quote-cart-drawer__price {
  font-size: 11.5px;
  color: #94a3b8;
}

.quote-cart-drawer__price strong {
  color: #34d399;
}

.quote-cart-drawer__vnd {
  color: #64748b;
  margin-left: 4px;
}

.quote-cart-sidebar__item-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 2px;
  padding-top: 6px;
  border-top: 1px dashed rgba(255, 255, 255, 0.08);
}

.quote-cart-drawer__subtotal {
  text-align: right;
  font-size: 13px;
  font-weight: 800;
  color: #f8fafc;
}

.quote-cart-sidebar__footer {
  padding: 14px 16px 18px;
  background: rgba(15, 23, 42, 0.98);
  border-top: 1px solid rgba(51, 65, 85, 0.9);
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
}

.quote-cart-sidebar__totals {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 9px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(51, 65, 85, 0.7);
}

.quote-cart-total-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12.5px;
  color: #cbd5e1;
}

.quote-cart-total-row.after-tax {
  padding-top: 5px;
  border-top: 1px dashed rgba(148, 163, 184, 0.2);
  font-size: 13px;
  font-weight: 700;
}

.quote-cart-icon-badge {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(16, 185, 129, 0.18);
  border: 1px solid rgba(16, 185, 129, 0.45);
  color: #34d399;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.quote-cart-count-pill {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 999px;
  background: #10b981;
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.quote-cart-total-highlight {
  color: #fbbf24;
  font-size: 14px;
  font-weight: 800;
}

.quote-cart-sidebar__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quote-cart-btn-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 13px;
  border-radius: 10px;
  border: 1px solid rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.14);
  color: #fca5a5;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
}

.quote-cart-btn-clear:hover {
  background: rgba(239, 68, 68, 0.28);
  color: #fee2e2;
}

.quote-cart-btn-calculate {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 18px;
  border-radius: 10px;
  border: 1px solid rgba(52, 211, 153, 0.5);
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  font-size: 13.5px;
  font-weight: 800;
  letter-spacing: 0.2px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
  transition: all 0.2s ease;
}

.quote-cart-btn-calculate:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.55);
  transform: translateY(-1px);
}
</style>
