
let tickRef:Function=null;
export function NextTick(callback){
    if(tickRef==null){
        if(typeof window==="undefined" && typeof process ==="object"){
            tickRef= process.nextTick;
        }else{
            tickRef=forBrowser();
        }
    }
    tickRef(callback);
}
function forBrowser(){
    let targetNode = document.createTextNode("hello");
    let config = { characterData:true};
    let nextickcbs:Function[]=[];
    let callback = function () {
      while(nextickcbs.length>0){
        let queue=nextickcbs.slice();
        nextickcbs=[];
        queue.forEach(n=>n());
      }
    };

    let observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    let counter=0;
    function nextTick(cb){
      nextickcbs.push(cb);
      targetNode.textContent=""+counter++;
    }
    return nextTick;
}