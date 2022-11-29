import { Container } from "inversify";

const container = new Container({
    autoBindInjectable: true,
    defaultScope: "Transient"
});

// myContainer.bind<Warrior>(TYPES.Warrior).to(Ninja);
// myContainer.bind<Weapon>(TYPES.Weapon).to(Katana);
// myContainer.bind<ThrowableWeapon>(TYPES.ThrowableWeapon).to(Shuriken);


export { container };
