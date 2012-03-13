window.onload = function() {
    var stage = new Kinetic.Stage("container", 578, 200);
    var gridLayer2 = new Kinetic.Layer("grid2");
    var hex=placehex(100,50,10);
    gridLayer2.add(hex);
    gridLayer=placeGrid(4,4,15);
    stage.add(gridLayer);
    stage.add(gridLayer2);

};
function placehex(xo,yo,side){ //local origin top left; size
    var s = side;                  //side length
    var h = Math.sin(Math.PI/6)*s; //height between s and top or bottom
    var r = Math.cos(Math.PI/6)*s; //radius to middle of side
    var b = s + 2*h;               //vertical bounding box height
    var a = 2 * r;                 //horizontal bounding box width
    var hex = new Kinetic.RegularPolygon({
        x : xo+r+2,
        y : yo+(s+2*h)/2+2,  //extra 2px to fit borders in
        sides: 6,
        radius: (s+2*h)/2,
        fill: "#FFFFFF",
        stroke: "black",
        strokeWidth: 2,
//        centerOffset: (r,-1*(s+2*h)/2)
    });
    hex.on("click", function(){
        console.debug(this);
        //alert("clicked");
        var fill = this.getFill() == "#333333" ? "#bbffbb" : "#333333";
        console.debug(this.getFill());
        this.setFill(fill);
        var layer=this.getLayer();
        layer.draw();
    });

    return hex;
};
function placeGrid(m,n,side){
    var s = side;                  //side length
    var h = Math.sin(Math.PI/6)*s; //height between s and top or bottom
    var r = Math.cos(Math.PI/6)*s; //radius to middle of side
    var b = s + 2*h;               //vertical bounding box height
    var a = 2 * r;                 //horizontal bounding box width
    
    var gridLayer = new Kinetic.Layer("grid");
    for(var i=0;i<n;i++){           // for each row i
        for(var j=0; j<m; j++){     // for each col j
            var xorig= j*(2*r) +(i&1)*r ; //local origin = top left of hex
            var yorig= i*(h+s)          ;
            var hex=placehex(xorig,yorig,side);
            gridLayer.add(hex);
        };
    };
    return gridLayer;
};
