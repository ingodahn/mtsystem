<template>
 <v-container>
      <Maps :key="mapKey" :cmap="mapNodes"></Maps>
 </v-container>
</template>

<script>
import { UnitsCollection } from "../../api/UnitsCollection";
import Maps from "./Maps.vue";


export default {
    props: ['relations','allTyped'],
    data () {
        return {
            session: this.$root.$data.session,
            orientations: [
                {text: 'None', value: ''},
			  	{text: 'Bottom up', value: 'bu'} ,
                {text: 'Top down', value: 'td'},
				{text: 'Left-right', value: 'lr'},
				{text: 'Right-left', value:'rl'},
				{text: 'Out', value: 'radialout'} ,
				{text: 'In', value: 'radialin'} 
			],
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
            nodeForms: ['Symbols','Text'],
            reveal: false
        }
    },
    components: {
        Maps
    },
    created () {
    },
    mounted () {
    },
    methods: {
        id2relation (id) {
            return this.relations.find(e => e.id == id);
        },
        coordMap(coords) {
            let nodes=UnitsCollection.find({_id: {$in: Object.keys(coords)}}).fetch().map(n => {return {id: n._id, title: n.title, type: n.type, updatedAt: n.updatedAt}});
            nodes.forEach(n => {
                let c=coords[n.id];
                n.x=c.x;
                n.fx=c.fx;
                n.y=c.y;
                n.fy=c.fy;
                if (this.session.view=='3D') {
                    n.z=c.z;
                    n.fz=c.fz;
                }
            });
            let nodeIds=nodes.map(n => n.id);
            let links=UnitsCollection.find({type: 'relation', name: this.session.relation, source: {$in: nodeIds}, target: {$in: nodeIds}}).fetch().map(ll =>{return {source: ll.source, target: ll.target}});
            return {nodes: nodes, links: links};
        },
        decorate(graph) {
            const nodeIds=graph.map(n => n.id);
            let nodeStatus={};
            if (this.currentUser) {
                UnitsCollection.find({type: 'note',
                    item: {$in: nodeIds},
                    userId: this.currentUser._id
                }).fetch().forEach(n => {
                    nodeStatus[n.item]=n.status;
                });
            }
            graph.nodes.forEach(n => {
                let nid=n._id;
                let color="blue";
                const back = new Date().getTime()-parseInt(this.session.newNodes)*24*60*60*1000;
                switch (nodeStatus[nid]) {
                    case "100": color="green"; break;
                    case "2": color="yellow"; break;
                    case "150": color="red"; break;
                    default: color="blue";
                }
                n.color=color;
                let updated=new Date(n.updatedAt).getTime();
                n.isNew = (updated && updated > back)?true:false;
                if (nodeStatus[nid]) group=nodeStatus[nid];
                let nodeval=UnitsCollection.find({$or: [{target: nid, type: 'relation'},{source: nid, type: 'relation'}]}).fetch().length/3; // Denominator may be varied for readability
                n.val=nodeval;
            });
        }
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
        mapKey () {
            return this.session.relation+this.session.newNodes+this.session.orientation+this.session.view+this.session.neighbourhood+this.session.nodeForm+this.session.direction+this.session.id;
        },
        mapNodes() {
            //if (this.$root.$data.coords) return coordMap(this.$root.$data.coords);
            //return JSON.parse(JSON.stringify((this.session.id)?this.neighbourhood1:this.allNodes)) ;
            return (this.session.id)?this.neighbourhood:this.allNodes;
        },
        allNodes () {
            let myNodes=this.allTyped;
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
                let color="blue";
                const back = new Date().getTime()-parseInt(this.session.newNodes)*24*60*60*1000;
                switch (nodeStatus[nid]) {
                    case "100": color="green"; break;
                    case "2": color="yellow"; break;
                    case "150": color="red"; break;
                    default: color="blue";
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
        neighbourhood () {
            console.log("GraphicsMode-178 called");
            let node=UnitsCollection.findOne({_id: this.session.id}), d=this.session.neighbourhood;
            if (! node && this.session.debug) console.log('GraphicsMode:178 node', session.id,'not found');
            const cid=node._id;
			
            let id=0, newNodeIds=[cid],nodeIds=[cid];
            while (id < d) {
                let  nextNodeIds=[];
                if (this.session.direction != 'in') {
                    UnitsCollection.find({type: 'relation', name: this.session.relation, source: {$in: newNodeIds}}).fetch().forEach(lf => nextNodeIds.push(lf.target));
                }
                if (this.session.direction != 'out') {
                    UnitsCollection.find({type: 'relation', name: this.session.relation, target: {$in: newNodeIds}}).fetch().forEach(lf => nextNodeIds.push(lf.source));
                }
                let nextNodeReduced=[...new Set(nextNodeIds)].filter(item => (! nodeIds.includes(item)));
                nodeIds=nodeIds.concat(nextNodeReduced);
                newNodeIds=[...nextNodeReduced];
                id++;
            }
            console.log('nodeIds',nodeIds);
            let nodeStatus={};
            if (this.currentUser) {
                UnitsCollection.find({type: 'note',
                    item: {$in: nodeIds},
                    userId: this.currentUser._id
                }).fetch().forEach(n => {
                    nodeStatus[n.item]=n.status;
                });
            }
            const back = new Date().getTime()-parseInt(this.session.newNodes)*24*60*60*1000;
            let nodes = [], nodeTitle = {};
            UnitsCollection.find({_id: {$in: nodeIds}}).fetch().forEach(n => {
                let updated=new Date(n.updatedAt).getTime();
                let isNew = (updated && updated > back)?true:false;
                let color="blue";
                let nid=n._id;
                nodeTitle[nid]=n.title;
                switch (nodeStatus[nid]) {
                    case "100": color="green"; break;
                    case "2": color="yellow"; break;
                    case "150": color="red"; break;
                    default: color="blue";
                }
                let nodeval=UnitsCollection.find({$or: [{target: nid, type: 'relation'},{source: nid, type: 'relation'}]}).fetch().length/3; // Denominator 
                nodes.push({"id": n._id, "title": n.title, "type": n.type, "color": color, "isNew": isNew, "val": nodeval})
            });
            let rels=[]
            if (this.session.otherRelations) {
                rels=UnitsCollection.find({type: 'relation', source: {$in: nodeIds}, target: {$in: nodeIds}});
            } else {
                rels=UnitsCollection.find({type: 'relation', name: this.session.relation, source: {$in: nodeIds}, target: {$in: nodeIds}});
            }
            let links=[];
            rels.forEach(r => {
                links.push({source: r.source, target: r.target, relation: r.name, name: nodeTitle[r.source]+' '+this.ids2RelationNames[r.name]+' '+nodeTitle[r.target]});
            });
            console.log("Maps-230",{nodes: nodes, links: links});
            return {nodes: nodes, links: links};
        },
        
        sameType () {
            const r=this.id2relation(this.session.relation);
            return (r.sourceType == r.targetType);
        },
        
        markNew () {
            return (this.session.view == '2D')?"are marked with an <span style='border:solid orange; border-radius: 10px; padding: 1px;'>orange ring</span>":"are shown surrounded by an <span style='border:solid orange; padding: 1px;'>orange polygon</span>";
        },
        ids2RelationNames () {
            let ir={};
            this.relations.forEach(r => {ir[r.id]=r.name;});
            return ir;
        }
    },

    meteor: {
        currentUser() {
            return Meteor.user();
        },
    }
    
}
</script>