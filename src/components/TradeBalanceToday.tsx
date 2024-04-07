import { Box, useTheme } from '@mui/material';
import {
  query, where, getDocs, collection, onSnapshot, doc,
} from 'firebase/firestore';
import { useState, useEffect } from 'react';
import BalanceIcon from '@mui/icons-material/Balance';
import { db } from '../config/Firebase.ts';
import { tokens } from '../theme.ts';
import StatBox from './StatBox.tsx';

type Props = {
  accountId: string;
};

function TradeBalanceToday({ accountId }: Props) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [balance, setBalance] = useState<number>(0);
  const DAILY_BALANCE = 'dailyBalance';

  const getNumberOfTrades = async () => {
    let path = '';
    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, `accounts/${accountId}/${DAILY_BALANCE}`),
        where('date', '>=', startOfToday),
        where('date', '<=', endOfToday),
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setBalance(querySnapshot.docs[0].data().dailyBalance);
        path = `accounts/${accountId}/${DAILY_BALANCE}/${querySnapshot.docs[0].id}`;
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
        observer = onSnapshot(
          doc(db, value),
          (querySnapshot) => {
            console.log(
              `Received query snapshot ${JSON.stringify(
                querySnapshot.data(),
                null,
                2,
              )}`,
            );
            setBalance(querySnapshot.data()?.dailyBalance);
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
    <Box
      gridColumn="span 3"
      sx={{ bgcolor: colors.primary[400] }}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <StatBox
        title={`$${balance}`}
        subtitle="Trade balance for Today"
        progress={0.75}
        increase="+14%"
        displayIncrease={false}
        displayProgress={false}
        icon={(
          <BalanceIcon
            sx={{ color: colors.greenAccent[600], fontSize: '26px' }}
          />
        )}
      />
    </Box>
  );
}
TradeBalanceToday.displayName = 'TradeBalanceToday';

export default TradeBalanceToday;
