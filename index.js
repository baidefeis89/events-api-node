const http = require('http');
const https = require('https');
const fs = require('fs');

const Event = require('./modelo/event');
const User = require('./modelo/user');

let guardarImagen = (url, name) => {
    https.request(url)
    .on('response', function(res) {
        let body = '';
        res.setEncoding('binary');
        res.on('data', function(chunk) {
            body += chunk
        }).on('end', function() {
            fs.writeFileSync('./img/users/' + name, body, 'binary');
        });
    })
    .end();
}

http.createServer( (request, response) => {
    let token = request.headers['authorization'];
    let tokenValid = User.validarToken(token);
    let login = '';
    if (tokenValid) idUser = tokenValid.id;
    let body = [];    

    response.setHeader('Content-Type', 'application/json');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Request-Method', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    response.setHeader('Access-Control-Allow-Headers', '*');
    
    //response.setHeader("Access-Control-Allow-Origin", "*");
    //response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    switch(request.method) {
        case 'OPTIONS':
            response.end();
        break;
        case 'GET':
            if(request.url === '/auth/token') {
                response.writeHead(200, {"Content-Type":"application/json"});

                if(tokenValid) response.end(JSON.stringify({ok: true}))
                else response.end(JSON.stringify({ok: false}));

            } else if(request.url === '/auth/google') {
                response.writeHead(200, {"Content-Type":"application/json"});

                https.request('https://www.googleapis.com/plus/v1/people/me?access_token='+token)
                .on('response', function(res) {
                    body = '';
                    res.on('data', function(chunk) {
                        body += chunk;
                    }).on('end', function() {
                        let datos = JSON.parse(body);
                        datos.avatar = new Date().getTime() + '.jpg';
                        User.crearUsuarioGoogle(datos).then( resultado => {
                            response.end(JSON.stringify({ok: true, token: resultado.token}));
                            if (resultado.new) guardarImagen(datos.image.url, datos.avatar);
                        }).catch( error => {
                            response.end(JSON.stringify({ok:false, error:error}));
                        });
                    });
                }).end();

            } else if(request.url === '/auth/facebook') {
                https.request('https://graph.facebook.com/v2.11/me?fields=id,name,email,picture&access_token=' + token)
                .on('response', function(res) {
                    body = '';
                    res.on('data', function(chunk) {
                    body += chunk
                    }).on('end', function() {
                        let datos = JSON.parse(body);
                        datos.avatar = new Date().getTime() + '.jpg';
                        User.crearUsuarioFacebook(datos).then( resultado => {
                            response.end(JSON.stringify({ok:true, token:resultado.token}));
                            if (resultado.new) guardarImagen(datos.picture.data.url, datos.avatar);
                        }).catch( error => {
                            response.end(JSON.stringify({ok: false, error:error}));
                        });
                    });
                }).end(); 

            } else if(request.url === '/events') {
                if(tokenValid) {
                    response.writeHead(200,{"Content-Type":"application/json"});
                    Event.listarEventos(idUser).then( resultado => {
                        return Promise.all( resultado.map( e => e.getCreator() )).then( result => {
                            response.end(JSON.stringify({ok: true, events:result}));
                        }).catch( error => {
                            response.end(JSON.stringify({ok:false, error: error}))
                        });
                    }).catch( error => {
                        response.end(JSON.stringify({ok: false, error: error}));
                    })
                } else {
                    response.writeHead(403, {"Content-Type":"application/json"});
                    response.end(JSON.stringify({ok:false, error:'You are not logged in'}))
                }

            } else if(request.url === '/events/mine') {
                if(tokenValid) {
                    response.writeHead(200,{"Content-Type":"application/json"});
                    Event.listarEventosDe(idUser).then( resultado => {
                        response.end(JSON.stringify({ok:true, events:resultado}));
                    }).catch( error => {
                        response.end(JSON.stringify({ok:false, error:error}));
                    });
                } else {
                    response.writeHead(403, {"Content-Type":"application/json"});
                    response.end(JSON.stringify({ok: false, error:'You are not logged in'}));
                }

            } else if(request.url === '/events/attend') {
                if(tokenValid) {
                    response.writeHead(200,{"Content-Type":"application/json"});
                    Event.listarEventosAsiste(idUser).then( resultado => {
                        return Promise.all( resultado.map( e => e.getCreator() )).then( result => {
                            response.end(JSON.stringify({ok: true, events:result}));
                        }).catch( error => {
                            response.end(JSON.stringify({ok:false, error: error}))
                        });
                    }).catch( error => {
                        response.end(JSON.stringify({ok:false, error:error}));
                    });
                } else {
                    response.writeHead(403, {"Content-Type":"application/json"});
                    response.end(JSON.stringify({ok: false, error:'You are not logged in'}));
                }

            } else if(request.url.startsWith('/events/')) {
                let id = request.url.split('/')[2];

                if (!id) {
                    response.writeHead(200,{"Content-Type":"application/json"});
                    response.end(JSON.stringify({ok:false, error:'Event id not found'}));
                } else if(tokenValid) {
                    response.writeHead(200,{"Content-Type":"application/json"});
                    Event.getEvento(id, idUser).then( resultado => {
                        resultado.getCreator().then( resultado => {
                            response.end(JSON.stringify({ok:true, event:resultado}));
                        }).catch( error => {
                            response.end(JSON.stringify({ok:false, error:error}));
                        });
                    }).catch( error => {
                        response.end(JSON.stringify({ok:false, error:error}));
                    });
                } else {
                    response.writeHead(403, {"Content-Type":"application/json"});
                    response.end(JSON.stringify({ok: false, error:'You are not logged in'}));
                }
                
            } else if(request.url === '/users/me') {
                if(tokenValid) {
                    response.writeHead(200,{"Content-Type":"application/json"});

                    User.getUser(idUser).then( resultado => {
                        response.end(JSON.stringify({ok:true, result:resultado}));
                    }).catch( error => {
                        response.end(JSON.stringify({ok:false, error:error}));
                    })
                } else {
                    response.writeHead(403, {"Content-Type":"application/json"});
                    response.end(JSON.stringify({ok:false, error:'You are not logged in'}));
                }

            } else if(request.url.startsWith('/users/event/')) {
                let id = request.url.split('/')[3];

                if (!id) {
                    response.writeHead(200,{"Content-Type":"application/json"});
                    response.end(JSON.stringify({ok:false, error:'Event id not found'}));
                } else if(tokenValid) {
                    response.writeHead(200,{"Content-Type":"application/json"});
                    User.getUsersAttend(id).then( resultado => {
                        response.end(JSON.stringify({ok:true, result:resultado}));
                    }).catch( error => {
                        response.end(JSON.stringify({ok:false, error:error}));
                    });
                } else {
                    response.writeHead(403, {"Content-Type":"application/json"});
                    response.end(JSON.stringify({ok: false, error:'You are not logged in'}));
                }

            } else if (request.url.startsWith('/users/')) {
                let id = request.url.split('/')[2];

                if (!id) {
                    response.writeHead(200,{"Content-Type":"application/json"});
                    response.end(JSON.stringify({ok:false, error:'User id not found'}));
                } else if(tokenValid) {
                    response.writeHead(200,{"Content-Type":"application/json"});
                    User.getUser(id).then( resultado => {
                        response.end(JSON.stringify({ok:true, result:resultado}));
                    }).catch( error => {
                        response.end(JSON.stringify({ok:false, error:error}));
                    });
                } else {
                    response.writeHead(403, {"Content-Type":"application/json"});
                    response.end(JSON.stringify({ok: false, error:'You are not logged in'}));
                }

            } else if (request.url.startsWith('/img/events/')) {
                if (fs.existsSync('.' + request.url)) {
                    response.writeHead(200, {"Content-Type":"image/jpg"});
                    fs.readFile('.' + request.url, (error, data) => {
                        response.end(data);
                    });
                } else {
                    response.end();
                }

            } else {
                response.writeHead(404, {"Content-Type":"application/json"});
                response.end(JSON.stringify({ok: false, error: 'URI not found'}));
            }
        break;
        case 'POST':

            if(request.url === '/auth/register') {
                request.on('data', chunk => {
                    body.push(chunk);
                }).on('end', () => {
                    body = Buffer.concat(body).toString();
                    let user = JSON.parse(body);

                    let avatar = user.avatar;
                        avatar = avatar.replace(/^data:image\/png;base64,/, "");
                        avatar = avatar.replace(/^data:image\/jpg;base64,/, "");
                        avatar = avatar.replace(/^data:image\/jpeg;base64,/, "");
                        
                        avatar = Buffer.from(avatar, 'base64');
                        
                        let nameFile = new Date().getTime() + '.jpg';
                        fs.writeFileSync('./img/users/' + nameFile, avatar);
                        user.avatar = user.avatar ? nameFile : null;

                    response.writeHead(200, {"Content-Type":"application/json"});                    
                    User.crearUsuario(user).then( resultado => {
                        response.end(JSON.stringify({ ok:true, result:resultado }));

                    }).catch( error => {
                        response.end(JSON.stringify({ ok:false, error:error }));
                        fs.unlink('./img/users/' + nameFile, () => {});
                    });
                });

            } else if(request.url === '/auth/login') {
                request.on('data', chunk => {
                    body.push(chunk);
                }).on('end', () => {
                    body = Buffer.concat(body).toString();
                    let user = JSON.parse(body);

                    response.writeHead(200, {"Content-Type":"application/json"});
                    User.validarUsuario(user).then( resultado => {
                        response.end(JSON.stringify({ok:true,token:resultado}));
                    }).catch( error => {
                        response.end(JSON.stringify({ok:false,error:error}));
                    });
                });

            } else if(request.url === '/events') {
                if(tokenValid) {
                    request.on('data', chunk => {
                        body.push(chunk);
                    }).on('end', () => {
                        body = Buffer.concat(body).toString();
                        body = JSON.parse(body);
                        
                        let image = body.image;

                        if (image) {
                            image = image.replace(/^data:image\/png;base64,/, "");
                            image = image.replace(/^data:image\/jpg;base64,/, "");
                            image = image.replace(/^data:image\/jpeg;base64,/, "");
                            
                            image = Buffer.from(image, 'base64');
                            
                            let nameFile = new Date().getTime() + '.jpg';
                            fs.writeFileSync('./img/events/' + nameFile, image);
                            body.image = nameFile;
                            body.creator = idUser;
                            
                            let event = new Event(body);
                            
                            response.writeHead(200, {"Content-Type":"application/json"});                    
                            event.crear().then( resultado => {
                                response.end(JSON.stringify({ok:true, result: resultado}));
                            }).catch( error => {
                                response.end(JSON.stringify({ok:false, error: error}));
                                fs.unlink('./img/events/' + nameFile, () => {});
                            });
                        } else {
                            response.writeHead(200, {"Content-Type":"application/json"});
                            response.end(JSON.stringify({ok: false, error:'Image is required'}));
                        }
                    })
                } else {
                    response.writeHead(403, {"Content-Type":"application/json"});                    
                    response.end(JSON.stringify({ok: false, error:'You are not logged in'}));
                }

            } else if(request.url.startsWith('/events/attend/')) {
                let id = request.url.split('/')[3];

                if (!id) {
                    response.writeHead(200,{"Content-Type":"application/json"});
                    response.end(JSON.stringify({ok:false, error:'Event id not found'}));
                } else if (tokenValid) {

                    request.on('data', chunk => {
                        body.push(chunk);
                    }).on('end', () => {
                        body = JSON.parse(Buffer.concat(body).toString());

                        let tickets = body.number;
                        response.writeHead(200,{"Content-Type":"application/json"});
                        Event.attendEvent(id, idUser, tickets).then( resultado => {
                            response.end(JSON.stringify({ok:true, result:resultado}));
                        }).catch( error => {
                            response.end(JSON.stringify({ok:false, error:error}));
                        });
                    });

                } else {
                    response.writeHead(403, {"Content-Type":"application/json"});
                    response.end(JSON.stringify({ok: false, error:'You are not logged in'}));
                }
            
            } else {
                response.writeHead(404, {"Content-Type":"application/json"});
                response.end(JSON.stringify({ok: false, error: 'URI not found'}));
            }
        break;
        case 'PUT':

            if(request.url.startsWith('/events/')) {
                let id = request.url.split('/')[2];

                if (!id) {
                    response.writeHead(200,{"Content-Type":"application/json"});
                    response.end(JSON.stringify({ok:false, error:'Event id not found'}));
                } else if (tokenValid) {

                    request.on('data', chunk => {
                        body.push(chunk);
                    }).on('end', () => {
                        body = Buffer.concat(body).toString();
                        body = JSON.parse(body);

                        if(body.image) {
                            let image = body.image;

                            image = image.replace(/^data:image\/png;base64,/, "");
                            image = image.replace(/^data:image\/jpg;base64,/, "");
                            image = image.replace(/^data:image\/jpeg;base64,/, "");

                            image = Buffer.from(image, 'base64');
                        
                            let nameFile = new Date().getTime() + '.jpg';
                            fs.writeFileSync('./img/events/' + nameFile, image);
                            body.image = nameFile;
                        }

                        response.writeHead(200,{"Content-Type":"application/json"});
                        Event.getEvento(id, idUser).then( evento => {
                            evento.modificarEvento(idUser, body).then (resultado => {
                                response.end(JSON.stringify({ok:true, result:resultado}));
                            }).catch(error => {
                            response.end(JSON.stringify({ok:false, error:error}));                                
                            })
                        }).catch( error => {
                            response.end(JSON.stringify({ok:false, error:error}));
                        });
                    });

                } else {
                    response.writeHead(403, {"Content-Type":"application/json"});
                    response.end(JSON.stringify({ok: false, error:'You are not logged in'}));
                }

            } else if(request.url === '/users/me') {
                if (tokenValid) {
                    request.on('data', chunk => {
                        body.push(chunk);
                    }).on('end', () => {
                        body = Buffer.concat(body).toString();
                        body = JSON.parse(body);
                        User.getUser(idUser).then( usuario => {
                            usuario.modificarEmailUser(body).then( resultado => {
                                response.end(JSON.stringify({ok:true, result:resultado}));
                            }).catch( error => {
                                response.end(JSON.stringify({ok:false, error:error}));
                            });
                        });
                    });
                } else {
                    response.writeHead(403, {"Content-Type":"application/json"});
                    response.end(JSON.stringify({ok: false, error:'You are not logged in'}));
                }

            } else if(request.url === '/users/me/avatar') {
                if (tokenValid) {
                    request.on('data', chunk => {
                        body.push(chunk);
                    }).on('end', () => {
                        body = Buffer.concat(body).toString();
                        body = JSON.parse(body);

                        if(body.avatar) {
                            let avatar = body.avatar;
                            avatar = avatar.replace(/^data:image\/png;base64,/, "");
                            avatar = avatar.replace(/^data:image\/jpg;base64,/, "");
                            avatar = avatar.replace(/^data:image\/jpeg;base64,/, "");                            
                            avatar = Buffer.from(avatar, 'base64');
                            
                            let nameFile = new Date().getTime() + '.jpg';
                            fs.writeFileSync('./img/users/' + nameFile, avatar);
                            body.avatar = nameFile;
                        }

                        User.getUser(idUser).then( usuario => {
                            usuario.modificarAvatar(body).then( resultado => {
                                response.end(JSON.stringify({ok:true, result:resultado}));
                            }).catch( error => {
                                response.end(JSON.stringify({ok:false, error:error}));
                            });
                        });
                    });
                } else {
                    response.writeHead(403, {"Content-Type":"application/json"});
                    response.end(JSON.stringify({ok: false, error:'You are not logged in'}));
                }

            } else if(request.url === '/users/me/password') {
                if (tokenValid) {
                    request.on('data', chunk => {
                        body.push(chunk);
                    }).on('end', () => {
                        body = Buffer.concat(body).toString();
                        body = JSON.parse(body);

                        User.getUser(idUser).then( usuario => {
                            usuario.modificarPassword(body).then( resultado => {
                                response.end(JSON.stringify({ok:true, result:resultado}));
                            }).catch( error => {
                                response.end(JSON.stringify({ok:false, error:error}));
                            });
                        });
                    });
                } else {
                    response.writeHead(403, {"Content-Type":"application/json"});
                    response.end(JSON.stringify({ok: false, error:'You are not logged in'}));
                }
            } else {
                response.writeHead(404, {"Content-Type":"application/json"});
                response.end(JSON.stringify({ok: false, error: 'URI not found'}));
            }

        break;
        case 'DELETE':
            if( request.url.startsWith('/events/')) {
                let id = request.url.split('/')[2];

                if (!id) {
                    response.writeHead(200,{"Content-Type":"application/json"});
                    response.end(JSON.stringify({ok:false, error:'Event id not found'}));
                } else if (tokenValid) {

                    request.on('data', chunk => {
                        body.push(chunk);
                    }).on('end', () => {
                        body = Buffer.concat(body).toString();

                        response.writeHead(200,{"Content-Type":"application/json"});
                        Event.borrarEvento(id, idUser).then( resultado => {
                            response.end(JSON.stringify({ok:true, result:resultado}));
                        }).catch( error => {
                            response.end(JSON.stringify({ok:false, error:error}));
                        });
                    });

                } else {
                    response.writeHead(403, {"Content-Type":"application/json"});
                    response.end(JSON.stringify({ok: false, error:'You are not logged in'}));
                }
            } else {
                response.writeHead(404, {"Content-Type":"application/json"});
                response.end(JSON.stringify({ok: false, error: 'URI not found'}));
            }
        break;
        default:
            response.writeHead(405, {"Content-Type":"application/json"});
            response.end(JSON.stringify({ok: false, error: 'Request method not allowed'}));
        break;
    }
}).listen(8080);
