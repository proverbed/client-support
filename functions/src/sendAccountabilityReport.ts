import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {info, error, warn, debug} from "firebase-functions/logger";
import {DocumentData, QueryDocumentSnapshot, Timestamp, getFirestore} from "firebase-admin/firestore";
import Handlebars from "handlebars";
import emailTemplate from "./templates/email";
import {getAuth} from "firebase-admin/auth";

const PATH = "sendAccountabilityReport/{reportId}";

const db = getFirestore();

/**
 * assignTypes
 *
 * @return {object}
 */
export function assignTypes<T extends object>() {
  return {
    toFirestore(doc: T): DocumentData {
      return doc;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): T {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return snapshot.data()! as T;
    },
  };
}

const sendAccountabilityReport = onDocumentCreated(PATH, async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    info("No data associated with the event");
    return;
  }
  const data = snapshot.data();
  try {
    await generateReport(data.accountId, data.userId, data.date);
  } catch (e) {
    error(`generate report failed: ${e}`);
  }
});

/**
 * Generate report
 *
 * @param {string} accountId account id
 * @param {string} userId user id
 * @param {string} date date
 */
async function generateReport(accountId: string, userId: string, date: string) {
  // validate input data - @todo validate that account belongs to user

  info(`generateReport for accountId: [${accountId}] userId: [${userId}] date: [${date}]`);

  const dailyBalance = await getDailyBalance(accountId, userId, date);
  const userDisplayName = await getUserDisplayName(userId);
  const numTrades = await getNumberOfTrades(accountId, userId, date);

  info(`dailyBalance: [${dailyBalance}] userDisplayName: [${userDisplayName}] numTrades: [${numTrades}]`);

  const trades = await getTradesForDate(accountId, date);
  debug("trade data", JSON.stringify(trades, null, 2));

  let violationData = await getViolationsForDate(accountId, date);
  debug("violation data", JSON.stringify(violationData, null, 2));

  // let violationPerTicket = violationData.

  const templateHTML = Handlebars.compile(emailTemplate.REPORT1.HTML);
  const templateSUBJECT = Handlebars.compile(emailTemplate.REPORT1.SUBJECT);
  const templateTEXT = Handlebars.compile(emailTemplate.REPORT1.TEXT);

/* eslint-disable */
  violationData = violationData.map((x)=>{
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

  debug("violation data updated ", JSON.stringify(violationData, null, 2));

  const htmlParams = {
    balance: dailyBalance,
    date,
    trader: userDisplayName,
    numTrades: numTrades,
    numViolations: violationData.length,
    items: trades,
    violations: violationData,
  };
  debug("html params", JSON.stringify(htmlParams, null, 2));
  const subject = templateSUBJECT({trader: userDisplayName});
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
async function getUserDisplayName(userId: string) {
  const userData = await getAuth()
    .getUser(userId);
  if (userData.displayName.length == 0) {
    return null;
  }
  info(`getUserDisplayName ${userData.displayName}`);
  return userData.displayName;
}

/**
 * Get daily report
 *
 * @param {string} accountId account id
 * @param {string} userId user id
 * @param {string} date date
 */
async function getDailyBalance(accountId: string, userId: string, date: string) {
  try {
    const dailyBalanceSnapshot = await db.doc(`accounts/${accountId}/dailyBalance/${date}`).get();
    if (!dailyBalanceSnapshot.exists) {
      warn(`No daily balance for accountId: [${accountId}] userId: [${userId}] date: [${date}]`);
      return 0;
    }
    return dailyBalanceSnapshot.data().dailyBalance;
  } catch (err) {
    error(err);
  }
}

/**
 * Get number of trades
 *
 * @param {string} accountId account id
 * @param {string} userId user id
 * @param {string} date date
 */
async function getNumberOfTrades(accountId: string, userId: string, date: string) {
  try {
    const numTradesRef = await db.doc(`accounts/${accountId}/numTrades/${date}`).get();
    if (!numTradesRef.exists) {
      warn(`No number of trades for accountId: [${accountId}] userId: [${userId}] date: [${date}]`);
      return 0;
    }
    return numTradesRef.data().numberTrades;
  } catch (err) {
    error(err);
  }
}

/**
 * Get trades for date
 *
 *  @param {string} accountId account id
 *  @param {string} date date
 */
async function getTradesForDate(accountId: string, date: string) {
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
  } catch (err) {
    error(err);
  }
}

/**
 * Get violations for date
 *
 *  @param {string} accountId account id
 *  @param {string} date date
 */
async function getViolationsForDate(accountId: string, date: string) {
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
  } catch (err) {
    error(err);
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
    to: ["dmitriwarren@gmail.com"],
    date: Timestamp.fromDate(new Date()),
  });
  writeBatch.commit().then(() => {
    info("Successfully created batch.");
  });
}

export {
  sendAccountabilityReport,
};
