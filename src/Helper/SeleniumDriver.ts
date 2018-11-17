const {Builder, By, Key, until} = require('selenium-webdriver');

export class SeleniumDriver {
    private driver;
    private driverBuilt: boolean = false;

    constructor()
    {
        this.driver = new Builder().forBrowser('chrome');
    }

    async build()
    {
        this.driver = await this.driver.build();
        this.setDriverBuilt(true);
    }

    async processPage(url, callback)
    {
        if (!this.isDriverBuilt()) await this.build();
        await this.driver.get(url);
        return await callback(this.driver);
    }

    async stopDriver()
    {
        let promise = this.driver.quit();
        this.driver = null;
        this.setDriverBuilt(false);
        return await promise;
    }

    isDriverBuilt()
    {
        return this.driverBuilt && this.driver;
    }

    setDriverBuilt(isBuilt: boolean)
    {
        this.driverBuilt = isBuilt;
    }
}