<template>
  <v-row class="container" ref="conti">
    <v-col xs="12" md="8">
      <div :id="mapId" :ref="mapId"></div>
    </v-col>
    <v-col xs="12" md="4">
      <v-row>
        <h2>Panel</h2>
      </v-row>
      <v-row>
        <div class="select" data-app>
          <v-autocomplete
            label="Select a node"
            v-model="selectedId"
            hide-details="auto"
            :items="nodeItems"
            item-text="title"
            item-value="id"
            @change="nodeClicked(selectedId)"
          ></v-autocomplete>
        </div>
        <v-btn
          color="primary"
          class="mx-1 my-1"
          @click="explore"
          :disabled="!currentNode"
          >Explore</v-btn
        >
        <v-btn
          color="primary"
          class="mx-1 my-1"
          @click="showAll"
          :disabled="!session.id"
          >Show all</v-btn
        >
        <v-btn
          color="primary"
          class="mx-1 my-1"
          @click="saveGraph()"
          :disabled="!currentNode"
        >
          Save Graph</v-btn
        >
      </v-row>

      <v-row v-if="session.view == '3D'"><h3>Camera control</h3></v-row>
      <v-row v-if="session.view == '3D'">
        <v-btn color="primary" class="mx-1 my-1" @click="cameraControl('up')"
          >&uArr;</v-btn
        >
        <v-btn color="primary" class="mx-1 my-1" @click="cameraControl('down')"
          >&dArr;</v-btn
        >
        <v-btn color="primary" class="mx-1 my-1" @click="cameraControl('left')"
          >&lArr;</v-btn
        >
        <v-btn color="primary" class="mx-1 my-1" @click="cameraControl('right')"
          >&rArr;</v-btn
        >
      </v-row>
      <v-row v-if="session.view == '3D'">
        <v-btn color="primary" class="mx-1 my-1" @click="cameraControl('in')"
          >+</v-btn
        >
        <v-btn color="primary" class="mx-1 my-1" @click="cameraControl('out')"
          >-</v-btn
        >
      </v-row>

      <NodeInfo
        :key="currentId"
        :nodeId="currentId"
        v-if="currentNode"
      ></NodeInfo>
    </v-col>
  </v-row>
</template>

  <script>
import NodeInfo from "./NodeInfo.vue";
import { relations } from "/imports/config.js";

