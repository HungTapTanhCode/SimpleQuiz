# ASM03 - User Authentication and Authorization

ASM03 implements the four tasks in `Assignment 3 - User Authentication.docx` on both REST API and browser UI.

## Roles

- Author is the default account (`admin: false`). Authors can create questions and can update/delete only their own questions.
- Admin is selected during registration (`admin: true`). Admins manage quizzes and can view all registered users.
- Admin does not bypass question ownership and cannot update/delete another author's question.

## Browser pages

- `/register`: create an Author account, or tick **Register as Admin**.
- `/login`: sign in and create a secure HTTP-only token session.
- `/quizzes`: public list; Admin controls are visible only to Admin.
- `/questions`: public list; signed-in users can create questions; edit/delete controls appear only for the author.
- `/admin/users`: Admin-only registered user directory.

## REST API

- `POST /auth/register`
- `POST /auth/login`
- `GET /users` (Admin)
- `GET /api/quizzes` and `GET /api/quizzes/:quizId` (public)
- Quiz POST/PUT/DELETE operations require `verifyUser` then `verifyAdmin`.
- `GET /api/questions` and `GET /api/questions/:questionId` (public)
- `POST /api/questions` requires `verifyUser` and stores `author = req.user._id`.
- Question PUT/DELETE operations require `verifyUser` then `verifyAuthor`.

For protected REST endpoints, send `Authorization: Bearer <token>`.

## Luồng chạy và phân quyền

```text
Browser/Postman
  -> Express app.js
  -> route
  -> verifyUser (nếu cần đăng nhập)
  -> verifyAdmin hoặc verifyAuthor (nếu cần quyền cụ thể)
  -> controller
  -> Mongoose model
  -> MongoDB
  -> JSON response hoặc web redirect/render
```

`verifyUser` đọc `Authorization: Bearer <token>`, kiểm tra chữ ký JWT rồi truy vấn User theo `userId`. Sau bước này tài khoản hiện tại nằm ở `req.user`. `verifyAdmin` chỉ cho đi tiếp khi `req.user.admin === true`; tài khoản không tick Admin khi đăng ký có `admin=false` và là Author.

Quiz dùng phân quyền theo role: mọi GET công khai; POST, PUT, DELETE và thao tác thêm Question vào Quiz đi theo chuỗi `verifyUser -> verifyAdmin`. Vì vậy Author có thể xem nhưng không thể thay đổi Quiz.

Question dùng phân quyền theo ownership: POST đi qua `verifyUser`, sau đó controller tự ghi `author: req.user._id`. PUT và DELETE đi theo chuỗi `verifyUser -> verifyAuthor`; middleware tải Question, so sánh `Question.author` với `req.user._id`, rồi controller còn lặp lại điều kiện `author` trong câu lệnh update/delete. Đây là lý do Admin cũng không thể sửa hoặc xóa Question do Author khác tạo.

Web UI lưu JWT trong cookie HTTP-only `auth_token`, gửi token khi gọi REST API bằng Axios. Cookie `auth_user` chỉ dùng hiển thị username/role; quyền thật vẫn do middleware API quyết định. Trang `/admin/users` gọi API `GET /users` và chỉ Admin được mở.
