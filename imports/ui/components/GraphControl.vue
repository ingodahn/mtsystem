<template>
  <v-container>
    <v-row >
      <v-col md="10" >
        <v-card class="mx-auto" v-if="session.ui">
          <v-card-actions>
            <v-btn text color="blue" @click="reveal = !reveal"
              >Graph Control</v-btn
            >
          </v-card-actions>
          <v-expand-transition>
            <v-card
              v-if="reveal"
              class="transition-fast-in-fast-out v-card--reveal"
              style="height: 100%"
            >
              <v-card-text>
                <v-row xs="12" md="8" align="center">
                  <v-select
                    :items="orientations"
                    label="Orientation"
                    v-model="session.orientation"
                  ></v-select>

                  <v-select
                    :items="views"
                    label="View"
                    v-model="session.view"
                  ></v-select>

                  <v-select
                    :items="distance"
                    label="Distance"
                    v-model="session.neighbourhood"
                  ></v-select>

                  <v-select
                    :items="newItems"
                    label="Mark symbols of nodes new since..."
                    v-model="session.newNodes"
                  ></v-select>

                  <v-select
                    :items="nodeForms"
                    label="Nodes as..."
                    v-model="session.nodeForm"
                  ></v-select>

                  <v-select
                    :items="directions"
                    label="Follow links..."
                    v-model="session.direction"
                  ></v-select>
                  <v-switch v-model="session.freeze" label="Manual layout"></v-switch>
                </v-row>
              </v-card-text>
            </v-card>
          </v-expand-transition>
        </v-card>
      </v-col>
      <v-col md="2">
        <v-tooltip bottom color="primary">
          <template v-slot:activator="{ on, attrs }">
            <span class="infoSymbol" v-bind="attrs" v-on="on"
              ><img src="/information_info_1565.png"
            /></span>
          </template>
          <span v-html="graphInfo">
            <p>
              Click node for details. Drag nodes to pin. For node symbols, size
              indicates weight w.r.t. all relations.
            </p>
            <p v-if="currentUser">
              Color distinguishes
              <span style="background-color: green; color: white"
                >nodes I know</span
              >
              from
              <span style="background-color: yellow; color: black"
                >nodes I am exploring</span
              >
              and
              <span style="background-color: red; color: white"
                >nodes I find interesting</span
              >.
            </p>

            <p>
              The symbols for nodes, that have been updated in the last
              {{ session.newNodes }} days, <span v-html="markNew"></span>.
            </p>
            <p>
              The last selected {{ session.type }} is shown in
              <span style="background-color: pink; color: black">pink</span>.
              The last node selected in the graph is shown in
              <span style="background-color: brown; color: white">brown</span>.
            </p>
          </span>
        </v-tooltip>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
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
        { text: "(Ignore)", value: 0},
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
  computed: {
    markNew() {
      return this.session.view == "2D"
        ? "are marked with an <span style='border:solid orange; border-radius: 10px; padding: 1px;'>orange ring</span>"
        : "are shown surrounded by an <span style='border:solid orange; padding: 1px;'>orange polygon</span>";
    },
    graphInfo () {
      return `
      <span>
            <p>
              Click node for details. Drag nodes to pin. For node symbols, size
              indicates weight w.r.t. all relations.
            </p>
            <p v-if="currentUser">
              Color distinguishes
              <span style="background-color: green; color: white"
                >nodes I know</span
              >
              from
              <span style="background-color: yellow; color: black"
                >nodes I am exploring</span
              >
              and
              <span style="background-color: red; color: white"
                >nodes I find interesting</span
              >.
            </p>

            <p>
              The symbols for nodes, that have been updated in the last
              `+this.session.newNodes+` days, <span v-html="markNew"></span>.
            </p>
            <p>
              The last selected `+this.session.type+` is shown in
              <span style="background-color: pink; color: black">pink</span>.
              The last node selected in the graph is shown in
              <span style="background-color: brown; color: white">brown</span>.
            </p>
          </span>
      `;
    }
  },
  meteor: {
    currentUser() {
      return Meteor.user();
    },
  },
};
</script>