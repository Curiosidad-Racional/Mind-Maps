//history document["history"] = [];
document["debug"] = false;

function startDirectedGraph(file, div, goback) {
    //history document.history.push(file);
    if (file && !goback) {
        if (file.search("·") != -1) {
            window.history.pushState({json:file}, "json Navigation", "");
        } else if (file != "") {
            window.history.pushState({json:file}, "json Navigation", "?json=" + file);
        }
    }
    $(document).ready(function() {
        initialize(file, div).then (
            function (control) {
                drawDirectedGraph(control);
            }
        );
    });
}

window.onpopstate = function(event) {
    if (event.state) {
        if (event.state.json) startDirectedGraph(event.state.json, "#graph", true);
        else initialize();
    } else startDirectedGraph("·index.json");
};

function drawDirectedGraph(control) {

    var svg = control.svg;

    var force = control.force;
    force.nodes(control.nodes)
        .links(control.links)
        .start();

    // Update the links
    var link = svg.selectAll("path.link")
        .data(control.links, function(d) { return d.name; } );

    // Enter any new links
    link.enter().insert("svg:path", ".node")
        .attr("class", function(d) { return d.style ? d.style : "link"})
        .attr("marker-start", function(d) {
            return d.start ? "url(#" + d.start + ")" : "";
        })
        .attr("marker-end", function(d) {
            return d.end ? "url(#" + d.end + ")" : "";
        })
        .attr("d", function(d) {
            var dr = 200/(2*(d.linknum-1)+1);
            return "M" + d.source.x + "," + d.source.y
                + "A" + dr + "," + dr + " 0 0,1 "
                + d.target.x + "," + d.target.y;
        })
        .on("dblclick", function(d){
            d3.event.stopPropagation();
            control.linkClickInProgress=false;
            if (d.dblclick) {
                if (d.dblclick.charAt(0) == "#") {
                    var div2display = document
                        .getElementById(d.dblclick.substring(1));
                    if (div2display.style.display == "none"
                        || div2display.style.display == "")
                        div2display.style.display = "inline";
                    else
                        div2display.style.display = "none";
                } else {
                    if (/(?:\.([^.]+))?$/.exec(d.click)[1] == "json") {
                        startDirectedGraph(d.dblclick, control.divName);
                    } else {
                        window.open(d.dblclick);
                    }
                }
            }
        })
        .on("click", function(d){
            d3.event.stopPropagation();
            // this is a hack so that click doesnt fire on the1st click of a dblclick
            if (!control.linkClickInProgress) {
	        if (document.state == "edit") {
	            // Edit link
                    var output = document.getElementById("linkJSON"),
                    dialog = document.getElementById("linkForm");
                    if (document.debug) output.innerHTML = highlightJSON(d);
                    dialog.style.visibility = "visible";
	            var thisLink = this;
	            // Change source
	            d3.select("#inputSource").on("change", function() {
	                for (var i=0; i<control.nodes.length; i++) {
	                    if (control.nodes[i].name == this.value) {
		                d.source = control.nodes[i];
		                break;
	                    }
	                }
	                d3.select(thisLink).attr("d", function(d) {
	                    var dr = 200/(2*(d.linknum-1)+1);
	                    return "M" + d.source.x + "," + d.source.y
                                + "A" + dr + "," + dr + " 0 0,1 "
                                + d.target.x + "," + d.target.y;
	                })
	            }).selectAll("option")
	                .data(control.nodes).enter().append("option")
	                .property("value", function(dd) {return dd.name;})
	                .property("selected", function(dd) {
                            if (dd.name == d.source.name) return true;
                        })
	                .html(function(dd){return dd.Name;});
	            // Change target
	            d3.select("#inputTarget").on("change", function() {
	                for (var i=0; i<control.nodes.length; i++) {
	                    if (control.nodes[i].name == this.value) {
		                d.target = control.nodes[i];
		                break;
	                    }
	                }
	                d3.select(thisLink).attr("d", function(d) {
	                    var dr = 200/(2*(d.linknum-1)+1);
	                    return "M" + d.source.x + "," + d.source.y
                                + "A" + dr + "," + dr + " 0 0,1 "
                                + d.target.x + "," + d.target.y;
	                });
	            }).selectAll("option")
	                .data(control.nodes).enter().append("option")
	                .property("value", function(dd) {return dd.name;})
	                .property("selected", function(dd) {
                            if (dd.name == d.target.name) return true;
                        })
	                .html(function(dd){return dd.Name;});
	            // Change start
	            d3.select("#inputStart").on("change", function() {
	                if (this.value != "")
	                    d.start = this.value;
	                else
	                    delete d.start;
	                d3.select(thisLink).attr("marker-start", function(d) {
	                    return d.start ? "url(#" + d.start + ")" : ""; 
	                });
	            }).selectAll("option")
	                .property("selected", function() {
                            if (this.value == (d.start ? d.start : ""))
                                return true;
                        });
	            // Change style
	            d3.select("#inputStyle").on("change", function() {
	                if (this.value != "")
	                    d.style = this.value;
	                else
	                    delete d.style;
	                d3.select(thisLink).attr("class", function(d) {
                            return d.style ? d.style : "link"
                        });
	            }).selectAll("option")
	                .property("selected", function() {
                            if (this.value == (d.style ? d.style : ""))
                                return true;
                        });
	            // Change end
	            d3.select("#inputEnd").on("change", function() {
	                if (this.value != "")
	                    d.end = this.value;
	                else
	                    delete d.end;
	                d3.select(thisLink).attr("marker-end", function(d) {
	                    return d.end ? "url(#" + d.end + ")" : ""; 
	                });
	            }).selectAll("option")
	                .property("selected", function() {
                            if (this.value == (d.end ? d.end : ""))
                                return true;
                        });
	            // Change label
	            d3.select("#inputLLabel").on("input", function() {
	                if (this.value != "")
	                    d.label = this.value;
	                else
	                    delete d.label;
	                d3.select(thisLink).select("title").html(d.label);
	            }).property("value", d.label ? d.label : "");
	            // Change distance
	            d3.select("#inputDistance").on("input", function() {
	                var thevalue = +this.value;
	                control.force.stop();
	                if (thevalue != control.options.linkDistance)
	                    d.distance = thevalue;
	                else
	                    delete d.distance;
	                control.force.resume();
	            }).property("value", d.distance ? d.distance
                                : control.options.linkDistance);
	            // Change click
	            d3.select("#inputLClick").on("input", function() {
	                if (this.value != "")
	                    d.click = this.value;
	                else
	                    delete d.click;
	            }).property("value", d.click ? d.click : "");
	            // Change dblclick
	            d3.select("#inputLDblClick").on("input", function() {
	                if (this.value != "")
	                    d.dblclick = this.value;
	                else
	                    delete d.dblclick;
	            }).property("value", d.dblclick ? d.dblclick : "");

	            // Close form
	            d3.select("#linkForm").on("click", function() {
	                this.style.visibility = "hidden";
	                d3.select(this).selectAll("#inputSource,#inputTarget")
                            .selectAll("option").remove();
	                var linknum = 1;
	                for (var i=0; i<control.links.length; i++) {
	                    if (d.source.name == control.links[i].source.name
                                && d.target.name == control.links[i].target.name) {
		                control.links[i].linknum = linknum;
		                linknum++;
	                    }
	                }
	                if (d.linknum > 1)
	                    d3.select(thisLink).attr("d", function(d) {
	                        var dr = 200/(2*(d.linknum-1)+1);
	                        return "M" + d.source.x + "," + d.source.y
                                    + "A" + dr + "," + dr + " 0 0,1 "
                                    + d.target.x + "," + d.target.y;
	                    });
	                var copy = control.copy.d3.data
                            .links[control.links.indexOf(d)];
	                copy.source = d.source.name;
	                copy.target = d.target.name;
	                if (d.start) copy.start = d.start;
                        else delete copy.start;
	                if (d.style) copy.style = d.style;
                        else delete copy.style;
	                if (d.end) copy.end = d.end;
                        else delete copy.end;
	                if (d.label) copy.label = d.label;
                        else delete copy.label;
	                if (d.click) copy.click = d.click;
                        else delete copy.click;
	                if (d.dblclick) copy.dblclick = d.dblclick;
                        else delete copy.dblclick;
                   // distance needs redraw
	                if (d.distance) {
	                	  if (copy.distance) {
	                		   if (d.distance != copy.distance) {
	                		   	 copy.distance = d.distance;
	                		   	 control.force.stop();
                  	          drawDirectedGraph(control);
	                		   }
	                	  } else {
	                		   copy.distance = d.distance;
	                	      control.force.stop();
                  	      drawDirectedGraph(control);
	                	  }
	                } else delete copy.distance;
	            });
	            // Delete link
	            d3.select("#delLink").on("click", function() {
	                d3.event.stopPropagation();
	                document.getElementById("linkForm")
                            .style.visibility = "hidden";
	                d3.select("#linkForm")
                            .selectAll("#inputSource,#inputTarget")
                            .selectAll("option").remove();
	                d3.select(thisLink).attr("marker-start", "")
                            .attr("marker-end", "");
	                var index = control.links.indexOf(d);
	                control.copy.d3.data.links.splice(index,1);
	                control.links.splice(index,1);
	                control.force.stop();
	                drawDirectedGraph(control);
	            });
	        } else {
                    control.linkClickInProgress = true;
                    setTimeout(function(){
                        if (control.linkClickInProgress) { 
                            control.linkClickInProgress = false;
                            if (d.click) {
                                if (d.click.charAt(0) == "#") {
                                    var div2display = document
                                        .getElementById(d.click.substring(1));
                                    if (div2display.style.display == "none"
                                        || div2display.style.display == "")
                                        div2display.style.display = "inline";
                                    else
                                        div2display.style.display = "none";
                                } else {
                                    if (/(?:\.([^.]+))?$/.exec(d.click)[1] == "json") {
                                        startDirectedGraph(d.click, control.divName);
                                    } else {
                                        window.open(d.click);
                                    }
                                }
                            }
                        }
                    },control.clickHack);
	        }
            }
        })
        .append("svg:title")
        .html(function(d) { return d.label ; });

    // Exit any old links.
    link.exit().remove();


    // Update the nodes
    var node = svg.selectAll("g.node")
        .data(control.nodes, function(d) { return d.name; });

    node.select("circle")
        .style("fill", function(d) {
            return getColor(d);
        })
        .attr("r", function(d) {
            return d.radius;//getRadius(d);
        });

    // drag move
    var drag = d3.behavior.drag()
        .on("dragstart", function (d, i) {
	    d3.event.sourceEvent.stopPropagation();
            control.force.stop(); // stops the force auto positioning
        })
        .on("drag", function (d, i) {
            d.px += d3.event.dx;
            d.py += d3.event.dy;
            d.x += d3.event.dx;
            d.y += d3.event.dy; 
            tick(); // make it work together updating both px,py,x,y on d !
        })
        .on("dragend", function (d, i) {
            if (d3.event.sourceEvent.ctrlKey) d.fixed = !d.fixed;
            tick();
            control.force.resume();
        });

    // Enter any new nodes.
    var nodeEnter = node.enter()
        .append("svg:g")
        .attr("class", "node")
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")"; })
        .on("dblclick", function(d){
            if (d3.event.defaultPrevented) return;
            d3.event.stopPropagation();
            control.nodeClickInProgress=false;
            if (d.dblclick) {
                if (d.dblclick.charAt(0) == "#") {
                    var div2display = document
                        .getElementById(d.dblclick.substring(1));
                    if (div2display.style.display == "none"
                        || div2display.style.display == "")
                        div2display.style.display = "inline";
                    else
                        div2display.style.display = "none";
                } else {
                    if (/(?:\.([^.]+))?$/.exec(d.click)[1] == "json") {
                        startDirectedGraph(d.dblclick, control.divName);
                    } else {
                        window.open(d.dblclick);
                    }
                }
            }
        })
        .on("click", function(d){
            if (d3.event.defaultPrevented) return;
            d3.event.stopPropagation();
            // this is a hack so that click doesnt fire on the1st click of a dblclick
            if (!control.nodeClickInProgress) {
                if (document.state == "add") {
                    // Add link
	            if (control.sourceNode) {
	                var linknum = 1, len = control.links.length,
                        i = 0, concat = 0, name = "link_0";
	                // find unique name
	                while (i < len) {
	                    name = "link_" + concat;
	                    while (i < len) {
		                if (name == control.links[i].name) {
		                    i = 0;
		                    concat++;
                                    break;
		                } else {
		                    i++;
		                }
	                    }
	                }
	                // Calculate linknum
	                for (var i=0; i<control.links.length; i++) {
	                    if (control.sourceNode.name == control
                                .links[i].source.name
                                && d.name == control.links[i].target.name) {
		                control.links[i].linknum = linknum;
		                linknum++;
	                    }
	                }
	                control.links.push(
                            {"source":control.sourceNode,"target":d,
                             "linknum":linknum,"name":name}
                        );
	                control.copy.d3.data.links.push(
                            {"source":control.sourceNode.name,"target":d.name,
                             "name":name}
                        );
	                control.sourceNode = false;
                        control.wildLink.classed("hidden", true).attr("d","M0,0L0,0");
	                control.force.stop();
	                drawDirectedGraph(control);
	            } else {
	                control.sourceNode = d;
                        control.wildLink.classed("hidden", false);
	            }
                } else if (document.state == "edit") {
	            // Edit node
                    var output = document.getElementById("nodeJSON"),
                    dialog = document.getElementById("nodeForm");
                    if (document.debug) output.innerHTML = highlightJSON(d);
                    dialog.style.visibility = "visible";
	            var thisNode = this;
	            // Change name
	            d3.select("#inputName").on("input", function() {
	                if (this.value != "")
	                    d.Name = this.value;
	                else
	                    delete d.Name;
	                d3.select(thisNode).selectAll("text").html(d.Name);
	            }).property("value", d.Name ? d.Name : "");
	            // Change label
	            d3.select("#inputLabel").on("input", function() {
	                if (this.value != "")
	                    d.label = this.value;
	                else
	                    delete d.label;
	                d3.select(thisNode).select("title").html(d.label);
	            }).property("value", d.label ? d.label : "");
	            // Change group
	            d3.select("#inputGroup").on("input", function() {
	                if (this.value != "")
	                    d.group = this.value;
	                else
	                    delete d.group;
	                d3.select(thisNode).select("circle")
                            .style("fill", function(d) {
	                        return getColor(d);
	                    })
	            }).property("value", d.group ? d.group : "");
	            // Change radius
	            d3.select("#inputRadius").on("input", function() {
	                if (this.value != "")
	                    d.radius = +this.value;
	                else
	                    delete d.radius;
	                d3.select(thisNode).select("circle")
                            .attr("r", d.radius);//getRadius(d));
	            }).property("value", d.radius);
	            // Change click
	            d3.select("#inputClick").on("input", function() {
	                if (this.value != "")
	                    d.click = this.value;
	                else
	                    delete d.click;
	            }).property("value", d.click ? d.click : "");
	            // Change dblclick
	            d3.select("#inputDblClick").on("input", function() {
	                if (this.value != "")
	                    d.dblclick = this.value;
	                else
	                    delete d.dblclick;
	            }).property("value", d.dblclick ? d.dblclick : "");
	            // Close form
	            d3.select("#nodeForm").on("click", function() {
	                this.style.visibility = "hidden";
	                var copy = control.copy.d3.data
                            .nodes[control.nodes.indexOf(d)];
	                if (d.Name) copy.Name = d.Name; else delete copy.Name;
	                if (d.label) copy.label = d.label;
                        else delete copy.label;
	                if (d.group) copy.group = d.group;
                        else delete copy.group;
	                if (d.radius) copy.radius = d.radius;
                        else delete copy.radius;
	                if (d.click) copy.click = d.click;
                        else delete copy.click;
	                if (d.dblclick) copy.dblclick = d.dblclick;
                        else delete copy.dblclick;
	                console.log(copy);
	            });
	            // Delete node
	            d3.select("#delNode").on("click", function() {
	                d3.event.stopPropagation();
	                document.getElementById("nodeForm")
                            .style.visibility = "hidden";
	                var i = 0;
	                while (i<control.links.length) {
	                    if (control.links[i].source.name == d.name
                                || control.links[i].target.name == d.name) {
		                control.copy.d3.data.links.splice(i,1);
		                control.links.splice(i,1);
		                i--;
	                    }
	                    i++;
	                }

	                var index = control.nodes.indexOf(d);
	                control.copy.d3.data.nodes.splice(index,1);
	                control.nodes.splice(index,1);
	                for (i=index; i<control.nodes.length; i++) {
	                    control.nodes[i].index = i;
	                }

	                control.force.stop();
	                drawDirectedGraph(control);
	            });
	        } else if (!d3.event.ctrlKey && !d3.event.shiftKey) {
	            // Follow click navigation link
                    control.nodeClickInProgress = true;
                    setTimeout(function(){
                        if (control.nodeClickInProgress) { 
                            control.nodeClickInProgress = false;

                            if (d.click) {
                                if (d.click.charAt(0) == "#") {
                                    var div2display = document
                                        .getElementById(d.click.substring(1));
                                    if (div2display.style.display == "none"
                                        || div2display.style.display == "")
                                        div2display.style.display = "inline";
                                    else
                                        div2display.style.display = "none";
                                } else {
                                    if (/(?:\.([^.]+))?$/.exec(d.click)[1] == "json") {
                                        startDirectedGraph(d.click, control.divName);
                                    } else {
                                        window.open(d.click);
                                    }
                                }
                            }
                        }
                    },control.clickHack);
	        } else if (d3.event.shiftKey) {
	            // Select-deselect node
                    d.isCurrentlyFocused = !d.isCurrentlyFocused;
	            control.force.stop();
                    drawDirectedGraph(makeFilteredData(control));
	        }
            }
        }).call(drag);

    nodeEnter
        .append("svg:circle")
        .attr("r", function(d) {
            return d.radius;//getRadius(d);
        })
        .style("fill", function(d) {
            return getColor(d);
        })
        .append("svg:title")
        .html(function(d) { return d.label; });
    // text is done once for shadow as well as for text
    nodeEnter.append("svg:text")
        .attr("x", control.options.labelOffset)
        .attr("dy", ".31em")
        .attr("class", "shadow")
        .style("font-size",control.options.labelFontSize + "px")
        .html(function(d) {
            return d.Name ? d.Name : d.name;
        });
    nodeEnter.append("svg:text")
        .attr("x", control.options.labelOffset)
        .attr("dy", ".35em")
        .attr("class", "text")
        .style("font-size",control.options.labelFontSize + "px")
        .html(function(d) {
            return d.Name ? d.Name : d.name;
        });

