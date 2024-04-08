import {
  useTheme, Typography,
} from '@mui/material';
import React from 'react';
import { MenuItem } from 'react-pro-sidebar';
import { Link } from 'react-router-dom';
import { tokens } from '../../theme.ts';

type Props = {
    title: string;
    to: string;
    icon: React.JSX.Element;
    selected: string;
    setSelected: (title: string) => void;
  };

function SitebarItem({
  title, to, icon, selected, setSelected,
}: Props) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
}

export default SitebarItem;
