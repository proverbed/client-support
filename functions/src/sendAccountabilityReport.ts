import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {info, error, warn} from "firebase-functions/logger";
import {DocumentData, QueryDocumentSnapshot, QuerySnapshot, getFirestore} from "firebase-admin/firestore";

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
      return snapshot.data()! as T;
    },
  };
}

const sendAccountabilityReport = onDocumentCreated(PATH, async (event) => {
  // Get an object representing the document
  // e.g. {'name': 'Marie', 'age': 66}
  const snapshot = event.data;
  if (!snapshot) {
    console.log("No data associated with the event");
    return;
  }
  const data = snapshot.data();

  info(`calling sendAccountabilityReport with data: ${JSON.stringify(data, null, 2)}`);

  try {
    await generateReport(data.accountId, data.userId, data.date);
  } catch (e) {
    error(`generate report failed: ${e}`);
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

/**
 * Generate report
 *
 * @param {string} accountId account id
 * @param {string} userId user id
 * @param {string} date date
 */
async function generateReport(accountId: string, userId: string, date: string) {
  // validate input data
  info(`generateReport for accountId: [${accountId}] userId: [${userId}] date: [${date}]`);

  const dailyBalance = await getDailyBalance(accountId, userId, date);

  info(`dailyBalance for accountId: [${accountId}] userId: [${userId}] date: [${date}] is ${dailyBalance}`);


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
async function getDailyBalance(accountId: string, userId: string, date: string) {
  try {
    const data: number[] = [];
    const startOfToday = new Date(date);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const snapshot = await db
      .collection(`accounts/${accountId}/dailyBalance`)
      .where("date", ">=", startOfToday)
      .where("date", "<=", endOfToday)
      .withConverter(assignTypes<{dailyBalance: number}>())
      .get();

    if (snapshot.empty) {
      warn(`No daily balance for accountId: [${accountId}] userId: [${userId}] date: [${date}]`);
      return 0;
    }

    snapshot.docs.forEach((doc) => {
      info(`doc daily balance: [${doc.data().dailyBalance}]`);
      data.push(doc.data().dailyBalance);
    });

    return data[0];
  } catch (err) {
    error(err);
  }
}

export {
  sendAccountabilityReport,
};
