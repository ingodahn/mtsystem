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
                    <sidebar currentId="" :type="type" :title="current.title" :relations="relations" mode="update" v-on:updatedRelations="updatedRelations"></sidebar>
                </v-flex>
            </v-row>
        </v-layout>
    </v-container>
</template>

<script>
import { UnitsCollection } from '../../api/UnitsCollection';
import { Random } from 'meteor/random';
import Sidebar from "./Sidebar.vue";
export default {
    props: ['type','relations'],
    data () {
        return {
            current: {
                title: "",
                type: this.type,
                description: "",
                readMore: "",
                see: "",
            },
            updateRelations: {}
        }
    },
    components: { Sidebar },
    methods: {
        cancel () {
            this.$emit('new','');
        },
        updatedRelations (Rels) {
            this.updateRelations = Rels;
        },
        save () {
            let newDate=new Date();
            let newId=Random.id([17]);
            this.current._id = newId;
            this.current.updatedAt = newDate;
           Meteor.call('insertItem',this.current);
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
            this.$emit('new',newId);
            
        }
    }
}
</script>