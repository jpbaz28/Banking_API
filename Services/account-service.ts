/* account-service.ts
 * Author: Justin Bertrand
 * Description: This class implements the methods to access
 *              and modify the accounts on our client items.
 */


import ClientDAO from "../daos/client_dao";
import { clientDAOAzure } from "../daos/client_dao";
import Account from "../Entities/account";
import Client from "../Entities/client";
import { InsufficientFundsError, ResourceNotFoundError } from "../Errors/error-handle";

export interface AccountService {
    addAccountToClient(clientId: string, account: Account): Promise<Client>;

    addClient(client: Client): Promise<Client>;

    retrieveClientById(clientId: string): Promise<Client>;

    retrieveAllClients(): Promise<Client[]>;

    getAccountsByBalance(
        client: Client,
        greaterThan: number,
        lessThan: number
    ): Promise<Account[]>;

    depositToAccount(
        client: Client,  
        accountName: string, 
        amount: number
    ): Promise<Client>;

    withdrawFromAccount(
        client: Client, 
        accountName: string, 
        amount: number
    ): Promise<Client>;
}

export class AccountServiceImp implements AccountService {
    // Dependency Injection allows us to swap the implementation of a dependency/property
    constructor(private clientDAO: ClientDAO) {}

    //This function pushes an account into the account array on a client object
    //It then updates the database with the client
    async addAccountToClient(clientId: string, account: Account): Promise<Client> {
        const client: Client = await this.clientDAO.getClientByID(clientId);
        client.account.push(account);
        await this.clientDAO.updateClient(client);
        return client;
    }

    //Calls back to the Client DAO
    async addClient(client: Client): Promise<Client> {
        client.account = client.account ?? [];
        client = await this.clientDAO.createClient(client);
        return client;
    }

    //Calls back to the Client DAO
    async retrieveClientById(clientId: string): Promise<Client> {
        return this.clientDAO.getClientByID(clientId);
    }

    //Calls back to the Client DAO
    async retrieveAllClients(): Promise<Client[]> {
        return this.clientDAO.getAllClients();
    }

    //This function gets accounts by balance
    async getAccountsByBalance(
        client: Client,
        greaterThan: number,
        lessThan: number
    ): Promise<Account[]> {

        //Nullish operator to account for one query entry
        const lowerLimit = greaterThan ?? 0;
        const upperLimit = lessThan ?? Number.MAX_SAFE_INTEGER;

        const accounts: Account[] = client.account;
        let sortedAccounts: Account[];

        //Sorts through account array on clients and sets sorted accounts variable with         
        //accounts in between provided greaterThan and lessThan numbers
        for (let i = 0; i < accounts.length; i++) {
            if (accounts[i].amount >= lowerLimit && accounts[i].amount <= upperLimit) {
            sortedAccounts = accounts;
            }
        }
        return sortedAccounts;
    }

    //Function adds an amount to the account array based on its' name
    async depositToAccount(
        client: Client,  
        accountName: string, 
        amount: number
    ): Promise<Client> {

        //check for negative
        if (amount < 0) {
            throw new InsufficientFundsError("Cannot deposit a negative number!", client.id);
        }
        //iterate through array and check if names match. If they do add the 
        //amount to that account
        for (let i = 0; i < client.account.length; i++) {
            if (client.account[i].name === accountName) {
                
                client.account[i].amount += amount;
            
            }
        }
        //update the db with new account
        const updatedClient = await clientDAOAzure.updateClient(client);
        return updatedClient;     
    }
    
    //Function withdraws an amount from the account array based on its' name
    async withdrawFromAccount(
        client: Client, 
        accountName: string, 
        amount: number
    ): Promise<Client> {
        
        //check for negative
        if (amount < 0) {
             throw new InsufficientFundsError("Cannot withdraw a negative number!", client.id);
        }
        //iterate through array and check if names match. If they do subtract the 
        //amount from that account
        for (let i = 0; i < client.account.length; i++) {
            if (client.account[i].name === accountName) {
                if(client.account[i].amount < amount) {
                    throw new InsufficientFundsError("Insufficient funds!", client.id)
                } else {
                    client.account[i].amount -= amount;
                }         
            }
        }
        const updatedClient = await clientDAOAzure.updateClient(client);
        return updatedClient;
    }
}

export const accountService = new AccountServiceImp(clientDAOAzure);


