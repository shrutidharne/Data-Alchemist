import * as XLSX from 'xlsx';

export function parseXLSX(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      resolve(json as any[]);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
} 