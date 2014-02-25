
var assert = require('assert');
var should = require('should');
var plugin = require('..');

describe('leader-fullcontact-name', function () {

  var fullcontactPerson = plugin('997a4791ff2b8690');

  it('should wait if theres no email', function () {
    var context = {}, person = {};
    assert(!fullcontactPerson.wait(person, context));
  });

  it('should not wait if there is a company name', function () {
    var person = { email: 'zumbino@gmail.com'};
    var context = {};
    assert(fullcontactPerson.wait(person, context));
  });

  it('should be able to resolve a valid fullcontact person for zumbino@gmail.com', function (done) {
    var person = { email: 'zumbino@gmail.com' };
    var context = {};
    fullcontactPerson.fn(person, context, function (err) {
      if (err) return done(err);
      assert(person);
      person.name.should.equal('Ted Tomlinson');
      person.firstName.should.equal('Ted');
      person.lastName.should.equal('Tomlinson');
      person.linkedin.url.should.equal('https://www.linkedin.com/pub/ted-tomlinson/17/a13/404');
      done();
    });
  });
});
