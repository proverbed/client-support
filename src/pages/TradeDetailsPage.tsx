import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../config/Firebase.ts';

export interface TradeProps {
    id?: string,
    ticket: string,
    symbol: string,
    type: string,
    date: string,
    volume: number,
    profit: number,
    entryPrice: number,
}

function TradeDetailsPage() {
  const { tradeId } = useParams<{
        tradeId: string;
    }>();

  const [tradeDetails, setTradeDetails] = useState<TradeProps>();

  const getTradeDetails = async () => {
    try {
      const docSnap = await getDoc(doc(db, `trades/${tradeId}`));

      if (docSnap.exists()) {
        // @ts-expect-error error - need to relook this
        setTradeDetails({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.log('No such document!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getTradeDetails();
  }, []);

  return (
    <>
      <p>
        date:
        {tradeDetails?.date}
      </p>
      <p>
        symbol:
        {tradeDetails?.symbol}
      </p>
      <p>
        type:
        {tradeDetails?.type}
      </p>
      <p>
        ticket:
        {tradeDetails?.ticket}
      </p>
      <p>
        profit:
        {tradeDetails?.profit}
      </p>
      <p>
        entryPrice:
        {tradeDetails?.entryPrice}
      </p>
      <p>
        volume:
        {tradeDetails?.volume}
      </p>
      <p>
        id:
        {tradeDetails?.id}
      </p>

    </>
  );
}

export default TradeDetailsPage;
