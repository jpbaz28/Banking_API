/**client_dao.ts
 * Author: Justin Bertrand
 * Description: This class implements the methods to access
 *              and modify an Azure database.
 */

import Client from "../Entities/client";
import { CosmosClient } from "@azure/cosmos";
import { v4 } from "uuid";
import { ResourceNotFoundError } from "../Errors/error-handle";

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
        client.id = v4();
        const response = await this.container.items.create<Client>(client);
        client.account = client.account ?? [];
        const { id, fname, lname, account } = response.resource;
        return { id, fname, lname, account };
    }

    //returns a client from the db by id
    async getClientByID(id: string): Promise<Client> {
        const response = await this.container.item(id, id).read<Client>(); // resource-key, partition-key (the same for most containers)
        if (!response.resource) {
            throw new ResourceNotFoundError(
                `The client with id ${id} was not found`, id);
        }
        return {
            id: response.resource.id,
            fname: response.resource.fname,
            lname: response.resource.lname,
            account: response.resource.account,
        };
    }

    //retrieves all clients from the db
    async getAllClients(): Promise<Client[]> {
        const response = await this.container.items.readAll<Client>().fetchAll();
        return response.resources.map((i) => ({
            id: i.id,
            fname: i.fname,
            lname: i.lname,
            account: i.account,
        }));
    }

    //updates a client
    async updateClient(client: Client): Promise<Client> {
        //inserts client object
        const response = await this.container.items.upsert<Client>(client);
        if (!response.resource) {
            throw new ResourceNotFoundError(
                `The client with id ${client.id} was not found`, client.id);
        }
        return response.resource;
    }

    //deletes a client with an id
    async deleteClientByID(id: string): Promise<boolean> {
        //const client = await this.getClientByID(id);
        const response = await this.container.item(id, id).delete();
        //if(!response.resource){
        //    throw new ResourceNotFoundError(`The client with id ${id} was not found`, id);
        //}
        return true;
    }
}
//exports an instance of a ClientDAO object
export const clientDAOAzure = new ClientDAOAzure();
