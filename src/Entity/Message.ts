import {MessageInterface} from '../Interface/MessageInterface';

export class Message implements MessageInterface {
    static TYPE_PARSE_URL: string = 'parseUrl';
    static TYPE_BLANK_RESPONSE: string = 'blank';
    static TYPE_ADD_URLS: string = 'addUrls';
    static TYPE_URL_PARSED: string = 'urlParsed';

    constructor(
        public readonly type: string,
        public readonly body,
        public readonly workerState: string
    )
    {
    }
}
