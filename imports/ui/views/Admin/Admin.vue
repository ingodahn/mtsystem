<template>
    <div class="container">
        <h1>MathTrek System Administration</h1>
        <p>This is the admin page</p>
        <v-btn @click="setField('type','unit')">Set field</v-btn>
        <v-btn @click="makeRelation('concept','below','isBelow')">Make Relation</v-btn>
        <v-btn @click="makeExport()">Export</v-btn>
        <v-btn @click="makeImport()">Replace Collection</v-btn>
        <v-btn @click="makeTopics()">Make Topics</v-btn>
    </div>
</template>

<script>
import { UnitsCollection } from "../../../api/UnitsCollection";
import { mtdata } from "./mtData.js";
import Vue from 'vue'
export default {
    methods: {
        setField(name,value) {
            this.items.forEach(item => {
                item[name]=value;
                UnitsCollection.update(
                    {_id: item._id},
                    {
                    $set: item
                    }
                );
            });
        },
        makeRelation(myType,from,to) {
            const docs=UnitsCollection.find({type: myType}).fetch();
            docs.forEach(d => {
                di=d._id;
                console.log(d.title);
                if (d[from]) {
                    d[from].forEach(i => {
                        UnitsCollection.insert({
                            type: "relation",
                            name: to,
                            source: di,
                            target: i
                        });
                    })
                }
            })
        },
        makeExport() {
            const allDocs=UnitsCollection.find({}).fetch();
            var expString=JSON.stringify(allDocs);
            uriContent = "data:application/octet-stream," + encodeURIComponent(expString);
            newWindow = window.open(uriContent, 'neuesDokument');
        },
        makeImport () {
             Meteor.call('deleteItem',{
                });
            console.log(mtdata[0]);
            mtdata.forEach(document => {
                Meteor.call('insertItem',document);
            })
        },
        makeTopics () {
            const topics = this.topics;
            let titles=Object.values(topics.nodes).forEach(n => {
                n.type='topic';
                console.log('Updating '+n.title);
                Meteor.call('updateItem',n);
            })
            console.log(titles);
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
      topics () {
          let top = UnitsCollection.findOne({title: "Concept"});
          let nid = top._id;
            let ancestors= {
                nodes: {
                },
                relations: {}
            };
            ancestors.nodes[nid]=top;
          this.getChildren(top,'isBelow',ancestors);
          return ancestors;
      },
      
    }
}
</script>