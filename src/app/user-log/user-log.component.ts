import { Component, Input, OnInit } from '@angular/core';
import { UserLog } from '../../api/model/userLog';
import { DefaultService } from '../../api';
import { ModalService } from '../modal.service';
import { ModalValue } from '../modal/modal.component';

@Component({
  selector: 'app-user-log',
  templateUrl: './user-log.component.html',
  styleUrls: ['./user-log.component.css']
})
export class UserLogComponent implements OnInit {
  logs:UserLog[] = [];
  page: number = 1;
  limit: number = 15;
  maxPage: number;
  filterUsername?:string="";
  filterType?:number = -1;
  constructor(private api:DefaultService,private modal:ModalService) { }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.api.countUserLogs(this.filterUsername==""?null:this.filterUsername
      ,this.filterType==-1?null:this.filterType).subscribe(value=>{
        this.maxPage = Math.ceil(value.count/this.limit);
    });
    this.api.getUserLogs((this.page-1)*this.limit, this.limit
      ,this.filterUsername==""?null:this.filterUsername
      ,this.filterType==-1?null:this.filterType).toPromise().then(value => {
      this.logs = [];
      value.forEach(v=>{
        switch (v.type) {
          case 0:
            v['typeStr'] = "登录登出";break;
          case 1:
            v['typeStr'] = "用户操作";break;
          case 2:
            v['typeStr'] = "设备操作";break;
          case 3:
            v['typeStr'] = "设备指令";break;
          case 4:
            v['typeStr'] = "报警处理";break;
          default:
            v['typeStr'] = "未知类型:"+v.type;break;
        }
        this.logs.push(v);
      });
    });
  }

  detail(log:UserLog){
    this.modal.modal(UserLogDetail,log)
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
        <label for="input-username">用户名</label>
        <input id="input-username" type="text" class="form-control" [(ngModel)]="username" disabled>
        <label for="input-date">发生日期</label>
        <input id="input-date" class="form-control" [(ngModel)]="date" disabled>
        <label for="input-type">类型</label>
        <input id="input-type" class="form-control" [(ngModel)]="type" disabled>
        <label for="input-action">行为</label>
        <textarea id="input-action" class="form-control" rows="6" [(ngModel)]="action" disabled></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" (click)="finish()">确定</button>
    </div>
  `
})
export class UserLogDetail implements ModalValue {
  @Input() callback: (any) => void;
  @Input() close: () => void;
  @Input() params: any;

  username:string;
  action:string;
  type:string;
  date:string;
  onInit() {
    const log = <UserLog> this.params;
    this.username = log.username;
    this.action = log.action;
    this.type = log['typeStr'];
    this.date = log.createTime;
  }

  finish(){
    this.close();
  }
}
