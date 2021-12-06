<template>
    
        <v-container>
            
                <v-row>
                <v-col xs="12" md="8">
                    <h1>MathTrek {{ type }}s:</h1>
                </v-col>
                <v-col xs="12" md="4">
                    <selector :key="session.id" :type="type"></selector>
                    
                </v-col>
                <v-col xs="12" md="8" name="editorMenu" v-if="isEditor">
                        <v-btn v-if="session.mode=='all'" color="success" id="btnNew" @click="session.edit=true">New {{ type }}</v-btn>
                        <span v-if="session.mode == 'single'">
                            <v-btn color="warning" id="btnUpdate" @click="session.edit = true">Update {{ type }}</v-btn>
                            <v-btn color="error" id="btnDelete" @click="deleteNode">Delete {{ type }}</v-btn>
                        </span>
                </v-col>
                </v-row>
            
                <v-row v-if="session.type">
                <v-col xs="12">
                    <show-all :key="session.type" v-if="session.mode=='all'" :relations="relations" v-on:nodeselected="nodeSelected" v-on:relationselected="relationSelected"></show-all>
                    <show-one :key="session.id" v-if="session.mode=='single'" :relations="relations" v-on:setNode="nodeSelected" v-on:relationselected="relationSelected"></show-one>
                    <new-node v-if="session.mode=='new'" :relations="relations" v-on:new="setNode"></new-node>
                    <update-node v-if="session.mode=='update'" :relations="relations"></update-node>
                </v-col>
                </v-row>
            
        </v-container>       
    
</template>

<script>
import {relations} from '/imports/config.js'
import Selector from "../components/Selector.vue";
import ShowAll from "../components/ShowAll.vue";
import ShowOne from "../components/ShowOne.vue";
import NewNode from "../components/NewNode.vue";
import UpdateNode from "../components/UpdateNode.vue";
export default {
    data () {
        return {
            mode: "all",
           session: this.$root.$data.session
        }
    },
    props: [],
    components: {
        Selector,
        ShowAll,
        ShowOne,
        NewNode,
        UpdateNode,
    },
    created () {
        this.$root.$data.session.set('relation',this.initialRelation);
        //this.$root.$data.session.set('id','')
    },
    watch: {
        
    },
    methods: {
        nodeSelected (id) {
            this.session.set('id',id);
            if (!id) {
                this.mode="all";
            } else {
                this.mode="single";
            }            
        },
        relationSelected (rid) {
            this.currentRelation = rid;
        },
        newNode () {
            this.session.set('id','');
            this.mode="new";
        },
        setNode (id) {
            if (id) {
                this.session.set('id',id);
                this.mode="single";
            } else {
                this.session.set('id','');
                this.mode="all";
            }
        },
        
        deleteNode () {
            Meteor.call('deleteItem',{
                _id: this.session.id
            });
            Meteor.call('deleteItem',{
                type: 'relation',
                source: this.session.id
            });
            Meteor.call('deleteItem',{
                type: 'relation',
                target: this.session.id
            });
            this.session.set('id','');
            this.mode="all";
        }
    },
    computed: {
        type () {
            return this.session.type;
        },
        relations () {
            let t=this.type;
            return relations.filter(e => (e.sourceType == t || e.targetType == t));
        },
        initialRelation () {
            return this.relations[0].id;
        },
        currentRelation () {
            return this.session.relation;
        },
        sessionInit () {
            return {
                type: this.type,
                relation: this.relations[0].id,
                id: '',
                newNodes: 7
            };
        }
    },
    meteor: {
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

<style scoped>
.v-select {
  width: auto; 
  min-width: 10em;
}

p {
    margin-top: 5px;
}
</style>