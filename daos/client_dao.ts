/* client_dao.ts
 * Author: Justin Bertrand
 * Description: This class implements the methods to access
 *              and modify an Azure database.
 */

import Client from "../Entities/client";
import { CosmosClient, ItemResponse, Resource } from "@azure/cosmos";
import { v4 } from "uuid";
import { ResourceNotFoundError } from "../Errors/error-handle";
import { accountService } from "../Services/account-service";


//Interfaces make code more portable and easier to reuse
//Contains the declarations and type specifications for the class.
export default interface ClientDAO {
    //create a client
    createClient(client: Client): Promise<Client>;
    //read clients
    getClientByID(id: string): Promise<Client>;
    getAllClients(): Promise<Client[]>;
    //update a client
    updateClient(client: Client): Promise<Client>;
    //delete a client
    deleteClientByID(id: string): Promise<boolean>;
}

//Implements the interface from above
class ClientDAOAzure implements ClientDAO {
    private cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION);
    private database = this.cosmosClient.database("BankingAPI-db");
    public container = this.database.container("Clients");

    //creates a new database entry with a client object
    async createClient(client: Client): Promise<Client> {
        //Uses uuid for random string
        client.id = v4();
        //Creates a new client item on our DB container
        const response = await this.container.items.create<Client>(client);
        //If no client account is sent here assign an empty array for now
        client.account = client.account ?? [];
        const { id, fname, lname, account } = response.resource;
        return { id, fname, lname, account };
    }

    //returns a client from the db by id
    async getClientByID(clientId: string): Promise<Client> {
        // reads one item based on clientID as resource-key and partition-key (the same for most containers)
        const client = await this.container.item(clientId, clientId).read<Client>(); 
        if (!client.resource) {
           throw new ResourceNotFoundError(
               `The client with id ${clientId} was not found`, clientId);
        }
        const { id, fname, lname, account } = client.resource;
        return { id, fname, lname, account };
    }

    //retrieves all clients from the db
    async getAllClients(): Promise<Client[]> {
        // Read all reads all items in container and fetchall returns a single feed response based on the query
        const clients = await this.container.items.readAll<Client>().fetchAll();
        return clients.resources.map((i) => ({
            id: i.id,
            fname: i.fname,
            lname: i.lname,
            account: i.account,
        }));
    }

    //updates a client
    async updateClient(client: Client): Promise<Client> {
        //inserts client object
        const updatedClient = await this.container.items.upsert<Client>(client);
        if (!updatedClient.resource) {
            throw new ResourceNotFoundError(
                `The client with id ${client.id} was not found`, client.id);
        }
        return updatedClient.resource;
    }

    //deletes a client with an id
    async deleteClientByID(id: string): Promise<boolean> {
        const response = await this.container.item(id, id).delete();
        return true;
    }
}
//exports an instance of a ClientDAO object
export const clientDAOAzure = new ClientDAOAzure();
