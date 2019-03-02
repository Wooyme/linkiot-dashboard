export const adminLteConf = {
  skin: 'blue',
  // isSidebarLeftCollapsed: false,
  // isSidebarLeftExpandOnOver: false,
  // isSidebarLeftMouseOver: false,
  // isSidebarLeftMini: true,
  // sidebarRightSkin: 'dark',
  // isSidebarRightCollapsed: true,
  // isSidebarRightOverContent: true,
  // layout: 'normal',
  sidebarLeftMenu: [
    {label: '主菜单', separator: true},
    {label: '实时监控', route: 'watcher', iconClasses: 'fa fa-bar-chart'},
    {label: '账户管理', iconClasses: 'fa fa-user-circle',children:[
        {label:'账户信息',route: 'user', iconClasses: 'fa fa-user-circle'},
        {label:'操作记录',route: 'log/user', iconClasses: 'fa fa-book'}
      ]},
    {label: '设备管理', iconClasses: 'fa fa-dashboard',children:[
        {label:'设备列表',route: 'device',iconClasses: 'fa fa-desktop'},
        {label:'设备地图',route:'device/map',iconClasses:'fa fa-map'}
      ]},
    {label: '数据分析', route: 'analysis', iconClasses: 'fa fa-list'},
    {label: '报警历史', route: 'log/alarm', iconClasses: 'fa fa-book'},
    {label: '帮助', route: 'help', iconClasses: 'fa fa-files-o'}
  ]
};
