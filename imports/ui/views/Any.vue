<template>
  <v-container>
    <v-row>
      <v-col xs="12" md="4">
        <h1>MathTrek {{ session.type }}{{ topicPlural }}:</h1>
      </v-col>
      <v-col xs="12" md="4">
        <div class="select" data-app>
          <v-autocomplete
            :label="selectLabel"
            v-model="session.id"
            hide-details="auto"
            :items="allNodesOfType"
            item-text="title"
            item-value="_id"
            clearable
          ></v-autocomplete>
        </div>
      </v-col>
      <v-col xs="12" md="4">
        <div v-if="relations.length > 1">
          <v-row>
            <v-col md="10">
              <div data-app>
                <v-select
                  :items="typedRelations"
                  label="Select relation:"
                  item-text="text"
                  item-value="value"
                  v-model="session.relation"
                >
                </v-select>
              </div>
            </v-col>
            <v-col md="2">
              <v-tooltip bottom color="primary">
                <template v-slot:activator="{ on, attrs }">
                  <span class="infoSymbol" v-bind="attrs" v-on="on"
                    ><img src="/information_info_1565.png"
                  /></span>
                </template>
                <span v-html="getRelationDescription"></span>
              </v-tooltip>
            </v-col>
          </v-row>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col md="4">
        <h1 v-if="session.edit != 'new'">{{ current.title }}</h1>
      </v-col>
      <v-col xs="12" md="4" name="editorMenu">
        <div v-if="!session.edit">
          <v-btn
            v-if="session.mode == 'text' && session.id"
            color="primary"
            id="btnRelated"
            @click="session.set('mode', 'graph')"
            >Related {{ relatedType }}s</v-btn
          >
          <v-btn
            v-if="isEditor"
            color="success"
            id="btnNew"
            @click="session.edit = 'new'"
            >New {{ session.type }}</v-btn
          >
          <v-btn
            v-if="isEditor && session.mode == 'text' && session.id"
            color="warning"
            id="btnUpdate"
            @click="session.edit = 'update'"
            >Update {{ session.type }}</v-btn
          >
          <v-btn
            v-if="isEditor && session.mode == 'text' && session.id"
            color="error"
            id="btnDelete"
            @click="deleteNode"
            >Delete {{ session.type }}</v-btn
          >
        </div>
      </v-col>
      <v-col md="4">
        <GraphControl />
      </v-col>
    </v-row>

    <v-row v-if="session.type">
      <v-col xs="12" v-if="!session.edit">
        <show-all
          :key="session.type"
          v-if="session.mode == 'graph'"
          :relations="relations"
          :allTyped="allNodesOfType"
        ></show-all>
        <show-one
          :key="session.id"
          v-if="session.mode == 'text'"
          :relations="relations"
        ></show-one>
      </v-col>
      <v-col v-else>
        <new-node
          v-if="session.edit == 'new'"
          :relations="relations"
          id=""
        ></new-node>
        <new-node
          v-if="session.edit == 'update'"
          :relations="relations"
          :id="session.id"
        ></new-node>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { relations } from "/imports/config.js";
