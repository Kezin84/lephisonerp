import * as firebaseApp from "firebase/app";
import * as database from "firebase/database";
import xlsx from "xlsx";
import fs from "fs";

// Cấu hình Firebase mới (bao gồm databaseURL của Realtime Database)
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

const app = firebaseApp.initializeApp(firebaseConfig);
const db = database.getDatabase(app);

const EXCEL_PATH = "C:\\chuSonFireBase\\DB_REPORT_CHU_SON _CHUYEN_DOI.xlsx";

async function pushData() {
  console.log("Reading Excel file from:", EXCEL_PATH);
  if (!fs.existsSync(EXCEL_PATH)) {
    console.error("File not found!");
    process.exit(1);
  }

  const workbook = xlsx.readFile(EXCEL_PATH);
  
  for (const sheetName of workbook.SheetNames) {
    console.log(`\n========================================`);
    console.log(`Processing sheet: ${sheetName}`);
    const sheet = workbook.Sheets[sheetName];
    // Convert to JSON
    const data = xlsx.utils.sheet_to_json(sheet, { defval: "" });
    
    if (data.length === 0) {
      console.log(`Sheet ${sheetName} is empty, skipping.`);
      continue;
    }
    
    let count = 0;
    
    // Tùy chọn 1: Đẩy nguyên mảng lên một node (sheetName)
    // database.set(database.ref(db, sheetName), data);
    
    // Tùy chọn 2: Đẩy từng dòng lên và tạo key
    for (const row of data) {
      try {
        let docId = row.id || row.ID || row.Id || row.ma_hop_dong || row.ma_khach_hang;
        
        if (docId && String(docId).trim() !== "") {
            // Có ID cụ thể
            await database.set(database.ref(db, `${sheetName}/${String(docId)}`), row);
        } else {
            // Không có ID, sinh ID tự động
            const newRef = database.push(database.ref(db, sheetName));
            await database.set(newRef, row);
        }
        count++;
        if (count % 50 === 0) {
            console.log(` - Pushed ${count} rows to ${sheetName}...`);
        }
      } catch (err) {
        console.error(`Error pushing row in ${sheetName}:`, err.message);
      }
    }
    console.log(`Finished sheet ${sheetName}, total docs: ${count}`);
  }
  
  console.log("\nData import complete!");
  process.exit(0);
}

pushData();
