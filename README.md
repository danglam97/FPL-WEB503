# Node.js MVC Project

Dự án này là một ứng dụng Node.js sử dụng mô hình MVC (Model-View-Controller) và kết nối với cơ sở dữ liệu MySQL. Hướng dẫn dưới đây sẽ giúp bạn cài đặt và triển khai dự án.

## các thư viện đã cài
- cors
- body-parser
- dotenv 
- express
- nodemon
- mongoose
- joi
- bcryptjs
- multer 
- jsonwebtoken

## Cài đặt dự án
- git clone <url_repository>
- cd <project_directory>
- npm i
- tạo các thư mục theo M-V-C và tạo các file theo yêu cầu 
- mở terminal chọn git bash rồi chạy lệnh
- câu lệnh tạo  mkdir -p src/controllers src/models src/routes src/views src/config src/middleware src/validator
- tạo các file theo các thư mục
- câu lệnh tạo touch src/middleware/auth.js src/config/db.js src/routes/authRouter.js src/controllers/authController.js src/models/User.js src/validator/authValidate.js
- thay đổi cấu hính file .env nếu chưa có .env thì tạo 1 file .env rồi thay đổi cấu hình theo máy của mình
## các cấu hình env
- PORT=3000
- MONGO_URI = mongodb://localhost:27017/(your_database_name)
- JWT_SECRET=myjwtsecret
## chạy server project
- npm run dev
- npm run start
