import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import BarChart from "../../components/BarChart";
import ProgressCircle from "../../components/ProgressCircle";
import NumberTradesToday from "../../components/NumberTradesToday";
import TradeBalanceToday from "../../components/TradeBalanceToday";
import ViolationToday from "../../components/ViolationToday";
import ViolationTodayList from "../../components/ViolationTodayList";
import { useParams } from "react-router-dom";
import WinRate from "../../components/WinRate";
import WinsLosses from "../../components/WinsLosses";

export interface NumTradesProps {
  id?: string;
  date: string;
  numberTrades: number;
}

const AccountDashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { accountId } = useParams<{
    accountId: string;
  }>();

  const myAccountId = accountId !== undefined ? accountId : "";

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
                Account Balance
              </Typography>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.greenAccent[500]}
              >
                $ Put account balance here
              </Typography>
            </Box>
          </Box>
          <Box height="250px" m="-20px 0 0 0">
            <LineChart isDashboard={true} accountId={myAccountId} />
          </Box>
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
              sx={{ mt: "15px" }}
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
            sx={{ padding: "30px 30px 0 30px" }}
          >
            Sales Quantity
          </Typography>
          <Box height="250px" mt="-20px">
            <BarChart isDashboard={true} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AccountDashboard;
