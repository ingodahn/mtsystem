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
        <div v-if="mode == 'list' && current.title">
            <v-list v-if="getCurrentNodeIsSource(relation.id).length">
                <v-subheader>{{ current.title }} {{ relation.name }}:</v-subheader>
                <v-list-item-group>
                    <v-list-item v-for="item in getCurrentNodeIsSource(relation.id)" :key="item._id" @click="selected(item)">                           
                        <v-list-item-content>
                            <v-list-item-title v-text="item.title"></v-list-item-title>
                        </v-list-item-content>                               
                    </v-list-item>
                </v-list-item-group>
            </v-list>
            <p v-else>{{ current.title }} {{ relation.name }} nothing else.</p>
            <div v-if="relation.targetType == type">
                <v-list v-if="getCurrentNodeIsTarget(relation.id).length">
                    <v-subheader>{{ current.title }} {{ relation.inverse }}:</v-subheader>
                    <v-list-item-group>
                        <v-list-item v-for="item in getCurrentNodeIsTarget(relation.id)" 
                        :key="item._id" @click="selected(item)">                           
                            <v-list-item-content>
                                <v-list-item-title v-text="item.title"></v-list-item-title>
                            </v-list-item-content>                               
                        </v-list-item>
                    </v-list-item-group>
                </v-list>
                <p v-else>{{ current.title }} {{ relation.inverse }} nothing else.</p>
            </div>
        </div>
        <div v-if = "mode == 'update'">
            <div v-if="relation.sourceType == type" data-app>
                <v-autocomplete
                    label="Targets:"
                    v-model="targets"
                    hide-details="auto"
                    :items="all"
                    item-text="title"
                    item-value="_id"
                    clearable
                    deletable-chips
                    multiple
                    small-chips
                ></v-autocomplete>
            </div>
            <div v-else>Edit relation <b>{{relation.name}}</b> for {{ relation.sourceType }}s.</div>
        </div>
    </div>
</template>

<script>
import { Session } from "meteor/session";
import { UnitsCollection } from "../../api/UnitsCollection";

export default {
    data () {
        return {
            // _ids of target
            targets: this.getTargets()
        }
    },
    props: ['relation', 'id', 'type','mode','targetsSet'],
    watch: {
        targets: function (t) {
            this.$emit('setTarget',this.relation.id,t);
            }
    },
    methods: {
         // Concepts of which the current node is a target
        getCurrentNodeIsTarget (relationId) {
            const rds = UnitsCollection.find({
                type: 'relation',
                name: relationId,
                target: this.id
            }).fetch().map(d => d.source);
            this.currentAbove=rds;
            rs=UnitsCollection.find({_id: {$in: rds}},{sort: { title: 1}}).fetch();
            return rs;
        },
        // Concepts of which the current node is a source
        getCurrentNodeIsSource (relationId) {
            const rds = UnitsCollection.find({
                type: 'relation',
                name: relationId,
                source: this.id
            }).fetch().map(d => d.target);
            this.currentBelow=rds;
            rs=UnitsCollection.find({_id: {$in: rds}},{sort: { title: 1}}).fetch();
            return rs;
        },
        getRelationDescription (relation) {
            console.log(relation);
            let stype=relation.sourceType;
            let sString=stype.charAt(0).toUpperCase()+stype.substring(1);
            let ttype=relation.targetType;
            let tString=ttype.charAt(0).toUpperCase()+ttype.substring(1);
            let source = (this.current.title.length)?this.current.title:sString+' 1';
            let target = tString+' 2';
            let desc="<b>Relation</b> ";
            console.log(relation);
            if (relation.sourceType == this.type) {
                desc+= "<em>"+source+"</em> <b>"+relation.name+"</b> <em>"+target+"</em></p><p><b>Means:</b> "+relation.description.replaceAll('SOURCE','<em>'+source+'</em>').replaceAll('TARGET','<em>'+target+'</em>')+"</p>";
                if (relation.targetType == this.type) desc += "<p><b>Inverse:</b> <em>"+target+"</em> <b>"+relation.inverse+"</b> <em>"+source+"</em>";
            } else {
                desc += target+" <b>"+relation.inverse+"</b> "+source+"</p><p><b>Means:</b> "+relation.description.replaceAll('SOURCE','<em>'+source+'</em>').replaceAll('TARGET','<em>'+target+'</em>')+"</p>"
            }            
            return desc;
        },
        selected (doc) {
            //this.$emit('selected',doc);
            this.$emit('selectedId',doc._id);
        },
        getTargets () {
            if (this.targetsSet) return this.targetsSet;
            if (! this.id) return [];
            console.log(this.relation);
            return this.getCurrentNodeIsSource(this.relation.id).map(e => e._id)
        }
    },
     
    computed: {
        current () {
            
            if (!this.id) {
                return {title: ""};
            }
            
            return UnitsCollection.findOne({_id: this.id});
        },
        targetUpdated () {
            this.$emit('setTarget',this.type,this.targets);
            return this.targets;
        }
    },
    meteor: {
        all() {
            console.log(this.relation);
        return UnitsCollection.find(
            {type: this.relation.targetType},
            {sort: { title: 1}}
        ).fetch();
        },
    }
    
}
</script>