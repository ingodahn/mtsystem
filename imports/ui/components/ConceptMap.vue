<template>
  <mindmap
          :nodes="nodes"
          :connections="connections"
          :editable="true"
  />
</template>

<script>
import map from "./map";
  import { UnitsCollection } from "../../api/UnitsCollection";
  export default {
      name: 'MyMindmap',
      props: ["cid"],
      data() {
          return {
              ...map
              //nodes: [],
              //connections: []
          }
      },
      /*
      created() {
        this.nodes=this.getNodes(this.cid);
        console.log(this.nodes);
      },
      */
      methods: {
        getNodes(mid) {
          const doc = this.getDoc(mid);
          console.log(doc.see);
          return [{
            'text':doc.title,
            'url': doc.see,
            'fx': -13.916222252976013,
            'fy': -659.1641376795345,
            'category': 'wiki',
            'note': 'My <b>Note</b>'
          }];
          /*
          return [{
            'text': 'python',
            'url': 'http://www.wikiwand.com/en/Python_(programming_language)',
            'fx': -13.916222252976013,
            'fy': -659.1641376795345
          }];
          */
        },
        getDoc(mid) {
          const docsFound = UnitsCollection.find(
            {_id: mid, type: "concept"}
          ).fetch();
          const doc=docsFound[0];
          return doc;
        }
      }
  }
</script>