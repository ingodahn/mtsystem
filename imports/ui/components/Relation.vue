<template>
    <div class="container">
        <p> {{ getRelationDescription(relation) }}</p>
        <div v-if="mode == 'list'">
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
            console.log(t);
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
            rs=UnitsCollection.find({_id: {$in: rds}}).fetch();
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
            rs=UnitsCollection.find({_id: {$in: rds}}).fetch();
            console.log(rs);
            return rs;
        },
        getRelationDescription (relation) {
            let ctype=this.type.charAt(0).toUpperCase()+this.type.substring(1);
            let source = (this.current.title.length)?this.current.title:ctype+' 1';
            let target = ctype+' 2';

            return "\""+source+" "+relation.name+" "+target+"\" means: "+relation.description.replaceAll('SOURCE',source).replaceAll('TARGET',target);
        },
        selected (doc) {
            //console.log(doc);
            this.$emit('selected',doc);
        },
        getTargets () {
            console.log('getTargets called');
            if (this.targetsSet) return this.targetsSet;
            return this.getCurrentNodeIsSource(this.relation.id).map(e => e._id)
        }
    },
     
    computed: {
        current () {
            return UnitsCollection.findOne({_id: this.id});
        },
        targetUpdated () {
            console.log('updated');
            this.$emit('setTarget',this.type,this.targets);
            return this.targets;
        }
    },
    meteor: {
        all() {
            console.log(this.type);
        return UnitsCollection.find(
            {type: this.type}
        ).fetch();
        },
    }
    
}
</script>