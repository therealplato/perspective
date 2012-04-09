//Sexy Grid by plato 04.06.12
//Vertex objects contain a p,q coordinate pair. 
//+p is north like the y in xy. +q is 60 degrees CW from p. e.g.  p:| q:/ 
//The distance between two vertices is 1 unit. A hex is pade of six equilateral
//triangles - 6 vertices plus center, so its diapeter is 2 units.
var Sexy={};          //create Sexy Scopetext
Sexy.xorigin=300;     //TODO disconnect this from canvas px 
Sexy.yorigin=300
Sexy.radius=15;       //pixels between vertices, also radius to corner of hex
Sexy.r=function(){ return Sexy.radius;};

Sexy.verts={}; //this will hold Vertex objects
Sexy.hexes={}; //this will hold Hex objects
Sexy.links={}; //this will hold links connecting Hex objects

Sexy.socket = io.connect('http://localhost');
    Sexy.socket.on('online',function(data) {
        console.log(data); Sexy.socket.emit('pong', {'got':data});
    });  //gigity

    
//Turn vertex pq coords into xy coords. Scale p&q by r and project onto xy.
//Note that the q projection has x&y components, p simply has y. (same axis!)
Sexy.pq2xy=function(p0,q0) {

    q_sign = ((q0<0) ?   -1 : 1);
    hypotenuse = (Math.abs(q0)*Sexy.r());
    q_to_x=hypotenuse*Math.cos(Math.PI/6); // hyp * cos = adjacent
    q_to_y=hypotenuse*Math.sin(Math.PI/6); // Pi/6 rad = 30 degrees

//note even though +p is "up" <canvas> treats +y as down, thus the odd signs
    if(q_sign==1){
        x1=Sexy.xorigin + q_to_x;    
        y1=Sexy.yorigin - (p0*Sexy.r()) - q_to_y;
    } else if (q_sign==-1){
        x1=Sexy.xorigin - q_to_x;    
        y1=Sexy.yorigin - (p0*Sexy.r()) + q_to_y;
    } else {console.log("error in vert2xy")};
    return {"x":x1, "y":y1};
};

  //*******************
 //      Vertex
//*******************
Vertex = function(p0,q0) {

    this.p=p0;    this.q=q0;    this.theta=null;
    //theta: rotation angle. 0: up/12'ck, Pi/3: 10'ck, Pi: 6'ck 2*Pi: 12'ck
    this.phaseP=((this.p%3)+3)%3;    this.phaseQ=((this.q%3)+3)%3;
    //We have to do modulo twice to handle p|q<0. e.g. (-4)%3 = -1 => (-1+3)%3=2
};


// Access Vertex objects stored in Sexy.verts with pq coords
getVert=function(p,q) {

    pstr=p.toString();       qstr=q.toString();
    if( (typeof(Sexy.verts[pstr])=="undefined") || 
        (typeof(Sexy.verts[pstr][qstr])=="undefined") )
    { return null; }
    else 
    { return Sexy.verts[pstr][qstr]; };
};

//Sexy.getVert = function(p,q)   { return getVert(p,q);};


//  Accessors for vertex neighbors - note that this returns adjacent VERTICES
Vertex.prototype._12=function(){ return getVert(this.p+1,this.q  ); };
Vertex.prototype._10=function(){ return getVert(this.p+1,this.q-1); };
Vertex.prototype._8 =function(){ return getVert(this.p,  this.q-1); };
Vertex.prototype._6 =function(){ return getVert(this.p-1,this.q  ); };
Vertex.prototype._4 =function(){ return getVert(this.p-1,this.q+1); };
Vertex.prototype._2 =function(){ return getVert(this.p,  this.q+1); };

//  if PhaseQ=PhaseP this vertex is in a hex, otherwise it's on the grid
//Vertex.prototype.gridPhase=function() { return this.phaseP != this.phaseQ; };
Vertex.prototype.hexPhase=function()  { return this.phaseP == this.phaseQ; };


//  Calculate distance between vertices
Vertex.prototype.d2pq=function(p2,q2) {
    p1=this.p;
    q1=this.q;
    dp=p2-p1;
    dq=q2-q1;
    d=0;

    while(dp != 0 || dq != 0) {      //step towards p=q axis, then to origin
        if((Math.abs(dp)+Math.abs(dq)) == Math.abs(dp + dq)) {
        //We're in sextant 12:2 or 6:8 (as sign_p==sign_q) thus d = |dp|+|dq|
             d = d+Math.abs(dp+dq);  dp=0;    dq=0;    }
        //In any other sextant, start by travelling diagonally to these ones
        else if (dp > 0 && dq < 0){
                           d = d+1;  dp=dp-1; dq=dq+1; }
        else if (dp < 0 && dq > 0){
                           d = d+1;  dp=dp+1; dq=dq-1; }
        
        else { console.log("ERROR in Vertex.d2vert"); 
        }; //end of if loop
    }; //end of while loop
    return d;
};

