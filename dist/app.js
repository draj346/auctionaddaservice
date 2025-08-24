"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const env_1 = require("./config/env");
const routes_1 = __importDefault(require("./routes"));
const cors_1 = __importDefault(require("cors"));
const notfound_controller_1 = require("./controllers/notfound.controller");
const app = (0, express_1.default)();
// Configure CORS options
const corsOptions = {
    origin: [
        'http://localhost:3001',
        'https://auctionadda.com'
    ],
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};
// Apply CORS middleware
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: '3mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '3mb' }));
// Public routes
app.use('/v1', routes_1.default);
// app.use(router);
app.use(notfound_controller_1.notFoundHandler);
app.listen(env_1.PORT, async () => {
    console.log(`Server running on port ${env_1.PORT}`);
});
exports.default = app;
