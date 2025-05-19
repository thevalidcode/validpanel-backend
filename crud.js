const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const env = process.env.NODE_ENV;

const getPanelCollectionPath = (col) => {
  return env === "production"
    ? `/panels_db/${col}.json`
    : path.join(__dirname, `/fake_panels_db/${col}.json`);
};

const getCollectionPath = (col) => {
  return env === "production"
    ? `/validpanel_db/${col}.json`
    : path.join(__dirname, `/fake_validpanel_db/${col}.json`);
};

const readData = (collection) => {
  if (fs.existsSync(collection)) {
    const fileContent = fs.readFileSync(collection, "utf8");
    try {
      return JSON.parse(fileContent);
    } catch (error) {
      return {};
    }
  }
  return {};
};

const writeData = (collection, data) => {
  fs.writeFileSync(collection, JSON.stringify(data, null, 2));
};

const removeKeysFromObject = (obj, keysToRemove) => {
  keysToRemove.forEach((key) => {
    delete obj[key];
  });
  return obj;
};

const getDocs = (col, panel_id, query = {}) => {
  const collection = panel_id
    ? getPanelCollectionPath(col)
    : getCollectionPath(col);
  const data = readData(collection);

  let docs = panel_id ? data[col]?.[panel_id] || [] : data[col] || [];

  if (!Array.isArray(docs) && typeof docs !== "object") {
    return [];
  }

  // Apply query filters if any
  if (query.find) {
    docs = docs.find(createQueryFunction(query.find));
  } else if (query.some) {
    docs = docs.some(createQueryFunction(query.some));
  } else if (query.includes) {
    docs = docs.includes(query.includes);
  } else if (query.filter) {
    if (typeof query.filter.key === "string") {
      docs = docs.filter((doc) => doc[query.filter]);
    } else {
      docs = docs.filter(createQueryFunction(query.filter));
    }
  }

  // Apply sorting if specified
  if (query.sort) {
    const { property, order = "asc" } = query.sort;
    docs = docs.sort((a, b) => {
      if (a[property] < b[property]) return order === "asc" ? -1 : 1;
      if (a[property] > b[property]) return order === "asc" ? 1 : -1;
      return 0;
    });
  }

  // Apply removeKeys if specified
  if (query.removeKeys) {
    const keysToRemove = query.removeKeys;
    if (Array.isArray(docs)) {
      docs = docs.map((doc) => removeKeysFromObject(doc, keysToRemove));
    } else if (typeof docs === "object") {
      docs = removeKeysFromObject(docs, keysToRemove);
    }
  }

  // Apply leaveKeys if specified
  if (query.leaveKeys) {
    const keysToLeave = query.leaveKeys;
    if (Array.isArray(docs)) {
      docs = docs.map((doc) => retainKeysFromObject(doc, keysToLeave));
    } else if (typeof docs === "object") {
      docs = retainKeysFromObject(docs, keysToLeave);
    }
  }

  return docs;
};

