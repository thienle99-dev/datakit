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
    } else if (file.name.endsWith('.json')) {
        return parseJSON(file);
    } else {
        throw new Error('Unsupported file format. Please upload .csv, .xlsx, or .json');
    }
};

const parseJSON = async (file: File): Promise<ParseResult> => {
    const text = await file.text();
    let jsonData = JSON.parse(text);

    if (!Array.isArray(jsonData)) {
        if (typeof jsonData === 'object' && jsonData !== null) {
            jsonData = [jsonData];
        } else {
            throw new Error('JSON data must be an array of objects or a single object');
        }
    }

    if (jsonData.length === 0) {
        return { headers: [], data: [] };
    }

    // Extract headers from all unique keys across all objects to be safe
    const headerSet = new Set<string>();
    jsonData.forEach((item: any) => {
        if (typeof item === 'object' && item !== null) {
            Object.keys(item).forEach(key => headerSet.add(key));
        }
    });

    return {
        headers: Array.from(headerSet),
        data: jsonData
    };
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
                if (!firstSheetName) {
                    throw new Error('No sheets found in Excel file');
                }
                const worksheet = workbook.Sheets[firstSheetName];
                if (!worksheet) {
                    throw new Error('Sheet data not found');
                }

                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (jsonData.length > 0) {
                    const headers = (jsonData[0] as any[]).map((h, i) => String(h || `Column ${i + 1}`));
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
