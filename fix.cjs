const fs = require('fs');
let content = fs.readFileSync('src/components/BaoGia.vue', 'utf8');

const startTarget = 'const exportToImage = async () => {';
const startIdx = content.indexOf(startTarget);
if (startIdx === -1) throw new Error('Not found start');

const endRegex = /isExportingImage\.value = false\s*showImageKitModal\.value = false\s*\}\s*\}/;
const match = content.substring(startIdx).match(endRegex);
if (!match) throw new Error('Not found end');

const endIdx = startIdx + match.index + match[0].length;

const replaceWith = `const exportToImage = async () => {
  if (selectedItems.value.length === 0) {
    triggerToast('Chưa có hàng trong báo giá.')
    return
  }
  
  isExportingImage.value = true
  showAsyncLoading('Đang xử lý ảnh, vui lòng đợi...')
  try {
    await nextTick()
    await new Promise(r => setTimeout(r, 800))
    if (!exportImageContainer.value) {
      showAsyncError('Lỗi', 'Không tìm thấy khung chứa ảnh.')
      return
    }
    const canvas = await html2canvas(exportImageContainer.value, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    })
    const dataUrl = canvas.toDataURL('image/png')
    
    const link = document.createElement('a')
    link.download = \`BaoGia_\${soHopDong.value || maHopDong.value || 'Image'}.png\`
    link.href = dataUrl
    link.click()

    showAsyncSuccess('Thành công', 'Đã tải ảnh báo giá về máy.')
  } catch (err) {
    console.error('Lỗi khi xuất ảnh', err)
    showAsyncError('Lỗi', 'Không thể tạo ảnh, vui lòng thử lại.')
  } finally {
    isExportingImage.value = false
    showImageKitModal.value = false
  }
}`;

const newContent = content.substring(0, startIdx) + replaceWith + content.substring(endIdx);
fs.writeFileSync('src/components/BaoGia.vue', newContent, 'utf8');
console.log('Success exportToImage replace');
