/* eslint-disable */
// disable eslint for now, this is the legacy JS file I am currently migrating into TS. 
/** NEED TO FIX ESLINT IN THIS FILE, AND GO OVER TYPESCRIPT AGAIN, AND REMOVE ESLINT DISABLE. */
const {onRequest} = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");
const app = express();
const {initializeApp} = require("firebase-admin/app");
const {getFirestore, Timestamp} = require("firebase-admin/firestore");
const {info, debug, warn, error} = require("firebase-functions/logger");
const functions = require("firebase-functions");
const moment = require("moment");

type TradeDataType = {
  sl: string;
  tp: string;
  command: string;
  magic: string;
  ticket: string;
  instrument: string;
  type: string;
  size: number;
  profit: number;
  risk: number;
  balance: number;
}

initializeApp();
const db = getFirestore();

// Automatically allow cross-origin requests
app.use(cors({origin: true}));

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
    const openTradesForTicketList = await getOpenTradesForTicket(
      accountId,
      obj.ticket
    );

    // make sure this ticket id does not already exist
    const tradesForTicketList = await getTradesForTicket(
      accountId,
      obj.ticket
    );

    if (
      openTradesForTicketList.length > 0 ||
        tradesForTicketList.length > 0
    ) {
      warn(
        `This entry has already been process, not going to
             create a duplicate ticket: ${obj.ticket}`
      );
    } else {
      await addOpenTrade(accountId, obj);

      await insertRiskExposureEntries(accountId);
    }
    break;
  case "MODIFIED":
    const myOpenTradesForTicketList = await getOpenTradesForTicket(
      accountId,
      obj.ticket
    );

    if (myOpenTradesForTicketList.length === 1) {
      // modify the open trade, and create new activity entry
      await updateOpenTrade(accountId, myOpenTradesForTicketList[0], obj);

      await insertRiskExposureEntries(accountId);
    } else {
      warn(
        `Can't modify ticket: ${obj.ticket}, no open trades exist for ticket.`
      );
    }

    break;
  case "EXIT":
    const exitOpenTradeForTicket = await getOpenTradesForTicketData(
      accountId,
      obj.ticket
    );

    if (exitOpenTradeForTicket.length === 1) {
      const tradeData = exitOpenTradeForTicket[0];

      info(`exit open trade, open trade id: ${tradeData.id}`);

      const activityData = await getOpenTradesActivityForTicketData(
        accountId,
        tradeData.id
      );

      await addTradeAndActivity(accountId, tradeData, activityData, obj);

      // delete open trade for ticket id
      await deleteOpenTrade(accountId, tradeData);

      // update risk exposure
      await insertRiskExposureEntries(accountId);
    } else {
      warn(
        `Can't exit ticket: ${obj.ticket}, no open trades exist for ticket.`
      );
    }
    break;
  default:
    warn(
      `Default case: ${obj.command}`
    );
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
function createObjectFromText(str: string): TradeDataType {
  const objList = str.split("|");
  let res: TradeDataType = {
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
    } else if (i === 1) {
      res.instrument = objList[i];
    } else if (i === 2) {
      res.type = objList[i];
    } else {
      const item = objList[i].replace("[", "").replace("]", "").split(":");

      const itemEntry = item[0].toLowerCase();

      switch (itemEntry) {
      case "size":
        res[itemEntry] = Number(item[1]);
        break;
      case "tp":
        if (item[1].trim() == "No TP") {
          res[itemEntry] = "NA";
        } else {
          res[itemEntry] = item[1].split("[")[0].trim();
        }
        break;
      case "sl":
        if (item[1].trim() == "No SL") {
          res[itemEntry] = "NA";
        } else {
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
  } else {
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

  info(
    `update open trade, risk: ${tradeData.risk} sl: ${tradeData.sl} tp: ${tradeData.tp}`
  );
}

// /**
//  * Add an open trade risk exposure entry to cloud firestore
//  *
//  * @param {string} accountId the account id
//  * @param {object} tradeData the trade object data
//  */
// async function addOpenTradeRiskExposure(accountId, tradeData) {
//   await db.collection(`accounts/${accountId}/riskExposure`).add({
//     risk: tradeData.risk,
//     numberTrades: tradeData.numberTrades,
//     date: tradeData.date
//   });
// }

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
    // await addOpenTradeRiskExposure(accountId, {
    //   risk: maxRisk,
    //   numberTrades: numOpenTrades,
    //   date: Timestamp.fromDate(new Date())
    // });

    if (maxRisk > riskPerTrade) {
      // create violation
      createViolation(db, accountId, "tooBig", {
        numberTrades: numOpenTrades,
        risk: maxRisk,
        riskPerTrade: riskPerTrade,
        ticketList: ticketList.toString(),
      });
    }

    if (isNaN(maxRisk)) {
      // create violation
      createViolation(db, accountId, "noStop", {
        ticketList: ticketList.toString(),
      });
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
  const accountRef = `accounts/${accountId}/openTrades/${openTradeId}/activity`;
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
 * @param {object} exitTradeData exit trade data
 */
async function addTradeAndActivity(
  accountId,
  tradeData,
  activityData,
  exitTradeData
) {
  const tradeRef = `accounts/${accountId}/trades`;

  const data = {
    ...tradeData.data,
    profit: Number(exitTradeData.profit) + Number(exitTradeData.commision),
    date: Timestamp.fromDate(new Date()),
  };

  const res = await db.collection(tradeRef).add(data);

  activityData.forEach(async (item) => {
    await db
      .collection(`accounts/${accountId}/trades/${res.id}/activity`)
      .add(item.data);
  });

  await db.collection(`accounts/${accountId}/trades/${res.id}/activity`).add({
    type: "exit",
    risk: tradeData.data.risk,
    date: Timestamp.fromDate(new Date()),
  });
}

/**
 * deleteOpenTrade
 *
 * @param {string} accountId the account id
 * @param {object} tradeData trade data
 */
async function deleteOpenTrade(accountId, tradeData) {
  await deleteCollection(
    db,
    `accounts/${accountId}/openTrades/${tradeData.id}/activity`,
    10
  );

  await db
    .collection(`accounts/${accountId}/openTrades`)
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
        debug(
          "No matching documents for numTrades today -> need to create an entry"
        );
        const writeBatch = db.batch();
        const createDocRef = db
          .collection(`accounts/${context.params.accountId}/numTrades`)
          .doc(moment.utc(endOfToday).format('YYYY-MM-DD'));

        writeBatch.create(createDocRef, updateData);
        writeBatch.commit().then(() => {
          info("Successfully executed batch.");
        });
      } else {
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
        createViolation(db, context.params.accountId, "profit", {
          ticket: snap.data().ticket,
        });
      }

      if (balance < -drawdownLimit) {
        // create violation
        createViolation(db, context.params.accountId, "drawdown", {
          ticket: snap.data().ticket,
        });
      }

      const updateData = {
        dailyBalance: balance,
      };

      if (!numTradesSnapshot.exists) {
        debug(
          `No matching documents for ${DAILY_BALANCE}} today -> need to create an entry`
        );
        const writeBatch = db.batch();
        const createDocRef = db
          .collection(`accounts/${context.params.accountId}/${DAILY_BALANCE}`)
          .doc(moment.utc(endOfToday).format('YYYY-MM-DD'));

        writeBatch.create(createDocRef, updateData);
        writeBatch.commit().then(() => {
          info("Successfully executed batch.");
        });
      } else {
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

export {
  metrics,
  createTrade, 
  accountDailyBalance
}