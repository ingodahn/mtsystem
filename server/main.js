import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { UnitsCollection } from '/imports/api/UnitsCollection';
import '/imports/api/methods/UnitsCollectionMethods';
import '/imports/api/publications/MtPublications';

const insertUnit = unitTitle => UnitsCollection.insert({ title: unitTitle });

const SEED_USERNAME = 'dahn';
const SEED_PASSWORD = 'leg1Horn';
 
Meteor.startup(() => {
  if (!Accounts.findUserByUsername(SEED_USERNAME)) {
    Accounts.createUser({
      username: SEED_USERNAME,
      password: SEED_PASSWORD,
    });
  }
  if (!Accounts.findUserByUsername('editor')) {
    Accounts.createUser({
      username: 'editor',
      password: 'mt-edit',
    });
  }
  ['ingo','paul','dietrich','erik','ambjoern'].forEach(name => {
    if (!Accounts.findUserByUsername(name)) {
      Accounts.createUser({
        username: name,
        password: 'my-ship',
      });
    }
  })
  
  /*
  if (UnitsCollection.find().count() === 0) {
    [
      'A Bird\'s View on Derivatives',
      'Normed Space',
      'Continuity and Norm',
      'Approximation of Order 1',
      'Linear Bounded Functions',
      'Linear Parts of Approximating Functions must be Bounded',
      'At Most One Approximating Affine Function'
    ].forEach(insertUnit)
  }
  */
});