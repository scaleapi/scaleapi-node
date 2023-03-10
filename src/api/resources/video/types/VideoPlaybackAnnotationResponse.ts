/**
 * This file was auto-generated by Fern from our API Definition.
 */

import { Scale } from "@fern-api/scale";

export interface VideoPlaybackAnnotationResponse {
    /** The ID of the created task. */
    taskId?: string;
    /** The time the task was created at (in YYYY-MM-DDThh:mm:ss.sTZD format). */
    createdAt?: string;
    /** The task type of the created task. */
    type?: string;
    /** The status of the task, either `pending`, `completed`, `canceled` or `error`. */
    status?: string;
    /** The instruction specified in the request. */
    instruction?: string;
    /** Whether the task is a test task. */
    isTest?: boolean;
    urgency?: string;
    /** The metadata specified in the request. */
    metadata?: Record<string, unknown>;
    /** The [project](/reference/project-overview) that this task is created in. */
    project?: string;
    /** The full url (including the scheme `http://` or `https://`) or email address of the [callback](/reference/callbacks) that will be used when the task is completed. */
    callbackUrl?: string;
    updatedAt?: string;
    workStarted?: boolean;
    params?: Scale.VideoPlaybackParams;
}
