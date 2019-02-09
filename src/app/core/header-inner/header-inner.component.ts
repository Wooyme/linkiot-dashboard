import { Component, Input } from '@angular/core';
import { DefaultService } from '../../../api';
import { Router } from '@angular/router';
import { ModalService } from '../../modal.service';
import { ModalValue } from '../../modal/modal.component';
@Component({
  selector: 'app-header-inner',
  templateUrl: './header-inner.component.html'
})
export class HeaderInnerComponent {
  constructor(private api:DefaultService,private router:Router,private modal:ModalService){}

  logout(){
    this.modal.modal(LogoutEnsure,{}).then(()=>{
      this.api.getLogout();
      this.router.navigate(['/']);
    })
  }
}

@Component({
  template:`
    <div class="modal-header">
      登出确认
    </div>
    <div class="modal-body">
      <p>是否要退出当前账号</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" (click)="finish()">确定</button>
    </div>
  `
})
export class LogoutEnsure implements ModalValue {
  @Input() callback: (any) => void;
  @Input() close: () => void;
  @Input() params: any;

  onInit() {
  }

  finish(){
    this.callback({});
    this.close();
  }

}
