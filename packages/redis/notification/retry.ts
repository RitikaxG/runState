// Store retry count inside redis
// notification:retry:<id>

import { client } from "../client";

export const getRetryCount = async ( id : string ) => {
    const val =  await client.get(`notification:retry:${id}`);
    return val ? Number(val) : 0;
}

export const incrementRetry = async ( id : string ) => {
    const count = await client.incr(`notification:retry:${id}`);
    if(count === 1){
        await client.expire(`notification:retry:${id}`,60*60*24);
    }
    return count;
}

export const resetRetry  = async (id : string ) => {
    await client.del(`notification:retry:${id}`);
}