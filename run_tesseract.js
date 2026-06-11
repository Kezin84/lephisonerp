import Tesseract from 'tesseract.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function recognizeImage(imagePath) {
  console.log(`Recognizing ${imagePath}...`);
  const result = await Tesseract.recognize(imagePath, 'eng+vie', { logger: m => console.log(m) });
  console.log(`\n\n--- Result for ${imagePath} ---`);
  console.log(result.data.text);
}

async function run() {
  await recognizeImage(path.join(__dirname, 'src', 'import_image_old_data', 'kaspersky', 'z7921695768660_21fb884b25e42861e3d1f8200bb7b520.jpg'));
  await recognizeImage(path.join(__dirname, 'src', 'import_image_old_data', 'sophos', 'z7921681823375_e095c76674f2692dd811436f416b2b4a.jpg'));
  await recognizeImage(path.join(__dirname, 'src', 'import_image_old_data', 'sophos', 'z7921681823404_aec9bfa490d4d140decc2dec9f8922a6.jpg'));
}

run();
