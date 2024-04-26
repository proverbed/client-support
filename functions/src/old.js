"use strict";
/* eslint-disable */
// disable eslint for now, this is the legacy JS file I am currently migrating into TS. 
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountDailyBalance = exports.createTrade = exports.metrics = void 0;
const firestore_1 = require("firebase-admin/firestore");
const Const_1 = __importDefault(require("./globals/Const"));
/** NEED TO FIX ESLINT IN THIS FILE, AND GO OVER TYPESCRIPT AGAIN, AND REMOVE ESLINT DISABLE. */
const { onRequest } = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");
const app = express();
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { info, debug, warn, error } = require("firebase-functions/logger");
const functions = require("firebase-functions");
const moment = require("moment");
initializeApp();
const db = getFirestore();
// Automatically allow cross-origin requests
app.use(cors({ origin: true }));
app.post("/sendMessage", async (req, res) => {
    const text = req.query.text;
    debug(text);
    // await addAccount();
    const obj = createObjectFromText(text);
    const accountId = await getAccountByMagic(obj.magic);
    // debug(`Account[${accountId}] for magic: ${obj.magic} obj: ${JSON.stringify(obj, null, 2)}`);
    if (accountId === undefined) {
        warn(`No account exist for magic: ${obj.magic}`);
        res.end();
    }
    switch (obj.command) {
        case "ENTER":
            const openTradesForTicketList = await getOpenTradesForTicket(accountId, obj.ticket);
            // make sure this ticket id does not already exist
            const tradesForTicketList = await getTradesForTicket(accountId, obj.ticket);
            if (openTradesForTicketList.length > 0 ||
                tradesForTicketList.length > 0) {
                warn(`This entry has already been process, not going to
             create a duplicate ticket: ${obj.ticket}`);
            }
            else {
                await addOpenTrade(accountId, obj);
                await insertRiskExposureEntries(accountId);
            }
            break;
        case "MODIFIED":
            const myOpenTradesForTicketList = await getOpenTradesForTicket(accountId, obj.ticket);
            if (myOpenTradesForTicketList.length === 1) {
                // modify the open trade, and create new activity entry
                await updateOpenTrade(accountId, myOpenTradesForTicketList[0], obj);
                await insertRiskExposureEntries(accountId);
            }
            else {
                warn(`Can't modify ticket: ${obj.ticket}, no open trades exist for ticket.`);
            }
            break;
        case "EXIT":
            const exitOpenTradeForTicket = await getOpenTradesForTicketData(accountId, obj.ticket);
            if (exitOpenTradeForTicket.length === 1) {
                const tradeData = exitOpenTradeForTicket[0];
                info(`exit open trade, open trade id: ${tradeData.id}`);
                const activityData = await getOpenTradesActivityForTicketData(accountId, tradeData.id);
                const violationData = await getOpenTradesViolationsForTicketData(accountId, tradeData.id);
                await addTradeAndActivity(accountId, tradeData, activityData, violationData, obj);
                // delete open trade for ticket id
                await deleteOpenTrade(accountId, tradeData);
                // update risk exposure
                await insertRiskExposureEntries(accountId);
            }
            else {
                warn(`Can't exit ticket: ${obj.ticket}, no open trades exist for ticket.`);
            }
            break;
        default:
            warn(`Default case: ${obj.command}`);
            break;
    }
    res.end();
});
/**
 * Create an object from a given text
 *
 * @param {string} str sdfsfsf
 * @return {TradeDataType} the object based off the text
 */
