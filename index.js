var debug = require('debug')('leader:fullcontact:name');
var extend = require('extend');
var objCase = require('obj-case');
var flatnest = require('flatnest');
var names = require('people-names');
var Fullcontact = require('fullcontact');


/**
 * Create a new leader plugin.
 *
 * @params {String} apiKey
 * @returns {Object}
 */

module.exports = function (apiKey) {
  return { fn: middleware(apiKey), wait: wait};
};

module.exports.test = {
  validateName: validateName
};

/**
 * Create a Fullcontact name API leader plugin.
 *
 * @return {String} apiKey
 * @return {Function}
 */

function middleware (apiKey) {
  var fullcontact = new Fullcontact(apiKey);
  return function fullcontactPersonApi (person, context, next) {
    // search for both email and username. go with higher probablity
    var fcCallback = function(err, data) {
      if (err) return next();
      extend(true, context, {fullcontact: {person: data}});
      if (validateName(data, person)) {
        details(data, person);
      }
      next();
    };
    if (person.email) {
      debug('querying fullcontact with email %s ..', person.email);
      fullcontact.person.email(person.email, fcCallback);
    } else if (objCase(person, 'twitter.username')) {
      debug('querying fullcontact with twitter %s ..', person.twitter.username);
      fullcontact.person.twitter(person.twitter.username, fcCallback);
    } else if (objCase(person, 'facebook.username')) {
      debug('querying fullcontact with facebook %s ..', person.facebook.username);
      fullcontact.person.email(person.facebook.username, fcCallback);
    } else if (person.phone) {
      debug('querying fullcontact with phone %s ..', person.phone);
      fullcontact.person.email(person.phone, fcCallback);
    } else {
      return next();
    }
  };
}

function validateName(data, person) {
  return names.looseCompare(person, {
    name: objCase(data, 'contactInfo.fullName'),
    firstName: objCase(data, 'contactInfo.givenName'),
    lastName: objCase(data, 'contactInfo.familyName')
  });
}

/**
 * Copy the fullcontact person `data` details to the `person`.
 *
 * @param {Object} data
 * @param {Object} person
 */

function details (data, person) {
  // contact
  extend(true, person, remap(data, {
    'name': 'contactInfo.fullName',
    'firstName': 'contactInfo.givenName',
    'lastName': 'contactInfo.familyName',
    'websites': 'websites',
    'location': 'demographics.locationGeneral',
    'demographics': 'demographics'
  }));
  // social
  if (data.socialProfiles) {
    data.socialProfiles.forEach(function(p) {
      if (!person[p.type]) person[p.type] = {};
      extend(true, person[p.type], remap(p, {
        'headline': 'bio',
        'url': 'url',
        'followers': 'followers',
        'following': 'following',
        'username': 'username'
      }));
    });
  }
  // skipping photos for now.
}

function remap(obj, keysObj) {
  var r = {};
  Object.keys(keysObj).forEach(function(k) {
    var v = objCase(obj, keysObj[k]);
    if (v) {
      flatnest.replace(r, k, v, true);
    }
  });
  return r;
}

/**
 * Wait until we have a valid fullcontact index to lookup.
 *
 * @param {Object} context
 * @param {Object} person
 * @return {Boolean}
 */

function wait (person, context) {
  return person.email || 
    objCase(person, 'twitter.username') || 
    objCase(person, 'facebook.username') || 
    person.phone;
}