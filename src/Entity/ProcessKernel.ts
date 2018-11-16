export class ProcessKernel {
    constructor(private readonly processId)
    {
    }


    public getProcessId()
    {
        return this.processId;
    }
}
