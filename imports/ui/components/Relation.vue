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
        <div v-if = "mode == 'update'">
            <div data-app>
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
            let ctype=this.type.charAt(0).toUpperCase()+this.type.substring(1);
            //let source = (this.current.title.length)?this.current.title:ctype+' 1';
            let source = ctype+' 1';
            let target = ctype+' 2';
            let desc="<b>Relation</b> "+source+" <b>"+relation.name+"</b> "+target+"</p><p><b>Means:</b> "+relation.description.replaceAll('SOURCE',source).replaceAll('TARGET',target)+"</p>";
            desc += "<p><b>Inverse:</b> "+target+" <b>"+relation.inverse+"</b> "+source;
            return desc;
        },
        selected (doc) {
            //this.$emit('selected',doc);
            this.$emit('selectedId',doc._id);
        },
        getTargets () {
            if (this.targetsSet) return this.targetsSet;
            if (! this.id) return [];
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
        return UnitsCollection.find(
            {type: this.type},
            {sort: { title: 1}}
        ).fetch();
        },
    }
    
}
</script>