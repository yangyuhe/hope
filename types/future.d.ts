export declare class Future {
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
    then(successCb?: (res: any) => any, failCb?: (err: any) => any): Future;
    private handleReturnValue;
    catch(failCb: any): Future;
    finally(finalCb: any): Future;
    static allResolved(promises: Future[]): Future;
    static anyResolve(promises: Future[]): Future;
    static reject(err: any): Future;
    static resolve(res: any): Future;
}
