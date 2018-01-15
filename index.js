const http = require('http');
const fs = require('fs');

const Event = require('./modelo/event');
const User = require('./modelo/user');

http.createServer( (request, response) => {
    let token = request.headers['authorization'];
    let tokenValid = User.validarToken(token);
    let login = '';
    if (tokenValid) idUser = tokenValid.id;
    let body = [];    

    switch(request.method) {
        case 'GET':
            if(request.url === '/auth/token') {
                response.writeHead(200, {"Content-Type":"application/json"});

                if(tokenValid) response.end(JSON.stringify({ok: true}))
                else response.end(JSON.stringify({ok: false}));

            } else if(request.url === '/events') {
                if(tokenValid) {
                    response.writeHead(200,{"Content-Type":"application/json"});
                    Event.listarEventos(idUser).then( resultado => {
                        return Promise.all( resultado.map( e => e.getCreator() )).then( result => {
                            response.end(JSON.stringify({ok: true, result:result}));
                        }).catch( error => {
                            response.end(JSON.stringify({ok:false, errorMessage: error}))
                        });
                    })
                } else {
                    response.writeHead(403, {"Content-Type":"application/json"});
                    response.end(JSON.stringify({ok:false, errorMessage:'You are not logged in'}))
                }

            } else if(request.url === '/events/mine') {
                if(tokenValid) {
                    response.writeHead(200,{"Content-Type":"application/json"});
                    Event.listarEventosDe(idUser).then( resultado => {
                        response.end(JSON.stringify({ok:true, result:resultado}));
                    }).catch( error => {
                        response.end(JSON.stringify({ok:false, errorMessage:error}));
                    });
                } else {
                    response.writeHead(403, {"Content-Type":"application/json"});
                    response.end(JSON.stringify({ok: false, errorMessage:'You are not logged in'}));
                }

            } else if(request.url === '/events/attend') {
                if(tokenValid) {
                    response.writeHead(200,{"Content-Type":"application/json"});
                    Event.listarEventosAsiste(idUser).then( resultado => {
                        return Promise.all( resultado.map( e => e.getCreator() )).then( result => {
                            response.end(JSON.stringify({ok: true, result:result}));
                        }).catch( error => {
                            response.end(JSON.stringify({ok:false, errorMessage: error}))
                        });
                    }).catch( error => {
                        response.end(JSON.stringify({ok:false, errorMessage:error}));
                    });
                } else {
                    response.writeHead(403, {"Content-Type":"application/json"});
                    response.end(JSON.stringify({ok: false, errorMessage:'You are not logged in'}));
                }
            } else if(request.url.startsWith('/events/')) {
                let id = request.url.split('/')[2];

                if (!id) {
                    response.writeHead(200,{"Content-Type":"application/json"});
                    response.end(JSON.stringify({ok:false, errorMessage:'Event id not found'}));
                } else if(tokenValid) {
                    response.writeHead(200,{"Content-Type":"application/json"});
                    Event.getEvento(id, idUser).then( resultado => {
                        resultado.getCreator().then( resultado => {
                            response.end(JSON.stringify({ok:true, result:resultado}));
                        }).catch( error => {
                            response.end(JSON.stringify({ok:false, errorMessage:error}));
                        });
                    }).catch( error => {
                        response.end(JSON.stringify({ok:false, errorMessage:error}));
                    });
                } else {
                    response.writeHead(403, {"Content-Type":"application/json"});
                    response.end(JSON.stringify({ok: false, errorMessage:'You are not logged in'}));
                }
                

            } else if(request.url.startsWith('/users/')) {

            } else if(request.url.startsWith('/users/event/')) {

            }
        break;
        case 'POST':

            if(request.url === '/auth/register') {
                request.on('data', chunk => {
                    body.push(chunk);
                }).on('end', () => {
                    body = Buffer.concat(body).toString();
                    let user = JSON.parse(body);

                    response.writeHead(200, {"Content-Type":"aplication/json"});                    
                    User.crearUsuario(user).then( resultado => {
                        response.end(JSON.stringify({ ok:true, result:resultado }));

                    }).catch( error => {
                        response.end(JSON.stringify({ ok:false, errorMessage:error }));

                    });

                })
            } else if(request.url === '/auth/login') {
                request.on('data', chunk => {
                    body.push(chunk);
                }).on('end', () => {
                    body = Buffer.concat(body).toString();
                    let user = JSON.parse(body);

                    response.writeHead(200, {"Content-Type":"aplication/json"});
                    User.validarUsuario(user).then( resultado => {
                        response.end(JSON.stringify({ok:true,token:resultado}));
                    }).catch( error => {
                        response.end(JSON.stringify({ok:false,errorMessage:error}));
                    });
                })
            } else if(request.url === '/events') {
                if(tokenValid) {
                    request.on('data', chunk => {
                        body.push(chunk);
                    }).on('end', () => {
                        body = Buffer.concat(body).toString();
                        body = JSON.parse(body);
                        
                        let image = body.image;
                        image = image.replace(/^data:image\/png;base64,/, "");
                        image = Buffer.from(image, 'base64');
                        
                        let date = new Date();
                        let nameFile = body.title + date + date.getUTCMilliseconds() + '.jpg';
                        fs.writeFileSync(nameFile, image);
                        body.image = nameFile;
                        body.creator = idUser;
                        
                        let event = new Event(body);
                        
                        response.writeHead(200, {"Content-Type":"aplication/json"});                    
                        event.crear().then( resultado => {
                            response.end(JSON.stringify({ok:true, result: resultado}));
                        }).catch( error => {
                            response.end(JSON.stringify({ok:false, errorMessage: error}));
                        });
                    })
                } else {
                    response.writeHead(403, {"Content-Type":"aplication/json"});                    
                    response.end(JSON.stringify({ok: false, errorMessage:'You are not logged in'}));
                }

            } else if(request.url.startsWith('/events/attend/')) {
                let id = request.url.split('/')[3];

                if (!id) {
                    response.writeHead(200,{"Content-Type":"application/json"});
                    response.end(JSON.stringify({ok:false, errorMessage:'Event id not found'}));
                } else if (tokenValid) {

                    request.on('data', chunk => {
                        body.push(chunk);
                    }).on('end', () => {
                        body = Buffer.concat(body).toString();

                        let tickets = body.number;
                        response.writeHead(200,{"Content-Type":"application/json"});
                        Event.attendEvent(id, idUser, tickets).then( resultado => {
                            response.end(JSON.stringify({ok:true, result:resultado}));
                        }).catch( error => {
                            response.end(JSON.stringify({ok:false, errorMessage:error}));
                        });
                    });

                } else {
                    response.writeHead(403, {"Content-Type":"application/json"});
                    response.end(JSON.stringify({ok: false, errorMessage:'You are not logged in'}));
                }
            
            }
        break;
        case 'PUT':

            if(request.url.startsWith('/events/')) {
                let id = request.url.split('/')[2];

                if (!id) {
                    response.writeHead(200,{"Content-Type":"application/json"});
                    response.end(JSON.stringify({ok:false, errorMessage:'Event id not found'}));
                } else if (tokenValid) {

                    request.on('data', chunk => {
                        body.push(chunk);
                    }).on('end', () => {
                        body = Buffer.concat(body).toString();
                        body = JSON.parse(body);

                        if(body.image) {
                            let image = body.image;
                            image = image.replace(/^data:image\/png;base64,/, "");
                            image = Buffer.from(image, 'base64');
                            
                            let date = new Date();
                            let nameFile = body.title + date + date.getUTCMilliseconds() + '.jpg';
                            fs.writeFileSync(nameFile, image);
                            body.image = nameFile;
                        }

                        response.writeHead(200,{"Content-Type":"application/json"});
                        Event.getEvento(id, idUser).then( evento => {
                            evento.modificarEvento(idUser, body).then (resultado => {
                                response.end(JSON.stringify({ok:true, result:resultado}));
                            }).catch(error => {
                            response.end(JSON.stringify({ok:false, errorMessage:error}));                                
                            })
                        }).catch( error => {
                            response.end(JSON.stringify({ok:false, errorMessage:error}));
                        });
                    });

                } else {
                    response.writeHead(403, {"Content-Type":"application/json"});
                    response.end(JSON.stringify({ok: false, errorMessage:'You are not logged in'}));
                }
            } else if(request.url === '/users/me') {

            } else if(request.url === '/users/me/avatar') {

            } else if(request.url === '/users/me/password') {

            }

        break;
        case 'DELETE':
            if( request.url.startsWith('/events/')) {

            }
        break;
        default:
        break;
    }
}).listen(8080);