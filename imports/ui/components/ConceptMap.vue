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
		  const NODE_R = 8;
		  const Graph = ForceGraph()
		  (document.getElementById('graph'))
		  .graphData(this.cmap)
		  .linkDirectionalArrowLength(10)
		  .nodeRelSize(6)
		  .nodeId('id')
		  .nodeAutoColorBy('group')
		  .nodeLabel(node => `${node.title}`)
		  .nodeRelSize(NODE_R)
		  
		  //.dagMode('bu')
		  //.dagLevelDistance(50)
		  .width(600)
		  .height(800)
		  .nodeCanvasObjectMode(node => (node.isNew)?'before':undefined)
		  .nodeCanvasObject((node, ctx) => {
        // add ring just for highlighted nodes
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_R * 1.4, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'orange';
        ctx.fill();
      })
		  //.d3Force('collision', d3.forceCollide(node => Math.sqrt(100 / (node.level + 1)) * NODE_REL_SIZE))
		  //.d3Force('collision', d3.forceCollide(node => Math.sqrt(100 / (node.level + 1)) * 20))
		  //.d3Force('charge', d3.forceManyBody(strength))
		  //.d3Force('charge', strength)
      	  //.d3VelocityDecay(0.3)
		  .onNodeDragEnd(node => {
				node.fx = node.x;
				node.fy = node.y;
			})
		  .onNodeClick(node => this.nodeClicked(node))
		  ;
	},
  }
  /*
  function strength(n) {
			return -300;
			}
			*/
  </script>