import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserComponent } from './user/user.component';
import { DeviceComponent } from './device/device.component';
import { SensorComponent } from './sensor/sensor.component';
import { AlarmLogComponent } from './alarm-log/alarm-log.component';
import { UserLogComponent } from './user-log/user-log.component';
import { DataComponent } from './data/data.component';

const routes: Routes = [
  {
    path:'',
    loadChildren: './login/login.module#LoginModule',
    data: {
      customLayout: true
    }
  },
  {
    path: 'user',
    data: {
      title: '账户管理'
    },
    component: UserComponent
  }, {
    path: 'device',
    data: {
      title: '设备管理'
    },
    component: DeviceComponent
  }, {
    path: 'sensor/:deviceId',
    data: {
      title: '传感器管理'
    },
    component: SensorComponent
  },{
    path: 'data/:deviceId/:sensorId/:dataType/:showType',
    data: {
      title: '详细数据'
    },
    component: DataComponent
  },{
    path: 'log/alarm',
    data:{
      title: '报警日志'
    },
    component:AlarmLogComponent
  },{
    path: 'log/user',
    data:{
      title: '操作日志'
    },
    component:UserLogComponent
  }, {
    path: 'login',
    loadChildren: './login/login.module#LoginModule',
    data: {
      customLayout: true
    }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
