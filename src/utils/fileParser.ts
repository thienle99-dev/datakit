import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParseResult {
    headers: string[];
    data: any[];
}

export const parseFile = async (file: File): Promise<ParseResult> => {
    if (file.name.endsWith('.csv')) {
        return parseCSV(file);
    } else if (file.name.match(/\.xls(x)?$/)) {
        return parseExcel(file);
    } else {
        throw new Error('Unsupported file format. Please upload .csv or .xlsx');
    }
};

const parseCSV = (file: File): Promise<ParseResult> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    console.warn('CSV Parse Errors:', results.errors);
                }
                const headers = results.meta.fields || [];
                const data = results.data;
                resolve({ headers, data });
            },
            error: (err) => reject(err),
        });
    });
};

const parseExcel = (file: File): Promise<ParseResult> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const dataStr = e.target?.result;
                const workbook = XLSX.read(dataStr, { type: 'binary' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (jsonData.length > 0) {
                    const headers = (jsonData[0] as any[]).map(h => String(h || `Column${Math.random().toString(36).substr(2, 5)}`));
                    const rawRows = jsonData.slice(1) as any[];

                    const data = rawRows.map(row => {
                        const rowObj: any = {};
                        headers.forEach((header, index) => {
                            if (header) {
                                rowObj[header] = row[index];
                            }
                        });
                        return rowObj;
                    });

                    resolve({ headers, data });
                } else {
                    resolve({ headers: [], data: [] });
                }
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsBinaryString(file);
    });
};
