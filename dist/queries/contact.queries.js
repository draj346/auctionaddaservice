"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactQueries = void 0;
exports.ContactQueries = {
    insertContactMessage: `INSERT INTO contacts (
                      name, 
                      mobile, 
                      email, 
                      subject, 
                      message
                  ) 
                  VALUES (?, ?, ?, ?, ?);`,
    getUnWorkMessage: `SELECT id, name, mobile, email, subject, message, playerId from contacts where isWorkDone is False AND isActive is True`,
    getWorkMessage: `SELECT id, name, mobile, email, subject, message from contacts where isWorkDone is True AND isActive is True`,
    updateWorkStatus: `UPDATE contacts set isWorkDone = ?, playerId = ? WHERE id = ?`,
};
