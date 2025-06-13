const fs = require("fs/promises");
const path = require("path");
const {
  createTableIfNotExists,
  ensureColumnsExist,
  addDocs,
  addPanelDocs,
} = require("./crud");

// Utility to convert camelCase to snake_case
const camelToSnake = (str) =>
  str
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, "");

// Recursively convert keys of an object from camelCase to snake_case
const convertKeysToSnakeCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToSnakeCase);
  } else if (obj && typeof obj === "object" && !(obj instanceof Date)) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        camelToSnake(k),
        convertKeysToSnakeCase(v),
      ])
    );
  }
  return obj;
};

const assignIdsIfMissing = (records) => {
  let idCounter = 1000;
  return records.map((record) => {
    if (record.id === undefined || record.id === null) {
      return { id: idCounter++, ...record };
    }
    return record;
  });
};

const batchInsert = async (col, docs, panel_id = null) => {
  const batchSize = 100;
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = docs.slice(i, i + batchSize);

    if (panel_id) {
      await addPanelDocs(col, batch, panel_id);
    } else {
      await addDocs(col, batch);
    }
  }
};

const processFile = async (filePath) => {
  try {
    const rawData = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(rawData);

    // Convert top-level and nested keys to snake_case
    const dataSnake = convertKeysToSnakeCase(data);

    // Expect one top-level key (e.g. users, services, payment_gateways)
    const [colRaw] = Object.keys(dataSnake);
    const col = camelToSnake(colRaw);

    // Create table if not exists
    await createTableIfNotExists(col);

    // Extract panel-grouped data or array
    const panels = dataSnake[colRaw] || dataSnake[col] || {};

    if (Array.isArray(panels)) {
      // No panel grouping
      // Assign ids if missing
      const recordsWithIds = assignIdsIfMissing(panels);

      // Ensure columns exist for all fields in all records
      await ensureColumnsExist(col, recordsWithIds);
      await batchInsert(col, recordsWithIds);
    } else {
      // Panels grouped by panel_id
      for (const [panelIdStr, records] of Object.entries(panels)) {
        const panel_id = Number(panelIdStr);
        if (!Array.isArray(records)) {
          console.warn(
            `Skipping invalid data for panel ${panelIdStr} in ${col}`
          );
          continue;
        }
        // Assign ids if missing in this panel
        const recordsWithIds = assignIdsIfMissing(records);

        // Add panel_id field to each record
        const recordsWithPanel = recordsWithIds.map((r) => ({
          panel_id,
          ...r,
        }));

        // Ensure columns exist for all fields in these records
        await ensureColumnsExist(col, recordsWithPanel);

        await batchInsert(col, recordsWithPanel, panel_id);
      }
    }

    console.log(`Processed file: ${filePath}`);
  } catch (err) {
    console.error(`Error processing ${filePath}: ${err.message}`);
  }
};

const importDataFromFolder = async () => {
  const folderPath =
    process.env.NODE_ENV === "production"
      ? `/validpanel_db/`
      : path.join(__dirname, `/fake_validpanel_db/`);
  const filesToProcess = ["admins.json", "users.json", "registeredPanels.json"];

  for (const fileName of filesToProcess) {
    const fullPath = path.join(folderPath, fileName);
    await processFile(fullPath);
  }

  console.log("Import completed");
};

module.exports = { importDataFromFolder };
