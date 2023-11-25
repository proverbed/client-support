// import { useState } from "react";


const Card = ({ ticket, symbol, type, volume, profit, entryPrice, date }: TradeProps) => {

    //  const [ticket, ] = useState<string>('');
     
    return (
        <>
            <div>
                <div>{ticket}</div>
                <div>{symbol}</div>
                <div>{type}</div>
                <div>{volume}</div>
                <div>{profit}</div>
                <div>{entryPrice}</div>
                <div>{date}</div>
            </div>
        </>
    )

}

export default Card;