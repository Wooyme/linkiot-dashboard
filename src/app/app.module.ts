import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { adminLteConf } from './admin-lte.conf';

import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';

import { AlertModule as MkAlertModule, BoxModule, LayoutModule } from 'angular-admin-lte';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';

import { LoadingPageModule, MaterialBarModule } from 'angular-loading-page';
import { AddUser, DeleteUser, EditUser, UserComponent } from './user/user.component';
import { AddDeviceComponent, DeviceComponent, DeviceDetail, EditDeviceComponent } from './device/device.component';
import { HttpClientModule } from '@angular/common/http';
import { ApiModule } from '../api';
import { ModalComponent, ModalDirective } from './modal/modal.component';
import { FormsModule } from '@angular/forms';
import { AddSensor, DeleteSensor, EditSensor, SensorComponent } from './sensor/sensor.component';
import { AlarmLogComponent, AlarmLogDelEnsure, AlarmLogDetail } from './alarm-log/alarm-log.component';
import { UserLogComponent, UserLogDetail } from './user-log/user-log.component';
import { AlarmInfo, LogoutEnsure } from './core/header-inner/header-inner.component';
import { DataComponent } from './data/data.component';
import { HelpComponent } from './help/help.component';
import { DataAnalysisComponent } from './data-analysis/data-analysis.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { BsDropdownModule } from 'ngx-bootstrap';


@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule,
    HttpClientModule,
    LayoutModule.forRoot(adminLteConf),
    LoadingPageModule, MaterialBarModule,
    ApiModule,
    FormsModule,
    MkAlertModule,
    BoxModule,
    NgxEchartsModule,
    BsDropdownModule.forRoot()

  ],
  declarations: [
    AppComponent,
    LogoutEnsure,
    HomeComponent,
    UserComponent,
    AddUser,
    EditUser,
    DeleteUser,
    DeviceComponent,
    DeviceDetail,
    ModalComponent,
    ModalDirective,
    AddDeviceComponent,
    EditDeviceComponent,
    SensorComponent,
    AddSensor,
    EditSensor,
    DeleteSensor,
    AlarmLogComponent,
    AlarmLogDetail,
    AlarmLogDelEnsure,
    UserLogComponent,
    UserLogDetail,
    DataComponent,
    HelpComponent,
    DataAnalysisComponent,
    AlarmInfo
  ],
  entryComponents:[ AddDeviceComponent,EditDeviceComponent,DeviceDetail
    ,AlarmLogDetail,AlarmLogDelEnsure,AlarmInfo
    ,AddUser,EditUser,DeleteUser,UserLogDetail
    ,LogoutEnsure
    ,AddSensor,EditSensor,DeleteSensor],
  bootstrap: [AppComponent]
})
export class AppModule {}
