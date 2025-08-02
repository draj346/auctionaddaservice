"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toMySQLDate = exports.getChangedData = void 0;
exports.DuplicateFile = DuplicateFile;
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const normalizeValue = (value) => {
    if (value === null || value === undefined || value === '')
        return null;
    if (value === true || value === 'true' || value === 1 || value === '1')
        return true;
    if (value === false || value === 'false' || value === 0 || value === '0')
        return false;
    if (typeof value === 'string' && !isNaN(Number(value)))
        return Number(value);
    return value;
};
const isValueEqual = (a, b) => {
    if (a === b)
        return true;
    if (typeof a === 'number' && typeof b === 'string')
        return a === Number(b);
    if (typeof a === 'string' && typeof b === 'number')
        return Number(a) === b;
    if (typeof a === 'boolean' && typeof b === 'number')
        return a ? b === 1 : b === 0;
    if (typeof a === 'number' && typeof b === 'boolean')
        return b ? a === 1 : a === 0;
    if (typeof a === 'boolean' && typeof b === 'string') {
        return a ? b === 'true' || b === '1' : b === 'false' || b === '0';
    }
    if (typeof a === 'string' && typeof b === 'boolean') {
        return b ? a === 'true' || a === '1' : a === 'false' || a === '0';
    }
    return false;
};
const getChangedData = (original, updated) => {
    const changedKeys = new Set();
    const updatedKeys = Object.keys(updated);
    for (const key of updatedKeys) {
        const origValue = original[key];
        const updatedValue = updated[key];
        const normalizedOrig = normalizeValue(origValue);
        const normalizedUpdated = normalizeValue(updatedValue);
        if (!isValueEqual(normalizedOrig, normalizedUpdated)) {
            changedKeys.add(key);
        }
    }
    const previousData = {};
    const updatedData = {};
    for (const key of changedKeys) {
        // Format previousData based on updatedData type
        if (key in updated) {
            const updatedValue = updated[key];
            // Format previous value to match updated value type
            let formattedValue = key in original ? original[key] : null;
            // Convert to same type as updated value
            if (typeof updatedValue === 'boolean') {
                // Convert previous value to boolean
                formattedValue = normalizeValue(formattedValue) === true;
            }
            else if (typeof updatedValue === 'number') {
                // Convert previous value to number
                formattedValue = formattedValue !== null && formattedValue !== undefined && formattedValue !== ''
                    ? Number(formattedValue)
                    : null;
            }
            // Convert null/undefined to empty string
            if (formattedValue === null || formattedValue === undefined) {
                formattedValue = '';
            }
            previousData[key] = formattedValue;
        }
        // Keep updatedData as-is
        if (key in updated) {
            updatedData[key] = updated[key];
        }
    }
    return {
        previousData: previousData,
        updatedData: updatedData
    };
};
exports.getChangedData = getChangedData;
const toMySQLDate = (dateString) => {
    const [day, month, year] = dateString.split('-');
    return `${year}-${month}-${day}`;
};
exports.toMySQLDate = toMySQLDate;
async function DuplicateFile(originalFilePath) {
    const ext = path_1.default.extname(originalFilePath);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const newFilename = `image-${uniqueSuffix}${ext}`;
    const newFilePath = path_1.default.join(path_1.default.dirname(originalFilePath), newFilename);
    await promises_1.default.copyFile(originalFilePath, newFilePath);
    return { name: newFilename, path: newFilePath };
}
