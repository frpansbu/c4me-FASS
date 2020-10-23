var express = require('express');
var router = express.Router();

var ScraperService = require('../service/CollegeScraperService');
var FirebaseService = require('../service/FirebaseService');

var HighSchoolScraper = require('../service/HighSchoolScraper');

router.get('/', function(req, res, next) {
    console.log('API Root Called');
    res.json('Please specify a route to get a response');
    
});

//async
router.get('/scrape', async(req, res, next) =>{
    console.log('routing scrape collegedata.com');
    
    //call scrape function, async await
    const out = await ScraperService.scrapeCone("url");

    //console.log(out)
    res.json(out);
});

//scrape all sources
router.get('/scrape/updatefirebase', async(req, res, next) =>{
    console.log('routing scrape collegedata.com');
    
    //call scrape function, async await
    const out = await ScraperService.scrapeAndStore("url");
    
    //send to firebase
    error = await FirebaseService.update(out);
 
    //console.log(error);
    res.json(out);
});

//scrape only csv file
router.get('/scrape/updateCsv', async(req, res, next) =>{
    console.log('routing scrape collegedata.com');
    
    //call scrape function, async await
    const out = await ScraperService.scrapeCSV("url");
 
    res.json(out);
});

router.get('/scrapehighschools', async(req, res, next) =>{
    console.log('routing scrape niche.com');
    
    //call scrape function, async await
    const out = await HighSchoolScraper.scrapedHS("url");
     //send to firebase
     error = await FirebaseService.updateHs(out);

    //console.log(out)
    res.json(out);
});


module.exports = router;