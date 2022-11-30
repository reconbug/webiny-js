import { Container } from "inversify";
import { IAppModule } from "../../types";
import { IRouter, IRouterSymbol } from "../Router";

export class FileManagerModule implements IAppModule {
    init(container: Container) {
        console.group("FileManager", container);

        // Register routes
        const router = container.get<IRouter>(IRouterSymbol);
        router.addRoute({
            id: "dashboard",
            path: "/"
        });

        router.addRoute({
            id: "fm.list",
            path: "/files"
        });

        // Register navigation
        // Register new dependencies
        // Modify/Configure existing dependencies


        console.groupEnd();
    }
}
