import { Box, Typography, useTheme } from '@mui/material';
import {
  query, where, getDocs, collection, onSnapshot,
} from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { db } from '../config/Firebase.ts';
import { tokens } from '../theme.ts';
import CONST from '../global/Const.ts';

export interface TradesTodayProps {
  id?: string;
  date: {
    seconds: number;
    nanoseconds: number;
  };
  type: string;
  instrument: string;
  ticket: string;
  profit: number;
  risk: number;
  volume: number;
  balance: number;
  tp: string;
  sl: string;
  entry: string;
}

type Props = {
  accountId: string;
};

function TradesTodayList({ accountId }: Props) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [trades, setTrades] = useState<TradesTodayProps[]>([]);

  const getNumberOfTrades = async () => {
    let path = '';
    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, `accounts/${accountId}/${CONST.DB.TRADES}`),
        where('date', '>=', startOfToday),
        where('date', '<=', endOfToday),
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // @ts-expect-error avoid this eror
        const tradesTodayData: TradesTodayProps[] = querySnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          }),
        );
        console.log('tradesTodayData: ', tradesTodayData);

        setTrades(tradesTodayData);
        path = `accounts/${accountId}/${CONST.DB.TRADES}`;
      }
    } catch (err) {
      console.error(err);
    }
    return path;
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
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const q = query(
          collection(db, `accounts/${accountId}/${CONST.DB.TRADES}`),
          where('date', '>=', startOfToday),
          where('date', '<=', endOfToday),
        );

        observer = onSnapshot(
          q,
          (querySnapshot) => {
            console.log(
              `TradesList Received query snapshot ${JSON.stringify(
                querySnapshot.size,
                null,
                2,
              )}`,
            );

            // @ts-expect-error avoid this eror
            const tradesData: TradesTodayProps[] = querySnapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
              }),
            );

            setTrades(tradesData);
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
  }, [accountId]);

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
          Recent Trades
        </Typography>
      </Box>
      {trades.map((item, i) => (
        <Box
          // eslint-disable-next-line react/no-array-index-key
          key={`${item.id}-${i}`}
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
              {item.ticket}
            </Typography>
            <Typography color={colors.grey[100]}>{item.instrument}</Typography>
          </Box>
          <Box color={colors.grey[100]}>
            {`${item.volume} lots`}
          </Box>
          <Box color={colors.grey[100]}>
            {`risk: $ ${item.risk}`}
          </Box>
          <Box color={colors.grey[100]}>
            {`profit: $ ${item.profit}`}
          </Box>
          <Box
            sx={{ bgcolor: colors.greenAccent[600] }}
            p="5px 10px"
            borderRadius="4px"
          >
            {item.type}
          </Box>
        </Box>
      ))}
    </>
  );
}
TradesTodayList.displayName = 'TradesTodayList';

export default TradesTodayList;
