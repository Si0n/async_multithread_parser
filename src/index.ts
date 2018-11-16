import { AppKernel } from "./Entity/AppKernel";
import * as cluster from "cluster";
import { cpus } from "os";
import { ProcessKernel } from "./Entity/ProcessKernel";

const workers = new Set();
const Kernel = new AppKernel();
Kernel.run(["https://www.imdb.com/feature/genre"]);