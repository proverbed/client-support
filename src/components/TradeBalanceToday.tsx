import { Box, useTheme } from "@mui/material";
import { tokens } from "../theme";
import { query, where } from "firebase/firestore";
import { useState, useEffect } from "react";
import { db } from "../config/Firebase";
import { getDocs, collection, onSnapshot, doc } from "firebase/firestore";
import BalanceIcon from "@mui/icons-material/Balance";
import StatBox from "./StatBox";

const TradeBalanceToday = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [balance, setBalance] = useState<number>(0);
  const DAILY_BALANCE = "dailyBalance";

  const getNumberOfTrades = async () => {
    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, `accounts/undefined/${DAILY_BALANCE}`),
        where("date", ">=", startOfToday),
        where("date", "<=", endOfToday)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setBalance(querySnapshot.docs[0].data().dailyBalance);
        const path =
          `accounts/undefined/${DAILY_BALANCE}/` + querySnapshot.docs[0].id;
        return path;
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let pathVar;
    // let unsubscribe;
    const pathResult = (async () => {
      pathVar = await getNumberOfTrades();
      return pathVar;
    })();

    let observer;
    pathResult.then((value) => {
      if (value !== undefined) {
        observer = onSnapshot(
          doc(db, value),
          (querySnapshot) => {
            console.log(
              `Received query snapshot ${JSON.stringify(
                querySnapshot.data(),
                null,
                2
              )}`
            );
            setBalance(querySnapshot.data().dailyBalance);
          },
          (err) => {
            console.log(`Encountered error: ${err}`);
          }
        );
      }
    });

    return () => {
      if (observer !== undefined) {
        observer();
      }
    };
  }, []);

  return (
    <Box
      gridColumn="span 3"
      backgroundColor={colors.primary[400]}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <StatBox
        title={"$" + balance}
        subtitle="Trade balance for Today"
        progress="0.75"
        increase="+14%"
        displayIncrease={false}
        displayProgress={false}
        icon={
          <BalanceIcon
            sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
          />
        }
      />
    </Box>
  );
};

export default TradeBalanceToday;
