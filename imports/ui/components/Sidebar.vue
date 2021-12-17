<template>
    <v-container>
            <v-row>
                <v-col>
                    <v-btn-toggle v-model="sidebar">
                        <v-btn color="primary">Relation</v-btn>
                        <v-btn color="primary" v-if="currentUser && session.id && session.mode == 'single'">Note</v-btn>
                    </v-btn-toggle>
                    <div v-if="sidebar==0">
                        <div v-if="relations.length > 1">
                            <div data-app>
                                <v-select
                                    :items="typedRelations"
                                    label="Select relation:"
                                    item-text="text"
                                    item-value="value"
                                    v-model="session.relation"
                                >
                            </v-select>
                            </div>
                        </div>
                        <relation :key="session.id+mode" :relation="id2relation(currentRelation)" v-on:setTarget="setTarget" :targetsSet="targetsSet(currentRelation)"></relation>
                    </div>
                    <UserNotes v-if="currentUser && session.id && sidebar==1" :title="title" :currentNote="currentNote" :key="currentId"></UserNotes>
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
            sidebar: 0,
            updateRelations: {},
        }
    },
    props: ['title','relations','mode'],
    components: {
        UserNotes,
        Relation
    },
    
    methods: {
        id2relation (id) {
            return this.relations.find(e => e.id == id)
        },
        id2RelationName(id) {
            const r=this.id2relation(id);
            return (r.sourceType == this.session.type)?r.name:r.inverse;
        },
        setTarget (relationId,targets) {
            this.updateRelations[relationId]=targets;
            this.$emit('updatedRelations',this.updateRelations);
        },
        targetsSet(relationId) {
        if (this.updateRelations.hasOwnProperty(relationId)) return this.updateRelations[relationId];
        return false;
        },
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
        type () {
            return this.session.type;
        },
        currentRelation () {
            return this.session.relation;
        },
        sameType () {
            let r=this.id2relation(this.currentRelation);
            return (r.sourceType  == r.targetType);
        },
        typedRelations () {
            let tr=[];
            this.relations.forEach(r => {
                tr.push({text: (r.sourceType == this.session.type)?r.name:r.inverse, value: r.id})
            });
            return tr;
        },
        newNodes () {
            return this.session.newNodes;
        }
    },
    meteor: {
        currentUser() {
            return Meteor.user();
        },
        isEditor() {
            if (Meteor.user()) {
                const name=Meteor.user().username;
                return ( name == 'editor' || name == 'dahn');
            }
            return false;
            
        }
    }
}
</script>