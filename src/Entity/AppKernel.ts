import * as cluster from "cluster";
import {cpus} from "os";
import {ProcessKernel} from "./ProcessKernel";
import {Message} from "./Message";
import {sha256} from "sha256";

export class AppKernel {
    private urls: Array<string>;
    private workers: Object = {};

    constructor(private readonly settings?)
    {
    }

    run(urls: Array<string>)
    {
        this.urls = urls;
        if (cluster.isMaster) {
            for (let i = 0; i < cpus().length; i++) {
                let worker = cluster.fork({name: "worker", isDebug: true});
                this.workers[worker.process.pid] = worker;
            }
            cluster.on("message", (worker, message, handle) => {
                console.log(message);
            });
            cluster.on("exit", (worker, code, signal) => {
                console.log(`worker ${worker.process.pid} died with signal: ${signal} and code: ${code}`
                );
            });
            for (let i in this.workers) {
                let worker = this.workers[i];
                let url = this.urls.shift();
                if (!url) break;
                worker.send(new Message("processUrl", {url: url}));
            }
        } else if (cluster.isWorker) {
            console.log(`Worker ${process.pid} started`);

            let pKernel = new ProcessKernel(process.pid);
            console.log(pKernel);
            process.on("message", async (message: Message) => {
                console.log(this.workers[process.pid]);
                process.send({message: "Sure!"});
            });
        }
    }
}
