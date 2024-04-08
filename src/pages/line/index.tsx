import { Box } from '@mui/material';
import Header from '../../components/Header.tsx';
import LineChart from '../../components/LineChart.tsx';
import CONFIG_SETTINGS from '../../config/config.ts';

function Line() {
  const myEnv = import.meta.env.PROD ? 'prod' : 'dev';
  const numTradesAccountId = CONFIG_SETTINGS['num-trades-today'][myEnv].accountId;
  return (
    <Box m="20px">
      <Header title="Line Chart" subtitle="Simple Line Chart" />
      <Box height="75vh">
        <LineChart accountId={numTradesAccountId} />
      </Box>
    </Box>
  );
}
Line.displayName = 'Line';

export default Line;
