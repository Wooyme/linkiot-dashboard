import { Component, Input, OnInit } from '@angular/core';
import { DefaultService } from '../../api';
import { AlarmLog } from '../../api/model/alarmLog';
import { ModalService } from '../modal.service';
import { ModalValue } from '../modal/modal.component';
import { UserService } from '../user.service';

@Component({
  selector: 'app-alarm-log',
  templateUrl: './alarm-log.component.html',
  styleUrls: ['./alarm-log.component.css']
})
export class AlarmLogComponent implements OnInit {
  logs:AlarmLog[] = [];
  page: number = 1;
  limit: number = 20;
  maxPage: number;
  filterDeviceId:string = "";
  filterLevel:number = -1;
  constructor(private api:DefaultService,private modal:ModalService,public user:UserService) {

  }

  ngOnInit() {
    this.refresh();
  }

  refresh(){
    this.api.countAlarmLogs(this.filterLevel==-1?null:this.filterLevel
      ,this.filterDeviceId==""?null:this.filterDeviceId).subscribe(value=>{
        this.maxPage = Math.ceil(value.count/this.limit);
    });
    this.api.getAlarmLogs((this.page-1)*this.limit,this.limit
      ,this.filterLevel==-1?null:this.filterLevel
      ,this.filterDeviceId==""?null:this.filterDeviceId).toPromise().then(value=>{
      this.logs = [];
      value.forEach(v=>{
        switch (v.level) {
          case 0:
            v['levelStr'] = "警告";break;
          case 1:
            v['levelStr'] = "严重";break;
          default:
            v['levelStr'] = "未知等级:"+v.level;break;
        }
        this.logs.push(v)
      })
    })
  }

  showDetail(log:AlarmLog){
    this.modal.modal(AlarmLogDetail,log).then(value => {
      return this.api.postAlarmLog({logId:log.id,handle:value['handle']}).toPromise()
    }).then(status=>{
      if(status.status==1){
        this.refresh();
      }else{
        alert(status.message);
      }
    })
  }

  deleteLog(log:AlarmLog){
    this.modal.modal(AlarmLogDelEnsure,{}).then(()=>{
      return this.api.deleteAlarmLog(log.id).toPromise()
    }).then(status=>{
      if(status.status==1){
        this.refresh();
      }else{
        alert(status.message);
      }
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
      日志详情
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label for="input-date">日期</label>
        <input id="input-date" type="text" class="form-control" [(ngModel)]="date" disabled>
        <label for="input-device">设备ID</label>
        <input id="input-device" type="text" class="form-control" [(ngModel)]="device" disabled>
        <label for="input-data">本次数据</label>
        <input id="input-data" type="text" class="form-control" [(ngModel)]="data" disabled>
        <label for="input-handle">处理结果</label>
        <textarea id="input-handle" class="form-control" rows="6" [(ngModel)]="handle"></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" (click)="finish()">修改</button>
    </div>
  `
})
export class AlarmLogDetail implements ModalValue{
  @Input() callback: (any) => void;
  @Input() close: () => void;
  @Input() params: any;
  device:string;
  date:string;
  data:string;
  handle:string;
  onInit() {
    const log = <AlarmLog>this.params;
    this.date = log.createTime;
    this.device = log.deviceId;
    this.data = log.data;
    this.handle = log.handle;
  }

  finish(){
    this.callback({'handle':this.handle});
    this.close();
  }
}

@Component({
  template: `
    <div class="modal-header">
      确定删除
    </div>
    <div class="modal-body">
      <div class="form-group">
        <p>确定要删除本条日志</p>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" (click)="finish()">确定</button>
    </div>
  `
})
export class AlarmLogDelEnsure implements ModalValue{
  @Input() callback: (any) => void;
  @Input() close: () => void;
  @Input() params: any;

  onInit() {}

  finish(){
    this.callback({});
    this.close();
  }
}
