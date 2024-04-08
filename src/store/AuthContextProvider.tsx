import React, {
  useContext, useEffect, useState,
  useMemo,
  useCallback,
} from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../config/Firebase.ts';
import { AuthContext } from './AuthContext.tsx';
import { UserType } from './dto/UserType.ts';

type Props = {
    children?: React.ReactNode;
};

function AuthContextProvider({ children }: Props) {
  const [user, setUser] = useState<UserType>({});

  const googleSignIn = useCallback(() => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  }, []);

  const logOut = useCallback(() => {
    signOut(auth);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // @ts-expect-error Set user is optional, can fix this with typescipt.
      setUser(currentUser);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const authProviderValue = useMemo(
    () => ({ googleSignIn, logOut, user }),
    [googleSignIn, logOut, user],
  );

  return (
    <AuthContext.Provider value={authProviderValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const UserAuth = () => useContext(AuthContext);
AuthContextProvider.defaultProps = {
  children: null,
};
AuthContextProvider.displayName = 'AuthContextProvider';

export default AuthContextProvider;
