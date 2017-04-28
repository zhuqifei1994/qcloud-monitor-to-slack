var Capi = require('qcloudapi-sdk')
var querystring = require('querystring');

//通过构造函数传入的参数将作为默认配置
var capi = new Capi({
    SecretId: process.env.QCLOUD_SECRET_ID,
    SecretKey: process.env.QCLOUD_SECRET_KEY,
    serviceType: 'account'
})

//生成signature
function signature() {
    var qs = capi.generateQueryString({
        Action: 'DescribeInstances',
        otherParam: 'otherParam'
    }, {
            serviceType: 'cvm'
        });

    var json = querystring.parse(qs);
    var signature = json.signature;
    return signature;
}

module.exports = {
    signature
}
