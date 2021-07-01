function getLocalDateTime(msString) {
    var dm = { 1: "янв", 2: "фев", 3: "мар", 4: "апр", 5: "мая", 6: "июн", 7: "июл", 8: "авг", 9: "сен", 10: "окт", 11: "ноя", 12: "дек" };
    var date = new Date(parseInt(msString));
    var dd = date.getDate();
    if (dd < 10) dd = '0' + dd;

    var dat = dd + ' ' + dm[date.getMonth() + 1];
    if (dd == new Date().getDate()) {
        dat = "сегодня";
    }
    return  dat + ' в ' + date.toTimeString().replace(/.*(\d{2}:\d{2})(:\d{2}).*/, "$1");

}
function validWords(count, words) {
    count += '';
    var lastNum = count.substr(-1);
    if (count > 4 && count < 21)
        return words[2];
    else if(lastNum < 5 && lastNum > 1)
        return words[1];
    else if(lastNum == 1)
        return words[0];
    else
        return words[2];
}
function isJson(json) {
    try {
        JSON.parse(json);
    } catch(e) {
        return false;
    }
    return true;
}
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function maskLoad(time, callback){
    var idTime = setTimeout(function(){$('#preloadMask').show()},time);
    callback(function(){
        clearTimeout(idTime);
        $('#preloadMask').hide();
    });
};
function ajaxRedirect(url, all, hist, update) {
    maskLoad(1500, function(clearTime){
        $.get('/'+zmain.vars.platform+'/'+url+'?sid='+zmain.vars.sid+'&all='+all, function(res) {
            clearTime();
            if (all)
                $('.all-content').html(res);
            else {
                $('.main').html(res);
            }
            if (hist) {
                history.pushState(null, null, '/'+zmain.vars.platform+'/'+url);

            }
            if (all)
                zmain.functions.initPage();
            else
                zmain.functions.initPageMini();
        });
    });
}
function demoUpload() {
    var $uploadCrop;

    function readFile(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $uploadCrop.croppie('bind', {
                    url: e.target.result
                });
                $('.upload-demo').addClass('ready');
            };

            reader.readAsDataURL(input.files[0]);
            $('.croppie-container').show();
        } else {
            if (input.files.length != 0)
                alert("Невозможно загрузить изображение. Воспользуйтесь более современным браузером, Например Google Chrome");
        }
    }

    $uploadCrop = $('#upload-demo').croppie({
        viewport: {
            width: 600,
            height: 200,
            type: 'square'
        },
        boundary: {
            width: 960,
            height: 320
        },
        update: function () {
            $uploadCrop.croppie('result', {
                type: 'canvas',
                size: 'viewport'
            }).then(function (resp) {
                popupResult({
                    src: resp
                });
            });
        },
        exif: true
    });

    $('#upload').on('change', function () { readFile(this); });
    $('.upload-result').on('click', function (ev) {
        $uploadCrop.croppie('result', {
            type: 'canvas',
            size: 'viewport'
        }).then(function (resp) {
            popupResult({
                src: resp
            });
        });
    });
}
function popupResult(result) {
    var html;
    if (result.html) {
        html = result.html;
    }
    $('.userbackground img').attr('src', result.src);
    setTimeout(function () {
        $('.sweet-alert').css('margin', function () {
            var top = -1 * ($(this).height() / 2),
                left = -1 * ($(this).width() / 2);

            return top + 'px 0 0 ' + left + 'px';
        });
    }, 1);
}
function validateEmail(emailField) {
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    return reg.test(emailField);
}
function validatePhone(phone) {
    var reg = /^\+[0-9]{7,14}$/;
    return reg.test(phone);
}

function __(str, arr) {
    let res = '';
    if (Object.keys(Main.i18n).indexOf(str) > -1) {
        res = Main.i18n[str];
    } else {
        res = str;
    }

    if (arr !== undefined) {
        $.each(arr, function(index, row) {
            res = res.replace(index, row);
        });
    }

    return res;
}