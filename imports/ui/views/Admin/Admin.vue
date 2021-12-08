<template>
    <div class="container">
        <h1>MathTrek System Administration</h1>
        <p>This is the admin page</p>
        <v-btn @click="makeExport()">Export</v-btn>
        <v-btn @click="makeImport()">Replace Collection</v-btn>
        <v-btn @click="checkRelation()">Check Relation</v-btn>
        <v-btn @click="changeRelation()">Change Relation</v-btn>
        <v-btn @click="query()">Query</v-btn>
    </div>
</template>

<script>
import { UnitsCollection } from "../../../api/UnitsCollection";
import { mtdata } from "./mtData.js";
import {relations} from '/imports/config.js'
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
            var FileSaver=require('file-saver');
            var blob=new Blob([expString], {type: "text/plain;charset=utf-8"})
            FileSaver.saveAs(blob,"mtData.js");
        },
        makeImport () {
          if (confirm("Do you REALLY want to replace all data on "+window.location.href+'?')) {
            Meteor.call('deleteItem',{
            });
            mtdata.forEach(document => {
              Meteor.call('insertItem',document);
            })
          }
        },
        checkRelation () {
          const allRels=UnitsCollection.find({
            type: 'relation',
            name: 'isBelow'
          }).fetch();
          var typeErrors=0;
          var checked=0;
          allRels.forEach(r => {
            checked++;
            let s=UnitsCollection.findOne({_id: r.source});
            if (! s) {console.log('No source'); return;}
            let t=UnitsCollection.findOne({_id: r.target});
            if (! t) {console.log('No target'); return;}
            if (s.type != t.type) typeErrors++;
          });
          alert(typeErrors+=" Errors in "+checked+" items");
        },
        changeRelation () {
          if (confirm("Do you REALLY want to replace all data on "+window.location.href+'?')) {
            const allRels=UnitsCollection.find({
            type: 'relation',
            name: 'isBelow'
            }).fetch();
            var typeErrors=0;
            var checked=0;
            allRels.forEach(r => {
              checked++;
              let s=UnitsCollection.findOne({_id: r.source});
              let st= 'no source'
              if (! s) {
                console.log('No source'); return;
                } else {
                  st=s.type;
                }
              let t=UnitsCollection.findOne({_id: r.target});
              let tt='no target'
              if (! t) {
                console.log('No target'); return;
                } else {
                  tt=t.type;
                }

              if (st != tt) typeErrors++;
              else {
                switch (st) {
                  case 'subject':
                    r.name='SisBelowS';
                    break;
                  case 'concept':
                    r.name='CisBelowC';
                    break;
                  case 'theorem':
                    r.name='TisBelowT';
                    break;
                  case 'person':
                    r.name='PbuildsOnP';
                    break;
                  default:
                    console.log('Unhandled type '+st);
                    typeErrors++;
                }
                Meteor.call('updateItem',r);
              }
            });
            alert(typeErrors+=" Errors in "+checked+" items");
          }
        },
        query () {
          let rtypes={
          };
          relations.forEach(r => {
            rtypes[r.id]= {
              source: r.sourceType,
              target: r.targetType
            }
          })
          
          let errcount=0, checked=0 ;
          const r=UnitsCollection.find({
            type: 'relation'
          }).fetch();
          r.forEach(d => {
            checked++
            let n=d.name;
            let s=UnitsCollection.findOne({_id: d.source});
            let t=UnitsCollection.findOne({_id: d.target});
            if (rtypes[n].source != s.type || rtypes[n].target != t.type) {
              Meteor.call('deleteItem',d);
              errcount++;
            }
          })
          alert(errcount+' entries deleted from '+checked+' entries');
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