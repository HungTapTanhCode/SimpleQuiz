# Postman test cho ASM03

## Chuẩn bị

1. Chạy MongoDB.
2. Trong `ASM03/SimpleQuiz`, chạy `npm start`.
3. Import:
   - `ASM03_User_Authentication.postman_environment.json`
   - `ASM03_User_Authentication.postman_collection.json`
4. Chọn environment `SimpleQuiz ASM03 - Local`.

## Chạy collection

Chạy các folder theo thứ tự bằng **Run collection**:

1. **01 - Register and Login**: tạo Author/Admin, login và lưu token.
2. **02 - Question Ownership**: Author tạo/sửa/xóa Question; Admin bị chặn sửa Question của Author.
3. **03 - Admin Quiz and Users**: Author bị chặn Quiz/users; Admin tạo/sửa/xóa Quiz và xem users.

Collection tự tạo username theo timestamp nên có thể chạy lại nhiều lần. Các biến `authorToken`, `adminToken`, `authorId`, `questionId`, `quizId` được test script tự lưu.

## Mapping Assignment 3

| Task | Request kiểm thử |
| --- | --- |
| Task 1 | Register Author/Admin, Login, JWT và `author` trên Question |
| Task 2 | Author/Admin create/update/delete Quiz |
| Task 3 | Author `GET /users` trả 403; Admin trả 200 |
| Task 4 | Author sửa/xóa Question của mình; Admin sửa Question của Author trả 403 |

Protected request sử dụng:

```text
Authorization: Bearer {{authorToken}}
Authorization: Bearer {{adminToken}}
```

Task 2 includes two negative Quiz checks: Author cannot `PUT` or `DELETE` a Quiz; both must return `403`. The collection contains both requests before the final Admin delete request.
