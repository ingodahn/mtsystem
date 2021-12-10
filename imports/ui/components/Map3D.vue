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
			<v-btn color="primary" class="mx-1 my-1" @click="showAll">Show all</v-btn>
			<v-btn color="primary" class="mx-1 my-1" @click="showLess">Less</v-btn>
			<v-btn color="primary" class="mx-1 my-1" @click="showMore">More</v-btn>
			<v-btn color="primary" class="mx-1 my-1" @click="explore">Explore</v-btn>
		</v-row>
		<v-row><h3>Camera control</h3></v-row>
		<v-row>
			<v-btn color="primary" class="mx-1 my-1" @click="cameraControl('up')">&uArr;</v-btn>
			<v-btn color="primary" class="mx-1 my-1" @click="cameraControl('down')">&dArr;</v-btn>
			<v-btn color="primary" class="mx-1 my-1" @click="cameraControl('left')">&lArr;</v-btn>
			<v-btn color="primary" class="mx-1 my-1" @click="cameraControl('right')">&rArr;</v-btn>
		</v-row>
		<v-row>
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
			  //currentId: null,
			  currentNode: null,
			  currentColor: 'lightblue',
			  Graph: null
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
			
            let id=0, newNodeIds=[cid],nodeIds=[cid];
            while (id < d) {
                let  nextNodeIds=[];
				
				this.cmap.links.filter(ll => newNodeIds.includes(ll.source.id)).forEach(lf => {
					nextNodeIds.push(lf.target.id)
				});
				this.cmap.links.filter(ll => newNodeIds.includes(ll.target.id)).forEach(lf => {
					nextNodeIds.push(lf.source.id)
				});
				
                let nextNodeReduced=[...new Set(nextNodeIds)].filter(item => (! nodeIds.includes(item)));
                nodeIds=nodeIds.concat(nextNodeReduced);
                newNodeIds=[...nextNodeReduced];
                id++;
            }
			
			let nodes=this.cmap.nodes.filter(nn => nodeIds.includes(nn.id));
			let links=this.cmap.links.filter(nn => (nodeIds.includes(nn.source.id) && nodeIds.includes(nn.target.id)));
			console.log({"nodes": nodes, "links": links});
            return {nodes: nodes, links: links};
        },
	  },
	  methods: {
		  nodeClicked(node) {
			  console.log('Clicked on',node.title);
			  node.x=0;
			  node.y=0;
			  this.setCurrentNode(node,'pink');
				this.Graph.graphData(this.neighbourhood);
				this.Graph.d3Force('center', null);
				this.Graph.cameraPosition({},node);
				this.Graph.zoomToFit(500,10,n => n == node);
			  //this.$emit('nodeclicked',node.id);
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
			  }
		  },
		  
		neighbourhood_1() {
			return this.neighbourhood().nodes.map(n => n.id);
		},
		showAll() {
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
		//this.currentId=this.session.id;
		if (this.session.id) this.currentNode=this.cmap.node.find(d => d.id == this.session.id)
		
		this.Graph = ForceGraph3D({ controlType: 'orbit' })
		(document.getElementById(this.mapId));
		this.Graph
			.graphData(this.cmap)
			//.graphData(this.cmap)
			.width(this.$refs[this.mapId].clientWidth)
			.nodeId('id')
			.nodeLabel(node => `${node.title}`)
			.nodeRelSize(6)
			//.linkDirectionalArrowLength(10)
			.linkDirectionalParticles(10)
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
		  // Zoom to fit
		  this.Graph.d3Force('center', null);

		  // fit to canvas when engine stops
		  //Graph.onEngineStop(() => Graph.zoomToFit(500));
		  this.Graph.zoomToFit(500);
	},
  }
			
  </script>