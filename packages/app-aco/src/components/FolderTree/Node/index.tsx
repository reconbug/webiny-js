import React from "react";
import { ReactComponent as ArrowRight } from "@material-symbols/svg-400/rounded/arrow_right.svg";
import { ReactComponent as Folder } from "@material-symbols/svg-400/rounded/folder-fill.svg";
import { ReactComponent as FolderOpen } from "@material-symbols/svg-400/rounded/folder_open-fill.svg";
import { NodeModel, useDragOver } from "@minoru/react-dnd-treeview";

import { MenuActions } from "../MenuActions";

import { Container, ArrowIcon, FolderIcon, Text, Content } from "./styled";

import { DndItemData } from "~/types";

type NodeProps = {
    node: NodeModel<DndItemData>;
    depth: number;
    isOpen: boolean;
    enableActions?: boolean;
    onToggle: (id: NodeModel<DndItemData>["id"]) => void;
    onClick: (data: NodeModel<DndItemData>["data"]) => void;
    onUpdateFolder: (data: NodeModel<DndItemData>["data"]) => void;
    onDeleteFolder: (data: NodeModel<DndItemData>["data"]) => void;
};

type FolderProps = {
    text: string;
    isOpen: boolean;
    isFocused?: boolean;
};

export const FolderNode: React.VFC<FolderProps> = ({ isOpen, isFocused, text }) => {
    return (
        <>
            <FolderIcon>{isOpen ? <FolderOpen /> : <Folder />}</FolderIcon>
            <Text className={isFocused ? "focused" : ""} use={"body2"}>
                {text}
            </Text>
        </>
    );
};

export const Node: React.VFC<NodeProps> = ({
    node,
    depth,
    isOpen,
    enableActions,
    onToggle,
    onClick,
    onUpdateFolder,
    onDeleteFolder
}) => {
    // Move the placeholder line to the left based on the element depth within the tree.
    // Let's add some pixels so that the element is detached from the container but takes up the whole length while it's highlighted during dnd.
    const indent = depth * 24 + 8;

    const dragOverProps = useDragOver(node.id, isOpen, onToggle);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggle(node.id);
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick(node.data);
        onToggle(node.id);
    };

    return (
        <Container
            isFocused={!!node.data?.isFocused}
            style={{ paddingInlineStart: indent }}
            {...dragOverProps}
        >
            <ArrowIcon isOpen={isOpen} onClick={handleToggle}>
                <ArrowRight />
            </ArrowIcon>
            <Content onClick={handleClick}>
                <FolderNode text={node.text} isOpen={isOpen} isFocused={!!node.data?.isFocused} />
            </Content>
            {node.data && enableActions && (
                <MenuActions
                    folder={node.data}
                    onUpdateFolder={onUpdateFolder}
                    onDeleteFolder={onDeleteFolder}
                />
            )}
        </Container>
    );
};
