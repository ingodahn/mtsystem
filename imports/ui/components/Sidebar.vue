<template>
    <v-container>
            <v-row>
                <v-col>
                   
                    <v-btn-toggle v-model="sidebar">
                        <v-btn color="primary">Relation</v-btn>
                        <v-btn color="primary" v-if="currentId && mode == 'list'">Map</v-btn>
                        <v-btn color="primary" v-if="currentUser && currentId">Note</v-btn>
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
                        <relation :key="currentId+mode" :id="currentId" :relation="id2relation(currentRelation)" :type="type" :mode="mode" v-on:setTarget="setTarget" v-on:selectedId="setNode" :targetsSet="targetsSet(currentRelation)"></relation>
                    </div>
                    <UserNotes v-if="currentUser && currentId && sidebar==2" :title="title" :currentNote="currentNote" :key="currentId"></UserNotes>
                    <div v-if="currentUser && currentId && sidebar==1">
                        <v-expansion-panels accordion>
                            <v-expansion-panel>
                                <v-expansion-panel-header>Info</v-expansion-panel-header>
                                <v-expansion-panel-content>
                                    <h3>Environment of {{ type }} <em>{{ title }}</em> w.r.t. relation <em>{{ id2relation(currentRelation).name }}</em></h3>
                                    <p>Click node for details. Drag nodes to pin</p>
                                    <p v-if="currentUser">Color distinguishes 
                                        <span style="background-color:green; color: white;">{{ type }}s I know</span> from 
                                        <span style="background-color:yellow">{{ type }}s I am exploring</span> and
                                        <span style="background-color:red; color: white;">{{ type }}s I find interesting</span>. 
                                    </p>
                                    <p>The {{ type }} <em>{{ title }}</em> is shown in black.</p>
                                    <p>The {{ type }}s, that have been updated in the last 
                                            <select color="primary" v-model="session.newNodes">
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
                        
                        <ConceptMap :key="currentId+currentRelation+newNodes" :cmap="neighbourhood(2)" v-on:nodeclicked="setNode" orientation=null></ConceptMap>
                    </div>
                </v-col>
            </v-row>
    </v-container>
</template>

<script>
import { Session } from "meteor/session";
import { UnitsCollection } from "../../api/UnitsCollection";
import UserNotes from "./UserNotes.vue";
import ConceptMap from "./ConceptMap.vue";
import Relation from "./Relation.vue";

export default {
    data () {
        return {
            sidebar: 0,
            updateRelations: {},
        }
    },
    props: ['currentId','type','title','relations','mode', 'session'],
    components: {
        UserNotes,
        ConceptMap,
        Relation
    },
    
    methods: {
        id2relation (id) {
            return this.relations.find(e => e.id == id)
        },
        id2RelationName(id) {
            const r=this.id2relation(id);
            return (r.sourceType == this.type)?r.name:r.inverse;
        },
        setTarget (relationId,targets) {
            this.updateRelations[relationId]=targets;
            this.$emit('updatedRelations',this.updateRelations);
        },
        targetsSet(relationId) {
        if (this.updateRelations.hasOwnProperty(relationId)) return this.updateRelations[relationId];
        return false;
        },
        neighbourhood(d) {
            var it = {}, nodes=[], links = [];
            UnitsCollection.find({type: this.type}).fetch().forEach(c => {
                it[c._id]=c.title;
            });
            const cid=this.currentId;
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
                if (c == this.currentId) color="black";
                if (nodeStatus[c]) group=nodeStatus[c];
                nodes.push({"id": c, "title": it[c], "color": color, "isNew": isNew});
            });
            linkIds.forEach(r => {
                links.push({source: r.source, target: r.target})
            });
            return {"nodes": nodes, "links": links};
        },
        setNode (id) {
            this.$emit('setNode',id);
        }
    },
    computed: {
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
        currentRelation () {
            console.log(this.session);
            return this.session.relation;
        },
        typedRelations () {
            let tr=[];
            this.relations.forEach(r => {
                tr.push({text: (r.sourceType == this.type)?r.name:r.inverse, value: r.id})
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