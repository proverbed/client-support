import { Box } from '@mui/material';
import Header from '../../components/Header';
import LineChart from '../../components/LineChart';
import { configSettings } from '../../config/config';

function Line() {
  const myEnv = import.meta.env.PROD ? 'prod' : 'dev';
  const numTradesAccountId = configSettings['num-trades-today'][myEnv].accountId;
  return (
    <Box m="20px">
      <Header title="Line Chart" subtitle="Simple Line Chart" />
      <Box height="75vh">
        <LineChart accountId={numTradesAccountId} />
      </Box>
    </Box>
  );
}

export default Line;