/*
    nodeEnter.append("svg:foreignObject")
        .attr("width", 0)
        .attr("height", 0)
        .append("xhtml:text")
        .attr("x", control.options.labelOffset)
        .attr("dy", ".31em")
        .attr("class", "shadow")
        .style("font-size",control.options.labelFontSize + "px")
        .html(function(d) {
            return d.Name ? d.Name : d.name;
        });
    nodeEnter.append("svg:foreignObject")
        .attr("width", 100)
        .attr("height", 100)
        .append("xhtml:text")
        .attr("x", control.options.labelOffset)
        .attr("dy", ".35em")
        .attr("class", "text")
        .style("font-size",control.options.labelFontSize + "px")
        .html(function(d) {
            return d.Name ? d.Name : d.name;
        });
*/
/*
// Load MathJax at the end
(function () {
  var head = document.getElementsByTagName("head")[0], script;
  script = document.createElement("script");
  script.type = "text/x-mathjax-config";
  script[(window.opera ? "innerHTML" : "text")] =
    "MathJax.Hub.Config({\n" + 
    "  jax: ['input/TeX', 'output/SVG']," +
    "  extensions: ['tex2jax.js','TeX/AMSmath.js','TeX/AMSsymbols.js', 'TeX/noUndefined.js']," +
    "  tex2jax: { inlineMath: [['$','$'], ['\\\\(','\\\\)']] }\n" +
    "});"
  head.appendChild(script);
  script = document.createElement("script");
  script.type = "text/javascript";
  script.src  = "http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML";
  head.appendChild(script);
})();
*/

    // Exit any old nodes.
    node.exit().remove();
    control.link = svg.selectAll("path.link");
    control.node = svg.selectAll("g.node");
    force.on("tick", tick);


    // Functions inside
    function tick() {
        control.link.attr("d", function(d) {
            var dr = 200/(2*(d.linknum-1)+1);
            return "M" + d.source.x + "," + d.source.y
                + "A" + dr + "," + dr + " 0 0,1 "
                + d.target.x + "," + d.target.y;
        });
        control.node.attr("transform", function(d) {
            // d.x = Math.min(control.options.width-d.radius,Math.max(d.radius,d.x));
            // d.y = Math.min(control.options.height-d.radius,Math.max(d.radius,d.y));
            return "translate(" + d.x + "," + d.y + ")";
        });
    }

    function getColor(d) {
        if (control.data.groups.hasOwnProperty(d.group)) {
            var color = control.data.groups[d.group];
        } else {
            var color = control.color(d.group);
        }
        if (d.isCurrentlyFocused) {
            color = colorMix(color, control.options.nodeFocusColor);
        }
        return color;
    }
}


