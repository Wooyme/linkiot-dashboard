import { Component, OnInit } from '@angular/core';
import { DefaultService } from '../../../api';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-sidebar-left-inner',
  templateUrl: './sidebar-left-inner.component.html'
})
export class SidebarLeftInnerComponent implements OnInit{
  nickname:string;
  avatar:string;
  constructor(private api:DefaultService,private me:UserService){

  }

  ngOnInit() {
    this.api.getUser().subscribe(v=>{
      this.nickname = v.nickname;
      this.avatar = v.avatar;
      switch (v.level) {
        case 0:
          v['levelStr'] = "超级管理员";break;
        case 1:
          v['levelStr'] = "普通管理员";break;
        case 2:
          v['levelStr'] = "普通用户";break;
        default:
          v['levelStr'] = "未知等级:"+v.level;break;
      }
      this.me.setMe(v);
    })
  }
}
