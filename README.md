# DataKit - Privacy-First Data Tools

A fast, secure, and client-side only suite of data manipulation tools. Process your CSV/Excel files directly in your browser without uploading them to any server.

## Features

- **🛡️ Client-Side Only**: Your data never leaves your browser.
- **⚡ Instant Processing**: Built for speed using modern web technologies.
- **🎨 Premium UI**: Clean, intuitive interface powered by Tailwind CSS.

## Tools Included

### 📊 CSV Viewer
Open and explore large CSV and Excel files instantly. View your data in a responsive table format.

### 🔄 CSV ↔ Excel Converter
Convert between CSV and Excel (.xlsx) formats seamlessly.
- Export Excel to CSV
- Export CSV to Excel

### ✨ CSV Cleaner
Clean and normalize your data with one click.
- **Trim Whitespace**: Remove leading/trailing spaces from all cells.
- **Remove Empty Rows**: Delete rows that contain no data.
- **Remove Duplicates**: Identify and remove identical rows.

### 📝 CSV → JSON Converter
Convert your tabular data into JSON format for usage in web applications or APIs.

### 🗄️ CSV → SQL Generator
Generate SQL `INSERT` statements from your CSV/Excel data to quickly populate databases.
- Automatic table naming
- Smart type detection (basic)

## Tech Stack

- **Framework**: Vue 3 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide Vue
- **Parsing**: PapaParse (CSV), SheetJS (Excel)

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Run development server:
   ```bash
   pnpm dev
   ```

3. Build for production:
   ```bash
   pnpm build
   ```
