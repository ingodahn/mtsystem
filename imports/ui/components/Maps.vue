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
			<v-btn color="primary" class="mx-1 my-1" @click="showAll" :disabled="!showOne">Show all</v-btn>
			<v-btn color="primary" class="mx-1 my-1" @click="showLess" :disabled="!showOne">Less</v-btn>
			<v-btn color="primary" class="mx-1 my-1" @click="showMore" :disabled="!showOne">More</v-btn>
			<v-btn color="primary" class="mx-1 my-1" @click="explore" :disabled="!currentNode">Explore</v-btn>
		</v-row>
		
		<v-row v-if="session.view == '3D'"><h3>Camera control</h3></v-row>
		<v-row v-if="session.view == '3D'">
			<v-btn color="primary" class="mx-1 my-1" @click="cameraControl('up')">&uArr;</v-btn>
			<v-btn color="primary" class="mx-1 my-1" @click="cameraControl('down')">&dArr;</v-btn>
			<v-btn color="primary" class="mx-1 my-1" @click="cameraControl('left')">&lArr;</v-btn>
			<v-btn color="primary" class="mx-1 my-1" @click="cameraControl('right')">&rArr;</v-btn>
		</v-row>
		<v-row v-if="session.view == '3D'">
			<v-btn color="primary" class="mx-1 my-1" @click="cameraControl('in')">+</v-btn>
			<v-btn color="primary" class="mx-1 my-1" @click="cameraControl('out')">-</v-btn>
		</v-row>
		
		<NodeInfo :nodeId="currentNode.id" v-if="currentNode"></NodeInfo>
	</v-col>
</v-row>

