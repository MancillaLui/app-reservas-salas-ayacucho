import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'tests/browser',workers:1,timeout:30000,
  use:{baseURL:process.env.BASE_URL||'http://127.0.0.1:3000',channel:'chrome',headless:true,viewport:{width:1365,height:1000}},
  reporter:[['list'],['json',{outputFile:'test-results/browser.json'}]],
  outputDir:'test-results/browser-artifacts'
});
