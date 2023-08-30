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
        <v-btn color="primary" class="mx-1 my-1" @click="zoomToFit">Zoom</v-btn>

        <v-btn
          color="primary"
          class="mx-1 my-1"
          @click="showAll"
          :disabled="!session.id"
          >Show all</v-btn
        >
        <v-btn
          v-if="session.ui"
          color="primary"
          class="mx-1 my-1"
          @click="saveGraph()"
          :disabled="!currentNode"
        >
          Save Graph</v-btn
        >
        <save-html v-if="session.ui"></save-html>
        <copy-text v-if="session.ui"></copy-text>
        <div v-else>
          <v-btn
            class="mx-1 my-1"
            color="primary"
            :disabled="!session.neighbourhood"
            @click="session.neighbourhood--"
            >Less</v-btn
          >
          <v-btn
            class="mx-1 my-1"
            color="primary"
            @click="session.neighbourhood++"
            >More</v-btn
          >
        </div>
      </v-row>
      <v-row v-if="session.ui && session.id">
        <v-autocomplete
          label="Expand selected node by"
          v-model="expandBy"
          hide-details="auto"
          :items="relationItems"
          item-text="title"
          item-value="value"
        ></v-autocomplete>
        <div class="select" data-app>
          <v-btn
            color="primary"
            class="mx-1 my-1"
            @click="expandByRelation(expandBy)"
            >Expand</v-btn
          >
          <v-btn color="warning" class="mx-1 my-1" @click="deleteNode"
            >Delete</v-btn
          >
        </div>
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
import SaveHtml from "./SaveHtml.vue";
import CopyText from "./CopyText.vue";
import { relations, defaultRelation } from "/imports/config.js";
import colorMixin from "../mixins/colorMixin.js";

