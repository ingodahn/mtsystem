<template>
 <v-container>
    <v-row>
        <v-col xs="12" md="8">
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
                <ConceptMap :cmap="allNodes" v-on:nodeclicked="mapCurrent"></ConceptMap>
        </v-col>
        <v-col xs="12" md="4">
            <sidebar currentId='' title='' :type="type" :relations="relations" mode="list"></sidebar>
        </v-col>
    </v-row>
 </v-container>
</template>

<script>
import { UnitsCollection } from "../../api/UnitsCollection";
import ConceptMap from "./ConceptMap.vue";
import Sidebar from "./Sidebar.vue";

export default {
    props: ['type','relations'],
    data () {
        return {
            newNodes: 7,
            currentRelation: this.relations[0].id,
        }
    },
    components: {
        ConceptMap,
        Sidebar
    },
    mounted () {
    },
    methods: {
        id2relation (id) {
            return this.relations.find(e => e.id == id)
        },
        getRelationDescription (relation) {
            let ctype=this.type.charAt(0).toUpperCase()+this.type.substring(1);
            let source = ctype+' 1';
            let target = ctype+' 2';

            return "\""+source+" "+relation.name+" "+target+"\" means: "+relation.description.replaceAll('SOURCE',source).replaceAll('TARGET',target);
        },
        mapCurrent (mapNode) {
            this.$emit('nodeselected',mapNode);
        }
    },
    computed: {
        allNodes () {
            var it = {}, nodeIds = []
            UnitsCollection.find({type: this.type}).fetch().forEach(c => {
            //this.all.forEach(c => {
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
            return {"nodes": nodes, "links": links};
        },
    },
    meteor: {
        currentUser() {
            return Meteor.user();
        },
    }
}
</script>