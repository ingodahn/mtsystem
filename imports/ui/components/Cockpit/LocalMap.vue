<template>
    <div>
        <v-row>
            <v-col xs="12" md="10">
                <ConceptMap :key="session.relation+session.newNodes+'windows'" :cmap="neighbourhood(100)" v-on:nodeclicked="nodeClicked" orientation=null view="3D" :zoomTo="zoomTarget"></ConceptMap>
            </v-col>
            <v-col xs="12" md="2">
                <h2>Window</h2>
                <v-btn color="primary" @click="zoomTo('out')">Zoom Out</v-btn>
            </v-col>
        </v-row>
    </div>
</template>

<script>
import ConceptMap from "../ConceptMap.vue";
import { UnitsCollection } from "../../../api/UnitsCollection"

export default {
    props: {
        location: {type: String, default: 'xaTAqFNYuu5rWDm5m'},
    },
    data () {
        return {
            session: this.$root.$data.session,
            //currentRelation: null,
            newNodes: [],
            zoomTarget: 'out'
        }
    },
    components: {
        ConceptMap
    },
    watch: {
        location (newVal, oldVal) {
            console.log('Watching in LocalMap, new location:',newVal);
            this.session.id = newVal;
        }
    },
    
    methods: {
            neighbourhood(d) {
            var it = {}, nodes=[], links = [];
            UnitsCollection.find({type: this.session.type}).fetch().forEach(c => {
                it[c._id]=c.title;
            });
            const cid=this.session.id;
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
                if (c == this.session.id) color="pink";
                if (nodeStatus[c]) group=nodeStatus[c];
                nodes.push({"id": c, "title": it[c], "color": color, "isNew": isNew});
            });
            linkIds.forEach(r => {
                links.push({source: r.source, target: r.target})
            });
            return {"nodes": nodes, "links": links};
        },
        setNode (id) {
            //this.$emit('setNode',id);
            this.session.set('id',id);
        },
        nodeClicked(nodeId) {
			this.zoomTarget=nodeId;
            this.session.set('id',nodeId);
            this.session.id=nodeId;
            console.log('zoomTarget in Window is now ',this.zoomTarget);
			this.$emit('localclicked',nodeId);
		},     
        zoomTo (id) {
            console.log('zoomTo in Window',id);
            this.zoomTarget = id;
        },
    },
    computed: {
        currentRelation () {
            return this.session.relation;
        }
    }
}
</script>