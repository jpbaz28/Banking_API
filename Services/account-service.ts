import ClientDAO from "../daos/client_dao";
import { clientDAOAzure } from "../daos/client_dao";
import Account from "../Entities/account";
import Client from "../Entities/client";

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

    async addAccountToClient(clientId: string, account: Account): Promise<Client> {
        const client: Client = await this.clientDAO.getClientByID(clientId);
        client.account.push(account);
        await this.clientDAO.updateClient(client);
        return client;
    }

    async addClient(client: Client): Promise<Client> {
        client.account = client.account ?? [];
        client = await this.clientDAO.createClient(client);
        return client;
    }

    async retrieveClientById(clientId: string): Promise<Client> {
        return this.clientDAO.getClientByID(clientId);
    }

    async retrieveAllClients(): Promise<Client[]> {
        return this.clientDAO.getAllClients();
    }

    async getAccountsByBalance(
        client: Client,
        greaterThan: number,
        lessThan: number
    ): Promise<Account[]> {

        const accounts: Account[] = client.account;
        let sortedAccounts: Account[];
        for (let i = 0; i < accounts.length; i++) {
            if (accounts[i].amount >= greaterThan && accounts[i].amount <= lessThan) {
            sortedAccounts = accounts;
            }
        }
        return sortedAccounts;
    }
    async depositToAccount(
        client: Client,  
        accountName: string, 
        amount: number
    ): Promise<Client> {
        for (let i = 0; i < client.account.length; i++) {
            if (client.account[i].name === accountName) {
                
                client.account[i].amount += amount;
            
            }
        }
        const updatedClient = await clientDAOAzure.updateClient(client);
        return updatedClient;
        
    }
    
    async withdrawFromAccount(
        client: Client, 
        accountName: string, 
        amount: number
    ): Promise<Client> {
        for (let i = 0; i < client.account.length; i++) {
            if (client.account[i].name === accountName) {
                
                client.account[i].amount -= amount;
            
            }
        }
        const updatedClient = await clientDAOAzure.updateClient(client);
        return updatedClient;
    }
}


