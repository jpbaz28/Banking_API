import  Express  from "express";
import ClientDAO, { clientDAOAzure } from "./daos/client_dao";
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
        errorHandler(error, req, res);
    }
});

//Get client by ID
app.get('/clients/:id', async (req, res) => {
    try{
        const {id} = req.params;
        const client: Client = await accountService.retrieveClientById(id);
        res.send(client);
    } catch (error) {
        errorHandler(error, req, res);
    }
});

//Gets all accounts for a client from ID
app.get('/clients/:id/accounts', async (req, res) => {
    //Get the id from the URI
    try {
    const {id} = req.params;   
    const client: Client = await accountService.retrieveClientById(id);
    res.send(client.account);
    } catch (error) {
        errorHandler(error, req, res);
    }
});

//Get accounts for client in a certain range based on amount
// that the account should be greater than and amount the account 
// should be less than
app.get('/clients/:id/accounts/:greaterThan/:lessThan', async (req, res) => {
    //Get variables from params in URI
    const id = req.params.id;
    const greaterThan = parseInt(req.params.greaterThan);
    const lessThan = parseInt(req.params.lessThan);
    
    //first find the client
    const client: Client = await accountService.retrieveClientById(id);
    //then make a list of accounts that are between the given amounts
    const account: Account[] = await accountService.getAccountsByBalance(client, greaterThan, lessThan);
    res.send(account);
});

//Add a new Client
app.post('/clients', async (req, res) => {
    try {
        let client: Client = req.body;
        client = await accountService.addClient(client);
        res.status(201).send(client);      
    } catch (error) {
        errorHandler(error, req, res);
    }
});

//Adds an account to existing client with JSON object in body of the request
app.post('/clients/:id/accounts', async (req, res) => {
    try {
        const account: Account = req.body;
        await accountService.addAccountToClient(req.params.id, account);
        res.sendStatus(201);
    } catch (error) {
        errorHandler(error, req, res);
    }
 });

//JSON replacement of object
//Update a client
app.put('/clients/:id', async (req, res) => {
    try {
        const client: Client = req.body;
        const updatedClient: Client = await clientDAOAzure.updateClient(client);
        res.send(`Update was successful for: ${updatedClient.id}`);
    } catch (error) {
        errorHandler(error, req, res);
    }
});

//Delete a client
app.delete('/clients/:id', async (req, res) => {
    try {
        const deletedClient: boolean = await clientDAOAzure.deleteClientByID(req.params.id);
        res.status(205).send(`Deleted the client with id: ${req.params.id}`);
    } catch (error) {
        errorHandler(error, req, res);
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
        errorHandler(error, req, res);
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
    res.send(`Client with ID of ${id} withdrew ${amount} from their ${accountName} account`);
    } catch (error) {
        errorHandler(error, req, res);
    }
});



//Starts Express server on port 3000
app.listen(3000, () => console.log("Application Started!"));