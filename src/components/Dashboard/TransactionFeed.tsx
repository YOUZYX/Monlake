import React, { useEffect, useState } from 'react';
import { fetchTokenTransfers } from '../../services/api';

const TransactionFeed: React.FC = () => {
    const [transfers, setTransfers] = useState([]);

    useEffect(() => {
        const fetchTransfers = async () => {
            const data = await fetchTokenTransfers();
            setTransfers(data);
        };

        fetchTransfers();
        const interval = setInterval(fetchTransfers, 5000); // Fetch every 5 seconds

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    return (
        <div className="transaction-feed">
            <h2 className="text-lg font-bold">Latest Token Transfers</h2>
            <ul className="mt-4">
                {transfers.map((transfer, index) => (
                    <li key={index} className="border-b py-2">
                        {/*<span className="font-semibold">{transfer.from}</span> sent <span className="font-semibold">{transfer.amount}</span> to <span className="font-semibold">{transfer.to}</span>*/}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TransactionFeed;