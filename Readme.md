
# leader-fullcontact-person

  A [leader](https://github.com/ivolo/leader) plugin for the [Fullcontact](https://fullcontact.com/) name API. Get a Fullcontact API key [here](http://developer.fullcontact.com/).

## Example

```js
var Leader = require('leader');
var FullcontactPerson = require('leader-fullcontact-person');

var leader = Leader()
  .use(FullcontactName('FULLCONTACT_API_KEY'))
  .populate({ email: 'ted.j.tomlinson@gmail.com'}, function(err, person) {
    // ..
});
```

It will search Fullcontact and populate information in the person
based on the response.

```js
{
  // ..
  name: 'Ted Tomlinson',
  firstName: 'Ted',
  lastName: 'Tomlinson'
  websites: [
    {url: 'http:///'}
  ],
  demographics: {
    gender: 'Male',
    location: 'San Fransciso'
  },
  linkedin: {
    headline: 'my twitter bio',
    url: 'http://asdf/'
  },
  twitter: {
    bio: 'my twitter bio',
    followers: 4125,
    following: 1234,
    url: 'http://asdf/',
    username: 'tedtomlinson1'
  },
  facebook: {
    followers: 960,
    following: 960,
    url: 'https://www.facebook.com/john.wang2',
    username: 'john.wang2'
  },
  klout: {
    url: 'http://www.klout.com/user/johnjianwang',
    username: 'johnjianwang',
  },
  googleplus: {
    url: 'https://plus.google.com/104588756277285057278',
  }
  photos: [
    {
      typeId: 'facebook',
      url: 'htpp...///'
    }
  ]
}
```

## API

#### FullcontactPerson(apiKey)

  Return a Leader plugin for the Fullcontact person API.
