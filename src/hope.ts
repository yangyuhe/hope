import { NextTick } from "./nexttick";
export class Hope {
    private successRes: any = null;
    private failRes: any = null;
    private resolveCallback: any = null;
    private rejectCallback: any = null;
    private children: Hope[] = [];
    private state: "pending" | "resolved" | "rejected" = "pending";
    constructor(callback: (resolve: any, reject: any) => void) {
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

    private resolve(data) {
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
    private onParentResolve(data) {
        if (this.resolveCallback != null) {
            try {
                let res = this.resolveCallback.call(undefined, data);
                this.handleReturnValue("resolve", res);
            } catch (err) {
                this.reject(err);
            }
        }

    }
    private onParentReject(reason) {
        if (this.rejectCallback != null) {
            try {
                let res = this.rejectCallback.call(undefined, reason);
                this.handleReturnValue("resolve", res);
            } catch (err) {
                this.reject(err);
            }
        }
    }
    private onReceiveChildPromise(childPromise: Hope) {
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

    then(successCb?: (res: any) => any, failCb?: (err: any) => any) {
        var childPromise = new Hope(null);
        childPromise.resolveCallback = typeof successCb === "function" ? successCb : (res) => { return res };
        childPromise.rejectCallback = typeof failCb === "function" ? failCb : (err) => { throw err };

        this.onReceiveChildPromise(childPromise);

        return childPromise;
    }
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
    catch(failCb) {
        var childPromise = new Hope(null);
        childPromise.resolveCallback = (res) => { return res };
        childPromise.rejectCallback = typeof failCb === "function" ? failCb : (err) => { throw err };

        this.onReceiveChildPromise(childPromise);

        return childPromise;
    }
    finally(finalCb) {
        if (typeof finalCb !== "function")
            throw new Error("finally callback can not be empty and should be a function");
        var childPromise = new Hope(null);
        childPromise.resolveCallback = () => { finalCb() };
        childPromise.rejectCallback = (err) => { finalCb(); throw err };

        this.onReceiveChildPromise(childPromise);

        return childPromise;
    }
    static all(promises: Hope[]) {
        let result: { index: number, res: any }[] = [];
        let state: "resolved" | "rejected" | "pending" = "pending";
        let promise = new Hope((resolve, reject) => {
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
    static any(promises: Hope[]) {
        let errors: { index: number, err: any }[] = [];
        let state: "resolved" | "rejected" | "pending" = "pending";
        let promise = new Hope((resolve, reject) => {
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
    static race(promises: Hope[]){
        let state: "resolved" | "rejected" | "pending" = "pending";
        let promise = new Hope((resolve, reject) => {
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
        return new Hope((resolve, reject) => {
            reject(err);
        });
    }
    static resolve(res: any) {
        return new Hope((resolve, reject) => {
            resolve(res);
        });
    }

}



