import {SeleniumDriver} from '../Helper/SeleniumDriver';
import {WebPageParser} from '../Service/WebPageParser';
import {Message} from './Message';
import {WorkerWrapper} from './WorkerWrapper';

export class ProcessKernel {
    private readonly webdriver: SeleniumDriver;
    private readonly webparser: WebPageParser;

    constructor(private readonly processId)
    {
        this.webdriver = new SeleniumDriver();
        this.webparser = new WebPageParser();
    }

    async processMessage(message: Message)
    {
        switch (message.type) {
            case Message.TYPE_PARSE_URL :
                let parsedData = await this.webdriver.processPage(message.body.url, (driver) => {
                    return this.webparser.parsePage(driver);
                });
                return new Message(Message.TYPE_URL_PARSED, parsedData, WorkerWrapper.STATE_FREE);
                break;
        }

    }

    public getWebparser(): WebPageParser
    {
        return this.webparser;
    }

    public getWebdriver(): SeleniumDriver
    {
        return this.webdriver;
    }

    public getProcessId()
    {
        return this.processId;
    }
}
