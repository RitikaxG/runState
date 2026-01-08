/*
AppError is a normal JS error + extra metadata for HTTP & production handling
    Now you app knows , 
    - What message to send
    - What HTTP Status code to use
    - Whether the error is expected or not
*/
export class AppError extends Error {
    // Assigning custom fields to error opject
    statusCode : number;
    isOperational : boolean; // is error expected ? ( bad input, auth fail) or not ( bugs, DB crash )

    constructor(message : string, statusCode : number ){
        super(message)
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}