import { useContext, createContext, useEffect, useState } from "react";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from '../config/Firebase';

const AuthContext = createContext({
    googleSignIn: ()=>{}, 
    logOut: ()=>{}, 
    user: {
        
    }
});

type Props = {
    children?: React.ReactNode
};

export const AuthContextProvider: React.FC<Props> = ({ children }) => {

    const [user, setUser] = useState({});

    const googleSignIn = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider);
    }

    const logOut = () => {
        signOut(auth)
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => {
            unsubscribe()
        }
    }, []);

    return (
        <AuthContext.Provider value={{ googleSignIn, logOut, user }}>
            {children}
        </AuthContext.Provider>
    )
}

export const UserAuth = () => {
    return useContext(AuthContext);
}
