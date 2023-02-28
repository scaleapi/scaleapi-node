import { parse } from "basic-auth";
import { Base64 } from "js-base64";

/**
 * this file is modified from the default to work with Scale's authentication
 * scheme: basic auth, where the username is the API key and the password is "".
 */

export type BearerToken = string;

export const BearerToken = {
    toAuthorizationHeader: (apiKey: BearerToken | undefined): string | undefined => {
        if (apiKey == null) {
            return undefined;
        }
        const token = Base64.encode(`${apiKey}:`);
        return `Basic ${token}`;
    },
    fromAuthorizationHeader: (header: string): BearerToken => {
        const parsed = parse(header);
        if (parsed == null) {
            throw new Error("Invalid basic auth");
        }
        return parsed.name;
    },
};
