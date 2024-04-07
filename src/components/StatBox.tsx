import { Box, Typography, useTheme } from '@mui/material';
import React from 'react';
import { tokens } from '../theme.ts';
import ProgressCircle from './ProgressCircle.tsx';

type Props = {
  title: string;
  subtitle: string;
  icon: React.JSX.Element;
  progress: number;
  increase: string;
  displayProgress?: boolean;
  displayIncrease?: boolean;
};

function StatBox({
  title,
  subtitle,
  icon,
  progress,
  increase,
  displayProgress = true,
  displayIncrease = true,
}: Props) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box width="100%" m="0 30px">
      <Box display="flex" justifyContent="space-between">
        <Box>
          {icon}
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: colors.grey[100] }}
          >
            {title}
          </Typography>
        </Box>
        {displayProgress && (
          <Box>
            <ProgressCircle progress={progress} />
          </Box>
        )}
      </Box>
      <Box display="flex" justifyContent="space-between" mt="2px">
        <Typography variant="h5" sx={{ color: colors.greenAccent[500] }}>
          {subtitle}
        </Typography>
        {displayIncrease && (
          <Typography
            variant="h5"
            fontStyle="italic"
            sx={{ color: colors.greenAccent[600] }}
          >
            {increase}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
StatBox.displayName = 'StatBox';
StatBox.defaultProps = {
  displayProgress: true,
  displayIncrease: true,
};

export default StatBox;
