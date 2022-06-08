import express from "express";
import { startBrowser } from "./browser.js";
import { prepare, uploadResults } from "./results.js";
import { captureUrl } from "./screenshot.js";

const app = express();
app.use(express.json());

app.post("/screenshot", async (req, res, next) => {
    try {
        const urls: string[] = req.body;

        await prepare();
        const [browser, extWorker] = await startBrowser();

        for (const url of urls) {
            await captureUrl(browser, extWorker, url);
        }

        await browser.close();
        await uploadResults();

        res.send("ok");
    } catch (err) {
        next(err);
    }
});

// @ts-ignore
const port = parseInt(process.env.PORT) || 8080;
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
