var frame = './main_frame/main';
exports.deviceMap = function(req, res) {
    res.render(frame, {
        title: 'device Map',
        classname: 'deviceMap'
    });
}

exports.groupSettings = function(req, res) {
    res.render(frame, {
        title: 'group Settings',
        classname: 'groupSettings'
    });
}

exports.index = function(req, res) {
    res.render(frame, {
        title: 'home',
        //users: ['PanPan','Kai', 'aYen', 'Kyousuke'],
        classname: 'home'
    });
};

exports.showTH = function( req, res ) {
    res.render( frame, {
        title: 'TH_report', 
        classname: 'TH_report'
    })
};
