//Hex grid implementation by plato 03.28.12

//Vertex is the basic object, we start by initializing a grid of vertices
//The distance between two vertices is 1 unit. A hex is made of six equilateral
//triangles and 6 (7?) vertices so its diameter is 2 units.
//The Vertex yz axes are not orthogonal. +y is north, same as in xy,
//but +z is 60 degrees clockwise from y.   e.g. y:| z:/ 

(function() {
var ctx={};   //Create context to hold globally accessible objects

////*******************
///Vertex object logic
//*******************
function Vertex(y0,z0) {

    this.y=y0;
    this.z=z0;
    this.theta=0;
    //theta: rotation angle. 0: up/12'ck, Pi/3: 10'ck, Pi: 6'ck 2*Pi: 12'ck
    this.edges={"incoming":[],"outgoing":[]};
    this.PhaseY=((this.y%3)+3)%3;
    this.PhaseZ=((this.z%3)+3)%3;
    //We have to do modulo twice to handle y|z<0. e.g. (-4)%3 = -1 => (-1+3)%3=2
    this.isHexCenter=(this.PhaseY==this.PhaseZ);
};

// Access a vertex that's stored in ctx.verts by yz coords
function getVertex(y,z) {

    if(typeof(ctx.verts[y.toString()])=="undefined") 
    { return null; }
    else if(typeof(ctx.verts[y.toString()][z.toString()])=="undefined") 
    { return null; }
    else 
    { return ctx.verts[y.toString()][z.toString()]; };
};

//if PhaseX=PhaseY you can place a hex here, otherwise it's on the grid
Vertex.prototype.isOnGrid=function()  { return this.phaseY != this.phaseZ; };
Vertex.prototype.hexPhase=function()  { return this.phaseY == this.phaseX; };

///Accessors for vertex neighbors - note that this returns adjacent VERTICES
// so calling Hex.center._12 will return the north vertex of that same hex.
Vertex.prototype._12=function(){ return getVertex(this.y+1,this.z  ); };
Vertex.prototype._10=function(){ return getVertex(this.y+1,this.z-1); };
Vertex.prototype._8 =function(){ return getVertex(this.y,  this.z-1); };
Vertex.prototype._6 =function(){ return getVertex(this.y-1,this.z  ); };
Vertex.prototype._4 =function(){ return getVertex(this.y-1,this.z+1); };
Vertex.prototype._2 =function(){ return getVertex(this.y,  this.z+1); };

// Calculate distance between vertices, x axis first
Vertex.prototype.distanceTo=function(v2) {
    dy=v2.y - this.y;
    dz=v2.z - this.z;        d=0;

    while(dy != 0 || dz != 0) {     //step to y=z axis then to origin
        if((Math.abs(dy)+Math.abs(dz)) == Math.abs(dy + dz)) {
    //We're in +y+z or -y-z sextants. [12-2,6-8] d = |dy|+|dz|
            d = d+Math.abs(dy+dz);     dy=0;     dz=0;    }
        else if (dy > 0 && dz < 0){
    //We're in N or NW sextants. Travel southeast - i.e. (1,-1) to (0,0)
            d = d+1;                   dy=dy-1;  dz=dz+1; }
        else if (dy < 0 && dz > 0){
    //We're in S or SE sextant. Travel northwest, i.e. (-1,1) to (0,0)
            d = d+1;                   dy=dy+1;  dz=dz-1; }
        else { console.log("ERROR in Vertex.distanceTo"); 
        }; //end of if loop
    }; //end of while loop
    return d;
}; 

// Calculate an optimal path from one vertex to another
Vertex.prototype.pathTo=function(v2,pathArr) {
    console.log("pathTo called from "+this.y+","+this.z+" to "+v2.y+","+v2.z);
    if(pathArr == undefined){ pathArr = [];}; //invocation v1.pathTo(v2)
    pathArr.push(this);
    console.log("testing this==v2 at start of pathTo: "+(this==v2));
    console.log((this==v2));
 //If the vertex calling this method is v2, we have reached our target
    if(this==v2) {return pathArr};

    //Otherwise, call pathTo(v2) for each neighboring vertex, closest first.
    //Stop when something returns other than null, and return that ourselves.
    var neighbors=[];
    neighbors.push({"y":this.y+1,"z":this.z,   "dist":null}); //N
    neighbors.push({"y":this.y+1,"z":this.z-1, "dist":null}); //NW
    neighbors.push({"y":this.y,  "z":this.z-1, "dist":null}); //SW
    neighbors.push({"y":this.y-1,"z":this.z,   "dist":null}); //S
    neighbors.push({"y":this.y-1,"z":this.z+1, "dist":null}); //SE
    neighbors.push({"y":this.y,  "z":this.z+1, "dist":null}); //NE
    for(var i=0;i<neighbors.length;i++) {
        //Retrieve the Vertex object for this neighbor
        var v0=getVertex(neighbors[i]["y"],neighbors[i]["z"]);
        if(v0==null){console.log("Skipping inaccessible"); continue;};
        var d=v0.distanceTo(v2);
        if(d==0){console.log("A neighbor of this vertex is v2!");};
        neighbors[i]["dist"]=d;
    };
    neighbors.sort(function(a,b) {   //sort neighbors by increasing dist to v2
        return a['dist'] - b['dist'];
    });
    console.log(neighbors);
    for(var i=0;i<neighbors.length;i++) { //start with closest vert
//**************************
//This is the problem area

//v1 is a Vertex object created with v1 = new Vertex(0,0)
//It's stored in ctx.verts['0']['0']
//v2 is a Vertex object created with v2 = new Vertex(1,0)
//It's stored in ctx.verts['1']['0']

//v2 was passed into this function when it was called with:
// console.log(v1.pathTo(v2));
        console.log("Retrieving vtx "+neighbors[i]["y"]+","+neighbors[i]["z"]);
        console.log("Destination v2 is at: "+v2.y+","+v2.z);

//getVertex(m,n) should return a reference to an object in global ctx.verts
        var v1=getVertex(neighbors[i]["y"],neighbors[i]["z"]);
        
//v1 should be the same object as v2 now!
//But it's not...
        console.log("v1==v2? "+(v1==v2));

        if(v1==null){continue;};     //inaccessible vertex, skip
        //console.log(v1);
        for(j=0;j<100000;j++){};
        console.log("v1==v2? "+(v1==v2));

//Added this break statement so we would only execute the first iteration of
//this for loop... otherwise, it is an infinite loop, because the test 
//  if(this==v2) 
//in line 74 fails.
//        break;

        temp=v1.pathTo(v2,pathArr);  //recursion! pathArr contains the path
        console.log("temp is "+temp);
        if(temp != null){
            return temp; //
        };
    }; //End of for loop. If we got here, no neighbors have a valid path.
    return null;
};
    



////****************
///Hex object logic
//****************
function Hex(v0) {

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
 //Accessors for vertices of a hex, NOT neighboring hexes
Hex.prototype._11=function() { return this.center.NW().SW(); };
Hex.prototype._9 =function() { return  this.center.S().SW(); };
Hex.prototype._7 =function() { return  this.center.S().SE(); };
Hex.prototype._5 =function() { return this.center.NE().SE(); };
Hex.prototype._3 =function() { return  this.center.N().NE(); };
Hex.prototype._1 =function() { return  this.center.N().NW(); };

////
///An edge is a directional connection between vertices
//
//Edge.prototype.draw = function() {
//    {'x':24,'y':400} = hex2xy(this.source.y, this.source.z);
//    {'x':40,'y':350} = hex2xy(this.sink.y,   this.sink.z);
//    ctx.canvas.line

function Edge(v0,theta) {
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
    };
    v1=getVertex(v0.y+dy,v0.z+dz);
    v0.edges['outgoing'].push(this);
    v1.edges['incoming'].push(this);
    this.sink=v1;
    this.source=v0;
};

//walk=function(edge1, hand) {
//if (hand=left){
//    walkTo edge1.

//placeNode: getWhere, new Hex(v0)
//Node.linkTo(Node2)
//
//pathLink: getFromTo

///Turn vertex yz coords into xy coords
// x_proj, y_proj are projections using sohcahtoa
yz2xy=function(v0) {

    xorigin=ctx.xorigin;     yorigin=ctx.yorigin;
    y0=v0.y; z0=v0.z;
    r=ctx.r();

    z_sign = (z0<0)? -1:1;
    hypotenuse = (Math.abs(z0)*r);
    x_proj=hypotenuse*Math.cos(Math.PI/6); //hyp * cos = adjacent
    y_proj=hypotenuse*Math.sin(Math.PI/6); // Pi/6 rad = 30 degrees

    if(z_sign==1){
        x1=xorigin+x_proj;     y1=yorigin+y0+y_proj;
    } else if (z_sign==-1){
        x1=xorigin-x_proj;     y1=yorigin+y0-y_proj;
    } else {console.log("error in vert2xy")};
    return {"x":x1, "y":y1};
};

ctx.r=function(){ return ctx.radius;};

////******************
///Main program logic
//******************
//window.onload=function(){
ctx.verts={}; //this will hold Vertex objects
ctx.nodes={}; //this will hold Hex objects
ctx.links={}; //this will hold links connecting Hex objects
ctx.radius=10;
ctx.stage     = new Kinetic.Stage("kstage",600,600);
ctx.bgL       = new Kinetic.Layer("grid");
ctx.nodeL     = new Kinetic.Layer("nodes");
ctx.linkL     = new Kinetic.Layer("links");
ctx.noteL     = new Kinetic.Layer("notes");
ctx.stage.add(bgL); stage.add(nodeL); stage.add(linkL); stage.add(noteL); 

//Define our grid of vertices
for(var m=0;m<10;m++) {
    ctx.verts[m.toString()]={};
    for(var n=0;n<10;n++) {
        ctx.verts[m.toString()][n.toString()]=new Vertex(m,n);
    };        //we'll access these with getVertex(m,n)
};
for(var p=0;p<10;p=p+3){
    for(var q=0; q<10;q=q+3){
        ctx.nodes[p.toString()][q.toStrong()]=new Hex(getVertex(p,q));
        shape=getShape(p,q)['kinshape'];
        shape.setFill("#ffffff");
        shape.setStroke("#AAAAAA");
        ctx.bgL.add


 //Place two nodes
h1=new Hex(getVertex(1,1));
h2=new Hex(getVertex(5,5));

//Create a link between them
link=new Link(h1, h2)
e=edge(v2,5*Math.PI/3,1);
//}; end of window.onload

})();
