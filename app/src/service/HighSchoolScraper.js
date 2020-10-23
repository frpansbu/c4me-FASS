const puppeteer = require("puppeteer-firefox");
const filename = './src/service/highschools.txt';
const fs = require("fs");

module.exports = {
    async scrapedHS (url, callback) {
    try {
        
        let highschoolURL ='https://www.niche.com/k12/';
        var hsList = fs.readFileSync(filename).toString().split("\n");
        //list to store in db
        var highschoolList = [];
        console.log("Before page.launch");
        var browser = await puppeteer.launch({ headless: true,
          args: ['--unlimited-storage','--full-memory-crash-report','--disable-gpu','--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox'] });
          // Open a new page
        var page = await browser.newPage();

        await page.setDefaultNavigationTimeout(0);
        page.on('error', err=> {
          console.log('error happen at the page: ', err);
       
        });
      //for (var i = 0; i < hsList.length; i++) {
  
      for (var i = 0; i < 10; i++) {

      var hsInfo = new Object();
      
      var hsURL = highschoolURL.concat(hsList[i].trim()).concat("/academics");

      console.log("Going to URL:", hsURL);
 
      await page.goto(hsURL).catch(e => console.error(e));

      hsInfo ={
        Name: null,
        GradRate: null,
        State: null,
        Ranking: null,
        AvgSATMath: null,
        AvgSATEBRW: null,
        AvgACTComposite: null,
        Type: null
      };
 
        console.log("Evaluating page data now:");

        let title =  await page.evaluate(()=> document.querySelector('#header span.postcard__title').innerText.split("\n"));
        //console.log("NAME SCRAPED: ", title);
        hsInfo.Name = title[0];
        if(await page.evaluate(()=>document.querySelector('#header div.postcard__badge').hasChildNodes())){
        let rank =  await page.evaluate(()=>document.querySelector('#header div.postcard__badge em ').innerText.split("#"));
       // console.log("Rank Scraped", rank);
        hsInfo.Ranking = parseInt(rank[1]);
        }else {hsInfo.Ranking = "";}

        if("scalar__value" == await page.evaluate(()=>document.querySelector('#about-academics div.scalar').childNodes[1].className)){
        let grad =  await page.evaluate(()=>document.querySelector('#about-academics div.scalar__value span').innerHTML.split("%"));
      //  console.log("grad scraped",grad);
        hsInfo.GradRate = parseInt(grad[0]);
        }else{hsInfo.GradRate ="";}

        if("scalar__value" == await page.evaluate(()=>document.querySelector('#sat-act-scores div.profile__bucket--2 div.scalar').childNodes[1].className)){
        let act =  await page.evaluate(()=>document.querySelector('#sat-act-scores div.profile__bucket--2 div.scalar div.scalar__value').innerHTML.split("<", 2));
      //  console.log("act scraped",act);
        hsInfo.AvgACTComposite = parseInt(act[0]);
        }else { hsInfo.AvgACTComposite = "";}

        if("scalar__value" == await page.evaluate(()=> document.querySelector('#sat-act-scores div.profile__bucket--1 div.scalar--three').childNodes[1].className)){
        let math = await page.evaluate(()=> document.querySelector('#sat-act-scores div.profile__bucket--1 div.scalar--three div.scalar__value').innerHTML.split("<",2));
      //  console.log("math scraped",math);
        hsInfo.AvgSATMath = parseInt(math[0]);
        }else { hsInfo.AvgSATMath = "";}

        if("scalar__value" == await page.evaluate(()=> document.querySelector('#sat-act-scores div.profile__bucket--1 div.blank__bucket div:nth-child(3)').childNodes[1].className)){
        let verbal =  await page.evaluate(()=>document.querySelector('#sat-act-scores div.profile__bucket--1 div.blank__bucket div:nth-child(3) div.scalar__value').innerHTML);
      //  console.log("verbal scraped",verbal);
        hsInfo.AvgSATEBRW = parseInt(verbal);
        }else{ hsInfo.AvgSATEBRW = "";}

        type1 =  await page.evaluate(()=>document.querySelector('#header ul li:nth-child(2)').innerHTML.split(", "));
      //  console.log("type1 scraped",type1);
        hsInfo.Type = type1[0];
        let state1 = await page.evaluate(()=> document.querySelector('#header ul li:nth-child(4)').innerHTML.split(", "));
      // console.log("state1 scraped", state1);
        hsInfo.State = state1[state1.length-1];
      
      
        Object.keys(hsInfo).forEach(function(key){
          if(hsInfo[key] == "")
          hsInfo[key] = 'N/A';
          return hsInfo;
      });
 //  }); //evaluate method end

  // console.log("HsInfo has:", hsInfo);
   highschoolList.push(hsInfo);

 } // for-loop end
   
    await browser.close();
  //  console.log("Browser Closed");
    return highschoolList;
    } catch (err) {
        console.log("ERROR IN SCRAPEHS",err);
    }
}
}