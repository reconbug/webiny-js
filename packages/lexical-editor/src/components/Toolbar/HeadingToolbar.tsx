import React from "react";
import { Toolbar } from "~/components/Toolbar/Toolbar";

interface HeadingToolbarProps {
    anchorElem?: HTMLElement;
}

/**
 * Toolbar with actions specific for the heading elements from H1-H6.
 * @param anchorElem
 * @constructor
 */
export const HeadingToolbar: React.VFC<HeadingToolbarProps> = ({ anchorElem = document.body }) => {
    return <Toolbar type={"heading"} anchorElem={anchorElem} />;
};
