import { Box, useTheme } from '@mui/material';
import {
  onSnapshot, doc,
  getDoc,
} from 'firebase/firestore';
import { useState, useEffect } from 'react';
import moment from 'moment';
import { db } from '../config/Firebase.ts';
import { tokens } from '../theme.ts';
import StatsBox from './StatsBox.tsx';
import CONST from '../global/Const.ts';

type Props = {
  accountId: string;
};

function NumberTradesToday({ accountId }: Props) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [numTrades, setNumTrades] = useState<number>(0);

  const getNumberOfTrades = async () => {
    let path = '';
    try {
      path = `accounts/${accountId}/${CONST.DB.NUMBER_TRADES}/${moment.utc(new Date()).format('YYYY-MM-DD')}`;
      const querySnapshot = await getDoc(doc(db, path));

      if (querySnapshot.data() !== undefined) {
        setNumTrades(querySnapshot.data()!.numberTrades);
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
      if (value !== undefined && value !== '') {
        observer = onSnapshot(
          doc(db, value),
          (querySnapshot) => {
            if (querySnapshot.data() !== undefined) {
              setNumTrades(querySnapshot.data()!.numberTrades);
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
  }, []);

  return (
    <Box
      gridColumn="span 2"
      sx={{ bgcolor: colors.primary[400] }}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <StatsBox title={String(numTrades)} subtitle="Total Trades" />
    </Box>
  );
}
NumberTradesToday.displayName = 'NumberTradesToday';

export default NumberTradesToday;
