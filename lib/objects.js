'use strict';

let rpc = require('./rpc');
let util = require('./util');

let idKey = util.idKey;
let realmKey = util.realmKey;
let registeredConstructors = {};

exports.create = create;
exports.registerConstructors = registerConstructors;

function create(realmId, info) {
    let schema = info.schema;
    let constructor = (registeredConstructors[realmId] || {})[schema.name];
    let object = constructor ? Object.create(constructor.prototype) : {};
    let props = {};

    object[realmKey] = realmId;
    object[idKey] = info.id;

    for (let prop of schema.properties) {
        let name = prop.name;

        props[name] = {
            get: getterForProperty(name),
            set: setterForProperty(name),
        };
    }

    Object.defineProperties(object, props);

    return object;
}

function registerConstructors(realmId, constructors) {
    registeredConstructors[realmId] = constructors;
}

function getterForProperty(name) {
    return function() {
        return rpc.getObjectProperty(this[realmKey], this[idKey], name);
    };
}

function setterForProperty(name) {
    return function(value) {
        rpc.setObjectProperty(this[realmKey], this[idKey], name, value);
    };
}