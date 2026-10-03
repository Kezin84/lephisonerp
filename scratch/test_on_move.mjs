import { initializeApp } from "firebase/app";
import { getDatabase, ref, update, get } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB3fHD_sOqyqVygCxP2gZtvaipr-35a1s8",
  databaseURL: "https://chusonproject-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chusonproject",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function testUpdate() {
  const snap = await get(ref(database, 'REPORT'));
  const val = snap.val();
  const keys = Object.keys(val);
  const firstId = keys[0];
  const oldItem = val[firstId];

  console.log("Before:", oldItem);

  const payload = {
    ...oldItem,
    thoi_gian: "08:00 /3 /05/10/2026", // some new time
    id: firstId
  };

  await update(ref(database, `REPORT/${firstId}`), payload);

  const snapAfter = await get(ref(database, `REPORT/${firstId}`));
  console.log("After:", snapAfter.val());
  
  process.exit(0);
}

testUpdate();
