import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB3fHD_sOqyqVygCxP2gZtvaipr-35a1s8",
  databaseURL: "https://chusonproject-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chusonproject",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function check() {
  const snap = await get(ref(database, '/'));
  if (snap.exists()) {
    const data = snap.val();
    for (const key in data) {
        if (typeof data[key] === 'object' && data[key] !== null) {
            console.log(`Node ${key}: ${Object.keys(data[key]).length} items`);
        } else {
            console.log(`Node ${key}:`, data[key]);
        }
    }
  } else {
    console.log("No data found.");
  }
  process.exit(0);
}

check();
