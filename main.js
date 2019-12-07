
var style = {
    en_s_start: '<section style="margin: 5px 0px; padding: 0px; color: rgb(51, 51, 51); font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; orphans: 2; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-style: initial; text-decoration-color: initial; font-size: medium; font-family: -apple-system-font, BlinkMacSystemFont, &quot;Helvetica Neue&quot;, &quot;PingFang SC&quot;, &quot;Hiragino Sans GB&quot;, &quot;Microsoft YaHei UI&quot;, &quot;Microsoft YaHei&quot;, Arial, sans-serif; letter-spacing: 0.544px; text-align: left; line-height: normal;" >'
    ,
    en_s_end: '</section>'
    ,
    en_p_start: '<span style="margin: 0px; padding: 0px; font-style: italic; font-size: 12px; color: rgb(178, 178, 178);">'
    ,
    en_p_end: '</span>'
    ,
    cn_s_start: '<section style="margin: 5px 0px 10px; padding: 0px; max-width: 100%; box-sizing: border-box !important; overflow-wrap: break-word !important; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, &quot;Helvetica Neue&quot;, &quot;PingFang SC&quot;, &quot;Hiragino Sans GB&quot;, &quot;Microsoft YaHei UI&quot;, &quot;Microsoft YaHei&quot;, Arial, sans-serif; font-size: 17px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: 0.544px; orphans: 2; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial; text-align: left; line-height: normal;">'
    ,
    cn_p_start: '<span style="margin: 0px; padding: 0px; max-width: 100%; box-sizing: border-box !important; overflow-wrap: break-word !important; font-size: 12px;">'
    ,
    cn_s_end: '</section>'
    ,
    cn_p_end: '</span>'
    ,
    img_start: '<img src= '
    ,
    img_end: ' />'
    
}


var htmlGenerator = {
    present: function (source) {

        // source  = {type : "img/text", content : " "}
        let _s = source;
        if (_s.type == 'text') { _s.type = textHandler.isChinese(_s.content) ? 'cn' : 'en' }


        _s = htmlGenerator[_s.type](source.content);
        console.log(source.content);

        document.write(_s);
    },
    en: function (text) {
        return (
            style.en_s_start +
            style.en_p_start +
            text +
            style.en_p_end +
            style.en_s_end
        )
    },
    cn: function (text) {
        return (
            style.cn_s_start +
            style.cn_p_start +
            text +
            style.cn_p_end +
            style.cn_s_end
        )
    },
    img: function (imgSrc) {
        return (
            style.img_start +
            imgSrc +
            style.img_end
        );
    }
}


var textHandler = {
    getContent: function (contentKey_start, contentKey_end, text) {
        //text = source text/html replaced next line 
        let _s = contentKey_start;
        let _e = contentKey_end;
        let _t = text;
        let i_s = _t.indexOf(contentKey_start);

        if (i_s === -1) { return false };
        i_s += _s.length;

        _t = _t.slice(i_s); //_t = cuted text 
        let i_e = _t.indexOf(contentKey_end);
        let _c = _t.slice(0, i_e);
        _c = _c[0].toUpperCase()+_c.slice(1);

        return {
            content: _c,
            contentStart: i_s,
            contentEnd: i_s + i_e + _e.length
        }
    },
    key_word_s: 'data-text="true">',
    key_word_e: '</span>',
    key_img_s: 'src=',
    key_img_e: 'data-size',
    findWord: function (text) {
        //text = source text/html replaced next line.
        let result = textHandler.getContent(textHandler.key_word_s, textHandler.key_word_e, text);
        result.content&&(result.content = result.content[0].toUpperCase()+result.content.slice(1));
        // console.log(result.content);
        
        return result;
    },
    findImg: function (text) {
        return textHandler.getContent(textHandler.key_img_s, textHandler.key_img_e, text);
    },
    isChinese: function (content) {
        let re = /.*[\u4e00-\u9fa5]+.*$/;
        return re.test(content);
    }
}

var contentRepresent = function (contentArray) {
    // contentArray= [{type:"img/text" , content: ""}]

    contentArray.map(i => {

        // i = {type : "img/text" , content : " "}
        htmlGenerator.present(i);

    });
}

function contentAnalysis(zhihuContent) {
    // zhihuContent = text/html sourceText replaced next line 
    let _t = zhihuContent;
    let _word; // {content, contentStart,contentEnd}
    let _img;
    let result = []; //{word : "" / img: ""}

    var refresh = function (wait = null) {
        wait != 'word' && (_word = textHandler.findWord(_t)); // {content,contentStart,contentEnd}
        wait != 'img' && (_img = textHandler.findImg(_t))
        if (_word == -1) { _word = false };
        if (_img == -1) { _img = false };
    }
    refresh();

    while (_word != false || _img != false) {
        if (_word == false || _img == false) {
            let last = _word || _img; // {content, contentStart, contentEnd}
            _word != false && result.push({ type: "text", content: last.content });
            _img != false && result.push({ type: "img", content: last.content });

            _t = _t.slice(last.contentEnd); // _t cuted start
            refresh();
            continue;
        }

        if (_word.contentStart < _img.contentStart) {
            result.push({ type: "text", content: _word.content });
            _t = _t.slice(_word.contentEnd);
            refresh();

        } else {
            result.push({ type: 'img', content: _img.content });
            _t = _t.slice(_img.contentEnd);
            refresh();

        }
        //here one text / img still wait to push into result.
    }
    return result;
}

function main(source) {
    console.log(source);

    let _s = source.split('\n').join();
    //source text replaced next line.

    var a = contentAnalysis(_s);
    // {type: "img'/'text", content: ""}

    contentRepresent(a);
}


function zhihuRender(source) {

    let _s = source
    //source text replaced next line.
    let _result= new String;
    var _word = textHandler.findWord(_s); //{content,contentStart,contentEnd}
    while (_word) {
        if(_word.content == ""){

        }
        else if (!textHandler.isChinese(_word.content)) {
            _result += (
                _s.slice(0, _word.contentStart) +
                '<i>' +
                _word.content +
                '</i>' +
                style.en_p_end
            );
        } else {
            _result += _s.slice(0, _word.contentEnd);
        }
        _s = _s.slice(_word.contentEnd);
        _word = textHandler.findWord(_s); //{content,contentStart,contentEnd}
    }
    _result+=_s;
    document.write(_result);

}
