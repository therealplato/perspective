//Hex grid implementation by plato 03.28.12
//Vertex objects contain a y,z coordinate pair. 
//+y is north, same as usual xy. +z is 60 degrees CW from y. e.g.  y:| z:/ 
//The distance between two vertices is 1 unit. A hex is made of six equilateral
//triangles and 6 (7?) vertices so its diameter is 2 units.

(function() {

var ctx={};            //Add some important stuff to globally accessible ctx
ctx.xorigin=300; ctx.yorigin=300;    //offset of yz origin in xy from top left
ctx.radius=15;         //pixels between vertices, and radius to corner of hex
ctx.r=function(){ return ctx.radius;};
ctx.socket = io.connect('http://localhost');
    ctx.socket.on('online',function(data) {
        console.log(data); ctx.socket.emit('pong', {'got':data});
    });

//Turn vertex yz coords into xy coords. Scale y&z by r and project onto xy.
//Note that the z projection has x&y components, y simply has y. (same axis!)
yz2xy=function(y0,z0) {

    z_sign = ((z0<0) ?   -1 : 1);
    hypotenuse = (Math.abs(z0)*ctx.r());
    z_to_x=hypotenuse*Math.cos(Math.PI/6); // hyp * cos = adjacent
    z_to_y=hypotenuse*Math.sin(Math.PI/6); // Pi/6 rad = 30 degrees

    //note! "positive y" in yz coords points up. <canvas> treats +y as down.
    if(z_sign==1){
        x1=ctx.xorigin +z_to_x;     y1=ctx.yorigin -(y0*ctx.r()) -z_to_y;
    } else if (z_sign==-1){
        x1=ctx.xorigin -z_to_x;     y1=ctx.yorigin -(y0*ctx.r()) +z_to_y;
    } else {console.log("error in vert2xy")};
    return {"x":x1, "y":y1};
};

  //*******************
 //      Vertex
//*******************
function Vertex(y0,z0) {

    this.y=y0;    this.z=z0;    this.theta=null;
    //theta: rotation angle. 0: up/12'ck, Pi/3: 10'ck, Pi: 6'ck 2*Pi: 12'ck
//    this.links={"to":[],"from":[]};
    this.phaseY=((this.y%3)+3)%3;    this.phaseZ=((this.z%3)+3)%3;
    //We have to do modulo twice to handle y|z<0. e.g. (-4)%3 = -1 => (-1+3)%3=2
};


// Access Vertex objects stored in ctx.verts with yz coords
function getVertex(y,z) {

    ystr=y.toString();       zstr=z.toString();
    if( (typeof(ctx.verts[ystr])=="undefined") || 
        (typeof(ctx.verts[ystr][zstr])=="undefined") )
    { return null; }
    else 
    { return ctx.verts[ystr][zstr]; };
};


//  Accessors for vertex neighbors - note that this returns adjacent VERTICES
Vertex.prototype._12=function(){ return getVertex(this.y+1,this.z  ); };
Vertex.prototype._10=function(){ return getVertex(this.y+1,this.z-1); };
Vertex.prototype._8 =function(){ return getVertex(this.y,  this.z-1); };
Vertex.prototype._6 =function(){ return getVertex(this.y-1,this.z  ); };
Vertex.prototype._4 =function(){ return getVertex(this.y-1,this.z+1); };
Vertex.prototype._2 =function(){ return getVertex(this.y,  this.z+1); };
//  if PhaseX=PhaseY this vertex is in a hex, otherwise it's on the grid
Vertex.prototype.gridPhase=function() { return this.phaseY != this.phaseZ; };
Vertex.prototype.hexPhase=function()  { return this.phaseY == this.phaseZ; };


//  Calculate distance between vertices, x axis first
Vertex.prototype.distanceTo=function(v2) {

    d=0;
    dy=v2.y - this.y;         dz=v2.z - this.z;

    while(dy != 0 || dz != 0) {      //step towards y=z axis, then to origin
        if((Math.abs(dy)+Math.abs(dz)) == Math.abs(dy + dz)) {
        //We're in sextant 12:2 or 6:8 (as sign_y==sign_z) thus d = |dy|+|dz|
             d = d+Math.abs(dy+dz);  dy=0;    dz=0;    }
        //In any other sextant, start by travelling diagonally to these ones
        else if (dy > 0 && dz < 0){
                           d = d+1;  dy=dy-1; dz=dz+1; }
        else if (dy < 0 && dz > 0){
                           d = d+1;  dy=dy+1; dz=dz-1; }
        
        else { console.log("ERROR in Vertex.distanceTo"); 
        }; //end of if loop
    }; //end of while loop
    return d;
}; 


//  Recursively call v1.pathTo(v2).pathTo(v3)... stopping when you find a path
Vertex.prototype.pathTo=function(vn,pathArr) {

 //Sort this Vertex's neighbors by fitness (shortest distance to target vn) then
 //call them recursively, until we find the shortest valid path.

    //When & IF vn.pathTo(vn) is called, vn returns pathArr up the chain.
    if(pathArr == undefined){ pathArr = [];}; //invoke w/ 1 arg: v1.pathTo(v2)
    pathArr.push(this);
    if(this==vn) {return pathArr};

    //Otherwise we're not at vn yet. Set up an array to remember neighbors
    var neighbors=[]; var dy=[ 1, 1, 0,-1,-1, 0] //CCW from 12
                      var dz=[ 0,-1,-1, 0, 1, 1]    

    //test each neighbor's distance to vn
    for(var i=0;i<6;i++){
        neighbors.push({'y':this.y+dy[i], 'z':this.z+dz[i], 'd':null});
        var vi=getVertex(neighbors[i]['y'],neighbors[i]['z']);
        if(vi==null){console.log("Skipping inaccessible"); continue;};
        var di=vi.distanceTo(vn);
        neighbors[i]["d"]=di;
    };
    
    neighbors.sort( function(a,b) {   //sort neighbors by increasing dist to vn
                      if(b==null){return 1};
                      return a['d'] - b['d'];
     });

    //starting with closest vert, recursively call pathTo(vn) until vn replies
    for(var i=0;i<neighbors.length;i++) {  
        var v1=getVertex(neighbors[i]["y"],neighbors[i]["z"]);
        if(v1==null){continue;};           //inaccessible vertex, skip
        temp=v1.pathTo(v2,pathArr);        //v1 returns null if branch fails,
        if(temp != null){  return temp;  };  //else vn returns complete pathArr
    }; //End of for loop. If we got here, no neighbors have a valid path.
    return null;
}; //To fix: double search vertices and probable local optima problems
    

  //****************
 //      Hex
//****************
function Hex(v0) {
if(v0==null){return null;};
    this.center=v0;
    tmp=yz2xy(v0.y,v0.z);
    this['kinshape']= new Kinetic.RegularPolygon({
        myHex:this,
        x:tmp['x'],
        y:tmp['y'],
        sides: 6,
        radius: ctx.r(),
        fill: "#FFFFFF",
        stroke: "black",
        strokeWidth: 1,
    }); 
};

function getHex(p,q) {
    ystr=p.toString();    zstr=q.toString();
    if( (typeof(ctx.hexes[ystr])=="undefined") || 
        (typeof(ctx.hexes[ystr][zstr])=="undefined") )
    { return null; }
    else 
    { return ctx.hexes[ystr][zstr]; };
};

 //Accessors for neighboring Hexes
Hex.prototype._11=function() {
    return getHex(getVertex(this.center.y+2,this.center.z-1));};
Hex.prototype._9 =function() {
    return getHex(getVertex(this.center.y+1,this.center.z-2));};
Hex.prototype._7 =function() {
    return getHex(getVertex(this.center.y-1,this.center.z-1));};
Hex.prototype._5 =function() {
    return getHex(getVertex(this.center.y-2,this.center.z+1));};
Hex.prototype._3 =function() {
    return getHex(getVertex(this.center.y-1,this.center.z+2));};
Hex.prototype._1 =function() {
    return getHex(getVertex(this.center.y+1,this.center.z+1));};


////
//*An edge is a directional connection between vertices
//
//Edge.prototype.draw = function() {
//    {'x':24,'y':400} = hex2xy(this.source.y, this.source.z);
//    {'x':40,'y':350} = hex2xy(this.sink.y,   this.sink.z);
//    ctx.canvas.line

Edge.prototype.draw=function(){
};

function Edge(v1,v2) {
    this.source=v1;
    this.sink=v2;
};

function Chain(v1,vn){
    if(v1==vn) {return null;};
    var pathArr=v1.pathTo(vn);
    if(pathArr==null||pathArr.length==0){    return null;}
    else if (pathArr.length==1) {            return null;}
    else {
        this.edgeArr = [];
        for(i=1;i<=pathArr.length;i++){
            edges.push(new Edge(pathArr[i-1],pathArr[i]));
        };
    };
    //Rename "Edge" to "Link"
    v1.chains['sourcing'].push(this);
    vn.chains['sinking'].push(this);
    this.firstEdge = this.edgeArr[0];
    return this.edgeArr;
};


function pivotOut(v0,theta){
    this.theta=theta;
    if(((3*theta)/Math.PI)%1 != 0) { //theta isn't on an axis
        console.log("theta not pointing along an axis");
    };
    switch(((3*theta)/Math.PI)%6) { 
        case 0: dy= 1; dz= 0; break;   //twelve oclock
        case 1: dy= 1; dz=-1; break;   //ten o clock
        case 2: dy= 0; dz=-1; break;   //eight oclock
        case 3: dy=-1; dz= 0; break;   //six oclock
        case 4: dy=-1; dz= l; break;   //four oclock
        case 5: dy= 0; dz= l; break;   //two oclock
        default: console.log("bad theta value"); break;
    };
    return getVertex(v0.y+dy, v0.z+dz);
};


//walk=function(edge1, hand) {
//if (hand=left){
//    walkTo edge1.

//placeNode: getWhere, new Hex(v0)
//Node.linkTo(Node2)
//
//pathLink: getFromTo


////******************
///Main program logic
//******************
window.onload=function(){
ctx.verts={}; //this will hold Vertex objects
ctx.hexes={}; //this will hold Hex objects
ctx.links={}; //this will hold links connecting Hex objects
ctx.stage     = new Kinetic.Stage("kstage",600,600);
ctx.bgL       = new Kinetic.Layer("grid");
ctx.hexL      = new Kinetic.Layer("hexes");
ctx.linkL     = new Kinetic.Layer("links");
ctx.noteL     = new Kinetic.Layer("notes");
ctx.stage.add(ctx.bgL);   ctx.stage.add(ctx.hexL); 
ctx.stage.add(ctx.linkL); ctx.stage.add(ctx.noteL); 

//Define our grid of vertices and place background grid
for(var m=-11;m<11;m++) {
    ctx.verts[m.toString()]={};
    for(var n=-11;n<11;n++) {
        ctx.verts[m.toString()][n.toString()]=new Vertex(m,n);
        if(getVertex(m,n).hexPhase()==true) {
            if(ctx.hexes[m.toString()]==undefined) {ctx.hexes[m.toString()]={}};
            ctx.hexes[m.toString()][n.toString()]=new Hex(getVertex(m,n));
            shape=getHex(m,n)['kinshape'];
            shape.setFill("#efefef");
            shape.setStroke("#bbbbbb");
            shape.on("click", function(){
                ctx.socket.emit('clicked',{y:this.myHex.center.y,
                                           z:this.myHex.center.z});
                console.log('Hex at ('+this.myHex.center.y+','+
                                       this.myHex.center.z+') clicked');
            });
            ctx.bgL.add(shape); 
        };            
    };        
};
var offset=0;
for(var p=-10+offset;p<10;p=p+1){
    ctx.hexes[p.toString()]={};
    for(var q=-10+offset; q<10; q=q+3){
    };
    offset=(offset+1)%3;
};

console.log(getHex(0,0));

ctx.bgL.draw();
ctx.hexL.draw()
ctx.linkL.draw();
}; //end of window.onload()
})();
