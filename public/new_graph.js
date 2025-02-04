
var svg = d3.select("#graph")
	.append("svg")
	.append("g")

svg.append("g")
	.attr("class", "slices");
svg.append("g")
	.attr("class", "labels");
svg.append("g")
	.attr("class", "lines");

var width = 1500,
    height = 950,
	radius = Math.min(width, height) / 2;

var pie = d3.layout.pie()
	.sort(null)
	.value(function(d) {
		return d.value;
	});

var arc = d3.svg.arc()
	.outerRadius(radius * 0.8)
	.innerRadius(radius * 0.4);

var outerArc = d3.svg.arc()
	.innerRadius(radius * 0.9)
	.outerRadius(radius * 0.9);

svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var key = function(d){ return d.data.label; };

let array = sessionStorage.getItem('myArray');



// //cothors
// //co-author list for  graph
// const new_getCoauthors = async (name) => {
// 	const resp = await fetch(
// 	  `https://dblp.org/search/publ/api?q=${name}&format=json`
// 	);
// 	const respdata = await resp.json();
// 	const result = respdata.result.hits.hit;
// 	const final = result.filter((doc) => {
// 	  let co_authors = doc.info.authors.author;
// 	  let flag = 0;
// 	  for (let i = 0; i < co_authors.length; i++) {
// 		if (co_authors[i].text === name) {
// 		  flag = 1;
// 		  break;
// 		}
// 	  }
// 	  return flag == 1;
// 	});
  
  
  
// 	const co_authors = final.map((doc) => {
// 	  const array_authors = doc.info.authors.author;
// 	  const temp = array_authors.map((doc) => {
// 		return doc.text;
// 	  });
  
// 	  return temp;
// 	});
// 	console.log(co_authors);
// 	return co_authors;
//   };
let children = []
const new_network = async (name)=>{
	const array  = await getCoauthors(name);
	  let temp = []
	  for(let i=0;i<array.length;i++)
	  {
		const filter = array[i].filter(obj=>{
		  return obj!=name;
		})
		filter.forEach(ele => {
		  if(temp.includes(ele))
		  {
			console.log("repeated");
	
		  }
		  else{
			temp.push(ele);
			children.push(ele)
	
		  }
		});
	  }
	  console.log(children);

	var color = d3.scale.ordinal()
	.domain(children)
	.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

	function randomData (){
	var labels = color.domain();
	return labels.map(function(label){
		return { label: label, value: Math.random() }
	});
	}

	change(randomData());

	d3.select(".randomize")
	.on("click", function(){
		change(randomData());
	});


	function change(data) {

	/* ------- PIE SLICES -------*/
	var slice = svg.select(".slices").selectAll("path.slice")
		.data(pie(data), key);

	slice.enter()
		.insert("path")
		.style("fill", function(d) { return color(d.data.label); })
		.attr("class", "slice");

	slice		
		.transition().duration(1000)
		.attrTween("d", function(d) {
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				return arc(interpolate(t));
			};
		})

	slice.exit()
		.remove();

	/* ------- TEXT LABELS -------*/

	var text = svg.select(".labels").selectAll("text")
		.data(pie(data), key);

	text.enter()
		.append("text")
		.attr("dy", ".35em")
		.text(function(d) {
			return d.data.label;
		});

	function midAngle(d){
		return d.startAngle + (d.endAngle - d.startAngle)/2;
	}

	text.transition().duration(1000)
		.attrTween("transform", function(d) {
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				var pos = outerArc.centroid(d2);
				pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
				return "translate("+ pos +")";
			};
		})
		.styleTween("text-anchor", function(d){
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				return midAngle(d2) < Math.PI ? "start":"end";
			};
		});

	text.exit()
		.remove();

	/* ------- SLICE TO TEXT POLYLINES -------*/

	var polyline = svg.select(".lines").selectAll("polyline")
		.data(pie(data), key);

	polyline.enter()
		.append("polyline");

	polyline.transition().duration(1000)
		.attrTween("points", function(d){
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				var pos = outerArc.centroid(d2);
				pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
				return [arc.centroid(d2), outerArc.centroid(d2), pos];
			};			
		});

	polyline.exit()
		.remove();
	};

	  //return children;
	}
new_network(name);