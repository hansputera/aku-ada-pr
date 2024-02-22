import avvio from "avvio";
import { bootManagers } from "./boots/bootManagers.js";
import { bootRest } from "./boots/bootRest.js";

const asyncBoot = avvio();

asyncBoot.use(bootManagers)
    .use(bootRest)
    // eslint-disable-next-line promise/prefer-await-to-callbacks
    .ready(err => {
        if (err) {
            console.error("application err:", err);
        }

        console.log("application booted");
    });

asyncBoot.on("preReady", () => {
    console.log(asyncBoot.prettyPrint());
});

asyncBoot.start();
