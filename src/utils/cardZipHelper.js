import JSZip from 'jszip';
import fileSaver from 'file-saver';

const saveAs = (typeof fileSaver === 'function' ? fileSaver : fileSaver?.saveAs) || (typeof window !== 'undefined' ? window?.saveAs : null);

/**
 * Hàm kích hoạt tải file ZIP về máy an toàn trên mọi trình duyệt (Edge, Chrome, Cốc Cốc, Firefox)
 * Đảm bảo file luôn giữ đúng tên và đuôi .zip, không bị Edge đổi thành mã UUID
 */
export function triggerZipDownload(blob, filename) {
  const safeFilename = sanitizeZipFileName(filename);
  const safeBlob = (blob instanceof Blob && blob.type === 'application/zip')
    ? blob
    : new Blob([blob], { type: 'application/zip' });

  // 1. Nếu trình duyệt hỗ trợ msSaveOrOpenBlob (Edge cũ / IE)
  if (typeof window !== 'undefined' && window.navigator && window.navigator.msSaveOrOpenBlob) {
    try {
      window.navigator.msSaveOrOpenBlob(safeBlob, safeFilename);
      return;
    } catch (e) {}
  }

  // 2. Thử dùng saveAs của file-saver
  if (typeof saveAs === 'function') {
    try {
      saveAs(safeBlob, safeFilename);
      return;
    } catch (saveErr) {
      console.warn('[ZIP] saveAs error, using DOM fallback:', saveErr);
    }
  }

  // 3. Fallback dùng thẻ <a> đính vào body và giữ URL 60s để Edge kịp hoàn tất lưu file
  const objectUrl = window.URL.createObjectURL(safeBlob);
  const downloadLink = document.createElement('a');
  downloadLink.style.position = 'fixed';
  downloadLink.style.top = '-9999px';
  downloadLink.style.left = '-9999px';
  downloadLink.style.opacity = '0';
  downloadLink.href = objectUrl;
  downloadLink.setAttribute('download', safeFilename);
  downloadLink.download = safeFilename;
  downloadLink.rel = 'noopener';
  document.body.appendChild(downloadLink);

  try {
    downloadLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  } catch (clickErr) {
    downloadLink.click();
  }

  setTimeout(() => {
    try {
      if (document.body.contains(downloadLink)) {
        document.body.removeChild(downloadLink);
      }
      window.URL.revokeObjectURL(objectUrl);
    } catch (e) {}
  }, 60000);
}

/**
 * Làm sạch tên thư mục / tên file để hợp lệ trên mọi hệ điều hành (Windows, macOS, Linux)
 * Loại bỏ các ký tự cấm: \ / : * ? " < > | cùng dấu xuống dòng, khoảng trắng thừa và dấu chấm ở cuối
 */
export function sanitizeName(name, maxLength = 80) {
  if (!name || typeof name !== 'string') return '';
  let clean = name
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[\\/:*?"<>|#%&]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\.+$/, ''); // Windows không cho phép thư mục/file kết thúc bằng dấu chấm
  
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength).trim().replace(/\.+$/, '');
  }
  return clean;
}

/**
 * Làm sạch tên file ZIP ngoài cùng, đảm bảo luôn có đuôi .zip và không bị trình duyệt (Edge/Chrome) cắt xén
 */
export function sanitizeZipFileName(name, maxLength = 70) {
  if (!name || typeof name !== 'string') return 'tai_ve.zip';
  let clean = name
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[\\/:*?"<>|#%&]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\.+$/, '');

  if (clean.toLowerCase().endsWith('.zip')) {
    clean = clean.substring(0, clean.length - 4);
  }
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength).trim().replace(/\.+$/, '');
  }
  return (clean || 'tai_ve') + '.zip';
}

/**
 * Trích xuất tên file và extension từ URL hoặc object file
 */
