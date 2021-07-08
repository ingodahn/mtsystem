<template>
    <div class="container">
        <p> {{ getRelationDescription(relation) }}</p>
        <v-list v-if="getCurrentNodeIsBelow(relation.id).length">
            <v-subheader>{{ current.title }} {{ relation.name }}:</v-subheader>
            <v-list-item-group>
                <v-list-item v-for="item in getCurrentNodeIsBelow(relation.id)" :key="item._id" @click="selected(item)">                           
                    <v-list-item-content>
                        <v-list-item-title v-text="item.title"></v-list-item-title>
                    </v-list-item-content>                               
                </v-list-item>
            </v-list-item-group>
        </v-list>
        <p v-else>{{ current.title }} {{ relation.name }} nothing else.</p>
        <v-list v-if="getCurrentNodeIsAbove(relation.id).length">
            <v-subheader>{{ current.title }} {{ relation.inverse }}:</v-subheader>
            <v-list-item-group>
                <v-list-item v-for="item in getCurrentNodeIsAbove(relation.id)" 
                :key="item._id" @click="selected(item)">                           
                    <v-list-item-content>
                        <v-list-item-title v-text="item.title"></v-list-item-title>
                    </v-list-item-content>                               
                </v-list-item>
            </v-list-item-group>
        </v-list>
        <p v-else>{{ current.title }} {{ relation.inverse }} nothing else.</p>
    </div>
</template>

<script>
import { UnitsCollection } from "../../api/UnitsCollection";

export default {
    data () {
        return {
        }
    },
    props: ['relation', 'id', 'type'],
    methods: {
        getCurrentNodeIsAbove (relation) {
            const rds = UnitsCollection.find({
                type: 'relation',
                name: relation,
                target: this.id
            }).fetch().map(d => d.source);
            this.currentAbove=rds;
            rs=UnitsCollection.find({_id: {$in: rds}}).fetch();
            return rs;
        },
        // Concepts of which the current node is a subnode
        getCurrentNodeIsBelow (relation) {
            const rds = UnitsCollection.find({
                type: 'relation',
                name: relation,
                source: this.id
            }).fetch().map(d => d.target);
            this.currentBelow=rds;
            rs=UnitsCollection.find({_id: {$in: rds}}).fetch();
            return rs;
        },
        getRelationDescription (relation) {
            let source = (this.current.title.length)?this.current.title:this.type+' 1';
            let target = this.type+' 2';

            return "\""+source+" "+relation.name+" "+target+"\" means: "+relation.description.replaceAll('SOURCE',source).replaceAll('TARGET',target);
        },
        selected (doc) {
            //console.log(doc);
            this.$emit('selected',doc);
        }
    },
     
    computed: {
        current () {
            return UnitsCollection.findOne({_id: this.id});
        }
    }
    
}
</script>