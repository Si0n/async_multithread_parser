const {WebHelper} = require("./WebHelper");
const {By, Key, until} = require('selenium-webdriver');

class Kernel {
    constructor(processId) {
        this.processId = processId;
    }

    getProcessId() {
        return this.processId;
    }

    async parseFirstPage() {
        await WebHelper.startDriver();
        let webPaths = await WebHelper.processPage('https://www.imdb.com/feature/genre', async (driver) => {
            let webPaths = new Set(),
                elements = await driver.findElements(By.xpath('//div[@id="main"]//div[@class="image"]//a'));
            for (let i in elements) {
                let element = elements[i];
                webPaths.add(await element.getAttribute("href"));
            }
            return webPaths;
        });
        await WebHelper.stopDriver();
        return webPaths;
    }

    async processPage(webPath, callback, needStopDriver) {
        needStopDriver = needStopDriver || false;
        if (!WebHelper.isDriverRunning()) {
            await WebHelper.startDriver();
        }
        let result = await WebHelper.processPage(webPath, callback);
        if (needStopDriver) {
            if (WebHelper.isDriverRunning()) {
                await WebHelper.startDriver();
            }
        }
        return result;
    }


    async stopDriver() {
        if (WebHelper.isDriverRunning()) {
            await WebHelper.stopDriver();
        }
    }
}

module.exports = Kernel;