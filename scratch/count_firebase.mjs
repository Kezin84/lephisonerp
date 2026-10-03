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
  const snap = await get(ref(database, 'REPORT'));
  if (snap.exists()) {
    const data = snap.val();
    console.log("Total reports in Firebase:", Object.keys(data).length);
  } else {
    console.log("No reports found.");
  }
  process.exit(0);
}

check();
