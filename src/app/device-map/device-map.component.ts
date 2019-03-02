import { Component, OnInit } from '@angular/core';
import { DefaultService, Device } from '../../api';
import { HttpClient} from '@angular/common/http';

declare let BMap:any;
@Component({
  selector: 'app-device-map',
  templateUrl: './device-map.component.html',
  styleUrls: ['./device-map.component.css']
})
export class DeviceMapComponent implements OnInit {
  devices: Device[] = [];
  constructor(private api:DefaultService,private http:HttpClient) { }
  map:any;
  ngOnInit() {
    this.map = new BMap.Map("container");
    this.map.addControl(new BMap.NavigationControl());
    this.map.addControl(new BMap.ScaleControl());
    this.map.addControl(new BMap.OverviewMapControl());
    this.map.addControl(new BMap.MapTypeControl());
    this.map.enableScrollWheelZoom();
    this.refresh();
  }

  refresh(){
    this.api.listDevices(0, 100).subscribe((devices: Device[]) => {
      this.devices = [];
      devices.forEach(device => {
        try{
          const description = JSON.parse(device.description);
          const location = description['location'];
          if(location!=null && location != undefined)
            this.getPointByLocation(location).then(value=>{
              if(value.status==0){
                console.log(value.result);
                let point = new BMap.Point(value.result.location.lng,value.result.location.lat);
                this.map.centerAndZoom(point, 15);
                let marker = new BMap.Marker(point);
                this.map.addOverlay(marker);
              }
            })
        }catch (e) {}
        this.devices.push(device);
      });
    });
  }

  private getPointByLocation(location:string):Promise<any>{
    console.log(location);
    const api = `http://api.map.baidu.com/geocoder/v2/?address=${location}&output=json&ak=wd4Mbk6njkwfNmmr60tP0SI7l3ngOmoo&callback=callback`;
    return this.http.jsonp(api,"callback").toPromise();
  }

}
