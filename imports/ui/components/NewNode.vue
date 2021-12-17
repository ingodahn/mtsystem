<template>
    <v-container>
        <v-layout row>
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
                    <sidebar currentId="" :title="current.title" :relations="relations" mode="update" v-on:updatedRelations="updatedRelations"></sidebar>
                </v-col>
            </v-row>
        </v-layout>
    </v-container>
</template>

<script>
import { UnitsCollection } from '../../api/UnitsCollection';
import { Random } from 'meteor/random';
import Sidebar from "./Sidebar.vue";

export default {
    props: ['relations'],
    data () {
        return {
            session: this.$root.$data.session,
            current: {
                title: "NEW ENTRY - please, edit",
                type: "",
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
            //this.$emit('new','');
            this.session.set('mode','all');
        },
        updatedRelations (Rels) {
            this.updateRelations = Rels;
        },
        save () {
            let newDate=new Date();
            let newId=Random.id([17]);
            this.current._id = newId;
            this.current.updatedAt = newDate;
            this.current.type=this.session.type;
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
            //this.$emit('new',newId);
            this.session.set('id',newId);
            this.session.set('edit',false);
        }
    },
    computed: {
        type () {
            return this.session.type;
        }
    }
}
</script>