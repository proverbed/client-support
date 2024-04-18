"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAccountabilityReport = exports.assignTypes = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const logger_1 = require("firebase-functions/logger");
const firestore_2 = require("firebase-admin/firestore");
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
            return snapshot.data();
        },
    };
}
exports.assignTypes = assignTypes;
const sendAccountabilityReport = (0, firestore_1.onDocumentCreated)(PATH, async (event) => {
    // Get an object representing the document
    // e.g. {'name': 'Marie', 'age': 66}
    const snapshot = event.data;
    if (!snapshot) {
        console.log("No data associated with the event");
        return;
    }
    const data = snapshot.data();
    (0, logger_1.info)(`calling sendAccountabilityReport with data: ${JSON.stringify(data, null, 2)}`);
    try {
        await generateReport(data.accountId, data.userId, data.date);
    }
    catch (e) {
        (0, logger_1.error)(`generate report failed: ${e}`);
    }
    /**
     * call generate report with the given data
     *
     * - user id fYsG7QIHknQGRQ6m0BEVmWdniBmN
     * - account id 741e95b2-abe7-59c5-aa16-794750951c5c
     * - date 2024-04-17
     *
     *
     */
    // access a particular field as you would any JS property
    // const name = data.name;
    // perform more operations ...
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
    // validate input data
    (0, logger_1.info)(`generateReport for accountId: [${accountId}] userId: [${userId}] date: [${date}]`);
    const dailyBalance = await getDailyBalance(accountId, userId, date);
    (0, logger_1.info)(`dailyBalance for accountId: [${accountId}] userId: [${userId}] date: [${date}] is ${dailyBalance}`);
    // take the daily balance and send an email.
    // check if account belongs to user
    // query given date
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
        const data = [];
        const startOfToday = new Date(date);
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        const snapshot = await db
            .collection(`accounts/${accountId}/dailyBalance`)
            .where("date", ">=", startOfToday)
            .where("date", "<=", endOfToday)
            .withConverter(assignTypes())
            .get();
        if (snapshot.empty) {
            (0, logger_1.warn)(`No daily balance for accountId: [${accountId}] userId: [${userId}] date: [${date}]`);
            return 0;
        }
        snapshot.docs.forEach((doc) => {
            (0, logger_1.info)(`doc daily balance: [${doc.data().dailyBalance}]`);
            data.push(doc.data().dailyBalance);
        });
        return data[0];
    }
    catch (err) {
        (0, logger_1.error)(err);
    }
}
