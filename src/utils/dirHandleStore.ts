// Directory handle storage using IndexedDB for File System Access API

interface DirectoryData {
  id: string;
  handle: FileSystemDirectoryHandle;
  lastAccessed: number;
}

const DB_NAME = 'nvim-config-generator';
const DB_VERSION = 1;
const STORE_NAME = 'directoryHandles';

let dbPromise: Promise<IDBDatabase> | null = null;

const openDB = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;
  
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
  
  return dbPromise;
};

let currentDirectoryHandle: FileSystemDirectoryHandle | null = null;

export const connectDirectory = async (): Promise<boolean> => {
  if (!('showDirectoryPicker' in window)) {
    console.warn('File System Access API not supported');
    return false;
  }
  
  try {
    const dirHandle = await (window as any).showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'documents'
    });
    
    // Store the handle
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const directoryData: DirectoryData = {
      id: 'nvim-config-dir',
      handle: dirHandle,
      lastAccessed: Date.now()
    };
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(directoryData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    currentDirectoryHandle = dirHandle;
    return true;
  } catch (error) {
    console.error('Failed to connect directory:', error);
    return false;
  }
};

export const hasDirectoryConnection = async (): Promise<boolean> => {
  if (currentDirectoryHandle) {
    try {
      // Check if we still have permission
      const permission = await (currentDirectoryHandle as any).queryPermission({ mode: 'readwrite' });
      return permission === 'granted';
    } catch {
      currentDirectoryHandle = null;
      return false;
    }
  }
  
  // Try to restore from IndexedDB
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    const directoryData = await new Promise<DirectoryData | null>((resolve, reject) => {
      const request = store.get('nvim-config-dir');
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
    
    if (directoryData?.handle) {
      const permission = await (directoryData.handle as any).queryPermission({ mode: 'readwrite' });
      if (permission === 'granted') {
        currentDirectoryHandle = directoryData.handle;
        return true;
      }
    }
  } catch (error) {
    console.error('Failed to restore directory connection:', error);
  }
  
  return false;
};

export const writeToConnectedDirectory = async (
  filename: string, 
  content: string
): Promise<boolean> => {
  if (!currentDirectoryHandle) {
    return false;
  }
  
  try {
    // Request permission if needed
    const permission = await (currentDirectoryHandle as any).queryPermission({ mode: 'readwrite' });
    if (permission !== 'granted') {
      const newPermission = await (currentDirectoryHandle as any).requestPermission({ mode: 'readwrite' });
      if (newPermission !== 'granted') {
        return false;
      }
    }
    
    // Create/get the file
    const fileHandle = await currentDirectoryHandle.getFileHandle(filename, {
      create: true
    });
    
    // Write content
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
    
    return true;
  } catch (error) {
    console.error('Failed to write to connected directory:', error);
    return false;
  }
};