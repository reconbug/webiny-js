import { Container } from "inversify";

export interface IWebiny {
    addModule(appModule: IAppModule): void;
    init(): void;
}

export interface IAppModule {
    init(container: Container): void;
}
