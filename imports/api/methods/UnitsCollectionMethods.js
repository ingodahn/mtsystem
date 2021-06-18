import { check, Match } from 'meteor/check';
import { UnitsCollection } from '../UnitsCollection';

Meteor.methods({
    insertItem(item) {
        if (!this.userId) {
            throw new Meteor.Error('Insert not authorized');
        }
        const pattern = Match.ObjectIncluding({ type: Match.OneOf("relation","concept","unit","topic","note")});
        var myTest=Match.test(item,pattern);
        if (myTest) {
            var newId=UnitsCollection.insert(item);
            return newId;
        } else {
            console.log("Insert: Illegal Pattern");
        }
    },
    updateItem(item) {
        if (!this.userId) {
            throw new Meteor.Error('Update not authorized');
        }
        const pattern = Match.ObjectIncluding({ 
            _id: String, 
            type: Match.OneOf("relation","concept","unit","topic","note")
        });
        var myTest=Match.test(item,pattern);
        if (myTest) {
            UnitsCollection.update(
                {_id: item._id},
                {
                $set: item
                }
            );
        } else {
            throw new Meteor.Error("Update: Illegal Pattern");
        }
    },
    deleteItem(pattern) {
        if (! Object) {
            throw new Meteor.Error('Delete: Pattern is not an object');
        }
        if (!this.userId) {
            throw new Meteor.Error('Deleting not authorized');
        }
        UnitsCollection.remove(pattern);
    }
})