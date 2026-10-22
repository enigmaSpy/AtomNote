import { useWorldlineActions, useWorldlineStore } from "@renderer/store/worldlineStore";

import type { AtomView } from "@shared/domain/types";
import {useEffect,useRef, useState, type KeyboardEvent} from "react";

interface AtomNameEditorProps {
    atom: AtomView;
    onClose: () => void;
}

export const AtomNameEditor = ({
    atom,
    onClose
}: AtomNameEditorProps) => {
    const [atomName, setAtomName] = useState(atom.name);
    const [isSaving, setIsSaving] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    const { renameAtom } = useWorldlineActions();
    const renameError = useWorldlineStore(state => state.error);

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    const handleSubmit = async () => {
        if (isSaving) return;

        const trimmed = atomName.trim();

        if (!trimmed || trimmed === atom.name) {
            onClose();
            return;
        }

        setIsSaving(true);

        renameAtom(atom.meta.id, trimmed);
        onClose();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            void handleSubmit();
        }

        if (e.key === "Escape") {
            onClose();
        }
    };

    return (
        <div>
            {renameError && (
                <span>Błąd nazwy: {renameError}</span>
            )}

            <input
                ref={inputRef}
                type="text"
                value={atomName}
                onChange={e => setAtomName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={onClose}
                disabled={isSaving}
                style={{ width: "100px" }}
            />
        </div>
    );
};
