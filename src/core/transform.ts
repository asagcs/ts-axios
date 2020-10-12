import { AxiosTransformer } from "../types";

/**
 * 对data和header依次用 fns函数/函数数组中的函数 进行处理
 * @param data 
 * @param headers 
 * @param fns 请求前用来处理data和header的函数或函数数组
 */
export default function transform(data:any, headers: any, fns?: AxiosTransformer | AxiosTransformer[]):any {
    if(!fns) {
        return data;
    }

    if(!Array.isArray(fns)) {
        fns = [fns];
    }

    fns.forEach(fn => {
        data = fn(data, headers)
    })

    return data
}