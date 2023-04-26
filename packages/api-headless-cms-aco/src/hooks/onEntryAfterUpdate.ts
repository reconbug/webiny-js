import WebinyError from "@webiny/error";
import { CmsEntryRecordData, CmsAcoContext } from "~/types";
import { isAcoModel } from "~/utils/isAcoModel";
import { updateHeadlessCmsRecordPayload } from "~/utils/updateHeadlessCmsRecordPayload";

export const attachOnEntryAfterUpdate = (context: CmsAcoContext): void => {
    context.cms.onEntryAfterUpdate.subscribe(async ({ entry, model }) => {
        if (isAcoModel(model)) {
            return;
        }
        try {
            const payload = await updateHeadlessCmsRecordPayload({
                context,
                model,
                entry
            });
            await context.aco.search.update<CmsEntryRecordData>(entry.entryId, payload);
        } catch (error) {
            throw WebinyError.from(error, {
                message: `Error while executing ACO "onEntryAfterUpdate".`,
                code: "ACO_ENTRY_AFTER_UPDATE_HOOK"
            });
        }
    });
};