function createObjectFromText(str) {
    const objList = str.split("|");
    let res = {
        sl: "",
        tp: "",
        command: "",
        magic: "",
        ticket: "",
        instrument: "",
        type: "",
        size: 0,
        profit: 0,
        risk: 0,
        balance: 0
    };
    for (let i = 0; i < objList.length; i++) {
        if (i === 0) {
            res.command = objList[i];
        }
        else if (i === 1) {
            res.instrument = objList[i];
        }
        else if (i === 2) {
            res.type = objList[i];
        }
        else {
            const item = objList[i].replace("[", "").replace("]", "").split(":");
            const itemEntry = item[0].toLowerCase();
            switch (itemEntry) {
                case "size":
                    res[itemEntry] = Number(item[1]);
                    break;
                case "tp":
                    if (item[1].trim() == "No TP") {
                        res[itemEntry] = "NA";
                    }
                    else {
                        res[itemEntry] = item[1].split("[")[0].trim();
                    }
                    break;
                case "sl":
                    if (item[1].trim() == "No SL") {
                        res[itemEntry] = "NA";
                    }
                    else {
                        res[itemEntry] = item[1].split("[")[0].trim();
                    }
                    break;
                case "risk":
                    res[itemEntry] = Number(item[1]);
                    break;
                case "profit":
                    res[itemEntry] = Number(item[1]);
                    break;
                case "balance":
                    res[itemEntry] = Number(item[1].split(" ")[0]);
                    break;
                default:
                    res[itemEntry] = item[1];
                    break;
            }
        }
    }
    return res;
}
/**
 * Get the account by the magic id
 *
 * @param {string} magicId
 * @return {string} the account id
 */
async function getAccountByMagic(magicId) {
    const accountRef = db.collection("accounts");
    const snapshot = await accountRef.where("magic", "==", Number(magicId)).get();
    if (snapshot.empty) {
        warn(`No matching documents for magic:${magicId}`);
        return;
    }
    if (snapshot.size === 1) {
        const data = [];
        snapshot.forEach((doc) => {
            data.push(doc.id);
        });
        return data[0];
    }
    else {
        error(`More than 1 results for account with magic:${magicId}`);
        return;
    }
}
/**
 * Adds an open trade to cloud firestore
 *
 * @param {string} accountId the account id
 * @param {object} tradeData the trade data
 */
async function addOpenTrade(accountId, tradeData) {
    const res = await db.collection(`accounts/${accountId}/openTrades`).add({
        ticket: tradeData.ticket,
        risk: tradeData.risk,
        date: Timestamp.fromDate(new Date()),
        volume: tradeData.size,
        type: tradeData.type,
        instrument: tradeData.instrument,
        entry: tradeData.entry,
        balance: tradeData.balance,
        sl: tradeData.sl,
        tp: tradeData.tp,
    });
    info(`insert open trade: ${res.id}`);
    await db
        .collection(`accounts/${accountId}/openTrades/${res.id}/activity`)
        .add({
        type: "enter",
        risk: tradeData.risk,
        sl: tradeData.sl,
        tp: tradeData.tp,
        date: Timestamp.fromDate(new Date()),
    });
}
/**
 * Update an open trade data
 *
 * @param {string} accountId the account id
 * @param {string} openTradeId the open trade id
 * @param {object} tradeData the trade object data
 */
async function updateOpenTrade(accountId, openTradeId, tradeData) {
    await db
        .collection(`accounts/${accountId}/openTrades`)
        .doc(openTradeId)
        .update({
        risk: tradeData.risk,
        sl: tradeData.sl,
        tp: tradeData.tp,
    });
    await db
        .collection(`accounts/${accountId}/openTrades/${openTradeId}/activity`)
        .add({
        type: "modify",
        risk: tradeData.risk,
        sl: tradeData.sl,
        tp: tradeData.tp,
        date: Timestamp.fromDate(new Date()),
    });
    info(`update open trade, risk: ${tradeData.risk} sl: ${tradeData.sl} tp: ${tradeData.tp}`);
}
/**
 * Add Open Trade Violation
 *
 * @param {string} accountId the account id
 * @param {string} openTradeId the open trade id
 * @param {object} violationData the violation object data
 */
