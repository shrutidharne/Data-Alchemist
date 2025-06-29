import Papa, { ParseResult, ParseError } from 'papaparse';

export function parseCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<any>) => {
        resolve(results.data as any[]);
      },
      error: (error: ParseError) => {
        reject(error);
      },
    });
  });
}
