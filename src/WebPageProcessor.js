const {Builder, By, Key, until} = require('selenium-webdriver');
class WebPageProcessor {

    async getFilmName(filmElement) {
        let element = await filmElement.findElement(By.css("h3.lister-item-header a")),
            name = await element.getAttribute("innerHTML");
        return name.trim();
    }

    async getFilmUrl(filmElement) {
        try {
            let element = await filmElement.findElement(By.css("h3.lister-item-header a")),
                name = await element.getAttribute("href");
            return name.trim();
        } catch (e) {
            return '';
        }
    }

    async getFilmYear(filmElement) {
        try {
            let element = await filmElement.findElement(By.css("h3.lister-item-header .lister-item-year")),
                name = await element.getAttribute("innerHTML");
            return name.trim().replace(/[^\d-–]/gi, '');
        } catch (e) {
            return '...';
        }
    }

    async getRuntime(filmElement) {
        try {
            let element = await filmElement.findElement(By.css("p span.runtime")),
                name = await element.getAttribute("innerHTML");
            return name.trim();
        } catch (e) {
            return '';
        }
    }

    async getGenres(filmElement) {
        try {
            let element = await filmElement.findElement(By.css("p span.genre")),
                name = await element.getAttribute("innerHTML");
            return name.trim().replace("[^\w]", "").split(", ");
        } catch (e) {
            return [];
        }
    }

    async getActors(filmElement) {
        try {
            let actors = [],
                elements = await filmElement.findElements(By.xpath('./div[@class="lister-item-content"]/p[3]/span/following-sibling::a'));

            for (let i in elements) {
                let element = elements[i],
                    url = await element.getAttribute("href"),
                    name = await element.getAttribute("innerHTML");
                actors.push({
                    name: name.trim(),
                    url: url,
                    url_hash: sha256(url),
                });
            }

            return actors;
        } catch (e) {
            return [];
        }
    }

    async getRating(filmElement) {
        try {
            let element = await filmElement.findElement(By.css(".ratings-bar .ratings-imdb-rating strong")),
                name = await element.getAttribute("innerHTML");
            return name.trim();
        } catch (e) {
            return '';
        }
    }

    async getMetascore(filmElement) {
        try {
            let element = await filmElement.findElement(By.css(".ratings-bar .ratings-metascore span.metascore")),
                name = await element.getAttribute("innerHTML");
            return name.trim();
        } catch (e) {
            return '';
        }
    }

    async getDescription(filmElement) {
        try {
            let element = await filmElement.findElement(By.css('.lister-item-content .ratings-bar+p')),
                name = await element.getAttribute("innerHTML");
            return name.trim();
        } catch (e) {
            return '';
        }
    }

    async getVotes(filmElement) {
        try {
            let element = await filmElement.findElement(By.xpath('./div[@class="lister-item-content"]/p[@class="sort-num_votes-visible"]/span[@name="nv"][1]')),
                name = await element.getAttribute("innerHTML");
            return name.trim().replace(/[^\d]/gi, '');
        } catch (e) {
            return '';
        }
    }

    async getGross(filmElement) {
        try {
            let element = await filmElement.findElement(By.xpath('./div[@class="lister-item-content"]/p[@class="sort-num_votes-visible"]/span[@name="nv"][2]')),
                name = await element.getAttribute("innerHTML");
            return name.trim();
        } catch (e) {
            return '';
        }
    }
}

module.exports.WebPageProcessor = new WebPageProcessor();