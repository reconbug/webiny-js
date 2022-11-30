import { decorate, injectable, Container } from "inversify";
import { IAppModule } from "../../types";

export interface IRouter {
    addRoute(route: IRoute): void;
    getRoutes(): IRoute[];
}

export interface IRoute {
    id: string;
    path: string;
}

export const IRouterSymbol = Symbol.for("IRouter");

class Router implements IRouter {
    private _routes: IRoute[] = [];

    addRoute(route: IRoute) {
        this._routes.push(route);
    }

    getRoutes() {
        return this._routes;
    }
}

decorate(injectable(), Router);

export class RouterModule implements IAppModule {
    init(container: Container) {
        container.bind<IRouter>(IRouterSymbol).to(Router).inSingletonScope();
    }
}
