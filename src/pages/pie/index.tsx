import { Box } from '@mui/material';
import Header from '../../components/Header.tsx';
import PieChart from '../../components/PieChart.tsx';

function Pie() {
  return (
    <Box m="20px">
      <Header title="Pie Chart" subtitle="Simple Pie Chart" />
      <Box height="75vh">
        <PieChart />
      </Box>
    </Box>
  );
}
Pie.displayName = 'Pie';

export default Pie;
