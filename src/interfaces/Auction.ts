import { Product } from "./Product";
import { User } from "./User";

export interface Auction {
    id: number;
    title: string;
    description: string;
    startingPrice: number;
    createdBy: User;
    status: string;
    product: Product
    startTime: string;
    endTime: string;
}