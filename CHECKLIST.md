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

### JSON & text tools
- [x] **JSON Format / Beautify** — (Prettier, Minify, Sort Keys, Escape/Unescape)
- [x] **JSON Diff** — Compare two JSONs
- [x] **JSON Path / Query** — Extract data
- [x] **JSON ↔ XML** — Bidirectional converter

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
- [x] **Scatter** — tương quan 2 biến (X, Y), optional size = cột thứ 3
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
- [x] **Radar chart** — so sánh nhiều chỉ số (multi-variable)
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

**Encode / Decode**
- [ ] **Base64 encode/decode** — text ↔ Base64; option “file → Base64” (upload file, ra data URL hoặc raw string)
- [ ] **URL encode/decode** — encode/decode component (query string, path)
- [ ] **HTML encode/decode** — &amp; &lt; &gt; &quot; &apos; ...
- [ ] **Hex encode/decode** — text ↔ hex (UTF-8 bytes as hex)
- [ ] **Unicode escape/unescape** — \uXXXX \UXXXXXXXX (JavaScript/JSON style)
- [ ] **Punycode** — unicode domain ↔ punycode (vd. münchen.de ↔ xn--mnchen-3ya.de)
- [ ] **ROT13 / Caesar** — xoay ký tự (ROT13, hoặc Caesar N bước), dùng cho text nhanh

**Hash & checksum**
- [ ] **MD5 / SHA-1 / SHA-256** — hash chuỗi hoặc file (chọn algo), copy hex/base64
- [ ] **CRC32** — checksum (optional, dùng cho đơn giản)

**String / Text**
- [ ] **Character / word / line count** — đếm ký tự, từ, dòng, byte (UTF-8)
- [ ] **Case converter** — camelCase ↔ snake_case ↔ kebab-case ↔ PascalCase ↔ UPPER
- [ ] **Reverse string / Reverse lines** — đảo chuỗi hoặc thứ tự từng dòng
- [ ] **Sort lines** — sắp xếp dòng A–Z, Z–A, random, theo độ dài
- [ ] **Remove duplicate lines** — bỏ dòng trùng, giữ thứ tự hoặc sort
- [ ] **Slug generator** — "Tiêu Đề Bài Viết" → "tieu-de-bai-viet" (lowercase, dấu → không dấu)
- [ ] **Lorem ipsum** — sinh đoạn placeholder (số từ/câu/đoạn tùy chọn)

**Number & format**
- [ ] **Binary / Octal / Decimal / Hex** — chuyển giữa các hệ (số nguyên, có thể hỗ trợ base 2–36)
- [ ] **Roman numerals** — số Ả Rập ↔ La Mã (1–3999 hoặc rộng hơn)
- [ ] **Color converter** — hex ↔ rgb ↔ hsl (paste hex hoặc nhập RGB/HSL → copy các format)

**File & embed**
- [ ] **File to Base64** — upload file bất kỳ → chuỗi Base64 (raw hoặc data URL)
- [ ] **Image ↔ Base64** — upload/paste ảnh → Base64; paste Base64 → xem ảnh & tải
- [ ] **JSON/CSV string escape** — escape chuỗi để nhúng vào code (\" \n …) hoặc unescape

### Text & Encoding Suite
- [x] **Base64 encode/decode**
- [x] **URL encode/decode**
- [x] **HTML encode/decode**
- [x] **MD5 / SHA hash**
- [x] **JWT Debugger**

### Developer Utils
- [x] **Epoch ↔ Timestamp**
- [x] **UUID Generator**
- [x] **Regex tester** — nhập regex + chuỗi test → highlight match, list groups
- [ ] **QR code** — (pending library)
- [ ] **IP ↔ integer** — địa chỉ IP ↔ số 32-bit (dùng khi lưu IP dạng int)
- [ ] **QR code from text/URL** — nhập text hoặc URL → tạo QR image, tải hoặc copy ảnh

### Có thể bổ sung thêm (ý tưởng mới)

**Encode / convert thêm**
- [ ] **Hex encode/decode** — text ↔ hex
- [ ] **Unicode escape/unescape** — \uXXXX
- [ ] **Punycode** — domain unicode ↔ ASCII
- [ ] **File / Image to Base64** — upload file hoặc ảnh → Base64 (raw hoặc data URL); paste Base64 → xem ảnh

**String / text**
- [ ] **Text diff** — so sánh 2 đoạn text (line-by-line), side-by-side hoặc unified
- [ ] **Character / word / line count** — đếm ký tự, từ, dòng
- [ ] **Case converter** — camelCase ↔ snake_case ↔ kebab-case ↔ PascalCase
- [ ] **Sort lines / Remove duplicate lines** — sắp xếp hoặc bỏ dòng trùng
- [ ] **Slug generator** — "Tiêu Đề" → "tieu-de"
- [ ] **Lorem ipsum** — sinh placeholder (số từ/câu)

**Số & format**
- [ ] **Binary / Octal / Decimal / Hex** — chuyển giữa các hệ
- [ ] **Roman numerals** — số ↔ La Mã
- [ ] **Color converter** — hex ↔ rgb ↔ hsl

**Generator**
- [ ] **Password generator** — sinh mật khẩu (độ dài, chữ/số/ký tự đặc biệt), copy
- [ ] **Fake data generator** — tên, email, SĐT, địa chỉ, ngày… → CSV/JSON (hoặc mở rộng Mock hiện có)

**Cron & dev**
- [ ] **Cron explainer** — paste `0 */2 * * *` → "Every 2 hours" (human-readable)
- [ ] **Crontab builder** — chọn "every day at 9am" → sinh biểu thức cron
- [ ] **TOTP / 2FA** — nhập secret → hiển thị mã 6 số (client-side, dùng khi test 2FA)
- [ ] **Hash detector** — dán chuỗi hash → đoán loại (MD5/SHA1/SHA256 theo độ dài)

**YAML**
- [ ] **YAML ↔ JSON** — chuyển qua lại (đã có trong backlog XML/YAML)
- [ ] **YAML format/validate** — pretty-print, báo lỗi cú pháp

**Ref & lookup (static, không API)**
- [ ] **HTTP status** — tra 200, 404, 503… (code + message + mô tả ngắn)
- [ ] **Timezone list** — IANA names, UTC offset (filter/search)
- [ ] **Country/currency codes** — ISO 3166, ISO 4217 (dropdown hoặc search)

**Minify / optimize**
- [ ] **HTML minify** — paste HTML → xóa comment, collapse whitespace
- [ ] **CSS minify** — tương tự cho CSS
- [ ] **ASCII table from CSV** — paste bảng (tab/comma) → vẽ bảng ASCII box (│ ─ ├ …)

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
