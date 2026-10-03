# Cấu trúc Database Firebase cho Report

Dựa vào file export JSON mới nhất từ Firebase Realtime Database (`chusonproject-default-rtdb-export.json`), dưới đây là cấu trúc thực tế của node `REPORT`:

Mỗi object Report bên trong `REPORT/` (được key bằng mã, VD: `RPT_20260422_072029691`) bao gồm các trường sau:

- `ID` / `id`: Khóa chính của report (String, VD: "RPT_20260422_072029691")
- `NOI_DUNG`: Nội dung công việc/báo cáo (String)
- `THOI_GIAN` / `thoi_gian`: Thời gian ghi nhận (String, format VD: "07:17 /8 /22/03/2026")
- `TRANG_THAI`: Trạng thái xử lý (String, VD: "Hoàn thành", "Chưa xử lý")
- `PHAN_LOAI`: Loại công việc (String, VD: "CÔNG VIỆC")
- `TAG`: Độ quan trọng / Gắn thẻ (String, VD: "BÌNH THƯỜNG")
- `GHI_CHU`: Ghi chú thêm (String)
- `CREATED_TIME`: Thời gian tạo (String)
- `id_pipeline`: ID để liên kết tới một pipeline khác (String)
- `img_save`: Các link URL của ảnh đính kèm (String)
- `link_excel_bao_gia`: Các link file excel báo giá (String)
- `link_excel_mua_hang`: Các link file excel mua hàng (String)
- `ten_file_bao_gia`: Tên file excel báo giá (String)
- `ten_file_mua_hang`: Tên file excel mua hàng (String)
- `isFailed`: Đánh dấu thất bại (String)
- `reminder-content`: Nội dung nhắc nhở (String)
- `reminder-time`: Thời gian nhắc nhở (String)
- `reminder-visible`: Cờ trạng thái hiển thị nhắc nhở (String)

*Lưu ý: Có một số trường bị trùng lặp giữa chữ hoa và chữ thường (ví dụ: `ID` và `id`, `THOI_GIAN` và `thoi_gian`), code hiện tại có thể đang sử dụng hoặc lưu trữ cả hai dạng này.*
