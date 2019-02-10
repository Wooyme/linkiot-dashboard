# LinkIOT-Dashboard
基于angular与AdminLTE开发

## 运行
```bash
$ ng serve
```

## 编译
```bash
$ ng build --prod
```

## 开发说明
* 该工程只包括前端部分，需要配合IOT-Platform运行。运行IOT-Platform后，需要将`src/api/api/default.service.ts`中的
  ```typescript
  protected basePath = 'http://link.hdussta.cn:7778/v1';
  ```
  改为正确的地址。

## 使用说明

### 1.绑定脚本

本平台采用了一种自定义程度非常高的设备控制、数据处理方式——**自定义脚本**。因此需要在创建设备的时候手动配置JavaScript代码。
除了JavaScript自带的功能外，平台还加入了新的函数、变量用于处理各种事务。

* things: {"data":object,"device":Device}，things变量包含了本次接收到的数据和该设备的信息
* funcStorage(things,{}): funcStorage用于将数据存储到数据库中
* funcRedirect(things,{"urls":\[url1,url2\]}): funcRedirect可以将本次接收到的数据转发到参数规定的url中
* funcAlarm(things,{"level":level,"email":email,"url":url,"phone":phone}): funcAlarm可以将本次的报警等级，收到的信息，报警设备通过邮箱、网页、短信的形式发送给用户,配合条件判断使用。
* 返回值: 需要注意的是，在脚本中不应使用return。最后执行的表达式即为返回值。

