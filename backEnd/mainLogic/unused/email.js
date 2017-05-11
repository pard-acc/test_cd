var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: '',
        pass: ''
    }
});

var mailOptions = {
    from: 'Cloud Alarm', // sender address
    to: 'acctontest10@gmail.com', // list of receivers
    subject: 'Device Status Changes', // Subject line
    text: 'OPEN!' // plaintext body
    //html: '<b>OPEN!</b>' // html body
};

exports.SendMail = function( ) {
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent: ' + info.response);
        }
    });
}



