<template>
 <v-container>
    <v-row>
        <v-col xs="12" md="8">
           
            <v-row xs="12" md="8" align="center">
                <v-col
                    class="d-flex"
                    md="3"
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
                    md="3"
                    cols="12"
                    sm="6"
                >
                    <v-select
                    :items="views"
                    label="View"
                    v-model="session.view"
                    ></v-select>
                </v-col>
                <v-col
                    class="d-flex"
                    md="3"
                    cols="12"
                    sm="6"
                >
                    <v-select
                    :items="distance"
                    label="Distance"
                    v-model="session.neighbourhood"
                    ></v-select>
                </v-col>
                <v-col
                    class="d-flex"
                    md="3"
                    cols="12"
                    sm="6"
                >
                    <v-select
                    :items="newItems"
                    label="New since..."
                    v-model="session.newNodes"
                    ></v-select>
                </v-col>
                <v-col
                    class="d-flex"
                    md="3"
                    cols="12"
                    sm="6"
                >
                    <v-select
                    :items="nodeForms"
                    label="Nodes as..."
                    v-model="session.nodeForm"
                    ></v-select>
                </v-col>
                <v-col
                    class="d-flex"
                    md="3"
                    cols="12"
                    sm="6"
                >
                    <v-select
                    :items="directions"
                    label="Follow links..."
                    v-model="session.direction"
                    ></v-select>
                </v-col>
            </v-row>
            <v-card class="mx-auto">
               <v-card-actions>
                   <v-btn text color="blue" @click="reveal = !reveal">Graph Legend</v-btn>
               </v-card-actions>
               <v-expand-transition>
                   <v-card v-if="reveal" class="transition-fast-in-fast-out v-card--reveal" style="height: 100%;">
                       <v-card-text>
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
            <p>The last selected {{ session.type }} is shown in <span style="background-color:pink; color: black;">pink</span>. The last {{ session.type }} selected in the graph is shown in <span style="background-color:brown; color: white;">brown</span>.</p>
                       </v-card-text>
                   </v-card>
               </v-expand-transition>
           </v-card>
        </v-col>
        <v-col xs="12" md="4">
            <sidebar :relations="relations" title='' mode="list"></sidebar>
        </v-col>
    </v-row>
    <Maps :key="session.relation+newNodes+orientation+session.view+session.neighbourhood+session.nodeForm+session.direction" :cmap="mapNodes" :orientation="orientation"></Maps>
 </v-container>
</template>

