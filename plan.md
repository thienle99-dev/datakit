# Data Tools — Web App Plan

> Ứng dụng web công cụ CSV/Excel: đơn giản, nhanh, chạy trên trình duyệt, không gửi file lên server.

---

## ✅ Status: Done (Implementation complete)

**Đã triển khai:** App Vue (Vite) với đủ tools MVP + nhiều tools mở rộng.

| Nhóm | Tools đã có trong app |
|------|------------------------|
| **MVP** | CSV/Excel Viewer, CSV↔Excel (Universal Converter), CSV Cleaner, Column Selector, Filter & Sort, CSV→JSON/SQL/Markdown (Universal Converter) |
| **Mở rộng** | Merge, Split, Validate, Compare, Transpose, Pivot/Unpivot, Find & Replace, Column Stats, Aggregate (Summarize) |
| **Bổ sung** | Skip Rows / Set Header, Random Sample, Mask Sensitive Data, Download Templates |

**Backlog (chưa làm):** XML/YAML, Excel→PDF, CSV→Chart, Format phone/address, Excel formula→values, Group by nâng cao, v.v. — xem mục 5.1 và 5.

📋 **Checklist theo dõi tiến độ:** [CHECKLIST.md](./CHECKLIST.md) — danh sách tools & deliverables dạng `- [ ]` / `- [x]` để tick khi xong.

---

## 1. Mục tiêu & Đối tượng

**Mục tiêu**
- UI đơn giản, CTA rõ ràng
- Xử lý nhanh (Web Workers cho file lớn)
- **Client-side only** — không backend, không lưu file
- SEO tốt, dễ mở rộng thêm tools

**Đối tượng**
- Developers, data analysts, business users
- Người dùng Excel/CSV ít kỹ thuật

---

## 2. Tech Stack

| Layer        | Choice                          |
|-------------|----------------------------------|
| Framework   | Vue.js (Nuxt hoặc Vite + Vue)         |
| Styling     | Tailwind CSS                    |
| CSV         | PapaParse                       |
| Excel       | SheetJS (xlsx)                  |
| Xử lý nặng | Web Workers                     |
| Deploy      | Vercel                          |
| DB          | Không cần cho MVP               |

---

## 3. Kiến trúc

**Nguyên tắc**
- Mỗi tool là một module độc lập, tái sử dụng
- Core components dùng chung
- Không upload file lên server (privacy-first)

**Layout**
```
┌─────────────────────────────────────────────────────────┐
│  Header (logo, nav, theme)                              │
├──────────────┬──────────────────────────────────────────┤
│ Tool Sidebar │  Main Workspace                          │
│  - Tool A    │  ┌─────────────────────────────────────┐ │
│  - Tool B    │  │ FileUploader / DataTable / Actions  │ │
│  - ...       │  └─────────────────────────────────────┘ │
└──────────────┴──────────────────────────────────────────┘
```

**Shared components**
- `FileUploader` — drag & drop, chọn file, validation
- `DataTable` — xem dữ liệu, sticky header, virtual scroll (file lớn)
- `ToolbarActions` — Undo/Redo, filters, sorts
- `ExportPanel` — chọn format, options, nút Download

---

## 4. Tools MVP (ưu tiên làm trước)

| # | Tool | Mô tả ngắn | Input | Output |
|---|------|------------|--------|--------|
| 1 | **CSV/Excel Viewer** | Xem và cuộn bảng | CSV, XLSX | — |
| 2 | **CSV ↔ Excel** | Chuyển qua lại giữa CSV và Excel | CSV hoặc XLSX | XLSX hoặc CSV |
| 3 | **CSV Cleaner** | Trim, bỏ trùng, chuẩn hóa encoding | CSV | CSV đã clean |
| 4 | **Column Selector** | Chọn/bỏ cột, đổi thứ tự | CSV/Excel | CSV/Excel |
| 5 | **Filter & Sort** | Lọc theo điều kiện, sắp xếp | CSV/Excel | CSV/Excel |
| 6 | **CSV → JSON** | Chuyển bảng thành JSON (array of objects) | CSV | JSON |
| 7 | **CSV → SQL** | Sinh INSERT/UPDATE theo tên bảng | CSV | `.sql` |

**Yêu cầu chung cho mỗi tool**
- User flow rõ (upload → chỉnh → download)
- Input/output và UI layout được mô tả
- Xử lý trong Web Worker khi ≥ ~10k dòng
- Xử lý lỗi và feedback cho user (toast/message)

---

## 5. Tools mở rộng (sau MVP)

