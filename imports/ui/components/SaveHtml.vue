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
    };
  },
  computed: {
    head() {
      let head = `<!DOCTYPE html>
            <html lang='en'>
            <head>
            <title>mathtrek</title>
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
      head += `
            <style>
              #mapContainer {
                float:left;
                width: 66%
              }
              #sidebar {
                float:right;
                width: 34%;
              }
              #mapId {
				margin: 1em;
			  }
            </style>
            `;
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
      let body =
        "<body>\
            <div class='container'>\
                <h1 class='heading'>MathTrek environment of " +
        nodeTitle +
        "</h1>\
            <div id='mapContainer'>\
                <div id='mapId'></div>\
            </div>\
            <div id='sidebar'>\
                <div id='infoHead'>Info</div>\
                <div id='infoBody'>InfoBody</div>\
            </div>\
            </div>\
            <script>";
      body += "let currentId = '', sessionId = '" + this.session.id + "';";
      body += `
            let currentColor='deeppink';
            function nodeClicked(node)
            {
                if (node.id == currentId) return;
                if (currentId) {
                    let oldNode = graphData.nodes.find(n => { return (n.id == currentId);});
                    oldNode.color=currentColor;
                }                
                currentColor = node.color;
                currentId = node.id;
                node.color='brown';
                let infoHead = document.getElementById('infoHead');
                let infoBody = document.getElementById('infoBody');
                let myColor=node.id == sessionId?'background-color: pink;color: black;':'background-color: brown;color: white;'
                infoHead.innerHTML = '<a href="'+node.see+'" target="_blank"><h3 style="'+myColor+'text-align: center;">'+node.title+'</h3></a>';
                infoBody.innerHTML = '<p>'+node.firstParagraph+'</p>';
                renderMathInElement(infoBody,{
                    delimiters: [
                        {left: '$$', right: '$$', display: true},
                        {left: '$', right: '$', display: false},
                        {left: '\\\\(', right: '\\\\)', display: false},
                        {left: '\\\\[', right: '\\\\]', display: true}
                    ],
                    throwOnError : false
                });
            }            
            `;
      body += "let graphData = " + JSON.stringify(graph) + ";";
      if (this.session.view == "3D") {
        body +=
          "const Graph = ForceGraph3D({ controlType: 'orbit' })(document.getElementById('mapId'));";
      } else {
        body += "const Graph = ForceGraph()(document.getElementById('mapId'));";
      }
      body +=
        `
            Graph.linkWidth(5)
            .linkDirectionalParticles(10)
            .linkDirectionalParticleWidth(2.5)
            .linkDirectionalParticleSpeed((d) => 0.005)
            .linkDirectionalParticleColor(() => {
                return "white";
                })
            .nodeRelSize(6)
            .nodeId("id")
            .nodeColor((d) =>
                d.id == '` +
        this.session.id +
        "'? '" +
        this.colors.sessionNode +
        "':d.color)" +
        `
            .nodeLabel((node) => \`\${node.title}\`)
            .linkColor((r) => {
            return r.relation == '` +
        this.session.relation +
        "'? '" +
        this.colors.primaryRelation +
        "':'" +
        this.colors.otherRelation +
        "';" +
        `
            })
            .d3Force(
                "link",
                d3
                    .forceLink()
                    .id((d) => d.id)
                    .distance(100)
                    .strength(1)
            )
            .width(document.querySelector('#mapId').clientWidth)
            .height(Math.max(document.querySelector('#mapId').clientHeight,800))
            .onNodeDragEnd((node) => {
                node.fx = node.x;
                node.fy = node.y;
            })
            .onNodeClick((node) => nodeClicked(node));`;
      if (this.session.nodeForm != "Symbols") {
        if (this.session.view == "3D") {
          body += `
                    Graph.nodeThreeObject((node) => {
          const sprite = new SpriteText(node.title);
          sprite.material.depthWrite = false;
          sprite.color = node.color;
          sprite.textHeight = 20;
          return sprite;
        });
                    `;
        } else {
          body += `
                    Graph.nodeCanvasObject((node, ctx, globalScale) => {
          const label = node.title;
          const fontSize = 12 / globalScale;
          ctx.font = \`\${fontSize}px Sans-Serif\`;
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth, fontSize].map(
            (n) => n + fontSize * 0.2
          ); // some padding

          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          ctx.fillRect(
            node.x - bckgDimensions[0] / 2,
            node.y - bckgDimensions[1] / 2,
            ...bckgDimensions
          );

          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = node.color;
          ctx.fillText(label, node.x, node.y);

          node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
        }).nodePointerAreaPaint((node, color, ctx) => {
          ctx.fillStyle = color;
          const bckgDimensions = node.__bckgDimensions;
          bckgDimensions &&
            ctx.fillRect(
              node.x - bckgDimensions[0] / 2,
              node.y - bckgDimensions[1] / 2,
              ...bckgDimensions
            );
        });
                    `;
        }
      }

      body += `
            Graph.cooldownTicks(0)
            .graphData(graphData);
            nodeClicked(graphData.nodes.find(n => {return (n.id==sessionId)}));
            `;

      body += `<\/script>\
            </body>\
            `;
      return body;
    },
  },
  methods: {
    saveHtml() {
      let html = this.head + this.body + "</html>";
      var FileSaver = require("file-saver");
      var blob = new Blob([html], { type: "text/html;charset=utf-8" });
      FileSaver.saveAs(blob, "graph.html");
    },
  },
};
</script>