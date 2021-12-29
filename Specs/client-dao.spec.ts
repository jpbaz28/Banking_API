/* client-dao.spec.ts
 * Author: Justin Bertrand
 * Description: This spec defines the unit
 *              tests for jest
 */

import {clientDAOAzure} from "../daos/client_dao";
import { accountService } from "../Services/account-service";
import ClientDAO from "../daos/client_dao";
import Client from "../Entities/client";
import Account from "../Entities/account";



const clientDao: ClientDAO = clientDAOAzure;

// Test variables
let testId: string = null;
let testAccount: Account = null;

describe('Client DAO and Account Service Specs', () => {

    it('should create a client', async () => {
        let client: Client = {id:'',fname:'Mr.',lname:'T.',account:[]};
        client = await clientDao.createClient(client);
        expect(client.id).not.toBe('');
        testId = client.id;
    })

    it('should get a client by ID', async () => {
        const client: Client = await clientDao.getClientByID(testId);
        expect(client.fname).toBe('Mr.');
    })

    it('should get all clients', async () => {
        const client: Client[] = await clientDao.getAllClients();
        expect(client[0].id).not.toBe('');
    })

    it("should add an account to a client", async () => {
        testAccount = {"name":"Savings","amount":50000};
        const client: Client = await accountService.addAccountToClient(testId, testAccount);
        expect(client.account[0].name).toBe("Savings");
    })

    it("should get a client account by account balance", async () => {
        const greaterThan: number = 0;
        const lessThan: number = 100000;
        const client: Client = await clientDao.getClientByID(testId);
        const account: Account[] = await accountService.getAccountsByBalance(client, greaterThan, lessThan);
        for(let i = 0; i < account.length; i++) {
            expect(account[i].amount).toBeGreaterThanOrEqual(greaterThan);
            expect(account[i].amount).toBeLessThanOrEqual(lessThan);
        }       
    })

    it("should deposit to a customer's account", async () => {
        const client: Client = await clientDao.getClientByID(testId);
        const accountName: string = client.account[0].name;
        const amount: number = 5000;
        const afterDeposit: Client = await accountService.depositToAccount(client, accountName, amount);
        expect(client.account[0].amount).toBe(55000);
    })

    it("should withdraw to a customer's account", async () => {
        const client: Client = await clientDao.getClientByID(testId);
        const accountName: string = client.account[0].name;
        const amount: number = 5000;
        const afterDeposit: Client = await accountService.withdrawFromAccount(client, accountName, amount);
        expect(client.account[0].amount).toBe(50000);
    })


    it("should update a client", async () => {
        const account: Account = {name:'Checking',amount:5000};
        let client: Client = {id:testId,fname:'Sonny',lname:'Bono', account:[account]};
        await clientDao.updateClient(client);
        client = await clientDao.getClientByID(testId);
        expect(client.account.length).toBe(1);
        expect(client.fname).toBe('Sonny');
    })

    it("should delete a client", async () => {
        const client: boolean = await clientDao.deleteClientByID(testId);
        expect(client).toBeTruthy();
    })

})