function makeFilteredData(control) {
    // we'll keep only the data where filterned nodes are the source or target
    var newNodes = [];
    var newLinks = [];

    for (var i = 0; i < control.data.links.length ; i++) {
        var link = control.data.links[i];
        if (link.target.isCurrentlyFocused || link.source.isCurrentlyFocused) {
            newLinks.push(link);
            addNodeIfNotThere(link.source,newNodes);
            addNodeIfNotThere(link.target,newNodes);
        }
    }
    // if none are selected reinstate the whole dataset
    if (newNodes.length > 0) {
        control.links = newLinks;
        control.nodes = newNodes;
    } else {
        control.nodes = control.data.nodes;
        control.links = control.data.links;
    }
    return control;
}
    
function addNodeIfNotThere( node, nodes) {
    for ( var i=0; i < nodes.length; i++) {
        if (nodes[i].name == node.name) return i;
    }
    return nodes.push(node) -1;
}


function organizeData(control) {
    // Convert nodes names to nodes numbers, and groups to colors
    tmp_json = {};
    for (var i=0; i < control.nodes.length; i ++ ) {
        var node = control.nodes[i]; 
        node.isCurrentlyFocused = false;
        // name source,target to number.
        tmp_json[node.name] = i;
    }
    
    for (var i=0; i < control.links.length; i ++ ) {
        var link = control.links[i];
        // name to number
        link.source = control.nodes[tmp_json[link.source]];
        link.target = control.nodes[tmp_json[link.target]];
    }

    //sort links by source, then target
    control.links.sort(function(a,b) {
        if (a.source > b.source) {return 1;}
        else if (a.source < b.source) {return -1;}
        else {
            if (a.target > b.target) {return 1;}
            if (a.target < b.target) {return -1;}
            else {return 0;}
        }
    });

    //any links with duplicate source and target get an incremented 'linknum'
    for (var i=0; i<control.links.length; i++) {
        if (i != 0 &&
            control.links[i].source == control.links[i-1].source &&
            control.links[i].target == control.links[i-1].target) {
            control.links[i].linknum = control.links[i-1].linknum + 1;
        } else {control.links[i].linknum = 1;};
    }

    return control;
}


