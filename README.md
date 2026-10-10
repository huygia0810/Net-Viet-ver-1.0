# NÉT VIỆT - Hướng Dẫn Kiểm Thử & Vận Hành (Ver 11.1)

Dự án bảo tồn và số hóa di sản trang phục truyền thống Việt Nam kết hợp AI Evaluator và Heritage Guard.

---

## 1. Kiểm thử Unit Tests
Bộ kiểm thử đơn vị độc lập không cần server mạng, kiểm tra trực tiếp tính toàn vẹn của validator, schema parsing, claim status, và rule fail-closed:

```bash
npm run test:unit
```

---

## 2. Kiểm thử Integration Tests
Bộ kiểm thử tích hợp kiểm tra các API endpoints (`/api/costumes`, `/api/claims`, `/api/stress-test-guard`, `/api/remix-outfit`) và quy trình cách ly test harness (loopback isolation & mock integrity):

> **Lưu ý quan trọng (Preflight Requirement):**  
> Trước khi chạy integration tests, máy chủ ứng dụng chính phải đang chạy tại `http://localhost:3000` (khởi động bằng `npm run dev` hoặc nền tảng dev server). Bộ kiểm tra endpoint sẽ thực hiện preflight ping tới `http://localhost:3000` trước khi thực thi.

Lệnh chạy:
```bash
npm run test:integration
```

---

## 3. Biên dịch và Kiểm tra Kiểu (Build & Lint)

Kiểm tra cú pháp và tính hợp lệ của TypeScript:
```bash
npm run lint
```

Biên dịch production bundle giao diện Vite:
```bash
npm run build
```

---

## 4. Kiểm thử Live Gemini API (Tách biệt khỏi Mock Tests)
Để bảo đảm tính ổn định và lặp lại của CI/CD, bộ test integration mặc định chỉ chạy mock pipeline trên test harness cô lập (`127.0.0.1` ephemeral port).  
Để kích hoạt kiểm thử trực tiếp với Gemini API thực tế (yêu cầu biến môi trường `GEMINI_API_KEY` hợp lệ):

```bash
RUN_LIVE_INTEGRATION_TESTS=1 npm run test:integration
```
*(Nếu cờ `RUN_LIVE_INTEGRATION_TESTS` không được đặt thành `1`, bài test live Gemini sẽ được bỏ qua an toàn với thông báo hướng dẫn.)*
