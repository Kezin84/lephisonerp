const fs = require('fs');
const file = 'c:/chuSonProject/reminder-main/reminder-main/src/components/report.vue';
let content = fs.readFileSync(file, 'utf8');

const oldFunc = const getFileIconSvg = (fileName) => {
  const ext = fileName ? fileName.split('.').pop().toLowerCase() : '';
  const isExcel = ['xls', 'xlsx', 'csv'].includes(ext) || (fileName || '').toLowerCase().includes('excel') || (fileName || '').toLowerCase().includes('báo giá') || (fileName || '').toLowerCase().includes('mua hàng');
  const isWord = ['doc', 'docx'].includes(ext) || (fileName || '').toLowerCase().includes('word');
  const isPdf = ['pdf'].includes(ext);
  const isImage = ['png', 'jpg', 'jpeg', 'gif'].includes(ext);
  const isArchive = ['zip', 'rar', '7z'].includes(ext);

  if (isExcel) {
    return \<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 12l6 6"></path><path d="M15 12l-6 6"></path></svg>\;
  } else if (isWord) {
    return \<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 12l2 6 2-6 2 6 2-6"></path></svg>\;
  } else if (isPdf) {
    return \<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 15v-6h3a2 2 0 0 1 0 4h-3"></path></svg>\;
  } else if (isImage) {
    return \<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>\;
  } else if (isArchive) {
    return \<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="10" y1="12" x2="14" y2="12"></line><line x1="10" y1="14" x2="14" y2="14"></line><line x1="10" y1="16" x2="14" y2="16"></line></svg>\;
  }
  return \<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>\;
};

const newFunc = const getFileIconSvg = (fileName) => {
  const ext = fileName ? fileName.split('.').pop().toLowerCase() : '';
  const isExcel = ['xls', 'xlsx', 'csv'].includes(ext) || (fileName || '').toLowerCase().includes('excel') || (fileName || '').toLowerCase().includes('báo giá') || (fileName || '').toLowerCase().includes('mua hàng');
  const isWord = ['doc', 'docx'].includes(ext) || (fileName || '').toLowerCase().includes('word');
  const isPdf = ['pdf'].includes(ext);
  const isImage = ['png', 'jpg', 'jpeg', 'gif'].includes(ext);
  const isArchive = ['zip', 'rar', '7z'].includes(ext);

  if (isExcel) {
    return \<img src="https://upload.wikimedia.org/wikipedia/commons/3/34/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg" style="width: 14px; height: 14px; object-fit: contain;" />\;
  } else if (isWord) {
    return \<img src="https://upload.wikimedia.org/wikipedia/commons/f/fd/Microsoft_Office_Word_%282019%E2%80%93present%29.svg" style="width: 14px; height: 14px; object-fit: contain;" />\;
  } else if (isPdf) {
    return \<img src="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg" style="width: 14px; height: 14px; object-fit: contain;" />\;
  } else if (isImage) {
    return \<img src="https://cdn-icons-png.flaticon.com/512/3342/3342137.png" style="width: 14px; height: 14px; object-fit: contain;" />\;
  } else if (isArchive) {
    return \<img src="https://cdn-icons-png.flaticon.com/512/3022/3022134.png" style="width: 14px; height: 14px; object-fit: contain;" />\;
  }
  return \<img src="https://cdn-icons-png.flaticon.com/512/2965/2965335.png" style="width: 14px; height: 14px; object-fit: contain;" />\;
};

content = content.replace(oldFunc, newFunc);
fs.writeFileSync(file, content, 'utf8');
console.log("Replaced");
