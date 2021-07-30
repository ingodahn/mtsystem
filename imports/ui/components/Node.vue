<template>
    
        <v-container>
            
                <v-row>
                <v-col xs="12" md="8">
                    <h1>MathTrek {{ type }}s:</h1>
                </v-col>
                <v-col xs="12" md="4">
                    <selector :key="currentId" :type="type" :currentId="currentId" v-on:selected="nodeSelected"></selector>
                    
                </v-col>
                <v-col xs="12" md="8" name="editorMenu" v-if="isEditor">
                        <v-btn v-if="mode=='all'" color="success" id="btnNew" @click="newNode">New {{ type }}</v-btn>
                        <span v-if="currentId && mode != 'update'">
                            <v-btn color="warning" id="btnUpdate" @click="updateNode">Update {{ type }}</v-btn>
                            <v-btn color="error" id="btnUpdate" @click="deleteNode">Delete {{ type }}</v-btn>
                        </span>
                </v-col>
                </v-row>
            
                <v-row>
                <v-col xs="12">
                    <show-all :key="changed" v-if="mode=='all'" :type="type" :relations="relations" v-on:nodeselected="nodeSelected" v-on:relationselected="relationSelected" :session="session"></show-all>
                    <show-one :key="currentId" v-if="mode=='single'" :currentId="currentId" :type="type" :relations="relations" v-on:setNode="nodeSelected" v-on:relationselected="relationSelected" :session="session"></show-one>
                    <new-node v-if="mode=='new'" :type="type" :relations="relations" v-on:new="setNode" :session="session"></new-node>
                    <!-- TODO: Do we need :key="currentId" to clean up chaged relations? -->
                    <update-node v-if="mode=='update'" :currentId="currentId" v-on:update="updatedNode" :relations="relations" :type="type" :session="session"></update-node>
                </v-col>
                </v-row>
            
        </v-container>       
    
</template>

<script>
import Selector from "./Selector.vue";
import ShowAll from "./ShowAll.vue";
import ShowOne from "./ShowOne.vue";
import NewNode from "./NewNode.vue";
import UpdateNode from "./UpdateNode.vue";
export default {
    data () {
        return {
            currentId: '',
            mode: "all",
            //TODO: Do we need changed?
            changed: 0,
            session: {
                type: this.type,
                relation: this.relations[0].id,
                id: this.currentId,
                newNodes: 7
            }
        }
    },
    props: ['type','relations'],
    components: {
        Selector,
        ShowAll,
        ShowOne,
        NewNode,
        UpdateNode
    },
    mounted () {
    },
    watch: {

    },
    methods: {
        nodeSelected (id) {
            this.currentId=id;
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
            this.currentId='';
            this.mode="new";
        },
        setNode (id) {
            if (id) {
                this.currentId=id;
                this.mode="single";
            } else {
                this.currentId='';
                this.mode="all";
            }
        },
        updateNode () {
            this.mode="update";
        },
        updatedNode (id) {
            // TODO: Shouldn't this just do nothing?
            if (id) {
                this.currentId=id;
                this.mode="single";
            } else {
                this.currentId='';
                this.mode="all";
            }
        },
        deleteNode () {
            Meteor.call('deleteItem',{
                _id: this.currentId
            });
            Meteor.call('deleteItem',{
                type: 'relation',
                source: this.currentId
            });
            Meteor.call('deleteItem',{
                type: 'relation',
                target: this.currentId
            });
            this.currentId = '';
            this.mode="all";
        }
    },
    computed: {
        currentRelation () {
            return this.session.relation;
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