import {clientDAOAzure} from "../daos/client_dao";
import { AccountService, AccountServiceImp } from "../Services/account-service";
import ClientDAO from "../daos/client_dao";
import Client from "../Entities/client";
import Account from "../Entities/account";
import { ResourceNotFoundError } from "../Errors/error-handle";

const clientDao: ClientDAO = clientDAOAzure;


let testId: string = null;

describe('Client DAO Specs', () => {

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

    it("should update a client", async () => {
        const account: Account = {name:'Checking',amount:5000};
        let client: Client = {id:testId,fname:'Sonny',lname:'Bono', account:[account]};
        await clientDao.updateClient(client);
        client = await clientDao.getClientByID(testId);
        expect(client.account.length).toBe(1);
        expect(client.fname).toBe('Sonny');
    })

    it("should delete a client", async () => {
        const response: boolean = await clientDao.deleteClientByID(testId);
        //const client: Client = await clientDao.getClientByID(testId);
        
        //expect(clientDao.getClientByID).toThrowError();
        expect(response).toBe(true);
    })

})

// describe('account-service specs', () => {
//     it("should add an account to a client", async () => {
//         let client: Client = {id:'',fname:'Mr.',lname:'T.',account:[]};
//         client = await clientDao.createClient(client);
//         const account: Account = {name:'Checking', amount:30000};
//         testId = client.id;

//     })
// })