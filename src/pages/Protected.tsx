import { Navigate } from 'react-router-dom';
import { UserAuth } from '../store/AuthContext.tsx';

function Protected({ children }: { children?: React.ReactNode }) {
  const { user } = UserAuth();

  if (!user) {
    return <Navigate to="/" />;
  }
  return children;
}

export default Protected;
