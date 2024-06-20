import { Navigate } from 'react-router-dom';
import React from 'react';
import { UserAuth } from '../AuthContext';

type Props = {
  children?: React.ReactNode,
};

function Protected({ children }: Props) {
  const { user } = UserAuth();

  if (!user) {
    return <Navigate to="/" />;
  }
  return children;
}
Protected.defaultProps = {
  children: null,
};

export default Protected;
