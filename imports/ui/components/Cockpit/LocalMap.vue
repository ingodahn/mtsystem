<template>
    <div>
        <h2>MathTrek Window</h2>
        <ConceptMap :key="currentId+currentRelation+newNodes" :cmap="neighbourhood(1)" v-on:nodeclicked="setNode" orientation=null view="3D"></ConceptMap>
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
            currentId: this.location,
            //currentRelation: null,
            newNodes: [],
        }
    },
    components: {
        ConceptMap
    },
    methods: {
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
                    //case "2": color="yellow"; break;
                    case "150": color="red"; break;
                    default: color="lightblue";
                }
                let updated=new Date(UnitsCollection.findOne({_id: c}).updatedAt).getTime();
                //let today = new Date()
                let isNew = (updated && updated > back)?true:false;
                if (c == this.currentId) color="yellow";
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
    },
    computed: {
        currentRelation () {
            return this.session.relation;
        }
    }
}
</script>