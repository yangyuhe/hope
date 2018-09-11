import { NextTick } from "./nexttick";

export class Hope<T> {
    //当前promise的成功结果
    private successRes: T|Hope<T> = null;
    //当前promise的失败结果
    private failRes: any = null;
    //当父promise成功时，当前promise的处理函数，第一个promise是没有这个的
    private resolveProcessing: ((t:T|Hope<T>)=>T|Hope<T>|void) = null;
    //当父promise失败时，当前promise的处理函数，第一个promise是没有这个的
    private rejectProcessing: any = null;
    private children: Hope<T>[] = [];
    private state: "pending" | "resolved" | "rejected" = "pending";
    constructor(callback: (resolve: ((res:T|Hope<T>)=>void), reject: any) => void) {
        if (callback != null) {
            try {
                callback(this.handleReturnValue.bind(this, "resolve"), this.handleReturnValue.bind(this, "reject"));
            } catch (err) {
                if (this.state == "pending") {
                    this.reject(err);
                }
            }
        }
    }
    /**当前promise成功 */
    private resolve(data:T|Hope<T>) {
        if (this.state == "pending") {
            this.state = "resolved";

            this.successRes = data;
            this.children.forEach(child => {
                NextTick(() => {
                    child.onParentResolve(data);
                });
            });
        }
    }
    /**当前promise失败 */
    private reject(reason) {
        if (this.state == "pending") {
            this.state = "rejected";

            this.failRes = reason;
            let cache=this.children.slice();
            NextTick(() => {
                if (this.children.length == 0)
                    console.log("unhandled error:" + this.failRes);
                cache.forEach(child => {
                    child.onParentReject(reason);
                });
            });
        }
    }
    /**当父promise成功时 */
    private onParentResolve(data:T|Hope<T>) {
        if (this.resolveProcessing != null) {
            try {
                let res:T|Hope<T> = this.resolveProcessing.call(undefined, data);
                this.handleReturnValue("resolve", res);
            } catch (err) {
                this.reject(err);
            }
        }

    }
    /**当父promise失败时 */
    private onParentReject(reason) {
        if (this.rejectProcessing != null) {
            try {
                let res = this.rejectProcessing.call(undefined, reason);
                this.handleReturnValue("resolve", res);
            } catch (err) {
                this.reject(err);
            }
        }
    }
    /**当增加一个子promise时 */
    private onReceiveChildPromise(childPromise: Hope<T>) {
        if (this.state == "rejected") {
            NextTick(() => {
                childPromise.onParentReject(this.failRes);
            });
        }
        if (this.state == "resolved") {
            NextTick(() => {
                childPromise.onParentResolve(this.successRes);
            });
        }
        this.children.push(childPromise);
    }
    /**then调用 */
    then(successCb?: (res: T) => T|Hope<T>|void, failCb?: (err: any) => any) {
        var childPromise = new Hope<T>(null);
        childPromise.resolveProcessing = typeof successCb === "function" ? successCb : (res) => { return res };
        childPromise.rejectProcessing = typeof failCb === "function" ? failCb : (err) => { throw err };

        this.onReceiveChildPromise(childPromise);

        return childPromise;
    }
    /**根据处理函数返回的结果决定最终的状态和值并触发后续的子promise */
    private handleReturnValue(type: "resolve" | "reject", callbackValue: any) {
        if (type == "reject") {
            this.reject(callbackValue);
            return;
        }
        if (callbackValue == this) {
            this.reject(new TypeError("circle promise"));
            return;
        }
        if (callbackValue instanceof Hope) {
            callbackValue.then(res => {
                this.resolve(res);
            }, reason => {
                this.reject(reason);
            });
            return;
        }
        if (callbackValue != null && (typeof callbackValue === "object" || typeof callbackValue === "function")) {
            let end = false;
            try {
                let then = callbackValue.then;
                if (typeof then === "function") {
                    NextTick(() => {
                        try {
                            then.call(callbackValue, res => {
                                if (end) return;
                                end = true;
                                this.handleReturnValue("resolve", res);
                            }, reason => {
                                if (end) return;
                                end = true;
                                this.reject(reason);
                            });
                        } catch (err) {
                            if (end) return;
                            end = true;
                            this.reject(err);
                        }

                    });
                } else {
                    this.resolve(callbackValue);
                }
            } catch (err) {
                if (end) return;
                end = true;
                this.reject(err);
            }
        } else {
            this.resolve(callbackValue);
        }
    }
    catch(failCb:((err:any)=>void|any)) {
        var childPromise = new Hope<T>(null);
        childPromise.resolveProcessing = (res) => { return res };
        childPromise.rejectProcessing = typeof failCb === "function" ? failCb : (err) => { throw err };

        this.onReceiveChildPromise(childPromise);

        return childPromise;
    }
    finally(finalCb:(()=>T|Hope<T>)) {
        if (typeof finalCb !== "function")
            throw new Error("finally callback can not be empty and should be a function");
        var childPromise = new Hope<T>(null);
        childPromise.resolveProcessing = () => { return finalCb() };
        childPromise.rejectProcessing = (err) => { finalCb(); throw err };

        this.onReceiveChildPromise(childPromise);

        return childPromise;
    }
    static all<T>(promises: Hope<T>[]) {
        let result: { index: number, res: T }[] = [];
        let state: "resolved" | "rejected" | "pending" = "pending";
        let promise = new Hope<T[]>((resolve, reject) => {
            promises.forEach((promise, index) => {
                promise.then(res => {
                    if (state === "pending") {
                        result.push({ index: index, res: res });
                        if (result.length == promises.length) {
                            state = "resolved";
                            let allres = result.sort((left, right) => left.index - right.index).map(item => item.res);
                            resolve(allres);
                        }
                    }
                }, err => {
                    if (state === "pending") {
                        state = "rejected";
                        reject(err);
                    }
                });
            });
        });
        return promise;
    }
    static any<T>(promises: Hope<T>[]) {
        let errors: { index: number, err: any }[] = [];
        let state: "resolved" | "rejected" | "pending" = "pending";
        let promise = new Hope<T>((resolve, reject) => {
            promises.forEach((promise, index) => {
                promise.then(res => {
                    if (state === "pending") {
                        state = "resolved";
                        resolve(res);
                    }
                }, err => {
                    if (state === "pending") {
                        errors.push({ index: index, err: err });
                        if (errors.length == promises.length) {
                            state = "resolved";
                            let allerrors = errors.sort((left, right) => left.index - right.index).map(item => item.err);
                            reject(allerrors);
                        }
                    }
                });
            });
        });
        return promise;
    }
    static race<T>(promises: Hope<T>[]){
        let state: "resolved" | "rejected" | "pending" = "pending";
        let promise = new Hope<T>((resolve, reject) => {
            promises.forEach((promise, index) => {
                promise.then(res => {
                    if (state === "pending") {
                        state = "resolved";
                        resolve(res);
                    }
                }, err => {
                    if (state === "pending") {
                        state = "rejected";
                        reject(err);
                    }
                });
            });
        });
        return promise;
    }
    static reject(err: any) {
        return new Hope<any>((resolve, reject) => {
            reject(err);
        });
    }
    static resolve(res: any) {
        return new Hope<any>((resolve, reject) => {
            resolve(res);
        });
    }

}



