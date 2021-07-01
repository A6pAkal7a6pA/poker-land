var LK = {
    events: function (){
        $('.historybutton').click(function () {
            $(".mask").css('display', 'block');
            $(".box_window").css('display', 'block');
        });
        $('.bw_close').click(function () {
            $(".mask").css('display', 'none');
            $(".box_window").css('display', 'none');
        });
        $('body').on('click', '#close-button-double-auth', function() {
            $('.auth-qr-code-double-auth').remove();
        });
        $('.takeEmail').click(function () {
            $('.takeEmail').hide();
            $.post('/User/genCodeChangeEmail', {email: $("#takemail").val()}, function (res) {
                if (res == "ok") {
                    stickr({ note: __('Ссылка на смену логина отправлена на вашу почту.'), className: 'classic success', sticked: false });
                } else {
                    $('.takeEmail').show();
                    stickr({ note: res, className: 'classic error', sticked: false });
                }
            });
        });
        $('#wasonsite').change(function() {
            $.post("/Home/wasonsite" + $('#wasonsite').prop('checked'));
        });
        $('.double-auth-button-change').click(function() {
            $.post('/User/changeDoubleAuth', {}, function(res) {
                res = JSON.parse(res);
                var html = '<div class="auth-qr-code-double-auth" >\n' +
                    '    <img id="close-button-double-auth" src="/media/img/x.png"></img>'+
                    '    <br>\n' +
                    '    <img src="'+res.qrCode+'">'+
                    '<p>' +
                        __('Код подтверждения:') +
                    '</p>' +
                    '    <input  />\n' +
                    '    <p class="double-auth-code-error"></p>\n' +
                    '    <button id="send-double-auth-code">'+
                        __('Подтвердить') +
                    '</button>\n' +
                    '</div>';
                $('body').append(html);
                $('.auth-qr-code-double-auth input').focus();
            });
        });
        $('body').on('keyup', '.auth-qr-code-double-auth input', function(e) {
            if (e.keyCode == 13) {
                $('#send-double-auth-code').click();
            }
        });
        $('body').on('click', '#send-double-auth-code', function(res){
            $.post('/User/confirmCodeDoubleAuth',{code: $('.auth-qr-code-double-auth input').val()}, function(res) {
                if (isJson(res)) {
                    res = JSON.parse(res);
                }

                if (res.error != '') {
                    $('.auth-qr-code-double-auth input').css({'border': '1px solid red'});
                    $('.auth-qr-code-double-auth p').eq(1).html(res.error);
                } else {
                    $('.auth-qr-code-double-auth').remove();

                    $('.double-auth-button-change').html((res.status == 'off'?__('Включить'):__('Отключить')));
                    alert(__('Двухфакторная авторизация :status', {':status': (res.status == 'on'?__('включена'):__('отключенна'))}));
                }

            });
        });
    },
    functions: {

    },
    vars: {

    }
};
Main.vars.classes.push(LK);