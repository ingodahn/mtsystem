<template>
<div class="container">
	<div id="graph"></div>
</div>
</template>

  <script>
  import { UnitsCollection } from "../../api/UnitsCollection";
  export default {
	  props: ['cmap'],
	  computed: {
	  },
	  methods: {
		  nodeClicked(node) {
			  this.$emit('nodeclicked',node);
		  }
	  },
	  mounted() {
		  const Graph = ForceGraph()
		  (document.getElementById('graph'))
		  .graphData(this.cmap)
		  .linkDirectionalArrowLength(10)
		  .nodeRelSize(6)
		  .nodeId('id')
		  .nodeAutoColorBy('group')
		  .nodeLabel(node => `${node.title}`)
		  .onNodeDragEnd(node => {
				node.fx = node.x;
				node.fy = node.y;
			})
		  .onNodeClick(node => this.nodeClicked(node))
		  ;
	},
  }
  
  </script>