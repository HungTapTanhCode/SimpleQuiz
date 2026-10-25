# ASM02 - Ứng dụng quản lý ngân hàng câu hỏi

## 1. Yêu cầu của đề bài

- Mở rộng API quiz và question của Assignment 01 bằng giao diện người dùng.
- Sử dụng EJS và Handlebars trong dự án Express. EJS dùng cho các trang CRUD; Handlebars được cấu hình với layout dùng chung `main`.
- Sử dụng Bootstrap 5 hoặc CSS để tạo giao diện dễ dùng.
- Quản lý quiz: xem danh sách, thêm, sửa, xóa, xem chi tiết quiz và các question liên quan.
- Quản lý question: xem danh sách, thêm, sửa, xóa và xem chi tiết question.
- Thêm question có sẵn vào một quiz cụ thể.
- Tích hợp API bằng Axios và hỗ trợ các phương thức GET, POST, PUT, DELETE.
- Có các route giao diện `/quizzes` và `/questions`, đồng thời kiểm tra đầy đủ các thao tác CRUD.
- Khi API chạy bằng HTTPS, Axios có thể sử dụng `https.Agent` để xử lý chứng chỉ HTTPS.

## 2. Những phần đã triển khai

### API

- `GET|POST /api/quizzes`
- `GET|PUT|DELETE /api/quizzes/:quizId`
- `GET|POST /api/questions`
- `GET|PUT|DELETE /api/questions/:questionId`
- `POST /api/quizzes/:quizId/questions/:questionId`: gắn một question có sẵn vào quiz.
- Endpoint cũ của Assignment 01 `/question` vẫn được giữ lại.

### Giao diện người dùng

- `/quizzes`: danh sách, tạo mới, xem chi tiết, chỉnh sửa và xóa quiz.
- `/questions`: danh sách, tạo mới, xem chi tiết, chỉnh sửa và xóa question.
- Trang chi tiết quiz có form **Add an existing question** để thêm question có sẵn.
- Các form sử dụng `method-override`, nhờ đó form HTML có thể gửi request PUT và DELETE.

## 3. Cách kết hợp header và footer

Hai file dùng chung theo skeleton là:

- `views/partials/header.hbs`
- `views/partials/footer.hbs`

Các trang EJS chèn header dùng chung bằng đoạn lệnh:

```ejs
<%- include('../partials/header.hbs') %>
```

Header chứa phần khai báo HTML, Bootstrap, CSS, logo và thanh điều hướng.

Mỗi trang chèn footer bằng:

```ejs
<%- include('../partials/footer.hbs') %>
```

Footer đóng phần nội dung, hiển thị thông tin cuối trang và nạp Bootstrap JavaScript.

Do các partial dùng chung được chèn vào từng trang, tất cả các trang quiz và question luôn có header/footer thống nhất. Khi sửa một partial, thay đổi sẽ được áp dụng cho toàn bộ giao diện.

Tên thương hiệu của ứng dụng là **Simple Quiz**. Footer được đặt sau thẻ đóng `main`, nội dung được căn giữa, còn `body` dùng flex layout để footer nằm ở cuối viewport khi trang có ít nội dung.

Trong `app.js`, Handlebars được cấu hình làm view engine mặc định với layout `views/layouts/main.hbs`. Các trang CRUD gọi rõ phần mở rộng `.ejs`, vì vậy dự án sử dụng được cả Handlebars và EJS theo yêu cầu đề.

## 4. Cách chạy dự án

1. Khởi động MongoDB theo connection string trong file `.env`.
2. Chạy lệnh `npm start`.
3. Mở trình duyệt:
   - `http://localhost:3000/quizzes`
   - `http://localhost:3000/questions`

Nếu port `3000` đang được sử dụng, dùng port được hiển thị trong terminal, ví dụ `http://localhost:3003`.

Nếu API Assignment 01 chạy riêng bằng HTTPS, đặt biến môi trường:

```env
API_BASE_URL=https://localhost:3443/api
```

Axios đã được cấu hình để chấp nhận chứng chỉ tự ký theo ví dụ HTTPS trong đề.

## 5. Demo API bằng Postman

Khởi động MongoDB và server trước. Trong Postman, tạo biến:

```text
baseUrl = http://localhost:3000
```

Nếu server chạy port khác thì thay đổi giá trị `baseUrl` tương ứng.

### 5.1. Quiz API

- `GET {{baseUrl}}/api/quizzes`: lấy danh sách quiz.
- `GET {{baseUrl}}/api/quizzes/:quizId`: xem một quiz và các question liên quan.
- `POST {{baseUrl}}/api/quizzes`: tạo quiz mới.
- `PUT {{baseUrl}}/api/quizzes/:quizId`: cập nhật quiz.
- `DELETE {{baseUrl}}/api/quizzes/:quizId`: xóa quiz.

