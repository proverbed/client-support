import { Box } from '@mui/material';
import Header from '../../components/Header.tsx';
import BarChart from '../../components/BarChart.tsx';

function Bar() {
  return (
    <Box m="20px">
      <Header title="Bar Chart" subtitle="Simple Bar Chart" />
      <Box height="75vh">
        <BarChart />
      </Box>
    </Box>
  );
}

export default Bar;
