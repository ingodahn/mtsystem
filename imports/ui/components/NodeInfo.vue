<template>
    <v-row>
        <v-col xs="12" md="12">
            <h2>{{currentNode.title}}</h2>
            <div v-html="currentNode.firstParagraph"></div>
        </v-col>
    </v-row>
</template>

<script>
import { UnitsCollection } from "../../api/UnitsCollection";

export default {
    props: ['nodeId'],

    computed: {
       currentNode () {
            const node=UnitsCollection.findOne({_id: this.nodeId})
            if (node) {
                desc = node.description
                const regex = /(<p>[\s\S]*?<\/p>)/gm;
                const corresp = regex.exec(desc);
                const firstParagraph = (corresp) ? corresp[0] : "No description available";
                return {title: node.title, firstParagraph: firstParagraph};
            } else {
                return {title: "Description", firstParagraph: "Description of the current node"};
            }           
        },
    }
}
</script>