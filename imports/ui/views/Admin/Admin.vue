<template>
    <div class="container">
        <h1>MathTrek System Administration</h1>
        <p>This is the admin page with {{ count }}</p>
        <v-btn @click="makeExport()">Export</v-btn>
        <v-btn @click="makeImport()">Replace Collection</v-btn>
    </div>
</template>

<script>
import { UnitsCollection } from "../../../api/UnitsCollection";
import { mtdata } from "./mtData.js";
import Vue from 'vue'
export default {
  data () {
    return {
      session: this.$root.$data.session
    }
  },
  created () {
    //Session.set('counter',0);
  },
    methods: {
        makeExport() {
            const allDocs=UnitsCollection.find({}).fetch();
            var expString="export const mtdata = " + JSON.stringify(allDocs)+';';
            uriContent = "data:application/octet-stream," + encodeURIComponent(expString);
            newWindow = window.open(uriContent, 'neuesDokument');
        },
        makeImport () {
             Meteor.call('deleteItem',{
                });
            mtdata.forEach(document => {
                Meteor.call('insertItem',document);
            })
        },
       
        getChildren(node,relation,ancestors) {
          let rel = UnitsCollection.find({type: 'relation', name: relation, target: node._id}).fetch();
          rel.forEach(r => {
              let rid = r._id;
              ancestors.relations[rid] = r;
              if (! ancestors.nodes.hasOwnProperty(rid)){
                let nr = UnitsCollection.findOne({_id: r.source});
                ancestors.nodes[nr._id]=nr;
                this.getChildren(nr,relation,ancestors);
              }
          })
      }
    },
    computed: {
    },
    meteor: {
      items() {
        return UnitsCollection.find({}).fetch();
      },
      
    }
}
</script>