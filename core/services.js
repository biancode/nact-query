/* The MIT License

Copyright (C) 2019 Bianco Royal Software Innovations(R) 
      Inh. Klaus Landsdorf (http://bianco-royal.de/)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

"use strict";

const uuidv4 = require('uuid/v4');
const nact = require('nact');
const nactSystem = nact.start();

let initNactState = { contacts: {} };
let nactState = new Object(initNactState);

const ContactProtocolTypes = {
  GET_CONTACTS: 'GET_CONTACTS',
  GET_CONTACT: 'GET_CONTACT',
  UPDATE_CONTACT: 'UPDATE_CONTACT',
  REMOVE_CONTACT: 'REMOVE_CONTACT',
  CREATE_CONTACT: 'CREATE_CONTACT',
  SUCCESS: 'SUCCESS',
  NOT_FOUND: 'NOT_FOUND',
  EMPTY: 'EMPTY',
  OPERATION_NOT_FOUND: 'OPERATION_NOT_FOUND'
};

const stateIsReady = (state) => {
  if (!state.contacts) {
    console.error('renew broken state for storing contacts');
    state = new Object(initNactState);
    nact.dispatch(
      ctx.sender,
      { type: ContactProtocolTypes.EMPTY, payload: Object.values(contacts) },
      ctx.self
    );
  }
  return state;
}

const sendAllContacts = (contacts, ctx) => {
  nact.dispatch(
    ctx.sender,
    { type: ContactProtocolTypes.SUCCESS, payload: Object.values(contacts) },
    ctx.self
  );
}

const addContactToState = (state, ctx, contactData) => {
  const newContact = { id: uuidv4(), ...contactData };
  state.contacts = { ...state.contacts, [newContact.id]: newContact };
  nact.dispatch(ctx.sender, { type: ContactProtocolTypes.SUCCESS, payload: newContact });
  return state;
}

const sendOperationNotFound = (ctx, requestType) => {
  nact.dispatch(
    ctx.sender,
    { type: ContactProtocolTypes.OPERATION_NOT_FOUND, payload: requestType },
    ctx.self
  );
}

const sendContactNotFound = (ctx, contactId) => {
  nact.dispatch(
    ctx.sender,
    { type: ContactProtocolTypes.NOT_FOUND, contactId: contactId },
    ctx.self
  );
}

const handleExpliciteRequest = (state, ctx, requestType, contact, newData) => {
  switch (requestType) {
    case ContactProtocolTypes.GET_CONTACT:
      nact.dispatch(ctx.sender, { type: ContactProtocolTypes.SUCCESS, payload: contact });

    case ContactProtocolTypes.REMOVE_CONTACT:
      state.contacts = { ...state.contacts, [contact.id]: undefined };
      nact.dispatch(ctx.sender, { type: ContactProtocolTypes.SUCCESS, payload: contact });

    case ContactProtocolTypes.UPDATE_CONTACT:
      const updatedContact = { ...contact, ...newData };
      state.contacts = { ...state.contacts, [updatedContact.id]: updatedContact };
      nact.dispatch(ctx.sender, { type: ContactProtocolTypes.SUCCESS, payload: updatedContact });

    default:
      sendContactNotFound(ctx, requestType);
  }
  return state;
}

const handleRequest = (state, ctx, msg) => {
  if (msg.type === ContactProtocolTypes.GET_CONTACTS) {
    sendAllContacts(state.contacts, ctx);
  } else if (msg.type === ContactProtocolTypes.CREATE_CONTACT) {
    state = addContactToState(state, ctx, msg.payload);
  } else {
    // All explicit message types require an existing contact
    const contact = state.contacts[msg.contactId];
    if (contact) {
      state = handleExpliciteRequest(state, ctx, msg.type, contact, msg.payload);
    } else {
      sendContactNotFound(ctx, msg.contactId);
    }
  }
  return state;
}

const contactsService = nact.spawn(
  nactSystem,
  (state = new Object(initNactState), msg, ctx) => {
    if (stateIsReady(state)) {
      state = handleRequest(state, ctx, msg);
    }
    return state; // has to return the actual state
  },
  'contacts'
);

module.exports.service = { contactsService, ContactProtocolTypes }
