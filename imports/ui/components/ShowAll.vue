<template>
 <v-container>
    <v-row>
        <v-col xs="12" md="8">
            <h3>All {{ session.type }}s <span v-if="sameType"> and the relation <em>{{ id2relation(session.relation).name }}</em></span></h3>      
            <p>Click node for details. Drag nodes to pin. Size indicates weight w.r.t. all relations.</p>
            <p v-if="currentUser">Color distinguishes 
                <span style="background-color:green; color: white;">{{ session.type }}s I know</span> from 
                <span style="background-color:yellow">{{ session.type }}s I am exploring</span> and
                <span style="background-color:red; color: white;">{{ session.type }}s I find interesting</span>. 
            </p>
            <!-- This bypasses session.set: !? -->
            <p>The {{ session.type }}s, that have been updated in the last 
                <select v-model="session.newNodes">
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>7</option>
                    <option>14</option>
                    <option>30</option>
                </select>      
            days, <span v-html="markNew"></span>.
            </p>
            <v-row xs="12" md="8" align="center">
                <v-col
                    class="d-flex"
                    cols="12"
                    sm="6"
                >
                    <v-select
                    :items="orientations"
                    label="Orientation"
                    v-model="orientation"
                    ></v-select>
                </v-col>
                <v-col
                    class="d-flex"
                    cols="12"
                    sm="6"
                >
                    <v-select
                    :items="views"
                    label="View"
                    v-model="view"
                    ></v-select>
                </v-col>
            </v-row>
            
        </v-col>
        <v-col xs="12" md="4">
            <sidebar :relations="relations" title='' mode="list"></sidebar>
        </v-col>
    </v-row>
            <ConceptMap :key="session.relation+newNodes+orientation+view" :cmap="allNodes" v-on:nodeclicked="mapCurrent" :orientation="orientation" :view="view"></ConceptMap>
 </v-container>
</template>

<script>
import { Session } from "meteor/session";
import { UnitsCollection } from "../../api/UnitsCollection";
import ConceptMap from "./ConceptMap.vue";
import Sidebar from "./Sidebar.vue";


export default {
    props: ['relations'],
    data () {
        return {
            session: this.$root.$data.session,
            orientations: [
                {text: 'None', value: null},
			  	{text: 'Bottom up', value: 'bu'} ,
                {text: 'Top down', value: 'td'},
				{text: 'Left-right', value: 'lr'},
				{text: 'Right-left', value:'rl'},
				{text: 'Out', value: 'radialout'} ,
				{text: 'In', value: 'radialin'} 
			],
            orientation: null,
            views: ['2D', '3D'],
            view: '2D'
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
            return this.relations.find(e => e.id == id);
        },
        mapCurrent (mapNode) {
            this.$emit('nodeselected',mapNode);
        }
    },
    computed: {
        allNodes () {
            var it = {}, nodeIds = []
            UnitsCollection.find({type: this.session.type}).fetch().forEach(c => {
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
            let linkRels = [];
           if (this.sameType) {
                linkRels =UnitsCollection.find({
                    type: 'relation', 
                    name: this.session.relation, 
                    //Same-Type-Links only!
                    source: {$in: nodeIds}
                }).fetch();
           }
            
            
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
                let isNew = (updated && updated > back)?true:false;
                if (nodeStatus[c]) group=nodeStatus[c];
                let nodeval=UnitsCollection.find({$or: [{target: c, type: 'relation'},{source: c, type: 'relation'}]}).fetch().length/3; // Denominator may be varied for readability
                nodes.push({"id": c, "title": it[c], "color": color, "isNew": isNew, val: nodeval});
            });
            
            linkRels.forEach(r => {
                links.push({source: r.source, target: r.target})
            });
            return {"nodes": nodes, "links": links};
        },
        sameType () {
            const r=this.id2relation(this.session.relation);
            return (r.sourceType == r.targetType);
        },
        newNodes () {
            return this.session.newNodes;
        },
        markNew () {
            return (this.view == '2D')?"are marked with an <span style='border:solid orange; border-radius: 10px; padding: 1px;'>orange ring</span>":"are shown as a ring";
        }
    },

    meteor: {
        currentUser() {
            return Meteor.user();
        },
    }
    
}
</script>