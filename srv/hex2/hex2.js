//Hex grid implementation by plato 03.28.12
//+y is the vertical axis. +z is 60 degrees CW from y. e.g. y:| z:/
//The radius of a hexagon, and length of a side, is 1.

 //****************
 //Vertex object logic
 //****************
function Vertex(y0,z0) {
    this.y=y0;
    this.z=z0;
    this.phase=null;
};
 //Access a vertex that's in the context
function getVertex(m,n) {
    if(typeof(ctx.verts[m.toString()])=="undefined") 
    { return null; }
    else if(typeof(ctx.verts[m.toString()][n.toString()])=="undefined") 
    { return null; }
    else 
    { return ctx.verts[m.toString()][n.toString()]; };
};
 //Accessors for vertex neighbors - note that this returns adjacent VERTICES,
 // so calling Hex.center.N will return the north vertex of that same hex.
Vertex.prototype.N =function(){ return getVertex(this.y+1,this.z  ); };
Vertex.prototype.NW=function(){ return getVertex(this.y+1,this.z-1); };
Vertex.prototype.SW=function(){ return getVertex(this.y,  this.z-1); };
Vertex.prototype.S =function(){ return getVertex(this.y-1,this.z  ); };
Vertex.prototype.SE=function(){ return getVertex(this.y-1,this.z+1); };
Vertex.prototype.NE=function(){ return getVertex(this.y,  this.z+1); };
 //Test if a given vertex is on the grid or in the center of a hex
 //Hex centers are offgrid: (0,0) (1,1) (2,2) (1,4) (2,5) where  y%3 equals z%3
 //We have to do modulo twice to handle negative numbers. -4%3 = -1; (-1+3)%3=2
Vertex.prototype.isOnGrid=function(){
    return ((this.y%3)+3)%3 != ((this.z%3)+3)%3;
};

 //Calculate distance between vertices
Vertex.prototype.distanceTo=function(v2) {
    dy=v2.y - this.y;
    dz=v2.z - this.z;
    d=0;
    while(dy != 0 || dz != 0) {
        if((Math.abs(dy)+Math.abs(dz)) == Math.abs(dy + dz)) {
 //We're in the NE or SW sextant. dy and dz have the same signs or are zero.
 //We don't have to travel diagonally so just add to get the distance.
            d = d+Math.abs(dy+dz);
            dy=0; 
            dz=0; }
        else if (dy > 0 && dz < 0){
 //We're in N or NW sextants. Travel southeast - i.e. (1,-1) to (0,0)
            d = d+1;
            dy= dy-1;
            dz= dz+1; }
        else if (dy < 0 && dz > 0){
 //We're in S or SE sextant. Travel northwest, i.e. (-1,1) to (0,0)
            d = d+1;
            dy= dy+1;
            dz= dz-1; }
        else { 
            console.log("ERROR in Vertex.distanceTo"); 
        }; //end of if loop
    }; //end of while loop
    return d;
}; //end of Vertex.distanceTo()

//Calculate an optimal path from one vertex to another
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
    



 //****************
 //Hex object logic
 //****************
function Hex(v0) {
    this.center=v0;
};
 //Accessors for vertices of a hex, NOT neighboring hexes
Hex.prototype.N =function(){ return this.center.N() ; };
Hex.prototype.NW=function(){ return this.center.NW(); };
Hex.prototype.SW=function(){ return this.center.SW(); };
Hex.prototype.S =function(){ return this.center.S() ; };
Hex.prototype.SE=function(){ return this.center.SE(); };
Hex.prototype.NE=function(){ return this.center.NE(); };

 //****************
 //Main program logic
 //****************

var ctx={};   //Create context to hold globally accessible objects
ctx.verts={}; //Populate a grid of triangularly spaced vertices
for(var m=0;m<3;m++) {
    ctx.verts[m.toString()]={};
    for(var n=0;n<5;n++) {
        ctx.verts[m.toString()][n.toString()]=new Vertex(m,n);
    };        //we'll access these with getVertex(m,n)
};

 //Place a hex
v1=getVertex(0,0);
v2=getVertex(1,0);
v3=getVertex(2,4);

//console.log(v1.pathTo(v1));
//console.log(v2.pathTo(v2));
//console.log(v1.pathTo(v2));
console.log(v2.pathTo(v3));
//console.log(v3.distanceTo(v1));
//h1=new Hex(getVertex(1,1));
//console.log(h1);
//console.log(h1.N());

