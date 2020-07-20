import { Component, OnInit, Input } from '@angular/core';
import { AppService } from '../app.service';
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import { FormControl } from '@angular/forms'
import { Observable } from 'rxjs';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit{

  private covid19data;

  title = "bar chart"
  private svg: any;
  private width = 500;
  private height = 500;
  private x: any;
  private xAxis: any;
  private y: any;
  private yAxis: any;



  private margin = {top: 30, right: 30, bottom: 10, left: 150};
  private format: any;

  public totalConfirmd;
  public totalRecovered;
  public totalDeceased;
  public totalOtherCases;
  public searchString;

  public stateNamesList: string[]=[];
  public stateNamesAndCodes = [
    {statename: "Tamil Nadu", statecode: "TN"},
    {statename: "Kerala", statecode: "KL"}
  ];
  public stateNames = ['Tamil Nadu', 'Kerala'];

//[(ngModel)]="searchString"

  constructor(public appService: AppService) {}

  myControl = new FormControl();
  filteredStates: Observable<string[]>;

// (ngSubmit)="onGetDashboardData(searchString)"

  ngOnInit() {
    this.onGetDashboardData(this.searchString);
    this.onGetStateNames();
    //console.log("value changes", this.myControl.valueChanges.pipe);

    this.filteredStates = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        console.log('input values..', value);
        return this._filter(value)
        })
      );


  }

  clearSearchText() {
    console.log('clearing the input text');
    //this.form.get('searchString').setValue('')
    console.log('string value', this.myControl.get('srchstr'))
    this.searchString='';
  }

  private _filter(value: string): string[] {
    //the filter function expects boolean inside its function body. that should not be inside {}
    const filterValue = value.toLowerCase();
    return this.stateNamesList.filter(state => state.toLowerCase().includes(filterValue));
  }

  public onSelectState(state: string) {
    console.log('selection event', state);
    const stateobj = this.stateNamesAndCodes.filter(row => row.statename.includes(state));
    console.log('seleted state code: ', stateobj[0].statecode);
    return stateobj[0].statecode;
  }

  onGetStateNames() {
    this.stateNamesAndCodes = this.appService.getStateNames();
    for(let s=0; s<this.stateNamesAndCodes.length; s++) {
      this.stateNamesList.push(this.stateNamesAndCodes[s].statename)
    }
    /*
    this.appService.subscribeToStateNames()
      .subscribe((res: []) => {  //{statename: string, statecode: string}
        this.stateNamesAndCodes = res;
        console.log('state names and codes subscribed: ', this.stateNamesAndCodes);
        for(let s=0; s<this.stateNamesAndCodes.length; s++) {
          this.stateNamesList.push(this.stateNamesAndCodes[s].statename)
        }
        console.log('state names list: ', this.stateNamesList);
      });
    */

  }

  displayStateName(value: string) {
    return value? value : undefined;
    //if the incoming stateObject exists, then return the STATE CODE or return undefined
  }


  onGetDashboardData(stateName: string) {
    this.searchString = stateName? this.onSelectState(stateName) : '';
    console.log('state name in the fn.', stateName);
    //this.c19DataFromService = this.appService.getDashboardData();

    this.appService.getDashboardData(this.searchString)
    this.appService.subscribeToDashboardData()
      .subscribe((res: {
          message: string,
          //totalConfirmed: number,
          //totalRecovered: number,
          //totalDeceased: number,
          details: [],
          //cwdata: [{Hospitalized: number, Recovered: Number, Deceased: number, Others: number}]
          summary: [{status: string, cases: number}]
          }) => {
            this.covid19data = res.details;


            console.log("response data from dash api", res.details);

            for (let i=0; i < res.summary.length; i++) {
              switch (res.summary[i].status) {
                case "Hospitalized": {this.totalConfirmd = res.summary[i].cases; break;}
                case "Recovered": {this.totalRecovered = res.summary[i].cases; break;}
                case "Deceased": {this.totalDeceased = res.summary[i].cases; break;}
                default: {this.totalOtherCases = res.summary[i].cases; break;}
              }
            }

            this.initSvg();
            this.setAxis();
            this.drawBars();
            this.drawText();
            this.drawAxis();
      })
  }

  onSearch() {
    console.log("Search String", this.searchString);
  }

  initSvg() {
    d3.selectAll("svg > *").remove();
    this.svg = d3.select('svg')
      .attr("viewBox", [0, 0, this.width, this.height]);
  }

  setAxis() {

    if (this.searchString === '') {this.margin.left=30} else {this.margin.left=150}

    this.x = d3Scale.scaleLinear()
      .domain([0, d3Array.max(this.covid19data, d => d.confirmedCases)])
      .range([this.margin.left, this.width - this.margin.right]);
    this.y = d3Scale.scaleBand()
      //.domain(d3Array.range(covid19data.length))
      .domain(d3Array.range(this.covid19data.length))
      .rangeRound([this.margin.top, this.height - this.margin.bottom])
      .padding(0.1);
    this.xAxis = g => g
      .attr("transform", `translate(0,${this.margin.top})`)
      .call(d3Axis.axisTop(this.x).ticks(this.width / 80, "f"))
      .call(g => g.select(".domain").remove())

    this.yAxis = g => g
    //.data(covid19data)
    //attr("transform", d => `translate(${d3Array.max(d.stateCode)},0)`)
    .attr("transform", `translate(${this.margin.left},0)`)
    .attr("color", "grey")
    .attr("font-size", 6)
    .call(
      d3Axis.axisLeft(this.y).tickFormat(i => this.covid19data[i].name).tickSizeOuter(0)
      )
    this.format = this.x.tickFormat(10, "f");
  }

  drawBars() {
    this.svg.append("g")
        .attr("fill", "steelblue")
      .selectAll("rect")
      //.data(covid19data)
      .data(this.covid19data.sort(function(b,a) { return +a.confirmedCases - +b.confirmedCases; }),
          function(d) { return d.name; })
      .join("rect")
        .attr("x", this.x(0))
        .attr("y", (d, i) => this.y(i))
        .attr("width", (d) => this.x(d.confirmedCases) - this.x(0))
        .attr("height", this.y.bandwidth());
  }

  drawText() {
    this.svg.append("g")
    .attr("fill", "white")
    .attr("text-anchor", "end")
    .attr("font-family", "sans-serif")
    .attr("font-size", 8)
  .selectAll("text")
  .data(this.covid19data)
  .join("text")
    .attr("x", d => this.x(d.confirmedCases))
    .attr("y", (d, i) => this.y(i) + this.y.bandwidth() / 2)
    .attr("dy", "0.35em")
    .attr("dx", -4)
    .text(d => this.format(d.confirmedCases))
  .call(text => text.filter(d => this.x(d.confirmedCases) - this.x(0) < 20) // short bars
    .attr("dx", +4)
    .attr("fill", "black")
    .attr("text-anchor", "start"));
  }

  drawAxis() {
    this.svg.append("g")
      .call(this.xAxis);
    this.svg.append("g")
      .call(this.yAxis);
  }

}
