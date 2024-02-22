import { join } from "desm";
import type { Assignment } from "@/entities/assignment.js";
import { BsonFileManager } from "./bsonFile.js";

export const assignmentManager = new BsonFileManager<Assignment>(
    join(import.meta.url, "..", "databases"),
    "assignments"
);

