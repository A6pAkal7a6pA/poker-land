var Game = {
    events: function () {
        $('body').on('keyup', '#game-chat-content .input-chat-text input', function (e) {
            if (e.keyCode == 13) {
                $('#game-chat-content .input-chat-text .button-chat').click();
            }
        });
        $('body').on('click', '#game-chat-content .input-chat-text .button-chat', function () {
            var text = $('#game-chat-content .input-chat-text input').val();
            if ($.trim(text).length <= 0) {
                return false;
            }
            var user = $('#game-chat-tabs .active').attr('data-chat-id');
            var data = {
                msg: $('#game-chat-content .input-chat-text input').val(),
            };

            if (user != -1) {
                data.whom = user;
            }
            $('#game-chat-content .input-chat-text input').val('');
            GameMain.functions.sendSocket('gameChat', data);
        });
        $('body').on('click', '#game-chat-tabs > div', function () {
            $('#game-chat-tabs > div').removeClass('active');
            $(this).addClass('active');
            var chat_id = $(this).attr('data-chat-id');
            $('#game-chat-content > div').hide();
            $('#game-chat-tabs > div[data-chat-id="' + chat_id + '"] div b').html('');
            $('#game-chat-content > div[data-chat-id="' + chat_id + '"]').show();
        });
        $('body').on('click', '#surrender-button:not(.watcher)', function () {
            $.post('/game/ajax/surrender', {
                lobby: location.href.split('/').pop()
            }, function () {
                GameMain.functions.sendSocket('updateListGame');
                GameMain.functions.sendSocket('updateGame');
                setTimeout(function () {
                   location.reload();
                },1000);

            });
        });
        $('body').on('click', '.no-money-button-ok', function () {
            $('#no-money').hide();
            if ($('.game-popup:visible').length == 0) {
                $('.game-popup-mask').hide();
            }
        });
        $('body').on('click', '#surrender-button.watcher', function () {
            $.post('/game/ajax/leaveGame', {
                lobby: location.href.split('/').pop()
            }, function () {
                if ($('#wait-user-lobby').is('div')) {
                    GameMain.functions.sendSocket('linkToGame');
                }
                GameMain.functions.sendSocket('updateListGame');
                GameMain.functions.sendSocket('updateGame');
                setTimeout(function () {
                    location.reload();
                },1000);
            });
        });
        $('body').on('click', '.game-top-panel > div[data-buttun-name]', function () {
            var el = this;
            new Promise(function (resolve) {
                Game.vars.promisAction = resolve;
                if (Game.functions.actionButton[$(el).attr('data-buttun-name')] !== undefined) {
                    Game.functions.actionButton[$(el).attr('data-buttun-name')]();
                } else {
                    Game.functions.actionButton.default($(el).attr('data-buttun-name'))
                }
            }).then(function (data) {
                if (isJson(data)) {
                    data = JSON.parse(data);
                }
                if (typeof data == 'object' || data == '') {
                    if (data.history !== undefined) {
                        GameMain.functions.sendSocket('updateGame', {history: data.history});
                    } else {
                        GameMain.functions.sendSocket('updateGame');
                    }

                } else if (data == 'no money') {
                    $('.game-popup-mask').eq(0).show();
                    $('#no-money').show();
                    $('#no-money .no-money-text').html('' +
                        '<p>\n' +
                        __('У Вас не хватает денег для совершения действия.') +
                        '</p>\n' +
                        '<p>\n' +
                        __('Для получения средств Вы можете заложить фирму или продать филиал.') +
                        '</p>');
                } else if (data == 'no money party') {
                    $('.game-popup-mask').eq(0).show();
                    $('#no-money').show();
                    $('#no-money .no-money-text').html('' +
                        '<p>\n' +
                        __('У данного игрока не хватает денег для совершения действия.') +
                        '</p>\n');
                } else {
                    console.log(data);
                }
            });
        });
        $('body').on('click', '.auction-buttons [data-button-auction]', function () {
            Main.functions.sendWorker('clearAuctionTimer', {});
            GameMain.functions.sendSocket('auction', {
                'action': $(this).attr('data-button-auction')
            });
            $('#auction-modal').hide();
            $('.game-popup-mask').hide();
        });
        $('body').on('mouseleave', 'div[data-step]', function (e) {
            $('.cart-place').hide();
        });
        $('body').on('click', '#deal-modal .button-chat:not(.orange-button)', function (e) {
            GameMain.functions.sendSocket('deal', {
                'places': Game.vars.selectPlace.users,
                'money': parseInt($('.footer-popup .amount-price span').html()),
                'withUserDeal': $('#deal-modal .content-popup > div').eq(1).attr('data-user-id'),
                'dealStatus': 'yes'
            });
            $('.deal-active-price span').html('');
            $('#deal-modal .content-popup > div .deal-place .sb-content').html('');
            $('.amount-procent, .amount-price, .price-width, .deal-active-price').css({visibility: 'hidden'});
            $('#deal-modal').hide();
            $('div[data-step].mask-place').removeClass('mask-place');
        });
        $('body').on('click', '#deal-modal .button-chat.orange-button', function (e) {
            var tempFunction = function () {
                $('.deal-active-price span').html('');
                $('#deal-modal .content-popup > div .deal-place .sb-content').html('');
                $('.amount-procent, .amount-price, .price-width, .deal-active-price').css({visibility: 'hidden'});
                $('#deal-modal').hide();
                $('div[data-step].mask-place').removeClass('mask-place');
            };
            if (Game.vars.selectPlace.users === undefined && $('#deal-modal .sb-content p').length > 0) {
                GameMain.functions.sendSocket('deal', {'dealStatus': 'no'});
                Main.functions.sendWorker('clearDealTimer', {});
                tempFunction();
            } else {
                Game.vars.selectType = '';
                if (Game.vars.selectPlace.users !== undefined) {
                    for (key in Game.vars.selectPlace.users) {
                        delete (Game.vars.selectPlace.users[key]);
                    }
                    delete (Game.vars.selectPlace.users);
                }
                tempFunction();
            }


        });
        $('body').on('click', 'div[data-step]', function (e) {
            if ($('.game-general-panel > div > div[data-step].mask-place').length == 0) {
                return false;
            }
            var step = $(this).attr('data-step');
            let userIdActive = $('div[data-user-id].active').attr('data-user-id');
            let placesUser;
            for (key in Game.vars.players) {
                if (Game.vars.players[key]['id'] == userIdActive) {
                    placesUser = Game.vars.players[key]['places'];
                    break;
                }
            }
            if (step != 0 && $('.game-general-panel > div > div[data-step="' + step + '"]:not(.mask-place)').is('div')) {
                if (Game.vars.selectType == 'buyout') {
                    let html = '' +
                        '<div class="place-game-pledge">\n' +
                        '    <img src="/media/img/game/pledge.png">\n' +
                        '</div>';
                    let balanceElement = $('div[data-user-id="' + userIdActive + '"] .game-user-balance span').eq(0);
                    let balanceActiveElement = $('div[data-user-id="' + userIdActive + '"] .game-user-balance span').eq(1);

                    if (!$('.game-general-panel > div > div[data-step="' + step + '"] .game-places .place-game-pledge').is('div')) {
                        $('.game-general-panel > div > div[data-step="' + step + '"] .game-places').append(html);
                        $(balanceElement).html(((parseInt($(balanceElement).html().replace(/\s*/g, '')) + Game.vars.placePrice[step]['price_place']) + '').replace(/(\d{1,3})(?=((\d{3})*([^\d]|$)))/g, " $1 "));
                        $(balanceActiveElement).html(((parseInt($(balanceActiveElement).html().replace(/\s*/g, '')) - Game.vars.placePrice[step]['price_place']) + '').replace(/(\d{1,3})(?=((\d{3})*([^\d]|$)))/g, " $1 "));
                        Game.vars.selectPlace.splice(Game.vars.selectPlace.indexOf(step), 1);
                    } else {
                        if (parseInt($(balanceElement).html().replace(/\s*/g, '')) - Game.vars.placePrice[step]['price_place'] >= 0) {
                            $('.game-general-panel > div > div[data-step="' + step + '"] .game-places .place-game-pledge').remove();
                            $(balanceElement).html(((parseInt($(balanceElement).html().replace(/\s*/g, '')) - Game.vars.placePrice[step]['price_place']) + '').replace(/(\d{1,3})(?=((\d{3})*([^\d]|$)))/g, " $1 "));
                            $(balanceActiveElement).html(((parseInt($(balanceActiveElement).html().replace(/\s*/g, '')) + Game.vars.placePrice[step]['price_place']) + '').replace(/(\d{1,3})(?=((\d{3})*([^\d]|$)))/g, " $1 "));
                            Game.vars.selectPlace.push(step);
                        } else {
                            $('#no-money').show();
                        }
                    }
                }
                if (Game.vars.selectType == 'pledge') {
                    let html = '' +
                        '<div class="place-game-pledge">\n' +
                        '    <img src="/media/img/game/pledge.png">\n' +
                        '</div>';
                    let balanceElement = $('div[data-user-id="' + userIdActive + '"] .game-user-balance span').eq(0);
                    let balanceActiveElement = $('div[data-user-id="' + userIdActive + '"] .game-user-balance span').eq(1);

                    if (!$('.game-general-panel > div > div[data-step="' + step + '"] .game-places .place-game-pledge').is('div')) {
                        $('.game-general-panel > div > div[data-step="' + step + '"] .game-places').append(html);
                        $(balanceElement).html(((parseInt($(balanceElement).html().replace(/\s*/g, '')) + Game.vars.placePrice[step]['price_place_pledge']) + '').replace(/(\d{1,3})(?=((\d{3})*([^\d]|$)))/g, " $1 "));
                        $(balanceActiveElement).html(((parseInt($(balanceActiveElement).html().replace(/\s*/g, '')) - Game.vars.placePrice[step]['price_place']) + '').replace(/(\d{1,3})(?=((\d{3})*([^\d]|$)))/g, " $1 "));
                        Game.vars.selectPlace.push(step);
                    } else {
                        $('.game-general-panel > div > div[data-step="' + step + '"] .game-places .place-game-pledge').remove();
                        $(balanceElement).html(((parseInt($(balanceElement).html().replace(/\s*/g, '')) - Game.vars.placePrice[step]['price_place_pledge']) + '').replace(/(\d{1,3})(?=((\d{3})*([^\d]|$)))/g, " $1 "));
                        $(balanceActiveElement).html(((parseInt($(balanceActiveElement).html().replace(/\s*/g, '')) + Game.vars.placePrice[step]['price_place']) + '').replace(/(\d{1,3})(?=((\d{3})*([^\d]|$)))/g, " $1 "));
                        Game.vars.selectPlace.splice(Game.vars.selectPlace.indexOf(step), 1);
                    }
                }
                if (Game.vars.selectType == 'build') {
                    let countBuild = $('.game-general-panel > div > div[data-step="' + step + '"] .filials-place > img').length;
                    let oldStep;
                    let stepColor = $('div[data-step=' + step + '] .game-places-price')[0].classList[1].slice(11);
                    for (keySelectPlace in Game.vars.selectPlace) {
                        if (stepColor == $('div[data-step=' + Game.vars.selectPlace[keySelectPlace] + '] .game-places-price')[0].classList[1].slice(11)) {
                            oldStep = Game.vars.selectPlace[keySelectPlace];
                            Game.vars.selectPlace.splice(Game.vars.selectPlace.indexOf(Game.vars.selectPlace[keySelectPlace]), 1);
                            break;
                        }
                    }
                    if (oldStep === undefined) {
                        if (countBuild < 4) {
                            $('.game-general-panel > div > div[data-step="' + step + '"] .filials-place').append('<img src="/media/img/game/filial.png" />');
                        } else if (countBuild == 4) {
                            $('.game-general-panel > div > div[data-step="' + step + '"] .filials-place').html('<img src="/media/img/game/holding.png" />');
                        }
                        Game.vars.selectPlace.push(step);
                    } else {
                        let countBuildOldStep;
                        for (key in placesUser) {
                            if (placesUser[key]['place_step'] == oldStep) {
                                countBuildOldStep = placesUser[key]['build'];
                                break;
                            }
                        }
                        if (oldStep == step) {
                            $('.game-general-panel > div > div[data-step="' + oldStep + '"] .filials-place').html('');
                            for (let i = 0; i < countBuildOldStep; i++) {
                                $('.game-general-panel > div > div[data-step="' + oldStep + '"] .filials-place').append('<img src="/media/img/game/filial.png" />');
                            }
                        } else {
                            $('.game-general-panel > div > div[data-step="' + oldStep + '"] .filials-place').html('');
                            for (let i = 0; i < countBuildOldStep; i++) {
                                $('.game-general-panel > div > div[data-step="' + oldStep + '"] .filials-place').append('<img src="/media/img/game/filial.png" />');
                            }

                            if (countBuild < 4) {
                                $('.game-general-panel > div > div[data-step="' + step + '"] .filials-place').append('<img src="/media/img/game/filial.png" />');
                            } else if (countBuild == 4) {
                                $('.game-general-panel > div > div[data-step="' + step + '"] .filials-place').html('<img src="/media/img/game/holding.png" />');
                            }
                            Game.vars.selectPlace.push(step);
                        }
                    }
                }
                if (Game.vars.selectType == 'sell') {
                    Game.vars.selectPlace.push(step);

                    $('.game-general-panel > div > div[data-step="' + step + '"] .filials-place > img').eq(0).remove();

                    if (Game.vars.selectPlace.length > 0) {
                        var monopolyPlayer = Game.functions.getMonopolyPlayer();
                        var placesActive = [];
                        for (color in monopolyPlayer) {
                            let tempBuilds = {};
                            for (key in monopolyPlayer[color]) {
                                tempBuilds[key] = {};
                                tempBuilds[key]['build'] = monopolyPlayer[color][key]['build'];
                                tempBuilds[key]['place_step'] = monopolyPlayer[color][key]['place_step'];
                            }
                            let maxBuild = 1;
                            for (key in monopolyPlayer[color]) {
                                for (key2 in Game.vars.selectPlace) {
                                    if (monopolyPlayer[color][key]['place_step'] == Game.vars.selectPlace[key2]) {
                                        tempBuilds[key]['build']--;
                                    }
                                }
                            }
                            for (key in tempBuilds) {
                                if (tempBuilds[key]['build'] > maxBuild) {
                                    maxBuild = tempBuilds[key]['build'];
                                }
                            }
                            for (key in tempBuilds) {
                                if (tempBuilds[key]['build'] == maxBuild) {
                                    placesActive.push(tempBuilds[key]['place_step']);
                                }
                            }
                        }
                        let balanceElement = $('div[data-user-id="' + userIdActive + '"] .game-user-balance span').eq(0);
                        let balanceActiveElement = $('div[data-user-id="' + userIdActive + '"] .game-user-balance span').eq(1);
                        $(balanceElement).html(((parseInt($(balanceElement).html().replace(/\s*/g, '')) + Game.vars.placePrice[step]['price_filial']) + '').replace(/(\d{1,3})(?=((\d{3})*([^\d]|$)))/g, " $1 "));
                        $(balanceActiveElement).html(((parseInt($(balanceActiveElement).html().replace(/\s*/g, '')) - Game.vars.placePrice[step]['price_filial']) + '').replace(/(\d{1,3})(?=((\d{3})*([^\d]|$)))/g, " $1 "));
                        Game.functions.maskToPlace(placesActive, false);
                    }

                }
                if (Game.vars.selectType == 'deal') {
                    if (Game.vars.selectPlace.users === undefined)
                        Game.vars.selectPlace.users = {};
                    let valid = true;
                    for (key in Game.vars.selectPlace.users) {
                        for (key2 in Game.vars.selectPlace.users[key]) {
                            if (Game.vars.selectPlace.users[key][key2] == step) {
                                valid = false;
                                Game.vars.selectPlace.users[key].splice(key2, 1);
                            }
                        }
                        if (Game.vars.selectPlace.users[key].length == 0) {
                            delete (Game.vars.selectPlace.users[key]);
                        }
                    }
                    if (valid) {
                        for (key in Game.vars.players) {
                            for (key2 in Game.vars.players[key]['places']) {
                                if (Game.vars.players[key]['places'][key2]['place_step'] == step) {
                                    if (Game.vars.selectPlace.users[Game.vars.players[key]['id']] === undefined)
                                        Game.vars.selectPlace.users[Game.vars.players[key]['id']] = [];
                                    Game.vars.selectPlace.users[Game.vars.players[key]['id']].push(step);
                                }
                            }
                        }
                    }
                    $('#deal-modal .content-popup > div .deal-place .sb-content').html('');
                    $('#deal-modal .content-popup > div .deal-active-price span').html(0);
                    $('#deal-modal .footer-popup .amount-price').html('');
                    if (Object.keys(Game.vars.selectPlace.users).length > 0) {
                        $('.amount-procent, .amount-price, .price-width, .deal-active-price').css({visibility: 'visible'});
                        for (key in Game.vars.selectPlace.users) {
                            let sum = 0;
                            for (key2 in Game.vars.selectPlace.users[key]) {
                                let place = Game.vars.selectPlace.users[key][key2];
                                $('#deal-modal .content-popup > div[data-user-id="' + key + '"] .deal-place .sb-content').append('' +
                                    '<p>' +
                                    '<span>' + $('div[data-step="' + place + '"] p').html() + '</span>' +
                                    '<span>' + Game.vars.placePrice[place]['price_place'] + '</span>' +
                                    '</p>'
                                );
                                sum += Game.vars.placePrice[place]['price_place'];
                            }
                            $('#deal-modal .content-popup > div[data-user-id="' + key + '"] .deal-active-price span').html(sum);
                        }
                    } else {
                        $('.amount-procent, .amount-price, .price-width, .deal-active-price').css({visibility: 'hidden'});
                    }
                    $('.deal-place').trigger("resize.scrollBox");

                    let sumLeft = parseInt($('#deal-modal .content-popup > div .deal-active-price span').eq(0).html());
                    let sumRight = parseInt($('#deal-modal .content-popup > div .deal-active-price span').eq(1).html());
                    let procent;
                    if (sumLeft >= sumRight) {
                        procent = 30;
                    } else {
                        procent = -30;
                    }

                    let minProcent;
                    let sum;
                    if (sumLeft > sumRight) {
                        minProcent = parseInt(((sumLeft - sumRight) * -1) / (sumLeft / 100));
                        if (minProcent > procent) {
                            procent = minProcent;
                        }
                        sum = parseInt((sumLeft - sumRight) + (sumLeft * (procent / 100)));
                    } else {
                        minProcent = parseInt(((sumRight - sumLeft) * -1) / (sumRight / 100));
                        if (minProcent > procent) {
                            procent = minProcent;
                        }
                        sum = parseInt((sumRight - sumLeft) + (sumRight * (procent / 100)));
                    }

                    if (sum >= 0) {
                        if (sumLeft >= sumRight) {
                            $('#deal-modal .footer-popup .amount-price').css({
                                right: '13px',
                                left: 'auto'
                            });
                            $('#deal-modal .footer-popup .amount-price').html(__('Вам доплатят:') +' <span>' + sum + '</span>');
                        } else {
                            $('#deal-modal .footer-popup .amount-price').css({
                                left: '13px',
                                right: 'auto'
                            });
                            $('#deal-modal .footer-popup .amount-price').html(__('Вы доплатите:') + ' <span>' + sum + '</span>');
                        }
                        position = parseInt((((procent * 3.3) + 100) * 518) / 200) - 7;
                        $('.price-width div:not(.movePlace)').css({left: position});
                        $('.footer-popup .amount-procent').html(Math.abs(procent) + ' %');
                    }
                }
            }
        });
        $('body').on('mousemove', 'div[data-step] .white-place.game-places', function (e) {
            if ($('.game-general-panel > div > div[data-step].mask-place').length > 0) {
                return false;
            }
            var step = $(this).parent().attr('data-step');
            let commonPlace = $('.game-general-panel').offset();
            let x = e.pageX - commonPlace['left'];
            let y = e.pageY - commonPlace['top'];
            if (step === undefined) {
                $('.cart-place').hide();
            }
            $('.cart-place').show();
            $('.cart-place').css({
                left: (x + 15) + 'px',
                top: (y + 15) + 'px',
            });
            $('.cart-place .title').html($('div[data-step="' + step + '"] p').html());
            $('.cart-place > div').show();
            $('.cart-place > div > div').show();
            if (Game.vars.placePrice[step] === undefined) {
                return false;
            }
            if (Game.vars.placePrice[step].lease == 0) {
                $('.cart-place').css({height: '166px'});
                $('.cart-place > div').eq(1).hide();
                $('.cart-place > div').eq(2).hide();
                $('.cart-place div > div').eq(8).hide();
            } else {
                $('.cart-place').css({height: '255px'});
                $('.cart-place span:last-child').eq(8).html(Game.vars.placePrice[step].lease5);
            }
            let tempPrice = {};
            for (key in Game.vars.placePrice[step]) {
                tempPrice[key] = Game.vars.placePrice[step][key];
                tempPrice[key] += '';
                tempPrice[key] = tempPrice[key].replace(/(\d{1,3})(?=((\d{3})*([^\d]|$)))/g, " $1 ");
            }
            $('.cart-place span:last-child').eq(0).html(tempPrice.price_place + ' $');
            $('.cart-place span:last-child').eq(1).html(tempPrice.lease + ' $');
            $('.cart-place span:last-child').eq(2).html(tempPrice.lease_monopoly + ' $');
            $('.cart-place span:last-child').eq(3).html(tempPrice.price_filial + ' $');
            $('.cart-place span:last-child').eq(4).html(tempPrice.lease1 + ' $');
            $('.cart-place span:last-child').eq(5).html(tempPrice.lease2 + ' $');
            $('.cart-place span:last-child').eq(6).html(tempPrice.lease3 + ' $');
            $('.cart-place span:last-child').eq(7).html(tempPrice.lease4 + ' $');
            $('.cart-place span:last-child').eq(8).html(tempPrice.lease5 + ' $');
            $('.cart-place span:last-child').eq(9).html(tempPrice.price_place_pledge + ' $');
            $('.cart-place span:last-child').eq(10).html(tempPrice.price_place + ' $');

        });
        $('body').on('mousemove', '.price-width .movePlace', function (e) {
            if (Game.vars.isMoveBalanceDeal) {
                var position = e.offsetX - 6;

                let sumLeft = parseInt($('#deal-modal .content-popup > div .deal-active-price span').eq(0).html());
                let sumRight = parseInt($('#deal-modal .content-popup > div .deal-active-price span').eq(1).html());

                let procent = parseInt(((parseInt(((position + 7) * 100) / 518) * 2) - 100) / 3.3);

                let sum;
                if (sumLeft > sumRight) {
                    sum = parseInt((sumLeft - sumRight) + (sumLeft * (procent / 100)));
                } else {
                    sum = parseInt((sumRight - sumLeft) + (sumRight * (procent / 100)));
                }
                if (sum >= 0) {
                    if (sumLeft >= sumRight) {
                        $('#deal-modal .footer-popup .amount-price').css({
                            right: '13px',
                            left: 'auto'
                        });
                        $('#deal-modal .footer-popup .amount-price').html(__('Вам доплатят:') +' <span>' + (sum) + '</span>');
                    } else {
                        $('#deal-modal .footer-popup .amount-price').css({
                            left: '13px',
                            right: 'auto'
                        });
                        $('#deal-modal .footer-popup .amount-price').html(__('Вы доплатите:') + ' <span>' + (sum) + '</span>');
                    }
                    $('.price-width div:not(.movePlace)').css({left: position});
                    $('.footer-popup .amount-procent').html(Math.abs(procent) + ' %');
                }
            }
        });
        $('body').on('mouseup', document, function (e) {
            Game.vars.isMoveBalanceDeal = false;
        });
        $('body').on('click', '.deal-button', function () {
            $('#deal-modal').show();
            Game.vars.userIdDeal = $(this).parent().attr('data-user-id');
            var leftUser = Main.vars.userInterior['id'];
            var rightUser = Game.vars.userIdDeal;
            let users = [];
            for (key in Game.vars.players) {
                if (Game.vars.players[key]['id'] == leftUser) {
                    users[0] = Game.vars.players[key];
                } else if (Game.vars.players[key]['id'] == rightUser) {
                    users[1] = Game.vars.players[key];
                }
            }
            let placesActive = [];
            for (let key in users) {
                let rgb = hexToRgb(users[key]['color']);
                $('#deal-modal .content-popup > div').eq(key).css({background: 'linear-gradient(to bottom, rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.8) 75%, rgba(255,255,255,0) 100%)'});
                let html = '' +
                    '<div class="deal-user-profile">' +
                    '<div class="deal-avatar" style="background-image: url(' + (users[key]['avatar'].indexOf('http') > -1 ? users[key]['avatar'] : '/media/img/avatars/' + users[key]['avatar']) + ');"></div>' +
                    '<p class="deal-user-name">' + users[key]['username'] + '</p>' +
                    '<p class="deal-user-rate">' + users[key]['rang_name'] + '</p>' +
                    '</div>' +
                    '<div class="deal-place">' +

                    '</div>' +
                    '<div style="visibility: hidden" class="deal-active-price">' +
                    __('сумма активов:') + ' <span>0</span>' +
                    '</div>';
                $('#deal-modal .content-popup > div').eq(key).attr('data-user-id', users[key]['id']);
                $('#deal-modal .content-popup > div').eq(key).html(html);

                let monopolyPlaces = Game.functions.getMonopolyPlayer(users[key]['id']);

                for (let key2 in users[key]['places']) {
                    let validPlace = true;
                    if (users[key]['places'][key2]['pledge'] != 0) {
                        validPlace = false;
                    }
                    if (validPlace) {
                        for (let Monokey in monopolyPlaces) {
                            let isPlMono = false;
                            let isMonoBild = false;
                            for (let Monokey2 in monopolyPlaces[Monokey]) {
                                if (monopolyPlaces[Monokey][Monokey2]['place_step'] == users[key]['places'][key2]['place_step']) {
                                    isPlMono = true;
                                }
                                if (monopolyPlaces[Monokey][Monokey2]['build'] > 0) {
                                    isMonoBild = true;
                                }
                            }
                            if (isPlMono && isMonoBild) {
                                validPlace = false;
                                break;
                            }
                        }
                    }
                    if (validPlace) {
                        placesActive.push(users[key]['places'][key2]['place_step']);
                    }
                }
            }

            $('.deal-place').scrollBox();
            Game.vars.selectType = 'deal';
            Game.functions.maskToPlace(placesActive);

        });
        $('body').on('mousedown', '.price-width .movePlace', function (e) {
            Game.vars.isMoveBalanceDeal = true;
            var position = e.offsetX - 6;

            let sumLeft = parseInt($('#deal-modal .content-popup > div .deal-active-price span').eq(0).html());
            let sumRight = parseInt($('#deal-modal .content-popup > div .deal-active-price span').eq(1).html());

            let procent = parseInt(((parseInt(((position + 7) * 100) / 518) * 2) - 100) / 3.3);
            let minProcent;
            let sum;
            if (sumLeft > sumRight) {
                minProcent = parseInt(((sumLeft - sumRight) * -1) / (sumLeft / 100));
                if (minProcent > procent) {
                    procent = minProcent;
                }
                sum = parseInt((sumLeft - sumRight) + (sumLeft * (procent / 100)));
            } else {
                minProcent = parseInt(((sumRight - sumLeft) * -1) / (sumRight / 100));
                if (minProcent > procent) {
                    procent = minProcent;
                }
                sum = parseInt((sumRight - sumLeft) + (sumRight * (procent / 100)));
            }

            if (sum >= 0) {
                if (sumLeft >= sumRight) {
                    $('#deal-modal .footer-popup .amount-price').css({
                        right: '13px',
                        left: 'auto'
                    });
                    $('#deal-modal .footer-popup .amount-price').html(__('Вам доплатят:') +' <span>' + sum + '</span>');
                } else {
                    $('#deal-modal .footer-popup .amount-price').css({
                        left: '13px',
                        right: 'auto'
                    });
                    $('#deal-modal .footer-popup .amount-price').html(__('Вы доплатите:') + ' <span>' + sum + '</span>');
                }
                if (procent == minProcent) {
                    position = parseInt((((procent * 3.3) + 100) * 518) / 200) - 7;
                }
                $('.price-width div:not(.movePlace)').css({left: position});
                $('.footer-popup .amount-procent').html(Math.abs(procent) + ' %');
            }
        });
        if (Main.vars.worckerHendlers.gameChat === undefined) {
            Main.vars.worckerHendlers.gameChat = function (res) {
                var selector = '#game-chat-content > div[data-chat-id="-1"] .sb-content';
                if (res.user_to != null) {
                    selector = '#game-chat-content > div[data-chat-id="' + res.user_to + '"] .sb-content, #game-chat-content > div[data-chat-id="' + res.user_id + '"] .sb-content';

                    if (!$('#game-chat-tabs > div[data-chat-id="' + res.user_id + '"]').is('.active')) {
                        let amountMsg = parseInt($('#game-chat-tabs > div[data-chat-id="' + res.user_id + '"] div b').html());
                        if (isNaN(amountMsg)) {
                            $('#game-chat-tabs > div[data-chat-id="' + res.user_id + '"] div b').html(1);
                        } else {
                            $('#game-chat-tabs > div[data-chat-id="' + res.user_id + '"] div b').html(amountMsg + +1);
                        }
                    }
                }
                $(selector).append('' +
                    '<p class="chat-message">' +
                    '<span class="chat-date">[' + res.time + ']</span>' +
                    '<span class="chat-name" style="color: #' + res.color + ';">' + res.username + ': </span>' +
                    '<span class="chat-text">' + res.text + '</span>' +
                    '</p>' +
                    '');
                $("#game-chat-content > div").trigger("resize.scrollBox");
                $('#game-chat-content > div .sb-content').scrollTop(100000);
            };
        }
        if (Main.vars.worckerHendlers.quitCubes === undefined) {
            Main.vars.worckerHendlers.quitCubes = function (res) {
                let ctx = Game.vars.canvas.getContext('2d');
                let cur = res.cur;
                if (cur == 1) {
                    Game.functions.playAudio('cubs');
                    Main.functions.sendWorker('clearEndTime');
                    Main.functions.sendWorker('preloader', 75);
                }
                ctx.clearRect(147, 167, 275, 271);
                let dx = (Game.vars.canvas.width / 2) - 110;
                let dy = (Game.vars.canvas.height / 2) - 122;

                ctx.drawImage(Game.vars.imageCub1, 0, (291 * 32 * (res.cub1 - 1)) + ((cur - 1) * 291), 291, 291, dx, dy, 250, 250);
                if (cur < 27) {
                    ctx.clearRect(418, 167, 223, 251);
                    ctx.drawImage(Game.vars.imageCub2, 0, (291 * 26 * (res.cub2 - 1)) + ((cur - 1) * 291), 291, 291, dx, dy, 250, 250);
                }
                if (cur == 32) {
                    ctx.clearRect(147, 167, 275, 271);
                    ctx.clearRect(418, 167, 223, 251);

                    $.each(res.history, function (index, row) {
                        if (row['type_id'] == 1) {
                            Game.functions.writeHistory('' +
                                '<p class="chat-message">\n' +
                                '     <span class="chat-text">' + row['text'] + '</span>\n' +
                                '</p>');
                            return false;
                        }
                    });
                }
            };
        }
        if (Main.vars.worckerHendlers.redraw === undefined) {
            Main.vars.worckerHendlers.redraw = function (data) {
                for (key in Game.vars.players) {
                    for (key2 in data.players) {
                        if (Game.vars.players[key]['id'] == data.players[key2]['id']) {
                            Game.vars.players[key]['step'] = data.players[key2]['step'];
                        }
                    }
                }
                $('.players > div[data-user-id="' + data.user['player_id'] + '"]').css({
                    left: data.newPos.x + 'px',
                    top: data.newPos.y + 'px'
                });
            };
        }
        if (Main.vars.worckerHendlers.preloader === undefined) {
            Main.vars.worckerHendlers.preloader = function (data) {
                if ($('#wait-user-lobby').is('div')) {
                    return false;
                }
                let second = data.second;
                $('.game-user-profile.active > p span').html(second);
                $('.game-user-profile.active .preloader > div').css({'width': (100 - ((second * 100) / 75)) + '%'});
            }
        }
        if (Main.vars.worckerHendlers.userDecision === undefined) {
            Main.vars.worckerHendlers.userDecision = function (data) {
                if (Main.vars.userInterior.id == data.user_id) {
                    if (data.buttons.length > 0) {
                        Game.functions.playAudio('startAction');
                    }
                    Game.functions.showUserButton(data.buttons);
                    Game.vars.promisAction(data.buttons);
                }
                if (data.history !== undefined) {
                    $.each(data.history, function (index, row) {
                        if (row['type_id'] != 1) {
                            Game.functions.writeHistory('' +
                                '<p class="chat-message">\n' +
                                '     <span class="chat-text">' + row['text'] + '</span>\n' +
                                '</p>');
                        }
                    });

                }
            };
        }
        if (Main.vars.worckerHendlers.linkToGame === undefined) {
            Main.vars.worckerHendlers.linkToGame = function (data) {
                if ($('#wait-user-lobby').is('div')) {
                    if (data.amountUser <= 0) {
                        location.reload();
                    } else {
                        $('#wait-user-lobby .content-popup > div:not(.header-popup) span').html(data.amountUser);
                        var html = '';
                        $.each(data.users, function (index, row) {
                            html += '<div data-user-id="' + row['id'] + '" style="background-color: #' + row['color'] + '" class="game-user-profile ' + (index == 0 ? 'active' : '') + '">\n' +
                                '            <p class="uppercase-text">'+__('осталось')+' <span class="text-white">75</span> '+__('секунд')+'</p>\n' +
                                '            <div class="preloader">\n' +
                                '                <div style="width: 0px"><img src="/media/img/game/preload-player.gif" /></div>\n' +
                                '            </div>\n' +
                                '            <div style="border: 3px solid #' + row['color'] + ';">\n' +
                                '                <div class="background-opacity" style="background-color: #' + row['color'] + '"> </div>\n' +
                                '                <p>' + row['username'] + '</p>\n' +
                                '                <p class="rang-user-game">' + row['rang_name'] + '</p>\n' +
                                '                <div class="game-user-balance">\n' +
                                '                    <p><img src="/media/img/game/2115.png"> <span>' + row['balance'] + '</span></p>\n' +
                                '                    <p><img src="/media/img/game/2117.png"> <span>' + row['active_balance'] + '</span> $</p>\n' +
                                '                </div>\n' +
                                '                <div class="image-avatar" style="background-image: url(' + (row['avatar'].indexOf('http') > -1 ? row['avatar'] : '/media/img/avatars/' + row['avatar']) + ')" ></div>\n' +
                                '            </div>\n' +
                                '</div>';
                        });
                        $('.game-bottom-panel').html(html);
                    }
                }
                $('.header-game-info p span').eq(3).html(data.watcher);
            };
        }
        if (Main.vars.worckerHendlers.auction === undefined) {
            Main.vars.worckerHendlers.auction = function (data) {
                $('#auction-modal .auction-text span').eq(0).html(data.userName);
                $('#auction-modal .auction-text span').eq(1).html(data.placeName);
                $('#auction-modal .auction-text span').eq(2).html(data.price);
                $('#auction-modal').show();
                $('.game-popup-mask').show();
            };
        }
        if (Main.vars.worckerHendlers.auctionTimer === undefined) {
            Main.vars.worckerHendlers.auctionTimer = function (data) {
                if (data.second == 0) {
                    $('#auction-modal').hide();
                    $('.game-popup-mask').hide();
                } else {
                    $('.timer-auction span').html(data.second + ' ' + validWords(data.second, ['секунда', 'секунды', 'секунд']))
                }
            }
        }
        if (Main.vars.worckerHendlers.updateGame === undefined) {
            Main.vars.worckerHendlers.updateGame = function (data) {
                if (data.winners !== undefined) {

                    if (Main.vars.userInterior.id == data.winners[0].id) {
                        Main.functions.sendWorker('setLobby', {lobby: -1});
                    } else {
                        Main.functions.sendWorker('setLobby', {lobby: 0});
                    }

                    if (data.stageAction == 2) {
                        GameMain.functions.sendSocket('reloadGame', {lobby: -1});
                    }

                    if (!$('.winner-block:visible').is('div')) {
                        $('#surrender-button').addClass('watcher');
                        var winHtml = '<p>';
                        $.each(data.winners, function (index, row) {
                            winHtml += row.username + '<br>';
                        });
                        winHtml = winHtml.slice(0, -4);
                        winHtml += '</p>';
                        $('.winner-block').prepend(winHtml);
                        $('.winner-block').append('<p>' + data.scoresWin + ' $ </p');

                        $('.winner-block').show();
                        Game.functions.playAudio('win');

                    }
                    return false;
                }

                Game.vars.lastAction = data.lastAction;

                Game.vars.players = data.users;
                for (key in data.places) {
                    let player;
                    for (key2 in data.playerPlace) {
                        if (data.playerPlace[key2]['place_step'] == data.places[key].step) {
                            player = data.playerPlace[key2];
                            break;
                        }
                    }
                    let rgb = hexToRgb(data.users[player['player_id']]['color']);
                    let html = '' +
                        '<div class="game-places-price game-price-' + data.places[key]['color'] + '">\n' +
                        '     <span>' + ((data.places[key]['now_lease'] + '').substring(0, (data.places[key]['now_lease'] + '').length - 3)) + ' '+__('т.')+'</span>\n' +
                        '</div>\n' +
                        '<div class="white-place game-places">\n' +
                        '     <div class="private-background-game-place" style="background: linear-gradient(to bottom, rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.8) 75%, rgba(255,255,255,0) 100%);"></div>\n' +
                        '         <img style="' + data.places[key]['img-style'] + '" src="/media/img/game/' + data.places[key]['img'] + '">\n' +
                        '         ' + data.places[key].text +
                        '     <div class="filials-place">\n';
                    if (player.build > 0) {
                        if (player.build == 5) {
                            html += '<img src="/media/img/game/holding.png" class="holding">\n';
                        } else {
                            for (let i = 0; i < player.build; i++) {
                                html += '<img src="/media/img/game/filial.png">\n';
                            }
                        }
                    }
                    html += '</div>\n';
                    if (player.pledge == 1) {
                        html += '' +
                            '<div class="place-game-pledge">\n' +
                            '   <img src="/media/img/game/pledge.png" />\n' +
                            '</div>';
                    }
                    html += '</div>';

                    $('div[data-step="' + data.places[key].step + '"]').html(html);
                }

                for (key in data.users) {
                    let html = '<p><img src="/media/img/game/2115.png"> <span>' + data.users[key]['balance'].replace(/(\d{1,3})(?=((\d{3})*([^\d]|$)))/g, " $1 ") + '</span></p>\n' +
                        '<p><img src="/media/img/game/2117.png"> <span>' + data.users[key]['active_balance'].replace(/(\d{1,3})(?=((\d{3})*([^\d]|$)))/g, " $1 ") + '</span> $</p>';

                    $('div[data-user-id="' + data.users[key]['id'] + '"].game-user-profile .game-user-balance').html(html);
                }

                for (key in Game.vars.players) {
                    let numberPosition = 0;
                    for (key2 in Game.vars.players) {
                        if (Game.vars.players[key]['id'] == Game.vars.players[key2]['id'])
                            continue;
                        if (Game.vars.players[key]['step'] == Game.vars.players[key2]['step'] && Game.vars.players[key2]['position'] !== undefined) {
                            if (numberPosition < Object.keys(Game.vars.stepPosition[Game.vars.players[key]['step']]).length - 1) {
                                numberPosition++;
                            }
                        }
                    }
                    Game.vars.players[key]['position'] = {};
                    if (Game.vars.stepPosition[Game.vars.players[key]['step']] === undefined) {
                        continue;
                    }
                    for (key2 in Game.vars.stepPosition[Game.vars.players[key]['step']][numberPosition]) {
                        Game.vars.players[key]['position'][key2] = Game.vars.stepPosition[Game.vars.players[key]['step']][numberPosition][key2];
                    }
                    $('.players > div[data-user-id="' + Game.vars.players[key]['player_id'] + '"]').css({
                        left: Game.vars.players[key]['position']['x'] + 'px',
                        top: Game.vars.players[key]['position']['y'] + 'px'
                    });
                }

                Main.functions.sendWorker('setPlayers', {
                    players: Game.vars.players,
                });

                if (data.historyType == 'all') {
                    $('#game-chat-content > div[data-chat-id="-1"] .sb-content').html('');
                } else {
                    Game.functions.eventLastAction(data.lastAction);
                }
                $.each(data.history, function (index, row) {
                    if ($('#game-chat-content > div[data-chat-id="-1"] .sb-content > p').length >= 100) {
                        $('#game-chat-content > div[data-chat-id="-1"] .sb-content > p').eq(0).remove();
                    }
                    if (row.avatar === undefined) {
                        $('#game-chat-content > div[data-chat-id="-1"] .sb-content').append('' +
                            '<p class="chat-message">\n' +
                            '     <span class="chat-text">' + row['text'] + '</span>\n' +
                            '</p>');
                    } else {
                        $('#game-chat-content > div[data-chat-id="-1"] .sb-content').append('' +
                            '<p class="chat-message">' +
                            '<span class="chat-date">[' + row.time + ']</span>' +
                            '<span class="chat-name" style="color: #' + row.color + ';">' + row.username + ': </span>' +
                            '<span class="chat-text">' + row.text + '</span>' +
                            '</p>' +
                            '');
                    }
                });
                $("#game-chat-content > div").trigger("resize.scrollBox");
                $('#game-chat-content > div .sb-content').scrollTop(100000);

                $('.game-user-profile.active > p span').html(data.turnTime);
                Game.functions.startUserTurn(data.turnUser);
                Game.vars.buildInThisStep = data.availBuild;
                $('.header-game-info p span').eq(1).html(data.countTurn);

                $('.game-bottom-panel div[data-user-id] .deal-button').css({visibility: 'hidden'});
                if ($('.game-bottom-panel div[data-user-id="' + Main.vars.userInterior['id'] + '"].active').is('div')) {
                    for (key in Game.vars.players) {
                        if (Game.vars.players[key].places.length > 0) {
                            $('.game-bottom-panel div[data-user-id=' + Game.vars.players[key]['id'] + ']:not(.active) .deal-button').css({visibility: 'visible'});
                        }
                    }
                }
            }
        }
        if (Main.vars.worckerHendlers.deal === undefined) {
            Main.vars.worckerHendlers.deal = function (data) {
                if (data.error !== undefined) {
                    $('.game-popup-mask').eq(0).show();
                    $('#no-money').show();
                    if (data.error == 'no money') {
                        $('#no-money .no-money-text').html('' +
                            '<p>\n' +
                            __('У Вас не хватает денег для совершения действия.)' +
                            '</p>\n' +
                            '<p>\n' +
                            __('Для получения средств Вы можете заложить фирму или продать филиал.') +
                            '</p>'));
                    } else if (data.error == 'no money party') {
                        $('#no-money .no-money-text').html('' +
                            '<p>\n' +
                            __('У данного игрока не хватает денег для совершения действия.') +
                            '</p>\n');
                    }
                    return false;
                }

                if (data.whom != Main.vars.userInterior['id']) {
                    return false;
                }
                Game.functions.playAudio('deal');
                $('#deal-modal').show();
                Game.vars.userIdDeal = $(this).parent().attr('data-user-id');
                var leftUser = Main.vars.userInterior['id'];
                var rightUser = data.userInitId;

                let users = [];
                for (key in Game.vars.players) {
                    if (Game.vars.players[key]['id'] == leftUser) {
                        users[0] = Game.vars.players[key];
                    } else if (Game.vars.players[key]['id'] == rightUser) {
                        users[1] = Game.vars.players[key];
                    }
                }
                for (key in users) {
                    let rgb = hexToRgb(users[key]['color']);
                    $('#deal-modal .content-popup > div').eq(key).css({background: 'linear-gradient(to bottom, rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.8) 75%, rgba(255,255,255,0) 100%)'});
                    let html = '' +
                        '<div class="deal-user-profile">' +
                        '<div class="deal-avatar" style="background-image: url(' + (users[key]['avatar'].indexOf('http') > -1 ? users[key]['avatar'] : '/media/img/avatars/' + users[key]['avatar']) + ');"></div>' +
                        '<p class="deal-user-name">' + users[key]['username'] + '</p>' +
                        '<p class="deal-user-rate">' + users[key]['rang_name'] + '</p>' +
                        '</div>' +
                        '<div class="deal-place">' +

                        '</div>' +
                        '<div style="visibility: hidden" class="deal-active-price">' +
                        __('сумма активов:')+' <span>0</span>' +
                        '</div>';
                    $('#deal-modal .content-popup > div').eq(key).attr('data-user-id', users[key]['id']);
                    $('#deal-modal .content-popup > div').eq(key).html(html);

                }
                $('.deal-place').scrollBox();
                if (Object.keys(data.places).length > 0) {
                    $('.amount-price, .deal-active-price').css({visibility: 'visible'});
                    for (key in data.places) {
                        let sum = 0;
                        for (key2 in data.places[key]) {
                            let place = data.places[key][key2];
                            $('#deal-modal .content-popup > div[data-user-id="' + key + '"] .deal-place .sb-content').append('' +
                                '<p>' +
                                '<span>' + $('div[data-step="' + place + '"] p').html() + '</span>' +
                                '<span>' + Game.vars.placePrice[place]['price_place'] + '</span>' +
                                '</p>'
                            );
                            sum += Game.vars.placePrice[place]['price_place'];
                        }
                        $('#deal-modal .content-popup > div[data-user-id="' + key + '"] .deal-active-price span').html(sum);
                    }
                } else {
                    $('.amount-price, .deal-active-price').css({visibility: 'hidden'});
                }
                let sumLeft = parseInt($('#deal-modal .content-popup > div .deal-active-price span').eq(0).html());
                let sumRight = parseInt($('#deal-modal .content-popup > div .deal-active-price span').eq(1).html());
                if (sumLeft >= sumRight) {
                    $('#deal-modal .footer-popup .amount-price').css({
                        left: '13px',
                        right: 'auto'
                    });
                    $('#deal-modal .footer-popup .amount-price').html(__('Вам доплатят:') + ' </span>' + (data.money) + '</span>');
                } else {
                    $('#deal-modal .footer-popup .amount-price').css({
                        right: '13px',
                        left: 'auto'
                    });
                    $('#deal-modal .footer-popup .amount-price').html(__('Вы доплатите:') + ' </span>' + (data.money) + '</span>');
                }

            };
        }
        if (Main.vars.worckerHendlers.endTime === undefined) {
            Main.vars.worckerHendlers.endTime = function (data) {
                Game.functions.playAudio('timeout');
                $.each(data.history, function (index, row) {
                    Game.functions.writeHistory('' +
                        '<p class="chat-message">\n' +
                        '     <span class="chat-text">' + row['text'] + '</span>\n' +
                        '</p>');
                });
            }
        }
        if (Main.vars.worckerHendlers.dealTimer === undefined) {
            Main.vars.worckerHendlers.dealTimer = function (data) {
                if (data.second == 0) {
                    $('.deal-active-price span').html();
                    $('#deal-modal .content-popup > div .deal-place .sb-content').html('');
                    $('.amount-procent, .amount-price, .price-width, .deal-active-price').css({visibility: 'hidden'});
                    $('#deal-modal').hide();
                } else {
                    $('.deal-timer').html(data.second);
                }
            }
        }
    },
    functions: {
        actionButton: {
            default: function (action) {
                $.post('/game/ajax/actions', {
                    action: action,
                }, function (res) {
                    Game.vars.promisAction(res);
                });
            },
            auction: function () {
                $.post('/game/ajax/actions', {
                    action: 'auction',
                }, function (res) {
                    Game.vars.promisAction(res);
                    GameMain.functions.sendSocket('auction');
                });
            },
            cancel: function () {
                Game.functions.showNowAction(function () {
                    if (Game.vars.selectType == 'buyout') {
                        let html = '' +
                            '<div class="place-game-pledge">\n' +
                            '    <img src="/media/img/game/pledge.png">\n' +
                            '</div>';
                        for (key in Game.vars.selectPlace) {
                            if (!$('.game-general-panel > div > div[data-step="' + Game.vars.selectPlace[key] + '"] .game-places .place-game-pledge').is('div')) {
                                $('.game-general-panel > div > div[data-step="' + Game.vars.selectPlace[key] + '"] .game-places').append(html);
                            }
                        }
                    }
                    if (Game.vars.selectType == 'pledge') {
                        for (key in Game.vars.selectPlace) {
                            $('.game-general-panel > div > div[data-step="' + Game.vars.selectPlace[key] + '"] .game-places .place-game-pledge').remove();
                        }
                        let userIdActive = $('div[data-user-id].active').attr('data-user-id');
                        let playerId = '';
                        for (key in Game.vars.players) {
                            if (Game.vars.players[key]['id'] == userIdActive) {
                                playerId = key;
                                break;
                            }
                        }
                        $($('div[data-user-id="' + userIdActive + '"] .game-user-balance span').eq(0)).html(Game.vars.players[playerId]['balance'].replace(/(\d{1,3})(?=((\d{3})*([^\d]|$)))/g, " $1 "));
                        $($('div[data-user-id="' + userIdActive + '"] .game-user-balance span').eq(1)).html(Game.vars.players[playerId]['active_balance'].replace(/(\d{1,3})(?=((\d{3})*([^\d]|$)))/g, " $1 "));
                    }
                    if (Game.vars.selectType == 'sell' || Game.vars.selectType == 'build') {
                        let placesUser;
                        for (key2 in Game.vars.players) {
                            if (Game.vars.players[key2]['id'] == $('div[data-user-id].active').attr('data-user-id')) {
                                placesUser = Game.vars.players[key2]['places'];
                                break;
                            }
                        }
                        for (key in Game.vars.selectPlace) {
                            let countBuild;
                            for (key2 in placesUser) {
                                if (placesUser[key2]['place_step'] == Game.vars.selectPlace[key]) {
                                    countBuild = placesUser[key2]['build'];
                                    break;
                                }
                            }
                            $('.game-general-panel > div > div[data-step="' + Game.vars.selectPlace[key] + '"] .filials-place').html('');
                            for (let i = 0; i < countBuild; i++) {
                                $('.game-general-panel > div > div[data-step="' + Game.vars.selectPlace[key] + '"] .filials-place').append('<img src="/media/img/game/filial.png" />');
                            }
                        }
                        let userIdActive = $('div[data-user-id].active').attr('data-user-id');
                        let playerId = '';
                        for (key in Game.vars.players) {
                            if (Game.vars.players[key]['id'] == userIdActive) {
                                playerId = key;
                                break;
                            }
                        }
                        $($('div[data-user-id="' + userIdActive + '"] .game-user-balance span').eq(0)).html(Game.vars.players[playerId]['balance'].replace(/(\d{1,3})(?=((\d{3})*([^\d]|$)))/g, " $1 "));
                        $($('div[data-user-id="' + userIdActive + '"] .game-user-balance span').eq(1)).html(Game.vars.players[playerId]['active_balance'].replace(/(\d{1,3})(?=((\d{3})*([^\d]|$)))/g, " $1 "));
                    }
                    Game.functions.clearMaskToPlace();
                });
            },
            buyout: function () {
                Game.vars.selectType = 'buyout';
                Game.functions.showUserButton(['buyout', 'cancel']);
                if (Game.vars.selectPlace.length == 0) {
                    var userIdActive = $('div[data-user-id].active').attr('data-user-id');
                    var places;
                    for (key in Game.vars.players) {
                        if (Game.vars.players[key]['id'] == userIdActive) {
                            places = Game.vars.players[key]['places'];
                            break;
                        }
                    }
                    var placesActive = [];
                    for (key in places) {
                        if (places[key]['pledge'] == '1') {
                            placesActive.push(places[key]['place_step']);
                        }
                    }
                    Game.functions.maskToPlace(placesActive);
                } else {
                    $.post('/game/ajax/actions', {
                        action: 'buyout',
                        places: Game.vars.selectPlace,
                    }, function (res) {
                        Game.functions.clearMaskToPlace();
                        Game.vars.promisAction(res);
                    });
                }
            },
            build: function () {
                Game.vars.selectType = 'build';
                Game.functions.showUserButton(['build', 'cancel']);
                if (Game.vars.selectPlace.length == 0) {
                    let placesActive = [];
                    let monopolyPlayer = Game.functions.getMonopolyPlayer();

                    for (color in monopolyPlayer) {
                        if (Game.vars.buildInThisStep.indexOf(color) < 0) {
                            continue;
                        }
                        let minBuild = 6;
                        for (key in monopolyPlayer[color]) {
                            if (monopolyPlayer[color][key]['build'] < minBuild) {
                                minBuild = monopolyPlayer[color][key]['build'];
                            }
                        }
                        for (key in monopolyPlayer[color]) {
                            if (monopolyPlayer[color][key]['build'] == minBuild) {
                                if (monopolyPlayer[color][key]['pledge'] == 0)
                                    placesActive.push(monopolyPlayer[color][key]['place_step']);
                            }
                        }
                    }

                    Game.functions.maskToPlace(placesActive);
                } else {
                    $.post('/game/ajax/actions', {
                        action: 'build',
                        places: Game.vars.selectPlace,
                    }, function (res) {
                        Game.functions.clearMaskToPlace();
                        Game.vars.promisAction(res);
                    });
                }
            },
            sell: function () {
                Game.vars.selectType = 'sell';
                Game.functions.showUserButton(['sell', 'cancel']);
                if (Game.vars.selectPlace.length == 0) {
                    let placesActive = [];
                    let monopolyPlayer = Game.functions.getMonopolyPlayer();

                    for (color in monopolyPlayer) {
                        let maxBuild = 1;
                        for (key in monopolyPlayer[color]) {
                            if (monopolyPlayer[color][key]['build'] > maxBuild) {
                                maxBuild = monopolyPlayer[color][key]['build'];
                            }
                        }
                        for (key in monopolyPlayer[color]) {
                            if (monopolyPlayer[color][key]['build'] == maxBuild) {
                                placesActive.push(monopolyPlayer[color][key]['place_step']);
                            }
                        }
                    }

                    Game.functions.maskToPlace(placesActive);
                } else {
                    $.post('/game/ajax/actions', {
                        action: 'sell',
                        places: Game.vars.selectPlace,
                    }, function (res) {
                        Game.functions.clearMaskToPlace();
                        Game.vars.promisAction(res);
                    });
                }
            },
            pledge: function () {
                Game.vars.selectType = 'pledge';
                Game.functions.showUserButton(['pledge', 'cancel']);
                if (Game.vars.selectPlace.length == 0) {
                    var userIdActive = $('div[data-user-id].active').attr('data-user-id');
                    var places;

                    for (key in Game.vars.players) {
                        if (Game.vars.players[key]['id'] == userIdActive) {
                            places = Game.vars.players[key]['places'];
                            break;
                        }
                    }

                    var noAdd = [];
                    var monopoly = Game.functions.getMonopolyPlayer(userIdActive);

                    for (monoKey in monopoly) {
                        for (placeKey in monopoly[monoKey]) {
                            if (monopoly[monoKey][placeKey]['build'] == '1') {
                                noAdd.push(monopoly[monoKey][placeKey]);
                            }
                        }
                    }

                    var placesActive = [];

                    for (key in places) {
                        let valid = true;
                        for (noAddKey in noAdd) {
                            if (places[key]['place_step'] == noAdd[noAddKey]['place_step']) {
                                valid = false;
                            }
                        }
                        if (places[key]['pledge'] == 1) {
                            valid = false;
                        }
                        if (valid)
                            placesActive.push(places[key]['place_step']);
                    }

                    Game.functions.maskToPlace(placesActive);
                } else {
                    $.post('/game/ajax/actions', {
                        action: 'pledge',
                        places: Game.vars.selectPlace,
                    }, function (res) {
                        Game.functions.clearMaskToPlace();
                        Game.vars.promisAction(res);
                    });
                }
            },
            quit_cubes: function () {
                Game.functions.showUserButton([]);
                GameMain.functions.sendSocket('quitCubes');
            }
        },
        writeHistory: function (text) {
            if ($('[data-chat-id="-1"] .sb-content p:last-child')[0].innerHTML != text) {
                $('[data-chat-id="-1"] .sb-content').append(text);
                $("#game-chat-content > div").trigger("resize.scrollBox");
                $('#game-chat-content > div .sb-content').scrollTop(100000);
            }
        },
        eventLastAction: function (action) {
            if (action != 15) {
                Main.functions.sendWorker('clearEndTime');
            }
            if (action == 4) {
                Game.functions.playAudio('buy');
            }
        },
        getMonopolyPlayer: function (userId) {
            let placesGame = [];
            $('.game-places-price').each(function (index, row) {
                if (row.classList.length > 1) {
                    if (placesGame[row.classList[1].slice(11)] === undefined) {
                        placesGame[row.classList[1].slice(11)] = [];
                    }
                    placesGame[row.classList[1].slice(11)].push($(row).parent().attr('data-step'));
                }
            });
            var userIdActive;
            if (userId === undefined) {
                userIdActive = $('div[data-user-id].active').attr('data-user-id');
            } else {
                userIdActive = userId;
            }

            let placesUser;
            for (let key in Game.vars.players) {
                if (Game.vars.players[key]['id'] == userIdActive) {
                    placesUser = Game.vars.players[key]['places'];
                    break;
                }
            }
            let monopolyPlayer = [];
            for (let key in placesGame) {
                for (let key2 in placesUser) {
                    if (placesGame[key].indexOf(placesUser[key2]['place_step']) > -1) {
                        if (monopolyPlayer[key] == undefined) {
                            monopolyPlayer[key] = [];
                        }
                        monopolyPlayer[key].push(placesUser[key2]['place_step']);
                    }
                }
            }
            let compliteMonopolyPlayer = [];
            for (let key in monopolyPlayer) {
                if (placesGame[key].length == monopolyPlayer[key].length) {
                    if (compliteMonopolyPlayer[key] === undefined)
                        compliteMonopolyPlayer[key] = [];

                    compliteMonopolyPlayer[key] = placesGame[key];
                }
            }
            let res = [];
            for (let key in compliteMonopolyPlayer) {
                for (let key2 in placesUser) {
                    if (compliteMonopolyPlayer[key].indexOf(placesUser[key2]['place_step']) > -1) {
                        if (key == 'white')
                            continue;
                        if (res[key] === undefined)
                            res[key] = [];

                        res[key].push(placesUser[key2]);
                    }
                }
            }

            return res;
        },
        init: function () {
            if (window.initPlayersInGame !== undefined) {
                Game.functions.initAudio();
                Game.functions.timerGame(parseInt($('.header-game-info p span').eq(0).html()));
                initPlayersInGame();

                $('.game-popup-mask').eq(0).show();
                $('.game-popup').hide();
                $('.game-popup input[name="pass-lobby"]').val('');

                if (Game.vars.lobby['status'] == 'wait') {
                    $('#wait-user-lobby').show();
                    Game.functions.showUserButton([]);
                    GameMain.functions.sendSocket('linkToGame');
                    return false;
                } else {
                    $('.game-popup-mask').addClass('dis');
                    Main.functions.sendWorker('loadUser', {
                        load: false,
                    });
                    $('#load-game').show();
                    GameMain.functions.sendSocket('linkToGame');
                }

                $('.game-user-profile.active .preloader > div').css({
                    'width': (100 - ((parseInt($('.game-user-profile.active > p span').html()) * 100) / 75)) + '%'
                });

                $('[data-step]').each(function (index, row) {
                    if (isJson($(row).attr('data-price'))) {
                        Game.vars.placePrice[$(row).attr('data-step')] = JSON.parse($(row).attr('data-price'));
                    }
                    $(row).removeAttr('data-price');
                });
                Game.vars.stepPosition = Game.functions.getPositionByStep();
                for (key in Game.vars.players) {
                    let numberPosition = 0;
                    for (key2 in Game.vars.players) {
                        if (Game.vars.players[key]['id'] == Game.vars.players[key2]['id'])
                            continue;
                        if (Game.vars.players[key]['step'] == Game.vars.players[key2]['step'] && Game.vars.players[key2]['position'] !== undefined) {
                            if (numberPosition < Object.keys(Game.vars.stepPosition[Game.vars.players[key]['step']]).length - 1) {
                                numberPosition++;
                            }
                        }
                    }
                    Game.vars.players[key]['position'] = {};
                    for (key2 in Game.vars.stepPosition[Game.vars.players[key]['step']][numberPosition]) {
                        Game.vars.players[key]['position'][key2] = Game.vars.stepPosition[Game.vars.players[key]['step']][numberPosition][key2];
                    }
                    $('.players > div[data-user-id="' + Game.vars.players[key]['player_id'] + '"]').css({
                        left: Game.vars.players[key]['position']['x'] + 'px',
                        top: Game.vars.players[key]['position']['y'] + 'px'
                    });
                }
                Main.functions.sendWorker('setPlayers', {
                    players: Game.vars.players,
                    positions: Game.vars.stepPosition
                });
                if (Main.vars.userInterior.id == parseInt($('.game-user-profile.active').attr('data-user-id'))) {
                    Game.functions.showNowAction();
                } else {
                    Game.functions.showUserButton([]);
                }
                Game.functions.initCubes(function () {
                    Main.functions.sendWorker('loadUser', {
                        load: true,
                    });
                    $('.game-popup-mask').removeClass('dis');
                    $('.game-popup-mask').hide();
                    $('#load-game').hide();
                });

                GameMain.functions.sendSocket('updateGame');
            }
            Main.functions.sendWorker('statusTabListener', {status: true});
            if (Main.vars.userInterior.tourneyInfo !== undefined) {
                if (Main.vars.userInterior.tourneyInfo.stage > 0) {
                    setTimeout(function () {
                        location.reload();
                    }, (Main.vars.userInterior.tourneyInfo.stages[parseInt(Main.vars.userInterior.tourneyInfo.stage) - 1].time.stageFinish + 5) * 1000);
                }
            }
        },
        initMin: function () {
            $("#game-chat-content > div").scrollBox();
            $("#game-chat-content > div").trigger("resize.scrollBox");
            $('#game-chat-content > div .sb-content').scrollTop(100000);
        },
        showUserButton: function (buttonsName) {
            $('.game-top-panel > div[data-buttun-name]').hide();
            for (key in buttonsName) {
                $('.game-top-panel > div[data-buttun-name="' + buttonsName[key] + '"]').show();
            }
        },
        showNowAction: function (callback) {
            $.post('/game/ajax/getAvailAction', {}, function (res) {
                if (isJson(res)) {
                    if (res.length > 1) {
                        if (Game.vars.lastAction == 5) {
                            if (Main.vars.userInterior.id == parseInt($('.game-user-profile.active').attr('data-user-id'))) {
                                Game.functions.showUserButton([]);
                            }
                        } else {
                            Game.functions.showUserButton(JSON.parse(res));
                        }
                        if (callback !== undefined)
                            callback();
                    }
                }
            });
        },
        workers: function () {
            if (Main.vars.webWorkersBody.socketFunction_quitCubes === undefined) {
                Main.vars.webWorkersBody.socketFunction_quitCubes = function (data) {
                    if (data.length == 0) {
                        return false;
                    }
                    let cur = 0;
                    let interval = setInterval(function () {
                        cur++;
                        data['cur'] = cur;
                        if (cur == 32) {
                            setTimeout(function () {
                                if (self.load)
                                    postMessage(['quitCubes', data]);
                                if (!data.jail) {
                                    self.stepPlayers({
                                        user_id: data.user_id,
                                        amountStep: parseInt(data.cub1 + +data.cub2),
                                        history: data.history,
                                        buttons: data.availableActions,
                                        direction: data.direction
                                    });
                                } else {
                                    self.sendSocket({
                                        command: 'updateGame',
                                        data: {
                                            data: {}
                                        }
                                    });
                                }
                            }, 1500);
                            clearInterval(interval);
                        } else {
                            if (self.load)
                                postMessage(['quitCubes', data]);
                        }
                    }, 30);
                };
            }
            if (Main.vars.webWorkersBody.socketFunction_updateGame === undefined) {
                Main.vars.webWorkersBody.socketFunction_updateGame = function (data) {
                    if (data.winners === undefined) {
                        self.setWin(false);
                        self.preloader(data.turnTime);
                    } else {
                        self.setWin(true);
                    }
                    postMessage(['updateGame', data]);
                }
            }
            if (Main.vars.webWorkersBody.setPlayers === undefined) {
                Main.vars.webWorkersBody.setPlayers = function (data) {
                    self.players = data.players;

                    if (data.positions !== undefined)
                        self.stepPosition = data.positions;
                }
            }
            if (Main.vars.webWorkersBody.stepPlayers === undefined) {
                Main.vars.webWorkersBody.stepPlayers = function (data, cur) {
                    if (cur == undefined)
                        cur = 1;
                    let user_key;
                    if (self.userMoveNow == undefined) {
                        for (key in self.players) {
                            if (self.players[key]['id'] == data.user_id) {
                                user_key = key;
                                break;
                            }
                        }
                    }
                    var direction = 1;
                    if (data.direction == 'back') {
                        direction = -1;
                    }
                    let newStep = parseInt(self.players[user_key]['step']) + direction;
                    if (newStep > 42) {
                        newStep = 1;
                    }
                    var positionNew = self.stepPosition[newStep];

                    var numberPosition = 0;
                    for (key in self.players) {
                        if ((self.players[user_key]['step'] + 1) == self.players[key]['step']) {
                            if (numberPosition < Object.keys(positionNew).length - 1) {
                                numberPosition++;
                            }
                        }
                    }
                    var moveIteration = 5;
                    positionNew = positionNew[numberPosition];

                    self.players[user_key]['position']['x'] = parseInt(self.players[user_key]['position']['x']);
                    self.players[user_key]['position']['y'] = parseInt(self.players[user_key]['position']['y']);
                    positionNew['x'] = parseInt(positionNew['x']);
                    positionNew['y'] = parseInt(positionNew['y']);

                    function move () {
                        if (self.players[user_key]['position']['y'] == positionNew['y'] &&
                            self.players[user_key]['position']['x'] == positionNew['x']) {
                            if (data.direction == 'back') {
                                self.players[user_key]['step']--;
                            } else {
                                self.players[user_key]['step']++;
                            }

                            if (self.players[user_key]['step'] == 42) {
                                self.players[user_key]['step'] = 0;
                            }

                            if (cur < data.amountStep) {
                                setTimeout(function () {
                                    self.stepPlayers(data, ++cur)
                                }, 200);
                            } else {
                                if (self.load)
                                    postMessage(['userDecision', {
                                        'user_id': data.user_id,
                                        'buttons': data.buttons,
                                        'history': data.history
                                    }]);
                            }

                            return false;
                        }

                        let amountAddPix = moveIteration;

                        if (self.players[user_key]['position']['x'] < positionNew['x']) {
                            while (self.players[user_key]['position']['x'] + amountAddPix > positionNew['x']) {
                                amountAddPix -= 1;
                            }
                            self.players[user_key]['position']['x'] += amountAddPix;

                        } else if (self.players[user_key]['position']['x'] > positionNew['x']) {
                            while (self.players[user_key]['position']['x'] - amountAddPix < positionNew['x']) {
                                amountAddPix -= 1;
                            }
                            self.players[user_key]['position']['x'] -= amountAddPix;
                        }

                        if (self.players[user_key]['position']['y'] < positionNew['y']) {
                            while (self.players[user_key]['position']['y'] + amountAddPix > positionNew['y']) {
                                amountAddPix -= 1;
                            }
                            self.players[user_key]['position']['y'] += amountAddPix;

                        } else if (self.players[user_key]['position']['y'] > positionNew['y']) {
                            while (self.players[user_key]['position']['y'] - amountAddPix < positionNew['y']) {
                                amountAddPix -= 1;
                            }
                            self.players[user_key]['position']['y'] -= amountAddPix;
                        }

                        if (self.load) {
                            postMessage(['redraw', {
                                user: self.players[user_key],
                                newPos: {
                                    x: parseInt(self.players[user_key]['position']['x']),
                                    y: parseInt(self.players[user_key]['position']['y'])
                                },
                                players: self.players
                            }]);
                        }

                        setTimeout(function() { move(); }, 10);

                    };
                    move();
                };
            }
            if (Main.vars.webWorkersBody.socketFunction_auction === undefined) {
                Main.vars.webWorkersBody.socketFunction_auction = function (data) {
                    if (data.status == 'active') {
                        if (data.userName !== undefined) {
                            if (data.whom == self.userInterior['id']) {
                                postMessage(['auction', data]);
                                self.auctionTimer();
                                if (data.history !== undefined) {
                                    self.sendSocket({
                                        command: 'updateGame',
                                        data: {
                                            data: {history: data.history}
                                        }
                                    });
                                }
                            }
                        }
                    } else {
                        if (data.whom == self.userInterior['id']) {
                            self.sendSocket({
                                command: 'updateGame',
                                data: {
                                    data: {history: data.history}
                                }
                            });
                        }
                    }
                }
            }
            if (Main.vars.webWorkersBody.socketFunction_deal === undefined) {
                Main.vars.webWorkersBody.socketFunction_deal = function (data) {
                    if (data.error !== undefined) {
                        postMessage(['deal', data]);
                        return false;
                    }
                    if (data.status == 'active') {
                        if (data.whom == self.userInterior['id']) {
                            postMessage(['deal', data]);
                        }
                        self.dealTimer();
                    } else {
                        if (data.whom == self.userInterior['id']) {
                            self.sendSocket({
                                command: 'updateGame',
                                data: {
                                    data: {history: data.history}
                                }
                            });
                        }
                    }
                }
            }
            if (Main.vars.webWorkersBody.clearDealTimer === undefined) {
                Main.vars.webWorkersBody.clearDealTimer = function () {
                    clearInterval(self.dealTimerInterval);
                }
            }
            if (Main.vars.webWorkersBody.dealTimer === undefined) {
                Main.vars.webWorkersBody.dealTimer = function () {
                    var second = 15;
                    postMessage(['dealTimer', {'second': second}]);
                    self.dealTimerInterval = setInterval(function () {
                        second--;
                        postMessage(['dealTimer', {'second': second}]);
                        if (second < 1) {
                            self.sendSocket({
                                command: 'deal',
                                data: {data: {'dealStatus': 'no'}}
                            });
                            clearInterval(self.dealTimerInterval);
                        }
                    }, 1000);
                }
            }
            if (Main.vars.webWorkersBody.clearEndTime === undefined) {
                Main.vars.webWorkersBody.clearEndTime = function () {
                    clearTimeout(self.timeoutIdEndTime);
                }
            }
            if (Main.vars.webWorkersBody.setWin === undefined) {
                Main.vars.webWorkersBody.setWin = function (status) {
                    self.isWin = status;
                }
            }
            if (Main.vars.webWorkersBody.endTime === undefined) {
                Main.vars.webWorkersBody.endTime = function () {
                    if (self.isWin) {
                        clearTimeout(self.timeoutIdEndTime);
                        return false;
                    }
                    self.ajax('/game/ajax/endTime', {}, function (res) {
                        res = JSON.parse(res);
                        if (res.time > 0) {
                            postMessage(['endTime', res]);
                            self.timeoutIdEndTime = setTimeout(function () {
                                self.endTime();
                            }, 1000);
                        } else {
                            self.sendSocket({command: 'updateGame', data: {data: {}}});
                        }
                    });
                }
            }
            if (Main.vars.webWorkersBody.preloader === undefined) {
                Main.vars.webWorkersBody.preloader = function (time) {
                    if (self.isWin) {
                        clearInterval(self.timeToTurnInterval);
                        return false;
                    }
                    let t = self.timeToTurnInterval;
                    delete (self.timeToTurnInterval);
                    clearInterval(t);
                    if (self.timeToTurnInterval === undefined) {
                        self.timeToTurnInterval = setInterval(function () {
                            if (--time >= 0) {
                                if (self.load)
                                    postMessage(['preloader', {'second': time}]);
                            } else {
                                self.endTime();
                                let t = self.timeToTurnInterval;
                                delete (self.timeToTurnInterval);
                                clearInterval(t);
                            }
                        }, 1000);
                    }
                }
            }
            if (Main.vars.webWorkersBody.loadUser === undefined) {
                Main.vars.webWorkersBody.loadUser = function (data) {
                    self.load = data.load;
                    if (self.load == true) {
                        self.ajax('/game/ajax/userConnectToGame', {}, function () {
                            self.sendSocket({
                                command: 'updateGame',
                                data: {
                                    data: {}
                                }
                            });
                        });
                    }
                };
            }
            if (Main.vars.webWorkersBody.clearAuctionTimer === undefined) {
                Main.vars.webWorkersBody.clearAuctionTimer = function () {
                    clearInterval(self.auctionTimerInterval);
                }
            }
            if (Main.vars.webWorkersBody.auctionTimer === undefined) {
                Main.vars.webWorkersBody.auctionTimer = function () {
                    var second = 99999;
                    postMessage(['auctionTimer', {'second': second}]);
                    self.auctionTimerInterval = setInterval(function () {
                        second--;
                        postMessage(['auctionTimer', {'second': second}]);
                        if (second < 1) {
                            if (second == 0) {
                                self.sendSocket({
                                    command: 'auction',
                                    data: {data: {'action': 'no'}}
                                });
                            }
                            clearInterval(self.auctionTimerInterval);
                        }
                    }, 1000);
                }
            }
        },
        startUserTurn: function (nextUser) {
            if (Main.vars.userInterior.id == nextUser) {
                if ($('[data-buttun-name="quit_cubes"]:visible').is('div')) {
                    Game.functions.playAudio('startTurn');
                }
                Game.functions.showNowAction();
            } else {
                Game.functions.showUserButton([]);
            }
            $('.game-user-profile').removeClass('active');
            $('.game-user-profile[data-user-id="' + nextUser + '"]').addClass('active');
        },
        maskToPlace: function (notMask, reset) {
            if (reset == undefined || reset == true)
                Game.vars.selectPlace = [];
            if (notMask === undefined)
                notMask = [];
            $('.game-general-panel > div > div[data-step].mask-place').removeClass('mask-place');
            $('.game-general-panel > div > div[data-step]').addClass('mask-place');
            for (key in notMask) {
                $('.game-general-panel > div > div[data-step="' + notMask[key] + '"]').removeClass('mask-place');
            }
        },
        clearMaskToPlace: function () {
            Game.vars.selectType = '';
            $('.game-general-panel > div > div[data-step].mask-place').removeClass('mask-place');
            Game.vars.selectPlace = [];
        },
        initCubes: function (callback) {
            function temp(path, callback) {
                let img = new Image();

                img.onload = function () {

                    if (path == '/media/img/game/cub1.png')
                        Game.vars.imageCub1 = this;
                    if (path == '/media/img/game/cub2.png')
                        Game.vars.imageCub2 = this;

                    callback();

                };
                img.src = path;
            };
            temp('/media/img/game/cub1.png', function () {
                temp('/media/img/game/cub2.png', function () {
                    callback();
                });
            });
        },
        initAudio: function () {
            Game.vars.audio.cubs = new Audio('/media/sound/RollDice.mp3');
            Game.vars.audio.buy = new Audio('/media/sound/Buy.mp3');
            Game.vars.audio.startTurn = new Audio('/media/sound/CurrentTurn.mp3');
            Game.vars.audio.startAction = new Audio('/media/sound/Auction.mp3');
            Game.vars.audio.deal = new Audio('/media/sound/ExchangeWindow.mp3');
            Game.vars.audio.timeout = new Audio('/media/sound/TimeIsRunningOut.mp3');
            Game.vars.audio.win = new Audio('/media/sound/Winner.mp3');
        },
        playAudio: function (sound) {
            if (GameMain.vars.soundStatus) {
                Game.vars.audio[sound].play();
            }
        },
        getPositionByStep: function () {
            var commonPlace = $('.game-general-panel').offset();
            var postion = [];
            $('div[data-step]').each(function (index, row) {
                var step = $(row).attr('data-step');
                postion[step] = [];
                let x;
                let y;
                let posStep = $(row).offset();

                if (step > 1 && step < 14) {
                    y = posStep.top - commonPlace.top + 22;
                    x = (posStep.left - commonPlace.left) + 5;
                    for (let i = 0; i < 4; i++) {
                        postion[step].push({y: y, x: x});
                        y += 17;
                    }
                } else if (step > 14 && step < 22) {
                    y = posStep.top - commonPlace.top + 5;
                    x = (posStep.left - commonPlace.left) + 64;
                    for (let i = 0; i < 4; i++) {
                        postion[step].push({y: y, x: x});
                        x -= 17;
                    }
                } else if (step > 22 && step < 35) {
                    y = (posStep.top - commonPlace.top) + 64;
                    x = (posStep.left - commonPlace.left) + 5;
                    for (let i = 0; i < 4; i++) {
                        postion[step].push({y: y, x: x});
                        y -= 17;
                    }
                } else if (step > 35) {
                    y = posStep.top - commonPlace.top + 5;
                    x = (posStep.left - commonPlace.left) + 22;
                    for (let i = 0; i < 4; i++) {
                        postion[step].push({y: y, x: x});
                        x += 17;
                    }
                } else {
                    y = (posStep.top - commonPlace.top) + 5;
                    x = (posStep.left - commonPlace.left) + 6;
                    postion[step].push({y: y, x: x});
                    x += 37;
                    y += 37;
                    postion[step].push({y: y, x: x});
                    x += 37;
                    y += 37;
                    postion[step].push({y: y, x: x});
                    postion[step].push({y: postion[step][0]['y'], x: postion[step][2]['x']});
                    postion[step].push({y: postion[step][2]['y'], x: postion[step][0]['x']});
                }
            });
            return postion;
        },
        timerGame: function (timeSecond) {
            let temp = timeSecond;
            var h = parseInt(temp / 60 / 60);
            temp -= (h * 60 * 60);
            var m = parseInt(temp / 60);
            temp -= (m * 60);
            var s = temp;
            var str = '';
            if (h < 10) {
                str += '0';
            }
            str += h + ':';
            if (m < 10) {
                str += '0';
            }
            str += m + ':';
            if (s < 10) {
                str += '0';
            }
            str += s;
            $('.header-game-info p span').eq(0).html(str);
            setTimeout(function () {
                Game.functions.timerGame(++timeSecond);
            }, 1000);
        },
    },
    vars: {
        imageCub1: {},
        buildInThisStep: {},
        imageCub2: {},
        audio: {},
        dealResolve: {},
        players: {},
        userIdDeal: 0,
        promisAction: function () {
        },
        selectPlace: [],
        stepPosition: {},
        isMoveBalanceDeal: false,
        placePrice: {},
        selectType: '',
        loadUser: [],
        canvas: $('#game-panel-canvas')[0],
        lastAction: 0
    }

};

Main.vars.classes.push(Game);