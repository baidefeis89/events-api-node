const conexion = require('./bdconfig');

module.exports = class Event {
    constructor(eventJson) {
        this.id = eventJson.id,
        this.creator = eventJson.creator
        this.title = eventJson.title,
        this.description = eventJson.description,
        this.date = eventJson.date,
        this.price = eventJson.price,
        this.lat = eventJson.lat,
        this.lng = eventJson.lng,
        this.address = eventJson.address,
        this.image = eventJson.image,
        this.numAttend = eventJson.numAttend,
        this.distance = eventJson.distance,
        this.mine = eventJson.mine,
        this.attend = eventJson.attend
    }

    crear() {
        return new Promise( (resolve, reject) => {
            let evento = {
                creator: this.creator,
                title: this.title,
                description: this.description,
                date: this.date,
                price: this.price,
                lat: this.lat,
                lng: this.lng,
                address: this.address,
                image: this.image
            };
            conexion.query('INSERT INTO event SET ?', evento, (error, resultado, campos) => {
                if (error) return reject(error);
                resolve(resultado.insertId);
            });
        });
    }

    static listarEventos(idUser) {
        return new Promise( (resolve, reject) => {
            conexion.query('SELECT event.*, haversine(user.lat, user.lng, event.lat, event.lng) as distance, ' + 
                                '(SELECT COUNT(*) FROM user_attend_event ' + 
                                'WHERE event.id = user_attend_event.event AND user_attend_event.user = ' + idUser + ') as attend ' +
                            'FROM event, user WHERE user.id = ' + idUser + ' GROUP BY event.id', (error, resultado, campos) => {
                if (error) return reject(error);
                resolve(resultado.map( e => {
                    e.mine = e.creator == idUser;
                    e.attend = e.attend == 1;
                    return new Event(e);
                }));
            });
        });
    }

    getCreator() {
        return new Promise( (resolve, reject) => {
            conexion.query('SELECT id, name, email, avatar FROM user WHERE id=' + this.creator + ' GROUP BY id', (error, resultado, campos) => {
                if (error) return reject(error);
                this.creator = {};
                this.creator.id = resultado[0].id;
                this.creator.name = resultado[0].name;
                this.creator.email = resultado[0].email;
                this.creator.avatar = resultado[0].avatar;
                resolve(this);
            });
        });
    
    }

    static listarEventosDe(idUser) {
        return new Promise( (resolve, reject) => {
            conexion.query('SELECT event.*, haversine(user.lat, user.lng, event.lat, event.lng) as distance, ' + 
                                '(SELECT COUNT(*) FROM user_attend_event ' + 
                                'WHERE event.id = user_attend_event.event AND user_attend_event.user = ' + idUser + ') as attend ' +
                            'FROM event, user WHERE event.creator=' + idUser + ' AND user.id = ' + idUser + ' GROUP BY event.id', (error, resultado, campos) => {
                if (error) return reject(error);
                resolve(resultado.map( e => {
                    e.mine = e.creator == idUser;
                    e.attend = e.attend == 1;
                    return new Event(e);
                }));
            });
        });
    }

    static listarEventosAsiste(idUser) {
        return new Promise( (resolve, reject) => {
            conexion.query('SELECT event.*, haversine(user.lat, user.lng, event.lat, event.lng) as distance ' + 
                            'FROM event, user WHERE event.id IN (SELECT event FROM user_attend_event WHERE user=' + idUser + ') AND user.id=' + idUser + ' GROUP BY event.id', (error, resultado, campos) => {
                if (error) return reject(error);
                resolve(resultado.map( e => {
                    e.mine = e.creator == idUser;
                    e.attend = true;
                    return new Event(e);
                }));
            });
        });
    }

    static getEvento(idEvento, idUser) {
        return new Promise( (resolve, reject) => {
            conexion.query('SELECT event.*, haversine(user.lat, user.lng, event.lat, event.lng) as distance, ' + 
                                '(SELECT COUNT(*) FROM user_attend_event ' + 
                                'WHERE event.id = user_attend_event.event AND user_attend_event.user = ' + idUser + ') as attend ' +
                            'FROM event, user WHERE event.id="' + idEvento + '" AND user.id = "' +  idUser + '" GROUP BY event.id', (error, resultado, campos) => {
                if (error) return reject(error);
                if(resultado.length == 0) return reject('This event does not exit');
                let evento = new Event(resultado[0]);
                evento.mine = evento.creator == idUser;
                evento.attend = evento.attend == 1;
                resolve(evento);
            });
        });
    }

    modificarEvento(idUser, evento) {
        return new Promise( (resolve, reject) => {
            conexion.query(`UPDATE event SET ? WHERE id = ${this.id} AND creator = ${idUser}`, evento, (error, resultado, campos) => {
                if (error) return reject(error);
                if (resultado.affectedRows < 1) return reject('you can not edit this event');
                resolve('Event has been updated');
            });
        });
    }

    static borrarEvento(idEvento, idUser) {
        return new Promise( (resolve, reject) => {
            conexion.query(`DELETE FROM event WHERE id = ${idEvento} AND creator = ${idUser}`, (error, resultado, campos) => {
                if (error) return reject(error);
                if (resultado.affectedRows < 1) return reject('You can not delete this event');
                resolve('Event has been deleted');
            });
        });
    }

    static attendEvent(idEvento, idUser, tickets = 1) {
        let data = {
            user: idUser,
            event: idEvento,
            tickets: tickets
        }
        return new Promise( (resolve, reject) => {
            conexion.query('INSERT INTO user_attend_event SET ?', data, (error, resultado, campos) => {
                if (error) return reject(error);
                if (resultado.affectedRows < 1) return reject('Error')
                resolve('Attend saved');
            });
        });
    }
}
