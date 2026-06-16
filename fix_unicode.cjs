const fs = require('fs');
const file = 'c:/chuSonProject/reminder-main/reminder-main/src/components/SaleReport.vue';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
    { from: "Ch?n nam cho d? li?u", to: "Chọn năm cho dữ liệu" },
    { from: "Vui lA?ng ch?n nam cho", to: "Vui lòng chọn năm cho" },
    { from: ">Nam<", to: ">Năm<" },
    { from: "H?y b?", to: "Hủy bỏ" },
    { from: "XA?c nh?n & Import", to: "Xác nhận & Import" },
    { from: "File khA'ng hA?p lA?:", to: "File không hợp lệ:" },
    { from: "BA? qua dA?ng tiA?u dA? (dA?ng 1)", to: "Bỏ qua dòng tiêu đề (dòng 1)" },
    { from: "TA  dA?ng nh?n d?ng th?i gian t?o", to: "Tự động nhận dạng thời gian tạo" },
    { from: "TA?m th?y ngA?y thA?ng nam trong Content", to: "Tìm thấy ngày tháng năm trong Content" },
    { from: "DA1ng c?t Month + NA?m dA? ch?n", to: "Dùng cột Month + Năm đã chọn" },
    { from: "Ch? import cA?c dA?ng cA? d? li?u PO ho?c Doanh s?", to: "Chỉ import các dòng có dữ liệu PO hoặc Doanh số" },
    { from: "L?i d?c file Excel:", to: "Lỗi đọc file Excel:" },
    { from: "KhA'ng tA?m th?y d? li?u hA?p lA? trong cA?c file Excel dA? ch?n.", to: "Không tìm thấy dữ liệu hợp lệ trong các file Excel đã chọn." },
    { from: "L?i upload ?nh:", to: "Lỗi upload ảnh:" },
    { from: "'Chua thanh toA?n d? '", to: "'Chưa thanh toán đủ'" },
    { from: "'ChA-nh th?c'", to: "'Chính thức'" },
    { from: "'HAng hA3a m?c d?nh'", to: "'Hàng hóa mặc định'" },
    { from: "'CA?i'", to: "'Cái'" }
];

let changedCount = 0;
for (const r of replacements) {
    if (content.includes(r.from)) {
        content = content.split(r.from).join(r.to);
        changedCount++;
    } else {
        console.log("Could not find:", r.from);
    }
}

fs.writeFileSync(file, content, 'utf8');
console.log(`Replaced ${changedCount} corrupted strings.`);
