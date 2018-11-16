export class Message {
  constructor(
    private readonly messageType: string,
    private readonly messageBody: object
  ) {}

  public getMessageType(): string {
    return this.messageType;
  }

  public getMessageBody(): object {
    return this.messageBody;
  }
}
