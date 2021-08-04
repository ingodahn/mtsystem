<template>
    <v-container>
        
            <v-row>
                <v-col xs="12" md="8">
                    <v-btn color="warning" @click="cancel">Cancel</v-btn>
                    <v-btn color="accent" @click="save">Save</v-btn>
                    <v-text-field
                        label="Title"
                        hide-details="auto"
                        v-model="current.title"
                    ></v-text-field>
                    <v-textarea
                        outlined
                        label="Description:"
                        v-model="current.description"
                    ></v-textarea>
                    <v-textarea
                        outlined
                        label="Show more:"
                        v-model="current.readMore"
                    ></v-textarea>
                    <v-text-field
                        label="See:"
                        hide-details="auto"
                        v-model="current.see"
                    ></v-text-field>
                </v-col>
                <v-col xs="12" md="4">
                    <sidebar :currentId="currentId" title="current.title" :type="type" :relations="relations" mode="update" v-on:updatedRelations="updatedRelations" :session="session"></sidebar>
                </v-col>
            </v-row>
        
    </v-container>
</template>

<script>
import { UnitsCollection } from '../../api/UnitsCollection';
import Sidebar from "./Sidebar.vue";

export default {
    props: ['relations'],
    data () {
        return {
            session: this.$root.$data.session,
            current: {
                title: '',
                description: '',
                readMore: '',
                see: ''
            },
            //currentRelation: this.relations[0].id,
            updateRelations: {}
        }
    },
    components: {
        Sidebar
    },
    mounted () {
        const myCurrent=UnitsCollection.findOne({_id: this.currentId});
        if (myCurrent) { this.current=myCurrent }
        else {
            console.log(this.currentId+' not found');
        }
    },
    methods: {
        cancel () {
            this.session.set('edit',false);
        },
        save () {
            this.current.updatedAt = new Date();
            Meteor.call('updateItem',this.current);
            Object.keys(this.updateRelations).forEach(rid => {
                Meteor.call('deleteItem',{
                    type: "relation",
                    name: rid,
                    source: this.current._id
                });
                this.updateRelations[rid].forEach(tid => {
                    Meteor.call('insertItem',{
                        type: "relation",
                        name: rid,
                        source: this.current._id,
                        target: tid
                    });
                })
            });
            this.session.set('edit',false);
        },
        updatedRelations (Rels) {
            this.updateRelations = Rels;
        },
        id2relation (id) {
            return this.relations.find(e => e.id == id)
        },
        getRelationDescription (relation) {
            let ctype=this.type.charAt(0).toUpperCase()+this.type.substring(1);
            let source = this.current.title;
            let target = ctype+' 2';

            return "\""+source+" "+relation.name+" "+target+"\" means: "+relation.description.replaceAll('SOURCE',source).replaceAll('TARGET',target);
        },
    },
    computed: {
        currentRelation () {
            return this.session.relation;
        },
        type () {
            return this.session.type;
        },
        currentId () {
            return this.session.id;
        }
    }
}
</script>