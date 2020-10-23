const axios = require('axios');
const cheerio = require('cheerio');
const csv = require('csv-parser');
const neatCsv = require('neat-csv');
const fs = require("fs");


const filename = './src/resources/colleges.txt';
const csvFilename = './src/resources/collegescorecard.csv';
const wsjURL = 'http://allv22.all.cs.stonybrook.edu/~stoller/cse416/WSJ_THE/index.html';
const cdURLpartial = 'http://allv22.all.cs.stonybrook.edu/~stoller/cse416/collegedata/';

module.exports = {
    async scrapeAndStore(url, callback){
        console.log("Scraping.....");
        var collegeList = getCollegeList(filename);
    
        let wsjRes = await axios.get(wsjURL);
        const $ = cheerio.load(wsjRes.data);

        var jsonRes = [];
        //--------------------------------------------
        // scrape the website mirrors
        for (var i = 0; i < collegeList.length; i++) { 
            process.stdout.cursorTo(0);
            process.stdout.write('Scraping Web for ' + (i+1) + '/' + collegeList.length + ' colleges');
 
            var collegeInfo = new Object();
            collegeInfo.name = collegeList[i]; // actual name
            //formatted names
            collegeInfo.sys_name_cdcom = getCollegeNameForWeb(collegeInfo.name);
            collegeInfo.sys_name_wsj = getCollegeNameForWSJ(collegeInfo.name);
            collegeInfo.sys_name_csv = getCollegeNameForCsv(collegeInfo.name)
            
            // create url to scrape for WSJ
            var cdURL = cdURLpartial.concat(collegeInfo.sys_name_cdcom);

            // scrape WSJ
            // scrape for the table div containing the college name
            collegeInfo.tuition_fees = $('a:contains("' + collegeInfo.name + '")').parent().parent().find('.stats_fees_oos').text();
            collegeInfo.room_and_board = $('a:contains("' + collegeInfo.name + '")').parent().parent().find('.stats_board').text();
            collegeInfo.stats_salary = $('a:contains("' + collegeInfo.name + '")').parent().parent().find('.stats_salary').text();
            collegeInfo.rank = $('a:contains("' + collegeInfo.name + '")').parent().parent().find('.rank').text().replace(/\=/g, "");
            
            if(collegeInfo.rank.length > 3){
                let r = collegeInfo.rank;
                r = r.slice(r.length - 3);
                collegeInfo.rank = r;
            }
            if(
                collegeInfo.tuition_fees == undefined |
                collegeInfo.room_and_board == undefined |
                collegeInfo.stats_salary == undefined |
                collegeInfo.rank == undefined 
            ){
                console.log("WJS UNDEEFFF");
                console.log(collegeInfo.name);
            }
            // scrape collegedata.com
            collegeInfo = await scrapeCdCom(collegeInfo, cdURL);
            jsonRes.push(collegeInfo);
            process.stdout.clearLine();
        }
        
        console.log('\nScraping collegescorecard.csv...');
        // -------------------------------------------------------
        // now attach collegescorecard data to the college objects
        var collegeList = getCollegeList(filename);
        //do scrape
        csvData = await scrapeFileDataMem(collegeList);
        // attach to out array
        Object.keys(csvData).forEach(function(csvkey){
            Object.keys(jsonRes).forEach(function(wkey){
                if(csvData[csvkey].sys_name_csv == jsonRes[wkey].sys_name_csv){
                    jsonRes[wkey].admission_rate = csvData[csvkey].admission_rate;
                    jsonRes[wkey].satRead25 = csvData[csvkey].satRead25;
                    jsonRes[wkey].satRead75 = csvData[csvkey].satRead75;
                    jsonRes[wkey].satReadMid = csvData[csvkey].satReadMid;
                    jsonRes[wkey].satWrite25 = csvData[csvkey].satWrite25;
                    jsonRes[wkey].satWrite75 = csvData[csvkey].satWrite75;
                    jsonRes[wkey].satWriteMid = csvData[csvkey].satWriteMid;
                    jsonRes[wkey].satMath25 = csvData[csvkey].satMath25;
                    jsonRes[wkey].satMath75 = csvData[csvkey].satMath75;
                    jsonRes[wkey].satMathMID = csvData[csvkey].satMathMID;
                    jsonRes[wkey].satAvg = csvData[csvkey].satAvg;
                    jsonRes[wkey].actENG25 = csvData[csvkey].actENG25;
                    jsonRes[wkey].actENG75 = csvData[csvkey].actENG75;
                    jsonRes[wkey].actMath25 = csvData[csvkey].actMath25;
                    jsonRes[wkey].actMath75 = csvData[csvkey].actMath75;
                    jsonRes[wkey].actWrite25 = csvData[csvkey].actWrite25;
                    jsonRes[wkey].actWrite75 = csvData[csvkey].actWrite75;
                    jsonRes[wkey].actAvg = csvData[csvkey].actAvg;
                    jsonRes[wkey].ug = csvData[csvkey].ug;
                    jsonRes[wkey].ugds = csvData[csvkey].ugds;
                    jsonRes[wkey].control = csvData[csvkey].control;
                    jsonRes[wkey].grad_debt_mdn = csvData[csvkey].grad_debt_mdn;
 
                }
            });
        });

        // sanitize null and undefined properties
        jsonRes.forEach(function (collegeInfo) {
            Object.keys(collegeInfo).forEach(function(key){
                if(collegeInfo[key] == "" || collegeInfo[key] == undefined 
                 || collegeInfo[key] == 'NULL' || collegeInfo[key] == 'null')
                    collegeInfo[key] = null;
                return collegeInfo;
            });
        });
        
        return jsonRes;
    },

    //--------------------------------------------------
    //only scrapes the csv file and loads it into memory
    //--------------------------------------------------
    async scrapeCSV(url, callback){
        var out = []
        var collegeList = getCollegeList(filename);
        var collegeListFormatted = getCollegeList(filename);

        //format the name string for each college
        for(i = 0; i < collegeList.length; i++) {
            collegeListFormatted[i] = collegeListFormatted[i].replace(/ /g, '-');
            collegeListFormatted[i] = collegeListFormatted[i].replace(/,/g, '');
        }

        for(i = 0; i < collegeList.length; i++) {
            try{
                // name
                var collegeInfo = new Object();
                collegeInfo.name = collegeList[i];
                collegeInfo.name_formatted = collegeListFormatted[i]

                //do other scraping

                out.push(collegeInfo)
            } catch (err) {
                console.log("Error scraping for CSV")
            }
        }
        // now scrape the entire collegeDataScorecard
        out = await scrapeFileDataMem(collegeList);
        return out;
    }
}

