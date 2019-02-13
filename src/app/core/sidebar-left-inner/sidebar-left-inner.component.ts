import { Component, OnInit } from '@angular/core';
import { DefaultService } from '../../../api';
import { UserService } from '../../user.service';
import { Router } from '@angular/router';
import { SockJsService } from '../../sock-js.service';


@Component({
  selector: 'app-sidebar-left-inner',
  templateUrl: './sidebar-left-inner.component.html'
})
export class SidebarLeftInnerComponent implements OnInit{
  nickname:string;
  avatar:string;
  constructor(private api:DefaultService,private me:UserService,private route:Router,private sockJs:SockJsService){

  }

  ngOnInit() {
    this.nickname = this.me.me.nickname;
    this.avatar = this.me.me.avatar;
  }

}