**Chuyển đổi & xuất**
- **JSON → CSV** — ngược lại CSV → JSON
- **CSV → Markdown** — bảng Markdown
- **CSV → HTML table** — copy/paste vào email hoặc wiki
- **Excel → PDF** — xuất sheet/bảng ra PDF (via lib in-browser)
- **CSV/Excel → Google Sheets** — mở link “tạo sheet mới từ nội dung” (nếu chỉ cần link, không cần API)

**Thao tác dữ liệu**
- **Merge CSV/Excel** — gộp nhiều file (theo hàng hoặc theo cột)
- **Split CSV** — tách theo số dòng hoặc theo giá trị cột
- **Pivot / Unpivot** — chuyển dạng dọc ↔ ngang
- **Deduplicate** — bỏ trùng theo cột chọn (nâng cao của CSV Cleaner)
- **Fill empty** — điền ô trống (value trước/sau, hằng số)
- **Rename columns** — đổi tên cột hàng loạt (regex, map)

**Làm sạch & chuẩn hóa**
- **Find & Replace** — theo cột hoặc toàn bảng, hỗ trợ regex
- **Normalize whitespace** — trim, collapse spaces, chuẩn line ending
- **Change encoding** — UTF-8 ↔ UTF-16, v.v.
- **Parse dates** — nhận dạng cột ngày, chọn format đầu ra

**Phân tích nhanh (client-side)**
- **Column stats** — min/max/mean/mode, null count, unique count
- **Preview sample** — xem N dòng đầu/cuối/random
- **Schema infer** — kiểu từng cột (number, date, string)

**SQL & dev**
- **SQL → CSV** — paste kết quả query dạng text → parse thành CSV (nếu có chuẩn format)
- **Validate CSV** — kiểm tra encoding, delimiter, quoting, số cột

**Tiện ích**
- **Compare two CSVs** — diff theo hàng/cột (highlight khác biệt)
- **Column reorder** — kéo thả đổi thứ tự cột
- **Transpose** — hàng thành cột, cột thành hàng

---

## 5.1 Tổng hợp: tools còn thiếu & có thể làm thêm

### A. Còn thiếu (nên có để bộ công cụ “đủ dùng”)

Những tool hợp với data workflow nhưng **chưa nằm trong MVP**, nên ưu tiên sau phase 1:

| Tool | Mô tả | Lý do nên có |
|------|--------|----------------|
| **JSON → CSV** | Chuyển array of objects → bảng | Cặp với CSV → JSON, dev/API hay cần |
| **Merge CSV/Excel** | Gộp nhiều file (theo hàng/cột) | Nhu cầu gộp báo cáo, nhiều nguồn |
| **Split CSV** | Tách theo số dòng hoặc theo giá trị cột | Chia file lớn, tách theo nhóm |
| **Validate CSV** | Kiểm tra encoding, delimiter, quoting, số cột | Debug file lỗi, trước khi import |
| **Compare two CSVs** | Diff hàng/cột, highlight khác biệt | So bản cũ/mới, QA data |
| **Transpose** | Hàng ↔ cột | Chuẩn hóa dạng bảng trước khi xử lý |
| **TSV support** | Đọc/ghi .tsv (tab-separated) | TSV phổ biến trong data/export |
| **Excel multi-sheet** | Chọn sheet, gộp nhiều sheet thành một | File Excel thường nhiều sheet |

### B. Có thể làm thêm (ý tưởng mở rộng)

Không bắt buộc cho MVP; bổ sung khi đã ổn định nhân lực và roadmap:

**Định dạng & tích hợp**
- **XML ↔ CSV/Excel** — import/export XML
- **YAML ↔ CSV/JSON** — config / data nhẹ
- **Excel → PDF** — in/xuất bảng ra PDF
- **CSV → Chart** — vẽ biểu đồ đơn giản từ cột (client-side, e.g. Chart.js)

**Làm sạch & chuẩn hóa nâng cao**
- **Format phone/address** — chuẩn hóa theo quốc gia
- **Mask sensitive data** — che/mask email, SĐT, theo regex
- **Excel formula → values** — chỉ giữ giá trị, bỏ công thức
- **Header từ dòng N / Skip rows** — chọn dòng làm header, bỏ N dòng đầu

**Thao tác dữ liệu nâng cao**
- **Group by + Aggregate** — sum/count/avg theo nhóm (client-side)
- **Add computed column** — cột mới từ công thức đơn giản (ví dụ `A+B`, `UPPER(C)`)
- **Random sample / Split %** — lấy mẫu ngẫu nhiên, chia train/test
- **Unpivot / Pivot** — chuyển wide ↔ long

**Tiện ích & trải nghiệm**
- **CSV/Excel template** — tải file mẫu (template) theo mục đích
- **Column reorder (drag)** — đổi thứ tự cột bằng kéo thả (bổ sung cho Column Selector)
- **Preview N rows / Schema** — xem nhanh vài dòng + kiểu cột trước khi chọn tool