Vertex.prototype.d2vert=function(v2) {
    p2=v2.p;
    q2=v2.q;
    this.d2pq(p2,q2);
}; 


//  Recursively check which neighboring vert is closest to destination vn 
//  Upon vn calling pathTo itself, it halts, returning pathArr up the chain
Vertex.prototype.pathTo=function(vn,pathArr) {

    if(pathArr == undefined){ pathArr = [];}; //for invocation v1.pathTo(v2)
    pathArr.push(this);
    if(this==vn) {return pathArr};

    //Otherwise we're not at vn yet. Set up an array to remember neighbors
    var neighbors=[]; var dp=[ 1, 1, 0,-1,-1, 0]; //CCW from 12
                      var dq=[ 0,-1,-1, 0, 1, 1];    

    //test each neighbor's distance to vn, then sort neighbors, 
    //closest to target vn first:
    for(var i=0;i<6;i++){
        neighbors.push({'p':this.p+dp[i], 'q':this.q+dq[i], 'd':null});
        var vi=getVert(neighbors[i]['p'],neighbors[i]['q']);
        if(vi==null){console.log("Skipping inaccessible"); continue;};
        var di=vi.d2vert(vn);
        neighbors[i]["d"]=di;
    };    
    neighbors.sort( function(a,b) {   
                      if(b==null) {return 1};
                      return a['d'] - b['d'];}
                  );

    //starting with closest vert, recursively call pathTo(vn) until vn returns
    for(var i=0;i<neighbors.length;i++) {  
        var vi=getVert(neighbors[i]["p"],neighbors[i]["q"]);
        if(vi==null){continue;};           //inaccessible vertex, skip
        
        temp=vi.pathTo(vn,pathArr);        //check neighbors of vi   
        if(temp != null){  return temp;  };  //if we got something we're done

    }; //End of for loop. If we got here, no neighbors have a valid path.
    return null;
}; //To fix: double search vertices and probable local optima problems


  //****************
 //      Hex
//****************
function Hex(v0) {
    if(v0==null){return null;};
    this.center=v0;
};

function getHex(p,q) {
    pstr=p.toString();    qstr=q.toString();
    if( (typeof(Sexy.hexes[pstr])=="undefined") || 
        (typeof(Sexy.hexes[pstr][qstr])=="undefined") )
    { return null; }
    else 
    { return Sexy.hexes[pstr][qstr]; };
};

 //Accessors for neighboring Hexes
Hex.prototype._11=function() {
    return getHex(getVert(this.center.p+2,this.center.q-1));};
Hex.prototype._9 =function() {
    return getHex(getVert(this.center.p+1,this.center.q-2));};
Hex.prototype._7 =function() {
    return getHex(getVert(this.center.p-1,this.center.q-1));};
Hex.prototype._5 =function() {
    return getHex(getVert(this.center.p-2,this.center.q+1));};
Hex.prototype._3 =function() {
    return getHex(getVert(this.center.p-1,this.center.q+2));};
Hex.prototype._1 =function() {
    return getHex(getVert(this.center.p+1,this.center.q+1));};


  //****************
 // Chains + Links
//****************

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
        case 0: dp= 1; dq= 0; break;   //twelve oclock
        case 1: dp= 1; dq=-1; break;   //ten o clock
        case 2: dp= 0; dq=-1; break;   //eight oclock
        case 3: dp=-1; dq= 0; break;   //six oclock
        case 4: dp=-1; dq= l; break;   //four oclock
        case 5: dp= 0; dq= l; break;   //two oclock
        default: console.log("bad theta value"); break;
    };
    return getVert(v0.p+dp, v0.q+dq);
};


Sexy.Grid = function(r) {
    for(var p=-2*r; p<2*r; p++) {
    Sexy.verts[p.toString()]={};
    Sexy.hexes[p.toString()]={};
        for(var q=-2*r; q<2*r; q++) {
            Sexy.verts[p.toString()][q.toString()]=new Vertex(p,q);
            var vtmp=getVert(p,q);
            if(vtmp.hexPhase()==true && (vtmp.d2pq(0,0)<=(2*r))) {
                Sexy.hexes[p.toString()][q.toString()]=new Hex(getVert(p,q));
            };
            if(getVert(p,q).hexPhase()!=true){
                Sexy.hexes[p.toString()][q.toString()]=null;
            };
        };            
    };        
    return Sexy.hexes;
};
