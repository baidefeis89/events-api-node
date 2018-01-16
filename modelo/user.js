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

    static getUser(idUser) {
        return new Promise( (resolve, reject) => {
            conexion.query(`SELECT id, name, email, avatar, lat, lng FROM user WHERE id = ${idUser}`, (error, resultado, campos) => {
                if (error) return reject(error);
                let user = new User(resultado[0]);
                resolve(user);
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

    static validarToken(token) {
        try {
            let resultado = jwt.verify(token, secreto);
            return resultado;
        } catch (e) {
            return false;
        }
    }
}