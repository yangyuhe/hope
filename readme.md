Future.js is a implementation for Promise/A+ specification which pass [Promises/A+ Compliance Test Suite](https://github.com/promises-aplus/promises-tests).

## 安装 
npm install @yangyuhe/future --save
## 使用
1. 在typescript中
```typescript
import {Future} from "future";
let future=new Future((resolve,reject)=>{
    resolve("success");
}).then(res=>{
    console.log(res);//输出"success"
});

```
2.在nodejs中
```javascript
let Future=require("future").Future;
let future=new Future((resolve,reject)=>{
    resolve("success");
}).then(res=>{
    console.log(res);//输出"success"
});
```
3.在浏览器中  
引入script脚本
```html
<script src="...path/future.js"></script>
<script>
    let future=new Future((resolve,reject)=>{
        resolve("success");
    }).then(res=>{
        console.log(res);//输出"success"
    });
</script>
```
