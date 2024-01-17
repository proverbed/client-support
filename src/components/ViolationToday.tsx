import { Box, useTheme } from "@mui/material";
import { tokens } from "../theme";
import { query, where } from "firebase/firestore";
import { useState, useEffect } from "react";
import { db } from "../config/Firebase";
import { getDocs, collection, onSnapshot } from "firebase/firestore";
import ReportOffIcon from "@mui/icons-material/ReportOff";
import StatBox from "./StatBox";
import { configSettings } from "../config/config";

const ViolationToday = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [violation, setViolation] = useState<number>(0);
  const VIOLATION = "violation";

  const myEnv = import.meta.env.PROD ? `prod` : `dev`;
  const accountId = configSettings["violation-today"][myEnv].accountId;

  const getNumberOfViolations = async () => {
    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, `accounts/${accountId}/${VIOLATION}`),
        where("date", ">=", startOfToday),
        where("date", "<=", endOfToday)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setViolation(querySnapshot.size);
        // const path =
        //   `accounts/${accountId}/${VIOLATION}/` + querySnapshot.docs[0].id;
        return `accounts/${accountId}/${VIOLATION}`;
      }
    } catch (err) {
      console.error(err);
    }
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
          collection(db, `accounts/${accountId}/${VIOLATION}`),
          where("date", ">=", startOfToday),
          where("date", "<=", endOfToday)
        );

        console.log(value);
        observer = onSnapshot(
          q,
          (querySnapshot) => {
            console.log(
              `Violations Received query snapshot ${JSON.stringify(
                querySnapshot.size,
                null,
                2
              )}`
            );
            setViolation(querySnapshot.size);
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
        title={String(violation)}
        subtitle="Violations for Today"
        progress={0.75}
        increase="+14%"
        displayIncrease={false}
        displayProgress={false}
        icon={
          <ReportOffIcon
            sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
          />
        }
      />
    </Box>
  );
};

export default ViolationToday;
