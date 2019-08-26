# nact-query

## API

### RESTClient

  https://addons.mozilla.org/en-US/firefox/addon/restclient/

### GET contacts

  curl -X GET -i http://localhost:3000/api/contacts

  curl -X GET -i http://localhost:3000/api/contacts/:id

### POST contacts

  curl -X POST -H 'Content-Type: application/json' -i http://localhost:3000/api/contacts --data '{"name": "Test", "surname": "User"}'

### PATCH contacts

  curl -X PATCH -H 'Content-Type: application/json' -i http://localhost:3000/api/contacts/:id --data '{"company": "Bianco Royal"}'

### Hints

* the :id has to be replaced with the UUID of a contact record

## License
MIT - [Klaus Landsdorf](http://bianco-royal.de/)