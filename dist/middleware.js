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
exports.AuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AuthMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const jwttoken = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    console.log(jwttoken);
    if (!jwttoken) {
        return res.status(401).json({ message: 'No token provided' });
    }
    try {
        const authentic = yield jsonwebtoken_1.default.verify(jwttoken, "ILOVEALLAH");
        if (authentic) {
            //@ts-ignore
            req.userId = authentic.id;
            next();
        }
        else {
            return res.json({
                message: "invalid token"
            });
        }
    }
    catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
});
exports.AuthMiddleware = AuthMiddleware;
