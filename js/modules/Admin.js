var Admin = {
    events: function () {
        $('body').on('keyup', '.input-chat-text-admin .button-chat', function () {
            if (e.keyCode == 13) {
                let text = $('.input-chat-text-admin input').val();
                if (!$('.text-filter-list .sb-content p span:contains(' + text + ')').is('span')) {
                    $('.input-chat-text-admin input').val('');
                    $.post('/admin/addListCensor', {'mask': text}, function () {
                        $('.text-filter-list .sb-content').append('<p><button>X</button><span>' + text + '</span></p>');
                        $(".text-filter-list .sb-content").trigger("resize.scrollBox");
                        $('.text-filter-list .sb-content').scrollTop(100000);
                    });
                }
            }
        });
        $('body').on('click', '[pay-order-address]', function () {
            if (confirm(__('Вы уверенны ?'))) {
                $.post('/admin/payOrder', {id: $(this).attr('data-order-id')}, function (res) {
                    location.reload();
                });
            }
        });
        $('body').on('click', '.black-list.home .button-chat', function () {
            $.post('/admin/saveOptionBank', {
                id: $(this).attr('data-option-id'),
                value: $(this).parents('tr').find('input').val(),
            }, function () {
                location.reload();
            });
        });
        $('body').on('click', '[remove-order-address]', function () {
            if (confirm(__('Вы уверенны ?'))) {
                $.post('/admin/removeOrder', {id: $(this).attr('data-order-id')}, function (res) {
                    location.reload();
                });
            }
        });
        $('body').on('click', '.input-chat-text-admin .button-chat', function () {
            let text = $('.input-chat-text-admin input').val();
            if (!$('.text-filter-list .sb-content p span:contains(' + text + ')').is('span')) {
                $('.input-chat-text-admin input').val('');
                $.post('/admin/addListCensor', {'mask': text}, function (id) {
                    $('.text-filter-list .sb-content').append('<p><button data-id="' + id + '">Х</button> <span>' + text + '</span></p>');
                    $(".text-filter-list .sb-content").trigger("resize.scrollBox");
                    $('.text-filter-list .sb-content').scrollTop(100000);
                });
            }
        });
        $('body').on('click', '.text-filter-list button[data-id]', function () {
            let el = $(this);
            $.post('/admin/removeCensor', {'id': $(this).attr('data-id')}, function () {
                $(el).parents('p').remove();
            });
        });
        $('body').on('click', '.content-button .button-chat.delete-chat-msg', function () {
            let ids = [];
            $('input[name=users-select]:checked').each(function () {
                if ($.inArray($(this).parents('p').attr('data-id-msg'), ids) == -1) {
                    ids.push($(this).parents('p').attr('data-id-msg'));
                }
            });
            $.post('/admin/deleteChat', {'ids': ids, 'second': $(this).attr('data-time')}, function () {
                location.reload();
            });
        });
        $('body').on('click', '.content-tab.black-list [data-user-id]', function () {
            $.post('/admin/muteUser', {'ids': [$(this).attr('data-user-id')], 'second': 0}, function () {
                location.reload();
            });
        });
        $('body').on('click', '.content-button.list-move .button-chat[data-time]', function () {
            let ids = [];
            $('input[name=users-select]:checked').each(function () {
                if ($.inArray($(this).val(), ids) == -1) {
                    ids.push($(this).val());
                }
            });
            $.post('/admin/muteUser', {'ids': ids, 'second': $(this).attr('data-time')}, function () {
                location.reload();
            });
        });
        $('body').on('keyup', 'input[name=filter-user-login-bank]', function () {
            if($(this).val() == '') {
                $('.content-tab.black-list.bank tr').show();
            } else {
                $('.content-tab.black-list.bank tr:not(:first-child)').hide();
                $('.content-tab.black-list.bank tr:not(:first-child) td:first-child:contains('+$(this).val()+')').parents('tr').show();
            }
        });
        $('body').on('keyup', 'input[name=filter-user-id]', function () {
            if($(this).val() == '') {
                $('.content-tab.black-list.bank tr').show();
            } else {
                $('.content-tab.black-list.bank tr:not(:first-child)').hide();
                $('.content-tab.black-list.bank tr:not(:first-child) td:first-child:contains('+$(this).val()+')').parents('tr').show();
                $('.content-tab.black-list.bank tr:not(:first-child) td:nth-child(2):contains('+$(this).val()+')').parents('tr').show();
                $('.content-tab.black-list.bank tr:not(:first-child) td:nth-child(5):contains('+$(this).val()+')').parents('tr').show();
                $('.content-tab.black-list.bank tr:not(:first-child) td:nth-child(4):contains('+$(this).val()+')').parents('tr').show();
            }
        });
        $('body').on('keyup', 'input[name=filter-user-name]', function () {
            $.post('/admin/searchGamesByUser', {
                'user_name': $(this).val()
            }, function (res) {

                $('.lobby-list').empty();

                var userGames = JSON.parse(res);
                if (userGames != 0) {
                    if ($('input[name=filter-user-name]').val() != "") {
                        for (var i = 0; i < userGames.length; i++) {
                            var html = '<div>';
                            html += '<div>' +
                                '<span>' + userGames[i][0]['id'] + '</span>' +
                                '<span>' + userGames[i][0]['name'] + '</span></div>';
                            html += '<div>';
                            if (userGames[i][0]['type_id'] == 1) {
                                for (var j = 0; j < userGames[i][0]['count_players']; j++) {
                                    html += '<div class="list-game-user-avatar empty" style="background-image: url(/media/img/game/2253.png)"></div>';
                                }
                            }
                            html += '</div>';
                            html += '<div>';
                            html += ((userGames[i][0]['rate'] > 0) ? '<span>' + userGames[i][0]['rate'] + '</span>' : __('Без<br>ставок'));
                            html += '</div>';
                            html += '<div>';
                            if (userGames[i][0]['pass'] != '') {
                                html += '<img class="list-lobby-private-lobby-img" src="/media/img/game/1306.png" />';
                            }
                            html += '<a href="/admin/game/' + userGames[i][0]['id'] + '" class="button-watch">'+__('Смотреть')+'</a>';
                            html += '</div>';
                            html += '</div>';
                            $('.lobby-list').append(html);
                        }
                    } else {
                        for (var i = 0; i < userGames.length; i++) {
                            var html = '<div>';
                            html += '<div><span>' + userGames[i]['name'] + '</span></div>';
                            html += '<div>';
                            if (userGames[i]['type_id'] == 1) {
                                for (var j = 0; j < userGames[i]['count_players']; j++) {
                                    html += '<div class="list-game-user-avatar empty" style="background-image: url(/media/img/game/2253.png)"></div>';
                                }
                            }
                            html += '</div>';
                            html += '<div>';
                            html += ((userGames[i]['rate'] > 0) ? '<span>' + userGames[i]['rate'] + '</span>' : __('Без<br>ставок'));
                            html += '</div>';
                            html += '<div>';
                            if (userGames[i]['pass'] != '') {
                                html += '<img class="list-lobby-private-lobby-img" src="/media/img/game/1306.png" />';
                            }
                            html += '<a href="/admin/game/' + userGames[i]['id'] + '" class="button-watch">'+__('Смотреть')+'</a>';
                            html += '</div>';
                            html += '</div>';
                            $('.lobby-list').append(html);
                        }
                    }
                } else {
                    $('.lobby-list').append('<p class="user-not-found">'+__('Игрок с таким логином или почтой не найден')+'<br><img src="/media/img/notfound.png" alt="Not Found" /></p>');
                }

            });
        });
        $('body').on('click', '.addTourney', function () {
            if ($("#name").val() == '') {
                $("#name").css('border', '1px solid red');
                return false;
            }
            $('#addTourney').submit();
        });
        $('body').on('click', '.action-button', function () {
            if ($(this).prop('id') == 'actionDelete') {
                if (confirm(__('Вы уверены?'))) {
                    $.post('/ajax/deletetourney', {
                        id: $(this).attr('tourney-id')
                    }, function (res) {
                        location.reload();
                    });
                }
            } else if ($(this).prop('id') == 'actionEdit') {
                location.href = '/admin/turney/' + $(this).attr('tourney-id');
            }
        });
        if (Main.vars.worckerHendlers.commonChat === undefined) {
            Main.vars.worckerHendlers.commonChat = function (res) {

                if (res.id != 'undefined') {
                    return;
                }
                $('.common-chat .sb-content').append('' +
                    '<p class="chat-message" >' +
                    '<input type="checkbox" name="users-select" value="' + res.id + '" />' +
                    '<span class="chat-date">[' + res.time + ']</span>' +
                    '<span class="chat-avatar" get-data-user="' + res.id + '" style="background-image: url(' + res.avatar + ')"></span>' +
                    '<span class="chat-name" get-data-user="' + res.id + '">' + res.username + ': </span>' +
                    '<span class="chat-text">' + res.text + '</span>' +
                    '</p>' +
                    '');
                if ($('.common-chat .sb-content p').length > 35)
                    $('.common-chat .sb-content p').eq(0).remove();

                $(".common-chat").trigger("resize.scrollBox");
                $('.common-chat .sb-content').scrollTop(100000);
            }
        }
    },
    functions: {
        init: function () {
            new Promise(function (resolve) {
                if (Main.vars.worckerHendlers.connectSocket === undefined) {
                    Main.vars.worckerHendlers.connectSocket = function () {
                        resolve();
                    }
                }

                Main.functions.sendWorker('initSocket', {
                    url: Main.vars.config.socket['nodeServerUrl'],
                    cookie: document.cookie
                });
            }).then(function () {
                Admin.vars.statusSocket = true;
                for (key in Admin.vars.waitFunction) {
                    Admin.vars.waitFunction[key]();
                }
            });

        },
        sendSocket: function (command, data) {
            if (command == undefined)
                return false;
            if (data === undefined)
                data = {};

            var temp = function () {
                Main.functions.sendWorker('sendSocket', {
                    command: command,
                    data: {
                        data: data,
                    }
                });
            };
            temp();

        },
        initMin: function () {
            $(".info-popup .content-popup").scrollBox();
            $(".content-tab.black-list").scrollBox();
            $(".text-filter-list").scrollBox();
            $(".content-lobby").scrollBox();
            $(".common-chat").scrollBox();
            $('.common-chat .sb-content').scrollTop(1000);
        },
        workers: function () {
            if (Main.vars.webWorkersBody.initSocket === undefined) {
                Main.vars.webWorkersBody.initSocket = function (data) {
                    self.socket = io.connect(data.url);
                    self.cookie = data.cookie;
                    self.socket.on('connect', function () {
                        sendSocket({command: 'addLisener', data: {lobby: self.lobby}});
                        self.socket.on('addLisener', function () {
                            self.socket.on('clientEvent', function (respons) {
                                if (self['socketFunction_' + respons.command] !== undefined) {
                                    let promise = new Promise(function (resolve) {
                                        self['socketFunction_' + respons.command](respons.data, resolve);
                                    });
                                    promise.then(function (res) {
                                        if (self.statusTab) {
                                            postMessage([respons.command, res]);
                                        }
                                    });
                                } else {
                                    postMessage([respons.command, respons.data]);
                                }
                            });
                            postMessage(['connectSocket', []]);
                        });
                    });
                };
            }
            if (Main.vars.webWorkersBody.sendSocket === undefined) {
                Main.vars.webWorkersBody.sendSocket = function (data) {
                    if (data.command == undefined)
                        return false;
                    if (data.data === undefined)
                        data.data = {};
                    if (data.data.lobby === undefined)
                        data.data.lobby = self.lobby;
                    self.socket.emit((data.command == 'addLisener') ? data.command : 'serverEvent', {
                        'cookie': self.cookie,
                        'data': data.data,
                        'command': data.command
                    });
                };
            }
        },
    },
    vars: {
        statusSocket: false,
        soundStatus: true,
        zoomStatus: false,
        waitFunction: []
    }
};
Main.vars.classes.push(Admin);