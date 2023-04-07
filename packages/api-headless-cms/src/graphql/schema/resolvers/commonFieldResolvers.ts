import { CmsEntry } from "~/types";
import { parseIdentifier } from "@webiny/utils";

export const commonFieldResolvers = () => ({
    id: (entry: CmsEntry) => entry.id || null,
    entryId: (entry: CmsEntry) => {
        if (entry.entryId) {
            return entry.entryId;
        }
        const { id: entryId } = parseIdentifier(entry.id);
        return entryId;
    },
    createdBy: (entry: CmsEntry) => entry.createdBy || null,
    ownedBy: (entry: CmsEntry) => entry.ownedBy || null,
    modifiedBy: (entry: CmsEntry) => entry.modifiedBy || null
});