export function extractFileName(fileItem, defaultPrefix = 'File', index = 0) {
  let name = '';
  let url = '';

  if (typeof fileItem === 'string') {
    url = fileItem.trim();
  } else if (fileItem && typeof fileItem === 'object') {
    name = (fileItem.name || fileItem.fileName || fileItem.title || '').trim();
    url = (fileItem.url || fileItem.link || fileItem.href || '').trim();
  }

  if (!url && !name) return null;

  if (!name && url) {
    try {
      const parts = url.split('?')[0].split('/');
      const last = parts[parts.length - 1];
      if (last) {
        name = decodeURIComponent(last);
      }
    } catch (e) {
      name = `${defaultPrefix}_${index + 1}`;
    }
  }

  if (!name) {
    name = `${defaultPrefix}_${index + 1}`;
  }

  // Bổ sung phần mở rộng (.pdf, .jpg, .png...) nếu trong tên chưa có nhưng trong URL có
  if (url) {
    try {
      const cleanUrl = url.split('?')[0];
      const lastDot = cleanUrl.lastIndexOf('.');
      if (lastDot > -1) {
        const ext = cleanUrl.substring(lastDot);
        if (ext && ext.length <= 6 && !ext.includes('/') && !name.toLowerCase().endsWith(ext.toLowerCase())) {
          name = name + ext;
        }
      }
    } catch (e) {}
  }

  return {
    url,
    name: sanitizeName(name, 120) || `${defaultPrefix}_${index + 1}`
  };
}

/**
 * Đảm bảo các tên file trong cùng 1 thư mục không bị trùng nhau
 */
export function deduplicateFileNames(items) {
  const nameCounts = {};
  return items.map((item) => {
    let currentName = item.name;
    const lastDot = currentName.lastIndexOf('.');
    const base = lastDot > -1 ? currentName.substring(0, lastDot) : currentName;
    const ext = lastDot > -1 ? currentName.substring(lastDot) : '';

    if (nameCounts[currentName] !== undefined) {
      nameCounts[currentName]++;
      const uniqueName = `${base} (${nameCounts[currentName]})${ext}`;
      return { ...item, name: uniqueName };
    } else {
      nameCounts[currentName] = 0;
      return { ...item };
    }
  });
}

/**
 * Tải toàn bộ file & ảnh trong card và nén thành file ZIP với cấu trúc:
 * Tên khách hàng > Nội dung file (ghi chú file nếu có) > Các file + ảnh
 * 
 * @param {Object} options
 * @param {string} options.customerName - Tên khách hàng
 * @param {string} options.noiDung - Nội dung card/hồ sơ
 * @param {string} options.ghiChu - Ghi chú card/hồ sơ nếu có
 * @param {Array} options.files - Danh sách file tài liệu
 * @param {Array} options.images - Danh sách file hình ảnh
 * @param {Function} [options.onProgress] - Callback tiến trình (percent, message)
 */
