let Hope=require("../dist/hope").Hope;
exports.resolved=function(value) {
    return new Hope((resolve, reject) => {
        resolve(value);
    });
}
exports.rejected=function(reason) {
    return new Hope((resolve, reject) => {
        reject(reason);
    });
}
exports.deferred=function() {
    var dfd = {}
    dfd.promise = new Hope(function (resolve, reject) {
        dfd.resolve = resolve
        dfd.reject = reject
    });
    return dfd
}