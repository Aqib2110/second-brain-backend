"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./db");
const middleware_1 = require("./middleware");
const utils_1 = require("./utils");
const app = (0, express_1.default)();
dotenv_1.default.config();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
function connect() {
    return __awaiter(this, void 0, void 0, function* () {
        const mongoURI = process.env.MONGO_URI;
        if (!mongoURI) {
            console.error("❌ MONGO_URI is not defined in environment variables");
            process.exit(1);
        }
        try {
            yield mongoose_1.default.connect(mongoURI, {});
            console.log("✅ Connected to MongoDB successfully");
        }
        catch (err) {
            console.error("❌ MongoDB connection error:", err);
        }
    });
}
connect();
let secret = "ILOVEALLAH";
app.post('/api/v1/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const username = req.body.username;
        const password = req.body.password;
        console.log(req.body);
        const hashedPassword = yield bcryptjs_1.default.hashSync(password, 10);
        console.log(hashedPassword);
        yield db_1.userModel.create({
            username: username,
            password: hashedPassword
        });
        res.send({
            message: "sign up successfully"
        });
    }
    catch (error) {
        console.log(error);
    }
}));
app.post('/api/v1/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const user = yield db_1.userModel.findOne({
            username: username,
        });
        if (user) {
            let matched = yield bcryptjs_1.default.compare(password, user.password);
            if (matched) {
                const token = jsonwebtoken_1.default.sign({ id: user._id }, secret);
                res.header('Authorization', `Bearer ${token}`);
                res.json({
                    data: "sign in successfully",
                    token: token
                });
            }
            else {
                res.json({
                    message: "invalid credentials"
                });
            }
        }
        else {
            res.json({
                message: "invalid credentials"
            });
        }
    }
    catch (error) {
        console.log(error);
    }
}));
//@ts-ignore
app.post('/api/v1/content', middleware_1.AuthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, link } = req.body;
    //@ts-ignore
    const userId = req.userId;
    yield db_1.contentModel.create({
        link,
        title,
        tags: [],
        userId: userId
    });
    res.json({
        message: "content posted successfully"
    });
}));
//@ts-ignore
app.get('/api/v1/content', middleware_1.AuthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.userId;
    const content = yield db_1.contentModel.find({
        userId: userId
    }).populate("userId", "username");
    res.json({
        content
    });
}));
//@ts-ignore
app.delete('/api/v1/content', middleware_1.AuthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const contentId = req.body._id;
    const content = yield db_1.contentModel.deleteOne({
        _id: contentId
    });
    res.json({
        message: "content deleted successfully"
    });
}));
//@ts-ignore
app.post('/api/v1/brain/share', middleware_1.AuthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const userId = req.userId;
        const share = req.body.share;
        if (share) {
            const Link = yield db_1.shareModel.findOne({
                userId: userId
            });
            if (Link) {
                console.log(Link);
                const data = Link;
                res.json({
                    message: "link already created",
                    data: data
                });
            }
            else {
                const hash = (0, utils_1.random)(10);
                yield db_1.shareModel.create({
                    hash: hash,
                    userId: userId
                });
                res.json({
                    message: "Link created successfully",
                    data: hash
                });
            }
        }
        else {
            yield db_1.shareModel.deleteOne({
                userId: userId
            });
            res.json({
                message: "link deleted successfully"
            });
        }
    }
    catch (error) {
        console.log(error);
    }
}));
app.get('/api/v1/brain/:shareLink', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hash = req.params.shareLink;
        const Link = yield db_1.shareModel.findOne({
            hash: hash,
        });
        if (Link) {
            //@ts-ignore
            const userId = Link.userId;
            const data = yield db_1.contentModel.find({
                userId: userId,
            });
            const user = yield db_1.userModel.findOne({
                userId: userId
            });
            if (data) {
                res.json({
                    user: user === null || user === void 0 ? void 0 : user.username,
                    data: data
                });
            }
            else {
                res.json({
                    message: "No data found"
                });
            }
        }
        else {
            res.json({
                message: "no Link found",
            });
        }
    }
    catch (error) {
        console.log(error);
    }
}));
app.listen(3000, () => {
    console.log(`server is listening at http://localhost:3000`);
});
