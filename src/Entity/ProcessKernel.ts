export class ProcessKernel {
    constructor(private readonly worker, private readonly workerType)
    {
    }

    public getWorker()
    {
        return this.worker;
    }

    public getWorkerType()
    {
        return this.workerType;
    }
}