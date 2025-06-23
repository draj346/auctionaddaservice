"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const env_1 = require("./config/env");
const routes_1 = __importDefault(require("./routes"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const notfound_controller_1 = require("./controllers/notfound.controller");
const app = (0, express_1.default)();
// Configure CORS options
const corsOptions = {
    origin: [
        'http://localhost:3001',
    ],
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow cookies/auth headers
};
// Apply CORS middleware
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Public routes
app.use(routes_1.default);
app.use(notfound_controller_1.notFoundHandler);
app.listen(env_1.PORT, async () => {
    console.log(`Server running on port ${env_1.PORT}`);
});
