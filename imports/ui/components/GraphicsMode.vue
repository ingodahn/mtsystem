<template>
  <v-container>
    <Maps
      :key="mapKey"
      ref="graph"
      :cmap="mapNodes"
      v-on:expandBy="expandBy"
    ></Maps>
  </v-container>
</template>

<script>
import { UnitsCollection } from "../../api/UnitsCollection";
import { relations } from "/imports/config.js";
import Maps from "./Maps.vue";
import colorMixin from '../mixins/colorMixin.js';


export default {
  props: ["allTyped"],
  mixins: [colorMixin],
  data() {
    return {
      session: this.$root.$data.session,
      orientations: [
        { text: "None", value: "" },
        { text: "Bottom up", value: "bu" },
        { text: "Top down", value: "td" },
        { text: "Left-right", value: "lr" },
        { text: "Right-left", value: "rl" },
        { text: "Out", value: "radialout" },
        { text: "In", value: "radialin" },
      ],
      newItems: [
        { text: "1 day", value: 1 },
        { text: "2 days", value: 2 },
        { text: "3 days", value: 3 },
        { text: "7 days", value: 7 },
        { text: "14 days", value: 14 },
        { text: "30 days", value: 30 },
      ],
      directions: [
        { text: "Outgoing", value: "out" },
        { text: "Incoming", value: "in" },
        { text: "Both", value: "both" },
      ],
      views: ["2D", "3D"],
      view: "2D",
      distance: [1, 2, 3, 4, 5],
      nodeForms: ["Symbols", "Text"],
      reveal: false,
    };
  },
  components: {
    Maps,
  },
  created() {},
  mounted() {},
  methods: {
    id2relation(id) {
      return relations.find((e) => e.id == id);
    },
    nodeDetails(nodeIds) {
      let nodeStatus = {};
      if (this.currentUser) {
        UnitsCollection.find({
          type: "note",
          item: { $in: nodeIds },
          userId: this.currentUser._id,
        })
          .fetch()
          .forEach((n) => {
            nodeStatus[n.item] = n.status;
          });
      }
      const back =
        new Date().getTime() -
        parseInt(this.session.newNodes) * 24 * 60 * 60 * 1000;
      let nodes = [],
        nodeTitle = {};
      UnitsCollection.find({ _id: { $in: nodeIds } })
        .fetch()
        .forEach((n) => {
          let updated = new Date(n.updatedAt).getTime();
          let isNew = updated && updated > back ? true : false;
          let color = "blue";
          let nid = n._id;
          nodeTitle[nid] = n.title;
          switch (nodeStatus[nid]) {
            case "100":
              color = this.colors.knowing;
              break;
            case "2":
              color = this.colors.learning;
              break;
            case "150":
              color = this.colors.interesting;
              break;
            default:
              color = this.colors.default;
          }
          let nodeval =
            UnitsCollection.find({
              $or: [
                { target: nid, type: "relation" },
                { source: nid, type: "relation" },
              ],
            }).fetch().length / 3; // Denominator
          nodes.push({
            id: n._id,
            title: n.title,
            type: n.type,
            color: color,
            isNew: isNew,
            val: nodeval,
          });
        });
      return nodes;
    },
    expandBy(nodeId, relationId, is) {
      let dbRel = [];
      if (is == "source")
        dbRel = UnitsCollection.find({
          type: "relation",
          name: relationId,
          source: nodeId,
        }).fetch();
      else
        dbRel = UnitsCollection.find({
          type: "relation",
          name: relationId,
          target: nodeId,
        }).fetch();
      let dbNodeIds = dbRel.map((e) =>
        e.target == nodeId ? e.source : e.target
      );
      if (!dbNodeIds.length) {
        alert("No new nodes found");
        return;
      }
      let nodes = this.nodeDetails(dbNodeIds);
      let ctitle = UnitsCollection.findOne({ _id: nodeId }).title;
      let links = [];
      let rname = this.id2relation(relationId).name;
      nodes.forEach((n) => {
        if (is == "source")
          links.push({
            source: nodeId,
            target: n.id,
            name: ctitle + " " + rname + " " + n.title,
            relation: relationId,
          });
        else
          links.push({
            source: n.id,
            target: nodeId,
            name: n.title + " " + rname + " " + ctitle,
            relation: relationId,
          });
      });
      this.$refs.graph.expandGraph({ nodes: nodes, links: links });
    },
    restoreGraph() {
      let graph = JSON.parse(JSON.stringify(this.$root.$data.graph));
      let coords = graph.coords,
        links = graph.links;
      let nodeIds = Object.keys(coords);
      let nodes = this.nodeDetails(nodeIds);
      nodes.forEach((n) => {
        n.x = coords[n.id].x;
        n.y = coords[n.id].y;
        if ((this.session.view == "3D")) {
          n.z = coords[n.id].z;
        }
      });
      // Graphs without saved links - these have only primary relatio
      if (!links.length) {
        let nodeTitle = {};
        nodes.forEach((n) => {
          nodeTitle[n.id] = n.title;
        });
        links = UnitsCollection.find({
          type: "relation",
          name: this.session.relation,
          source: { $in: nodeIds },
          target: { $in: nodeIds },
        })
          .fetch()
          .map((e) => {
            return {
              source: e.source,
              target: e.target,
              relation: e.name,
              name:
                nodeTitle[e.source] +
                " " +
                this.ids2RelationNames[e.name] +
                " " +
                nodeTitle[e.target],
            };
          });
      }
      this.$root.$data.graph = null;
      return { nodes: nodes, links: links };
    },
  },
  computed: {
    mapKey() {
      return (
        this.session.relation +
        this.session.newNodes +
        this.session.orientation +
        this.session.view +
        this.session.neighbourhood +
        this.session.nodeForm +
        this.session.direction +
        this.session.id
      );
    },
    mapNodes() {
      return this.session.id ? this.neighbourhood : this.allNodes;
    },
    allNodes() {
      let myNodes = this.allTyped;
      let linkRels = UnitsCollection.find({
        type: "relation",
        name: this.session.relation,
      }).fetch();
      if (!this.sameType) {
        const r = this.id2relation(this.session.relation);
        if (this.session.type == r.sourceType) {
          linkRels.forEach((ll) => {
            if (!myNodes.find((nx) => nx._id == ll.target))
              myNodes.push(UnitsCollection.findOne({ _id: ll.target }));
          });
        }
        if (this.session.type == r.targetType) {
          linkRels.forEach((ll) => {
            if (!myNodes.find((nx) => nx._id == ll.source))
              myNodes.push(UnitsCollection.findOne({ _id: ll.source }));
          });
        }
      }

      const nodeIds = myNodes.map((n) => n._id);
      let nodeStatus = {};
      if (this.currentUser) {
        UnitsCollection.find({
          type: "note",
          item: { $in: nodeIds },
          userId: this.currentUser._id,
        })
          .fetch()
          .forEach((n) => {
            nodeStatus[n.item] = n.status;
          });
      }

      let links = [],
        nodes = [];
      myNodes.forEach((n) => {
        let nid = n._id;
        let color = this.colors.default;
        const back =
          new Date().getTime() -
          parseInt(this.session.newNodes) * 24 * 60 * 60 * 1000;
        switch (nodeStatus[nid]) {
          case "100":
            color = this.colors.knowing;
            break;
          case "2":
            color = this.colors.learning;
            break;
          case "150":
            color = this.colors.interesting;
            break;
          default:
            color = this.colors.default;
        }
        let updated = new Date(n.updatedAt).getTime();
        let isNew = updated && updated > back ? true : false;
        if (nodeStatus[nid]) group = nodeStatus[nid];
        let nodeval =
          UnitsCollection.find({
            $or: [
              { target: nid, type: "relation" },
              { source: nid, type: "relation" },
            ],
          }).fetch().length / 3; // Denominator may be varied for readability
        nodes.push({
          id: nid,
          title: n.title,
          color: color,
          isNew: isNew,
          val: nodeval,
          type: n.type,
        });
      });

      linkRels.forEach((r) => {
        links.push({ source: r.source, target: r.target });
      });

      return { nodes: nodes, links: links };
    },
    neighbourhood() {
      if (this.$root.$data.graph) {
        return this.restoreGraph();
      }
      let node = UnitsCollection.findOne({ _id: this.session.id }),
        d = this.session.neighbourhood;
      if (!node && this.session.debug)
        console.log("GraphicsMode:178 node", session.id, "not found");
      const cid = node._id;

      let id = 0,
        newNodeIds = [cid],
        nodeIds = [cid];
      while (id < d) {
        let nextNodeIds = [];
        if (this.session.direction != "in") {
          UnitsCollection.find({
            type: "relation",
            name: this.session.relation,
            source: { $in: newNodeIds },
          })
            .fetch()
            .forEach((lf) => nextNodeIds.push(lf.target));
        }
        if (this.session.direction != "out") {
          UnitsCollection.find({
            type: "relation",
            name: this.session.relation,
            target: { $in: newNodeIds },
          })
            .fetch()
            .forEach((lf) => nextNodeIds.push(lf.source));
        }
        let nextNodeReduced = [...new Set(nextNodeIds)].filter(
          (item) => !nodeIds.includes(item)
        );
        nodeIds = nodeIds.concat(nextNodeReduced);
        newNodeIds = [...nextNodeReduced];
        id++;
      }
      let nodes = this.nodeDetails(nodeIds);
      // Begin linkDetails
      let nodeTitle = {};
      nodes.forEach((n) => {
        nodeTitle[n.id] = n.title;
      });
      let rels = [];

      rels = UnitsCollection.find({
        type: "relation",
        name: this.session.relation,
        source: { $in: nodeIds },
        target: { $in: nodeIds },
      });

      let links = [];
      rels.forEach((r) => {
        links.push({
          source: r.source,
          target: r.target,
          relation: r.name,
          name:
            nodeTitle[r.source] +
            " " +
            this.ids2RelationNames[r.name] +
            " " +
            nodeTitle[r.target],
        });
      });
      // End linkDetails
      return { nodes: nodes, links: links };
    },

    sameType() {
      const r = this.id2relation(this.session.relation);
      return r.sourceType == r.targetType;
    },

    markNew() {
      return this.session.view == "2D"
        ? "are marked with an <span style='border:solid orange; border-radius: 10px; padding: 1px;'>orange ring</span>"
        : "are shown surrounded by an <span style='border:solid orange; padding: 1px;'>orange polygon</span>";
    },
    ids2RelationNames() {
      let ir = {};
      relations.forEach((r) => {
        ir[r.id] = r.name;
      });
      return ir;
    },
  },

  meteor: {
    currentUser() {
      return Meteor.user();
    },
  },
};
</script>