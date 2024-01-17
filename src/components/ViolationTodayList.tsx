import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";
import { query, where } from "firebase/firestore";
import { useState, useEffect } from "react";
import { db } from "../config/Firebase";
import { getDocs, collection, onSnapshot } from "firebase/firestore";
import { configSettings } from "../config/config";

export interface ViolationProps {
  id?: string;
  date: {
    seconds: number;
    nanoseconds: number;
  };
  type: string;
  ticket: string;
}

const ViolationTodayList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [violation, setViolation] = useState<ViolationProps[]>([]);
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
        // @ts-expect-error avoid this eror
        const violationData: ViolationProps[] = querySnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );
        console.log("violationData: ", violationData);

        setViolation(violationData);
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
              `ViolationsList Received query snapshot ${JSON.stringify(
                querySnapshot.size,
                null,
                2
              )}`
            );

            //@ts-expect-error avoid this eror
            const violationData: ViolationProps[] = querySnapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
              })
            );

            setViolation(violationData);
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
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        borderBottom={`4px solid ${colors.primary[500]}`}
        p="15px"
      >
        <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
          Recent Violations
        </Typography>
      </Box>
      {violation.map((violation, i) => (
        <Box
          key={`${violation.id}-${i}`}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          borderBottom={`4px solid ${colors.primary[500]}`}
          p="15px"
        >
          <Box>
            <Typography
              color={colors.greenAccent[500]}
              variant="h5"
              fontWeight="600"
            >
              {violation.id?.substring(0, 5)}
            </Typography>
            <Typography color={colors.grey[100]}>{violation.ticket}</Typography>
          </Box>
          <Box color={colors.grey[100]}>
            {new Date(violation.date.seconds * 1000).toDateString()}
          </Box>
          <Box
            sx={{ bgcolor: colors.greenAccent[600] }}
            p="5px 10px"
            borderRadius="4px"
          >
            {violation.type}
          </Box>
        </Box>
      ))}
    </>
  );
};

export default ViolationTodayList;
