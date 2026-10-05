const fs = require('fs');
const path = require('path');

const srcDir = 'C:/chuSonFireBase/reminder-main/reminder-main/src/components';
const licenseModalPath = path.join(srcDir, 'ImportLicenseModal.vue');
const pdfModalPath = path.join(srcDir, 'ImportPDFModal.vue');

const licenseFirebasePath = path.join(srcDir, 'ImportLicenseFirebaseModal.vue');
const pdfFirebasePath = path.join(srcDir, 'ImportPDFFirebaseModal.vue');

const firebaseImports = `import { initializeApp } from "firebase/app";
import { getDatabase, ref as dbRef, push, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB3fHD_sOqyqVygCxP2gZtvaipr-35a1s8",
  authDomain: "chusonproject.firebaseapp.com",
  databaseURL: "https://chusonproject-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chusonproject",
  storageBucket: "chusonproject.firebasestorage.app",
  messagingSenderId: "929199941311",
  appId: "1:929199941311:web:ca8d86f9fd7f8dff61480a",
  measurementId: "G-48VVPGFSFK"
};
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);
`;

// 1. Process ImportLicenseModal.vue
let licenseContent = fs.readFileSync(licenseModalPath, 'utf8');
licenseContent = licenseContent.replace(
  "const API_URL = 'https://script.google.com/macros/s/AKfycbx1yDOQLxYgJb5w30KmxQHF8AYUZln_5q58HCKP4zlUmtJye6aJBiSt3oyT0j_3QaigdQ/exec'",
  firebaseImports
);

const saveRegex1 = /const response = await fetch\(API_URL, \{[\s\S]*?body: JSON\.stringify\(payload\)[\s\S]*?\}\)[\s\S]*?const result = await response\.json\(\)[\s\S]*?if \(result\.status === 'success'\) \{/;

const saveFirebase1 = `
    const newRef = push(dbRef(database, 'license_old_data'));
    delete payload.sheet;
    delete payload.action;
    await set(newRef, payload);
    if (true) {
`;
if (saveRegex1.test(licenseContent)) {
  licenseContent = licenseContent.replace(saveRegex1, saveFirebase1);
} else {
  console.log("Failed to match saveRegex1 in ImportLicenseModal");
}
fs.writeFileSync(licenseFirebasePath, licenseContent);


// 2. Process ImportPDFModal.vue
let pdfContent = fs.readFileSync(pdfModalPath, 'utf8');
pdfContent = pdfContent.replace(
  "const API_URL = 'https://script.google.com/macros/s/AKfycbx1yDOQLxYgJb5w30KmxQHF8AYUZln_5q58HCKP4zlUmtJye6aJBiSt3oyT0j_3QaigdQ/exec'",
  firebaseImports
);

const saveRegex2 = /return fetch\(API_URL, \{[\s\S]*?method: 'POST',[\s\S]*?body: JSON\.stringify\(payload\)[\s\S]*?\}\)\.then\(r => r\.json\(\)\)/g;

const saveFirebase2 = `
      delete payload.sheet;
      delete payload.action;
      const newRef = push(dbRef(database, 'license_old_data'));
      return set(newRef, payload).then(() => ({ status: 'success' }))
`;
if (saveRegex2.test(pdfContent)) {
  pdfContent = pdfContent.replace(saveRegex2, saveFirebase2);
} else {
  console.log("Failed to match saveRegex2 in ImportPDFModal");
}
fs.writeFileSync(pdfFirebasePath, pdfContent);

// 3. Process LicenseOldDataFirebase.vue
const licenseOldFirebasePath = path.join(srcDir, 'LicenseOldDataFirebase.vue');
let parentContent = fs.readFileSync(licenseOldFirebasePath, 'utf8');
parentContent = parentContent.replace(/import ImportLicenseModal from '\.\/ImportLicenseModal\.vue'/g, "import ImportLicenseModal from './ImportLicenseFirebaseModal.vue'");
parentContent = parentContent.replace(/import ImportPDFModal from '\.\/ImportPDFModal\.vue'/g, "import ImportPDFModal from './ImportPDFFirebaseModal.vue'");
fs.writeFileSync(licenseOldFirebasePath, parentContent);

console.log("Modals patched successfully");
