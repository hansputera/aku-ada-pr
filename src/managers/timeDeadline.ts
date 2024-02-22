import { clearInterval, setInterval } from "node:timers";
import dayjs from "dayjs";
import { join } from "desm";
import { goDeadline } from "@/callbacks/goDeadline.js";
import type { TimeDeadline } from "@/entities/timeDeadline.js";
import { BsonFileManager } from "./bsonFile.js";

export const timeDeadlineManager = new BsonFileManager<TimeDeadline>(
    join(import.meta.url, "..", "databases"),
    "time_deadline"
);

export const timeDeadlineRunner = new class TimeDeadlineRunner {
    #deadlines = new Map<string, number>();
    #runner?: NodeJS.Timeout;

    public push(key: string, deadline: number): void {
        if (this.#deadlines.has(key)) {
            return;
        }

        this.#deadlines.set(key, deadline);
    }

    #call(key: string): void {
        void goDeadline(key);
    }

    public init(): void {
        if (this.#runner) {
            clearInterval(this.#runner);
        }

        this.#runner = setInterval(async () => {
            const deadlines = [...this.#deadlines.entries()];

            const hitDeadlines = deadlines.filter(deadline => dayjs(deadline[1]).isBefore());
            if (hitDeadlines.length > 0) {
                for (const hitDeadline of hitDeadlines) {
                    this.#call(hitDeadline[0]);
                }
            }

            const unhitDeadlines = deadlines.filter(deadline => !hitDeadlines.includes(deadline));
            await Promise.all(unhitDeadlines.map(async deadline => timeDeadlineManager.set(deadline[0], {
                deadline: deadline[1],
                key: deadline[0],
                lastHitTime: Date.now()
            })));
        }, 3_000);
    }
}();
