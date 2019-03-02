import { Component, OnInit } from '@angular/core';
import { Data, DefaultService } from '../../api';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.css']
})
export class DataComponent implements OnInit {
  data:Data[] = [];
  page:number = 1;
  limit: number = 15;
  maxPage: number;
  deviceId:string;
  sensorId:number;
  dataType: number;
  constructor(private api:DefaultService,private router:ActivatedRoute) {

  }

  ngOnInit() {
    this.router.params.subscribe(value=>{
      this.deviceId = value['deviceId'];
      this.sensorId = Number(value['sensorId']);
      this.dataType = Number(value['dataType']);
      this.refresh();
    })
  }

  refresh(){
    if(this.dataType!=3) {
      this.api.countData(this.deviceId, this.sensorId).subscribe(value => {
        this.maxPage = Math.ceil(value.count / this.limit);
      });
      this.api.listData(this.deviceId, this.sensorId, (this.page - 1) * this.limit, this.limit).toPromise().then(value => {
        this.data = [];
        value.forEach(v => {
          this.data.push(v);
        })
      })
    }else{
      this.api.countMedia(this.deviceId,this.sensorId).toPromise().then(value=>{
        this.maxPage = Math.ceil(value.count / this.limit);
        return this.api.listMedia(this.deviceId,this.sensorId,((this.page - 1) * this.limit).toString(), this.limit.toString(),"index").toPromise()
      }).then(value=>{
        this.data = [];
        value.forEach(v=>{
          this.data.push({data:this.api.mediaPath(this.deviceId,this.sensorId.toString(),v.name),updateTime:new Date(Number(v.name)).toString()})
        })
      })
    }
  }

  goto(page:string | number){
    this.page = Number(page);
    this.refresh();
  }

}
