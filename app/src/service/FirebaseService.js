const firebase = require('firebase');

const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyCzdKgJKjJweCBpgQ6ifA1yrwgRthdOdxM",
    authDomain: "c4me-729ad.firebaseapp.com",
    databaseURL: "https://c4me-729ad.firebaseio.com",
    projectId: "c4me-729ad",
    storageBucket: "c4me-729ad.appspot.com",
    messagingSenderId: "839711745341",
    appId: "1:839711745341:web:fda5079ac455a3598cd154",
    measurementId: "G-6M38QQ76Q1"
});

const db = firebaseApp.firestore();

module.exports = {
    update(collegeInfo) {

        console.log('Updating firebase DB...');
        Object.keys(collegeInfo).forEach(function(key){
            try{
                var datum = collegeInfo[key];
                db.collection("ScrapedCollegeData").doc(datum.name).set({
                    name: datum.name,
                    location: datum.location,
                    avg_gpa: datum.avg_gpa,
                    num_ugrads: datum.num_ugrads,
                    room_and_board: datum.room_and_board,
                    stats_salary: datum.stats_salary,
                    tuition_fees: datum.tuition_fees,
                    act_ENG25: datum.actENG25,
                    act_ENG75: datum.actENG75,
                    act_Math25: datum.actMath25,
                    act_Math75: datum.actMath75,
                    act_Write25: datum.actWrite25,
                    act_Write75: datum.actWrite75,
                    sat_Math25: datum.satMath25,
                    sat_Math75: datum.satMath75,
                    sat_Avg: datum.satAvg,
                    sat_Read25: datum.satRead25,
                    sat_Read75: datum.satRead25,
                    sat_ReadMid: datum.satReadMid,
                    sat_Write25: datum.satWrite25,
                    sat_Write75: datum.satWrite75,
                    sat_WriteMid: datum.satWriteMid,
                    admission_rate: datum.admission_rate,
                    rank: datum.rank
                    
            });
        } catch(err) {
            console.log("error storing to firebase")
            console.log(err)

        }
        });
    }
}