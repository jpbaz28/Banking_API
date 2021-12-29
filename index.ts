/* index.ts
 * Author: Justin Bertrand
 * Description: This is the main entry point for the 
 *              REST API. Here I define the routes for
 *              the express server.
 */


import  Express  from "express";
import { clientDAOAzure } from "./daos/client_dao";
import Client from "./Entities/client";
import Account from "./Entities/account";
import errorHandler, { ResourceNotFoundError } from "./Errors/error-handle";
import { AccountService, AccountServiceImp } from "./Services/account-service";


const app = Express();
app.use(Express.json());

//Uses dependency injection constructor in Account service
const accountService: AccountService = new AccountServiceImp(clientDAOAzure);

//Get all clients
app.get('/clients', async (req, res) => {
    try {
        const clients: Client[] = await accountService.retrieveAllClients();
        res.status(200).send(clients);
    } catch (error) {
        errorHandler(error, res);
    }
});

//Get client by ID
app.get('/clients/:id', async (req, res) => {
    try{
        const {id} = req.params;
        const client: Client = await accountService.retrieveClientById(id);
        res.send(client);
    } catch (error) {
        errorHandler(error, res);
    }
});

//Gets all accounts for a client from ID. This also takes optional query parameters
app.get('/clients/:id/accounts', async (req, res) => {
    //Get the id from the URI and query
    try {
    const {id}:{id: string} = req.params;

    const greaterThan: number = parseInt(req.query.amountGreaterThan as string, 10);
    const lessThan: number = parseInt(req.query.amountLessThan as string, 10);

    const client: Client = await accountService.retrieveClientById(id);
    
    if(req.query.amountGreaterThan && req.query.amountLessThan) {
        const account: Account[] = await accountService.getAccountsByBalance(client, greaterThan, lessThan)
        res.send(account);
    } else {
        res.send(client.account);
    }
    } catch (error) {
        errorHandler(error, res);
    }
});

//Add a new Client
app.post('/clients', async (req, res) => {
    try {
        let client: Client = req.body;
        client = await accountService.addClient(client);
        res.status(201).send(client);      
    } catch (error) {
        errorHandler(error, res);
    }
});

//Adds an account to existing client with JSON object in body of the request
app.post('/clients/:id/accounts', async (req, res) => {
    try {
        const account: Account = req.body;
        await accountService.addAccountToClient(req.params.id, account);
        res.sendStatus(201);
    } catch (error) {
        errorHandler(error, res);
    }
 });

//JSON replacement of object
//Update a client
app.put('/clients/:id', async (req, res) => {
    try {
        const editedClient: Client = req.body;
        const updatedClient: Client = await clientDAOAzure.updateClient(editedClient);
        res.send(`Update was successful for: ${updatedClient.id}`);
        
    } catch (error) {
       errorHandler(error, res);
    }
});

//Delete a client
app.delete('/clients/:id', async (req, res) => {
    try {
        const deletedClient: boolean = await clientDAOAzure.deleteClientByID(req.params.id);
        if(!deletedClient) {
            throw new ResourceNotFoundError(`The client with id ${req.params.id} could not be found to be deleted`, req.params.id);
        }
        res.status(205).send(`Deleted the client with id: ${req.params.id}`);      
    } catch (error) {
        errorHandler(error, res);
    }
});

//Client deposits to account with a JSON object in body of HTTP request: ex: {"amount":3000}
app.patch('/clients/:id/accounts/:accountName/deposit', async (req, res) => {
    //get variables from params in the URI
    const accountName: string = req.params.accountName;
    const {amount}:{amount:number} = req.body;
    const id = req.params.id;

    try{
    //Get client from ID
    let client = await accountService.retrieveClientById(id);
    //deposits client's account if names on account are matching
    client = await accountService.depositToAccount(client, accountName, amount);

    //send results in response
    res.send(`Client with ID of ${id} deposited ${amount} to their ${accountName} account`);
    } catch (error) {
        errorHandler(error, res);
    }
});

//Client withdraws from account with a JSON object in body of HTTP request: ex: {"amount":3000}
app.patch('/clients/:id/accounts/:accountName/withdraw', async (req, res) => {
    //get variables from params in the URI
    const accountName: string = req.params.accountName;
    const {amount}:{amount:number} = req.body;
    const id = req.params.id;

    try {
    //Get client from ID
    let client = await accountService.retrieveClientById(id);
    //withdraws from client's account if names on account are matching
    client = await accountService.withdrawFromAccount(client, accountName, amount);

    //send results in response
    res.status(200).send(`Client with ID of ${id} withdrew ${amount} from their ${accountName} account`);
    } catch (error) {
        errorHandler(error, res);
    }
});

//Starts Express server on port 3000
app.listen(3000, () => console.log("Application Started!"));