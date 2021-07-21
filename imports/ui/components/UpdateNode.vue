<template>
    <v-container>
        <v-layout row>
            <v-row>
                <v-flex xs12 md8>
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
                </v-flex>
                <v-flex xs12 md4>
                    <sidebar :currentId="currentId" title="current.title" :type="type" :relations="relations" mode="update" v-on:updatedRelations="updatedRelations"></sidebar>
                </v-flex>
            </v-row>
        </v-layout>
    </v-container>
</template>

<script>
import { UnitsCollection } from '../../api/UnitsCollection';
import Sidebar from "./Sidebar.vue";

export default {
    props: ['currentId','relations','type'],
    data () {
        return {
            current: {
                title: '',
                description: '',
                readMore: '',
                see: ''
            },
            currentRelation: this.relations[0].id,
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
            this.$emit('update','');
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
            this.$emit('update',this.currentId);
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
    }
}
</script>