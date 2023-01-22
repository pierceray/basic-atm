import CustomerRoll from '@/data/CustomerRoll.json';
import { CustomerType } from '@/types';

export default async function handler(req: any, res: any) {
    const currentCustomer = CustomerRoll.find(
        (cust: CustomerType) => cust.pin === req.body.pin
    );

    res.status(200).json({ result: currentCustomer });
}
