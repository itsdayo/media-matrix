const DATABASE_NAME = "media-matrix";
const STORE_NAME = "usage";
const USAGE_KEY = "successful-generations";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getGenerationCount(): Promise<number> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(USAGE_KEY);
    request.onsuccess = () => resolve(Number(request.result) || 0);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
  });
}

export async function incrementGenerationCount(): Promise<number> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(USAGE_KEY);
    let nextCount = 0;
    request.onsuccess = () => {
      nextCount = (Number(request.result) || 0) + 1;
      store.put(nextCount, USAGE_KEY);
    };
    transaction.oncomplete = () => {
      database.close();
      resolve(nextCount);
    };
    transaction.onerror = () => reject(transaction.error);
  });
}