export async function downloadCardFilesAsZip({
  customerName = '',
  noiDung = '',
  ghiChu = '',
  files = [],
  images = [],
  onProgress = null
}) {
  // 1. Chuẩn hóa danh sách file & ảnh
  const rawList = [];

  (files || []).forEach((f, idx) => {
    const parsed = extractFileName(f, 'Tai_lieu', idx);
    if (parsed && parsed.url) {
      rawList.push(parsed);
    }
  });

  (images || []).forEach((img, idx) => {
    const parsed = extractFileName(img, 'Hinh_anh', idx);
    if (parsed && parsed.url) {
      rawList.push(parsed);
    }
  });

  if (rawList.length === 0) {
    throw new Error('Không có file hoặc hình ảnh nào trong card để tải về.');
  }

  // Đảm bảo không trùng tên file
  const fileItems = deduplicateFileNames(rawList);

  // 2. Xác định cấu trúc thư mục
  // Cấp 1: Tên khách hàng
  const cleanCustomerName = sanitizeName(customerName || 'Khach_hang', 60) || 'Khach_hang';

  // Cấp 2: Nội dung file (ghi chú file nếu có)
  const cleanNoiDung = sanitizeName(noiDung || 'Noi_dung_ho_so', 50) || 'Noi_dung_ho_so';
  const cleanGhiChu = sanitizeName(ghiChu || '', 40);

  let folderContentName = cleanNoiDung;
  if (cleanGhiChu) {
    folderContentName = `${cleanNoiDung} (${cleanGhiChu})`;
  }
  // Giới hạn độ dài tên thư mục con để an toàn với Windows path
  folderContentName = sanitizeName(folderContentName, 80) || 'Noi_dung';

  // 3. Khởi tạo JSZip
  const zip = new JSZip();
  // Tạo thư mục cấp 1: Tên khách hàng -> Thư mục cấp 2: Nội dung file (ghi chú nếu có)
  const targetFolder = zip.folder(cleanCustomerName).folder(folderContentName);

  // 4. Fetch các file về dạng Blob và nạp vào ZIP
  const failedItems = [];
  let completed = 0;
  const total = fileItems.length;

  for (let i = 0; i < fileItems.length; i++) {
    const item = fileItems[i];
    if (onProgress) {
      onProgress(Math.round(((i + 0.1) / total) * 80), `Đang tải: ${item.name}`);
    }

    try {
      const response = await fetch(item.url, { mode: 'cors' });
      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }
      const blob = await response.blob();
      targetFolder.file(item.name, blob);
      completed++;
    } catch (err) {
      console.warn(`[ZIP] Không tải được trực tiếp file ${item.name} (${item.url}):`, err);
      failedItems.push({ ...item, error: err.message });
    }
  }

  // Nếu có file bị lỗi tải do CORS/Network, ghi file chú thích vào ZIP
  if (failedItems.length > 0) {
    let noteContent = `THÔNG TIN CÁC FILE KHÔNG TẢI ĐƯỢC TRỰC TIẾP:\n`;
    noteContent += `(Do chính sách bảo mật mạng / liên kết máy chủ ngăn chặn tải tự động)\n\n`;
    failedItems.forEach((f, idx) => {
      noteContent += `${idx + 1}. Tên: ${f.name}\n   Link tải trực tiếp: ${f.url}\n   Lỗi: ${f.error}\n\n`;
    });
    targetFolder.file('_danh_sach_file_chua_tai_duoc.txt', noteContent);
  }

  if (completed === 0 && failedItems.length > 0) {
    throw new Error('Không thể tải các file đính kèm từ máy chủ (có thể do chặn CORS mạng). Vui lòng thử tải từng file riêng lẻ.');
  }

  if (onProgress) {
    onProgress(90, 'Đang đóng gói file ZIP...');
  }

  // 5. Tạo file ZIP blob - BẮT BUỘC chỉ định mimeType: 'application/zip' để trình duyệt nhận diện đúng file nén
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/zip',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  }, (metadata) => {
    if (onProgress && metadata.percent) {
      onProgress(90 + Math.round(metadata.percent * 0.1), 'Đang nén dữ liệu...');
    }
  });

  // 6. Tên file ZIP tải về: Tên khách hàng - Nội dung (Ghi chú).zip
  const zipFileName = sanitizeZipFileName(`${cleanCustomerName} - ${folderContentName}`, 70);

  // 7. Kích hoạt tải về máy an toàn (tương thích Edge, Chrome, Cốc Cốc, Windows)
  triggerZipDownload(zipBlob, zipFileName);

  if (onProgress) {
    onProgress(100, 'Tải về thành công!');
  }

  return {
    success: true,
    total,
    completed,
    failed: failedItems.length,
    fileName: zipFileName
  };
}

/**
 * Tải hàng loạt file & ảnh từ nhiều card/hồ sơ và nén thành 1 file ZIP duy nhất:
 * Tên file: Export_File_DD-MM-YYYY_HHmm.zip (hoặc theo ngày hiện tại)
 * Cấu trúc thư mục trong ZIP:
 *   [Tên khách hàng] > [Nội dung file (ghi chú)] > các file + ảnh
 * 
 * @param {Object} options
 * @param {Array} options.cards - Danh sách các card: [{ id, customerName, noiDung, ghiChu, files, images }]
 * @param {string} [options.zipFileName] - Tên file ZIP tùy chọn
 * @param {Function} [options.onProgress] - Callback: ({ percent, currentCard, totalCards, currentFile, totalFiles, message })
 * @param {Object} [options.cancelSignal] - { isCancelled: boolean }
 */
