import { useUIActions, useUIStore } from "@renderer/store/uiStore";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AtomContextMenu } from "./atoms/AtomContextMenu";
import { ElectronContextMenu } from "./atoms/ElectronContextMenu";

export const GlobalContextMenu=()=>{
    const menu = useUIStore(state=> state.contextMenu);
    const {closeContextMenu} = useUIActions();

    const menuRef = useRef<HTMLDivElement>(null);
    useEffect(()=>{
        if (!menu) return;

        const handlePointerDown = (e: PointerEvent)=>{
            if(menuRef.current&&!menuRef.current.contains(e.target as Node)){
                closeContextMenu();
            }
        };

        const handleEscape = (e: KeyboardEvent)=>{
            if(e.key === 'Escape'){
                closeContextMenu();
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleEscape);

        return ()=>{
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleEscape);
        }
    }, [menu, closeContextMenu]);
    if (!menu) return null;

    return createPortal(
        <div
            ref={menuRef}
            role="menu"
            style={{
                position: "fixed",
                top: menu.y,
                left: menu.x,
                zIndex: 9999
            }}
        >
            {menu.target.type === "atom" ? (
                <AtomContextMenu atomId={menu.target.atomId} />
            ) : (
                <ElectronContextMenu
                    atomId={menu.target.atomId}
                    electronId={menu.target.electronId}
                />
            )}
        </div>,
        document.body
    )
}