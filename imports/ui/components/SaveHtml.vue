<template>
  <v-container>
    <v-btn color="primary" @click="saveHtml">Save as HTML</v-btn>
  </v-container>
</template>

<script>
export default {
    props: ['graph'],
    data () {
        return {
            session: this.$root.$data.session,
        }
    },
    computed: {
        head () {
            let head=`<!DOCTYPE html>
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
            if (this.session.view=='3D') {
                head += '<script src="https://unpkg.com/3d-force-graph"><\/script>';
            }  else {
                head += '<script src="https://unpkg.com/force-graph"><\/script>';
            }
            head += '</head>';
            return head;
        },
        body () {
            let body = "<body>\
            <h1> Graph to HTML</h1>\
            <div id='mapId'></div>\
            <script>";
            body += 'let graphData = '+this.graph+";";
            if (this.session.view=='3D') {
                body += "const Graph = ForceGraph3D({ controlType: 'orbit' })(document.getElementById('mapId'));"
            } else {
                body += "const Graph = ForceGraph()(document.getElementById('mapId'));"
            }
            body += `
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
                d.id == `+this.session.id ? this.colors.sessionNode : d.color+
            `)
            .nodeLabel((node) => \`${node.title}\`)
        .linkColor((r) => {
          return r.relation == this.session.relation
            ? this.colors.primaryRelation
            : this.colors.otherRelation;
        })
        .d3Force(
          "link",
          d3
            .forceLink()
            .id((d) => d.id)
            .distance(100)
            .strength(1)
        )
        .width(this.$refs[this.mapId].clientWidth)
        .height(Math.max(this.$refs[this.mapId].clientHeight, 800))
        .onNodeDragEnd((node) => {
          node.fx = node.x;
          node.fy = node.y;
        })
        .onNodeClick((node) => this.nodeClicked(node))
        .cooldownTicks(this.session.freeze ? 0 : 2000);

            `
                    
            body += `<\/script>\
            </body>\
            </html>`;
        }
    },
    methods: {
        saveHtml () {
            let html=this.head + this.body+'</html>';
            var FileSaver = require("file-saver");
            var blob = new Blob([html], { type: "text/html;charset=utf-8" });
            FileSaver.saveAs(blob, "graph.html");
        }
    }
}
</script>