async function addOpenTradeViolation(accountId, openTradeId, violationData) {
    await db
        .collection(`accounts/${accountId}/${Const_1.default.DB.OPEN_TRADES}/${openTradeId}/${Const_1.default.DB.VIOLATION}`)
        .add({
        ...violationData,
        date: Timestamp.fromDate(new Date()),
    });
    info(`add open trade violation: ${JSON.stringify(violationData, null, 2)}`);
}
/**
 * Query open trades and insert risk exposure entry
 *
 * @param {string} accountId the account id
 */
async function insertRiskExposureEntries(accountId) {
    const openTrades = await getOpenTrades(accountId);
    const accountDetails = await db.doc(`accounts/${accountId}`).get();
    const riskPerTrade = accountDetails.data().riskPerTrade;
    if (openTrades !== undefined) {
        const numOpenTrades = openTrades.size;
        let maxRisk = 0;
        const ticketList = [];
        openTrades.forEach((doc) => {
            maxRisk += doc.data().risk;
            ticketList.push(doc.data().ticket);
        });
        if (maxRisk > riskPerTrade) {
            // create violation
            const violationData = {
                numberTrades: numOpenTrades,
                risk: maxRisk,
                riskPerTrade: riskPerTrade,
                ticketList: ticketList.toString(),
            };
            createViolation(db, accountId, Const_1.default.VIOLATION.TOO_BIG, violationData);
            createOpenTradeViolation(db, accountId, Const_1.default.VIOLATION.TOO_BIG, violationData);
        }
        if (isNaN(maxRisk)) {
            // create violation
            const violationData = {
                ticketList: ticketList.toString(),
            };
            createViolation(db, accountId, Const_1.default.VIOLATION.NO_STOP, violationData);
            createOpenTradeViolation(db, accountId, Const_1.default.VIOLATION.NO_STOP, violationData);
        }
    }
}
/**
 * Get all the open trades
 *
 * @param {string} accountId the account id
 * @return {snapshot} the open trades
 */
async function getOpenTrades(accountId) {
    const accountRef = `accounts/${accountId}/openTrades`;
    const snapshot = await db.collection(accountRef).get();
    if (snapshot.empty) {
        warn(`No matching documents for accountRef:${accountRef}`);
        return;
    }
    return snapshot;
}
/**
 * getOpenTradesForTicket
 *
 * @param {string} accountId the account id
 * @param {string} ticket the ticket details
 * @return {list} list of open trade ids
 */
async function getOpenTradesForTicket(accountId, ticket) {
    const accountRef = `accounts/${accountId}/openTrades`;
    const snapshot = await db
        .collection(accountRef)
        .where("ticket", "==", ticket)
        .get();
    const idList = [];
    snapshot.forEach((doc) => {
        idList.push(doc.id);
    });
    return idList;
}
/**
 * getTradesForTicket
 *
 * @param {string} accountId the account id
 * @param {string} ticket the ticket details
 * @return {list} list of open trade ids
 */
async function getTradesForTicket(accountId, ticket) {
    const accountRef = `accounts/${accountId}/trades`;
    const snapshot = await db
        .collection(accountRef)
        .where("ticket", "==", ticket)
        .get();
    const idList = [];
    snapshot.forEach((doc) => {
        idList.push(doc.id);
    });
    return idList;
}
/**
 * getOpenTradesForTicketData
 *
 * @param {string} accountId the account id
 * @param {string} ticket the ticket details
 * @return {list} list of open trade details
 */
async function getOpenTradesForTicketData(accountId, ticket) {
    const accountRef = `accounts/${accountId}/openTrades`;
    const snapshot = await db
        .collection(accountRef)
        .where("ticket", "==", ticket)
        .get();
    const idList = [];
    snapshot.forEach((doc) => {
        idList.push({
            id: doc.id,
            data: doc.data(),
        });
    });
    return idList;
}
/**
 * getOpenTradesActivityForTicketData
 *
 * @param {string} accountId the account id
 * @param {string} openTradeId the open trade id
 * @return {list} list of open trade activity details
 */
