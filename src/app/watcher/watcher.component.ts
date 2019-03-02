import { Component, Input } from '@angular/core';
import { DataAnalysisComponent } from '../data-analysis/data-analysis.component';
import { DefaultService } from '../../api';
import { UserService } from '../user.service';
import { SockJsService } from '../sock-js.service';
import { ModalValue } from '../modal/modal.component';
import { ModalService } from '../modal.service';

@Component({
  selector: 'app-watcher',
  templateUrl: './watcher.component.html',
  styleUrls: ['./watcher.component.css']
})
export class WatcherComponent extends DataAnalysisComponent {
  typeSwitch: number = 0;
  selectedPairs:{parsed:string,raw:string}[] = [];
  options:{name: string,device:string, class: string, option: any,isData:boolean,isMedia?:boolean,src?:string}[]=[];
  mediaSettings = [
    {type: 'image',class: 'col-lg-3',option:'230',title: '图像(小)'},
    {type: 'image',class: 'col-lg-6',option:'340',title: '图像(中)'},
    {type: 'image',class: 'col-lg-12',option:'680',title: '图像(大)'}
  ];
  selectedMediaIndex = 0;
  constructor(api: DefaultService, me: UserService, private sockJs: SockJsService,private modal:ModalService) {
    super(api, me);
  }

  ngOnInit() {
    this.refreshDevice();
    const options:{name: string,device:string, class: string, option: any,isData:boolean,isMedia?:boolean,src?:string}[]
      = JSON.parse(localStorage.getItem('watcher'+this.me.me.username));
    if(Array.isArray(options)){
      options.forEach((option)=>{
        if(option.isData && option.isMedia!=true){
          (<{device:string,sensor:number}[]>option.option['mine']).forEach((mine,i)=>{
            this.api.listData(mine.device,mine.sensor,0,50).subscribe(data=>{
              (<any[]>option.option['series'])[i]['data'] = data.map(v => {
                return [new Date(v.updateTime), v.data];
              });
              option['chart'].setOption(option.option);
            });
          })
        }else if(!option.isData){
          setInterval(()=>{
            this.api.getState(option.device).subscribe(v=>{
              if(v.status==1){
                option.option.state = [];
                option.option.pairs.forEach(p=>{
                  option.option.state.push({name:p.parsed,value:v.state[p.raw]})
                })
              }
            })
          },5*1000);
        }
        this.options.push(option);
      });
    }
  }

  onTypeSwitchClicked(){
    if(this.typeSwitch<2)
      this.typeSwitch+=1;
    else
      this.typeSwitch=0;
  }

  onChartInitWithIndex(ec,index){
    console.log(index);
    this.options[index]['chart'] = ec;
    this.sockJs.message.subscribe(value => {
      const option = this.options[index].option;
      const mine = <{device:string,sensor:number}[]>option['mine'];
      const series = <{data:any[]}[]>option['series'];
      mine.forEach((v,i)=>{
        if(value.device.id==v.device){
          series[i].data.pop();
          series[i].data.unshift([new Date(),value.data[v.sensor.toString()]]);
        }
      });
      this.options[index]['chart'].setOption(option);
    });
  }

  addImage(device:string,sensor:string|number){
    this.api.countMedia(device,Number(sensor)).toPromise().then(data=>{
      return this.api.listMedia(device,Number(sensor),data.from.toString(),"100","time").toPromise();
    }).then(data=>{
      const src = "http://link.hdussta.cn:7778/v1/file/sensor/media/"+device+"/"+sensor+"/"+data[0].name;
      this.options.push({name:"",device:device,class: this.mediaSettings[this.selectedMediaIndex].class,option:this.mediaSettings[this.selectedMediaIndex].option,isData:true,isMedia:true,src:src});
      const save = Object.assign([],this.options).map(v=>{
        delete v['chart'];
        return v;
      });
      localStorage.setItem('watcher'+this.me.me.username, JSON.stringify(save));
    })
  }

