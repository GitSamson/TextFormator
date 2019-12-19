

function getTranslation (source,i=null){
    var appKey = '08063212076547ac';
    var key = 'ihTBclU1dBNqqCoZ11YCk90bBw3q1aIQ';//注意：暴露appSecret，有被盗用造成损失的风险
    var salt = (new Date).getTime();
    var curTime = Math.round(new Date().getTime() / 1000);
    var query = source;
    // 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
    var from = 'en';
    var to = 'zh-CHS';
    var str1 = appKey + truncate(query) + salt + curTime + key;
    var sign = sha256(str1);
    var _result;
     $.ajax({
        url: 'https://openapi.youdao.com/api',
        type: 'post',
        dataType: 'jsonp',
        async:false,
        data: {
            q: query,
            appKey: appKey,
            salt: salt,
            from: from,
            to: to,
            sign: sign,
            signType: "v3",
            curtime: curTime,
        },
        success: function (data) {
            if(i){
                if(data.translation){

                    var a = document.createElement('div');
                    a.innerText = data.translation[0];
    
                    i.parentElement.parentElement.parentElement.parentElement.insertBefore(a, i.parentElement.parentElement.parentElement);
                }
            }
            // console.log(data);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log(XMLHttpRequest);
            console.log(textStatus);
            console.log(errorThrown);
        }
    }  );
    
    return _result;

}
    function truncate(q) {
        var len = q.length;
        if (len <= 20) return q;
        return q.substring(0, 10) + len + q.substring(len - 10, len);
    }
// console.log(getTranslation('hi'));
