import type { Document } from "bson";
import dayjs from "dayjs";

export type AssignmentType = "individual" | "kelompok";
export type AssignmentInput = {
    title: string;
    deadline: Date;
    description?: string;
    type: AssignmentType;
    members: string[];
};

export enum AssignmentTypeAsEnum {
    Individual = "individual",
    Kelompok = "kelompok"
}

export class Assignment implements Document {
    public title!: string;
    public deadline!: Date;
    public description?: string;
    public type!: AssignmentType;
    public members: string[] = [];
    public estimateCompleted!: string;
    public hitDeadline = false;
    public isCompleted = false;
    public createdAt = Date.now();

    public constructor(data: AssignmentInput) {
        this.title = data.title.trim();
        this.deadline = data.deadline;
        this.type = data.type;
        this.members = data.members;

        this.estimateCompleted = dayjs(this.deadline).isSame(new Date()) ? "00 days, 00 hours, 00 mins" : dayjs(this.deadline).subtract(Date.now()).format("DD [days], HH [hours], mm [minutes]");

        this.hitDeadline = dayjs(this.deadline).isBefore(new Date());
    }
}
