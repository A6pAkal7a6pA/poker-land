var Main = { 
    events: function(){
        $('body').on('click','a[ajax]',function() {
            if($(this).is('[update]')) {
                ajaxRedirect(location.href, false, false, true);
                return false;
            }

            if($(this).is('[off]') || !$(this).is('[href]') || location.protocol+'//'+location.hostname+$(this).attr('href') == location.href)
                return false;

            var url = $(this).attr('href');
            ajaxRedirect(url==''?location.href:url, $(this).is('[all]'),true);

            if (location.href.indexOf('draft') > -1)
                Draft.vars.banedHeroes = [];

            return false;
        });
        window.onunload = function() {
            Main.vars.worcker.terminate();
        };
        window.onblur = function (e) {
            Main.functions.sendWorker('statusTabListener',{status: false})
        };
        window.onfocus = function (e) {
            Main.functions.sendWorker('statusTabListener',{status: true})
        };
    },
    functions: {
        init: function (){

            initConfig();

            Main.functions.startPage();
            new Promise(function(resolve){
                Main.functions.initWorkers(resolve);
            }).then(function(){
                Main.functions.initPage();
                Main.functions.initEvents();
            });

        },
        startPage: function() {
            jQuery.expr[':'].icontains = function(a, i, m) {
                return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
            };
        },
        initPage: function() {
            for (cl in Main.vars.classes) {
                if (Main.vars.classes[cl].functions.init !== undefined)
                Main.vars.classes[cl].functions.init();
            }

            Main.functions.initPageMini();
        },
        initPageMini: function() {
            for (cl in Main.vars.classes) {
                if (Main.vars.classes[cl].functions.initMin !== undefined)
                    Main.vars.classes[cl].functions.initMin();
            }
        },
        initEvents: function() {
            Main.events();
            for (cl in Main.vars.classes) {
                Main.vars.classes[cl].events();
            }
        },
        initWorkers: function(resolve) {
            let webWorkersBodyText = 'importScripts(\''+Main.vars.config.socket['nodeClientUrl']+'\');\n';
            webWorkersBodyText += 'self.onmessage = function(e) {\n'+
                '    if (e.data[0] !== undefined) {\n'+
                '        let res = self[e.data[0]](e.data[1]);\n'+
                '        if (typeof res != \'array\') {\n'+
                '           postMessage([res],[]);\n'+
                '        } else {\n'+
                '            postMessage(res[0],res[1]);\n'+
                '        }\n'+
                '    }\n'+
                '}\n';
            Main.vars.webWorkersBody.ajax = function (url, data, callback) {
                xhr = new XMLHttpRequest();
                xhr.onreadystatechange=function(){
                    if (xhr.readyState==4 && xhr.status==200) {
                        callback(xhr.responseText);
                    }
                };
                xhr.open('POST', self.url+url, true);
                xhr.send(JSON.stringify(data));
            };
            Main.vars.webWorkersBody.setUrl = function (data) {
                self.url = data.url;
            };
            Main.vars.webWorkersBody.setUesrs = function (data) {
                self.userInterior = data.userInterior;
            };
            Main.vars.webWorkersBody.statusTabListener = function (data) {
                self.statusTab = data.status;
            };
            for (cl in Main.vars.classes) {
                if (Main.vars.classes[cl].functions.workers !== undefined)
                    Main.vars.classes[cl].functions.workers();
            }
            for (key in Main.vars.webWorkersBody) {
                webWorkersBodyText += (Main.vars.webWorkersBody[key] + '').replace(/function \(/, 'function ' + key +'(')+'\n';
            }
            webWorkersBodyText += "postMessage(['start', []]);\n";
            let myBlob = new Blob([webWorkersBodyText]);
            Main.vars.worcker = new Worker(window.URL.createObjectURL(myBlob));
            Main.vars.worckerHendlers.start = function() {
                Main.functions.sendWorker('setUrl', {url: (location.protocol + '//' + location.host)});
                Main.functions.sendWorker('setUesrs', {userInterior: Main.vars.userInterior});
                resolve();
            };
            Main.vars.worcker.onmessage = function (e) {
                if (Main.vars.worckerHendlers[e.data[0]] !== undefined) {
                    Main.vars.worckerHendlers[e.data[0]](e.data[1]);
                }
            };
        },
        sendWorker: function(functionName, data) {
            Main.vars.worcker.postMessage([functionName, data]);
        }
    },
    vars:{
        classes: [],
        config: [],
        worcker: [],
        webWorkersBody: [],
        worckerHendlers: [],
        userInterior : [],
        i18n: []
    },
};
$(document).ready(Main.functions.init);