  addChart(device:string,sensor:string|number,legend: string, name: string) {
    this.api.listData(this.selectedDevice.deviceId, this.selectedSensor.id, 0, 50).subscribe(data => {
      const parsed = data.map(v => {
        return [new Date(v.updateTime), v.data];
      });
      if (Number(this.selectedChartIndex) < 0) {
        const option = this.options[-(Number(this.selectedChartIndex) + 1)];
        (<any[]>option.option['mine']).push({device:device,sensor:Number(sensor)});
        (<any[]>option.option['legend']['data']).push(legend);
        const type = (<any[]>option.option['series'])[0]['type'];
        (<any[]>option.option['series']).push({
          type: type,
          data:parsed,
          name: legend
        });
        this.options[-(Number(this.selectedChartIndex) + 1)]['chart'].setOption(option.option);
        // this.chartInstances[-(Number(this.selectedChartIndex) + 1)].setOption(option.option);
        localStorage.setItem('watcher'+this.me.me.username, JSON.stringify(this.options));
      } else {
        const setting = this.chartsSettings[Number(this.selectedChartIndex)];
        const option = {
          mine:[
            {device:device,sensor:Number(sensor)}
          ],
          title: {
            text: name
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#283b56'
              }
            }
          },
          color: ['#59a1f8', '#78c87d', '#f6d464', '#445285', '#8e67de', '#e36f7e', '#70c9ca', '#d396c6', '#b09e6c', '#4f58d5', '#96a36f'],
          legend: {
            x: 'right',
            y: 'top',
            data:[legend]
          },
          grid: {
            left: '1%',
            right: '1%',
            bottom: '1%',
            containLabel: true
          },
          xAxis: {
            type: 'time',
            axisLabel: {
              interval: 0,
              rotate: 40
            },
          },
          yAxis: {},
          series: [
            {
              type: setting['type'],
              data:parsed,
              name: legend
            }
          ],
        };
        this.options.push({device:device,name: name, class: setting['class'], option: option,isData:true});
      }
      const save = Object.assign([],this.options).map(v=>{
        delete v['chart'];
        return v;
      });
      localStorage.setItem('watcher'+this.me.me.username, JSON.stringify(save));
    });
  }

  addStateBlock(device:string,name:string) {
    const option = {pairs:this.selectedPairs,state:[]};
    setInterval(()=>{
      this.api.getState(device).subscribe(v=>{
        if(v.status==1){
          option.state = [];
          option.pairs.forEach(p=>{
            option.state.push({name:p.parsed,value:v.state[p.raw]})
          })
        }
      })
    },10*1000);
    this.options.push({device:device,name:name,class:'col-lg-3',isData:false,option:option});
    this.selectedPairs = [];
  }

  editStateDetail() {
    this.modal.modal(EditStateDetailModal,{device:this.selectedDevice.name}).then(pairs => {
      this.selectedPairs = pairs;
    })
  }

  clear(){
    this.options = [];
    this.chartInstances = [];
    localStorage.setItem('watcher'+this.me.me.username,JSON.stringify(this.options));
  }

  remove(i:number){
    this.options.splice(i,1);
    this.chartInstances.splice(i,1);
    localStorage.setItem('watcher'+this.me.me.username, JSON.stringify(this.options));
  }
}

@Component({
  template: `
    <div class="modal-header">
      编辑状态窗口
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label for="input-username">设备</label>
        <input id="input-username" type="text" class="form-control" [(ngModel)]="device" disabled>
        <label>添加对应关系</label>
        <div class="form-inline">
          <input style="margin-right: 10px" class="form-control" placeholder="显示名称" #parsed>
          <input style="margin-right: 10px" class="form-control" placeholder="原始名称" #raw>
          <button class="btn btn-default btn-sm" (click)="add(parsed.value,raw.value)">添加</button>
        </div>
        <label>对应关系</label>
        <select multiple class="form-control">
          <option *ngFor="let pair of pairs">{{pair.parsed}}:{{pair.raw}}</option>
        </select>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" (click)="finish()">确定</button>
    </div>
  `
})
export class EditStateDetailModal implements ModalValue {
  @Input() callback: (any) => void;
  @Input() close: () => void;
  @Input() params: any;

  device:string;
  pairs:{parsed:string,raw:string}[] = [];
  onInit() {
    this.device = this.params['device'];
  }

  add(parsed:string,raw:string){
    this.pairs.push({parsed:parsed,raw:raw});
  }

  finish(){
    this.callback(this.pairs);
    this.close();
  }

}
