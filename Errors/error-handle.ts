/* error-handle.ts
 * Author: Justin Bertrand
 * Description: This class implements class for ResourceNotFoundError.
 *              Also defines a simple error handling function.
 * 
 */

import { Request, Response } from "express";

export default function errorHandler(error: Error, res: Response) {
    if (error instanceof ResourceNotFoundError) {
        res.status(404);
        res.send(error.message);
    }
    if (error instanceof InsufficientFundsError) {
        res.status(402);
        res.send(error.message);
    } else {
        console.trace(error);
        res.status(500);
        res.send("An unknown error occured.");
    }
}

export class ResourceNotFoundError extends Error {
    constructor(message: string, resourceID: string) {
        super(message);
    }
}

export class InsufficientFundsError extends Error {
    constructor(message: string, resourceID: string) {
        super(message);
    }
}
