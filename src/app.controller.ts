import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer, { ElementHandle } from 'puppeteer';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get()
  getRoot(): string {
    return this.appService.getRoot();
  }

  @Get('/kth-jobs')
  async scrapeKthJobs(): Promise<string[]> {
    const { data } = await axios.get(
      'https://www.kth.se/lediga-jobb?l=en',
    );
    const $ = cheerio.load(data);
    const jobs = [];
    $('table.table > tbody > tr').each((_, tr) => {
      const firstChild = $(tr).children().first();
      const jobTitle = firstChild.text().trim();
      const jobLink = 'https://www.kth.se' + firstChild.find('a').attr('href').trim();
      const secondChild = firstChild.next();
      const jobLocation = secondChild.text().trim();
      const thirdChild = secondChild.next();
      const jobFrom = thirdChild.text().trim();
      const fourthChild = thirdChild.next();
      const jobDeadline = fourthChild.text().trim();

      jobs.push(`${jobTitle} - ${jobLink} - ${jobLocation} - ${jobFrom} - ${jobDeadline}`);
    });

    return jobs;
  }

  @Get('/tue-jobs')
  async scrapeTueJobs(): Promise<string[]> {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.goto(`https://jobs.tue.nl/en/vacancies.html`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('#jobslist', { timeout: 10000 });

    const jobs = await page.evaluate(() => {
      const jobs = [];
      const jobWrappers = document.querySelector('#jobslist');
      const jobRows = jobWrappers.querySelectorAll('.jobpost');
      jobRows.forEach((jobRow) => {
        const jobTitleElement = jobRow.querySelector('h2');
        const jobTitle = jobTitleElement ? jobTitleElement.textContent.trim() : '';
        const jobLink = jobTitleElement ? jobTitleElement.querySelector('a').getAttribute('href').trim() : '';
       
        const jobClassifications = jobRow.querySelector('span.job_classifications').textContent.trim();
        const jobDate = jobRow.querySelector('span.job_date').textContent.trim();
    
        jobs.push(`${jobTitle} - ${jobLink} - ${jobClassifications} - ${jobDate}`);
      });
      return jobs;
    });
      
    await browser.close();
    return jobs;
  }

  @Get('/kul-jobs')
  async scrapeKulJobs(): Promise<string[]> {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    const allJobs = [];
    let i = 0;
    const imax = 20;
    while (true) {
      if (i > imax) {
        break;
      }
      try {
        await page.goto(`https://www.kuleuven.be/personeel/jobsite/jobs/phd?lang=en&page=${i}`, { waitUntil: 'networkidle2' });

        // Wait for the element to appear in the page
        await page.waitForSelector('#results_card', { timeout: 10000 });

        const resultsCardExists = await page.evaluate(() => document.querySelector('div.row.mt-2').children.length > 0);
        if (!resultsCardExists) {
          break;
        }

        const jobs = await page.evaluate(() => {
          const jobs = [];
          const jobWrappers = document.querySelector('#results_card');
          const jobRows = jobWrappers.querySelectorAll('.card-block');
          jobRows.forEach((jobRow) => {
            const jobTitleElement = jobRow.querySelector('h6');
            const jobTitle = jobTitleElement ? jobTitleElement.textContent.trim() : '';
        
            const paragraphs = Array.from(jobRow.querySelectorAll('p'));
            const jobFrom = paragraphs.length > 0 ? paragraphs[paragraphs.length - 1].textContent.trim() : '';
        
            const rawJobPercentageElement = jobRow.querySelector('.ocupation');
            const rawJobPercentage = rawJobPercentageElement ? rawJobPercentageElement.textContent.trim() : '';
            const jobPercentage = rawJobPercentage.startsWith('av_timer') ? rawJobPercentage.substring(8) : rawJobPercentage;
        
            const rawJobDeadlineElement = jobRow.querySelector('.apply_before');
            const rawJobDeadline = rawJobDeadlineElement ? rawJobDeadlineElement.textContent.trim() : '';
            const jobDeadline = rawJobDeadline.startsWith('timer') ? rawJobDeadline.substring(5) : rawJobDeadline;
        
            jobs.push(`${jobTitle} - ${jobFrom} - ${jobPercentage} - ${jobDeadline}`);
          });
          return jobs;
        });
        
        allJobs.push(...jobs);
        i++;
      } catch (error) {
        console.log(error);
        break;
      }
  }
   
  
    await browser.close();
    return allJobs;
  }

  // TODO: not working since I cant get the job list
  @Get('/tudelft-jobs')
  async scrapeTuDefltJobs() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // Listen for console events
    // page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
    page.setDefaultNavigationTimeout(10000);
    await page.goto('https://www.tudelft.nl/en/about-tu-delft/working-at-tu-delft/search-jobs', { waitUntil: 'networkidle2' });
    // Wait for the element to appear in the page
    // Wait for the fetch request to complete
    // await page.waitForResponse(response => {
    //   // Replace 'https://api.example.com/data' with the URL of the fetch request
    //   return response.url().includes('https://emea3.recruitmentplatform.com/fo/rest/jobs');
    // });
    await page.waitForSelector('#talentlinkJobsList', { timeout: 10000 });
    console.log('page loaded');

    const jobs = await page.evaluate(() => {
      const jobs = [];
      const jobWrappers = document.querySelector('#talentlinkJobsList');
      const tableRows = jobWrappers.querySelectorAll('tr');
      tableRows.forEach((tableRow) => {
        const firsttd = tableRow.firstElementChild;
        const jobTitle = firsttd.firstElementChild.textContent.trim();
        // const jobLink = firsttd.firstElementChild.getAttribute('href').trim();
        // const secondtd = firsttd.nextElementSibling;
        // const jobLocation = secondtd.textContent.trim();
        // const thirdtd = secondtd.nextElementSibling;
        // const jobDate = thirdtd.textContent.trim();
        jobs.push(`${jobTitle}`);
      })

    });
    console.log(jobs);
    await browser.close();
    console.log('browser closed');
  }

  @Get('/unibe-jobs')
  async scrapeUBernJobs(): Promise<string[]> {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(10000);
    await page.goto('https://www.karriere.unibe.ch/jobs/job_portal/index_eng.html');
  
    // Wait for the iframe to load
    await page.waitForSelector('iframe');
  
    // Get the iframe
    const iframeElement = await page.$('iframe');
    const frame = await iframeElement.contentFrame();
  
    // Initialize an array to hold all job data
    const allJobs = [];

    // Use a loop to navigate through all pages
    while (true) {
      // Get job data from the current page
      const jobs = await frame.evaluate(() => {
        const jobWrappers = document.querySelectorAll('tbody > tr');
        const jobs = [];
        jobWrappers.forEach((jobWrapper) => {
          const firsttd = jobWrapper.firstElementChild;
          const jobTitle = firsttd.firstElementChild.textContent.trim();
          const jobLink = firsttd.firstElementChild.getAttribute('href').trim();
          const jobDetail = firsttd.lastElementChild.textContent.replace(/\s+/g, ' ').trim();
          const secondtd = firsttd.nextElementSibling;
          const jobLocation = secondtd.textContent.trim();
          const thirdtd = secondtd.nextElementSibling;
          const jobDate = thirdtd.textContent.trim();
          jobs.push(`${jobTitle} - ${jobLink} - ${jobDetail} - ${jobLocation} - ${jobDate}`);
        })
        return jobs;
      });
  
      // Add the job data to the allJobs array
      allJobs.push(...jobs);
      
      // Try to find the "btn-forward" button
      const forwardButton = await frame.$('#btn-forward');

      // If the "btn-forward" button is not found, break the loop
      if (!forwardButton) break;
      
      // Check if the button is visible
      const isVisible = await frame.evaluate((button) => {
        const style = window.getComputedStyle(button);
        return style && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      }, forwardButton);

      // If the button is not visible, break the loop
      if (!isVisible) break;

      // Click the "btn-forward" button and wait for navigation
      await Promise.all([
        frame.waitForNavigation(), // The promise resolves after navigation has finished
        forwardButton.click(), // Clicking the button will indirectly cause a navigation
      ]);
    }
  
    await browser.close();
    return allJobs;
  }

  @Get('/uzh-jobs')
  async scrapeUzhJobs(): Promise<string[]> {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto('https://www.uzh.ch/cmsssl/en/explore/work/jobs.html');
  
    // Wait for the iframe to load
    await page.waitForSelector('iframe');
  
    // Get the iframe
    const iframeElement = await page.$('iframe');
    const frame = await iframeElement.contentFrame();
  
    // Now you can use the frame just like you would use the page
    const jobs = await frame.evaluate(() => {
      const jobs = [];
      const jobWrappers = document.querySelectorAll('tr.row.job');
      jobWrappers.forEach((jobWrapper) => {
        const firsttd = jobWrapper.firstElementChild;
        const jobTitle = firsttd.firstElementChild.textContent.trim();
        const jobLink = firsttd.firstElementChild.getAttribute('href').trim();
        const secondtd = firsttd.nextElementSibling;
        const jobPercentage = secondtd.textContent.replace(/\s+/g, ' ').trim();
        const thirdtd = secondtd.nextElementSibling;
        const jobFrom = thirdtd.textContent.trim();
        jobs.push(`${jobTitle} - ${jobLink} - ${jobPercentage} - ${jobFrom}`);
      })

      return jobs;
    });
  
  
    await browser.close();
    return jobs;
  }

  @Get('/epfl-jobs')
  async scrapeEpflJobs(): Promise<string[]> {
    const { data } = await axios.get(
      'https://www.epfl.ch/about/working/working-at-epfl/job-openings/admin-and-technical-staff/',
    );
    const $ = cheerio.load(data);
    const jobs = [];
    $('.job-offer-row').each((_, div) => {
      const firstChild = $(div).children().first();
      const jobDate = firstChild.text().trim();
      const secondChild = firstChild.next();
      const jobTitle = secondChild.children().first().text().trim();
      const jobLink = secondChild
        .children()
        .first()
        .children()
        .first()
        .attr('href')
        .trim();
      const thirdChild = secondChild.next();
      const jobCatalog = thirdChild.text().trim();
      const jobFunction = jobCatalog.split('|')[0].trim();
      const jobLocation = jobCatalog.split('|')[1].trim();

      jobs.push(`${jobDate} - ${jobTitle} - ${jobLink} - ${jobFunction} - ${jobLocation}`);
    });

    return jobs;
  }

  @Get('/eth-jobs')
  async scrapeEthJobs(): Promise<string[]> {
    const { data } = await axios.get('https://jobs.ethz.ch/');
    const $ = cheerio.load(data);
    const jobs = [];
    $('.job-ad__item__link').each((_, li) => {
      const jobLink = 'jobs.ethz.ch' + $(li).attr('href');
      const element = $(li).find('.job-ad__item__title').first();
      const jobTitle = $(element).text().trim();
      const divDetails = $(element).next();
      const jobDetails = divDetails.text().trim();
      const divCompany = divDetails.next();
      const jobPublishDateAndCompany = divCompany.text();
      const jobPublishDate = jobPublishDateAndCompany.split(' | ')[0].trim();
      const jobCompany = jobPublishDateAndCompany.split(' | ')[1].trim();
      jobs.push(
        `${jobLink} - ${jobTitle} - ${jobDetails} - ${jobPublishDate} - ${jobCompany}`,
      );
    });
    return jobs;
  }

  // TODO: it seems eth get hired has anti scraping measures, implement multiple pages one
  @Get('/eth-get-hired')
  async scrapeWebsite() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto('https://eth-gethired.ch/en/jobs/');

    let jobs = [];
    while (true) {
      const newJobs = await page.evaluate(() => {
        const jobDetails = Array.from(
          document.querySelectorAll('div.infoline.ng-binding'),
        );
        const njobs = [];
        for (const jobDetail of jobDetails) {
          const locationSpanNode = jobDetail.firstElementChild;
          const jobLocation = locationSpanNode.textContent.trim();
          const percentageSpanNode = locationSpanNode.nextElementSibling;
          const jobPercentage = percentageSpanNode.textContent.trim();
          const publishDateSpanNode = percentageSpanNode.nextElementSibling;
          const jobPublishDate = publishDateSpanNode.textContent.trim();
          const h2 = jobDetail.nextElementSibling;
          const jobUni = h2.textContent.trim();
          const aLink = h2.nextElementSibling;
          const jobLink =
            'https://eth-gethired.ch' + aLink.getAttribute('href').trim();

          njobs.push(
            `${jobLocation} - ${jobPercentage} - ${jobPublishDate} - ${jobUni} - ${jobLink}`,
          );
        }
        return njobs;
      });
      jobs = jobs.concat(newJobs);

      try {
        await page.waitForXPath(
          "//a[contains(@class, 'ng-binding') and contains(text(), 'Next')]",
          { timeout: 2000 },
        );
        const [nextButton] = await page.$x(
          "//a[contains(@class, 'ng-binding') and contains(text(), 'Next')]",
        );
        console.log('next button', nextButton);
        if (nextButton) {
          console.log('clicked next 1');
          await (nextButton as ElementHandle<Element>).click();
          console.log('clicked next 2');
          await page.waitForNavigation({ timeout: 60000 });
          console.log('clicked next 3');
        } else {
          break;
        }
      } catch (error) {
        break;
      }
    }

    await browser.close();
    return jobs;
  }

  // @Get('/eth-get-hired')
  // async scrapeEthGetHired() {
  //   const { data } = await axios.get('https://eth-gethired.ch/en/jobs/');
  //   return data;
  //   const $ = cheerio.load(data);
  //   const jobs = [];
  //   $('div.infoline.ng-binding').each((_, div) => {
  //     const jobDetails = [];
  //     $(div)
  //       .children()
  //       .each((_, child) => {
  //         jobDetails.push($(child).text().trim());
  //       });
  //     const [jobLocation, jobPercentage, jobPublishDate] = jobDetails;
  //     const h2 = $(div).next();
  //     const jobUni = h2.first().text().trim();
  //     const aLink = h2.next();
  //     const jobLink = 'https://eth-gethired.ch' + aLink.attr('href').trim();
  //     jobs.push(
  //       `${jobLocation} - ${jobPercentage} - ${jobPublishDate} - ${jobUni} - ${jobLink}`,
  //     );
  //   });
  //   return jobs;
  // }
}
