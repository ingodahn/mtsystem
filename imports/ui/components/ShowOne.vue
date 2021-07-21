<template>
    <v-container>
        <v-layout row>
            <v-row>
                <v-flex xs12 md8>
                    <h2> {{ current.title }}</h2>
                        <show-math-doc :key="current.description" v-if="current.description " :content="current.description"></show-math-doc>
                        <div v-if="current.readMore">
                            <v-btn v-if="! showMore" @click="showMore=true">Read more...</v-btn>
                            <show-math-doc :key="current.readMore" v-if="showMore" :content="current.readMore"></show-math-doc>
                            <v-btn v-if="showMore" @click="showMore=false">Show less</v-btn>
                        </div>
                        <div v-if="current.see">
                            <a :href="current.see" target="_blank">See also</a>
                        </div>
                </v-flex>
                <v-flex xs12 md4>
                    <sidebar :currentId="currentId" :title="current.title" :type="type" :relations="relations" mode="list" v-on:setNode="setNode"></sidebar>
                </v-flex>
            </v-row>
        </v-layout>
    </v-container>
</template>

<script>
import { UnitsCollection } from '../../api/UnitsCollection';
import ShowMathDoc from "./ShowMathDoc.vue";
import Sidebar from "./Sidebar.vue";
export default {
    props: ['currentId','relations','type'],
    
    data () {
        return {
            current: {title: "Default title"},
            currentRelation: this.relations[0].id,
            showMore: false,
        }
    },
    
    
    components: {
        ShowMathDoc,
        Sidebar
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
        }
    },
    meteor: {
        
    }
}

</script>