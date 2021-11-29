<template>
<div>
    <v-row>
        <v-col xs="12" md="10">
            <Map3D v-if="this.session.view=='3D'" :cmap="allNodes" :orientation="orientation" :zoomTo="zoomTarget"  v-on:nodeclicked="nodeClicked"></Map3D>
        </v-col>
        <v-col xs="12" md="2">
            <h2>SpaceMap</h2>
            <v-btn color="primary" @click="zoomTo('out')">Zoom Out</v-btn>
        </v-col>
    </v-row>
</div>
</template>

<script>
import Map3D from "../Map3D.vue";
import { UnitsCollection } from "../../../api/UnitsCollection";
export default {
    data () {
        return {
            session: this.$root.$data.session,
            orientation: null,
            zoomTarget: 'out'
        };
    },
    props: ['relations'],
    components: {
        //ConceptMap,
        Map3D
    },
    methods: {
        id2relation (id) {
            return this.relations.find(e => e.id == id);
        },
        selectLocal(node) {
            this.session.id=node;
            this.$emit('selectLocal', node);
        },
        zoomTo (id) {
            console.log('zoomTo in Spacemap',id);
            this.zoomTarget = id;
        },
        nodeClicked(nodeId) {
			this.zoomTarget=nodeId;
            console.log('zoomTarget in SpaceMap is now ',this.zoomTarget);
			this.$emit('spacemapclicked',nodeId);
		}     
    },
    computed: {
           allNodes () {
            var it = {}, nodeIds = []
            if (!this.session.type) {
                this.session.type='subject';
                this.session.relation='SisBelowS';
            }
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
            return (this.session.view == '2D')?"are marked with an <span style='border:solid orange; border-radius: 10px; padding: 1px;'>orange ring</span>":"are shown as a ring";
        }
    }
}
</script>