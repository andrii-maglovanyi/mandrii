import fs from "fs";
import path from "path";

const translationsDir = path.resolve(process.cwd(), "translations");

if (!fs.existsSync(translationsDir)) {
  console.error("❌ Translations directory not found:", translationsDir);
  process.exit(1);
}

const files = fs.readdirSync(translationsDir).filter((file) => file.endsWith(".json"));

if (files.length === 0) {
  console.warn("⚠️ No .json translation files found in:", translationsDir);
  process.exit(0);
}

files.forEach((file) => {
  const filePath = path.join(translationsDir, file);
  try {
    const original = JSON.parse(fs.readFileSync(filePath, "utf8"));

    const modified = {};
    for (const [key, value] of Object.entries(original)) {
      const newKey = key.replaceAll(".", "_");
      modified[newKey] = value;
    }

    fs.writeFileSync(filePath, JSON.stringify(modified, null, 2), "utf8");
    console.log(`✅ Normalized keys in ${file}`);
  } catch (err) {
    console.error(`❌ Failed to process ${file}: ${err.message}`);
  }
});
