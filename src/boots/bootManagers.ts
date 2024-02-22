import { assignmentManager } from "@/managers/assigment.js";
import { timeDeadlineManager, timeDeadlineRunner } from "@/managers/timeDeadline.js";

export const bootManagers = async (): Promise<void> => {
    await assignmentManager.init();
    await timeDeadlineManager.init();
    timeDeadlineRunner.init();

    // start timeDeadline manager
    {
        const assignmentKeys = await assignmentManager.keys("*");
        const assignments = await assignmentManager.fetch(...assignmentKeys);

        for (const [index, assignment] of assignments.entries()) {
            if (assignment.isCompleted) {
                return;
            }

            timeDeadlineRunner.push(assignmentKeys[index], assignment.deadline.getMilliseconds());
        }
    }
};
