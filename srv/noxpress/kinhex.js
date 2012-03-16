(function () {
var stage;
var socket;
var gridL, nodeL, selectL;
var ctx={};

window.onload = function() {
    //set up Kinetic to handle drawing stuff in div#container
    stage   = new Kinetic.Stage("container", 600,400);
    gridL   = new Kinetic.Layer();
    nodeL   = new Kinetic.Layer();
    selectL = new Kinetic.Layer();

    //ctx stores our current context including the last two selections
    ctx.primary = null;
    ctx.secondary = null;
    ctx.m=4; //rows
    ctx.n=5; //columns
    ctx.nodeArr=[];
    for(k=0;k<ctx.m;k++){
        ctx.nodeArr.push([]); //push m [] into nodeArr. invocation nodeArr[i][j]
    };
    console.log(ctx.nodeArr);
    placeGrid(gridL,ctx.m,ctx.n,15); //20x15 hex grid. each side is length 15px
    stage.add(gridL);
    stage.add(nodeL);
    stage.add(selectL);

    //open tunnel to node.js. we imported /socket.io/socket.io.js already
    socket = io.connect('http://localhost');
    socket.on('online', function (data) {
        console.log(data);
        socket.emit('pong', {'got': data });
    });

};
function placeGrid(layer,m,n,side){
    var xorig = side;
    var yorig = side+2;
    
    for(var i0=0;i0<m;i0++){           // for each row i
        for(var j0=0; j0<n; j0++){     // for each col j
            var hex=placehex(i0,j0,xorig,yorig,side);
// nodeArr[i0][j0] = hex; 
//            console.log(nodeArr);
//            console.log(nodeArr[0]);
//            console.log(nodeArr
//            nodeArr
            ctx.nodeArr[i0][j0]=hex;
            layer.add(hex);
        };
    };
};
function placehex(i,j,x0,y0,side){ 
//i=row j=col (x0,y0) is global origin top left
//calc own position given l_side, as per
//http://www.gamedev.net/page/resources/_/technical/game-programming/coordinates-in-hexagon-based-tile-maps-r1800
    var h = Math.sin(Math.PI/6)*side; //height of top/bottom triangular slices
    var r = Math.cos(Math.PI/6)*side; //radius to middle of side
    var x1= x0+ j*(2*r) +(i&1)*r;     //local origin = top left of hex
    var y1= y0+ i*(h+side);

    var hex = new Kinetic.RegularPolygon({
        state:"blank",
        i:i,//my row
        j:j,//my col
        x : x1, 
        y : y1,
        sides: 6,
        radius: (side+2*h)/2,
        fill: "#FFFFFF",
        stroke: "black",
        strokeWidth: 2,
//        centerOffset: (r,-1*(s+2*h)/2)
    });
    hex.on("click", function(){
//        console.debug(this);
        var layer=this.getLayer();
            if(ctx.primary == this && this.state=="blank") {
                //same blank hex clicked twice. place a hex
                this.state="node";
                hex.moveTo(selectL);
                this.setStroke("#33dd33"); //green
                var fill = this.getFill() == "#333333" ? "#bbffbb" : "#333333";
                this.setFill(fill);
                layer.draw();
                selectL.draw();
            }
            else if (ctx.primary==this && this.state == "node"){
                if (ctx.secondary.state="node"){
                    console.log("Place a path from ("+ctx.primary.i+","+ctx.primary.j+") to ("+ctx.secondary.i+","+ctx.secondary.j+")");
                };
            }
            else { //cycle selection
                if (ctx.secondary == null) {
                    ctx.primary = this;
                    ctx.secondary = this;
                };
                //old to grid, new to front of context stack:
                ctx.secondary.moveTo(gridL);
                ctx.secondary.setStroke("#333333");
                ctx.secondary=ctx.primary;
                ctx.secondary.setStroke("#AA1800");
                hex.moveTo(selectL);
                ctx.primary = this; 
                ctx.primary.setStroke("#FF0000");
                //ctx.primary.getLayer.draw();
                selectL.draw();
                //ctx.secondary.getLayer.draw();
                gridL.draw()
                layer.draw();
            } 

        layer.draw();
        socket.emit('hex clicked',{'i':i,'j':j});
    });
    hex.on("mouseover", function(){
//        var layer=this.getLayer(); //should be gridL
//        var stroke = "#aadddd";    
//        this.setStroke(stroke);
//        hex.moveTo(selectedL);
//        this.moveToTop();
//        layer.draw();
//        selectL.draw();
    });
    hex.on("mouseout", function(){
//        var layer=this.getLayer();
//        var stroke="#000000";
//        this.setStroke("#000000");
//        hex.moveTo(gridL);
//        layer.draw();
//        gridL.draw();
    });

    return hex;
};
})();
