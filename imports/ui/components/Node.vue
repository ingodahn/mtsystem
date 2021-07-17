<template>
    <div class="container">
        <v-container>
            <v-layout row>
                <v-flex xs12 md4>
                    <h1>MathTrek {{ type }}s:</h1>
                </v-flex>
                <v-flex xs12 md4>
                    <selector :key="getCurrentId" :type="type" :currentId="getCurrentId" v-on:selected="mapCurrent"></selector>
                    <br/>
                </v-flex>
                <v-flex xs12 md8>
                    <span name="editorMenu" v-if="isEditor">
                        <v-btn color="success" id="btnNew" @click="newNode">New {{ type }}</v-btn>
                        <span v-if="current && current._id">
                            <v-btn color="warning" id="btnUpdate" @click="updateNode">Update {{ type }}</v-btn>
                            <v-btn color="error" id="btnUpdate" @click="deleteNode">Delete {{ type }}</v-btn>
                        </span>
                    </span>
                </v-flex>
                <v-flex xs12 md8  class="pr-7" v-if="mode == 'list'">
                    <div v-if="current && current._id">
                        <h2>{{ current.title }}</h2>
                        <show-math-doc :key="current.description" v-if="current.description " :content="current.description"></show-math-doc>
                        <div v-if="current.readMore">
                            <v-btn v-if="! showMore" @click="showMore=true">Read more...</v-btn>
                            <show-math-doc :key="current.readMore" v-if="showMore" :content="current.readMore"></show-math-doc>
                            <v-btn v-if="showMore" @click="showMore=false">Show less</v-btn>
                        </div>
                        <div v-if="current.see">
                            <a :href="current.see" target="_blank">See also</a>
                        </div>
                        
                    </div>
                    <div v-else>
                        <h3>All {{ nrNodes }} {{ type }}s and the relation <em>{{ id2relation(currentRelation).name }}</em></h3>
                        <p>Click node for details. Drag nodes to pin</p>
                        <p v-if="currentUser">Color distinguishes 
                            <span style="background-color:green; color: white;">{{ type }}s I know</span> from 
                            <span style="background-color:yellow">{{ type }}s I am exploring</span> and
                            <span style="background-color:red; color: white;">{{ type }}s I find interesting</span>. 
                        </p>
                        <p>The {{ type }}s, that have been updated in the last 
                            <select v-model="newNodes">
                                <option>1</option>
                                <option>2</option>
                                <option>3</option>
                                <option>7</option>
                                <option>14</option>
                                <option>30</option>
                            </select>      
                        days, are marked with an <span style="border:solid orange; padding: 1px;">orange ring</span>.
                        </p>
                        <ConceptMap :key="newNodes+currentRelation+nrNodes" :cmap="allNodes" v-on:nodeclicked="mapCurrent"></ConceptMap>
                    </div>
                </v-flex>
                <v-flex xs12 md8  class="pr-7" v-if="mode == 'update'">
                    <h2>Edit {{ type }}</h2>
                    <v-btn color="warning" @click="closeNodeUpdate">Cancel</v-btn>
                    <v-btn color="accent" @click="saveNode">Save</v-btn>
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
                    <v-btn-toggle v-model="sidebar">
                        <v-btn color="primary">Relation</v-btn>
                        <v-btn color="primary" v-if="current && current._id && mode == 'list'">Map</v-btn>
                        <v-btn color="primary" v-if="currentUser && current && current._id">Note</v-btn>
                    </v-btn-toggle>
                    <div v-if="sidebar==0">
                        <!--
                        <div v-if="relations.length ==1">
                        <p><b>Relation:</b> Concept 1 <b>{{ relations[0].name}}</b> Concept 2</p>
                        <p><b>Inverse:</b> Concept 2 <b>{{ relations[0].inverse}}</b> Concept 1</p>
                        
                        <relation v-if="current._id" :id="current._id" :relation="relations[0]" :type="type" :mode="mode" v-on:selected="setCurrent" :targetsSet="targetsSet(currentRelation)"></relation>
                        </div> 
                        -->
                        <div v-if="relations.length > 1">
                            <div data-app>
                                <v-select
                                    :items="relations"
                                    label="Select relation:"
                                    item-text="name"
                                    item-value="id"
                                    v-model="currentRelation"
                                >
                            </v-select>
                            </div>
                        </div>
                        <relation :key="getCurrentId+mode" :id="getCurrentId" :relation="id2relation(currentRelation)" :type="type" :mode="mode" v-on:setTarget="setTarget" v-on:selected="setCurrent" :targetsSet="targetsSet(currentRelation)"></relation>
                    </div>
                    <UserNotes v-if="currentUser && current && current._id && sidebar==2" :title="current.title" :currentNote="currentNote" :key="current._id"></UserNotes>
                    <div v-if="currentUser && current && current._id && sidebar==1">
                        <v-expansion-panels accordion>
                            <v-expansion-panel>
                                <v-expansion-panel-header>Info</v-expansion-panel-header>
                                <v-expansion-panel-content>
                                    <h3>Environment of {{ type }} <em>{{ current.title }}</em> w.r.t. relation <em>{{ id2relation(currentRelation).name }}</em></h3>
                                    <p>Click node for details. Drag nodes to pin</p>
                                    <p v-if="currentUser">Color distinguishes 
                                        <span style="background-color:green; color: white;">{{ type }}s I know</span> from 
                                        <span style="background-color:yellow">{{ type }}s I am exploring</span> and
                                        <span style="background-color:red; color: white;">{{ type }}s I find interesting</span>. 
                                    </p>
                                    <p>The {{ type }} <em>{{ current.title }}</em> is shown in black.</p>
                                    <p>The {{ type }}s, that have been updated in the last 
                                            <select color="primary" v-model="newNodes">
                                                <option>1</option>
                                                <option>2</option>
                                                <option>3</option>
                                                <option>7</option>
                                                <option>14</option>
                                                <option>30</option>
                                            </select>      
                                        days, are marked with an <span style="border:solid orange; padding: 1px;">orange ring</span>.
                                    </p>
                                </v-expansion-panel-content>
                            </v-expansion-panel>
                        </v-expansion-panels>
                        
                        <ConceptMap :key="current._id" :cmap="neighbourhood(2)" v-on:nodeclicked="mapCurrent"></ConceptMap>
                    </div>
                </v-flex>
            </v-layout>
        </v-container>
        <!-- Menu -->
        <div v-if="mode == 'list'">
            <!--
            <v-container>
                <v-row>
                    
                    <v-col>
                        <span v-if="current && current._id">
                            <v-btn id="btnMap" @click="mode='map'">{{ type }} Map</v-btn>
                            <v-btn id="noteButton" @click="toggleNote">{{ noteButtonLabel }}</v-btn>
                        </span>
                        <span v-if="isEditor">
                            <v-btn id="btnNew" @click="newNode">New {{ type }}</v-btn>
                            <span v-if="current && current._id">
                                <v-btn id="btnUpdate" @click="updateNode">Update {{ type }}</v-btn>
                            </span>
                        </span>
                    </v-col>
                    
                    <v-col>
                        <UserNotes v-if="currentUser && current && current._id && showNotes" :title="current.title" :currentNote="currentNote" :key="current._id"></UserNotes>
                    </v-col>
                </v-row>
            </v-container>
            -->
            <!-- Select node 
            <div class="select" data-app>
            <v-autocomplete
                :label="selectLabel"
                v-model="current"
                hide-details="auto"
                :items="all"
                item-text="title"
                item-value="_id"
                return-object
                clearable
            ></v-autocomplete>
            </div>
            -->
            
            <div v-if="!current._id">
                <!--
                 <h3>All {{ type }}s and the relation <em>{{ id2relation(currentRelation).name }}</em></h3>
                <p>Click node for details. Drag nodes to pin</p>
                <p v-if="currentUser">Color distinguishes 
                    <span style="background-color:green; color: white;">{{ type }}s I know</span> from 
                    <span style="background-color:yellow">{{ type }}s I am exploring</span> and
                    <span style="background-color:red; color: white;">{{ type }}s I find interesting</span>. 
                </p>
                <p>The {{ type }}s, that have been updated in the last 
                    <select v-model="newNodes">
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>7</option>
                        <option>14</option>
                        <option>30</option>
                    </select>      
                days, are marked with an <span style="border:solid orange; padding: 1px;">orange ring</span>.
                </p>
                <ConceptMap :key="newNodes" :cmap="neighbourhood(99)" v-on:nodeclicked="mapCurrent"></ConceptMap>
            </div>
            <div v-if="current">
                -->
                <!--
                <show-math-doc :key="current.description" v-if="current.description " :content="current.description"></show-math-doc>
                <div v-if="current.readMore">
                    <v-btn v-if="! showMore" @click="showMore=true">Read more...</v-btn>
                    <show-math-doc :key="current.readMore" v-if="showMore" :content="current.readMore"></show-math-doc>
                    <v-btn v-if="showMore" @click="showMore=false">Show less</v-btn>
                </div>
                <div v-if="current.see">
                    <a :href="current.see" target="_blank">See also</a>
                </div>
                -->
                <!-- Relations 
                <div v-if="relations.length ==1">
                    <h2>Relation between concepts:</h2>
                    <p><b>Relation:</b> Concept 1 <b>{{ relations[0].name}}</b> Concept 2</p>
                    <p><b>Inverse:</b> Concept 2 <b>{{ relations[0].inverse}}</b> Concept 1</p>
                    
                    <relation v-if="current._id" :id="current._id" :relation="relations[0]" :type="type" mode="list" v-on:selected="setCurrent"></relation>
                </div> 
                
                <div v-else>
                    <div data-app>
                        <v-select
                            :items="relations"
                            label="Select relation:"
                            item-text="name"
                            item-value="id"
                            v-model="currentRelation"
                        >
                    </v-select>
                    </div>
                    <relation v-if="current._id" :id="current._id" :relation="id2relation(currentRelation)" :type="type" mode="list" v-on:selected="setCurrent"></relation>
                </div>
                 End Relations -->
            </div>
        </div>
        <!--
        <div v-if="mode == 'update'">
            <h2>Edit Topic</h2>
            <v-btn @click="closeNodeUpdate">Cancel</v-btn>
            <v-btn @click="saveNode">Save</v-btn>
            <v-btn v-if = "current._id" @click="deleteNode">Delete</v-btn>
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
            
            Relations 
                <div v-if="relations.length ==1">
                    <h2>Relation between {{ type }}s:</h2>
                    <relation :key="currentRelation" v-if="current._id" :id="current._id" :relation="relations[0]" :type="type" mode="update" v-on:setTarget="setTarget"></relation>
                </div> 
                <div v-else>
                    <div data-app>
                        <v-select
                            :items="relations"
                            label="Select relation:"
                            item-text="name"
                            item-value="id"
                            v-model="currentRelation"
                        >
                    </v-select>
                    </div>
                    <relation :key="currentRelation" :id="getCurrentId" :relation="id2relation(currentRelation)" :targetsSet="targetsSet(currentRelation)" :type="type" mode="update" v-on:setTarget="setTarget"></relation>
                </div>
                End Relations
            
            <v-text-field
                label="See:"
                hide-details="auto"
                v-model="current.see"
            ></v-text-field>
        </div>
        -->
        <!-- Map -->
        <span v-if="mode == 'map'">
            <h3>Environment of {{ type }} <em>{{ current.title }}</em> w.r.t. relation <em>{{ id2relation(currentRelation).name }}</em></h3>
            <p>Click node for details. Drag nodes to pin</p>
            <p v-if="currentUser">Color distinguishes 
                <span style="background-color:green; color: white;">{{ type }}s I know</span> from 
                <span style="background-color:yellow">{{ type }}s I am exploring</span> and
                <span style="background-color:red; color: white;">{{ type }}s I find interesting</span>. 
            </p>
            <p>The {{ type }} <em>{{ current.title }}</em> is shown in black.</p>
            <p>The {{ type }}s, that have been updated in the last 
                    <select v-model="newNodes">
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>7</option>
                        <option>14</option>
                        <option>30</option>
                    </select>      
                days, are marked with an <span style="border:solid orange; padding: 1px;">orange ring</span>.
                </p>
            <ConceptMap :cmap="neighbourhood(2)" v-on:nodeclicked="mapCurrent"></ConceptMap>
        </span>
    </div>
