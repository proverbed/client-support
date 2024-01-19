import { Box, useTheme } from "@mui/material";
import { tokens } from "../theme";
import { query, where } from "firebase/firestore";
import { useState, useEffect } from "react";
import { db } from "../config/Firebase";
import { getDocs, collection, onSnapshot, doc } from "firebase/firestore";
import NumbersIcon from "@mui/icons-material/Numbers";
import StatBox from "./StatBox";

type Props = {
  accountId: string;
};

const NumberTradesToday: React.FC<Props> = ({ accountId }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [numTrades, setNumTrades] = useState<number>(0);

  const getNumberOfTrades = async () => {
    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, `accounts/${accountId}/numTrades`),
        where("date", ">=", startOfToday),
        where("date", "<=", endOfToday)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setNumTrades(querySnapshot.docs[0].data().numberTrades);
        return `accounts/${accountId}/numTrades/${querySnapshot.docs[0].id}`;
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let observer: any;
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
            setNumTrades(querySnapshot.data()?.numberTrades);
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
      sx={{ bgcolor: colors.primary[400] }}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <StatBox
        title={String(numTrades)}
        subtitle="Number of Trades Today"
        progress={0.75}
        increase="+14%"
        displayIncrease={false}
        displayProgress={false}
        icon={
          <NumbersIcon
            sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
          />
        }
      />
    </Box>
  );
};

export default NumberTradesToday;
