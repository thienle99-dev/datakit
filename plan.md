# Data Tools — Web App Plan

> Ứng dụng web công cụ CSV/Excel: đơn giản, nhanh, chạy trên trình duyệt, không gửi file lên server.

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