import GraphControl from "../components/GraphControl.vue";
import ShowAll from "../components/GraphicsMode.vue";
import ShowOne from "../components/TextMode.vue";
import NewNode from "../components/NewNode.vue";
import { UnitsCollection } from "../../api/UnitsCollection";
export default {
  data() {
    return {
      mode: "graph",
      session: this.$root.$data.session,
    };
  },
  props: [],
  components: {
    ShowAll,
    ShowOne,
    NewNode,
    GraphControl,
  },
  created() {
    this.$root.$data.session.set("relation", this.initialRelation);
    this.$root.$data.session.set("id", this.initialId);
  },
  watch: {},
  methods: {
    /*
    nodeSelected(id) {
      this.session.set("id", id);
      if (!id) {
        this.mode = "graph";
      } else {
        this.mode = "text";
      }
    },
    
    relationSelected(rid) {
      this.currentRelation = rid;
    },
    */
    deleteNode() {
      if (!this.session.id) {
        alert("No node selected");
        return;
      }
      const node = UnitsCollection.findOne({ _id: this.session.id });
      if (
        confirm(
          "Do you REALLY want to delete " +
            this.session.type +
            " " +
            node.title +
            " on " +
            window.location.href +
            "?"
        )
      ) {
        Meteor.call("deleteItem", {
          _id: this.session.id,
        });
        Meteor.call("deleteItem", {
          type: "relation",
          source: this.session.id,
        });
        Meteor.call("deleteItem", {
          type: "relation",
          target: this.session.id,
        });
        this.session.set("id", "");
      }
    },

    id2relation(id) {
      return this.relations.find((e) => e.id == id);
    },
  },
  computed: {
    /*
    type() {
      return this.session.type;
    },
    */
    relatedType() {
      const cr = this.relations.find((r) => r.id == this.session.relation);
      return cr.sourceType == this.session.type ? cr.targetType : cr.sourceType;
    },
    relations() {
      let t = this.session.type;
      return relations.filter((e) => e.sourceType == t || e.targetType == t);
    },
    getRelationDescription() {
      let relation = this.id2relation(this.session.relation);
      let stype = relation.sourceType;
      let sString = stype.charAt(0).toUpperCase() + stype.substring(1);
      let ttype = relation.targetType;
      let tString = ttype.charAt(0).toUpperCase() + ttype.substring(1);
      let source = "";
      let target = "";
      let desc = "<b>Relation</b> ";
      if (relation.sourceType == this.session.type) {
        source = this.current.title.length
          ? this.current.title
          : sString + " 1";
        target = tString + " 2";
        desc +=
          "<em>" +
          source +
          "</em> <b>" +
          relation.name +
          "</b> <em>" +
          target +
          "</em></p><p><b>Means:</b> " +
          relation.description
            .replaceAll("SOURCE", "<em>" + source + "</em>")
            .replaceAll("TARGET", "<em>" + target + "</em>") +
          "</p>";
        if (relation.targetType == this.session.type)
          desc +=
            "<p><b>Inverse:</b> <em>" +
            target +
            "</em> <b>" +
            relation.inverse +
            "</b> <em>" +
            source +
            "</em>";
      } else {
        target = this.current.title.length
          ? this.current.title
          : tString + " 2";
        source = sString + " 1";
        desc +=
          target +
          " <b>" +
          relation.inverse +
          "</b> " +
          source +
          "</p><p><b>Means:</b> " +
          relation.description
            .replaceAll("SOURCE", "<em>" + source + "</em>")
            .replaceAll("TARGET", "<em>" + target + "</em>") +
          "</p>";
      }
      return desc;
    },
    typedRelations() {
      let tr = [];
      this.relations.forEach((r) => {
        tr.push({
          text:
            r.sourceType == this.session.type
              ? r.name + " " + r.targetType
              : r.inverse + " " + r.sourceType,
          value: r.id,
        });
      });
      return tr;
    },
    initialId() {
      if (!this.session.id) return "";
      const node = UnitsCollection.findOne({ _id: this.session.id });
      return node.type == this.session.type ? node._id : "";
    },
    initialRelation() {
      return this.relations[0].id;
    },
    currentRelation() {
      return this.session.relation;
    },
    current() {
      if (!this.session.id) {
        return { title: "" };
      }

      return UnitsCollection.findOne({ _id: this.session.id });
    },
    selectLabel() {
      return "Select " + this.session.type + ":";
    },
    topicPlural() {
      return this.session.id ? "" : "s";
    },
  },
  meteor: {
    isEditor() {
      if (Meteor.user()) {
        const name = Meteor.user().username;
        return name == "editor" || name == "dahn";
      }
      return false;
    },
    allNodesOfType() {
      return UnitsCollection.find({ type: this.session.type })
        .fetch()
        .sort((a, b) => {
          return a.title < b.title ? -1 : 1;
        });
    },
  },
};
</script>

<style scoped>
.v-select {
  width: auto;
  min-width: 10em;
}

p {
  margin-top: 5px;
}
</style>