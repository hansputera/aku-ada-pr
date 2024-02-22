import dayjs from "dayjs";
import { timeDeadlineManager } from "@/managers/timeDeadline.js";

export const goDeadline = async (key: string): Promise<void> => {
    const timeDeadline = await timeDeadlineManager.get(key);

    if (timeDeadline) {
        const diffTimeWithLastHit = dayjs(timeDeadline.deadline).diff(timeDeadline.lastHitTime);
        console.log(`Deadline ${key} hit, diff time: ${diffTimeWithLastHit}`);
    }

    await timeDeadlineManager.delete(key);
};
