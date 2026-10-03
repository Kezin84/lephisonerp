import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB3fHD_sOqyqVygCxP2gZtvaipr-35a1s8",
  databaseURL: "https://chusonproject-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chusonproject",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const API_URL = "https://script.google.com/macros/s/AKfycbx1yDOQLxYgJb5w30KmxQHF8AYUZln_5q58HCKP4zlUmtJye6aJBiSt3oyT0j_3QaigdQ/exec";
const sheetsToSync = ['khach_hang', 'pipeline', 'pipeline_workflow', 'kho_luu_tru'];

async function syncSheets() {
  for (const sheet of sheetsToSync) {
    try {
      console.log("Fetching " + sheet + " from Google Apps Script...");
      const response = await fetch(API_URL + "?action=get&sheet=" + sheet);
      const result = await response.json();
      
      if (result.status === 'success' && result.data) {
        const data = result.data;
        console.log("Fetched " + data.length + " records for " + sheet + ". Saving to Firebase...");
        
        const firebaseObj = {};
        data.forEach((item, index) => {
          let id = item.id || item.ID || item.Id || item.ma_khach_hang || item.ma_hop_dong || ("item_" + index);
          firebaseObj[id] = item;
        });
        
        await set(ref(database, sheet), firebaseObj);
        console.log("Successfully synced " + sheet + ".");
      } else {
        console.error("Failed to fetch " + sheet + ":", result);
      }
    } catch (error) {
      console.error("Error syncing " + sheet + ":", error.message);
    }
  }
  process.exit(0);
}

syncSheets();
