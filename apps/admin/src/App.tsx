import React, { useEffect } from "react";
import { container } from "@webiny/app";
import { IPageSettingsSymbol, IPageSettings, PageSettings } from "./ioc/PageSettings";
import {
    IPageSettingsFieldSymbol,
    IPageSettingsField,
    PageSettingsField
} from "./ioc/PageSettingsField";

// @ts-ignore
window["ioc"] = container;

container.bind(IPageSettingsSymbol).to(PageSettings);

container
    .bind<IPageSettingsField>(IPageSettingsFieldSymbol)
    .toDynamicValue(() => new PageSettingsField("Field #1"));

container
    .bind<IPageSettingsField>(IPageSettingsFieldSymbol)
    .toDynamicValue(() => new PageSettingsField("Field #2"));

container.onActivation(IPageSettingsSymbol, (_, pageSettings: IPageSettings) => {
    console.log("PageSettings onActivate");
    pageSettings.addField(new PageSettingsField("Custom Field #1"));
    return pageSettings;
});

export const App: React.FC = () => {
    useEffect(() => {
        const pageSettings = container.get<IPageSettings>(IPageSettingsSymbol);
        console.log(pageSettings);
    }, []);

    return null;
};
