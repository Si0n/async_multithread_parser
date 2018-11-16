const cluster = require('cluster');
const http = require('http');
const KernelClass = require('./Kernel')
const numCPUs = require('os').cpus().length;
const {By, Key, until} = require('selenium-webdriver');
const {WebPageProcessor} = require('./WebPageProcessor');
const Kernels = {};

if (cluster.isMaster) {
    //spawning workers
    let workers = new Set();
    for (let i = 0; i < numCPUs; i++) {
        workers.add(cluster.fork());
    }

    (async () => {
        let webPaths;
        console.log(`Master ${process.pid} is running`);

        cluster.on('message', async (worker, msg, handle) => {
            //если воркер отчитался что обработка закончилась - проверяем есть ли ещё страницы для обработки, если есть - закидываем на обработку следующий таск
            if (msg.type === 'pageProcessed') {
                if (webPaths && webPaths.length) {
                    worker.send({type: "processPage", "url": webPaths.shift()});
                } else {
                    worker.send({type: "killWorker"});
                    setTimeout(async () => {
                        console.log(`Killing ${msg.processId} Worker`);
                        worker.kill();
                    }, 5000);
                }
            } else if (msg.type === 'addWebPaths') {
                if (msg.hasOwnProperty('webPaths') && msg.webPaths && msg.webPaths.length) {
                    webPaths = [...webPaths, ...msg.webPaths];
                    console.log(webPaths);
                }
            }
        });

        let Kernel = new KernelClass();
        //получаем список всех путей
        webPaths = [...await Kernel.parseFirstPage()];
        for (let worker of workers) {
            //отправляем первую партия на обработку
            worker.send({type: "processPage", "url" : webPaths.shift()});
        }
    })();

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
} else {
    // Workers can share any TCP connection
    // In this case it is an HTTP server
    /*http.createServer((req, res) => {
        res.writeHead(200);
        res.end(`hello world from process: ${process.pid} \n`);
    }).listen(8000);*/
    process.on('message', async (msg) => {
        if (!Kernels.hasOwnProperty(process.pid) || !Kernels[process.pid]) {
            Kernels[process.pid] = new KernelClass(process.pid);
        }
        let Kernel = Kernels[process.pid];
        if (msg.type === 'processPage') {
            let webPath = msg.url;
            await Kernel.processPage(webPath, async (driver) => {
                await driver.wait(until.elementLocated(By.id("footer")));
                let filmsData = [],
                    films = await driver.findElements(By.xpath('//div[@class="lister-item mode-advanced"]'));
                for (let i in films) {
                    let film = films[i],
                        url = await WebPageProcessor.getFilmUrl(film);
                    filmsData.push({
                        url: url,
                        name: await WebPageProcessor.getFilmName(film),
                        year: await WebPageProcessor.getFilmYear(film),
                        runtime: await WebPageProcessor.getRuntime(film),
                        filmGenres: await WebPageProcessor.getGenres(film),
                        rating: await WebPageProcessor.getRating(film),
                        metascore: await WebPageProcessor.getMetascore(film),
                        description: await WebPageProcessor.getDescription(film),
                        gross: await WebPageProcessor.getGross(film),
                        votes: await WebPageProcessor.getVotes(film),
                        filmActors: await WebPageProcessor.getActors(film)
                    });
                }
                //console.log(filmsData);
                let nextPageUrl = await WebPageProcessor.getNextPageUrl(driver);
                console.log(nextPageUrl);
                if (nextPageUrl) {
                    process.send({type : "addWebPaths", webPaths : [nextPageUrl]});
                }
            });
            process.send({ type: "pageProcessed", "processId" : process.pid});
        } else if (msg.type === 'killWorker') {
                await Kernel.stopDriver()
                delete Kernels[process.pid];
        }
    });
    console.log(`Worker ${process.pid} started`);
}