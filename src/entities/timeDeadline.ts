import type { Document } from "bson";
import dayjs from "dayjs";

export type TimeDeadlineInput = {
    deadlineKey: string;

    // last changed time interval in ms
    lastHitTime?: number;
    deadline: number;
};

export class TimeDeadline implements Document {
    public key!: string;
    public lastHitTime!: number;
    public deadline!: number;

    public constructor(data: TimeDeadlineInput) {
        this.key = data.deadlineKey;
        this.lastHitTime = data.lastHitTime ?? 0;

        if (dayjs(data.deadline).isBefore(new Date())) {
            throw new Error("Couldn't add this item to TimeDeadline");
        }

        this.deadline = data.deadline;
    }
}
