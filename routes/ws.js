const models = require('../models');
var obj = new Object()

obj = (socket) => {

    //socket.join('testroom')
    //io.sockets.to('testroom').emit('match_join', 'roomjoined')

    // models.random.create({
    //   name: "testuser",
    //   token: "testtoken"
    // }).then(result => {
    //   console.log(result)
    // }).catch(err => {
    //   console.log(err)
    // });

    socket.on('match_join', () => {
        models.random.findAll().then(result => {
          if (result && result.length > 0) {
            result.map((item) => {
              console.log(item.dataValues)
            })
              var name = result[0].name
              result[0].destroy()
              socket.join(name)
              io.sockets.to(name).emit('match_completed', 'completed')
          } else {
            var name = require('crypto').randomBytes(8).toString('hex')
            models.random.create({
              name: name,
              token: require('crypto').randomBytes(8).toString('hex')
            }).then(result => {
              console.log(result)
              socket.join(name)
              io.sockets.to(name).emit('room_issued', 'issued')
            }).catch(err => {
              console.log(err)
            });
          }
        })

      })
    }

    module.exports = obj
