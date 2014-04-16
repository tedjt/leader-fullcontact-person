var debug = require('debug')('leader:fullcontact:name');
var extend = require('extend');
var objCase = require('obj-case');
var flatnest = require('flatnest');
var defaults = require('defaults');
var names = require('people-names');
var Fullcontact = require('fullcontact');


/**
 * Create a new leader plugin.
 *
 * @params {String} apiKey
 * @returns {Object}
 */

module.exports = function (options) {
  return { fn: middleware(options), wait: wait};
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

function middleware (options) {
  if (typeof options == 'string') {
    options = {apiKey: options};
  }
  options = defaults(options || {}, {
    // default rate limit of once per second
    rateLimit: 1000
  });
  var fullcontactClients;
  if (typeof options.apiKey === 'string') {
    fullcontactClients = [new Fullcontact(options.apiKey)];
  } else {
    // assume its an array
    fullcontactClients = options.apiKey.map(function(k) {
      return new Fullcontact(k);
    });
  }
  var i = 0;
  var lastRequestTime = 0;
  return function fullcontactPersonApi (person, context, next) {
    // rate limit
    var now = Date.now();
    if (options.rateLimit) {
      var wait = options.rateLimit - now + lastRequestTime;
      if (wait > 0) {
        // set a timeout
        debug('Fullconcact person waiting for %d milliseconds', wait);
        return setTimeout(function() {
          fullcontactPersonApi(person, context, next);
        }, wait);
      }
    }
    lastRequestTime = now;
    var fullcontact = fullcontactClients[i % fullcontactClients.length];
    i++;
    var fcCallback = function(err, data) {
      console.log(err);
      console.log(data);
      if (err) return next();
      extend(true, context, {fullcontact: {person: data}});
      if (validateName(data, person)) {
        details(data, person);
      }
      next();
    };
    // search for both email and username. go with higher probablity
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