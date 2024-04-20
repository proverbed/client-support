import {
  Box, Button, Typography, useTheme,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import {
  collection, doc, setDoc,
} from 'firebase/firestore';
import moment from 'moment';
import { tokens } from '../../theme.ts';
import Header from '../../components/Header.tsx';
import BarChart from '../../components/BarChart.tsx';
import NumberTradesToday from '../../components/NumberTradesToday.tsx';
import TradeBalanceToday from '../../components/TradeBalanceToday.tsx';
import ViolationToday from '../../components/ViolationToday.tsx';
import ViolationTodayList from '../../components/ViolationTodayList.tsx';
import WinRate from '../../components/WinRate.tsx';
import WinsLosses from '../../components/WinsLosses.tsx';
import { db } from '../../config/Firebase.ts';
import { UserAuth } from '../../store/AuthContext.tsx';
import TradesTodayList from '../../components/TradesTodayList.tsx';

export interface NumTradesProps {
  id?: string;
  date: string;
  numberTrades: number;
}

function AccountDashboard() {
  const theme = useTheme();
  const { user } = UserAuth();
  const colors = tokens(theme.palette.mode);
  const { accountId } = useParams<{
    accountId: string;
  }>();

  const myAccountId = accountId !== undefined ? accountId : '';

  const handleRequestReport = async () => {
    try {
      const newReportRef = doc(collection(db, 'sendAccountabilityReport'));

      await setDoc(newReportRef, {
        userId: user.uid,
        accountId,
        date: moment.utc(new Date()).format('YYYY-MM-DD'),
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* ROW 1 */}

        <WinRate accountId={myAccountId} />
        <WinsLosses accountId={myAccountId} />
        <NumberTradesToday accountId={myAccountId} />
        <TradeBalanceToday accountId={myAccountId} />
        <ViolationToday accountId={myAccountId} />

        {/* ROW 2 */}
        <Box
          gridColumn="span 8"
          gridRow="span 2"
          sx={{ bgcolor: colors.primary[400] }}
        >
          <TradesTodayList accountId={myAccountId} />
        </Box>
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          sx={{ bgcolor: colors.primary[400] }}
          overflow="auto"
        >
          <ViolationTodayList accountId={myAccountId} />
        </Box>

        {/* ROW 3 */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          sx={{ bgcolor: colors.primary[400] }}
          p="30px"
        >
          <Typography variant="h5" fontWeight="600">
            Accountability Partner
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            mt="25px"
          >
            <Button type="submit" color="secondary" variant="contained" onClick={handleRequestReport}>
              Request report
            </Button>
          </Box>
        </Box>
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          sx={{ bgcolor: colors.primary[400] }}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ padding: '30px 30px 0 30px' }}
          >
            Sales Quantity
          </Typography>
          <Box height="250px" mt="-20px">
            <BarChart isDashboard />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default AccountDashboard;
