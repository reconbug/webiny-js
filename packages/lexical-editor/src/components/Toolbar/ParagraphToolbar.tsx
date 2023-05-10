import React from "react";
import { Toolbar } from "~/components/Toolbar/Toolbar";

interface ParagraphToolbarProps {
    anchorElem?: HTMLElement;
}

/**
 * Toolbar with actions for rich text editing specific for the paragraph element <p>.
 * @param anchorElem
 * @constructor
 */
export const ParagraphToolbar: React.VFC<ParagraphToolbarProps> = ({
    anchorElem = document.body
}) => {
    return <Toolbar type={"paragraph"} anchorElem={anchorElem} />;
};
