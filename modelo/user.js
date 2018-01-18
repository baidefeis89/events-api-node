const conexion = require('./bdconfig');
const jwt = require('jsonwebtoken');
const md5 = require('md5');

const secreto = 'DespliegueNode';

module.exports = class User {
    constructor(userJson) {
        this.id = userJson.id,
        this.name = userJson.name,
        this.email = userJson.email,
        this.password = userJson.password,
        this.avatar = userJson.avatar,
        this.lat = userJson.lat,
        this.lng = userJson.lng
    }

    static crearUsuario(usuarioJSON) {
        return new Promise( (resolve, reject) => {
            if (!usuarioJSON.password) return reject('Password is required');
            if (!usuarioJSON.email) return reject('Email is required');
            if (!usuarioJSON.name) return reject('Name is required');

            usuarioJSON.password = md5(usuarioJSON.password);

            conexion.query('INSERT INTO user set ?', usuarioJSON, (error, resultado, campose) => {
                if (error) {
                    if (error.sqlState === "23000") return reject('This email is already registered');
                    return reject(error);
                }

                if(resultado.affectedRows < 1) return reject('Error saving');
                else resolve(resultado.insertId);
                //else resolve(resultado);
            });
        });
    }

    static crearUsuarioGoogle(data) {
        let datos = {
            id_google: data.id,
            email: data.emails[0].value,
            name: data.displayName,
            avatar: data.nickname + data.id + '.png'
        }

        return new Promise( (resolve, reject) => {
            this.userExist(datos.id_google).then( resultado => {
                if (!resultado) {
                    conexion.query('INSERT INTO user set ?',datos, (error, resultado, campos) => {
                        if (error) return reject(error);
                        if (resultado.affectedRows < 1) return reject('Create user failed');
                        resolve(this.generarToken(datos.email, datos.id));
                    });
                } else {
                    resolve(this.generarToken(resultado.email, resultado.id));
                }
            });
        }) 
    }

    static userExist(id) {
        return new Promise( (resolve, reject) => {
            conexion.query(`SELECT * FROM user WHERE id_facebook = ${id} OR id_google = ${id}`, (error, resultado, campos) => {
                if (error) return reject(error);
                if (resultado[0]) resolve(new User(resultado[0]))
                resolve(false);
            })
        })
    }

    static getUser(idUser) {
        return new Promise( (resolve, reject) => {
            conexion.query(`SELECT id, name, email, avatar, lat, lng FROM user WHERE id = "${idUser}"`, (error, resultado, campos) => {
                if (error) return reject(error);
                if (resultado.length < 1) return reject('User not found');
                let user = new User(resultado[0]);
                resolve(user);
            });
        });
    }

    static getUsersAttend(idEvent) {
        return new Promise( (resolve, reject) => {
            conexion.query(`SELECT id, name, email, avatar FROM user, user_attend_event WHERE id = user AND event = ${idEvent}`, (error, resultado, campos) => {
                if (error) return reject(error);
                if (resultado.length < 1) resolve([]);
                resolve( resultado.map( user => new User(user) ));
            });
        });
    }

    static validarUsuario(usuarioJSON) {
        return new Promise( (resolve, reject) => {
            conexion.query('SELECT password, id FROM user WHERE email="' + usuarioJSON.email + '";', (error, resultado, campos) => {

                if (error) return reject(error);

                if ( resultado.length <1 || resultado[0].password != md5(usuarioJSON.password)) {
                    return reject('Usuario o contraseña incorrecto');
                } else {
                    resolve(this.generarToken(usuarioJSON.email, resultado[0].id));
                }
            });
        });
    }

    static generarToken(email, id) {
        let token = jwt.sign({email: email, id:id}, secreto, {expiresIn: '1 day'});
        return token;
    }

    modificarEmailUser(data) {
        let datos = {
            email: data.email ? data.email : this.email,
            name: data.name ? data.name : this.name
        }

        return new Promise( (resolve, reject) => {
            conexion.query('UPDATE user SET ? WHERE id='+this.id,datos, (error, resultado, campos) => {
                if (error) return reject(error);
                if (resultado.affectedRows < 1) return reject('Update error');
                resolve(resultado);
            });
        });
    }

    modificarAvatar(data) {
        let datos = {
            avatar:  data.avatar ? data.avatar : 'default.png'
        }
        return new Promise( (resolve, reject) => {
            conexion.query('UPDATE user SET ? WHERE id='+this.id,datos, (error, resultado, campos) => {
                if (error) return reject(error);
                if (resultado.affectedRows < 1) return reject('Avatar update error');
                resolve(resultado);
            });
        });
    }

    modificarPassword(data) {
        let datos = {
            password: data.password === data.password2 ? data.password : null
        }
        return new Promise( (resolve, reject) => {
            if( datos.password ) {
                datos.password = md5(datos.password);
                conexion.query('UPDATE user SET ? WHERE id='+this.id, datos, (error, resultado, campos) => {
                    if (error) return reject(error);
                    if (resultado.affectedRows < 1) return reject('Password update error');
                    resolve(resultado);
                });
            } else {
                return reject('Password is not valid');
            }
        });
    }

    static validarToken(token) {
        try {
            let resultado = jwt.verify(token, secreto);
            return resultado;
        } catch (e) {
            return false;
        }
    }
}