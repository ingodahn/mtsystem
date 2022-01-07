<template>
    <div class="container">
        <h1>MathTrek System Administration</h1>
        <p>This is the admin page</p>
        <div>
        <v-btn @click="makeExport()">Export</v-btn>
        <v-btn @click="makeImport()">Replace Collection</v-btn>
        <v-btn @click="checkRelation()">Check Relation</v-btn>
        <v-btn @click="changeRelation()">Change Relation</v-btn>
        <v-btn @click="query()">Query</v-btn>
        </div>
        <div>
          <v-select v-model="session.type" :items="typeItems" label="Source and TargetType"></v-select>
          <v-select v-model="session.relation" :items="relationItems" label="Relation"></v-select>
          <p>Found {{ allRelations.length }} pairs</p>
          <ul>
            <li v-for="(p, index) in paths" :key=index>
              <p>From {{ p.source }} to {{ p.target }} through {{ p.through }}</p>
            </li>
          </ul>
        </div>
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
      session: this.$root.$data.session,
      paths: []
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
          let trans=[];
          
          this.allRelations.forEach((r,i,a) => {
            console.log(i,'/',a.length);
            let sid=r.source, tid=r.target;
            let s=UnitsCollection.findOne({_id: sid});
            let t=UnitsCollection.findOne({_id: tid});
            let sP={nodes: {},relations: {}};
            this.getParents(s,this.session.relation,sP,tid);
            let tC={nodes: {},relations: {}}
            this.getChildren(t,this.session.relation,tC,sid);
            let path=Object.keys(sP.nodes).filter(n => Object.keys(tC.nodes).includes(n));
            if (path.length>0) {
              this.paths.push({source: s.title, target: t.title, through: path.map(n => sP.nodes[n].title).join(', ')});
              trans.push({source: s, target: t, path: path, sP: sP, tC: tC});
            }
          });
          console.log(trans);
          
        },
        changeRelation () {
          if (confirm("Do you REALLY want to replace all data on "+window.location.href+'?')) {
            const allRels=UnitsCollection.find({
            type: 'relation',
            name: 'PbuildsOnP'
            }).fetch();
            
            allRels.forEach(r => {
              console.log('Old source',r.source,'old target', r.target);
                let s=r.source;
                r.source=r.target;
                r.target=s;
                r.name="PinspiredP";
                //console.log('New source',r.source,'new target', r.target);
                Meteor.call('updateItem',r);
            });
            alert(allRels.length+' items changed');
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
        getChildren(node,relation,ancestors,X=null) {
          let rel = UnitsCollection.find({type: 'relation', name: relation, target: node._id}).fetch();
          rel.forEach(r => {
            if (r.source != X) {
              let rid = r._id;
              ancestors.relations[rid] = r;
              if (! ancestors.nodes.hasOwnProperty(rid)){
                let nr = UnitsCollection.findOne({_id: r.source});
                ancestors.nodes[nr._id]=nr;
                this.getChildren(nr,relation,ancestors,X);
              }
            }
          })
      },
      getParents(node,relation,predecessors,X={}) {
          let rel = UnitsCollection.find({type: 'relation', name: relation, source: node._id}).fetch();
          rel.forEach(r => {
            if (r.target !=X) {
              let rid = r._id;
              predecessors.relations[rid] = r;
              if (! predecessors.nodes.hasOwnProperty(rid)){
                let nr = UnitsCollection.findOne({_id: r.target});
                predecessors.nodes[nr._id]=nr;
                this.getParents(nr,relation,predecessors,X);
              }
            }
          })
      }
    },
    computed: {
      typeItems () {
        return ['subject','concept','theorem','person'];
      },
      relationItems () {
            return relations.filter(e => (e.sourceType == this.session.type && e.targetType == this.session.type)).map(d => {return {text: d.name, value: d.id}});
      },
      allRelations () {
        let rels=[]
        if (this.session.relation) rels=UnitsCollection.find({type: 'relation', name: this.session.relation}).fetch()
        return rels;
      }
    },
    meteor: {
      items() {
        return UnitsCollection.find({}).fetch();
      },
      
    }
}
</script>