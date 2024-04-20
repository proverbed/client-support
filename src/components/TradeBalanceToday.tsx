import { Box, useTheme } from '@mui/material';
import {
  onSnapshot, doc,
  getDoc,
} from 'firebase/firestore';
import { useState, useEffect } from 'react';
import BalanceIcon from '@mui/icons-material/Balance';
import moment from 'moment';
import { db } from '../config/Firebase.ts';
import { tokens } from '../theme.ts';
import StatBox from './StatBox.tsx';
import CONST from '../global/Const.ts';

type Props = {
  accountId: string;
};

function TradeBalanceToday({ accountId }: Props) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [balance, setBalance] = useState<number>(0);

  const getDailyBalance = async () => {
    let path = '';
    try {
      path = `accounts/${accountId}/${CONST.DB.DAILY_BALANCE}/${moment.utc(new Date()).format('YYYY-MM-DD')}`;
      const querySnapshot = await getDoc(doc(db, path));

      if (querySnapshot.data() !== undefined) {
        setBalance(querySnapshot.data()!.dailyBalance);
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
      pathVar = await getDailyBalance();
      return pathVar;
    })();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let observer: any;
    pathResult.then((value) => {
      if (value !== undefined && value !== '') {
        observer = onSnapshot(
          doc(db, value),
          (querySnapshot) => {
            if (querySnapshot.data() !== undefined) {
              setBalance(querySnapshot.data()!.dailyBalance);
            }
          },
          (err) => {
            console.error(`Encountered error: ${err}`);
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
        title={`$${balance.toFixed(2)}`}
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
