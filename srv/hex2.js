//Hex grid implementation by plato 03.28.12

//Vertex is the basic object, we start by initializing a grid of vertices
//The distance between two vertices is 1 unit. A hex is made of six equilateral
//triangles and 6 (7?) vertices so its diameter is 2 units.
//The Vertex yz axes are not orthogonal. +y is north, same as in xy,
//but +z is 60 degrees clockwise from y.   e.g. y:| z:/ 

(function() {
var ctx={};   //Create context to hold globally accessible objects
ctx.radius=15;
ctx.xorigin=300; ctx.yorigin=300; //px from top left
ctx.r=function(){ return ctx.radius;};

///Turn vertex yz coords into xy coords
// x_proj, y_proj are projections using sohcahtoa
yz2xy=function(y0,z0) {

    xorigin=ctx.xorigin;     yorigin=ctx.yorigin;
    r=ctx.r();
    z_sign = (z0<0)? -1:1;
    hypotenuse = (Math.abs(z0)*r);
    x_proj=hypotenuse*Math.cos(Math.PI/6); //hyp * cos = adjacent
    y_proj=hypotenuse*Math.sin(Math.PI/6); // Pi/6 rad = 30 degrees

    if(z_sign==1){
//"positive y" in yz maps to negative y in xy, i.e. up. canvas origin is @ top left
        x1=xorigin+x_proj;     y1=yorigin-(y0*r)-y_proj;
    } else if (z_sign==-1){
        x1=xorigin-x_proj;     y1=yorigin-(y0*r)+y_proj;
    } else {console.log("error in vert2xy")};
    return {"x":x1, "y":y1};
};

////*******************
///Vertex object logic
//*******************
function Vertex(y0,z0) {

    this.y=y0;    this.z=z0;    this.theta=0;
    //theta: rotation angle. 0: up/12'ck, Pi/3: 10'ck, Pi: 6'ck 2*Pi: 12'ck
    this.links={"to":[],"from":[]};
    this.PhaseY=((this.y%3)+3)%3;    this.PhaseZ=((this.z%3)+3)%3;
    //We have to do modulo twice to handle y|z<0. e.g. (-4)%3 = -1 => (-1+3)%3=2
};

//  Access a vertex that's stored in ctx.verts by yz coords
function getVertex(y,z) {
    ystr=y.toString(); zstr=z.toString();
    if( (typeof(ctx.verts[ystr])=="undefined") || 
        (typeof(ctx.verts[ystr][zstr])=="undefined") )
    { return null; }
    else 
    { return ctx.verts[ystr][zstr]; };
};

//* Vertex Methods

//  Accessors for vertex neighbors - note that this returns adjacent VERTICES
Vertex.prototype._12=function(){ return getVertex(this.y+1,this.z  ); };
Vertex.prototype._10=function(){ return getVertex(this.y+1,this.z-1); };
Vertex.prototype._8 =function(){ return getVertex(this.y,  this.z-1); };
Vertex.prototype._6 =function(){ return getVertex(this.y-1,this.z  ); };
Vertex.prototype._4 =function(){ return getVertex(this.y-1,this.z+1); };
Vertex.prototype._2 =function(){ return getVertex(this.y,  this.z+1); };

//  if PhaseX=PhaseY this vertex is in a hex, otherwise it's on the grid
Vertex.prototype.isGridPhase=function()  { return this.phaseY != this.phaseZ; };
Vertex.prototype.isHexPhase=function()  { return this.phaseY == this.phaseX; };

//  Calculate distance between vertices, x axis first
Vertex.prototype.distanceTo=function(v2) {

    dy=v2.y - this.y;        d=0;
    dz=v2.z - this.z;
    while(dy != 0 || dz != 0) {     //step to y=z axis then to origin
        if((Math.abs(dy)+Math.abs(dz)) == Math.abs(dy + dz)) {
        //We're in sextant 12-2 or 6-8 since sign_y == sign_z. d = |dy|+|dz|
        //In any other sextant, start by travelling diagonally to these ones
             d = d+Math.abs(dy+dz);  dy=0;    dz=0;    }
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
    //we pass the endpoint into each recursive call as vn. this sorts its 
    //neighbors by lowest distance to vn, and calls each neighbor.pathTo(vn)
    //When & IF vn.pathTo(vn) is called by a neighbor, it returns a path array
    //
    //Upon receiving a returned array, up-trunk function instances immediately
    //return the same, up to the first v1.pathTo(v2) => [v1,v3,v2]
    if(pathArr == undefined){ pathArr = [];}; //invoke w/ 1 arg: v1.pathTo(v2)
    pathArr.push(this);
    if(this==vn) {return pathArr};

    // Loop over our six neighbors, starting with the one closest to vn
    var neighbors=[]; var ay=[ 1, 1, 0,-1,-1, 0] //CCW from 12
                      var az=[ 0,-1,-1, 0, 1, 1]    
    for(var i=0;i<6;i++){
        neighbors.push({'y':this.y+ay[i], 'z':this.z+az[i], 'd':null});
    };

    for(var i=0;i<neighbors.length;i++) {
        var vi=getVertex(neighbors[i]['y'],neighbors[i]['z']);
        if(vi==null){console.log("Skipping inaccessible"); continue;};
        var di=vi.distanceTo(v2);
        neighbors[i]["d"]=di;
    };
    
    neighbors.sort(function(a,b) {   //sort neighbors by increasing dist to v2
        if(b==null){return 1};
        return a['d'] - b['d'];
    });

    console.log(neighbors);
    
    for(var i=0;i<neighbors.length;i++) {  //start with closest vert
        var v1=getVertex(neighbors[i]["y"],neighbors[i]["z"]);
        if(v1==null){continue;};           //inaccessible vertex, skip
        temp=v1.pathTo(v2,pathArr);        //v1 returns null if branch fails,
        if(temp != null){  return temp;  };  //else vn returns complete pathArr
    }; //End of for loop. If we got here, no neighbors have a valid path.
    return null;
};
    



////****************
///Hex object logic
//****************
function Hex(v0) {
if(v0==null){return null;};
    this.center=v0;
    tmp=yz2xy(v0.y,v0.z);
    this['kinshape']= new Kinetic.RegularPolygon({
        x:tmp['x'],
        y:tmp['y'],
        sides: 6,
        radius: ctx.r(),
        fill: "#FFFFFF",
        stroke: "black",
        strokeWidth: 1,                          }); 
};

function getHex(p,q) {
    ystr=p.toString(); zstr=q.toString();
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
    else if (pathArr.length==1) {           return null;}
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

//Define our grid of vertices
for(var m=-10;m<10;m++) {
    ctx.verts[m.toString()]={};
    for(var n=-10;n<10;n++) {
        ctx.verts[m.toString()][n.toString()]=new Vertex(m,n);
    };        //we'll access these with getVertex(m,n)
};
var offset=0;
for(var p=0+offset;p<10;p=p+1){
    ctx.hexes[p.toString()]={};
    for(var q=0+offset; q<10; q=q+3){
        console.log(p+'.'+q);
        ctx.hexes[p.toString()][q.toString()]=new Hex(getVertex(p,q));
        shape=getHex(p,q)['kinshape'];
        shape.setFill("#ffffff");
        shape.setStroke("#AAAAAA");
        ctx.bgL.add(shape); 
    };
    offset=(offset+1)%3;
};


console.log("yz2xy(0,0): "+yz2xy(0,0)['x']+','+yz2xy(0,0)['y'])
console.log("yz2xy(1,0): "+yz2xy(1,0)['x']+','+yz2xy(1,0)['y'])

 //Place two hexes 
//h1=new Hex(getVertex(1,1));
//h2=new Hex(getVertex(5,5));
foo=new Kinetic.RegularPolygon({
        x:30,
        y:30,
        sides: 6,
        radius: ctx.r(),
        fill: "#FFFFFF",
        stroke: "black",
        strokeWidth: 1,                          
}); 

ctx.linkL.add(foo); 
ctx.linkL.draw();
//Create a link between them
//link=new Link(h1, h2)
//e=Edge(v2,5*Math.PI/3,1);
//}; end of window.onload

//Draw the grid, hexes and links
ctx.bgL.draw();
ctx.hexL.draw()
}; //end of window.onload()
})();
