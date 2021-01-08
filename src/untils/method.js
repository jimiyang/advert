function urlFn() {
    let urlObj = {};
    let urlToken = window.location.href.includes('?') ? window.location.href.split('?')[1].split('&') : ''
    if (urlToken) {
        urlToken.forEach(item => {
            let key = item.split('=')[0];
            let value = item.split('=')[1];
            urlObj[key] = value;
        })
    }
    return urlObj;
}

export default urlFn;