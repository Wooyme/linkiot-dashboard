import { Component, OnInit } from '@angular/core';
import { DefaultService } from '../../api';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { SockJsService } from '../sock-js.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private api:DefaultService,private router:Router,private me:UserService,private sockJs:SockJsService) { }

  ngOnInit() {
  }

  login(email:string,password:string){
    this.api.getLogin(email,password).subscribe(result=>{
      if(result.status==1){
        this.sockJs.init();
        this.api.getUser().subscribe(v => {
          if(v.username==undefined){
            this.router.navigate(['login']);
          }
          switch (v.level) {
            case 0:
              v['levelStr'] = "超级管理员";
              break;
            case 1:
              v['levelStr'] = "普通管理员";
              break;
            case 2:
              v['levelStr'] = "普通用户";
              break;
            default:
              v['levelStr'] = "未知等级:" + v.level;
              break;
          }
          this.me.setMe(v);
          this.router.navigate(['device']);
        });
        let timer;
        timer = setInterval(()=>{
          this.api.getUser().subscribe(v=>{
            if(v.username==undefined){
              clearInterval(timer);
              this.router.navigate(['login'])
            }
          })
        },60*1000);
      }else{
        alert(result.message)
      }
    })
  }

}
