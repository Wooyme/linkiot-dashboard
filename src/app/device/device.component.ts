import { Component, Input, OnInit } from '@angular/core';
import { DefaultService, Device } from '../../api';
import { ModalService } from '../modal.service';
import { ModalValue } from '../modal/modal.component';
import { Router } from '@angular/router';
import 'rxjs/add/operator/toPromise';
import { UserService } from '../user.service';
@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.css']
})
export class DeviceComponent implements OnInit {
  devices: Device[] = [];
  page = 1;
  limit = 12;
  maxPage:number;
  constructor(private api: DefaultService, private modal: ModalService,private router:Router,public user:UserService) {
  }

  ngOnInit() {
    this.refresh();
  }

  refresh(){
    this.api.countDevices().subscribe(value=>{
      this.maxPage = Math.ceil(value.count/this.limit);
    });
    this.api.listDevices((this.page-1)*this.limit, this.limit).subscribe((devices: Device[]) => {
      this.devices = [];
      devices.forEach(value => {
        console.log(value.description);
        try{value['image'] = JSON.parse(value.description)['image'];console.log(value['image'])}catch (e) {}
        this.devices.push(value);
      });
    });
  }

  add() {
    this.modal.modal(AddDeviceComponent,{}).then(value=>{
      return this.api.putDevice(value).toPromise();
    }).then(status=>{
      if(status.status==1){
        this.refresh()
      }else{
        alert(status.message)
      }
    })
  }

  edit(device:Device){
    this.api.getDeviceDetail(device.deviceId).toPromise().then(value=>{
      return this.modal.modal(EditDeviceComponent,{'name':device.name,'description':device.description,'script':value.script});
    }).then(value=>{
      value['deviceId'] = device.deviceId;
      return this.api.postDevice(value).toPromise();
    }).then(status=>{
      if(status.status==1){
        this.refresh();
      }else{
        alert(status.message);
      }
    })
  }


  alarmSettings(device:Device){
    this.api.getDeviceDetail(device.deviceId).toPromise().then(value=>{

    })
  }

  gotoSensors(id:string){
    this.router.navigate(['sensor',id]);
  }

  goto(page:string){
    this.page = Number(page);
    this.refresh();
  }

}

@Component({
  template: `
    <div class="modal-header">
      创建设备
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label for="input-device-name">设备名称</label>
        <input id="input-device-name" type="text" class="form-control" [(ngModel)]="deviceName">
        <label for="input-device-description">设备描述</label>
        <textarea id="input-device-description" class="form-control" rows="4" [(ngModel)]="deviceDescription"></textarea>
        <label for="input-device-script">绑定脚本</label>
        <textarea id="input-device-script" class="form-control" rows="6" [(ngModel)]="deviceScript"></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" (click)="finish()">确定</button>
    </div>
  `
})
export class AddDeviceComponent implements ModalValue{
  @Input() callback: (any) => void;
  @Input() close: ()=>void;
  @Input() params: any;
  deviceName:string = "";
  deviceDescription:string = "";
  deviceScript:string = "";
  onInit(){}

  finish(){
    this.callback({'name':this.deviceName,'description':this.deviceDescription,'script':this.deviceScript});
    this.close();
  }
}

@Component({
  template: `
    <div class="modal-header">
      编辑设备
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label for="input-device-name">设备名称</label>
        <input id="input-device-name" type="text" class="form-control" [(ngModel)]="deviceName">
        <label for="input-device-description">设备描述</label>
        <textarea id="input-device-description" class="form-control" rows="4" [(ngModel)]="deviceDescription"></textarea>
        <label for="input-device-script">绑定脚本</label>
        <textarea id="input-device-script" class="form-control" rows="6" [(ngModel)]="deviceScript"></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" (click)="finish()">确定</button>
    </div>
  `
})
export class EditDeviceComponent implements ModalValue{
  @Input() callback: (any) => void;
  @Input() close: ()=>void;
  @Input() params: any;
  deviceName:string;
  deviceDescription:string;
  deviceScript:string;
  onInit(){
    this.deviceName = this.params['name'];
    this.deviceDescription = this.params['description'];
    this.deviceScript = this.params['script'];
  }
  finish(){
    this.callback({'name':this.deviceName,'description':this.deviceDescription,'script':this.deviceScript});
    this.close();
  }
}

export class EditAlarmComponent implements ModalValue{
  @Input() callback: (any) => void;
  @Input() close: ()=>void;
  @Input() params: any;
  onInit(){

  }
}