// Helper function to retain only specified keys in an object
const retainKeysFromObject = (obj, keysToLeave) => {
  const newObj = {};
  keysToLeave.forEach((key) => {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};

const createQueryFunction = ({ field, operator, value }) => {
  return (doc) => {
    switch (operator) {
      case "===":
        return doc[field] === value;
      case "!==":
        return doc[field] !== value;
      case "<":
        return doc[field] < value;
      case ">":
        return doc[field] > value;
      case "<=":
        return doc[field] <= value;
      case ">=":
        return doc[field] >= value;
      case "in":
        if (!Array.isArray(value)) {
          throw new Error(`Value for "in" operator must be an array`);
        }
        return value.includes(doc[field]);
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  };
};

const addDoc = (col, data) => {
  const collection = getCollectionPath(col);
  const existingData = readData(collection);

  if (!Array.isArray(existingData[col])) {
    existingData[col] = [];
  }

  if (!data.uid) {
    data.uid = uuidv4();
  } else if (existingData[col].some((doc) => doc.uid === data.uid)) {
    return { error: "UID already exists" };
  }

  existingData[col].push(data);
  writeData(collection, existingData);
  return { uid: data.uid };
};

const addPanelDoc = (col, data, panel_id) => {
  const collection = getPanelCollectionPath(col);
  const existingData = readData(collection);

  if (Array.isArray(existingData[col])) {
    return { error: "Collection is an array" };
  }

  if (!existingData[col]) {
    existingData[col] = {};
  }

  if (!Array.isArray(existingData[col][panel_id])) {
    existingData[col][panel_id] = [];
  }

  if (!data.uid) {
    data.uid = uuidv4();
  } else if (existingData[col][panel_id].some((doc) => doc.uid === data.uid)) {
    return { error: "UID already exists" };
  }

  existingData[col][panel_id].push(data);
  writeData(collection, existingData);
  return { uid: data.uid };
};

const addDocs = (col, data) => {
  const collection = getCollectionPath(col);
  const existingData = readData(collection);

  if (!Array.isArray(existingData[col])) {
    return { error: "Collection is not an array" };
  }

  const docsToAdd = data.filter((doc) => {
    if (!doc.uid) {
      doc.uid = uuidv4();
      return true;
    }
    return !existingData[col].some(
      (existingDoc) => existingDoc.uid === doc.uid
    );
  });

  existingData[col].push(...docsToAdd);
  writeData(collection, existingData);
};

const addPanelDocs = (col, data, panel_id) => {
  const collection = getPanelCollectionPath(col);
  const existingData = readData(collection);

  if (Array.isArray(existingData[col])) {
    return { error: "Collection is an array" };
  }

  if (!existingData[col]) {
    existingData[col] = {};
  }

  if (!Array.isArray(existingData[col][panel_id])) {
    existingData[col][panel_id] = [];
  }

  const docsToAdd = data.filter((doc) => {
    if (!doc.uid) {
      doc.uid = uuidv4();
      return true;
    }
    return !existingData[col][panel_id].some(
      (existingDoc) => existingDoc.uid === doc.uid
    );
  });

  existingData[col][panel_id].push(...docsToAdd);
  writeData(collection, existingData);
};

const addSubDoc = (col, subDocKey, data) => {
  const collection = getCollectionPath(col);
  const existingData = readData(collection);

  if (!Array.isArray(existingData[col])) {
    return { error: "Collection is not an array" };
  }

  let subDoc = existingData[col].find((doc) => doc[subDocKey] !== undefined);
  if (!subDoc) {
    subDoc = { [subDocKey]: [] };
    existingData[col].push(subDoc);
  }

  if (!Array.isArray(subDoc[subDocKey])) {
    subDoc[subDocKey] = [];
  }

  if (!data.uid) {
    data.uid = uuidv4();
  } else if (
    subDoc[subDocKey].some((subDocItem) => subDocItem.uid === data.uid)
  ) {
    return { error: "UID already exists" };
  }

  subDoc[subDocKey].push(data);
  writeData(collection, existingData);
  return { uid: data.uid };
};

const addPanelSubDoc = (col, subDocKey, data, panel_id) => {
  const collection = getPanelCollectionPath(col);
  const existingData = readData(collection);

  if (Array.isArray(existingData[col])) {
    return { error: "Collection is an array" };
  }

  if (!existingData[col]) {
    existingData[col] = {};
  }

  if (!Array.isArray(existingData[col][panel_id])) {
    existingData[col][panel_id] = [];
  }

  let subDoc = existingData[col][panel_id].find(
    (doc) => doc[subDocKey] !== undefined
  );
  if (!subDoc) {
    subDoc = { [subDocKey]: [] };
    existingData[col][panel_id].push(subDoc);
  }

  if (!Array.isArray(subDoc[subDocKey])) {
    subDoc[subDocKey] = [];
  }

  if (!data.uid) {
    data.uid = uuidv4();
  } else if (
    subDoc[subDocKey].some((subDocItem) => subDocItem.uid === data.uid)
  ) {
    return { error: "UID already exists" };
  }

  subDoc[subDocKey].push(data);
  writeData(collection, existingData);
  return { uid: data.uid };
};

const addSubDocs = (col, subDocKey, docs) => {
  const collection = getCollectionPath(col);
  const existingData = readData(collection);

  if (!Array.isArray(existingData[col])) {
    return { error: "Collection is not an array" };
  }

  let subDoc = existingData[col].find((doc) => doc[subDocKey] !== undefined);
  if (!subDoc) {
    subDoc = { [subDocKey]: [] };
    existingData[col].push(subDoc);
  }

  if (!Array.isArray(subDoc[subDocKey])) {
    subDoc[subDocKey] = [];
  }

  const docsToAdd = docs.filter((doc) => {
    if (!doc.uid) {
      doc.uid = uuidv4();
      return true;
    }
    return !subDoc[subDocKey].some(
      (existingDoc) => existingDoc.uid === doc.uid
    );
  });

  subDoc[subDocKey].push(...docsToAdd);
  writeData(collection, existingData);
};

const addPanelSubDocs = (col, subDocKey, docs, panel_id) => {
  const collection = getPanelCollectionPath(col);
  const existingData = readData(collection);

  if (Array.isArray(existingData[col])) {
    return { error: "Collection is an array" };
  }

  if (!existingData[col]) {
    existingData[col] = {};
  }

  if (!Array.isArray(existingData[col][panel_id])) {
    existingData[col][panel_id] = [];
  }

  let subDoc = existingData[col][panel_id].find(
    (doc) => doc[subDocKey] !== undefined
  );
  if (!subDoc) {
    subDoc = { [subDocKey]: [] };
    existingData[col][panel_id].push(subDoc);
  }

  if (!Array.isArray(subDoc[subDocKey])) {
    subDoc[subDocKey] = [];
  }

  const docsToAdd = docs.filter((doc) => {
    if (!doc.uid) {
      doc.uid = uuidv4();
      return true;
    }
    return !subDoc[subDocKey].some(
      (existingDoc) => existingDoc.uid === doc.uid
    );
  });

  subDoc[subDocKey].push(...docsToAdd);
  writeData(collection, existingData);
};

const deleteDoc = (col, uid) => {
  const collection = getCollectionPath(col);
  const mainData = readData(collection);
  const data = mainData[col];

  if (!Array.isArray(data)) {
    return { error: "Collection is not an array" };
  }

  const filteredData = data.filter((doc) => doc.uid !== uid);
  mainData[col] = filteredData;
  writeData(collection, mainData);
};

const deletePanelDoc = (col, uid, panel_id) => {
  const collection = getPanelCollectionPath(col);
  const mainData = readData(collection);
  const panelData = mainData[col]?.[panel_id];

  if (!Array.isArray(panelData)) {
    return { error: "Collection is not an array" };
  }

  const filteredData = panelData.filter((doc) => doc.uid !== uid);
  mainData[col][panel_id] = filteredData;
  writeData(collection, mainData);
};

const deleteDocs = (col, uids) => {
  const collection = getCollectionPath(col);
  const mainData = readData(collection);
  const data = mainData[col];

  if (!Array.isArray(data)) {
    return { error: "Collection is not an array" };
  }

  const filteredData = data.filter((doc) => !uids.includes(doc.uid));
  mainData[col] = filteredData;
  writeData(collection, mainData);
};

const deletePanelDocs = (col, uids, panel_id) => {
  const collection = getPanelCollectionPath(col);
  const mainData = readData(collection);
  const panelData = mainData[col]?.[panel_id];

  if (!Array.isArray(panelData)) {
    return { error: "Collection is not an array" };
  }

  const filteredData = panelData.filter((doc) => !uids.includes(doc.uid));
  mainData[col][panel_id] = filteredData;
  writeData(collection, mainData);
};

const updateDoc = (col, uid, newData) => {
  const collection = getCollectionPath(col);
  const mainData = readData(collection);
  const data = mainData[col];

  if (!Array.isArray(data)) {
    return { error: "Collection is not an array" };
  }

  const updatedData = data.map((doc) =>
    doc.uid === uid ? { ...doc, ...newData } : doc
  );
  mainData[col] = updatedData;
  writeData(collection, mainData);
};

const updatePanelDoc = (col, uid, newData, panel_id) => {
  const collection = getPanelCollectionPath(col);
  const mainData = readData(collection);
  const panelData = mainData[col]?.[panel_id];

  if (!Array.isArray(panelData)) {
    return { error: "Collection is not an array" };
  }

  const updatedData = panelData.map((doc) =>
    doc.uid === uid ? { ...doc, ...newData } : doc
  );
  mainData[col][panel_id] = updatedData;
  writeData(collection, mainData);
};

const deleteSubDocs = (col, subDocKey, uids) => {
  const collection = getCollectionPath(col);
  const mainData = readData(collection);
  const data = mainData[col];

  if (!Array.isArray(data)) {
    return { error: "Collection is not an array" };
  }

  const subDoc = data.find((doc) => doc[subDocKey] !== undefined);
  if (!subDoc || !Array.isArray(subDoc[subDocKey])) {
    return { error: "Sub-collection is not an array" };
  }

  subDoc[subDocKey] = subDoc[subDocKey].filter(
    (doc) => !uids.includes(doc.uid)
  );
  writeData(collection, mainData);
};

const deleteSubDoc = (col, subDocKey, uid) => {
  const collection = getCollectionPath(col);
  const mainData = readData(collection);
  const data = mainData[col];

  if (!Array.isArray(data)) {
    return { error: "Collection is not an array" };
  }

  const subDoc = data.find((doc) => doc[subDocKey] !== undefined);
  if (!subDoc || !Array.isArray(subDoc[subDocKey])) {
    return { error: "Sub-collection is not an array" };
  }

  subDoc[subDocKey] = subDoc[subDocKey].filter((doc) => doc.uid !== uid);
  writeData(collection, mainData);
};

const updateSubDoc = (col, subDocKey, uid, newData) => {
  const collection = getCollectionPath(col);
  const mainData = readData(collection);
  const data = mainData[col];

  if (!Array.isArray(data)) {
    return { error: "Collection is not an array" };
  }

  const subDoc = data.find((doc) => doc[subDocKey] !== undefined);
  if (!subDoc || !Array.isArray(subDoc[subDocKey])) {
    return { error: "Sub-collection is not an array" };
  }

  subDoc[subDocKey] = subDoc[subDocKey].map((doc) =>
    doc.uid === uid ? { ...doc, ...newData } : doc
  );
  writeData(collection, mainData);
};

const updatePanelSubDoc = (col, subDocKey, uid, newData, panel_id) => {
  const collection = getPanelCollectionPath(col);
  const mainData = readData(collection);
  const panelData = mainData[col]?.[panel_id];

  if (!Array.isArray(panelData)) {
    return { error: "Panel data is not an array" };
  }

  let subDoc = panelData.find((doc) => doc[subDocKey] !== undefined);
  if (!subDoc || !Array.isArray(subDoc[subDocKey])) {
    return { error: "Sub-collection is not an array" };
  }

  subDoc[subDocKey] = subDoc[subDocKey].map((doc) =>
    doc.uid === uid ? { ...doc, ...newData } : doc
  );
  writeData(collection, mainData);
};

const deletePanelSubDocs = (col, subDocKey, uids, panel_id) => {
  const collection = getPanelCollectionPath(col);
  const mainData = readData(collection);
  const panelData = mainData[col]?.[panel_id];

  if (!Array.isArray(panelData)) {
    return { error: "Panel data is not an array" };
  }

  let subDoc = panelData.find((doc) => doc[subDocKey] !== undefined);
  if (!subDoc || !Array.isArray(subDoc[subDocKey])) {
    return { error: "Sub-collection is not an array" };
  }

  subDoc[subDocKey] = subDoc[subDocKey].filter(
    (doc) => !uids.includes(doc.uid)
  );
  writeData(collection, mainData);
};

const deletePanelSubDoc = (col, subDocKey, uid, panel_id) => {
  const collection = getPanelCollectionPath(col);
  const mainData = readData(collection);
  const panelData = mainData[col]?.[panel_id];

  if (!Array.isArray(panelData)) {
    return { error: "Panel data is not an array" };
  }

  let subDoc = panelData.find((doc) => doc[subDocKey] !== undefined);
  if (!subDoc || !Array.isArray(subDoc[subDocKey])) {
    return { error: "Sub-collection is not an array" };
  }

  subDoc[subDocKey] = subDoc[subDocKey].filter((doc) => doc.uid !== uid);
  writeData(collection, mainData);
};

module.exports = {
  getDocs,
  addDoc,
  addPanelDoc,
  addDocs,
  addPanelDocs,
  addSubDoc,
  addPanelSubDoc,
  addSubDocs,
  addPanelSubDocs,
  deleteDoc,
  deletePanelDoc,
  deleteDocs,
  deletePanelDocs,
  updateDoc,
  updatePanelDoc,
  deleteSubDocs,
  deleteSubDoc,
  updateSubDoc,
  updatePanelSubDoc,
  getPanelCollectionPath,
  deletePanelSubDocs,
  deletePanelSubDoc,
  readData,
};
