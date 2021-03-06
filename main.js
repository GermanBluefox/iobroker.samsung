"use strict";

var utils = require(__dirname + '/lib/utils'); 
var adapter = utils.adapter('samsung');
var SamsungRemote = require('samsung-remote');
var remote;

adapter.on('unload', function (callback) {
    try {
        //adapter.log.info('cleaned everything up...');
        callback();
    } catch (e) {
        callback();
    }
});

adapter.on('objectChange', function (id, obj) {
    // Warning, obj can be null if it was deleted
    //adapter.log.info('objectChange ' + id + ' ' + JSON.stringify(obj));
});


adapter.on('stateChange', function (id, state) {
    // Warning, state can be null if it was deleted
    //adapter.log.info('stateChange ' + id + ' ' + JSON.stringify(state));
    
    if (state && !state.ack) {
        var as = id.split('.');
        if (as[0] + '.' + as[1] != adapter.namespace) return;
        switch (as[2]) {
            case 'command':
                remote.send(state.val, function callback(err) {
                    if (err) {
                    } else {
                    }
                });
                break;

            default:
                adapter.getObject(id, function (err, obj) {
                    if (!err && obj) {
                        remote.send(obj.native.command, function callback(err) {
                            if (!err) {
                                adapter.setState(id, false, true);
                            }
                        });
                    }
                });
                break;
        }
    }
});


adapter.on('message', function (obj) {
    if (typeof obj == 'object' && obj.message) {
        if (obj.command == 'send') {
            console.log('send command');
            if (obj.callback) adapter.sendTo(obj.from, obj.command, 'Message received', obj.callback);
        }
    }
});

adapter.on('ready', function () {
    main();
});

var Keys = {
    'Power': null,
    'KEY_POWEROFF': 'Standby',
    'Volume': null,
    'KEY_MUTE': 'Mute Toggle',
    'KEY_VOLUP': 'Volume Up',
    'KEY_VOLDOWN': 'Volume Down',
    'Channel': null,
    'KEY_0': '0',
    'KEY_1': '1',
    'KEY_2': '2',
    'KEY_3': '3',
    'KEY_4': '4',
    'KEY_5': '5',
    'KEY_6': '6',
    'KEY_7': '7',
    'KEY_8': '8',
    'KEY_9': '9',
    'KEY_CHUP': 'Channel Up',
    'KEY_CHDOWN': 'Channel Down',
    'KEY_CH_LIST': 'Channel List',
    'KEY_PRECH': 'Previous Channel',
    'KEY_PICTURE_SIZE': 'Picture Size',
    
    'Input': null,
    'KEY_TV': 'TV',  
    'KEY_HDMI': 'HDMI',
    'KEY_HDMI2': 'HDMI2',
    'KEY_HDMI3': 'HDMI3',
    'KEY_HDMI4': 'HDMI4',
    'KEY_SOURCE': 'Source',               
    'KEY_W_LINK': 'Media Player', 
    'KEY_RSS': 'Internet', 
    'KEY_CONTENTS': 'Contents',
    'Navigation': null,
    'KEY_UP': 'Up',
    'KEY_DOWN': 'Down',
    'KEY_LEFT': 'Left',
    'KEY_RIGHT': 'Right',
    'KEY_MENU': 'Menu',
    'KEY_ENTER': 'Enter',
    'KEY_RETURN': 'Return',
    'KEY_EXIT': 'Exit',
    'KEY_TOOLS': 'Tools',
    'KEY_INFO': 'Info',
    'KEY_GUIDE': 'Guide',
    'MediaPlayer': null,
    'KEY_PLAY': 'Play',
    'KEY_PAUSE': 'Pause',
    'KEY_REWIND': 'Rewind',
    'KEY_FF': 'Fast Forward',
    'KEY_REC': 'Record',
    'KEY_STOP': 'Stop',
    'KEY_CAPTION': 'Subtitles',
    'KEY_MTS': 'Dual',  
    'KEY_AD': 'AD'
};


