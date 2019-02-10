import { Component, Input, OnInit } from '@angular/core';
import { DefaultService, Sensor } from '../../api';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalService } from '../modal.service';
import { ModalValue } from '../modal/modal.component';
import { UserService } from '../user.service';

@Component({
  selector: 'app-sensor',
  templateUrl: './sensor.component.html',
  styleUrls: ['./sensor.component.css']
})
export class SensorComponent implements OnInit {
  sensors:Sensor[] = [];
  deviceId:string = "";
  page = 1;
  limit = 15;
  maxPage:number;
  constructor(private api:DefaultService,private router:ActivatedRoute,private next:Router,private modal:ModalService,public user:UserService) { }

  ngOnInit() {
    this.router.params.subscribe(value=>{
      this.deviceId = value['deviceId'];
      this.refresh();
    })
  }

  add(){
    this.modal.modal(AddSensor,{}).then(value=>{
      return this.api.putSensor(this.deviceId,value).toPromise();
    }).then(status=>{
      if(status.status==1){
        this.refresh();
      }else{
        alert(status.message)
      }
    })
  }

  edit(sensor:Sensor) {
    this.modal.modal(EditSensor, sensor).then(value => {
      value['sensorId'] = sensor.id;
      return this.api.postSensor(this.deviceId,value).toPromise();
    }).then(status=>{
      if(status.status==1){
        this.refresh();
      }else{
        alert(status.message);
      }
    })
  }

  delete(sensor:Sensor){
    this.modal.modal(DeleteSensor,{}).then(()=>{
      return this.api.deleteSensor(this.deviceId,sensor.id).toPromise();
    }).then(status=>{
      if(status.status==1){
        this.refresh();
      }else{
        alert(status.message);
      }
    })
  }

  gotoData(sensor:Sensor){
    this.next.navigate(['data',this.deviceId,sensor.id,sensor.dataType,sensor.showType])
  }

  refresh(){
    this.api.countSensors(this.deviceId).subscribe(value=>{
      this.maxPage = Math.ceil(value.count/this.limit);
    });
    this.api.getSensors(this.deviceId,(this.page-1)*this.limit,this.limit).subscribe(value=>{
     this.sensors = [];
      value.forEach(v=>{
        switch (v.dataType) {
          case 0: v['dataTypeStr'] = "数值型"; break;
          case 1: v['dataTypeStr'] = "文本型"; break;
          case 2: v['dataTypeStr'] = "坐标型"; break;
          case 3: v['dataTypeStr'] = "布朗型"; break;
          case 4: v['dataTypeStr'] = "JSON"; break;
          default: v['dataTypeStr'] = "未知类型:"+v.dataType; break;
        }
        this.sensors.push(v)
      })
    })
  }

  goto(page:string | number){
    this.page = Number(page);
    this.refresh();
  }

}
@Component({
  template: `
    <div class="modal-header">
      添加传感器
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label for="input-sensor-name">名称</label>
        <input id="input-sensor-name" type="text" class="form-control" [(ngModel)]="name">
        <label for="select-data-type">数据类型</label>
        <select class="form-control" id="select-data-type" [(ngModel)]="type">
          <option value="0">数值型</option>
          <option value="1">文本型</option>
          <option value="2">坐标型</option>
          <option value="3">布朗型</option>
          <option value="4">JSON</option>
        </select>
        <div *ngIf="type==0">
          <label for="input-unit" >单位</label>
          <input class="form-control" id="input-unit" [(ngModel)]="unit">
        </div>
        <label for="input-sensor-description">设备描述</label>
        <textarea id="input-sensor-description" class="form-control" rows="4" [(ngModel)]="description"></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" (click)="finish()">确定</button>
    </div>
  `
})
export class AddSensor implements ModalValue {
  @Input() callback: (any) => void;
  @Input() close: () => void;
  @Input() params: any;

  name:string = "";
  type:number = 0;
  unit:string = "";
  description:string = "";
  onInit() {}

  finish(){
    this.callback({name:this.name,dataType:Number(this.type),showType:JSON.stringify({unit:this.unit}),description:this.description});
    this.close();
  }
}

@Component({
  template: `
    <div class="modal-header">
      编辑传感器
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label for="input-sensor-name">名称</label>
        <input id="input-sensor-name" type="text" class="form-control" [(ngModel)]="name">
        <label for="input-show-type" *ngIf="type==0"></label>
        <input class="form-control" id="input-show-type" *ngIf="type==0" [(ngModel)]="show">
        <label for="input-sensor-description">设备描述</label>
        <textarea id="input-sensor-description" class="form-control" rows="4" [(ngModel)]="description"></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" (click)="finish()">确定</button>
    </div>
  `
})
export class EditSensor implements ModalValue {
  @Input() callback: (any) => void;
  @Input() close: () => void;
  @Input() params: any;

  name:string = "";
  type:number = 0;
  show:string = "";
  description:string = "";

  onInit() {
    const sensor = <Sensor> this.params;
    this.name = sensor.name;
    this.type = sensor.dataType;
    this.show = sensor.showType;
    this.description = sensor.description;
  }

  finish(){
    this.callback({name:this.name,showType:this.show,description:this.description});
    this.close();
  }
}

@Component({
  template: `
    <div class="modal-header">
      删除传感器
    </div>
    <div class="modal-body">
      <p>确定要删除该传感器吗？</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" (click)="finish()">确定</button>
    </div>
  `
})
export class DeleteSensor implements ModalValue {
  @Input() callback: (any) => void;
  @Input() close: () => void;
  @Input() params: any;

  onInit(){}

  finish(){
    this.callback({});
    this.close();
  }
}
