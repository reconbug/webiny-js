import { Response, ErrorResponse } from "@webiny/handler-graphql";

export const resolve = async (fn: () => Promise<any>) => {
    try {
        return new Response(await fn());
    } catch (e) {
        return new ErrorResponse(e);
    }
};
