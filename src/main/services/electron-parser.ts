import type { ElectronNote } from "@shared/domain/types";
import { getFileData } from "@shared/utils/path";
import type { WarningCollector } from "@shared/utils/warning";
import { randomUUID } from "node:crypto";
import type { Dirent } from "node:fs";
import { join } from "node:path";
import type { ElectronsDict } from "@shared/schemas/electron";
import { calculateElectronMastery } from "@shared/utils/electron-mastery";

export function electronParse(
    child: Dirent, 
    atomId: string, 
    electronsDict: ElectronsDict|null,
    collector: WarningCollector
):ElectronNote|null{

    const { ext } = getFileData(child.name)
    
    if (ext !== "mdx" && ext !== "md") {
        collector.pushWarning(
            join(child.parentPath, child.name),
                'unexpected-file',
                `Plik "${child.name}" ma nieobsługiwane rozszerzenie .${ext} i został zignorowany.`
            )
        return null;
    }

    const meta = electronsDict?.[child.name]
    const electronID = randomUUID();
    return{
        id: meta?.id ?? electronID,
        atomId: atomId,
        filename: child.name,
        tags: meta?.tags??[],
        covalentAtomIds: meta?.covalentAtomIds ?? [],
        mastery: calculateElectronMastery(meta?.id??electronID),
        createdAt: meta?.createdAt ?? new Date().toISOString(),
        updatedAt: meta?.updatedAt ?? ""
    }
}