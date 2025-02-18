// khởi tạo biến môi trường
require("dotenv").config();

const express = require("express");

const path = require("path");

const cors = require("cors");


const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(express.json());

// bodyParser đọc và xử lý dữ liệu gửi từ các form HTML

app.use(bodyParser.urlencoded({ extended: true }));



module.exports = app;