</template>

  <script>
  import NodeInfo from "./NodeInfo.vue";
  export default {
	  props: ['cmap','orientation'],
	  data () {
		  return {
			  session: this.$root.$data.session,
			  currentNode: null,
			  currentColor: 'lightblue',
			  Graph: null,
			  showOne: false
		  }
	  },
	  components: { NodeInfo },
	  watch: {
		  
	  },
	  computed: {
		  mapId () {
			  return 'graph'+Math.random().toString();
		  },
		  neighbourhood() {
			const node=this.currentNode, d=this.session.neighbourhood;
			
            const cid=node.id;
			function linkSourceId(link) {
				return ((typeof link.source) == 'object')?link.source.id:link.source;
			}
			function linkTargetId(link) {
				return ((typeof link.target) == 'object')?link.target.id:link.target;
			}
			
            let id=0, newNodeIds=[cid],nodeIds=[cid];
            while (id < d) {
                let  nextNodeIds=[];
				
				this.cmap.links.filter(ll => newNodeIds.includes(linkSourceId(ll))).forEach(lf => {
					nextNodeIds.push(linkTargetId(lf))
				});
				this.cmap.links.filter(ll => newNodeIds.includes(linkTargetId(ll))).forEach(lf => {
					nextNodeIds.push(linkSourceId(lf))
				});
				
                let nextNodeReduced=[...new Set(nextNodeIds)].filter(item => (! nodeIds.includes(item)));
                nodeIds=nodeIds.concat(nextNodeReduced);
                newNodeIds=[...nextNodeReduced];
                id++;
            }
			
			let nodes=this.cmap.nodes.filter(nn => nodeIds.includes(nn.id));
			let links=this.cmap.links.filter(nn => (nodeIds.includes(linkSourceId(nn)) && nodeIds.includes(linkTargetId(nn))));
			
            return {nodes: nodes, links: links};
        },
	  },
	  methods: {
		  nodeClicked(node) {
			node.x=0;
			node.y=0;
			this.setCurrentNode(node,'pink');
			this.Graph.graphData(this.neighbourhood);
			this.Graph.d3Force('center', null);
			if (this.session.view == '3D') {
				this.Graph.cameraPosition({},node);
			} else {
				this.Graph.centerAt(node.x,node.y);
			}
			this.Graph.zoomToFit(500,10,n => n == node);
			this.showOne=true;
		  },
		  setCurrentNode(node,color) {
			  if (node != this.currentNode) {
				  if (this.currentNode) {
					  // Reset old node color
					  this.currentNode.color=this.currentColor;
				  }
				  this.currentColor = node.color;
				  node.color=color;
				  this.currentNode=node;
				  this.session.id='';
			  }
		  },
		  
		neighbourhood_1() {
			return this.neighbourhood().nodes.map(n => n.id);
		},
		showAll() {
			this.showOne=false;
			this.Graph.graphData(this.cmap);
			this.Graph.d3Force('center', null);
			this.Graph.zoomToFit(500);
		},
		showLess() {
			let d=this.session.neighbourhood;
			if (d) {
				this.session.neighbourhood=d-1;
				this.Graph.graphData(this.neighbourhood);
				this.Graph.d3Force('center', null);
				this.Graph.zoomToFit(500);
			}
		},
		showMore() {
			this.session.neighbourhood+=1;
			this.Graph.graphData(this.neighbourhood);
			this.Graph.d3Force('center', null);
			this.Graph.zoomToFit(500);
		},
		explore () {
			this.session.id=this.currentNode.id;
			this.session.mode='single';
		},
		cameraControl (dir) {
			let pos=this.Graph.cameraPosition();
			switch (dir) {
				case 'up':
					pos.y-=250;
					break;
				case 'down':
					pos.y+=250;
					break;
				case 'left':
					pos.x+=250;
					break;
				case 'right':
					pos.x-=250;
					break;
				case 'in':
					pos.z-=250;
					break;
				case 'out':
					pos.z+=250;
					break;
			}
			this.Graph.cameraPosition(pos);		
		}
	  },
	  mounted() {
	
		if (this.session.id) {
			this.currentNode=this.cmap.nodes.find(d => d.id == this.session.id);
			this.currentColor=this.currentNode.color;
			this.currentNode.color='pink';
			this.showOne = true;
		}
		
		if (this.session.view == '3D') {
			this.Graph = ForceGraph3D({ controlType: 'orbit' })
			(document.getElementById(this.mapId));
			this.Graph
			.width(this.$refs[this.mapId].clientWidth)
			.nodeId('id')
			.nodeLabel(node => `${node.title}`)
			.nodeRelSize(6)
			.linkWidth(5)
			.linkDirectionalParticles(10)
			.linkDirectionalParticleWidth(2.5)
			.linkDirectionalParticleSpeed(d => 0.005)
			.nodeAutoColorBy('group')
			.nodeThreeObject(node => {
				if (node.isNew) {
					const obj = new THREE.Mesh(
					new THREE.TorusGeometry(5+node.val,5),
					new THREE.MeshBasicMaterial({
						color: node.color,
						opacity: 0.5,
						transparent: true
					})
				)
				obj.userData = node
				return obj
				}
			})
			.onNodeDragEnd(node => {
				node.fx = node.x;
				node.fy = node.y;
				node.fz = node.z;
			})
			.dagMode(this.orientation)
			.onNodeClick(node => this.nodeClicked(node));
			
		// ms to cool down
		  this.Graph.cooldownTime(2000);
		  
		  if (this.currentNode) {
			  
			  let nb=this.neighbourhood;
			  
			  this.Graph.graphData(nb);
		  }  else this.Graph.graphData(this.cmap);

		  // Zoom to fit
		  this.Graph.d3Force('center', null);
			
		  // fit to canvas when engine stops
		  //Graph.onEngineStop(() => Graph.zoomToFit(500));
		  this.Graph.zoomToFit(500);
		
		} else {
			const NODE_R = 8;
			this.Graph = ForceGraph()
			(document.getElementById(this.mapId));
		this.Graph
		.linkDirectionalArrowLength(10)
		.nodeRelSize(6)
		.nodeId('id')
		.nodeAutoColorBy('group')
		.nodeLabel(node => `${node.title}`)
		.nodeRelSize(NODE_R)
		.dagMode(this.orientation)
		.d3Force('link', d3.forceLink().id(d => d.id).distance(100).strength(1))
		//.d3Force('charge', d3.forceManyBody().strength(-100))
		.width(this.$refs.conti.clientWidth)
		.height(Math.max(this.$refs.conti.clientHeight,800))
		.nodeCanvasObjectMode(node => (node.isNew)?'before':undefined)
		.nodeCanvasObject((node, ctx) => {
	// add ring just for highlighted nodes
	ctx.beginPath();
	ctx.arc(node.x, node.y, node.val +10, 0, 2 * Math.PI, false); // ???
	ctx.fillStyle = 'orange';
	ctx.fill();
	})
		.onNodeDragEnd(node => {
			node.fx = node.x;
			node.fy = node.y;
		})
		.onNodeClick(node => this.nodeClicked(node))
		;
		// ms to cool down
		this.Graph.cooldownTime(2000);
		 if (this.currentNode) {
			  
			  let nb=this.neighbourhood;
			  
			  this.Graph.graphData(nb);
		  }  else this.Graph.graphData(this.cmap);
		// Zoom to fit
		this.Graph.d3Force('center', null);

		// fit to canvas when engine stops
		this.Graph.width(this.$refs[this.mapId].clientWidth)
		this.Graph.onEngineStop(() => this.Graph.zoomToFit(500));
		}
		  
	},
  }
			
  </script>