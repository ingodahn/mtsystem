<template>
    <div class="container">
        <h1>MathTrek Concepts</h1>
        <span v-if="mode == 'map'">
            <h3>Concepts close to the concept of {{ current.title }}</h3>
            <p>Click concepts for details</p>
            <ConceptMap :cmap="neighbourhood(2)" v-on:nodeclicked="setCurrent"></ConceptMap>
        </span>
        <div v-if="mode == 'list'">
            <span v-if="current._id">
                <v-btn id="btnMap" @click="mode='map'">Concept Map</v-btn>
            </span>
            <span v-if="currentUser">
                <v-btn id="btnNew" @click="newConcept">New Concept</v-btn>
                <span v-if="current._id">
                    | <v-btn id="btnUpdate" @click="updateConcept">Update Concept</v-btn>
                </span>
            </span>
            <div data-app>
            <v-autocomplete
                label="Select Concept"
                v-model="current"
                hide-details="auto"
                :items="all"
                item-text="title"
                item-value="_id"
                return-object
                clearable
            ></v-autocomplete>
            </div>
            <br/>
            <div v-if="current.description" v-html="current.description"></div>
            <div v-if="current.see">
                <a :href="current.see" target="_blank">Read more</a>
            </div>
            <v-list v-if="current._id && currentSuperConcepts.length">
                <v-subheader>Subconcept of</v-subheader>
                <v-list-item-group>
                    <v-list-item v-for="(item,index) in currentSuperConcepts" 
                    :key="index" @click="setCurrentBelow(index)">
                        
                        <v-list-item-content>
                            <v-list-item-title v-text="item"></v-list-item-title>
                        </v-list-item-content>
                            
                    </v-list-item>
                </v-list-item-group>
            </v-list>

            <v-list v-if="current._id && currentSubConcepts.length">
                <v-subheader>Superconcept of</v-subheader>
                <v-list-item-group>
                    <v-list-item v-for="(item,index) in currentSubConcepts" 
                    :key="index" @click="setCurrentAbove(index)">
                        
                        <v-list-item-content>
                            <v-list-item-title v-text="item"></v-list-item-title>
                        </v-list-item-content>
                            
                    </v-list-item>
                </v-list-item-group>
            </v-list>
        </div>
        <div v-if="mode == 'update'">
            <h2>Edit Concept</h2>
            <v-btn @click="closeConceptUpdate">Cancel</v-btn> | 
            <v-btn @click="saveConcept">Save</v-btn> | 
            <v-btn v-if = "current._id" @click="deleteConcept">Delete</v-btn>
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
            <div data-app>
            <v-autocomplete
                label="Subconcept of"
                v-model="currentBelow"
                hide-details="auto"
                :items="all"
                item-text="title"
                item-value="_id"
                clearable
                deletable-chips
                multiple
                small-chips
            ></v-autocomplete>
            </div>
            <v-text-field
                label="See:"
                hide-details="auto"
                v-model="current.see"
            ></v-text-field>
        </div>
    </div>
</template>

<script>
import { UnitsCollection } from "../../../api/UnitsCollection";
import ConceptMap from "../../components/ConceptMap.vue";

