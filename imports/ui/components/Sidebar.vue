<template>
    <v-container>
            <v-row>
                <v-col>
                    <UserNotes v-if="currentUser && session.id" :title="title" :currentNote="currentNote" :key="session.id"></UserNotes>
                </v-col>
            </v-row>
    </v-container>
</template>

<script>
import { UnitsCollection } from "../../api/UnitsCollection";
import UserNotes from "./UserNotes.vue";
import Relation from "./Relation.vue";

export default {
    data () {
        return {
            session: this.$root.$data.session,
        }
    },
    props: ['title','relations','mode'],
    components: {
        UserNotes,
        Relation
    },
    
    methods: {
       
    },
    computed: {
        currentId () {
            return this.session.id;
        },
        currentNote() {
            if (this.currentId) {
                let currentNote = UnitsCollection.findOne({
                    type: 'note',
                    item: this.currentId,
                    userId: this.currentUser._id
                });
                if (currentNote) return currentNote;
                else {
                    return {
                        type: 'note',
                        item: this.currentId,
                        userId: this.currentUser._id,
                        status: "0",
                        note: ""
                    };
                }
            }
        },
        
    },
    meteor: {
        currentUser() {
            return Meteor.user();
        },
    }
}
</script>