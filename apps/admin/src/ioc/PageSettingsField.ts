import { decorate, injectable } from "inversify";

export interface IPageSettingsField {
    name: string;
}

export const IPageSettingsFieldSymbol = Symbol.for("IPageSettingsField");

class PageSettingsField implements IPageSettingsField {
    private _name: string;

    constructor(name: string) {
        this._name = name;
    }

    get name() {
        return this._name;
    }
}

decorate(injectable(), PageSettingsField);

export { PageSettingsField };
