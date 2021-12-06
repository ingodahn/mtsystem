<template>
    <div>
        <v-row>
            <v-col xs="12" md="10">
                <Map3D v-if="this.session.view=='3D'" :key="session.id+distance" :cmap="neighbourhood" :orientation="orientation" :zoomTo="zoomTarget"  v-on:nodeclicked="nodeClicked"></Map3D>
            </v-col>
            <v-col xs="12" md="2">
                <h2>{{currentNode.title}}</h2>
                <v-btn color="primary" @click="zoomTo('out')">Zoom Out</v-btn>
                <v-btn color="primary" @click="showMore">More</v-btn>
                <v-btn color="primary" @click="showLess">Less</v-btn>
                
                <div v-html="currentNode.firstParagraph"></div>
                <v-btn color="primary" @click="explore">Explore</v-btn>
            </v-col>
        </v-row>
    </div>
</template>

<script>
import Map3D from "../Map3D.vue";
import { UnitsCollection } from "../../../api/UnitsCollection"

export default {
    props: {
    },
    data () {
        return {
            session: this.$root.$data.session,
            orientation: null,
            newNodes: [],
            zoomTarget: 'out',
            distance: 1
        }
    },
    components: {
        Map3D,
    },
    mounted() {
        /*
        console.log('LocalMap mounted with session:', this.session.id);
            if (!this.session.id) {
                const defaultLocation = {
                    subject: "Mathematics",
                    concept: "Function space",
                    theorem: "Fundamental theorem of calculus"
                }
                let d=UnitsCollection.findOne({type: this.session.type, title: defaultLocation[this.session.type]});
                if (!d)console.log('LocalMap: Location not found');
                else this.session.id=d._id;
            }
            */
    },
    
    methods: {
        setNode (id) {
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
        showMore () {
            this.distance += 1;
        },
        showLess () {
            if (this.distance > 0) this.distance -= 1;
        },
        explore () {
            console.log('explore in Window',this.session.id);
            this.$emit('explore',this.session.id);
        },
    },
    computed: {
        currentRelation () {
            return this.session.relation;
        },
        neighbourhood() {
            console.log('Computing neighbourhood of ',this.session.id);
            var it = {}, nodes=[], links = [];
            UnitsCollection.find({type: this.session.type}).fetch().forEach(c => {
                it[c._id]=c.title;
            });
            const cid=this.session.id;
            let id=0, newNodeIds=[cid],nodeIds=[cid],linkIds=[];
            while (id < this.distance) {
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
                if (c == this.session.id) color="pink";
                if (nodeStatus[c]) group=nodeStatus[c];
                nodes.push({"id": c, "title": it[c], "color": color, "isNew": isNew});
            });
            linkIds.forEach(r => {
                links.push({source: r.source, target: r.target})
            });
            return {"nodes": nodes, "links": links};
        },
        currentNode () {
            const node=UnitsCollection.findOne({_id: this.session.id})
            if (node) {
                desc = node.description
                const regex = /(<p>[\s\S]*?<\/p>)/gm;
                const corresp = regex.exec(desc);
                const firstParagraph = (corresp) ? corresp[0] : "No description available";
                return {title: node.title, firstParagraph: firstParagraph};
            } else {
                return {title: "Window", firstParagraph: "The window shows the local environment"};
            }           
        },      
    }
}
</script>