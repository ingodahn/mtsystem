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
		/*  
		const Graph = ForceGraph()
		(document.getElementById('graph'))
			.graphData(this.cmap)
			.linkDirectionalArrowLength(6)
			.nodeId('id')
			.nodeAutoColorBy('group')
			.dagMode('td')
			.dagLevelDistance(30)
			.onNodeDragEnd(node => {
				node.fx = node.x;
				node.fy = node.y;
			})
			.onNodeClick(node => this.nodeClicked(node))
			.nodeCanvasObject((node, ctx, globalScale) => {
			const label = node.title;
			const fontSize = 12/globalScale;
			ctx.font = `${fontSize}px Sans-Serif`;
			const textWidth = ctx.measureText(label).width;
			const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

			ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
			ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillStyle = node.color;
			ctx.fillText(label, node.x, node.y);

			node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
			})
			.nodePointerAreaPaint((node, color, ctx) => {
			ctx.fillStyle = color;
			const bckgDimensions = node.__bckgDimensions;
			bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
		});
		*/
	},
  }
  
  </script>