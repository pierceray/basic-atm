export type CustomerType = {
	firstName: string;
	lastName: string;
	account: string;
	pin: string;
}

export type ITransaction = {
	account: string;
	amount: number;
	type: string;
	date: string;
};