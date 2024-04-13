import { Box, useTheme } from '@mui/material';
import {
  query, where, getDocs, collection, onSnapshot,
} from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { db } from '../config/Firebase.ts';
import { tokens } from '../theme.ts';
import StatsBox from './StatsBox.tsx';
import winRate from '../util/math.ts';

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

function WinsLosses({ accountId }: Props) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [winslosses, setWinslosses] = useState<number[]>([]);
  const TRADES = 'trades';

  const getNumberOfViolations = async () => {
    let path = '';
    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, `accounts/${accountId}/${TRADES}`),
        where('date', '>=', startOfToday),
        where('date', '<=', endOfToday),
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // @ts-expect-error avoid this eror
        const tradeData: TradesProps[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log('trades Data: ', winRate(tradeData));

        setWinslosses([Number(winRate(tradeData))]);
        path = `accounts/${accountId}/${TRADES}`;
      }
      setWinslosses([0, 0]);
    } catch (err) {
      console.error(err);
    }
    return path;
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
          where('date', '>=', startOfToday),
          where('date', '<=', endOfToday),
        );

        observer = onSnapshot(
          q,
          (querySnapshot) => {
            // @ts-expect-error avoid this eror
            const tradeData: TradesProps[] = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            setWinslosses([Number(winRate(tradeData))]);
          },
          (err) => {
            console.log(`Encountered error: ${err}`);
          },
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
  );
}
WinsLosses.displayName = 'WinsLosses';

export default WinsLosses;
