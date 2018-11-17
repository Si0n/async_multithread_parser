import {WorkerWrapperInterface} from '../Interface/WorkerWrapperInterface'
import {Message} from './Message'

export class WorkerWrapper implements WorkerWrapperInterface {
    static STATE_FREE: string = 'free';
    static STATE_BUSY: string = 'busy';

    private receivedMessage;

    constructor(public readonly worker, public state = 'free')
    {
    }

    public send(message: Message): WorkerWrapper
    {
        this.setState(message.workerState);
        this.worker.send(message);
        return this;
    }

    public receive(message: Message): WorkerWrapper
    {
        this.setState(message.workerState);
        this.setReceivedMessage(message);
        return this;
    }

    setState(state: string): WorkerWrapper
    {
        this.state = state;
        return this;
    }

    getState(): string
    {
        return this.state;
    }

    setReceivedMessage(message: Message): WorkerWrapper
    {
        this.receivedMessage = message;
        return this;
    }

    getReceivedMessage(): Message
    {
        return this.receivedMessage;
    }
}