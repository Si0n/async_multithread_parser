const {Builder, By, Key, until} = require('selenium-webdriver');
const sha256 = require('sha256');

export class WebPageParser {

    async parsePage(driver)
    {
        let films = [],
            filmsUnprocessed = await this.findFilms(driver);
        if (filmsUnprocessed && Object.keys(filmsUnprocessed).length) {
            for (let i in filmsUnprocessed) {
                let filmUnprocessed = filmsUnprocessed[i];
                films.push({
                    url: await this.getFilmUrl(filmUnprocessed),
                    name: await this.getFilmName(filmUnprocessed),
                    year: await this.getFilmYear(filmUnprocessed),
                    runtime: await this.getRuntime(filmUnprocessed),
                    filmGenres: await this.getGenres(filmUnprocessed),
                    rating: await this.getRating(filmUnprocessed),
                    metascore: await this.getMetascore(filmUnprocessed),
                    description: await this.getDescription(filmUnprocessed),
                    gross: await this.getGross(filmUnprocessed),
                    votes: await this.getVotes(filmUnprocessed),
                    filmActors: await this.getActors(filmUnprocessed)
                })
            }
        }
        return {
            urls: await driver.findElements(By.xpath("//a[contains(@href, 'search') and not(contains(@href, 'facebook')) and not(contains(@href, 'twitter')) and not(contains(@href, 'mailto'))]"))
                .then(elements => elements.map(el => el.getAttribute('href')))
                .then(promises => Promise.all(promises))
                .catch(e => console.error(e)),
            films: films
        }
    }

    async findFilms(driver)
    {
        return await driver.findElements(By.xpath('//div[@class="lister-item mode-advanced"]'))
            .catch(e => console.error(e));
    }

    async getFilmName(filmElement)
    {
        let element = await filmElement.findElement(By.css("h3.lister-item-header a")),
            name = await element.getAttribute("innerHTML");
        return name.trim();
    }

    async getFilmUrl(filmElement)
    {
        try {
            let element = await filmElement.findElement(By.css("h3.lister-item-header a")),
                name = await element.getAttribute("href");
            return name.trim();
        } catch (e) {
            return '';
        }
    }

    async getFilmYear(filmElement)
    {
        try {
            let element = await filmElement.findElement(By.css("h3.lister-item-header .lister-item-year")),
                name = await element.getAttribute("innerHTML");
            return name.trim().replace(/[^\d-–]/gi, '');
        } catch (e) {
            return '...';
        }
    }

    async getNextPageUrl(driver)
    {
        return await driver.findElement(By.xpath('//div[@class="nav"][1]/*[@class="desc"]/a[text()="Next »"]'))
            .getAttribute("href")
            .catch(e => console.error(e));
    }

    async getRuntime(filmElement)
    {
        try {
            let element = await filmElement.findElement(By.css("p span.runtime")),
                name = await element.getAttribute("innerHTML");
            return name.trim();
        } catch (e) {
            return '';
        }
    }

    async getGenres(filmElement)
    {
        try {
            let element = await filmElement.findElement(By.css("p span.genre")),
                name = await element.getAttribute("innerHTML");
            return name.trim().replace("[^\w]", "").split(", ");
        } catch (e) {
            return [];
        }
    }

    async getActors(filmElement)
    {
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

    async getRating(filmElement)
    {
        try {
            let element = await filmElement.findElement(By.css(".ratings-bar .ratings-imdb-rating strong")),
                name = await element.getAttribute("innerHTML");
            return name.trim();
        } catch (e) {
            return '';
        }
    }

    async getMetascore(filmElement)
    {
        try {
            let element = await filmElement.findElement(By.css(".ratings-bar .ratings-metascore span.metascore")),
                name = await element.getAttribute("innerHTML");
            return name.trim();
        } catch (e) {
            return '';
        }
    }

    async getDescription(filmElement)
    {
        try {
            let element = await filmElement.findElement(By.css('.lister-item-content .ratings-bar+p')),
                name = await element.getAttribute("innerHTML");
            return name.trim();
        } catch (e) {
            return '';
        }
    }

    async getVotes(filmElement)
    {
        try {
            let element = await filmElement.findElement(By.xpath('./div[@class="lister-item-content"]/p[@class="sort-num_votes-visible"]/span[@name="nv"][1]')),
                name = await element.getAttribute("innerHTML");
            return name.trim().replace(/[^\d]/gi, '');
        } catch (e) {
            return '';
        }
    }

    async getGross(filmElement)
    {
        try {
            let element = await filmElement.findElement(By.xpath('./div[@class="lister-item-content"]/p[@class="sort-num_votes-visible"]/span[@name="nv"][2]')),
                name = await element.getAttribute("innerHTML");
            return name.trim();
        } catch (e) {
            return '';
        }
    }
}