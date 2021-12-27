import Account from "./account";

export default interface Client {
    id: string;
    fname: string;
    lname: string;
    account: Account[]; 
}