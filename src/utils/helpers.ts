// src/utils/helpers.ts

export const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
};

export const calculateTransactionSpeed = (transactions: number, timeFrame: number): number => {
    return transactions / timeFrame;
};