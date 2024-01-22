import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer, { ElementHandle } from 'puppeteer';

@Injectable()
export class JobService {
  async scrapeCthJobs() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(10000);
    await page.goto('https://www.chalmers.se/en/about-chalmers/work-with-us/vacancies/');
  
    // Wait for the iframe to load
    await page.waitForSelector('iframe');
  
    // Get the iframe
    const iframeElement = await page.$('iframe');
    const frame = await iframeElement.contentFrame();
  

    // Get job data from the current page
    const jobs = await frame.evaluate(() => {
      const jobWrappers = document.querySelectorAll('tbody > tr');
      const jobs = [];
      jobWrappers.forEach((jobWrapper) => {
        const jobLink = jobWrapper.querySelector('a').getAttribute('href').trim();
        const jobTitle = jobWrapper.firstElementChild.nextElementSibling.textContent.trim();
        const jobDeadline = jobWrapper.lastElementChild.textContent.trim();
        jobs.push({
          jobTitle: jobTitle,
          jobLink: jobLink,
          jobDeadline: jobDeadline
        });
      })
      return jobs;
    });
  
    await browser.close();
    return jobs;
  }

  async scrapeUvaJobs() {
    return ['need to implement'];
  }

  async scrapeKthJobs() {
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

      jobs.push({
        jobTitle: jobTitle,
        jobLink: jobLink,
        jobLocation: jobLocation,
        jobFrom: jobFrom,
        jobDeadline: jobDeadline
      });
    });
    return jobs;
  }

  async scrapeEthJobs() {
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
      jobs.push({
        jobLink: jobLink,
        jobTitle: jobTitle,
        jobDetails: jobDetails,
        jobPublishDate: jobPublishDate,
        jobCompany: jobCompany
      });
    });
    return jobs;
  }

  async scrapeUBernJobs() {
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
          jobs.push({
            jobTitle: jobTitle,
            jobLink: jobLink,
            jobDetail: jobDetail,
            jobLocation: jobLocation,
            jobDate: jobDate
          });
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

  async scrapeUzhJobs() {
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
        jobs.push({
          jobTitle: jobTitle,
          jobLink: jobLink,
          jobPercentage: jobPercentage,
          jobFrom: jobFrom
        });
      })

      return jobs;
    });
  
    await browser.close();
    return jobs;
  }

  async scrapeEpflJobs() {
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

      jobs.push({
        jobDate: jobDate,
        jobTitle: jobTitle,
        jobLink: jobLink,
        jobFunction: jobFunction,
        jobLocation: jobLocation
      });

    });
    return jobs;
  }

  async scrapeKulJobs() {
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
        
            jobs.push({
              jobTitle: jobTitle,
              jobFrom: jobFrom,
              jobPercentage: jobPercentage,
              jobDeadline: jobDeadline
            });

          });
          return jobs;
        });
        
        allJobs.push(...jobs);
        i++;
      } catch (error) {
        break;
      }
  }
    await browser.close();
    return allJobs;
  }

  async scrapeTueJobs() {
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

  async scrapeTuDefltJobs() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
  
    page.setDefaultNavigationTimeout(10000);
    await page.goto('https://www.tudelft.nl/en/about-tu-delft/working-at-tu-delft/search-jobs', { waitUntil: 'networkidle2' });
    // Wait for the element to appear in the page
    // Wait for the fetch request to complete
    // await page.waitForResponse(response => {
    //   // Replace 'https://api.example.com/data' with the URL of the fetch request
    //   return response.url().includes('https://emea3.recruitmentplatform.com/fo/rest/jobs');
    // });
    await page.waitForSelector('#talentlinkJobsList', { timeout: 10000 });

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
      return jobs;
    });
    await browser.close();
    return ['need to implement'];
  }

  async scrapeEthGetHired() {
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

          njobs.push({
            jobLocation: jobLocation,
            jobPercentage: jobPercentage,
            jobPublishDate: jobPublishDate,
            jobUni: jobUni,
            jobLink: jobLink
          });

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

        if (nextButton) {
          await (nextButton as ElementHandle<Element>).click();
          await page.waitForNavigation({ timeout: 60000 });
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

}
