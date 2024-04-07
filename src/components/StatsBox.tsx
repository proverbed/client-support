import { Box, Typography, useTheme } from '@mui/material';
import { tokens } from '../theme.ts';

type Props = {
  title: string;
  subtitle: string;
};

function StatsBox({ title, subtitle }: Props) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box width="100%" m="0 30px">
      <Box display="flex" justifyContent="space-between">
        <Box>
          <Typography variant="h5" sx={{ color: colors.greenAccent[500] }}>
            {subtitle}
          </Typography>
        </Box>
      </Box>
      <Box display="flex" justifyContent="space-between" mt="2px">
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ color: colors.grey[100] }}
        >
          {title}
        </Typography>
      </Box>
    </Box>
  );
}
StatsBox.displayName = 'StatsBox';

export default StatsBox;
