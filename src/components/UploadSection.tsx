'use client';
import React, { useRef } from 'react';
import { parseCSV } from '../utils/parseCSV';
import { parseXLSX } from '../utils/parseXLSX';
import { mapHeaders, remapRow } from '../utils/headerMapper';

interface UploadSectionProps {
  setRows: (rows: any[]) => void;
  label: string;
}

const UploadSection: React.FC<UploadSectionProps> = ({ setRows, label }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    let data: any[] = [];
    if (file.name.endsWith('.csv')) {
      data = await parseCSV(file);
    } else if (file.name.endsWith('.xlsx')) {
      data = await parseXLSX(file);
    } else {
      alert('Unsupported file type. Please upload a CSV or XLSX file.');
      return;
    }
    if (data.length === 0) {
      alert('No data found in file.');
      return;
    }
    // Map headers
    const headers = Object.keys(data[0]);
    const mapping = mapHeaders(headers);
    const mappedData = data.map((row) => remapRow(row, mapping));
    setRows(mappedData);
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <label>
        <b>Upload {label} CSV/XLSX:</b>
        <input
          type="file"
          accept=".csv,.xlsx"
          ref={fileInputRef}
          style={{ display: 'block', marginTop: 8 }}
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </label>
    </div>
  );
};

export default UploadSection;
