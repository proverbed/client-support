import {
  useContext, createContext,
} from 'react';
import { UserType } from './dto/UserType.ts';

type UserContextType = {
  user: UserType;
  googleSignIn: () => void;
  logOut: () => void;
};

export const AuthContext = createContext<UserContextType>({
  googleSignIn: () => {},
  logOut: () => {},
  user: {
    displayName: '',
  },
});

export const UserAuth = () => useContext(AuthContext);
