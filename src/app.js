import router from 'umi/router';
import urlFn from '@/untils/method'
export function render(oldRender) {
    //遍历路由  获取参数
    let urlObj = urlFn(),
        currentToken = window.localStorage.getItem('token'),
        token = urlObj.token ? urlObj.token : currentToken,
        reg = window.localStorage.getItem('reg')
    //console.log(window.localStorage.getItem('reg'))
    if(token || reg){
        oldRender();
    }else{
        router.push('/login');
        oldRender();
    }
}