function initialize(file, div) {
    var initPromise = $.Deferred();

    getData(file).then(function(data) {
        return initPromise.resolve(initOptions(file, data, div));
    });

    return initPromise.promise();
}

function initOptions(file, data, div) {
    if (!div) var div = "#graph";

    var control = {};
    control.data = data;
    control.divName = div;
    control.file = file ? file : "";
    control.copy = jQuery.extend(true, {}, data);
    // Help add link
    control.sourceNode = false;
    d3.select("#menu").on("click", function() {
        control.sourceNode = false;
    });

    control.options = $.extend({
        stackHeight : 12,
        fontSize : 14,
        labelFontSize : 8,
        markerWidth : 0,
        markerHeight : 0,
        width : $(window).width()*0.8,
        linkDistance : 80,
        charge : -120,
        styleColumn : null,
        styles : null,
        nodeFocusColor: "#000000",
        labelOffset: "5",
        gravity: .05,
        height : $(window).height()*0.8
    }, control.data.d3.options);

   
    var options = control.options;
    control.width = options.width;
    control.height = options.height;
    control.title = control.data.d3.properties.title;
    control.tags = control.data.d3.properties.tags;
    control.data = control.data.d3.data;
    control.nodes = control.data.nodes;
    control.links = control.data.links;
    control.color = d3.scale.category20();
    control.clickHack = 200;

    organizeData(control);

    // Reset Document
    document.title = control.title;
    document.state = "navigate";
    d3.selectAll(".modalForm").style("visibility", "hidden");
    document.getElementById("nav").checked = true;
    document.getElementById("groups").checked = false;
    document.getElementById("new").checked = false;
    document.getElementById("save").checked = false;


    // Animation parameters
    control.force = d3.layout.force()
        .size([control.width, control.height])
        .linkDistance(function(d) {
            return d.distance ? d.distance : control.options.linkDistance;
        })
        .charge(control.options.charge)
        .gravity(control.options.gravity);

    // Create svg
    d3.select(control.divName)
        .style("width",control.width+"px")
        .style("height",control.height+"px")
        .selectAll("svg").remove();
    control.svg = d3.select(control.divName)
        .append("svg:svg")
        .attr("width", control.width)
        .attr("height", control.height);
    var svg = control.svg


    // build the arrow.
    svg.append("svg:defs").selectAll("marker")
        .data(["start"]) // Different link/path types can be defined here
        .enter().append("svg:marker") // This section adds in the arrows
        .attr("id", function(d) { return d; })
        .attr("viewBox", "0 -2 5 4")
        .attr("refX", -3)
        .attr("refY", -.5)
        .attr("markerWidth", 4)
        .attr("markerHeight", 4)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M5,-2L0,0L5,2Z");

    svg.append("svg:defs").selectAll("marker")
        .data(["end"]) // Different link/path types can be defined here
        .enter().append("svg:marker") // This section adds in the arrows
        .attr("id", function(d) { return d; })
        .attr("viewBox", "0 -2 5 4")
        .attr("refX", 8)
        .attr("refY", -.5)
        .attr("markerWidth", 4)
        .attr("markerHeight", 4)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-2L5,0L0,2Z");

    // build big arrows.
    svg.append("svg:defs").selectAll("marker")
        .data(["bstart"]) // Different link/path types can be defined here
        .enter().append("svg:marker") // This section adds in the arrows
        .attr("id", function(d) { return d; })
        .attr("viewBox", "0 -2 5 4") // proportionals
        .attr("refX", -10) // bstart.refX + bend.refX = scale or size
        .attr("refY", -1)
        .attr("markerWidth", 4) // scale or size
        .attr("markerHeight", 4) // scale or size
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M5,-2L0,0L5,2Z"); // proportionals

    svg.append("svg:defs").selectAll("marker")
        .data(["bend"]) // Different link/path types can be defined here
        .enter().append("svg:marker") // This section adds in the arrows
        .attr("id", function(d) { return d; })
        .attr("viewBox", "0 -2 5 4") // proportionals
        .attr("refX", 14) // bstart.refX + bend.refX = scale or size
        .attr("refY", -1)
        .attr("markerWidth", 4) // scale or size
        .attr("markerHeight", 4) // scale or size
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-2L5,0L0,2Z"); // proportionals

    // Define the zoom function for the zoomable tree
    var svgGroup = svg.append("g");
    function zoom() {
        control.force.stop();
        svgGroup.attr("transform", "translate(" + d3.event.translate
                      + ")scale(" + d3.event.scale + ")");
        control.force.resume();
    }
    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    var zoomListener = d3.behavior.zoom().scaleExtent([.333333,1]).on("zoom", zoom);

    // Define background dblclick and click
    svg/*//history .on("dblclick", function() {
        if (d3.event.defaultPrevented) return;
        if (document.state == "navigate") {
            // Go back
            if (document.history.length > 1) {
                document.history.pop();
                var lastFile = document.history[document.history.length-1];
                document.history.pop();
                startDirectedGraph(lastFile, control.divName);
            }
        }
    })*/
    .on("click", function() {
        if (d3.event.defaultPrevented) return;
        if (document.state == "add") {
            // Add node
            var len = control.nodes.length, transl = zoomListener.translate(),
            scale = zoomListener.scale(), mouse = d3.mouse(this),
            x = (mouse[0] - transl[0])/scale, y = (mouse[1] - transl[1])/scale,
	    i = 0, concat = 0, name = "node_0";
            // find unique name
            while (i < len) {
	        name = "node_" + concat;
	        while (i < len) {
	            if (name == control.nodes[i].name) {
	                i = 0;
	                concat++;
                        break;
	            } else {
	                i++;
	            }
	        }
            }
            control.nodes.push(
                {"name":name,"Name":"Node_"+concat,"radius":7,
                 "isCurrentlyFocused":false,"index":len,"weigth":1,
                 "x":x,"y":y,"px":x,"py":y,"fixed":0}
            );
            control.copy.d3.data.nodes.push(
                {"name":name,"Name":"Node_"+concat,"radius":7}
            );
            control.force.stop();
            drawDirectedGraph(control);
        } else if (document.state == "edit") {
            // Edit options
            var dialog = document.getElementById("optionsForm");
            dialog.style.visibility = "visible";
            // Change title
            d3.select("#inputTitle").on("input", function() {
	        control.copy.d3.properties.title = this.value;
                document.title = this.value;
            }).property("value", control.title);
            // Change tags
            d3.select("#inputTags").on("input", function() {
                this.value = this.value.replace(/  +/g," ")
                    .replace(/[^a-z0-9, ñçáéíóúàèìòùäëïöü]/g,"");
	        control.copy.d3.properties.tags = this.value;
            }).property("value", control.tags);
            // Change width
            d3.select("#inputWidth").on("input", function() {
	        if (this.value != "")
	            control.copy.d3.options.width = +this.value;
	        else
	            delete control.copy.d3.options.width;
            }).property("value", control.width);
            // Change height
            d3.select("#inputHeight").on("input", function() {
	        if (this.value != "")
	            control.copy.d3.options.height = +this.value;
	        else
	            delete control.copy.d3.options.height;
            }).property("value", control.height);
            // Change font size
            d3.select("#inputFontSize").on("input", function() {
	        control.copy.d3.options.fontSize = +this.value;
            }).property("value", control.options.fontSize);
            // Change label font size
            d3.select("#inputLabelFontSize").on("input", function() {
	        control.copy.d3.options.labelFontSize = +this.value;
            }).property("value", control.options.labelFontSize);
            // Change link distance
            d3.select("#inputLinkDistance").on("input", function() {
	        control.copy.d3.options.linkDistance = +this.value;
            }).property("value", control.options.linkDistance);
            // Change gravity
            d3.select("#inputGravity").on("input", function() {
	        control.copy.d3.options.gravity = +this.value;
            }).property("value", control.options.gravity);
            // Change charge
            d3.select("#inputCharge").on("input", function() {
	        control.copy.d3.options.charge = +this.value;
            }).property("value", control.options.charge);
            // Change node focus color
            d3.select("#inputNodeFocusColor").on("input", function() {
	        control.copy.d3.options.nodeFocusColor = this.value;
            }).property("value", control.options.nodeFocusColor);
        } else if (document.state == "navigate") {
            // Deselect all nodes
            if (d3.event.ctrlKey){
	        for (var i = 0; i < control.nodes.length; i++) {
	            control.nodes[i].isCurrentlyFocused = false;
	        }
	        control.force.stop();
	        drawDirectedGraph(makeFilteredData(control));
            }
        }
    }).on("mousemove", function() {
        if (control.sourceNode) {
            var transl = zoomListener.translate(), scale = zoomListener.scale(),
            mouse = d3.mouse(this),
            x = (mouse[0] - transl[0])/scale, y = (mouse[1] - transl[1])/scale;
            control.wildLink.attr('d', 'M' + control.sourceNode.x + ',' + control.sourceNode.y + "A200,200 0 0,1 " + x + ',' + y);
        }
    }).call(zoomListener);


    control.svg = svgGroup;

    control.wildLink = control.svg.append("svg:path")
    .attr("class", "wild hidden")
    .attr("d", "M0,0L0,0");



    // Close options form
    d3.select("#optionsForm").on("click", function() {
        this.style.visibility = "hidden";
        if (!(control.copy.d3.options.width == control.width &&
	      control.copy.d3.options.height == control.height &&
	      control.copy.d3.options.fontSize == control.options.fontSize &&
	      control.copy.d3.options.labelFontSize == control.options.labelFontSize &&
	      control.copy.d3.options.linkDistance == control.options.linkDistance &&
	      control.copy.d3.options.gravity == control.options.gravity &&
	      control.copy.d3.options.charge == control.options.charge &&
	      control.copy.d3.options.nodeFocusColor == control.options.nodeFocusColor
	     )) {
            control.force.stop();
            drawDirectedGraph(initOptions(control.file, control.copy, control.divName));
        } else {
            control.title = control.copy.d3.properties.title;
            control.tags = control.copy.d3.properties.tags;
        }
    });


    document.getElementById("new").checked = false;
    // New graph
    d3.select("#newLabel").on("click", function() {
        window.history.pushState({json:undefined}, "json Navigation",
                                 "?json=");
        initialize();
    });


    // Save graph
    d3.select("#saveLabel").on("click", function() {
        // document.getElementById("saveJSON").value = JSON.stringify(control.copy););
        if (document.debug) document.getElementById("graphJSON").innerHTML
            = highlightJSON(control.copy);
        document.getElementById("saveForm").style.visibility = "visible";
    });

    // file name input inside save form
    d3.select("#saveName").on("input", function() {
        this.value = this.value.replace(/  +/g," ")
            .replace(/[^a-z0-9_\-\+\.\[\]\{\}\(\)\:\;\$\%\&¿\?¡!, ºªñçáéíóúàèìòùäëïöü]/g,"");
    }).property("value", control.file.replace(/·.*$/,"").replace(/\.json$/, ""));

    // Save to local file
    d3.select("#savePC").on("click", function() {
        var output = document.getElementById("saveHref");
        output.href = "data:application/json;charset=utf-8,"
            + encodeURIComponent(JSON.stringify(control.copy));
        output.download=document.getElementById("saveName").value.trim() + ".json"; // /(?:\/([^\/]+))?$/.exec("/"+control.file)[1];
        output.style.visibility = "visible";
    });

    // Save to server file
    d3.select("#save2server").on("click", function() {
        var filename = document.getElementById("saveName").value.trim();
        if (filename != "") {
            $.post('savejson.php',{"name":filename,
                                   "json":JSON.stringify(control.copy)},
                   function(data) {
                       if (data.state) {
                           if (data.state == "saved") {
                               control.file = filename + ".json";
                               document.getElementById("saveForm")
                                   .style.visibility = "hidden";
                               window.history.replaceState({json:control.file},
                                                           "json Navigation",
                                                           "?json=" + control.file);
                           }
                           alert(data.text);
                       } else {
                           alert(data);
                       }
                   },"json");
        } else {
            alert("Incorrect file name.");
        }
    });

    // Close save form
    d3.select("#saveForm").on("click", function() {
        document.getElementById('saveHref').style.visibility='hidden';
        document.getElementById('saveForm').style.visibility='hidden';
        // document.getElementById('graphJSON').innerHTML = '';
        document.getElementById('save').checked = false;
    });


    // Edit groups
    var groupList = document.getElementById("groupList");
    d3.select("#groupsLabel").on("click", function() {
        groupList.innerHTML = "";
        for (var key in control.data.groups) {
            var group = document.createElement("input");
            group.setAttribute("type", "text");
            group.setAttribute("size", "10");
            group.setAttribute("title", "To remove leave in blank");
            group.setAttribute("value", key);
            groupList.appendChild(group);
            var color = document.createElement("input");
            color.setAttribute("type", "color");
            color.setAttribute("value", control.data.groups[key]);
            color.setAttribute("title", "Change color of the group");
            groupList.appendChild(color);
            groupList.innerHTML += "<br />";
        }
        document.getElementById("groupForm").style.visibility = "visible";
    });
    // Add new group
    d3.select("#addGroup").on("click", function() {
        d3.event.stopPropagation();
        var group = document.createElement("input");
        group.setAttribute("type", "text");
        group.setAttribute("size", "10");
        group.setAttribute("title", "To remove leave in blank");
        groupList.appendChild(group);
        var color = document.createElement("input");
        color.setAttribute("type", "color");
        color.setAttribute("value", "#FFFFFF");
        color.setAttribute("title", "Change color of the group");
        groupList.appendChild(color);
        groupList.appendChild(document.createElement("br"));
    });
    // Close group form
    d3.select("#groupForm").on("click", function() {
        this.style.visibility = "hidden";
        var keys = [];
        $(this).find("input[type='text']")
            .map(function() {return keys.push(this.value)});
        var colors = [];
        $(this).find("input[type='color']")
            .map(function() {return colors.push(this.value)});
        control.data.groups = {};
        control.copy.d3.data.groups = {};
        for (var i=0; i < keys.length; i++) {
            if (keys[i] != "") {
	        control.data.groups[keys[i]] = colors[i];
	        control.copy.d3.data.groups[keys[i]] = colors[i];
            }
        }
        document.getElementById("groups").checked = false;
        control.force.stop();
        drawDirectedGraph(control);
    });
    
/*  // get list of unique values in stylecolumn
  control.linkStyles = [];
  if (control.options.styleColumn) {
    var x;
    for (var i = 0; i < control.links.length; i++) {
      if (control.linkStyles.indexOf( x = control.links[i][control.options.styleColumn].toLowerCase()) == -1)
      control.linkStyles.push(x);
    }
  } else  control.linkStyles[0] = "defaultMarker";*/

    return control;
}

            
function getData(file) {
    var dataPromise = $.Deferred();
    // return a promise if data is being received asynch and resolve it when done.
    switch (typeof(file)) { // /(?:\.([^.]+))?$/.exec(file)[1] == "json") {
/*
    $.ajax({
      url: file,
      beforeSend: function(xhr){
        if (xhr.overrideMimeType)
        {
          xhr.overrideMimeType("application/json");
        }
      },
      dataType: 'json',
      success: function(response) {dataPromise.resolve (response);}
    });
*/
    case "string":
        var xmlhttp;
        if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        } else { // code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        if (location.hostname == "") {
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4) {
                    dataPromise.resolve(JSON.parse(xmlhttp.responseText));
                }
            };
        } else {
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    dataPromise.resolve(JSON.parse(xmlhttp.responseText));
                }
            };
        }
        xmlhttp.open("GET", "json/" + file, true);
        xmlhttp.overrideMimeType("application/json");
        xmlhttp.send();
        break;
    case "object":
        dataPromise.resolve(file);
        break;
    case "undefined":
        dataPromise.resolve(
            {"d3":{"properties":{"title":"","tags":""},"options":{"width":640,"height":480,"fontSize":14,"labelFontSize":14,"linkDistance":70,"gravity":0.05,"charge":-300,"nodeFocusColor":"#000000"},"data":{"groups":{},"nodes":[],"links":[]}}}
        );
        break;
    }

    return dataPromise.promise();
}

