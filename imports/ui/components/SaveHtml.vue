<template>
  <v-container>
    <v-btn color="primary" class="mx-1 my-1" @click="saveHtml"
      >Save as HTML</v-btn
    >
  </v-container>
</template>

<script>
import { UnitsCollection } from "../../api/UnitsCollection";

export default {
  props: [],
  data() {
    return {
      session: this.$root.$data.session,
      colors: {
        default: "blue",
        sessionNode: "deeppink",
        selectedNode: "brown",
        primaryRelation: "red",
        otherRelation: "green",
      },
      base: 'https://mathtrek.eu/',
    };
  },
  computed: { 
    head() {
      let head = `<!DOCTYPE html>
            <html lang='en'>
            <head>
            <title>MathTrek</title>
            <meta charset="utf-8"/>
            <!-- KaTeX dependency -->
            <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css'  integrity='sha256-V8SV2MO1FUb63Bwht5Wx9x6PVHNa02gv8BgH/uH3ung=' crossorigin='anonymous'>
            <script src='https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.js' integrity='sha256-F/Xda58SPdcUCr+xhSGz9MA2zQBPb0ASEYKohl8UCHc=' crossorigin='anonymous'><\/script>
            <script src='https://cdn.jsdelivr.net/npm/katex@0.13.11/dist/contrib/auto-render.min.js' integrity='sha384-vZTG03m+2yp6N6BNi5iM4rW4oIwk5DfcNdFfxkk9ZWpDriOkXX8voJBFrAO7MpVl' crossorigin='anonymous'><\/script>
            <!-- Force Graph for Maps -->
            <script src='https://unpkg.com/d3-dsv'><\/script>
            <script src='https://unpkg.com/dat.gui'><\/script>
            <script src='https://unpkg.com/d3-quadtree'><\/script>
            <script src='https://unpkg.com/d3-force'><\/script>
            `;
      if (this.session.view == "3D") {
          if (this.session.nodeForm == 'Text') head+=   '<script src="https://unpkg.com/three"><\/script>\
          <script src="https://unpkg.com/three-spritetext"><\/script>';
        head += '<script src="https://unpkg.com/3d-force-graph"><\/script>';
      } else {
        head += '<script src="https://unpkg.com/force-graph"><\/script>';
      }
      head += "<link rel='stylesheet' type='text/css' href='"+this.base+"css/enterprise.css' />";
      head += "</head>";
      return head;
    },
    body() {
      const graph = this.$parent.graphForHtml();
      graph.nodes.forEach((node) => {
        const dbNode = UnitsCollection.findOne({ _id: node.id });
        if (dbNode) {
          node.see = dbNode.see;
          const desc = dbNode.description;
          const regex = /(<p>[\s\S]*?<\/p>)/gm;
          const corresp = regex.exec(desc);
          const firstParagraph = corresp
            ? corresp[0]
            : "No description available";
          node.firstParagraph = firstParagraph
            ? firstParagraph
            : "No description available";
        }
      });
      let nodeTitle = graph.nodes.find((n) => {
        return n.id == this.session.id;
      }).title;
      let body =`
        <body>
            <div class='container'>
                <h1 class='heading'>MathTrek environment of ` +
        nodeTitle +
        `</h1>
          <div include-html='info.html'></div>
            <div id='mapContainer'>
                <div id='mapId'></div>
            </div>
            <div id='sidebar'>
                <div id='infoHead'>Info</div>
                <div id='infoBody'>InfoBody</div>
            </div>
          </div>
        <script>
        `;
      body += "let sessionId = '" + this.session.id + "', primaryRelation = '"+this.session.relation+"';";
      body += "let graphData = " + JSON.stringify(graph) + ";";
     
      body += `
      <\/script>
      <script src="`+this.base+'js/'+this.session.view+this.session.nodeForm+'.js"><\/script>'+
      `
      </body>
            `;
      return body;
    },
  },
  methods: {
    saveHtml() {
      let html = this.head + this.body + "</html>";
      var FileSaver = require("file-saver");
      var blob = new Blob([html], { type: "text/html;charset=utf-8" });
      FileSaver.saveAs(blob, "index.html");
    },
  },
};
</script>