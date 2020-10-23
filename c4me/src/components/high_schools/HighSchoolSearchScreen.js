import React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'redux';

import firebase, { db } from "../../firebase";

class HighSchoolSearchScreen extends React.Component {
  constructor(props){
    super(props);

  }
  state={
    Name: null,
    highschools: {},
    GradRate: null,
    State: null,
    Ranking: null,
    AvgSATMath: null,
    AvgSATEBRW: null,
    AvgACTComposite: null,
    Type: null
  }


  sortTasks(sortingCriteria) {
    
    let list = Object.entries(this.state.highschools);
  //  console.log(list); 
    list.sort(this.compareSimilarValues);
    list = list.splice(0,list.length/2 +1);
    let newList = {};
    list.map((data)=>{
      console.log(data);
      newList[data[0]] = data[1];
    });

    console.log(newList);
    this.setState({highschools:newList}); 
  }


  handleChange = (e) =>{
    const { target } = e;

    this.setState(state => ({
      ...state,
      [target.id]: target.value,
    }));
  }

//submit highschool search
  handleSubmit = (e) =>{
    e.preventDefault();
    var highDict = {};
    let highRef = db.collection('ScrapedHighschoolData');

    if(this.state.Name != null ){
      const allHighschools = highRef.get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          highDict[doc.data().Name] = {
            GradRate: doc.data().GradRate,
            AvgACTComposite: doc.data().AvgACTComposite,
            AvgSATEBRW: doc.data().AvgSATEBRW,
            AvgSATMath: doc.data().AvgSATMath,
            State: doc.data().State,
            Type: doc.data().Type,
            Name: doc.data().Name,
            Ranking: doc.data().Ranking
          };
          if(this.state.Name != ""){ 
            var str1 = this.state.Name;
            var str2 = doc.data().Name;

            if(str1.toLowerCase() ===str2.toLowerCase()){
        //    console.log("Found matching HIGHSCHOOL", str1);
              this.setState({
              GradRate: doc.data().GradRate,
              AvgACTComposite: doc.data().AvgACTComposite,
              AvgSATEBRW: doc.data().AvgSATEBRW,
              AvgSATMath: doc.data().AvgSATMath,
              State: doc.data().State,
              Type: doc.data().Type,
              Name: doc.data().Name,
              Ranking: doc.data().Ranking

            });
          }
        }
        });
      })
      .then(() => {
      //  console.log("Finisheddddd Search");
        this.setState({highschools:highDict});
        alert("Finished Searching");
        //check if the entered highschool is in the system

        if(this.state.Name in highDict){
        this.findSimilarity(highDict);
        this.sortTasks("similarValue");

        }

      });
     
     return;
   }
  }

  compareScore(a,b, total){
    let score = 0;
    if (a == b){
      return 1;
    }
    let difference = Math.abs(a - b);
    score = (total - difference) / total;
  //  console.log("value in compareScore is: difference, score",difference, score);
    return score;
  }

findSimilarity(hsDict){
  let similarity;
  let temp;
  for (var key in hsDict) {
    //console.log("In FindSimilarity Function:",key, hsDict[key]);
    similarity = 0;
    //comparisons
    temp = hsDict[key];
    
    console.log("NOW SIMILARITY = ", similarity);
    if(temp.AvgACTComposite == "" && this.state.AvgACTComposite == "")
      similarity += this.compareScore(hsDict[key].AvgACTComposite, this.state.AvgACTComposite, 36.00);
    else
      similarity += 1.00;

      console.log("NOW SIMILARITY = ", similarity);
    if(temp.AvgSATEBRW == "" && this.state.AvgSATEBRW == "")
      similarity += this.compareScore(hsDict[key].AvgSATEBRW, this.state.AvgSATEBRW, 800.00);
    else
      similarity += 1.00;

      console.log("NOW SIMILARITY = ", similarity);
    if(temp.AvgSATMath == "" && this.state.AvgSATMath == "")
      similarity += this.compareScore(hsDict[key].AvgSATMath, this.state.AvgSATMath, 800.00);
    else
      similarity += 1.00;

      console.log("NOW SIMILARITY = ", similarity);
    if(temp.GradRate == "" && this.state.GradRate == "")
      similarity += this.compareScore(hsDict[key].GradRate, this.state.GradRate, 100.00);
    else
      similarity += 1.00;

      console.log("NOW SIMILARITY = ", similarity);
    if(temp.Ranking == "" && this.state.Ranking == "")
      similarity += this.compareScore(hsDict[key].Ranking, this.state.Ranking, 100.00);
    else
      similarity += 1.00;

      console.log("NOW SIMILARITY = ", similarity);
    if(temp.Type && this.state.Type)
      similarity += this.compareStrings(hsDict[key].Type, this.state.Type);
    else
      similarity += 0.25;

      console.log("NOW SIMILARITY = ", similarity);
    if(temp.State && this.state.State)
      similarity += this.compareStrings(hsDict[key].State, this.state.State);
    else
      similarity += 0.25;
   console.log("\nSimilarity of:",key, similarity);
   hsDict[key].SimilarValue = similarity;
}
}

