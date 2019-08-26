const coreServices = require('./services');

test('should have ContactProtocolTypes', () => {
  expect(coreServices.service.ContactProtocolTypes).toBeDefined();
});
