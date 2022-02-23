export default {
    computed: {
        colors() {
            let colors = {
                default: "blue",
                sessionNode: "deeppink",
                selectedNode: "brown",
                primaryRelation: "red",
                otherRelation: "green",
                knowing: "green",
                learning: "yellow",
                interesting: "red"
            };
            if (this.$root.$data.session.view == '3D') colors.default = 'lightblue';
            return colors;
      }
    }
  };