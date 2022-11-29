import { decorate, injectable } from "inversify";
import { container } from "@webiny/app";
import { IPageSettingsField, IPageSettingsFieldSymbol } from "./PageSettingsField";

export interface IPageSettings {
    addField(field: IPageSettingsField): void;
}

export const IPageSettingsSymbol = Symbol.for("IPageSettings");

class PageSettings implements IPageSettings {
    fields: IPageSettingsField[] = [];

    constructor() {
        this.fields = container.getAll<IPageSettingsField>(IPageSettingsFieldSymbol);
    }

    addField(field: IPageSettingsField) {
        this.fields.push(field);
    }

    getFields() {
        return this.fields;
    }
}

decorate(injectable(), PageSettings);

export { PageSettings };
