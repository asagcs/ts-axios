import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types';
import { parseHeaders } from '../helpers/headers';
import { createError } from '../helpers/error';  
import { isURLSameOrigin } from '../helpers/url';
import cookie from '../helpers/cookie';
import { isFormData } from '../helpers/util';

export default function xhr (config: AxiosRequestConfig): AxiosPromise {
    return new Promise((resolve, reject) => {
        const { data = null, url, method = 'get', headers, responseType, timeout, cancelToken, withCredentials, 
            xsrfCookieName, xsrfHeaderName, onDownloadProgress, onUploadProgress
        } = config
  
        const request = new XMLHttpRequest();
    
        request.open(method.toUpperCase(), url!, true)

        configureRequest();

        addEvents();

        progressHeaders();

        processCancel();
        

        request.send(data)

        //  配置请求
        function configureRequest():void {
            if(responseType) {
                request.responseType = responseType;
            }
    
            if(timeout) {
                request.timeout = timeout;
            }
    
            if(withCredentials) {
                request.withCredentials = withCredentials;
            }
        }

        //  事件绑定
        function addEvents(): void {
            request.onreadystatechange = function handleLoad() {
                if(request.readyState !== 4) {
                    return 
                }
    
                if(request.status === 0) {
                    return;
                }
    
                const responseHeaders = parseHeaders(request.getAllResponseHeaders());
                const responseData = responseType !== 'text' ? request.response : request.responseText;
                const response: AxiosResponse = {
                    data: responseData,
                    status: request.status,
                    statusText: request.statusText,
                    headers: responseHeaders,
                    config,
                    request
                }
    
                handleResponse(response);
            }
    

            request.onerror = function handleError() {
                reject(createError('Network Error', config, null, request))
            }
    
            request.ontimeout = function handleTimeout() {
                reject(createError(`Timeout of ${timeout} ms exceeded`, config, 'ECONNABORTED', request))
            }
    
            if(onDownloadProgress) {
                request.onprogress = onDownloadProgress
            }
    
            if(onUploadProgress) {
                request.upload.onprogress = onUploadProgress;
            }
        }

        //  进度处理
        function progressHeaders():void {
            if(isFormData(data)) {
                delete headers['Content-Type']
            }
    
            if((withCredentials || isURLSameOrigin(url!)) && xsrfCookieName) {
                const xsrfValue = cookie.read(xsrfCookieName);
                if(xsrfValue && xsrfHeaderName) {
                    headers[xsrfHeaderName] = xsrfValue;
                }
            }
        
            Object.keys(headers).forEach((name) => {
                if (data === null && name.toLowerCase() === 'content-type') {
                    delete headers[name]
                } else {
                    request.setRequestHeader(name, headers[name])
                }
            })
        }

        function processCancel(): void {
            if(cancelToken) {
                // tslint:disable-next-line: no-floating-promises
                cancelToken.promise.then(reason => {
                    request.abort();
                    reject(reason)
                })
            }
        }

        function handleResponse(response: AxiosResponse) {
            if(response.status >= 0 && response.status <300) {
                resolve(response);
            }else{
                reject(createError(`Requset faild with status code ${response.status}`, config, null, request, response))
            }
        }
    
        
    })
    
  }