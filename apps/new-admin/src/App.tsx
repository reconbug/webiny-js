import React, { useEffect } from "react";
import { container } from "@webiny/app";
import { Container } from "inversify";
import { IAppModule, IWebiny } from "./types";
import {IRouter, IRouterSymbol, RouterModule} from "./modules/Router";
import { FileManagerModule } from "./modules/FileManager";

/**
 * ===== WEBINY APP =====
 */
class Webiny implements IWebiny {
    private _modules: IAppModule[] = [];
    private _container: Container = container;

    constructor() {
        this.addModule(new RouterModule());
    }

    addModule(appModule: IAppModule) {
        this._modules.push(appModule);
    }

    init() {
        console.log("Init Webiny");
        this._modules.forEach(appModule => appModule.init(this._container));

        // Debug output
        const router = container.get<IRouter>(IRouterSymbol);
        console.log(router.getRoutes());
    }
}

/**
 * ===== APP BOOTSTRAP =====
 */
const app = new Webiny();
app.addModule(new FileManagerModule());

/**
 * ===== APP RENDERING =====
 */

interface WebinyComponentProps {
    app: IWebiny;
}

const WebinyComponent = ({ app }: WebinyComponentProps) => {
    useEffect(() => {
        // TODO: to be revisited, irrelevant at this point.
        app.init();
    }, []);
    return null;
};

export const App: React.FC = () => {
    return <WebinyComponent app={app} />;
};
