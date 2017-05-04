chat.js
-------

This file contains implementation of chat feature of the app. We are using **Socket.io** for live sending,
receiving and updating the message status. Each message is stored in the database and its status.

request.js
----------

This file implements the feature of friend requests. It stores the *friend request* in the database.
User can accept or decline the request. Depending on the choice the user will be added as friend or
rejected.

routes.js
----------

This file contains various routes of the app.

middleware.js
-------------

This file contains middlewares for various routes.