async function getOpenTradesActivityForTicketData(accountId, openTradeId) {
    const path = `accounts/${accountId}/${Const_1.default.DB.OPEN_TRADES}/${openTradeId}/${Const_1.default.DB.ACTIVITY}`;
    const snapshot = await db.collection(path).get();
    const idList = [];
    snapshot.forEach((doc) => {
        idList.push({
            id: doc.id,
            data: doc.data(),
        });
    });
    return idList;
}
/**
 * getOpenTradesViolationsForTicketData
 *
 * @param {string} accountId the account id
 * @param {string} openTradeId the open trade id
 * @return {list} list of open trade activity details
 */
async function getOpenTradesViolationsForTicketData(accountId, openTradeId) {
    const accountRef = `accounts/${accountId}/${Const_1.default.DB.OPEN_TRADES}/${openTradeId}/${Const_1.default.DB.VIOLATION}`;
    const snapshot = await db.collection(accountRef).get();
    const idList = [];
    snapshot.forEach((doc) => {
        idList.push({
            id: doc.id,
            data: doc.data(),
        });
    });
    return idList;
}
/**
 * addTradeAndActivity
 *
 * @param {string} accountId the account id
 * @param {object} tradeData trade data
 * @param {object} activityData activity data
 * @param {object} violationData violation data
 * @param {object} exitTradeData exit trade data
 */
async function addTradeAndActivity(accountId, tradeData, activityData, violationData, exitTradeData) {
    const tradeRef = `accounts/${accountId}/trades`;
    let violationTypes = new Set(violationData.map(x => x.data.type));
    const data = {
        ...tradeData.data,
        profit: Number(exitTradeData.profit) + Number(exitTradeData.commision),
        violations: Array.from(violationTypes),
        date: Timestamp.fromDate(new Date()),
    };
    const res = await db.collection(tradeRef).add(data);
    activityData.forEach(async (item) => {
        await db
            .collection(`accounts/${accountId}/trades/${res.id}/${Const_1.default.DB.ACTIVITY}`)
            .add(item.data);
    });
    await db.collection(`accounts/${accountId}/trades/${res.id}/${Const_1.default.DB.ACTIVITY}`).add({
        type: "exit",
        risk: tradeData.data.risk,
        date: Timestamp.fromDate(new Date()),
    });
    violationData.forEach(async (item) => {
        await db
            .collection(`accounts/${accountId}/trades/${res.id}/${Const_1.default.DB.VIOLATION}`)
            .add(item.data);
    });
}
/**
 * deleteOpenTrade
 *
 * @param {string} accountId the account id
 * @param {object} tradeData trade data
 */
async function deleteOpenTrade(accountId, tradeData) {
    await deleteCollection(db, `accounts/${accountId}/${Const_1.default.DB.OPEN_TRADES}/${tradeData.id}/${Const_1.default.DB.ACTIVITY}`, 10);
    await deleteCollection(db, `accounts/${accountId}/${Const_1.default.DB.OPEN_TRADES}/${tradeData.id}/${Const_1.default.DB.VIOLATION}`, 10);
    await db
        .collection(`accounts/${accountId}/${Const_1.default.DB.OPEN_TRADES}`)
        .doc(tradeData.id)
        .delete();
}
/**
 * Add account
 */
// async function addAccount() {
//   const res = await db.collection(`accounts`).add({
//     name: "HS 5k - Dmitri 1",
//     size: 5000,
//     magic: 11111,
//     drawdownLimit: 50,
//     profitTarget: 50,
//     riskPerTrade: 5
//   });
//   console.log("res.id ", res.id);
// }
/**
 * deleteCollection
 *
 * @param {object} db db object
 * @param {string} collectionPath collection path
 * @param {number} batchSize size
 */
async function deleteCollection(db, collectionPath, batchSize) {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy("date").limit(batchSize);
    return new Promise((resolve, reject) => {
        deleteQueryBatch(db, query, resolve).catch(reject);
    });
}
/**
 * deleteQueryBatch
 *
 * @param {object} db db object
 * @param {object} query query object
 * @param {Promise} resolve resolve
 */
