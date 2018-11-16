import {AppKernel} from './Entity/AppKernel';
import * as cluster from "cluster";
import {cpus} from "os";
import {ProcessKernel} from "./Entity/ProcessKernel";

const workers = new Set();
//const Kernel = new AppKernel();
//Kernel.run(["https://www.imdb.com/feature/genre"]);

if (cluster.isMaster) {
    for (let i = 0; i < cpus().length; i++) {
        cluster.fork().send({"message": "Hello i'm alive"});
        console.log(`Forked process #${i}`);
    }
    cluster.on("message", (worker, message, handle) => {
        console.log(message);
    });
    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died with signal: ${signal} and code: ${code}`);
    });
    for (let worker of workers) {
        worker.send({message: "Are you working?"})
    }
} else if (cluster.isWorker) {
    console.log(`Worker ${process.pid} started`);
    process.on('message', async (msg) => {
        console.log(msg);
        process.send({"message": "Sure!"});
    })
}