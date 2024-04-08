import {
  Box, Button, IconButton, Typography, useTheme,
} from '@mui/material';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import TrafficIcon from '@mui/icons-material/Traffic';
import { tokens } from '../../theme.ts';
import Header from '../../components/Header.tsx';
import LineChart from '../../components/LineChart.tsx';
import BarChart from '../../components/BarChart.tsx';
import StatBox from '../../components/StatBox.tsx';
import ProgressCircle from '../../components/ProgressCircle.tsx';
import NumberTradesToday from '../../components/NumberTradesToday.tsx';
import TradeBalanceToday from '../../components/TradeBalanceToday.tsx';
import ViolationToday from '../../components/ViolationToday.tsx';
import ViolationTodayList from '../../components/ViolationTodayList.tsx';
import CONFIG_SETTINGS from '../../config/config.ts';

export interface NumTradesProps {
  id?: string;
  date: string;
  numberTrades: number;
}

function Dashboard() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const myEnv = import.meta.env.PROD ? 'prod' : 'dev';
  const numTradesAccountId = CONFIG_SETTINGS['num-trades-today'][myEnv].accountId;
  const tradeBalancecAccountId = CONFIG_SETTINGS['trade-balance-today'][myEnv].accountId;
  const violationTodayAccountId = CONFIG_SETTINGS['violation-today'][myEnv].accountId;

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />

        <Box>
          <Button
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: '14px',
              fontWeight: 'bold',
              padding: '10px 20px',
            }}
          >
            <DownloadOutlinedIcon sx={{ mr: '10px' }} />
            Download Reports
          </Button>
        </Box>
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* ROW 1 */}
        <NumberTradesToday accountId={numTradesAccountId} />
        <TradeBalanceToday accountId={tradeBalancecAccountId} />
        <ViolationToday accountId={violationTodayAccountId} />
        <Box
          gridColumn="span 3"
          sx={{ bgcolor: colors.primary[400] }}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title="1,325,134"
            subtitle="Traffic Received"
            progress={0.8}
            increase="+43%"
            icon={(
              <TrafficIcon
                sx={{ color: colors.greenAccent[600], fontSize: '26px' }}
              />
            )}
          />
        </Box>

        {/* ROW 2 */}
        <Box
          gridColumn="span 8"
          gridRow="span 2"
          sx={{ bgcolor: colors.primary[400] }}
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex "
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.grey[100]}
              >
                Revenue Generated
              </Typography>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.greenAccent[500]}
              >
                $59,342.32
              </Typography>
            </Box>
            <Box>
              <IconButton>
                <DownloadOutlinedIcon
                  sx={{ fontSize: '26px', color: colors.greenAccent[500] }}
                />
              </IconButton>
            </Box>
          </Box>
          <Box height="250px" m="-20px 0 0 0">
            <LineChart isDashboard accountId={numTradesAccountId} />
          </Box>
        </Box>
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          sx={{ bgcolor: colors.primary[400] }}
          overflow="auto"
        >
          <ViolationTodayList accountId={violationTodayAccountId} />
        </Box>

        {/* ROW 3 */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          sx={{ bgcolor: colors.primary[400] }}
          p="30px"
        >
          <Typography variant="h5" fontWeight="600">
            Campaign
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            mt="25px"
          >
            <ProgressCircle size={125} />
            <Typography
              variant="h5"
              color={colors.greenAccent[500]}
              sx={{ mt: '15px' }}
            >
              $48,352 revenue generated
            </Typography>
            <Typography>Includes extra misc expenditures and costs</Typography>
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

export default Dashboard;