export default {
  props: ["cmap"],
  mixins: [colorMixin],
  data() {
    return {
      session: this.$root.$data.session,
      Graph: null,
      currentId: this.$root.$data.session.id,
      selectedId: this.$root.$data.session.id,
      currentColor: "blue",
      view: this.$root.$data.session.view,
      expandBy: null,
    };
  },
  components: { NodeInfo, SaveHtml, CopyText },
  watch: {
    currentTicks(newTicks) {
      this.Graph.cooldownTicks(newTicks);
    },
  },

  computed: {
    mapId() {
      return "graph" + Math.random().toString();
    },

    currentNode() {
      let nodes = this.Graph ? this.Graph.graphData().nodes : this.cmap.nodes;
      let nodeId = this.currentId ? this.currentId : this.session.id;
      return nodes.find((n) => n.id == nodeId);
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
    relationItems() {
      function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }
      let ct = this.currentNode.type;
      let items = [];
      relations.forEach((r) => {
        if (r.sourceType == ct) {
          items.push({
            title: this.currentNode.title + " " + r.name + " " + r.targetType,
            value: { is: "source", relationId: r.id },
          });
        }
        if (r.targetType == ct) {
          items.push({
            title:
              capitalizeFirstLetter(r.sourceType) +
              " " +
              r.name +
              " " +
              this.currentNode.title,
            value: { is: "target", relationId: r.id },
          });
        }
      });
      return items;
    },
    currentTicks() {
      return this.session.freeze ? 0 : 2000;
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
    },
    setCurrentNode(node) {
      if (node.id == this.currentId) {
      }
      //Now new node selected:
      else if (!this.currentNode) {
        this.currentColor = node.color;
        this.currentId = node.id;
        node.color = this.colors.selectedNode;
      }
      //Now CurrentNode exists
      else if (this.currentId != this.session.id) {
        this.currentNode.color = this.currentColor;
        this.currentColor = node.color;
        this.currentId = node.id;
        if (node.id != this.session.id) node.color = this.colors.selectedNode;
        return;
      } else {
        //Now CurrentNode equals SessionNode
        //Now not SessionNode selected
        this.currentColor = node.color;
        this.currentId = node.id;
        node.color = this.colors.selectedNode;
      }
    },

    showAll() {
      this.session.id = "";
    },

    explore() {
      this.session.id = this.currentNode.id;
      if (this.session.type != this.currentNode.type)
        this.session.set("type", this.currentNode.type);
      const cr = relations.find((r) => r.id == this.session.relation);
      if (
        this.session.type != cr.sourceType &&
        this.session.type != cr.targetType
      )
        this.session.set(
          "relation",
          defaultRelation[this.session.type],
          "Maps - explore"
        );
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
      this.Graph = ForceGraph()(document.getElementById(this.mapId));
      this.Graph.linkWidth(5)
        .linkDirectionalParticles(10)
        .linkDirectionalParticleWidth(2.5)
        .linkDirectionalParticleSpeed((d) => 0.005)
        .linkDirectionalParticleColor(() => {
          return "white";
        })
        .nodeRelSize(6)
        .nodeId("id")
        .nodeColor((d) =>
          d.id == this.session.id ? this.colors.sessionNode : d.color
        )
        .nodeLabel((node) => `${node.title}`)
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
          const fontSize =18 / globalScale;
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
    },

    graph3d() {
      this.Graph = ForceGraph3D({ controlType: "orbit" })(
        document.getElementById(this.mapId)
      );
      this.Graph.width(this.$refs[this.mapId].clientWidth)
        .height(Math.max(this.$refs[this.mapId].clientHeight, 800))
        .nodeId("id")
        .nodeRelSize(6)
        .linkWidth(5)
        .linkDirectionalParticles(10)
        .linkDirectionalParticleWidth(2.5)
        .linkDirectionalParticleSpeed((d) => 0.005)
        .linkDirectionalParticleColor(() => {
          return "white";
        })
        .linkColor((r) => {
          return r.relation == this.session.relation
            ? this.colors.primaryRelation
            : this.colors.otherRelation;
        })
        .onNodeDragEnd((node) => {
          node.fx = node.x;
          node.fy = node.y;
          node.fz = node.z;
        })
        .onNodeClick((node) => {
          this.nodeClicked(node);
          if (this.session.nodeForm == "Symbols") {
            this.Graph.nodeColor("color");
          } else {
            this.Graph.nodeThreeObject((nn) => {
              const sprite = new SpriteText(nn.title);
              sprite.material.depthWrite = false; // make sprite background transparent
              sprite.color = nn.color;
              sprite.textHeight = 18;
              return sprite;
            });
          }
        })
        .cooldownTicks(this.session.freeze ? 0 : 2000);
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
          sprite.textHeight = 18;
          return sprite;
        })
          // Spread nodes a little wider
          .d3Force("charge")
          .strength(-120);
      }
      this.Graph.graphData(this.cmap);
    },
    graphString() {
      let graphData = this.Graph.graphData();
      let graph = { coords: {}, links: [] };
      graphData.nodes.forEach((n) => {
        graph.coords[n.id] = {
          x: n.x,
          y: n.y,
          z: n.z,
          fx: n.x,
          fy: n.y,
          fz: n.z,
        };
      });
      graphData.links.forEach((l) => {
        graph.links.push({
          source: l.source.id,
          target: l.target.id,
          relation: l.relation,
          name: l.name,
        });
      });
      let gData = {
        session: this.session,
        graph: graph,
      };
      return JSON.stringify(gData);
    },
    graphForHtml() {
      let graphData = this.Graph.graphData();
      let graph = { nodes: [], links: [] };
      graphData.nodes.forEach((n) => {
        let myColor =
          n.Id != this.session.id
            ? this.colors.default
            : this.colors.sessionNode;
        graph.nodes.push({
          id: n.id,
          title: n.title,
          type: n.type,
          color: myColor,
          x: n.x,
          y: n.y,
          z: n.z,
          fx: n.x,
          fy: n.y,
          fz: n.z,
        });
      });
      graphData.links.forEach((l) => {
        graph.links.push({
          source: l.source.id,
          target: l.target.id,
          relation: l.relation,
          name: l.name,
        });
      });
      return graph;
    },
    saveGraph() {
      var FileSaver = require("file-saver");
      var blob = new Blob([this.graphString()], {
        type: "text/plain;charset=utf-8",
      });
      FileSaver.saveAs(blob, "graph.json");
    },
    zoomToFit() {
      this.Graph.width(this.$refs[this.mapId].clientWidth)
        .height(Math.max(this.$refs[this.mapId].clientHeight, 800))
        .zoomToFit(500);
    },

    expandByRelation(relationDirection) {
      if (relationDirection)
        this.$emit(
          "expandBy",
          this.currentId,
          relationDirection.relationId,
          relationDirection.is
        );
      else alert("Please select relation");
    },
    expandGraph(newGraph) {
      if (!newGraph.nodes.length) {
        alert("No new nodes added");
        return;
      }
      const graph = this.Graph.graphData();
      const graphNodeIds = graph.nodes.map((n) => n.id);
      const newNodes = newGraph.nodes.filter(
        (nn) => !graphNodeIds.includes(nn.id)
      );
      this.Graph.graphData({
        nodes: graph.nodes.concat(newNodes),
        links: graph.links.concat(newGraph.links),
      });
    },
    deleteNode() {
      let graph = this.Graph.graphData();
      let node = graph.nodes.find((n) => n.id == this.currentId);
      if (node.id == this.session.id) {
        alert("Cannot delete root node");
        return;
      }
      if (
        confirm(
          `Delete node ${node.title}?\nThis will delete the node and all of its links from the graph only.\nThis does not affect the node in the database.`
        )
      ) {
        this.Graph.graphData({
          nodes: graph.nodes.filter((n) => n.id != this.currentId),
          links: graph.links.filter(
            (l) =>
              l.source.id != this.currentId && l.target.id != this.currentId
          ),
        });
        this.currentId = this.session.id;
      }
    },
  },
  beforeDestroy() {
    if (this.currentNode && this.currentNode.id != this.session.id) {
      this.currentNode.color = this.currentColor;
    }
  },

  crated() {},
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
    if (!this.session.orientation) this.Graph.dagMode(null);
  },
};
</script>