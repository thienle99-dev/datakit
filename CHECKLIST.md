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

### JSON & text — đã có / chưa có

- [x] JSON trong Universal Converter (CSV↔JSON, xuất pretty khi export)
- [ ] **JSON Format / Beautify** — paste hoặc upload JSON → pretty-print (indent) hoặc minify
- [ ] **JSON Diff** — so sánh 2 JSON (file hoặc paste), highlight khác biệt theo key/value, tree view
- [ ] **JSON Validate** — kiểm tra cú pháp, báo lỗi dòng/cột, optional schema (JSON Schema)
- [ ] **JSON sort keys** — sắp xếp keys object theo alphabet (ổn định khi diff)
- [ ] **JSON escape/unescape** — escape chuỗi JSON hoặc unescape để paste vào code
- [ ] **JSON Path / Query** — nhập path (vd. `$.data.items[*].id`) → extract & xuất
- [ ] **JSON → XML / XML → JSON** — chuyển qua lại (nằm trong nhóm XML đã liệt kê)

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

### Tính năng Chart (Data → Biểu đồ)

**Tool chính**
- [x] **Data to Chart** — nhập dữ liệu (điền tay / paste / upload) → chọn trục X & Y / series → chọn loại biểu đồ → xem & tải ảnh (PNG/SVG)

**Nguồn dữ liệu / cách nhập**
- [x] **Điền tay** — nhập dữ liệu demo hoặc dán trực tiếp.
- [x] **Paste** — dán từ Excel/Google Sheets (tab hoặc comma separated) vào textarea → tự parse thành bảng, hiển thị preview. Hỗ trợ paste bảng dạng “hàng đầu = header”.
- [x] **Upload file** — CSV, TSV, Excel (.xlsx). Sau khi load → chọn cột làm trục X, cột (các) giá trị Y / series.
- [x] **Paste JSON** — dán JSON array of objects → map key làm label/value.
- [x] **Chuyển đổi nguồn** — thay data mà không mất cấu hình chart.

**Loại biểu đồ — phase 1**
- [x] **Line** — xu hướng theo thời gian hoặc trục X (1 hoặc nhiều series)
- [x] **Bar / Column** — so sánh theo category (dọc hoặc ngang)
- [x] **Pie / Donut** — phần trăm, part-to-whole
- [x] **Area** — tương tự Line, có fill (stacked hoặc overlap)

**Loại biểu đồ — phase 2**
- [ ] **Scatter** — tương quan 2 biến (X, Y), optional size = cột thứ 3
- [x] **Horizontal Bar** — bar nằm ngang (tên dài, ranking)
- [x] **Stacked Bar / Stacked Area** — nhiều series chồng lên nhau
- [ ] **Combo** — line + bar trên cùng trục (vd. doanh thu + %)

**Tuỳ chọn & UX**
- [x] Chọn cột làm **axis labels** (X) và **value** (Y), nhiều cột = nhiều series
- [x] Tuỳ chọn **title**, **legend**, **axis titles**
- [x] **Export** chart ra PNG hoặc SVG (client-side)
- [x] Responsive, hỗ trợ hover tooltip (giá trị tại điểm)
- [x] Gợi ý loại chart theo kiểu dữ liệu (số vs category, 1 series vs nhiều)
- [x] Tùy chọn **palette màu** (theme sáng/tối, colorblind-safe)

**Kỹ thuật**
- [x] Dùng thư viện client-side (ApexCharts)
- [x] Giới hạn số điểm/series để tránh lag (capped 500 records)
- [x] Xử lý lỗi: dữ liệu rỗng, cột không tồn tại, type không hợp (số vs text)

**Mở rộng (sau)**
- [ ] **Trend line** đơn giản (linear) trên Line/Scatter
- [ ] **Heatmap** — matrix màu theo giá trị (cột + hàng + value)
- [ ] **Radar chart** — so sánh nhiều chỉ số (multi-variable)
- [ ] Tùy chọn **palette màu** (theme sáng/tối, colorblind-safe)

### Backlog — ý tưởng làm thêm

- [ ] XML ↔ CSV/Excel
- [ ] YAML ↔ CSV/JSON
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

**Text & encoding**
- [ ] **Base64 encode/decode** — text ↔ Base64 (encode string, decode paste)
- [ ] **URL encode/decode** — encode/decode query string
- [ ] **HTML encode/decode** — &amp; &lt; &gt; &quot; ...
- [ ] **MD5 / SHA hash** — hash chuỗi (chọn algo), copy hex
- [ ] **JWT decode** — paste JWT → decode header + payload (read-only, không verify chữ ký)

**Diff & so sánh**
- [ ] **Text diff** — so sánh 2 đoạn text (line-by-line hoặc character), side-by-side hoặc unified
- [ ] **Markdown diff** — tương tự Text diff, tối ưu cho .md

**Generator & mock**
- [ ] **Fake data generator** — sinh dữ liệu mẫu (tên, email, SĐT, ngày, …) theo template, xuất CSV/JSON
- [ ] **UUID generator** — sinh 1 hoặc N UUID v4, copy

**Developer**
- [ ] **Regex tester** — nhập regex + chuỗi test → highlight match, list groups
- [ ] **Epoch ↔ datetime** — convert Unix timestamp (s/ms) ↔ ngày giờ đọc được
- [ ] **QR code from text/URL** — nhập text hoặc URL → tạo QR image, tải hoặc copy ảnh

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
