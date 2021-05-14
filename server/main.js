import { Meteor } from 'meteor/meteor';
import { UnitsCollection } from '/imports/api/UnitsCollection';

const insertUnit = unitTitle => UnitsCollection.insert({ title: unitTitle });
 
Meteor.startup(() => {
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
});