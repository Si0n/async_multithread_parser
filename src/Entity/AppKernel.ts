import * as cluster from 'cluster';
import {cpus} from 'os';
import {ProcessKernel} from './ProcessKernel';
import {Message} from './Message';
import {sha256} from 'sha256';


export class AppKernel {
    private urls: Set<string> = new Set();
    private workers: Set<ProcessKernel> = new Set();

    constructor(private readonly settings?)
    {
    }

    run(urls: Array<string>)
    {
        for (let i in urls) {
            this.addUrl(urls[i]);
        }
        if (cluster.isMaster) {
            for (let i = 0; i < cpus().length; i++) {
                this.workers.add(new ProcessKernel(cluster.fork({name: "worker", isDebug: true}), "worker"));
                console.log(`Forked process #${i}`);
            }
            cluster.on("message", (worker, message, handle) => {
                console.log(message);
            });
            cluster.on('exit', (worker, code, signal) => {
                console.log(`worker ${worker.process.pid} died with signal: ${signal} and code: ${code}`);
            });
            for (let worker of this.workers) {
                console.log(worker);
                worker.getWorker().send({message: "Are you working?"})
            }
        } else if (cluster.isWorker) {
            console.log(`Worker ${process.pid} started`);
            process.on('message', async (msg) => {
                console.log(msg);
                process.send({"message": "Sure!"});
            })
        }
    }

    private addUrl(url: string)
    {
        this.urls.add(url);
    }
}