function createObj(name, val, type) {
    
    adapter.setObjectNotExists(name, {
        type: type,
        common: {
            name: name,
            type: 'boolean',
            role: type !== "channel" ? "button" : "",
            def: false,
            read: true,
            write: true,
            values: [false, true]
        },
        native: { command: val }
    }, "", function (err, obj) {
        if (type !== "channel") adapter.setState(name, false, true);
    });
}


function main() {
    
    var commandValues = [];
    var channel;
    for (var key in Keys) {
        if (Keys[key] === null) {
            channel = key;
            /*
            adapter.createChannel(key, key, {
                role: 'channel',
                name: key
            });
            */
            createObj(key, "", "channel");
        }
        else {
            commandValues.push(key);
            createObj(channel + '.' + Keys[key], key, "state");
        }
    }

    remote = new SamsungRemote({ip: adapter.config.IP});

    adapter.setObjectNotExists('command', {
        type: 'state',
        common: {
            name: 'command',
            type: 'string',
            role: 'state',
            desc: "KEY_xxx",
            values: commandValues,
            states: commandValues
        },
        native: {}
    }, "", function (err, obj) {
        adapter.setState("command", "", true/*{ ack: true }*/);
    });

    adapter.subscribeStates('*');
}




/*
KEY_MENU
KEY_UP
KEY_DOWN
KEY_LEFT
KEY_RIGHT
KEY_3
KEY_VOLUP
KEY_4
KEY_5
KEY_6
KEY_VOLDOWN
KEY_7
KEY_8
KEY_9
KEY_MUTE
KEY_CHDOWN
KEY_0
KEY_CHUP
KEY_PRECH
KEY_GREEN
KEY_YELLOW
KEY_CYAN
KEY_ADDDEL
KEY_SOURCE
KEY_INFO
KEY_PIP_ONOFF
KEY_PIP_SWAP
KEY_PLUS100
KEY_CAPTION
KEY_PMODE
KEY_TTX_MIX
KEY_TV
KEY_PICTURE_SIZE
KEY_AD
KEY_PIP_SIZE
KEY_MAGIC_CHANNEL
KEY_PIP_SCAN
KEY_PIP_CHUP
KEY_PIP_CHDOWN
KEY_DEVICE_CONNECT
KEY_HELP
KEY_ANTENA
KEY_CONVERGENCE
KEY_11
KEY_12
KEY_AUTO_PROGRAM
KEY_FACTORY
KEY_3SPEED
KEY_RSURF
KEY_ASPECT
KEY_TOPMENU
KEY_GAME
KEY_QUICK_REPLAY
KEY_STILL_PICTURE
KEY_DTV
KEY_FAVCH
KEY_REWIND
KEY_STOP
KEY_PLAY
KEY_FF
KEY_REC
KEY_PAUSE
KEY_TOOLS
KEY_INSTANT_REPLAY
KEY_LINK
KEY_FF_
KEY_GUIDE
KEY_REWIND_
KEY_ANGLE
KEY_RESERVED1
KEY_ZOOM1
KEY_PROGRAM
KEY_BOOKMARK
KEY_DISC_MENU
KEY_PRINT
KEY_RETURN
KEY_SUB_TITLE
KEY_CLEAR
KEY_VCHIP
KEY_REPEAT
KEY_DOOR
KEY_OPEN
KEY_WHEEL_LEFT
KEY_POWER
KEY_SLEEP
KEY_2
KEY_DMA
KEY_TURBO
KEY_1
KEY_FM_RADIO
KEY_DVR_MENU
KEY_MTS
KEY_PCMODE
KEY_TTX_SUBFACE
KEY_CH_LIST
KEY_RED
KEY_DNIe
KEY_SRS
KEY_CONVERT_AUDIO_MAINSUB
KEY_MDC
KEY_SEFFECT
KEY_DVR
KEY_DTV_SIGNAL
KEY_LIVE
KEY_PERPECT_FOCUS
KEY_HOME
KEY_ESAVING
KEY_WHEEL_RIGHT
KEY_CONTENTS
KEY_VCR_MODE
KEY_CATV_MODE
KEY_DSS_MODE
KEY_TV_MODE
KEY_DVD_MODE
KEY_STB_MODE
KEY_CALLER_ID
KEY_SCALE
KEY_ZOOM_MOVE
KEY_CLOCK_DISPLAY
KEY_AV1
KEY_SVIDEO1
KEY_COMPONENT1
KEY_SETUP_CLOCK_TIMER
KEY_COMPONENT2
KEY_MAGIC_BRIGHT
KEY_DVI
KEY_HDMI
KEY_W_LINK
KEY_DTV_LINK
KEY_APP_LIST
KEY_BACK_MHP
KEY_ALT_MHP
KEY_DNSe
KEY_RSS
KEY_ENTERTAINMENT
KEY_ID_INPUT
KEY_ID_SETUP
KEY_ANYNET
KEY_POWEROFF
KEY_POWERON
KEY_ANYVIEW
KEY_MS
KEY_MORE
KEY_PANNEL_POWER
KEY_PANNEL_CHUP
KEY_PANNEL_CHDOWN
KEY_PANNEL_VOLUP
KEY_PANNEL_VOLDOW
KEY_PANNEL_ENTER
KEY_PANNEL_MENU
KEY_PANNEL_SOURCE
KEY_AV2
KEY_AV3
KEY_SVIDEO2
KEY_SVIDEO3
KEY_ZOOM2
KEY_PANORAMA
KEY_4_3
KEY_16_9
KEY_DYNAMIC
KEY_STANDARD
KEY_MOVIE1
KEY_CUSTOM
KEY_AUTO_ARC_RESET
KEY_AUTO_ARC_LNA_ON
KEY_AUTO_ARC_LNA_OFF
KEY_AUTO_ARC_ANYNET_MODE_OK
KEY_AUTO_ARC_ANYNET_AUTO_START
KEY_AUTO_FORMAT
KEY_DNET
KEY_HDMI1
KEY_AUTO_ARC_CAPTION_ON
KEY_AUTO_ARC_CAPTION_OFF
KEY_AUTO_ARC_PIP_DOUBLE
KEY_AUTO_ARC_PIP_LARGE
KEY_AUTO_ARC_PIP_SMALL
KEY_AUTO_ARC_PIP_WIDE
KEY_AUTO_ARC_PIP_LEFT_TOP
KEY_AUTO_ARC_PIP_RIGHT_TOP
KEY_AUTO_ARC_PIP_LEFT_BOTTOM
KEY_AUTO_ARC_PIP_RIGHT_BOTTOM
KEY_AUTO_ARC_PIP_CH_CHANGE
KEY_AUTO_ARC_AUTOCOLOR_SUCCESS
KEY_AUTO_ARC_AUTOCOLOR_FAIL
KEY_AUTO_ARC_C_FORCE_AGING
KEY_AUTO_ARC_USBJACK_INSPECT
KEY_AUTO_ARC_JACK_IDENT
KEY_NINE_SEPERATE
KEY_ZOOM_IN
KEY_ZOOM_OUT
KEY_MIC
KEY_HDMI2
KEY_HDMI3
KEY_AUTO_ARC_CAPTION_KOR
KEY_AUTO_ARC_CAPTION_ENG
KEY_AUTO_ARC_PIP_SOURCE_CHANGE
KEY_HDMI4
KEY_AUTO_ARC_ANTENNA_AIR
KEY_AUTO_ARC_ANTENNA_CABLE
KEY_AUTO_ARC_ANTENNA_SATELLITE
KEY_EXT1
KEY_EXT2
KEY_EXT3
KEY_EXT4
KEY_EXT5
KEY_EXT6
KEY_EXT7
KEY_EXT8
KEY_EXT9
KEY_EXT10
KEY_EXT11
KEY_EXT12
KEY_EXT13
KEY_EXT14
KEY_EXT15
KEY_EXT16
KEY_EXT17
KEY_EXT18
KEY_EXT19
KEY_EXT20
KEY_EXT21
KEY_EXT22
KEY_EXT23
KEY_EXT24
KEY_EXT25
KEY_EXT26
KEY_EXT27
KEY_EXT28
KEY_EXT29
KEY_EXT30
KEY_EXT31
KEY_EXT32
KEY_EXT33
KEY_EXT34
KEY_EXT35
KEY_EXT36
KEY_EXT37
KEY_EXT38
KEY_EXT39
KEY_EXT40
KEY_EXT41

*/