function getCollegeList(filestring){
    //open file
    var lines = fs.readFileSync(filestring).toString().split("\n");
    lines = lines.map(function(x){return x.replace( /[\r\n]+/gm, "" );});
    return lines;
}

//returns collegeInfo object containt CollegeData.com data
async function scrapeCdCom(collegeInfo, cdURL){
    try {
        let cdcomRes = await axios.get(cdURL)
        const $ = cheerio.load(cdcomRes.data);

        collegeInfo.location = $('html').find("#main > div.container-fluid > div > div.col-lg-8 > p").text();
        collegeInfo.num_ugrads = $('html').find("#profile-overview > div.statbar > div:nth-child(3) > div > span.h2").text();
        collegeInfo.avg_gpa = $('html').find("#profile-overview > div:nth-child(4) > div > dl:nth-child(4) > dd:nth-child(2)").text();
    } catch (error){
        console.log("[error getting data from collegeinfo]");
        console.log(collegeInfo.name);
    }
    return collegeInfo;
}

async function scrapeFileDataMem(collegeList){
    var collegeListRaw = collegeList;
    //formatting for name field
    for(i = 0; i < collegeList.length; i++) {
        collegeList[i] = getCollegeNameForCsv(collegeList[i]);
    }
    var cbeans = [];
    let promise = new Promise(function(resolve, reject){
        fs.createReadStream(csvFilename)
            .pipe(csv())
            .on('data', (row) => {
                if(collegeList.indexOf(row.INSTNM) > -1){
                    var cbean = new Object()
                    //now update the college 
                    cbean.sys_name_csv = row.INSTNM;
                    // sat percentiles
                    cbean.satRead25 = row.SATVR25;
                    cbean.satRead75 = row.SATVR75;
                    cbean.satReadMid = row.SATVRMID;
                    cbean.satWrite25 = row.SATWR25;
                    cbean.satWrite75 = row.SATWR75;
                    cbean.satWriteMid = row.SATWRMID;
                    cbean.satMath25 = row.SATMT25;
                    cbean.satMath75 = row.SATMT75;
                    cbean.satMathMID = row.SATMTMID;
                    cbean.satAvg = row.SAT_AVG;

                    //act percentiles
                    cbean.actENG25 = row.ACTEN25;
                    cbean.actENG75 = row.ACTEN75;
                    cbean.actMath25 = row.ACTMT25;
                    cbean.actMath75 = row.ACTMT75;
                    cbean.actWrite25 = row.ACTWR25;
                    cbean.actWrite75 = row.ACTWR75;
                    cbean.actAvg = row.A;

                    //other misc
                    cbean.ug = row.UG;
                    cbean.ugds = row.UGDS;
                    cbean.admission_rate = row.ADM_RATE;
                    cbean.admission_rate_all = row.ADM_RATE_ALL;
                    cbean.control = row.CONTROL;
                    cbean.grad_debt_mdn = row.GRAD_DEBT_MDN;

                    // Now push the college info obj into the list
                    cbeans.push(cbean);
                    collegeList.splice(collegeList.indexOf(row.INSTNM), 1);
                }
            }).on('end', () => {
                console.log('CSV file successfully processed');
                console.log('Could not find colleges: ', collegeList)
                resolve();
            });
        return '1';
        }).then(function(result){
            return result;
        });
        let res = await promise;
        return cbeans;
}




