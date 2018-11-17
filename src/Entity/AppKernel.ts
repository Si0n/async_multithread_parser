import * as cluster from "cluster";
import {cpus} from "os";
import {ProcessKernel} from "./ProcessKernel";
import {WorkerWrapper} from "./WorkerWrapper";
import {Message} from "./Message";
import {sha256} from "sha256";

export class AppKernel {
    private urls: Array<string> = [];
    private workers: Object = {};
    private loop;

    constructor(private readonly settings?)
    {
    }

    run(urls: Array<string>)
    {
        this.addUrls(urls);

        if (cluster.isMaster) {
            for (let i = 0; i < cpus().length; i++) {
                let worker = cluster.fork({name: "worker", isDebug: true});
                this.workers[worker.process.pid] = new WorkerWrapper(worker);
            }
            cluster.on("message", (worker, message: Message, handle) => {
                let workerWrapper: WorkerWrapper = this.workers[worker.process.pid];
                workerWrapper.receive(message);
                console.log(workerWrapper.getReceivedMessage());
                if (workerWrapper.getReceivedMessage().type === Message.TYPE_URL_PARSED) {
                    if (workerWrapper.getReceivedMessage().body.urls && Object.keys(workerWrapper.getReceivedMessage().body.urls).length) {
                        this.addUrls(workerWrapper.getReceivedMessage().body.urls);
                    }
                    if (workerWrapper.getReceivedMessage().body.films) {
                        console.log(workerWrapper.getReceivedMessage().body.films);
                    }
                }
                let url = this.getUrl();
                if (url) {
                    workerWrapper.send(new Message(Message.TYPE_PARSE_URL, {url: url}, WorkerWrapper.STATE_BUSY));
                }
            });
            cluster.on("exit", (worker, code, signal) => {
                console.log(`worker ${worker.process.pid} died with signal: ${signal} and code: ${code}`
                );
            });
            for (let i in this.workers) {
                let url = this.getUrl();
                if (!url) break;
                let worker: WorkerWrapper = this.workers[i];
                worker.send(new Message(Message.TYPE_PARSE_URL, {"url": url}, WorkerWrapper.STATE_BUSY));
            }

            /** Most important part **/
            this.runKernelLoop();
            /** Most important part **/

        } else if (cluster.isWorker) {
            let WorkerKernel = new ProcessKernel(process.pid);
            process.on("message", async (message: Message) => {
                try {
                    let response = await WorkerKernel.processMessage(message);
                    process.send(response);
                } catch (err) {
                    console.log(err);
                    process.send(new Message(Message.TYPE_ERROR, {error : err}, WorkerWrapper.STATE_FREE));
                }
            });
        }
    }


    addUrls(urls: Array<string>)
    {
        this.urls = [...new Set([...this.urls, ...urls])]; //only unique
    }

    private runKernelLoop()
    {
        this.loop = setInterval(() => {
            for (let i in this.workers) {
                let worker: WorkerWrapper = this.workers[i];
                if (worker.getState() === WorkerWrapper.STATE_FREE) {
                    let url = this.getUrl();
                    if (url) {
                        worker.send(new Message(Message.TYPE_PARSE_URL, {url: url}, WorkerWrapper.STATE_BUSY));
                    }
                }
            }
        }, 5000);
    }

    private stopKernelLoop()
    {
        clearInterval(this.loop);
    }

    private getUrl()
    {
        return this.urls.shift();
    }
}
