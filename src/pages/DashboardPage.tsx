import { Link } from "react-router-dom";
import Modal from "../components/Modal";
import { useEffect } from "react";
import { db } from "../config/Firebase";
import { getDocs, collection } from "firebase/firestore";

function DashboardPage() {

    const tradesCollectionRef = collection(db, 'trades');

    useEffect(()=>{
        const getTradeList = async () => {
            try {
                const data = await getDocs(tradesCollectionRef);
                

                console.log(data);
            } catch( err ) {
                console.error(err);
            }
        };

        getTradeList();
        
    }, []);

    return (
        <>
            <h1>My Dashboard Page</h1>

            <div><Modal></Modal></div>
        </>


    )

}

export default DashboardPage;