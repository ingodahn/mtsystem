<template>
    <v-container>
        <v-row>
            <v-col xs="12" md="8">
                <h2> {{ current.title }}</h2>
            </v-col>
            <v-col xs="12" md="4">
                <v-btn color="primary" id="btnRelated" @click="session.set('mode','all')" :disabled="allRelated">Related {{ relatedType }}s</v-btn>
                <v-btn color="primary" @click="allRelated = !allRelated" id="allrelated">{{ btnTextAllRelated }}</v-btn>
            </v-col>
        </v-row>
        <v-row v-if="allRelated">
            <v-col xs="12" md="8">
            <v-card class="mx-auto">
               <v-card-actions>
                   <v-btn text color="blue" @click="reveal = !reveal">Graph Legend</v-btn>
               </v-card-actions>
               <v-expand-transition>
                   <v-card v-if="reveal" class="transition-fast-in-fast-out v-card--reveal" style="height: 100%;">
                       <v-card-text>
                    <p>Click node for details. Drag nodes to pin.
                    Color distinguishes 
                        <span style="background-color:red; color: white;">Subjects</span> from
                        <span style="background-color:yellow">Concepts</span>,
                        <span style="background-color:blue; color: white">Theorems</span> and
                        <span style="background-color:green; color: white;">Persons</span>.
                    </p>
                    <p>The last selected node in the graph is shown in <span style="background-color:brown; color: white;">brown</span>.</p>
                       </v-card-text>
                   </v-card>
               </v-expand-transition>
           </v-card>
            </v-col>
           <Maps :cmap="allRelatedMap" :orientation="session.orientation"></Maps>
        </v-row>
        <v-row v-else>
            <v-col xs="12" md="8">
                <show-math-doc :key="current.description" v-if="current.description " :content="current.description"></show-math-doc>
                <v-row v-if="current.readMore">
                    <v-btn v-if="! showMore" @click="showMore=true">Show more...</v-btn>
                    <show-math-doc :key="current.readMore" v-if="showMore" :content="current.readMore"></show-math-doc>
                    <v-btn v-if="showMore" @click="showMore=false">Show less</v-btn>
                </v-row>
                <v-row v-if="current.see" class="wiki" >
                    <a :href="current.see" target="_blank">See also</a>
                </v-row>
                <v-row class="wiki" >
                    <a :href="wikiUrl" target="_blank">MathTrek-Wiki</a> (comments, discussions)
                </v-row>
            </v-col>
            <v-col xs="12" md="4">
                <sidebar :currentId="currentId" :title="current.title" :type="type" :relations="relations" mode="list"></sidebar>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { UnitsCollection } from '../../api/UnitsCollection';
import ShowMathDoc from "./ShowMathDoc.vue";
import Sidebar from "./Sidebar.vue";
import Maps from "./Maps.vue";

export default {
    props: ['relations'],
    
    data () {
        return {
            session: this.$root.$data.session,
            current: {title: "Default title"},
            showMore: false,
            allRelated: false,
            reveal: false,
        }
    },
    
    
    components: {
        ShowMathDoc,
        Sidebar,
        Maps
    },
    
    mounted () {
        
        const myCurrent=UnitsCollection.findOne({_id: this.currentId});
        if (myCurrent) { this.current=myCurrent;
        }
        
        else {
            console.log(this.currentId+' not found');
        }
        
    },
    methods: {
        id2relation (id) {
            return this.relations.find(e => e.id == id)
        },
        getRelationDescription (relation) {
            let ctype=this.type.charAt(0).toUpperCase()+this.type.substring(1);
            let source = this.current.title;
            let target = ctype+' 2';

            return "\""+source+" "+relation.name+" "+target+"\" means: "+relation.description.replaceAll('SOURCE',source).replaceAll('TARGET',target);
        },
        targetsSet(relationId) {
            //if (this.updateRelations.hasOwnProperty(relationId)) return this.updateRelations[relationId];
            return false;
        },
        getCurrent () {
            let cu = UnitsCollection.findOne({_id: this.currentId});
            if (cu) return cu;
            console.log(this.currentId+' not found');
            return {}
        },
        setNode (id) {
            this.$emit('setNode',id);
        },
        
    },
    computed: {
        currentId () {
            return this.session.id;
        },
        type () {
            return this.session.type;
        },
        relatedType () {
            const type = this.session.type;
            let cr = this.relations.find(r => r.id==this.session.relation);
            if (!cr || type != cr.sourceType && type != cr.targetType) {
                cr = this.relations.find(r => (r.sourceType == type || r.targetType == type));
                this.session.set('relation', cr.id,"ShowOne:130");
            }
            return (cr.sourceType == this.session.type)?cr.targetType:cr.sourceType;
        },
        relationNames () {
            let rn={};
            this.relations.forEach(r => {
                rn[r.id]=r.name;
            });
            return rn;
        },
        wikiUrl () {
            const base = "https://wiki.mathtrek.eu?title=";
            let title=this.current.title.replaceAll(" ","_",);
            title=title.replaceAll("'","%27");
            title=title.replaceAll("^","%5E")
            return base+title;
        },
        btnTextAllRelated () {
            return (this.allRelated)?"Single Relation":"All Related";
        },
        allRelatedMap () {
            const primaryRel={subject: 'SisBelowS', concept: 'CisBelowC',theorem: 'TisBelowT', person: 'PinspiredP'};
            let pRel=primaryRel[this.session.type];
            function childNodes(nodeIds) {
                let rels=UnitsCollection.find({type: 'relation', name: pRel, target: {$in: nodeIds}}).fetch();
                return [... new Set(rels.map( r=>r.source))];
            }
            let newNodes=[this.currentId];
            let ancestors=[];
            for (var i=0; i < this.session.neighbourhood; i++) {
                let myNodes=childNodes(newNodes);
                myNodes.forEach(n => ancestors.push(n));
                newNodes=myNodes;
            }
            let uniqueNodes=[... new Set(ancestors)];
            let cmap={nodes:[],links:[]};
            let rids=UnitsCollection.find({type: 'relation', target: {$in: uniqueNodes}}).fetch().map(r=>r.source);
            let ids=[... new Set(rids.concat(uniqueNodes))];
            let rels=UnitsCollection.find({type: 'relation', source:{$in: ids}, target: {$in: ids}}).fetch();
            function typeColor (type) {
                switch (type) {
                    case 'subject': return 'red'
                    case 'concept': return 'yellow'
                    case 'theorem': return 'blue'
                    case 'person': return 'green'
                    default: return 'lightblue'
                }
            }
            cmap.nodes=UnitsCollection.find({_id: {$in: ids}}).fetch().map(d => {return {id: d._id, title: d.title, type: d.type, color: typeColor(d.type)}});
            cmap.links=rels.map(r => {return {source: r.source, target: r.target, name: this.relationNames[r.name]}});
            return cmap;
        }
    },
    meteor: {
        
    }
}

</script>

<style scoped>
.wiki {
    margin-top: 1em
}
</style>