async function deleteQueryBatch(db, query, resolve) {
    const snapshot = await query.get();
    const batchSize = snapshot.size;
    if (batchSize === 0) {
        // When there are no documents left, we are done
        resolve();
        return;
    }
    // Delete documents in a batch
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();
    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
        deleteQueryBatch(db, query, resolve);
    });
}
// Expose Express API as a single Cloud Function:
const metrics = onRequest(app);
exports.metrics = metrics;
const createTrade = functions.firestore
    .document("accounts/{accountId}/trades/{tradeId}")
    .onCreate(async (snap, context) => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    await db.runTransaction(async (transaction) => {
        const numTradesRef = `accounts/${context.params.accountId}/numTrades`;
        const numTradesSnapshot = await db
            .collection(numTradesRef)
            .doc(moment.utc(new Date()).format('YYYY-MM-DD'))
            .get();
        const tradeSnapshopToday = await db
            .collection(`accounts/${context.params.accountId}/trades`)
            .where("date", ">=", startOfToday)
            .where("date", "<=", endOfToday)
            .get();
        const updateData = {
            numberTrades: tradeSnapshopToday.size,
        };
        if (!numTradesSnapshot.exists) {
            debug("No matching documents for numTrades today -> need to create an entry");
            const writeBatch = db.batch();
            const createDocRef = db
                .collection(`accounts/${context.params.accountId}/numTrades`)
                .doc(moment.utc(endOfToday).format('YYYY-MM-DD'));
            writeBatch.create(createDocRef, updateData);
            writeBatch.commit().then(() => {
                info("Successfully executed batch.");
            });
        }
        else {
            const updatePath = `${numTradesRef}/${moment.utc(endOfToday).format('YYYY-MM-DD')}`;
            debug(`Updating number of trades record: ${updatePath}`);
            const documentRef = db.doc(updatePath);
            return transaction.get(documentRef).then((doc) => {
                if (doc.exists) {
                    transaction.update(documentRef, updateData);
                }
            });
        }
    });
});
exports.createTrade = createTrade;
const accountDailyBalance = functions.firestore
    .document("accounts/{accountId}/trades/{tradeId}")
    .onCreate(async (snap, context) => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const DAILY_BALANCE = "dailyBalance";
    await db.runTransaction(async (transaction) => {
        const numTradesRef = `accounts/${context.params.accountId}/${DAILY_BALANCE}`;
        const accountDetails = await db
            .doc(`accounts/${context.params.accountId}`)
            .get();
        const profitTarget = accountDetails.data().profitTarget;
        const drawdownLimit = accountDetails.data().drawdownLimit;
        const numTradesSnapshot = await db
            .collection(numTradesRef)
            .doc(moment.utc(new Date()).format('YYYY-MM-DD'))
            .get();
        const tradeSnapshopToday = await db
            .collection(`accounts/${context.params.accountId}/trades`)
            .where("date", ">=", startOfToday)
            .where("date", "<=", endOfToday)
            .get();
        let balance = 0;
        tradeSnapshopToday.forEach((doc) => {
            balance += doc.data().profit;
        });
        debug(`balance: ${balance}`);
        if (balance > profitTarget) {
            // create violation
            createViolation(db, context.params.accountId, Const_1.default.VIOLATION.PROFIT_BREACHED, {
                ticket: snap.data().ticket,
            });
            createTradeViolation(db, context.params.accountId, snap.data().ticket, Const_1.default.VIOLATION.PROFIT_BREACHED, {});
        }
        if (balance < -drawdownLimit) {
            // create violation
            createViolation(db, context.params.accountId, Const_1.default.VIOLATION.DRAWDOWN_BREACHED, {
                ticket: snap.data().ticket,
            });
            createTradeViolation(db, context.params.accountId, snap.data().ticket, Const_1.default.VIOLATION.DRAWDOWN_BREACHED, {});
        }
        const updateData = {
            dailyBalance: balance,
        };
        if (!numTradesSnapshot.exists) {
            debug(`No matching documents for ${DAILY_BALANCE}} today -> need to create an entry`);
            const writeBatch = db.batch();
            const createDocRef = db
                .collection(`accounts/${context.params.accountId}/${DAILY_BALANCE}`)
                .doc(moment.utc(endOfToday).format('YYYY-MM-DD'));
            writeBatch.create(createDocRef, updateData);
            writeBatch.commit().then(() => {
                info("Successfully executed batch.");
            });
        }
        else {
            const updatePath = numTradesRef + "/" + moment.utc(endOfToday).format('YYYY-MM-DD');
            debug(`Updating ${DAILY_BALANCE} record: ${updatePath}`);
            const documentRef = db.doc(updatePath);
            return transaction.get(documentRef).then((doc) => {
                if (doc.exists) {
                    transaction.update(documentRef, updateData);
                }
            });
        }
    });
});
exports.accountDailyBalance = accountDailyBalance;
/**
 * Create violation
 *
 * @param {object} db
 * @param {string} accountId
 * @param {string} type
 * @param {object} additionData
 */
