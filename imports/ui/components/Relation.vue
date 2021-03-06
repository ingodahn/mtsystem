<template>
    <div class="container">
        <v-expansion-panels accordion>
            <v-expansion-panel>
                <v-expansion-panel-header>Info</v-expansion-panel-header>
                <v-expansion-panel-content>
                    <p v-html="getRelationDescription(relation)"></p>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>
        <div v-if="mode == 'list' && session.mode != 'graph' && current.title">
            <div v-if="relation.sourceType == session.type">
                <v-select v-if="getCurrentNodeIsSource(relation.id).length" :items="getCurrentNodeIsSource(relation.id)" :label="current.title+' '+relation.name" item-text="title" item-value="_id" v-model="selectedTarget" return-object hide-details="auto"></v-select>
                <p v-else>{{ current.title }} {{ relation.name }} no {{ relation.targetType }} in this system.</p>
            </div>
            <div v-if="relation.targetType == session.type">
                <v-select v-if="getCurrentNodeIsTarget(relation.id).length" :items="getCurrentNodeIsTarget(relation.id)" :label="current.title+' '+relation.inverse" item-text="title" item-value="_id" v-model="selectedSource" return-object hide-details="auto"></v-select>
                <p v-else>{{ current.title }} {{ relation.inverse }} no {{ relation.sourceType }} in this system.</p>
            </div>
        </div>
        <div v-if="mode == 'update'">
            <div v-if="relation.sourceType == session.type" data-app>
                <v-autocomplete
                    label="Targets:"
                    v-model="targets"
                    hide-details="auto"
                    :items="graph"
                    item-text="title"
                    item-value="_id"
                    clearable
                    deletable-chips
                    multiple
                    small-chips
                ></v-autocomplete>
            </div>
            <div v-else>To modify this relation: Edit relation <b>{{relation.name}}</b> for {{ relation.sourceType }}s.</div>
        </div>
    </div>
</template>

<script>
import { UnitsCollection } from "../../api/UnitsCollection";

export default {
    data () {
        return {
            targets: this.getTargets(),
            selectedTarget: {},
            selectedSource: {}
        }
    },
    props: ['relation', 
        //'mode',
        'targetsSet'
        ],
    created () {
        //this.session=this.$root.$data.session;
    },
    watch: {
        targets: function (t) {
            this.$emit('setTarget',this.relation.id,t);
            },
        selectedSource: function(n) {
            this.selected(n);
        },
        selectedTarget: function(n) {
            this.selected(n);
        }
    },
    methods: {
         // Concepts of which the current node is a target
        getCurrentNodeIsTarget (relationId) {
            const rds = UnitsCollection.find({
                type: 'relation',
                name: relationId,
                target: this.session.id
            }).fetch().map(d => d.source);
            this.currentAbove=rds;
            rs=UnitsCollection.find({_id: {$in: rds}},{sort: { title: 1}}).fetch();
            return rs;
        },
        // Concepts of which the current node is a source
        getCurrentNodeIsSource (relationId) {
            let session=this.$root.$data.session;
            const rds = UnitsCollection.find({
                type: 'relation',
                name: relationId,
                source: session.id
            }).fetch().map(d => d.target);
            this.currentBelow=rds;
            rs=UnitsCollection.find({_id: {$in: rds}},{sort: { title: 1}}).fetch();
            return rs;
        },
        
        getRelationDescription (relation) {
            let stype=relation.sourceType;
            let sString=stype.charAt(0).toUpperCase()+stype.substring(1);
            let ttype=relation.targetType;
            let tString=ttype.charAt(0).toUpperCase()+ttype.substring(1);
            let source = '';
            let target = '';
            let desc="<b>Relation</b> ";
            if (relation.sourceType == this.session.type) {
                source = (this.current.title.length)?this.current.title:sString+' 1';
                target = tString+' 2';
                desc+= "<em>"+source+"</em> <b>"+relation.name+"</b> <em>"+target+"</em></p><p><b>Means:</b> "+relation.description.replaceAll('SOURCE','<em>'+source+'</em>').replaceAll('TARGET','<em>'+target+'</em>')+"</p>";
                if (relation.targetType == this.session.type) desc += "<p><b>Inverse:</b> <em>"+target+"</em> <b>"+relation.inverse+"</b> <em>"+source+"</em>";
            } else {
                target=(this.current.title.length)?this.current.title:tString+' 2';
                source=sString+" 1";
                desc += target+" <b>"+relation.inverse+"</b> "+source+"</p><p><b>Means:</b> "+relation.description.replaceAll('SOURCE','<em>'+source+'</em>').replaceAll('TARGET','<em>'+target+'</em>')+"</p>"
            }            
            return desc;
        },
        selected (doc) {
            this.session.set('id',doc._id);
            this.session.set('type',doc.type);
            this.session.set('edit',false);
        },
        getTargets () {
            if (this.targetsSet) return this.targetsSet;
            if (! this.$root.$data.session.id) return [];
            return this.getCurrentNodeIsSource(this.relation.id).map(e => e._id)
        }
    },
     
    computed: {
        session () {
            return this.$root.$data.session;
        },
        mode () {
            return (this.session.mode=='new' || this.session.mode=='update')?'update':'list';
        },
        current () {
            
            if (!this.session.id) {
                return {title: ""};
            }
            
            return UnitsCollection.findOne({_id: this.session.id});
        },
        targetUpdated () {
            this.$emit('setTarget',this.session.type,this.targets);
            return this.targets;
        }
    },
    meteor: {
        all() {
        return UnitsCollection.find(
            {type: this.relation.targetType},
            {sort: { title: 1}}
        ).fetch();
        },
    }
    
}
</script>