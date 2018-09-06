![hope.js](https://github.com/yangyuhe/hope/blob/master/logo.svg)
Hope.js is a implementation for Promise/A+ specification which pass [Promises/A+ Compliance Test Suite](https://github.com/promises-aplus/promises-tests).

## install 
npm install @yangyuhe/hope --save
## use
1. with typescript
```typescript
import {Hope} from "hope";
let hope=new Hope((resolve,reject)=>{
    resolve("success");
}).then(res=>{
    console.log(res);//output "success"
});

```
2. with commonjs
```javascript
let Hope=require("hope").Hope;
let hope=new Hope((resolve,reject)=>{
    resolve("success");
}).then(res=>{
    console.log(res);//output "success"
});
```
3. in browser  
import script of hope.js
```html
<script src="...path/hope.js"></script>
<script>
    let hope=new Hope((resolve,reject)=>{
        resolve("success");
    }).then(res=>{
        console.log(res);//output "success"
    });
</script>
```
## API
Hope.js 's API is the same as normal Promise's api in Browser except with one extra api:  
```javascript
Hope.any(hope:Hope[]):Hope
```
> the **any** method will resolve if any of hopes resolved and will reject if all of hopes rejected.
when resolve, the parameter will be the first resolved value and when reject, then parameter will be a array which contains all reasons rejected in order of hopes passed in.
