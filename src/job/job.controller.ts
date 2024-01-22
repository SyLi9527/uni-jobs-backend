import { Controller, Get, } from '@nestjs/common';
import { JobService } from './job.service';

@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Get('/cth-jobs')
  async scrapeCthJobs(): Promise<string[]> {
    return this.jobService.scrapeCthJobs();

  }

  // TODO: need to implement this function
  @Get('/uva-jobs')
  async scrapeUvaJobs(): Promise<string[]> {
    return this.jobService.scrapeUvaJobs();
  }

  @Get('/kth-jobs')
  async scrapeKthJobs(): Promise<string[]> {
    return this.jobService.scrapeKthJobs();
  }

  @Get('/tue-jobs')
  async scrapeTueJobs(): Promise<string[]> {

    return this.jobService.scrapeTueJobs();
  }

  @Get('/kul-jobs')
  async scrapeKulJobs(): Promise<string[]> { 
    return this.jobService.scrapeKulJobs();
  }

  // TODO: not working since I cant get the job list
  @Get('/tudelft-jobs')
  async scrapeTuDefltJobs() {
    return this.jobService.scrapeTuDefltJobs();
  }

  @Get('/unibe-jobs')
  async scrapeUBernJobs(): Promise<string[]> {
    
    return this.jobService.scrapeUBernJobs();
  }

  @Get('/uzh-jobs')
  async scrapeUzhJobs(): Promise<string[]> {
    return this.jobService.scrapeUzhJobs();
  }

  @Get('/epfl-jobs')
  async scrapeEpflJobs(): Promise<string[]> {
    return this.jobService.scrapeEpflJobs();
  }

  @Get('/eth-jobs')
  async scrapeEthJobs(): Promise<string[]> {
    return this.jobService.scrapeEthJobs();
  }

  // TODO: it seems eth get hired has anti scraping measures, implement multiple pages one
  @Get('/eth-get-hired')
  async scrapeEthGetHired() {  
    return this.jobService.scrapeEthGetHired();
  }
  
}
