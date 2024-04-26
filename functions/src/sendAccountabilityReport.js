"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAccountabilityReport = exports.assignTypes = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const logger_1 = require("firebase-functions/logger");
const firestore_2 = require("firebase-admin/firestore");
const handlebars_1 = __importDefault(require("handlebars"));
const email_1 = __importDefault(require("./templates/email"));
const auth_1 = require("firebase-admin/auth");
const PATH = "sendAccountabilityReport/{reportId}";
const db = (0, firestore_2.getFirestore)();
/**
 * assignTypes
 *
 * @return {object}
 */
function assignTypes() {
    return {
        toFirestore(doc) {
            return doc;
        },
        fromFirestore(snapshot) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return snapshot.data();
        },
    };
}
exports.assignTypes = assignTypes;
const sendAccountabilityReport = (0, firestore_1.onDocumentCreated)(PATH, async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
        (0, logger_1.info)("No data associated with the event");
        return;
    }
    const data = snapshot.data();
    try {
        await generateReport(data.accountId, data.userId, data.date);
    }
    catch (e) {
        (0, logger_1.error)(`generate report failed: ${e}`);
    }
});
exports.sendAccountabilityReport = sendAccountabilityReport;
/**
 * Generate report
 *
 * @param {string} accountId account id
 * @param {string} userId user id
 * @param {string} date date
 */
async function generateReport(accountId, userId, date) {
    // validate input data - @todo validate that account belongs to user
    (0, logger_1.info)(`generateReport for accountId: [${accountId}] userId: [${userId}] date: [${date}]`);
    const dailyBalance = await getDailyBalance(accountId, userId, date);
    const userDisplayName = await getUserDisplayName(userId);
    const numTrades = await getNumberOfTrades(accountId, userId, date);
    (0, logger_1.info)(`dailyBalance: [${dailyBalance}] userDisplayName: [${userDisplayName}] numTrades: [${numTrades}]`);
    const trades = await getTradesForDate(accountId, date);
    (0, logger_1.debug)("trade data", JSON.stringify(trades, null, 2));
    let violationData = await getViolationsForDate(accountId, date);
    (0, logger_1.debug)("violation data", JSON.stringify(violationData, null, 2));
    const templateHTML = handlebars_1.default.compile(email_1.default.REPORT1.HTML);
    const templateSUBJECT = handlebars_1.default.compile(email_1.default.REPORT1.SUBJECT);
    const templateTEXT = handlebars_1.default.compile(email_1.default.REPORT1.TEXT);
    /* eslint-disable */
    violationData = violationData.map((x) => {
        switch (x.type) {
            case "tooBig":
                return {
                    ...x,
                    description: `Trading too big a position, relative to the account size. Not respecting proper RISK MANAGEMENT. Trader could also be REVENGE TRADING. The set risk per trade is set to $${x.riskPerTrade}, the risk on this trade is $${x.risk}`,
                    severity: "HIGH",
                };
            case "noStop":
                return {
                    ...x,
                    description: "Opening a trade with a stoploss defined. This is crazy, as it puts the entire trading account at risk. ",
                    severity: "HIGH",
                };
            case "drawdown":
                return {
                    ...x,
                    ticketList: x.ticket,
                    description: "Trader has met the daily drawdown limit, yet continue trading. Trader is possibly OVERTRADING, trying to force trades.",
                    severity: "HIGH",
                };
            case "profit":
                return {
                    ...x,
                    ticketList: x.ticket,
                    description: "Trader has met the daily profit target, yet continue trading. Trader is possibly OVERTRADING, trying to force trades.",
                    severity: "HIGH",
                };
        }
        return x;
    });
    /* eslint-enable */
    const htmlParams = {
        balance: dailyBalance,
        date,
        trader: userDisplayName,
        numTrades: numTrades,
        numViolations: violationData.length,
        items: trades,
        violations: violationData,
    };
    (0, logger_1.debug)("html params", JSON.stringify(htmlParams, null, 2));
    const subject = templateSUBJECT({ trader: userDisplayName });
    const text = templateTEXT(htmlParams);
    const html = templateHTML(htmlParams);
    // add a record into mail collection
    createEmail(db, subject, text, html);
}
/**
 * Get user display name
 *
 * @param {string} userId user id
 */
async function getUserDisplayName(userId) {
    const userData = await (0, auth_1.getAuth)()
        .getUser(userId);
    if (userData.displayName.length == 0) {
        return null;
    }
    (0, logger_1.info)(`getUserDisplayName ${userData.displayName}`);
    return userData.displayName;
}
/**
 * Get daily report
 *
 * @param {string} accountId account id
 * @param {string} userId user id
 * @param {string} date date
 */
async function getDailyBalance(accountId, userId, date) {
    try {
        const dailyBalanceSnapshot = await db.doc(`accounts/${accountId}/dailyBalance/${date}`).get();
        if (!dailyBalanceSnapshot.exists) {
            (0, logger_1.warn)(`No daily balance for accountId: [${accountId}] userId: [${userId}] date: [${date}]`);
            return 0;
        }
        return dailyBalanceSnapshot.data().dailyBalance;
    }
    catch (err) {
        (0, logger_1.error)(err);
    }
}
/**
 * Get number of trades
 *
 * @param {string} accountId account id
 * @param {string} userId user id
 * @param {string} date date
 */
async function getNumberOfTrades(accountId, userId, date) {
    try {
        const numTradesRef = await db.doc(`accounts/${accountId}/numTrades/${date}`).get();
        if (!numTradesRef.exists) {
            (0, logger_1.warn)(`No number of trades for accountId: [${accountId}] userId: [${userId}] date: [${date}]`);
            return 0;
        }
        return numTradesRef.data().numberTrades;
    }
    catch (err) {
        (0, logger_1.error)(err);
    }
}
/**
 * Get trades for date
 *
 *  @param {string} accountId account id
 *  @param {string} date date
 */
async function getTradesForDate(accountId, date) {
    const startOfToday = new Date(date);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const results = [];
    try {
        const tradeSnapshopToday = await db
            .collection(`accounts/${accountId}/trades`)
            .where("date", ">=", startOfToday)
            .where("date", "<=", endOfToday)
            .get();
        tradeSnapshopToday.forEach((doc) => {
            results.push({
                id: doc.id,
                ...doc.data(),
            });
        });
        return results;
    }
    catch (err) {
        (0, logger_1.error)(err);
    }
}
/**
 * Get violations for date
 *
 *  @param {string} accountId account id
 *  @param {string} date date
 */
async function getViolationsForDate(accountId, date) {
    const startOfToday = new Date(date);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const results = [];
    try {
        const violationRef = await db
            .collection(`accounts/${accountId}/violation`)
            .where("date", ">=", startOfToday)
            .where("date", "<=", endOfToday)
            .get();
        violationRef.forEach((doc) => {
            results.push({
                id: doc.id,
                ...doc.data(),
            });
        });
        return results;
    }
    catch (err) {
        (0, logger_1.error)(err);
    }
}
/**
 * Create email
 *
 * @param {object} db
 * @param {string} subject
 * @param {string} text
 * @param {string} html
 */
function createEmail(db, subject, text, html) {
    const writeBatch = db.batch();
    const createDocRef = db.collection("mail").doc();
    writeBatch.create(createDocRef, {
        message: {
            html, subject, text,
        },
        to: ["dmitriwarren@gmail.com", "deklerk.kim@gmail.com", "tradedealptyltd@gmail.com"],
        date: firestore_2.Timestamp.fromDate(new Date()),
    });
    writeBatch.commit().then(() => {
        (0, logger_1.info)("Successfully created batch.");
    });
}
