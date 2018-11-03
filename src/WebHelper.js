const {Builder, By, Key, until} = require('selenium-webdriver');

class WebHelper {
    async startDriver() {
        this.driver = await new Builder().forBrowser('chrome').build();
        return this;
    }

    async processPage(url, callback) {
        await this.driver.get(url);
        return await callback(this.driver);
    }

    async stopDriver() {
        let promise = this.driver.quit();
        this.driver = null;
        return promise;
    }

    isDriverRunning() {
        return true && this.driver;
    }
}

module.exports.WebHelper = new WebHelper();