import { HttpClient } from '@angular/common/http';
import { Injectable, Output } from '@angular/core';
import { Subject } from 'rxjs'
import { environment } from '../environments/environment.prod'


export interface userArrayStructure {
  _id: string,
  email: string,
  password: string
}

export interface RawCovidDataJsonFormat {
  agebracket: string,
	contractedfromwhichpatientsuspected: string,
	currentstatus: string,
	dateannounced: string,
	detectedcity: string,
	detecteddistrict: string,
	detectedstate: string,
	entryid: string,
	gender: string,
	nationality: string,
	notes: string,
	numcases: string,
	patientnumber: string,
	source1: string,
	source2: string,
	source3: string,
	statecode: string,
	statepatientnumber: string,
	statuschangedate: string,
	typeoftransmission: string
}

@Injectable({providedIn: "root"})
export class AppService {
  constructor(public http: HttpClient) {}

  public covidDataRaw: RawCovidDataJsonFormat[] = [];

  private sharedUserList = new Subject<userArrayStructure>(); //this is used to
  private sharedDashboardData = new Subject();

  private sharedStateNames = new Subject();




  usersFromAPI: userArrayStructure;
    //API_URL = "https://boocovidwebapi1.azurewebsites.net/"
    API_URL = "https://boo-covid19-api.azurewebsites.net"
  //API_URL = "http://localhost:3000";
  //API_URL = "https://boocovid19webapp1.azurewebsites.net"; free service ended as of 6/7/2020

  covid19DataURL = "https://api.covid19india.org/raw_data4.json";

  ingestCovidData() {
    console.log("Entering ingesting data request...");
    this.http.get(this.API_URL + "/ingest")
      .subscribe((res) => {
        console.log("response from ingest data service: ", res);
      })
  }


getStateNames() {
  /*
  this.http.get(this.API_URL + '/statenames')
    .subscribe((res) => {
      //console.log('State Names: ', res);
      this.sharedStateNames.next(res);
    })
    */
  const states = [
    {statename:'Andhra Pradesh',statecode:'AP'},
    {statename:'Arunachal Pradesh',statecode:'AR'},
    {statename:'Assam',statecode:'AS'},
    {statename:'Bihar',statecode:'BR'},
    {statename:'Chhattisgarh',statecode:'CT'},
    {statename:'Goa',statecode:'GA'},
    {statename:'Gujarat',statecode:'GJ'},
    {statename:'Haryana',statecode:'HR'},
    {statename:'Himachal Pradesh',statecode:'HP'},
    {statename:'Jammu and Kashmir',statecode:'JK'},
    {statename:'Jharkhand',statecode:'JH'},
    {statename:'Karnataka',statecode:'KA'},
    {statename:'Kerala',statecode:'KL'},
    {statename:'Ladakh',statecode:'LA'},
    {statename:'Madhya Pradesh',statecode:'MP'},
    {statename:'Maharashtra',statecode:'MH'},
    {statename:'Manipur',statecode:'MN'},
    {statename:'Meghalaya',statecode:'ML'},
    {statename:'Mizoram',statecode:'MZ'},
    {statename:'Nagaland',statecode:'NL'},
    {statename:'Odisha',statecode:'OR'},
    {statename:'Punjab',statecode:'PB'},
    {statename:'Rajasthan',statecode:'RJ'},
    {statename:'Sikkim',statecode:'SK'},
    {statename:'Tamil Nadu',statecode:'TN'},
    {statename:'Tripura',statecode:'TR'},
    {statename:'Uttar Pradesh',statecode:'UP'},
    {statename:'Uttarakhand',statecode:'UT'},
    {statename:'West Bengal',statecode:'WB'},
    {statename:'Telangana',statecode:'TG'},
    {statename:'Andaman and Nicobar',statecode:'AN'},
    {statename:'Chandigarh',statecode:'CH'},
    {statename:'Dadra and Nagar Haveli',statecode:'DN'},
    {statename:'Daman and Diu',statecode:'DD'},
    {statename:'Lakshadweep',statecode:'LD'},
    {statename:'Delhi',statecode:'DL'},
    {statename:'Puducherry',statecode:'PY'}
  ]
  return states;
}
subscribeToStateNames() { //this was invoked in the Dashboard component TS
  return this.sharedStateNames.asObservable();
}

getDashboardData(searchString: string) {

  let queryParam = ''
  if (searchString !== '') {
    queryParam = '?&st=' + searchString;
  } else {
    queryParam = ''
  }
  this.http.get(this.API_URL + '/dash' + queryParam)
    .subscribe((res) => {
      //dashboard data from response cannot be shared back to the dashboard component.
      //so making it as observables
      this.sharedDashboardData.next(res);
      })
}

  subscribeToDashboardData() {
    return this.sharedDashboardData.asObservable();
  }


  getUserListFromAPI() {
    console.log("Entering Service");
    this.http.get(this.API_URL + '/user')
      .subscribe((res: {message: string, users: userArrayStructure}) => {
        console.log(res);
        this.sharedUserList.next(res.users); //emit userList to its subscribers
    })
  }

  subscribeToUserList() {
    console.log("Reaced User List Subscription");
    return this.sharedUserList.asObservable();
  }

}
