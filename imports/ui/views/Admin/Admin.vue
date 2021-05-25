<template>
    <div class="container">
        <h1>MathTrek System Administration</h1>
        <p>This is the admin page</p>
        <v-btn @click="setField('type','unit')">Set field</v-btn>
        <v-btn @click="makeRelation('concept','below','isBelow')">Make Relation</v-btn>
        <v-btn @click="makeExport()">Export</v-btn>
    </div>
</template>

<script>
import { UnitsCollection } from "../../../api/UnitsCollection";
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
        }
    },
    meteor: {
      items() {
        return UnitsCollection.find({}).fetch();
      }
    }
}
</script>