/**
 * This file was auto-generated by Fern from our API Definition.
 */

import { Scale } from "@fern-api/scale";

export interface BatchList {
    docs?: Scale.Batch[];
    total?: number;
    limit?: number;
    offset?: number;
    hasMore?: boolean;
}
