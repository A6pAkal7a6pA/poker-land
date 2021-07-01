var GameMain = {
    events: function() {
      $('body').on('click', '#create-new-etherKey', function() {
          $('#recaptcha').show();
      });
      $('body').on('click', '.main-chat-content .button-chat', function(){
          var text = $('.main-chat-content .input-chat-text input').val();
          if($.trim(text.length) > 0) {
              GameMain.functions.sendSocket('commonChat', {'msg': text});
          }
          $('.main-chat-content .input-chat-text input').val('');
      });
      $('body').on('keyup', '.main-chat-content .input-chat-text input', function(e){
            if (e.keyCode == 13) {
                var text = $('.main-chat-content .input-chat-text input').val();
                if($.trim(text.length) > 0) {
                    GameMain.functions.sendSocket('commonChat', {'msg': text});
                }
                $('.main-chat-content .input-chat-text input').val('');
            }
        });
      $('body').on('click', '.tabs div:not(.active)', function() {
        $(this).parent().find('div.active').removeClass('active');
        $('#'+$(this).attr('data-id-content')).parent().children('.active').removeClass('active');
        $('#'+$(this).attr('data-id-content')).addClass('active');
        $(this).addClass('active');
        if($(this).parents('#start-user-reit').is('div')) {
            $("#start-user-reit table.scroll.active tbody ").trigger("resize.scrollBox");
        }
      });
      $('body').on('click', '.create-game div[data-type-game]:not(.active)', function() {
          if (!$(this).is('.active')) {
              $(this).parent().find('.active').removeClass('active');
              $(this).addClass('active');
          }
          $('div[data-game-count-players]').eq(2).click();
      });
      $('body').on('click', '.create-game div[data-game-count-players]', function() {
          var type = $('.create-game div[data-type-game].active').attr('data-type-game');

          $('div[data-game-count-players]').removeClass('active');
          if (type == '1') {
              var countPlayers = $(this).attr('data-game-count-players');
              if (countPlayers < 2)
                  countPlayers = 2;
          } else {
              countPlayers = 4;
          }
          for (var i = 0; i < countPlayers; i++) {
              $('div[data-game-count-players]').eq(i).addClass('active');
          }
          $('div[data-game-count-players]').parent().children('p').html(countPlayers);

      });
      $('body').on('click', '.create-game div[data-game-rate]', function() {
          if (!$(this).is('.active')) {
              $(this).parent().find('.active').removeClass('active');
              $(this).addClass('active');
          }
      });
      $('body').on('click', '[data-model-open], [get-data-user]', function() {
          if($(this).is('[get-data-user]')) {
              GameMain.functions.dataUser($(this).attr('get-data-user'), function () {
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
              if($($(this).attr('data-model-open')).is('#data-user-info')) {
                  $(".info-popup .content-popup").trigger("resize.scrollBox");
              }
          }
          if($(this).is('[data-model-open="#start-user-reit"]')) {
              $("#start-user-reit table.scroll tbody ").scrollBox();
          }

      });
      $('body').on('click', '.gold-footer .button-chat', function() {
          $.post('/game/ajax/addOrderBank', {
              amount: $('.gold-footer input[name=amount]').val(),
              address: $('.gold-footer input[name=address]').val()
          }, function (res) {
              alert(res);
          });
      });
      $('body').on('click', '.header-panel-buttons-resize', function () {
          if (!document.fullscreenElement) {
              GameMain.functions.fullscreen(true);
          } else {
              GameMain.functions.fullscreen(false);
          }
      });
      $('body').on('click', '.header-panel-buttons-sound-on, .header-panel-buttons-sound-off', function () {
          if ($(this).is('.header-panel-buttons-sound-on')) {
              GameMain.vars.soundStatus = false;
              $(this).removeClass('header-panel-buttons-sound-on');
              $(this).addClass('header-panel-buttons-sound-off');
          } else {
              GameMain.vars.soundStatus = true;
              $(this).removeClass('header-panel-buttons-sound-off');
              $(this).addClass('header-panel-buttons-sound-on');
          }
          $.post('/game/ajax/soundChange',{'value':GameMain.vars.soundStatus?1:0},function(){});
      });
      $('body').on('click', '.game-popup-mask:not(.dis), .close-popup, .close-pass-to-lobby', function(){
          $('.game-popup, .info-popup').hide();
          $('.game-popup-mask').hide();
      });
      $('body').on('click', '#start-game-button', function(){
          var data = {
              name: $('#start-game-modal input[name="name-lobby"]').val(),
              rate: $('#start-game-modal div[data-game-rate].active').attr('data-game-rate'),
              type_id: $('#start-game-modal div[data-type-game].active').attr('data-type-game'),
              count_players: $.trim($('#start-game-modal div[data-game-count-players]').parent().children('p').html()),
              pass: $.trim($('#start-game-modal input[name="pass-lobby"]').val()),
          };
          $.post('/game/ajax/startGame', data, function(res){
              if (res == 'success') {
                  GameMain.functions.sendSocket('linkToGame');
                  GameMain.functions.sendSocket('countGame');
                  GameMain.functions.sendSocket('updateListGame');
                  setTimeout(function () {
                      location.reload();
                  },1000);
              } else {
                  alert(res);
              }
          });
      });
      $('body').on('click', 'div[data-model-open="#game-comfirm-add-user"]', function(){
          $('#lobby-select-now-id').val($(this).parents('[data-lobby-id]').attr('data-lobby-id'));
      });
      $('body').on('click', '.list-game-user-avatar.empty[data-team]', function(){
          $(this).parents('[data-lobby-id]').find('.button-chat').click();
          $('#lobby-select-now-team').val($(this).attr('data-team'));
      });
      $('body').on('click', '[data-add-lobby-free]', function(){
          $.post('/game/ajax/joinToGame', {
              'lobby_id':$(this).parents('div[data-lobby-id]').attr('data-lobby-id')
          }, function(res) {
              if (res != 'success') {
                  alert(res);
              } else {
                  location.reload();
              }
          });
      });
      $('body').on('click', '.enter-to-game', function(){
            let data = {
                lobby_id: $('#lobby-select-now-id').val(),
                pass: $('input[name="pass-to-lobby"]').val(),
            };
            if ($('#lobby-select-now-team').val() != '') {
                data['team'] = $('#lobby-select-now-team').val();
            } else {
                let team = $('[data-lobby-id="'+data['lobby_id']+'"]').find('.list-game-user-avatar.empty').eq(0).attr('data-team');
                if (team != undefined) {
                    data['team'] = team;
                }
            }
            $.post('/game/ajax/joinToGame', data, function(res) {
                if (res == 'success') {
                    GameMain.functions.sendSocket('updateListGame');

                    $('.close-popup').click();
                    location.reload();
                } else if(res == 'error') {
                    $('#game-comfirm-add-user input[type=password]').css({'border':'1px solid red'});
                } else {
                    alert(res);
                }
            });
      });
      $('body').on('keyup', 'input[name="filter-lobby-name"]', function () {
        if($(this).val() == '') {
            $('.lobby-list div').show();
        } else {
            $('.lobby-list > div').hide();
            $('.lobby-list div:first-child span:contains('+$(this).val()+')').parents('div[data-lobby-id]').show();
        }
      });
      $('body').on('keyup', 'input[name="filter-players"]', function () {
          if($(this).val() == '') {
              $('.lobby-list div').show();
          } else {
              $('.lobby-list > div').hide();
              $('.lobby-list div:nth-child(2) .list-game-user-avatar[user-id="' + $(this).val() + '"]').parents('div[data-lobby-id]').show();
              $('.lobby-list div:nth-child(2) .list-game-user-avatar[user-login *= "' + $(this).val() + '"]').parents('div[data-lobby-id]').show();
          }
      });
      $('body').on('keyup', 'input[name="filter-rate"]', function () {
          if($(this).val() == '') {
              $('.lobby-list div').show();
          } else {
              $('.lobby-list > div').hide();
              let textSerch = $(this).val();
              if (textSerch == '0') {
                  textSerch = 'Без';
              }
              $('.lobby-list div:nth-child(3) span:contains('+textSerch+')').parents('div[data-lobby-id]').show();
          }
      });

      if (Main.vars.worckerHendlers.commonChat === undefined) {
          Main.vars.worckerHendlers.commonChat = function(res) {
              if (res.muteInfo !== undefined && Main.vars.userInterior.id == res.id) {
                  $('.common-chat .sb-content').append('' +
                      '<p class="chat-message" >' +
                      '<span class="chat-text" style="color: red;">' + res.muteInfo + '</span>' +
                      '</p>' +
                      '');
              } else {
                  $('.common-chat .sb-content').append('' +
                      '<p class="chat-message" >' +
                      '<span class="chat-date">[' + res.time + ']</span>' +
                      '<span class="chat-avatar" get-data-user="' + res.id + '" style="background-image: url(' + res.avatar + ')"></span>' +
                      '<span class="chat-name" get-data-user="' + res.id + '">' + res.username + ': </span>' +
                      '<span class="chat-text">' + res.text + '</span>' +
                      '</p>' +
                      '');
              }
            if ($('.common-chat .sb-content p').length > 35)
                $('.common-chat .sb-content p').eq(0).remove();

            $(".common-chat").trigger("resize.scrollBox");
            $('.common-chat .sb-content').scrollTop(1000);
        }
      }
      if (Main.vars.worckerHendlers.userStatusOnline === undefined) {
          Main.vars.worckerHendlers.userStatusOnline = function(res) {
            $('.status-game-user div').eq(1).children('span').html(res.onlineUsers);
        }
      }
      if (Main.vars.worckerHendlers.countGame === undefined) {
          Main.vars.worckerHendlers.countGame = function(res) {
            $('.status-game-user div').eq(0).children('span').html(res.gameNow);
        }
      }
      if (Main.vars.worckerHendlers.updateListGame === undefined) {
          Main.vars.worckerHendlers.updateListGame = function(res) {
                let temp = function(lobby) {
                    let html = '';
                    $.each(lobby, function(key, lobby){
                        html += '<div data-lobby-id="'+lobby.id+'">';

                        html += '<div><span>'+lobby.name+'</span></div>'+
                            '<div>';
                        if (lobby.type_id == 1) {
                            $.each(lobby.users, function (key, user) {
                                html += '<div class="list-game-user-avatar" user-id="' + ((user.id !== undefined)?user.id:'') + '" user-login="'+ ((user.username !== undefined)?user.username:'') +'" style="background-image: url('+( user.avatar.indexOf('http') > -1?user.avatar:'/media/img/avatars/'+user.avatar)+')"></div>';
                            });
                            for (let i = 0;(lobby.count_players-lobby.users.length) > i;i++) {
                                html += '<div class="list-game-user-avatar empty" style="background-image: url(/media/img/game/2256.png)"></div>';
                            }
                        } else if(lobby.type_id == 2) {
                            let curUser = 0;
                            for(let i = 0;i < 4;i++){
                                if (i == 2) {
                                    html += '<div class="list-game-vs-team">VS</div>';
                                }
                                if (lobby.users[curUser] !== undefined && ((lobby.users[curUser].team == 1 && i < 2) || (lobby.users[curUser].team == 2 && i >= 2))){
                                    html += '<div data-team="'+(i < 2?1:2)+'" class="list-game-user-avatar" user-id="'+ ((user.id !== undefined)?user.id:'') +'" user-login="'+ ((user.username !== undefined)?user.username:'') +'" style="background-image: url('+( lobby.users[curUser].avatar.indexOf('http') > -1?lobby.users[curUser].avatar:'/media/img/avatars/'+lobby.users[curUser].avatar)+')"></div>';
                                    curUser++;
                                } else {
                                    html += '<div data-team="'+(i < 2?1:2)+'" class="list-game-user-avatar empty" style="background-image: url(/media/img/game/2256.png)"></div>';
                                }
                            }
                        }
                        html += '</div>'+
                            '<div>'+(lobby.rate == 0?__('Без<br>ставок'):'<span>'+(lobby.rate > 0?lobby.rate: __('Без<br>ставок')) +'</span>')+'</div>'+
                            '<div>';
                        if(lobby.pass !='') {
                           html += '<img class="list-lobby-private-lobby-img" src="/media/img/game/1306.png" />';
                        }

                        if (lobby.status == 'start') {
                            html += '<div class="button-chat">'+__('Смотреть')+'</div>';
                        } else if (!(lobby.status == 'wait' && lobby.pass == '')) {
                            html += '<div class="button-chat" '+(lobby.pass !=''?'data-model-open="#game-comfirm-add-user"':'data-add-lobby-free')+' >'+(lobby.status == 'start'?__('Смотреть'):__('Играть'))+'</div>';
                        }

                        html +='</div>';
                        html += '</div>';
                    });

                    return html;
                }
              $('.status-game-user div').eq(0).children('span').html(res.gameNow);
                $('#list-game .lobby-list').html(temp(res.gamePrivateWait));
                $('#now-game .lobby-list').html(temp(res.gameStart));
                $('#list-game .lobby-list').trigger("resize.scrollBox");
                $('#now-game .lobby-list').trigger("resize.scrollBox");
          }
      }
      document.onfullscreenchange = function() {
            if (!document.fullscreen) {
                GameMain.functions.fullscreen(false);
            }
        };
    },
    functions: {
        createEtherKey: function(res) {
            $.post('/game/ajax/getEtherKey', {
                captchaReq: res
            }, function(etherKey) {
                $('.gold-head span').html(etherKey);
                $('#recaptcha').hide();
            });
        },
        dataUser: function(id, callback) {
            $.post('/user/getProfileInfo', {id:id}, function(data) {
                data = JSON.parse(data);
                $('#start-user-data .avatar-for-user-avatar > div').css({
                    backgroundImage: 'url('+( data['avatar'].indexOf('http') > -1?data['avatar']:'/media/img/avatars/'+data['avatar'])+')'
                });
                $('#start-user-data .avatar-for-user-status p').eq(0).html(data['username']);
                $('#start-user-data .avatar-for-user-status p').eq(1).html(data['rangName']);

                $('.info-for-user table tr').eq(0).find('td').eq(1).html(data['count_game']);
                $('.info-for-user table tr').eq(0).find('td').eq(3).html(parseFloat(data['eth_for_week']).toFixed(4));
                $('.info-for-user table tr').eq(1).find('td').eq(1).html(data['count_game_party']);
                $('.info-for-user table tr').eq(1).find('td').eq(3).html(data['rang'].replace(/(\d{1,3})(?=((\d{3})*([^\d]|$)))/g, " $1 ")+' $');
                $('.info-for-user table tr').eq(2).find('td').eq(1).html(data['count_game_win']);
                $('.info-for-user table tr').eq(2).find('td').eq(3).html(data['rang_for_week'].replace(/(\d{1,3})(?=((\d{3})*([^\d]|$)))/g, " $1 ")+' $');
                $('.info-for-user table tr').eq(3).find('td').eq(1).html(data['count_game_win_party']);
                $('.info-for-user table tr').eq(3).find('td').eq(3).html(data['online_status'] == '1'?'<span class="start-user-data-text-green">Online</span>':data['last_login']);
                $('.info-for-user table tr').eq(4).find('td').eq(1).html(data['reit']);
                $('.info-for-user table tr').eq(4).find('td').eq(3).html(data['reitForWeek']);
                $('.info-for-user table tr').eq(5).find('td').eq(1).html(data['count_turney_wisit']);
                $('.info-for-user table tr').eq(5).find('td').eq(3).html(data['count_turney_win']);

                callback();
            });
        },
        fullscreen: function(status) {
            if (status) {
                $('.menu').hide();
                document.querySelector('.full_wrapper').requestFullscreen();
            } else {
                $('.menu').show();
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        },
        init: function() {
            let recaptchaInit = function() {
                try {
                    grecaptcha.render('recaptcha', {
                        'sitekey': '6LcnhK8UAAAAAJE6HKhW-RnZBZ2PlcS2pUCFAU_k',
                        'callback': GameMain.functions.createEtherKey
                    });
                } catch (e) {
                    return false;
                }
            };
            GameMain.vars.waitFunction.push(recaptchaInit);
            new Promise(function (resolve) {
                if (Main.vars.worckerHendlers.connectSocket === undefined) {
                    Main.vars.worckerHendlers.connectSocket = function() {
                        resolve();
                    }
                }
                let lobby = parseInt(location.href.split('/').pop());
                Main.functions.sendWorker('setLobby',{lobby: (lobby!=NaN?lobby:0)});

                Main.functions.sendWorker('initSocket',{
                    url:Main.vars.config.socket['nodeServerUrl'],
                    cookie: document.cookie
                });
            }).then(function(){
                GameMain.vars.statusSocket = true;
                for (key in GameMain.vars.waitFunction) {
                    GameMain.vars.waitFunction[key]();
                }
            });

        },
        sendSocket: function(command, data) {
            if (command == undefined)
                return false;
            if (data === undefined)
                data = {};

            var temp = function(){
                Main.functions.sendWorker('sendSocket',{
                    command: command,
                    data: {
                        data: data,
                    }
                });
            };
            if(!GameMain.vars.statusSocket) {
                GameMain.vars.waitFunction.push(temp);
            } else {
                temp();
            }
        },
        initMin: function() {
            $(".info-popup .content-popup").scrollBox();
            $(".content-lobby").scrollBox();
            $(".common-chat").scrollBox();
            $('.common-chat .sb-content').scrollTop(1000);
        },
        workers: function() {
            if (Main.vars.webWorkersBody.initSocket === undefined) {
                Main.vars.webWorkersBody.initSocket = function (data) {
                    self.socket = io.connect(data.url, {transports: ['websocket']});
                    self.cookie = data.cookie;
                    self.socket.on('connect', function () {
                        sendSocket({command: 'addLisener', data: {lobby: self.lobby}});
                        self.socket.on('addLisener', function() {

                            self.socket.on('clientEvent', function(respons) {
                                if (self['socketFunction_'+respons.command] !== undefined) {
                                    let promise = new Promise(function (resolve) {
                                        self['socketFunction_'+respons.command](respons.data, resolve);
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
                            postMessage(['connectSocket',[]]);
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

                    if (self.userInterior.tourneyId !== undefined) {
                        if (data.data.data === undefined) {
                            data.data.data = {};
                        }
                        data.data.data.tourneyId = self.userInterior.tourneyId;

                    }
                    self.socket.emit((data.command == 'addLisener')?data.command:'serverEvent', {
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
        statusSocket: false,
        soundStatus: Main.vars.userInterior.sound == "1",
        zoomStatus: false,
        waitFunction: []
    }
};
Main.vars.classes.push(GameMain);