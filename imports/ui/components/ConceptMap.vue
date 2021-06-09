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
			myData () {
			  return {
				"nodes": [
					{"id": "A Bird's View on Derivatives", "group": 1 },
					{"id": "Normed Space", "group": 1},
					{"id": "Continuity and Norm", "group": 1},
					{"id": "Approximation of Order 1", "group": 1},
					{"id": "Linear Bounded Functions", "group": 1},
					{"id": "Linear Parts of Approximating Functions must be Bounded", "group": 1},
					{"id": "At Most One Approximating Affine Function", "group": 2},
					{"id": "Partial Derivatives", "group": 2},
					{"id": "3D-Space as Normed Space", "group": 3},
					{"id": "Sequence Space", "group": 1},
					{"id": "Define Continuity with Limits", "group": 0},
					{"id": "Order of Approximation", "group": 1},
					{"id": "Linear Bounded Functions and Continuity", "group": 2},
				],

				"links": [
					{"source": "A Bird's View on Derivatives", "target": "Normed Space", "value": "explain"},
					{"source": "A Bird's View on Derivatives", "target": "Continuity and Norm", "value": "explain"},
					{"source": "A Bird's View on Derivatives", "target": "Approximation of Order 1", "value": "explain"},
					{"source": "A Bird's View on Derivatives", "target": "Linear Bounded Functions", "value": "explain"},
					{"source": "A Bird's View on Derivatives", "target": "Linear Parts of Approximating Functions must be Bounded", "value": "explain"},
					{"source": "A Bird's View on Derivatives", "target": "At Most One Approximating Affine Function", "value": "explain"},
					{"source": "A Bird's View on Derivatives", "target": "Partial Derivatives", "value": "answer"},
					{"source": "Normed Space", "target": "3D-Space as Normed Space", "value": "example"},
					{"source": "Normed Space", "target": "Linear Bounded Functions", "value": "example"},
					{"source": "Normed Space", "target": "Sequence Space", "value": "example"},
					{"source": "Continuity and Norm", "target": "Define Continuity with Limits", "value": "example"},
					{"source": "Approximation of Order 1", "target": "Order of Approximation", "value": "explain"},
					{"source": "Linear Bounded Functions", "target": "Linear Bounded Functions and Continuity", "value": "explain"},
					{"source": "Linear Bounded Functions", "target": "Sequence Space", "value": "example"}
				]
			}
		}
	  },
	  mounted() {
		  /*
		const data = {
			"nodes": [
				{"id": "A Bird's View on Derivatives", "group": 1 },
				{"id": "Normed Space", "group": 1},
				{"id": "Continuity and Norm", "group": 1},
				{"id": "Approximation of Order 1", "group": 1},
				{"id": "Linear Bounded Functions", "group": 1},
				{"id": "Linear Parts of Approximating Functions must be Bounded", "group": 1},
				{"id": "At Most One Approximating Affine Function", "group": 2},
				{"id": "Partial Derivatives", "group": 2},
				{"id": "3D-Space as Normed Space", "group": 3},
				{"id": "Sequence Space", "group": 1},
				{"id": "Define Continuity with Limits", "group": 0},
				{"id": "Order of Approximation", "group": 1},
				{"id": "Linear Bounded Functions and Continuity", "group": 2},
			],

			"links": [
				{"source": "A Bird's View on Derivatives", "target": "Normed Space", "value": "explain"},
				{"source": "A Bird's View on Derivatives", "target": "Continuity and Norm", "value": "explain"},
				{"source": "A Bird's View on Derivatives", "target": "Approximation of Order 1", "value": "explain"},
				{"source": "A Bird's View on Derivatives", "target": "Linear Bounded Functions", "value": "explain"},
				{"source": "A Bird's View on Derivatives", "target": "Linear Parts of Approximating Functions must be Bounded", "value": "explain"},
				{"source": "A Bird's View on Derivatives", "target": "At Most One Approximating Affine Function", "value": "explain"},
				{"source": "A Bird's View on Derivatives", "target": "Partial Derivatives", "value": "answer"},
				{"source": "Normed Space", "target": "3D-Space as Normed Space", "value": "example"},
				{"source": "Normed Space", "target": "Linear Bounded Functions", "value": "example"},
				{"source": "Normed Space", "target": "Sequence Space", "value": "example"},
				{"source": "Continuity and Norm", "target": "Define Continuity with Limits", "value": "example"},
				{"source": "Approximation of Order 1", "target": "Order of Approximation", "value": "explain"},
				{"source": "Linear Bounded Functions", "target": "Linear Bounded Functions and Continuity", "value": "explain"},
				{"source": "Linear Bounded Functions", "target": "Sequence Space", "value": "example"}
			]
		};
		*/
		const Graph = ForceGraph()
		(document.getElementById('graph'))
			//.graphData(data)
			.graphData(this.cmap)
					.linkDirectionalArrowLength(6)
			.nodeId('id')
			.nodeAutoColorBy('group')
			.nodeCanvasObject((node, ctx, globalScale) => {
			const label = node.id;
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
	},
  }
  
  </script>