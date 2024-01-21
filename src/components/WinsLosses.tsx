import { Box, useTheme } from "@mui/material";
import { tokens } from "../theme";
import { query, where } from "firebase/firestore";
import { useState, useEffect } from "react";
import { db } from "../config/Firebase";
import { getDocs, collection, onSnapshot } from "firebase/firestore";
import StatsBox from "./StatsBox";
import { defaultValue } from "../helperFunctions/defaultValue";

export interface TradesProps {
  id?: string;
  balance: number;
  date: {
    seconds: number;
    nanoseconds: number;
  };
  entry: string;
  instrument: string;
  profit: number;
  risk: number;
}

type Props = {
  accountId: string;
};

const WinsLosses: React.FC<Props> = ({ accountId }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [winslosses, setWinslosses] = useState<number[]>([]);
  const TRADES = "trades";

  const getNumberOfViolations = async () => {
    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, `accounts/${accountId}/${TRADES}`),
        where("date", ">=", startOfToday),
        where("date", "<=", endOfToday)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // @ts-expect-error avoid this eror
        const tradeData: TradesProps[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("trades Data: ", winRate(tradeData));

        setWinslosses(winRate(tradeData));
        return `accounts/${accountId}/${TRADES}`;
      } else {
        setWinslosses([0, 0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const winRate = function (arr: TradesProps[]) {
    const total = arr.length;
    let count = 0;

    arr.forEach((item) => {
      if (item.profit > 0) {
        count++;
      }
    });

    return [defaultValue(count, 0), defaultValue(total - count, 0)];
  };

  useEffect(() => {
    let pathVar;
    // let unsubscribe;
    const pathResult = (async () => {
      pathVar = await getNumberOfViolations();
      return pathVar;
    })();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let observer: any;
    pathResult.then((value) => {
      if (value !== undefined) {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const q = query(
          collection(db, `accounts/${accountId}/${TRADES}`),
          where("date", ">=", startOfToday),
          where("date", "<=", endOfToday)
        );

        console.log(value);
        observer = onSnapshot(
          q,
          (querySnapshot) => {
            //@ts-expect-error avoid this eror
            const tradeData: TradesProps[] = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            setWinslosses(winRate(tradeData));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  return (
    <>
      <Box
        gridColumn="span 2"
        sx={{ bgcolor: colors.primary[400] }}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <StatsBox
          title={`${winslosses[0]} / ${winslosses[1]}`}
          subtitle="Wins/Losses"
        />
      </Box>
    </>
  );
};

export default WinsLosses;
