var Tourney = {
    events: function () {
        $(document).on('click', '.applywrapper>span', function () {
            if ($(this).hasClass('user-assigned')) {
                Tourney.functions.sendSocket('leaveTourney', {
                    lobby: -1,
                    user_id: Main.vars.userInterior.id,
                    tourneyId: $(this).attr('data-tourney_id')
                });
                Tourney.functions.sendSocket('getActiveTourneys', {lobby: -1});
            } else {
                Tourney.functions.sendSocket('assignTourney', {
                    lobby: -1,
                    user_id: Main.vars.userInterior.id,
                    tourneyId: $(this).attr('data-tourney_id')
                });
                Tourney.functions.sendSocket('getActiveTourneys', {lobby: -1});
            }
        });
        $('body').on('mouseover', '.oneStage>u', function () {
            let tmp = $(this).text();
            $(this).text($(this).attr('data-onhover'));
            $(this).attr('data-onhover', tmp);
        });
        $('body').on('mouseleave', '.oneStage>u', function () {
            let tmp = $(this).text();
            $(this).text($(this).attr('data-onhover'));
            $(this).attr('data-onhover', tmp);
        });
        $('body').on('click', '[data-model-open], [get-data-user]', function () {
            if ($(this).is('[get-data-user]')) {
                Tourney.functions.dataUser($(this).attr('get-data-user'), function () {
                    $('.game-popup-mask').eq(0).show();
                    $('.game-popup').hide();
                    $('.game-popup input[name="pass-lobby"]').val('');
                    $('#start-user-data').show();
                });
            } else {
                $('.game-popup-mask').eq(0).show();
                $('.game-popup').hide();
                $('.game-popup input[name="pass-lobby"]').val('');
                $($(this).attr('data-model-open')).show();
                if ($($(this).attr('data-model-open')).is('#data-user-info')) {
                    $(".info-popup .content-popup").trigger("resize.scrollBox");
                }
            }
            if ($(this).is('[data-model-open="#start-user-reit"]')) {
                $("#start-user-reit table.scroll tbody ").scrollBox();
            }

        });
        $('body').on('click', '.game-popup-mask:not(.dis), .close-popup, .close-pass-to-lobby', function () {
            $('.game-popup, .info-popup').hide();
            $('.game-popup-mask').hide();
        });
        $('body').on('click', '.viewTours', function () {
            $.get('/ajax/getfinishedtourneys', function (res) {
                res = JSON.parse(res);
                $(".endedTours").empty();
                if (res.length == 0) {
                    $(".endedTours").append('<div class="oneTour">' + __('Нет турниров') + '</div>');
                } else {
                    res.forEach(function (item) {
                        $(".endedTours").append('' +
                         '<div class="oneTour"> ' +
                            '<div class="header"> ' +
                                '<span class="name"> ' + item.name + '</span> ' +
                            '</div>' +
                            '<div class="content">' +
                                '<span class="info"> '+
                                     __('Участников') + ': ' + item.users.length + '/' + item.users.length + '. ' + __('Минимальное количество участников') + ' - ' + item.requirementsMin + '. ' + __('Тип игры: обычная') + '<br> ' +
                                     __('Требования')+ ':<br>' +
                                     __('не ниже')+ ' ' + item.reqMinText + 'а<br>' +
                                     __('не выше')+ ' ' + item.reqMaxText + 'а<br>' +
                                     __('Выигрыш')+ ': ' + item.priceBalans + ' $ , ' + item.priceGold + ' ETH' +
                                '</span><div class="time" data-tourney_id="' + item.activeTourneyId + '"></div>' +
                            '</div>'+
                            '<div class="bottomplace" data-tourney_id="' + item.activeTourneyId + '">'+
                                '<div class="photos"></div>'+
                                '<div class="surredWrapper applywrapper">'+
                                    '<a class="surredName button-bevel green tourneyTable" href="/Main/tourneyTable/' + item.activeTourneyId + '">' + __('Турнирная таблица') + '</a>' +
                                '</div>'+
                            '</div>'+
                         '</div>'
                         );

                        for (let i = 0; i < item.stageCount; i++) {
                            $("div.time[data-tourney_id='" + item.activeTourneyId + "']").append(''+
                                '<div class="oneStage">' +
                                    '<u data-onhover="' + item.stages[i].time.timeToStage + '">' + __('сегодня в') + ' ' + item.stages[i].time.stageTime + '</u>' +
                                    '<i>' + (+i + +1) + ' ' + __('этап') + '</i>' +
                                '</div>'
                            );
                        }
                    });

                    res.forEach(function (item) {
                        item.users.forEach(function (user) {
                            $("div[data-tourney_id='" + item.activeTourneyId + "']>.photos").append(''+
                                '<span class="joinerphoto">'+
                                    '<div get-data-user="' + user.id+ '"><img src="' + user.avatar + '"></div>'+
                                '</span>'
                            );
                        });
                    });
                }
            })
        });

        if (Main.vars.worckerHendlers.assignTourney === undefined) {
            Main.vars.worckerHendlers.assignTourney = function (res) {
                if (res) {
                    Main.vars.userInterior.tourneyId = res.tourneyId;
                    Tourney.vars.timeToReload = setTimeout(function () {
                        location.reload();
                    }, 10000);
                }
            }
        }
        if (Main.vars.worckerHendlers.leaveTourney === undefined) {
            Main.vars.worckerHendlers.leaveTourney = function (res) {
                Main.vars.userInterior.tourneyId = null;
                clearTimeout(Tourney.vars.timeToReload);
            }
        }
        if (Main.vars.worckerHendlers.getActiveTourneys === undefined) {
            Main.vars.worckerHendlers.getActiveTourneys = function (res) {
                console.log(res);
                // ADD ACTIVE TOURNEYS
                $(".activeTours").empty();

                if (res.active === undefined || res.active.length === 0) {
                    $(".activeTours").append('<div class="oneTour">' + __('Нет турниров') + '</div>');
                } else {
                    res.active.forEach(function (item) {
                        console.log(item);
                        $(".activeTours").append(''+
                        '<div class="oneTour">'+
                            '<div class="header">'+
                                '<span class="name ">' + item.name + '</span>'+
                            '</div>'+
                            '<div class="content">'+
                                '<span class="info">'+
                                    __('Участников')+ ': '+item.users.length + '/' +item.requirementsMax + '. ' + __('Минимальное количество участников') + ' - ' + item.requirementsMin + '.<br> ' +
                                    __('Тип игры: обычная') + '<br>' +
                                    __('Требования') + ':<br>' +
                                    __('взнос') + ' ' + item.buy_in_eth + ' ETH<br>' +
                                    __('не ниже') + ' '  + item.reqMinText  + 'а<br>' +
                                    __('не выше') + ' '  + item.reqMaxText  + 'а<br>' +
                                    __('Выигрыш') + ': ' + item.priceBalans + ' $, ' + item.priceGold + ' ETH' +
                                '</span>'+
                                '<div class="time" data-tourney_id="'+ item.activeTourneyId +'"></div>'+
                            '</div>'+
                            '<div class="bottomplace" data-tourney_id="' + item.activeTourneyId + '">' +
                                '<div class="photos"></div><div class="surredWrapper applywrapper"></div>'+
                            '</div>'+
                        '</div>');

                        for (let i = 0; i < item.stageCount; i++) {
                            $("div.time[data-tourney_id='" + item.activeTourneyId + "']").append('<div class="oneStage">' +
                                '<u data-onhover="' + item.stages[i].time.timeToStage + '">' + __('сегодня в ') + ' ' + item.stages[i].time.stageTime + ' </u>' +
                                '<i>' +(+i + +1) + ' ' + __('этап') + '</i>' +
                            '</div>');
                        }

                        if (Main.vars.userInterior.tourneyId == item.activeTourneyId) {
                            $(".activeTours").append('<span class="explain"> ' +
                                 __('Вы зарегистрированы на этот турнир.') + ' <br>' + __('Вам необходимо в назначенное время быть в лобби игры.') + ' <br> <a class="tolobby" href="/">' + __('Перейти в лобби') + '</a>\n' +
                                '</span>');

                            Tourney.vars.timeToReload = setTimeout(function () {
                                document.location.href = '/';
                            }, (item.stages[0].time.timeout + 3) * 1000);
                        }

                    });

                    res.active.forEach(function (item) {
                        if (item.isOpen) {
                            $("div[data-tourney_id='" + item.activeTourneyId + "']>.applywrapper").append(''+
                            '<span class="surredName button-bevel green">' +
                                __('Участвовать') + '<br>(' + item.priceBalans + '$)' +
                            '</span>'
                        );
                        } else {
                            $("div[data-tourney_id='" + item.activeTourneyId + "']>.applywrapper").append(''+
                             '<a class="surredName button-bevel green tourneyTable" href="/Main/tourneyTable/' + item.activeTourneyId  + '">' +
                                __('Турнирная таблица') +
                            '</a>');
                        }

                        $("div[data-tourney_id='" + item.activeTourneyId + "']>.applywrapper>span").attr('data-tourney_id', item.activeTourneyId);

                        item.users.forEach(function (user) {
                            $("div[data-tourney_id='" + item.activeTourneyId + "']>.photos").append(''+
                                '<span class="joinerphoto">' +
                                    '<div get-data-user="' + user.id + '">' +
                                        '<img src="' + user.avatar + '">' +
                                    '</div>'+
                                '</span>'
                            );

                            if (Main.vars.userInterior.id == user.id) {
                                $("div[data-tourney_id='" + item.activeTourneyId + "']>.applywrapper>span").addClass('user-assigned red');
                                $("div[data-tourney_id='" + item.activeTourneyId + "']>.applywrapper>span").text(__('Отменить участие'));
                            }
                        });
                    });
                }

                // ADD PROCESSING TOURNEYS
                $(".processTours").empty();

                if (res.process === undefined || res.process.length === 0) {
                    $(".processTours").append('<div class="oneTour">Нет турниров</div>');
                } else {
                    res.process.forEach(function (item) {
                        $(".processTours").append(''+
                    '<div class="oneTour">' +
                        '<div class="header">' +
                            '<span class="name ">' + item.name + '</span>' +
                        '</div>' +
                        '<div class="content">' +
                            '<span class="info">' +
                                __('Участников')+ ': ' + item.users.length + '/' + item.requirementsMax + '. '+ __('Минимальное количество участников') + ' - ' + item.requirementsMin + '.' + __('Тип игры: обычная') + '<br>' +
                                __('Требования')+ ':' +
                                __('Требования')+ ':<br>' +
                                __('не ниже')+ ' ' + item.reqMinText  + 'а<br>' +
                                __('не выше')+ ' ' + item.reqMaxText  + 'а<br>' +
                                __('Выигрыш')+ ':' + item.priceBalans + ' $, ' + item.priceGold + 'ETH' +
                            '</span>' +
                            '<div class="time" data-tourney_id="' + item.activeTourneyId + '">' +
                            '</div>' +
                        '</div>' +
                        '<div class="bottomplace" data-tourney_id="' + item.activeTourneyId + '">' +
                            '<div class="photos"></div>' +
                            '<div class="surredWrapper applywrapper">' +
                                '<a class="surredName button-bevel green tourneyTable" href="/Main/tourneyTable/' + item.activeTourneyId + '">' + __('Турнирная таблица') + '</a>' +
                            '</div>' +
                        '</div>'+
                    '</div>');

                        for (let i = 0; i < item.stageCount; i++) {
                            $("div.time[data-tourney_id='" + item.activeTourneyId + "']").append('' +
                                '<div class="oneStage">' +
                                '<u data-onhover="' + item.stages[i].time.timeToStage + '">' + __('сегодня в ') + ' ' + item.stages[i].time.stageTime + '</u>' +
                                '<i>' +(+i + +1) + __('этап') + '</i>'+
                            '</div>');
                        }
                    });

                    res.process.forEach(function (item) {
                        item.users.forEach(function (user) {
                            $("div[data-tourney_id='" + item.activeTourneyId + "']>.photos").append(''+
                                '<span class="joinerphoto">'+
                                    '<div get-data-user="'+user.id+'"><img src="'+user.avatar+'"></div>'+
                                '</span>'
                            );
                        });
                    });
                }
            }
        }
    },
    functions: {
        initMin: function () {
            $.mCustomScrollbar.defaults.theme = "inset";
            $.mCustomScrollbar.defaults.scrollButtons.enable = true;

            $(".tourscroll").mCustomScrollbar({
                axis: "x",
                advanced: {autoExpandHorizontalScroll: true}
            });
        },
        init: function () {
            new Promise(function (resolve) {
                if (Main.vars.worckerHendlers.connectSocket === undefined) {
                    Main.vars.worckerHendlers.connectSocket = function () {
                        resolve();
                    }
                }
                Main.functions.sendWorker('setLobby', {lobby: -1});

                Main.functions.sendWorker('initSocket', {
                    url: Main.vars.config.socket['nodeServerUrl'],
                    cookie: document.cookie
                });

            }).then(function () {
                Tourney.vars.statusSocket = true;
                Tourney.vars.waitFunction['getActiveTourneys'] = function () {
                    Tourney.functions.sendSocket('getActiveTourneys', {lobby: -1});
                };
                for (key in Tourney.vars.waitFunction) {
                    Tourney.vars.waitFunction[key]();
                }
            });
        },
        dataUser: function (id, callback) {
            $.post('/user/getProfileInfo', {id: id}, function (data) {
                data = JSON.parse(data);
                $('#start-user-data .avatar-for-user-avatar > div').css({
                    backgroundImage: 'url(' + (data['avatar'].indexOf('http') > -1 ? data['avatar'] : '/media/img/avatars/' + data['avatar']) + ')'
                });
                $('#start-user-data .avatar-for-user-status p').eq(0).html(data['username']);
                $('#start-user-data .avatar-for-user-status p').eq(1).html(data['rangName']);

                $('.info-for-user table tr').eq(0).find('td').eq(1).html(data['count_game']);
                $('.info-for-user table tr').eq(0).find('td').eq(3).html(parseFloat(data['eth_for_week']).toFixed(4));
                $('.info-for-user table tr').eq(1).find('td').eq(1).html(data['count_game_party']);
                $('.info-for-user table tr').eq(1).find('td').eq(3).html(data['rang'].replace(/(\d{1,3})(?=((\d{3})*([^\d]|$)))/g, " $1 ") + ' $');
                $('.info-for-user table tr').eq(2).find('td').eq(1).html(data['count_game_win']);
                $('.info-for-user table tr').eq(2).find('td').eq(3).html(data['rang_for_week'].replace(/(\d{1,3})(?=((\d{3})*([^\d]|$)))/g, " $1 ") + ' $');
                $('.info-for-user table tr').eq(3).find('td').eq(1).html(data['count_game_win_party']);
                $('.info-for-user table tr').eq(3).find('td').eq(3).html(data['online_status'] ? '<span class="start-user-data-text-green">Online</span>' : data['last_login']);
                $('.info-for-user table tr').eq(4).find('td').eq(1).html(data['reit']);
                $('.info-for-user table tr').eq(4).find('td').eq(3).html(data['reitForWeek']);
                $('.info-for-user table tr').eq(5).find('td').eq(1).html(data['count_turney_wisit']);
                $('.info-for-user table tr').eq(5).find('td').eq(3).html(data['count_turney_win']);

                callback();
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

            if (Main.vars.webWorkersBody.setLobby === undefined) {
                Main.vars.webWorkersBody.setLobby = function (data) {
                    self.lobby = data.lobby;
                }
            }
        },
    },
    vars: {
        timeToReload: undefined,
        statusSocket: false,
        soundStatus: true,
        zoomStatus: false,
        waitFunction: []
    }
};
Main.vars.classes.push(Tourney);