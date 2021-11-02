import { Meteor } from 'meteor/meteor';
import { UnitsCollection } from '/imports/api/UnitsCollection';

Meteor.publish('units', function publishUnits() {
  return UnitsCollection.find({ type: { $in: ['relation','concept','subject','unit','theorem','question']} });
});
Meteor.publish('notes', function publishNotes() {
  return UnitsCollection.find({ type: 'note', userId: this.userId });
});
