import CancelToken from '../../src/cancel/CancelToken';
import axios, { Canceler } from '../../src/index';

const ConcelToken = axios.CancelToken
const source = ConcelToken.source()

axios.get('/cancel/get', {
  cancelToken: source.token
}).catch(function(e) {
  if(axios.isCancel(e)) {
    console.log('Request canceled', e.message)
  }
})

setTimeout(() => {
  source.cancel('operation canceled by the user.')

  axios.post('/cancel/post', {a: 1}, {
    cancelToken: source.token
  }).catch(function(e){
    if(axios.isCancel(e)) {
      console.log(e.message)
    }
  })
}, 100)

let cancel:Canceler

axios.get('/cancel/get', {
  cancelToken: new CancelToken(c => {
    cancel = c
  })
}).catch(function(e){
  if(axios.isCancel(e)){
    console.log('Request canceled')
  }
})

setTimeout(() => {
  cancel();
}, 200)