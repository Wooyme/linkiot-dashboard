import { Component, Input, OnInit } from '@angular/core';
import { DefaultService, Device } from '../../api';
import { ModalService } from '../modal.service';
import { ModalValue } from '../modal/modal.component';
import { ActivatedRoute, Router } from '@angular/router';
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
  showTable:boolean = true;
  filterName:string;
  filterId:string;
  constructor(private api: DefaultService, private modal: ModalService,private router:Router,public user:UserService,private _route:ActivatedRoute) {
  }

  ngOnInit() {
    this.refresh();
  }

  refresh(){
    this.api.countDevices().subscribe(value=>{
      this.maxPage = Math.ceil(value.count/this.limit);
    });
    this.api.listDevices((this.page-1)*this.limit, this.limit
      ,(this.filterId!='')?this.filterId:null
      ,(this.filterName!='')?this.filterName:null).subscribe((devices: Device[]) => {
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
      device['script'] = value.script;
      return this.modal.modal(EditDeviceComponent,device);
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

  detail(device:Device){
    this.api.getState(device.deviceId).toPromise().then(value=>{
      device['cState'] = (value.state==undefined || value.state==null || value.state=='')?'设备未上传状态':value.state;
      return this.modal.modal(DeviceDetail,device);
    }).then(value=>{
      if(value['action']=='fClose'){
        this.api.forceClose(device.deviceId).subscribe(status=>{
          if(status.status==1){
            this.refresh();
          }else{
            alert(status.message)
          }
        })
      }else if(value['action']=='setState'){
        this.api.postState(JSON.parse(value['desired']),device.deviceId).subscribe(status=>{
          if(status.status==1){
            this.refresh();
          }else{
            alert(status.message)
          }
        })
      }
    })
  }

  gotoSensors(id:string){
    this.router.navigate(['sensor',id]);
  }

  goto(page:string | number){
    if(Number(page)<1 || Number(page)>this.maxPage) return;
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
      <button class="btn btn-primary" (click)="finish()" [disabled]="deviceName==''">确定</button>
    </div>
  `
})
export class AddDeviceComponent implements ModalValue{
  @Input() callback: (any) => void;
  @Input() close: ()=>void;
  @Input() params: any;
  deviceName:string = "";
  deviceDescription:string = "";
  deviceScript:string = "//default code\nfuncStorage(things,{});";
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
        <label>设备ID</label>
        <input class="form-control" [value]="deviceId" disabled>
        <label>设备秘钥</label>
        <input class="form-control" [value]="deviceSecret" disabled>
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
  deviceId:string;
  deviceSecret:string;
  onInit(){
    this.deviceName = this.params['name'];
    this.deviceDescription = this.params['description'];
    this.deviceScript = this.params['script'];
    this.deviceSecret = this.params['secret'];
    this.deviceId = this.params['deviceId'];
  }
  finish(){
    this.callback({'name':this.deviceName,'description':this.deviceDescription,'script':this.deviceScript});
    this.close();
  }
}

@Component({
  template: `
    <div class="modal-header">
      {{name}}
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label>是否在线</label>
        <input class="form-control" [value]="isOnline?'在线':'离线'" disabled>
        <label for="current-state">当前状态</label>
        <textarea id="current-state" class="form-control" rows="4" disabled [value]="currentState"></textarea>
        <label for="input-desired-state">预期状态</label>
        <textarea id="input-desired-state" class="form-control" rows="4" [(ngModel)]="desiredState"></textarea>
        <label>更多操作</label>
        <div class="btn-toolbar">
          <button class="btn btn-danger" (click)="forceClose()" [disabled]="!isOnline">强制下线</button>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" (click)="finish()">确定</button>
    </div>
  `
})
export class DeviceDetail implements ModalValue {
  @Input() callback: (any) => void;
  @Input() close: () => void;
  @Input() params: any;

  name:string;
  isOnline:boolean;
  currentState:string;
  desiredState:string = "";
  onInit() {
    const device = <Device> this.params;
    this.name = device.name;
    this.isOnline = device.state==1;
    this.currentState = device['cState'];

  }

  forceClose(){
    this.callback({'action':'fClose'});
    this.close();
  }

  finish(){
    if(this.desiredState!=null && this.desiredState!="")
      this.callback({'action':'setState','desired':this.desiredState});
    this.close();
  }

}
