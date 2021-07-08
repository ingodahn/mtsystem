<template>
    <div class="container">
        <h1>MathTrek Concepts</h1>
        <span v-if="mode == 'map'">
            <h3>Concepts close to the concept of {{ current.title }}</h3>
            <p>Click node for details. Drag nodes to pin</p>
            <p v-if="currentUser">Color distinguishes 
                <span style="background-color:green; color: white;">concepts I know</span> from 
                <span style="background-color:yellow">concepts I am exploring</span> and
                <span style="background-color:red; color: white;">concepts I find interesting</span>. 
            </p>
            <p>The concept of <em>{{ current.title }}</em> is shown in black. Arrows point to superconcepts.</p>
            <ConceptMap :cmap="neighbourhood(2)" v-on:nodeclicked="mapCurrent"></ConceptMap>
        </span>
        <div v-if="mode == 'list'">
            <v-container>
                <v-row>
                    <v-col>
                        <span v-if="current && current._id">
                            <v-btn id="btnMap" @click="mode='map'">Concept Map</v-btn>
                            <v-btn id="noteButton" @click="toggleNote">{{ noteButtonLabel }}</v-btn>
                        </span>
                        <span v-if="isEditor">
                            <v-btn id="btnNew" @click="newConcept">New Concept</v-btn>
                            <span v-if="current && current._id">
                                | <v-btn id="btnUpdate" @click="updateConcept">Update Concept</v-btn>
                            </span>
                        </span>
                    </v-col>
                    <v-col>
                        <UserNotes v-if="currentUser && current && current._id && showNotes" :title="current.title" :currentNote="currentNote"></UserNotes>
                    </v-col>
                </v-row>
            </v-container>
            
            <div class="select" data-app>
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
            <div v-if="current">
                <show-math-doc :key="current.description" v-if="current.description " :content="current.description"></show-math-doc>
                <div v-if="current.see">
                    <a :href="current.see" target="_blank">Read more</a>
                </div>
                <div v-if="relations.length ==1">
                    <h2>Relation between concepts:</h2>
                    <p><b>Relation:</b> Concept 1 <b>{{ relations[0].name}}</b> Concept 2</p>
                    <p><b>Inverse:</b> Concept 2 <b>{{ relations[0].inverse}}</b> Concept 1</p>
                    
                    <relation v-if="current._id" :id="current._id" :relation="relations[0]" type="Concept" v-on:selected="setCurrent"></relation>
                </div>
                <!--
                <v-list>
                    <v-subheader>Relations between concepts:</v-subheader>
                    <v-list-item-group>
                        <v-list-item v-for="r in relations" :key="r.id">
                            <v-list-item-content>
                                <v-list-item-title>Concept 1 <b>{{ r.name }}</b> Concept 2</v-list-item-title>
                                <v-list-item-subtitle>Inverse: Concept 2 <b>{{ r.inverse }}</b> Concept 1</v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list-item-group>
                </v-list>
                -->
                
                
                <!-- Relation
                <v-list v-if="current._id && currentSuperConcepts.length">
                    <v-subheader>{{ current.title }} is a kind of:</v-subheader>
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
                    <v-subheader>{{ current.title }} is an abstraction of:</v-subheader>
                    <v-list-item-group>
                        <v-list-item v-for="(item,index) in currentSubConcepts" 
                        :key="index" @click="setCurrentAbove(index)">
                            
                            <v-list-item-content>
                                <v-list-item-title v-text="item"></v-list-item-title>
                            </v-list-item-content>
                                
                        </v-list-item>
                    </v-list-item-group>
                </v-list>
                End Relation -->
            </div>
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
import Relation from "../../components/Relation.vue";
import ConceptMap from "../../components/ConceptMap.vue";
import ShowMathDoc from "../../components/ShowMathDoc.vue";
import UserNotes from "../../components/UserNotes.vue";

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
            relations: [
                {
                    id: 'isBelow', 
                    name: 'is a kind of', 
                    inverse: 'is an abstraction of',
                    description: "Every SOURCE can be interpreted as an instance of TARGET in a canonic way."
                }
            ],
            showNotes: true,
            noteButtonLabel: "Hide My Notes"
        };
    },
    components: {
        Relation,
        ConceptMap,
        ShowMathDoc,
        UserNotes
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
                    type: "note",
                    item: this.current._id
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
            let nodeStatus={};
            if (this.currentUser) {
                UnitsCollection.find({type: 'note',
                    item: {$in: nodeIds},
                    userId: this.currentUser._id
                    }).fetch().forEach(n => {
                        nodeStatus[n.item]=n.status;
                    });
            }
            
            nodeIds.forEach(c => {
                let color="lightblue";
                switch (nodeStatus[c]) {
                    case "100": color="green"; break;
                    case "2": color="yellow"; break;
                    case "150": color="red"; break;
                    default: color="lightblue";
                }
                if (c == this.current._id) color="black";
                if (nodeStatus[c]) group=nodeStatus[c];
                nodes.push({"id": c, "title": it[c], "color": color});
            });
            linkIds.forEach(r => {
                links.push({source: r.source, target: r.target})
            });
            return {"nodes": nodes, "links": links};
        },
        
        setCurrent(node) {
            this.current = node;
            this.mode="list";
        },
        mapCurrent(mapNode) {
            this.current=UnitsCollection.findOne({_id: mapNode.id});
            this.mode="list";
        },
        toggleNote () {
            if (this.showNotes) {
                this.showNotes = false;
                this.noteButtonLabel = "Show My Notes"
            } else {
                this.showNotes = true;
                this.noteButtonLabel="Hide My Notes";
            }
        },
        getCurrentNodeIsAbove (relation) {
            const rds = UnitsCollection.find({
                type: 'relation',
                name: relation,
                target: this.current._id
            }).fetch().map(d => d.source);
            this.currentAbove=rds;
            rs=UnitsCollection.find({_id: {$in: rds}}).fetch();
            return rs;
        },
        currentSubNodes (relation) {
            return this.getCurrentNodeIsAbove(relation).map(c => c.title);
        },
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
        currentNote() {
            if (this.current._id) {
                let currentNote = UnitsCollection.findOne({
                    type: 'note',
                    item: this.current._id,
                    userId: this.currentUser._id
                });
                if (currentNote) return currentNote;
                else {
                    return {
                        type: 'note',
                        item: this.current._id,
                        userId: this.currentUser._id,
                        status: "0",
                        note: ""
                    };
                }
            }
            
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
.select {
    max-width: 800px;
    z-index: 1;
}
div >>> p {
    margin-bottom: 0.5em;
}

.item:hover {
  background-color: greenyellow;
}
</style>