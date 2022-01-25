import { Meteor } from 'meteor/meteor';
import { UnitsCollection } from '/imports/api/UnitsCollection';

Meteor.publish('units', function () {
  return UnitsCollection.find({ type: { $in: ['relation','concept','subject','theorem','person']} });
});
Meteor.publish('notes', function () {
  return UnitsCollection.find({ type: 'note', userId: this.userId });
});
