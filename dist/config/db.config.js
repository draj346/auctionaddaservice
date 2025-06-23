"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const env_1 = require("./env");
const pool = promise_1.default.createPool({
    host: env_1.DB_HOST,
    user: env_1.DB_USER,
    password: env_1.DB_PASSWORD,
    database: env_1.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    port: env_1.DB_PORT
});
exports.default = pool;
