#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

// Lấy tham số từ dòng lệnh
const modelName = process.argv[2];
if (!modelName) {
    console.error("⚠️ Vui lòng nhập tên model! Ví dụ:  fplweb503 users");
    process.exit(1);
}

const ModelClassName = modelName.charAt(0).toUpperCase() + modelName.slice(1) + "Model";

const controllerPath = path.join(__dirname, "src/controllers", `${modelName}Controller.js`);
const modelPath = path.join(__dirname, "src/models", `${ModelClassName}.js`);
const routePath = path.join(__dirname, "src/routes", `${modelName}Routes.js`);

const createFile = (filePath, content) => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Đã tạo: ${filePath}`);
    } else {
        console.log(`⚠️ File đã tồn tại: ${filePath}`);
    }
};

const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

ensureDir(path.dirname(controllerPath));
ensureDir(path.dirname(modelPath));
ensureDir(path.dirname(routePath));

if (modelName === "auth") {
    console.log("🚀 Đang tạo module Auth (Đăng ký, Đăng nhập)...");

    ensureDir("src/middlewares");

    createFile(
        "src/controllers/authController.js",
        `const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: "Đăng ký thành công!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};`
    );

    createFile(
        "src/models/UserModel.js",
        `const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);`
    );

    createFile(
        "src/routes/authRoutes.js",
        `const express = require("express");
const { register, login } = require("../controllers/authController");

const router = express.Router();
router.post("/register", register);
router.post("/login", login);

module.exports = router;`
    );

    createFile(
        "src/middlewares/authMiddleware.js",
        `const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Truy cập bị từ chối" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: "Token không hợp lệ" });
    }
};`
    );

    console.log("🎉 Module Auth đã được tạo thành công!");
} else {
    createFile(controllerPath, `const ${ModelClassName} = require("../models/${ModelClassName}");

// Lấy tất cả dữ liệu
exports.getAll = async (req, res) => {
    try {
        const data = await ${ModelClassName}.find();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy một bản ghi theo ID
exports.getOne = async (req, res) => {
    try {
        const data = await ${ModelClassName}.findById(req.params.id);
        if (!data) return res.status(404).json({ message: "Không tìm thấy!" });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Thêm mới một bản ghi
exports.create = async (req, res) => {
    try {
        const newData = new ${ModelClassName}(req.body);
        await newData.save();
        res.status(201).json(newData);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Cập nhật bản ghi theo ID
exports.update = async (req, res) => {
    try {
        const updatedData = await ${ModelClassName}.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedData) return res.status(404).json({ message: "Không tìm thấy!" });
        res.json(updatedData);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Xóa bản ghi theo ID
exports.delete = async (req, res) => {
    try {
        const deletedData = await ${ModelClassName}.findByIdAndDelete(req.params.id);
        if (!deletedData) return res.status(404).json({ message: "Không tìm thấy!" });
        res.json({ message: "Xóa thành công!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};`);

    createFile(modelPath, `const mongoose = require("mongoose");

const ${modelName}Schema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
}, { timestamps: true });

module.exports = mongoose.model("${ModelClassName}", ${modelName}Schema);`);

    createFile(routePath, `const express = require("express");
const router = express.Router();
const ${modelName}Controller = require("../controllers/${modelName}Controller");

router.get("/", ${modelName}Controller.getAll);
router.get("/:id", ${modelName}Controller.getOne);
router.post("/", ${modelName}Controller.create);
router.put("/:id", ${modelName}Controller.update);
router.delete("/:id", ${modelName}Controller.delete);

module.exports = router;`);

    console.log("🚀 Tạo thành công MVC cho model:", modelName);
}