Body cho request POST tạo quiz, chọn `Body > raw > JSON`:

```json
{
  "title": "History Quiz",
  "description": "Test your knowledge of scientific concepts"
}
```

Body cho request PUT cập nhật quiz:

```json
{
  "title": "Updated History Quiz",
  "description": "Updated description",
  "questions": []
}
```

### 5.2. Question API

- `GET {{baseUrl}}/api/questions`: lấy danh sách question.
- `GET {{baseUrl}}/api/questions/:questionId`: xem chi tiết question.
- `POST {{baseUrl}}/api/questions`: tạo question mới.
- `PUT {{baseUrl}}/api/questions/:questionId`: cập nhật question.
- `DELETE {{baseUrl}}/api/questions/:questionId`: xóa question.

Body cho request POST tạo question:

```json
{
  "text": "What is the capital of France?",
  "options": ["Paris", "London", "Berlin", "Madrid"],
  "keywords": ["geography", "europe"],
  "correctAnswerIndex": 0
}
```

`correctAnswerIndex` bắt đầu từ `0`, nghĩa là `0` là đáp án đầu tiên trong mảng `options`.

### 5.3. Gắn question vào quiz

Gửi request:

```text
POST {{baseUrl}}/api/quizzes/:quizId/questions/:questionId
```

Request này không cần body. Nếu question đã nằm trong quiz, hệ thống sẽ không thêm trùng.

### 5.4. Header và mã trạng thái

Với request POST/PUT có body, chọn `Body > raw > JSON` và đặt header:

```text
Content-Type: application/json
```

Các mã trạng thái chính:

- `200`: request thành công.
- `201`: tạo dữ liệu thành công.
- `400`: dữ liệu gửi lên không hợp lệ.
- `404`: không tìm thấy quiz hoặc question.
- `500`: lỗi server hoặc lỗi kết nối MongoDB.

## 6. Giải thích cách sử dụng Axios

Trong dự án này, Axios nằm ở `routes/ui.js`. Người dùng thao tác trên các trang EJS, còn route UI dùng Axios để gọi API Assignment 01. Nhờ vậy giao diện không truy cập MongoDB trực tiếp; nó giao tiếp với API qua HTTP.

Luồng xử lý tổng quát:

```text
Trình duyệt -> route UI Express -> Axios -> API quiz/question -> MongoDB
                                      |
                                      -> dữ liệu JSON -> EJS render/redirect
```

Axios được tạo thành một client dùng chung:

```js
const api = axios.create({ ...axiosOptions, timeout: 8000 });
```

Ví dụ lấy danh sách quiz và render ra EJS:

```js
const response = await api.get(`${apiBaseUrl}/quizzes`);
res.render('quiz/list.ejs', {
  title: 'Quizzes',
  quizzes: response.data,
  currentPath: '/quizzes'
});
```

Ví dụ tạo question:

```js
const response = await api.post(
  `${apiBaseUrl}/questions`,
  questionPayload(req.body)
);
res.redirect(`/questions/${response.data._id}`);
```

Các thao tác còn lại sử dụng cùng nguyên tắc:

- `api.get(...)`: lấy danh sách hoặc chi tiết.
- `api.post(...)`: tạo dữ liệu hoặc gắn question vào quiz.
- `api.put(...)`: cập nhật dữ liệu.
- `api.delete(...)`: xóa dữ liệu.

Nếu API đặt ở server HTTPS riêng, `apiBaseUrl` bắt đầu bằng `https://` thì Axios sử dụng `https.Agent({ rejectUnauthorized: false })` theo yêu cầu ví dụ trong đề. Biến `API_BASE_URL` trong `.env` cho phép đổi địa chỉ API mà không phải sửa code route.

## 7. Đối chiếu với skeleton của đề

Các tên file trong skeleton được bổ sung để dễ đối chiếu:

- `routes/index.js`: entry point cho nhóm route giao diện.
- `routes/quizzes.js`: route API quiz của Assignment 01, được app sử dụng trực tiếp.
- `routes/questions.js`: route API question của Assignment 01, được app sử dụng trực tiếp.
- `views/layouts/main.hbs`: layout Handlebars chính.
- `views/partials/header.hbs`, `views/partials/footer.hbs`: partial dùng chung theo skeleton; các trang EJS include trực tiếp hai file này.
- `views/quiz/` và `views/question/`: các trang EJS CRUD đang được sử dụng.
- `views/questions/`: các file alias theo đúng tên thư mục trong skeleton, trỏ đến các trang question đang sử dụng.
- `public/css/style.css`: đường dẫn CSS tương thích với skeleton; CSS chính vẫn nằm ở `public/stylesheets/style.css`.

`routes/index.js` vẫn là entry point của nhóm route giao diện; các file alias `quiz.js` và `question.js` đã được loại bỏ vì không chứa logic riêng và gây trùng lặp với `quizzes.js` và `questions.js`.
