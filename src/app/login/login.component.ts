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
        this.router.navigate(['device']);
      }else{
        alert(result.message)
      }
    })
  }


}
