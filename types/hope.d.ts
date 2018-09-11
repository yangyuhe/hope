export declare class Hope<T> {
    private successRes;
    private failRes;
    private resolveProcessing;
    private rejectProcessing;
    private children;
    private state;
    constructor(callback: (resolve: ((res: T | Hope<T>) => void), reject: any) => void);
    /**当前promise成功 */
    private resolve;
    /**当前promise失败 */
    private reject;
    /**当父promise成功时 */
    private onParentResolve;
    /**当父promise失败时 */
    private onParentReject;
    /**当增加一个子promise时 */
    private onReceiveChildPromise;
    /**then调用 */
    then(successCb?: (res: T) => T | Hope<T> | void, failCb?: (err: any) => any): Hope<T>;
    /**根据处理函数返回的结果决定最终的状态和值并触发后续的子promise */
    private handleReturnValue;
    catch(failCb: ((err: any) => void | any)): Hope<T>;
    finally(finalCb: (() => T | Hope<T>)): Hope<T>;
    static all<T>(promises: Hope<T>[]): Hope<T[]>;
    static any<T>(promises: Hope<T>[]): Hope<T>;
    static race<T>(promises: Hope<T>[]): Hope<T>;
    static reject(err: any): Hope<any>;
    static resolve(res: any): Hope<any>;
}
