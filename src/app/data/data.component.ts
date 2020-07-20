import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';


@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.css']
})
export class DataComponent {

  public myKey='';
  public unlock = false;
  public dataLoadProcessIsRequested = false;
  public dataLoadProcessInProgress = true;


  incorrectKeyMessage='Enter unlock keys';

  constructor (private appService: AppService){}


  onDataLoadRequest() {
    this.dataLoadProcessIsRequested = true;
    this.dataLoadProcessInProgress = true;
    console.log("Calling the ingestCovidData() from the onClick event of Load Data button");

    this.appService.ingestCovidData();
    this.dataLoadProcessInProgress =false;
    this.dataLoadProcessIsRequested = false;
  }

  /*
  onLoadBatchData() {
    console.log("Requesting for loading batch data");
    this.appService.loadBatchData();
  }
  */

  onEnterUnlockKeys() {
    if (this.myKey === '7895') {
      this.unlock=true;
      this.incorrectKeyMessage = '';
    } else {
      this.unlock=false
      this.incorrectKeyMessage = "Wrong key. Try again."
    }

  }

}