compareStrings(a,b){
  if(a!=null){
  if(a.toLowerCase()==b.toLowerCase()){
      return 0.25;
  }
}
  return 0;
}
//comparator used by sort function
compareSimilarValues(item1,item2) {
  if (item1[1]["SimilarValue"] > item2[1]["SimilarValue"])
      return -1;
  else if (item1[1]["SimilarValue"] < item2[1]["SimilarValue"])
      return 1;
  else
      return 0;
}


  render() {
    return (
      <div className="outlet">
        <div className="highschool-list-container">
        <form onSubmit={this.handleSubmit}>
            <div className="filter-item">
              <div className="filter-name-label">Enter Highschool:</div>
              <div className="filter-name">
                <input className="filter-name" type="text" id="Name" onChange={this.handleChange} ></input>
              </div>
            </div>
                <button type="submit" className="btn green lighten-1">Search</button>
                </form>

          {(Object.keys(this.state.highschools).length > 0 && this.state.Name in this.state.highschools)  ? (
            <div>
              <div className="search-num-highschools">
                {Object.keys(this.state.highschools).length-1} Similar Highschools found...
              </div>
              <table className="striped">
                <thead>
                  <tr>
                      <th className="search-header">Name</th>
                      <th className="search-header">Ranking</th>
                      <th className="search-header">State</th>
                      <th className="search-header">Avg SAT</th>
                      <th className="search-header">Avg ACT</th>
                      <th className="search-header">School Type</th>
                  </tr>
                </thead>

                <tbody>
                  {Object.keys(this.state.highschools).map((highschool) => {
                    
                    
                    let temp = this.state.highschools[highschool];
                    if(temp["Name"] != this.state.Name){
                    return  <tr className="search-item">
                                <td className="search-item-name"><Link to={{pathname: "/high_schools/", info: {temp}}} className="search-item-name">{highschool}</Link></td>
                                
                                {temp["Ranking"] ? (<td className="search-item">{temp["Ranking"]}</td>) : (<td className="search-item">N/A</td>)}
                                
                                {temp["State"] ? (<td className="search-item">{temp["State"]}</td>) : (<td className="search-item">N/A</td>)}
                                
                                {(temp["AvgSATMath"] && temp["AvgSATMath"] != 'N/A') ? (<td className="search-item">{temp["AvgSATMath"] + temp["AvgSATEBRW"] }</td>) : (<td className="search-item">N/A</td>)}

                                {temp["AvgACTComposite"] ? (<td className="search-item">{temp["AvgACTComposite"]}</td>) : (<td className="search-item">N/A</td>)}
                                
                                {temp["Type"] ? (<td className="search-item">{temp["Type"]}</td>) : (<td className="search-item">N/A</td>)}
                                
                                <td className="search-item"></td>
                            </tr>
                  }
                  })}
                </tbody>
              </table>
            </div>
          ) : (<div className="search-num-colleges">
            Please enter High School and select "Search."
          </div>)}
        </div>

      </div>
    );
  };
}

export default compose()(HighSchoolSearchScreen);