</template>

<script>
import { UnitsCollection } from "../../api/UnitsCollection";
import { Session } from "meteor/session";
import Relation from "./Relation.vue";
import ConceptMap from "./ConceptMap.vue";
import ShowMathDoc from "./ShowMathDoc.vue";
import UserNotes from "./UserNotes.vue";
import Selector from "./Selector.vue";
export default {
    data () {
        return {
            current: {
                title: "",
                description: "",
                readMore: "",
                see: ""
            },
            mode: "list",
            showMore: false,
            showNotes: true,
            newNodes: "7",
            noteButtonLabel: "Hide My Notes",
            currentRelation: this.leadRelation,
            updateRelations: {},
            sidebar: 0,
            nrNodes: 100
        }
    },
    props: ['type','relations','leadRelation'],
    components: {
        Relation,
        ConceptMap,
        ShowMathDoc,
        UserNotes,
        Selector
    },
    watch: {

    },
    methods: {
        newNode () {
            this.current= {
                type: this.type,
                title: "",
                description: "",
                readMore: "",
                see: ""
            };
            this.mode="update";
            this.updateRelations={};
        },
        updateNode() {
            this.mode='update';
        },
        saveNode () {
            var myId=false;
            this.current.updatedAt = new Date();
            if (this.current._id) {
                myId=this.current._id;
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
                console.log('A');
                console.log(myId);
            } else  {
               let updateRel = this.updateRelations;
               console.log(updateRel);
               Meteor.call('insertItem',this.current, function(error,result) {
                    if (error) {
                        console.log("Insert Error: "+error.msg)
                    } else {
                        Session.set('myId',result);
                        console.log('X');
                        console.log(Session.get('myId'));
                        Object.keys(updateRel).forEach(rid => {
                            updateRel[rid].forEach(tid => {
                                    Meteor.call('insertItem',{
                                    type: "relation",
                                    name: rid,
                                    source: result,
                                    target: tid
                                });
                            })
                        })
                     }
                     
               });
               
               this.nrNodes = this.nrNodes+1;
               console.log('B');
               console.log(Session.get('myId'));
            }
            //this.closeNodeUpdate ();
            this.mapCurrent(myId);
            console.log('C');
            console.log(myId);
        },
        deleteNode () {
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
                //this.nrNodes--;
            } else {
                alert("Not yet in database, cannot delete.");
            }
            //this.closeNodeUpdate ();
            this.mapCurrent(false);
        },
        closeNodeUpdate () {
            this.current= {
                type: this.type,
                title: "",
                description: "",
                readMore: "",
                see: ""
            };
            this.mode="list";
            this.updateRelations={};
        },
        setCurrent(node) {
            this.current = node;
            this.mode="list";
        },
    
        mapCurrent(mapNode) {
            console.log('mapCurrent '+mapNode);
            if (mapNode) {
                this.current=UnitsCollection.findOne({_id: mapNode});
                if (this.isEditor) {
                    this.relations.forEach(r => {
                        this.updateRelations[r.id] = UnitsCollection.find({type: 'relation', source: mapNode}).fetch().map(e => e.target);
                    })
                }
            }
            else {
                    this.current={
                    title: "",
                    description: "",
                    readMore: "",
                    see: ""
                },
                this.updateRelations={};
            }
            this.mode="list";
        },
        id2relation (id) {
            return this.relations.find(e => e.id == id)
        },
        getRelationDescription (relation) {
            let ctype=this.type.charAt(0).toUpperCase()+this.type.substring(1);
            let source = (this.current.title.length)?this.current.title:ctype+' 1';
            let target = ctype+' 2';

            return "\""+source+" "+relation.name+" "+target+"\" means: "+relation.description.replaceAll('SOURCE',source).replaceAll('TARGET',target);
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
        
        neighbourhood(d) {
            var it = {}, nodes=[], links = [];
            UnitsCollection.find({type: this.type}).fetch().forEach(c => {
                it[c._id]=c.title;
            });
            const cid=(this.current._id)?this.current._id:this.all[0]._id;
            let id=0, newNodeIds=[cid],nodeIds=[cid],linkIds=[];
            while (id < d) {
                let  nextNodeIds=[];
                UnitsCollection.find({
                    type: 'relation', 
                    name: this.currentRelation, 
                    source: {$in: newNodeIds}
                }).fetch().forEach(c => {
                    nextNodeIds.push(c.target);
                    linkIds.push(c);
                });
                UnitsCollection.find({
                    type: 'relation', 
                    name: this.currentRelation, 
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
                const back = new Date().getTime()-parseInt(this.newNodes)*24*60*60*1000;
                switch (nodeStatus[c]) {
                    case "100": color="green"; break;
                    case "2": color="yellow"; break;
                    case "150": color="red"; break;
                    default: color="lightblue";
                }
                let updated=new Date(UnitsCollection.findOne({_id: c}).updatedAt).getTime();
                //let today = new Date()
                let isNew = (updated && updated > back)?true:false;
                if (c == this.current._id) color="black";
                if (nodeStatus[c]) group=nodeStatus[c];
                nodes.push({"id": c, "title": it[c], "color": color, "isNew": isNew});
            });
            linkIds.forEach(r => {
                links.push({source: r.source, target: r.target})
            });
            return {"nodes": nodes, "links": links};
        },
        
        setTarget (relationId,targets) {
            this.updateRelations[relationId]=targets;
        },
        targetsSet(relationId) {
        if (this.updateRelations.hasOwnProperty(relationId)) return this.updateRelations[relationId];
        return false;
        }
    },
    computed: {
        allNodes () {
            console.log('running allNodes');
            if (this.nrNodes) {
            var it = {}, nodeIds = []
            //UnitsCollection.find({type: this.type}).fetch().forEach(c => {
            this.all.forEach(c => {
                it[c._id]=c.title;
                nodeIds.push(c._id);
            });
            let nodeStatus={};
            if (this.currentUser) {
                UnitsCollection.find({type: 'note',
                    item: {$in: nodeIds},
                    userId: this.currentUser._id
                }).fetch().forEach(n => {
                    nodeStatus[n.item]=n.status;
                });
            }
           
            let linkRels =UnitsCollection.find({
                type: 'relation', 
                name: this.currentRelation, 
                //Same-Type-Links only!
                source: {$in: nodeIds}
            }).fetch();
            
            let links = [],nodes = [];
            nodeIds.forEach(c => {
                let color="lightblue";
                const back = new Date().getTime()-parseInt(this.newNodes)*24*60*60*1000;
                switch (nodeStatus[c]) {
                    case "100": color="green"; break;
                    case "2": color="yellow"; break;
                    case "150": color="red"; break;
                    default: color="lightblue";
                }
                let updated=new Date(UnitsCollection.findOne({_id: c}).updatedAt).getTime();
                //let today = new Date()
                let isNew = (updated && updated > back)?true:false;
                if (nodeStatus[c]) group=nodeStatus[c];
                nodes.push({"id": c, "title": it[c], "color": color, "isNew": isNew});
            });
            
            linkRels.forEach(r => {
                links.push({source: r.source, target: r.target})
            });
            console.log({"nodes": nodes, "links": links});
            return {"nodes": nodes, "links": links};
           
           } else {
                return {};
            }
            
        },
        selectLabel () {
            return "Select "+this.type+':';
        },
        getCurrentId () {
            return (this.current._id)?this.current._id:'';
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
            let myType = this.type;
            let allFound = UnitsCollection.find(
                {type: myType},{sort: { title: 1}}
            ).fetch();
            this.nrNodes=allFound.length;
            return allFound;
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
.v-select {
  width: auto; 
  min-width: 10em;
}

p {
    margin-top: 5px;
}
</style>