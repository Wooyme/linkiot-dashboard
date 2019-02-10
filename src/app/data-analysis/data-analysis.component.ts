import { Component, NgZone, OnInit } from '@angular/core';
import { DefaultService, Device, Sensor } from '../../api';

@Component({
  selector: 'app-data-analysis',
  templateUrl: './data-analysis.component.html',
  styleUrls: ['./data-analysis.component.css']
})
export class DataAnalysisComponent implements OnInit {

  selectedChartIndex: string = '0';
  chartsSettings = [
    {type: 'line', class: 'col-lg-3', title: '折线图(小)'},
    {type: 'line', class: 'col-lg-6', title: '折线图(中)'},
    {type: 'line', class: 'col-lg-12', title: '折线图(大)'},
    {type: 'bar', class: 'col-lg-3', title: '柱状图(小)'},
    {type: 'bar', class: 'col-lg-6', title: '柱状图(中)'},
    {type: 'bar', class: 'col-lg-12', title: '柱状图(大)'}
  ];
  limit: number = 10;

  devices: Device[] = [];
  pageDevice: number = 1;
  maxPageDevice: number;
  selectedDevice: Device = null;


  sensors: Sensor[] = [];
  pageSensor: number = 1;
  maxPageSensor: number;
  selectedSensor: Sensor = null;

  maxData: number;

  chartOptions: { name: string, class: string, option: any, offset: number[], end: number[] }[] = [];
  chartInstances: any[] = [];

  removeMode:boolean = false;
  constructor(private api: DefaultService) {
  }

  ngOnInit() {
    this.refreshDevice();
    const charts = JSON.parse(localStorage.getItem('charts'));
    if (Array.isArray(charts)) {
      charts.forEach(value => {
        this.chartOptions.push(value);
      });
    }
  }

  clear(){
    this.chartOptions = [];
    localStorage.setItem("charts",JSON.stringify(this.chartOptions));
  }

  remove(i:number){
    this.chartOptions.splice(i,1);
    this.chartInstances.splice(i,1);
    localStorage.setItem('charts', JSON.stringify(this.chartOptions));
  }

  refreshDevice() {
    this.api.countDevices().subscribe(value => {
      this.maxPageDevice = Math.ceil(value.count / this.limit);
    });
    this.api.listDevices((this.pageDevice - 1) * this.limit, this.limit).subscribe((devices: Device[]) => {
      this.devices = [];
      devices.forEach(value => {
        try {
          value['image'] = JSON.parse(value.description)['image'];
          console.log(value['image']);
        } catch (e) {
        }
        this.devices.push(value);
      });
    });
  }

  refreshSensor() {
    this.api.countSensors(this.selectedDevice.deviceId).subscribe(value => {
      this.maxPageSensor = Math.ceil(value.count / this.limit);
    });
    this.api.getSensors(this.selectedDevice.deviceId, (this.pageSensor - 1) * this.limit, this.limit).subscribe(value => {
      this.sensors = [];
      value.forEach(v => {
        this.sensors.push(v);
      });
    });
  }

  countData() {
    this.api.countData(this.selectedDevice.deviceId, this.selectedSensor.id).subscribe(value => {
      this.maxData = value.count;
    });
  }

  gotoDevice(page: string | number) {
    if (Number(page) < 1 || Number(page) > this.maxPageDevice) return;
    this.pageDevice = Number(page);
    this.refreshDevice();
  }

  gotoSensor(page: string | number) {
    if (Number(page) < 1 || Number(page) > this.maxPageSensor) return;
    this.pageSensor = Number(page);
    this.refreshSensor();
  }

  onChartInit(ec){
    this.chartInstances.push(ec);
  }

  addChart(dataOffset: string, dataEnd: string, legend: string, name: string) {
    this.api.listData(this.selectedDevice.deviceId, this.selectedSensor.id, Number(dataOffset), Number(dataEnd) - Number(dataOffset)).subscribe(data => {
      const parsed = data.map(v => {
        return [new Date(v.updateTime), v.data];
      });
      parsed.unshift([legend]);
      if (Number(this.selectedChartIndex) < 0) {
        const option = this.chartOptions[-(Number(this.selectedChartIndex) + 1)];
        (<any[]>option.option['dataset']).push({source: parsed});
        const type = (<any[]>option.option['series'])[0]['type'];
        const index = (<any[]>option.option['series']).length;
        (<any[]>option.option['series']).push({datasetIndex: index, type: type});
        option.offset.push(Number(dataOffset));
        option.end.push(Number(dataEnd));
        this.chartInstances[-(Number(this.selectedChartIndex) + 1)].setOption(option.option);
      } else {
        const setting = this.chartsSettings[Number(this.selectedChartIndex)];
        const option = {
          title: {
            text: name
          },
          color: ['#59a1f8', '#78c87d', '#f6d464', '#445285', '#8e67de', '#e36f7e', '#70c9ca', '#d396c6', '#b09e6c', '#4f58d5', '#96a36f'],
          legend: {
            x: 'right',
            y: 'top'
          },
          grid: {
            left: '1%',
            right: '1%',
            bottom: '1%',
            containLabel: true
          },
          dataset: [{
            source: parsed
          }],
          xAxis: {
            type: 'time',
            axisLabel: {
              interval: 0,
              rotate: 40
            },
          },
          yAxis: {},
          series: [
            {datasetIndex: 0, type: setting['type']}
          ],
        };
        this.chartOptions.push({name: name, class: setting['class'], option: option, offset: [Number(dataOffset)], end: [Number(dataEnd)]});
      }
      localStorage.setItem('charts', JSON.stringify(this.chartOptions));
    });
  }
}

