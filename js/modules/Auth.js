var Auth = {
    events: function (){
        $('#rulecheck').click(function () {
            if ($(this).prop('checked')) {
                $('#toReg').show();
            } else {
                $('#toReg').hide();
            }
        });
        $('body').on('click', '#send-double-auth-code', function(){
            $.post('/Auth/confirmCodeDoubleAuth',{code: $('.auth-qr-code-double-auth input').val()}, function(res) {
                if (isJson(res)) {
                    res = JSON.parse(res);
                }

                if (res.error != '') {
                    $('.auth-qr-code-double-auth input').css({'border': '1px solid red'});
                    $('.auth-qr-code-double-auth p').eq(1).html(res.error);
                } else {
                    window.location.replace('/');
                }
            });
        });
        $('body').on('keyup', '.auth-qr-code-double-auth input', function(e) {
            if (e.keyCode == 13) {
                $('#send-double-auth-code').click();
            }
        });
    },
    functions: {
        initMin: function(){
            $('.auth-qr-code-double-auth input').focus();
            $("#slider").easySlider({
                auto: true,
                continuous: true,
                nextId: "slider1next",
                prevId: "slider1prev"
            });
        }
    },
    vars: {

    }
};
Main.vars.classes.push(Auth);