<script>
import { UnitsCollection } from "../../api/UnitsCollection";
import Maps from "./Maps.vue";
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
            newItems: [
                {text: '1 day', value: 1},
                {text: '2 days', value: 2},
                {text: '3 days', value: 3},
                {text: '7 days', value: 7},
                {text: '14 days', value: 14},
                {text: '30 days', value: 30}
            ],
            directions: [
                {text: 'Outgoing', value: 'out'},
                {text: 'Incoming', value: 'in'},
                {text: 'Both', value: 'both'}
            ],
            views: ['2D', '3D'],
            view: '2D',
            distance: [1,2,3,4,5],
            nodeForms: ['symbol','text'],
            reveal: false
        }
    },
    components: {
        Maps,
        Sidebar
    },
    mounted () {
        
    },
    methods: {
        id2relation (id) {
            return this.relations.find(e => e.id == id);
        },
    },
    computed: {
        subject () {
            if (this.session.id) {
                let name=UnitsCollection.findOne({_id: this.session.id}).title;
                return "The "+this.session.type+" "+name;
            } else {
                return "All "+this.session.type+"s"
;            }
        },
        mapNodes() {
            return(this.session.id)?this.neighbourhood:this.allNodes;
        },
        allNodes () {
            let myNodes=UnitsCollection.find({type: this.session.type}).fetch();
            let linkRels=UnitsCollection.find({
                    type: 'relation', 
                    name: this.session.relation, 
                }).fetch();
            if (!this.sameType) {
                const r=this.id2relation(this.session.relation);
                if (this.session.type == r.sourceType) {
                    linkRels.forEach(ll => {
                        if (! myNodes.find(nx => nx._id == ll.target))
                            myNodes.push(UnitsCollection.findOne({_id: ll.target}));
                    });
                };
                if (this.session.type == r.targetType) {
                    linkRels.forEach(ll => {
                        if (! myNodes.find(nx => nx._id == ll.source)) 
                            myNodes.push(UnitsCollection.findOne({_id: ll.source}));
                    });
                };
            }
           
           const nodeIds=myNodes.map(n => n._id);
            let nodeStatus={};
            if (this.currentUser) {
                UnitsCollection.find({type: 'note',
                    item: {$in: nodeIds},
                    userId: this.currentUser._id
                }).fetch().forEach(n => {
                    nodeStatus[n.item]=n.status;
                });
            }
           
            let links = [],nodes = [];
            myNodes.forEach(n => {
                let nid=n._id;
                let color="lightblue";
                const back = new Date().getTime()-parseInt(this.newNodes)*24*60*60*1000;
                switch (nodeStatus[nid]) {
                    case "100": color="green"; break;
                    case "2": color="yellow"; break;
                    case "150": color="red"; break;
                    default: color="lightblue";
                }
                let updated=new Date(n.updatedAt).getTime();
                let isNew = (updated && updated > back)?true:false;
                if (nodeStatus[nid]) group=nodeStatus[nid];
                let nodeval=UnitsCollection.find({$or: [{target: nid, type: 'relation'},{source: nid, type: 'relation'}]}).fetch().length/3; // Denominator may be varied for readability
                nodes.push({"id": nid, "title": n.title, "color": color, "isNew": isNew, val: nodeval, type: n.type});
            });
            
            linkRels.forEach(r => {
                links.push({source: r.source, target: r.target})
            });
            
            return {"nodes": nodes, "links": links};
        },
        neighbourhood() {
			let node=this.allNodes.nodes.find(n => (n.id==this.session.id)), d=this.session.neighbourhood;
			if (! node) console.log('ShowAll:178 node', session.id,'not found');
            const cid=node.id;
			function linkSourceId(link) {
				return ((typeof link.source) == 'object')?link.source.id:link.source;
			}
			function linkTargetId(link) {
				return ((typeof link.target) == 'object')?link.target.id:link.target;
			}
			
            let id=0, newNodeIds=[cid],nodeIds=[cid];
            while (id < d) {
                let  nextNodeIds=[];

                if (this.session.direction != 'in') {
                    this.allNodes.links.filter(ll => newNodeIds.includes(linkSourceId(ll))).forEach(lf => {
					nextNodeIds.push(linkTargetId(lf))
				    });
                }
				if (this.session.direction != 'out') {
                    this.allNodes.links.filter(ll => newNodeIds.includes(linkTargetId(ll))).forEach(lf => {
					nextNodeIds.push(linkSourceId(lf))
				    });
                }
				
				
                let nextNodeReduced=[...new Set(nextNodeIds)].filter(item => (! nodeIds.includes(item)));
                nodeIds=nodeIds.concat(nextNodeReduced);
                newNodeIds=[...nextNodeReduced];
                id++;
            }
			
			let nodes=this.allNodes.nodes.filter(nn => nodeIds.includes(nn.id));
			let links=this.allNodes.links.filter(nn => (nodeIds.includes(linkSourceId(nn)) && nodeIds.includes(linkTargetId(nn))));
			
            return {nodes: nodes, links: links};
        },
        sameType () {
            const r=this.id2relation(this.session.relation);
            return (r.sourceType == r.targetType);
        },
        newNodes () {
            return this.session.newNodes;
        },
        markNew () {
            return (this.session.view == '2D')?"are marked with an <span style='border:solid orange; border-radius: 10px; padding: 1px;'>orange ring</span>":"are shown surrounded by an <span style='border:solid orange; padding: 1px;'>orange polygon</span>";
        }
    },

    meteor: {
        currentUser() {
            return Meteor.user();
        },
    }
    
}
</script>