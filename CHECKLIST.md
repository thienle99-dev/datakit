# Data Tools — Checklist quản lý

> Dùng `- [x]` = đã xong, `- [ ]` = chưa làm. Cập nhật khi hoàn thành từng mục.

---

## Tools trong app

### MVP (theo plan)

- [x] CSV/Excel Viewer
- [x] CSV ↔ Excel (trong Universal Converter)
- [x] CSV Cleaner
- [x] Column Selector
- [x] Filter & Sort
- [x] CSV → JSON (trong Universal Converter)
- [x] CSV → SQL (trong Universal Converter)

### Mở rộng đã có

- [x] JSON → CSV (trong Universal Converter)
- [x] Merge CSV/Excel
- [x] Split CSV
- [x] Pivot / Unpivot
- [x] Find & Replace
- [x] Column stats
- [x] Validate CSV
- [x] Compare two CSVs
- [x] Transpose
- [x] Aggregate (Summarize)
- [x] Skip Rows / Set Header
- [x] Random Sample
- [x] Mask sensitive data
- [x] Download Templates

### Backlog — ưu tiên cao

- [ ] TSV support (đọc/ghi rõ ràng trong từng tool)
- [ ] Excel multi-sheet (chọn sheet, gộp sheet)

### Backlog — chuyển đổi & xuất

- [ ] CSV → Markdown
- [ ] CSV → HTML table
- [ ] Excel → PDF
- [ ] CSV/Excel → link Google Sheets (nếu làm được không cần API)

### Backlog — thao tác dữ liệu

- [ ] Deduplicate theo cột (nâng cao CSV Cleaner)
- [ ] Fill empty (điền ô trống)
- [ ] Rename columns (regex/map)

### Backlog — làm sạch & chuẩn hóa

- [ ] Normalize whitespace (trim, collapse, line ending)
- [ ] Change encoding (UTF-8 ↔ UTF-16, …)
- [ ] Parse dates (nhận dạng cột ngày, chọn format ra)
- [ ] Excel formula → values only

### Backlog — phân tích & dev

- [ ] Preview sample (N dòng đầu/cuối/random) — có thể gộp vào Viewer/Stats
- [ ] Schema infer (kiểu từng cột)
- [ ] SQL result text → CSV

### Backlog — ý tưởng làm thêm

- [ ] XML ↔ CSV/Excel
- [ ] YAML ↔ CSV/JSON
- [ ] CSV → Chart (client-side)
- [ ] Format phone/address theo quốc gia
- [ ] Add computed column (công thức đơn giản)
- [ ] Column reorder bằng kéo thả (bổ sung Column Selector)

### Tools ý tưởng mới (bổ sung vào roadmap)

**Cột & chuỗi**
- [ ] **Split column** — tách 1 cột thành nhiều cột (theo delimiter hoặc regex)
- [ ] **Concatenate columns** — gộp nhiều cột thành 1 (chọn separator)
- [ ] **Add row number / index** — thêm cột số thứ tự (1, 2, 3…)
- [ ] **Upper / Lower / Title case** — đổi chữ hoa–thường theo cột
- [ ] **Regex extract** — cột mới từ capture groups của regex trên cột có sẵn

**Hàng & làm sạch**
- [ ] **Remove empty rows** — xóa dòng toàn ô trống
- [ ] **Remove empty columns** — xóa cột toàn ô trống
- [ ] **Reverse rows** — đảo thứ tự dòng (dòng cuối thành đầu)
- [ ] **Extract duplicates only** — chỉ giữ những dòng bị trùng (đối nghịch Deduplicate)

**Xuất & tích hợp**
- [ ] **CSV → LaTeX table** — xuất bảng cho tài liệu/paper
- [ ] **Copy to clipboard** — copy bảng dạng CSV / TSV / Markdown để paste vào app khác
- [ ] **JSON Lines (NDJSON) ↔ CSV** — hỗ trợ format từng dòng 1 JSON
- [ ] **Load from URL** — nhập URL file CSV/JSON, fetch client-side (cần CORS)

**Phân tích nhanh**
- [ ] **VLOOKUP-style join** — nối 2 bảng theo cột khóa (left/inner, 1-1 hoặc 1-n)

---

## Deliverables & chất lượng

### Cấu trúc & components

- [x] Cấu trúc repo (views, components, utils, router)
- [x] FileUploader
- [x] DataTable
- [ ] ToolbarActions (Undo/Redo, filters) — dùng rải rác trong từng tool
- [ ] ExportPanel dùng chung — hiện mỗi tool tự nút Export
- [ ] Contract/chỉ dẫn dùng shared components (trong code hoặc README)

### Từng tool

- [x] User flow rõ (upload → chỉnh → download)
- [x] Input/output và layout mô tả trong plan
- [ ] Web Worker khi ≥ ~10k dòng (chưa áp dụng đều)
- [x] Xử lý lỗi cơ bản (message / feedback)

### SEO & routing

- [x] Mỗi tool một route
- [ ] Meta title/description cho từng tool
- [ ] Static/SSG cho SEO (nếu dùng Nuxt sau)

### Chất lượng code

- [x] TypeScript
- [ ] Test cho logic nặng (convert, clean, SQL, …)
- [x] Code rõ ràng, tránh phức tạp thừa
- [ ] Ghi quyết định (limit file, format, …) trong code hoặc doc

---

## UI/UX

- [x] Drag & drop upload
- [x] Table preview (sticky header)
- [x] CTA rõ (Upload, Convert/Apply, Download)
- [x] Desktop-first, responsive
- [x] Multi-file khi cần (Merge)
- [ ] Virtual scroll cho 10k+ dòng (kiểm tra lại từng tool)

---

## Data safety

- [x] Xử lý 100% trong browser
- [x] Không gửi nội dung file lên server
- [x] File mất khi refresh/đóng tab
- [ ] Không analytics trên nội dung file (đảm bảo nếu thêm analytics sau)

---

*Cập nhật lần cuối: theo tiến độ thực tế.*
