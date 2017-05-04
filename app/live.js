var User = require('../app/models/user');
var Messages = require('../app/models/message');

module.exports = function(io) {
	io.on('connection', function(socket) {
		require('../app/chat.js')(io, socket);
		require('../app/request.js')(io, socket);
		require('../app/chess2p.js')(io, socket);
		require('../app/chessai.js')(io, socket);
	});
};
