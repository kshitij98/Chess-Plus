module.exports = function(app, mailer){
	mailer.extend(app, {
		from: 'chessplusbot@gmail.com',
		host: 'smtp.gmail.com',
		secureConnection: true,
		port: 465,
		transportMethod: 'SMTP',
		auth: {
			user: 'chessplusbot@gmail.com',
			pass: 'chesspluspassword'
		}
	});
}