export async function exportBatchCardsAsZip({
  cards = [],
  zipFileName = '',
  onProgress = null,
  cancelSignal = null
}) {
  if (!cards || cards.length === 0) {
    throw new Error('Vui lòng chọn ít nhất 1 hồ sơ để xuất file.');
  }

  // 1. Chuẩn bị danh sách hồ sơ và bóc tách file/ảnh
  const processedCards = [];
  const customerFolderMap = {};
  let grandTotalFiles = 0;

  cards.forEach((card) => {
    const rawList = [];
    (card.files || []).forEach((f, idx) => {
      const parsed = extractFileName(f, 'Tai_lieu', idx);
      if (parsed && parsed.url) rawList.push(parsed);
    });
    (card.images || []).forEach((img, idx) => {
      const parsed = extractFileName(img, 'Hinh_anh', idx);
      if (parsed && parsed.url) rawList.push(parsed);
    });

    const fileItems = deduplicateFileNames(rawList);
    grandTotalFiles += fileItems.length;

    // Chuẩn bị tên thư mục: Tên khách hàng > Nội dung file (ghi chú)
    const cleanCustomer = sanitizeName(card.customerName || 'Khach_hang', 60) || 'Khach_hang';
    const cleanNoiDung = sanitizeName(card.noiDung || 'Noi_dung_ho_so', 50) || 'Noi_dung_ho_so';
    const cleanGhiChu = sanitizeName(card.ghiChu || '', 40);

    let baseFolderName = cleanNoiDung;
    if (cleanGhiChu) {
      baseFolderName = `${cleanNoiDung} (${cleanGhiChu})`;
    }
    baseFolderName = sanitizeName(baseFolderName, 70) || 'Ho_so';

    if (!customerFolderMap[cleanCustomer]) {
      customerFolderMap[cleanCustomer] = {};
    }

    let finalFolderName = baseFolderName;
    if (customerFolderMap[cleanCustomer][baseFolderName] !== undefined) {
      customerFolderMap[cleanCustomer][baseFolderName]++;
      const count = customerFolderMap[cleanCustomer][baseFolderName];
      const idSuffix = card.id ? ` - ID ${card.id}` : ` (${count})`;
      finalFolderName = sanitizeName(`${baseFolderName}${idSuffix}`, 80);
    } else {
      customerFolderMap[cleanCustomer][baseFolderName] = 0;
    }

    processedCards.push({
      card,
      cleanCustomer,
      folderContent: finalFolderName,
      fileItems
    });
  });

  if (grandTotalFiles === 0) {
    throw new Error('Các hồ sơ đã chọn không chứa bất kỳ file hoặc hình ảnh nào để tải về.');
  }

  // 2. Khởi tạo JSZip
  const zip = new JSZip();

  // 3. Tiến hành tải song song các file (concurrency pool 4 file cùng lúc)
  let completedFiles = 0;
  let failedFiles = 0;
  const allCardFailedItems = {};

  const allDownloadTasks = [];
  processedCards.forEach((c) => {
    c.fileItems.forEach((item) => {
      allDownloadTasks.push({
        card: c,
        item
      });
    });
  });

  const CONCURRENCY = 4;
  let taskIndex = 0;

  async function worker() {
    while (taskIndex < allDownloadTasks.length) {
      if (cancelSignal && cancelSignal.isCancelled) {
        throw new Error('Quá trình tải file đã bị người dùng hủy bỏ.');
      }

      const currentTaskIdx = taskIndex++;
      const { card, item } = allDownloadTasks[currentTaskIdx];
      const currentCardIdx = processedCards.indexOf(card) + 1;

      if (onProgress) {
        const percent = Math.round((currentTaskIdx / grandTotalFiles) * 85);
        onProgress({
          percent,
          currentFile: currentTaskIdx + 1,
          totalFiles: grandTotalFiles,
          currentCard: currentCardIdx,
          totalCards: processedCards.length,
          message: `Đang tải (${currentTaskIdx + 1}/${grandTotalFiles}): ${item.name}`
        });
      }

      try {
        const response = await fetch(item.url, { mode: 'cors' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();

        const targetFolder = zip.folder(card.cleanCustomer).folder(card.folderContent);
        targetFolder.file(item.name, blob);
        completedFiles++;
      } catch (err) {
        console.warn(`[Batch ZIP] Không tải được file ${item.name} (${item.url}):`, err);
        failedFiles++;
        if (!allCardFailedItems[card.card.id]) {
          allCardFailedItems[card.card.id] = {
            card,
            items: []
          };
        }
        allCardFailedItems[card.card.id].items.push({ ...item, error: err.message });
      }
    }
  }

  const workers = [];
  for (let i = 0; i < Math.min(CONCURRENCY, allDownloadTasks.length); i++) {
    workers.push(worker());
  }
  await Promise.all(workers);

  if (cancelSignal && cancelSignal.isCancelled) {
    throw new Error('Quá trình tải file đã bị người dùng hủy bỏ.');
  }

  // Ghi file log chú thích các file không tải được trực tiếp do CORS/mạng
  Object.values(allCardFailedItems).forEach(({ card, items }) => {
    if (items.length > 0) {
      let note = `DANH SÁCH FILE KHÔNG TẢI ĐƯỢC TRỰC TIẾP CỦA HỒ SƠ:\n`;
      note += `(Do liên kết máy chủ / chính sách bảo mật mạng ngăn chặn tải tự động)\n\n`;
      items.forEach((it, idx) => {
        note += `${idx + 1}. Tên: ${it.name}\n   Link tải trực tiếp: ${it.url}\n   Lỗi: ${it.error}\n\n`;
      });
      const targetFolder = zip.folder(card.cleanCustomer).folder(card.folderContent);
      targetFolder.file('_danh_sach_file_chua_tai_duoc.txt', note);
    }
  });

  if (completedFiles === 0 && failedFiles > 0) {
    throw new Error('Không thể tải các file đính kèm từ máy chủ (có thể do lỗi mạng hoặc chặn CORS).');
  }

  // 4. Đóng gói ZIP
  if (onProgress) {
    onProgress({
      percent: 90,
      currentFile: grandTotalFiles,
      totalFiles: grandTotalFiles,
      currentCard: processedCards.length,
      totalCards: processedCards.length,
      message: 'Đang đóng gói file ZIP...'
    });
  }

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/zip',
    compression: 'DEFLATE',
    compressionOptions: { level: 5 }
  }, (meta) => {
    if (onProgress && meta.percent) {
      const p = 90 + Math.round(meta.percent * 0.1);
      onProgress({
        percent: p,
        currentFile: grandTotalFiles,
        totalFiles: grandTotalFiles,
        currentCard: processedCards.length,
        totalCards: processedCards.length,
        message: `Đang nén dữ liệu ZIP (${Math.round(meta.percent)}%)...`
      });
    }
  });

  // 5. Tên file ZIP tải về: Export_File_DD-MM-YYYY_HHmm.zip
  let finalZipName = zipFileName;
  if (!finalZipName) {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    finalZipName = `Export_File_${dd}-${mm}-${yyyy}_${hh}h${min}.zip`;
  }
  finalZipName = sanitizeZipFileName(finalZipName, 80);

  // 6. Kích hoạt tải về máy
  triggerZipDownload(zipBlob, finalZipName);

  if (onProgress) {
    onProgress({
      percent: 100,
      currentFile: grandTotalFiles,
      totalFiles: grandTotalFiles,
      currentCard: processedCards.length,
      totalCards: processedCards.length,
      message: 'Tải về thành công!'
    });
  }

  return {
    success: true,
    totalCards: processedCards.length,
    totalFiles: grandTotalFiles,
    completedFiles,
    failedFiles,
    fileName: finalZipName
  };
}

