let Future=require("../dist/future").Future;
exports.resolved=function(value) {
    return new Future((resolve, reject) => {
        resolve(value);
    });
}
exports.rejected=function(reason) {
    return new Future((resolve, reject) => {
        reject(reason);
    });
}
exports.deferred=function() {
    var dfd = {}
    dfd.promise = new Future(function (resolve, reject) {
        dfd.resolve = resolve
        dfd.reject = reject
    });
    return dfd
}