export default {
    data() {
        return {
          current: {
                type: "concept",
                title: "",
                description: "",
                below: [],
                see: ""
            },
            currentBelow: [],
            currentAbove: [],
            mode: "list",
        };
    },
    components: {
        ConceptMap
    },
    methods: {
        newConcept () {
            this.current= {
                type: "concept",
                title: "",
                description: "",
                see: ""
            };
            this.currentBelow=[];
            this.currentAbove=[];
            this.mode="update";
        },
        updateConcept() {
            this.currentBelow=this.getCurrentIsBelow.map(e => e._id);
            this.mode='update';
        },
        saveConcept () {
            this.current.updatedAt = new Date();
            if (this.current._id) {
                Meteor.call('updateItem',this.current);
                Meteor.call('deleteItem',{
                    type: "relation",
                    name: "isBelow",
                    source: this.current._id
                });
                this.currentBelow.forEach(id => {
                    Meteor.call('insertItem',{
                        type: "relation",
                        name: "isBelow",
                        source: this.current._id,
                        target: id
                    });
                });
            } else  {
                const currentBelow=this.currentBelow;
                Meteor.call('insertItem',this.current, function(error,result) {
                    if (error) {
                        console.log("Insert Error: "+error.msg)
                    } else {
                        currentBelow.forEach(id => {
                            Meteor.call('insertItem',{
                                type: "relation",
                                name: "isBelow",
                                source: result,
                                target: id
                            });
                        });
                    }
                });
            }
            this.closeConceptUpdate ();
        },
        deleteConcept () {
            if (this.current._id) {
                Meteor.call('deleteItem',{
                    type: "relation",
                    target: this.current._id
                });
                Meteor.call('deleteItem',{
                    type: "relation",
                    source: this.current._id
                });
                Meteor.call('deleteItem',{
                    _id: this.current._id
                });
            } else {
                alert("Not yet in database, cannot delete.");
            }
            this.closeConceptUpdate ();
        },
        closeConceptUpdate () {
            this.current= {
                type: "concept",
                title: "",
                description: "",
                see: ""
            };
            this.mode="list";
            this.currentBelow=[];
            this.currentAbove=[];
        },
        setCurrentBelow (i) {
            this.current = this.getCurrentIsBelow[i];
        },
        setCurrentAbove (i) {
            this.current = this.getCurrentIsAbove[i];
        },
        getDownNodes (down) {
            let id=0, newNodeIds=[this.current._id],nodeIds=[this.current._id],linkIds=[];
            while (id < down) {
               let  nextNodeIds=[];
               UnitsCollection.find({
                    type: 'relation', 
                    name: 'isBelow', 
                    target: {$in: newNodeIds}
                }).fetch().forEach(c => {
                    nextNodeIds.push(c.source);
                    linkIds.push(c);
                })
                nodeIds=nodeIds.concat(nextNodeIds);
                newNodeIds=nextNodeIds;
                id++;
            }
            return({nodes: nodeIds, links: linkIds})
        },
        getUpNodes (up) {
            let id=0, newNodeIds=[this.current._id],nodeIds=[this.current._id],linkIds=[];
            while (id < up) {
               let  nextNodeIds=[];
               UnitsCollection.find({
                    type: 'relation', 
                    name: 'isBelow', 
                    source: {$in: newNodeIds}
                }).fetch().forEach(c => {
                    nextNodeIds.push(c.target);
                    linkIds.push(c);
                })
                nodeIds=nodeIds.concat(nextNodeIds);
                newNodeIds=nextNodeIds;
                id++;
            }
            return({nodes: nodeIds, links: linkIds})
        },
        neighbourhood(d) {
            var it = {}, nodes=[], links = [];
            UnitsCollection.find({type: 'concept'}).fetch().forEach(c => {
                it[c._id]=c.title;
            });
            let id=0, newNodeIds=[this.current._id],nodeIds=[this.current._id],linkIds=[];
            while (id < d) {
                let  nextNodeIds=[];
                UnitsCollection.find({
                    type: 'relation', 
                    name: 'isBelow', 
                    source: {$in: newNodeIds}
                }).fetch().forEach(c => {
                    nextNodeIds.push(c.target);
                    linkIds.push(c);
                });
                UnitsCollection.find({
                    type: 'relation', 
                    name: 'isBelow', 
                    target: {$in: newNodeIds}
                }).fetch().forEach(c => {
                    nextNodeIds.push(c.source);
                    linkIds.push(c);
                });
                let nextNodeReduced=[...new Set(nextNodeIds)].filter(item => (! nodeIds.includes(item)));
                nodeIds=nodeIds.concat(nextNodeReduced);
                newNodeIds=[...nextNodeReduced];
                id++;
            }
            nodeIds.forEach(c => {
                let group=(c == this.current._id)?2:1;
                nodes.push({"id": c, "title": it[c], "group": group});
            });
            linkIds.forEach(r => {
                links.push({source: r.source, target: r.target})
            });
            return {"nodes": nodes, "links": links};
        },
        conceptMap (down,up) {
            var it = {}, nodes=[], links = [];
            UnitsCollection.find({type: 'concept'}).fetch().forEach(c => {
                it[c._id]=c.title;
            });
            const downNodes=this.getDownNodes(down);
            const downNodeIds=downNodes.nodes, downLinkIds=downNodes.links;
            const upNodes=this.getUpNodes(up);
            const upNodeIds=upNodes.nodes, upLinkIds=upNodes.links;
            downNodeIds.forEach(c => {
                let group=(c == this.current._id)?2:1;
                nodes.push({"id": c, "title": it[c], "group": group});
            });
            downLinkIds.forEach(r => {
                links.push({source: r.target,target: r.source})
            });
            upNodeIds.forEach(c => {
                let group=(c == this.current._id)?2:1;
                nodes.push({"id": c, "title": it[c], "group": group});
            });
            upLinkIds.forEach(r => {
                links.push({source: r.target,target: r.source})
            });
            nodes.shift();
            return {"nodes": nodes, "links": links};
        },
        setCurrent(node) {
            this.current=UnitsCollection.findOne({_id: node.id});
            this.mode="list";
        }
    },
    computed: {
        // Concepts of which the current concept is a superconcept
        currentSubConcepts () {
            return this.getCurrentIsAbove.map(c => c.title);
        },
        getCurrentIsAbove () {
            const rds = UnitsCollection.find({
                type: 'relation',
                name: 'isBelow',
                target: this.current._id
            }).fetch().map(d => d.source);
            this.currentAbove=rds;
            rs=UnitsCollection.find({_id: {$in: rds}}).fetch();
            return rs;
        },
        currentSuperConcepts () {
            return this.getCurrentIsBelow.map(c => c.title);
        },
         // Concepts of which the current concept is a subconcept
        getCurrentIsBelow () {
            const rds = UnitsCollection.find({
                type: 'relation',
                name: 'isBelow',
                source: this.current._id
            }).fetch().map(d => d.target);
            this.currentBelow=rds;
            rs=UnitsCollection.find({_id: {$in: rds}}).fetch();
            return rs;
        },
    },
    meteor: {
        all() {
        return UnitsCollection.find(
            {type: "concept"}
        ).fetch();
        },
        currentUser() {
            return Meteor.user();
        },
    }
}
</script>

<style scoped>
div >>> p {
    margin-bottom: 0.5em;
}

.item:hover {
  background-color: greenyellow;
}
</style>