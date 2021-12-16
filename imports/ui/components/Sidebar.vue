<template>
    <v-container>
            <v-row>
                <v-col>
                   
                    <v-btn-toggle v-model="sidebar">
                        <v-btn color="primary">Relation</v-btn>
                        <v-btn color="primary" v-if="currentUser && session.id && session.mode == 'single'">Note</v-btn>
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
                        <relation :key="session.id+mode" v-if="session.mode == 'single'" :relation="id2relation(currentRelation)" :mode="mode" v-on:setTarget="setTarget" v-on:selectedId="setNode" :targetsSet="targetsSet(currentRelation)"></relation>
                    </div>
                    <UserNotes v-if="currentUser && session.id && sidebar==1" :title="title" :currentNote="currentNote" :key="currentId"></UserNotes>
                </v-col>
            </v-row>
    </v-container>
</template>

<script>
import { UnitsCollection } from "../../api/UnitsCollection";
import UserNotes from "./UserNotes.vue";
import Relation from "./Relation.vue";

export default {
    data () {
        return {
            session: this.$root.$data.session,
            sidebar: 0,
            updateRelations: {},
        }
    },
    props: ['title','relations','mode'],
    components: {
        UserNotes,
        Relation
    },
    
    methods: {
        id2relation (id) {
            return this.relations.find(e => e.id == id)
        },
        id2RelationName(id) {
            const r=this.id2relation(id);
            return (r.sourceType == this.session.type)?r.name:r.inverse;
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
            UnitsCollection.find({type: this.session.type}).fetch().forEach(c => {
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
        },
    },
    computed: {
        currentId () {
            return this.session.id;
        },
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
        type () {
            return this.session.type;
        },
        currentRelation () {
            return this.session.relation;
        },
        sameType () {
            let r=this.id2relation(this.currentRelation);
            return (r.sourceType  == r.targetType);
        },
        typedRelations () {
            let tr=[];
            this.relations.forEach(r => {
                tr.push({text: (r.sourceType == this.session.type)?r.name:r.inverse, value: r.id})
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