export default {
  props: ["cmap"],
  data() {
    return {
      session: this.$root.$data.session,
      Graph: null,
      currentId: this.$root.$data.session.id,
      selectedId: this.$root.$data.session.id,
      currentColor: "blue",
      colors: {
        default: "blue",
        sessionNode: "pink",
        selectedNode: "brown",
      },
      view: this.$root.$data.session.view,
    };
  },
  components: { NodeInfo },
  watch: {},

  computed: {
    mapId() {
      return "graph" + Math.random().toString();
    },
    neighbourhood() {
      let node = this.cmap.nodes.find((n) => n.id == this.session.id),
        d = this.session.neighbourhood;
      if (!node) node = this.currentNode;
      const cid = node.id;
      function linkSourceId(link) {
        return typeof link.source == "object" ? link.source.id : link.source;
      }
      function linkTargetId(link) {
        return typeof link.target == "object" ? link.target.id : link.target;
      }

      let id = 0,
        newNodeIds = [cid],
        nodeIds = [cid];
      while (id < d) {
        let nextNodeIds = [];

        this.cmap.links
          .filter((ll) => newNodeIds.includes(linkSourceId(ll)))
          .forEach((lf) => {
            nextNodeIds.push(linkTargetId(lf));
          });
        this.cmap.links
          .filter((ll) => newNodeIds.includes(linkTargetId(ll)))
          .forEach((lf) => {
            nextNodeIds.push(linkSourceId(lf));
          });

        let nextNodeReduced = [...new Set(nextNodeIds)].filter(
          (item) => !nodeIds.includes(item)
        );
        nodeIds = nodeIds.concat(nextNodeReduced);
        newNodeIds = [...nextNodeReduced];
        id++;
      }

      let nodes = this.cmap.nodes.filter((nn) => nodeIds.includes(nn.id));
      let links = this.cmap.links.filter(
        (nn) =>
          nodeIds.includes(linkSourceId(nn)) &&
          nodeIds.includes(linkTargetId(nn))
      );

      return { nodes: nodes, links: links };
    },

    currentNode() {
      let nodeId = this.currentId ? this.currentId : this.session.id;
      return this.cmap.nodes.find((n) => n.id == nodeId);
    },

    nodeItems() {
      return this.cmap.nodes
        .map((n) => {
          return { id: n.id, title: n.title };
        })
        .sort(function (a, b) {
          return a.title < b.title ? -1 : 1;
        });
    },
  },
  methods: {
    nodeClicked(node0) {
      let node =
        typeof node0 == "object"
          ? node0
          : this.cmap.nodes.find((n) => n.id == node0);
      this.setCurrentNode(node);
      this.selectedId = node.id;
      /*
			this.Graph.d3Force('center', null);
			if (this.session.view == '3D') {
				this.Graph.cameraPosition({},node);
			} else {
				this.Graph.centerAt(node.x,node.y);
			}
			this.selectedId=node.id;
			this.Graph.zoomToFit(500,10);
			*/
    },
    setCurrentNode(node) {
      if (node.id == this.currentId) return;
      //Now new node selected:
      if (!this.currentNode) {
        this.currentColor = node.color;
        this.currentId = node.id;
        node.color = this.colors.selectedNode;
        return;
      }
      //Now CurrentNode exists
      if (this.currentId != this.session.id) {
        this.currentNode.color = this.currentColor;
        this.currentColor = node.color;
        this.currentId = node.id;
        if (node.id != this.session.id) node.color = this.colors.selectedNode;
        return;
      }
      //Now CurrentNode equals SessionNode
      //Now not SessionNode selected
      this.currentColor = node.color;
      this.currentId = node.id;
      node.color = this.colors.selectedNode;
    },
    alignCurrentNode() {
      if (!this.currentId) {
        console.log("No currentId");
        return;
      }
      let node = this.cmap.nodes.find((n) => n.id == this.currentId);
      if (!node) {
        console.log("Node not found");
        return;
      }
      this.nodeClicked(node);
    },

    showAll() {
      this.session.id = "";
    },

    explore() {
      this.session.id = this.currentNode.id;
      if (this.session.type != this.currentNode.type)
        this.session.set("type", this.currentNode.type);
      this.session.mode = "text";
    },
    cameraControl(dir) {
      let pos = this.Graph.cameraPosition();
      switch (dir) {
        case "up":
          pos.y -= 250;
          break;
        case "down":
          pos.y += 250;
          break;
        case "left":
          pos.x += 250;
          break;
        case "right":
          pos.x -= 250;
          break;
        case "in":
          pos.z -= 250;
          break;
        case "out":
          pos.z += 250;
          break;
      }
      this.Graph.cameraPosition(pos);
    },

    graph2d() {
      const NODE_R = 8;
      this.Graph = ForceGraph()(document.getElementById(this.mapId));
      this.Graph.linkWidth(5)
        .linkDirectionalParticles(10)
        .linkDirectionalParticleWidth(2.5)
        .linkDirectionalParticleSpeed((d) => 0.005)
        .nodeRelSize(6)
        .nodeId("id")
        .nodeColor((d) =>
          d.id == this.session.id ? this.colors.sessionNode : d.color
        )
        .nodeLabel((node) => `${node.title}`)
        .d3Force(
          "link",
          d3
            .forceLink()
            .id((d) => d.id)
            .distance(100)
            .strength(1)
        )
        .width(this.$refs.conti.clientWidth)
        .height(Math.max(this.$refs.conti.clientHeight, 800))
        .onNodeDragEnd((node) => {
          node.fx = node.x;
          node.fy = node.y;
        })
        .onNodeClick((node) => this.nodeClicked(node))
        .cooldownTime(2000);

      if (this.session.orientation) 
	  	this.Graph.dagMode(this.session.orientation);
      
      if (this.session.nodeForm == "Symbols") {
        this.Graph.nodeCanvasObjectMode((node) =>
          node.isNew ? "before" : undefined
        ).nodeCanvasObject((node, ctx) => {
          let r = node.val + 10;
          let x = node.x;
          let y = node.y;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, 2 * Math.PI, false);
          ctx.fillStyle = "orange";
          ctx.fill();
        });
      } else {
        this.Graph.nodeCanvasObject((node, ctx, globalScale) => {
          const label = node.title;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
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
      }
      this.Graph.graphData(this.cmap);
      // Zoom to fit
      this.Graph.d3Force("center", null);

      // fit to canvas when engine stops
      this.Graph.width(this.$refs[this.mapId].clientWidth);
      this.Graph.onEngineStop(() => this.Graph.zoomToFit(500));
    },

    graph3d() {
      this.Graph = ForceGraph3D({ controlType: "orbit" })(
        document.getElementById(this.mapId)
      );
      this.Graph.width(this.$refs[this.mapId].clientWidth)
        .nodeId("id")
        .nodeRelSize(6)
        .linkWidth(5)
        .linkDirectionalParticles(10)
        .linkDirectionalParticleWidth(2.5)
        .linkDirectionalParticleSpeed((d) => 0.005)
        .nodeAutoColorBy("group")
        .onNodeDragEnd((node) => {
          node.fx = node.x;
          node.fy = node.y;
          node.fz = node.z;
        })
        .onNodeClick((node) => this.nodeClicked(node))
        .cooldownTime(2000);
      if (this.session.orientation)
        this.Graph.dagMode(this.session.orientation);
      if (this.session.nodeForm == "Symbols") {
        this.Graph.nodeLabel((node) => `${node.title}`)
          .nodeThreeObjectExtend(true)
          .nodeThreeObject((node) => {
            if (node.isNew) {
              const obj = new THREE.Mesh(
                new THREE.TorusGeometry(5 + node.val, 5),
                //new THREE.SphereGeometry(2+node.val),
                new THREE.MeshBasicMaterial({
                  color: "orange",
                  opacity: 0.5,
                  transparent: true,
                })
              );
              obj.userData = node;
              return obj;
            }
          });
      } else {
        this.Graph.nodeThreeObject((node) => {
          const sprite = new SpriteText(node.title);
          sprite.material.depthWrite = false; // make sprite background transparent
          sprite.color = node.color;
          sprite.textHeight = 20;
          return sprite;
        })
          // Spread nodes a little wider
          .d3Force("charge")
          .strength(-120);
      }

      this.Graph.graphData(this.cmap);
      // Zoom to fit
      this.Graph.d3Force("center", null);

      // fit to canvas when engine stops
      //Graph.onEngineStop(() => Graph.zoomToFit(500));
      this.Graph.zoomToFit(500);
    },
    saveGraph() {
      let graphData = this.Graph.graphData();
      let coords = {};
      graphData.nodes.forEach((n) => {
        coords[n.id] = { x: n.x, y: n.y, z: n.z, fx: n.x, fy: n.y, fz: n.z };
      });
      let gData = {
        session: this.session,
        coords: coords,
      };
      let gs = JSON.stringify(gData);
      var FileSaver = require("file-saver");
      var blob = new Blob([gs], { type: "text/plain;charset=utf-8" });
      FileSaver.saveAs(blob, "graph.json");
    },
  },
  beforeDestroy() {
    if (this.currentNode && this.currentNode != this.session.id) {
      this.currentNode.color = this.currentColor;
    }
  },
  mounted() {
    if (this.session.id) {
      //this.currentNode = this.cmap.nodes.find(d => d.id == this.session.id);
      this.currentColor = this.currentNode.color;
      this.currentNode.color = this.colors.sessionNode;
    }

    if (this.session.view == "3D") {
      this.graph3d();
    } else {
      this.graph2d();
    }
  },
};
</script>