function GetDec(Hex)
{
    var Value;
    if(Hex == "A")
        Value = 10;
    else
        if(Hex == "B")
            Value = 11;
    else
        if(Hex == "C")
            Value = 12;
    else
        if(Hex == "D")
            Value = 13;
    else
        if(Hex == "E")
            Value = 14;
    else
        if(Hex == "F")
            Value = 15;
    else
        Value = eval(Hex)
    return Value;
}
function GetHex(Dec)
{
    var Value;
    if(Dec == 10)
        Value = "A";
    else
        if(Dec == 11)
            Value = "B";
    else
        if(Dec == 12)
            Value = "C";
    else
        if(Dec == 13)
            Value = "D";
    else
        if(Dec == 14)
            Value = "E";
    else
        if(Dec == 15)
            Value = "F";
    else
        Value = "" + Dec;
    return Value;
}
function colorMix(color1, color2) {
    color1 = color1.substring(1);
    color2 = color2.substring(1);

    if (color1.charAt(0) == '#' || color1.length !=6) {
        color1 = '000000';
    }
    if (color2.charAt(0) == '#' || color2.length !=6) {
        color2 = '000000';
    }

    color1 = color1.toUpperCase();
    color2 = color2.toUpperCase();
    var a = GetDec(color1.substring(0, 1));
    var b = GetDec(color1.substring(1, 2));
    var c = GetDec(color1.substring(2, 3));
    var d = GetDec(color1.substring(3, 4));
    var e = GetDec(color1.substring(4, 5));
    var f = GetDec(color1.substring(5, 6));

    var a2 = GetDec(color2.substring(0, 1));
    var b2 = GetDec(color2.substring(1, 2));
    var c2 = GetDec(color2.substring(2, 3));
    var d2 = GetDec(color2.substring(3, 4));
    var e2 = GetDec(color2.substring(4, 5));
    var f2 = GetDec(color2.substring(5, 6));

    var x = (a * 16) + b;
    var y = (c * 16) + d;
    var z = (e * 16) + f;

    var x2 = (a2 * 16) + b2;
    var y2 = (c2 * 16) + d2;
    var z2 = (e2 * 16) + f2;

    var Red = Math.round((x + x2)/2);
    var Green = Math.round((y + y2)/2);
    var Blue = Math.round((z + z2)/2);

    a = GetHex(Math.floor(Red / 16));
    b = GetHex(Red % 16);
    c = GetHex(Math.floor(Green / 16));
    d = GetHex(Green % 16);
    e = GetHex(Math.floor(Blue / 16));
    f = GetHex(Blue % 16);

    return '#' + a + b + c + d + e + f;
}
