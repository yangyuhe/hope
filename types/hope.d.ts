export declare class Hope {
    private successRes;
    private failRes;
    private resolveCallback;
    private rejectCallback;
    private children;
    private state;
    constructor(callback: (resolve: any, reject: any) => void);
    private resolve;
    private reject;
    private onParentResolve;
    private onParentReject;
    private onReceiveChildPromise;
    then(successCb?: (res: any) => any, failCb?: (err: any) => any): Hope;
    private handleReturnValue;
    catch(failCb: any): Hope;
    finally(finalCb: any): Hope;
    static all(promises: Hope[]): Hope;
    static any(promises: Hope[]): Hope;
    static race(promises: Hope[]): Hope;
    static reject(err: any): Hope;
    static resolve(res: any): Hope;
}