function getCollegeNameForWeb(name){
    //custom string formatting for certain schools
    if(name == 'Franklin & Marshall College'){
        name ='Franklin Marshall College';
    }
    if(name == 'SUNY College of Environmental Science and Forestry'){
        name ='State University of New York College of Environmental Science and Forestry';
    }
    if(name == 'The College of St Scholastica'){
        name ='College of St Scholastica';
    }
    if(name == 'The College of Wooster'){
        name ='College of Wooster';
    }
    if(name == 'Washington & Jefferson College'){
        name ='Washington Jefferson College';
    }
    return name.replace(/ /g, '-').replace(/,/g, '');
}

function getCollegeNameForWSJ(name){
    
    return name;
}

function getCollegeNameForCsv(name){
    if(name == 'Franklin & Marshall College'){
        name = 'Franklin and Marshall College';
    }
    if(name == 'Indiana University Bloomington'){
        name ='Indiana University-Bloomington';
    }
    if(name == 'University of Alabama'){
        name ='The University of Alabama'
    }
    if(name == 'University of Massachusetts Amherst'){
        name ='University of Massachusetts-Amherst'
    }
    if(name == 'University of Montana'){
        name ='The University of Montana'
    }
    if(name == 'The College of St Scholastica'){
        name ='The College of Saint Scholastica';
    }
    return name.replace(/, /g, '-');
}


async function scrapeFileData(collegeInfo){
    let promise = new Promise(function(resolve, reject){
        var cnameregex = collegeInfo.name.replace(/ ,/g, '-');
        var res = '1';
        fs.createReadStream(csvFilename)
            .pipe(csv())
            .on('data', (row) => {
                if(cnameregex == row.INSTNM){
                    
                    //now update the college 
                    collegeInfo.admissionRate = row.ADM_RATE;
                    //sat scores percentiles
                    collegeInfo.satRead25 = row.SATVR25;
                    collegeInfo.satRead75 = row.SATVR75;
                    collegeInfo.satReadMid = row.SATVRMID;

                    collegeInfo.satWrite25 = row.SATWR25;
                    collegeInfo.satWrite75 = row.SATWR75;
                    collegeInfo.satWriteMid = row.SATWRMID;

                    collegeInfo.satMath25 = row.SATMT25;
                    collegeInfo.satMath75 = row.SATMT75;
                    collegeInfo.satMathMID = row.SATMTMID;
            
                    collegeInfo.satAvg = row.SAT_AVG;

                    //act scores
                    collegeInfo.actENG25 = row.ACTEN25;
                    collegeInfo.actENG75 = row.ACTEN75;
                    
                    collegeInfo.actMath25 = row.ACTMT25;
                    collegeInfo.actMath75 = row.ACTMT75;

                    collegeInfo.actWrite25 = row.ACTWR25;
                    collegeInfo.actWrite75 = row.ACTWR75;
                    
                    collegeInfo.actAvg = row.A;

                }
            }).on('end', () => {
                console.log('CSV file successfully processed');
                resolve();
            });
        return '1';
        }).then(function(result){
            return result;
        });
        let res = await promise;
        return res;
}