### C. Bảng ưu tiên gợi ý (sau MVP)

| Ưu tiên | Nhóm | Tools |
|---------|------|------|
| Cao | Còn thiếu | JSON→CSV, Merge, Split, Validate CSV, Compare, Transpose, TSV, Excel multi-sheet |
| Trung bình | Mở rộng đã liệt kê | JSON→CSV, Merge, Split, Pivot/Unpivot, Find&Replace, Column stats, Schema infer |
| Thấp | Làm thêm | XML/YAML, Chart, Mask sensitive, Group by, Template download |

---

## 6. UI / UX

- Drag & drop upload, hỗ trợ multi-file khi tool cần (vd. Merge).
- Table: sticky header, virtual scroll cho 10k+ dòng.
- CTA rõ: Upload, Apply/Convert, Download.
- Desktop-first, responsive.
- Giao diện tối giản, ít bước.

---

## 7. Data safety & SEO

**Bảo mật / quyền riêng tư**
- Mọi xử lý trong browser; không gửi nội dung file lên server.
- Không phân tích nội dung file cho mục đích tracking.
- File chỉ tồn tại trong session; refresh/đóng tab là mất.

**SEO**
- Mỗi tool một route riêng (vd. `/tools/csv-to-json`).
- Meta title/description cho từng tool.
- Có thể dùng static page cho từng tool + hydration nhẹ.

---

## 8. Deliverables (khi triển khai)

1. **Cấu trúc repo** — thư mục cho shared components, từng tool, utils, workers.
2. **Shared components** — `FileUploader`, `DataTable`, `ToolbarActions`, `ExportPanel` (và contract/chỉ dẫn dùng).
3. **Từng tool MVP** — user flow, input/output, layout, component Vue, logic xử lý (kể cả worker), xử lý lỗi.
4. **Ví dụ code** — 1–2 tools mẫu đủ để copy pattern cho tools còn lại.
5. **Cấu trúc trang & routing** — danh sách routes, layout chung, SEO (title/description) cho từng tool.
6. **Backlog** — danh sách tools mở rộng (như mục 5) và thứ tự ưu tiên đề xuất.

---

## 9. Chất lượng code

- Code production-ready: TypeScript, test cho logic nặng (convert, clean, SQL gen).
- Tránh phức tạp không cần thiết; ưu tiên rõ ràng, dễ sửa.
- Ghi ngắn các quyết định quan trọng (format, giới hạn kích thước file, v.v.).

---

## 10. Typography & layout — cân đối size

**Mục tiêu:** Giảm và thống nhất font size, weight, width/height để giao diện cân đối, dễ đọc, dễ bảo trì.

**Font**
- Giữ **Outfit** làm font chính. Bỏ import Inter nếu không dùng.
- Code/data: `font-mono` (system monospace) cho textarea, preview, bảng.

**Font size**
- Định nghĩa scale trong `tailwind.config.js` (vd. `text-2xs`, `text-xs`, …) thay vì arbitrary `text-[8px]`–`text-[13px]`.
- Giảm size chung: hero H1 `text-3xl md:text-5xl`; tool page title `text-base md:text-lg`; card title `text-base`.
- Tối thiểu cho chữ đọc được: label / header bảng ≥ `text-xs` (12px); cell bảng ≥ `text-xs`. Tránh 8–9px cho nội dung đọc.
- Mô tả card/body: `text-sm` thay cho `text-[13px]`.

**Font weight**
- `font-black` chỉ cho H1 hero và tên tool chính.
- Tiêu đề section / panel: `font-bold`.
- Label nhỏ (uppercase): `font-bold`, không dùng black.
- Body / mô tả: `font-medium` hoặc `font-normal`.

**Width / height**
- Thống nhất workspace: `calc(100vh - var(--header-h, 5rem))` cho tất cả tool view; set `--header-h` ở `:root`.
- Sidebar tool: token chung `lg:w-72`.
- Container: giữ `max-w-screen-2xl`; có thể giảm padding hero (vd. `py-10 md:py-12`).

**Checklist**
- [x] Thêm/chuẩn hóa fontSize trong tailwind theme (`text-2xs`, scale xs→5xl).
- [ ] Thay arbitrary `text-[…]` bằng class từ scale (làm dần trong từng view).
- [x] Giảm font-black xuống bold ở label/section (ToolsView, DataTable, AppHeader).
- [x] Tăng tối thiểu size chữ bảng/label (DataTable: header/cell ≥ text-2xs, text-xs).
- [x] Dùng CSS var `--header-h` và thống nhất height workspace (`h-screen-minus-header`).