function createViolation(db, accountId, type, additionData) {
    const writeBatch = db.batch();
    const createDocRef = db.collection(`accounts/${accountId}/violation`).doc();
    writeBatch.create(createDocRef, {
        ...additionData,
        type: type,
        date: Timestamp.fromDate(new Date()),
    });
    writeBatch.commit().then(() => {
        info("Successfully executed batch.");
    });
}
/**
 * Create open trade violation
 *
 * @param {object} db
 * @param {string} accountId
 * @param {string} type
 * @param {object} additionData
 */
async function createOpenTradeViolation(db, accountId, type, additionData) {
    let list = additionData.ticketList.split(',');
    for (let item of list) {
        // query trade for the given ticket 
        info(`createOpenTradeViolation: Query trade details for ${item} ${type}`);
        const tradeRef = await db
            .collection(`accounts/${accountId}/openTrades`)
            .where("ticket", "==", item)
            .get();
        if (tradeRef.empty) {
            warn(`createOpenTradeViolation: No matching documents for ${item} `);
            return;
        }
        else {
            tradeRef.forEach(async (doc) => {
                info(`createOpenTradeViolation: doc ${doc.id}, data: [${JSON.stringify(doc.data(), null, 2)}] adding`);
                delete additionData.ticketList;
                await addOpenTradeViolation(accountId, doc.id, {
                    type,
                    ...additionData
                });
            });
        }
    }
}
/**
 * Create trade violation
 *
 * @param {object} db
 * @param {string} accountId
 * @param {string} ticket
 * @param {string} type
 * @param {object} additionData
 */
async function createTradeViolation(db, accountId, ticket, type, additionData) {
    // query trade for the given ticket 
    info(`createTradeViolation: Query trade details for ${ticket} ${type}`);
    const tradeRef = await db
        .collection(`accounts/${accountId}/${Const_1.default.DB.TRADES}`)
        .where("ticket", "==", ticket)
        .get();
    if (tradeRef.empty) {
        warn(`createTradeViolation: No matching documents for ${ticket} `);
        return;
    }
    else {
        tradeRef.forEach(async (doc) => {
            // add a violation entry 
            await db
                .collection(`accounts/${accountId}/${Const_1.default.DB.TRADES}/${doc.id}/${Const_1.default.DB.VIOLATION}`)
                .add({
                type,
                ...additionData,
                date: Timestamp.fromDate(new Date()),
            });
            await db
                .collection(`accounts/${accountId}/${Const_1.default.DB.TRADES}`).doc(doc.id).update({
                violations: firestore_1.FieldValue.arrayUnion(type)
            });
        });
    }
}
