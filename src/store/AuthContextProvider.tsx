import React, {
  useContext, useEffect, useState,
} from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../config/Firebase.ts';
import { AuthContext } from './AuthContext.tsx';

export type UserType = {
    displayName?: string;
    photoURL?: string;
    email?: string;
};

type Props = {
    children?: React.ReactNode;
};

function AuthContextProvider({ children }: Props) {
  const [user, setUser] = useState<UserType>({});

  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  const logOut = () => {
    signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // @ts-ignore
      setUser(currentUser);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ googleSignIn, logOut, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const UserAuth = () => useContext(AuthContext);

export default AuthContextProvider;
